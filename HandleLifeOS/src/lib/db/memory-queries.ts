import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type {
  UserProfile,
  UserPreference,
  MemoryItem,
  MemoryItemType,
  MemoryEventType,
  UpsertProfileInput,
  CreateMemoryItemInput,
  UpdateMemoryItemInput,
  UpsertPreferenceInput,
} from '@/types/memory'

// ── Profile ──────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('profiles').select('*').eq('id', userId).single()
  return data as UserProfile | null
}

export async function upsertProfile(userId: string, input: UpsertProfileInput): Promise<UserProfile> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('profiles')
    .upsert({ id: userId, ...input, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as UserProfile
}

// ── Memory items ──────────────────────────────────────────────────

export async function getMemoryItems(
  userId: string,
  activeOnly = true,
  limit = 100,
  offset = 0,
): Promise<MemoryItem[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let query = db
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (activeOnly) query = query.eq('is_active', true)
  const { data } = await query
  return (data ?? []) as MemoryItem[]
}

export async function getMemoryItemsByType(
  userId: string,
  type: MemoryItemType,
  activeOnly = true,
): Promise<MemoryItem[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let query = db
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false })
  if (activeOnly) query = query.eq('is_active', true)
  const { data } = await query
  return (data ?? []) as MemoryItem[]
}

export async function getMemoryItemByKey(
  userId: string,
  key: string,
): Promise<MemoryItem | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .eq('key', key)
    .single()
  return data as MemoryItem | null
}

export async function createMemoryItem(
  userId: string,
  input: CreateMemoryItemInput,
): Promise<MemoryItem> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('memory_items')
    .insert({
      user_id: userId,
      source: 'manual',
      confidence: 100,
      importance: 5,
      metadata: {},
      ...input,
    })
    .select()
    .single()
  if (error) throw error
  return data as MemoryItem
}

export async function updateMemoryItem(
  id: string,
  userId: string,
  updates: UpdateMemoryItemInput,
): Promise<MemoryItem> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('memory_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as MemoryItem
}

export async function touchMemoryItems(ids: string[], userId: string): Promise<void> {
  if (!ids.length) return
  const db = getSupabaseAdmin()
  await db
    .from('memory_items')
    .update({ last_used_at: new Date().toISOString() })
    .in('id', ids)
    .eq('user_id', userId)
}

export async function deleteMemoryItem(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('memory_items').delete().eq('id', id).eq('user_id', userId)
}

export async function clearAllMemory(userId: string): Promise<number> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('memory_items')
    .delete()
    .eq('user_id', userId)
    .select('id')
  if (error) throw error
  return (data ?? []).length
}

export async function exportAllMemory(userId: string): Promise<{
  profile: UserProfile | null
  items: MemoryItem[]
  preferences: UserPreference[]
}> {
  const [profile, items, preferences] = await Promise.all([
    getProfile(userId),
    getMemoryItems(userId, false, 1000, 0),
    getPreferences(userId),
  ])
  return { profile, items, preferences }
}

// ── Memory events ─────────────────────────────────────────────────

export async function createMemoryEvent(
  userId: string,
  eventType: MemoryEventType,
  memoryId?: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db.from('memory_events').insert({
    user_id: userId,
    memory_id: memoryId ?? null,
    event_type: eventType,
    metadata,
  })
}

// ── Preferences ───────────────────────────────────────────────────

export async function getPreferences(userId: string): Promise<UserPreference[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db.from('user_preferences').select('*').eq('user_id', userId)
  return (data ?? []) as UserPreference[]
}

export async function upsertPreference(userId: string, input: UpsertPreferenceInput): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('user_preferences').upsert({
    user_id: userId,
    ...input,
    updated_at: new Date().toISOString(),
  })
}

export async function deletePreference(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('user_preferences').delete().eq('id', id).eq('user_id', userId)
}
