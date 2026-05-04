'use client'

import { useState } from 'react'
import type { MoneySubscription, BillingCycle } from '@/types/money'
import { BILLING_CYCLE_LABELS, BILLING_CYCLE_MONTHS } from '@/types/money'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, PlusCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

const CYCLES: BillingCycle[] = ['monthly', 'quarterly', 'annual', 'weekly']

interface Props {
  subscriptions: MoneySubscription[]
  onAdd: (data: { name: string; amount: number; billing_cycle: BillingCycle; category?: string }) => Promise<void>
  onToggle: (id: string, is_active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onOptimize: () => void
  currency?: string
}

export function SubscriptionList({ subscriptions, onAdd, onToggle, onDelete, onOptimize, currency = 'INR' }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const active = subscriptions.filter(s => s.is_active)
  const monthlyTotal = active.reduce((sum, s) => sum + s.amount / (BILLING_CYCLE_MONTHS[s.billing_cycle] ?? 1), 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!name || isNaN(amt) || amt <= 0) return
    setSaving(true)
    await onAdd({ name, amount: amt, billing_cycle: cycle, category: category || undefined })
    setName(''); setAmount(''); setCategory(''); setCycle('monthly'); setAdding(false)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Subscriptions</h3>
          {active.length > 0 && (
            <p className="text-xs text-gray-400">{fmt(Math.round(monthlyTotal), currency)}/month · {active.length} active</p>
          )}
        </div>
        <div className="flex gap-2">
          {active.length > 0 && (
            <button onClick={onOptimize} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
              <Zap className="h-3.5 w-3.5" />
              Optimize
            </button>
          )}
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <PlusCircle className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Netflix" className="mt-1 h-8 text-sm" required />
            </div>
            <div>
              <Label className="text-xs">Amount ({currency})</Label>
              <Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="199" className="mt-1 h-8 text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Billing cycle</Label>
              <select value={cycle} onChange={e => setCycle(e.target.value as BillingCycle)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                {CYCLES.map(c => <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Category (optional)</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Streaming" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Add'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {subscriptions.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">No subscriptions added</p>
          <button onClick={() => setAdding(true)} className="mt-2 text-sm text-indigo-600 font-medium">Add your first subscription</button>
        </div>
      )}

      <ul className="space-y-2">
        {subscriptions.map(sub => {
          const monthlyAmt = sub.amount / (BILLING_CYCLE_MONTHS[sub.billing_cycle] ?? 1)
          return (
            <li key={sub.id} className={cn('flex items-center gap-3 rounded-xl border p-3 transition-colors', sub.is_active ? 'border-gray-100 bg-white' : 'border-gray-50 bg-gray-50 opacity-60')}>
              <button
                onClick={() => onToggle(sub.id, !sub.is_active)}
                className={cn('w-4 h-4 rounded-full border-2 shrink-0 transition-colors', sub.is_active ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300')}
                aria-label={sub.is_active ? 'Mark inactive' : 'Mark active'}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{sub.name}</p>
                <p className="text-xs text-gray-400">{BILLING_CYCLE_LABELS[sub.billing_cycle]} · {fmt(monthlyAmt, sub.currency)}/mo</p>
              </div>
              <span className="text-sm font-medium text-gray-700 shrink-0">{fmt(sub.amount, sub.currency)}</span>
              <button onClick={() => onDelete(sub.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
