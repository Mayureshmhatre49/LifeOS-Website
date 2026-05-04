import { getSupabaseAdmin, isSupabaseConfigured } from './client'

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom' | 'weekly'
export type HabitColor =
  | 'violet' | 'indigo' | 'blue' | 'emerald' | 'amber'
  | 'rose' | 'pink' | 'purple' | 'sky' | 'teal'

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: HabitColor
  frequency: HabitFrequency
  days_of_week: number[]
  target_per_day: number
  reminder_time: string | null
  is_active: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  count: number
  note: string | null
  created_at: string
}

export interface HabitWithStats extends Habit {
  current_streak: number
  longest_streak: number
  completion_rate_30d: number     // 0-100, % of expected days completed in last 30
  done_today: boolean
  count_today: number
}

export async function getHabits(userId: string, includeArchived = false): Promise<Habit[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  let q = db.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  if (!includeArchived) q = q.eq('is_active', true)
  const { data } = await q
  return (data ?? []) as Habit[]
}

export async function createHabit(params: {
  user_id: string
  name: string
  icon?: string
  color?: HabitColor
  frequency?: HabitFrequency
  days_of_week?: number[]
  target_per_day?: number
  reminder_time?: string
}): Promise<Habit> {
  const db = getSupabaseAdmin()

  // Derive days_of_week from frequency if not explicit
  let days = params.days_of_week
  if (!days) {
    if (params.frequency === 'weekdays') days = [1, 2, 3, 4, 5]
    else if (params.frequency === 'weekends') days = [0, 6]
    else if (params.frequency === 'weekly') days = [1] // Monday default
    else days = [0, 1, 2, 3, 4, 5, 6]
  }

  const { data, error } = await db
    .from('habits')
    .insert({
      user_id: params.user_id,
      name: params.name,
      icon: params.icon ?? null,
      color: params.color ?? 'violet',
      frequency: params.frequency ?? 'daily',
      days_of_week: days,
      target_per_day: params.target_per_day ?? 1,
      reminder_time: params.reminder_time ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Habit
}

export async function updateHabit(
  id: string,
  userId: string,
  patch: Partial<Pick<Habit, 'name' | 'icon' | 'color' | 'frequency' | 'days_of_week' | 'target_per_day' | 'reminder_time' | 'is_active'>>,
): Promise<Habit> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('habits')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Habit
}

export async function deleteHabit(id: string, userId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('habits').delete().eq('id', id).eq('user_id', userId)
}

// Toggle habit log for a given date — increments count, or resets to 0 if already at target.
export async function toggleHabitLog(
  habitId: string,
  userId: string,
  date: string,
  targetPerDay = 1,
): Promise<{ count: number; date: string }> {
  const db = getSupabaseAdmin()
  const { data: existing } = await db
    .from('habit_logs')
    .select('count')
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle()

  const current = (existing?.count ?? 0) as number
  const next = current >= targetPerDay ? 0 : current + 1

  if (existing) {
    await db.from('habit_logs').update({ count: next }).eq('habit_id', habitId).eq('date', date)
  } else if (next > 0) {
    await db.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date, count: next })
  }
  return { count: next, date }
}

export async function getHabitLogs(
  habitId: string,
  userId: string,
  daysBack = 90,
): Promise<HabitLog[]> {
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()
  const since = new Date()
  since.setDate(since.getDate() - daysBack)
  const { data } = await db
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: false })
  return (data ?? []) as HabitLog[]
}

// Compute streaks + 30d completion rate. Considers days_of_week to know what counts as "expected".
export async function getHabitsWithStats(userId: string): Promise<HabitWithStats[]> {
  const habits = await getHabits(userId)
  if (habits.length === 0) return []
  if (!isSupabaseConfigured()) return habits.map(h => ({ ...h, current_streak: 0, longest_streak: 0, completion_rate_30d: 0, done_today: false, count_today: 0 }))

  const db = getSupabaseAdmin()
  const since = new Date()
  since.setDate(since.getDate() - 90)
  const { data: allLogs } = await db
    .from('habit_logs')
    .select('habit_id, date, count')
    .eq('user_id', userId)
    .gte('date', since.toISOString().slice(0, 10))

  // Index logs by habit
  const byHabit = new Map<string, Map<string, number>>()
  for (const log of (allLogs ?? []) as { habit_id: string; date: string; count: number }[]) {
    const m = byHabit.get(log.habit_id) ?? new Map<string, number>()
    m.set(log.date, log.count)
    byHabit.set(log.habit_id, m)
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return habits.map(h => {
    const logs = byHabit.get(h.id) ?? new Map()
    const expectedDays = h.days_of_week

    // Walk backwards from today, counting streak. Skip non-expected days.
    let currentStreak = 0
    let longestStreak = 0
    let runningStreak = 0
    let completedExpected = 0
    let totalExpected = 0

    for (let i = 0; i < 90; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayIdx = d.getDay()
      const dateStr = d.toISOString().slice(0, 10)

      if (!expectedDays.includes(dayIdx)) {
        // Non-expected day breaks neither streak nor count — skip
        continue
      }

      const count = logs.get(dateStr) ?? 0
      const met = count >= h.target_per_day

      if (i < 30) {
        totalExpected++
        if (met) completedExpected++
      }

      if (met) {
        runningStreak++
        // Current streak = consecutive met days starting today
        if (i === currentStreak) currentStreak = runningStreak
        if (runningStreak > longestStreak) longestStreak = runningStreak
      } else {
        // Today not yet logged shouldn't break the streak; only break if a PAST expected day failed
        if (i > 0) {
          runningStreak = 0
        }
      }
    }

    const countToday = logs.get(todayStr) ?? 0
    return {
      ...h,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      completion_rate_30d: totalExpected > 0 ? Math.round((completedExpected / totalExpected) * 100) : 0,
      done_today: countToday >= h.target_per_day,
      count_today: countToday,
    }
  })
}
