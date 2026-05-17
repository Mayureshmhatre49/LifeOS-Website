-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 4: Financial Intelligence
-- Income / expense ledger per property; P&L, ROI, yield computed at query time
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_transactions (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID    NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  property_id      UUID    NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type             TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  category         TEXT    NOT NULL DEFAULT 'other_expense'
    CHECK (category IN (
      -- income
      'rent', 'lease_premium', 'deposit_received', 'sale_proceeds', 'other_income',
      -- expense
      'maintenance_cost', 'renovation', 'property_tax', 'society_charges',
      'insurance_premium', 'loan_emi', 'utility', 'legal_fees',
      'brokerage', 'registration_charges', 'other_expense'
    )),
  amount           NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  description      TEXT,
  transaction_date DATE    NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prop_txn_user_id_idx     ON property_transactions(user_id);
CREATE INDEX IF NOT EXISTS prop_txn_property_id_idx ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS prop_txn_date_idx        ON property_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS prop_txn_type_idx        ON property_transactions(type);

ALTER TABLE property_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_transactions_owner ON property_transactions;
CREATE POLICY property_transactions_owner ON property_transactions
  USING  (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
