-- ═══════════════════════════════════════════════════════════════════════════════
--  HandleLife OS — Complete Database Bootstrap
--  Idempotent: safe to run multiple times on any Postgres / Supabase instance.
--  Consolidates phases 1-14 + AURA + email-verification + Mind module.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 0. SHARED TRIGGER FUNCTIONS (defined first — every trigger below depends on these)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 1 — Core (users, conversations, messages, audit_log)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  image         TEXT,
  password_hash TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS conversations_user_id_idx    ON conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx      ON messages(created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id),
  action     TEXT NOT NULL,
  resource   TEXT,
  ip_address TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at DESC);

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_own            ON users;
DROP POLICY IF EXISTS conversations_owner  ON conversations;
DROP POLICY IF EXISTS messages_owner       ON messages;
DROP POLICY IF EXISTS audit_log_service    ON audit_log;

CREATE POLICY users_own ON users
  USING (id::text = current_setting('app.user_id', true))
  WITH CHECK (id::text = current_setting('app.user_id', true));
CREATE POLICY conversations_owner ON conversations
  USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY messages_owner ON messages
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id::text = current_setting('app.user_id', true)
  ));
-- audit_log is service-role only (write-only audit trail; users never read it directly)
CREATE POLICY audit_log_service ON audit_log
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS users_updated_at         ON users;
DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER users_updated_at         BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 2 — Personal Memory (profiles, user_preferences, memory_items)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name   TEXT,
  occupation     TEXT,
  life_stage     TEXT CHECK (life_stage IN ('student','early_career','mid_career','senior','retired','other')),
  country        TEXT DEFAULT 'IN',
  currency       TEXT DEFAULT 'INR',
  timezone       TEXT DEFAULT 'Asia/Kolkata',
  goals          TEXT[],
  memory_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, key)
);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

CREATE TABLE IF NOT EXISTS memory_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('fact','preference','goal','concern','context','habit','relationship')),
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  source     TEXT DEFAULT 'manual',
  confidence SMALLINT DEFAULT 100 CHECK (confidence BETWEEN 0 AND 100),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS memory_items_user_id_active_idx ON memory_items(user_id, is_active);
CREATE INDEX IF NOT EXISTS memory_items_type_idx           ON memory_items(type);

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_items     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_owner          ON profiles;
DROP POLICY IF EXISTS user_preferences_owner  ON user_preferences;
DROP POLICY IF EXISTS memory_items_owner      ON memory_items;
CREATE POLICY profiles_owner ON profiles
  USING (id::text = current_setting('app.user_id', true))
  WITH CHECK (id::text = current_setting('app.user_id', true));
CREATE POLICY user_preferences_owner ON user_preferences
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
CREATE POLICY memory_items_owner ON memory_items
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS profiles_updated_at         ON profiles;
DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS memory_items_updated_at     ON memory_items;
CREATE TRIGGER profiles_updated_at         BEFORE UPDATE ON profiles         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER memory_items_updated_at     BEFORE UPDATE ON memory_items     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 3 — Daily Planner (tasks, routines, planner_preferences, reminders)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE task_priority      AS ENUM ('low','medium','high','urgent');                 EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE task_status        AS ENUM ('todo','in_progress','done','skipped');          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE task_category      AS ENUM ('work','personal','health','finance','family','learning','errands','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE routine_type       AS ENUM ('morning','evening','work','study','weekend','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE energy_level       AS ENUM ('morning','afternoon','evening');               EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  notes             TEXT CHECK (char_length(notes) <= 2000),
  due_date          DATE,
  priority          task_priority NOT NULL DEFAULT 'medium',
  category          task_category NOT NULL DEFAULT 'other',
  estimated_minutes INTEGER CHECK (estimated_minutes > 0 AND estimated_minutes <= 480),
  status            task_status NOT NULL DEFAULT 'todo',
  ai_score          INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  order_index       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id    ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date   ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS routines (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description       TEXT CHECK (char_length(description) <= 500),
  type              routine_type NOT NULL DEFAULT 'custom',
  days_of_week      INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  start_time        TIME,
  estimated_minutes INTEGER CHECK (estimated_minutes > 0),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);

CREATE TABLE IF NOT EXISTS routine_steps (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id       UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description      TEXT CHECK (char_length(description) <= 500),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_routine_steps_routine_id ON routine_steps(routine_id);

CREATE TABLE IF NOT EXISTS planner_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wake_time       TIME DEFAULT '07:00',
  sleep_time      TIME DEFAULT '23:00',
  work_start      TIME DEFAULT '09:00',
  work_end        TIME DEFAULT '18:00',
  energy_peak     energy_level NOT NULL DEFAULT 'morning',
  planning_style  TEXT NOT NULL DEFAULT 'simple' CHECK (planning_style IN ('simple','detailed')),
  max_daily_tasks INTEGER NOT NULL DEFAULT 5 CHECK (max_daily_tasks BETWEEN 1 AND 20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id      UUID REFERENCES tasks(id) ON DELETE CASCADE,
  routine_id   UUID REFERENCES routines(id) ON DELETE CASCADE,
  title        TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  scheduled_at TIMESTAMPTZ NOT NULL,
  is_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(scheduled_at) WHERE is_sent = FALSE;

ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_steps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_user_policy           ON tasks;
DROP POLICY IF EXISTS routines_user_policy        ON routines;
DROP POLICY IF EXISTS routine_steps_user_policy   ON routine_steps;
DROP POLICY IF EXISTS planner_prefs_user_policy   ON planner_preferences;
DROP POLICY IF EXISTS reminders_user_policy       ON reminders;
CREATE POLICY tasks_user_policy           ON tasks         USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY routines_user_policy        ON routines      USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY routine_steps_user_policy   ON routine_steps USING (routine_id IN (SELECT id FROM routines WHERE user_id::text = current_setting('app.user_id', true)));
CREATE POLICY planner_prefs_user_policy   ON planner_preferences USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY reminders_user_policy       ON reminders     USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS tasks_updated_at         ON tasks;
DROP TRIGGER IF EXISTS routines_updated_at      ON routines;
DROP TRIGGER IF EXISTS planner_prefs_updated_at ON planner_preferences;
CREATE TRIGGER tasks_updated_at         BEFORE UPDATE ON tasks               FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER routines_updated_at      BEFORE UPDATE ON routines            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER planner_prefs_updated_at BEFORE UPDATE ON planner_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 4 — Focus & Productivity
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE focus_mode   AS ENUM ('quick','pomodoro','deep','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE energy_state AS ENUM ('low','normal','high');               EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS focus_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id               UUID REFERENCES tasks(id) ON DELETE SET NULL,
  mode                  focus_mode NOT NULL DEFAULT 'pomodoro',
  planned_minutes       INTEGER NOT NULL CHECK (planned_minutes BETWEEN 1 AND 300),
  actual_minutes        INTEGER CHECK (actual_minutes >= 0),
  completed             BOOLEAN NOT NULL DEFAULT FALSE,
  abandoned             BOOLEAN NOT NULL DEFAULT FALSE,
  body_doubling_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  task_title            TEXT,
  notes                 TEXT CHECK (char_length(notes) <= 1000),
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id   ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started   ON focus_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_completed ON focus_sessions(user_id, completed);

CREATE TABLE IF NOT EXISTS focus_preferences (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_mode               focus_mode NOT NULL DEFAULT 'pomodoro',
  break_interval_minutes     INTEGER NOT NULL DEFAULT 5  CHECK (break_interval_minutes BETWEEN 1 AND 30),
  long_break_minutes         INTEGER NOT NULL DEFAULT 15 CHECK (long_break_minutes BETWEEN 5 AND 60),
  sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
  body_doubling_default      BOOLEAN NOT NULL DEFAULT FALSE,
  daily_focus_goal_minutes   INTEGER NOT NULL DEFAULT 120 CHECK (daily_focus_goal_minutes BETWEEN 15 AND 720),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE focus_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_preferences  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS focus_sessions_user_policy ON focus_sessions;
DROP POLICY IF EXISTS focus_prefs_user_policy    ON focus_preferences;
CREATE POLICY focus_sessions_user_policy ON focus_sessions    USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY focus_prefs_user_policy    ON focus_preferences USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS focus_prefs_updated_at ON focus_preferences;
CREATE TRIGGER focus_prefs_updated_at BEFORE UPDATE ON focus_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 5 — Protection (risk_checks, saved_quotes, negotiation_templates)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE protection_check_type AS ENUM ('scam','quote','contract','decision','subscription'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE risk_level            AS ENUM ('low','medium','high','unknown');                      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS risk_checks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           protection_check_type NOT NULL,
  title          TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  input_hash     TEXT NOT NULL,
  risk_level     risk_level NOT NULL DEFAULT 'unknown',
  result_summary TEXT NOT NULL CHECK (char_length(result_summary) <= 3000),
  red_flags      TEXT[] DEFAULT '{}',
  safe_next_step TEXT CHECK (char_length(safe_next_step) <= 500),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risk_checks_user_id ON risk_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_checks_type    ON risk_checks(user_id, type);
CREATE INDEX IF NOT EXISTS idx_risk_checks_created ON risk_checks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS saved_quotes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  amount             DECIMAL(12,2),
  currency           TEXT NOT NULL DEFAULT 'INR',
  category           TEXT NOT NULL DEFAULT 'other' CHECK (char_length(category) <= 50),
  region             TEXT CHECK (char_length(region) <= 100),
  result_summary     TEXT CHECK (char_length(result_summary) <= 2000),
  risk_level         risk_level NOT NULL DEFAULT 'unknown',
  negotiation_script TEXT CHECK (char_length(negotiation_script) <= 2000),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_quotes_user_id ON saved_quotes(user_id);

CREATE TABLE IF NOT EXISTS negotiation_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (char_length(type) <= 50),
  context    TEXT NOT NULL CHECK (char_length(context) <= 500),
  script     TEXT NOT NULL CHECK (char_length(script) <= 3000),
  tone       TEXT NOT NULL DEFAULT 'polite' CHECK (tone IN ('polite','firm','professional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_negotiation_templates_user_id ON negotiation_templates(user_id);

ALTER TABLE risk_checks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_quotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS risk_checks_user_policy           ON risk_checks;
DROP POLICY IF EXISTS saved_quotes_user_policy          ON saved_quotes;
DROP POLICY IF EXISTS negotiation_templates_user_policy ON negotiation_templates;
CREATE POLICY risk_checks_user_policy           ON risk_checks           USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY saved_quotes_user_policy          ON saved_quotes          USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY negotiation_templates_user_policy ON negotiation_templates USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 6 — Money Helper (budgets, expenses, savings_goals, money_subscriptions, loan_scenarios, money_insights)
--   NOTE: original file referenced auth.users — normalized to users(id) here.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE expense_category AS ENUM ('food','rent','travel','bills','shopping','health','kids','entertainment','education','misc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE billing_cycle    AS ENUM ('monthly','quarterly','annual','weekly'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE savings_category AS ENUM ('emergency_fund','travel','home','education','vehicle','gadget','retirement','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE insight_type     AS ENUM ('spending','affordability','savings','loan','bill','calm','subscriptions'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS budgets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month          SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year           SMALLINT NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  monthly_income NUMERIC(14,2) NOT NULL DEFAULT 0,
  savings_target NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'INR',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month, year)
);

CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category     expense_category NOT NULL DEFAULT 'misc',
  amount       NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency     TEXT NOT NULL DEFAULT 'INR',
  description  TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  category       savings_category NOT NULL DEFAULT 'other',
  target_amount  NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  currency       TEXT NOT NULL DEFAULT 'INR',
  target_date    DATE,
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS money_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  amount            NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency          TEXT NOT NULL DEFAULT 'INR',
  billing_cycle     billing_cycle NOT NULL DEFAULT 'monthly',
  category          TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  next_billing_date DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_scenarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  principal      NUMERIC(14,2) NOT NULL CHECK (principal > 0),
  annual_rate    NUMERIC(6,3) NOT NULL CHECK (annual_rate >= 0),
  tenure_months  INTEGER NOT NULL CHECK (tenure_months > 0),
  emi_amount     NUMERIC(14,2),
  total_interest NUMERIC(14,2),
  total_cost     NUMERIC(14,2),
  currency       TEXT NOT NULL DEFAULT 'INR',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS money_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type insight_type NOT NULL,
  content      TEXT NOT NULL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date       ON expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category   ON expenses (user_id, category);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user       ON savings_goals (user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_money_subs_user_active   ON money_subscriptions (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_loan_scenarios_user      ON loan_scenarios (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_money_insights_user      ON money_insights (user_id, created_at DESC);

ALTER TABLE budgets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_scenarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_insights      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_own_budgets             ON budgets;
DROP POLICY IF EXISTS users_own_expenses            ON expenses;
DROP POLICY IF EXISTS users_own_savings_goals       ON savings_goals;
DROP POLICY IF EXISTS users_own_money_subscriptions ON money_subscriptions;
DROP POLICY IF EXISTS users_own_loan_scenarios      ON loan_scenarios;
DROP POLICY IF EXISTS users_own_money_insights      ON money_insights;
CREATE POLICY users_own_budgets             ON budgets             USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY users_own_expenses            ON expenses            USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY users_own_savings_goals       ON savings_goals       USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY users_own_money_subscriptions ON money_subscriptions USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY users_own_loan_scenarios      ON loan_scenarios      USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY users_own_money_insights      ON money_insights      USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS update_budgets_updated_at         ON budgets;
DROP TRIGGER IF EXISTS update_expenses_updated_at        ON expenses;
DROP TRIGGER IF EXISTS update_savings_goals_updated_at   ON savings_goals;
DROP TRIGGER IF EXISTS update_money_subs_updated_at      ON money_subscriptions;
CREATE TRIGGER update_budgets_updated_at         BEFORE UPDATE ON budgets             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_expenses_updated_at        BEFORE UPDATE ON expenses            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_savings_goals_updated_at   BEFORE UPDATE ON savings_goals       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_money_subs_updated_at      BEFORE UPDATE ON money_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 7 — Family OS (families, family_members, shared_tasks, etc.)
--   NOTE: original referenced auth.users — normalized to users(id).
--   Open USING(true) policies replaced with proper member-scoped ones below.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN CREATE TYPE family_role          AS ENUM ('owner','partner','adult','teen','child','elder'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE member_status        AS ENUM ('invited','active','removed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE shared_task_status   AS ENUM ('pending','in_progress','done'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE shared_task_category AS ENUM ('groceries','cleaning','repairs','school','health','errands','bills','cooking','childcare','misc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE family_event_type    AS ENUM ('appointment','school','birthday','travel','chore','reminder','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS families (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  invited_email TEXT,
  role          family_role NOT NULL DEFAULT 'adult',
  status        member_status NOT NULL DEFAULT 'invited',
  display_name  TEXT,
  invited_by    UUID REFERENCES users(id),
  joined_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, user_id),
  CHECK (user_id IS NOT NULL OR invited_email IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS shared_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     shared_task_category NOT NULL DEFAULT 'misc',
  status       shared_task_status NOT NULL DEFAULT 'pending',
  assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date     DATE,
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  event_type family_event_type NOT NULL DEFAULT 'other',
  start_date DATE NOT NULL,
  end_date   DATE,
  all_day    BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery_lists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Weekly groceries',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  quantity   TEXT,
  category   TEXT,
  is_bought  BOOLEAN NOT NULL DEFAULT FALSE,
  added_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  bought_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elder_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id         UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  medicines         TEXT[],
  conditions        TEXT,
  doctor_name       TEXT,
  doctor_contact    TEXT,
  emergency_contact TEXT,
  notes             TEXT,
  created_by        UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS child_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name   TEXT NOT NULL,
  age         SMALLINT,
  school_name TEXT,
  class_grade TEXT,
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_user    ON family_members (user_id, status);
CREATE INDEX IF NOT EXISTS idx_family_members_family  ON family_members (family_id, status);
CREATE INDEX IF NOT EXISTS idx_shared_tasks_family    ON shared_tasks (family_id, status);
CREATE INDEX IF NOT EXISTS idx_shared_tasks_assigned  ON shared_tasks (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_family_events_family   ON family_events (family_id, start_date);
CREATE INDEX IF NOT EXISTS idx_grocery_items_list     ON grocery_items (list_id, is_bought);
CREATE INDEX IF NOT EXISTS idx_grocery_items_family   ON grocery_items (family_id);
CREATE INDEX IF NOT EXISTS idx_elder_profiles_family  ON elder_profiles (family_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_family  ON child_profiles (family_id);

ALTER TABLE families         ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE elder_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles   ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies (open or scoped) for clean re-application.
DROP POLICY IF EXISTS service_role_families         ON families;
DROP POLICY IF EXISTS service_role_family_members   ON family_members;
DROP POLICY IF EXISTS service_role_shared_tasks     ON shared_tasks;
DROP POLICY IF EXISTS service_role_family_events    ON family_events;
DROP POLICY IF EXISTS service_role_grocery_lists    ON grocery_lists;
DROP POLICY IF EXISTS service_role_grocery_items    ON grocery_items;
DROP POLICY IF EXISTS service_role_elder_profiles   ON elder_profiles;
DROP POLICY IF EXISTS service_role_child_profiles   ON child_profiles;
DROP POLICY IF EXISTS families_member_access        ON families;
DROP POLICY IF EXISTS family_members_same_family    ON family_members;
DROP POLICY IF EXISTS shared_tasks_family_member    ON shared_tasks;
DROP POLICY IF EXISTS family_events_family_member   ON family_events;
DROP POLICY IF EXISTS grocery_lists_family_member   ON grocery_lists;
DROP POLICY IF EXISTS grocery_items_family_member   ON grocery_items;
DROP POLICY IF EXISTS elder_profiles_family_member  ON elder_profiles;
DROP POLICY IF EXISTS child_profiles_family_member  ON child_profiles;

-- Helper function: family IDs the current authenticated user belongs to.
CREATE OR REPLACE FUNCTION my_family_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT family_id
  FROM   family_members
  WHERE  user_id = auth.uid()
    AND  status  = 'active'
$$;

CREATE POLICY families_member_access       ON families         FOR ALL USING (id        IN (SELECT my_family_ids()));
CREATE POLICY family_members_same_family   ON family_members   FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY shared_tasks_family_member   ON shared_tasks     FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY family_events_family_member  ON family_events    FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY grocery_lists_family_member  ON grocery_lists    FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY grocery_items_family_member  ON grocery_items    FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY elder_profiles_family_member ON elder_profiles   FOR ALL USING (family_id IN (SELECT my_family_ids()));
CREATE POLICY child_profiles_family_member ON child_profiles   FOR ALL USING (family_id IN (SELECT my_family_ids()));

DROP TRIGGER IF EXISTS update_families_updated_at         ON families;
DROP TRIGGER IF EXISTS update_shared_tasks_updated_at     ON shared_tasks;
DROP TRIGGER IF EXISTS update_family_events_updated_at    ON family_events;
DROP TRIGGER IF EXISTS update_elder_profiles_updated_at   ON elder_profiles;
DROP TRIGGER IF EXISTS update_child_profiles_updated_at   ON child_profiles;
CREATE TRIGGER update_families_updated_at         BEFORE UPDATE ON families         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shared_tasks_updated_at     BEFORE UPDATE ON shared_tasks     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_family_events_updated_at    BEFORE UPDATE ON family_events    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_elder_profiles_updated_at   BEFORE UPDATE ON elder_profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_child_profiles_updated_at   BEFORE UPDATE ON child_profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 8 — WhatsApp & Voice
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  wa_id        TEXT NOT NULL,
  display_name TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (phone_number)
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone   ON whatsapp_sessions(phone_number);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON whatsapp_messages(session_id, created_at);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own WhatsApp session"  ON whatsapp_sessions;
DROP POLICY IF EXISTS "Users read own WhatsApp messages"   ON whatsapp_messages;
CREATE POLICY "Users manage own WhatsApp session" ON whatsapp_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own WhatsApp messages" ON whatsapp_messages
  USING (session_id IN (SELECT id FROM whatsapp_sessions WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_whatsapp_sessions_updated_at ON whatsapp_sessions;
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 9 — Billing (subscriptions, usage_records, increment_ai_usage RPC)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id                  TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free','pro','family')),
  status                   TEXT NOT NULL CHECK (status IN ('active','cancelled','past_due','trialing','expired')),
  interval                 TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly','yearly')),
  provider                 TEXT NOT NULL CHECK (provider IN ('razorpay','stripe')),
  provider_subscription_id TEXT,
  provider_customer_id     TEXT,
  current_period_start     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end       TIMESTAMPTZ NOT NULL,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

CREATE TABLE IF NOT EXISTS usage_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month             TEXT NOT NULL,
  ai_requests       INTEGER NOT NULL DEFAULT 0,
  whatsapp_messages INTEGER NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month)
);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_month ON usage_records(user_id, month);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users read own usage"        ON usage_records;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own usage"        ON usage_records FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID, p_month TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_records (user_id, month, ai_requests, updated_at)
    VALUES (p_user_id, p_month, 1, NOW())
  ON CONFLICT (user_id, month)
    DO UPDATE SET ai_requests = usage_records.ai_requests + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 10 — Enterprise (api_keys + language preference)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en-IN';

CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  key_prefix    TEXT NOT NULL,
  key_hash      TEXT NOT NULL UNIQUE,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_used_at  TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own API keys" ON api_keys;
CREATE POLICY "Users manage own API keys" ON api_keys
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_api_key_usage(p_key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys SET request_count = request_count + 1, last_used_at = NOW() WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE SECURITY — audit_logs, login_attempts, security_events
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  severity      TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity   ON audit_logs(severity, created_at DESC) WHERE severity IN ('warning','critical');

CREATE TABLE IF NOT EXISTS login_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  ip_address     TEXT NOT NULL,
  success        BOOLEAN NOT NULL,
  failure_reason TEXT,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email    ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip       ON login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failures ON login_attempts(email, success, created_at DESC) WHERE NOT success;

CREATE TABLE IF NOT EXISTS security_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,
  severity   TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','critical')),
  details    JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_events_type       ON security_events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(resolved, severity, created_at DESC) WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_security_events_user       ON security_events(user_id, created_at DESC);

ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages audit logs"      ON audit_logs;
DROP POLICY IF EXISTS "Service role manages login attempts"  ON login_attempts;
DROP POLICY IF EXISTS "Service role manages security events" ON security_events;
CREATE POLICY "Service role manages audit logs"      ON audit_logs      USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role manages login attempts"  ON login_attempts  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role manages security events" ON security_events USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION get_recent_failure_count(p_email TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE email = p_email AND success = FALSE AND created_at > NOW() - INTERVAL '15 minutes';
$$ LANGUAGE sql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE AUTH-TOKENS — password reset & email verification
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_user_id    ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON password_reset_tokens (expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evt_token_hash ON email_verification_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_user_id    ON email_verification_tokens (user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE password_reset_tokens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION purge_expired_auth_tokens() RETURNS VOID
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM password_reset_tokens     WHERE expires_at < NOW();
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
END;
$$;

-- Mark all existing users as email-verified (grandfather pre-feature accounts)
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE SESSION — session_version + active_sessions
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS active_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address    TEXT,
  user_agent    TEXT,
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last ON active_sessions (last_seen);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 12 — Memory Engine extensions + memory_events audit
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE memory_items
  ADD COLUMN IF NOT EXISTS importance   INT NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata     JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS memory_items_rank_idx
  ON memory_items (user_id, is_active, importance DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS memory_items_decay_idx
  ON memory_items (user_id, last_used_at NULLS FIRST, importance);

CREATE TABLE IF NOT EXISTS memory_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_id  UUID REFERENCES memory_items(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created','used','updated','deleted','archived','restored','corrected','exported')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata   JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS memory_events_user_idx   ON memory_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS memory_events_memory_idx ON memory_events (memory_id);

ALTER TABLE memory_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS memory_events_owner ON memory_events;
CREATE POLICY memory_events_owner ON memory_events
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 13 — Decision Logs (normalized FK to users)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS decision_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question         TEXT NOT NULL,
  category         TEXT,
  mode             TEXT NOT NULL DEFAULT 'analyze' CHECK (mode IN ('analyze','compare')),
  options          JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  result           JSONB NOT NULL,
  favorite         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS decision_logs_user_created ON decision_logs (user_id, created_at DESC);

ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS decision_logs_owner ON decision_logs;
CREATE POLICY decision_logs_owner ON decision_logs
  FOR ALL USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 14 — Money OS Advanced (transactions, liabilities, category_budgets)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type         TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
  category     TEXT NOT NULL DEFAULT 'misc',
  subcategory  TEXT,
  merchant     TEXT,
  payment_mode TEXT CHECK (payment_mode IN ('cash','upi','card','netbanking','wallet','cheque','other')),
  txn_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_txn_user_date     ON transactions (user_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_user_type     ON transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_txn_user_category ON transactions (user_id, category);

CREATE TABLE IF NOT EXISTS liabilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('home_loan','car_loan','personal_loan','credit_card','education_loan','business_loan','other')),
  principal     NUMERIC(14,2) NOT NULL CHECK (principal > 0),
  outstanding   NUMERIC(14,2) NOT NULL CHECK (outstanding >= 0),
  emi           NUMERIC(12,2) CHECK (emi > 0),
  interest_rate NUMERIC(5,2) CHECK (interest_rate >= 0),
  due_day       INT CHECK (due_day BETWEEN 1 AND 31),
  start_date    DATE,
  end_date      DATE,
  lender        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS category_budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  monthly_limit NUMERIC(12,2) NOT NULL CHECK (monthly_limit > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category)
);
CREATE INDEX IF NOT EXISTS idx_cat_budgets_user ON category_budgets (user_id);

ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS transactions_owner       ON transactions;
DROP POLICY IF EXISTS liabilities_owner        ON liabilities;
DROP POLICY IF EXISTS category_budgets_owner   ON category_budgets;
CREATE POLICY transactions_owner      ON transactions      FOR ALL USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY liabilities_owner       ON liabilities       FOR ALL USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY category_budgets_owner  ON category_budgets  FOR ALL USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS liabilities_updated_at      ON liabilities;
DROP TRIGGER IF EXISTS category_budgets_updated_at ON category_budgets;
CREATE TRIGGER liabilities_updated_at      BEFORE UPDATE ON liabilities      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER category_budgets_updated_at BEFORE UPDATE ON category_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- AURA — child development profiles (JSONB-per-user)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS aura_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aura_profiles_user ON aura_profiles (user_id, created_at ASC);

ALTER TABLE aura_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_profiles_owner ON aura_profiles;
CREATE POLICY aura_profiles_owner ON aura_profiles
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS update_aura_profiles_updated_at ON aura_profiles;
CREATE TRIGGER update_aura_profiles_updated_at
  BEFORE UPDATE ON aura_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIND OS — mood, journal, gratitude, sleep, tools, companion
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mood_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood       INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  stress     INTEGER CHECK (stress BETWEEN 1 AND 5),
  emotions   TEXT[] DEFAULT '{}',
  note       TEXT,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_logged ON mood_logs(user_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS journal_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT,
  content    TEXT NOT NULL,
  mood       INTEGER CHECK (mood BETWEEN 1 AND 5),
  prompt     TEXT,
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS gratitude_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items      TEXT[] NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_gratitude_user ON gratitude_entries(user_id, date DESC);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  bedtime        TEXT,
  wake_time      TEXT,
  duration_hours DECIMAL(4,2),
  quality        INTEGER CHECK (quality BETWEEN 1 AND 5),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user ON sleep_logs(user_id, date DESC);

CREATE TABLE IF NOT EXISTS mind_tool_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id    TEXT NOT NULL,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  duration_s INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mind_tool_sessions_user ON mind_tool_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mind_companion_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode       TEXT NOT NULL,
  title      TEXT,
  risk_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_sessions_user ON mind_companion_sessions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS mind_companion_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES mind_companion_sessions(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('none','mild','moderate','severe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_messages_session ON mind_companion_messages(session_id, created_at ASC);

ALTER TABLE mood_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_tool_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_companion_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_companion_messages   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mood_logs_owner             ON mood_logs;
DROP POLICY IF EXISTS journal_entries_owner       ON journal_entries;
DROP POLICY IF EXISTS gratitude_entries_owner     ON gratitude_entries;
DROP POLICY IF EXISTS sleep_logs_owner            ON sleep_logs;
DROP POLICY IF EXISTS mind_tool_sessions_owner    ON mind_tool_sessions;
DROP POLICY IF EXISTS companion_sessions_owner    ON mind_companion_sessions;
DROP POLICY IF EXISTS companion_messages_owner    ON mind_companion_messages;
CREATE POLICY mood_logs_owner          ON mood_logs               USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY journal_entries_owner    ON journal_entries         USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY gratitude_entries_owner  ON gratitude_entries       USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY sleep_logs_owner         ON sleep_logs              USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY mind_tool_sessions_owner ON mind_tool_sessions      USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY companion_sessions_owner ON mind_companion_sessions USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY companion_messages_owner ON mind_companion_messages USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIND SETTINGS — PIN lock, reminder time, voice preference
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mind_settings (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pin_hash              TEXT,
  reminder_time         TEXT,
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- AURA PHASE 3 — settings (PIN, prefs) + coach sessions & messages
-- ═══════════════════════════════════════════════════════════════════════════════

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
-- Idempotent additions for existing installations
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
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- AURA DOCUMENT VAULT — metadata table + Supabase Storage bucket
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS aura_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id      UUID REFERENCES aura_profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  doc_type      TEXT NOT NULL CHECK (doc_type IN ('iep','504','evaluation','medical','vaccination','other')),
  storage_path  TEXT NOT NULL,
  mime_type     TEXT,
  size_bytes    INTEGER,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aura_documents_user  ON aura_documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aura_documents_child ON aura_documents(child_id, created_at DESC);

ALTER TABLE aura_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_documents_owner ON aura_documents;
CREATE POLICY aura_documents_owner ON aura_documents
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

INSERT INTO storage.buckets (id, name, public)
VALUES ('aura-documents', 'aura-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIND PHASE 7 — multi-dimensional check-in + tool effectiveness + RAG
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE mood_logs
  ADD COLUMN IF NOT EXISTS energy            INTEGER CHECK (energy IS NULL OR (energy BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS stress_categories TEXT[]  DEFAULT '{}';

ALTER TABLE mind_tool_sessions
  ADD COLUMN IF NOT EXISTS pre_intensity   INTEGER CHECK (pre_intensity  IS NULL OR (pre_intensity  BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS post_intensity  INTEGER CHECK (post_intensity IS NULL OR (post_intensity BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_before     INTEGER CHECK (mood_before    IS NULL OR (mood_before    BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_after      INTEGER CHECK (mood_after     IS NULL OR (mood_after     BETWEEN 1 AND 5));

-- pgvector for journal RAG
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS journal_entries_embedding_idx
  ON journal_entries USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_journal_entries(
  query_embedding vector(768),
  match_user_id   UUID,
  match_count     INT     DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id           UUID,
  content      TEXT,
  mood         INTEGER,
  tags         TEXT[],
  created_at   TIMESTAMPTZ,
  similarity   FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT je.id, je.content, je.mood, je.tags, je.created_at,
         1 - (je.embedding <=> query_embedding) AS similarity
  FROM journal_entries je
  WHERE je.user_id = match_user_id
    AND je.embedding IS NOT NULL
    AND 1 - (je.embedding <=> query_embedding) > similarity_threshold
  ORDER BY je.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 12 — UNIFIED NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  module     TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,
  severity   TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','urgent')),
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_module ON notifications (user_id, module);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_dedup
  ON notifications (user_id, type, (metadata->>'dedup_key'))
  WHERE metadata ? 'dedup_key';

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notifications_owner ON notifications;
CREATE POLICY notifications_owner ON notifications
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 18 — HABIT BUILDER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS habits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  icon          TEXT,
  color         TEXT NOT NULL DEFAULT 'violet' CHECK (color IN ('violet','indigo','blue','emerald','amber','rose','pink','purple','sky','teal')),
  frequency     TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekdays','weekends','custom','weekly')),
  days_of_week  INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  target_per_day INTEGER NOT NULL DEFAULT 1 CHECK (target_per_day BETWEEN 1 AND 50),
  reminder_time TIME,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits (user_id, is_active);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS habits_owner ON habits;
CREATE POLICY habits_owner ON habits
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS habits_updated_at ON habits;
CREATE TRIGGER habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS habit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INTEGER NOT NULL DEFAULT 1 CHECK (count >= 0),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, date)
);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs (habit_id, date DESC);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS habit_logs_owner ON habit_logs;
CREATE POLICY habit_logs_owner ON habit_logs
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASES 15, 16, 17, 19, 20, 22, 25 — Vault, Travel, Career, Home, CRM, Investments, Briefings
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('id','legal','medical','financial','education','insurance','vehicle','property','tax','other')),
  storage_path TEXT NOT NULL, mime_type TEXT, size_bytes INTEGER,
  expires_at DATE, notes TEXT, tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vault_user_cat ON vault_documents(user_id, category, created_at DESC);
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vault_documents_owner ON vault_documents;
CREATE POLICY vault_documents_owner ON vault_documents USING (user_id::text = current_setting('app.user_id', true));
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-documents','vault-documents',false) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email TEXT, phone TEXT, company TEXT, role TEXT, group_name TEXT,
  birthday DATE, anniversary DATE, how_we_met TEXT, notes TEXT,
  tags TEXT[] DEFAULT '{}', follow_up_at DATE, last_contact_at TIMESTAMPTZ,
  strength INTEGER DEFAULT 3 CHECK (strength BETWEEN 1 AND 5),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id, archived);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contacts_owner ON contacts;
CREATE POLICY contacts_owner ON contacts USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call','message','meeting','email','event','other')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT, sentiment TEXT CHECK (sentiment IN ('positive','neutral','negative') OR sentiment IS NULL),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contact_interactions_owner ON contact_interactions;
CREATE POLICY contact_interactions_owner ON contact_interactions USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'role' CHECK (category IN ('role','skill','income','impact','learning','other')),
  target_date DATE, description TEXT,
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','paused','dropped')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_goals_owner ON career_goals;
CREATE POLICY career_goals_owner ON career_goals USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS career_goals_updated_at ON career_goals;
CREATE TRIGGER career_goals_updated_at BEFORE UPDATE ON career_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS skills_tracked (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER NOT NULL DEFAULT 3 CHECK (target_level BETWEEN 1 AND 5),
  hours_invested NUMERIC(6,1) NOT NULL DEFAULT 0,
  notes TEXT, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE skills_tracked ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS skills_tracked_owner ON skills_tracked;
CREATE POLICY skills_tracked_owner ON skills_tracked USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS skills_tracked_updated_at ON skills_tracked;
CREATE TRIGGER skills_tracked_updated_at BEFORE UPDATE ON skills_tracked FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills_tracked(id) ON DELETE SET NULL,
  title TEXT NOT NULL, url TEXT,
  type TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('book','course','article','video','podcast','project','mentorship','other')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','active','completed','dropped')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT, completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS learning_resources_owner ON learning_resources;
CREATE POLICY learning_resources_owner ON learning_resources USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL, start_date DATE, end_date DATE,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','booked','active','completed','cancelled')),
  budget_total NUMERIC(12,2), spent_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  travellers INTEGER NOT NULL DEFAULT 1, notes TEXT, cover_emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trips_owner ON trips;
CREATE POLICY trips_owner ON trips USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS trips_updated_at ON trips;
CREATE TRIGGER trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS trip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('flight','hotel','activity','transport','meal','note','expense','other')),
  title TEXT NOT NULL, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  location TEXT, cost NUMERIC(12,2), booking_ref TEXT, notes TEXT,
  is_done BOOLEAN NOT NULL DEFAULT FALSE, order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_items_owner ON trip_items;
CREATE POLICY trip_items_owner ON trip_items USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item TEXT NOT NULL, category TEXT, qty INTEGER NOT NULL DEFAULT 1,
  is_packed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS packing_items_owner ON packing_items;
CREATE POLICY packing_items_owner ON packing_items USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mutual_fund','stock','etf','fd','rd','ppf','epf','nps','gold','real_estate','crypto','bond','other')),
  invested_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  units NUMERIC(16,4), avg_cost NUMERIC(14,4),
  account TEXT, start_date DATE, notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investments_owner ON investments;
CREATE POLICY investments_owner ON investments USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS investments_updated_at ON investments;
CREATE TRIGGER investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS sip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  name TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  start_date DATE NOT NULL, next_date DATE NOT NULL, end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE sip_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sip_plans_owner ON sip_plans;
CREATE POLICY sip_plans_owner ON sip_plans USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS home_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'appliance' CHECK (type IN ('appliance','furniture','vehicle','property','other')),
  brand TEXT, model TEXT, serial_no TEXT,
  purchased_at DATE, warranty_until DATE, cost NUMERIC(12,2), notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE home_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS home_assets_owner ON home_assets;
CREATE POLICY home_assets_owner ON home_assets USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS home_assets_updated_at ON home_assets;
CREATE TRIGGER home_assets_updated_at BEFORE UPDATE ON home_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS home_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES home_assets(id) ON DELETE SET NULL,
  title TEXT NOT NULL, category TEXT,
  recurrence_months INTEGER, last_done_at DATE, next_due_at DATE,
  vendor TEXT, cost NUMERIC(12,2), notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE home_maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS home_maintenance_owner ON home_maintenance;
CREATE POLICY home_maintenance_owner ON home_maintenance USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  utility TEXT NOT NULL, provider TEXT,
  amount NUMERIC(12,2) NOT NULL,
  bill_date DATE NOT NULL, due_date DATE,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE, account_no TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS utility_bills_owner ON utility_bills;
CREATE POLICY utility_bills_owner ON utility_bills USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS daily_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL, content_md TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);
ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_briefings_owner ON daily_briefings;
CREATE POLICY daily_briefings_owner ON daily_briefings USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 21 — FOOD & NUTRITION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  cuisine TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack','dessert','drink') OR meal_type IS NULL),
  prep_min INTEGER NOT NULL DEFAULT 0 CHECK (prep_min >= 0),
  cook_min INTEGER NOT NULL DEFAULT 0 CHECK (cook_min >= 0),
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 50),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories INTEGER, protein_g NUMERIC(6,1), carbs_g NUMERIC(6,1), fat_g NUMERIC(6,1),
  tags TEXT[] DEFAULT '{}', image_emoji TEXT, notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id, is_favorite, created_at DESC);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recipes_owner ON recipes;
CREATE POLICY recipes_owner ON recipes USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS recipes_updated_at ON recipes;
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  name_override TEXT,
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 20),
  notes TEXT,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date, meal_type);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meal_plans_owner ON meal_plans;
CREATE POLICY meal_plans_owner ON meal_plans USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  qty NUMERIC(8,2) NOT NULL DEFAULT 1,
  qty_unit TEXT NOT NULL DEFAULT 'serving',
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date DESC);
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_logs_owner ON food_logs;
CREATE POLICY food_logs_owner ON food_logs USING (user_id::text = current_setting('app.user_id', true));

-- nutrition_grocery_items — distinct from family-shared `grocery_items`
CREATE TABLE IF NOT EXISTS nutrition_grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  qty NUMERIC(8,2),
  unit TEXT,
  is_bought BOOLEAN NOT NULL DEFAULT FALSE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nutrition_grocery_user ON nutrition_grocery_items(user_id, is_bought, category);
ALTER TABLE nutrition_grocery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_grocery_items_owner ON nutrition_grocery_items;
CREATE POLICY nutrition_grocery_items_owner ON nutrition_grocery_items USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS nutrition_targets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_calories INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calories BETWEEN 800 AND 6000),
  protein_g INTEGER NOT NULL DEFAULT 80 CHECK (protein_g BETWEEN 0 AND 500),
  carbs_g INTEGER NOT NULL DEFAULT 250 CHECK (carbs_g BETWEEN 0 AND 1000),
  fat_g INTEGER NOT NULL DEFAULT 65 CHECK (fat_g BETWEEN 0 AND 400),
  diet_type TEXT NOT NULL DEFAULT 'balanced' CHECK (diet_type IN ('balanced','high-protein','low-carb','keto','vegetarian','vegan','mediterranean','custom')),
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_targets_owner ON nutrition_targets;
CREATE POLICY nutrition_targets_owner ON nutrition_targets USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS nutrition_targets_updated_at ON nutrition_targets;
CREATE TRIGGER nutrition_targets_updated_at BEFORE UPDATE ON nutrition_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 23 — LEGAL & COMPLIANCE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('itr','gst','advance_tax','tds','property_tax','renewal','court','other')),
  due_date DATE NOT NULL,
  amount NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','filed','paid','dismissed','overdue')),
  reference_no TEXT,
  authority TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_user_due ON legal_deadlines(user_id, due_date);
ALTER TABLE legal_deadlines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_deadlines_owner ON legal_deadlines;
CREATE POLICY legal_deadlines_owner ON legal_deadlines USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS legal_deadlines_updated_at ON legal_deadlines;
CREATE TRIGGER legal_deadlines_updated_at BEFORE UPDATE ON legal_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'other' CHECK (doc_type IN ('contract','notice','agreement','rental','employment','will','poa','other')),
  original_text TEXT NOT NULL,
  summary_md TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_documents_user ON legal_documents(user_id, created_at DESC);
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_documents_owner ON legal_documents;
CREATE POLICY legal_documents_owner ON legal_documents USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS legal_compliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'personal' CHECK (category IN ('personal','tax','business','property','other')),
  frequency TEXT NOT NULL DEFAULT 'annual' CHECK (frequency IN ('one-time','monthly','quarterly','annual','none')),
  last_done_at DATE,
  next_due_at DATE,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  applicable BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_compliances_user ON legal_compliances(user_id, applicable, next_due_at);
ALTER TABLE legal_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_compliances_owner ON legal_compliances;
CREATE POLICY legal_compliances_owner ON legal_compliances USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS legal_compliances_updated_at ON legal_compliances;
CREATE TRIGGER legal_compliances_updated_at BEFORE UPDATE ON legal_compliances FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 24 — BUSINESS ASSISTANT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  company TEXT, email TEXT, phone TEXT,
  gst_no TEXT, pan_no TEXT, address TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_clients_user ON business_clients(user_id, archived);
ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_clients_owner ON business_clients;
CREATE POLICY business_clients_owner ON business_clients USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_clients_updated_at ON business_clients;
CREATE TRIGGER business_clients_updated_at BEFORE UPDATE ON business_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead','active','on_hold','done','cancelled')),
  start_date DATE, end_date DATE,
  fee NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  hourly_rate NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_projects_user ON business_projects(user_id, status);
ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_projects_owner ON business_projects;
CREATE POLICY business_projects_owner ON business_projects USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_projects_updated_at ON business_projects;
CREATE TRIGGER business_projects_updated_at BEFORE UPDATE ON business_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  invoice_no TEXT NOT NULL,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amt NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amt NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  paid_at DATE,
  notes TEXT, terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON business_invoices(user_id, status, issued_at DESC);
ALTER TABLE business_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_invoices_owner ON business_invoices;
CREATE POLICY business_invoices_owner ON business_invoices USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_invoices_updated_at ON business_invoices;
CREATE TRIGGER business_invoices_updated_at BEFORE UPDATE ON business_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('software','hardware','travel','office','marketing','professional_fees','utilities','tax','other')),
  vendor TEXT,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user ON business_expenses(user_id, occurred_at DESC);
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_expenses_owner ON business_expenses;
CREATE POLICY business_expenses_owner ON business_expenses USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — All HandleLife OS schema applied.
-- ═══════════════════════════════════════════════════════════════════════════════
