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
