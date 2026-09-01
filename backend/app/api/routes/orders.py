"""Order persistence endpoints for checkout, thank-you, and upsell."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import AppError
from app.database import get_db
from app.models.enums import ItemKind, OrderStatus, PaymentMethod
from app.models.order import Order, OrderItem
from app.models.product import Offer, Product
from app.services.ip_intel import check_ip

router = APIRouter(prefix="/api", tags=["orders"])

UPSELL_DISCOUNT = 0.2
UPSELL_VALIDITY_MINUTES = 30


class OrderLineIn(BaseModel):
    slug: str
    offer_qty: int = Field(ge=1)
    bundles: int = Field(default=1, ge=1, le=10)


class OrderIn(BaseModel):
    name: str
    phone: str
    lines: list[OrderLineIn]
    event_id: str | None = None
    upsell_accepted: bool = False
    upsell_slug: str | None = None


def _normalize_saudi_mobile(raw: str) -> tuple[str, str]:
    digits = "".join(ch for ch in raw if ch.isdigit())
    if digits.startswith("00966"):
        digits = digits[5:]
    elif digits.startswith("966"):
        digits = digits[3:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 9 or not digits.startswith("5"):
        raise AppError(status_code=422, code="invalid_phone", message_ar="تأكد من الرقم — لازم جوال سعودي يبدأ بـ 05")
    return digits, f"966{digits}"


async def _order_number(db: AsyncSession) -> str:
    seq = await db.scalar(text("SELECT nextval('order_number_seq')"))
    return f"osool-{seq}"


def _single_price(product: Product) -> int:
    for offer in product.offers:
        if offer.qty == 1 and offer.is_active:
            return offer.price_sar
    return product.base_price_sar


def _upsell_price(product: Product) -> int:
    return round((_single_price(product) * (1 - UPSELL_DISCOUNT)) / 10) * 10 - 1


def _pick_upsell(products_by_slug: dict[str, Product], order_slugs: list[str]) -> Product:
    serum = "redensyl-biotin-hair-serum"
    drops = "iron-bisglycinate-drops"
    amp = "pdrn-scalp-ampoule"
    chosen = amp
    has = set(order_slugs).__contains__
    if has(serum) and has(drops) and has(amp):
        chosen = serum
    elif has(serum) and not has(drops) and not has(amp):
        chosen = amp
    elif has(drops) and not has(serum) and not has(amp):
        chosen = serum
    elif has(amp) and not has(serum) and not has(drops):
        chosen = serum
    elif has(serum) and has(drops) and not has(amp):
        chosen = amp
    elif has(serum) and has(amp) and not has(drops):
        chosen = drops
    elif has(drops) and has(amp) and not has(serum):
        chosen = serum
    return products_by_slug.get(chosen) or next(iter(products_by_slug.values()))


def _upsell_out(product: Product) -> dict[str, Any]:
    compare_at = _single_price(product)
    price = _upsell_price(product)
    return {
        "slug": product.slug,
        "short_name": product.short_name_ar,
        "cause_name": product.cause_name_ar,
        "reason": "كمّل النظام عشان تغطي الأسباب الثلاثة",
        "price_sar": price,
        "compare_at_sar": compare_at,
        "discount_pct": round((1 - price / compare_at) * 100),
    }


async def _load_order(db: AsyncSession, order_id: str) -> Order:
    try:
        uid = uuid.UUID(order_id)
    except ValueError:
        raise AppError(status_code=404, code="not_found", message_ar="الطلب غير موجود")
    result = await db.execute(
        select(Order).where(Order.id == uid).options(selectinload(Order.items))
    )
    order = result.scalars().unique().one_or_none()
    if order is None:
        raise AppError(status_code=404, code="not_found", message_ar="الطلب غير موجود")
    return order


@router.post("/orders")
async def create_order(
    payload: OrderIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if not payload.lines:
        raise AppError(status_code=422, code="invalid_lines", message_ar="السلة فاضية أو غير صالحة")

    national, e164 = _normalize_saudi_mobile(payload.phone)
    intel = await check_ip(request.headers)
    if not intel.ok:
        raise AppError(
            status_code=403,
            code=intel.risk_code or "geo_blocked",
            message_ar="الطلب متاح داخل السعودية فقط" if intel.risk_code == "geo_blocked" else "عطل الـ VPN أو البروكسي وأعد المحاولة",
        )

    slugs = [line.slug for line in payload.lines]
    result = await db.execute(
        select(Product)
        .where(Product.is_active.is_(True))
        .options(selectinload(Product.offers))
    )
    products = result.scalars().unique().all()
    products_by_slug = {p.slug: p for p in products}
    if len(products_by_slug) != len(set(slugs)):
        raise AppError(status_code=422, code="unknown_product", message_ar="منتج غير موجود")

    subtotal = 0
    order = Order(
        order_number=await _order_number(db),
        customer_name=payload.name.strip()[:60],
        phone_national=national,
        phone_e164=e164,
        subtotal_sar=0,
        shipping_sar=0,
        total_sar=0,
        currency="SAR",
        payment_method=PaymentMethod.cod,
        status=OrderStatus.new,
        event_id=payload.event_id or str(uuid.uuid4()),
        client_ip=intel.ip,
        user_agent=request.headers.get("user-agent"),
        risk_flag="geo_skipped" if intel.skipped else None,
    )

    for line in payload.lines:
        product = products_by_slug[line.slug]
        offer = next((o for o in product.offers if o.qty == line.offer_qty and o.is_active), None)
        if offer is None:
            raise AppError(status_code=422, code="unknown_offer", message_ar="العرض غير موجود")
        line_total = offer.price_sar * line.bundles
        subtotal += line_total
        order.items.append(
            OrderItem(
                product_id=product.id,
                offer_id=offer.id,
                kind=ItemKind.offer,
                product_name_ar=product.short_name_ar,
                product_sku=product.sku,
                offer_label_ar=f"{offer.title_ar} · {offer.duration_label_ar}",
                unit_qty=offer.qty,
                bundles=line.bundles,
                total_units=offer.qty * line.bundles,
                unit_price_sar=offer.price_sar,
                line_total_sar=line_total,
            )
        )

    upsell = _pick_upsell(products_by_slug, slugs)
    order.upsell_offered_product_id = upsell.id
    order.upsell_expires_at = datetime.now(timezone.utc) + timedelta(minutes=UPSELL_VALIDITY_MINUTES)

    if payload.upsell_accepted and (payload.upsell_slug is None or payload.upsell_slug == upsell.slug):
        upsell_total = _upsell_price(upsell)
        subtotal += upsell_total
        order.upsell_accepted = True
        order.upsell_resolved_at = datetime.now(timezone.utc)
        order.items.append(
            OrderItem(
                product_id=upsell.id,
                offer_id=None,
                kind=ItemKind.upsell,
                product_name_ar=upsell.short_name_ar,
                product_sku=upsell.sku,
                offer_label_ar="إكمال النظام · قطعة واحدة",
                unit_qty=1,
                bundles=1,
                total_units=1,
                unit_price_sar=upsell_total,
                line_total_sar=upsell_total,
            )
        )

    order.subtotal_sar = subtotal
    order.total_sar = subtotal
    db.add(order)
    await db.commit()
    await db.refresh(order)

    items = [
        {
            "product_short_name_ar": item.product_name_ar,
            "offer_label_ar": item.offer_label_ar,
            "bundles": item.bundles,
            "total_units": item.total_units,
            "line_total_sar": item.line_total_sar,
            "slug": next((s for s, p in products_by_slug.items() if p.sku == item.product_sku), upsell.slug),
        }
        for item in order.items
    ]

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "subtotal_sar": order.subtotal_sar,
        "shipping_sar": order.shipping_sar,
        "total_sar": order.total_sar,
        "currency": order.currency,
        "event_id": order.event_id,
        "items": items,
        "upsell": _upsell_out(upsell),
        "upsell_expires_at": order.upsell_expires_at.isoformat() if order.upsell_expires_at else None,
    }


@router.get("/orders/{order_id}/summary")
async def order_summary(order_id: str, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    order = await _load_order(db, order_id)
    items = [
        {
            "product_short_name_ar": item.product_name_ar,
            "offer_label_ar": item.offer_label_ar,
            "bundles": item.bundles,
            "total_units": item.total_units,
            "line_total_sar": item.line_total_sar,
            "slug": item.product_sku,
        }
        for item in order.items
    ]
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "phone_masked": "05***" + order.phone_national[-4:],
        "phone_e164": order.phone_e164,
        "subtotal_sar": order.subtotal_sar,
        "shipping_sar": order.shipping_sar,
        "total_sar": order.total_sar,
        "currency": order.currency,
        "items": items,
        "created_at": order.created_at.isoformat(),
    }
