# 27 — Environment Variable Reference

Every variable, where to get it, and what breaks without it. This is what the owner pastes into
EasyPanel.

**Two golden rules**

1. **`NEXT_PUBLIC_*` is public.** It is inlined into the browser bundle and anyone can read it.
   Pixel IDs belong there. **Access tokens never do.**
2. **`NEXT_PUBLIC_*` is needed at BUILD time**, not just runtime. In EasyPanel they must be set as
   *build arguments* as well as environment variables (`26` §2.1). This is the most common
   deployment mistake on this stack.

---

## 1. Frontend — `frontend/.env.example`

| Variable | Required | Example | Where to get it | If missing |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.osool.shop` | Your backend domain | Every API call fails; no products render |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://osool.shop` | Your frontend domain | Broken canonical URLs, OG images, sitemap |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ | `966551234567` | The business WhatsApp number, **digits only, no `+`** | WhatsApp buttons produce dead links |
| `NEXT_PUBLIC_META_PIXEL_ID` | ⬜ | `1234567890123456` | Meta Events Manager → Data Sources → your pixel | Meta pixel does not load (site still works) |
| `NEXT_PUBLIC_TIKTOK_PIXEL_CODE` | ⬜ | `CXXXXXXXXXXXXXXXXX` | TikTok Ads Manager → Assets → Events → Web Events → Pixel overview | TikTok pixel does not load |
| `NEXT_PUBLIC_SNAP_PIXEL_ID` | ⬜ | `783c04c9-cd00-485a-ab54-02f0832dfc24` | Snapchat Ads Manager → Events Manager → your pixel | Snap pixel does not load |
| `NEXT_PUBLIC_ENV` | ⬜ | `production` | — | Defaults to `development`; test-mode banners may show |
| `NEXT_PUBLIC_GTM_ID` | ⬜ | — | Not used in v1 (`19` §1) | — |
| `MAXMIND_ACCOUNT_ID` | ✅ for prod | numeric account id | MaxMind account → Account / License Key | Geo/VPN gate on `POST /api/orders` disabled (warn in logs) |
| `MAXMIND_LICENSE_KEY` | ✅ for prod | license key | Same page (also accepts alias `MAXMIND_API_KEY`) | Same as above |
| `ORDER_PHONE_WHITELIST` | ⬜ | `500000102` | Extra national phones that skip the geo gate. `0500 00 0102` → `500000102` is always whitelisted. | Only the hard-coded test number bypasses |

**Server-only:** `MAXMIND_*` must never be `NEXT_PUBLIC_*`. Set them as EasyPanel runtime env on the frontend service (orders API runs there today).

Optional variables are genuinely optional: the site must build, deploy, and sell perfectly with all
three pixel IDs absent (`23` §3).

---

## 2. Backend — `backend/.env.example`

### 2.1 Core

| Variable | Required | Example | Notes |
|---|---|---|---|
| `ENV` | ✅ | `production` | Controls whether `/docs` is exposed and whether seed reviews are inserted |
| `DATABASE_URL` | ✅ | `postgres://osool:osool@osool_database:5432/osool?sslmode=disable` | **Paste the EasyPanel internal URL verbatim.** The app converts the scheme and strips `sslmode` itself (`20` §3). |
| `CORS_ORIGINS` | ✅ | `https://osool.shop,https://www.osool.shop` | Comma-separated. **Never `*`** — a wildcard lets any site post orders. |
| `ADMIN_TOKEN` | ✅ | `openssl rand -hex 32` | Guards `/api/admin/*`. Rotate if leaked. |
| `LOG_LEVEL` | ⬜ | `INFO` | `DEBUG` locally |

### 2.2 Google Sheets

| Variable | Required | Example | Notes |
|---|---|---|---|
| `SHEETS_WEBHOOK_URL` | ⬜ | `https://script.google.com/macros/s/AKfyc…/exec` | From the Apps Script deployment (`25` §4 step 11) |
| `SHEETS_WEBHOOK_SECRET` | ⬜ | `openssl rand -hex 24` | Must **exactly** match `SECRET` in the Apps Script |

If absent, orders still save to Postgres and can be resynced later with
`POST /api/admin/resync-all`. But without it **the confirmation team never sees the orders**, so
treat it as effectively required for launch.

### 2.3 Meta Conversions API

| Variable | Required | Example | Where to get it |
|---|---|---|---|
| `META_PIXEL_ID` | ⬜ | `1234567890123456` | Same value as `NEXT_PUBLIC_META_PIXEL_ID` |
| `META_CAPI_ACCESS_TOKEN` | ⬜ | `EAAG…` (long) | Events Manager → your pixel → Settings → Conversions API → **Generate access token** |
| `META_TEST_EVENT_CODE` | ⬜ | `TEST12345` | Events Manager → Test Events tab. **Remove for production** or events never reach optimisation (`24` §4). |
| `META_API_VERSION` | ⬜ | `v21.0` | Pin it; do not track "latest" |

### 2.4 TikTok Events API

| Variable | Required | Example | Where to get it |
|---|---|---|---|
| `TIKTOK_PIXEL_CODE` | ⬜ | `CXXXXXXXXXXXXXXXXX` | Same as `NEXT_PUBLIC_TIKTOK_PIXEL_CODE` |
| `TIKTOK_CAPI_ACCESS_TOKEN` | ⬜ | long string | Ads Manager → Assets → Events → Web Events → your pixel → **Settings → Events API → Generate access token**. Copy it immediately; it is shown once. |
| `TIKTOK_TEST_EVENT_CODE` | ⬜ | `TEST12345` | Remove for production |

### 2.5 Snapchat Conversions API

| Variable | Required | Example | Where to get it |
|---|---|---|---|
| `SNAP_PIXEL_ID` | ⬜ | `783c04c9-cd00-485a-ab54-02f0832dfc24` | Same as `NEXT_PUBLIC_SNAP_PIXEL_ID` |
| `SNAP_CAPI_ACCESS_TOKEN` | ⬜ | long string | Snapchat Business Manager → Business Details → Conversions API token |
| `SNAP_TEST_EVENT_CODE` | ⬜ | `TEST12345` | Remove for production |

### 2.6 Commerce settings

These have database defaults in `settings` (`21` §10). The env values seed them on first boot only
and do **not** override values later changed in the database — so ops can adjust the upsell price
without a redeploy.

| Variable | Default | Notes |
|---|---|---|
| `UPSELL_PRICE_SAR` | `99` | The only discounted price on the site (`08` §3) |
| `UPSELL_WINDOW_SECONDS` | `15` | 10–15 per the brief; 15 is recommended |
| `SHIPPING_SAR` | `0` | Set to the real fee if delivery is not free |
| `FREE_SHIPPING_THRESHOLD_SAR` | `0` | `0` = always free |
| `DELIVERY_DAYS_MIN` | `2` | Displayed across the site |
| `DELIVERY_DAYS_MAX` | `4` | |
| `CONFIRMATION_WINDOW_HOURS` | `24` | Shown on the thank-you page |
| `WHATSAPP_NUMBER` | — | Digits only, no `+` |
| `LIVE_ACTIVITY_MIN_DISPLAY` | `3` | Below this the live counter is hidden (`18` §2) |

---

## 3. Values the owner must supply before launch

Everything marked `TODO: owner to supply` in the codebase. Collect these in one go:

| Item | Needed for | Legal requirement? |
|---|---|---|
| Legal entity name (Arabic + English) | Footer, terms, invoices | ✅ KSA E-Commerce Law |
| Commercial Register (CR) number | Footer, terms | ✅ |
| VAT registration number (if registered) | Footer, invoices | ✅ if registered |
| Registered address | Footer, contact page | ✅ |
| Business phone | Contact page | ✅ |
| Business email | Contact page, privacy policy | ✅ |
| WhatsApp business number | ~12 places on the site | — |
| SFDA notification numbers per product | About page, product pages | ✅ |
| **SFDA supplement registration for the iron tonic** | Legal to sell at all | ✅ **See `07` §2 — different path from the cosmetics** |
| Supplier INCI lists (all 3 products) | Ingredient panels, "free from" claims | ✅ |
| Actual concentrations confirmed by supplier | Every claim on the site | ✅ |
| Real product photography | Replaces placeholders (`31`) | — |
| Real reviews / UGC | Replaces seeds (`07` §6) | ✅ (fake reviews are prohibited) |
| Delivery partner + real delivery windows | Shipping policy, site copy | ✅ |
| Whether shipping is genuinely free | Multiple copy strings | ✅ (total price disclosure) |
| Actual return-shipping cost bearer | Returns policy | ✅ |
| Founder name/story (optional) | About page | — |
| Instagram / TikTok / Snapchat handles | Footer | — |

---

## 4. `frontend/.env.example` (file contents)

```env
# ─── أصول / OSOOL — Frontend ────────────────────────────────────────
# Copy to .env.local for local dev.
# In EasyPanel, set these as BUILD ARGUMENTS as well as environment
# variables — NEXT_PUBLIC_* is inlined at build time. See docs/26 §2.1.

# ── Required ──
NEXT_PUBLIC_API_URL=https://api.osool.shop
NEXT_PUBLIC_SITE_URL=https://osool.shop
# Digits only, no + and no spaces
NEXT_PUBLIC_WHATSAPP_NUMBER=9665XXXXXXXX

# ── Ad pixels (optional — site works without them) ──
# Meta Events Manager → Data Sources → Pixel ID
NEXT_PUBLIC_META_PIXEL_ID=
# TikTok Ads Manager → Assets → Events → Web Events → Pixel Code (C…)
NEXT_PUBLIC_TIKTOK_PIXEL_CODE=
# Snapchat Events Manager → Pixel ID (uuid)
NEXT_PUBLIC_SNAP_PIXEL_ID=

# ── Misc ──
NEXT_PUBLIC_ENV=production

# ── MaxMind GeoIP Insights (server-only — NEVER use NEXT_PUBLIC_*) ──
MAXMIND_ACCOUNT_ID=
MAXMIND_LICENSE_KEY=
# MAXMIND_API_KEY=
# ORDER_PHONE_WHITELIST=
```

## 5. `backend/.env.example` (file contents)

```env
# ─── أصول / OSOOL — Backend ─────────────────────────────────────────
# Copy to .env for local dev. NEVER commit a filled-in .env.

# ── Core ──
ENV=production
LOG_LEVEL=INFO
# Paste the EasyPanel internal Postgres URL EXACTLY as given.
# The app converts postgres:// → postgresql+asyncpg:// and strips
# sslmode itself (asyncpg does not accept it). See docs/20 §3.
DATABASE_URL=postgres://osool:osool@osool_database:5432/osool?sslmode=disable
# Comma-separated. NEVER use *.
CORS_ORIGINS=https://osool.shop,https://www.osool.shop
# openssl rand -hex 32
ADMIN_TOKEN=

# ── Google Sheets webhook (docs/25) ──
SHEETS_WEBHOOK_URL=
# Must match SECRET inside the Apps Script exactly. openssl rand -hex 24
SHEETS_WEBHOOK_SECRET=

# ── Meta Conversions API (docs/24 §4) ──
META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_API_VERSION=v21.0
# Leave EMPTY in production, or events land in the test stream only.
META_TEST_EVENT_CODE=

# ── TikTok Events API 2.0 (docs/24 §5) ──
TIKTOK_PIXEL_CODE=
TIKTOK_CAPI_ACCESS_TOKEN=
TIKTOK_TEST_EVENT_CODE=

# ── Snapchat Conversions API v3 (docs/24 §6) ──
SNAP_PIXEL_ID=
SNAP_CAPI_ACCESS_TOKEN=
SNAP_TEST_EVENT_CODE=

# ── MaxMind GeoIP Insights ──
MAXMIND_ACCOUNT_ID=
MAXMIND_LICENSE_KEY=
# MAXMIND_API_KEY=
# ORDER_PHONE_WHITELIST=

# ── Commerce settings (seed DB defaults on first boot only) ──
UPSELL_PRICE_SAR=99
UPSELL_WINDOW_SECONDS=15
SHIPPING_SAR=0
FREE_SHIPPING_THRESHOLD_SAR=0
DELIVERY_DAYS_MIN=2
DELIVERY_DAYS_MAX=4
CONFIRMATION_WINDOW_HOURS=24
LIVE_ACTIVITY_MIN_DISPLAY=3
WHATSAPP_NUMBER=9665XXXXXXXX
```

---

## 6. Validation on boot

`pydantic-settings` must **fail loudly** if a required variable is missing, printing which one:

```
[osool] FATAL: DATABASE_URL is required but not set.
```

Optional-but-important variables produce a warning, not a failure:

```
[osool] WARN: SHEETS_WEBHOOK_URL not set — orders will not reach Google Sheets.
[osool] WARN: META_CAPI_ACCESS_TOKEN not set — Meta server events disabled.
[osool] WARN: TIKTOK_CAPI_ACCESS_TOKEN not set — TikTok server events disabled.
[osool] WARN: SNAP_CAPI_ACCESS_TOKEN not set — Snapchat server events disabled.
```

These warnings are the fastest way to diagnose "why is my ROAS reporting empty" after a deploy —
make sure they are printed at startup and easy to find in the EasyPanel log view.

---

## 7. Secret-handling rules

| Rule | Why |
|---|---|
| Never put a token in `NEXT_PUBLIC_*` | It ships to every browser. A leaked CAPI token lets anyone write fake conversions into your ad account, which corrupts optimisation and can burn the budget. |
| Never commit `.env` | Only `.env.example` with empty or placeholder values |
| Never log a token, even at DEBUG | Redact `Access-Token`, `access_token`, and `Authorization` in the log formatter |
| Never return a token from any endpoint | `/api/settings/public` returns display values only (`22` §4) |
| Rotate on staff change | `ADMIN_TOKEN`, `SHEETS_WEBHOOK_SECRET`, all three CAPI tokens |
| Scrub PII in Sentry | Drop `phone`, `customer_name`, and auth headers before send |
