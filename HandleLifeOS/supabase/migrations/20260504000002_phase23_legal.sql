-- Phase 23 — Legal & Compliance
-- Tables: legal_deadlines, legal_documents, legal_compliances
-- All idempotent. RLS via app.user_id session var.

-- ═══════════════════════════════════════════════════════════════════════════════
-- LEGAL DEADLINES — tax filings, GST returns, ITR, advance tax, TDS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_deadlines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  type          TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('itr','gst','advance_tax','tds','property_tax','renewal','court','other')),
  due_date      DATE NOT NULL,
  amount        NUMERIC(14,2),
  currency      TEXT NOT NULL DEFAULT 'INR',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','filed','paid','dismissed','overdue')),
  reference_no  TEXT,
  authority     TEXT,                                        -- 'Income Tax Dept', 'GSTN', 'BMC', etc.
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_user_due ON legal_deadlines(user_id, due_date);

ALTER TABLE legal_deadlines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_deadlines_owner ON legal_deadlines;
CREATE POLICY legal_deadlines_owner ON legal_deadlines
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS legal_deadlines_updated_at ON legal_deadlines;
CREATE TRIGGER legal_deadlines_updated_at BEFORE UPDATE ON legal_deadlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- LEGAL DOCUMENTS — documents simplified by AI (contracts, notices, agreements)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  doc_type      TEXT NOT NULL DEFAULT 'other' CHECK (doc_type IN ('contract','notice','agreement','rental','employment','will','poa','other')),
  original_text TEXT NOT NULL,
  summary_md    TEXT NOT NULL,                               -- AI-generated plain-English summary
  key_points    JSONB NOT NULL DEFAULT '[]'::jsonb,          -- array of strings
  red_flags     JSONB NOT NULL DEFAULT '[]'::jsonb,          -- AI-detected concerns
  expires_at    DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_documents_user ON legal_documents(user_id, created_at DESC);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_documents_owner ON legal_documents;
CREATE POLICY legal_documents_owner ON legal_documents
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- LEGAL COMPLIANCES — recurring checklist (PAN-Aadhaar link, KYC, nominee, etc.)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_compliances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'personal' CHECK (category IN ('personal','tax','business','property','other')),
  frequency     TEXT NOT NULL DEFAULT 'annual' CHECK (frequency IN ('one-time','monthly','quarterly','annual','none')),
  last_done_at  DATE,
  next_due_at   DATE,
  is_done       BOOLEAN NOT NULL DEFAULT FALSE,
  applicable    BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_compliances_user ON legal_compliances(user_id, applicable, next_due_at);

ALTER TABLE legal_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_compliances_owner ON legal_compliances;
CREATE POLICY legal_compliances_owner ON legal_compliances
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS legal_compliances_updated_at ON legal_compliances;
CREATE TRIGGER legal_compliances_updated_at BEFORE UPDATE ON legal_compliances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
