-- Phase 3: Daily Planner & Execution Engine

-- Enums
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'skipped');
CREATE TYPE task_category AS ENUM ('work', 'personal', 'health', 'finance', 'family', 'learning', 'errands', 'other');
CREATE TYPE routine_type AS ENUM ('morning', 'evening', 'work', 'study', 'weekend', 'custom');
CREATE TYPE energy_level AS ENUM ('morning', 'afternoon', 'evening');

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  notes TEXT CHECK (char_length(notes) <= 2000),
  due_date DATE,
  priority task_priority NOT NULL DEFAULT 'medium',
  category task_category NOT NULL DEFAULT 'other',
  estimated_minutes INTEGER CHECK (estimated_minutes > 0 AND estimated_minutes <= 480),
  status task_status NOT NULL DEFAULT 'todo',
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_created_at ON tasks(user_id, created_at DESC);

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  type routine_type NOT NULL DEFAULT 'custom',
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=Sun..6=Sat
  start_time TIME,
  estimated_minutes INTEGER CHECK (estimated_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON routines(user_id);

-- Routine steps
CREATE TABLE routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 500),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routine_steps_routine_id ON routine_steps(routine_id);

-- Planner preferences
CREATE TABLE planner_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wake_time TIME DEFAULT '07:00',
  sleep_time TIME DEFAULT '23:00',
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '18:00',
  energy_peak energy_level NOT NULL DEFAULT 'morning',
  planning_style TEXT NOT NULL DEFAULT 'simple' CHECK (planning_style IN ('simple', 'detailed')),
  max_daily_tasks INTEGER NOT NULL DEFAULT 5 CHECK (max_daily_tasks BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  scheduled_at TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id, scheduled_at);
CREATE INDEX idx_reminders_pending ON reminders(scheduled_at) WHERE is_sent = FALSE;

-- RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Tasks: users see only their own
CREATE POLICY tasks_user_policy ON tasks
  USING (user_id::text = current_setting('app.user_id', true));

-- Routines: users see only their own
CREATE POLICY routines_user_policy ON routines
  USING (user_id::text = current_setting('app.user_id', true));

-- Routine steps: via parent routine ownership
CREATE POLICY routine_steps_user_policy ON routine_steps
  USING (
    routine_id IN (
      SELECT id FROM routines
      WHERE user_id::text = current_setting('app.user_id', true)
    )
  );

-- Planner preferences: users see only their own
CREATE POLICY planner_prefs_user_policy ON planner_preferences
  USING (user_id::text = current_setting('app.user_id', true));

-- Reminders: users see only their own
CREATE POLICY reminders_user_policy ON reminders
  USING (user_id::text = current_setting('app.user_id', true));

-- Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER routines_updated_at BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER planner_prefs_updated_at BEFORE UPDATE ON planner_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
