"""Phone / name hashing for Meta, TikTok, and Snap CAPI (docs/24 §3)."""

from __future__ import annotations

import hashlib
import re

_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _maybe_hashed(raw: str) -> str | None:
    compact = raw.strip().lower()
    if re.fullmatch(r"[0-9a-f]{64}", compact):
        return compact
    return None


def digits_only(raw: str) -> str:
    """Saudi mobile → 966XXXXXXXXX (no plus, no leading zeros)."""
    s = raw.translate(_ARABIC_DIGITS)
    s = re.sub(r"\D", "", s)
    if s.startswith("00966"):
        s = s[5:]
    elif s.startswith("966"):
        s = s[3:]
    elif s.startswith("0"):
        s = s[1:]
    return "966" + s


def hash_phone_meta(raw: str | None) -> str | None:
    """Meta and Snapchat: digits only, with country code, no plus."""
    if not raw:
        return None
    return _maybe_hashed(raw) or _sha256(digits_only(raw))


hash_phone_snap = hash_phone_meta


def hash_phone_tiktok(raw: str | None) -> str | None:
    """TikTok: E.164 INCLUDING the leading plus."""
    if not raw:
        return None
    if hashed := _maybe_hashed(raw):
        return hashed
    return _sha256("+" + digits_only(raw))


def hash_name(raw: str | None) -> str | None:
    if not raw:
        return None
    s = raw.strip().lower()
    s = re.sub(r"[^\w\u0600-\u06FF]", "", s, flags=re.UNICODE)
    return _sha256(s) if s else None


def split_name(full: str) -> tuple[str | None, str | None]:
    parts = [p for p in full.strip().split() if p]
    if not parts:
        return None, None
    if len(parts) == 1:
        return parts[0], None
    return parts[0], " ".join(parts[1:])
