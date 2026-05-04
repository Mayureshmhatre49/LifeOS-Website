'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, AlertTriangle, Wallet, Target, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'
import type { LucideIcon } from 'lucide-react'
import { BackgroundPickerButton } from '@/components/home/BackgroundPicker'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function fmtCurrency(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${n}`
}

type Stat = {
  Icon: LucideIcon
  value: string
  label: string
  hint: string
  tone?: 'neutral' | 'warning' | 'success'
}

/**
 * "Engaged" = the user has at least some baseline data. We hide the stat grid
 * for brand-new users (everything zero) because "0 priorities · On track" reads
 * lifeless instead of welcoming.
 */
function isEngaged(data: DashboardData): boolean {
  return (
    data.tasksDueToday > 0 ||
    data.tasksOverdue > 0 ||
    data.tasksCompletedToday > 0 ||
    (data.monthlySpend ?? 0) > 0 ||
    (data.focusScore ?? 0) > 0 ||
    (data.focusMinutesThisWeek ?? 0) > 0
  )
}

function buildStats(data: DashboardData): Stat[] {
  const priorities = data.tasksDueToday + data.tasksOverdue
  // Removed the duplicate "Decisions" stat (was just `tasksOverdue` again).
  // Removed the "Stress" stat for new users — derives from tasksOverdue, so
  // shows "Calm" misleadingly when user has no data at all.
  const stats: Stat[] = [
    {
      Icon: AlertTriangle,
      value: String(priorities || 0),
      label: 'Priorities',
      hint: data.tasksOverdue > 0 ? `${data.tasksOverdue} overdue` : `${data.tasksDueToday} today`,
      tone: data.tasksOverdue > 0 ? 'warning' : 'neutral',
    },
    {
      Icon: Wallet,
      value: fmtCurrency(data.monthlySpend || 0),
      label: 'This month',
      hint: data.monthlyBudget > 0
        ? `${Math.round((data.monthlySpend / data.monthlyBudget) * 100)}% of budget`
        : 'Set a budget',
      tone: data.monthlyBudget > 0 && data.monthlySpend / data.monthlyBudget >= 0.9
        ? 'warning'
        : 'neutral',
    },
    {
      Icon: TrendingUp,
      value: String(data.focusScore || 0),
      label: 'Focus score',
      hint: (data.focusScore || 0) >= 70 ? 'Improving' : (data.focusScore || 0) > 0 ? 'Build momentum' : 'No sessions yet',
      tone: (data.focusScore || 0) >= 70 ? 'success' : 'neutral',
    },
    {
      Icon: Target,
      value: String(data.tasksCompletedToday || 0),
      label: 'Done today',
      hint: data.tasksCompletedToday > 0 ? 'Keep going' : 'Mark your first',
    },
    {
      Icon: Activity,
      value: data.tasksOverdue <= 2 ? 'Calm' : data.tasksOverdue > 5 ? 'High' : 'Steady',
      label: 'Workload',
      hint: data.tasksOverdue <= 2 ? 'Healthy range' : 'Clear backlog',
    },
  ]
  return stats
}

const STARTER_STEPS = [
  { label: 'Add your first task',   href: '/planner' },
  { label: 'Set a monthly budget',  href: '/money' },
  { label: 'Try the chat',          href: '/chat' },
] as const

interface Props {
  data: DashboardData
  userImage?: string | null
}

export function GreetingHero({ data, userImage }: Props) {
  const { data: session } = useSession()
  const [hour, setHour] = useState(10)
  useEffect(() => setHour(new Date().getHours()), [])

  const greeting = getGreeting(hour)
  const stats = buildStats(data)
  const engaged = isEngaged(data)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[var(--color-text-tertiary)]">{today}</p>
          <h1 className="mt-0.5 truncate">
            {greeting}, {data.userName}.
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button className="hidden md:flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 h-9 text-[13px] text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)] transition-colors min-w-[200px]">
            <Search className="h-[14px] w-[14px] shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left">Search anything</span>
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-gray-50)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-tertiary)] shrink-0">⌘K</kbd>
          </button>

          <BackgroundPickerButton />

          <button className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)] transition-colors">
            <Bell className="h-[16px] w-[16px]" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-600)] ring-2 ring-[var(--color-surface-raised)]" />
          </button>

          <Avatar className="h-9 w-9">
            <AvatarImage src={userImage ?? session?.user?.image ?? undefined} />
            <AvatarFallback className="text-[12px] bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] font-semibold">
              {data.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats grid for engaged users; starter checklist for first-time users */}
      {engaged ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
          {stats.map((s, i) => (
            <StatCard key={i} stat={s} hidden={i >= 3 ? 'xl' : undefined} />
          ))}
        </div>
      ) : (
        <StarterChecklist />
      )}
    </div>
  )
}

function StarterChecklist() {
  return (
    <div className="card p-5">
      <p className="eyebrow mb-3">Get started</p>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-4">
        Three quick steps to make Life OS yours.
      </p>
      <ol className="space-y-2.5">
        {STARTER_STEPS.map((step, i) => (
          <li key={step.href}>
            <a
              href={step.href}
              className="group flex items-center gap-3 rounded-md px-2 py-2 -mx-2 hover:bg-[var(--color-gray-50)] transition-colors"
            >
              <span className="h-6 w-6 rounded-full bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] text-[12px] font-semibold flex items-center justify-center shrink-0 tabular">
                {i + 1}
              </span>
              <span className="flex-1 text-[14px] font-medium text-[var(--color-text-primary)]">{step.label}</span>
              <ArrowUpRight className="h-[14px] w-[14px] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors" strokeWidth={1.75} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StatCard({ stat, hidden }: { stat: Stat; hidden?: 'xl' }) {
  const toneColor = stat.tone === 'warning'
    ? 'text-[var(--color-warning-700)]'
    : stat.tone === 'success'
      ? 'text-[var(--color-success-700)]'
      : 'text-[var(--color-text-tertiary)]'

  return (
    <div
      className={cn(
        'card-interactive p-4 group',
        hidden === 'xl' && 'hidden xl:block',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <stat.Icon className={cn('h-[16px] w-[16px]', toneColor)} strokeWidth={1.75} />
        <ArrowUpRight className="h-[14px] w-[14px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
      </div>
      <p className="text-[20px] font-semibold tabular tracking-tight text-[var(--color-text-primary)] leading-none">
        {stat.value}
      </p>
      <p className="text-[13px] font-medium text-[var(--color-text-secondary)] mt-1.5">{stat.label}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{stat.hint}</p>
    </div>
  )
}
