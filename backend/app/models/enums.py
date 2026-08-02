"""Postgres enum names — created explicitly in Alembic (docs/21 §11)."""

from __future__ import annotations

import enum


class ProductCategory(str, enum.Enum):
    cosmetic_leave_on = "cosmetic_leave_on"
    cosmetic_rinse_off = "cosmetic_rinse_off"
    supplement_oral = "supplement_oral"


class PaymentMethod(str, enum.Enum):
    cod = "cod"


class OrderStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    no_answer = "no_answer"
    cancelled = "cancelled"
    returned = "returned"


class ItemKind(str, enum.Enum):
    offer = "offer"
    upsell = "upsell"


class AdPlatform(str, enum.Enum):
    meta = "meta"
    tiktok = "tiktok"
    snap = "snap"
