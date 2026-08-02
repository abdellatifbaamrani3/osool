# أصول / OSOOL — Documentation Index

Single source of truth for building `osool.shop` (frontend) and `api.osool.shop` (backend).

**Read this file first. Then read `34-AI-CODER-PROMPT.md`.**

---

## 1. What we are building

A branded, Arabic-first (RTL), cash-on-delivery DTC store for Saudi Arabia selling three
hair & scalp products at premium prices. Traffic comes from paid Snapchat and TikTok video
(UGC / AI video). The website's job is to convert cold, sceptical, mobile Saudi women at a
high average order value, and to produce phone numbers that actually confirm on delivery.

- Frontend: Next.js (App Router) + TypeScript + Tailwind, deployed on EasyPanel, domain `osool.shop`
- Backend: Python FastAPI + PostgreSQL + Alembic, deployed on EasyPanel, domain `api.osool.shop`
- Orders: written to Postgres **and** pushed to Google Sheets via a webhook (Apps Script)
- Payment: COD only. Checkout = name + valid Saudi mobile. No payment gateway.
- Tracking: Meta, TikTok, Snapchat web pixels **plus** server-side CAPI, deduplicated

## 2. How to read these docs

Docs are numbered in dependency order. Business context comes before engineering, because
almost every engineering decision here exists to serve a conversion-rate or trust goal. If
you skip the business docs you will build a technically correct store that does not sell.

| # | Doc | What it decides |
|---|-----|-----------------|
| 01 | `01-project-overview.md` | Business model, unit economics, success metrics, scope boundaries |
| 02 | `02-brand-identity.md` | Name, meaning, logo mark, colour palette, typography, voice |
| 03 | `03-icp-and-market.md` | Who we sell to, their pains, objections, trust triggers |
| 04 | `04-positioning-and-messaging.md` | Category, big idea, message hierarchy, proof pillars |
| 05 | `05-copy-guide-ar-ksa.md` | Saudi-dialect copy rules, lexicon, RTL typography, ready copy blocks |
| 06 | `06-product-dossiers.md` | Per-product ingredients, mechanism, evidence, objections, FAQ |
| 07 | `07-claims-and-compliance.md` | SFDA claim limits, allowed vs banned wording, disclaimers |
| 08 | `08-offers-pricing-aov.md` | 199/279/349 offer ladder, 99 SAR upsell, AOV maths, COD economics |
| 09 | `09-information-architecture.md` | Sitemap, routes, URL slugs, navigation, RTL locale setup |
| 10 | `10-design-system.md` | Tokens, type scale, spacing, component inventory, motion |
| 11 | `11-page-home.md` | Home page section-by-section blueprint |
| 12 | `12-page-product.md` | Product/landing page blueprint (the money page) |
| 13 | `13-page-collection.md` | Collection page + product card anatomy |
| 14 | `14-page-about-contact.md` | About and Contact pages |
| 15 | `15-cart-drawer-and-crosssell.md` | Cart drawer, cross-sell logic |
| 16 | `16-checkout-popup-and-upsell.md` | Checkout modal, KSA phone validation, timed 99 SAR upsell |
| 17 | `17-thank-you-and-post-purchase.md` | Thank-you page, order confirmation expectations |
| 18 | `18-cro-playbook.md` | Conversion principles, friction audit, experiment backlog |
| 19 | `19-frontend-architecture.md` | Next.js structure, libraries, state, RTL, fonts |
| 20 | `20-backend-architecture.md` | FastAPI structure, layering, background jobs, migrations |
| 21 | `21-data-model.md` | Postgres schema, tables, indexes, enums |
| 22 | `22-api-contract.md` | Every endpoint, request/response, error shapes |
| 23 | `23-tracking-web-pixels.md` | Deferred browser pixels, event map, `event_id` generation |
| 24 | `24-tracking-capi-server.md` | Meta / TikTok / Snap server events, verified payloads, hashing |
| 25 | `25-sheets-webhook.md` | Apps Script code, sheet columns, deployment steps |
| 26 | `26-devops-deployment.md` | Dockerfiles, compose, EasyPanel setup, domains, migrate-on-boot |
| 27 | `27-env-reference.md` | Every environment variable, where to get it, what breaks without it |
| 28 | `28-performance-seo.md` | Core Web Vitals budget, Arabic SEO, structured data |
| 29 | `29-security-and-legal-pages.md` | Rate limits, PII handling, KSA e-commerce law pages |
| 30 | `30-cod-operations.md` | Confirmation calling, fake-order filtering, delivery rate levers |
| 31 | `31-images-and-assets.md` | Placeholder image spec, naming, aspect ratios, alt text |
| 32 | `32-qa-acceptance-criteria.md` | Definition of done, test matrix, tracking QA |
| 33 | `33-launch-checklist.md` | Pre-launch gate |
| 34 | `34-AI-CODER-PROMPT.md` | **The prompt to hand to the AI coder** |

Supporting files (at the repository root, alongside `docs/`):

| Path | What it is |
|---|---|
| `assets/orders-sheet-template.csv` | `Orders` tab headers + sample rows |
| `assets/leads-sheet-template.csv` | `Leads` tab headers + sample rows |
| `assets/messages-sheet-template.csv` | `Messages` tab headers + sample rows |
| `assets/products-seed.csv` | The 3 products — database seed source |
| `assets/offers-seed.csv` | The 9 offers (3 tiers × 3 products) |
| `assets/reviews-seed.csv` | Placeholder reviews, all `is_seed = true` |
| `reference/apps-script-webhook.gs.js` | The exact Apps Script to paste into Google Sheets |

## 3. Recommended build order

Do not build the pages first. Build the spine, then the money page, then everything else.

1. **Repo + infra skeleton** — monorepo, `frontend/`, `backend/`, Dockerfiles, `.env.example`, CI-less deploy to EasyPanel, healthchecks green. (`26`, `27`)
2. **Backend core** — models, Alembic migrations that run on boot, products seeded, `/api/products` live. (`20`, `21`, `22`)
3. **Design system** — tokens, fonts, RTL shell, base components in Storybook-less isolation. (`02`, `10`, `19`)
4. **Product page** — the single highest-leverage surface. Full section stack, offer selector, sticky ATC. (`12`, `06`, `08`)
5. **Cart drawer + cross-sell** — (`15`)
6. **Checkout modal + phone validation + timed upsell** — (`16`)
7. **Order pipeline** — order create endpoint, Sheets webhook, thank-you page. (`22`, `25`, `17`)
8. **Tracking** — web pixels deferred, then CAPI, then dedup verification in each Events Manager. (`23`, `24`)
9. **Remaining pages** — home, collection, about, contact, legal. (`11`, `13`, `14`, `29`)
10. **Performance, SEO, QA, launch** — (`28`, `32`, `33`)

## 4. Non-negotiables

These are the things that, if broken, make the project fail regardless of code quality.

1. **Arabic first, RTL native.** `dir="rtl"` on `<html>`, Saudi dialect copy, no machine-translation feel. English exists only in the logo lockup and a few product/ingredient names.
2. **Mobile first.** Over 90% of Snapchat/TikTok traffic is a one-handed phone user on cellular. Design the 390px view first; desktop is the adaptation, not the source.
3. **Never lose the phone number.** Every abandoned checkout with a valid phone is money. Persist partial leads server-side before the upsell step.
4. **Claims must survive scrutiny.** See `07-claims-and-compliance.md`. No medical claims, no invented clinical trials, no fake doctor endorsements. Authority is built from real ingredient science, honest framing, and transparent sourcing.
5. **Scarcity must be true.** Real stock counters and real deadlines only. See `18-cro-playbook.md` §"Honest urgency".
6. **Tracking dedup must be verified**, not assumed. Every platform's Events Manager must show deduplicated events before spend scales.
7. **Speed is a conversion feature.** LCP under 2.5s on 4G mid-tier Android. Pixels are deferred and must never block first paint.
