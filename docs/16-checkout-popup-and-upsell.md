# 16 — Checkout Modal, KSA Phone Validation, and the Timed Upsell

The most important 30 seconds of the funnel. Two fields, zero friction, maximum reassurance —
then one honest upsell at the moment of peak commitment.

**KPIs:** checkout opened → order submitted ≥ 45% · upsell take rate ≥ 18% · invalid-phone rate < 2%

---

## 1. Why a modal, not a page

A route change at this moment costs a page load on a cellular connection, loses the cart
context, and gives her an exit. The modal keeps the cart drawer mounted behind it, so closing
checkout returns her to her cart rather than dumping her on a product page.

- Opens over the cart drawer. Both stay mounted.
- Mobile: full-screen sheet (`100dvh`). Desktop: centred modal, max-width 480px.
- URL gains `?checkout=open` — survives refresh, and gives us a trackable state.
- Focus trapped, `Esc` closes, body scroll locked, focus returns to the cart CTA on close.
- Closing fires a `CheckoutAbandoned` custom event with the cart value.

---

## 2. Anatomy

Order is deliberate: reassurance before the fields, proof beside them, guarantee under the
button.

```
┌────────────────────────────────────────┐
│  ✕                                     │
│                                        │
│  خطوة واحدة وينتهي طلبك                  │  ← h2
│  ما نطلب منك بطاقة ولا حساب.             │  ← sub
│  بس اسمك ورقمك.                         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ملخص طلبك                    ⌃   │  │  ← order summary, expanded by default
│  │ سيروم الأصول · قطعتين      279    │  │
│  │ تونك الأصول · قطعتين       279    │  │
│  │ ────────────────────────────────  │  │
│  │ التوصيل                  مجاني    │  │
│  │ الإجمالي                  558     │  │
│  │ الأسعار شاملة الضريبة              │  │
│  └──────────────────────────────────┘  │
│                                        │
│  🔥 14 بنت يكملون طلبهم الآن            │  ← honest scarcity (see §6)
│                                        │
│  الاسم                                  │
│  [ اسمك الكامل                      ]   │
│                                        │
│  رقم الجوال                             │
│  [ 05X XXX XXXX                     ]   │
│  نتواصل معك على هذا الرقم لتأكيد الطلب     │
│                                        │
│  [     تأكيد الطلب — دفع عند الاستلام   ] │  ← primary xl, disabled until valid
│                                        │
│  ✓ تدفعين كاش لما يوصلك — وتقدرين        │  ← guarantee row
│    ترفضين الاستلام                       │
│  ✓ تغليف مقفل، ما فيه أي تفاصيل           │
│  ✓ حقك ترجّعينه خلال 7 أيام               │
│                                        │
│  بتأكيدك للطلب أنتِ موافقة على             │
│  الشروط والأحكام وسياسة الخصوصية          │  ← links, body-sm
└────────────────────────────────────────┘
```

### Deliberate omissions

No email, no address, no city, no district, no notes, no coupon field, no account creation, no
newsletter checkbox.

- **Address is collected on the confirmation call**, not on the form. Every additional field
  costs conversions, and COD orders are confirmed by phone anyway, so the address collected
  there is more accurate. This is the standard high-performing Gulf COD pattern.
- **A coupon field is a conversion leak.** It sends her to Google to hunt for a code and half of
  them never come back. Discounts are delivered through the offer ladder and the upsell instead.
- **No email** means no email marketing in v1. That is an accepted trade-off (`01` §5).

---

## 3. Field specifications

### 3.1 Name

| Property | Value |
|---|---|
| Label | الاسم (a real `<label>`, always visible) |
| Placeholder | اسمك الكامل |
| `type` | `text` |
| `autoComplete` | `name` |
| `dir` | `rtl` |
| `inputMode` | `text` |
| Validation | required, ≥ 2 chars after trim, ≤ 60 chars, must contain at least one letter (Arabic or Latin) |
| Reject | digit-only input, URLs, `<`/`>` |
| Error | «اكتبي اسمك» / «الاسم قصير — اكتبيه كامل» |

Do not split into first/last. One field. Do not require Arabic-only characters — plenty of
people type their name in Latin.

### 3.2 Phone — the critical field

| Property | Value |
|---|---|
| Label | رقم الجوال |
| Placeholder | `05X XXX XXXX` (LTR) |
| `type` | `tel` |
| `inputMode` | `numeric` |
| `autoComplete` | `tel` |
| `dir` | `ltr` with `text-align: right` (digits must read LTR, field aligns with the RTL layout) |
| Max visual length | 12 chars including formatting spaces |
| Helper text | نتواصل معك على هذا الرقم لتأكيد الطلب |
| Font size | ≥ 16px — **mandatory**, or iOS Safari zooms the viewport mid-checkout |

**Live formatting:** as she types, display as `055 123 4567` (3-3-4 groups). Store the raw
normalised value in state; only the display string is formatted.

---

## 4. KSA phone normalisation and validation

Implement **identically** on the client (for instant feedback) and on the server (as the
authority). Extract it to a shared spec and test both against the same table.

### 4.1 Normalisation algorithm

```
1. Convert Arabic-Indic digits to Western:
   ٠١٢٣٤٥٦٧٨٩ → 0123456789   and   ۰۱۲۳۴۵۶۷۸۹ → 0123456789
   (Saudi users frequently type on an Arabic numeric keypad. Skipping this
    step is the single most common cause of false rejections.)
2. Strip everything that is not a digit: spaces, -, (, ), +, ., non-breaking spaces,
   RTL/LTR marks (U+200E, U+200F, U+061C).
3. Remove the international prefix, in this order:
   - leading "00966"  → strip 5 chars
   - leading "966"    → strip 3 chars
   - leading "0"      → strip 1 char
4. The result must now be the 9-digit national number starting with 5.
```

### 4.2 Validation rule

```
national = normalise(input)
valid  ⟺  /^5[013-9]\d{7}$/.test(national)
```

- Must be exactly 9 digits.
- Must start with `5` (all Saudi mobile numbers do).
- The second digit excludes `2` (`52` is not an assigned Saudi mobile prefix). Assigned ranges
  are `50, 51, 53, 54, 55, 56, 57, 58, 59`.
- Landlines (`01X`) are **rejected** — we need a mobile for the confirmation call and for WhatsApp.

### 4.3 Canonical output forms

Store all three; each tracking platform wants a different one and getting this wrong silently
destroys match quality (`24`).

| Form | Value | Used for |
|---|---|---|
| `phone_national` | `5XXXXXXXX` | Internal display, Sheets export |
| `phone_e164` | `+9665XXXXXXXX` | WhatsApp links, **TikTok CAPI hashing (keeps the `+`)** |
| `phone_digits` | `9665XXXXXXXX` | **Meta CAPI and Snap CAPI hashing (no `+`)** |

### 4.4 Test vectors — the implementation must pass all of these

| Input | Normalised national | Valid? |
|---|---|---|
| `0551234567` | `551234567` | ✅ |
| `551234567` | `551234567` | ✅ |
| `966551234567` | `551234567` | ✅ |
| `+966551234567` | `551234567` | ✅ |
| `00966551234567` | `551234567` | ✅ |
| `+966 55 123 4567` | `551234567` | ✅ |
| `055-123-4567` | `551234567` | ✅ |
| `(055) 123 4567` | `551234567` | ✅ |
| `٠٥٥١٢٣٤٥٦٧` (Arabic-Indic) | `551234567` | ✅ |
| `0501234567` | `501234567` | ✅ |
| `0591234567` | `591234567` | ✅ |
| `0521234567` | `521234567` | ❌ unassigned prefix |
| `0112345678` | — | ❌ landline |
| `055123456` | — | ❌ too short |
| `05512345678` | — | ❌ too long |
| `0651234567` | — | ❌ does not start with 5 |
| `+971551234567` | — | ❌ not Saudi |
| `aaaaaaaaaa` | — | ❌ |
| `` (empty) | — | ❌ |

### 4.5 Validation UX — get the timing right

This is where most implementations lose conversions.

| Moment | Behaviour |
|---|---|
| While typing, before 9 digits | **No error.** Neutral border. Showing "invalid" to someone mid-entry is the most common conversion killer in checkout forms. |
| Reaches 9 valid digits | Green check appears at the field's end edge, submit button enables |
| Reaches 9 digits but invalid prefix | Show the error immediately — she is done typing and needs to know |
| On blur with incomplete input | Show the error |
| On submit attempt while invalid | Show the error, focus the field, do not submit |

- The submit button is **disabled until both fields are valid**, styled `--muted` with
  `cursor: not-allowed` and `aria-disabled="true"`. It must not look broken — pair it with the
  helper text so the reason is obvious.
- Errors appear beneath the field in `--urgent`, with an `alert-circle` glyph, announced via
  `aria-live="polite"`, and are never conveyed by colour alone.
- Never clear the field on error. Never re-format in a way that moves the caret.

---

## 5. Order summary block

- Expanded by default on desktop, expanded by default on mobile too (hiding what she is buying
  at the moment of payment raises anxiety; the space cost is worth it)
- Per line: thumb (40px), name, offer label, line total
- Delivery row: «مجاني» or the real fee — never hide a fee until later, which is both a trust
  killer and non-compliant with the E-Commerce Law's total-price disclosure requirement
- Total row: bold, `price` scale
- «الأسعار شاملة ضريبة القيمة المضافة» beneath

---

## 6. Social proof and scarcity in the modal

One of each, maximum. Both must be honest (`18` §honest urgency).

- **Live activity line:** «<LTR>{n}</LTR> بنت يكملون طلبهم الآن» — derived from a **real** count
  of checkout-opened events in the last 30 minutes, served by `GET /api/stats/live`. If the real
  number is below 3, **hide the line entirely** rather than inventing one.
- **One micro-testimonial:** a single line with a name and city, e.g. «وصل بيومين وأنا في القصيم — نورة».

Do not add a countdown timer here. There is a timer in the upsell, and two timers in thirty
seconds reads as a scam.

---

## 7. Submit flow

```
tap «تأكيد الطلب»
  ↓
client validates both fields  → invalid: show errors, focus first invalid, abort
  ↓
button → loading state (spinner, label width preserved, disabled)
  ↓
mint event_id (uuid v4) for the Purchase event
  ↓
POST /api/orders   { name, phone, lines:[{productId, offerId, qty}], eventId, attribution }
  ↓
server: validate → recompute prices from offers table → persist order
        → fire CAPI Purchase (Meta + TikTok + Snap) with the same event_id
        → enqueue Sheets webhook push
        → return { orderId, orderNumber, total, upsell, upsellExpiresAt, eventId }
  ↓
client: fire browser-side Purchase with the SAME event_id  (dedup — see 23, 24)
  ↓
show UpsellModal  (order is ALREADY SAVED at this point)
  ↓
accept → POST /api/orders/{id}/upsell → thank-you
decline or expire → thank-you
```

### 7.1 Non-negotiables

- **The order is fully persisted before the upsell renders.** If she closes the tab, loses
  connection, or the upsell errors, the order still exists and is still callable. This is the
  single most important rule in this document.
- The submit button must be **idempotent-safe**: disable on first tap, and send an
  `Idempotency-Key` header (a client-generated UUID stable across retries) so a double-tap or a
  network retry cannot create two orders. See `22` §idempotency.
- On network failure: keep the form filled, keep the cart, show `errNetwork` plus a WhatsApp
  fallback CTA with the order details prefilled. Never lose her input.
- **Capture a partial lead as soon as the phone field becomes valid** — fire
  `POST /api/leads` (fire-and-forget, debounced 1.5s) with name + phone + cart. That way an
  abandoned checkout with a valid number is still a callable lead. This is worth real money in
  COD. See `21` `leads` table and `30` §recovery.

---

## 8. The upsell modal

Full strategy, product selection logic, and copy in `08` §3. Implementation spec here.

### 8.1 Behaviour

| Property | Value |
|---|---|
| Trigger | Immediately after a successful order creation |
| Layout | Full-screen sheet on mobile, centred modal (max-w 480px) on desktop |
| Duration | `upsell_window_seconds` from settings, default **15** |
| Timer source | **Server** `upsellExpiresAt` timestamp, never a client counter |
| Dismissible | Yes — a clearly visible «لا شكراً، أكملي طلبي» button |
| Backdrop click | Treated as decline → thank-you |
| `Esc` | Treated as decline → thank-you |
| On expiry | Auto-advance to thank-you; the accept endpoint returns `410 Gone` |
| Refresh | Does not reset the window; the window belongs to the order |
| Shown once | Per order. Never re-shown. |

### 8.2 Content order

1. Green confirmation chip: «✓ تم حفظ طلبك <LTR>#{orderNumber}</LTR>» — she must know she is safe *before* being offered anything
2. Eyebrow: «عرض خاص — لهذي المرة فقط»
3. Countdown + thin depleting progress bar: «العرض ينتهي بعد <LTR>{s}</LTR> ثانية»
4. Product image (large, 1:1)
5. Name + the cause it covers
6. Price: `99` large, `199` struck through beside it (a **true** comparison — 199 is our real single-unit price)
7. The two-line "why this one" reason from `08` §3.1
8. Primary CTA (`xl`, full width): «أضيفيه بـ <LTR>99</LTR> ريال»
9. Secondary (`ghost`, clearly visible, not a tiny grey link): «لا شكراً، أكملي طلبي»
10. Reassurance: «نفس الطلب، نفس التوصيل، ولا ريال إضافي على التوصيل.»

### 8.3 Accept handling

`POST /api/orders/{id}/upsell` → `{ productId }`

Server:
1. Reject with `410` if `now > upsell_expires_at`, or `409` if an upsell was already applied
2. Append an order item at the settings-controlled `upsell_price_sar` (99), recompute the total
3. Mark `orders.upsell_accepted = true`
4. Push a Sheets webhook **update** for the existing row — not a new row (`25`)
5. Fire a **separate** `Purchase` event for the 99 delta with its own new `event_id` and
   `order_id = {orderNumber}-upsell`. Do **not** re-fire the original `event_id` with a new
   value — the platforms will discard it as a duplicate and the incremental revenue disappears
   from reporting (`24` §7).
6. Return the updated order summary

Client: fire the matching browser-side `Purchase` for the delta with that same new `event_id`,
then redirect to `/thank-you/{orderId}`.

### 8.4 Accessibility

- `role="dialog"`, `aria-modal="true"`, focus on the primary CTA on open
- The countdown region is `aria-live="off"` with a **single** announcement at the halfway point.
  A screen reader reading every second is unusable.
- Decline is reachable by keyboard as the second tab stop
- Reduced motion: the progress bar jumps in 1s steps instead of animating continuously

---

## 9. Tracking summary for this surface

| Trigger | Event | `event_id` |
|---|---|---|
| Modal opens | `InitiateCheckout` | Minted at open, shared browser↔server |
| Phone becomes valid | `AddPaymentInfo` (Meta) / `AddBilling` (Snap) / `AddPaymentInfo` (TikTok) | New id. This is the strongest mid-funnel optimisation signal available for a COD funnel — use it. |
| Order submitted | `Purchase` | Minted client-side, sent to the server, used by both sides |
| Upsell accepted | `Purchase` (delta only, value 99) | **New** id, `order_id = {n}-upsell` |
| Modal closed without submitting | `CheckoutAbandoned` (custom) | New id |

`data-cta`: `checkout-submit`, `checkout-close`, `upsell-accept`, `upsell-decline`.

---

## 10. Anti-fraud and quality measures

Bad phone numbers are the primary margin leak in COD (`30`).

- Strict validation per §4 — no exceptions, no "submit anyway" escape hatch
- Rate limit order creation per IP: 5 per hour, 20 per day (`29`)
- Reject obviously fake sequential/repeated numbers (`0555555555`, `0512345678`) — flag rather
  than hard-block, and set `orders.risk_flag = 'suspicious_phone'` for ops triage
- Honeypot field, visually hidden, must stay empty
- Reject if the submission arrives less than 2 seconds after the modal opened (bot signal) →
  flag, do not block
- Store IP, user agent, and the attribution cookie on the order for pattern analysis
- Duplicate detection: same phone + same total within 10 minutes → return the existing order
  instead of creating a second one
- **Never block a real customer to stop a fake one.** Every measure above either flags for human
  review or is a hard validation rule that a genuine Saudi mobile always passes.
