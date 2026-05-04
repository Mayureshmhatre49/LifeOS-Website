/**
 * Pattern detection for the AI Personalisation Engine.
 *
 * No ML / no embeddings — just disciplined aggregation across modules.
 * Each learner is a small pure function: pull a slice of raw data, return
 * an Insight or null. The orchestrator runs them, persists results, and
 * the AI prompt-builder can ask for them by `kind`.
 */

import { getSupabaseAdmin } from '@/lib/db/client'
import type { PersonalisationInsight, InsightKind, Severity } from './types'

interface LearnerInput {
  userId: string
  now: Date
}

interface InsightDraft {
  kind: InsightKind
  title: string
  summary_md: string
  evidence: Record<string, unknown>
  confidence: number
  severity: Severity
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtINR(n: number) {
  if (n >= 10_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${Math.round(n)}`
}

// ── Learner: most-focused hour band ─────────────────────────────────────────
async function learnFocusPeak({ userId }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString()
  const { data } = await db
    .from('focus_sessions')
    .select('started_at, duration_minutes, completed')
    .eq('user_id', userId)
    .gte('started_at', since)
    .eq('completed', true)
  const rows = (data ?? []) as { started_at: string; duration_minutes: number }[]
  if (rows.length < 5) return null

  const buckets = new Array(6).fill(0)  // 0:[0-4) 1:[4-8) 2:[8-12) 3:[12-16) 4:[16-20) 5:[20-24)
  for (const r of rows) {
    const h = new Date(r.started_at).getHours()
    buckets[Math.floor(h / 4)] += r.duration_minutes ?? 0
  }
  const peak = buckets.indexOf(Math.max(...buckets))
  if (buckets[peak] === 0) return null
  const labels = ['late night', 'early morning', 'mid-morning', 'early afternoon', 'evening', 'late evening']
  const total = buckets.reduce((a, b) => a + b, 0)
  const share = buckets[peak] / total

  return {
    kind: 'circadian.focus_peak',
    title: `Peak focus: ${labels[peak]}`,
    summary_md: `**${Math.round(share * 100)}%** of your completed deep-work happens in the ${labels[peak]} window. Schedule cognitively heavy work here.`,
    evidence: { buckets, peakBucket: peak, totalMinutes: total },
    confidence: rows.length >= 20 ? 0.85 : 0.6,
    severity: 'info',
  }
}

// ── Learner: most productive weekday ────────────────────────────────────────
async function learnTaskCompletion({ userId }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString()
  const { data } = await db
    .from('tasks')
    .select('updated_at, status')
    .eq('user_id', userId)
    .eq('status', 'done')
    .gte('updated_at', since)
  const rows = (data ?? []) as { updated_at: string }[]
  if (rows.length < 7) return null

  const counts = new Array(7).fill(0)
  for (const r of rows) counts[new Date(r.updated_at).getDay()]++
  const peak = counts.indexOf(Math.max(...counts))
  return {
    kind: 'circadian.task_completion',
    title: `${WEEKDAY_NAMES[peak]} is your most productive day`,
    summary_md: `You completed **${counts[peak]}** tasks on ${WEEKDAY_NAMES[peak]}s in the last 60 days — more than any other day.`,
    evidence: { byWeekday: counts },
    confidence: rows.length >= 30 ? 0.8 : 0.55,
    severity: 'positive',
  }
}

// ── Learner: dominant spending category ─────────────────────────────────────
async function learnTopCategory({ userId, now }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const { data } = await db
    .from('expenses')
    .select('category, amount')
    .eq('user_id', userId)
    .gte('expense_date', start)
  const rows = (data ?? []) as { category: string; amount: number }[]
  if (rows.length < 4) return null

  const totals: Record<string, number> = {}
  let total = 0
  for (const r of rows) {
    const a = Number(r.amount)
    totals[r.category] = (totals[r.category] ?? 0) + a
    total += a
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null
  const [cat, amt] = sorted[0]
  const share = amt / total
  if (share < 0.3) return null   // not concentrated enough to be insightful

  return {
    kind: 'spending.top_category',
    title: `${share >= 0.5 ? 'Half' : 'A third'} of this month's spend goes to ${cat}`,
    summary_md: `**${fmtINR(amt)}** spent on ${cat} (${Math.round(share * 100)}% of ₹${total.toLocaleString('en-IN')} total). ${share >= 0.5 ? 'Worth examining whether this matches your priorities.' : 'Within normal range, but worth tracking.'}`,
    evidence: { totals, total, topCategory: cat, share },
    confidence: rows.length >= 15 ? 0.85 : 0.65,
    severity: share >= 0.5 ? 'attention' : 'info',
  }
}

// ── Learner: month-over-month spending spike ────────────────────────────────
async function learnSpendingSpike({ userId, now }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const monthStart = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    return d.toISOString().slice(0, 10)
  }
  const monthEnd = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0)
    return d.toISOString().slice(0, 10)
  }

  // Compare last 30 days to median of prior 3 months
  const horizons = [0, 1, 2, 3].map(o => ({ start: monthStart(o), end: monthEnd(o) }))
  const totals: number[] = []
  for (const h of horizons) {
    const { data } = await db.from('expenses').select('amount').eq('user_id', userId).gte('expense_date', h.start).lte('expense_date', h.end)
    totals.push(((data ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0))
  }
  const [current, ...prev] = totals
  if (prev.every(x => x === 0)) return null
  const baseline = prev.reduce((a, b) => a + b, 0) / prev.length
  if (baseline === 0) return null
  const ratio = current / baseline
  if (ratio < 1.25) return null

  return {
    kind: 'spending.spike',
    title: `This month is ${Math.round((ratio - 1) * 100)}% over your usual`,
    summary_md: `You've spent **${fmtINR(current)}** so far vs an average of **${fmtINR(baseline)}/month** over the prior 3 months.`,
    evidence: { current, baseline, ratio, history: totals },
    confidence: 0.8,
    severity: ratio > 1.6 ? 'urgent' : 'attention',
  }
}

// ── Learner: best & worst weekday for mood ──────────────────────────────────
async function learnMoodWeekday({ userId }: LearnerInput): Promise<InsightDraft[] | null> {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString()
  const { data } = await db
    .from('mood_logs')
    .select('mood, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', since)
  const rows = (data ?? []) as { mood: number; logged_at: string }[]
  if (rows.length < 14) return null

  const sums = new Array(7).fill(0)
  const counts = new Array(7).fill(0)
  for (const r of rows) {
    const d = new Date(r.logged_at).getDay()
    sums[d] += r.mood
    counts[d]++
  }
  const avgs = sums.map((s, i) => (counts[i] > 0 ? s / counts[i] : null))
  const valid = avgs.map((v, i) => (v != null ? { i, v } : null)).filter(Boolean) as { i: number; v: number }[]
  if (valid.length < 5) return null

  valid.sort((a, b) => a.v - b.v)
  const low = valid[0], high = valid[valid.length - 1]
  // Only emit if the spread is meaningful
  if (high.v - low.v < 0.6) return null

  const insights: InsightDraft[] = []
  insights.push({
    kind: 'mood.weekday_low',
    title: `${WEEKDAY_NAMES[low.i]}s tend to be your hardest day`,
    summary_md: `Average mood on ${WEEKDAY_NAMES[low.i]}s: **${low.v.toFixed(1)} / 5** (vs ${high.v.toFixed(1)} on ${WEEKDAY_NAMES[high.i]}s). Plan something restorative.`,
    evidence: { byWeekday: avgs },
    confidence: rows.length >= 30 ? 0.8 : 0.55,
    severity: low.v <= 2.5 ? 'attention' : 'info',
  })
  insights.push({
    kind: 'mood.weekday_high',
    title: `${WEEKDAY_NAMES[high.i]}s lift you the most`,
    summary_md: `Average mood on ${WEEKDAY_NAMES[high.i]}s: **${high.v.toFixed(1)} / 5**. Note what you tend to do on these days.`,
    evidence: { byWeekday: avgs },
    confidence: rows.length >= 30 ? 0.8 : 0.55,
    severity: 'positive',
  })
  return insights
}

// ── Learner: fragile & strong habits ────────────────────────────────────────
async function learnHabitPatterns({ userId, now }: LearnerInput): Promise<InsightDraft[] | null> {
  const db = getSupabaseAdmin()
  const { data: habits } = await db
    .from('habits')
    .select('id, name, days_of_week, target_per_day')
    .eq('user_id', userId)
    .eq('is_active', true)
  const hs = (habits ?? []) as { id: string; name: string; days_of_week: number[]; target_per_day: number }[]
  if (hs.length === 0) return null

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const todayStr = now.toISOString().slice(0, 10)
  const { data: logs } = await db
    .from('habit_logs')
    .select('habit_id, count, date')
    .eq('user_id', userId)
    .gte('date', since)
    .lte('date', todayStr)
  const ls = (logs ?? []) as { habit_id: string; count: number; date: string }[]

  const stats: Array<{ id: string; name: string; rate: number; expected: number }> = []
  for (const h of hs) {
    let expected = 0
    for (let d = 0; d < 30; d++) {
      const dt = new Date(now); dt.setDate(dt.getDate() - d)
      if (h.days_of_week.includes(dt.getDay())) expected++
    }
    if (expected < 5) continue  // not enough scheduled days
    const completed = ls.filter(l => l.habit_id === h.id && l.count >= h.target_per_day).length
    stats.push({ id: h.id, name: h.name, rate: completed / expected, expected })
  }
  if (stats.length === 0) return null

  const insights: InsightDraft[] = []
  // Fragile: lowest rate ≤ 0.4
  stats.sort((a, b) => a.rate - b.rate)
  if (stats[0].rate <= 0.4) {
    insights.push({
      kind: 'habit.fragile',
      title: `${stats[0].name} is slipping`,
      summary_md: `Completed only **${Math.round(stats[0].rate * 100)}%** of scheduled days in the last 30 days. Either lower the target or remove it — friction without progress drains will.`,
      evidence: { habit: stats[0] },
      confidence: 0.8,
      severity: 'attention',
    })
  }
  // Strong: highest rate ≥ 0.85
  const top = stats[stats.length - 1]
  if (top.rate >= 0.85 && top.id !== stats[0].id) {
    insights.push({
      kind: 'habit.streak',
      title: `${top.name} is rock-solid`,
      summary_md: `Completed **${Math.round(top.rate * 100)}%** of scheduled days in the last 30 days. This is a foundation you can stack other habits on.`,
      evidence: { habit: top },
      confidence: 0.85,
      severity: 'positive',
    })
  }
  return insights.length ? insights : null
}

// ── Learner: savings goal velocity ──────────────────────────────────────────
async function learnGoalVelocity({ userId, now }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('savings_goals')
    .select('id, title, target_amount, current_amount, target_date, created_at, is_completed')
    .eq('user_id', userId)
    .eq('is_completed', false)
  const goals = (data ?? []) as { id: string; title: string; target_amount: number; current_amount: number; target_date: string | null; created_at: string }[]
  if (goals.length === 0) return null

  // Pick the goal with the longest history & a target date for a meaningful velocity calc
  const eligible = goals.filter(g => g.target_date && g.current_amount > 0)
  if (eligible.length === 0) return null

  eligible.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const g = eligible[0]
  const ageDays = Math.max(1, (now.getTime() - new Date(g.created_at).getTime()) / 86_400_000)
  const monthlyVelocity = (Number(g.current_amount) / ageDays) * 30
  const remaining = Number(g.target_amount) - Number(g.current_amount)
  const monthsRemaining = monthlyVelocity > 0 ? remaining / monthlyVelocity : Infinity

  const targetDate = new Date(g.target_date!)
  const monthsUntilTarget = (targetDate.getTime() - now.getTime()) / (30 * 86_400_000)

  let severity: Severity = 'info'
  let summary = ''
  if (monthsRemaining <= monthsUntilTarget) {
    severity = 'positive'
    summary = `At your current pace of ${fmtINR(monthlyVelocity)}/month, you'll hit "${g.title}" **${Math.round(monthsUntilTarget - monthsRemaining)} months early**.`
  } else {
    severity = 'attention'
    const shortfall = (monthsRemaining - monthsUntilTarget) * monthlyVelocity
    summary = `At your current pace of ${fmtINR(monthlyVelocity)}/month, you'll fall short by **${fmtINR(shortfall)}**. Increase the monthly contribution or move the target date.`
  }

  return {
    kind: 'goal.velocity',
    title: `"${g.title}" — pace check`,
    summary_md: summary,
    evidence: { goal: g, monthlyVelocity, monthsRemaining, monthsUntilTarget },
    confidence: ageDays >= 30 ? 0.8 : 0.55,
    severity,
  }
}

// ── Learner: subscription bloat ─────────────────────────────────────────────
async function learnSubscriptionBloat({ userId }: LearnerInput): Promise<InsightDraft | null> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('money_subscriptions')
    .select('name, amount, billing_cycle')
    .eq('user_id', userId)
    .eq('is_active', true)
  const subs = (data ?? []) as { name: string; amount: number; billing_cycle: string }[]
  if (subs.length < 4) return null

  const monthly = subs.reduce((s, x) => {
    const a = Number(x.amount)
    if (x.billing_cycle === 'annual') return s + a / 12
    if (x.billing_cycle === 'quarterly') return s + a / 3
    if (x.billing_cycle === 'weekly') return s + a * 4.33
    return s + a
  }, 0)
  if (monthly < 1500) return null

  return {
    kind: 'subscription.bloat',
    title: `${subs.length} active subscriptions = ${fmtINR(monthly)}/month`,
    summary_md: `Recurring services add up. Audit which ones you actually used in the last 30 days — every cancelled sub is permanent monthly cashflow regained.`,
    evidence: { count: subs.length, monthlyTotal: monthly, items: subs.map(s => s.name) },
    confidence: 0.75,
    severity: monthly >= 5000 ? 'attention' : 'info',
  }
}

// ── Orchestrator ────────────────────────────────────────────────────────────

const LEARNERS = [
  learnFocusPeak,
  learnTaskCompletion,
  learnTopCategory,
  learnSpendingSpike,
  learnGoalVelocity,
  learnSubscriptionBloat,
] as const

const MULTI_LEARNERS = [learnMoodWeekday, learnHabitPatterns] as const

/**
 * Run every learner, collect drafts, persist via upsert on (user_id, kind).
 * Returns the live set of insights after the pass.
 */
export async function runLearners(userId: string, now: Date = new Date()): Promise<PersonalisationInsight[]> {
  const db = getSupabaseAdmin()

  const drafts: InsightDraft[] = []
  const input: LearnerInput = { userId, now }

  for (const L of LEARNERS) {
    try {
      const r = await L(input)
      if (r) drafts.push(r)
    } catch (e) {
      console.warn('[personalisation] learner failed:', (L as { name?: string }).name ?? '?', e)
    }
  }
  for (const L of MULTI_LEARNERS) {
    try {
      const rs = await L(input)
      if (rs) drafts.push(...rs)
    } catch (e) {
      console.warn('[personalisation] multi-learner failed:', (L as { name?: string }).name ?? '?', e)
    }
  }

  if (drafts.length === 0) return []

  const rows = drafts.map(d => ({
    user_id: userId,
    kind: d.kind,
    title: d.title,
    summary_md: d.summary_md,
    evidence: d.evidence,
    confidence: d.confidence,
    severity: d.severity,
    is_dismissed: false,
    generated_at: now.toISOString(),
  }))

  // Upsert by (user_id, kind) — preserves ids for dismissed flag stability if we
  // change to keeping prior rows; today we overwrite so the user sees fresh state.
  const { data } = await db
    .from('personalisation_insights')
    .upsert(rows, { onConflict: 'user_id,kind' })
    .select()

  return (data ?? []) as PersonalisationInsight[]
}

export async function getInsights(userId: string): Promise<PersonalisationInsight[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('personalisation_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('generated_at', { ascending: false })
  return (data ?? []) as PersonalisationInsight[]
}
