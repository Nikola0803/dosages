-- VialCalc Supabase schema
-- Run this in the Supabase SQL editor (or via the MCP apply_migration tool)

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id  TEXT    NOT NULL,
  endpoint   TEXT    NOT NULL UNIQUE,
  p256dh     TEXT    NOT NULL,
  auth       TEXT    NOT NULL,
  goal       TEXT,
  peptide    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol tracking cycles
CREATE TABLE IF NOT EXISTS protocols (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id        TEXT    NOT NULL,
  peptide_slug     TEXT    NOT NULL,
  peptide_name     TEXT    NOT NULL,
  category_slug    TEXT,
  vial_mg          NUMERIC,
  dose_mcg         NUMERIC,
  doses_per_vial   INTEGER,
  started_at       DATE    NOT NULL,
  ends_at          DATE,
  notify_at        DATE GENERATED ALWAYS AS (ends_at - INTERVAL '3 days') STORED,
  notified         BOOLEAN DEFAULT FALSE,
  status           TEXT    DEFAULT 'active' CHECK (status IN ('active','complete','abandoned')),
  review_submitted BOOLEAN DEFAULT FALSE,
  review_rating    INTEGER CHECK (review_rating BETWEEN 1 AND 5),
  review_worked    BOOLEAN,
  review_notes     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cron query performance
CREATE INDEX IF NOT EXISTS idx_protocols_notify ON protocols (notify_at, status, notified);
CREATE INDEX IF NOT EXISTS idx_protocols_device ON protocols (device_id);
CREATE INDEX IF NOT EXISTS idx_push_device       ON push_subscriptions (device_id);

-- Row Level Security (allow anonymous device-based access)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols           ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert/read their own device's rows
CREATE POLICY push_insert ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY push_select ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY push_update ON push_subscriptions FOR UPDATE USING (true);

CREATE POLICY proto_insert ON protocols FOR INSERT WITH CHECK (true);
CREATE POLICY proto_select ON protocols FOR SELECT USING (true);
CREATE POLICY proto_update ON protocols FOR UPDATE USING (true);
