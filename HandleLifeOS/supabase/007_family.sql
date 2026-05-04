-- Phase 7: Family & Household OS

-- Enums
CREATE TYPE family_role AS ENUM ('owner', 'partner', 'adult', 'teen', 'child', 'elder');
CREATE TYPE member_status AS ENUM ('invited', 'active', 'removed');
CREATE TYPE shared_task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE shared_task_category AS ENUM (
  'groceries', 'cleaning', 'repairs', 'school', 'health',
  'errands', 'bills', 'cooking', 'childcare', 'misc'
);
CREATE TYPE family_event_type AS ENUM (
  'appointment', 'school', 'birthday', 'travel', 'chore', 'reminder', 'other'
);

-- Families
CREATE TABLE families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family members (who belongs to which family)
CREATE TABLE family_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,
  role        family_role NOT NULL DEFAULT 'adult',
  status      member_status NOT NULL DEFAULT 'invited',
  display_name TEXT,
  invited_by  UUID REFERENCES auth.users(id),
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id),
  CHECK (user_id IS NOT NULL OR invited_email IS NOT NULL)
);

-- Shared tasks (household to-do list)
CREATE TABLE shared_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     shared_task_category NOT NULL DEFAULT 'misc',
  status       shared_task_status NOT NULL DEFAULT 'pending',
  assigned_to  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date     DATE,
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Family events / calendar
CREATE TABLE family_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  event_type  family_event_type NOT NULL DEFAULT 'other',
  start_date  DATE NOT NULL,
  end_date    DATE,
  all_day     BOOLEAN NOT NULL DEFAULT true,
  notes       TEXT,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grocery lists (one active list per family)
CREATE TABLE grocery_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Weekly groceries',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grocery items
CREATE TABLE grocery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  quantity    TEXT,
  category    TEXT,
  is_bought   BOOLEAN NOT NULL DEFAULT false,
  added_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bought_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Elder profiles (family-level profile for older members)
CREATE TABLE elder_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id        UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  medicines        TEXT[],
  conditions       TEXT,
  doctor_name      TEXT,
  doctor_contact   TEXT,
  emergency_contact TEXT,
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Child profiles
CREATE TABLE child_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id        UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  age              SMALLINT,
  school_name      TEXT,
  class_grade      TEXT,
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_family_members_user ON family_members (user_id, status);
CREATE INDEX idx_family_members_family ON family_members (family_id, status);
CREATE INDEX idx_shared_tasks_family ON shared_tasks (family_id, status);
CREATE INDEX idx_shared_tasks_assigned ON shared_tasks (assigned_to, status);
CREATE INDEX idx_family_events_family ON family_events (family_id, start_date);
CREATE INDEX idx_grocery_items_list ON grocery_items (list_id, is_bought);
CREATE INDEX idx_grocery_items_family ON grocery_items (family_id);
CREATE INDEX idx_elder_profiles_family ON elder_profiles (family_id);
CREATE INDEX idx_child_profiles_family ON child_profiles (family_id);

-- Triggers
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shared_tasks_updated_at BEFORE UPDATE ON shared_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_elder_profiles_updated_at BEFORE UPDATE ON elder_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: all family data is controlled at application layer via family_members check.
-- Enable RLS but use service role for all server-side operations.
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE elder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by getSupabaseAdmin)
CREATE POLICY "service_role_families" ON families USING (true) WITH CHECK (true);
CREATE POLICY "service_role_family_members" ON family_members USING (true) WITH CHECK (true);
CREATE POLICY "service_role_shared_tasks" ON shared_tasks USING (true) WITH CHECK (true);
CREATE POLICY "service_role_family_events" ON family_events USING (true) WITH CHECK (true);
CREATE POLICY "service_role_grocery_lists" ON grocery_lists USING (true) WITH CHECK (true);
CREATE POLICY "service_role_grocery_items" ON grocery_items USING (true) WITH CHECK (true);
CREATE POLICY "service_role_elder_profiles" ON elder_profiles USING (true) WITH CHECK (true);
CREATE POLICY "service_role_child_profiles" ON child_profiles USING (true) WITH CHECK (true);
