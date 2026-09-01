"""Protected admin dashboard APIs."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, Response
from pydantic import BaseModel
from sqlalchemy import func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.errors import AppError
from app.database import get_db
from app.models.analytics import AdminAuditLog
from app.models.enums import OrderStatus
from app.models.order import Order
from app.services.ip_intel import client_ip_from_headers

router = APIRouter(prefix="/api/admin", tags=["admin"])
COOKIE = "osool_admin_session"
SESSION_TTL_SECONDS = 60 * 60 * 12


class LoginIn(BaseModel):
    username: str
    password: str


class OrderPatchIn(BaseModel):
    status: str | None = None
    notes: str | None = None


def _secret() -> str:
    return settings.ADMIN_SESSION_SECRET or settings.ADMIN_TOKEN


def _sign(payload: str) -> str:
    return hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def _encode_session(username: str) -> str:
    payload = {
        "u": username,
        "exp": int((datetime.now(timezone.utc) + timedelta(seconds=SESSION_TTL_SECONDS)).timestamp()),
        "n": secrets.token_hex(8),
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8")).decode("ascii")
    return f"{raw}.{_sign(raw)}"


def _decode_session(token: str | None) -> str | None:
    if not token or "." not in token:
        return None
    raw, sig = token.rsplit(".", 1)
    if not hmac.compare_digest(_sign(raw), sig):
        return None
    try:
        payload = json.loads(base64.urlsafe_b64decode(raw.encode("ascii")))
    except Exception:
        return None
    if int(payload.get("exp", 0)) < int(datetime.now(timezone.utc).timestamp()):
        return None
    return str(payload.get("u") or "")


def _require_admin(request: Request) -> str:
    username = _decode_session(request.cookies.get(COOKIE))
    if not username:
        raise AppError(status_code=401, code="unauthorized", message_ar="تسجيل الدخول مطلوب")
    return username


async def _audit(
    db: AsyncSession,
    request: Request,
    username: str,
    action: str,
    entity_type: str | None = None,
    entity_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        db.add(
            AdminAuditLog(
                admin_username=username,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                metadata_json=metadata or {},
                client_ip=client_ip_from_headers(request.headers),
            )
        )
        await db.commit()
    except Exception:
        await db.rollback()


@router.post("/login")
async def login(payload: LoginIn, request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    expected_user = settings.ADMIN_DASHBOARD_USERNAME
    expected_pass = settings.ADMIN_DASHBOARD_PASSWORD
    if not expected_user or not expected_pass:
        raise AppError(status_code=503, code="admin_disabled", message_ar="لوحة التحكم غير مفعّلة")
    if not (
        hmac.compare_digest(payload.username, expected_user)
        and hmac.compare_digest(payload.password, expected_pass)
    ):
        raise AppError(status_code=401, code="bad_login", message_ar="بيانات الدخول غير صحيحة")

    token = _encode_session(payload.username)
    response.set_cookie(
        COOKIE,
        token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=settings.ENV == "production",
        samesite="lax",
        path="/api/admin",
    )
    await _audit(db, request, payload.username, "login")
    return {"ok": True, "username": payload.username}


@router.post("/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> dict[str, bool]:
    username = _decode_session(request.cookies.get(COOKIE))
    response.delete_cookie(COOKIE, path="/api/admin")
    if username:
        await _audit(db, request, username, "logout")
    return {"ok": True}


@router.get("/me")
async def me(username: str = Depends(_require_admin)) -> dict[str, str]:
    return {"username": username}


def _range(start: str | None, end: str | None) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start_dt = datetime.fromisoformat(start.replace("Z", "+00:00")) if start else now - timedelta(days=7)
    end_dt = datetime.fromisoformat(end.replace("Z", "+00:00")) if end else now
    return start_dt, end_dt


@router.get("/metrics")
async def metrics(
    start: str | None = None,
    end: str | None = None,
    db: AsyncSession = Depends(get_db),
    _username: str = Depends(_require_admin),
) -> dict[str, Any]:
    start_dt, end_dt = _range(start, end)
    params = {"start": start_dt, "end": end_dt}

    event_counts = (
        await db.execute(
            text(
                """
                SELECT event_name, COUNT(*)::int AS count, COUNT(DISTINCT session_id)::int AS sessions
                FROM analytics_events
                WHERE is_counted = true AND created_at >= :start AND created_at < :end
                GROUP BY event_name
                """
            ),
            params,
        )
    ).mappings().all()
    by_event = {row["event_name"]: {"count": row["count"], "sessions": row["sessions"]} for row in event_counts}

    orders_row = (
        await db.execute(
            text(
                """
                SELECT COUNT(*)::int AS orders,
                       COALESCE(SUM(total_sar), 0)::int AS revenue,
                       COALESCE(AVG(total_sar), 0)::numeric(10, 2) AS aov,
                       COUNT(*) FILTER (WHERE upsell_accepted = true)::int AS upsell_accepted
                FROM orders
                WHERE created_at >= :start AND created_at < :end
                """
            ),
            params,
        )
    ).mappings().one()

    status_rows = (
        await db.execute(
            text(
                """
                SELECT status::text AS status, COUNT(*)::int AS count
                FROM orders
                WHERE created_at >= :start AND created_at < :end
                GROUP BY status
                ORDER BY count DESC
                """
            ),
            params,
        )
    ).mappings().all()

    product_rows = (
        await db.execute(
            text(
                """
                SELECT product_sku, product_name_ar, SUM(total_units)::int AS units, SUM(line_total_sar)::int AS revenue
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.created_at >= :start AND o.created_at < :end
                GROUP BY product_sku, product_name_ar
                ORDER BY revenue DESC
                """
            ),
            params,
        )
    ).mappings().all()

    daily_rows = (
        await db.execute(
            text(
                """
                SELECT date_trunc('day', created_at)::date AS day,
                       COUNT(*)::int AS orders,
                       COALESCE(SUM(total_sar), 0)::int AS revenue
                FROM orders
                WHERE created_at >= :start AND created_at < :end
                GROUP BY day
                ORDER BY day
                """
            ),
            params,
        )
    ).mappings().all()

    visitors = by_event.get("page_view", {}).get("sessions", 0)
    add_to_cart = by_event.get("add_to_cart", {}).get("sessions", 0)
    checkout_open = by_event.get("checkout_open", {}).get("sessions", 0)
    orders = int(orders_row["orders"])
    return {
        "range": {"start": start_dt.isoformat(), "end": end_dt.isoformat()},
        "kpis": {
            "visitors": visitors,
            "page_views": by_event.get("page_view", {}).get("count", 0),
            "cta_clicks": by_event.get("cta_click", {}).get("count", 0),
            "add_to_cart": add_to_cart,
            "checkout_open": checkout_open,
            "orders": orders,
            "revenue_sar": int(orders_row["revenue"]),
            "aov_sar": float(orders_row["aov"]),
            "conversion_rate": orders / visitors if visitors else 0,
            "add_to_cart_rate": add_to_cart / visitors if visitors else 0,
            "checkout_rate": checkout_open / visitors if visitors else 0,
            "upsell_acceptance_rate": int(orders_row["upsell_accepted"]) / orders if orders else 0,
        },
        "orders_by_status": [dict(row) for row in status_rows],
        "top_products": [dict(row) for row in product_rows],
        "daily": [
            {"day": str(row["day"]), "orders": row["orders"], "revenue_sar": row["revenue"]}
            for row in daily_rows
        ],
    }


@router.get("/orders")
async def list_orders(
    q: str | None = Query(default=None, max_length=80),
    status: str | None = Query(default=None, max_length=30),
    start: str | None = None,
    end: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    _username: str = Depends(_require_admin),
) -> dict[str, Any]:
    start_dt, end_dt = _range(start, end)
    stmt = select(Order).where(Order.created_at >= start_dt, Order.created_at < end_dt)
    count_stmt = select(func.count()).select_from(Order).where(Order.created_at >= start_dt, Order.created_at < end_dt)
    if status:
        stmt = stmt.where(Order.status == status)
        count_stmt = count_stmt.where(Order.status == status)
    if q:
        like = f"%{q.strip()}%"
        cond = or_(Order.order_number.ilike(like), Order.customer_name.ilike(like), Order.phone_e164.ilike(like))
        stmt = stmt.where(cond)
        count_stmt = count_stmt.where(cond)
    stmt = stmt.options(selectinload(Order.items)).order_by(Order.created_at.desc()).limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().unique().all()
    total = await db.scalar(count_stmt)
    return {
        "total": total or 0,
        "orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "phone_e164": o.phone_e164,
                "total_sar": o.total_sar,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "payment_method": o.payment_method.value if hasattr(o.payment_method, "value") else str(o.payment_method),
                "upsell_accepted": o.upsell_accepted,
                "risk_flag": o.risk_flag,
                "created_at": o.created_at.isoformat(),
                "items": [
                    {"name": i.product_name_ar, "sku": i.product_sku, "qty": i.total_units, "total_sar": i.line_total_sar}
                    for i in o.items
                ],
            }
            for o in rows
        ],
    }


@router.get("/orders/{order_id}")
async def order_detail(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    _username: str = Depends(_require_admin),
) -> dict[str, Any]:
    result = await db.execute(select(Order).where(Order.id == order_id).options(selectinload(Order.items)))
    order = result.scalars().unique().one_or_none()
    if not order:
        raise AppError(status_code=404, code="not_found", message_ar="الطلب غير موجود")
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "phone_national": order.phone_national,
        "phone_e164": order.phone_e164,
        "subtotal_sar": order.subtotal_sar,
        "shipping_sar": order.shipping_sar,
        "total_sar": order.total_sar,
        "currency": order.currency,
        "status": order.status.value if hasattr(order.status, "value") else str(order.status),
        "payment_method": order.payment_method.value if hasattr(order.payment_method, "value") else str(order.payment_method),
        "upsell_accepted": order.upsell_accepted,
        "risk_flag": order.risk_flag,
        "client_ip": str(order.client_ip) if order.client_ip else None,
        "user_agent": order.user_agent,
        "notes": order.notes,
        "created_at": order.created_at.isoformat(),
        "confirmed_at": order.confirmed_at.isoformat() if order.confirmed_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "items": [
            {
                "name": i.product_name_ar,
                "sku": i.product_sku,
                "offer": i.offer_label_ar,
                "kind": i.kind.value if hasattr(i.kind, "value") else str(i.kind),
                "unit_qty": i.unit_qty,
                "bundles": i.bundles,
                "total_units": i.total_units,
                "unit_price_sar": i.unit_price_sar,
                "line_total_sar": i.line_total_sar,
            }
            for i in order.items
        ],
    }


@router.patch("/orders/{order_id}")
async def patch_order(
    order_id: UUID,
    payload: OrderPatchIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    username: str = Depends(_require_admin),
) -> dict[str, Any]:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().one_or_none()
    if not order:
        raise AppError(status_code=404, code="not_found", message_ar="الطلب غير موجود")

    if payload.status:
        try:
            order.status = OrderStatus(payload.status)
        except ValueError:
            raise AppError(status_code=422, code="bad_status", message_ar="حالة الطلب غير صالحة")
        if order.status == OrderStatus.confirmed and not order.confirmed_at:
            order.confirmed_at = datetime.now(timezone.utc)
        if order.status == OrderStatus.delivered and not order.delivered_at:
            order.delivered_at = datetime.now(timezone.utc)
    if payload.notes is not None:
        order.notes = payload.notes[:2000]
    await db.commit()
    await _audit(
        db,
        request,
        username,
        "order_update",
        "order",
        str(order.id),
        {"status": payload.status, "notes_changed": payload.notes is not None},
    )
    return {"ok": True}
