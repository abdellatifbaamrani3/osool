# 20 — Backend Architecture

## 1. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **FastAPI** (Python 3.12) | Async, automatic OpenAPI, Pydantic validation |
| Server | **Uvicorn** with `--workers 2` behind EasyPanel's proxy | |
| ORM | **SQLAlchemy 2.0** async + `asyncpg` | 2.0 style (`select()`, `Mapped[]`), not legacy Query |
| Migrations | **Alembic**, run automatically on boot | Required by the client (`26` §4) |
| Validation | **Pydantic v2** | Request/response schemas |
| Settings | **pydantic-settings** | Typed env loading, fails fast on missing required vars |
| HTTP client | **httpx** (async) | For CAPI and the Sheets webhook |
| Background work | **FastAPI `BackgroundTasks`** in v1 | No Celery/Redis. Order volume does not justify a broker; see §6 for the upgrade path. |
| Rate limiting | **slowapi** | Per-IP limits on order/contact/lead endpoints |
| Logging | **structlog** → JSON to stdout | EasyPanel captures stdout |
| Testing | **pytest** + `pytest-asyncio` + `httpx.AsyncClient` | |

**Rejected:** Django (too heavy for 8 endpoints), Celery + Redis (unnecessary infrastructure at
this volume), an admin framework (Google Sheets is the v1 ops surface).

---

## 2. Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, lifespan, middleware, routers
│   ├── config.py                # Settings (pydantic-settings)
│   ├── database.py              # async engine, session factory, get_db dependency
│   ├── models/                  # SQLAlchemy models
│   │   ├── base.py              # DeclarativeBase, TimestampMixin, UUID pk
│   │   ├── product.py           # Product, Offer, Review
│   │   ├── order.py             # Order, OrderItem
│   │   ├── lead.py              # Lead (partial checkout capture)
│   │   ├── event.py             # TrackingEvent (CAPI audit log)
│   │   ├── contact.py           # ContactMessage
│   │   └── setting.py           # Setting (key/value)
│   ├── schemas/                 # Pydantic request/response models
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── lead.py
│   │   ├── contact.py
│   │   └── common.py            # ErrorResponse, Pagination
│   ├── api/
│   │   ├── deps.py              # shared dependencies
│   │   └── routes/
│   │       ├── health.py
│   │       ├── products.py
│   │       ├── orders.py
│   │       ├── leads.py
│   │       ├── contact.py
│   │       └── stats.py
│   ├── services/                # business logic — routes stay thin
│   │   ├── order_service.py     # price recomputation, creation, upsell
│   │   ├── pricing.py           # authoritative price calculation
│   │   ├── phone.py             # KSA normalise + validate (mirrors 16 §4)
│   │   ├── hashing.py           # SHA-256 normalisation per platform (24 §3)
│   │   ├── sheets.py            # Google Sheets webhook push
│   │   ├── upsell.py            # upsell product selection (08 §3.1)
│   │   └── capi/
│   │       ├── base.py          # shared retry/backoff/logging
│   │       ├── meta.py
│   │       ├── tiktok.py
│   │       ├── snap.py
│   │       └── dispatcher.py    # fan out one event to all three
│   ├── core/
│   │   ├── logging.py
│   │   ├── errors.py            # exception handlers → typed error responses
│   │   ├── security.py          # rate limits, honeypot, risk scoring
│   │   └── idempotency.py
│   └── seed.py                  # idempotent product/offer/settings seeding
├── alembic/
│   ├── env.py
│   └── versions/
├── tests/
│   ├── test_phone.py            # the full 16 §4.4 vector table
│   ├── test_pricing.py
│   ├── test_orders.py
│   ├── test_hashing.py          # known-vector tests, see 24 §3.4
│   └── test_upsell.py
├── .env.example
├── Dockerfile
├── docker-entrypoint.sh         # migrate → seed → serve
├── alembic.ini
├── requirements.txt
└── pyproject.toml
```

**Layering rule:** routes validate and delegate. All business logic lives in `services/`. A route
function should be under 15 lines. This keeps price calculation, phone handling, and CAPI
dispatch independently testable.

---

## 3. Database URL handling — read this, it will bite you

The provided internal URL is:

```
postgres://osool:osool@osool_database:5432/osool?sslmode=disable
```

Three problems for SQLAlchemy + asyncpg:

1. The scheme must be `postgresql+asyncpg://`, not `postgres://`
2. **asyncpg does not understand the `sslmode` query parameter** — it is a libpq/psycopg option.
   Passing it through raises `TypeError: connect() got an unexpected keyword argument 'sslmode'`.
   It must be stripped and translated.
3. Alembic runs synchronously and needs a `psycopg`-style URL, which *does* accept `sslmode`.

Handle it in one place:

```python
# app/config.py
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

def _split_url(raw: str) -> tuple[str, bool]:
    """Return (url_without_ssl_params, ssl_required)."""
    p = urlparse(raw)
    q = parse_qs(p.query)
    sslmode = (q.pop("sslmode", ["prefer"])[0] or "prefer").lower()
    ssl_required = sslmode not in ("disable", "allow", "prefer")
    return urlunparse(p._replace(query=urlencode(q, doseq=True))), ssl_required


class Settings(BaseSettings):
    DATABASE_URL: str  # accepts the EasyPanel-provided value verbatim

    @property
    def async_url(self) -> str:
        url, _ = _split_url(self.DATABASE_URL)
        return url.replace("postgres://", "postgresql+asyncpg://", 1) \
                  .replace("postgresql://", "postgresql+asyncpg://", 1)

    @property
    def sync_url(self) -> str:
        """For Alembic. psycopg accepts sslmode, so keep the original query string."""
        return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1) \
                                .replace("postgresql://", "postgresql+psycopg://", 1)

    @property
    def asyncpg_ssl(self) -> bool:
        _, required = _split_url(self.DATABASE_URL)
        return required
```

```python
# app/database.py
engine = create_async_engine(
    settings.async_url,
    connect_args={} if settings.asyncpg_ssl else {"ssl": False},
    pool_size=5, max_overflow=10, pool_pre_ping=True, pool_recycle=1800,
)
```

`pool_pre_ping=True` is important — EasyPanel's internal networking will drop idle connections
and without it the first request after an idle period fails.

---

## 4. Startup sequence

`docker-entrypoint.sh` runs in strict order, and the container **fails loudly** if any step fails
(a silently un-migrated database is far worse than a container that will not start):

```sh
#!/bin/sh
set -e
echo "→ waiting for database"
python -m app.wait_for_db          # retry loop, 30s timeout
echo "→ running migrations"
alembic upgrade head
echo "→ seeding"
python -m app.seed                 # idempotent
echo "→ starting server"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --proxy-headers --forwarded-allow-ips='*'
```

Notes:

- `--proxy-headers` and `--forwarded-allow-ips='*'` are **required** so `X-Forwarded-For` is
  honoured behind EasyPanel's proxy. Without them, every order records the proxy's IP, which
  silently destroys CAPI match quality and makes rate limiting useless.
- Migrations run in the entrypoint, not in the app's `lifespan`. With 2 workers, a lifespan
  migration would race and two workers could apply the same revision concurrently.
- **Wrap both the migration and the seed in a Postgres advisory lock** so that scaling to more than
  one replica — or a rolling redeploy where old and new containers overlap — cannot run them
  concurrently. Take the lock in `alembic/env.py` and at the top of `app/seed.py`:

  ```python
  # alembic/env.py, inside run_migrations_online() once the connection is open
  connection.execute(text("SELECT pg_advisory_lock(72401)"))
  # ... context.run_migrations() ...
  connection.execute(text("SELECT pg_advisory_unlock(72401)"))
  ```

  The lock is session-scoped, so a container that dies mid-migration releases it automatically when
  its connection drops. A second replica simply waits, then finds the revision already applied and
  exits cleanly.
- `app.seed` is idempotent (upsert by slug / by settings key) so restarts are safe.

---

## 5. Middleware and app setup

```python
# app/main.py — order matters
app.add_middleware(CORSMiddleware,
    allow_origins=settings.cors_origins,     # ["https://osool.shop", "https://www.osool.shop"]
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Idempotency-Key"],
)
app.add_middleware(RequestIdMiddleware)      # X-Request-ID, bound into structlog context
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.state.limiter = limiter                  # slowapi
```

- **CORS origins come from env and are never `*`.** A wildcard here lets any site post orders.
- `/docs` and `/redoc` are disabled in production (`docs_url=None if settings.ENV == "production"`).
- Global exception handlers map to the typed error shape in `22` §errors.
- Every request logs: method, path, status, duration, request id, client IP.

---

## 6. Background tasks

In v1, `BackgroundTasks` handles the two post-order side effects so the customer never waits on
them:

```python
@router.post("/api/orders", response_model=OrderCreated, status_code=201)
async def create_order(payload: OrderCreate, bg: BackgroundTasks, ...):
    order = await order_service.create(db, payload, client_ip, user_agent)
    bg.add_task(capi_dispatcher.send_purchase, order.id)
    bg.add_task(sheets.push_order, order.id)
    return OrderCreated.from_order(order)
```

**Critical rules**

- The order is **committed before** the background tasks are scheduled. A CAPI or Sheets failure
  must never fail the order or roll it back.
- Each task opens its **own** database session. Reusing the request's session after the response
  has been sent is a use-after-close bug.
- Each task is wrapped in its own try/except, logs failures with the order id, and records the
  outcome in `tracking_events` / `orders.sheet_synced_at`.
- Retries: 3 attempts with exponential backoff (1s, 4s, 16s) inside the task itself.
- A `POST /api/admin/resync/{order_id}` endpoint (protected by `ADMIN_TOKEN`) lets ops replay a
  failed Sheets push without touching the database directly.

**Upgrade path** (do not build in v1): if order volume exceeds a few hundred a day, or Sheets
failures become frequent, move to a `pending_jobs` table with a polling worker — still no broker.
Only introduce Celery + Redis if genuinely needed.

---

## 7. Health checks

| Endpoint | Purpose | Behaviour |
|---|---|---|
| `GET /health` | EasyPanel liveness | Returns 200 with `{status, version}` — **no database call**, so a slow DB does not cause a restart loop |
| `GET /health/ready` | Readiness / deploy gate | Executes `SELECT 1`, checks the Alembic revision matches head, returns 503 if not |

---

## 8. Configuration

All settings via `pydantic-settings`, typed, with the app **refusing to start** if a required
variable is missing. Full variable list in `27`.

```python
class Settings(BaseSettings):
    ENV: Literal["development", "production"] = "development"
    DATABASE_URL: str
    CORS_ORIGINS: str                     # comma-separated
    ADMIN_TOKEN: str

    SHEETS_WEBHOOK_URL: str | None = None
    SHEETS_WEBHOOK_SECRET: str | None = None

    META_PIXEL_ID: str | None = None
    META_CAPI_ACCESS_TOKEN: str | None = None
    META_TEST_EVENT_CODE: str | None = None

    TIKTOK_PIXEL_CODE: str | None = None
    TIKTOK_CAPI_ACCESS_TOKEN: str | None = None
    TIKTOK_TEST_EVENT_CODE: str | None = None

    SNAP_PIXEL_ID: str | None = None
    SNAP_CAPI_ACCESS_TOKEN: str | None = None
    SNAP_TEST_EVENT_CODE: str | None = None

    UPSELL_PRICE_SAR: int = 99
    UPSELL_WINDOW_SECONDS: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
```

**Tracking credentials are optional by design.** The site must run perfectly with them absent
(local development, and launch day before the ad accounts are ready). Each CAPI client checks
for its own credentials and no-ops with a debug log if they are missing. It must never raise.

---

## 9. Security

Full detail in `29`. Backend essentials:

- **Prices are always recomputed server-side** from the `offers` table. Client-supplied prices are
  ignored entirely, not validated. This is the single most important backend security rule.
- Rate limits: `POST /api/orders` 5/hour/IP · `POST /api/leads` 20/hour/IP · `POST /api/contact` 5/hour/IP
- Pydantic validates and constrains every input (max lengths on name and message).
- Phone validated server-side with the same rules as the client (`16` §4) — the client check is UX, the server check is the authority.
- `orders.id` is a UUIDv4, so thank-you URLs are unguessable. `order_number` is the short display value.
- The order-summary endpoint returns only display-safe fields — never the full phone, IP, user agent, or attribution payload.
- CAPI access tokens exist **only** in backend env. They are never returned by any endpoint and never logged.
- No PII in logs: log the order id, never the phone or the name.
- SQL injection is precluded by using the ORM exclusively — no raw f-string SQL.

---

## 10. Testing priorities

Ranked by what actually breaks and what it costs when it does:

1. **`test_phone.py`** — every vector in `16` §4.4, both directions. Highest value in the suite: a bug here silently rejects real customers.
2. **`test_pricing.py`** — every tier, multi-line carts, upsell delta, and the tampering case (client posts `price: 1` → server charges 199).
3. **`test_hashing.py`** — the known SHA-256 vectors in `24` §3.4 for all three platforms, especially TikTok keeping the `+` while Meta and Snap strip it.
4. **`test_orders.py`** — creation, idempotency (double POST with the same key → one order), duplicate detection, upsell accept/expiry (`410`)/double-apply (`409`).
5. **`test_upsell.py`** — product selection for all seven cart compositions in `08` §3.1, including the all-three fallback.

Target: services at ≥ 80% coverage. Routes can be thinner since they only validate and delegate.
