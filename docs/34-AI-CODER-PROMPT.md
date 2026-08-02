# 34 — The AI Coder Prompt

Copy everything between the two rulers and give it to your AI coder as the opening message, with
the repository open so it can read the `docs/` folder.

---

## THE PROMPT

You are building a production e-commerce store from a complete specification. The full spec lives
in the `docs/` folder of this repository. **Read `docs/README.md` first — it is the index and it
defines the build order.** Do not start writing code until you have read the docs listed in
Phase 0 below.

### What we are building

أصول (OSOOL) — a branded, Arabic-first (RTL), cash-on-delivery direct-to-consumer store for Saudi
Arabia selling three premium hair and scalp products at 199–349 SAR. Traffic arrives from paid
Snapchat and TikTok video onto product landing pages. The site's job is to convert cold, sceptical,
mobile Saudi women at a high average order value, and to capture phone numbers that actually
confirm on the follow-up call.

- **Frontend:** Next.js 15 App Router + TypeScript (strict) + Tailwind v4 + shadcn/Radix + Zustand → `osool.shop`
- **Backend:** Python 3.12 FastAPI + SQLAlchemy 2.0 async + Alembic + PostgreSQL → `api.osool.shop`
- **Payment:** cash on delivery only. Checkout is two fields: name and Saudi mobile. No gateway, no accounts.
- **Orders:** written to PostgreSQL and pushed to Google Sheets via an Apps Script webhook
- **Tracking:** Meta, TikTok, and Snapchat web pixels **plus** server-side Conversions API, deduplicated
- **Hosting:** EasyPanel, Docker for both services, PostgreSQL already provisioned
- **Database URL (internal, use verbatim):** `postgres://osool:osool@osool_database:5432/osool?sslmode=disable`

### Deliverables

1. `frontend/` — the Next.js app, with `Dockerfile`, `.dockerignore`, and `.env.example`
2. `backend/` — the FastAPI app, with `Dockerfile`, `docker-entrypoint.sh`, `.dockerignore`, `.env.example`, and Alembic migrations that **run automatically on container start**
3. `docker-compose.yml` for local development (includes a local Postgres)
4. A root `README.md` with local setup and EasyPanel deployment steps
5. Everything committed and ready to push to GitHub

The Google Apps Script and the Sheets CSV templates already exist at `reference/apps-script-webhook.gs.js` and `assets/*.csv` — wire the backend to them, do not rewrite them.

### Build order — follow it

**Phase 0 — Read (do not skip).** `docs/README.md`, then `01`, `02`, `03`, `04`, `05`, `07`, `08`,
`10`, `19`, `20`, `21`, `22`. These define the non-negotiables and the contracts.

**Phase 1 — Skeleton.** Monorepo layout per `docs/26` §1. Both Dockerfiles. Both `.env.example`
files per `docs/27` §§4–5. `docker-compose.yml`. Healthchecks green locally.

**Phase 2 — Backend core.** Models and migrations per `docs/21`. Idempotent seeding from
`assets/products-seed.csv` and `assets/offers-seed.csv`. `GET /api/products` live. **Pay very close
attention to `docs/20` §3 — the provided `DATABASE_URL` contains `?sslmode=disable`, which asyncpg
does not accept; it must be stripped and translated, and Alembic needs a separate sync URL.**

**Phase 3 — Design system.** Tokens, fonts, RTL shell, and the primitive components per `docs/10`
and `docs/02`. Set up the RTL lint guard described in `docs/19` §7 before writing UI.

**Phase 4 — Product page.** `docs/12`, using content from `docs/06`. This is the money page; give
it the most care. Includes the offer selector (`docs/12` §5) and the sticky add-to-cart.

**Phase 5 — Cart drawer + cross-sell.** `docs/15`, with the pairing logic from `docs/08` §2.

**Phase 6 — Checkout modal + phone validation + timed upsell.** `docs/16`. The phone
normalisation in §4 must pass every test vector in §4.4, on both client and server.

**Phase 7 — Order pipeline.** `POST /api/orders` per `docs/22` §7, the Sheets webhook per
`docs/25`, and the thank-you page per `docs/17`.

**Phase 8 — Tracking.** Deferred web pixels per `docs/23`, then server-side CAPI per `docs/24`.
`docs/24` contains verified payload shapes for all three platforms — follow them exactly.

**Phase 9 — Remaining pages.** Home (`docs/11`), collection (`docs/13`), about and contact
(`docs/14`), and the four legal pages (`docs/29` Part B).

**Phase 10 — Performance, SEO, QA.** `docs/28`, then work through `docs/32` until every box passes.

### The fifteen non-negotiables

Getting any of these wrong means the build has failed, regardless of code quality.

1. **Arabic-first, RTL native.** `<html lang="ar" dir="rtl">` server-rendered. Saudi dialect copy, feminine singular address throughout. Use **logical CSS properties only** (`ms/me/ps/pe/start/end`) — `ml-*`, `left-*`, and `text-right` are bugs. Add the lint guard in `docs/19` §7.
2. **Mobile-first at 390px.** Over 90% of traffic is a one-handed phone user in the Snapchat or TikTok in-app browser. Design that view first.
3. **All Arabic strings live in `frontend/src/content/`.** No Arabic string literals inside components.
4. **The server is the only authority on price.** The order request body contains **no prices at all** — only `product_id`, `offer_id`, `qty`. The server recomputes from the `offers` table (`docs/22` §14).
5. **Offer tier 2 (279 SAR) is pre-selected**, driven by `offers.is_default` from the API, never hardcoded.
6. **The cart drawer opens automatically after every add**, from every surface, and the cross-sell must be visible without scrolling inside the drawer.
7. **The order is fully persisted before the upsell renders.** If she closes the tab during the upsell, the order still exists and is still in the Sheet.
8. **The upsell countdown is server-authoritative.** It uses `upsell_expires_at` from the API, genuinely expires (accept returns `410`), and does **not** reset on refresh.
9. **`Purchase` fires once at order creation** (browser and server, sharing one `event_id`), **never on thank-you page mount**. The upsell delta is a *separate* event with its own `event_id` and value 99.
10. **Phone handling per platform differs and it is silent when wrong.** Meta and Snapchat hash `966XXXXXXXXX` (no plus). **TikTok hashes `+966XXXXXXXXX` — keeping the plus.** Assert `hash_phone_meta(x) != hash_phone_tiktok(x)` in tests (`docs/24` §2–3).
11. **Convert Arabic-Indic digits (`٠١٢٣٤٥٦٧٨٩`) before validating the phone.** Saudi users type on Arabic keypads. Missing this rejects real customers, and it is the most commonly missed requirement in this build.
12. **No hashing in the browser** — all three pixel SDKs hash internally. Hash only server-side.
13. **Pixels are deferred** until first interaction or browser idle, with a queue for events fired before load. No GTM.
14. **Claims compliance is mandatory.** Read `docs/07`. No medical claims, no invented statistics, no fabricated reviews. Note that the iron tonic is an **oral supplement, not a cosmetic**, with stricter rules and mandatory safety warnings including a keep-away-from-children iron warning.
15. **No dark patterns.** Every countdown, stock counter, and activity number must reflect real data, or be hidden. `docs/18` §2 defines exactly what is allowed. In a COD market a customer who feels tricked simply refuses the parcel, so trickery is unprofitable as well as unethical.

### Products

Full dossiers with ingredients, mechanism, cited evidence, honest timelines, safety, and FAQ are in `docs/06`. Seed data is in `assets/products-seed.csv` and `assets/offers-seed.csv`.

1. **سيروم ريدنسل وببتيدات النحاس** — `redensyl-copper-peptide-serum` — cause ① the dormant follicle
2. **تونك حديد بيسجليسينات وفيتامين C** — `iron-bisglycinate-vitamin-c-tonic` — cause ② depleted stores — **oral supplement, stricter compliance**
3. **مقشّر ساليسيليك ٢٪ وزنك** — `salicylic-2-zinc-scalp-exfoliant` — cause ③ the congested scalp

Every product uses the same offer ladder: **199 SAR (1) / 279 SAR (2) / 349 SAR (3)**, and the
post-checkout upsell is **99 SAR** — the only discount anywhere on the site.

### Working style

- **Ask before inventing.** If the docs do not cover something, use the guardrails in `docs/04` §9. If it is a business fact (a real address, a real customer count, a real delivery window), do **not** invent it — render `TODO: owner to supply` in a visibly styled way and add it to the list in `docs/33` §1.4.
- **Never invent a statistic, a study, a review, or a certification.** Every number on the site must trace to `docs/06`.
- Build vertical slices that work end to end rather than lots of half-finished layers.
- Match the conventions in `docs/19` §10 and `docs/20` §2.
- Write tests for the five priorities in `docs/20` §10 — phone normalisation and pricing above all.
- Comment only to record a non-obvious constraint. Do not narrate what the code does.
- Report progress by phase, and flag anything in the docs that appears contradictory instead of guessing.

### Definition of done

`docs/32` in full, with the 15-step critical path in §1 passing end to end on a real phone inside
the Snapchat in-app browser.

Start with Phase 0. Tell me what you have read and what you plan to build in Phase 1 before you
write any code.

---

## Follow-up prompts you can use as the build progresses

Keep these for later — sending them at the right moment is more effective than one giant message.

**After Phase 2:**
> Backend core is done. Show me the output of `GET /api/products` and confirm: 3 products, 9 offers, exactly one `is_default` per product, and that migrations plus seeding ran from the container entrypoint. Then confirm the `sslmode=disable` handling in `docs/20` §3 is implemented and that Alembic uses the sync URL.

**After Phase 4:**
> Product page is done. Walk me through it against `docs/12` §2 section by section and confirm each one exists. Then confirm: tier 2 pre-selected from the API, sticky ATC appearing on `#offer` exit, alternating split-section layout correct in RTL, and LCP under 2.0s on mobile.

**After Phase 6:**
> Checkout is done. Run the full phone test-vector table from `docs/16` §4.4 and show me the results for all 19 cases, client and server. Confirm the Arabic-Indic digit case passes. Then demonstrate that the order persists before the upsell renders by killing the tab mid-upsell.

**After Phase 8:**
> Tracking is done. Show me: (a) the network waterfall proving no pixel request before first interaction, (b) the test output proving `hash_phone_meta(x) != hash_phone_tiktok(x)`, (c) the exact JSON payload sent to each of the three CAPI endpoints for one test purchase, with hashed values, and (d) that the upsell delta uses a separate `event_id`.

**Before launch:**
> Work through `docs/32` and give me a pass/fail for every single checkbox with evidence for the failures. Then list every `TODO: owner to supply` in the codebase with its file and line.
