# 21 — Data Model

PostgreSQL. Database `osool`, user `osool`. All tables use UUIDv4 primary keys, `created_at` and
`updated_at` timestamps (`timestamptz`, UTC), and snake_case naming.

**Money rule:** all amounts are **integer SAR**. No floats, no decimals, no `NUMERIC`. Prices are
whole riyals throughout (`08` §6). A float price column is how rounding bugs get into totals.

---

## 1. Entity overview

```
products ──┬── offers          (3 rows per product: qty 1/2/3)
           ├── reviews
           └── order_items ──── orders ──── tracking_events
leads      (partial checkout captures, may link to an order)
contact_messages
settings   (key/value config editable without a deploy)
```

---

## 2. `products`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | varchar(120) UNIQUE NOT NULL | `redensyl-copper-peptide-serum` |
| `sku` | varchar(40) UNIQUE NOT NULL | `OSL-SER-30` |
| `name_ar` | varchar(200) NOT NULL | Full Arabic name |
| `short_name_ar` | varchar(80) NOT NULL | «سيروم الأصول» — used in cart, sticky bar, upsell |
| `subtitle_ar` | varchar(240) NOT NULL | «لفراغات وتساقط الشعر» |
| `hook_ar` | varchar(240) | «يشتغل على البصيلة، مو على الشعرة» |
| `cause_number` | smallint NOT NULL | 1, 2, or 3 — drives ordering and cross-sell |
| `cause_name_ar` | varchar(80) NOT NULL | «البصيلة النائمة» |
| `category` | enum `product_category` NOT NULL | `cosmetic_leave_on` \| `cosmetic_rinse_off` \| `supplement_oral` |
| `requires_supplement_warnings` | boolean NOT NULL DEFAULT false | **true for the tonic** — drives the mandatory warning block (`07` §4.2) |
| `base_price_sar` | integer NOT NULL | 199 — the single-unit reference price |
| `stock_count` | integer NOT NULL DEFAULT 0 | Real stock. Drives honest scarcity (`18` §2). |
| `low_stock_threshold` | integer NOT NULL DEFAULT 30 | Show the scarcity chip below this |
| `is_active` | boolean NOT NULL DEFAULT true | |
| `sort_order` | smallint NOT NULL | Canonical order = cause order |
| `content_key` | varchar(40) NOT NULL | `serum` \| `tonic` \| `exfoliant` — maps to `content/products/*.ts` |
| `images` | jsonb NOT NULL DEFAULT `'[]'` | `[{url, alt_ar, ratio, role}]` |
| `rating_avg` | numeric(2,1) | Denormalised from reviews; null until real reviews exist |
| `rating_count` | integer NOT NULL DEFAULT 0 | |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `slug` (unique), `sku` (unique), `(is_active, sort_order)`.

**Why `category` and `requires_supplement_warnings` are columns and not inferred:** the tonic is
regulated differently from the two cosmetics (`07` §2). Encoding that in data rather than in a
hardcoded `if slug == 'iron-...'` means the compliance block can never be accidentally dropped
by a refactor, and a future 4th product declares its own status.

---

## 3. `offers`

The offer ladder from `08` §1. In the database so pricing changes need no deploy.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | uuid FK → products ON DELETE CASCADE | |
| `qty` | smallint NOT NULL CHECK (qty >= 1) | 1, 2, 3 |
| `price_sar` | integer NOT NULL CHECK (price_sar > 0) | 199, 279, 349 |
| `title_ar` | varchar(60) NOT NULL | «قطعتين» |
| `duration_label_ar` | varchar(80) NOT NULL | «شهرين — المدة اللي الفرق يبان فيها» |
| `badge_ar` | varchar(40) | «الأكثر طلباً» / «أفضل قيمة» / null |
| `is_default` | boolean NOT NULL DEFAULT false | Exactly one true per product |
| `is_active` | boolean NOT NULL DEFAULT true | |
| `sort_order` | smallint NOT NULL | |
| `created_at`, `updated_at` | timestamptz | |

Constraints:

```sql
CREATE UNIQUE INDEX uq_offers_product_qty ON offers (product_id, qty);
CREATE UNIQUE INDEX uq_offers_one_default ON offers (product_id) WHERE is_default;
```

`per_unit_sar` is **computed at read time** (`price_sar / qty`, rounded down for display), never
stored — a stored derived value will drift.

---

## 4. `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Unguessable — used in the thank-you URL (`17` §11) |
| `order_number` | varchar(20) UNIQUE NOT NULL | Human-readable, e.g. `OS-10428`. Sequence-backed. Shown in the UI and the Sheet. |
| `customer_name` | varchar(60) NOT NULL | |
| `phone_national` | varchar(9) NOT NULL | `5XXXXXXXX` — canonical storage form |
| `phone_e164` | varchar(16) NOT NULL | `+9665XXXXXXXX` — for WhatsApp and TikTok CAPI |
| `subtotal_sar` | integer NOT NULL | |
| `shipping_sar` | integer NOT NULL DEFAULT 0 | |
| `total_sar` | integer NOT NULL | |
| `currency` | char(3) NOT NULL DEFAULT `'SAR'` | |
| `payment_method` | enum `payment_method` NOT NULL DEFAULT `'cod'` | Only `cod` in v1 |
| `status` | enum `order_status` NOT NULL DEFAULT `'new'` | See §4.1 |
| `upsell_offered_product_id` | uuid FK → products NULL | Which product we offered |
| `upsell_accepted` | boolean NOT NULL DEFAULT false | |
| `upsell_expires_at` | timestamptz NULL | Server-authoritative timer (`16` §8) |
| `upsell_resolved_at` | timestamptz NULL | Set on accept, decline, or expiry |
| `event_id` | varchar(64) NOT NULL | The shared browser↔server dedup id for `Purchase` (`24` §7) |
| `upsell_event_id` | varchar(64) NULL | The separate id for the upsell delta event |
| `client_ip` | inet NULL | Real client IP via `X-Forwarded-For` (`20` §4) |
| `user_agent` | text NULL | |
| `attribution` | jsonb NOT NULL DEFAULT `'{}'` | `{fbclid, fbc, fbp, ttclid, ttp, sc_click_id, scid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_path, referrer}` |
| `risk_flag` | varchar(40) NULL | `suspicious_phone` \| `too_fast` \| `duplicate` \| null |
| `idempotency_key` | varchar(64) UNIQUE NULL | Prevents double-submit duplicates (`22` §idempotency) |
| `sheet_synced_at` | timestamptz NULL | Null = the Sheets push has not succeeded |
| `sheet_sync_attempts` | smallint NOT NULL DEFAULT 0 | |
| `confirmed_at` | timestamptz NULL | Set by ops |
| `delivered_at` | timestamptz NULL | Set by ops — the true revenue event |
| `notes` | text NULL | Ops notes from the confirmation call |
| `created_at`, `updated_at` | timestamptz | |

Indexes: `order_number` (unique), `idempotency_key` (unique), `phone_national`, `created_at DESC`,
`status`, and a partial index `WHERE sheet_synced_at IS NULL` for the resync job.

### 4.1 `order_status` enum

```
new           → submitted on site, not yet contacted
confirmed     → customer reached and confirmed, address captured
shipped       → handed to the courier
delivered     → paid and delivered  ← the real revenue event
no_answer     → confirmation attempts exhausted
cancelled     → customer cancelled
returned      → refused on delivery or returned within 7 days
```

Ops moves orders through this in the Google Sheet; the enum exists so an admin panel can be added
later without a migration (`01` §5).

---

## 5. `order_items`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders ON DELETE CASCADE | |
| `product_id` | uuid FK → products ON DELETE RESTRICT | |
| `offer_id` | uuid FK → offers ON DELETE RESTRICT NULL | Null for the upsell line |
| `kind` | enum `item_kind` NOT NULL DEFAULT `'offer'` | `offer` \| `upsell` |
| `product_name_ar` | varchar(200) NOT NULL | **Snapshot** — survives a product rename |
| `product_sku` | varchar(40) NOT NULL | Snapshot |
| `offer_label_ar` | varchar(120) | Snapshot, e.g. «قطعتين · شهرين» |
| `unit_qty` | smallint NOT NULL | Units per bundle (1, 2, or 3) |
| `bundles` | smallint NOT NULL DEFAULT 1 | How many bundles of this offer |
| `total_units` | smallint NOT NULL | `unit_qty * bundles` — stored for ops picking convenience |
| `unit_price_sar` | integer NOT NULL | Bundle price at time of order |
| `line_total_sar` | integer NOT NULL | `unit_price_sar * bundles` |
| `created_at` | timestamptz | |

**Snapshot columns are deliberate.** An order is a historical record. If a product is renamed or
repriced, past orders must still show what was actually sold at what price. `ON DELETE RESTRICT`
on `product_id` additionally prevents deleting a product that has been ordered.

---

## 6. `leads`

Partial checkout captures (`16` §7.1). In COD this table is directly worth money.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `customer_name` | varchar(60) NULL | May be empty if she filled the phone first |
| `phone_national` | varchar(9) NULL | |
| `phone_e164` | varchar(16) NULL | |
| `cart_snapshot` | jsonb NOT NULL DEFAULT `'[]'` | What was in the cart |
| `cart_value_sar` | integer NOT NULL DEFAULT 0 | |
| `attribution` | jsonb NOT NULL DEFAULT `'{}'` | Same shape as `orders.attribution` |
| `client_ip` | inet NULL | |
| `user_agent` | text NULL | |
| `converted_order_id` | uuid FK → orders NULL | Set when she completes |
| `recovery_status` | varchar(30) NOT NULL DEFAULT `'new'` | `new` \| `contacted` \| `recovered` \| `lost` |
| `sheet_synced_at` | timestamptz NULL | Pushed to the `Leads` tab |
| `created_at`, `updated_at` | timestamptz | |

Index: `phone_national`, `created_at DESC`, partial `WHERE converted_order_id IS NULL`.

Upsert semantics: `POST /api/leads` upserts on `phone_national` within the last 24 hours rather
than inserting a new row on every keystroke-debounce.

---

## 7. `reviews`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | uuid FK → products ON DELETE CASCADE | |
| `author_name_ar` | varchar(60) NOT NULL | «نورة» |
| `city_ar` | varchar(60) | «الرياض» |
| `rating` | smallint NOT NULL CHECK (rating BETWEEN 1 AND 5) | |
| `week_marker` | smallint NULL | 6 → «أسبوع ٦». The specificity that makes reviews credible (`03` §6) |
| `body_ar` | text NOT NULL | |
| `is_verified` | boolean NOT NULL DEFAULT false | |
| `has_photo` | boolean NOT NULL DEFAULT false | |
| `photo_url` | text NULL | |
| **`is_seed`** | **boolean NOT NULL DEFAULT false** | **Placeholder content. MUST be false or the row removed before launch (`07` §6, `33`).** |
| `is_published` | boolean NOT NULL DEFAULT true | |
| `sort_order` | smallint NOT NULL DEFAULT 0 | |
| `created_at`, `updated_at` | timestamptz | |

Index: `(product_id, is_published, sort_order)`.

`is_seed` is a compliance control, not a convenience. The launch checklist has a hard gate on
`SELECT count(*) FROM reviews WHERE is_seed` returning 0.

---

## 8. `tracking_events`

Audit log for server-side CAPI calls. Without this, debugging a match-quality problem is guesswork.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders ON DELETE SET NULL NULL | |
| `event_id` | varchar(64) NOT NULL | The dedup id |
| `event_name` | varchar(40) NOT NULL | `Purchase`, `InitiateCheckout`, … |
| `platform` | enum `ad_platform` NOT NULL | `meta` \| `tiktok` \| `snap` |
| `status` | varchar(20) NOT NULL | `success` \| `failed` \| `skipped_no_credentials` |
| `http_status` | smallint NULL | |
| `request_payload` | jsonb NULL | **Hashed identifiers only — never raw PII** |
| `response_body` | jsonb NULL | Truncated |
| `error` | text NULL | |
| `attempts` | smallint NOT NULL DEFAULT 1 | |
| `created_at` | timestamptz | |

Index: `(order_id)`, `(platform, status, created_at DESC)`, `(event_id)`.

**Never store the raw phone or name in `request_payload`.** Store the hashed values that were
actually sent. Retain for 90 days, then purge (`29`).

---

## 9. `contact_messages`

| Column | Type |
|---|---|
| `id` | uuid PK |
| `name` | varchar(60) NOT NULL |
| `phone_national` | varchar(9) NOT NULL |
| `phone_e164` | varchar(16) NOT NULL |
| `subject` | varchar(40) NOT NULL |
| `message` | text NOT NULL |
| `client_ip` | inet NULL |
| `handled` | boolean NOT NULL DEFAULT false |
| `sheet_synced_at` | timestamptz NULL |
| `created_at` | timestamptz |

---

## 10. `settings`

Key/value configuration changeable without a deploy.

| Column | Type |
|---|---|
| `key` | varchar(60) PK |
| `value` | text NOT NULL |
| `value_type` | varchar(20) NOT NULL — `int` \| `str` \| `bool` \| `json` |
| `description_ar` | text |
| `updated_at` | timestamptz |

Seeded keys:

| Key | Default | Purpose |
|---|---|---|
| `upsell_price_sar` | `99` | `08` §3 |
| `upsell_window_seconds` | `15` | `16` §8 |
| `shipping_sar` | `0` | Set to the real fee if shipping is not free |
| `free_shipping_threshold_sar` | `0` | 0 = always free |
| `live_activity_min_display` | `3` | Hide the live counter below this (`18` §2) |
| `whatsapp_number` | `TODO` | |
| `confirmation_window_hours` | `24` | Shown on the thank-you page |
| `delivery_days_min` / `_max` | `2` / `4` | Shown across the site |

Reading settings goes through a small cached accessor (60s TTL) so it is not a database hit per
request.

---

## 11. Migrations

- Alembic, autogenerate then **always hand-review** the generated revision. Autogenerate misses
  enum changes, partial indexes, and check constraints.
- One logical change per revision, with a descriptive slug.
- Every revision must have a working `downgrade()`.
- `alembic upgrade head` runs in the container entrypoint (`20` §4, `26` §4).
- Enums are created explicitly (`sa.Enum(..., name='order_status', create_type=True)`) — Postgres
  enums are not automatically diffed by autogenerate.
- Use `gen_random_uuid()` (built into Postgres 13+ via `pgcrypto`/core); the first migration
  should `CREATE EXTENSION IF NOT EXISTS pgcrypto` to be safe.

---

## 12. Seeding

`app/seed.py`, idempotent, runs on every boot:

1. Upsert the 3 products by `slug` from the values in `assets/products-seed.csv`
2. Upsert 3 offers per product by `(product_id, qty)`, marking `qty = 2` as `is_default`
3. Upsert the settings keys in §10, **without overwriting values already changed in production**
   (insert-if-absent, not update)
4. Insert seed reviews from `assets/reviews-seed.csv` with `is_seed = true`, **only when
   `ENV != 'production'` or the reviews table is empty**

That third rule matters: a naive seed that overwrites settings on every deploy will silently
revert an ops change to the upsell price.

---

## 13. Retention and privacy

Per `29` and the privacy policy:

| Data | Retention |
|---|---|
| Orders | 5 years (commercial/tax records) |
| Leads not converted | 12 months, then delete |
| `tracking_events` | 90 days, then purge |
| Contact messages | 24 months |
| `client_ip` / `user_agent` on orders | 12 months, then null out (keep the order) |

Implement as a scheduled cleanup — a simple `POST /api/admin/cleanup` endpoint guarded by
`ADMIN_TOKEN` and called by an external cron is sufficient in v1.
