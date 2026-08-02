# 25 — Google Sheets Webhook (Order Delivery)

Google Sheets is the **operations surface** for v1: the confirmation team works from it, not from
an admin panel. Postgres remains the system of record; the Sheet is a mirror optimised for humans
making phone calls.

Ready-to-paste script: **`reference/apps-script-webhook.gs.js`**
Column templates: **`assets/orders-sheet-template.csv`**, `assets/leads-sheet-template.csv`,
`assets/messages-sheet-template.csv`

---

## 1. Architecture

```
FastAPI (order committed)
   └─ BackgroundTasks → POST {SHEETS_WEBHOOK_URL}
                          header: X-Osool-Secret: {SHEETS_WEBHOOK_SECRET}
                          body:   { type, secret, payload }
                             ↓
                     Google Apps Script Web App (doPost)
                             ↓
                     Google Sheet: Orders | Leads | Messages | Dashboard
```

Why Apps Script rather than the Sheets API with a service account: no OAuth, no credential file
in the container, no Google Cloud project, and the owner can edit the script themselves. The
trade-off is a shared-secret rather than signed requests — acceptable because the payload contains
no payment data and the endpoint only appends rows.

---

## 2. Sheet structure

Four tabs. Create them with these **exact** names — the script looks them up by name.

| Tab | Purpose |
|---|---|
| `Orders` | One row per order. Updated in place when the upsell is accepted or status changes. |
| `Leads` | Abandoned checkouts with a valid phone (`16` §7.1). Directly callable. |
| `Messages` | Contact-form submissions. |
| `Dashboard` | Formula-only summary. The script never writes here. |

### 2.1 `Orders` columns

Column order is contractual — the script writes by index. Adding a column in the middle breaks it.

| # | Header (Arabic) | Key | Notes |
|---|---|---|---|
| A | التاريخ والوقت | `created_at_riyadh` | Formatted `yyyy-MM-dd HH:mm`, **Asia/Riyadh** |
| B | رقم الطلب | `order_number` | `OS-10428` |
| C | الاسم | `customer_name` | |
| D | رقم الجوال | `phone_display` | `0551234567` — text-formatted so the leading zero survives |
| E | واتساب | `whatsapp_link` | `=HYPERLINK("https://wa.me/966…","اتصال")` — one click to message her |
| F | المنتجات | `items_summary` | «سيروم الأصول ×2 · مقشّر الأصول ×1» |
| G | عدد القطع | `total_units` | For picking |
| H | الإجمالي | `total_sar` | Number |
| I | العرض الإضافي | `upsell_status` | «قبلت (99)» / «رفضت» / «انتهى الوقت» |
| J | الحالة | `status` | **Data-validation dropdown** — see §2.2 |
| K | ملاحظات | `notes` | Free text for the confirmation agent |
| L | المدينة | `city` | Blank on arrival; the agent fills it from the call |
| M | العنوان | `address` | Blank on arrival; filled from the call |
| N | تاريخ التأكيد | `confirmed_at` | Agent fills |
| O | تاريخ التوصيل | `delivered_at` | Agent fills |
| P | المصدر | `utm_source` | `snapchat` / `tiktok` |
| Q | الحملة | `utm_campaign` | |
| R | الإعلان | `utm_content` | Which creative — the most useful column for media buying |
| S | تنبيه | `risk_flag` | `suspicious_phone` etc. Conditional-formatted red. |
| T | معرّف الطلب | `order_id` | UUID — the join key back to Postgres. Keep it, hide the column. |

### 2.2 `Status` dropdown values

Must match `order_status` in `21` §4.1 so the two systems stay reconcilable:

`جديد` · `مؤكد` · `مشحون` · `تم التوصيل` · `ما رد` · `ملغي` · `مرتجع`

Store the Arabic label in the Sheet and map it back to the enum in the resync endpoint.

### 2.3 `Leads` columns

`التاريخ` · `الاسم` · `رقم الجوال` · `واتساب` · `السلة` · `قيمة السلة` · `المصدر` · `الحملة` ·
`حالة المتابعة` (dropdown: `جديد` / `تم التواصل` / `تحوّل لطلب` / `فقدنا`) · `معرّف` 

### 2.4 `Messages` columns

`التاريخ` · `الاسم` · `رقم الجوال` · `واتساب` · `الموضوع` · `الرسالة` · `تم الرد` (checkbox)

### 2.5 `Dashboard`

Formulas only, no script writes. Suggested cells:

| Metric | Formula sketch |
|---|---|
| طلبات اليوم | `COUNTIFS(Orders!A:A,">="&TODAY())` |
| إجمالي اليوم | `SUMIFS(Orders!H:H,Orders!A:A,">="&TODAY())` |
| متوسط قيمة الطلب | `AVERAGE(Orders!H:H)` |
| نسبة التأكيد | `COUNTIF(Orders!J:J,"مؤكد")+COUNTIF(Orders!J:J,"مشحون")+COUNTIF(Orders!J:J,"تم التوصيل")` ÷ total |
| نسبة قبول العرض الإضافي | `COUNTIF(Orders!I:I,"قبلت*")` ÷ total |
| الطلبات حسب المصدر | `QUERY` / pivot on column P |
| أفضل إعلان | pivot on column R by revenue |

---

## 3. Request format

The backend sends a single POST per event.

```http
POST https://script.google.com/macros/s/AKfyc…/exec
Content-Type: application/json
X-Osool-Secret: {SHEETS_WEBHOOK_SECRET}

{
  "type": "order.created",
  "secret": "{SHEETS_WEBHOOK_SECRET}",
  "payload": {
    "order_id": "0f8fad5b-d9cb-469f-a165-70867728950e",
    "order_number": "OS-10428",
    "created_at": "2026-07-30T09:41:12Z",
    "customer_name": "نورة العتيبي",
    "phone_national": "551234567",
    "phone_display": "0551234567",
    "phone_e164": "+966551234567",
    "items_summary": "سيروم الأصول ×2",
    "total_units": 2,
    "subtotal_sar": 279,
    "shipping_sar": 0,
    "total_sar": 279,
    "upsell_status": "معروض",
    "status": "جديد",
    "utm_source": "snapchat",
    "utm_campaign": "serum-cold-01",
    "utm_content": "ugc-3",
    "risk_flag": null
  }
}
```

`type` is one of:

| `type` | Behaviour in the script |
|---|---|
| `order.created` | Append a row to `Orders` |
| `order.updated` | **Find the row by `order_id` and update in place** — used after the upsell |
| `lead.captured` | Append or update in `Leads` (matched on phone) |
| `message.received` | Append to `Messages` |

The secret is sent **both** as a header and in the body, because Apps Script web apps do not
reliably expose custom request headers in all deployment configurations. The script checks the
body value and treats the header as a bonus.

---

## 4. Deployment steps (for the owner)

1. Create a new Google Sheet named **`Osool — Orders`**.
2. Create four tabs named exactly `Orders`, `Leads`, `Messages`, `Dashboard`.
3. Paste the header rows from `assets/*.csv` into row 1 of each tab.
4. Select column **D** in `Orders` → Format → Number → **Plain text**. *(Without this, Sheets
   strips the leading zero from `0551234567` and every number in the sheet is wrong.)*
5. Set the spreadsheet timezone: File → Settings → Time zone → **(GMT+03:00) Riyadh**.
6. Add data validation on `Orders!J2:J` with the seven status values from §2.2.
7. Extensions → **Apps Script**. Delete the placeholder and paste
   `reference/apps-script-webhook.gs.js`.
8. In the script, set `SECRET` to a long random string (generate with `openssl rand -hex 24`).
9. Save, then **Deploy → New deployment → Web app**:
   - Description: `Osool webhook v1`
   - Execute as: **Me**
   - Who has access: **Anyone**  ← required; the secret is what provides authorisation
10. Authorise when prompted (Google will warn about an unverified app — this is expected for your
    own script; choose Advanced → Go to project).
11. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).
12. In EasyPanel, set the backend environment variables:
    - `SHEETS_WEBHOOK_URL` = the Web app URL
    - `SHEETS_WEBHOOK_SECRET` = the same secret from step 8
13. Redeploy the backend and place a test order. A row must appear in `Orders`.

> **Every time you edit the script you must create a NEW deployment version** (Deploy → Manage
> deployments → edit → New version). Saving alone does not update the live web app. This trips up
> everyone at least once.

---

## 5. Update semantics for the upsell

When the upsell is accepted, the backend sends `order.updated` — **not** a second
`order.created`. Two rows for one order would corrupt every dashboard metric and cause the
confirmation team to call the same customer twice.

The script finds the row by `order_id` in column T:

```js
function findRowByOrderId(sheet, orderId) {
  const ids = sheet.getRange('T2:T').getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === orderId) return i + 2;   // 1-indexed + header row
  }
  return -1;
}
```

If the row is not found (e.g. the create webhook failed but the upsell one succeeded), the script
**appends** the row instead of silently dropping the update, and sets `risk_flag` to
`sheet_out_of_order` so it is visible.

---

## 6. Reliability

The Sheets push is best-effort and must never affect the customer's experience.

| Concern | Handling |
|---|---|
| Push fails | 3 retries with backoff inside the background task (`20` §6). `orders.sheet_synced_at` stays null. |
| Persistent failure | The order is still in Postgres. `POST /api/admin/resync/{order_id}` replays it. |
| Bulk backfill | A partial index on `WHERE sheet_synced_at IS NULL` (`21` §4) makes finding unsynced orders trivial. Add a `POST /api/admin/resync-all` guarded by `ADMIN_TOKEN`. |
| Apps Script quotas | Consumer Google accounts allow ~20,000 URL-fetch calls and 90 minutes of script runtime per day. Our volume is far below this. If it is ever approached, batch pushes every 60 seconds instead of per-order. |
| Duplicate pushes | The script checks for an existing `order_id` before appending on `order.created` too, making the whole pipeline idempotent. |
| Sheet grows large | Above ~20,000 rows Sheets gets slow. Archive completed months to a separate spreadsheet quarterly. |

**Monitoring:** the readiness endpoint should surface a count of orders with
`sheet_synced_at IS NULL AND created_at < now() - interval '15 minutes'`. If that number is
non-zero, the pipeline is broken and orders are not reaching the confirmation team — which is a
revenue emergency, not a logging detail.

---

## 7. What must never go in the Sheet

- Full unmasked data beyond what the confirmation team needs to do the job
- `client_ip`, `user_agent`, raw attribution JSON blobs
- Hashed identifiers or `event_id`s
- Any CAPI access token or secret
- Payment data (there is none — COD)

The Sheet is shared with delivery/confirmation staff. Treat it as a semi-public surface and
disclose it in the privacy policy as a third-party processor (`07` §8, `29`).
