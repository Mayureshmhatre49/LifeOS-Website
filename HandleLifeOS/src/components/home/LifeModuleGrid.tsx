import Link from 'next/link'
import { CalendarDays, Wallet, Users, Brain, TrendingUp, FolderLock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'
import type { LucideIcon } from 'lucide-react'

interface ModuleCard {
  Icon: LucideIcon
  label: string
  href: string
  stat: string
  hint: string
  progress?: number
}

function buildModules(data: DashboardData): ModuleCard[] {
  const totalToday = data.tasksDueToday + data.tasksCompletedToday
  const pct = totalToday > 0 ? Math.round((data.tasksCompletedToday / totalToday) * 100) : 0
  const budgetPct = data.monthlyBudget > 0
    ? Math.min(100, Math.round((data.monthlySpend / data.monthlyBudget) * 100))
    : 0
  const focusPct = Math.min(100, Math.round(((data.focusScore || 0) / 100) * 100))

  const fmt = (n: number) =>
    n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L` : n >= 1_000 ? `₹${(n / 1_000).toFixed(0)}k` : `₹${n}`

  return [
    {
      Icon: CalendarDays,
      label: 'My day',
      href: '/planner',
      stat: `${data.tasksDueToday} task${data.tasksDueToday !== 1 ? 's' : ''} remaining`,
      hint: data.tasksCompletedToday > 0 ? `${data.tasksCompletedToday} completed today` : '1 event today',
      progress: pct,
    },
    {
      Icon: Wallet,
      label: 'Money',
      href: '/money',
      stat: `${fmt(data.upcomingBills)} due`,
      hint: data.monthlyBudget > 0 ? '2 bills pending' : 'No budget set',
      progress: budgetPct,
    },
    {
      Icon: Users,
      label: 'Family',
      href: '/family',
      stat: data.hasFamilyMode
        ? `${data.familyPendingTasks} reminder${data.familyPendingTasks !== 1 ? 's' : ''} tomorrow`
        : 'Set up family mode',
      hint: data.hasFamilyMode ? '3 shared tasks' : 'Share & collaborate',
    },
    {
      Icon: Brain,
      label: 'Decisions',
      href: '/dashboard/decisions',
      stat: `${Math.max(data.tasksOverdue, 0)} pending`,
      hint: 'Get AI recommendations',
    },
    {
      Icon: TrendingUp,
      label: 'Focus',
      href: '/focus',
      stat: `Score ${data.focusScore}`,
      hint: (data.focusScore ?? 0) > 50 ? 'Keep improving' : 'Start a session',
      progress: focusPct,
    },
    {
      Icon: FolderLock,
      label: 'Vault',
      href: '/vault',
      stat: '12 documents',
      hint: 'Secure & private',
    },
  ]
}

function ModCard({ mod }: { mod: ModuleCard }) {
  return (
    <Link
      href={mod.href}
      className="card-interactive p-4 group flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-[var(--color-gray-100)] flex items-center justify-center">
          <mod.Icon className="h-[16px] w-[16px] text-[var(--color-text-secondary)]" strokeWidth={1.75} />
        </div>
        <ArrowRight className="h-[14px] w-[14px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.75} />
      </div>

      <div className="flex-1 space-y-0.5">
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-tight">{mod.label}</p>
        <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">{mod.stat}</p>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">{mod.hint}</p>
      </div>

      {mod.progress !== undefined && (
        <div className="h-1 w-full rounded-full bg-[var(--color-gray-100)] overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              mod.progress > 90 ? 'bg-[var(--color-warning-500)]' : 'bg-[var(--color-text-primary)]',
            )}
            style={{ width: `${mod.progress}%` }}
          />
        </div>
      )}
    </Link>
  )
}

export function LifeModuleGrid({ data }: { data: DashboardData }) {
  const modules = buildModules(data)
  return (
    <div className="space-y-3">
      <h2 className="eyebrow">Your life at a glance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {modules.map((mod) => (
          <ModCard key={mod.label} mod={mod} />
        ))}
      </div>
    </div>
  )
}
