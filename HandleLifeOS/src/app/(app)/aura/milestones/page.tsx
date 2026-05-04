'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Milestone as MilestoneIcon, Bell } from 'lucide-react'
import type { AuraChildProfile, MilestoneStatus } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { MilestoneTracker } from '@/components/family/aura/milestone-tracker'
import { AlertsPanel } from '@/components/family/aura/alerts-panel'
import { calculateAlerts } from '@/lib/aura-logic'
import { cn } from '@/lib/utils'

export default function AuraMilestonesPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'milestones' | 'alerts'>('milestones')

  useEffect(() => {
    fetch('/api/family/aura/profiles')
      .then(r => r.json())
      .then(({ profiles }) => {
        const list: AuraChildProfile[] = profiles ?? []
        setProfiles(list)
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        const next = valid ? stored : (list[0]?.id ?? null)
        setSelectedId(next)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  async function handleUpdateMilestone(milestoneId: string, status: MilestoneStatus, notes?: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return

    const existing = child.milestone_records.find(r => r.milestone_id === milestoneId)
    const updatedRecords = existing
      ? child.milestone_records.map(r =>
          r.milestone_id === milestoneId
            ? { ...r, status, notes, updated_at: new Date().toISOString(), achieved_date: status === 'achieved' ? new Date().toISOString().slice(0, 10) : r.achieved_date }
            : r
        )
      : [
          ...child.milestone_records,
          {
            milestone_id: milestoneId,
            status,
            notes,
            updated_at: new Date().toISOString(),
            achieved_date: status === 'achieved' ? new Date().toISOString().slice(0, 10) : undefined,
          },
        ]

    const updated: AuraChildProfile = { ...child, milestone_records: updatedRecords }

    // Optimistic update
    setProfiles(prev => prev.map(c => c.id === selectedId ? updated : c))

    // Persist
    await fetch(`/api/family/aura/profiles/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }

  function handleAskAI(_descriptions: string[]) {
    // Stub — full AI flow lives in /family/aura existing component; defer to Phase 3
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const alerts = selected ? calculateAlerts(selected) : []

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shadow-md shadow-pink-200">
            <MilestoneIcon className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Milestones</h1>
        </div>
      </div>

      <AuraChildSwitcher
        children={profiles}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      {selected ? (
        <>
          {/* View toggle */}
          <div className="flex rounded-xl bg-gray-100 p-0.5">
            {(['milestones', 'alerts'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                  view === v ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500',
                )}
              >
                {v === 'alerts' && <Bell className="h-3 w-3" />}
                {v === 'alerts' ? `Alerts (${alerts.length})` : 'Milestones'}
              </button>
            ))}
          </div>

          {view === 'milestones' ? (
            <MilestoneTracker
              child={selected}
              onUpdate={handleUpdateMilestone}
              onAskAI={handleAskAI}
            />
          ) : (
            <AlertsPanel alerts={alerts} />
          )}
        </>
      ) : (
        <EmptyChild />
      )}
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile from the AURA dashboard to start tracking milestones.</p>
      <Link href="/aura" className="text-xs font-bold text-fuchsia-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
