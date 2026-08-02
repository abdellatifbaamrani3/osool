#!/bin/sh
# backend/docker-entrypoint.sh (docs/20 §4, docs/26 §4)
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
