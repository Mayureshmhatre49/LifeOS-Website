import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type {
  FocusSession,
  FocusPreferences,
  CreateSessionInput,
  UpdateSessionInput,
  UpdateFocusPrefsInput,
  WeeklyStats,
} from '@/types/focus'

// ── Sessions ───────────────────────────────────────────────────────────────

export async function createFocusSession(
  userId: string,
  input: CreateSessionInput
): Promise<FocusSession> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('focus_sessions')
    .insert({ user_id: userId, completed: false, abandoned: false, body_doubling_enabled: false, ...input })
    .select()
    .single()
  if (error) throw error
  return data as FocusSession
}

export async function updateFocusSession(
  id: string,
  userId: string,
  updates: UpdateSessionInput
): Promise<FocusSession> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('focus_sessions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as FocusSession
}

export async function getRecentSessions(userId: string, limit = 10): Promise<FocusSession[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as FocusSession[]
}

export async function getLastIncompleteSession(userId: string): Promise<FocusSession | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .eq('abandoned', false)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()
  return data as FocusSession | null
}

// ── Preferences ────────────────────────────────────────────────────────────

export async function getFocusPreferences(userId: string): Promise<FocusPreferences | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db.from('focus_preferences').select('*').eq('user_id', userId).single()
  return data as FocusPreferences | null
}

export async function upsertFocusPreferences(
  userId: string,
  input: UpdateFocusPrefsInput
): Promise<FocusPreferences> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('focus_preferences')
    .upsert({ user_id: userId, ...input, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as FocusPreferences
}

// ── Weekly Stats ───────────────────────────────────────────────────────────

export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  if (!isSupabaseConfigured()) return emptyStats()
  const db = getSupabaseAdmin()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: sessions } = await db
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', weekAgo.toISOString())

  if (!sessions?.length) return emptyStats()

  const completed = (sessions as FocusSession[]).filter((s) => s.completed)
  const totalMinutes = completed.reduce((sum, s) => sum + (s.actual_minutes ?? s.planned_minutes), 0)

  // Hour distribution for best_hour
  const hourCounts: Record<number, number> = {}
  completed.forEach((s) => {
    const h = new Date(s.started_at).getHours()
    hourCounts[h] = (hourCounts[h] ?? 0) + (s.actual_minutes ?? s.planned_minutes)
  })
  const bestHour = Object.keys(hourCounts).length
    ? parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0])
    : null

  // Daily minutes
  const dailyMinutes: Record<string, number> = {}
  completed.forEach((s) => {
    const day = s.started_at.slice(0, 10)
    dailyMinutes[day] = (dailyMinutes[day] ?? 0) + (s.actual_minutes ?? s.planned_minutes)
  })

  // Streak
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (dailyMinutes[ds]) streak++
    else if (ds !== today) break
  }

  return {
    sessions_completed: completed.length,
    sessions_abandoned: (sessions as FocusSession[]).filter((s) => s.abandoned).length,
    total_minutes: totalMinutes,
    tasks_finished: completed.filter((s) => s.task_id).length,
    best_hour: bestHour,
    daily_minutes: dailyMinutes,
    streak_days: streak,
  }
}

function emptyStats(): WeeklyStats {
  return {
    sessions_completed: 0,
    sessions_abandoned: 0,
    total_minutes: 0,
    tasks_finished: 0,
    best_hour: null,
    daily_minutes: {},
    streak_days: 0,
  }
}
