import Link from 'next/link'
import { Sparkles, ArrowRight, TrendingUp, Clock, Target, ShieldCheck, Users, Bot } from 'lucide-react'
import type { DashboardData } from '@/lib/dashboard/getDashboardData'
import type { LucideIcon } from 'lucide-react'

type CardTone = 'positive' | 'attention' | 'neutral'

interface FeedCard {
  id: string
  Icon: LucideIcon
  title: string
  body: string
  cta: string
  href: string
  tone: CardTone
}

function buildCards(data: DashboardData): FeedCard[] {
  const cards: FeedCard[] = []

  if (data.monthlyBudget > 0 && data.monthlySpend < data.monthlyBudget) {
    const headroom = data.monthlyBudget - data.monthlySpend
    const fmt = headroom >= 100_000
      ? `₹${(headroom / 100_000).toFixed(1)}L`
      : `₹${headroom.toLocaleString('en-IN')}`
    cards.push({
      id: 'money-save',
      Icon: TrendingUp,
      title: `${fmt} headroom this month`,
      body: 'Review dining and subscription spend with these actions',
      cta: 'See recommendations',
      href: '/money',
      tone: 'positive',
    })
  }

  if (data.tasksOverdue > 0) {
    cards.push({
      id: 'overdue',
      Icon: Clock,
      title: `${data.tasksOverdue} task${data.tasksOverdue > 1 ? 's' : ''} overdue`,
      body: 'Reschedule or complete them now to stay on track',
      cta: 'Review now',
      href: '/planner',
      tone: 'attention',
    })
  }

  const idealFocusToday = 45
  const doneToday = Math.round(data.focusMinutesThisWeek / 7)
  if (doneToday < idealFocusToday) {
    cards.push({
      id: 'focus-block',
      Icon: Target,
      title: `${idealFocusToday - doneToday} min focus block today`,
      body: 'Boost your focus score with a dedicated session',
      cta: 'Start session',
      href: '/focus',
      tone: 'neutral',
    })
  }

  cards.push({
    id: 'security',
    Icon: ShieldCheck,
    title: 'Scam patterns rising',
    body: 'New fraud trends in your area — stay protected',
    cta: 'Open Protection',
    href: '/protection',
    tone: 'attention',
  })

  if (data.hasFamilyMode && data.familyPendingTasks > 0) {
    cards.push({
      id: 'family',
      Icon: Users,
      title: 'Family task pending',
      body: `${data.familyPendingTasks} shared task${data.familyPendingTasks > 1 ? 's' : ''} need your attention`,
      cta: 'View details',
      href: '/family',
      tone: 'neutral',
    })
  }

  for (const insight of data.insights) {
    if (cards.length >= 6) break
    const tone: CardTone =
      insight.type === 'positive' ? 'positive' : insight.type === 'warning' ? 'attention' : 'neutral'
    cards.push({
      id: insight.id,
      Icon: Sparkles,
      title: insight.message.slice(0, 60),
      body: insight.message,
      cta: insight.href ? 'View' : 'Explore',
      href: insight.href ?? '/dashboard',
      tone,
    })
  }

  if (cards.length < 4) {
    cards.push({
      id: 'ai-assistant',
      Icon: Bot,
      title: 'Ask your AI anything',
      body: 'Get personalised advice for any life decision',
      cta: 'Start chatting',
      href: '/chat',
      tone: 'neutral',
    })
  }

  return cards.slice(0, 6)
}

export function AIFeed({ data }: { data: DashboardData }) {
  const cards = buildCards(data)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-[14px] w-[14px] text-[var(--color-brand-600)]" strokeWidth={1.75} />
          <h2 className="eyebrow">For you</h2>
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          See all
          <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2} />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {cards.map((card) => (
          <FeedCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

function FeedCardItem({ card }: { card: FeedCard }) {
  const dotColor =
    card.tone === 'positive'  ? 'bg-[var(--color-success-500)]' :
    card.tone === 'attention' ? 'bg-[var(--color-warning-500)]' :
                                 'bg-[var(--color-text-tertiary)]'

  return (
    <Link
      href={card.href}
      className="card-interactive flex-none w-[220px] p-3.5 flex flex-col gap-2.5 group"
    >
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-lg bg-[var(--color-gray-100)] flex items-center justify-center">
          <card.Icon className="h-[15px] w-[15px] text-[var(--color-text-secondary)]" strokeWidth={1.75} />
        </div>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      </div>

      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2">{card.title}</p>
        <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed mt-1 line-clamp-2">{card.body}</p>
      </div>

      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
        {card.cta}
        <ArrowRight className="h-[11px] w-[11px]" strokeWidth={2} />
      </span>
    </Link>
  )
}
