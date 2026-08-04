"""Enable pgcrypto for gen_random_uuid (docs/21 §11).

Revision ID: 20260801_0001
Revises:
Create Date: 2026-08-01

On Postgres 13+ gen_random_uuid() is in core. CREATE EXTENSION may still
fail on locked-down EasyPanel roles — treat that as non-fatal when the
function already exists.
"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

revision: str = "20260801_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    # Use a savepoint so a privilege error does not abort the whole migration txn.
    with conn.begin_nested():
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
            return
        except Exception as exc:
            print(f"[osool] WARN: CREATE EXTENSION pgcrypto failed: {exc}")

    exists = conn.execute(
        text("SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid' LIMIT 1")
    ).scalar()
    if not exists:
        raise RuntimeError(
            "pgcrypto extension unavailable and gen_random_uuid() missing. "
            "Run as superuser once: CREATE EXTENSION IF NOT EXISTS pgcrypto;"
        )
    print("[osool] WARN: continuing without pgcrypto — gen_random_uuid() already exists")


def downgrade() -> None:
    # Extension may be shared — leave it in place on downgrade.
    pass
