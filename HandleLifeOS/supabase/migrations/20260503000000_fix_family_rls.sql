-- Security fix: replace open USING (true) policies on family tables with
-- proper membership-based policies.
--
-- The service_role key bypasses RLS automatically in Supabase, so we do not
-- need explicit service_role bypass policies. Removing USING (true) prevents
-- the anon/authenticated role from accessing arbitrary family data.

-- ── Drop permissive open-door policies ────────────────────────────────────────
DROP POLICY IF EXISTS "service_role_families"        ON families;
DROP POLICY IF EXISTS "service_role_family_members"  ON family_members;
DROP POLICY IF EXISTS "service_role_shared_tasks"    ON shared_tasks;
DROP POLICY IF EXISTS "service_role_family_events"   ON family_events;
DROP POLICY IF EXISTS "service_role_grocery_lists"   ON grocery_lists;
DROP POLICY IF EXISTS "service_role_grocery_items"   ON grocery_items;
DROP POLICY IF EXISTS "service_role_elder_profiles"  ON elder_profiles;
DROP POLICY IF EXISTS "service_role_child_profiles"  ON child_profiles;

-- ── Helper: member families of the current user ───────────────────────────────
-- Reused in every policy below.
CREATE OR REPLACE FUNCTION my_family_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT family_id
  FROM   family_members
  WHERE  user_id = auth.uid()
    AND  status  = 'active'
$$;

-- ── families ──────────────────────────────────────────────────────────────────
CREATE POLICY "families_member_access" ON families
  FOR ALL USING (id IN (SELECT my_family_ids()));

-- ── family_members ────────────────────────────────────────────────────────────
CREATE POLICY "family_members_same_family" ON family_members
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── shared_tasks ──────────────────────────────────────────────────────────────
CREATE POLICY "shared_tasks_family_member" ON shared_tasks
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── family_events ─────────────────────────────────────────────────────────────
CREATE POLICY "family_events_family_member" ON family_events
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── grocery_lists ─────────────────────────────────────────────────────────────
CREATE POLICY "grocery_lists_family_member" ON grocery_lists
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── grocery_items ─────────────────────────────────────────────────────────────
CREATE POLICY "grocery_items_family_member" ON grocery_items
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── elder_profiles ────────────────────────────────────────────────────────────
CREATE POLICY "elder_profiles_family_member" ON elder_profiles
  FOR ALL USING (family_id IN (SELECT my_family_ids()));

-- ── child_profiles ────────────────────────────────────────────────────────────
CREATE POLICY "child_profiles_family_member" ON child_profiles
  FOR ALL USING (family_id IN (SELECT my_family_ids()));
