'use client'

import { useEffect, useState, useCallback } from 'react'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import { BudgetSetup } from '@/components/money/budget-setup'
import { BudgetGrid } from '@/components/money/BudgetGrid'
import { BarChart3 } from 'lucide-react'
import type { Budget, ExpenseSummary } from '@/types/money'

function fmt(n: number, cur: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n) }
  catch { return `${cur} ${n.toLocaleString()}` }
}

export default function BudgetsPage() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expSummary, setExpSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const load = useCallback(async () => {
    const [budRes, expRes] = await Promise.all([
      fetch(`/api/money/budget?month=${month}&year=${year}`),
      fetch(`/api/money/expenses?month=${month}&year=${year}`),
    ])
    const budData = await budRes.json()
    const expData = await expRes.json()

    setBudget(budData ?? null)

    // compute summary from raw expenses
    if (Array.isArray(expData)) {
      const by_category: Record<string, number> = {}
      let total = 0
      for (const e of expData) {
        total += Number(e.amount)
        by_category[e.category] = (by_category[e.category] ?? 0) + Number(e.amount)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setExpSummary({ total, by_category: by_category as any, currency: expData[0]?.currency ?? 'INR', month, year })
    }
    setLoading(false)
  }, [month, year])

  useEffect(() => { load() }, [load])

  async function handleSave(data: { month: number; year: number; monthly_income: number; savings_target: number; currency: string }) {
    await fetch('/api/money/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await load()
  }

  const spent   = expSummary?.total ?? 0
  const income  = budget?.monthly_income ?? 0
  const savings = budget?.savings_target ?? 0
  const usable  = income - savings
  const pct     = usable > 0 ? Math.min(100, Math.round((spent / usable) * 100)) : 0
  const monthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const currency = expSummary?.currency ?? budget?.currency ?? 'USD'

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Budgets</h1>
      </div>

      <MoneyNavBar />

      {/* Monthly overview */}
      {budget && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800">{monthName}</p>
            <span className={`text-sm font-black ${pct >= 90 ? 'text-rose-600' : pct >= 75 ? 'text-amber-600' : 'text-indigo-600'}`}>
              {pct}% used
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-black text-gray-900">{fmt(income, currency)}</p>
              <p className="text-[10px] text-gray-400">Income</p>
            </div>
            <div>
              <p className="text-base font-black text-rose-600">{fmt(spent, currency)}</p>
              <p className="text-[10px] text-gray-400">Spent</p>
            </div>
            <div>
              <p className="text-base font-black text-emerald-600">{fmt(Math.max(0, usable - spent), currency)}</p>
              <p className="text-[10px] text-gray-400">Remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget setup */}
      {!loading && (
        <BudgetSetup
          budget={budget}
          month={month}
          year={year}
          onSave={handleSave}
        />
      )}

      {/* Category budgets */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category Limits</p>
        <BudgetGrid expenseSummary={expSummary} monthlyBudget={usable} />
      </div>
    </div>
  )
}
