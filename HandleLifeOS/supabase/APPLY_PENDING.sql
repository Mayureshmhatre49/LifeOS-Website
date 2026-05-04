-- ═══════════════════════════════════════════════════════════════════════════════
--  HandleLife OS — Pending Migrations (Phase 21 + 23 + 24)
--  Run once in Supabase SQL Editor. Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════════

-- This consolidates the three migrations:
--   20260504000001_phase21_nutrition.sql
--   20260504000002_phase23_legal.sql
--   20260504000003_phase24_business.sql

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 21 — FOOD & NUTRITION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  cuisine TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack','dessert','drink') OR meal_type IS NULL),
  prep_min INTEGER NOT NULL DEFAULT 0 CHECK (prep_min >= 0),
  cook_min INTEGER NOT NULL DEFAULT 0 CHECK (cook_min >= 0),
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 50),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories INTEGER, protein_g NUMERIC(6,1), carbs_g NUMERIC(6,1), fat_g NUMERIC(6,1),
  tags TEXT[] DEFAULT '{}', image_emoji TEXT, notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id, is_favorite, created_at DESC);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recipes_owner ON recipes;
CREATE POLICY recipes_owner ON recipes USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS recipes_updated_at ON recipes;
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  name_override TEXT,
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 20),
  notes TEXT,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date, meal_type);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meal_plans_owner ON meal_plans;
CREATE POLICY meal_plans_owner ON meal_plans USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_g NUMERIC(6,1) NOT NULL DEFAULT 0,
  qty NUMERIC(8,2) NOT NULL DEFAULT 1,
  qty_unit TEXT NOT NULL DEFAULT 'serving',
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date DESC);
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_logs_owner ON food_logs;
CREATE POLICY food_logs_owner ON food_logs USING (user_id::text = current_setting('app.user_id', true));

-- nutrition_grocery_items — distinct from family-shared `grocery_items`
CREATE TABLE IF NOT EXISTS nutrition_grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  qty NUMERIC(8,2),
  unit TEXT,
  is_bought BOOLEAN NOT NULL DEFAULT FALSE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nutrition_grocery_user ON nutrition_grocery_items(user_id, is_bought, category);
ALTER TABLE nutrition_grocery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_grocery_items_owner ON nutrition_grocery_items;
CREATE POLICY nutrition_grocery_items_owner ON nutrition_grocery_items USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS nutrition_targets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_calories INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calories BETWEEN 800 AND 6000),
  protein_g INTEGER NOT NULL DEFAULT 80 CHECK (protein_g BETWEEN 0 AND 500),
  carbs_g INTEGER NOT NULL DEFAULT 250 CHECK (carbs_g BETWEEN 0 AND 1000),
  fat_g INTEGER NOT NULL DEFAULT 65 CHECK (fat_g BETWEEN 0 AND 400),
  diet_type TEXT NOT NULL DEFAULT 'balanced' CHECK (diet_type IN ('balanced','high-protein','low-carb','keto','vegetarian','vegan','mediterranean','custom')),
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_targets_owner ON nutrition_targets;
CREATE POLICY nutrition_targets_owner ON nutrition_targets USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS nutrition_targets_updated_at ON nutrition_targets;
CREATE TRIGGER nutrition_targets_updated_at BEFORE UPDATE ON nutrition_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 23 — LEGAL & COMPLIANCE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS legal_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('itr','gst','advance_tax','tds','property_tax','renewal','court','other')),
  due_date DATE NOT NULL,
  amount NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','filed','paid','dismissed','overdue')),
  reference_no TEXT,
  authority TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_user_due ON legal_deadlines(user_id, due_date);
ALTER TABLE legal_deadlines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_deadlines_owner ON legal_deadlines;
CREATE POLICY legal_deadlines_owner ON legal_deadlines USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS legal_deadlines_updated_at ON legal_deadlines;
CREATE TRIGGER legal_deadlines_updated_at BEFORE UPDATE ON legal_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'other' CHECK (doc_type IN ('contract','notice','agreement','rental','employment','will','poa','other')),
  original_text TEXT NOT NULL,
  summary_md TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_documents_user ON legal_documents(user_id, created_at DESC);
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_documents_owner ON legal_documents;
CREATE POLICY legal_documents_owner ON legal_documents USING (user_id::text = current_setting('app.user_id', true));

CREATE TABLE IF NOT EXISTS legal_compliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'personal' CHECK (category IN ('personal','tax','business','property','other')),
  frequency TEXT NOT NULL DEFAULT 'annual' CHECK (frequency IN ('one-time','monthly','quarterly','annual','none')),
  last_done_at DATE,
  next_due_at DATE,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  applicable BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_compliances_user ON legal_compliances(user_id, applicable, next_due_at);
ALTER TABLE legal_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_compliances_owner ON legal_compliances;
CREATE POLICY legal_compliances_owner ON legal_compliances USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS legal_compliances_updated_at ON legal_compliances;
CREATE TRIGGER legal_compliances_updated_at BEFORE UPDATE ON legal_compliances FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 24 — BUSINESS ASSISTANT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  company TEXT, email TEXT, phone TEXT,
  gst_no TEXT, pan_no TEXT, address TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_clients_user ON business_clients(user_id, archived);
ALTER TABLE business_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_clients_owner ON business_clients;
CREATE POLICY business_clients_owner ON business_clients USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_clients_updated_at ON business_clients;
CREATE TRIGGER business_clients_updated_at BEFORE UPDATE ON business_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead','active','on_hold','done','cancelled')),
  start_date DATE, end_date DATE,
  fee NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  hourly_rate NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_projects_user ON business_projects(user_id, status);
ALTER TABLE business_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_projects_owner ON business_projects;
CREATE POLICY business_projects_owner ON business_projects USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_projects_updated_at ON business_projects;
CREATE TRIGGER business_projects_updated_at BEFORE UPDATE ON business_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  invoice_no TEXT NOT NULL,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amt NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amt NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  paid_at DATE,
  notes TEXT, terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON business_invoices(user_id, status, issued_at DESC);
ALTER TABLE business_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_invoices_owner ON business_invoices;
CREATE POLICY business_invoices_owner ON business_invoices USING (user_id::text = current_setting('app.user_id', true));
DROP TRIGGER IF EXISTS business_invoices_updated_at ON business_invoices;
CREATE TRIGGER business_invoices_updated_at BEFORE UPDATE ON business_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS business_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES business_projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES business_clients(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('software','hardware','travel','office','marketing','professional_fees','utilities','tax','other')),
  vendor TEXT,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user ON business_expenses(user_id, occurred_at DESC);
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_expenses_owner ON business_expenses;
CREATE POLICY business_expenses_owner ON business_expenses USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 21/23/24 schema applied. Reload PostgREST schema cache:
-- ═══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
