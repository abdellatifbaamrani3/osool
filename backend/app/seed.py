"""Idempotent catalogue + settings seed (docs/21 §12)."""

from __future__ import annotations

import csv
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from sqlalchemy import create_engine, func, select, text
from sqlalchemy.orm import Session

from app.config import settings
from app.models.enums import ProductCategory
from app.models.product import Offer, Product, Review
from app.models.setting import Setting


def _data_dir() -> Path:
    here = Path(__file__).resolve()
    candidates = [
        here.parents[1] / "data",  # backend/data (Docker / EasyPanel)
        here.parents[2] / "assets",  # repo assets/ when running from a checkout
    ]
    for path in candidates:
        if (path / "products-seed.csv").exists():
            return path
    raise FileNotFoundError(
        "products-seed.csv not found. Expected backend/data/ or ../assets/."
    )


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _as_bool(value: str | bool) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def _placeholder_images(content_key: str, short_name_ar: str) -> list[dict]:
    return [
        {
            "url": f"/images/products/{content_key}-1.jpg",
            "alt_ar": f"{short_name_ar} على خلفية عاجية",
            "ratio": "1:1",
            "role": "main",
        }
    ]


def _upsert_products(session: Session, rows: list[dict[str, str]]) -> dict[str, Product]:
    by_slug: dict[str, Product] = {}
    for row in rows:
        slug = row["slug"].strip()
        product = session.scalar(select(Product).where(Product.slug == slug))
        images = _placeholder_images(row["content_key"].strip(), row["short_name_ar"].strip())
        fields = dict(
            sku=row["sku"].strip(),
            name_ar=row["name_ar"].strip(),
            short_name_ar=row["short_name_ar"].strip(),
            subtitle_ar=row["subtitle_ar"].strip(),
            hook_ar=row["hook_ar"].strip() or None,
            cause_number=int(row["cause_number"]),
            cause_name_ar=row["cause_name_ar"].strip(),
            category=ProductCategory(row["category"].strip()),
            requires_supplement_warnings=_as_bool(row["requires_supplement_warnings"]),
            base_price_sar=int(row["base_price_sar"]),
            stock_count=int(row["stock_count"]),
            low_stock_threshold=int(row["low_stock_threshold"]),
            content_key=row["content_key"].strip(),
            sort_order=int(row["sort_order"]),
            is_active=_as_bool(row["is_active"]),
            images=images,
        )
        if product is None:
            product = Product(slug=slug, **fields)
            session.add(product)
        else:
            for key, value in fields.items():
                setattr(product, key, value)
        by_slug[slug] = product
    session.flush()
    return by_slug


def _upsert_offers(
    session: Session, rows: list[dict[str, str]], by_slug: dict[str, Product]
) -> None:
    for row in rows:
        product = by_slug[row["product_slug"].strip()]
        qty = int(row["qty"])
        offer = session.scalar(
            select(Offer).where(Offer.product_id == product.id, Offer.qty == qty)
        )
        badge = row.get("badge_ar", "").strip() or None
        fields = dict(
            price_sar=int(row["price_sar"]),
            title_ar=row["title_ar"].strip(),
            duration_label_ar=row["duration_label_ar"].strip(),
            badge_ar=badge,
            is_default=_as_bool(row["is_default"]),
            sort_order=int(row["sort_order"]),
            is_active=_as_bool(row["is_active"]),
        )
        if offer is None:
            session.add(Offer(product_id=product.id, qty=qty, **fields))
        else:
            for key, value in fields.items():
                setattr(offer, key, value)
    session.flush()


def _seed_settings(session: Session) -> None:
    """Insert-if-absent only — never overwrite ops changes (docs/21 §12)."""
    defaults: list[tuple[str, str, str, str]] = [
        ("upsell_price_sar", str(settings.UPSELL_PRICE_SAR), "int", "سعر الأبسيل"),
        ("upsell_window_seconds", str(settings.UPSELL_WINDOW_SECONDS), "int", "مدة عرض الأبسيل بالثواني"),
        ("shipping_sar", str(settings.SHIPPING_SAR), "int", "رسوم التوصيل"),
        (
            "free_shipping_threshold_sar",
            str(settings.FREE_SHIPPING_THRESHOLD_SAR),
            "int",
            "حد التوصيل المجاني",
        ),
        (
            "live_activity_min_display",
            str(settings.LIVE_ACTIVITY_MIN_DISPLAY),
            "int",
            "أقل عدد لعرض النشاط الحي",
        ),
        (
            "whatsapp_number",
            settings.WHATSAPP_NUMBER or "TODO",
            "str",
            "رقم واتساب",
        ),
        (
            "confirmation_window_hours",
            str(settings.CONFIRMATION_WINDOW_HOURS),
            "int",
            "نافذة تأكيد الطلب بالساعات",
        ),
        ("delivery_days_min", str(settings.DELIVERY_DAYS_MIN), "int", "أقل أيام توصيل"),
        ("delivery_days_max", str(settings.DELIVERY_DAYS_MAX), "int", "أكثر أيام توصيل"),
    ]
    for key, value, value_type, description_ar in defaults:
        exists = session.get(Setting, key)
        if exists is None:
            session.add(
                Setting(
                    key=key,
                    value=value,
                    value_type=value_type,
                    description_ar=description_ar,
                )
            )


def _seed_reviews(
    session: Session, rows: list[dict[str, str]], by_slug: dict[str, Product]
) -> None:
    # Never ship fabricated reviews in production (docs/07 §6, docs/21 §12).
    if settings.ENV == "production":
        print("[osool] seed: skipping seed reviews (ENV=production)")
        return

    existing_seed = session.scalar(
        select(func.count()).select_from(Review).where(Review.is_seed.is_(True))
    )
    if existing_seed and existing_seed > 0:
        print("[osool] seed: seed reviews already present, skipping")
        return

    for row in rows:
        product = by_slug[row["product_slug"].strip()]
        has_photo = _as_bool(row["has_photo"])
        session.add(
            Review(
                product_id=product.id,
                author_name_ar=row["author_name_ar"].strip(),
                city_ar=row["city_ar"].strip() or None,
                rating=int(row["rating"]),
                week_marker=int(row["week_marker"]) if row.get("week_marker") else None,
                body_ar=row["body_ar"].strip(),
                is_verified=_as_bool(row["is_verified"]),
                has_photo=has_photo,
                photo_url=(
                    f"/images/reviews/{product.content_key}-{row['sort_order']}.jpg"
                    if has_photo
                    else None
                ),
                is_seed=True,
                is_published=True,
                sort_order=int(row["sort_order"]),
            )
        )
    session.flush()
    _refresh_product_ratings(session)


def _refresh_product_ratings(session: Session) -> None:
    products = session.scalars(select(Product)).all()
    for product in products:
        ratings = session.scalars(
            select(Review.rating).where(
                Review.product_id == product.id, Review.is_published.is_(True)
            )
        ).all()
        if not ratings:
            product.rating_avg = None
            product.rating_count = 0
            continue
        avg = sum(ratings) / len(ratings)
        product.rating_avg = Decimal(str(avg)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        product.rating_count = len(ratings)


def run_seed(session: Session) -> None:
    data = _data_dir()
    print(f"[osool] seed: reading from {data}")

    products = _upsert_products(session, _read_csv(data / "products-seed.csv"))
    _upsert_offers(session, _read_csv(data / "offers-seed.csv"), products)
    _seed_settings(session)

    reviews_path = data / "reviews-seed.csv"
    if reviews_path.exists():
        _seed_reviews(session, _read_csv(reviews_path), products)

    session.commit()
    print(
        f"[osool] seed: {len(products)} products, "
        f"{session.scalar(select(func.count()).select_from(Offer))} offers, "
        f"{session.scalar(select(func.count()).select_from(Setting))} settings"
    )


def main() -> None:
    engine = create_engine(settings.sync_url)
    with engine.connect() as conn:
        conn.execute(text("SELECT pg_advisory_lock(72402)"))
        conn.commit()
        try:
            with Session(bind=conn) as session:
                run_seed(session)
        finally:
            conn.execute(text("SELECT pg_advisory_unlock(72402)"))
            conn.commit()
    engine.dispose()


if __name__ == "__main__":
    main()
