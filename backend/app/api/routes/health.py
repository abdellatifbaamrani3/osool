"""Liveness and readiness (docs/20 §7, docs/22 §1)."""

from __future__ import annotations

from fastapi import APIRouter, Response, status
from sqlalchemy import text

from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from app.config import settings
from app.database import engine

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness — no DB call, so a slow DB cannot restart-loop the container."""
    return {"status": "ok", "version": settings.APP_VERSION}


@router.get("/health/ready")
async def ready(response: Response) -> dict[str, str | bool]:
    """Readiness — DB reachable and Alembic head applied."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

            def _alembic_ok(sync_conn) -> tuple[bool, str | None, str | None]:
                cfg = Config("alembic.ini")
                script = ScriptDirectory.from_config(cfg)
                head = script.get_current_head()
                ctx = MigrationContext.configure(sync_conn)
                current = ctx.get_current_revision()
                return current == head, current, head

            ok, current, head = await conn.run_sync(_alembic_ok)
    except Exception as exc:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unavailable",
            "database": False,
            "migrations": False,
            "detail": str(exc.__class__.__name__),
        }

    if not ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unavailable",
            "database": True,
            "migrations": False,
            "current": current or "",
            "head": head or "",
        }

    return {"status": "ready", "database": True, "migrations": True}
