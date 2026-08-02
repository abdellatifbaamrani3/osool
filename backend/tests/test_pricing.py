"""Server-side price arithmetic (docs/08 §1, docs/22 §14)."""

from app.services.pricing import per_unit_sar, savings_sar


def test_tier_per_unit_floor() -> None:
    assert per_unit_sar(199, 1) == 199
    assert per_unit_sar(279, 2) == 139
    assert per_unit_sar(349, 3) == 116


def test_tier_savings_vs_singles() -> None:
    assert savings_sar(199, 1, 199) == 0
    assert savings_sar(199, 2, 279) == 119
    assert savings_sar(199, 3, 349) == 248


def test_client_cannot_invent_negative_savings() -> None:
    # If a bad price somehow arrives, savings floors at 0 for display helpers.
    assert savings_sar(199, 1, 500) == 0
