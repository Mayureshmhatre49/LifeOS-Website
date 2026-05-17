-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 2: Maintenance & Repairs OS
-- Breakdown tickets, emergency contacts per property
-- ═══════════════════════════════════════════════════════════════════════════════

-- Breakdown / repair tickets
CREATE TABLE IF NOT EXISTS property_issues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN ('plumbing','electrical','structural','appliance','security','pest','hvac','waterproofing','painting','other')),
  priority        TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','emergency')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  vendor_name     TEXT,
  vendor_phone    TEXT,
  estimated_cost  NUMERIC(12,2),
  actual_cost     NUMERIC(12,2),
  reported_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_at     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_issues_user_id_idx     ON property_issues(user_id);
CREATE INDEX IF NOT EXISTS property_issues_property_id_idx ON property_issues(property_id);
CREATE INDEX IF NOT EXISTS property_issues_status_idx      ON property_issues(status) WHERE status NOT IN ('resolved','closed');

ALTER TABLE property_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_issues_owner ON property_issues;
CREATE POLICY property_issues_owner ON property_issues
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS property_issues_updated_at ON property_issues;
CREATE TRIGGER property_issues_updated_at BEFORE UPDATE ON property_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Emergency contacts per property
CREATE TABLE IF NOT EXISTS property_emergency_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  name        TEXT,
  phone       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('electrician','plumber','security','locksmith','fire','police','hospital','caretaker','insurance','gas','water','other')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_ec_user_id_idx     ON property_emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS property_ec_property_id_idx ON property_emergency_contacts(property_id);

ALTER TABLE property_emergency_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_ec_owner ON property_emergency_contacts;
CREATE POLICY property_ec_owner ON property_emergency_contacts
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
