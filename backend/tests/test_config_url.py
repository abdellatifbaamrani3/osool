"""DATABASE_URL normalisation — asyncpg must never see sslmode (docs/20 §3)."""

from app.config import Settings, _split_url


def test_strip_sslmode_disable() -> None:
    raw = "postgres://osool:osool@osool_database:5432/osool?sslmode=disable"
    clean, ssl_required = _split_url(raw)
    assert "sslmode" not in clean
    assert ssl_required is False


def test_async_url_uses_asyncpg() -> None:
    s = Settings(
        DATABASE_URL="postgres://osool:osool@db:5432/osool?sslmode=disable",
        CORS_ORIGINS="http://localhost:3000",
        ADMIN_TOKEN="test",
        ENV="development",
    )
    assert s.async_url.startswith("postgresql+asyncpg://")
    assert "sslmode" not in s.async_url
    assert s.sync_url.startswith("postgresql+psycopg://")
    assert "sslmode=disable" in s.sync_url
    assert s.asyncpg_ssl is False
