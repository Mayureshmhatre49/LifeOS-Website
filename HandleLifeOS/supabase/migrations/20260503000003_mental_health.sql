-- Mental Health & Wellbeing tables
-- Phase 11: mood logs, journal entries, gratitude entries, sleep logs

-- ── Mood logs ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood         INTEGER     NOT NULL CHECK (mood BETWEEN 1 AND 5),
  stress       INTEGER     CHECK (stress BETWEEN 1 AND 5),
  emotions     TEXT[]      DEFAULT '{}',
  note         TEXT,
  logged_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mood_logs_user_logged ON mood_logs(user_id, logged_at DESC);

ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY mood_logs_owner ON mood_logs
  USING (user_id = (SELECT id FROM users WHERE email = current_user));

-- ── Journal entries ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT,
  content      TEXT        NOT NULL,
  mood         INTEGER     CHECK (mood BETWEEN 1 AND 5),
  prompt       TEXT,
  tags         TEXT[]      DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_user ON journal_entries(user_id, created_at DESC);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY journal_entries_owner ON journal_entries
  USING (user_id = (SELECT id FROM users WHERE email = current_user));

-- ── Gratitude entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items        TEXT[]      NOT NULL,
  date         DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_gratitude_user ON gratitude_entries(user_id, date DESC);

ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY gratitude_entries_owner ON gratitude_entries
  USING (user_id = (SELECT id FROM users WHERE email = current_user));

-- ── Sleep logs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sleep_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date           DATE        NOT NULL DEFAULT CURRENT_DATE,
  bedtime        TEXT,
  wake_time      TEXT,
  duration_hours DECIMAL(4,2),
  quality        INTEGER     CHECK (quality BETWEEN 1 AND 5),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_sleep_logs_user ON sleep_logs(user_id, date DESC);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sleep_logs_owner ON sleep_logs
  USING (user_id = (SELECT id FROM users WHERE email = current_user));
