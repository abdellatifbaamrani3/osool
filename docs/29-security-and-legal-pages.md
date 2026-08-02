# 29 — Security, Privacy, and Legal Pages

---

# Part A — Application security

## 1. Threat model

We hold no payment data (COD) and no passwords (no accounts). The real risks are:

| Risk | Impact | Control |
|---|---|---|
| **Price tampering** | Orders at 1 SAR | Server recomputes all prices; the request contains no prices at all (§2) |
| **Fake/spam orders** | Wasted shipping, poisoned data, burned ad optimisation | Validation, rate limits, honeypot, risk flags (§3) |
| **PII exposure** | Legal exposure under PDPL, reputational damage | Minimal collection, no PII in logs, display-safe endpoints (§4) |
| **Leaked CAPI token** | Attacker writes fake conversions into the ad account, corrupting optimisation and burning budget | Tokens backend-only, never in `NEXT_PUBLIC_*`, never logged (§5) |
| **Order enumeration** | Reading other customers' orders | UUID order ids, display-safe summary endpoint (§4) |
| **Open CORS** | Any site can post orders | Explicit origin allowlist (§6) |

## 2. Price integrity — the most important control

> The order request body contains **no prices**. Only `product_id`, `offer_id`, and `qty`. The
> server looks up the authoritative price from the `offers` table.

This makes tampering structurally impossible rather than something we validate against. Full
implementation in `22` §14.

Corollaries:

- The upsell price comes from `settings.upsell_price_sar`, not from the request
- Shipping comes from settings, not from the request
- The cart's denormalised prices in `localStorage` are display-only and are never trusted
- A stale cart from before a price change gets the current price, and the checkout summary is
  rendered from the server's computed response

## 3. Abuse prevention

| Control | Configuration |
|---|---|
| Rate limits (per IP) | `POST /api/orders` 5/hr, 20/day · `POST /api/leads` 20/hr · `POST /api/contact` 5/hr · `GET` endpoints 120/min |
| Honeypot | Hidden field on the checkout and contact forms; must be empty → 422 |
| Timing check | Submission < 2s after modal open → `risk_flag = 'too_fast'` (flag, do not block) |
| Phone pattern check | Repeated/sequential digits → `risk_flag = 'suspicious_phone'` |
| Duplicate detection | Same phone + same total within 10 min → return the existing order |
| Idempotency | `Idempotency-Key` required on order creation (`22` §13) |
| Payload limits | Max body 32KB; name ≤ 60, message ≤ 1000, ≤ 10 lines per order, qty ≤ 10 |
| Input sanitisation | Pydantic constrained types; reject `<`/`>` in the name field |
| No CAPTCHA in v1 | It depresses conversions; the honeypot + rate limit is proportionate at this volume |

**Guiding rule:** never block a real customer to stop a fake one. Every control above is either a
hard validation that a genuine Saudi mobile always passes, or a flag for human triage — never a
silent rejection of a real order.

## 4. PII handling

**What we collect:** name, mobile number, IP address, user agent, ad click identifiers, and
behavioural events. No email, no address (collected verbally on the call), no payment data.

| Rule | Implementation |
|---|---|
| Never log PII | Log the order id, never `customer_name` or the phone. Configure the log formatter to redact. |
| Never store raw PII in tracking audit | `tracking_events.request_payload` stores the **hashed** values that were sent (`21` §8) |
| Display-safe endpoints only | `/api/orders/{id}/summary` returns a masked phone and no IP/UA/attribution (`22` §8) |
| Unguessable identifiers | `orders.id` is a UUIDv4; the sequential `order_number` is display-only |
| Retention limits | Per `21` §13 — leads 12 months, tracking events 90 days, IP/UA nulled at 12 months |
| Sentry scrubbing | Drop `phone`, `customer_name`, `Authorization`, `Access-Token`, `access_token` before send |
| Sheet minimalism | Only what the confirmation team needs (`25` §7) |

**Saudi PDPL.** The Personal Data Protection Law applies. Our lawful basis for order processing is
contract performance; for advertising measurement it is legitimate interest with disclosure. The
privacy policy must specifically name Meta, TikTok, Snapchat, and Google as recipients, describe
that **hashed** identifiers are shared with the ad platforms, state retention periods, and give a
contact route for access/deletion requests. Honour deletion requests: build
`POST /api/admin/erase` (guarded by `ADMIN_TOKEN`) that nulls PII on a customer's orders while
retaining the anonymised commercial record.

## 5. Secrets

- CAPI access tokens, `ADMIN_TOKEN`, and `SHEETS_WEBHOOK_SECRET` exist **only** in backend env
- Pixel **IDs** are public and belong in `NEXT_PUBLIC_*`; **tokens never do** (`27` §7)
- No secret is ever returned by any endpoint, including `/api/settings/public`
- No secret appears in any log line, error message, or exception breadcrumb
- Rotate all of them if anyone with access leaves

## 6. Transport and headers

- HTTPS enforced on both domains; HTTP 301s to HTTPS
- CORS: explicit allowlist from `CORS_ORIGINS`, never `*`
- `/docs` and `/redoc` disabled in production
- Security headers on the frontend (`next.config.ts`):

```ts
headers: [{
  source: '/(.*)',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  ],
}]
```

A Content-Security-Policy is desirable but must allowlist all three pixel domains and their
inline bootstrap snippets. Ship without CSP in v1 rather than shipping a CSP that silently blocks
the pixels — then add it deliberately, verifying each pixel still fires.

---

# Part B — Legal pages

Four pages, light MSA register (`05` §1), linked from the footer and from the checkout modal.
Requirements derive from the KSA E-Commerce Law and its Implementing Regulations (`07` §7).

> **These are content outlines, not legal advice.** The owner should have a Saudi lawyer review
> the final text. Build the pages with the structure below and mark unresolved facts
> `TODO: owner to supply`.

## `/terms` — الشروط والأحكام

| Section | Must state |
|---|---|
| التعريفات | Store, service provider, customer, product |
| معلومات مزوّد الخدمة | Legal entity name, CR number, VAT number, registered address, phone, email — **legally required disclosure** |
| كيف يتم الطلب | The contract-formation procedure: order submitted → confirmation call → contract concluded on confirmation. This is important: it establishes that the phone confirmation is part of contract formation, which supports our COD process. |
| خصائص المنتجات | Main characteristics, and that they are cosmetics / a food supplement — **not medicines** |
| الأسعار والضريبة | Prices in SAR, VAT-inclusive, delivery cost stated before confirmation |
| الدفع | Cash on delivery only |
| التوصيل | Coverage, timeframe, and the right to cancel with a full refund if delivery is delayed more than **15 days** |
| الإرجاع والاستبدال | Cross-reference to `/returns`, including the **7-day** statutory right |
| الضمان | What is and is not warranted |
| حدود المسؤولية | Reasonable limitation, no exclusion of statutory rights |
| المحتوى والملكية الفكرية | Brand, copy, images |
| القانون المطبق | Laws of the Kingdom of Saudi Arabia; competent Saudi courts |
| التعديلات | Right to amend terms, with the effective date |
| بيان طبي | Products are not medicines and do not diagnose or treat; consult a doctor for severe hair loss |

## `/privacy` — سياسة الخصوصية

| Section | Must state |
|---|---|
| البيانات اللي نجمعها | Name, mobile, IP, device/browser, pages viewed, ad click identifiers. **Explicitly: we do not collect payment card data.** |
| ليش نجمعها | Processing and delivering the order, the confirmation call, customer support, measuring advertising |
| الأساس القانوني | Contract performance; legitimate interest for measurement |
| مع مين نشاركها | The delivery company (name + address to fulfil); **Meta, TikTok, Snapchat — hashed identifiers for advertising measurement**; Google (Sheets) for order operations |
| ملفات تعريف الارتباط | What the three pixels do, and how to opt out at the browser/platform level |
| مدة الاحتفاظ | Per `21` §13 |
| حقوقك | Access, correction, deletion, objection — under PDPL, with the contact route |
| أمن البيانات | Encryption in transit, access controls, minimisation |
| الأطفال | The service is not directed at under-18s |
| التواصل | Email + WhatsApp for privacy requests |

## `/returns` — سياسة الاستبدال والإرجاع

| Section | Must state |
|---|---|
| حقك في الإرجاع | Cancellation within **7 days of receipt**, provided the product has not been used or benefited from |
| الحالة المطلوبة | Unopened, seal intact, original packaging |
| مين يتحمل تكلفة الإرجاع | **The customer bears rescission costs unless otherwise agreed** — state clearly which we choose, and if we cover it, say so as a selling point (`TODO: owner to decide`) |
| الاستثناءات | Opened supplement and cosmetic products, for health and safety reasons |
| كيف ترجّعين | WhatsApp with the order number, within 7 days |
| المدة والطريقة | Refund method for a COD order (cash/transfer) and the timeframe |
| المنتج التالف أو الخطأ | Full replacement or refund at our cost, and the customer bears nothing |
| الرفض عند الاستلام | She may refuse the parcel at the door at no cost — state this plainly; it is one of our strongest trust signals |

## `/shipping` — سياسة التوصيل

| Section | Must state |
|---|---|
| مناطق التوصيل | All KSA regions (`TODO: confirm any exclusions`) |
| المدة | 2–4 business days (`TODO: confirm real windows, and whether remote regions differ`) |
| التكلفة | Free, or the real fee — must match what the checkout shows |
| التغليف | Discreet, sealed, no product details visible externally |
| مكالمة التأكيد | Orders ship only after the confirmation call; a limited number of attempts, then the order closes as `ما رد` |
| التتبع | How she is updated (WhatsApp) |
| التأخير | Right to cancel with a full refund if delivery is delayed **more than 15 days**, excluding force majeure, and our obligation to inform her of expected delays |
| محاولات التوصيل | How many attempts, and what happens on failure |

## Engineering notes for legal pages

- Fully static, MDX or typed content files under `content/legal/`
- Indexable
- A visible "last updated" date on each page — required for the amendment clause to mean anything
- Linked from the footer on every page, and from the checkout modal above the submit button
- The checkout modal's consent line must reference both `/terms` and `/privacy` with real links
- Every `TODO: owner to supply` must render as visibly styled text during development so it cannot
  ship unnoticed, and all instances are listed in `33`
