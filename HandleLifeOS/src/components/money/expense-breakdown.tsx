'use client'

import type { ExpenseSummary, ExpenseCategory } from '@/types/money'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from '@/types/money'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface Props {
  summary: ExpenseSummary
}

export function ExpenseBreakdown({ summary }: Props) {
  const sorted = Object.entries(summary.by_category)
    .sort(([, a], [, b]) => b - a)
    .filter(([, v]) => v > 0) as [ExpenseCategory, number][]

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">No expenses recorded this month</p>
      </div>
    )
  }

  const max = sorted[0][1]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Spending breakdown</h3>
      <ul className="space-y-2.5" aria-label="Expense breakdown by category">
        {sorted.map(([cat, amount]) => {
          const pct = Math.round((amount / summary.total) * 100)
          const barPct = Math.round((amount / max) * 100)
          const color = EXPENSE_CATEGORY_COLORS[cat]
          return (
            <li key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{EXPENSE_CATEGORY_LABELS[cat]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-medium text-gray-900">{fmt(amount, summary.currency)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" role="presentation">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barPct}%`, backgroundColor: color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <div className="pt-2 border-t border-gray-50 flex justify-between">
        <span className="text-sm text-gray-500">Total</span>
        <span className="text-sm font-semibold text-gray-900">{fmt(summary.total, summary.currency)}</span>
      </div>
    </div>
  )
}
