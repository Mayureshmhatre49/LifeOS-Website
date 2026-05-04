'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, BarChart3, TrendingUp, Sparkles, Flame, Calendar,
  AlertCircle, Crown, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Analytics {
  locked?: false
  counts: { mood: number; sleep: number; journal: number; gratitude: number }
  correlation: {
    pearson: number
    pairs: { date: string; mood: number; sleep: number }[]
  }
  stressTrend: { date: string; label: string; avg: number | null }[]
  weekdayStress: { day: string; dayIdx: number; avg: number | null; samples: number }[]
  mostStressfulDay: { day: string; avg: number | null; samples: number } | null
  streaks: { currentRecovery: number; longestRecovery: number }
  stressRadar: { category: string; avg: number; samples: number }[]
  heatmap: { day: number; quarter: number; avg: number | null; count: number }[][]
  toolEffectiveness: { tool_id: string; sessions: number; avg_drop: number; avg_pre: number; avg_post: number }[]
  energyAvg: number | null
  insights: string[]
}

interface LockedAnalytics {
  locked: true
  planId: string
  upgrade_url: string
  preview: {
    counts: { mood: number; sleep: number; journal: number; gratitude: number }
  }
}

type AnalyticsResponse = Analytics | LockedAnalytics

export default function MindAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mind/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  if (data.locked) {
    return <LockedView data={data} />
  }

  const totalLogs = data.counts.mood + data.counts.sleep + data.counts.journal + data.counts.gratitude
  const dataLight = totalLogs < 7

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mind Analytics</h1>
        </div>
      </div>

      {dataLight && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Limited data so far</p>
            <p className="text-xs text-amber-700 mt-0.5">Log mood and sleep daily for a week to unlock pattern insights below.</p>
          </div>
        </div>
      )}

      {/* AI insights */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Pattern Insights</p>
        </div>
        <ul className="space-y-2">
          {data.insights.map((line, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
              <span className="text-violet-400 font-bold shrink-0">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Streaks + counts row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} color="text-orange-500" label="Current recovery streak" value={`${data.streaks.currentRecovery}d`} sub="Days mood ≥ 4" />
        <StatCard icon={TrendingUp} color="text-emerald-500" label="Longest recovery streak" value={`${data.streaks.longestRecovery}d`} sub="All-time best" />
      </div>

      {/* Stress trend */}
      <Card title="Stress trend (14 days)" subtitle="Daily average stress level (1-5)">
        {data.stressTrend.every(d => d.avg == null) ? (
          <EmptyState message="No stress data yet. Log mood with stress level to see this trend." />
        ) : (
          <div>
            <div className="flex items-end gap-1 h-20 mt-2">
              {data.stressTrend.map(d => {
                const v = d.avg ?? 0
                const color = v >= 4 ? 'from-red-400 to-red-500'
                  : v >= 3 ? 'from-amber-300 to-orange-400'
                  : v > 0 ? 'from-emerald-300 to-emerald-400'
                  : 'bg-gray-100'
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={d.avg ? `${d.avg}/5` : 'no data'}>
                    <div
                      className={cn('w-full rounded-t-lg transition-all duration-500', d.avg ? `bg-gradient-to-t ${color}` : 'bg-gray-100')}
                      style={{ height: d.avg ? `${(v / 5) * 64}px` : '4px' }}
                    />
                    <span className="text-[8px] text-gray-400 font-medium">{d.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>Calm</span>
              <span>Severe</span>
            </div>
          </div>
        )}
      </Card>

      {/* Weekday stress */}
      <Card title="Most stressful weekdays" subtitle="Average stress by day of week">
        {data.weekdayStress.every(d => d.avg == null) ? (
          <EmptyState message="Need entries across multiple weekdays." />
        ) : (
          <div className="space-y-1.5 mt-1">
            {data.weekdayStress.map(d => {
              const pct = d.avg != null ? (d.avg / 5) * 100 : 0
              const color = !d.avg ? 'bg-gray-100'
                : d.avg >= 4 ? 'bg-red-400'
                : d.avg >= 3 ? 'bg-amber-400'
                : 'bg-emerald-400'
              const isPeak = data.mostStressfulDay?.day === d.day
              return (
                <div key={d.day} className="flex items-center gap-2">
                  <span className={cn('w-9 text-xs font-semibold', isPeak ? 'text-red-600' : 'text-gray-600')}>{d.day}</span>
                  <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-[10px] font-semibold text-gray-500 text-right">
                    {d.avg != null ? d.avg.toFixed(1) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Mood ↔ Sleep correlation */}
      <Card title="Mood vs Sleep" subtitle={
        data.correlation.pairs.length < 3
          ? 'Not enough paired entries yet (need 3+)'
          : `Pearson r = ${data.correlation.pearson.toFixed(2)} · ${describeCorrelation(data.correlation.pearson)}`
      }>
        {data.correlation.pairs.length < 3 ? (
          <EmptyState message="Log mood and sleep on the same day for a week to see this." />
        ) : (
          <>
            {/* Mini scatter built with absolutely-positioned dots */}
            <div className="relative h-40 mt-2 border-l border-b border-gray-200">
              <span className="absolute left-1 top-1 text-[9px] text-gray-400">Mood 5</span>
              <span className="absolute -left-3 bottom-0 text-[9px] text-gray-400 -rotate-90 origin-bottom-left">Mood</span>
              <span className="absolute right-1 -bottom-4 text-[9px] text-gray-400">Sleep 5</span>
              <span className="absolute left-1 -bottom-4 text-[9px] text-gray-400">Sleep 1</span>
              {data.correlation.pairs.map((p, i) => {
                // x = sleep 1-5 → 0-100%, y = mood 1-5 → 100-0%
                const xPct = ((p.sleep - 1) / 4) * 100
                const yPct = 100 - ((p.mood - 1) / 4) * 100
                return (
                  <div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-violet-500 shadow-sm"
                    style={{ left: `calc(${xPct}% - 4px)`, top: `calc(${yPct}% - 4px)` }}
                    title={`${p.date}: mood ${p.mood} / sleep ${p.sleep}`}
                  />
                )
              })}
            </div>
          </>
        )}
      </Card>

      {/* Stress radar */}
      <Card title="Stress radar" subtitle="Where stress is coming from (last 30 days)">
        {data.stressRadar.every(r => r.samples === 0) ? (
          <EmptyState message="Tag stress sources on your check-ins to populate this radar." />
        ) : (
          <StressRadar data={data.stressRadar} />
        )}
      </Card>

      {/* Mood × time-of-day heatmap */}
      <Card title="Mood by day & time" subtitle="When do you feel best? (avg mood per slot)">
        {data.heatmap.every(row => row.every(c => c.avg == null)) ? (
          <EmptyState message="Log mood at different times across the week to see your rhythm." />
        ) : (
          <Heatmap data={data.heatmap} />
        )}
      </Card>

      {/* Tool effectiveness */}
      <Card title="What works for you" subtitle="Tools ranked by avg intensity drop (last 30 days)">
        {data.toolEffectiveness.length === 0 ? (
          <EmptyState message="Use a calm tool and rate how you feel before/after to see what helps most." />
        ) : (
          <div className="space-y-1.5 mt-2">
            {data.toolEffectiveness.slice(0, 5).map(t => (
              <ToolEffectivenessRow key={t.tool_id} tool={t} />
            ))}
          </div>
        )}
      </Card>

      {/* Data summary */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last 30 days</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Mini value={data.counts.mood} label="Mood logs" color="text-violet-600" />
          <Mini value={data.counts.sleep} label="Sleep logs" color="text-indigo-600" />
          <Mini value={data.counts.journal} label="Journal" color="text-emerald-600" />
          <Mini value={data.counts.gratitude} label="Gratitude" color="text-amber-600" />
        </div>
        {data.energyAvg != null && (
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            Avg energy this period: <span className="font-bold text-emerald-600">{data.energyAvg}/5</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Stress Radar (5-axis polygon) ──────────────────────────────────────────────
function StressRadar({ data }: { data: { category: string; avg: number; samples: number }[] }) {
  const W = 280, H = 240, cx = W / 2, cy = H / 2 + 10, R = 80
  const axes = data.length

  // Polar to cartesian for axis i out of N (start at top, go clockwise)
  function point(i: number, r: number) {
    const angle = (i / axes) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  // Polygon for current data (avg/5 scale)
  const dataPoints = data.map((d, i) => point(i, R * (d.avg / 5)))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs">
        {/* Grid rings (1, 2, 3, 4, 5) */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
          const path = data.map((_, i) => {
            const p = point(i, R * scale)
            return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }).join(' ') + ' Z'
          return <path key={scale} d={path} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
        })}
        {/* Axis lines */}
        {data.map((_, i) => {
          const p = point(i, R)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5" />
        })}
        {/* Filled data polygon */}
        <path d={dataPath} fill="rgba(244, 63, 94, 0.18)" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f43f5e" />
        ))}
        {/* Axis labels */}
        {data.map((d, i) => {
          const p = point(i, R + 18)
          return (
            <text
              key={d.category} x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] fill-gray-600 font-semibold capitalize"
            >
              {d.category}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ── Mood × time-of-day Heatmap ─────────────────────────────────────────────────
function Heatmap({ data }: { data: { day: number; quarter: number; avg: number | null; count: number }[][] }) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const slotLabels = ['Morning', 'Afternoon', 'Evening', 'Night']

  function color(avg: number | null): string {
    if (avg == null) return 'bg-gray-50 border-gray-100'
    if (avg >= 4.5) return 'bg-emerald-400 border-emerald-500'
    if (avg >= 3.5) return 'bg-emerald-200 border-emerald-300'
    if (avg >= 2.5) return 'bg-amber-200 border-amber-300'
    if (avg >= 1.5) return 'bg-orange-300 border-orange-400'
    return 'bg-rose-400 border-rose-500'
  }

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr>
            <th className="w-10"></th>
            {slotLabels.map(s => <th key={s} className="text-gray-500 font-medium pb-1">{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, day) => (
            <tr key={day}>
              <td className="text-gray-500 font-semibold pr-1">{dayLabels[day]}</td>
              {row.map((cell, q) => (
                <td key={q} className="p-0.5">
                  <div
                    className={cn('h-7 rounded-md border flex items-center justify-center font-bold', color(cell.avg))}
                    title={cell.count ? `Avg ${cell.avg} · ${cell.count} entries` : 'No data'}
                  >
                    {cell.avg != null && <span className="text-white text-[9px] drop-shadow-sm">{cell.avg.toFixed(1)}</span>}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-400" />Low</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-200" />Mid</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" />High</span>
      </div>
    </div>
  )
}

// ── Tool Effectiveness row ─────────────────────────────────────────────────────
function ToolEffectivenessRow({ tool }: { tool: { tool_id: string; sessions: number; avg_drop: number; avg_pre: number; avg_post: number } }) {
  const dropPct = Math.min(100, Math.max(0, (tool.avg_drop / 4) * 100))
  return (
    <div className="rounded-xl bg-white/80 border border-white/60 p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-800 capitalize">{tool.tool_id.replace(/_|-/g, ' ')}</p>
        <span className={cn('text-xs font-bold', tool.avg_drop > 0 ? 'text-emerald-600' : 'text-gray-500')}>
          {tool.avg_drop > 0 ? `−${tool.avg_drop}` : `${tool.avg_drop}`} avg
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-1">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700" style={{ width: `${dropPct}%` }} />
      </div>
      <p className="text-[10px] text-gray-400">
        {tool.sessions} {tool.sessions === 1 ? 'session' : 'sessions'} · pre {tool.avg_pre} → post {tool.avg_post}
      </p>
    </div>
  )
}

function describeCorrelation(r: number): string {
  const a = Math.abs(r)
  const sign = r > 0 ? 'positive' : 'negative'
  if (a < 0.2) return 'no clear link'
  if (a < 0.4) return `weak ${sign} link`
  if (a < 0.6) return `moderate ${sign} link`
  if (a < 0.8) return `strong ${sign} link`
  return `very strong ${sign} link`
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
      <p className="text-sm font-bold text-gray-800">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, color, label, value, sub }: { icon: typeof Flame; color: string; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
      <Icon className={cn('h-4 w-4 mb-1', color)} />
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
      <p className="text-[9px] text-gray-300">{sub}</p>
    </div>
  )
}

function Mini({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={cn('text-xl font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6 text-xs text-gray-400">{message}</div>
  )
}

// ── Locked / free-tier view ────────────────────────────────────────────────────
function LockedView({ data }: { data: LockedAnalytics }) {
  const { mood, sleep, journal, gratitude } = data.preview.counts

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mind Analytics</h1>
        </div>
      </div>

      {/* Premium hero */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-white p-6 shadow-xl shadow-violet-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">Premium Feature</p>
            <h2 className="text-xl font-bold leading-tight">Unlock your patterns</h2>
            <p className="text-sm text-white/85 mt-1 leading-relaxed">
              Mood-vs-sleep correlation, weekday stress maps, recovery streaks, and AI-detected patterns from your last 30 days.
            </p>
          </div>
        </div>
        <Link
          href={data.upgrade_url}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-violet-700 text-sm font-bold hover:shadow-lg active:scale-95 transition-all"
        >
          <Crown className="h-4 w-4" />
          Upgrade to Pro · ₹299/mo
        </Link>
      </div>

      {/* Free-tier preview — what they have so far */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your last 7 days</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-xl font-bold text-violet-600">{mood}</p>
            <p className="text-[10px] text-gray-400">Mood logs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-600">{sleep}</p>
            <p className="text-[10px] text-gray-400">Sleep logs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-600">{journal}</p>
            <p className="text-[10px] text-gray-400">Journal</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">{gratitude}</p>
            <p className="text-[10px] text-gray-400">Gratitude</p>
          </div>
        </div>
      </div>

      {/* What's locked */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Premium unlocks</p>
        {[
          { label: 'AI pattern insights', desc: 'Personalised observations across your data' },
          { label: 'Mood ↔ Sleep correlation', desc: 'See how rest predicts your mood' },
          { label: 'Weekday stress map', desc: 'Find your most stressful day of the week' },
          { label: 'Recovery streaks', desc: 'Track your longest mood-positive runs' },
          { label: 'Unlimited Companion conversations', desc: 'Free is capped at 5 messages/day' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={data.upgrade_url}
        className="block text-center py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 active:scale-95 transition-all"
      >
        See all plans →
      </Link>
    </div>
  )
}
