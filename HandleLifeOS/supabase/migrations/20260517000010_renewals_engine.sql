-- ═══════════════════════════════════════════════════════════════════════════════
-- Renewal & Expiry Intelligence Engine
-- Universal life-expiry infrastructure: tracks all recurring obligations
-- across insurance, identity, vehicles, property, health, digital, business.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS renewal_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core identity
  title                 TEXT NOT NULL,
  category              TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'financial','identity','vehicle','property',
      'health','education','digital','family','business','other'
    )),
  subcategory           TEXT,
  description           TEXT,

  -- Provider / reference
  provider              TEXT,
  reference_no          TEXT,

  -- Date lifecycle
  start_date            DATE,
  expiry_date           DATE NOT NULL,
  last_renewed_at       DATE,
  next_expected_renewal DATE,

  -- Renewal configuration
  renewal_window_days   INTEGER NOT NULL DEFAULT 30 CHECK (renewal_window_days >= 1),
  recurring_frequency   TEXT CHECK (recurring_frequency IN (
    'monthly','quarterly','half_yearly','yearly','custom'
  )),
  recurring_months      INTEGER CHECK (recurring_months > 0),
  -- Array of days-before-expiry for reminders, e.g. {90,30,7,1}
  reminder_days         INTEGER[] NOT NULL DEFAULT '{90,30,7,1}',

  -- Financial
  estimated_cost        NUMERIC(12,2) CHECK (estimated_cost >= 0),
  actual_cost           NUMERIC(12,2) CHECK (actual_cost >= 0),
  currency              TEXT NOT NULL DEFAULT 'INR',

  -- Status and risk
  status                TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','renewed','expired','cancelled','archived')),
  risk_level            TEXT NOT NULL DEFAULT 'medium'
    CHECK (risk_level IN ('low','medium','high','critical')),

  -- AI intelligence
  auto_detected         BOOLEAN NOT NULL DEFAULT false,
  source_type           TEXT CHECK (source_type IN (
    'manual','document','ocr','email','ai','import'
  )),
  source_document_id    UUID,  -- loose FK — may reference vault or property docs
  confidence_score      NUMERIC(4,3)
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_summary            TEXT,
  ai_risk_notes         TEXT,

  -- Cross-module linking (flexible JSONB)
  -- e.g. {"property_id":"uuid","home_asset_id":"uuid","family_member":"Rahul"}
  linked_modules        JSONB,

  -- Tags and notes
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  notes                 TEXT,

  -- Sharing (future: family module integration)
  is_shared             BOOLEAN NOT NULL DEFAULT false,
  shared_with           UUID[],

  -- Soft delete
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- ─── Indexes for efficient expiry-date querying and background cron jobs ──────

-- All active items per user sorted by expiry (primary query pattern)
CREATE INDEX IF NOT EXISTS renewal_items_active_expiry_idx
  ON renewal_items(user_id, expiry_date)
  WHERE deleted_at IS NULL AND status = 'active';

-- Full-text-style lookup on expiry date for upcoming-reminder jobs
CREATE INDEX IF NOT EXISTS renewal_items_expiry_idx
  ON renewal_items(expiry_date)
  WHERE deleted_at IS NULL;

-- Category filter (common dashboard filter)
CREATE INDEX IF NOT EXISTS renewal_items_category_idx
  ON renewal_items(user_id, category)
  WHERE deleted_at IS NULL;

-- Status filter
CREATE INDEX IF NOT EXISTS renewal_items_status_idx
  ON renewal_items(status)
  WHERE deleted_at IS NULL;

-- Risk level filter
CREATE INDEX IF NOT EXISTS renewal_items_risk_idx
  ON renewal_items(user_id, risk_level)
  WHERE deleted_at IS NULL AND status = 'active';

-- ─── Row-level security ───────────────────────────────────────────────────────

ALTER TABLE renewal_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS renewal_items_owner ON renewal_items;
CREATE POLICY renewal_items_owner ON renewal_items
  USING  (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS renewal_items_updated_at ON renewal_items;
CREATE TRIGGER renewal_items_updated_at BEFORE UPDATE ON renewal_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Renewal history — full audit trail of every lifecycle event
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS renewal_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id)          ON DELETE CASCADE,
  renewal_item_id  UUID NOT NULL REFERENCES renewal_items(id)  ON DELETE CASCADE,
  action           TEXT NOT NULL
    CHECK (action IN (
      'created','renewed','snoozed','cancelled','archived',
      'date_updated','cost_updated','ai_detected','reminder_sent'
    )),
  previous_expiry  DATE,
  new_expiry       DATE,
  cost             NUMERIC(12,2),
  notes            TEXT,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS renewal_history_item_idx
  ON renewal_history(renewal_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS renewal_history_user_idx
  ON renewal_history(user_id, created_at DESC);

ALTER TABLE renewal_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS renewal_history_owner ON renewal_history;
CREATE POLICY renewal_history_owner ON renewal_history
  USING  (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
