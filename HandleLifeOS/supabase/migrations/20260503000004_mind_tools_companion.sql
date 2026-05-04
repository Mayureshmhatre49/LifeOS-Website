-- Mind tool sessions + AI companion sessions/messages
-- Phase 11 robust expansion

-- ── Tool sessions (logs every completed tool run) ──────────────────────────────
CREATE TABLE IF NOT EXISTS mind_tool_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id     TEXT        NOT NULL,
  completed   BOOLEAN     NOT NULL DEFAULT false,
  duration_s  INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mind_tool_sessions_user ON mind_tool_sessions(user_id, created_at DESC);

ALTER TABLE mind_tool_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mind_tool_sessions_owner ON mind_tool_sessions
  USING (user_id = (SELECT id FROM users WHERE email = current_user));

-- ── Companion chat sessions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mind_companion_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode        TEXT        NOT NULL,
  title       TEXT,
  risk_flags  TEXT[]      DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companion_sessions_user ON mind_companion_sessions(user_id, updated_at DESC);

ALTER TABLE mind_companion_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY companion_sessions_owner ON mind_companion_sessions
  USING (user_id = (SELECT id FROM users WHERE email = current_user));

-- ── Companion messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mind_companion_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES mind_companion_sessions(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL,
  risk_level  TEXT        CHECK (risk_level IN ('none','mild','moderate','severe')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companion_messages_session ON mind_companion_messages(session_id, created_at ASC);

ALTER TABLE mind_companion_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY companion_messages_owner ON mind_companion_messages
  USING (user_id = (SELECT id FROM users WHERE email = current_user));
