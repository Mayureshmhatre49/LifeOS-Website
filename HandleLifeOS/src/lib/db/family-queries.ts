import { getSupabaseAdmin } from './client'
import type {
  Family,
  FamilyMember,
  FamilyRole,
  SharedTask,
  FamilyEvent,
  GroceryList,
  GroceryItem,
  ElderProfile,
  ChildProfile,
  CreateFamilyInput,
  InviteMemberInput,
  CreateSharedTaskInput,
  UpdateSharedTaskInput,
  CreateEventInput,
  AddGroceryItemInput,
  CreateElderProfileInput,
  CreateChildProfileInput,
} from '@/types/family'

const db = getSupabaseAdmin

// ── Access Control ─────────────────────────────────────────────────────────────

export async function getFamilyMembership(
  userId: string,
  familyId: string
): Promise<FamilyMember | null> {
  const { data } = await db()
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return data
}

export async function getUserFamilies(userId: string): Promise<Family[]> {
  const { data: memberships } = await db()
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .eq('status', 'active')
  if (!memberships?.length) return []

  const familyIds = memberships.map(m => m.family_id)
  const { data } = await db()
    .from('families')
    .select('*')
    .in('id', familyIds)
    .order('created_at', { ascending: false })
  return data ?? []
}

// ── Family CRUD ────────────────────────────────────────────────────────────────

export async function createFamily(userId: string, input: CreateFamilyInput): Promise<Family | null> {
  const { data: family } = await db()
    .from('families')
    .insert({ name: input.name, created_by: userId })
    .select()
    .single()
  if (!family) return null

  // Auto-add creator as owner
  await db().from('family_members').insert({
    family_id: family.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString(),
  })
  return family
}

export async function getFamilyById(familyId: string): Promise<Family | null> {
  const { data } = await db()
    .from('families')
    .select('*')
    .eq('id', familyId)
    .maybeSingle()
  return data
}

export async function updateFamily(familyId: string, patch: { name?: string }): Promise<Family | null> {
  const { data } = await db()
    .from('families')
    .update(patch)
    .eq('id', familyId)
    .select()
    .single()
  return data
}

// ── Members ────────────────────────────────────────────────────────────────────

export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const { data } = await db()
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .neq('status', 'removed')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function inviteMember(
  familyId: string,
  invitedBy: string,
  input: InviteMemberInput
): Promise<FamilyMember | null> {
  // Check if already a member by email
  const { data: existing } = await db()
    .from('family_members')
    .select('id')
    .eq('family_id', familyId)
    .eq('invited_email', input.invited_email)
    .maybeSingle()
  if (existing) return null

  // Look up user by email
  const { data: userRecord } = await db()
    .from('users')
    .select('id')
    .eq('email', input.invited_email)
    .maybeSingle()

  const { data } = await db()
    .from('family_members')
    .insert({
      family_id: familyId,
      user_id: userRecord?.id ?? null,
      invited_email: input.invited_email,
      role: input.role ?? 'adult',
      status: userRecord ? 'active' : 'invited',
      display_name: input.display_name,
      invited_by: invitedBy,
      joined_at: userRecord ? new Date().toISOString() : null,
    })
    .select()
    .single()
  return data
}

export async function updateMemberRole(
  memberId: string,
  role: FamilyRole
): Promise<FamilyMember | null> {
  const { data } = await db()
    .from('family_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()
  return data
}

export async function removeMember(memberId: string): Promise<void> {
  await db()
    .from('family_members')
    .update({ status: 'removed' })
    .eq('id', memberId)
}

// Accept pending invite when a user logs in
export async function acceptInviteByEmail(userId: string, email: string): Promise<void> {
  await db()
    .from('family_members')
    .update({ user_id: userId, status: 'active', joined_at: new Date().toISOString() })
    .eq('invited_email', email)
    .eq('status', 'invited')
}

// ── Shared Tasks ───────────────────────────────────────────────────────────────

export async function getSharedTasks(
  familyId: string,
  statusFilter?: string
): Promise<SharedTask[]> {
  let q = db()
    .from('shared_tasks')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    q = q.eq('status', statusFilter)
  } else {
    q = q.neq('status', 'done')
  }

  const { data } = await q.limit(50)
  return data ?? []
}

export async function createSharedTask(
  familyId: string,
  createdBy: string,
  input: CreateSharedTaskInput
): Promise<SharedTask | null> {
  const { data } = await db()
    .from('shared_tasks')
    .insert({ family_id: familyId, created_by: createdBy, ...input })
    .select()
    .single()
  return data
}

export async function updateSharedTask(
  taskId: string,
  input: UpdateSharedTaskInput
): Promise<SharedTask | null> {
  const patch: Record<string, unknown> = { ...input }
  if (input.status === 'done') patch.completed_at = new Date().toISOString()
  const { data } = await db()
    .from('shared_tasks')
    .update(patch)
    .eq('id', taskId)
    .select()
    .single()
  return data
}

export async function deleteSharedTask(taskId: string): Promise<void> {
  await db().from('shared_tasks').delete().eq('id', taskId)
}

// ── Family Events ──────────────────────────────────────────────────────────────

export async function getFamilyEvents(
  familyId: string,
  daysAhead = 30
): Promise<FamilyEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const ahead = new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0]
  const { data } = await db()
    .from('family_events')
    .select('*')
    .eq('family_id', familyId)
    .gte('start_date', today)
    .lte('start_date', ahead)
    .order('start_date', { ascending: true })
  return data ?? []
}

export async function createFamilyEvent(
  familyId: string,
  createdBy: string,
  input: CreateEventInput
): Promise<FamilyEvent | null> {
  const { data } = await db()
    .from('family_events')
    .insert({ family_id: familyId, created_by: createdBy, ...input })
    .select()
    .single()
  return data
}

export async function updateFamilyEvent(
  eventId: string,
  input: Partial<CreateEventInput>
): Promise<FamilyEvent | null> {
  const { data } = await db()
    .from('family_events')
    .update(input)
    .eq('id', eventId)
    .select()
    .single()
  return data
}

export async function deleteFamilyEvent(eventId: string): Promise<void> {
  await db().from('family_events').delete().eq('id', eventId)
}

// ── Grocery ────────────────────────────────────────────────────────────────────

export async function getOrCreateActiveList(
  familyId: string,
  createdBy: string
): Promise<GroceryList> {
  const { data: existing } = await db()
    .from('grocery_lists')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true)
    .maybeSingle()
  if (existing) return existing

  const { data } = await db()
    .from('grocery_lists')
    .insert({ family_id: familyId, created_by: createdBy })
    .select()
    .single()
  return data!
}

export async function getGroceryItems(listId: string): Promise<GroceryItem[]> {
  const { data } = await db()
    .from('grocery_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function addGroceryItem(
  listId: string,
  familyId: string,
  addedBy: string,
  input: AddGroceryItemInput
): Promise<GroceryItem | null> {
  const { data } = await db()
    .from('grocery_items')
    .insert({ list_id: listId, family_id: familyId, added_by: addedBy, ...input })
    .select()
    .single()
  return data
}

export async function toggleGroceryItem(
  itemId: string,
  isBought: boolean,
  boughtBy?: string
): Promise<GroceryItem | null> {
  const { data } = await db()
    .from('grocery_items')
    .update({ is_bought: isBought, bought_by: isBought ? (boughtBy ?? null) : null })
    .eq('id', itemId)
    .select()
    .single()
  return data
}

export async function deleteGroceryItem(itemId: string): Promise<void> {
  await db().from('grocery_items').delete().eq('id', itemId)
}

export async function clearBoughtItems(listId: string): Promise<void> {
  await db().from('grocery_items').delete().eq('list_id', listId).eq('is_bought', true)
}

// ── Elder Profiles ─────────────────────────────────────────────────────────────

export async function getElderProfiles(familyId: string): Promise<ElderProfile[]> {
  const { data } = await db()
    .from('elder_profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function createElderProfile(
  familyId: string,
  createdBy: string,
  input: CreateElderProfileInput
): Promise<ElderProfile | null> {
  const { data } = await db()
    .from('elder_profiles')
    .insert({ family_id: familyId, created_by: createdBy, ...input })
    .select()
    .single()
  return data
}

export async function updateElderProfile(
  id: string,
  patch: Partial<CreateElderProfileInput>
): Promise<ElderProfile | null> {
  const { data } = await db()
    .from('elder_profiles')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  return data
}

export async function deleteElderProfile(id: string): Promise<void> {
  await db().from('elder_profiles').delete().eq('id', id)
}

// ── Child Profiles ─────────────────────────────────────────────────────────────

export async function getChildProfiles(familyId: string): Promise<ChildProfile[]> {
  const { data } = await db()
    .from('child_profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function createChildProfile(
  familyId: string,
  createdBy: string,
  input: CreateChildProfileInput
): Promise<ChildProfile | null> {
  const { data } = await db()
    .from('child_profiles')
    .insert({ family_id: familyId, created_by: createdBy, ...input })
    .select()
    .single()
  return data
}

export async function deleteChildProfile(id: string): Promise<void> {
  await db().from('child_profiles').delete().eq('id', id)
}
