# 26 — Docker, EasyPanel Deployment, and Operations

Target: two services on EasyPanel with an existing Postgres instance.

| Service | Domain | Container port |
|---|---|---|
| Frontend (Next.js) | `osool.shop`, `www.osool.shop` | 3000 |
| Backend (FastAPI) | `api.osool.shop` | 8000 |
| Postgres | internal only (`osool_database:5432`) | 5432 |

---

## 1. Repository layout

Single repository, two deployable directories. EasyPanel builds each from its own subdirectory.

```
osool/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── …
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── .dockerignore
│   ├── .env.example
│   └── …
├── docs/
├── assets/
├── reference/
├── docker-compose.yml          # local development only
├── .gitignore
└── README.md
```

`.gitignore` must include: `.env`, `.env.local`, `.env.production`, `node_modules/`, `.next/`,
`__pycache__/`, `*.pyc`, `.venv/`, `.DS_Store`, `*.log`.

**Never commit a `.env` file.** Only `.env.example` with placeholder values (`27`).

---

## 2. Frontend Dockerfile

Multi-stage, standalone output. The `standalone` tracing step is what gets the image from ~1.2GB
to ~180MB.

```dockerfile
# frontend/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined at BUILD time — they must be present here,
# not only at runtime. See §2.1.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_TIKTOK_PIXEL_CODE
ARG NEXT_PUBLIC_SNAP_PIXEL_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Requires `output: 'standalone'` in `next.config.ts`.

### 2.1 The `NEXT_PUBLIC_` build-time trap

This catches almost everyone deploying Next.js on EasyPanel. `NEXT_PUBLIC_*` variables are
**inlined into the JavaScript bundle at build time**. Setting them only as runtime environment
variables in EasyPanel means they will be `undefined` in the browser, and the symptom is
maddening: pixels silently never load and the API URL is empty, with no error anywhere.

**Two ways to handle it, pick one and document it in the repo README:**

1. **Build args** (as above) — in EasyPanel, add the same variables under the service's *Build*
   configuration, not only *Environment*. This is the recommended approach.
2. **Runtime config** — expose the values from a server component via a `<script>` tag or fetch
   them from `/api/settings/public`, then read them from `window.__OSOOL_CONFIG__`. More
   flexible (no rebuild to change a pixel ID) but adds a tiny amount of complexity.

If pixels are not firing after a deploy, check this first.

---

## 3. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim AS base
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN useradd -m -u 1001 osool && chown -R osool:osool /app
USER osool

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8000/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
```

`--start-period=40s` matters: migrations and seeding run before Uvicorn binds, and a shorter grace
period causes EasyPanel to kill the container mid-migration and restart-loop.

---

## 4. Migrations on start (required)

```sh
#!/bin/sh
# backend/docker-entrypoint.sh
set -e

echo "[osool] waiting for database…"
python -m app.wait_for_db

echo "[osool] running migrations…"
alembic upgrade head

echo "[osool] seeding…"
python -m app.seed

echo "[osool] starting uvicorn…"
exec uvicorn app.main:app \
  --host 0.0.0.0 --port 8000 \
  --workers 2 \
  --proxy-headers --forwarded-allow-ips='*'
```

```python
# backend/app/wait_for_db.py
import asyncio, sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def main(timeout: int = 60) -> None:
    engine = create_async_engine(
        settings.async_url,
        connect_args={} if settings.asyncpg_ssl else {"ssl": False},
    )
    deadline = asyncio.get_event_loop().time() + timeout
    while True:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print("[osool] database reachable")
            await engine.dispose()
            return
        except Exception as exc:
            if asyncio.get_event_loop().time() > deadline:
                print(f"[osool] database unreachable after {timeout}s: {exc}", file=sys.stderr)
                sys.exit(1)
            print("[osool] database not ready, retrying in 2s…")
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(main())
```

**Design decisions and why:**

- Migrations run in the **entrypoint**, not in FastAPI's `lifespan`. With `--workers 2`, a lifespan
  migration would run twice concurrently and can deadlock or double-apply.
- `set -e` means a failed migration **stops the container**. A running app on an un-migrated
  database is far more damaging than a container that refuses to start — EasyPanel will show the
  failure clearly in the logs.
- `app.seed` is idempotent (`21` §12) so restarts and redeploys are safe.
- `--proxy-headers --forwarded-allow-ips='*'` is **required** so `X-Forwarded-For` is trusted and
  `client_ip` is the customer's real IP. Without it every order records the proxy IP, which
  silently destroys CAPI match quality and makes rate limiting useless (`24` §11).

---

## 5. Local development

```yaml
# docker-compose.yml — LOCAL ONLY. Production Postgres already exists on EasyPanel.
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: osool
      POSTGRES_PASSWORD: osool
      POSTGRES_DB: osool
    ports: ["5432:5432"]
    volumes: ["osool_pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U osool"]
      interval: 5s
      retries: 10

  backend:
    build: ./backend
    env_file: ./backend/.env
    environment:
      DATABASE_URL: postgres://osool:osool@db:5432/osool?sslmode=disable
    ports: ["8000:8000"]
    depends_on:
      db: { condition: service_healthy }
    volumes: ["./backend:/app"]

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8000
        NEXT_PUBLIC_SITE_URL: http://localhost:3000
    env_file: ./frontend/.env
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  osool_pgdata:
```

```bash
docker compose up --build
# frontend  http://localhost:3000
# backend   http://localhost:8000/docs
```

---

## 6. EasyPanel setup

### 6.1 Backend service

1. **Create service** → App → source: GitHub repo, **Build path: `/backend`**
2. **Build:** Dockerfile
3. **Environment:** paste all backend variables from `27`. `DATABASE_URL` uses the **internal**
   URL exactly as provided: `postgres://osool:osool@osool_database:5432/osool?sslmode=disable`
4. **Domains:** `api.osool.shop` → container port **8000**, HTTPS/Let's Encrypt enabled
5. **Health check path:** `/health`
6. **Resources:** 512MB RAM / 0.5 CPU is sufficient to start
7. Deploy and confirm the logs show: waiting → migrations → seeding → uvicorn

### 6.2 Frontend service

1. **Create service** → App → same repo, **Build path: `/frontend`**
2. **Build:** Dockerfile, and add the `NEXT_PUBLIC_*` values as **build arguments** (§2.1)
3. **Environment:** the same `NEXT_PUBLIC_*` values again (harmless, and needed if you later
   switch to runtime config)
4. **Domains:** `osool.shop` → port **3000**, HTTPS enabled. Add `www.osool.shop` and redirect it
   to the apex.
5. **Health check path:** `/`
6. **Resources:** 512MB–1GB RAM
7. Deploy

### 6.3 DNS

| Record | Name | Value |
|---|---|---|
| A | `@` | EasyPanel server IP |
| A | `www` | EasyPanel server IP |
| A | `api` | EasyPanel server IP |

Wait for propagation before issuing certificates, or Let's Encrypt validation fails and EasyPanel
will rate-limit retries.

### 6.4 Deployment order

Backend first, always. The frontend's build calls `/api/products` for `generateStaticParams` and
ISR; if the backend is not up, the frontend build fails or produces empty pages.

---

## 7. Post-deploy verification

```bash
# Backend alive and migrated
curl -s https://api.osool.shop/health
curl -s https://api.osool.shop/health/ready

# Products seeded (should return 3 with 3 offers each)
curl -s https://api.osool.shop/api/products | jq 'length, .[0].offers | length'

# Frontend
curl -sI https://osool.shop | head -1
curl -s https://osool.shop | grep -o 'dir="rtl"'

# Docs must be closed in production
curl -sI https://api.osool.shop/docs | head -1     # expect 404

# CORS must not be wildcard
curl -sI -H "Origin: https://evil.example" https://api.osool.shop/api/products \
  | grep -i access-control-allow-origin                # expect nothing or osool.shop
```

Then in a real browser on a real phone: load a product page, add to cart, complete a test order,
and confirm (a) a row appears in the Google Sheet, (b) all three Events Managers show the events,
(c) exactly one `Purchase` per platform.

---

## 8. Backups

Postgres is the system of record. **EasyPanel's default setup does not necessarily back it up —
verify this explicitly.**

- Enable EasyPanel's scheduled Postgres backup, or run a nightly `pg_dump` to off-server storage
- Test a **restore** before launch. An untested backup is not a backup.
- The Google Sheet is a convenient secondary copy of order data, but it is not a substitute — it
  lacks items detail, attribution, and referential integrity
- Retain 30 daily and 12 monthly snapshots

---

## 9. Logging and monitoring

- Both services log JSON to stdout; EasyPanel captures it
- `structlog` on the backend with a request id per request
- **Watch for:** `capi_failed`, `sheet_sync_failed`, 5xx rate, and orders where
  `sheet_synced_at IS NULL` for more than 15 minutes (`25` §6)
- Optional but recommended: Sentry on both services, with PII scrubbing configured to drop
  `phone`, `customer_name`, and any `Authorization`/`Access-Token` header
- Uptime monitoring on `https://api.osool.shop/health` and `https://osool.shop` (UptimeRobot or
  similar, 1-minute interval). A store that is down during a Snapchat campaign burns budget
  silently.

---

## 10. Rollback

1. EasyPanel keeps previous deployments — redeploy the prior version from the UI
2. **Migrations do not auto-roll-back.** If a deploy included a migration, run
   `alembic downgrade -1` inside the container before redeploying the older image, otherwise the
   old code meets a newer schema
3. This is why every Alembic revision must have a working `downgrade()` (`21` §11)
4. Because the site is COD with no payment gateway, a rollback has no financial reconciliation
   consequence — but orders created in the window must still be in the Sheet, so check
   `sheet_synced_at` afterwards

---

## 11. Security posture at the infrastructure level

- Postgres is **never** exposed publicly — internal network only
- HTTPS enforced on both domains, HTTP redirects to HTTPS
- `/docs` and `/redoc` disabled in production (`22` §16)
- CORS restricted to the two site origins, never `*` (`20` §5)
- Secrets live only in EasyPanel's environment configuration, never in the repo, never in
  `NEXT_PUBLIC_*`
- Containers run as a non-root user (both Dockerfiles above)
- Rotate `ADMIN_TOKEN`, `SHEETS_WEBHOOK_SECRET`, and all CAPI tokens if anyone with access leaves
- Full application-level security detail in `29`
