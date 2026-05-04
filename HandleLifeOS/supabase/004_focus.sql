-- Phase 4: Focus & Productivity Engine

CREATE TYPE focus_mode AS ENUM ('quick', 'pomodoro', 'deep', 'custom');
CREATE TYPE energy_state AS ENUM ('low', 'normal', 'high');

-- Focus sessions
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  mode focus_mode NOT NULL DEFAULT 'pomodoro',
  planned_minutes INTEGER NOT NULL CHECK (planned_minutes BETWEEN 1 AND 300),
  actual_minutes INTEGER CHECK (actual_minutes >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  abandoned BOOLEAN NOT NULL DEFAULT FALSE,
  body_doubling_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  task_title TEXT,
  notes TEXT CHECK (char_length(notes) <= 1000),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_started ON focus_sessions(user_id, started_at DESC);
CREATE INDEX idx_focus_sessions_completed ON focus_sessions(user_id, completed);

-- Focus preferences
CREATE TABLE focus_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_mode focus_mode NOT NULL DEFAULT 'pomodoro',
  break_interval_minutes INTEGER NOT NULL DEFAULT 5 CHECK (break_interval_minutes BETWEEN 1 AND 30),
  long_break_minutes INTEGER NOT NULL DEFAULT 15 CHECK (long_break_minutes BETWEEN 5 AND 60),
  sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
  body_doubling_default BOOLEAN NOT NULL DEFAULT FALSE,
  daily_focus_goal_minutes INTEGER NOT NULL DEFAULT 120 CHECK (daily_focus_goal_minutes BETWEEN 15 AND 720),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY focus_sessions_user_policy ON focus_sessions
  USING (user_id::text = current_setting('app.user_id', true));

CREATE POLICY focus_prefs_user_policy ON focus_preferences
  USING (user_id::text = current_setting('app.user_id', true));

-- Auto-update trigger
CREATE TRIGGER focus_prefs_updated_at BEFORE UPDATE ON focus_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
