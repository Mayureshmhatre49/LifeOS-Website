'use client'

import { ChevronDown, Plus, Baby } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AuraChildProfile } from '@/types/aura'
import { getAgeDisplay } from '@/lib/aura-logic'

interface Props {
  profiles: AuraChildProfile[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddNew?: () => void
}

export function AuraChildSwitcher({ profiles, selectedId, onSelect, onAddNew }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [open])

  const selected = profiles.find(c => c.id === selectedId)

  if (profiles.length === 0) {
    return (
      <button
        onClick={onAddNew}
        className="w-full flex items-center gap-3 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white px-4 py-3 shadow-md hover:shadow-lg transition-all"
      >
        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">Add your first child</p>
          <p className="text-xs text-white/80">Start tracking their development</p>
        </div>
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-3 py-2.5 hover:shadow-md transition-all"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm">
          <Baby className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-bold text-gray-800 truncate">
            {selected?.full_name ?? 'Select a child'}
          </p>
          <p className="text-[11px] text-gray-400">
            {selected ? getAgeDisplay(selected.date_of_birth) : `${profiles.length} children`}
          </p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-2xl bg-white border border-gray-100 shadow-lg p-1.5 max-h-72 overflow-y-auto">
          {profiles.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                c.id === selectedId
                  ? 'bg-pink-50'
                  : 'hover:bg-gray-50',
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                c.id === selectedId ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-500',
              )}>
                {c.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{c.full_name}</p>
                <p className="text-[11px] text-gray-400">{getAgeDisplay(c.date_of_birth)}</p>
              </div>
            </button>
          ))}
          {onAddNew && (
            <Link
              href="/aura?action=add"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-pink-50 mt-1 border-t border-gray-100 pt-2"
            >
              <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold text-pink-600">Add another child</p>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

const SELECTED_KEY = 'aura:selectedChildId'

export function getStoredChildId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SELECTED_KEY)
}

export function storeSelectedChildId(id: string | null): void {
  if (typeof window === 'undefined') return
  if (id) sessionStorage.setItem(SELECTED_KEY, id)
  else sessionStorage.removeItem(SELECTED_KEY)
}
