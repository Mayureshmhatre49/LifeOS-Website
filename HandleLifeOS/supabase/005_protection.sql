-- Phase 5: Protection & Trust Engine

CREATE TYPE protection_check_type AS ENUM (
  'scam', 'quote', 'contract', 'decision', 'subscription'
);
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'unknown');

-- Risk checks (no raw sensitive text stored — only hash + summary)
CREATE TABLE risk_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type protection_check_type NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  input_hash TEXT NOT NULL,           -- SHA-256 of input, for deduplication
  risk_level risk_level NOT NULL DEFAULT 'unknown',
  result_summary TEXT NOT NULL CHECK (char_length(result_summary) <= 3000),
  red_flags TEXT[] DEFAULT '{}',
  safe_next_step TEXT CHECK (char_length(safe_next_step) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_checks_user_id ON risk_checks(user_id);
CREATE INDEX idx_risk_checks_type ON risk_checks(user_id, type);
CREATE INDEX idx_risk_checks_created ON risk_checks(user_id, created_at DESC);

-- Saved quotes
CREATE TABLE saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  amount DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  category TEXT NOT NULL DEFAULT 'other' CHECK (char_length(category) <= 50),
  region TEXT CHECK (char_length(region) <= 100),
  result_summary TEXT CHECK (char_length(result_summary) <= 2000),
  risk_level risk_level NOT NULL DEFAULT 'unknown',
  negotiation_script TEXT CHECK (char_length(negotiation_script) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_quotes_user_id ON saved_quotes(user_id);

-- Negotiation templates (user-saved scripts)
CREATE TABLE negotiation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (char_length(type) <= 50),
  context TEXT NOT NULL CHECK (char_length(context) <= 500),
  script TEXT NOT NULL CHECK (char_length(script) <= 3000),
  tone TEXT NOT NULL DEFAULT 'polite' CHECK (tone IN ('polite', 'firm', 'professional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_negotiation_templates_user_id ON negotiation_templates(user_id);

-- RLS
ALTER TABLE risk_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_checks_user_policy ON risk_checks
  USING (user_id::text = current_setting('app.user_id', true));

CREATE POLICY saved_quotes_user_policy ON saved_quotes
  USING (user_id::text = current_setting('app.user_id', true));

CREATE POLICY negotiation_templates_user_policy ON negotiation_templates
  USING (user_id::text = current_setting('app.user_id', true));
