#!/bin/sh
# backend/docker-entrypoint.sh (docs/20 §4, docs/26 §4)
set -e

echo "[osool] preflight: checking required env…"
missing=0
for key in DATABASE_URL CORS_ORIGINS ADMIN_TOKEN; do
  eval "val=\$$key"
  if [ -z "$val" ]; then
    echo "[osool] FATAL: $key is empty or missing. Set it in EasyPanel Environment." >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi

# Help diagnose wrong internal DB hostname (common EasyPanel mistake).
db_host=$(printf '%s' "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
echo "[osool] DATABASE host = ${db_host:-unknown}"
echo "[osool] ENV = ${ENV:-unset}"

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
