-- Phase 6: Money Intelligence Engine

-- Enums
CREATE TYPE expense_category AS ENUM (
  'food', 'rent', 'travel', 'bills', 'shopping',
  'health', 'kids', 'entertainment', 'education', 'misc'
);

CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'annual', 'weekly');

CREATE TYPE savings_category AS ENUM (
  'emergency_fund', 'travel', 'home', 'education', 'vehicle', 'gadget', 'retirement', 'other'
);

CREATE TYPE insight_type AS ENUM (
  'spending', 'affordability', 'savings', 'loan', 'bill', 'calm', 'subscriptions'
);

-- Budgets: one active budget per user per month
CREATE TABLE budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month       SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        SMALLINT NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  monthly_income     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  savings_target     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'INR',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

-- Expenses: individual spending entries
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    expense_category NOT NULL DEFAULT 'misc',
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency    TEXT NOT NULL DEFAULT 'INR',
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Savings goals
CREATE TABLE savings_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        savings_category NOT NULL DEFAULT 'other',
  target_amount   NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
  current_amount  NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  currency        TEXT NOT NULL DEFAULT 'INR',
  target_date     DATE,
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Money subscriptions (what the user actually pays for)
CREATE TABLE money_subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  amount           NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency         TEXT NOT NULL DEFAULT 'INR',
  billing_cycle    billing_cycle NOT NULL DEFAULT 'monthly',
  category         TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  next_billing_date DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loan / EMI scenarios (saved calculations, not real loan data)
CREATE TABLE loan_scenarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  principal       NUMERIC(14, 2) NOT NULL CHECK (principal > 0),
  annual_rate     NUMERIC(6, 3) NOT NULL CHECK (annual_rate >= 0),
  tenure_months   INTEGER NOT NULL CHECK (tenure_months > 0),
  emi_amount      NUMERIC(14, 2),
  total_interest  NUMERIC(14, 2),
  total_cost      NUMERIC(14, 2),
  currency        TEXT NOT NULL DEFAULT 'INR',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated money insights cache
CREATE TABLE money_insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type insight_type NOT NULL,
  content      TEXT NOT NULL,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_expenses_user_date ON expenses (user_id, expense_date DESC);
CREATE INDEX idx_expenses_user_category ON expenses (user_id, category);
CREATE INDEX idx_savings_goals_user ON savings_goals (user_id, is_completed);
CREATE INDEX idx_money_subs_user_active ON money_subscriptions (user_id, is_active);
CREATE INDEX idx_loan_scenarios_user ON loan_scenarios (user_id, created_at DESC);
CREATE INDEX idx_money_insights_user ON money_insights (user_id, created_at DESC);

-- Triggers (reuse existing function from Phase 3)
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_money_subs_updated_at BEFORE UPDATE ON money_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_budgets" ON budgets
  USING (user_id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "users_own_expenses" ON expenses
  USING (user_id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "users_own_savings_goals" ON savings_goals
  USING (user_id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "users_own_money_subscriptions" ON money_subscriptions
  USING (user_id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "users_own_loan_scenarios" ON loan_scenarios
  USING (user_id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "users_own_money_insights" ON money_insights
  USING (user_id = (current_setting('app.user_id', true))::uuid);
