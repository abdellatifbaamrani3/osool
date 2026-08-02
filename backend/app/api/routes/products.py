"""Product catalogue endpoints (docs/22 §§2–3)."""

from __future__ import annotations

from collections import Counter

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import AppError
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductDetailOut, ProductOut, ReviewOut
from app.services.pricing import product_to_out

router = APIRouter(prefix="/api", tags=["products"])


@router.get("/products", response_model=list[ProductOut])
async def list_products(response: Response, db: AsyncSession = Depends(get_db)) -> list[ProductOut]:
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    result = await db.execute(
        select(Product)
        .where(Product.is_active.is_(True))
        .options(selectinload(Product.offers))
        .order_by(Product.sort_order)
    )
    products = result.scalars().unique().all()
    return [product_to_out(p) for p in products]


@router.get("/products/{slug}", response_model=ProductDetailOut)
async def get_product(
    slug: str, response: Response, db: AsyncSession = Depends(get_db)
) -> ProductDetailOut:
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    result = await db.execute(
        select(Product)
        .where(Product.slug == slug, Product.is_active.is_(True))
        .options(
            selectinload(Product.offers),
            selectinload(Product.reviews),
        )
    )
    product = result.scalars().unique().one_or_none()
    if product is None:
        raise AppError(
            status_code=404,
            code="not_found",
            message_ar="المنتج غير موجود",
        )

    base = product_to_out(product)
    published = [r for r in product.reviews if r.is_published]
    published.sort(key=lambda r: r.sort_order)
    dist = Counter(str(r.rating) for r in published)
    rating_distribution = {str(i): dist.get(str(i), 0) for i in range(1, 6)}

    return ProductDetailOut(
        **base.model_dump(),
        reviews=[
            ReviewOut(
                id=r.id,
                author_name_ar=r.author_name_ar,
                city_ar=r.city_ar,
                rating=r.rating,
                week_marker=r.week_marker,
                body_ar=r.body_ar,
                is_verified=r.is_verified,
                has_photo=r.has_photo,
                photo_url=r.photo_url,
            )
            for r in published
        ],
        rating_distribution=rating_distribution,
    )
