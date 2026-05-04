'use client'

import { useState } from 'react'
import { Brain, Download, Trash2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types/memory'

interface Props {
  profile: UserProfile | null
  itemCount: number
  onProfileChange: (profile: UserProfile) => void
  onCleared: () => void
}

export function MemorySettings({ profile, itemCount, onProfileChange, onCleared }: Props) {
  const [toggling, setToggling] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const memoryEnabled = profile?.memory_enabled ?? true

  async function toggleMemory() {
    setToggling(true)
    try {
      const res = await fetch('/api/memory/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory_enabled: !memoryEnabled }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      onProfileChange(data.profile)
    } catch {
      // silent
    } finally {
      setToggling(false)
    }
  }

  async function exportMemory() {
    setExporting(true)
    try {
      const res = await fetch('/api/memory/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lifeos-memory-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setExporting(false)
    }
  }

  async function clearAllMemory() {
    setClearing(true)
    try {
      const res = await fetch('/api/memory/clear', { method: 'DELETE' })
      if (!res.ok) throw new Error('Clear failed')
      onCleared()
      setConfirmClear(false)
    } catch {
      // silent
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Memory toggle */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-50 p-2.5 shrink-0">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">AI Memory</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              When enabled, Life OS remembers context from your conversations to give smarter, personalised responses.
            </p>
          </div>
          <button
            onClick={toggleMemory}
            disabled={toggling}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              memoryEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={memoryEnabled}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                memoryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Memory is currently <strong>{memoryEnabled ? 'active' : 'paused'}</strong>.
          {itemCount > 0 && ` ${itemCount} memories stored.`}
        </p>
      </div>

      {/* Privacy info */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-900">Privacy</h3>
        </div>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li>• Your memories are stored securely and never shared.</li>
          <li>• AI uses memories only to personalise your experience.</li>
          <li>• You can delete individual memories or all at once.</li>
          <li>• Export gives you a full copy of all stored data.</li>
        </ul>
      </div>

      {/* Export */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Export your data</h3>
        <p className="text-xs text-gray-500 mb-3">
          Download a JSON file containing your entire memory store — profile, memories, and preferences.
        </p>
        <Button variant="outline" size="sm" onClick={exportMemory} loading={exporting}>
          <Download className="h-3.5 w-3.5" />
          Export memory JSON
        </Button>
      </div>

      {/* Delete all */}
      <div className="rounded-2xl bg-white border border-red-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Delete all memories</h3>
        <p className="text-xs text-gray-500 mb-3">
          Permanently removes all {itemCount} stored memories. Your profile settings are kept. This cannot be undone.
        </p>
        {!confirmClear ? (
          <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)} disabled={itemCount === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete all memories
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={clearAllMemory} loading={clearing}>
              Confirm delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
