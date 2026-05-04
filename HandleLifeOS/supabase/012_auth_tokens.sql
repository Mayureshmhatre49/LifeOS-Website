-- ── Auth tokens: password reset & email verification ─────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token_hash  ON password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_user_id     ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires_at  ON password_reset_tokens (expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_token_hash  ON email_verification_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_user_id     ON email_verification_tokens (user_id);

-- Add email_verified column to users if not present
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- RLS: only service role may read/write these tables
ALTER TABLE password_reset_tokens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — all access goes through service-role key

-- Cleanup function: purge expired tokens (call via pg_cron or scheduled job)
CREATE OR REPLACE FUNCTION purge_expired_auth_tokens() RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM password_reset_tokens   WHERE expires_at < NOW();
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
END;
$$;
