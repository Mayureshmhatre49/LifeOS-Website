'use client'

import { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight, Edit2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MemoryItem } from '@/types/memory'

const TYPE_COLORS: Record<string, string> = {
  fact: 'bg-blue-50 text-blue-700 border-blue-200',
  preference: 'bg-purple-50 text-purple-700 border-purple-200',
  goal: 'bg-green-50 text-green-700 border-green-200',
  concern: 'bg-red-50 text-red-700 border-red-200',
  context: 'bg-gray-50 text-gray-700 border-gray-200',
  habit: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  relationship: 'bg-pink-50 text-pink-700 border-pink-200',
}

interface Props {
  item: MemoryItem
  onToggle: (id: string, is_active: boolean) => Promise<void>
  onEdit: (id: string, key: string, value: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function MemoryItemCard({ item, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editKey, setEditKey] = useState(item.key)
  const [editValue, setEditValue] = useState(item.value)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    if (!editKey.trim() || !editValue.trim()) return
    setBusy(true)
    await onEdit(item.id, editKey.trim(), editValue.trim())
    setBusy(false)
    setEditing(false)
  }

  async function handleToggle() {
    setBusy(true)
    await onToggle(item.id, !item.is_active)
    setBusy(false)
  }

  async function handleDelete() {
    setBusy(true)
    await onDelete(item.id)
    setBusy(false)
  }

  return (
    <div className={`rounded-lg border p-3 transition-opacity ${item.is_active ? '' : 'opacity-50'}`}>
      <div className="flex items-start gap-2">
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[item.type] ?? TYPE_COLORS.context}`}>
          {item.type}
        </span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
                placeholder="Key"
                className="h-7 text-sm"
              />
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Value"
                className="h-7 text-sm"
              />
              <div className="flex gap-1.5">
                <Button size="sm" onClick={handleSave} disabled={busy} className="h-7 px-2 text-xs">
                  <Check className="h-3 w-3 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-gray-500 truncate">{item.key}</p>
              <p className="text-sm text-gray-900 mt-0.5 break-words">{item.value}</p>
            </>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              disabled={busy}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggle}
              disabled={busy}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={item.is_active ? 'Disable' : 'Enable'}
            >
              {item.is_active
                ? <ToggleRight className="h-3.5 w-3.5 text-indigo-600" />
                : <ToggleLeft className="h-3.5 w-3.5" />
              }
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        {item.source} · {new Date(item.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}
