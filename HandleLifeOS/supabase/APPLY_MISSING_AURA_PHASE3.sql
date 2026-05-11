-- Missing AURA Phase 3 tables: aura_settings, aura_coach_sessions, aura_coach_messages
-- Paste this into Supabase Dashboard → SQL Editor and run it.
-- All statements are idempotent (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS).

CREATE TABLE IF NOT EXISTS aura_settings (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pin_hash              TEXT,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  voice_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion        BOOLEAN NOT NULL DEFAULT FALSE,
  text_size             TEXT    NOT NULL DEFAULT 'base' CHECK (text_size IN ('sm','base','lg','xl')),
  high_contrast         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE aura_settings ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE aura_settings ADD COLUMN IF NOT EXISTS text_size      TEXT    NOT NULL DEFAULT 'base';
ALTER TABLE aura_settings ADD COLUMN IF NOT EXISTS high_contrast  BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE aura_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_settings_owner ON aura_settings;
CREATE POLICY aura_settings_owner ON aura_settings
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS aura_settings_updated_at ON aura_settings;
CREATE TRIGGER aura_settings_updated_at BEFORE UPDATE ON aura_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS aura_coach_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES aura_profiles(id) ON DELETE SET NULL,
  mode        TEXT NOT NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aura_coach_sessions_user ON aura_coach_sessions(user_id, updated_at DESC);

ALTER TABLE aura_coach_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_coach_sessions_owner ON aura_coach_sessions;
CREATE POLICY aura_coach_sessions_owner ON aura_coach_sessions
  USING (user_id::text = current_setting('app.user_id', true));

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS aura_coach_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES aura_coach_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aura_coach_messages_session ON aura_coach_messages(session_id, created_at ASC);

ALTER TABLE aura_coach_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_coach_messages_owner ON aura_coach_messages;
CREATE POLICY aura_coach_messages_owner ON aura_coach_messages
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
