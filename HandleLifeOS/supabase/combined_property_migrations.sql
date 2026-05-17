-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 1: Foundation
-- Multi-property core, property profiles, linking to existing home tables
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'primary_residence'
    CHECK (type IN ('primary_residence','apartment','villa','vacation_home','farmhouse',
                    'commercial','office','shop','warehouse','land','ancestral','other')),
  status           TEXT NOT NULL DEFAULT 'owned'
    CHECK (status IN ('owned','rented_out','vacant','under_renovation','for_sale')),
  address          TEXT,
  city             TEXT,
  state            TEXT,
  country          TEXT,
  pincode          TEXT,
  gps_lat          NUMERIC(10,7),
  gps_lng          NUMERIC(10,7),
  purchase_date    DATE,
  purchase_value   NUMERIC(15,2),
  current_value    NUMERIC(15,2),
  built_up_area    NUMERIC(10,2),
  carpet_area      NUMERIC(10,2),
  plot_area        NUMERIC(10,2),
  area_unit        TEXT DEFAULT 'sqft'
    CHECK (area_unit IN ('sqft','sqm','sqyd','acres','guntha')),
  ownership_type   TEXT DEFAULT 'sole'
    CHECK (ownership_type IN ('sole','joint','inherited','trust','company')),
  co_owners        TEXT,
  society_name     TEXT,
  registration_no  TEXT,
  property_tax_no  TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS properties_owner ON properties;
CREATE POLICY properties_owner ON properties
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Link existing home tables to properties
ALTER TABLE home_assets      ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE home_maintenance ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE utility_bills    ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS home_assets_property_id_idx      ON home_assets(property_id)      WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS home_maintenance_property_id_idx ON home_maintenance(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS utility_bills_property_id_idx    ON utility_bills(property_id)    WHERE property_id IS NOT NULL;
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
-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 3: Property Document Vault
-- Property-specific document categories, expiry detection
-- Uses existing vault-documents storage bucket (same RLS path convention)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'sale_deed','agreement_to_sale','lease','society_share',
      'mutation','tax_receipt','encumbrance','na_order','survey_map',
      'oc_cc','title_report','poa',
      'loan_agreement','insurance','deposit_receipt','rent_receipt',
      'structural_drawing','electrical_drawing','plumbing_layout',
      'hvac','solar','dg','appliance_manual','warranty',
      'other'
    )),
  storage_path TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL DEFAULT 0,
  expires_at   DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_documents_user_id_idx     ON property_documents(user_id);
CREATE INDEX IF NOT EXISTS property_documents_property_id_idx ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS property_documents_expires_at_idx  ON property_documents(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_documents_owner ON property_documents;
CREATE POLICY property_documents_owner ON property_documents
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
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
-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 5: Tenant & Occupancy Management
-- Tenant profiles, lease tracking, month-by-month rent payment log
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  id_type         TEXT CHECK (id_type IN ('aadhaar','pan','passport','voter_id','driving_license','other')),
  id_number       TEXT,
  lease_start     DATE,
  lease_end       DATE,
  monthly_rent    NUMERIC(12,2),
  deposit_amount  NUMERIC(12,2),
  deposit_status  TEXT NOT NULL DEFAULT 'held'
    CHECK (deposit_status IN ('held','refunded','partial')),
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','notice','vacated')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prop_tenants_user_id_idx     ON property_tenants(user_id);
CREATE INDEX IF NOT EXISTS prop_tenants_property_id_idx ON property_tenants(property_id);
CREATE INDEX IF NOT EXISTS prop_tenants_status_idx      ON property_tenants(status) WHERE status != 'vacated';

ALTER TABLE property_tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_tenants_owner ON property_tenants;
CREATE POLICY property_tenants_owner ON property_tenants
  USING  (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS property_tenants_updated_at ON property_tenants;
CREATE TRIGGER property_tenants_updated_at BEFORE UPDATE ON property_tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Month-by-month rent payment log ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_rent_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id)             ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id)        ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES property_tenants(id)  ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  month       TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'), -- 'YYYY-MM'
  paid_on     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, month)
);

CREATE INDEX IF NOT EXISTS prop_rent_user_id_idx     ON property_rent_payments(user_id);
CREATE INDEX IF NOT EXISTS prop_rent_property_id_idx ON property_rent_payments(property_id);
CREATE INDEX IF NOT EXISTS prop_rent_tenant_id_idx   ON property_rent_payments(tenant_id);

ALTER TABLE property_rent_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_rent_payments_owner ON property_rent_payments;
CREATE POLICY property_rent_payments_owner ON property_rent_payments
  USING  (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
