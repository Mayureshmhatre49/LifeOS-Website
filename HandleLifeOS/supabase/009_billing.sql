-- Phase 9: Premium & Revenue
-- Run in Supabase SQL editor after 008_voice_whatsapp.sql

-- ── Subscriptions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id                  TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro', 'family')),
  status                   TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'expired')),
  interval                 TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly', 'yearly')),
  provider                 TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  provider_subscription_id TEXT,
  provider_customer_id     TEXT,
  current_period_start     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end       TIMESTAMPTZ NOT NULL,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Writes are admin-only (via service role from webhooks/API routes).

-- ── Usage records ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month              TEXT NOT NULL,            -- "YYYY-MM"
  ai_requests        INTEGER NOT NULL DEFAULT 0,
  whatsapp_messages  INTEGER NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_month ON usage_records(user_id, month);

ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

-- ── increment_ai_usage RPC ────────────────────────────────────────────────────
-- Called from the server after each successful AI request.

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID, p_month TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_records (user_id, month, ai_requests, updated_at)
    VALUES (p_user_id, p_month, 1, NOW())
  ON CONFLICT (user_id, month)
    DO UPDATE SET
      ai_requests = usage_records.ai_requests + 1,
      updated_at  = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Auto-update updated_at ─────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
