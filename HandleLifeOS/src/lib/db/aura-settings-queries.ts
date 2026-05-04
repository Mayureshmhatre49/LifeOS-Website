import crypto from 'crypto'
import { getSupabaseAdmin, isSupabaseConfigured } from './client'

export type AuraTextSize = 'sm' | 'base' | 'lg' | 'xl'

export interface AuraSettings {
  user_id: string
  pin_hash: string | null
  notifications_enabled: boolean
  voice_enabled: boolean
  reduced_motion: boolean
  text_size: AuraTextSize
  high_contrast: boolean
  created_at: string
  updated_at: string
}

// Deterministic 4-6 digit PIN hash with user-scoped salt.
export function hashAuraPin(userId: string, pin: string): string {
  return crypto.createHash('sha256').update(`aura:${userId}:${pin}`).digest('hex')
}

export async function getAuraSettings(userId: string): Promise<AuraSettings | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('aura_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return (data ?? null) as AuraSettings | null
}

export async function upsertAuraSettings(
  userId: string,
  patch: Partial<Pick<AuraSettings, 'pin_hash' | 'notifications_enabled' | 'voice_enabled' | 'reduced_motion' | 'text_size' | 'high_contrast'>>,
): Promise<AuraSettings> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('aura_settings')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data as AuraSettings
}

export async function clearAuraPin(userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db
    .from('aura_settings')
    .upsert({ user_id: userId, pin_hash: null }, { onConflict: 'user_id' })
}

// ── Bulk export of all AURA data for a user ───────────────────────────────────
export async function exportAllAuraData(userId: string) {
  if (!isSupabaseConfigured()) {
    return { profiles: [], coach_sessions: [], coach_messages: [] }
  }
  const db = getSupabaseAdmin()
  const [profiles, sessions, messages] = await Promise.all([
    db.from('aura_profiles').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    db.from('aura_coach_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    db.from('aura_coach_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])
  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profiles: profiles.data ?? [],
    coach_sessions: sessions.data ?? [],
    coach_messages: messages.data ?? [],
  }
}

// ── Bulk delete (all profiles + coach data) ───────────────────────────────────
export async function deleteAllAuraData(userId: string, includeSettings = false): Promise<void> {
  const db = getSupabaseAdmin()
  // Coach messages cascade via session FK; sessions cascade no, must delete
  await Promise.all([
    db.from('aura_coach_sessions').delete().eq('user_id', userId),
    db.from('aura_profiles').delete().eq('user_id', userId),
  ])
  if (includeSettings) {
    await db.from('aura_settings').delete().eq('user_id', userId)
  }
}
