'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MemoryItemType, CreateMemoryItemInput } from '@/types/memory'

const TYPES: MemoryItemType[] = ['fact', 'preference', 'goal', 'concern', 'context', 'habit', 'relationship']

interface Props {
  onAdd: (input: CreateMemoryItemInput) => Promise<void>
}

export function AddMemoryDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateMemoryItemInput>({ type: 'fact', key: '', value: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.key.trim() || !form.value.trim()) return
    setSaving(true)
    try {
      await onAdd({ ...form, key: form.key.trim(), value: form.value.trim() })
      setForm({ type: 'fact', key: '', value: '' })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Add memory
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-indigo-900">New memory</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
                  form.type === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="mem-key" className="text-xs">Key / label</Label>
            <Input
              id="mem-key"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. monthly_salary"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mem-value" className="text-xs">Value</Label>
            <Input
              id="mem-value"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="e.g. ₹85,000"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving || !form.key.trim() || !form.value.trim()}>
            {saving ? 'Saving…' : 'Add'}
          </Button>
        </div>
      </form>
    </div>
  )
}
