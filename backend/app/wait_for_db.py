"""Retry until Postgres accepts connections (docs/26 §4)."""

from __future__ import annotations

import asyncio
import sys
import time

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings


async def main(timeout: int = 180) -> None:
    engine = create_async_engine(
        settings.async_url,
        connect_args={} if settings.asyncpg_ssl else {"ssl": False},
    )
    deadline = time.monotonic() + timeout
    while True:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print("[osool] database reachable")
            await engine.dispose()
            return
        except Exception as exc:
            if time.monotonic() > deadline:
                host = settings.DATABASE_URL.split("@")[-1].split("/")[0] if "@" in settings.DATABASE_URL else "?"
                print(f"[osool] database unreachable after {timeout}s: {exc}", file=sys.stderr)
                print(
                    "[osool] HINT: DATABASE_URL host must be the EasyPanel Postgres "
                    f"internal service name (currently trying: {host}). "
                    "Copy the internal URL from the database service, keep ?sslmode=disable.",
                    file=sys.stderr,
                )
                sys.exit(1)
            print("[osool] database not ready, retrying in 2s…")
            await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(main())
