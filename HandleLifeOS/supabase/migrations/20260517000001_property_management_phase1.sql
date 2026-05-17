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
