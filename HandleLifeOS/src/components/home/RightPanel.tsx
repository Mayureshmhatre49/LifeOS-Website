import Link from 'next/link'
import { ArrowRight, CalendarDays, Wallet, Users, ShoppingCart, Stethoscope, GraduationCap, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'

function fmt(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${n}`
}

function fmtIndian(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtTime(time: string | undefined | null): string {
  if (!time) return '--:--'
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m} ${ampm}`
}

function PanelHeader({ Icon, title, href, action = 'View all' }: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  href: string
  action?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-[14px] w-[14px] text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] tracking-tight">{title}</h3>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        {action}
        <ArrowRight className="h-[10px] w-[10px]" strokeWidth={2} />
      </Link>
    </div>
  )
}

function TodayPlan({ data }: { data: DashboardData }) {
  const items = data.timeline.slice(0, 4)

  return (
    <section>
      <PanelHeader Icon={CalendarDays} title="Today's plan" href="/planner" action="Calendar" />

      {items.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-tertiary)] py-6 text-center">No events scheduled today</p>
      ) : (
        <div className="space-y-px">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-[var(--color-gray-50)] transition-colors group"
            >
              <span className="w-[52px] text-[11px] tabular text-[var(--color-text-tertiary)] font-medium shrink-0">
                {fmtTime(item.time)}
              </span>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                item.done ? 'bg-[var(--color-gray-300)]' : 'bg-[var(--color-text-primary)]',
              )} />
              <span className={cn(
                'flex-1 text-[12px] font-medium truncate',
                item.done ? 'text-[var(--color-text-disabled)] line-through' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]',
              )}>
                {item.title}
              </span>
              {item.badge && (
                <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0 whitespace-nowrap">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function MoneyOverview({ data }: { data: DashboardData }) {
  const weekExpenses = data.trends.expenses
  const maxExp = Math.max(...weekExpenses, 1)
  const points = weekExpenses.map((v, i) => {
    const x = (i / Math.max(weekExpenses.length - 1, 1)) * 100
    const y = 100 - (v / maxExp) * 80
    return `${x},${y}`
  })

  const rows = [
    { label: 'Upcoming bills',  value: fmt(data.upcomingBills) },
    { label: 'EMIs due',        value: fmt(data.emisDue) },
    { label: 'Saved this month',value: fmt(data.monthlySavings), positive: true },
  ]

  return (
    <section>
      <PanelHeader Icon={Wallet} title="Money" href="/money" />

      <div className="card p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-medium">Total balance</p>
            <p className="text-[22px] font-semibold tabular tracking-tight text-[var(--color-text-primary)] leading-tight mt-0.5">
              {fmtIndian(data.totalBalance)}
            </p>
            <p className="text-[11px] text-[var(--color-success-700)] font-medium mt-0.5">
              +8.5%
              <span className="text-[var(--color-text-tertiary)] font-normal ml-1">vs last month</span>
            </p>
          </div>

          {weekExpenses.length > 1 && (
            <svg viewBox="0 0 100 100" className="h-10 w-16 shrink-0" preserveAspectRatio="none">
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke="var(--color-text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>

        <div className="space-y-1.5 pt-3 border-t border-[var(--color-border-soft)]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--color-text-tertiary)]">{row.label}</span>
              <span className={cn(
                'text-[12px] font-semibold tabular',
                row.positive ? 'text-[var(--color-success-700)]' : 'text-[var(--color-text-primary)]',
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAMILY_ITEMS = [
  { name: "Tanish's school review", time: 'Tomorrow, 10:00 AM', Icon: GraduationCap },
  { name: 'Grocery shopping',       time: 'Due in 2 days',      Icon: ShoppingCart },
  { name: 'Doctor appointment',     time: 'May 18, 4:00 PM',    Icon: Stethoscope },
]

function FamilyHub({ data }: { data: DashboardData }) {
  if (!data.hasFamilyMode) return null

  return (
    <section>
      <PanelHeader Icon={Users} title="Family hub" href="/family" />
      <div className="space-y-px">
        {FAMILY_ITEMS.map((item) => (
          <button
            key={item.name}
            className="w-full flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[var(--color-gray-50)] transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-[var(--color-gray-100)] flex items-center justify-center shrink-0">
              <item.Icon className="h-[14px] w-[14px] text-[var(--color-text-secondary)]" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{item.name}</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.time}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export function RightPanel({ data }: { data: DashboardData }) {
  return (
    <div className="flex flex-col px-5 py-5 gap-5 w-full">
      <TodayPlan data={data} />
      <hr className="hr" />
      <MoneyOverview data={data} />
      {data.hasFamilyMode && (
        <>
          <hr className="hr" />
          <FamilyHub data={data} />
        </>
      )}
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-tertiary)] font-medium mt-auto pt-2">
        <Lock className="h-[10px] w-[10px]" strokeWidth={1.75} />
        <span>Private by design</span>
      </div>
    </div>
  )
}
