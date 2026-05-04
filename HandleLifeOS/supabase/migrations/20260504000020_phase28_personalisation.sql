-- Phase 28 — AI Personalisation Engine
-- Tables:
--   personalisation_preferences  — explicit user choices (tone, verbosity, etc.)
--   personalisation_insights     — patterns DISCOVERED from existing data
--
-- Insights are derivative: regenerated periodically from raw signals across
-- tasks/habits/mood/expenses/journal. We never need a separate event log because
-- those modules already store the underlying facts.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PREFERENCES — singleton per user
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS personalisation_preferences (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- AI tone & verbosity — shape every AI response in the OS
  tone             TEXT NOT NULL DEFAULT 'warm'
                   CHECK (tone IN ('warm','concise','analytical','playful','formal')),
  verbosity        TEXT NOT NULL DEFAULT 'balanced'
                   CHECK (verbosity IN ('brief','balanced','detailed')),
  proactivity      TEXT NOT NULL DEFAULT 'balanced'
                   CHECK (proactivity IN ('reactive','balanced','high')),

  -- Topic interests — used to bias briefings and feed cards
  interests        TEXT[] NOT NULL DEFAULT '{}',

  -- Pinned modules — the user-controlled "what shows up first"
  priority_modules TEXT[] NOT NULL DEFAULT '{}',

  -- Locale preferences
  language         TEXT NOT NULL DEFAULT 'en',
  currency         TEXT NOT NULL DEFAULT 'INR',
  timezone         TEXT,

  -- Privacy: opt out of pattern learning entirely
  learning_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE personalisation_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS personalisation_preferences_owner ON personalisation_preferences;
CREATE POLICY personalisation_preferences_owner ON personalisation_preferences
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS personalisation_preferences_updated_at ON personalisation_preferences;
CREATE TRIGGER personalisation_preferences_updated_at BEFORE UPDATE ON personalisation_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. INSIGHTS — discovered patterns
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS personalisation_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stable key per user — re-running the learner upserts on this
  kind        TEXT NOT NULL,
  -- e.g. 'circadian.focus_peak', 'spending.top_category', 'mood.weekday_low',
  --      'habit.fragile', 'goal.velocity', 'risk.spending_spike'

  title       TEXT NOT NULL,
  summary_md  TEXT NOT NULL,                          -- short markdown explanation
  evidence    JSONB NOT NULL DEFAULT '{}'::jsonb,     -- structured data backing the claim
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 0.5
              CHECK (confidence BETWEEN 0 AND 1),
  severity    TEXT NOT NULL DEFAULT 'info'
              CHECK (severity IN ('info','positive','attention','urgent')),

  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_personalisation_insights_user
  ON personalisation_insights(user_id, is_dismissed, generated_at DESC);

ALTER TABLE personalisation_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS personalisation_insights_owner ON personalisation_insights;
CREATE POLICY personalisation_insights_owner ON personalisation_insights
  USING (user_id::text = current_setting('app.user_id', true));

NOTIFY pgrst, 'reload schema';
