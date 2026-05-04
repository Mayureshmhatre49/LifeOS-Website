'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Syringe, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react'
import type { AuraChildProfile, MedicalRecord } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { getAgeInMonths } from '@/lib/aura-logic'
import {
  IMMUNIZATION_SCHEDULE, classifyDose,
  type ImmunizationStatus, type VaccineDose,
} from '@/lib/aura/immunizations'
import { cn } from '@/lib/utils'

export default function AuraImmunizationsPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/family/aura/profiles')
      .then(r => r.json())
      .then(({ profiles }) => {
        const list: AuraChildProfile[] = profiles ?? []
        setProfiles(list)
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        setSelectedId(valid ? stored : (list[0]?.id ?? null))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  async function persist(updated: AuraChildProfile) {
    setProfiles(prev => prev.map(c => c.id === updated.id ? updated : c))
    await fetch(`/api/family/aura/profiles/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }

  // Derive completed dose IDs from medical records (vaccination type, dose id stored in notes prefix `dose:<id>`)
  function getCompletedIds(child: AuraChildProfile): Set<string> {
    const set = new Set<string>()
    for (const r of child.medical_records) {
      if (r.type !== 'vaccination') continue
      const m = r.notes?.match(/dose:([a-z0-9-]+)/i)
      if (m) set.add(m[1])
    }
    return set
  }

  async function markGiven(dose: VaccineDose, date: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    setMarking(dose.id)
    try {
      const record: MedicalRecord = {
        id: crypto.randomUUID(),
        date,
        type: 'vaccination',
        notes: `dose:${dose.id} ${dose.name} (${dose.fullName})`,
      }
      await persist({ ...child, medical_records: [...child.medical_records, record] })
    } finally {
      setMarking(null)
    }
  }

  async function unmarkDose(doseId: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    if (!confirm('Remove the record for this dose?')) return
    const filtered = child.medical_records.filter(r => {
      if (r.type !== 'vaccination') return true
      return !r.notes?.includes(`dose:${doseId}`)
    })
    await persist({ ...child, medical_records: filtered })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const completedIds = selected ? getCompletedIds(selected) : new Set<string>()
  const ageMonths = selected ? getAgeInMonths(selected.date_of_birth) : 0

  const grouped = (() => {
    const buckets: Array<{ ageMonths: number; label: string; doses: VaccineDose[] }> = []
    const seen = new Map<number, VaccineDose[]>()
    for (const d of IMMUNIZATION_SCHEDULE) {
      const list = seen.get(d.due_at_months) ?? []
      list.push(d)
      seen.set(d.due_at_months, list)
    }
    for (const [age, doses] of [...seen.entries()].sort((a, b) => a[0] - b[0])) {
      buckets.push({ ageMonths: age, label: ageLabel(age), doses })
    }
    return buckets
  })()

  // Counts
  let counts = { completed: 0, due: 0, overdue: 0, upcoming: 0, optional: 0 }
  if (selected) {
    for (const d of IMMUNIZATION_SCHEDULE) {
      counts[classifyDose(d, ageMonths, completedIds)]++
    }
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-md shadow-purple-200">
            <Syringe className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Immunisations</h1>
        </div>
      </div>

      <AuraChildSwitcher children={profiles} selectedId={selectedId} onSelect={handleSelect} />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard count={counts.completed} label="Completed" color="text-emerald-600" icon={CheckCircle2} />
            <SummaryCard count={counts.due + counts.overdue} label="Due / overdue" color={counts.overdue > 0 ? 'text-rose-600' : 'text-amber-600'} icon={AlertCircle} />
            <SummaryCard count={counts.upcoming} label="Upcoming" color="text-gray-500" icon={Clock} />
          </div>

          {counts.overdue > 0 && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 leading-relaxed">
                <strong>{counts.overdue} overdue {counts.overdue === 1 ? 'vaccine' : 'vaccines'}.</strong>{' '}
                Speak to your paediatrician — catch-up schedules are usually straightforward.
              </p>
            </div>
          )}

          {/* Schedule grouped by age */}
          <div className="space-y-4">
            {grouped.map(group => {
              // Show only relevant groups (≤ child age + 24 months ahead)
              if (group.ageMonths > ageMonths + 24) return null
              return (
                <div key={group.ageMonths} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.label}</p>
                    {group.ageMonths <= ageMonths && <span className="text-[9px] font-bold text-gray-300">PAST</span>}
                  </div>
                  {group.doses.map(dose => {
                    const status = classifyDose(dose, ageMonths, completedIds)
                    return (
                      <DoseRow
                        key={dose.id}
                        dose={dose}
                        status={status}
                        loading={marking === dose.id}
                        onMark={(date) => markGiven(dose, date)}
                        onUnmark={() => unmarkDose(dose.id)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            Schedule based on CDC + IAP / WHO guidance. Always confirm with your paediatrician — regional and individual variations apply.
          </p>
        </>
      )}
    </div>
  )
}

function ageLabel(months: number): string {
  if (months === 0) return 'Birth'
  if (months < 1) return `${Math.round(months * 30)} days`
  if (months < 24) return `${months % 1 === 0 ? months : months.toFixed(1)} months`
  const y = Math.floor(months / 12)
  return `${y} years`
}

function SummaryCard({ count, label, color, icon: Icon }: { count: number; label: string; color: string; icon: typeof CheckCircle2 }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-xl font-bold', color)}>{count}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
    </div>
  )
}

function DoseRow({ dose, status, loading, onMark, onUnmark }: {
  dose: VaccineDose
  status: ImmunizationStatus
  loading: boolean
  onMark: (date: string) => void
  onUnmark: () => void
}) {
  const [showDate, setShowDate] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const cfg: Record<ImmunizationStatus, { color: string; bg: string; ring: string; pillBg: string; pillText: string; pillLabel: string }> = {
    completed: { color: 'text-emerald-700', bg: 'bg-emerald-50',         ring: 'border-emerald-200',  pillBg: 'bg-emerald-200', pillText: 'text-emerald-800', pillLabel: '✓ Given'    },
    overdue:   { color: 'text-rose-700',    bg: 'bg-rose-50',            ring: 'border-rose-200',     pillBg: 'bg-rose-200',    pillText: 'text-rose-800',    pillLabel: 'Overdue'    },
    due:       { color: 'text-amber-700',   bg: 'bg-amber-50',           ring: 'border-amber-200',    pillBg: 'bg-amber-200',   pillText: 'text-amber-800',   pillLabel: 'Due now'    },
    upcoming:  { color: 'text-gray-700',    bg: 'bg-white/80',           ring: 'border-gray-200',     pillBg: 'bg-gray-100',    pillText: 'text-gray-600',    pillLabel: 'Upcoming'   },
    optional:  { color: 'text-gray-500',    bg: 'bg-white/60',           ring: 'border-gray-100',     pillBg: 'bg-gray-100',    pillText: 'text-gray-500',    pillLabel: 'Optional'   },
  }
  const c = cfg[status]

  return (
    <div className={cn('rounded-2xl border p-3 backdrop-blur', c.bg, c.ring)}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('text-sm font-bold', c.color)}>{dose.name}</p>
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider', c.pillBg, c.pillText)}>
              {c.pillLabel}
            </span>
            {dose.optional && status !== 'optional' && (
              <span className="text-[9px] font-medium text-gray-400">(optional)</span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{dose.fullName}</p>
          {dose.notes && <p className="text-[10px] text-gray-400 mt-0.5">{dose.notes}</p>}
        </div>
        {status === 'completed' ? (
          <button onClick={onUnmark} className="text-[11px] text-gray-400 hover:text-red-500 underline">
            Undo
          </button>
        ) : showDate ? (
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              className="text-[11px] rounded-lg border border-gray-200 bg-white px-2 py-1"
            />
            <button
              disabled={loading}
              onClick={() => { onMark(date); setShowDate(false) }}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg disabled:opacity-40"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDate(true)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0',
              status === 'overdue' || status === 'due'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            <Plus className="h-3 w-3" />
            Mark given
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to see immunisation schedule.</p>
      <Link href="/aura" className="text-xs font-bold text-purple-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
