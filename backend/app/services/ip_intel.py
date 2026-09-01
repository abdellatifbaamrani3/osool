"""IP extraction and KSA/VPN checks for orders and analytics."""

from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Any

import httpx
from starlette.datastructures import Headers

from app.config import settings

INSIGHTS_URL = "https://geoip.maxmind.com/geoip/v2.1/insights"


@dataclass(frozen=True)
class IpIntelResult:
    ok: bool
    ip: str | None
    country: str | None = None
    risk_code: str | None = None
    skipped: bool = False

    @property
    def countable_for_analytics(self) -> bool:
        if self.ok and self.country == "SA" and not self.skipped:
            return True
        # Local development rarely has a public visitor IP. Keep dashboards testable
        # without polluting production metrics.
        return bool(settings.ENV == "development" and self.ok)


def _is_private_or_local(ip: str) -> bool:
    if ip in {"127.0.0.1", "::1", "0.0.0.0"}:
        return True
    if ip.startswith(("10.", "192.168.", "169.254.")):
        return True
    if ip.startswith("172."):
        try:
            second = int(ip.split(".")[1])
        except (IndexError, ValueError):
            return False
        return 16 <= second <= 31
    return False


def client_ip_from_headers(headers: Headers) -> str | None:
    for name in ("cf-connecting-ip", "x-real-ip"):
        value = headers.get(name)
        if value and not _is_private_or_local(value.strip()):
            return value.strip()

    forwarded = headers.get("x-forwarded-for")
    if forwarded:
        for part in [p.strip() for p in forwarded.split(",") if p.strip()]:
            if not _is_private_or_local(part):
                return part

    true_client = headers.get("true-client-ip")
    if true_client and not _is_private_or_local(true_client.strip()):
        return true_client.strip()

    return headers.get("cf-connecting-ip") or headers.get("x-real-ip")


def _risk_from_maxmind(data: dict[str, Any]) -> str | None:
    traits = data.get("traits") or {}
    anonymizer = data.get("anonymizer") or {}

    for key in (
        "is_anonymous_vpn",
        "is_tor_exit_node",
        "is_public_proxy",
        "is_residential_proxy",
    ):
        if traits.get(key) or anonymizer.get(key):
            return "vpn_blocked"

    if traits.get("is_anonymous") or anonymizer.get("is_anonymous"):
        return "suspicious_ip"
    if traits.get("is_hosting_provider") or anonymizer.get("is_hosting_provider"):
        return "suspicious_ip"
    if traits.get("user_type") in {"hosting", "content_delivery_network"}:
        return "suspicious_ip"
    if isinstance(traits.get("ip_risk_snapshot"), (int, float)) and traits["ip_risk_snapshot"] >= 50:
        return "suspicious_ip"
    return None


async def check_ip(headers: Headers) -> IpIntelResult:
    ip = client_ip_from_headers(headers)
    if not ip or _is_private_or_local(ip):
        return IpIntelResult(ok=True, ip=ip or "unknown", skipped=True)

    if not settings.MAXMIND_ACCOUNT_ID or not settings.maxmind_license_key:
        return IpIntelResult(ok=True, ip=ip, skipped=True)

    token = base64.b64encode(
        f"{settings.MAXMIND_ACCOUNT_ID}:{settings.maxmind_license_key}".encode("utf-8")
    ).decode("ascii")

    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            res = await client.get(
                f"{INSIGHTS_URL}/{ip}",
                headers={"Authorization": f"Basic {token}", "Accept": "application/json"},
            )
        if res.status_code >= 400:
            return IpIntelResult(ok=True, ip=ip, skipped=True)
        data = res.json()
    except Exception:
        return IpIntelResult(ok=True, ip=ip, skipped=True)

    country = (
        ((data.get("country") or {}).get("iso_code"))
        or ((data.get("registered_country") or {}).get("iso_code"))
        or None
    )
    country = country.upper() if country else None
    if country != "SA":
        return IpIntelResult(ok=False, ip=ip, country=country, risk_code="geo_blocked")

    risk = _risk_from_maxmind(data)
    if risk:
        return IpIntelResult(ok=False, ip=ip, country=country, risk_code=risk)

    return IpIntelResult(ok=True, ip=ip, country=country)
