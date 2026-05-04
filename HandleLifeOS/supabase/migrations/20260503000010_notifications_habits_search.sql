-- Phase 12 (Notifications) + Phase 18 (Habits) + cross-module search support

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,                           -- 'task.overdue' | 'aura.alert' | 'mind.streak' | 'money.budget' | 'family.task' | 'system' | etc.
  module       TEXT NOT NULL,                           -- 'planner' | 'aura' | 'mind' | 'money' | 'family' | 'system'
  title        TEXT NOT NULL,
  body         TEXT,
  link         TEXT,                                    -- in-app deep link, e.g. /planner?task=123
  severity     TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','urgent')),
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_module ON notifications (user_id, module);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_owner ON notifications;
CREATE POLICY notifications_owner ON notifications
  USING (user_id::text = current_setting('app.user_id', true));

-- Idempotent dedup: prevent flooding (e.g. same overdue-task notif twice in a day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_dedup
  ON notifications (user_id, type, (metadata->>'dedup_key'))
  WHERE metadata ? 'dedup_key';

-- ── HABITS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  icon         TEXT,                                   -- lucide icon name or emoji
  color        TEXT NOT NULL DEFAULT 'violet' CHECK (color IN ('violet','indigo','blue','emerald','amber','rose','pink','purple','sky','teal')),
  frequency    TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekdays','weekends','custom','weekly')),
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',  -- 0=Sun..6=Sat
  target_per_day INTEGER NOT NULL DEFAULT 1 CHECK (target_per_day BETWEEN 1 AND 50),
  reminder_time TIME,                                  -- when to send daily nudge
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits (user_id, is_active);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS habits_owner ON habits;
CREATE POLICY habits_owner ON habits
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS habits_updated_at ON habits;
CREATE TRIGGER habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── HABIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  count       INTEGER NOT NULL DEFAULT 1 CHECK (count >= 0),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs (habit_id, date DESC);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS habit_logs_owner ON habit_logs;
CREATE POLICY habit_logs_owner ON habit_logs
  USING (user_id::text = current_setting('app.user_id', true));
