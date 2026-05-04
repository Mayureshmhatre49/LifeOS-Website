'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Budget } from '@/types/money'
import { Settings2 } from 'lucide-react'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED', 'AUD']

interface Props {
  budget: Budget | null
  month: number
  year: number
  onSave: (data: { month: number; year: number; monthly_income: number; savings_target: number; currency: string }) => Promise<void>
}

export function BudgetSetup({ budget, month, year, onSave }: Props) {
  const [open, setOpen] = useState(!budget)
  const [income, setIncome] = useState(String(budget?.monthly_income ?? ''))
  const [savings, setSavings] = useState(String(budget?.savings_target ?? ''))
  const [currency, setCurrency] = useState(budget?.currency ?? 'INR')
  const [saving, setSaving] = useState(false)

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inc = parseFloat(income)
    const sav = parseFloat(savings)
    if (isNaN(inc) || inc < 0 || isNaN(sav) || sav < 0) return
    setSaving(true)
    await onSave({ month, year, monthly_income: inc, savings_target: sav, currency })
    setOpen(false)
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Edit {monthName} budget
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Set {monthName} {year} budget</h3>
        {budget && (
          <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Label htmlFor="currency" className="text-xs">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="income" className="text-xs">Monthly income ({currency})</Label>
            <Input
              id="income"
              type="number"
              min="0"
              step="0.01"
              placeholder="50000"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="savings-target" className="text-xs">Monthly savings target ({currency})</Label>
          <Input
            id="savings-target"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            value={savings}
            onChange={e => setSavings(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">How much you want to save each month</p>
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Saving…' : 'Save budget'}
        </Button>
      </form>
    </div>
  )
}
