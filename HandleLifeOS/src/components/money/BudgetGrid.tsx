'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from '@/types/money'
import type { ExpenseSummary, CategoryBudget } from '@/types/money'

interface Props {
  expenseSummary: ExpenseSummary | null
  monthlyBudget: number
}

function pct(spent: number, limit: number) {
  return limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0
}

export function BudgetGrid({ expenseSummary, monthlyBudget }: Props) {
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetch('/api/money/category-budgets')
      .then(r => r.json())
      .then(d => setCategoryBudgets(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const byCategory: Record<string, number> = (expenseSummary?.by_category ?? {}) as Record<string, number>

  async function saveLimit(category: string, limit: number) {
    const res = await fetch('/api/money/category-budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, monthly_limit: limit }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCategoryBudgets(prev => {
        const existing = prev.find(b => b.category === category)
        return existing
          ? prev.map(b => b.category === category ? updated : b)
          : [...prev, updated]
      })
    }
    setEditId(null)
  }

  const categories = Object.keys(EXPENSE_CATEGORY_LABELS) as Array<keyof typeof EXPENSE_CATEGORY_LABELS>
  const categoriesWithData = categories.filter(c => byCategory[c] > 0 || categoryBudgets.find(b => b.category === c))

  if (categoriesWithData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-center">
        <p className="text-sm text-gray-400">Add expenses to see your budget breakdown.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {categoriesWithData.map(cat => {
        const spent  = byCategory[cat] ?? 0
        const budget = categoryBudgets.find(b => b.category === cat)
        const limit  = budget?.monthly_limit ?? (monthlyBudget > 0 ? monthlyBudget * 0.2 : 0)
        const used   = pct(spent, limit)
        const color  = EXPENSE_CATEGORY_COLORS[cat]
        const isEditing = editId === cat

        return (
          <div key={cat} className="rounded-xl bg-white/80 border border-white/60 shadow-sm px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold text-gray-800">{EXPENSE_CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs font-bold',
                  used >= 90 ? 'text-rose-600' : used >= 75 ? 'text-amber-600' : 'text-gray-600',
                )}>
                  ₹{spent.toLocaleString('en-IN')}
                  {limit > 0 && <span className="text-gray-400 font-normal"> / ₹{limit.toLocaleString('en-IN')}</span>}
                </span>
                <button
                  onClick={() => { setEditId(isEditing ? null : cat); setEditValue(String(limit || '')) }}
                  className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold"
                >
                  {isEditing ? 'Cancel' : 'Set limit'}
                </button>
              </div>
            </div>

            {limit > 0 && (
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    used >= 90 ? 'bg-rose-500' : used >= 75 ? 'bg-amber-400' : 'bg-emerald-500',
                  )}
                  style={{ width: `${used}%`, backgroundColor: used < 75 ? color : undefined }}
                />
              </div>
            )}

            {isEditing && (
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  placeholder="Monthly limit (₹)"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-300"
                />
                <button
                  onClick={() => saveLimit(cat, Number(editValue))}
                  disabled={!editValue || Number(editValue) <= 0}
                  className="rounded-lg bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
