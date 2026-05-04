-- ── Session management ────────────────────────────────────────────────────────

-- Session version allows "logout all devices" by incrementing this counter.
-- JWT tokens store the version at login time; any token with a lower version
-- than the current DB value is treated as revoked on next session refresh.
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

-- Active sessions table for display purposes (not for auth — auth uses JWT)
CREATE TABLE IF NOT EXISTS active_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,  -- SHA-256 of the JWT jti
  ip_address  TEXT,
  user_agent  TEXT,
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last ON active_sessions (last_seen);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
-- Service role only
