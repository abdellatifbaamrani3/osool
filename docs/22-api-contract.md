# 22 — API Contract

Base URL: `https://api.osool.shop`
All requests and responses are JSON, UTF-8. All timestamps are ISO 8601 UTC with `Z`.
All money values are **integer SAR**.

---

## 1. Endpoint summary

| Method | Path | Auth | Rate limit | Purpose |
|---|---|---|---|---|
| GET | `/health` | — | — | Liveness (no DB call) |
| GET | `/health/ready` | — | — | Readiness (DB + migration check) |
| GET | `/api/products` | — | 120/min | All active products with offers |
| GET | `/api/products/{slug}` | — | 120/min | One product with offers and reviews |
| GET | `/api/settings/public` | — | 120/min | Public display settings |
| GET | `/api/stats/live` | — | 60/min | Live activity count for honest scarcity |
| POST | `/api/leads` | — | 20/hr/IP | Partial checkout capture |
| POST | `/api/orders` | — | 5/hr/IP | Create order |
| GET | `/api/orders/{id}/summary` | — | 60/min | Display-safe order summary (thank-you page) |
| POST | `/api/orders/{id}/upsell` | — | 10/hr/IP | Accept the 99 SAR upsell |
| POST | `/api/orders/{id}/upsell/decline` | — | 10/hr/IP | Explicit decline (for analytics) |
| POST | `/api/contact` | — | 5/hr/IP | Contact form |
| POST | `/api/admin/resync/{order_id}` | `ADMIN_TOKEN` | 30/hr | Replay a failed Sheets push |
| POST | `/api/admin/cleanup` | `ADMIN_TOKEN` | 5/hr | Retention purge |

No customer authentication exists in v1 — there are no accounts (`01` §5).

---

## 2. `GET /api/products`

**200**

```json
[
  {
    "id": "8f14e45f-ea1a-4b2c-9c2e-1a2b3c4d5e6f",
    "slug": "redensyl-copper-peptide-serum",
    "sku": "OSL-SER-30",
    "name_ar": "سيروم ريدنسل ٣٪ وببتيدات النحاس",
    "short_name_ar": "سيروم الأصول",
    "subtitle_ar": "لفراغات وتساقط الشعر",
    "hook_ar": "يشتغل على البصيلة، مو على الشعرة",
    "cause_number": 1,
    "cause_name_ar": "البصيلة النائمة",
    "category": "cosmetic_leave_on",
    "requires_supplement_warnings": false,
    "base_price_sar": 199,
    "content_key": "serum",
    "images": [
      { "url": "/images/products/serum-1.jpg", "alt_ar": "سيروم أصول على خلفية عاجية", "ratio": "1:1", "role": "main" }
    ],
    "rating_avg": 4.8,
    "rating_count": 132,
    "stock_count": 240,
    "low_stock_threshold": 30,
    "is_low_stock": false,
    "offers": [
      { "id": "…", "qty": 1, "price_sar": 199, "per_unit_sar": 199, "title_ar": "قطعة واحدة", "duration_label_ar": "تجربة شهر", "badge_ar": null, "is_default": false, "savings_sar": 0, "sort_order": 1 },
      { "id": "…", "qty": 2, "price_sar": 279, "per_unit_sar": 139, "title_ar": "قطعتين", "duration_label_ar": "شهرين — المدة اللي الفرق يبان فيها", "badge_ar": "الأكثر طلباً", "is_default": true, "savings_sar": 119, "sort_order": 2 },
      { "id": "…", "qty": 3, "price_sar": 349, "per_unit_sar": 116, "title_ar": "٣ قطع", "duration_label_ar": "٣ شهور — النتيجة الكاملة", "badge_ar": "أفضل قيمة", "is_default": false, "savings_sar": 248, "sort_order": 3 }
    ]
  }
]
```

Ordered by `sort_order` (= cause order). `is_low_stock` and `savings_sar` are computed server-side
so the frontend never does business arithmetic.

**Note:** `stock_count` is exposed because honest scarcity needs it (`18` §2). If exact stock is
considered commercially sensitive, expose only `is_low_stock` and a bucketed
`stock_display` value — but never fabricate one.

---

## 3. `GET /api/products/{slug}`

Same object as above, plus:

```json
{
  "reviews": [
    {
      "id": "…",
      "author_name_ar": "نورة",
      "city_ar": "الرياض",
      "rating": 5,
      "week_marker": 6,
      "body_ar": "…",
      "is_verified": true,
      "has_photo": true,
      "photo_url": "/images/reviews/r1.jpg"
    }
  ],
  "rating_distribution": { "5": 96, "4": 24, "3": 8, "2": 3, "1": 1 }
}
```

Only `is_published = true` reviews. `is_seed` is **never** exposed in the API response — it is an
internal control field.

**404** if the slug does not exist or `is_active = false`.

---

## 4. `GET /api/settings/public`

```json
{
  "shipping_sar": 0,
  "free_shipping_threshold_sar": 0,
  "delivery_days_min": 2,
  "delivery_days_max": 4,
  "confirmation_window_hours": 24,
  "whatsapp_number": "9665XXXXXXXX",
  "upsell_price_sar": 99
}
```

Only display-safe keys. Never expose tokens, secrets, or internal thresholds like
`live_activity_min_display`.

---

## 5. `GET /api/stats/live`

```json
{ "checkouts_last_30m": 14, "should_display": true }
```

`should_display` is `false` when the real count is below `live_activity_min_display`. **The
frontend must respect `should_display` and render nothing when it is false** — this is the
mechanism that keeps the social-proof line honest (`18` §2).

---

## 6. `POST /api/leads`

Fire-and-forget partial capture (`16` §7.1). Upserts on `phone_national` within 24 hours.

**Request**

```json
{
  "name": "نورة",
  "phone": "0551234567",
  "cart": [{ "product_id": "…", "offer_id": "…", "qty": 1 }],
  "attribution": { "fbclid": "…", "ttclid": "…", "sc_click_id": "…", "utm_source": "snapchat", "landing_path": "/products/redensyl-copper-peptide-serum" }
}
```

`name` may be empty. `phone` must be a valid KSA mobile — an invalid phone returns **422** and the
client simply ignores it (it is fire-and-forget).

**201** `{ "id": "…", "status": "captured" }`

---

## 7. `POST /api/orders`

The most important endpoint in the system.

**Headers**

| Header | Required | Notes |
|---|---|---|
| `Content-Type: application/json` | ✅ | |
| `Idempotency-Key` | ✅ | Client-generated UUID, stable across retries of the same submission |

**Request**

```json
{
  "name": "نورة العتيبي",
  "phone": "0551234567",
  "lines": [
    { "product_id": "8f14e45f-…", "offer_id": "a1b2c3d4-…", "qty": 1 }
  ],
  "event_id": "e7c9a1b2-3d4e-5f60-8a9b-0c1d2e3f4a5b",
  "attribution": {
    "fbclid": "IwAR…", "fbp": "fb.1.1699…", "fbc": "fb.1.1699….IwAR…",
    "ttclid": "E.C.P…", "ttp": "…",
    "sc_click_id": "…", "scid": "…",
    "utm_source": "snapchat", "utm_medium": "paid", "utm_campaign": "serum-cold-01",
    "utm_content": "ugc-3", "utm_term": null,
    "landing_path": "/products/redensyl-copper-peptide-serum",
    "referrer": ""
  },
  "honeypot": "",
  "client_ts": "2026-07-30T09:41:12Z"
}
```

**Field rules**

| Field | Validation |
|---|---|
| `name` | required, 2–60 chars after trim, must contain a letter, no `<` `>` |
| `phone` | required, must normalise to a valid KSA mobile (`16` §4) |
| `lines` | required, 1–10 entries; each `product_id` active, each `offer_id` belonging to that product and active; `qty` 1–10 |
| `event_id` | required, 8–64 chars — the browser mints it and reuses it for its own pixel call (`24` §7) |
| `attribution` | optional object, unknown keys ignored, each value ≤ 512 chars |
| `honeypot` | must be empty or absent, else **422** |
| `client_ts` | optional; if the submission arrives < 2s after the modal opened, set `risk_flag = 'too_fast'` (flag, do not block) |

**Server behaviour, in order**

1. Reject on honeypot or validation failure
2. If `Idempotency-Key` already exists → return the **existing** order with **200** (not 201)
3. Normalise the phone into all three canonical forms
4. Duplicate check: same `phone_national` + same total within 10 minutes → return the existing order with **200** and `risk_flag = 'duplicate'`
5. **Recompute every price from the `offers` table.** Client prices are not accepted, not even as a hint.
6. Resolve shipping from settings
7. Select the upsell product (`08` §3.1); set `upsell_expires_at = now() + upsell_window_seconds`
8. Persist order + items, generate `order_number`
9. **Commit**
10. Schedule background tasks: CAPI `Purchase` fan-out, Sheets push (`20` §6)
11. Return 201

**201 Response**

```json
{
  "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "order_number": "OS-10428",
  "subtotal_sar": 279,
  "shipping_sar": 0,
  "total_sar": 279,
  "currency": "SAR",
  "event_id": "e7c9a1b2-3d4e-5f60-8a9b-0c1d2e3f4a5b",
  "items": [
    { "product_short_name_ar": "سيروم الأصول", "offer_label_ar": "قطعتين · شهرين", "bundles": 1, "total_units": 2, "line_total_sar": 279 }
  ],
  "upsell": {
    "product_id": "…",
    "slug": "salicylic-2-zinc-scalp-exfoliant",
    "short_name_ar": "مقشّر الأصول",
    "image": "/images/products/exfoliant-1.jpg",
    "cause_name_ar": "الفروة المخنوقة",
    "reason_ar": "فروة نظيفة تخلّي السيروم يوصل للبصيلة. هذي الخطوة اللي تفرق.",
    "price_sar": 99,
    "compare_at_sar": 199,
    "expires_at": "2026-07-30T09:41:42Z",
    "event_id": "b3c4d5e6-…"
  }
}
```

`upsell.event_id` is a **new, separate** id for the delta `Purchase` event — pre-minted by the
server so the browser and server use the same value if she accepts (`24` §7).

`upsell` is `null` only in the impossible case where no product could be selected; the frontend
must handle null by skipping straight to thank-you.

---

## 8. `GET /api/orders/{id}/summary`

For the thank-you page. `{id}` is the UUID.

**200**

```json
{
  "order_number": "OS-10428",
  "customer_name": "نورة العتيبي",
  "phone_masked": "055 *** 4567",
  "status": "new",
  "subtotal_sar": 378,
  "shipping_sar": 0,
  "total_sar": 378,
  "upsell_accepted": true,
  "upsell_window_open": false,
  "items": [
    { "product_short_name_ar": "سيروم الأصول", "content_key": "serum", "offer_label_ar": "قطعتين · شهرين", "bundles": 1, "total_units": 2, "line_total_sar": 279, "kind": "offer" },
    { "product_short_name_ar": "مقشّر الأصول", "content_key": "exfoliant", "offer_label_ar": "عرض خاص", "bundles": 1, "total_units": 1, "line_total_sar": 99, "kind": "upsell" }
  ],
  "missing_product_slugs": ["iron-bisglycinate-vitamin-c-tonic"],
  "created_at": "2026-07-30T09:41:12Z"
}
```

**Security:** returns only display-safe fields. Never `phone_national`, `phone_e164`, `client_ip`,
`user_agent`, `attribution`, `risk_flag`, or `event_id`. `content_key` is included so the page can
render the correct how-to-use content, and `missing_product_slugs` powers the post-purchase
cross-sell (`17` §8).

**404** on an unknown id → the frontend renders the friendly not-found variant, never a raw 404.

---

## 9. `POST /api/orders/{id}/upsell`

**Request** `{ "product_id": "…" }`

**Server**

1. **410 Gone** if `now > upsell_expires_at`
2. **409 Conflict** if `upsell_resolved_at` is already set
3. **422** if `product_id` does not match `upsell_offered_product_id`
4. Append an `order_items` row with `kind = 'upsell'`, price from `settings.upsell_price_sar`
5. Set `upsell_accepted = true`, `upsell_resolved_at = now()`, recompute totals
6. Commit
7. Background: Sheets **update** (not a new row — `25` §5), and a CAPI `Purchase` for the **99 delta only**, using `orders.upsell_event_id`

**200** `{ "order_number": "OS-10428", "total_sar": 378, "upsell_event_id": "b3c4d5e6-…", "delta_sar": 99 }`

The client then fires its browser-side `Purchase` for the delta with that same `event_id`.

## 10. `POST /api/orders/{id}/upsell/decline`

Sets `upsell_resolved_at`. Returns **204**. Fire-and-forget; the client navigates regardless of the
response. Exists purely so decline-vs-expire can be distinguished in analytics.

---

## 11. `POST /api/contact`

**Request**

```json
{ "name": "هند", "phone": "0551234567", "subject": "استفسار عن منتج", "message": "…", "honeypot": "" }
```

`subject` must be one of the four allowed values. `message` 10–1000 chars.

**201** `{ "status": "received" }` — plus a background Sheets push to the `Messages` tab.

---

## 12. Error format

Every error, from every endpoint, uses one shape. The `message_ar` is safe to display directly.

```json
{
  "error": {
    "code": "validation_error",
    "message_ar": "الرقم غير صحيح — لازم يبدأ بـ 05 ويكون 10 أرقام",
    "field": "phone",
    "request_id": "01J8Z…"
  }
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `bad_request` | Malformed JSON |
| 404 | `not_found` | Unknown product slug or order id |
| 409 | `conflict` | Upsell already resolved |
| 410 | `gone` | Upsell window expired |
| 422 | `validation_error` | Field validation failure — always includes `field` |
| 429 | `rate_limited` | Includes a `Retry-After` header |
| 500 | `server_error` | Generic. `message_ar` = «صار خطأ عندنا، مو عندك…» |
| 503 | `unavailable` | Readiness check failing |

**Never leak internals.** No stack traces, no SQL, no library messages in `message_ar`. The
`request_id` is logged server-side so support can correlate.

---

## 13. Idempotency

- `POST /api/orders` requires `Idempotency-Key`; it is stored in `orders.idempotency_key` (unique).
- A repeat with the same key returns the original order with **200** and does **not** re-fire CAPI
  events or re-push to Sheets. Double-firing `Purchase` for one order is worse than missing it.
- Keys are retained for 7 days, then eligible for cleanup.
- `POST /api/leads` is naturally idempotent via the 24-hour phone upsert.
- `POST /api/orders/{id}/upsell` is guarded by `upsell_resolved_at`.

---

## 14. Validation and pricing authority

> **The server is the only authority on price.** The request body contains no prices at all — only
> `product_id`, `offer_id`, and `qty`. This makes price tampering structurally impossible rather
> than something we have to validate against.

```python
# app/services/pricing.py
async def compute(db, lines) -> Computed:
    subtotal = 0
    resolved = []
    for line in lines:
        offer = await get_active_offer(db, line.offer_id)
        if offer is None or offer.product_id != line.product_id:
            raise ValidationError(field="lines", code="invalid_offer")
        if not (1 <= line.qty <= 10):
            raise ValidationError(field="lines", code="invalid_qty")
        line_total = offer.price_sar * line.qty      # authoritative
        subtotal += line_total
        resolved.append(ResolvedLine(offer=offer, qty=line.qty, line_total=line_total))
    shipping = await resolve_shipping(db, subtotal)
    return Computed(lines=resolved, subtotal=subtotal, shipping=shipping,
                    total=subtotal + shipping)
```

---

## 15. CORS and caching

- CORS: only `https://osool.shop` and `https://www.osool.shop` (from env, never `*`).
- `GET /api/products*` → `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- `GET /api/stats/live` → `Cache-Control: public, max-age=30`
- All `POST` endpoints and `/api/orders/{id}/summary` → `Cache-Control: no-store`
- `/api/settings/public` → `max-age=300`

---

## 16. OpenAPI

FastAPI generates it automatically. `/docs` and `/redoc` are **disabled in production**
(`docs_url=None`) — they expose the full schema and the admin endpoints to anyone who looks. Keep
them enabled in development, and commit a generated `openapi.json` to the repo so the frontend
types can be derived from it.
