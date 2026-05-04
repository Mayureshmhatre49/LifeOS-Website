'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface MonthData {
  month: string
  income: number
  expenses: number
  savings: number
}

interface Transaction {
  id: string
  type?: 'income' | 'expense' | string
  amount: number
  expense_date?: string | null
  date?: string | null
  occurred_at?: string | null
}

function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${n}`
}

function transactionDate(t: Transaction): Date | null {
  const raw = t.expense_date ?? t.date ?? t.occurred_at
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Build 6-month cashflow series from real transactions.
 * Income / expense / savings columns derived from a `type` field if present
 * (transactions API returns type for some sources); otherwise treats positive
 * amounts as expenses (matches the `expenses` table semantics).
 */
function buildSeries(txs: Transaction[], monthlyIncomeFallback: number): MonthData[] {
  const now = new Date()
  const months: MonthData[] = []

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })

    let income = 0
    let expenses = 0
    for (const t of txs) {
      const d = transactionDate(t)
      if (!d || d < start || d >= end) continue
      const amt = Number(t.amount) || 0
      if (t.type === 'income') income += amt
      else expenses += amt
    }

    // Fall back to budgeted income if user hasn't logged income transactions
    if (income === 0 && monthlyIncomeFallback > 0) income = monthlyIncomeFallback

    months.push({
      month: label,
      income,
      expenses,
      savings: Math.max(0, income - expenses),
    })
  }
  return months
}

export function CashflowChart() {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [txRes, nwRes] = await Promise.all([
          fetch('/api/money/transactions?limit=1000'),
          fetch('/api/money/networth'),
        ])
        const txJson = await txRes.json().catch(() => ({}))
        const nwJson = await nwRes.json().catch(() => ({}))
        const txs: Transaction[] = Array.isArray(txJson)
          ? txJson
          : Array.isArray(txJson?.transactions)
            ? txJson.transactions
            : Array.isArray(txJson?.expenses)
              ? txJson.expenses
              : []
        const monthlyIncome = Number(nwJson?.monthly_income ?? 0)
        const series = buildSeries(txs, monthlyIncome)
        if (!cancelled) {
          setData(series)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setData([])
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="card h-48 animate-pulse" />
  }

  const hasData = data.some(d => d.income > 0 || d.expenses > 0)
  if (!hasData) {
    return (
      <div className="card p-5">
        <p className="eyebrow mb-2">Cash flow</p>
        <p className="text-[13px] text-[var(--color-text-tertiary)]">
          Log some transactions or set a monthly budget to see your cash-flow trend here.
        </p>
      </div>
    )
  }

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses])) || 1

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="eyebrow">Cash flow</p>
        <div className="flex items-center gap-3 text-[10px] font-medium text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-500)]" /> Income</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-primary)]" /> Spent</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-500)]" /> Saved</span>
        </div>
      </div>

      <div className="flex items-end gap-3 h-28">
        {data.map((d, i) => (
          <button
            key={d.month}
            type="button"
            className={cn(
              'flex-1 flex flex-col items-center gap-1 rounded-md transition-colors px-1',
              active === i && 'bg-[var(--color-gray-50)]',
            )}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${d.month}: income ${fmt(d.income)}, spent ${fmt(d.expenses)}, saved ${fmt(d.savings)}`}
          >
            <div className="w-full flex gap-0.5 items-end" style={{ height: 96 }}>
              <div className="flex-1 rounded-t-sm bg-[var(--color-success-500)]"  style={{ height: `${(d.income / maxVal) * 96}px` }} />
              <div className="flex-1 rounded-t-sm bg-[var(--color-text-primary)]" style={{ height: `${(d.expenses / maxVal) * 96}px` }} />
              <div className="flex-1 rounded-t-sm bg-[var(--color-brand-500)]"    style={{ height: `${(d.savings / maxVal) * 96}px` }} />
            </div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">{d.month}</span>
          </button>
        ))}
      </div>

      {active !== null && data[active] && (
        <div className="mt-4 rounded-md bg-[var(--color-gray-50)] border border-[var(--color-border-soft)] px-3 py-2.5 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Income</p>
            <p className="text-[13px] font-semibold tabular text-[var(--color-success-700)]">{fmt(data[active].income)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Spent</p>
            <p className="text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmt(data[active].expenses)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Saved</p>
            <p className="text-[13px] font-semibold tabular text-[var(--color-brand-700)]">{fmt(data[active].savings)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
