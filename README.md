# أصول / OSOOL

Arabic-first, RTL, cash-on-delivery DTC store for Saudi Arabia. Three hair and scalp products sold
at premium prices to traffic from paid Snapchat and TikTok video.

- **Storefront:** [osool.shop](https://osool.shop) — Next.js 15 (App Router) + TypeScript + Tailwind v4
- **API:** [api.osool.shop](https://api.osool.shop) — FastAPI + SQLAlchemy 2.0 async + PostgreSQL
- **Hosting:** EasyPanel, Docker, Postgres (`osool`)

---

## Start here

| If you are… | Read |
|---|---|
| The AI coder building this | **[`docs/34-AI-CODER-PROMPT.md`](docs/34-AI-CODER-PROMPT.md)** — then `docs/README.md` |
| A developer joining | [`docs/README.md`](docs/README.md) — the full index and build order |
| The owner, preparing to launch | [`docs/33-launch-checklist.md`](docs/33-launch-checklist.md) |
| Setting up the Google Sheet | [`docs/25-sheets-webhook.md`](docs/25-sheets-webhook.md) §4 |
| Configuring EasyPanel | [`docs/26-devops-deployment.md`](docs/26-devops-deployment.md) §6 and [`docs/27-env-reference.md`](docs/27-env-reference.md) |

`docs/` contains 34 numbered documents covering positioning, ICP, Arabic copy rules, product
science and claims compliance, CRO, the design system, page-by-page blueprints, both
architectures, the data model, the API contract, pixel and Conversions API integration, deployment,
and QA. They are the single source of truth — read them before changing behaviour.

## Repository layout

```
osool/
├── frontend/        Next.js app  (Dockerfile, .env.example)
├── backend/         FastAPI app  (Dockerfile, docker-entrypoint.sh, .env.example, alembic/)
├── docs/            34 specification documents — start with docs/README.md
├── assets/          Google Sheets templates + database seed CSVs
├── reference/       Google Apps Script webhook (paste into the Sheet)
└── docker-compose.yml   local development only
```

## Local development

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# fill in the values you have; pixel IDs and CAPI tokens are optional locally

docker compose up --build
```

- Storefront → http://localhost:3000
- API docs → http://localhost:8000/docs
- Postgres → `localhost:5432` (`osool` / `osool` / `osool`)

Migrations and seeding run automatically in the backend container entrypoint. Three products and
nine offers should exist after the first boot:

```bash
curl -s http://localhost:8000/api/products | jq 'length'
```

## Deployment

Two EasyPanel services from this one repository, built from `/frontend` and `/backend`. Full steps
in [`docs/26-devops-deployment.md`](docs/26-devops-deployment.md) §6.

**Deploy the backend first** — the frontend build calls `/api/products` for static generation.

> ⚠️ **The most common deployment mistake on this stack:** `NEXT_PUBLIC_*` variables are inlined
> into the browser bundle at **build** time. In EasyPanel they must be set as **build arguments**,
> not only as environment variables. If pixels silently never load, this is why. See
> [`docs/26`](docs/26-devops-deployment.md) §2.1.

## Environment variables

Every variable, where to obtain it, and what breaks without it:
[`docs/27-env-reference.md`](docs/27-env-reference.md).

Pixel **IDs** are public and belong in `NEXT_PUBLIC_*`. Conversions API **access tokens** are
backend-only and must never appear in a `NEXT_PUBLIC_*` variable.

## Things that will bite you

Ranked by how often they actually happen:

1. `NEXT_PUBLIC_*` not set as build args → pixels silently never load ([`docs/26`](docs/26-devops-deployment.md) §2.1)
2. Arabic-Indic digits (`٠٥٥…`) rejected in the phone field → real customers cannot check out ([`docs/16`](docs/16-checkout-popup-and-upsell.md) §4.1)
3. `?sslmode=disable` passed to asyncpg → the backend will not start ([`docs/20`](docs/20-backend-architecture.md) §3)
4. TikTok phone hashed without the leading `+` → events land, match rate quietly near zero ([`docs/24`](docs/24-tracking-capi-server.md) §2)
5. `Purchase` fired on thank-you page mount → double-counted on every refresh, inflated ROAS ([`docs/23`](docs/23-tracking-web-pixels.md) §5)

## Before launch

Work through [`docs/32-qa-acceptance-criteria.md`](docs/32-qa-acceptance-criteria.md) and
[`docs/33-launch-checklist.md`](docs/33-launch-checklist.md) in full.

Two hard gates that are easy to overlook:

- **All seeded reviews must be removed or replaced with real ones.** `SELECT count(*) FROM reviews WHERE is_seed` must return `0`. Fake reviews breach the KSA E-Commerce Law.
- **The iron tonic is an oral supplement, not a cosmetic**, and needs a different SFDA registration path from the two topical products. See [`docs/07`](docs/07-claims-and-compliance.md) §2.
