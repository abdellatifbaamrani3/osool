"""First-party analytics events counted only after IP intelligence passes."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class AnalyticsEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "analytics_events"
    __table_args__ = (
        Index("ix_analytics_events_created_at", "created_at"),
        Index("ix_analytics_events_name_created", "event_name", "created_at"),
        Index("ix_analytics_events_session_created", "session_id", "created_at"),
        Index("ix_analytics_events_product_created", "product_slug", "created_at"),
    )

    event_name: Mapped[str] = mapped_column(String(40), nullable=False)
    session_id: Mapped[str] = mapped_column(String(80), nullable=False)
    path: Mapped[str] = mapped_column(Text, nullable=False)
    product_slug: Mapped[str | None] = mapped_column(String(120))
    cta_id: Mapped[str | None] = mapped_column(String(120))
    order_id: Mapped[str | None] = mapped_column(String(80))
    value_sar: Mapped[int | None] = mapped_column(Integer)
    referrer: Mapped[str | None] = mapped_column(Text)
    utm: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    client_ip: Mapped[str | None] = mapped_column(INET)
    country: Mapped[str | None] = mapped_column(String(2))
    is_counted: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    blocked_reason: Mapped[str | None] = mapped_column(String(40))
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )


class AdminAuditLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "admin_audit_log"
    __table_args__ = (Index("ix_admin_audit_log_created_at", "created_at"),)

    admin_username: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(40))
    entity_id: Mapped[str | None] = mapped_column(String(80))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    client_ip: Mapped[str | None] = mapped_column(INET)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
