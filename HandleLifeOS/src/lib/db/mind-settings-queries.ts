import crypto from 'crypto'
import { getSupabaseAdmin, isSupabaseConfigured } from './client'

export interface MindSettings {
  user_id: string
  pin_hash: string | null
  reminder_time: string | null
  voice_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

// Deterministic PIN hash: SHA-256 over user-scoped salt + raw PIN.
// PIN is a 4-6 digit privacy gate, not auth — fast deterministic hash is sufficient.
export function hashPin(userId: string, pin: string): string {
  return crypto.createHash('sha256').update(`mind:${userId}:${pin}`).digest('hex')
}

export async function getMindSettings(userId: string): Promise<MindSettings | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('mind_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return (data ?? null) as MindSettings | null
}

export async function upsertMindSettings(
  userId: string,
  patch: Partial<Pick<MindSettings, 'reminder_time' | 'voice_enabled' | 'notifications_enabled' | 'pin_hash'>>,
): Promise<MindSettings> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('mind_settings')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data as MindSettings
}

export async function clearMindPin(userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db
    .from('mind_settings')
    .upsert({ user_id: userId, pin_hash: null }, { onConflict: 'user_id' })
}

export async function verifyMindPin(userId: string, pin: string): Promise<boolean> {
  const settings = await getMindSettings(userId)
  if (!settings?.pin_hash) return true // no PIN set means access is open
  return settings.pin_hash === hashPin(userId, pin)
}

// ── Bulk export ────────────────────────────────────────────────────────────────
export async function exportAllMindData(userId: string) {
  if (!isSupabaseConfigured()) {
    return { mood_logs: [], journal_entries: [], gratitude_entries: [], sleep_logs: [], tool_sessions: [], companion_sessions: [], companion_messages: [] }
  }
  const db = getSupabaseAdmin()

  const [mood, journal, gratitude, sleep, tools, sessions, messages] = await Promise.all([
    db.from('mood_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }),
    db.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('gratitude_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
    db.from('sleep_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
    db.from('mind_tool_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('mind_companion_sessions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    db.from('mind_companion_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    mood_logs: mood.data ?? [],
    journal_entries: journal.data ?? [],
    gratitude_entries: gratitude.data ?? [],
    sleep_logs: sleep.data ?? [],
    tool_sessions: tools.data ?? [],
    companion_sessions: sessions.data ?? [],
    companion_messages: messages.data ?? [],
  }
}

// ── Bulk delete ────────────────────────────────────────────────────────────────
// Deletes all mind data for a user. Settings row is preserved unless includeSettings=true.
export async function deleteAllMindData(userId: string, includeSettings = false): Promise<void> {
  const db = getSupabaseAdmin()

  await Promise.all([
    db.from('mood_logs').delete().eq('user_id', userId),
    db.from('journal_entries').delete().eq('user_id', userId),
    db.from('gratitude_entries').delete().eq('user_id', userId),
    db.from('sleep_logs').delete().eq('user_id', userId),
    db.from('mind_tool_sessions').delete().eq('user_id', userId),
    // Companion messages cascade via session FK
    db.from('mind_companion_sessions').delete().eq('user_id', userId),
  ])

  if (includeSettings) {
    await db.from('mind_settings').delete().eq('user_id', userId)
  }
}
