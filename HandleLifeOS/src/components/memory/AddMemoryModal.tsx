'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { MemoryItem, MemoryItemType } from '@/types/memory'

const MEMORY_TYPES: MemoryItemType[] = [
  'fact', 'goal', 'preference', 'context', 'habit', 'relationship', 'concern',
]

interface Props {
  item?: MemoryItem | null
  onClose: () => void
  onSaved: (item: MemoryItem) => void
}

export function AddMemoryModal({ item, onClose, onSaved }: Props) {
  const [type, setType] = useState<MemoryItemType>('fact')
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [importance, setImportance] = useState(5)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setType(item.type)
      setKey(item.key.replace(/_/g, ' '))
      setValue(item.value)
      setImportance(item.importance)
    }
  }, [item])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim() || !value.trim()) return
    setSaving(true)
    setError(null)

    try {
      const url = item ? `/api/memory/${item.id}` : '/api/memory'
      const method = item ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, key: key.trim(), value: value.trim(), importance }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      const data = await res.json()
      onSaved(data.item)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {item ? 'Edit memory' : 'Add memory'}
          </h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {MEMORY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    type === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Key */}
          <div className="space-y-1.5">
            <Label htmlFor="mem-key">Label</Label>
            <Input
              id="mem-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. monthly income, son's school"
              required
            />
            <p className="text-xs text-gray-400">A short title for this memory</p>
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <Label htmlFor="mem-value">Detail</Label>
            <Textarea
              id="mem-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. ₹85,000 per month"
              rows={3}
              required
            />
          </div>

          {/* Importance */}
          <div className="space-y-1.5">
            <Label>Importance: {importance}/10</Label>
            <input
              type="range"
              min={1}
              max={10}
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Low</span><span>High</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {item ? 'Save changes' : 'Add memory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
