# 01 — Project Overview

## 1. The business in one paragraph

أصول (Osool) is a Saudi-branded hair and scalp line. We sell three focused products that
address the three real causes of a Saudi woman's hair loss: follicle signalling (serum),
internal iron status (tonic), and scalp barrier/build-up (exfoliant). We buy attention with
paid short-form video on Snapchat and TikTok, and convert it on our own store at 199–349 SAR
per order with cash on delivery. The products are sourced (dropshipped), so our defensible
asset is the brand, the positioning, and the conversion machine — not the supply chain.

## 2. Why this can command a premium price

The same physical product sells for 39 SAR on a marketplace and 199 SAR on a branded store.
The delta is not the product. It is:

| Lever | What it does | Where it lives |
|---|---|---|
| **Category framing** | We are not "a hair serum". We are a *scalp-and-roots system* with a protocol. Systems justify system pricing. | `04` |
| **Named, dosed actives** | "Redensyl 3%", "salicylic acid 2%", "iron bisglycinate" — specificity reads as competence. Vague products read as cheap. | `06` |
| **Visible evidence trail** | Ingredient studies cited with real numbers and honest limits. Sceptics convert on transparency, not hype. | `06`, `07` |
| **Diagnostic experience** | A short "which أصول do I need" flow makes the purchase feel prescribed, not impulsive. | `11` |
| **Brand surface quality** | Typography, spacing, photography discipline, Arabic that sounds native. Cheap design caps price. | `02`, `10` |
| **Social proof density** | Volume + specificity + faces + timelines. Saudi women buy what Saudi women vouch for. | `18` |
| **Risk reversal** | COD already removes payment risk. A clear guarantee removes outcome risk. | `18` |

**Corollary:** every time the AI coder is tempted to ship a generic e-commerce component, it
costs real money. The visual and copy quality bar *is* the pricing power.

## 3. Unit economics model (planning assumptions)

Fill real numbers in as they arrive; these are the model the site is designed against.

```
Offer ladder:          199 SAR (1)  /  279 SAR (2)  /  349 SAR (3)
Post-checkout upsell:   99 SAR (1 unit of a complementary product)
Target AOV:            270–300 SAR
COGS per unit:         ~25–40 SAR (sourced)
COD fee + shipping:    ~20–30 SAR per delivered order
Confirmation rate:     55–75% of submitted orders (phone reachability)
Delivery rate:         80–90% of confirmed orders
Effective revenue:     AOV x confirmation x delivery
```

Two consequences that drive the whole design:

1. **AOV is the primary lever, not conversion rate.** A 2-piece offer at 279 beats two
   separate 199 orders on margin *and* on delivery cost. Hence: bundle-first offer selector,
   cart cross-sell, and a post-checkout upsell. See `08`.
2. **A submitted order is not revenue — a *confirmed* one is.** Therefore the site must
   collect a *real, reachable* number and set correct expectations about the confirmation
   call. Every anti-fraud and expectation-setting detail in `16`, `17`, and `30` is a margin
   feature, not a nicety.

## 4. Success metrics

| Metric | Target at launch | Notes |
|---|---|---|
| Product page → Add to cart | ≥ 12% | Cold paid traffic, mobile |
| Add to cart → Checkout opened | ≥ 55% | Cart drawer must not leak |
| Checkout opened → Order submitted | ≥ 45% | Two fields only; friction is the enemy |
| Overall visit → Order submitted | ≥ 3.0% | Snap/TikTok cold traffic |
| Upsell take rate (99 SAR) | ≥ 18% | Timed, single-product, one click |
| Multi-unit share of orders | ≥ 45% | 2- or 3-piece offers |
| AOV | ≥ 270 SAR | |
| Confirmation rate | ≥ 65% | Ops + phone quality |
| LCP (mobile, p75) | ≤ 2.5s | See `28` |
| CAPI event match quality | "Good" or better in each platform | See `24` |

## 5. Scope

**In scope for v1**

- Home, collection, 3 product pages, about, contact, 4 legal pages, thank-you
- Cart drawer with cross-sell, checkout modal, timed post-checkout upsell
- Orders to Postgres + Google Sheets webhook
- Meta / TikTok / Snapchat web pixels + server-side CAPI with dedup
- Full Arabic RTL, responsive, placeholder imagery
- Docker for both apps, `.env.example` for both, migrations on backend boot

**Explicitly out of scope for v1**

- User accounts, login, order-status portal (thank-you page + WhatsApp is enough)
- Online payment gateway (COD only), Tabby/Tamara
- Multi-language / English storefront
- Blog / CMS (product content is code-managed for now; the schema leaves room)
- Admin dashboard (Google Sheets is the ops surface for v1; Postgres is the record)
- Email marketing (there is no email field — phone only, by design)

**Deliberately deferred but designed for**

- `orders.status` lifecycle so an admin panel can be added without migration pain
- `abandoned_carts` capture so a recovery flow can be layered on
- `products` / `variants` in the database rather than hardcoded, so a 4th product is a row

## 6. Constraints and given facts

- Domain: `osool.shop` (frontend), `api.osool.shop` (backend)
- Host: EasyPanel, Postgres already provisioned
- Internal DB URL shape: `postgres://osool:osool@osool_database:5432/osool?sslmode=disable`
  (the app must convert this to the SQLAlchemy/psycopg form — see `27`)
- DB name / user: `osool`
- Currency: SAR only. Prices are integers, no decimals shown.
- Payment: COD only
- Country: Saudi Arabia only. Phone validation is KSA-specific.
- Language: Arabic (Saudi dialect), RTL

## 7. Risks and how the build mitigates them

| Risk | Mitigation | Doc |
|---|---|---|
| Fake / mistyped phone numbers kill margin | Strict KSA normalisation + validation, submit disabled until valid, confirmation-call expectation set on thank-you page | `16`, `17` |
| Regulatory trouble from over-claiming | Claims matrix with allowed/banned phrasing; the iron tonic is a **supplement**, not a cosmetic, and has stricter rules | `07` |
| Pixels slow the site and lose the auction | All pixels deferred post-interaction/idle; CAPI carries the load | `23`, `28` |
| Duplicate or missing conversions distort optimisation | One `event_id` minted per user action, shared browser↔server, verified per platform | `23`, `24` |
| Cheap-looking store caps price | Design system with strict tokens; no ad-hoc styling | `10` |
| Arabic copy reading as translated | Dialect guide with banned MSA-isms and approved phrasings | `05` |
