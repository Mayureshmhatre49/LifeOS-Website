-- Master migration for Phases 15, 16, 17, 19, 20, 22, 25
-- All idempotent. Tables: vault_documents, contacts, contact_interactions,
-- career_goals, skills_tracked, learning_resources, trips, trip_items,
-- packing_items, investments, sip_plans, home_assets, home_maintenance,
-- utility_bills, daily_briefings.

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 15 — DOCUMENT VAULT (life-wide)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vault_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('id','legal','medical','financial','education','insurance','vehicle','property','tax','other')),
  storage_path  TEXT NOT NULL,
  mime_type     TEXT,
  size_bytes    INTEGER,
  expires_at    DATE,
  notes         TEXT,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vault_user_cat ON vault_documents(user_id, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_expiry ON vault_documents(user_id, expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vault_documents_owner ON vault_documents;
CREATE POLICY vault_documents_owner ON vault_documents
  USING (user_id::text = current_setting('app.user_id', true));

INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-documents', 'vault-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 20 — NETWORK & RELATIONSHIPS (CRM)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email         TEXT,
  phone         TEXT,
  company       TEXT,
  role          TEXT,
  group_name    TEXT,                                     -- 'family' | 'friends' | 'work' | 'mentor' | etc.
  birthday      DATE,
  anniversary   DATE,
  how_we_met    TEXT,
  notes         TEXT,
  tags          TEXT[] DEFAULT '{}',
  follow_up_at  DATE,                                     -- next reminder
  last_contact_at TIMESTAMPTZ,
  strength      INTEGER DEFAULT 3 CHECK (strength BETWEEN 1 AND 5),  -- relationship strength
  archived      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON contacts(user_id, birthday) WHERE birthday IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_follow ON contacts(user_id, follow_up_at) WHERE follow_up_at IS NOT NULL;

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contacts_owner ON contacts;
CREATE POLICY contacts_owner ON contacts
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS contact_interactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('call','message','meeting','email','event','other')),
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes         TEXT,
  sentiment     TEXT CHECK (sentiment IN ('positive','neutral','negative') OR sentiment IS NULL),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON contact_interactions(contact_id, occurred_at DESC);

ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contact_interactions_owner ON contact_interactions;
CREATE POLICY contact_interactions_owner ON contact_interactions
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 17 — CAREER & GROWTH HUB
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS career_goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'role' CHECK (category IN ('role','skill','income','impact','learning','other')),
  target_date   DATE,
  description   TEXT,
  progress_pct  INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','achieved','paused','dropped')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_goals_user ON career_goals(user_id, status);

ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_goals_owner ON career_goals;
CREATE POLICY career_goals_owner ON career_goals
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS career_goals_updated_at ON career_goals;
CREATE TRIGGER career_goals_updated_at BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS skills_tracked (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT,                                       -- 'technical' | 'soft' | 'language' | 'creative'
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  target_level  INTEGER NOT NULL DEFAULT 3 CHECK (target_level BETWEEN 1 AND 5),
  hours_invested NUMERIC(6,1) NOT NULL DEFAULT 0,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skills_user ON skills_tracked(user_id, is_active);

ALTER TABLE skills_tracked ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS skills_tracked_owner ON skills_tracked;
CREATE POLICY skills_tracked_owner ON skills_tracked
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS skills_tracked_updated_at ON skills_tracked;
CREATE TRIGGER skills_tracked_updated_at BEFORE UPDATE ON skills_tracked
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS learning_resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id      UUID REFERENCES skills_tracked(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  url           TEXT,
  type          TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('book','course','article','video','podcast','project','mentorship','other')),
  status        TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','active','completed','dropped')),
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes         TEXT,
  completed_at  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_user_status ON learning_resources(user_id, status);

ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS learning_resources_owner ON learning_resources;
CREATE POLICY learning_resources_owner ON learning_resources
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 16 — TRAVEL & TRIP PLANNER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination   TEXT NOT NULL,
  start_date    DATE,
  end_date      DATE,
  status        TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','booked','active','completed','cancelled')),
  budget_total  NUMERIC(12,2),
  spent_total   NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'INR',
  travellers    INTEGER NOT NULL DEFAULT 1 CHECK (travellers BETWEEN 1 AND 20),
  notes         TEXT,
  cover_emoji   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id, start_date DESC);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trips_owner ON trips;
CREATE POLICY trips_owner ON trips
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS trips_updated_at ON trips;
CREATE TRIGGER trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS trip_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id       UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('flight','hotel','activity','transport','meal','note','expense','other')),
  title         TEXT NOT NULL,
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  location      TEXT,
  cost          NUMERIC(12,2),
  booking_ref   TEXT,
  notes         TEXT,
  is_done       BOOLEAN NOT NULL DEFAULT FALSE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trip_items_trip ON trip_items(trip_id, order_index, starts_at);

ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_items_owner ON trip_items;
CREATE POLICY trip_items_owner ON trip_items
  USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS packing_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id       UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item          TEXT NOT NULL,
  category      TEXT,
  qty           INTEGER NOT NULL DEFAULT 1,
  is_packed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_packing_trip ON packing_items(trip_id, is_packed);

ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS packing_items_owner ON packing_items;
CREATE POLICY packing_items_owner ON packing_items
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 22 — INVESTMENT TRACKER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS investments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('mutual_fund','stock','etf','fd','rd','ppf','epf','nps','gold','real_estate','crypto','bond','other')),
  invested_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  units         NUMERIC(16,4),
  avg_cost      NUMERIC(14,4),
  account       TEXT,
  start_date    DATE,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id, is_active, type);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS investments_owner ON investments;
CREATE POLICY investments_owner ON investments
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS investments_updated_at ON investments;
CREATE TRIGGER investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS sip_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  frequency     TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  start_date    DATE NOT NULL,
  next_date     DATE NOT NULL,
  end_date      DATE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sip_user_next ON sip_plans(user_id, next_date) WHERE is_active = TRUE;

ALTER TABLE sip_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sip_plans_owner ON sip_plans;
CREATE POLICY sip_plans_owner ON sip_plans
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 19 — HOME & PROPERTY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS home_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'appliance' CHECK (type IN ('appliance','furniture','vehicle','property','other')),
  brand         TEXT,
  model         TEXT,
  serial_no     TEXT,
  purchased_at  DATE,
  warranty_until DATE,
  cost          NUMERIC(12,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_home_assets_user ON home_assets(user_id);

ALTER TABLE home_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS home_assets_owner ON home_assets;
CREATE POLICY home_assets_owner ON home_assets
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS home_assets_updated_at ON home_assets;
CREATE TRIGGER home_assets_updated_at BEFORE UPDATE ON home_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS home_maintenance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id      UUID REFERENCES home_assets(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  category      TEXT,                                      -- 'cleaning' | 'repair' | 'service' | 'inspection'
  recurrence_months INTEGER,                               -- NULL = one-off
  last_done_at  DATE,
  next_due_at   DATE,
  vendor        TEXT,
  cost          NUMERIC(12,2),
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_due ON home_maintenance(user_id, next_due_at) WHERE is_active = TRUE;

ALTER TABLE home_maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS home_maintenance_owner ON home_maintenance;
CREATE POLICY home_maintenance_owner ON home_maintenance
  USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS utility_bills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  utility       TEXT NOT NULL,                             -- 'electricity' | 'water' | 'gas' | 'internet' | 'phone' | etc.
  provider      TEXT,
  amount        NUMERIC(12,2) NOT NULL,
  bill_date     DATE NOT NULL,
  due_date      DATE,
  is_paid       BOOLEAN NOT NULL DEFAULT FALSE,
  account_no    TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_utility_bills_user ON utility_bills(user_id, bill_date DESC);

ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS utility_bills_owner ON utility_bills;
CREATE POLICY utility_bills_owner ON utility_bills
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 25 — DAILY BRIEFING (cache for AI Proactive Coach)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS daily_briefings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  content_md    TEXT NOT NULL,                              -- markdown
  highlights    JSONB NOT NULL DEFAULT '[]'::jsonb,         -- array of {label, value, link?}
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_briefings_user ON daily_briefings(user_id, date DESC);

ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_briefings_owner ON daily_briefings;
CREATE POLICY daily_briefings_owner ON daily_briefings
  USING (user_id::text = current_setting('app.user_id', true));
