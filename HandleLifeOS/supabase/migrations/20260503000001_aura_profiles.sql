-- AURA child profiles — full AuraChildProfile stored as JSONB per user.
-- Using JSONB avoids a complex relational schema for the rich nested type.

CREATE TABLE IF NOT EXISTS aura_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aura_profiles_user ON aura_profiles (user_id, created_at ASC);

ALTER TABLE aura_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aura_profiles_owner" ON aura_profiles
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

CREATE TRIGGER update_aura_profiles_updated_at
  BEFORE UPDATE ON aura_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
