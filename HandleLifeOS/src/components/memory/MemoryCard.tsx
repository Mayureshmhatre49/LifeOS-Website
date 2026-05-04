'use client'

import { useState } from 'react'
import { Pencil, Archive, Trash2, RotateCcw, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { MemoryItem, MemoryItemType } from '@/types/memory'

const TYPE_BORDER: Record<MemoryItemType, string> = {
  fact:         'border-l-blue-400',
  goal:         'border-l-emerald-400',
  preference:   'border-l-violet-400',
  context:      'border-l-amber-400',
  habit:        'border-l-sky-400',
  relationship: 'border-l-pink-400',
  concern:      'border-l-orange-400',
}

const TYPE_BADGE: Record<MemoryItemType, string> = {
  fact:         'bg-blue-50 text-blue-700',
  goal:         'bg-emerald-50 text-emerald-700',
  preference:   'bg-violet-50 text-violet-700',
  context:      'bg-amber-50 text-amber-700',
  habit:        'bg-sky-50 text-sky-700',
  relationship: 'bg-pink-50 text-pink-700',
  concern:      'bg-orange-50 text-orange-700',
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function ImportanceDots({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`Importance: ${value}/10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            i < Math.ceil(value / 2) ? 'bg-gray-400' : 'bg-gray-200',
          )}
        />
      ))}
    </span>
  )
}

interface Props {
  item: MemoryItem
  onEdit: (item: MemoryItem) => void
  onArchive: (item: MemoryItem) => void
  onDelete: (item: MemoryItem) => void
  onRestore?: (item: MemoryItem) => void
  archived?: boolean
}

export function MemoryCard({ item, onEdit, onArchive, onDelete, onRestore, archived }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className={cn(
        'relative group rounded-xl bg-white border border-gray-100 shadow-sm border-l-4 p-4 space-y-2 transition-shadow hover:shadow-md',
        TYPE_BORDER[item.type],
        archived && 'opacity-60',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TYPE_BADGE[item.type])}>
          {item.type}
        </span>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-6 w-6 flex items-center justify-center rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Memory actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 text-sm">
                {!archived && (
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(item) }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {!archived && (
                  <button
                    onClick={() => { setMenuOpen(false); onArchive(item) }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                )}
                {archived && onRestore && (
                  <button
                    onClick={() => { setMenuOpen(false); onRestore(item) }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); onDelete(item) }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Key (title) */}
      <p className="text-sm font-semibold text-gray-800 capitalize leading-snug">
        {item.key.replace(/_/g, ' ')}
      </p>

      {/* Value */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.value}</p>

      {/* Footer metadata */}
      <div className="flex items-center gap-2 pt-1">
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
          {item.source}
        </Badge>
        <span className="text-[11px] text-gray-400">{relativeDate(item.updated_at)}</span>
        <span className="flex-1" />
        <ImportanceDots value={item.importance} />
      </div>
    </div>
  )
}
