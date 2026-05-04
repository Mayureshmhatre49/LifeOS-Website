'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'
import type { ExpenseCategory } from '@/types/money'
import { EXPENSE_CATEGORY_LABELS } from '@/types/money'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSave: (expense: { category: ExpenseCategory; amount: number; description?: string; expense_date?: string; is_recurring?: boolean }) => Promise<void>
  currency?: string
}

const CATEGORIES = Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]

export function AddExpenseModal({ onClose, onSave, currency = 'INR' }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>('misc')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ category, amount: amt, description: description || undefined, expense_date: date, is_recurring: isRecurring })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Add expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount ({currency})</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="mt-1 text-lg"
              autoFocus
            />
          </div>

          {/* Category chips */}
          <div>
            <Label>Category</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORIES.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    category === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Description (optional)</Label>
            <div className="relative mt-1">
              <Input
                id="desc"
                placeholder="e.g. Lunch at restaurant"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
                className="pr-10"
              />
              <div className="absolute right-1 top-1">
                <VoiceMicButton
                  onTranscript={setDescription}
                  className="h-8 w-8 bg-transparent hover:bg-gray-50 text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Recurring */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            Recurring expense
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Add expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
