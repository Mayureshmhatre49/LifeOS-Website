-- Phase 10: Scale & Growth — Enterprise API + Language Preferences
-- Run in Supabase SQL editor after 009_billing.sql

-- ── Language preference on profiles ───────────────────────────────────────────
-- Adds preferred_language to the existing profiles table (from Phase 2).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en-IN';

-- ── API keys ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  key_prefix    TEXT NOT NULL,       -- first 16 chars, safe to display
  key_hash      TEXT NOT NULL UNIQUE, -- SHA-256 of full key
  request_count INTEGER NOT NULL DEFAULT 0,
  last_used_at  TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own API keys" ON api_keys
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── increment_api_key_usage RPC ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_api_key_usage(p_key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET
    request_count = request_count + 1,
    last_used_at  = NOW()
  WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
