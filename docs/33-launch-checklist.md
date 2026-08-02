# 33 — Launch Checklist

Three gates. **Gate 1 is legal and cannot be waived** — several items there are the difference
between a business and a liability. Gate 2 is technical. Gate 3 is the go-live sequence.

---

# Gate 1 — Legal and compliance (owner responsibilities)

## 1.1 Regulatory — blocking

- [ ] **SFDA cosmetic notification** completed for the serum (`redensyl-copper-peptide-serum`)
- [ ] **SFDA cosmetic notification** completed for the exfoliant (`salicylic-2-zinc-scalp-exfoliant`)
- [ ] **SFDA health/food-supplement registration** completed for the iron tonic — **this is a
      different path from the cosmetics**, because oral products are explicitly excluded from the
      cosmetic definition (`07` §2). Do not launch this product without it.
- [ ] Supplier INCI lists obtained for all three products
- [ ] INCI lists checked against SFDA's prohibited and restricted substances lists
- [ ] Actual active concentrations **confirmed in writing by the supplier** — every percentage on
      the site must be true (`07` §5)
- [ ] Batch number and expiry date present on physical units
- [ ] Any "free from" claim (parabens, sulfates, silicones, fragrance) verified against the real INCI

## 1.2 Business registration — blocking

- [ ] E-shop registered in the Commercial Register (required by the KSA E-Commerce Law)
- [ ] Legal entity name (Arabic + English) supplied and in the footer
- [ ] CR number supplied and in the footer
- [ ] VAT registration status confirmed; if registered, the VAT number is in the footer and on invoices
- [ ] Registered address supplied and on the contact page
- [ ] Business phone and email supplied
- [ ] WhatsApp Business account set up with the أصول name and logo

## 1.3 Site content compliance — blocking

- [ ] `SELECT count(*) FROM reviews WHERE is_seed` returns **0** — every seeded review removed or
      replaced with a real one (`07` §6). Fake reviews violate E-Commerce Law Article 11.
- [ ] Zero banned words from `07` §3 anywhere, including alt text, meta tags, and JSON-LD
- [ ] Every claim traceable to an approved phrasing in `07` §4
- [ ] Evidence footer present on all three product pages
- [ ] All supplement warnings on the tonic page, including keep-away-from-children
- [ ] `aggregateRating` JSON-LD emitted **only** when real reviews exist
- [ ] Four legal pages complete, reviewed by a Saudi lawyer, and linked
- [ ] `/returns` states the 7-day statutory right and who bears return shipping
- [ ] `/shipping` states the 15-day delay cancellation right
- [ ] `/privacy` names Meta, TikTok, Snapchat, and Google as data recipients and states retention periods
- [ ] Prices state VAT inclusion
- [ ] No fake struck-through prices, no fake timers, no fake counters

## 1.4 Every `TODO: owner to supply`

Grep the codebase for `TODO: owner to supply` and resolve each one:

- [ ] Legal entity name · CR number · VAT number · address · phone · email
- [ ] WhatsApp number
- [ ] SFDA notification numbers per product
- [ ] Founder name/story (or the section removed)
- [ ] Social media handles
- [ ] Real delivery windows per region
- [ ] Whether shipping is genuinely free
- [ ] Who bears return shipping cost
- [ ] Real customer/order counts, or the proof lines removed entirely

---

# Gate 2 — Technical

## 2.1 Functional

- [ ] The 15-step critical path in `32` §1 passes end to end
- [ ] Every checklist in `32` §§2–14 complete
- [ ] Tested on a real Android **and** a real iPhone
- [ ] Tested inside the **Snapchat and TikTok in-app browsers**

## 2.2 Infrastructure

- [ ] `api.osool.shop` resolves, HTTPS valid, `/health` returns 200
- [ ] `osool.shop` resolves, HTTPS valid
- [ ] `www.osool.shop` 301s to the apex
- [ ] Migrations ran on deploy; `/health/ready` returns 200
- [ ] 3 products and 9 offers seeded
- [ ] `/docs` returns 404 in production
- [ ] CORS restricted to the two site origins
- [ ] `NEXT_PUBLIC_*` set as **build arguments** in EasyPanel and confirmed present in the browser
      bundle (`26` §2.1) — check `window` or view source for the pixel IDs
- [ ] **Postgres backups enabled and a restore tested**
- [ ] Uptime monitoring on both domains
- [ ] Container resource limits set, and no restart loop in the logs

## 2.3 Google Sheets

- [ ] Sheet created with the four correctly named tabs
- [ ] Headers pasted from `assets/*.csv`
- [ ] Phone columns formatted as **plain text** (leading zeros survive)
- [ ] Spreadsheet timezone set to **Asia/Riyadh**
- [ ] Status dropdown configured with the seven values
- [ ] Apps Script pasted, `SECRET` changed from the placeholder, deployed as a web app with access "Anyone"
- [ ] `SHEETS_WEBHOOK_URL` and `SHEETS_WEBHOOK_SECRET` set in the backend and matching
- [ ] Test order produced exactly one row
- [ ] Upsell acceptance **updated** that row rather than adding a second
- [ ] Test lead appeared in the `Leads` tab
- [ ] Test contact message appeared in the `Messages` tab
- [ ] Dashboard formulas computing
- [ ] Sheet shared with the confirmation team, with edit access

## 2.4 Tracking

- [ ] All three pixels created and IDs configured
- [ ] All three CAPI access tokens generated and configured
- [ ] `test_event_code` used during QA, then **removed** from production
- [ ] Hash vector tests pass (`24` §3.4)
- [ ] Real test order verified in **all three** Events Managers
- [ ] Exactly one Purchase counted per platform, dedup visible
- [ ] Upsell delta appears as a distinct 99 SAR Purchase
- [ ] Match quality shows the phone parameter received on all three
- [ ] `client_ip_address` is the customer's, not the proxy's
- [ ] No pixel request before first interaction

## 2.5 Performance and SEO

- [ ] Lighthouse mobile ≥ 90 on home, collection, and all product pages
- [ ] LCP ≤ 2.0s on a real device on cellular
- [ ] CLS ≤ 0.02
- [ ] `sitemap.xml` and `robots.txt` correct
- [ ] Canonicals correct on every page
- [ ] `/thank-you/*` is `noindex`
- [ ] JSON-LD validates in Google's Rich Results Test
- [ ] OG image renders correctly in a WhatsApp link preview (the most-shared surface in KSA)
- [ ] Google Search Console verified, sitemap submitted

## 2.6 Content

- [ ] All 19 image slots filled — real photography, or placeholders that are acceptable to launch with
- [ ] All product page sections present on all three products
- [ ] Arabic copy read aloud end to end by a native Saudi speaker
- [ ] No lorem ipsum, no `undefined`, no English placeholder text
- [ ] 404 page complete and routing onward

---

# Gate 3 — Go-live sequence

## 3.1 Operations readiness (before spending a single riyal on ads)

- [ ] Confirmation team briefed on the playbook in `30` §3
- [ ] Confirmation script prepared and practised
- [ ] Delivery partner contracted, coverage and windows confirmed
- [ ] The delivery windows on the site match reality
- [ ] Stock physically available and `products.stock_count` set to the real number
- [ ] WhatsApp Business set up with quick replies for the most common questions
- [ ] Weekly metrics tracking in place (`30` §6)
- [ ] Someone owns the "orders with `sheet_synced_at IS NULL`" alert (`25` §6)

## 3.2 Soft launch

- [ ] 5 real orders placed by friends/family end to end, including delivery and payment
- [ ] Confirmation calls made and the process validated
- [ ] Every number reconciled: site → Sheet → Events Managers → bank/cash
- [ ] Set ad spend to a small daily budget on **one** platform and one product for 48 hours
- [ ] Verify: real conversions appear, dedup holds under real traffic, no console errors from
      in-app browsers, confirmation rate is measurable

## 3.3 Scale

Only after the soft launch is clean:

- [ ] Add the second platform
- [ ] Add the remaining products' campaigns
- [ ] Increase budget gradually, watching confirmation and delivery rates — not just ROAS. A
      campaign with great reported ROAS and a 40% confirmation rate is losing money.
- [ ] Begin the experiment backlog in `18` §7, one variable at a time

## 3.4 Week-one watch list

| Metric | Where | Action if off |
|---|---|---|
| Product page → ATC | Analytics | `18` §8 diagnostic tree |
| Checkout → submitted | Analytics | Check phone validation first, especially Arabic-Indic digits |
| Upsell take rate | Sheet column I | Check it renders at all |
| AOV | Sheet Dashboard | Verify tier 2 is pre-selected and cross-sell is above the fold |
| Confirmation rate | Sheet Dashboard | `30` §4 |
| Delivery rate | Sheet Dashboard | `30` §5 |
| LCP p75 | Web vitals | `28` |
| CAPI failures | Backend logs (`capi_failed`) | `24` §9 |
| Unsynced orders | `sheet_synced_at IS NULL` | `25` §6 — this one is a revenue emergency |

---

## The five things most likely to go wrong

Based on how this stack and this market actually fail, watch these first:

1. **`NEXT_PUBLIC_*` not set as build args** → pixels silently never load, no error anywhere (`26` §2.1)
2. **Arabic-Indic digits rejected in the phone field** → real customers cannot check out (`16` §4.1)
3. **`sslmode=disable` passed to asyncpg** → backend will not start (`20` §3)
4. **TikTok phone hashed without the `+`** → `code: 0`, events land, match rate quietly near zero (`24` §2)
5. **`Purchase` fired on thank-you mount** → double-counted on every refresh, inflated ROAS, over-spending (`23` §5)
