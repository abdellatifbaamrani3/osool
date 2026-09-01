"""Admin dashboard analytics and audit tables.

Revision ID: 20260829_0003
Revises: 20260801_0002
Create Date: 2026-08-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260829_0003"
down_revision: Union[str, Sequence[str], None] = "20260801_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("event_name", sa.String(40), nullable=False),
        sa.Column("session_id", sa.String(80), nullable=False),
        sa.Column("path", sa.Text(), nullable=False),
        sa.Column("product_slug", sa.String(120)),
        sa.Column("cta_id", sa.String(120)),
        sa.Column("order_id", sa.String(80)),
        sa.Column("value_sar", sa.Integer()),
        sa.Column("referrer", sa.Text()),
        sa.Column("utm", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("client_ip", postgresql.INET()),
        sa.Column("country", sa.String(2)),
        sa.Column("is_counted", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("blocked_reason", sa.String(40)),
        sa.Column("user_agent", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"])
    op.create_index("ix_analytics_events_name_created", "analytics_events", ["event_name", "created_at"])
    op.create_index("ix_analytics_events_session_created", "analytics_events", ["session_id", "created_at"])
    op.create_index("ix_analytics_events_product_created", "analytics_events", ["product_slug", "created_at"])

    op.create_table(
        "admin_audit_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("admin_username", sa.String(120), nullable=False),
        sa.Column("action", sa.String(80), nullable=False),
        sa.Column("entity_type", sa.String(40)),
        sa.Column("entity_id", sa.String(80)),
        sa.Column("metadata_json", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("client_ip", postgresql.INET()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_admin_audit_log_created_at", "admin_audit_log", ["created_at"])


def downgrade() -> None:
    op.drop_table("admin_audit_log")
    op.drop_table("analytics_events")
