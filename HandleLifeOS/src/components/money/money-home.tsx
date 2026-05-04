'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Budget,
  Expense,
  SavingsGoal,
  MoneySubscription,
  ExpenseCategory,
  BillingCycle,
  MonthlySnapshot,
  SpendingInsightResult,
  AffordabilityResult,
  SavingsSuggestionResult,
  FinancialCalmResult,
  SubscriptionOptimizationResult,
} from '@/types/money'
import { MonthlySnapshot as SnapshotCard } from './monthly-snapshot'
import { ExpenseBreakdown } from './expense-breakdown'
import { AddExpenseModal } from './add-expense-modal'
import { SavingsGoalList } from './savings-goal-card'
import { SubscriptionList } from './subscription-list'
import { AskMoneyAI } from './ask-money-ai'
import { BudgetSetup } from './budget-setup'
import { EMICalculator } from './emi-calculator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type AnyResult =
  | SpendingInsightResult
  | AffordabilityResult
  | SavingsSuggestionResult
  | FinancialCalmResult
  | SubscriptionOptimizationResult
  | null

function useMonth() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else { setMonth(m => m - 1) } }
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else { setMonth(m => m + 1) } }
  return { month, year, prev, next }
}

export function MoneyHome() {
  const { month, year, prev, next } = useMonth()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [subscriptions, setSubscriptions] = useState<MoneySubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalTarget, setNewGoalTarget] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [bRes, eRes, gRes, sRes] = await Promise.all([
      fetch(`/api/money/budget?month=${month}&year=${year}`).then(r => r.json()),
      fetch(`/api/money/expenses?month=${month}&year=${year}`).then(r => r.json()),
      fetch('/api/money/savings').then(r => r.json()),
      fetch('/api/money/subscriptions').then(r => r.json()),
    ])
    setBudget(bRes.budget ?? null)
    setExpenses(eRes.expenses ?? [])
    setGoals(gRes.goals ?? [])
    setSubscriptions(sRes.subscriptions ?? [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { load() }, [load])

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<ExpenseCategory, number>)
  const biggestCategory = (Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null) as ExpenseCategory | null
  const moneyLeft = budget ? budget.monthly_income - budget.savings_target - totalExpenses : 0
  const savingsProgress = Math.max(0, moneyLeft)

  const snapshot: MonthlySnapshot = {
    budget,
    total_expenses: totalExpenses,
    money_left: moneyLeft,
    savings_progress: savingsProgress,
    biggest_category: biggestCategory,
    expense_summary: {
      total: totalExpenses,
      by_category: categoryTotals,
      currency: budget?.currency ?? 'INR',
      month,
      year,
    },
  }

  async function handleSaveBudget(data: { month: number; year: number; monthly_income: number; savings_target: number; currency: string }) {
    const res = await fetch('/api/money/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    setBudget(json.budget ?? null)
  }

  async function handleAddExpense(data: { category: ExpenseCategory; amount: number; description?: string; expense_date?: string; is_recurring?: boolean }) {
    const res = await fetch('/api/money/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, currency: budget?.currency ?? 'INR' }),
    })
    const json = await res.json()
    if (json.expense) setExpenses(prev => [json.expense, ...prev])
  }

  async function handleDeleteExpense(id: string) {
    await fetch(`/api/money/expenses/${id}`, { method: 'DELETE' })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault()
    const target = parseFloat(newGoalTarget)
    if (!newGoalTitle || isNaN(target) || target <= 0) return
    const res = await fetch('/api/money/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newGoalTitle, target_amount: target, currency: budget?.currency ?? 'INR' }),
    })
    const json = await res.json()
    if (json.goal) setGoals(prev => [json.goal, ...prev])
    setNewGoalTitle(''); setNewGoalTarget(''); setShowAddGoal(false)
  }

  async function handleGoalTopUp(id: string, current_amount: number) {
    const res = await fetch(`/api/money/savings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_amount }),
    })
    const json = await res.json()
    if (json.goal) setGoals(prev => prev.map(g => g.id === id ? json.goal : g))
  }

  async function handleDeleteGoal(id: string) {
    await fetch(`/api/money/savings/${id}`, { method: 'DELETE' })
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function handleAddSubscription(data: { name: string; amount: number; billing_cycle: BillingCycle; category?: string }) {
    const res = await fetch('/api/money/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, currency: budget?.currency ?? 'INR' }),
    })
    const json = await res.json()
    if (json.subscription) setSubscriptions(prev => [json.subscription, ...prev])
  }

  async function handleToggleSubscription(id: string, is_active: boolean) {
    const res = await fetch(`/api/money/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
    })
    const json = await res.json()
    if (json.subscription) setSubscriptions(prev => prev.map(s => s.id === id ? json.subscription : s))
  }

  async function handleDeleteSubscription(id: string) {
    await fetch(`/api/money/subscriptions/${id}`, { method: 'DELETE' })
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  async function handleSaveLoan(loan: { name: string; principal: number; annual_rate: number; tenure_months: number }) {
    await fetch('/api/money/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...loan, currency: budget?.currency ?? 'INR' }),
    })
  }

  async function handleAIQuery(action: string, extra?: string): Promise<AnyResult> {
    const body: Record<string, unknown> = { action }
    if (action === 'spending_insight') { body.month = month; body.year = year }
    if (action === 'affordability') body.question = extra
    if (action === 'financial_calm') body.message = extra
    try {
      const res = await fetch('/api/money/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      return (json.result as AnyResult) ?? null
    } catch {
      return null
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">{monthName} {year}</h2>
          <button onClick={next} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Button size="sm" onClick={() => setShowAddExpense(true)} className="gap-1.5">
          <PlusCircle className="h-3.5 w-3.5" />
          Add expense
        </Button>
      </div>

      {/* Budget setup */}
      <BudgetSetup budget={budget} month={month} year={year} onSave={handleSaveBudget} />

      {/* Snapshot cards */}
      <SnapshotCard snapshot={snapshot} month={month} year={year} />

      {/* AI panel */}
      <AskMoneyAI onSubmit={handleAIQuery} />

      {/* Expense breakdown */}
      {totalExpenses > 0 && snapshot.expense_summary && (
        <ExpenseBreakdown summary={snapshot.expense_summary} />
      )}

      {/* Recent expenses */}
      {expenses.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent expenses</h3>
          <ul className="space-y-2">
            {expenses.slice(0, 10).map(e => (
              <li key={e.id} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm text-gray-900">{e.description ?? e.category.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{e.expense_date} · {e.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: e.currency, maximumFractionDigits: 0 }).format(e.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="hidden group-hover:block text-gray-300 hover:text-red-400 text-lg leading-none"
                    aria-label="Delete expense"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Savings goals */}
      <SavingsGoalList
        goals={goals}
        onAddAmount={handleGoalTopUp}
        onDelete={handleDeleteGoal}
        onAdd={() => setShowAddGoal(true)}
      />

      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-4">New savings goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <Label htmlFor="goal-title" className="text-xs">Goal name</Label>
                <Input id="goal-title" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="Emergency fund" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="goal-target" className="text-xs">Target amount ({budget?.currency ?? 'INR'})</Label>
                <Input id="goal-target" type="number" min="1" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="100000" className="mt-1" required />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddGoal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create goal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      <SubscriptionList
        subscriptions={subscriptions}
        onAdd={handleAddSubscription}
        onToggle={handleToggleSubscription}
        onDelete={handleDeleteSubscription}
        onOptimize={() => handleAIQuery('optimize_subscriptions')}
        currency={budget?.currency ?? 'INR'}
      />

      {/* EMI Calculator */}
      <EMICalculator currency={budget?.currency ?? 'INR'} onSave={handleSaveLoan} />

      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSave={handleAddExpense}
          currency={budget?.currency ?? 'INR'}
        />
      )}
    </div>
  )
}
