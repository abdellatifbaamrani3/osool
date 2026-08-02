"""Authoritative price helpers (docs/08, docs/22 §14)."""

from __future__ import annotations

from app.models.product import Offer, Product
from app.schemas.product import OfferOut, ProductOut


def per_unit_sar(price_sar: int, qty: int) -> int:
    """Floor division for display — never store as a column (docs/21 §3)."""
    if qty < 1:
        raise ValueError("qty must be >= 1")
    return price_sar // qty


def savings_sar(base_price_sar: int, qty: int, price_sar: int) -> int:
    """Saving vs buying qty × single-unit price."""
    return max(0, (base_price_sar * qty) - price_sar)


def offer_to_out(offer: Offer, base_price_sar: int) -> OfferOut:
    return OfferOut(
        id=offer.id,
        qty=offer.qty,
        price_sar=offer.price_sar,
        per_unit_sar=per_unit_sar(offer.price_sar, offer.qty),
        title_ar=offer.title_ar,
        duration_label_ar=offer.duration_label_ar,
        badge_ar=offer.badge_ar,
        is_default=offer.is_default,
        savings_sar=savings_sar(base_price_sar, offer.qty, offer.price_sar),
        sort_order=offer.sort_order,
    )


def product_to_out(product: Product) -> ProductOut:
    active_offers = [o for o in product.offers if o.is_active]
    active_offers.sort(key=lambda o: o.sort_order)
    return ProductOut(
        id=product.id,
        slug=product.slug,
        sku=product.sku,
        name_ar=product.name_ar,
        short_name_ar=product.short_name_ar,
        subtitle_ar=product.subtitle_ar,
        hook_ar=product.hook_ar,
        cause_number=product.cause_number,
        cause_name_ar=product.cause_name_ar,
        category=product.category.value if hasattr(product.category, "value") else str(product.category),
        requires_supplement_warnings=product.requires_supplement_warnings,
        base_price_sar=product.base_price_sar,
        content_key=product.content_key,
        images=list(product.images or []),
        rating_avg=product.rating_avg,
        rating_count=product.rating_count,
        stock_count=product.stock_count,
        low_stock_threshold=product.low_stock_threshold,
        is_low_stock=product.stock_count < product.low_stock_threshold,
        offers=[offer_to_out(o, product.base_price_sar) for o in active_offers],
    )
