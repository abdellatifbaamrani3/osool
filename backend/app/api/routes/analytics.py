"""First-party analytics ingestion."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.analytics import AnalyticsEvent
from app.services.ip_intel import check_ip

router = APIRouter(prefix="/api", tags=["analytics"])


class AnalyticsEventIn(BaseModel):
    event_name: str = Field(min_length=2, max_length=40)
    session_id: str = Field(min_length=8, max_length=80)
    path: str = Field(min_length=1, max_length=800)
    product_slug: str | None = Field(default=None, max_length=120)
    cta_id: str | None = Field(default=None, max_length=120)
    order_id: str | None = Field(default=None, max_length=80)
    value_sar: int | None = None
    referrer: str | None = Field(default=None, max_length=1000)
    utm: dict[str, Any] = Field(default_factory=dict)


@router.post("/analytics/events")
async def record_event(
    payload: AnalyticsEventIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, bool]:
    intel = await check_ip(request.headers)
    if not intel.countable_for_analytics:
        return {"ok": True, "counted": False}

    event = AnalyticsEvent(
        event_name=payload.event_name,
        session_id=payload.session_id,
        path=payload.path[:2000],
        product_slug=payload.product_slug,
        cta_id=payload.cta_id,
        order_id=payload.order_id,
        value_sar=payload.value_sar,
        referrer=payload.referrer,
        utm=payload.utm,
        client_ip=intel.ip,
        country=intel.country,
        is_counted=True,
        blocked_reason=None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(event)
    await db.commit()
    return {"ok": True, "counted": True}
