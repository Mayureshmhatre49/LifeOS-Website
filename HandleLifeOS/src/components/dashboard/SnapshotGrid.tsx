import Link from 'next/link'
import {
  CheckSquare,
  Wallet,
  Timer,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}k`
  return `${symbol}${Math.round(amount).toLocaleString()}`
}

interface CardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  sub: string
  badge?: { label: string; variant: 'danger' | 'warning' | 'success' | 'info' }
  href: string
  cta?: string
}

const BADGE_COLORS = {
  danger:  'bg-red-50 text-red-600 border-red-100',
  warning: 'bg-orange-50 text-orange-600 border-orange-100',
  success: 'bg-green-50 text-green-600 border-green-100',
  info:    'bg-indigo-50 text-indigo-600 border-indigo-100',
}

function SnapshotCard({ icon, iconBg, title, value, sub, badge, href, cta }: CardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl p-2.5', iconBg)}>
          {icon}
        </div>
        {badge && (
          <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', BADGE_COLORS[badge.variant])}>
            {badge.label}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{sub}</p>
      </div>

      <div className="flex items-center gap-1 text-xs font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
        {cta ?? 'View details'}
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  )
}

interface Props {
  data: DashboardData
}

export function SnapshotGrid({ data }: Props) {
  const spendPct = data.monthlyBudget > 0
    ? Math.round((data.monthlySpend / data.monthlyBudget) * 100)
    : 0

  const budgetBadge = spendPct >= 90
    ? { label: `${spendPct}% used`, variant: 'danger' as const }
    : spendPct >= 75
    ? { label: `${spendPct}% used`, variant: 'warning' as const }
    : spendPct > 0
    ? { label: `${spendPct}% used`, variant: 'info' as const }
    : undefined

  const taskBadge = data.tasksOverdue > 0
    ? { label: `${data.tasksOverdue} overdue`, variant: 'danger' as const }
    : data.tasksDueToday > 0
    ? { label: `${data.tasksDueToday} due`, variant: 'info' as const }
    : { label: 'All clear', variant: 'success' as const }

  const focusLabel = data.focusScore >= 70
    ? { label: 'On track', variant: 'success' as const }
    : data.focusScore >= 40
    ? { label: 'Building', variant: 'info' as const }
    : { label: 'Start today', variant: 'warning' as const }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Tasks */}
      <SnapshotCard
        icon={<CheckSquare className="h-4 w-4 text-indigo-600" />}
        iconBg="bg-indigo-50"
        title="Tasks today"
        value={data.tasksDueToday + data.tasksCompletedToday}
        sub={`${data.tasksCompletedToday} done · ${data.tasksOverdue} overdue`}
        badge={taskBadge}
        href="/planner"
        cta="Open planner"
      />

      {/* Money */}
      <SnapshotCard
        icon={<Wallet className="h-4 w-4 text-emerald-600" />}
        iconBg="bg-emerald-50"
        title="Spent this month"
        value={formatCurrency(data.monthlySpend, data.currency)}
        sub={data.monthlyBudget > 0
          ? `Budget: ${formatCurrency(data.monthlyBudget, data.currency)}`
          : 'No budget set yet'}
        badge={budgetBadge}
        href="/money"
        cta="View finances"
      />

      {/* Focus */}
      <SnapshotCard
        icon={<Timer className="h-4 w-4 text-violet-600" />}
        iconBg="bg-violet-50"
        title="Focus this week"
        value={`${data.focusMinutesThisWeek}m`}
        sub={`${data.focusSessionsThisWeek} session${data.focusSessionsThisWeek !== 1 ? 's' : ''} · ${data.focusScore}% focus score`}
        badge={focusLabel}
        href="/focus"
        cta="Start session"
      />

      {/* Family */}
      {data.hasFamilyMode ? (
        <SnapshotCard
          icon={<Users className="h-4 w-4 text-pink-600" />}
          iconBg="bg-pink-50"
          title="Family"
          value={data.familyPendingTasks}
          sub="shared tasks pending"
          badge={data.familyPendingTasks > 0
            ? { label: 'Needs attention', variant: 'warning' }
            : { label: 'All done', variant: 'success' }}
          href="/family"
          cta="Family board"
        />
      ) : (
        <SnapshotCard
          icon={<Users className="h-4 w-4 text-pink-600" />}
          iconBg="bg-pink-50"
          title="Family mode"
          value="Set up"
          sub="Share tasks, grocery & calendar"
          href="/family"
          cta="Get started"
        />
      )}

      {/* Routines */}
      <SnapshotCard
        icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
        iconBg="bg-amber-50"
        title="Routines"
        value={data.activeRoutinesCount}
        sub={data.activeRoutinesCount > 0
          ? `active routine${data.activeRoutinesCount !== 1 ? 's' : ''}`
          : 'No routines yet — build a habit'}
        badge={data.activeRoutinesCount > 0
          ? { label: 'Active', variant: 'success' }
          : undefined}
        href="/planner/routines"
        cta="View routines"
      />

      {/* Overdue / Alert card */}
      <SnapshotCard
        icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
        iconBg="bg-orange-50"
        title="Needs attention"
        value={data.tasksOverdue + (data.familyPendingTasks > 0 ? 1 : 0)}
        sub={[
          data.tasksOverdue > 0 ? `${data.tasksOverdue} overdue task${data.tasksOverdue > 1 ? 's' : ''}` : '',
          data.familyPendingTasks > 0 ? `${data.familyPendingTasks} family task${data.familyPendingTasks > 1 ? 's' : ''}` : '',
        ].filter(Boolean).join(' · ') || 'Nothing urgent right now'}
        badge={data.tasksOverdue > 0
          ? { label: 'Action needed', variant: 'warning' }
          : { label: 'All good', variant: 'success' }}
        href="/planner/tasks"
        cta="Clear backlog"
      />
    </div>
  )
}
