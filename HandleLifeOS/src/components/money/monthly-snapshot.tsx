'use client'

import type { MonthlySnapshot } from '@/types/money'
import { EXPENSE_CATEGORY_LABELS } from '@/types/money'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface Props {
  snapshot: MonthlySnapshot
  month: number
  year: number
}

export function MonthlySnapshot({ snapshot, month, year }: Props) {
  const { budget, total_expenses, money_left, savings_progress, biggest_category } = snapshot
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })
  const currency = budget?.currency ?? 'INR'

  const spendPct = budget ? Math.min(100, Math.round((total_expenses / (budget.monthly_income - budget.savings_target)) * 100)) : 0
  const savingsPct = budget?.savings_target ? Math.min(100, Math.round((savings_progress / budget.savings_target) * 100)) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Money left */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Free cash</span>
        </div>
        <p className={cn('text-2xl font-bold', money_left >= 0 ? 'text-gray-900' : 'text-red-600')}>
          {fmt(money_left, currency)}
        </p>
        <p className="text-xs text-gray-400 mt-1">{monthName}</p>
      </div>

      {/* Spent */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Spent</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{fmt(total_expenses, currency)}</p>
        {budget && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', spendPct > 90 ? 'bg-red-400' : spendPct > 70 ? 'bg-orange-400' : 'bg-green-400')}
                style={{ width: `${spendPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{spendPct}% of budget</p>
          </div>
        )}
      </div>

      {/* Biggest category */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-pink-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top spend</span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {biggest_category ? EXPENSE_CATEGORY_LABELS[biggest_category] : '—'}
        </p>
        {snapshot.expense_summary && biggest_category && (
          <p className="text-xs text-gray-400 mt-1">
            {fmt(snapshot.expense_summary.by_category[biggest_category] ?? 0, currency)}
          </p>
        )}
      </div>

      {/* Savings */}
      <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Savings</span>
        </div>
        <p className="text-xl font-bold text-gray-900">{fmt(savings_progress, currency)}</p>
        {budget?.savings_target ? (
          <div className="mt-2">
            <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${savingsPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{savingsPct}% of goal</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">No target set</p>
        )}
      </div>
    </div>
  )
}
