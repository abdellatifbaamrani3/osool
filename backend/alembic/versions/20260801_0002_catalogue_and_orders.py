"""Catalogue, orders, leads, settings schema (docs/21).

Revision ID: 20260801_0002
Revises: 20260801_0001
Create Date: 2026-08-01

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260801_0002"
down_revision: Union[str, Sequence[str], None] = "20260801_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

product_category = postgresql.ENUM(
    "cosmetic_leave_on",
    "cosmetic_rinse_off",
    "supplement_oral",
    name="product_category",
    create_type=False,
)
payment_method = postgresql.ENUM("cod", name="payment_method", create_type=False)
order_status = postgresql.ENUM(
    "new",
    "confirmed",
    "shipped",
    "delivered",
    "no_answer",
    "cancelled",
    "returned",
    name="order_status",
    create_type=False,
)
item_kind = postgresql.ENUM("offer", "upsell", name="item_kind", create_type=False)
ad_platform = postgresql.ENUM("meta", "tiktok", "snap", name="ad_platform", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    product_category.create(bind, checkfirst=True)
    payment_method.create(bind, checkfirst=True)
    order_status.create(bind, checkfirst=True)
    item_kind.create(bind, checkfirst=True)
    ad_platform.create(bind, checkfirst=True)

    op.execute("CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10001")

    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("sku", sa.String(40), nullable=False),
        sa.Column("name_ar", sa.String(200), nullable=False),
        sa.Column("short_name_ar", sa.String(80), nullable=False),
        sa.Column("subtitle_ar", sa.String(240), nullable=False),
        sa.Column("hook_ar", sa.String(240)),
        sa.Column("cause_number", sa.SmallInteger(), nullable=False),
        sa.Column("cause_name_ar", sa.String(80), nullable=False),
        sa.Column("category", product_category, nullable=False),
        sa.Column("requires_supplement_warnings", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("base_price_sar", sa.Integer(), nullable=False),
        sa.Column("stock_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("low_stock_threshold", sa.Integer(), nullable=False, server_default=sa.text("30")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.SmallInteger(), nullable=False),
        sa.Column("content_key", sa.String(40), nullable=False),
        sa.Column("images", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("rating_avg", sa.Numeric(2, 1)),
        sa.Column("rating_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("slug", name="uq_products_slug"),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
        sa.CheckConstraint("base_price_sar > 0", name="ck_products_base_price_positive"),
        sa.CheckConstraint("cause_number BETWEEN 1 AND 3", name="ck_products_cause_number"),
    )
    op.create_index("ix_products_active_sort", "products", ["is_active", "sort_order"])

    op.create_table(
        "offers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("qty", sa.SmallInteger(), nullable=False),
        sa.Column("price_sar", sa.Integer(), nullable=False),
        sa.Column("title_ar", sa.String(60), nullable=False),
        sa.Column("duration_label_ar", sa.String(80), nullable=False),
        sa.Column("badge_ar", sa.String(40)),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.SmallInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("product_id", "qty", name="uq_offers_product_qty"),
        sa.CheckConstraint("qty >= 1", name="ck_offers_qty"),
        sa.CheckConstraint("price_sar > 0", name="ck_offers_price"),
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_offers_one_default ON offers (product_id) WHERE is_default"
    )

    op.create_table(
        "reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("author_name_ar", sa.String(60), nullable=False),
        sa.Column("city_ar", sa.String(60)),
        sa.Column("rating", sa.SmallInteger(), nullable=False),
        sa.Column("week_marker", sa.SmallInteger()),
        sa.Column("body_ar", sa.Text(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("has_photo", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("photo_url", sa.Text()),
        sa.Column("is_seed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.SmallInteger(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating"),
    )
    op.create_index(
        "ix_reviews_product_published_sort",
        "reviews",
        ["product_id", "is_published", "sort_order"],
    )

    op.create_table(
        "settings",
        sa.Column("key", sa.String(60), primary_key=True),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("value_type", sa.String(20), nullable=False),
        sa.Column("description_ar", sa.Text()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_number", sa.String(20), nullable=False),
        sa.Column("customer_name", sa.String(60), nullable=False),
        sa.Column("phone_national", sa.String(9), nullable=False),
        sa.Column("phone_e164", sa.String(16), nullable=False),
        sa.Column("subtotal_sar", sa.Integer(), nullable=False),
        sa.Column("shipping_sar", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("total_sar", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default=sa.text("'SAR'")),
        sa.Column("payment_method", payment_method, nullable=False, server_default=sa.text("'cod'::payment_method")),
        sa.Column("status", order_status, nullable=False, server_default=sa.text("'new'::order_status")),
        sa.Column("upsell_offered_product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="SET NULL")),
        sa.Column("upsell_accepted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("upsell_expires_at", sa.DateTime(timezone=True)),
        sa.Column("upsell_resolved_at", sa.DateTime(timezone=True)),
        sa.Column("event_id", sa.String(64), nullable=False),
        sa.Column("upsell_event_id", sa.String(64)),
        sa.Column("client_ip", postgresql.INET()),
        sa.Column("user_agent", sa.Text()),
        sa.Column("attribution", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("risk_flag", sa.String(40)),
        sa.Column("idempotency_key", sa.String(64)),
        sa.Column("sheet_synced_at", sa.DateTime(timezone=True)),
        sa.Column("sheet_sync_attempts", sa.SmallInteger(), nullable=False, server_default=sa.text("0")),
        sa.Column("confirmed_at", sa.DateTime(timezone=True)),
        sa.Column("delivered_at", sa.DateTime(timezone=True)),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("order_number", name="uq_orders_order_number"),
        sa.UniqueConstraint("idempotency_key", name="uq_orders_idempotency_key"),
    )
    op.create_index("ix_orders_phone_national", "orders", ["phone_national"])
    op.create_index("ix_orders_created_at", "orders", ["created_at"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.execute(
        "CREATE INDEX ix_orders_sheet_unsynced ON orders (sheet_synced_at) WHERE sheet_synced_at IS NULL"
    )

    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("offer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("offers.id", ondelete="RESTRICT")),
        sa.Column("kind", item_kind, nullable=False, server_default=sa.text("'offer'::item_kind")),
        sa.Column("product_name_ar", sa.String(200), nullable=False),
        sa.Column("product_sku", sa.String(40), nullable=False),
        sa.Column("offer_label_ar", sa.String(120)),
        sa.Column("unit_qty", sa.SmallInteger(), nullable=False),
        sa.Column("bundles", sa.SmallInteger(), nullable=False, server_default=sa.text("1")),
        sa.Column("total_units", sa.SmallInteger(), nullable=False),
        sa.Column("unit_price_sar", sa.Integer(), nullable=False),
        sa.Column("line_total_sar", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("customer_name", sa.String(60)),
        sa.Column("phone_national", sa.String(9)),
        sa.Column("phone_e164", sa.String(16)),
        sa.Column("cart_snapshot", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("cart_value_sar", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("attribution", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("client_ip", postgresql.INET()),
        sa.Column("user_agent", sa.Text()),
        sa.Column("converted_order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="SET NULL")),
        sa.Column("recovery_status", sa.String(30), nullable=False, server_default=sa.text("'new'")),
        sa.Column("sheet_synced_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_leads_phone_national", "leads", ["phone_national"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])
    op.execute(
        "CREATE INDEX ix_leads_unconverted ON leads (converted_order_id) WHERE converted_order_id IS NULL"
    )

    op.create_table(
        "tracking_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="SET NULL")),
        sa.Column("event_id", sa.String(64), nullable=False),
        sa.Column("event_name", sa.String(40), nullable=False),
        sa.Column("platform", ad_platform, nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("http_status", sa.SmallInteger()),
        sa.Column("request_payload", postgresql.JSONB()),
        sa.Column("response_body", postgresql.JSONB()),
        sa.Column("error", sa.Text()),
        sa.Column("attempts", sa.SmallInteger(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_tracking_events_order_id", "tracking_events", ["order_id"])
    op.create_index(
        "ix_tracking_events_platform_status_created",
        "tracking_events",
        ["platform", "status", "created_at"],
    )
    op.create_index("ix_tracking_events_event_id", "tracking_events", ["event_id"])

    op.create_table(
        "contact_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("phone_national", sa.String(9), nullable=False),
        sa.Column("phone_e164", sa.String(16), nullable=False),
        sa.Column("subject", sa.String(40), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("client_ip", postgresql.INET()),
        sa.Column("handled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("sheet_synced_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("contact_messages")
    op.drop_table("tracking_events")
    op.drop_table("leads")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("settings")
    op.drop_table("reviews")
    op.drop_table("offers")
    op.drop_table("products")
    op.execute("DROP SEQUENCE IF EXISTS order_number_seq")
    ad_platform.drop(op.get_bind(), checkfirst=True)
    item_kind.drop(op.get_bind(), checkfirst=True)
    order_status.drop(op.get_bind(), checkfirst=True)
    payment_method.drop(op.get_bind(), checkfirst=True)
    product_category.drop(op.get_bind(), checkfirst=True)
