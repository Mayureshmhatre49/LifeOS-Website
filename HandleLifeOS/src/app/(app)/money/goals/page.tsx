'use client'

import { useEffect, useState, useCallback } from 'react'
import { Target, Trophy } from 'lucide-react'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import { SavingsGoalList } from '@/components/money/savings-goal-card'
import type { SavingsGoal } from '@/types/money'

function fmt(n: number, cur: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n) }
  catch { return `${cur} ${n.toLocaleString()}` }
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [currency, setCurrency] = useState('USD')

  const load = useCallback(async () => {
    const [res, p] = await Promise.all([
      fetch('/api/money/savings'),
      fetch('/api/profile').then(r => r.json()).catch(() => ({})),
    ])
    const data = await res.json()
    setGoals(Array.isArray(data) ? data : [])
    if (p?.currency) setCurrency(p.currency)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAddAmount(id: string, amount: number) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    await fetch(`/api/money/savings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_amount: goal.current_amount + amount }),
    })
    await load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/money/savings/${id}`, { method: 'DELETE' })
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const active    = goals.filter(g => !g.is_completed)
  const completed = goals.filter(g => g.is_completed)
  const totalTarget  = active.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = active.reduce((s, g) => s + g.current_amount, 0)
  const overallPct   = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
          <Target className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Savings Goals</h1>
      </div>

      <MoneyNavBar />

      {/* Summary */}
      {active.length > 0 && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-gray-800">Overall Progress</p>
            <span className="text-sm font-black text-amber-600">{overallPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-black text-gray-900">{active.length}</p>
              <p className="text-[10px] text-gray-400">Active</p>
            </div>
            <div>
              <p className="text-base font-black text-amber-600">{fmt(totalCurrent, currency)}</p>
              <p className="text-[10px] text-gray-400">Saved</p>
            </div>
            <div>
              <p className="text-base font-black text-gray-500">{fmt(totalTarget - totalCurrent, currency)}</p>
              <p className="text-[10px] text-gray-400">Remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals list */}
      {!loading && (
        <SavingsGoalList
          goals={goals}
          onAddAmount={handleAddAmount}
          onDelete={handleDelete}
          onAdd={() => setShowAdd(true)}
        />
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</p>
          </div>
          <div className="space-y-2">
            {completed.map(g => (
              <div key={g.id} className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center gap-3">
                <Trophy className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{g.title}</p>
                  <p className="text-xs text-emerald-600 font-semibold">{fmt(g.target_amount, currency)} achieved!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
