import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Sparkles, TrendingUp, TrendingDown, Brain, Wallet,
  Clock, Heart, ArrowRight, Flame, Target, Zap,
  BarChart3, CalendarCheck, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Insights — HandleLife OS',
  description: 'AI-powered patterns and analytics across your life.',
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const WEEKLY_TASKS = [5, 8, 3, 9, 6, 4, 7]
const WEEKLY_FOCUS  = [45, 90, 20, 120, 75, 30, 60]
const WEEKLY_MOOD   = [3, 4, 2, 5, 4, 3, 4]
const WEEKLY_SPEND  = [3200, 5800, 2100, 4500, 8200, 12000, 6800]
const DAYS          = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const KEY_STATS = [
  { id: 's1', label: 'Productivity',  value: '78%',  delta: '+6%',  up: true,  color: 'text-indigo-600',  bg: 'bg-indigo-50',  icon: Target  },
  { id: 's2', label: 'Mood Avg',      value: '3.7',  delta: '+0.4', up: true,  color: 'text-violet-600',  bg: 'bg-violet-50',  icon: Heart   },
  { id: 's3', label: 'Focus hrs',     value: '7.3h', delta: '+1.2', up: true,  color: 'text-sky-600',     bg: 'bg-sky-50',     icon: Clock   },
  { id: 's4', label: 'Savings rate',  value: '17%',  delta: '-2%',  up: false, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wallet  },
]

const AI_PATTERNS = [
  {
    id: 'p1',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    title: 'Peak focus: Tues & Thurs mornings',
    body: 'You complete 2.4× more tasks before noon on these days. Consider scheduling deep work here.',
    href: '/planner',
    cta: 'Plan your week',
  },
  {
    id: 'p2',
    icon: AlertTriangle,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    title: 'Weekend spending spikes +68%',
    body: 'Big spending spike last Saturday. Setting a daily cap could significantly cut monthly costs.',
    href: '/money',
    cta: 'Set a weekend budget',
  },
  {
    id: 'p3',
    icon: Brain,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    title: 'Mood drops on low-sleep nights',
    body: 'Days after less than 6 hours of sleep average a mood score of 2.1 vs 4.3 on rested days.',
    href: '/mind',
    cta: 'View sleep log',
  },
  {
    id: 'p4',
    icon: CalendarCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    title: 'Task streak: 7 days strong',
    body: "You've completed at least 1 task every day this week — your longest streak this month.",
    href: '/planner',
    cta: 'Keep it going',
  },
]

const LIFE_SCORE_AREAS = [
  { label: 'Work', score: 76, color: 'bg-indigo-500' },
  { label: 'Health', score: 62, color: 'bg-rose-400' },
  { label: 'Finance', score: 55, color: 'bg-emerald-500' },
  { label: 'Family', score: 88, color: 'bg-amber-400' },
  { label: 'Mind', score: 70, color: 'bg-violet-500' },
]

// Mini sparkline bars
function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-sm opacity-80', color)}
          style={{ height: `${(v / max) * 32}px` }}
        />
      ))}
    </div>
  )
}

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const overallScore = Math.round(
    LIFE_SCORE_AREAS.reduce((s, a) => s + a.score, 0) / LIFE_SCORE_AREAS.length
  )

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Insights</h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">AI-powered patterns across your life</p>
      </div>

      {/* Life Score */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 shadow-lg shadow-indigo-200/50 text-white fade-in fade-in-delay-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Life Score</p>
            <p className="text-4xl font-black">{overallScore}<span className="text-xl font-bold text-white/60">/100</span></p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          {LIFE_SCORE_AREAS.map(area => (
            <div key={area.label} className="flex items-center gap-3">
              <span className="w-14 text-[11px] font-semibold text-white/80">{area.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-700"
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <span className="w-8 text-[11px] font-bold text-white/80 text-right">{area.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2 fade-in fade-in-delay-1">
        {KEY_STATS.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', stat.color)} />
                </div>
                <span className={cn(
                  'text-[10px] font-bold flex items-center gap-0.5',
                  stat.up ? 'text-emerald-600' : 'text-rose-500',
                )}>
                  {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.delta}
                </span>
              </div>
              <p className={cn('text-xl font-black', stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* AI Patterns */}
      <div className="fade-in fade-in-delay-2">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Patterns Detected</p>
        </div>
        <div className="space-y-2">
          {AI_PATTERNS.map(p => {
            const Icon = p.icon
            return (
              <div key={p.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', p.bg)}>
                    <Icon className={cn('h-4 w-4', p.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.body}</p>
                    <Link
                      href={p.href}
                      className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {p.cta} <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly charts */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 fade-in fade-in-delay-3">
        <p className="text-sm font-bold text-gray-800 mb-4">This Week</p>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Tasks Completed</span>
              <span className="text-[11px] font-bold text-indigo-600">42 total</span>
            </div>
            <MiniBar values={WEEKLY_TASKS} color="bg-indigo-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Focus Minutes</span>
              <span className="text-[11px] font-bold text-sky-600">440 min</span>
            </div>
            <MiniBar values={WEEKLY_FOCUS} color="bg-sky-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Mood Scores</span>
              <span className="text-[11px] font-bold text-violet-600">avg 3.7</span>
            </div>
            <MiniBar values={WEEKLY_MOOD} color="bg-violet-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Daily Spend</span>
              <span className="text-[11px] font-bold text-emerald-600">42,600 total</span>
            </div>
            <MiniBar values={WEEKLY_SPEND} color="bg-emerald-400" />
          </div>
          <div className="flex justify-between pt-1">
            {DAYS.map(d => (
              <span key={d} className="flex-1 text-center text-[9px] text-gray-400 font-medium">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Ask AI */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4 fade-in fade-in-delay-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Dig Deeper</p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Ask AI to explain any pattern, suggest improvements, or forecast where your trends are heading.
        </p>
        <Link
          href="/chat?prompt=Analyze my life patterns and give me the top 3 changes I should make this month"
          className="mt-3 flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white w-fit hover:bg-violet-700 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" /> Get AI analysis
        </Link>
      </div>
    </div>
  )
}
