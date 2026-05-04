'use client'

import { useState } from 'react'
import type { SavingsGoal } from '@/types/money'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Target, Trash2, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface GoalCardProps {
  goal: SavingsGoal
  onAddAmount: (id: string, amount: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function GoalCard({ goal, onAddAmount, onDelete }: GoalCardProps) {
  const [adding, setAdding] = useState(false)
  const [topUp, setTopUp] = useState('')
  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  const remaining = goal.target_amount - goal.current_amount

  async function handleAdd() {
    const amt = parseFloat(topUp)
    if (isNaN(amt) || amt <= 0) return
    await onAddAmount(goal.id, goal.current_amount + amt)
    setTopUp('')
    setAdding(false)
  }

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3', goal.is_completed ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {goal.is_completed ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Target className="h-4 w-4 text-indigo-400 shrink-0" />}
          <span className="text-sm font-medium text-gray-900">{goal.title}</span>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{fmt(goal.current_amount, goal.currency)}</span>
          <span>{fmt(goal.target_amount, goal.currency)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% saved`}>
          <div className={cn('h-full rounded-full transition-all', goal.is_completed ? 'bg-green-500' : 'bg-indigo-500')} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct}% saved{!goal.is_completed && ` · ${fmt(remaining, goal.currency)} to go`}</p>
      </div>

      {!goal.is_completed && (
        adding ? (
          <div className="flex gap-2">
            <Input type="number" min="1" placeholder="Amount" value={topUp} onChange={e => setTopUp(e.target.value)} className="h-8 text-sm" />
            <Button size="sm" onClick={handleAdd} className="h-8 shrink-0">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-8 shrink-0">Cancel</Button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
            <PlusCircle className="h-3.5 w-3.5" />
            Add savings
          </button>
        )
      )}
    </div>
  )
}

interface Props {
  goals: SavingsGoal[]
  onAddAmount: (id: string, amount: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: () => void
}

export function SavingsGoalList({ goals, onAddAmount, onDelete, onAdd }: Props) {
  const active = goals.filter(g => !g.is_completed)
  const completed = goals.filter(g => g.is_completed)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Savings goals</h3>
        <button onClick={onAdd} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          <PlusCircle className="h-3.5 w-3.5" />
          New goal
        </button>
      </div>
      {active.length === 0 && completed.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">No savings goals yet</p>
          <button onClick={onAdd} className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Create your first goal
          </button>
        </div>
      )}
      {active.map(goal => (
        <GoalCard key={goal.id} goal={goal} onAddAmount={onAddAmount} onDelete={onDelete} />
      ))}
      {completed.length > 0 && (
        <details>
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            {completed.length} completed goal{completed.length > 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {completed.map(goal => (
              <GoalCard key={goal.id} goal={goal} onAddAmount={onAddAmount} onDelete={onDelete} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
