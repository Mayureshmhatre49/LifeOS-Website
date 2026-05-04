'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Home, MessageCircle, CalendarDays, Wallet, Users,
  Shield, TrendingUp, Settings, LogOut,
  Bookmark, Brain, Sun, Heart, BarChart3, Crown, Map,
  Sparkles, Repeat, FolderLock, Contact, Briefcase, Plane,
  Building, Apple, Scale, Baby, GraduationCap, LineChart, Target, Wand2, Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type NavItem = { href: string; icon: typeof Home; label: string; exact?: boolean }

// Semantic icon mapping — every icon is unique and matches its function unambiguously
const NAV_GROUPS: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [
      { href: '/dashboard',            icon: Home,          label: 'Home',       exact: true },
      { href: '/today',                icon: Sun,           label: 'Today' },
      { href: '/chat',                 icon: MessageCircle, label: 'Chat' },
      { href: '/planner',              icon: CalendarDays,  label: 'Planner' },
    ],
  },
  {
    title: 'Life areas',
    items: [
      { href: '/money',                icon: Wallet,        label: 'Money' },
      { href: '/investments',          icon: LineChart,     label: 'Investments' },
      { href: '/family',               icon: Users,         label: 'Family' },
      { href: '/aura',                 icon: Baby,          label: 'AURA · Children' },
      { href: '/mind',                 icon: Heart,         label: 'Mental health' },
      { href: '/nutrition',            icon: Apple,         label: 'Nutrition' },
      { href: '/network',              icon: Contact,       label: 'Network' },
      { href: '/career',               icon: GraduationCap, label: 'Career' },
      { href: '/business',             icon: Briefcase,     label: 'Business' },
      { href: '/home',                 icon: Building,      label: 'Home & property' },
      { href: '/travel',               icon: Plane,         label: 'Travel' },
      { href: '/protection',           icon: Shield,        label: 'Protection' },
      { href: '/legal',                icon: Scale,         label: 'Legal' },
      { href: '/insights',             icon: BarChart3,     label: 'Insights' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { href: '/briefing',             icon: Sparkles,      label: 'Daily briefing' },
      { href: '/habits',               icon: Repeat,        label: 'Habits' },
      { href: '/vault',                icon: FolderLock,    label: 'Document vault' },
      { href: '/dashboard/decisions',  icon: Brain,         label: 'Decisions' },
      { href: '/dashboard/memory',     icon: Bookmark,      label: 'Memory' },
      { href: '/focus',                icon: Target,        label: 'Focus' },
      { href: '/community',            icon: Trophy,        label: 'Community' },
      { href: '/settings/personalisation', icon: Wand2,     label: 'Personalisation' },
    ],
  },
  {
    title: 'More',
    items: [
      { href: '/implementation',       icon: Map,           label: 'Roadmap' },
      { href: '/premium',              icon: Crown,         label: 'Premium' },
      { href: '/settings',             icon: Settings,      label: 'Settings' },
    ],
  },
]

function ScoreRing({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative h-12 w-12 flex-none">
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular text-[var(--color-text-primary)]">
        {score}
      </span>
    </div>
  )
}

export function LeftRail() {
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[var(--color-surface-raised)] border-r border-[var(--color-border-soft)]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-[56px] shrink-0 border-b border-[var(--color-border-soft)]">
        <div className="h-7 w-7 rounded-lg bg-[var(--color-gray-900)] flex items-center justify-center">
          <span className="text-white font-semibold text-[12px] leading-none tracking-tight">L</span>
        </div>
        <span className="font-semibold text-[14px] tracking-tight text-[var(--color-text-primary)]">Life OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 overflow-y-auto pb-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.title ?? `group-${gi}`} className={cn('space-y-px', gi > 0 && 'mt-5')}>
            {group.title && (
              <p className="px-3 mb-1.5 eyebrow">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-[var(--duration-fast)]',
                    active
                      ? 'bg-[var(--color-gray-100)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)]',
                  )}
                >
                  <item.icon
                    strokeWidth={1.75}
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]',
                    )}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Life Score — minimal */}
      <div className="mx-3 mb-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-gray-50)] p-3 shrink-0">
        <div className="flex items-center gap-3">
          <ScoreRing score={78} />
          <div className="flex-1 min-w-0">
            <p className="eyebrow">Life score</p>
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mt-0.5">Keep it up</p>
          </div>
        </div>
      </div>

      {/* User */}
      {session && (
        <div className="border-t border-[var(--color-border-soft)] px-2 py-2 shrink-0">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--color-gray-50)] transition-colors">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback className="text-[11px] bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] font-semibold">
                {session.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate leading-tight">
                {session.user?.name}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                Premium
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Sign out"
              className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-700)] hover:bg-[var(--color-danger-50)] transition-colors shrink-0"
            >
              <LogOut className="h-[14px] w-[14px]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
