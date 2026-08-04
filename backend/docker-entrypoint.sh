#!/bin/sh
# backend/docker-entrypoint.sh (docs/20 §4, docs/26 §4)
set -e

echo "[osool] preflight: checking required env…"
missing=0
for key in DATABASE_URL CORS_ORIGINS; do
  eval "val=\$$key"
  if [ -z "$val" ]; then
    echo "[osool] FATAL: $key is empty or missing. Set it in EasyPanel Environment." >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi

# Empty ADMIN_TOKEN from .env.example paste is a common EasyPanel crash.
if [ -z "$ADMIN_TOKEN" ]; then
  ADMIN_TOKEN=$(python -c 'import secrets; print(secrets.token_hex(32))')
  export ADMIN_TOKEN
  echo "[osool] WARN: ADMIN_TOKEN was empty — generated a temporary token."
  echo "[osool] WARN: Set a stable ADMIN_TOKEN in EasyPanel Environment, then redeploy."
fi

# Help diagnose wrong internal DB hostname (common EasyPanel mistake).
db_host=$(printf '%s' "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
echo "[osool] DATABASE host = ${db_host:-unknown}"
echo "[osool] ENV = ${ENV:-unset}"

echo "[osool] waiting for database…"
python -m app.wait_for_db

# Migrations/seed are not run on boot anymore — run manually when needed:
#   alembic upgrade head && python -m app.seed
echo "[osool] skipping migrations and seed on boot"

echo "[osool] starting uvicorn…"
PORT="${PORT:-8000}"
exec uvicorn app.main:app \
  --host 0.0.0.0 --port "$PORT" \
  --workers 2 \
  --proxy-headers --forwarded-allow-ips='*'
