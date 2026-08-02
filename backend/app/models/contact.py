"""Contact form messages (docs/21 §9)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class ContactMessage(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "contact_messages"

    name: Mapped[str] = mapped_column(String(60), nullable=False)
    phone_national: Mapped[str] = mapped_column(String(9), nullable=False)
    phone_e164: Mapped[str] = mapped_column(String(16), nullable=False)
    subject: Mapped[str] = mapped_column(String(40), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    client_ip: Mapped[str | None] = mapped_column(INET)
    handled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    sheet_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
