"""CAPI audit log (docs/21 §8)."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID as UUIDType

from sqlalchemy import DateTime, ForeignKey, Index, SmallInteger, String, Text, text
from sqlalchemy.dialects.postgresql import ENUM, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin
from app.models.enums import AdPlatform

ad_platform_enum = ENUM(
    AdPlatform,
    name="ad_platform",
    create_type=False,
    values_callable=lambda x: [e.value for e in x],
)


class TrackingEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "tracking_events"
    __table_args__ = (
        Index("ix_tracking_events_order_id", "order_id"),
        Index("ix_tracking_events_platform_status_created", "platform", "status", "created_at"),
        Index("ix_tracking_events_event_id", "event_id"),
    )

    order_id: Mapped[UUIDType | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL")
    )
    event_id: Mapped[str] = mapped_column(String(64), nullable=False)
    event_name: Mapped[str] = mapped_column(String(40), nullable=False)
    platform: Mapped[AdPlatform] = mapped_column(ad_platform_enum, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    http_status: Mapped[int | None] = mapped_column(SmallInteger)
    request_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    response_body: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    error: Mapped[str | None] = mapped_column(Text)
    attempts: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default=text("1"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
