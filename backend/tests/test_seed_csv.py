"""Seed CSV contracts — no DB required (docs/08, docs/21 §12)."""

from __future__ import annotations

import csv
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"


def _rows(name: str) -> list[dict[str, str]]:
    with (DATA / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def test_three_products_in_cause_order() -> None:
    products = _rows("products-seed.csv")
    assert len(products) == 3
    assert [p["cause_number"] for p in products] == ["1", "2", "3"]
    assert [p["content_key"] for p in products] == ["serum", "tonic", "exfoliant"]


def test_tonic_requires_supplement_warnings() -> None:
    tonic = next(p for p in _rows("products-seed.csv") if p["content_key"] == "tonic")
    assert tonic["category"] == "supplement_oral"
    assert tonic["requires_supplement_warnings"].lower() == "true"


def test_nine_offers_tier_two_default() -> None:
    offers = _rows("offers-seed.csv")
    assert len(offers) == 9
    by_slug: dict[str, list] = {}
    for row in offers:
        by_slug.setdefault(row["product_slug"], []).append(row)
    assert len(by_slug) == 3
    for slug, rows in by_slug.items():
        defaults = [r for r in rows if r["is_default"].lower() == "true"]
        assert len(defaults) == 1, slug
        assert defaults[0]["qty"] == "2"
        assert defaults[0]["price_sar"] == "279"


def test_offer_ladder_prices() -> None:
    prices = {(r["qty"], r["price_sar"]) for r in _rows("offers-seed.csv")}
    assert ("1", "199") in prices
    assert ("2", "279") in prices
    assert ("3", "349") in prices
