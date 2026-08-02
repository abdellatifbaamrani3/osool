"""Partial checkout leads (docs/21 §6)."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID as UUIDType

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Lead(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_phone_national", "phone_national"),
        Index("ix_leads_created_at", "created_at"),
        Index(
            "ix_leads_unconverted",
            "converted_order_id",
            postgresql_where=text("converted_order_id IS NULL"),
        ),
    )

    customer_name: Mapped[str | None] = mapped_column(String(60))
    phone_national: Mapped[str | None] = mapped_column(String(9))
    phone_e164: Mapped[str | None] = mapped_column(String(16))
    cart_snapshot: Mapped[list[Any]] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    cart_value_sar: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    attribution: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    client_ip: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    converted_order_id: Mapped[UUIDType | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL")
    )
    recovery_status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default=text("'new'")
    )
    sheet_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
