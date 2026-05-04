-- Phase 14: Money OS Advanced
-- New tables: transactions, liabilities, category_budgets

-- ── Transactions (comprehensive income/expense/transfer ledger) ────────────────

CREATE TABLE IF NOT EXISTS transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        numeric(12, 2) NOT NULL CHECK (amount > 0),
  type          text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category      text NOT NULL DEFAULT 'misc',
  subcategory   text,
  merchant      text,
  payment_mode  text CHECK (payment_mode IN ('cash', 'upi', 'card', 'netbanking', 'wallet', 'cheque', 'other')),
  txn_date      date NOT NULL DEFAULT CURRENT_DATE,
  notes         text,
  metadata      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_user_date     ON transactions (user_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_user_type     ON transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_txn_user_category ON transactions (user_id, category);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_owner" ON transactions
  FOR ALL USING (user_id = (current_setting('app.user_id', true))::uuid);

-- ── Liabilities (actual debt/loan tracking, not calculator scenarios) ─────────

CREATE TABLE IF NOT EXISTS liabilities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  type           text NOT NULL DEFAULT 'other'
                   CHECK (type IN ('home_loan', 'car_loan', 'personal_loan', 'credit_card',
                                   'education_loan', 'business_loan', 'other')),
  principal      numeric(14, 2) NOT NULL CHECK (principal > 0),
  outstanding    numeric(14, 2) NOT NULL CHECK (outstanding >= 0),
  emi            numeric(12, 2) CHECK (emi > 0),
  interest_rate  numeric(5, 2) CHECK (interest_rate >= 0),
  due_day        int CHECK (due_day BETWEEN 1 AND 31),
  start_date     date,
  end_date       date,
  lender         text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_liabilities_user ON liabilities (user_id, created_at DESC);

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "liabilities_owner" ON liabilities
  FOR ALL USING (user_id = (current_setting('app.user_id', true))::uuid);

-- ── Category Budgets (per-category monthly spend limits) ─────────────────────

CREATE TABLE IF NOT EXISTS category_budgets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category       text NOT NULL,
  monthly_limit  numeric(12, 2) NOT NULL CHECK (monthly_limit > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_cat_budgets_user ON category_budgets (user_id);

ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "category_budgets_owner" ON category_budgets
  FOR ALL USING (user_id = (current_setting('app.user_id', true))::uuid);

-- ── Triggers for updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'liabilities_updated_at') THEN
    CREATE TRIGGER liabilities_updated_at
      BEFORE UPDATE ON liabilities
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'category_budgets_updated_at') THEN
    CREATE TRIGGER category_budgets_updated_at
      BEFORE UPDATE ON category_budgets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
