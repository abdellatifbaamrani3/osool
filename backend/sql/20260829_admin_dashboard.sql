-- OSOOL admin dashboard analytics and audit tables.
-- Run this only if you are not using Alembic migrations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name varchar(40) NOT NULL,
  session_id varchar(80) NOT NULL,
  path text NOT NULL,
  product_slug varchar(120),
  cta_id varchar(120),
  order_id varchar(80),
  value_sar integer,
  referrer text,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_ip inet,
  country varchar(2),
  is_counted boolean NOT NULL DEFAULT true,
  blocked_reason varchar(40),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_analytics_events_created_at
  ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS ix_analytics_events_name_created
  ON analytics_events (event_name, created_at);
CREATE INDEX IF NOT EXISTS ix_analytics_events_session_created
  ON analytics_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS ix_analytics_events_product_created
  ON analytics_events (product_slug, created_at);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username varchar(120) NOT NULL,
  action varchar(80) NOT NULL,
  entity_type varchar(40),
  entity_id varchar(80),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_admin_audit_log_created_at
  ON admin_audit_log (created_at);
