# 23 — Web Pixels (Browser Side)

Three pixels: Meta, TikTok, Snapchat. All **deferred** so they never block first paint, all
firing events with an `event_id` that is shared with the server-side CAPI call for deduplication.

**Two facts confirmed from the platform docs that shape this whole document:**

1. **No hashing is needed in the browser.** All three pixel SDKs accept plaintext identifiers and
   hash them client-side themselves. Hashing in the browser is redundant and, if done with the
   wrong normalisation, actively *breaks* matching. Server-side is different — see `24`.
2. **Deduplication is `event_id` + event name, per platform, within 48 hours.** The browser value
   and the server value must be byte-identical strings.

---

## 1. Canonical event map

One user action → one row here → one `event_id` → up to six network calls (3 browser + 3 server).

| Our action | Meta Pixel | TikTok Pixel | Snap Pixel | Fired from |
|---|---|---|---|---|
| Page view | `PageView` | `Pageview` | `PAGE_VIEW` | every route |
| Product page view | `ViewContent` | `ViewContent` | `VIEW_CONTENT` | `/products/[slug]` |
| Collection view | `ViewContent` (`content_type: product_group`) | `ViewContent` | `LIST_VIEW` | `/collection` |
| Offer tier changed | — (custom `SelectOffer`) | custom `SelectOffer` | `CUSTOM_EVENT_1` | `OfferSelector` |
| Add to cart | `AddToCart` | `AddToCart` | `ADD_CART` | all add surfaces |
| Cart drawer opened | custom `ViewCart` | custom `ViewCart` | `CUSTOM_EVENT_2` | `CartDrawer` |
| Checkout opened | `InitiateCheckout` | `InitiateCheckout` | `START_CHECKOUT` | `CheckoutModal` |
| Phone became valid | `AddPaymentInfo` | `AddPaymentInfo` | `ADD_BILLING` | `PhoneField` |
| **Order submitted** | **`Purchase`** | **`CompletePayment`** | **`PURCHASE`** | order-create response |
| **Upsell accepted** | **`Purchase`** (delta) | **`CompletePayment`** (delta) | **`PURCHASE`** (delta) | upsell accept response |
| Contact form sent | `Lead` | `SubmitForm` | `SIGN_UP` | `/contact` |

### Notes that matter

- **TikTok's purchase event is `CompletePayment`, not `Purchase`.** Using different names on
  browser and server means TikTok cannot match them and deduplication silently fails.
- **Snap event names are UPPER_SNAKE_CASE.** `PURCHASE`, not `Purchase`.
- **`AddPaymentInfo` / `ADD_BILLING` on phone-validity is deliberate.** In a COD funnel there is
  no payment step, so this is the strongest mid-funnel signal available for campaign
  optimisation. It is a legitimate use — she has just supplied the contact information that
  makes the order possible.
- Snap deduplicates `ADD_CART` and `PAGE_VIEW` within a **1-second** window (not 48 hours), so
  rapid repeat adds may collapse. Do not treat missing counts there as a bug.

---

## 2. `event_id` generation — the single most important rule

```ts
// src/lib/event-id.ts
export const newEventId = () => crypto.randomUUID();
```

Rules:

1. **One `event_id` per user action.** Not per platform, not per page — per *action*. The same
   string goes to Meta, TikTok, Snap, and to our backend.
2. For `Purchase`, the browser mints it, sends it to `POST /api/orders` as `event_id`, and the
   server uses that exact value for all three CAPI calls (`22` §7).
3. For the **upsell delta**, the *server* pre-mints `upsell.event_id` and returns it with the
   order; the browser uses that value. Never reuse the original `Purchase` id.
4. Never regenerate on retry. If a `Purchase` call is retried, reuse the same id — that is the
   whole point of deduplication.
5. Store every id used on the order row (`orders.event_id`, `orders.upsell_event_id`) so a match
   can be traced later.

**Passing it to each SDK — the argument position differs per platform:**

```ts
// Meta — third argument, key is `eventID` (capital D)
fbq('track', 'Purchase', { value, currency: 'SAR' }, { eventID: eventId });

// TikTok — third argument, key is `event_id`
ttq.track('CompletePayment', { value, currency: 'SAR', contents }, { event_id: eventId });

// Snap — inside the properties object, key is `client_dedup_id`
snaptr('track', 'PURCHASE', {
  price: value, currency: 'SAR',
  transaction_id: orderNumber,     // maps to CAPI custom_data.order_id
  client_dedup_id: eventId,        // maps to CAPI top-level event_id
});
```

> Snap uses **two** different identifiers and they are easy to confuse:
> `client_dedup_id` (pixel) ↔ `event_id` (CAPI), 48-hour window, all events.
> `transaction_id` (pixel) ↔ `custom_data.order_id` (CAPI), 30-day window, purchases only.
> Send **both** on purchases. Sending `transaction_id` at the top level of a CAPI v3 payload does
> nothing.
> If you do not set `client_dedup_id` yourself, the Snap SDK mints its own UUID prefixed with
> `@-`, which is local to the browser and will never match your server event.

---

## 3. Deferred loading

Pixels must not block first paint. Meta's pixel alone is ~70KB and all three together with
synchronous loading will cost the LCP budget in `28`.

### Strategy

```ts
// src/lib/tracking/loader.ts
let loaded = false;
const queue: QueuedEvent[] = [];

const INTERACTIONS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

export function initTracking() {
  if (typeof window === 'undefined' || loaded) return;

  const start = () => {
    if (loaded) return;
    loaded = true;
    INTERACTIONS.forEach(e => window.removeEventListener(e, start));

    injectMeta();     // creates fbq stub + loads fbevents.js
    injectTikTok();   // creates ttq stub + loads the SDK
    injectSnap();     // creates snaptr stub + loads scevent.min.js

    queue.forEach(dispatch);
    queue.length = 0;
  };

  // whichever comes first: real interaction, browser idle, or a 3s safety net
  INTERACTIONS.forEach(e => window.addEventListener(e, start, { once: true, passive: true }));
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(start, { timeout: 3000 });
  } else {
    setTimeout(start, 2000);
  }
}
```

### The queue is essential

A `PageView` fires on mount, before the SDKs exist. Without a queue it is simply lost, and
`PageView` volume drives the platforms' audience building.

```ts
export function track(event: CanonicalEvent) {
  if (!loaded) { queue.push(event); return; }
  dispatch(event);
}
```

All three SDKs also provide their own stub-and-queue mechanism (`fbq` and `ttq` buffer calls made
before the script loads), but our own queue is what lets us defer *injection itself*, which is
where the actual performance win is.

### Loading rules

- Use `next/script` with `strategy="lazyOnload"`, or inject manually as above. **Never**
  `beforeInteractive` or `afterInteractive` for pixels.
- All three script tags `async`.
- `<link rel="dns-prefetch">` and `preconnect` for `connect.facebook.net`,
  `analytics.tiktok.com`, and `sc-static.net` — cheap, and it cuts the handshake cost once
  loading does start.
- Never load pixels on `/thank-you` **before** the `Purchase` has been dispatched. In practice
  `Purchase` fires on the checkout page from the order response, so this is naturally handled
  (`09` §3).
- Pixel IDs come from `NEXT_PUBLIC_*` env vars (`27`). If an ID is absent, that platform's
  injection is skipped silently — the site must work with zero pixels configured.

---

## 4. Advanced matching (browser)

Send plaintext. All three SDKs hash internally.

```ts
// Meta — after the phone field becomes valid
fbq('init', META_PIXEL_ID, {
  ph: phoneDigits,        // 9665XXXXXXXX — Meta normalises and hashes it
  fn: firstName,          // plaintext
});

// TikTok
ttq.identify({
  phone_number: phoneE164,   // +9665XXXXXXXX — TikTok's SDK hashes it
  external_id: leadId,
});

// Snap
snaptr('init', SNAP_PIXEL_ID, {
  user_phone_number: phoneDigits,   // 9665XXXXXXXX
});
```

> **Even in the browser, give each platform the phone in the form it expects** — TikTok wants the
> `+`, Meta and Snap do not. The SDKs normalise more forgivingly than the server APIs do, but
> matching the documented form costs nothing and removes a whole class of silent match-quality
> loss. The three canonical forms are produced by `lib/phone.ts` (`16` §4.3).

Never send: full name as one string, email (we do not collect it), address, or anything not
listed above.

---

## 5. Purchase timing — do not get this wrong

```
tap «تأكيد الطلب»
  → mint eventId
  → POST /api/orders { …, event_id: eventId }
  → response 201
  → fire browser Purchase with eventId          ← HERE, once
  → show upsell
  → navigate to /thank-you/{id}                 ← NOT here
```

- **Fire from the order-create response, not on thank-you page mount.** The thank-you page can be
  refreshed, bookmarked, or reached via back-navigation; firing there double-counts.
- The server fires its CAPI `Purchase` for the same order in the same request, with the same
  `event_id`.
- Platforms favour the **browser** event when both arrive within 5 minutes of each other, and
  discard the later duplicate within a 48-hour window. That is the intended behaviour.
- The thank-you page fires only `PageView` and a custom `ThankYouView`.

---

## 6. Payload shapes (browser)

```ts
// ViewContent — product page
fbq('track', 'ViewContent', {
  content_ids: [sku], content_type: 'product', content_name: nameAr,
  value: selectedOffer.priceSar, currency: 'SAR',
}, { eventID: id });

ttq.track('ViewContent', {
  contents: [{ content_id: sku, content_type: 'product', content_name: nameAr,
               quantity: selectedOffer.qty, price: selectedOffer.priceSar }],
  value: selectedOffer.priceSar, currency: 'SAR',
}, { event_id: id });

snaptr('track', 'VIEW_CONTENT', {
  item_ids: [sku], item_category: 'hair-care',
  price: selectedOffer.priceSar, currency: 'SAR',
  client_dedup_id: id,
});
```

```ts
// Purchase
fbq('track', 'Purchase', {
  value: total, currency: 'SAR',
  content_ids: skus, content_type: 'product', num_items: unitCount,
}, { eventID: id });

ttq.track('CompletePayment', {
  value: total, currency: 'SAR', contents, order_id: orderNumber,
}, { event_id: id });

snaptr('track', 'PURCHASE', {
  price: total, currency: 'SAR', item_ids: skus, number_items: unitCount,
  transaction_id: orderNumber,
  client_dedup_id: id,
});
```

**Currency is always `SAR`.** All three platforms support it (`SAR` is in Snap's supported ISO
4217 subset). Value is the integer total in riyals.

---

## 7. Attribution capture

Click identifiers arrive on the landing URL and must survive several navigations to reach
order creation (`09` §6).

```ts
// src/lib/attribution.ts — run once on first load
type Attribution = {
  fbclid?: string; fbp?: string; fbc?: string;
  ttclid?: string; ttp?: string;
  sc_click_id?: string; scid?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string;
  landing_path: string; referrer: string; captured_at: string;
};
```

| Value | How to obtain |
|---|---|
| `fbclid` | URL param |
| `fbc` | **Construct it:** `fb.1.{Date.now()}.{fbclid}`. The `1` is the subdomain index — for the apex domain `osool.shop` it is `1`. Or read the `_fbc` cookie if the pixel already set it (prefer the cookie when present). |
| `fbp` | Read the `_fbp` cookie (set by the Meta pixel). Available only after the pixel loads — re-read it at checkout time, not on first load. |
| `ttclid` | URL param |
| `ttp` | Read the `_ttp` cookie set by the TikTok pixel |
| `sc_click_id` | URL param `ScCid` |
| `scid` | Read the `_scid` cookie set by the Snap pixel (Snap's `sc_cookie1` parameter) |
| `utm_*` | URL params |

Storage: first-party cookie `osool_attr`, JSON, 90-day expiry, `SameSite=Lax`, `Secure`,
**not** `HttpOnly` (the client must read it). First-touch values are not overwritten by later
visits, except `fbp`/`ttp`/`scid`, which are always refreshed to the current cookie value.

Send the whole object with `POST /api/leads` and `POST /api/orders`. The server persists it to
`orders.attribution` and uses `fbc`/`fbp`/`ttclid`/`ttp`/`sc_click_id`/`scid` in the CAPI calls,
where they are among the highest-value match signals available (`24`).

**In-app browser caveat:** Snapchat and TikTok in-app browsers are aggressive about storage. Verify
the cookie survives a navigation *inside those browsers specifically* — this is a mandatory QA
step (`32`).

---

## 8. Consent

Saudi Arabia's PDPL does not require a blocking cookie wall the way GDPR does, but it does require
disclosure and a lawful basis (`07` §7, `29`).

Implementation for v1:

- A **non-blocking** bottom notice on first visit: «نستخدم ملفات تعريف الارتباط لتحسين تجربتك
  وقياس أداء إعلاناتنا. <LTR>[</LTR>اقرأي سياسة الخصوصية<LTR>]</LTR>» with a «تم» dismiss button,
  remembered in `localStorage`.
- Pixels load regardless (which is why the notice must be genuinely informative and the privacy
  policy must be specific about what is shared with Meta, TikTok, and Snap).
- Build the tracking facade with a `consent` gate from day one, even though it defaults to
  granted. If policy changes, it is a one-line switch instead of a refactor.
- Meta's `fbq('consent', 'revoke'|'grant')` and the equivalents are wired but unused in v1.

---

## 9. Debugging and verification

| Platform | Tool | What to look for |
|---|---|---|
| Meta | Events Manager → Test Events; Meta Pixel Helper extension | Events appear with the right names; check the **Deduplication** column shows server events matched to browser events |
| TikTok | Events Manager → Test Event Code; TikTok Pixel Helper | Event Summary shows a **Deduplicated Events** count; if server events are not being deduplicated, the `event_id` or the event name does not match |
| Snap | Events Manager; Snap Pixel Helper | Events received, and `client_dedup_id` present on browser events |

**Verification gate before scaling spend** (`32`, `33`): for each platform, perform one real test
order and confirm in that platform's own Events Manager that **exactly one** `Purchase` is
counted, not two. Do not take dedup on faith — it fails silently, and the failure mode is
over-reported ROAS, which leads to over-spending.

Use `test_event_code` / test-event mode during QA so test orders do not pollute optimisation data.

---

## 10. Implementation checklist

- [ ] `initTracking()` called once from a client provider in the root layout
- [ ] All three SDKs injected only after interaction / idle / 3s fallback
- [ ] Event queue flushes in order on load
- [ ] `newEventId()` used once per action, shared across all platforms and the server
- [ ] Meta `eventID`, TikTok `event_id`, Snap `client_dedup_id` all set on every event
- [ ] Snap purchases also carry `transaction_id`
- [ ] TikTok purchase named `CompletePayment` on **both** browser and server
- [ ] Snap event names UPPER_SNAKE_CASE
- [ ] Advanced matching sends plaintext, in the per-platform phone form
- [ ] `Purchase` fires from the order response, never on thank-you mount
- [ ] Upsell delta uses the server-provided `upsell.event_id`
- [ ] `osool_attr` cookie captured on first load and sent with orders and leads
- [ ] `fbp` / `ttp` / `scid` re-read at checkout time, not only at first load
- [ ] Site works with zero pixel IDs configured
- [ ] Verified in the Snapchat and TikTok in-app browsers
- [ ] Dedup confirmed in all three Events Managers with a real test order
