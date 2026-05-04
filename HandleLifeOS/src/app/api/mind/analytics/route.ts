import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  getMoodLogs, getSleepLogs, getJournalEntries, getGratitudeEntries,
} from '@/lib/db/mind-queries'
import { getMindAccess } from '@/lib/mind/premium-gate'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'

const STRESS_CATS = ['work', 'health', 'social', 'personal', 'environment'] as const
type StressCat = typeof STRESS_CATS[number]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  // ── Premium gate: analytics is Pro/Family only ──────────────────────────────
  const access = await getMindAccess(userId)
  if (!access.unlocks.analytics) {
    // Return a small free-tier preview (counts only) so the page can show what they're missing
    const [moodLogs, sleepLogs, journalEntries, gratitudeEntries] = await Promise.all([
      getMoodLogs(userId, 7),
      getSleepLogs(userId, 7),
      getJournalEntries(userId, 7),
      getGratitudeEntries(userId, 7),
    ])
    return NextResponse.json({
      locked: true,
      planId: access.planId,
      upgrade_url: '/premium',
      preview: {
        counts: {
          mood: moodLogs.length,
          sleep: sleepLogs.length,
          journal: journalEntries.length,
          gratitude: gratitudeEntries.length,
        },
      },
    })
  }

  const [moodLogs, sleepLogs, journalEntries, gratitudeEntries] = await Promise.all([
    getMoodLogs(userId, 30),
    getSleepLogs(userId, 30),
    getJournalEntries(userId, 30),
    getGratitudeEntries(userId, 30),
  ])

  // ── Mood vs Sleep correlation (paired by date) ──────────────────────────────
  const sleepByDate = new Map<string, number>()
  for (const s of sleepLogs) {
    if (s.quality != null) sleepByDate.set(s.date, s.quality)
  }
  const correlationPairs = moodLogs
    .map(m => {
      const date = m.logged_at.slice(0, 10)
      const sleepQ = sleepByDate.get(date)
      return sleepQ != null ? { date, mood: m.mood, sleep: sleepQ } : null
    })
    .filter((p): p is { date: string; mood: number; sleep: number } => p !== null)

  // Pearson correlation
  let pearson = 0
  if (correlationPairs.length >= 3) {
    const n = correlationPairs.length
    const sumX = correlationPairs.reduce((s, p) => s + p.sleep, 0)
    const sumY = correlationPairs.reduce((s, p) => s + p.mood, 0)
    const sumXY = correlationPairs.reduce((s, p) => s + p.sleep * p.mood, 0)
    const sumX2 = correlationPairs.reduce((s, p) => s + p.sleep * p.sleep, 0)
    const sumY2 = correlationPairs.reduce((s, p) => s + p.mood * p.mood, 0)
    const num = n * sumXY - sumX * sumY
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    pearson = den === 0 ? 0 : num / den
  }

  // ── Stress trend (last 14 days, daily avg) ──────────────────────────────────
  const stressByDay = new Map<string, { sum: number; count: number }>()
  for (const m of moodLogs) {
    if (m.stress == null) continue
    const date = m.logged_at.slice(0, 10)
    const existing = stressByDay.get(date) ?? { sum: 0, count: 0 }
    existing.sum += m.stress
    existing.count += 1
    stressByDay.set(date, existing)
  }
  const stressTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const entry = stressByDay.get(dateStr)
    return {
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      avg: entry ? Math.round((entry.sum / entry.count) * 10) / 10 : null,
    }
  })

  // ── Most stressful weekdays ─────────────────────────────────────────────────
  const stressByWeekday: number[][] = Array.from({ length: 7 }, () => [])
  for (const m of moodLogs) {
    if (m.stress == null) continue
    const dayIdx = new Date(m.logged_at).getDay()
    stressByWeekday[dayIdx].push(m.stress)
  }
  const weekdayStress = stressByWeekday.map((arr, idx) => ({
    day: DAY_NAMES[idx],
    dayIdx: idx,
    avg: arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10 : null,
    samples: arr.length,
  }))
  const mostStressfulDay = weekdayStress
    .filter(d => d.avg != null && d.samples >= 2)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0] ?? null

  // ── Recovery streak (consecutive days with mood >= 4) ───────────────────────
  const moodByDate = new Map<string, number>()
  for (const m of moodLogs) {
    const date = m.logged_at.slice(0, 10)
    // Take the highest mood for that day if multiple entries
    const existing = moodByDate.get(date) ?? 0
    if (m.mood > existing) moodByDate.set(date, m.mood)
  }
  let currentRecoveryStreak = 0
  let longestRecoveryStreak = 0
  let runningStreak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const mood = moodByDate.get(dateStr)
    if (mood != null && mood >= 4) {
      runningStreak++
      if (i === 0 || currentRecoveryStreak === i) currentRecoveryStreak = runningStreak
      if (runningStreak > longestRecoveryStreak) longestRecoveryStreak = runningStreak
    } else {
      runningStreak = 0
    }
  }

  // ── Stress Radar (avg stress per category from logs in last 30d) ─────────────
  const radarSums: Record<StressCat, { sum: number; count: number }> = {
    work: { sum: 0, count: 0 }, health: { sum: 0, count: 0 },
    social: { sum: 0, count: 0 }, personal: { sum: 0, count: 0 },
    environment: { sum: 0, count: 0 },
  }
  for (const m of moodLogs) {
    if (m.stress == null || !m.stress_categories || m.stress_categories.length === 0) continue
    for (const c of m.stress_categories) {
      if (c in radarSums) {
        radarSums[c as StressCat].sum += m.stress
        radarSums[c as StressCat].count += 1
      }
    }
  }
  const stressRadar = STRESS_CATS.map(c => ({
    category: c,
    avg: radarSums[c].count ? Math.round((radarSums[c].sum / radarSums[c].count) * 10) / 10 : 0,
    samples: radarSums[c].count,
  }))

  // ── Mood × time-of-day heatmap (7 days × 4 quarters) ─────────────────────────
  // Quarters: 0=morning (5-12), 1=afternoon (12-17), 2=evening (17-21), 3=night (21-5)
  const heatmap: { sum: number; count: number }[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 4 }, () => ({ sum: 0, count: 0 })),
  )
  for (const m of moodLogs) {
    const d = new Date(m.logged_at)
    const day = d.getDay()
    const h = d.getHours()
    const q = h < 5 ? 3 : h < 12 ? 0 : h < 17 ? 1 : h < 21 ? 2 : 3
    heatmap[day][q].sum += m.mood
    heatmap[day][q].count += 1
  }
  const heatmapData = heatmap.map((row, day) =>
    row.map((cell, q) => ({
      day, quarter: q,
      avg: cell.count ? Math.round((cell.sum / cell.count) * 10) / 10 : null,
      count: cell.count,
    })),
  )

  // ── Tool effectiveness (avg intensity drop per tool) ─────────────────────────
  let toolEffectiveness: { tool_id: string; sessions: number; avg_drop: number; avg_pre: number; avg_post: number }[] = []
  if (isSupabaseConfigured()) {
    const db = getSupabaseAdmin()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: sessions } = await db
      .from('mind_tool_sessions')
      .select('tool_id, pre_intensity, post_intensity')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', since)
      .not('pre_intensity', 'is', null)
      .not('post_intensity', 'is', null)
    const byTool = new Map<string, { drop: number; pre: number; post: number; n: number }>()
    for (const s of sessions ?? []) {
      const t = s.tool_id as string
      const pre = s.pre_intensity as number
      const post = s.post_intensity as number
      const cur = byTool.get(t) ?? { drop: 0, pre: 0, post: 0, n: 0 }
      cur.drop += pre - post
      cur.pre += pre
      cur.post += post
      cur.n += 1
      byTool.set(t, cur)
    }
    toolEffectiveness = [...byTool.entries()]
      .map(([tool_id, v]) => ({
        tool_id, sessions: v.n,
        avg_drop: Math.round((v.drop / v.n) * 10) / 10,
        avg_pre: Math.round((v.pre / v.n) * 10) / 10,
        avg_post: Math.round((v.post / v.n) * 10) / 10,
      }))
      .sort((a, b) => b.avg_drop - a.avg_drop)
  }

  // ── Energy vs Mood correlation hint ─────────────────────────────────────────
  let energyAvg: number | null = null
  const energyLogs = moodLogs.filter(m => m.energy != null)
  if (energyLogs.length > 0) {
    energyAvg = Math.round((energyLogs.reduce((s, m) => s + (m.energy ?? 0), 0) / energyLogs.length) * 10) / 10
  }

  // ── AI-style insight (rule-based, picks the strongest signal) ───────────────
  const insights: string[] = []
  // Stress radar peak
  const radarPeak = stressRadar.filter(r => r.samples >= 2).sort((a, b) => b.avg - a.avg)[0]
  if (radarPeak && radarPeak.avg >= 3.5) {
    insights.push(`${radarPeak.category.charAt(0).toUpperCase() + radarPeak.category.slice(1)} stress is your top driver this month (${radarPeak.avg}/5 across ${radarPeak.samples} entries).`)
  }
  // Tool that works best
  const topTool = toolEffectiveness.find(t => t.sessions >= 2 && t.avg_drop > 0.5)
  if (topTool) {
    insights.push(`${topTool.tool_id.replace(/_/g, ' ')} drops your intensity by ${topTool.avg_drop} points on average (${topTool.sessions} sessions). Lean on it.`)
  }
  // Anxiety pattern (high energy + low mood)
  const anxiousLogs = energyLogs.filter(m => (m.energy ?? 0) >= 4 && m.mood <= 2)
  if (anxiousLogs.length >= 3) {
    insights.push(`${anxiousLogs.length} days showed high energy + low mood — a classic anxiety signature. Grounding tools may help more than rest.`)
  }
  if (Math.abs(pearson) >= 0.4 && correlationPairs.length >= 5) {
    if (pearson > 0) {
      insights.push(`Your mood tracks closely with your sleep quality (r=${pearson.toFixed(2)}). Better-rested days reliably feel better.`)
    } else {
      insights.push(`Counter-intuitive: your mood and sleep quality are inversely correlated (r=${pearson.toFixed(2)}). Worth investigating other drivers.`)
    }
  }
  if (mostStressfulDay) {
    insights.push(`${mostStressfulDay.day}s consistently show your highest stress (avg ${mostStressfulDay.avg}/5 across ${mostStressfulDay.samples} entries). Consider a lighter ${mostStressfulDay.day} schedule.`)
  }
  if (longestRecoveryStreak >= 5) {
    insights.push(`Your longest recovery streak is ${longestRecoveryStreak} days of mood ≥ 4. That's a real pattern, not a fluke.`)
  }
  if (gratitudeEntries.length >= 7) {
    insights.push(`${gratitudeEntries.length} gratitude entries logged this month — daily reflection is becoming a habit.`)
  }
  if (insights.length === 0) {
    insights.push('Log mood + sleep daily for a week to start seeing pattern insights here.')
  }

  return NextResponse.json({
    counts: {
      mood: moodLogs.length,
      sleep: sleepLogs.length,
      journal: journalEntries.length,
      gratitude: gratitudeEntries.length,
    },
    correlation: {
      pearson: Math.round(pearson * 100) / 100,
      pairs: correlationPairs.slice(0, 30),
    },
    stressTrend,
    weekdayStress,
    mostStressfulDay,
    streaks: {
      currentRecovery: currentRecoveryStreak,
      longestRecovery: longestRecoveryStreak,
    },
    stressRadar,
    heatmap: heatmapData,
    toolEffectiveness,
    energyAvg,
    insights,
  })
}
