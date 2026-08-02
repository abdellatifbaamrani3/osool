"""Product, Offer, Review (docs/21 §§2–3, §7)."""

from __future__ import annotations

from decimal import Decimal
from typing import Any
from uuid import UUID as UUIDType

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import ENUM, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ProductCategory

product_category_enum = ENUM(
    ProductCategory,
    name="product_category",
    create_type=False,
    values_callable=lambda x: [e.value for e in x],
)


class Product(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (Index("ix_products_active_sort", "is_active", "sort_order"),)

    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    sku: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    name_ar: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name_ar: Mapped[str] = mapped_column(String(80), nullable=False)
    subtitle_ar: Mapped[str] = mapped_column(String(240), nullable=False)
    hook_ar: Mapped[str | None] = mapped_column(String(240))
    cause_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    cause_name_ar: Mapped[str] = mapped_column(String(80), nullable=False)
    category: Mapped[ProductCategory] = mapped_column(product_category_enum, nullable=False)
    requires_supplement_warnings: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    base_price_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    stock_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    low_stock_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("30")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    sort_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    content_key: Mapped[str] = mapped_column(String(40), nullable=False)
    images: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB, nullable=False, server_default=text("'[]'::jsonb")
    )
    rating_avg: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))
    rating_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

    offers: Mapped[list[Offer]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="Offer.sort_order"
    )
    reviews: Mapped[list[Review]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="Review.sort_order"
    )


class Offer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "offers"
    __table_args__ = (
        UniqueConstraint("product_id", "qty", name="uq_offers_product_qty"),
        Index(
            "uq_offers_one_default",
            "product_id",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )

    product_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    qty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    price_sar: Mapped[int] = mapped_column(Integer, nullable=False)
    title_ar: Mapped[str] = mapped_column(String(60), nullable=False)
    duration_label_ar: Mapped[str] = mapped_column(String(80), nullable=False)
    badge_ar: Mapped[str | None] = mapped_column(String(40))
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    sort_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    product: Mapped[Product] = relationship(back_populates="offers")


class Review(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reviews"
    __table_args__ = (
        Index("ix_reviews_product_published_sort", "product_id", "is_published", "sort_order"),
    )

    product_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    author_name_ar: Mapped[str] = mapped_column(String(60), nullable=False)
    city_ar: Mapped[str | None] = mapped_column(String(60))
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    week_marker: Mapped[int | None] = mapped_column(SmallInteger)
    body_ar: Mapped[str] = mapped_column(Text, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    has_photo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    photo_url: Mapped[str | None] = mapped_column(Text)
    is_seed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    sort_order: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default=text("0"))

    product: Mapped[Product] = relationship(back_populates="reviews")
