"""Ad-pixel hashing vectors (docs/24 §3)."""

from app.services.capi.hashing import digits_only, hash_name, hash_phone_meta, hash_phone_tiktok


def test_saudi_phone_normalises_to_966() -> None:
    assert digits_only("0551234567") == "966551234567"
    assert digits_only("+966551234567") == "966551234567"
    assert digits_only("966551234567") == "966551234567"


def test_tiktok_phone_hash_keeps_plus() -> None:
    phone = "0551234567"
    meta = hash_phone_meta(phone)
    tiktok = hash_phone_tiktok(phone)
    assert meta
    assert tiktok
    assert meta != tiktok
    assert hash_phone_tiktok("+966551234567") == tiktok
    assert hash_phone_meta("966551234567") == meta


def test_snap_email_and_first_name_vectors() -> None:
    # Published Snap SHA-256 test vectors.
    import hashlib

    assert hashlib.sha256(b"person@example.com").hexdigest() == (
        "542d240129883c019e106e3b1b2d3f3cb3537c43c425364de8e951d5a3083345"
    )
    assert hash_name("John") == "96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000cec607a"
