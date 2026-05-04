-- Mind module per-user settings: PIN lock, reminder time, voice prefs

CREATE TABLE IF NOT EXISTS mind_settings (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pin_hash              TEXT,                       -- SHA-256(`mind:${user_id}:${pin}`); NULL = no PIN
  reminder_time         TEXT,                       -- 'HH:MM' for daily check-in
  voice_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mind_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mind_settings_owner ON mind_settings;
CREATE POLICY mind_settings_owner ON mind_settings
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS mind_settings_updated_at ON mind_settings;
CREATE TRIGGER mind_settings_updated_at BEFORE UPDATE ON mind_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
