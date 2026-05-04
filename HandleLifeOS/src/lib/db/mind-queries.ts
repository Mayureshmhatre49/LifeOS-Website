import { getSupabaseAdmin, isSupabaseConfigured } from './client'

// ── Types ──────────────────────────────────────────────────────────────────────

export type StressCategory = 'work' | 'health' | 'social' | 'personal' | 'environment'

export interface MoodLog {
  id: string
  user_id: string
  mood: number
  stress?: number | null
  energy?: number | null
  emotions: string[]
  stress_categories?: StressCategory[] | null
  note?: string | null
  logged_at: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title?: string | null
  content: string
  mood?: number | null
  prompt?: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface GratitudeEntry {
  id: string
  user_id: string
  items: string[]
  date: string
  created_at: string
}

export interface SleepLog {
  id: string
  user_id: string
  date: string
  bedtime?: string | null
  wake_time?: string | null
  duration_hours?: number | null
  quality?: number | null
  notes?: string | null
  created_at: string
}

// ── Mood logs ──────────────────────────────────────────────────────────────────

export async function createMoodLog(params: {
  user_id: string
  mood: number
  stress?: number
  energy?: number
  emotions?: string[]
  stress_categories?: StressCategory[]
  note?: string
}): Promise<MoodLog> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('mood_logs')
    .insert({
      ...params,
      emotions: params.emotions ?? [],
      stress_categories: params.stress_categories ?? [],
    })
    .select()
    .single()
  if (error) throw error
  return data as MoodLog
}

export async function getMoodLogs(userId: string, days = 30): Promise<MoodLog[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await db
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since)
    .order('logged_at', { ascending: false })
  return (data ?? []) as MoodLog[]
}

export async function getTodayMoodLog(userId: string): Promise<MoodLog | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { data } = await db
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', todayStart.toISOString())
    .order('logged_at', { ascending: false })
    .limit(1)
    .single()
  return (data ?? null) as MoodLog | null
}

// ── Journal entries ────────────────────────────────────────────────────────────

export async function createJournalEntry(params: {
  user_id: string
  content: string
  title?: string
  mood?: number
  prompt?: string
  tags?: string[]
}): Promise<JournalEntry> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('journal_entries')
    .insert({ ...params, tags: params.tags ?? [] })
    .select()
    .single()
  if (error) throw error
  return data as JournalEntry
}

export async function getJournalEntries(userId: string, limit = 20): Promise<JournalEntry[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as JournalEntry[]
}

export async function updateJournalEntry(id: string, userId: string, params: {
  content?: string
  title?: string
  mood?: number
  tags?: string[]
}): Promise<JournalEntry> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('journal_entries')
    .update({ ...params, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as JournalEntry
}

export async function deleteJournalEntry(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('journal_entries').delete().eq('id', id).eq('user_id', userId)
}

// ── Gratitude entries ──────────────────────────────────────────────────────────

export async function upsertGratitudeEntry(params: {
  user_id: string
  items: string[]
  date: string
}): Promise<GratitudeEntry> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('gratitude_entries')
    .upsert(params, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data as GratitudeEntry
}

export async function getGratitudeEntries(userId: string, limit = 30): Promise<GratitudeEntry[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  return (data ?? []) as GratitudeEntry[]
}

export async function getTodayGratitudeEntry(userId: string): Promise<GratitudeEntry | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await db
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  return (data ?? null) as GratitudeEntry | null
}

export async function getGratitudeStreak(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const entries = await getGratitudeEntries(userId, 60)
  if (entries.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  const cursor = new Date(today)
  for (let i = 0; i < 60; i++) {
    const dateStr = cursor.toISOString().split('T')[0]
    const found = entries.some(e => e.date === dateStr)
    if (!found) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ── Sleep logs ─────────────────────────────────────────────────────────────────

export async function upsertSleepLog(params: {
  user_id: string
  date: string
  bedtime?: string
  wake_time?: string
  duration_hours?: number
  quality?: number
  notes?: string
}): Promise<SleepLog> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('sleep_logs')
    .upsert(params, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data as SleepLog
}

export async function getSleepLogs(userId: string, limit = 14): Promise<SleepLog[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  return (data ?? []) as SleepLog[]
}

// ── Wellbeing score ────────────────────────────────────────────────────────────
// Returns 0–100 composite score from the past 7 days

export async function getWellbeingScore(userId: string): Promise<{
  score: number
  mood: number
  sleep: number
  gratitude: number
  journal: number
}> {
  if (!isSupabaseConfigured()) return { score: 0, mood: 0, sleep: 0, gratitude: 0, journal: 0 }

  const [moodLogs, sleepLogs, gratitudeEntries, journalEntries] = await Promise.all([
    getMoodLogs(userId, 7),
    getSleepLogs(userId, 7),
    getGratitudeEntries(userId, 7),
    getJournalEntries(userId, 7),
  ])

  // Mood: avg of last 7 days scaled 0–100 (max mood=5)
  const moodAvg = moodLogs.length
    ? moodLogs.reduce((s, m) => s + m.mood, 0) / moodLogs.length
    : 0
  const moodScore = Math.round((moodAvg / 5) * 100)

  // Sleep: avg quality scaled 0–100
  const sleepAvg = sleepLogs.length
    ? sleepLogs.reduce((s, l) => s + (l.quality ?? 3), 0) / sleepLogs.length
    : 0
  const sleepScore = Math.round((sleepAvg / 5) * 100)

  // Gratitude: % of last 7 days logged
  const gratitudeScore = Math.round((Math.min(gratitudeEntries.length, 7) / 7) * 100)

  // Journal: at least 3 entries in 7 days = 100%
  const journalScore = Math.round((Math.min(journalEntries.length, 3) / 3) * 100)

  const score = Math.round(moodScore * 0.4 + sleepScore * 0.3 + gratitudeScore * 0.2 + journalScore * 0.1)

  return { score, mood: moodScore, sleep: sleepScore, gratitude: gratitudeScore, journal: journalScore }
}
