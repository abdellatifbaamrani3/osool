"""Settings and DATABASE_URL normalisation (docs/20 §3, docs/27)."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_url(raw: str) -> tuple[str, bool]:
    """Return (url_without_ssl_params, ssl_required).

    asyncpg rejects the libpq `sslmode` query param — strip and translate.
    """
    p = urlparse(raw)
    q = parse_qs(p.query)
    sslmode = (q.pop("sslmode", ["prefer"])[0] or "prefer").lower()
    ssl_required = sslmode not in ("disable", "allow", "prefer")
    clean = urlunparse(p._replace(query=urlencode(q, doseq=True)))
    return clean, ssl_required


class Settings(BaseSettings):
    ENV: Literal["development", "production"] = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str
    CORS_ORIGINS: str
    ADMIN_TOKEN: str

    SHEETS_WEBHOOK_URL: str | None = None
    SHEETS_WEBHOOK_SECRET: str | None = None

    META_PIXEL_ID: str | None = None
    META_CAPI_ACCESS_TOKEN: str | None = None
    META_TEST_EVENT_CODE: str | None = None
    META_API_VERSION: str = "v21.0"

    TIKTOK_PIXEL_CODE: str | None = None
    TIKTOK_CAPI_ACCESS_TOKEN: str | None = None
    TIKTOK_TEST_EVENT_CODE: str | None = None

    SNAP_PIXEL_ID: str | None = None
    SNAP_CAPI_ACCESS_TOKEN: str | None = None
    SNAP_TEST_EVENT_CODE: str | None = None

    MAXMIND_ACCOUNT_ID: str | None = None
    MAXMIND_LICENSE_KEY: str | None = None
    MAXMIND_API_KEY: str | None = None  # alias for MAXMIND_LICENSE_KEY
    ORDER_PHONE_WHITELIST: str | None = None

    UPSELL_PRICE_SAR: int = 99
    UPSELL_WINDOW_SECONDS: int = 15
    SHIPPING_SAR: int = 0
    FREE_SHIPPING_THRESHOLD_SAR: int = 0
    DELIVERY_DAYS_MIN: int = 2
    DELIVERY_DAYS_MAX: int = 4
    CONFIRMATION_WINDOW_HOURS: int = 24
    LIVE_ACTIVITY_MIN_DISPLAY: int = 3
    WHATSAPP_NUMBER: str | None = None

    APP_VERSION: str = Field(default="0.1.0")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("DATABASE_URL", "CORS_ORIGINS", "ADMIN_TOKEN")
    @classmethod
    def required_non_empty(cls, v: str) -> str:
        if not v or not str(v).strip():
            raise ValueError("required but not set")
        return v.strip()

    @property
    def async_url(self) -> str:
        url, _ = _split_url(self.DATABASE_URL)
        return url.replace("postgres://", "postgresql+asyncpg://", 1).replace(
            "postgresql://", "postgresql+asyncpg://", 1
        )

    @property
    def sync_url(self) -> str:
        """For Alembic. psycopg accepts sslmode — keep the original query string."""
        return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1).replace(
            "postgresql://", "postgresql+psycopg://", 1
        )

    @property
    def asyncpg_ssl(self) -> bool:
        _, required = _split_url(self.DATABASE_URL)
        return required

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def maxmind_license_key(self) -> str | None:
        return self.MAXMIND_LICENSE_KEY or self.MAXMIND_API_KEY

    def log_optional_warnings(self) -> None:
        if not self.SHEETS_WEBHOOK_URL:
            print("[osool] WARN: SHEETS_WEBHOOK_URL not set — orders will not reach Google Sheets.")
        if not self.META_CAPI_ACCESS_TOKEN:
            print("[osool] WARN: META_CAPI_ACCESS_TOKEN not set — Meta server events disabled.")
        if not self.TIKTOK_CAPI_ACCESS_TOKEN:
            print("[osool] WARN: TIKTOK_CAPI_ACCESS_TOKEN not set — TikTok server events disabled.")
        if not self.SNAP_CAPI_ACCESS_TOKEN:
            print("[osool] WARN: SNAP_CAPI_ACCESS_TOKEN not set — Snapchat server events disabled.")
        if not self.MAXMIND_ACCOUNT_ID or not self.maxmind_license_key:
            print("[osool] WARN: MaxMind credentials not set — geo/VPN order gate disabled.")


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()  # type: ignore[call-arg]
    except Exception as exc:
        print(f"[osool] FATAL: configuration error — {exc}")
        raise


settings = get_settings()
