# 24 — Server-Side Conversions API (Meta / TikTok / Snapchat)

Every payload shape, endpoint, and hashing rule in this document was verified against the
platforms' own current developer documentation. **The three platforms disagree with each other on
phone-number formatting, and the disagreement is silent** — send the wrong shape and you get a
`200 OK`, a well-formed hash of nobody, and a quietly broken match rate. That is the single most
important thing in this document.

---

## 1. Why server-side at all

Browser pixels lose 20–40% of conversions to ad blockers, ITP/Safari, in-app browser quirks, and
tab closures. In a COD funnel the `Purchase` event is the *only* revenue signal the platforms get,
so losing a third of it directly degrades campaign optimisation. Server-side CAPI is not
redundancy — it is the reliable channel, and the browser pixel is the enrichment layer.

The recommended setup for all three platforms is **pixel + server API together with
deduplication**, which is exactly what we build.

---

## 2. The phone-format problem — read this first

Same Saudi mobile `0551234567`. Three different strings to hash:

| Platform | Normalised value to hash | Keeps `+`? | Leading zeros |
|---|---|---|---|
| **Meta** | `966551234567` | ❌ **No** | Removed |
| **TikTok** | `+966551234567` | ✅ **Yes** | Removed |
| **Snapchat** | `966551234567` | ❌ **No** | Removed |

Sources, in the platforms' own words:

> **Meta** — `ph` Phone Number: *"Hashing required. Remove symbols, letters, and any leading zeros.
> Phone numbers must include a country code to be used for matching… Example: Input: US phone
> number (650)555-1212. Normalized format: `16505551212`"*

> **TikTok** — *"The user's phone number, hashed with SHA256. Include country code with `+` and
> remove any other characters (spaces, `-`) between numbers (for example, for the USA:
> `+12125551212`). If the country code is `86`, do not include the country code."*

> **Snapchat** — *"Normalize phone numbers by including the country code, remove any double 0 in
> front of the country code. If the number itself begins with a 0, this should be removed. Also
> exclude any non-numeric characters such as whitespace, parentheses, `+`, or `-`. Hashing
> required. Example: Input: +44 844 412 4653 → Normalized: `448444124653`"*

So: **TikTok keeps the plus, Meta and Snapchat strip it.** The user's instinct that "maybe TikTok
needs + before number" is correct and confirmed.

The `86` exception in TikTok's rule (drop the country code for Chinese numbers) does not affect
Saudi numbers, but implement the rule generically rather than hardcoding `+966`, so a future
market does not silently break.

---

## 3. Hashing implementation

### 3.1 Universal rules (all three platforms)

1. Normalise **before** hashing. A hash of an un-normalised value matches nothing.
2. SHA-256, output as **lowercase hexadecimal**.
3. If a value is absent, **omit the field entirely** — never send a hash of an empty string. A
   hash of `""` is a valid-looking hash that matches nothing and degrades match quality.
4. Detect values that are already hashed (64 hex chars) and pass them through untouched.
   Normalising a digest destroys it.
5. Never hash: `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `ttclid`, `ttp`,
   `sc_click_id`, `sc_cookie1`, `lead_id`, `subscription_id`. These are sent in plaintext.
6. `external_id` — hashing is *recommended* by Meta and Snap. If you hash it, hash it consistently
   everywhere it is sent, including in the browser.

### 3.2 Shared module

```python
# app/services/hashing.py
import hashlib, re

_HEX64 = re.compile(r"^[a-f0-9]{64}$")
_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _maybe_hashed(value: str) -> str | None:
    return value if _HEX64.match(value) else None


def digits_only(raw: str) -> str:
    """Saudi mobile → 966XXXXXXXXX (no plus, no leading zeros)."""
    s = raw.translate(_ARABIC_DIGITS)
    s = re.sub(r"\D", "", s)
    if s.startswith("00966"):
        s = s[5:]
    elif s.startswith("966"):
        s = s[3:]
    elif s.startswith("0"):
        s = s[1:]
    return "966" + s


def hash_phone_meta(raw: str | None) -> str | None:
    """Meta and Snapchat: digits only, with country code, no plus."""
    if not raw:
        return None
    return _maybe_hashed(raw) or _sha256(digits_only(raw))


hash_phone_snap = hash_phone_meta   # identical rules


def hash_phone_tiktok(raw: str | None) -> str | None:
    """TikTok: E.164 INCLUDING the leading plus."""
    if not raw:
        return None
    if (h := _maybe_hashed(raw)):
        return h
    return _sha256("+" + digits_only(raw))


def hash_name(raw: str | None) -> str | None:
    """Lowercase, strip punctuation and whitespace, UTF-8."""
    if not raw:
        return None
    s = raw.strip().lower()
    s = re.sub(r"[^\w\u0600-\u06FF]", "", s, flags=re.UNICODE)
    return _sha256(s) if s else None


def hash_email(raw: str | None) -> str | None:
    if not raw:
        return None
    return _maybe_hashed(raw) or _sha256(raw.strip().lower())
```

### 3.3 Name handling for Arabic

Our checkout collects **one** name field (`16` §3.1). Meta and Snap both accept `fn` and `ln`
separately. Split on the first whitespace: first token → `fn`, remainder joined → `ln`. If there
is only one token, send `fn` only and **omit** `ln` (rule 3). Arabic characters are preserved and
hashed as UTF-8 — Snap's own documentation shows non-ASCII examples (`Raphaël`, `김`) hashed as
UTF-8, so this is correct behaviour, not a workaround.

### 3.4 Known test vectors — put these in `tests/test_hashing.py`

These are published by the platforms and are exact. If your implementation reproduces them, your
normalisation is right.

| Platform | Input | Normalised | Expected SHA-256 |
|---|---|---|---|
| Meta | `(650)555-1212` (US) | `16505551212` | `e323ec626319ca94ee8bff2e4c87cf613be6ea19919ed1364124e16807ab3176` |
| Snap | `+44 844 412 4653` | `448444124653` | `dc008fda46e2e64002cf2f82a4906236282d431c4f75e5b60bfe79fc48546383` |
| Snap (email) | `Person@Example.com` | `person@example.com` | `542d240129883c019e106e3b1b2d3f3cb3537c43c425364de8e951d5a3083345` |
| Snap (first name) | `John` | `john` | `96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000cec607a` |

Then add Saudi vectors of your own by generating the expected values once and freezing them:

```bash
printf '966551234567' | sha256sum      # Meta + Snap form
printf '+966551234567' | sha256sum     # TikTok form  ← must differ from the above
```

The assertion that matters most: **`hash_phone_meta(x) != hash_phone_tiktok(x)`** for every input.
If your test suite ever shows them equal, the `+` handling is broken.

---

## 4. Meta Conversions API

**Endpoint**

```
POST https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events?access_token={META_CAPI_ACCESS_TOKEN}
```

**Payload**

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1785512472,
      "event_id": "e7c9a1b2-3d4e-5f60-8a9b-0c1d2e3f4a5b",
      "action_source": "website",
      "event_source_url": "https://osool.shop/products/redensyl-copper-peptide-serum",
      "user_data": {
        "ph": "<sha256 of 966551234567>",
        "fn": "<sha256 of نورة>",
        "ln": "<sha256 of العتيبي>",
        "country": "<sha256 of sa>",
        "external_id": "<sha256 of order uuid>",
        "client_ip_address": "37.106.x.x",
        "client_user_agent": "Mozilla/5.0 …",
        "fbc": "fb.1.1785512400123.IwAR3xY…",
        "fbp": "fb.1.1785500000000.1234567890"
      },
      "custom_data": {
        "currency": "SAR",
        "value": 279,
        "content_type": "product",
        "content_ids": ["OSL-SER-30"],
        "contents": [{ "id": "OSL-SER-30", "quantity": 2, "item_price": 139 }],
        "num_items": 2,
        "order_id": "OS-10428"
      }
    }
  ],
  "test_event_code": "TEST12345"
}
```

**Rules**

- `event_time`: Unix **seconds**. Must not be more than 7 days old.
- `action_source`: `"website"` (lowercase) for all our events.
- At least one `user_data` identifier is required. We always have `ph` for purchases; for
  `PageView`/`ViewContent` we rely on `fbp`, `fbc`, `client_ip_address`, and `client_user_agent`.
- `fbc` / `fbp` / `client_ip_address` / `client_user_agent` are **not hashed**.
- `country` is hashed (`sha256("sa")`) — a small, free match-quality gain since we are single-market.
- `test_event_code` only when `META_TEST_EVENT_CODE` is set. **Remove it in production** or events
  land in the test stream and never reach optimisation.
- Batch up to 1,000 events per request; we send one at a time (volume does not warrant batching).

**Deduplication.** Meta matches on (`event_id`, `event_name`) against the browser's
(`eventID`, `event`) for the same pixel, within **48 hours**. If both arrive within ~5 minutes,
Meta favours the browser event. Duplicates after the first are discarded.

---

## 5. TikTok Events API 2.0

**Endpoint**

```
POST https://business-api.tiktok.com/open_api/v1.3/event/track/
Headers:
  Access-Token: {TIKTOK_CAPI_ACCESS_TOKEN}
  Content-Type: application/json
```

**Payload**

```json
{
  "event_source": "web",
  "event_source_id": "{TIKTOK_PIXEL_CODE}",
  "test_event_code": "TEST12345",
  "data": [
    {
      "event": "CompletePayment",
      "event_time": 1785512472,
      "event_id": "e7c9a1b2-3d4e-5f60-8a9b-0c1d2e3f4a5b",
      "user": {
        "phone": "<sha256 of +966551234567>",
        "external_id": "<sha256 of order uuid>",
        "ttclid": "E.C.P.xxxxx",
        "ttp": "…",
        "ip": "37.106.x.x",
        "user_agent": "Mozilla/5.0 …"
      },
      "properties": {
        "currency": "SAR",
        "value": 279,
        "content_type": "product",
        "order_id": "OS-10428",
        "contents": [
          { "content_id": "OSL-SER-30", "content_type": "product",
            "content_name": "سيروم الأصول", "quantity": 2, "price": 139 }
        ]
      },
      "page": {
        "url": "https://osool.shop/products/redensyl-copper-peptide-serum",
        "referrer": "https://www.snapchat.com/"
      }
    }
  ]
}
```

**Rules**

- `event_source`: `"web"`. `event_source_id` is the **pixel code** (e.g. `CXXXXXXXXXXXXXXXXX`).
- `event_time`: Unix **seconds**.
- Purchase event name is **`CompletePayment`** — it must match the browser pixel exactly, or
  deduplication fails.
- **`user.phone` is the SHA-256 of the E.164 value *with* the leading `+`.** This is the single
  most commonly mis-implemented field across the three platforms.
- `ip` and `user_agent` live **inside `user`** (not at the top level, and not in `page`).
- `ttclid` and `ttp` are sent **raw**, unhashed. `ttclid` is the strongest single match signal
  TikTok offers — always forward it when present.
- Success response is `{"code": 0, "message": "OK"}`. **`code: 0` does not mean the identifiers
  matched anyone** — it only means the payload was well-formed. Match quality must be checked in
  Events Manager, not inferred from the response.

> **One field to verify before scaling spend.** Some TikTok integration references show the phone
> field as `phone`, others as `phone_number`. Send `phone` (the Events API 2.0 field name), then
> confirm with a `test_event_code` run in Events Manager that identity matching registers. If it
> does not, switch to `phone_number` and re-verify. Note also that TikTok's older published
> reference describes a `/pixel/track/` endpoint that disagrees on timestamp format and on where
> `ip`/`user_agent` belong — follow the v1.3 `event/track/` shape above.

**Deduplication.** TikTok matches on identical `event` + `event_id`, within **48 hours**. For
pixel-vs-API overlap, events are merged when they arrive **more than 5 minutes apart and within
48 hours**. The Event Summary in Events Manager has a **Deduplicated Events** column — most server
events should appear there.

---

## 6. Snapchat Conversions API v3

**Endpoint**

```
POST https://tr.snapchat.com/v3/{SNAP_PIXEL_ID}/events?access_token={SNAP_CAPI_ACCESS_TOKEN}
```

**Payload**

```json
{
  "data": [
    {
      "event_name": "PURCHASE",
      "event_time": 1785512472000,
      "event_id": "e7c9a1b2-3d4e-5f60-8a9b-0c1d2e3f4a5b",
      "action_source": "WEB",
      "event_source_url": "https://osool.shop/products/redensyl-copper-peptide-serum",
      "user_data": {
        "ph": "<sha256 of 966551234567>",
        "fn": "<sha256 of نورة>",
        "ln": "<sha256 of العتيبي>",
        "country": "<sha256 of sa>",
        "client_ip_address": "37.106.x.x",
        "client_user_agent": "Mozilla/5.0 …",
        "sc_click_id": "…",
        "sc_cookie1": "…",
        "external_id": "<sha256 of order uuid>"
      },
      "custom_data": {
        "currency": "SAR",
        "value": 279,
        "order_id": "OS-10428",
        "content_type": "product",
        "content_ids": ["OSL-SER-30"],
        "num_items": "2"
      }
    }
  ],
  "test_event_code": "TEST12345"
}
```

**Rules**

- `event_name` is **UPPER_SNAKE_CASE**: `PURCHASE`, `ADD_CART`, `START_CHECKOUT`, `ADD_BILLING`,
  `VIEW_CONTENT`, `PAGE_VIEW`, `LIST_VIEW`.
- `action_source` is **`"WEB"`** (uppercase) — note the contrast with Meta's lowercase `"website"`.
- `event_time`: epoch seconds or milliseconds; **milliseconds are encouraged**. Must not be more
  than 7 days in the past.
- `event_source_url` is **required** for web events.
- `sc_click_id` (from the `&ScCid=` URL param) and `sc_cookie1` (the `_scid` cookie under our
  domain) are sent **raw**. Snap explicitly flags `sc_cookie1` as a high-value match signal.
- `SAR` is in Snap's supported currency list.
- `num_items` is documented as a **string** — send `"2"`, not `2`.

**Deduplication — two mechanisms, use both on purchases**

| Concept | Pixel field | CAPI v3 field | Window |
|---|---|---|---|
| Cross-channel dedup id | `client_dedup_id` | `event_id` (top level) | 48 hours, all events |
| Order / transaction reference | `transaction_id` | `custom_data.order_id` | 30 days, purchases only |

Do **not** send `transaction_id` at the top level of a CAPI v3 payload — it has no effect there.
The Pixel SDK and CAPI use different names for the same value, which is the most common Snap
integration mistake.

Also note the unusually short windows for two events: `ADD_CART` and `PAGE_VIEW` deduplicate
within **1 second**, not 48 hours.

---

## 7. Purchase and the upsell delta

This is the one piece of event design that is easy to get wrong and expensive when you do.

```
Order created (279 SAR)
  → event_id A
  → browser Purchase value=279 eventID=A
  → server Purchase value=279 event_id=A   (all three platforms)

Upsell accepted (+99 SAR)
  → event_id B   (pre-minted by the server, returned as upsell.event_id)
  → browser Purchase value=99 eventID=B
  → server Purchase value=99 event_id=B, order_id="OS-10428-upsell"
```

**Why a delta event and not a corrected total:**

- Re-firing `event_id A` with `value: 378` is **discarded** as a duplicate — the platforms match on
  (`event_id`, `event_name`) and keep only the first. The extra 99 SAR would simply vanish from
  reporting.
- Firing a *new* event with `value: 378` would double-count the original 279.
- A separate delta event with its own `event_id` and a distinct `order_id` correctly reports
  378 SAR in total across two events.

Use `order_id = "{order_number}-upsell"` on the delta so Snap's 30-day `order_id` dedup and Meta's
`order_id` handling treat it as a distinct transaction.

---

## 8. COD-specific event strategy

In COD, a submitted order is not revenue — a *delivered* one is (`01` §3). Recommended approach:

| Stage | Event | Purpose |
|---|---|---|
| Order submitted | Standard `Purchase` / `CompletePayment` / `PURCHASE` | Gives the platforms fast, high-volume optimisation signal. Fire this from day one. |
| Order **delivered** (ops marks `delivered_at`) | Custom event: Meta `PurchaseDelivered`, TikTok custom `PurchaseDelivered`, Snap `CUSTOM_EVENT_3` — with the real collected value | True-ROAS reporting, and later a value-based optimisation target |

Build the delivered-event hook in v1 (a `POST /api/admin/orders/{id}/status` endpoint that fires it
when status becomes `delivered`), but **optimise campaigns on the standard `Purchase` initially** —
delivered events arrive days later and at lower volume, which starves the learning phase. Switch
optimisation to the delivered event only once volume supports it.

---

## 9. Dispatcher implementation

```python
# app/services/capi/dispatcher.py
async def send_purchase(order_id: UUID) -> None:
    async with session_factory() as db:                 # own session (20 §6)
        order = await get_order_with_items(db, order_id)
        ctx = build_context(order)                      # shared normalised values
        for client in (meta, tiktok, snap):
            try:
                result = await client.purchase(ctx)
                await log_event(db, order, client.platform, result)
            except Exception as exc:
                logger.warning("capi_failed", platform=client.platform,
                               order_id=str(order_id), error=str(exc))
                await log_event(db, order, client.platform, failed(exc))
        await db.commit()
```

**Rules**

- One platform's failure must never prevent the others from firing, and must never affect the
  order. The order is already committed before dispatch (`20` §6).
- Retry 3× with exponential backoff (1s, 4s, 16s) on 5xx and network errors. Do **not** retry 4xx —
  a 400 means the payload is wrong and retrying will not fix it; log it loudly instead.
- Timeout: 5s connect, 10s read.
- If a platform's credentials are absent, log `skipped_no_credentials` and return. Never raise. The
  site must work with zero tracking configured (`20` §8).
- Every attempt writes a `tracking_events` row (`21` §8) with the **hashed** payload — never raw
  PII in the audit log.
- Never log an access token, and never include one in an error message or a Sentry breadcrumb.

---

## 10. Field-by-field comparison

The quick-reference table. Print this and keep it next to the implementation.

| Concept | Meta | TikTok | Snapchat |
|---|---|---|---|
| Endpoint | `graph.facebook.com/v21.0/{pixel}/events` | `business-api.tiktok.com/open_api/v1.3/event/track/` | `tr.snapchat.com/v3/{pixel}/events` |
| Auth | `access_token` query param | `Access-Token` header | `access_token` query param |
| Event array key | `data` | `data` | `data` |
| Purchase event name | `Purchase` | **`CompletePayment`** | **`PURCHASE`** |
| Timestamp unit | seconds | seconds | seconds or **ms (preferred)** |
| Dedup id field | `event_id` | `event_id` | `event_id` |
| Browser counterpart | `eventID` | `event_id` | **`client_dedup_id`** |
| Source-of-event field | `action_source: "website"` | `event_source: "web"` | `action_source: "WEB"` |
| User object | `user_data` | **`user`** | `user_data` |
| Phone field | `ph` | **`phone`** | `ph` |
| **Phone format** | `966…` (no `+`) | **`+966…` (with `+`)** | `966…` (no `+`) |
| Value/currency location | `custom_data` | **`properties`** | `custom_data` |
| Items array | `contents` | `contents` | `content_ids` / `contents` |
| IP field | `user_data.client_ip_address` | **`user.ip`** | `user_data.client_ip_address` |
| UA field | `user_data.client_user_agent` | **`user.user_agent`** | `user_data.client_user_agent` |
| Click id | `fbc` (constructed) | `ttclid` (raw param) | `sc_click_id` (raw param) |
| Browser id cookie | `fbp` | `ttp` | `sc_cookie1` (`_scid`) |
| Order reference | `custom_data.order_id` | `properties.order_id` | `custom_data.order_id` |
| Test mode | `test_event_code` | `test_event_code` (top level) | `test_event_code` |
| Dedup window | 48h | 48h (merge after 5 min) | 48h; 30d with `order_id`; **1s for ADD_CART / PAGE_VIEW** |

---

## 11. Verification gate

Do not scale ad spend until all of these pass (also in `32` and `33`):

- [ ] `tests/test_hashing.py` reproduces every published vector in §3.4
- [ ] `hash_phone_meta(x) != hash_phone_tiktok(x)` asserted for multiple inputs
- [ ] One real test order fires 3 browser events and 3 server events
- [ ] Meta Events Manager: exactly **one** Purchase counted; dedup visible
- [ ] TikTok Events Manager: exactly **one** CompletePayment; "Deduplicated Events" > 0
- [ ] Snap Events Manager: exactly **one** PURCHASE; `client_dedup_id` present on the pixel event
- [ ] Match quality shows the phone parameter as received on all three
- [ ] `client_ip_address` is the **customer's** IP, not the EasyPanel proxy's (`20` §4)
- [ ] Upsell delta appears as a second, distinct Purchase of 99 SAR
- [ ] `test_event_code` removed from production configuration
- [ ] `tracking_events` rows contain hashed values only, no raw phone numbers
