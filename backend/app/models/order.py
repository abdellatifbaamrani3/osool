"""Order and OrderItem (docs/21 §§4–5)."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID as UUIDType

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import ENUM, INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ItemKind, OrderStatus, PaymentMethod

payment_method_enum = ENUM(
    PaymentMethod,
    name="payment_method",
    create_type=False,
    values_callable=lambda x: [e.value for e in x],
)
order_status_enum = ENUM(
    OrderStatus,
    name="order_status",
    create_type=False,
    values_callable=lambda x: [e.value for e in x],
)
item_kind_enum = ENUM(
    ItemKind,
    name="item_kind",
    create_type=False,
    values_callable=lambda x: [e.value for e in x],
)


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_phone_national", "phone_national"),
        Index("ix_orders_created_at", "created_at"),
        Index("ix_orders_status", "status"),
        Index(
            "ix_orders_sheet_unsynced",
            "sheet_synced_at",
            postgresql_where=text("sheet_synced_at IS NULL"),
        ),
    )

    order_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(60), nullable=False)
    phone_national: Mapped[str] = mapped_column(String(9), nullable=False)
    phone_e164: Mapped[str] = mapped_column(String(16), nullable=False)
    subtotal_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    shipping_sar: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    total_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, server_default=text("'SAR'"))
    payment_method: Mapped[PaymentMethod] = mapped_column(
        payment_method_enum, nullable=False, server_default=text("'cod'")
    )
    status: Mapped[OrderStatus] = mapped_column(
        order_status_enum, nullable=False, server_default=text("'new'")
    )
    upsell_offered_product_id: Mapped[UUIDType | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL")
    )
    upsell_accepted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    upsell_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    upsell_resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    event_id: Mapped[str] = mapped_column(String(64), nullable=False)
    upsell_event_id: Mapped[str | None] = mapped_column(String(64))
    client_ip: Mapped[str | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    attribution: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    risk_flag: Mapped[str | None] = mapped_column(String(40))
    idempotency_key: Mapped[str | None] = mapped_column(String(64), unique=True)
    sheet_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sheet_sync_attempts: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, server_default=text("0")
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)

    items: Mapped[list[OrderItem]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "order_items"

    order_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False
    )
    offer_id: Mapped[UUIDType | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("offers.id", ondelete="RESTRICT")
    )
    kind: Mapped[ItemKind] = mapped_column(
        item_kind_enum, nullable=False, server_default=text("'offer'")
    )
    product_name_ar: Mapped[str] = mapped_column(String(200), nullable=False)
    product_sku: Mapped[str] = mapped_column(String(40), nullable=False)
    offer_label_ar: Mapped[str | None] = mapped_column(String(120))
    unit_qty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    bundles: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default=text("1"))
    total_units: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    unit_price_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    line_total_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    order: Mapped[Order] = relationship(back_populates="items")
