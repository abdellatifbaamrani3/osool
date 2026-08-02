"""Product API schemas (docs/22 §§2–3)."""

from __future__ import annotations

from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    qty: int
    price_sar: int
    per_unit_sar: int
    title_ar: str
    duration_label_ar: str
    badge_ar: str | None
    is_default: bool
    savings_sar: int
    sort_order: int


class ProductImage(BaseModel):
    url: str
    alt_ar: str
    ratio: str = "1:1"
    role: str = "main"


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    author_name_ar: str
    city_ar: str | None
    rating: int
    week_marker: int | None
    body_ar: str
    is_verified: bool
    has_photo: bool
    photo_url: str | None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    sku: str
    name_ar: str
    short_name_ar: str
    subtitle_ar: str
    hook_ar: str | None
    cause_number: int
    cause_name_ar: str
    category: str
    requires_supplement_warnings: bool
    base_price_sar: int
    content_key: str
    images: list[dict[str, Any]] = Field(default_factory=list)
    rating_avg: Decimal | None
    rating_count: int
    stock_count: int
    low_stock_threshold: int
    is_low_stock: bool
    offers: list[OfferOut]


class ProductDetailOut(ProductOut):
    reviews: list[ReviewOut] = Field(default_factory=list)
    rating_distribution: dict[str, int] = Field(default_factory=dict)
