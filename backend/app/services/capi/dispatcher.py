"""Server-side conversions for Meta, TikTok, and Snapchat (docs/24).

Missing tokens skip that platform. Failures never raise to the order request.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.order import Order
from app.services.capi.hashing import (
    hash_name,
    hash_phone_meta,
    hash_phone_tiktok,
    split_name,
)

log = logging.getLogger("osool.capi")
_TIMEOUT = httpx.Timeout(8.0, connect=4.0)
_COUNTRY = hash_name("sa")  # sha256 of "sa"


def _attr(order: Order, key: str) -> str | None:
    raw = (order.attribution or {}).get(key)
    if raw is None:
        return None
    value = str(raw).strip()
    return value or None


def _source_url(order: Order) -> str:
    return _attr(order, "event_source_url") or "https://osool.shop/"


async def send_purchase(order_id: UUID, *, value_sar: int | None = None, event_id: str | None = None, order_id_label: str | None = None) -> None:
    """Fire Purchase / CompletePayment / PURCHASE. Safe to call from BackgroundTasks."""
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Order).where(Order.id == order_id).options(selectinload(Order.items))
            )
            order = result.scalars().unique().one_or_none()
            if order is None:
                return
            ctx = {
                "order": order,
                "value": value_sar if value_sar is not None else order.total_sar,
                "event_id": event_id or order.event_id,
                "order_label": order_id_label or order.order_number,
            }
            for sender in (_send_meta, _send_tiktok, _send_snap):
                try:
                    await sender(ctx)
                except Exception as exc:  # noqa: BLE001 — one platform must not block the others
                    log.warning("capi_failed %s order=%s error=%s", sender.__name__, order.order_number, exc)
    except Exception as exc:  # noqa: BLE001
        log.warning("capi_dispatch_failed order=%s error=%s", order_id, exc)


async def _send_meta(ctx: dict[str, Any]) -> None:
    if not settings.META_PIXEL_ID or not settings.META_CAPI_ACCESS_TOKEN:
        return
    order: Order = ctx["order"]
    first, last = split_name(order.customer_name)
    now = int(datetime.now(timezone.utc).timestamp())
    user: dict[str, Any] = {
        "ph": [hash_phone_meta(order.phone_e164)],
        "country": [_COUNTRY],
        "external_id": [hash_name(str(order.id))],
        "client_ip_address": str(order.client_ip) if order.client_ip else None,
        "client_user_agent": order.user_agent,
        "fbc": _attr(order, "fbc"),
        "fbp": _attr(order, "fbp"),
    }
    if first:
        user["fn"] = [hash_name(first)]
    if last:
        user["ln"] = [hash_name(last)]
    user = {k: v for k, v in user.items() if v}

    payload: dict[str, Any] = {
        "data": [
            {
                "event_name": "Purchase",
                "event_time": now,
                "event_id": ctx["event_id"],
                "action_source": "website",
                "event_source_url": _source_url(order),
                "user_data": user,
                "custom_data": {
                    "currency": order.currency,
                    "value": ctx["value"],
                    "content_type": "product",
                    "content_ids": [item.product_sku for item in order.items],
                    "contents": [
                        {"id": item.product_sku, "quantity": item.total_units, "item_price": item.unit_price_sar}
                        for item in order.items
                    ],
                    "num_items": sum(item.total_units for item in order.items),
                    "order_id": ctx["order_label"],
                },
            }
        ]
    }
    if settings.META_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.META_TEST_EVENT_CODE

    url = (
        f"https://graph.facebook.com/{settings.META_API_VERSION}"
        f"/{settings.META_PIXEL_ID}/events"
    )
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        res = await client.post(url, params={"access_token": settings.META_CAPI_ACCESS_TOKEN}, json=payload)
        if res.status_code >= 300:
            log.warning("meta_capi_http %s %s", res.status_code, res.text[:300])


async def _send_tiktok(ctx: dict[str, Any]) -> None:
    if not settings.TIKTOK_PIXEL_CODE or not settings.TIKTOK_CAPI_ACCESS_TOKEN:
        return
    order: Order = ctx["order"]
    now = int(datetime.now(timezone.utc).timestamp())
    user: dict[str, Any] = {
        "phone": hash_phone_tiktok(order.phone_e164),
        "external_id": hash_name(str(order.id)),
        "ttclid": _attr(order, "ttclid"),
        "ttp": _attr(order, "ttp"),
        "ip": str(order.client_ip) if order.client_ip else None,
        "user_agent": order.user_agent,
    }
    user = {k: v for k, v in user.items() if v}

    payload: dict[str, Any] = {
        "event_source": "web",
        "event_source_id": settings.TIKTOK_PIXEL_CODE,
        "data": [
            {
                "event": "CompletePayment",
                "event_time": now,
                "event_id": ctx["event_id"],
                "user": user,
                "properties": {
                    "currency": order.currency,
                    "value": ctx["value"],
                    "content_type": "product",
                    "order_id": ctx["order_label"],
                    "contents": [
                        {
                            "content_id": item.product_sku,
                            "content_type": "product",
                            "content_name": item.product_name_ar,
                            "quantity": item.total_units,
                            "price": item.unit_price_sar,
                        }
                        for item in order.items
                    ],
                },
                "page": {
                    "url": _source_url(order),
                },
            }
        ],
    }
    if settings.TIKTOK_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.TIKTOK_TEST_EVENT_CODE

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        res = await client.post(
            "https://business-api.tiktok.com/open_api/v1.3/event/track/",
            headers={
                "Access-Token": settings.TIKTOK_CAPI_ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if res.status_code >= 300:
            log.warning("tiktok_capi_http %s %s", res.status_code, res.text[:300])
            return
        body = res.json() if res.content else {}
        if body.get("code") not in (0, None):
            log.warning("tiktok_capi_code %s", body)


async def _send_snap(ctx: dict[str, Any]) -> None:
    if not settings.SNAP_PIXEL_ID or not settings.SNAP_CAPI_ACCESS_TOKEN:
        return
    order: Order = ctx["order"]
    first, last = split_name(order.customer_name)
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    user: dict[str, Any] = {
        "ph": [hash_phone_meta(order.phone_e164)],
        "country": [_COUNTRY],
        "external_id": [hash_name(str(order.id))],
        "client_ip_address": str(order.client_ip) if order.client_ip else None,
        "client_user_agent": order.user_agent,
        "sc_click_id": _attr(order, "sc_click_id"),
        "sc_cookie1": _attr(order, "sc_cookie1"),
    }
    if first:
        user["fn"] = [hash_name(first)]
    if last:
        user["ln"] = [hash_name(last)]
    user = {k: v for k, v in user.items() if v}

    payload: dict[str, Any] = {
        "data": [
            {
                "event_name": "PURCHASE",
                "event_time": now_ms,
                "event_id": ctx["event_id"],
                "action_source": "WEB",
                "event_source_url": _source_url(order),
                "user_data": user,
                "custom_data": {
                    "currency": order.currency,
                    "value": ctx["value"],
                    "order_id": ctx["order_label"],
                    "content_type": "product",
                    "content_ids": [item.product_sku for item in order.items],
                    "num_items": str(sum(item.total_units for item in order.items)),
                },
            }
        ]
    }
    if settings.SNAP_TEST_EVENT_CODE:
        payload["test_event_code"] = settings.SNAP_TEST_EVENT_CODE

    url = f"https://tr.snapchat.com/v3/{settings.SNAP_PIXEL_ID}/events"
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        res = await client.post(
            url,
            params={"access_token": settings.SNAP_CAPI_ACCESS_TOKEN},
            json=payload,
        )
        if res.status_code >= 300:
            log.warning("snap_capi_http %s %s", res.status_code, res.text[:300])
