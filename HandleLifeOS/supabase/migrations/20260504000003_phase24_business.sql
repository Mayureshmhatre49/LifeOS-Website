-- Phase 24 — Business Assistant
-- Tables: business_clients, business_projects, business_invoices, business_expenses
-- All idempotent. RLS via app.user_id. update_updated_at trigger reused.

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUSINESS CLIENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  gst_no        TEXT,
  pan_no        TEXT,
  address       TEXT,
  currency      TEXT NOT NULL DEFAULT 'INR',
  notes         TEXT,
  archived      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_clients_user ON business_clients(user_id, archived);

ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_clients_owner ON business_clients;
CREATE POLICY business_clients_owner ON business_clients
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS business_clients_updated_at ON business_clients;
CREATE TRIGGER business_clients_updated_at BEFORE UPDATE ON business_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUSINESS PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead','active','on_hold','done','cancelled')),
  start_date    DATE,
  end_date      DATE,
  fee           NUMERIC(14,2),
  currency      TEXT NOT NULL DEFAULT 'INR',
  hourly_rate   NUMERIC(10,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_projects_user ON business_projects(user_id, status);

ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_projects_owner ON business_projects;
CREATE POLICY business_projects_owner ON business_projects
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS business_projects_updated_at ON business_projects;
CREATE TRIGGER business_projects_updated_at BEFORE UPDATE ON business_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUSINESS INVOICES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  invoice_no    TEXT NOT NULL,
  issued_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at        DATE,
  items         JSONB NOT NULL DEFAULT '[]'::jsonb,         -- [{description, qty, rate, amount}]
  subtotal      NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_pct       NUMERIC(5,2)  NOT NULL DEFAULT 0,
  tax_amt       NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amt  NUMERIC(14,2) NOT NULL DEFAULT 0,
  total         NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'INR',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  paid_at       DATE,
  notes         TEXT,
  terms         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON business_invoices(user_id, status, issued_at DESC);

ALTER TABLE business_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_invoices_owner ON business_invoices;
CREATE POLICY business_invoices_owner ON business_invoices
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS business_invoices_updated_at ON business_invoices;
CREATE TRIGGER business_invoices_updated_at BEFORE UPDATE ON business_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- BUSINESS EXPENSES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  client_id     UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  category      TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('software','hardware','travel','office','marketing','professional_fees','utilities','tax','other')),
  vendor        TEXT,
  amount        NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency      TEXT NOT NULL DEFAULT 'INR',
  occurred_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  description   TEXT,
  is_billable   BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user ON business_expenses(user_id, occurred_at DESC);

ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_expenses_owner ON business_expenses;
CREATE POLICY business_expenses_owner ON business_expenses
  USING (user_id::text = current_setting('app.user_id', true));
