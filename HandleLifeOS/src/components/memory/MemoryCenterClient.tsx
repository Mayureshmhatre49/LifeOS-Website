'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemoryCard } from './MemoryCard'
import { AddMemoryModal } from './AddMemoryModal'
import { ProfileEditor } from './ProfileEditor'
import { MemorySettings } from './MemorySettings'
import type { MemoryItem, MemoryItemType, UserProfile } from '@/types/memory'

type Tab = 'memories' | 'profile' | 'settings'

const TYPE_FILTERS: { value: MemoryItemType | 'all' | 'archived'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'fact',         label: 'Facts' },
  { value: 'goal',         label: 'Goals' },
  { value: 'preference',   label: 'Preferences' },
  { value: 'context',      label: 'Context' },
  { value: 'habit',        label: 'Habits' },
  { value: 'relationship', label: 'Family' },
  { value: 'concern',      label: 'Concerns' },
  { value: 'archived',     label: 'Archived' },
]

interface Props {
  initialItems: MemoryItem[]
  initialProfile: UserProfile | null
  totalCount: number
}

export function MemoryCenterClient({ initialItems, initialProfile, totalCount }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('memories')
  const [items, setItems] = useState<MemoryItem[]>(initialItems)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [typeFilter, setTypeFilter] = useState<MemoryItemType | 'all' | 'archived'>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<MemoryItem | null>(null)

  const memoryEnabled = profile?.memory_enabled ?? true

  // Derived: active vs archived
  const activeItems = items.filter((i) => i.is_active)
  const archivedItems = items.filter((i) => !i.is_active)

  const filtered = useMemo(() => {
    const base = typeFilter === 'archived' ? archivedItems : activeItems
    const byType = typeFilter === 'all' || typeFilter === 'archived'
      ? base
      : base.filter((i) => i.type === typeFilter)
    if (!search.trim()) return byType
    const q = search.toLowerCase()
    return byType.filter(
      (i) =>
        i.key.toLowerCase().includes(q) ||
        i.value.toLowerCase().includes(q),
    )
  }, [items, typeFilter, search, activeItems, archivedItems])

  function handleSaved(saved: MemoryItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  async function handleArchive(item: MemoryItem) {
    try {
      const res = await fetch(`/api/memory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      if (!res.ok) return
      const data = await res.json()
      handleSaved(data.item)
    } catch {
      // silent
    }
  }

  async function handleRestore(item: MemoryItem) {
    try {
      const res = await fetch(`/api/memory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true }),
      })
      if (!res.ok) return
      const data = await res.json()
      handleSaved(data.item)
    } catch {
      // silent
    }
  }

  async function handleDelete(item: MemoryItem) {
    if (!confirm(`Delete "${item.key.replace(/_/g, ' ')}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/memory/${item.id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      // silent
    }
  }

  function handleEdit(item: MemoryItem) {
    setEditItem(item)
    setShowModal(true)
  }

  function openAdd() {
    setEditItem(null)
    setShowModal(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Memory Center</h1>
            {!memoryEnabled && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                Paused
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {activeItems.length} active memor{activeItems.length === 1 ? 'y' : 'ies'} · AI uses these to personalise every response
          </p>
        </div>
        {activeTab === 'memories' && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add memory
          </Button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['memories', 'profile', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Memories tab ─────────────────────────────────────────────── */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="pl-9"
            />
          </div>

          {/* Type filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((f) => {
              const count = f.value === 'archived'
                ? archivedItems.length
                : f.value === 'all'
                  ? activeItems.length
                  : activeItems.filter((i) => i.type === f.value).length
              return (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    typeFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span className="ml-1 opacity-70">{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Brain className="h-8 w-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-400">
                {search ? 'No memories match your search.' : 'No memories yet. Add one or chat with the AI.'}
              </p>
              {!search && (
                <Button size="sm" variant="outline" onClick={openAdd} className="mt-2">
                  <Plus className="h-3.5 w-3.5" />
                  Add first memory
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((item) => (
                <MemoryCard
                  key={item.id}
                  item={item}
                  archived={!item.is_active}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile tab ──────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <ProfileEditor
          profile={profile}
          onSaved={(p) => setProfile(p)}
        />
      )}

      {/* ── Settings tab ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <MemorySettings
          profile={profile}
          itemCount={totalCount}
          onProfileChange={(p) => setProfile(p)}
          onCleared={() => setItems([])}
        />
      )}

      {/* Modal */}
      {showModal && (
        <AddMemoryModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
