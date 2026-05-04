'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Target, BarChart3, CreditCard, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/money',              icon: LayoutDashboard, label: 'Overview',     exact: true },
  { href: '/money/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { href: '/money/budgets',      icon: BarChart3,       label: 'Budgets' },
  { href: '/money/goals',        icon: Target,          label: 'Goals' },
  { href: '/money/liabilities',  icon: CreditCard,      label: 'Liabilities' },
  { href: '/money/reports',      icon: Receipt,         label: 'Reports' },
]

export function MoneyNavBar() {
  const pathname = usePathname()

  function isActive(tab: (typeof TABS)[0]) {
    if (tab.exact) return pathname === tab.href
    return pathname === tab.href || pathname.startsWith(tab.href + '/')
  }

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
      {TABS.map(tab => {
        const active = isActive(tab)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex-none flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap',
              active
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'text-gray-500 bg-white/80 border border-white/60 hover:bg-gray-50 hover:text-gray-800',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
