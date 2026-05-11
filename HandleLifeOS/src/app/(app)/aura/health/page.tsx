'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Stethoscope, Plus, Trash2, Pill, ClipboardList, Activity,
  Calendar, Syringe, AlertCircle, CheckCircle2, Eye, Ear,
} from 'lucide-react'
import type { AuraChildProfile, MedicalRecord, Medication, TherapyRecord } from '@/types/aura'
import { THERAPY_TYPE_LABELS } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { SCREENING_SCHEDULE, getAgeInMonths, type ScreeningRecommendation } from '@/lib/aura-logic'
import { cn } from '@/lib/utils'

type Tab = 'screening' | 'records' | 'medications' | 'therapies'

export default function AuraHealthPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('screening')

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-md shadow-purple-200">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Health</h1>
        </div>
      </div>

      <AuraChildSwitcher
        profiles={profiles}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-0.5">
            {(['screening', 'records', 'medications', 'therapies'] as const).map(t => {
              const counts = {
                screening: '',
                records: selected.medical_records.length,
                medications: selected.medications.length,
                therapies: selected.therapies.length,
              } as const
              const labels = { screening: 'Screening', records: 'Visits', medications: 'Meds', therapies: 'Therapies' } as const
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                    tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500',
                  )}
                >
                  {labels[t]}{counts[t] !== '' && ` (${counts[t]})`}
                </button>
              )
            })}
          </div>

          {tab === 'screening' && (
            <ScreeningTab child={selected} onChange={persist} />
          )}
          {tab === 'records' && (
            <MedicalRecordsTab child={selected} onChange={persist} />
          )}
          {tab === 'medications' && (
            <MedicationsTab child={selected} onChange={persist} />
          )}
          {tab === 'therapies' && (
            <TherapiesTab child={selected} onChange={persist} />
          )}
        </>
      )}
    </div>
  )
}

// ── Screening Compliance Tab ───────────────────────────────────────────────────
function ScreeningTab({ child, onChange }: { child: AuraChildProfile; onChange: (c: AuraChildProfile) => Promise<void> }) {
  const ageMonths = getAgeInMonths(child.date_of_birth)
  const records = child.medical_records.filter(r => r.type === 'screening' || r.type === 'vaccination')

  // Match a screening to a record by name keyword in notes
  function findRecord(s: ScreeningRecommendation): MedicalRecord | undefined {
    const keys: string[] = []
    if (s.type === 'autism') keys.push('m-chat', 'autism', 'asd')
    if (s.type === 'developmental') keys.push('developmental', 'dev screen', 'asq')
    if (s.type === 'hearing') keys.push('hearing', 'oae')
    if (s.type === 'vision') keys.push('vision', 'eye')
    return records.find(r => {
      const text = `${r.notes ?? ''} ${r.provider ?? ''}`.toLowerCase()
      return keys.some(k => text.includes(k))
    })
  }

  function statusOf(s: ScreeningRecommendation): 'completed' | 'overdue' | 'due' | 'upcoming' {
    if (findRecord(s)) return 'completed'
    if (ageMonths >= s.due_at_months + 3) return 'overdue'
    if (ageMonths >= s.due_at_months) return 'due'
    return 'upcoming'
  }

  async function markCompleted(s: ScreeningRecommendation) {
    const record: MedicalRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      type: 'screening',
      notes: `${s.name} — ${s.description}`,
    }
    await onChange({ ...child, medical_records: [...child.medical_records, record] })
  }

  // Counts
  let completed = 0, overdue = 0, due = 0, upcoming = 0
  const groups = SCREENING_SCHEDULE.map(s => {
    const status = statusOf(s)
    if (status === 'completed') completed++
    else if (status === 'overdue') overdue++
    else if (status === 'due') due++
    else upcoming++
    return { s, status, record: findRecord(s) }
  })

  const typeIcons = {
    developmental: ClipboardList,
    hearing: Ear,
    vision: Eye,
    autism: Activity,
  } as const

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Stat color="text-emerald-600" icon={CheckCircle2} value={completed.toString()} label="Completed" />
        <Stat color={overdue > 0 ? 'text-rose-600' : 'text-amber-600'} icon={AlertCircle} value={(overdue + due).toString()} label="Due / overdue" />
        <Stat color="text-gray-500" icon={Calendar} value={upcoming.toString()} label="Upcoming" />
      </div>

      {overdue > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">
            <strong>{overdue} screening{overdue === 1 ? '' : 's'} overdue.</strong>{' '}
            Bring this up at your next paediatric visit — most can be done in office.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {groups.map(({ s, status, record }) => {
          const Icon = typeIcons[s.type]
          const cfg = {
            completed: { color: 'text-emerald-700', bg: 'bg-emerald-50',  ring: 'border-emerald-200', label: '✓ Done' },
            overdue:   { color: 'text-rose-700',    bg: 'bg-rose-50',     ring: 'border-rose-200',    label: 'Overdue' },
            due:       { color: 'text-amber-700',   bg: 'bg-amber-50',    ring: 'border-amber-200',   label: 'Due now' },
            upcoming:  { color: 'text-gray-700',    bg: 'bg-white/80',    ring: 'border-gray-200',    label: 'Upcoming' },
          }[status]
          return (
            <div key={`${s.name}-${s.due_at_months}`} className={cn('rounded-2xl border p-3', cfg.bg, cfg.ring)}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn('text-sm font-bold', cfg.color)}>{s.name}</p>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-white border', cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Due at {s.due_at_months < 24 ? `${s.due_at_months} months` : `${Math.floor(s.due_at_months / 12)} years`}
                  </p>
                  {record && (
                    <p className="text-[10px] text-emerald-600 mt-1">
                      Logged {new Date(record.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                {status !== 'completed' && (
                  <button
                    onClick={() => markCompleted(s)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0',
                      status === 'overdue' || status === 'due'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Mark done
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed text-center">
        Universal screening schedule from CDC/AAP guidance. Completion is auto-detected from your medical records&apos; notes — keywords like &quot;M-CHAT&quot;, &quot;hearing&quot;, &quot;developmental&quot; trigger a match.
      </p>
    </>
  )
}

function Stat({ color, icon: Icon, value, label }: { color: string; icon: typeof CheckCircle2; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-xl font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
    </div>
  )
}

// ── Medical Records Tab ────────────────────────────────────────────────────────
function MedicalRecordsTab({ child, onChange }: { child: AuraChildProfile; onChange: (c: AuraChildProfile) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<MedicalRecord['type']>('appointment')
  const [provider, setProvider] = useState('')
  const [notes, setNotes] = useState('')
  const [followUp, setFollowUp] = useState('')

  async function handleAdd() {
    const record: MedicalRecord = {
      id: crypto.randomUUID(),
      date, type,
      provider: provider || undefined,
      notes: notes || undefined,
      follow_up_date: followUp || undefined,
    }
    await onChange({ ...child, medical_records: [...child.medical_records, record] })
    setProvider(''); setNotes(''); setFollowUp(''); setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return
    await onChange({ ...child, medical_records: child.medical_records.filter(r => r.id !== id) })
  }

  const typeIcons: Record<MedicalRecord['type'], typeof Calendar> = {
    appointment: Calendar,
    screening: ClipboardList,
    vaccination: Syringe,
    therapy_session: Activity,
    other: Calendar,
  }

  const sorted = child.medical_records.slice().sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">New medical record</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Type">
              <select value={type} onChange={e => setType(e.target.value as MedicalRecord['type'])} className={inputClass}>
                <option value="appointment">Appointment</option>
                <option value="screening">Screening</option>
                <option value="vaccination">Vaccination</option>
                <option value="therapy_session">Therapy session</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <Field label="Provider / clinic">
            <input value={provider} onChange={e => setProvider(e.target.value)} placeholder="Dr. Sharma · Apollo" className={inputClass} />
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Visit summary, prescriptions, observations…" className={cn(inputClass, 'resize-none')} />
          </Field>
          <Field label="Follow-up date (optional)">
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className={inputClass} />
          </Field>
          <FormActions onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <AddButton label="Add medical record" onClick={() => setShowForm(true)} />
      )}

      {sorted.length === 0 ? (
        <Empty message="No medical records yet. Track appointments, vaccinations, and screenings here." />
      ) : (
        <div className="space-y-2">
          {sorted.map(r => {
            const Icon = typeIcons[r.type]
            return (
              <div key={r.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 capitalize">{r.type.replace('_', ' ')}</p>
                      <span className="text-[11px] text-gray-400">
                        {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {r.provider && <p className="text-xs text-gray-600 mt-0.5">{r.provider}</p>}
                    {r.notes && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.notes}</p>}
                    {r.follow_up_date && (
                      <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Follow-up: {new Date(r.follow_up_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Medications Tab ────────────────────────────────────────────────────────────
function MedicationsTab({ child, onChange }: { child: AuraChildProfile; onChange: (c: AuraChildProfile) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState('')
  const [started, setStarted] = useState('')
  const [prescriber, setPrescriber] = useState('')

  async function handleAdd() {
    if (!name) return
    const med: Medication = {
      id: crypto.randomUUID(),
      name,
      dose: dose || undefined,
      frequency: frequency || undefined,
      started_date: started || undefined,
      prescriber: prescriber || undefined,
    }
    await onChange({ ...child, medications: [...child.medications, med] })
    setName(''); setDose(''); setFrequency(''); setStarted(''); setPrescriber('')
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this medication?')) return
    await onChange({ ...child, medications: child.medications.filter(m => m.id !== id) })
  }

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">New medication</p>
          <Field label="Name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Methylphenidate" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Dose">
              <input value={dose} onChange={e => setDose(e.target.value)} placeholder="10mg" className={inputClass} />
            </Field>
            <Field label="Frequency">
              <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Twice daily" className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Started">
              <input type="date" value={started} onChange={e => setStarted(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Prescriber">
              <input value={prescriber} onChange={e => setPrescriber(e.target.value)} placeholder="Dr. Iyer" className={inputClass} />
            </Field>
          </div>
          <FormActions onSave={handleAdd} onCancel={() => setShowForm(false)} disabled={!name} />
        </div>
      ) : (
        <AddButton label="Add medication" onClick={() => setShowForm(true)} />
      )}

      {child.medications.length === 0 ? (
        <Empty message="No medications listed. Track active prescriptions and supplements here." />
      ) : (
        <div className="space-y-2">
          {child.medications.map(m => (
            <div key={m.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <Pill className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[m.dose, m.frequency].filter(Boolean).join(' · ') || 'No dose info'}
                </p>
                {(m.started_date || m.prescriber) && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {m.started_date && `Since ${new Date(m.started_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    {m.started_date && m.prescriber && ' · '}
                    {m.prescriber}
                  </p>
                )}
              </div>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Therapies Tab ──────────────────────────────────────────────────────────────
function TherapiesTab({ child, onChange }: { child: AuraChildProfile; onChange: (c: AuraChildProfile) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<TherapyRecord['type']>('OT')
  const [provider, setProvider] = useState('')
  const [frequency, setFrequency] = useState('')
  const [started, setStarted] = useState('')
  const [notes, setNotes] = useState('')

  async function handleAdd() {
    const t: TherapyRecord = {
      type,
      provider: provider || undefined,
      frequency: frequency || undefined,
      started_date: started || undefined,
      notes: notes || undefined,
    }
    await onChange({ ...child, therapies: [...child.therapies, t] })
    setProvider(''); setFrequency(''); setStarted(''); setNotes('')
    setShowForm(false)
  }

  async function handleDelete(idx: number) {
    if (!confirm('Delete this therapy entry?')) return
    await onChange({ ...child, therapies: child.therapies.filter((_, i) => i !== idx) })
  }

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-purple-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">New therapy</p>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value as TherapyRecord['type'])} className={inputClass}>
              {(Object.entries(THERAPY_TYPE_LABELS) as [TherapyRecord['type'], string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Provider / centre">
            <input value={provider} onChange={e => setProvider(e.target.value)} placeholder="Therapist name or centre" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Frequency">
              <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="2x / week" className={inputClass} />
            </Field>
            <Field label="Started">
              <input type="date" value={started} onChange={e => setStarted(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Goals, current focus areas…" className={cn(inputClass, 'resize-none')} />
          </Field>
          <FormActions onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <AddButton label="Add therapy" onClick={() => setShowForm(true)} />
      )}

      {child.therapies.length === 0 ? (
        <Empty message="No therapies on record. Track ongoing OT, PT, speech, or behavioural support here." />
      ) : (
        <div className="space-y-2">
          {child.therapies.map((t, idx) => (
            <div key={idx} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{THERAPY_TYPE_LABELS[t.type]}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[t.provider, t.frequency].filter(Boolean).join(' · ') || 'No details'}
                </p>
                {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
              </div>
              <button onClick={() => handleDelete(idx)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Reusable bits ──────────────────────────────────────────────────────────────
const inputClass = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function FormActions({ onSave, onCancel, disabled }: { onSave: () => void; onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-40"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500"
      >
        Cancel
      </button>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 text-purple-600 text-sm font-semibold hover:bg-purple-50"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to start tracking health.</p>
      <Link href="/aura" className="text-xs font-bold text-purple-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
