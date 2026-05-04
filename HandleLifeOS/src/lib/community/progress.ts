/**
 * Computes challenge progress from existing module data.
 *
 * Each challenge has a `rule_kind` ('habit', 'expense_cap', 'focus_minutes',
 * 'journal_streak', 'task_count', 'custom'). The engine reads the relevant
 * module's data between started_at..now and computes progress_pct + a
 * structured progress_data blob.
 *
 * No new event log: we always derive from the source-of-truth tables.
 */

import { getSupabaseAdmin } from '@/lib/db/client'
import type { Challenge, ChallengeParticipant } from './types'

interface ProgressResult {
  progress_pct: number
  progress_data: Record<string, unknown>
  status: 'active' | 'completed' | 'expired'
}

const MS_PER_DAY = 86_400_000

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY)
}

// ── Rule: habit-based ───────────────────────────────────────────────────────
async function progressHabit(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { habit_keywords?: string[]; min_per_day?: number; days_of_week?: number[] }
  const keywords = (cfg.habit_keywords ?? []).map(s => s.toLowerCase())
  const minPerDay = cfg.min_per_day ?? 1
  const allowedDays = cfg.days_of_week ?? null

  const db = getSupabaseAdmin()
  const startedAt = new Date(participant.started_at)
  const endsAt = new Date(participant.ends_at)
  const winEnd = endsAt < now ? endsAt : now

  // Find matching habits owned by the user
  const { data: habits } = await db
    .from('habits')
    .select('id, name')
    .eq('user_id', participant.user_id)
    .eq('is_active', true)

  const matched = ((habits ?? []) as { id: string; name: string }[])
    .filter(h => keywords.length === 0 || keywords.some(k => h.name.toLowerCase().includes(k)))

  if (matched.length === 0) {
    return { progress_pct: 0, progress_data: { reason: 'no_matching_habit' }, status: status(participant, now) }
  }

  const startStr = startedAt.toISOString().slice(0, 10)
  const endStr = winEnd.toISOString().slice(0, 10)
  const ids = matched.map(m => m.id)
  const { data: logs } = await db
    .from('habit_logs')
    .select('habit_id, date, count')
    .eq('user_id', participant.user_id)
    .in('habit_id', ids)
    .gte('date', startStr)
    .lte('date', endStr)

  // Per-day check: did the user complete ANY matched habit ≥ minPerDay?
  const byDate = new Map<string, number>()
  for (const l of (logs ?? []) as { date: string; count: number }[]) {
    byDate.set(l.date, Math.max(byDate.get(l.date) ?? 0, Number(l.count)))
  }

  const totalScheduled = countQualifyingDays(startedAt, winEnd, allowedDays)
  let met = 0
  for (let d = 0; d <= daysBetween(startedAt, winEnd); d++) {
    const dt = new Date(startedAt); dt.setDate(dt.getDate() + d)
    if (allowedDays && !allowedDays.includes(dt.getDay())) continue
    const ds = dt.toISOString().slice(0, 10)
    if ((byDate.get(ds) ?? 0) >= minPerDay) met++
  }
  const totalDays = countQualifyingDays(startedAt, endsAt, allowedDays)
  const pct = Math.min(100, Math.round((met / Math.max(1, totalDays)) * 100))
  return {
    progress_pct: pct,
    progress_data: { met, totalScheduled, totalDays, matchedHabits: matched.map(m => m.name) },
    status: pct >= 100 ? 'completed' : status(participant, now),
  }
}

function countQualifyingDays(start: Date, end: Date, allowed: number[] | null): number {
  let n = 0
  const total = daysBetween(start, end)
  for (let i = 0; i <= total; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i)
    if (!allowed || allowed.includes(d.getDay())) n++
  }
  return n
}

// ── Rule: expense cap ───────────────────────────────────────────────────────
async function progressExpenseCap(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { daily_cap?: number; exclude_categories?: string[] }
  const cap = cfg.daily_cap ?? 0
  const exclude = new Set(cfg.exclude_categories ?? [])

  const db = getSupabaseAdmin()
  const startedAt = new Date(participant.started_at)
  const endsAt = new Date(participant.ends_at)
  const winEnd = endsAt < now ? endsAt : now

  const { data } = await db
    .from('expenses')
    .select('amount, category, expense_date')
    .eq('user_id', participant.user_id)
    .gte('expense_date', startedAt.toISOString().slice(0, 10))
    .lte('expense_date', winEnd.toISOString().slice(0, 10))

  const rows = (data ?? []) as { amount: number; category: string; expense_date: string }[]
  const offenders = rows.filter(r => !exclude.has(r.category) && Number(r.amount) > cap)
  const dailyTotals = new Map<string, number>()
  for (const r of rows) {
    if (exclude.has(r.category)) continue
    dailyTotals.set(r.expense_date, (dailyTotals.get(r.expense_date) ?? 0) + Number(r.amount))
  }

  const daysSoFar = Math.max(1, daysBetween(startedAt, winEnd) + 1)
  const totalDays = challenge.duration_days
  const cleanDays = [...dailyTotals.entries()].filter(([, v]) => v <= cap).length
  // For a 0-cap challenge, "progress" = clean-days completed / total duration
  // But also: any single offender breaks the streak — surface it
  const breakDay = [...dailyTotals.entries()].find(([, v]) => v > cap)?.[0]

  const pct = Math.min(100, Math.round((cleanDays / totalDays) * 100))
  const isComplete = cleanDays >= totalDays
  return {
    progress_pct: pct,
    progress_data: {
      cleanDays, daysSoFar, totalDays,
      offenderCount: offenders.length,
      breakDay,
      cap,
    },
    status: isComplete ? 'completed' : breakDay ? 'expired' : status(participant, now),
  }
}

// ── Rule: focus minutes ─────────────────────────────────────────────────────
async function progressFocusMinutes(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { target_minutes?: number }
  const target = cfg.target_minutes ?? 0
  if (target === 0) return { progress_pct: 0, progress_data: {}, status: status(participant, now) }

  const db = getSupabaseAdmin()
  const startedAt = new Date(participant.started_at)
  const endsAt = new Date(participant.ends_at)
  const winEnd = endsAt < now ? endsAt : now

  const { data } = await db
    .from('focus_sessions')
    .select('duration_minutes, completed')
    .eq('user_id', participant.user_id)
    .eq('completed', true)
    .gte('started_at', startedAt.toISOString())
    .lte('started_at', winEnd.toISOString())

  const minutes = ((data ?? []) as { duration_minutes: number }[])
    .reduce((s, r) => s + Number(r.duration_minutes ?? 0), 0)
  const pct = Math.min(100, Math.round((minutes / target) * 100))
  return {
    progress_pct: pct,
    progress_data: { minutes, target },
    status: pct >= 100 ? 'completed' : status(participant, now),
  }
}

// ── Rule: journal streak ────────────────────────────────────────────────────
async function progressJournalStreak(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { min_streak?: number }
  const target = cfg.min_streak ?? challenge.duration_days

  const db = getSupabaseAdmin()
  const startedAt = new Date(participant.started_at)
  const endsAt = new Date(participant.ends_at)
  const winEnd = endsAt < now ? endsAt : now

  const { data } = await db
    .from('journal_entries')
    .select('created_at')
    .eq('user_id', participant.user_id)
    .gte('created_at', startedAt.toISOString())
    .lte('created_at', winEnd.toISOString())

  const days = new Set<string>()
  for (const r of (data ?? []) as { created_at: string }[]) {
    days.add(new Date(r.created_at).toISOString().slice(0, 10))
  }
  const pct = Math.min(100, Math.round((days.size / target) * 100))
  return {
    progress_pct: pct,
    progress_data: { uniqueDays: days.size, target },
    status: pct >= 100 ? 'completed' : status(participant, now),
  }
}

// ── Rule: task count ────────────────────────────────────────────────────────
async function progressTaskCount(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { task_keywords?: string[]; target_count?: number }
  const keywords = (cfg.task_keywords ?? []).map(s => s.toLowerCase())
  const target = cfg.target_count ?? 1

  const db = getSupabaseAdmin()
  const startedAt = new Date(participant.started_at)
  const endsAt = new Date(participant.ends_at)
  const winEnd = endsAt < now ? endsAt : now

  const { data } = await db
    .from('tasks')
    .select('title, status, updated_at')
    .eq('user_id', participant.user_id)
    .eq('status', 'done')
    .gte('updated_at', startedAt.toISOString())
    .lte('updated_at', winEnd.toISOString())

  const matched = ((data ?? []) as { title: string }[])
    .filter(t => keywords.length === 0 || keywords.some(k => t.title.toLowerCase().includes(k)))

  const pct = Math.min(100, Math.round((matched.length / target) * 100))
  return {
    progress_pct: pct,
    progress_data: { count: matched.length, target },
    status: pct >= 100 ? 'completed' : status(participant, now),
  }
}

// ── Rule: custom (savings goal target) ──────────────────────────────────────
async function progressCustom(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date,
): Promise<ProgressResult> {
  const cfg = challenge.rule_config as { goal_target?: number; savings_category?: string }
  const target = cfg.goal_target ?? 0
  if (target === 0) return { progress_pct: 0, progress_data: {}, status: status(participant, now) }

  const db = getSupabaseAdmin()
  let q = db.from('savings_goals').select('current_amount').eq('user_id', participant.user_id)
  if (cfg.savings_category) q = q.eq('category', cfg.savings_category)
  const { data } = await q
  const total = ((data ?? []) as { current_amount: number }[])
    .reduce((s, g) => s + Number(g.current_amount), 0)
  const pct = Math.min(100, Math.round((total / target) * 100))
  return {
    progress_pct: pct,
    progress_data: { current: total, target },
    status: pct >= 100 ? 'completed' : status(participant, now),
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function status(p: ChallengeParticipant, now: Date): 'active' | 'expired' {
  return new Date(p.ends_at) < now ? 'expired' : 'active'
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function computeProgress(
  challenge: Challenge,
  participant: ChallengeParticipant,
  now: Date = new Date(),
): Promise<ProgressResult> {
  switch (challenge.rule_kind) {
    case 'habit':           return progressHabit(challenge, participant, now)
    case 'expense_cap':     return progressExpenseCap(challenge, participant, now)
    case 'focus_minutes':   return progressFocusMinutes(challenge, participant, now)
    case 'journal_streak':  return progressJournalStreak(challenge, participant, now)
    case 'task_count':      return progressTaskCount(challenge, participant, now)
    case 'custom':          return progressCustom(challenge, participant, now)
    default:                return { progress_pct: 0, progress_data: {}, status: status(participant, now) }
  }
}

/** Re-compute progress for all active challenges of a user and persist. */
export async function refreshAllProgress(userId: string): Promise<ChallengeParticipant[]> {
  const db = getSupabaseAdmin()
  const { data: participants } = await db
    .from('challenge_participants')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
  const ps = (participants ?? []) as ChallengeParticipant[]
  if (ps.length === 0) return []

  const challengeIds = Array.from(new Set(ps.map(p => p.challenge_id)))
  const { data: challenges } = await db
    .from('challenges')
    .select('*')
    .in('id', challengeIds)
  const byId = new Map((challenges ?? []).map(c => [c.id, c as Challenge]))

  const updates: ChallengeParticipant[] = []
  const now = new Date()
  for (const p of ps) {
    const c = byId.get(p.challenge_id)
    if (!c) continue
    const r = await computeProgress(c, p, now)
    const { data: updated } = await db
      .from('challenge_participants')
      .update({ progress_pct: r.progress_pct, progress_data: r.progress_data, status: r.status })
      .eq('id', p.id)
      .eq('user_id', userId)
      .select()
      .single()
    if (updated) updates.push(updated as ChallengeParticipant)
  }
  return updates
}
