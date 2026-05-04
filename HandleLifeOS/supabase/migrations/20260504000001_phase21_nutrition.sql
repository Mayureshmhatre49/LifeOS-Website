-- Phase 21 — Food & Nutrition
-- Tables: recipes, meal_plans, food_logs, grocery_items
-- All idempotent. RLS via app.user_id session var. update_updated_at trigger reused.

-- ═══════════════════════════════════════════════════════════════════════════════
-- RECIPES — user library of meals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS recipes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  cuisine       TEXT,                                       -- 'indian' | 'italian' | 'thai' | …
  meal_type     TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack','dessert','drink') OR meal_type IS NULL),
  prep_min      INTEGER NOT NULL DEFAULT 0 CHECK (prep_min >= 0),
  cook_min      INTEGER NOT NULL DEFAULT 0 CHECK (cook_min >= 0),
  servings      INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 50),
  ingredients   JSONB NOT NULL DEFAULT '[]'::jsonb,         -- [{ item, qty, unit, category }]
  steps         JSONB NOT NULL DEFAULT '[]'::jsonb,         -- ["step text", …]
  calories      INTEGER,                                    -- per serving
  protein_g     NUMERIC(6,1),
  carbs_g       NUMERIC(6,1),
  fat_g         NUMERIC(6,1),
  tags          TEXT[] DEFAULT '{}',                        -- 'veg', 'gluten-free', 'high-protein'…
  image_emoji   TEXT,
  notes         TEXT,
  is_favorite   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id, is_favorite, created_at DESC);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recipes_owner ON recipes;
CREATE POLICY recipes_owner ON recipes
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS recipes_updated_at ON recipes;
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- MEAL PLANS — calendar of planned meals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS meal_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  meal_type     TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  recipe_id     UUID REFERENCES recipes(id) ON DELETE SET NULL,
  name_override TEXT,                                       -- if no recipe linked, raw name
  servings      INTEGER NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 20),
  notes         TEXT,
  is_done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date, meal_type);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS meal_plans_owner ON meal_plans;
CREATE POLICY meal_plans_owner ON meal_plans
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- FOOD LOGS — what was actually eaten (for calorie/macro tracking)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS food_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type     TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name     TEXT NOT NULL,
  calories      INTEGER NOT NULL DEFAULT 0,
  protein_g     NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs_g       NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat_g         NUMERIC(6,1) NOT NULL DEFAULT 0,
  qty           NUMERIC(8,2) NOT NULL DEFAULT 1,
  qty_unit      TEXT NOT NULL DEFAULT 'serving',
  recipe_id     UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes         TEXT,
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date DESC);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS food_logs_owner ON food_logs;
CREATE POLICY food_logs_owner ON food_logs
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- NUTRITION GROCERY ITEMS — auto-generated from meal plans + manual additions
-- (Distinct from family-shared `grocery_items` which is keyed by list_id/family_id)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nutrition_grocery_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT,                                       -- 'produce' | 'dairy' | 'pantry' | 'meat' | …
  qty           NUMERIC(8,2),
  unit          TEXT,
  is_bought     BOOLEAN NOT NULL DEFAULT FALSE,
  recipe_id     UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nutrition_grocery_user ON nutrition_grocery_items(user_id, is_bought, category);

ALTER TABLE nutrition_grocery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_grocery_items_owner ON nutrition_grocery_items;
CREATE POLICY nutrition_grocery_items_owner ON nutrition_grocery_items
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- USER NUTRITION TARGETS — daily calorie + macro goals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nutrition_targets (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_calories INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calories BETWEEN 800 AND 6000),
  protein_g     INTEGER NOT NULL DEFAULT 80 CHECK (protein_g BETWEEN 0 AND 500),
  carbs_g       INTEGER NOT NULL DEFAULT 250 CHECK (carbs_g BETWEEN 0 AND 1000),
  fat_g         INTEGER NOT NULL DEFAULT 65 CHECK (fat_g BETWEEN 0 AND 400),
  diet_type     TEXT NOT NULL DEFAULT 'balanced' CHECK (diet_type IN ('balanced','high-protein','low-carb','keto','vegetarian','vegan','mediterranean','custom')),
  allergies     TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nutrition_targets_owner ON nutrition_targets;
CREATE POLICY nutrition_targets_owner ON nutrition_targets
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS nutrition_targets_updated_at ON nutrition_targets;
CREATE TRIGGER nutrition_targets_updated_at BEFORE UPDATE ON nutrition_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
