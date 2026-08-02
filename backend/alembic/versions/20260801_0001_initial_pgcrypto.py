"""Enable pgcrypto for gen_random_uuid (docs/21 §11).

Revision ID: 20260801_0001
Revises:
Create Date: 2026-08-01

"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260801_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")


def downgrade() -> None:
    # Extension may be shared — leave it in place on downgrade.
    pass
