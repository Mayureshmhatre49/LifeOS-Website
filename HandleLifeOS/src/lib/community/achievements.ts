/**
 * Auto-generates Achievement rows by scanning module data for milestones.
 *
 * Each detector returns an upsertable row with a stable `kind` so re-running
 * never duplicates. Detectors are pure-async and fail-open.
 */

import { getSupabaseAdmin } from '@/lib/db/client'
import type { Achievement, AchievementModule } from './types'

interface AchievementDraft {
  kind: string
  title: string
  body: string
  emoji: string
  module: AchievementModule
  evidence: Record<string, unknown>
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

// ── Habit streak milestones (7, 14, 30, 60, 100, 365) ──────────────────────
async function detectHabitStreaks(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { data: habits } = await db
    .from('habits')
    .select('id, name, days_of_week, target_per_day')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!habits || habits.length === 0) return []

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const drafts: AchievementDraft[] = []

  for (const h of habits as { id: string; name: string; days_of_week: number[]; target_per_day: number }[]) {
    // Pull last 200 logs to compute streak
    const { data: logs } = await db
      .from('habit_logs')
      .select('date, count')
      .eq('user_id', userId)
      .eq('habit_id', h.id)
      .gte('date', new Date(today.getTime() - 365 * 86_400_000).toISOString().slice(0, 10))
      .order('date', { ascending: false })
      .limit(400)

    if (!logs) continue
    const byDate = new Map<string, number>()
    for (const l of logs as { date: string; count: number }[]) {
      byDate.set(l.date, Number(l.count))
    }

    // Walk backward from today, only counting "expected" days
    let streak = 0
    for (let d = 0; d < 400; d++) {
      const dt = new Date(today); dt.setDate(dt.getDate() - d)
      if (!h.days_of_week.includes(dt.getDay())) continue
      const ds = dt.toISOString().slice(0, 10)
      const c = byDate.get(ds) ?? 0
      if (c >= h.target_per_day) streak++
      else break
    }

    const tier = streak >= 365 ? 365 : streak >= 100 ? 100 : streak >= 60 ? 60 : streak >= 30 ? 30 : streak >= 14 ? 14 : streak >= 7 ? 7 : 0
    if (tier === 0) continue

    drafts.push({
      kind: `habit_streak_${tier}:${slug(h.name)}`,
      title: `${tier}-day ${h.name} streak`,
      body: `You completed "${h.name}" on every scheduled day for ${tier} days in a row. Compounding works.`,
      emoji: tier >= 100 ? '🏆' : tier >= 30 ? '🔥' : '✨',
      module: 'habits',
      evidence: { habit_id: h.id, habit_name: h.name, streak },
    })
  }
  return drafts
}

// ── Savings goal completion ────────────────────────────────────────────────
async function detectGoalCompletion(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('savings_goals')
    .select('id, title, target_amount, current_amount')
    .eq('user_id', userId)
    .eq('is_completed', true)

  return ((data ?? []) as { id: string; title: string; target_amount: number; current_amount: number }[])
    .map(g => ({
      kind: `savings_goal_complete:${g.id}`,
      title: `Goal hit: ${g.title}`,
      body: `You reached your ₹${Number(g.target_amount).toLocaleString('en-IN')} savings target. Move the goalpost.`,
      emoji: '🎯',
      module: 'money' as AchievementModule,
      evidence: { goal_id: g.id, target: g.target_amount, current: g.current_amount },
    }))
}

// ── Focus milestones (10h, 50h, 100h cumulative) ───────────────────────────
async function detectFocusMilestones(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('focus_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('completed', true)

  const totalMin = ((data ?? []) as { duration_minutes: number }[])
    .reduce((s, r) => s + Number(r.duration_minutes ?? 0), 0)
  const totalHrs = Math.floor(totalMin / 60)

  const tiers = [10, 50, 100, 250, 500, 1000]
  const drafts: AchievementDraft[] = []
  for (const t of tiers) {
    if (totalHrs >= t) {
      drafts.push({
        kind: `focus_total_${t}h`,
        title: `${t} hours of deep work`,
        body: `Cumulative focused work has crossed ${t} hours. Mastery is built one block at a time.`,
        emoji: t >= 500 ? '🏆' : t >= 100 ? '⭐' : '🎯',
        module: 'focus',
        evidence: { totalMinutes: totalMin, totalHours: totalHrs, tier: t },
      })
    }
  }
  return drafts
}

// ── Journal streak (7, 14, 30, 100 entries) ────────────────────────────────
async function detectJournalCount(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { count } = await db
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const n = count ?? 0
  const tiers = [7, 30, 100, 365]
  const drafts: AchievementDraft[] = []
  for (const t of tiers) {
    if (n >= t) {
      drafts.push({
        kind: `journal_count_${t}`,
        title: `${t} journal entries`,
        body: `You've reflected on ${t} different moments. The unexamined day moves on; yours don't.`,
        emoji: t >= 100 ? '📔' : '✍️',
        module: 'mind',
        evidence: { count: n, tier: t },
      })
    }
  }
  return drafts
}

// ── Task milestones (50, 250, 1000 done) ───────────────────────────────────
async function detectTaskMilestones(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { count } = await db
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'done')

  const n = count ?? 0
  const tiers = [50, 250, 1000]
  const drafts: AchievementDraft[] = []
  for (const t of tiers) {
    if (n >= t) {
      drafts.push({
        kind: `tasks_done_${t}`,
        title: `${t} tasks completed`,
        body: `${t} things you said you'd do — done. The compounding is invisible until it isn't.`,
        emoji: t >= 1000 ? '🏆' : '✅',
        module: 'planner',
        evidence: { count: n, tier: t },
      })
    }
  }
  return drafts
}

// ── Challenge completion ───────────────────────────────────────────────────
async function detectChallengeCompletions(userId: string): Promise<AchievementDraft[]> {
  const db = getSupabaseAdmin()
  const { data: participants } = await db
    .from('challenge_participants')
    .select('challenge_id, ends_at')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const ps = (participants ?? []) as { challenge_id: string; ends_at: string }[]
  if (ps.length === 0) return []

  const challengeIds = Array.from(new Set(ps.map(p => p.challenge_id)))
  const { data: challenges } = await db
    .from('challenges')
    .select('id, slug, title, emoji')
    .in('id', challengeIds)

  const byId = new Map(
    ((challenges ?? []) as { id: string; slug: string; title: string; emoji: string | null }[])
      .map(c => [c.id, c]),
  )

  return ps
    .map(p => ({ p, c: byId.get(p.challenge_id) }))
    .filter((x): x is { p: { challenge_id: string; ends_at: string }; c: { id: string; slug: string; title: string; emoji: string | null } } => !!x.c)
    .map(({ p, c }) => ({
      kind: `challenge_complete:${c.slug}`,
      title: `Completed: ${c.title}`,
      body: `You finished a community challenge. Most people who join, don't.`,
      emoji: c.emoji ?? '🏅',
      module: 'community' as AchievementModule,
      evidence: { challenge_id: p.challenge_id },
    }))
}

// ── Orchestrator ───────────────────────────────────────────────────────────
const DETECTORS = [
  detectHabitStreaks,
  detectGoalCompletion,
  detectFocusMilestones,
  detectJournalCount,
  detectTaskMilestones,
  detectChallengeCompletions,
] as const

export async function runAchievementDetectors(userId: string): Promise<Achievement[]> {
  const drafts: AchievementDraft[] = []
  for (const D of DETECTORS) {
    try {
      const r = await D(userId)
      drafts.push(...r)
    } catch (e) {
      console.warn('[achievements] detector failed', (D as { name?: string }).name, e)
    }
  }

  if (drafts.length === 0) return []

  const db = getSupabaseAdmin()
  const rows = drafts.map(d => ({
    user_id: userId,
    kind: d.kind,
    title: d.title,
    body: d.body,
    emoji: d.emoji,
    module: d.module,
    evidence: d.evidence,
  }))
  const { data } = await db
    .from('achievements')
    .upsert(rows, { onConflict: 'user_id,kind', ignoreDuplicates: true })
    .select()
  return (data ?? []) as Achievement[]
}

export async function listAchievements(userId: string): Promise<Achievement[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(100)
  return (data ?? []) as Achievement[]
}
