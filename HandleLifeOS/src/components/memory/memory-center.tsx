'use client'

import { useEffect, useState, useCallback } from 'react'
import { Brain, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemoryItemCard } from './memory-item-card'
import { AddMemoryDialog } from './add-memory-dialog'
import type { MemoryItem, CreateMemoryItemInput, MemoryItemType } from '@/types/memory'

const ALL_TYPES: MemoryItemType[] = ['fact', 'preference', 'goal', 'concern', 'context', 'habit', 'relationship']

export function MemoryCenter() {
  const [items, setItems] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MemoryItemType | 'all'>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/memory')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleAdd(input: CreateMemoryItemInput) {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const item: MemoryItem = await res.json()
      setItems((prev) => [item, ...prev])
    }
  }

  async function handleToggle(id: string, is_active: boolean) {
    await fetch(`/api/memory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
    })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_active } : i))
  }

  async function handleEdit(id: string, key: string, value: string) {
    await fetch(`/api/memory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, key, value } : i))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/memory/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleClearAll() {
    await fetch('/api/memory/all', { method: 'DELETE' })
    setItems([])
    setConfirmClear(false)
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)
  const activeCount = items.filter((i) => i.is_active).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {activeCount} active {activeCount === 1 ? 'memory' : 'memories'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AddMemoryDialog onAdd={handleAdd} />
          {items.length > 0 && !confirmClear && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmClear(true)}
              className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {confirmClear && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Delete all memories?</p>
            <p className="text-xs text-red-600 mt-0.5">This cannot be undone. The AI will no longer know anything about you.</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 h-7 text-xs">
                Yes, delete all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)} className="h-7 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', ...ALL_TYPES] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
              filter === t
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {filter === 'all' ? 'No memories yet. Add one to personalise your AI.' : `No ${filter} memories.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <MemoryItemCard
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
