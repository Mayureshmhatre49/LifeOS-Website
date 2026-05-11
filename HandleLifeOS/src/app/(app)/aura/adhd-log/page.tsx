'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Plus, Trash2, Home, School, Info } from 'lucide-react'
import type {
  AuraChildProfile, ADHDSymptomReport, ADHDSetting, ADHDSymptomRating,
} from '@/types/aura'
import {
  ADHD_INATTENTION_ITEMS, ADHD_HYPERACTIVITY_ITEMS,
} from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { cn } from '@/lib/utils'

const RATING_LABELS = ['Never', 'Occasionally', 'Often', 'Very often']

export default function AuraADHDLogPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [setting, setSetting] = useState<ADHDSetting>('home')
  const [rater, setRater] = useState('')
  const [inattention, setInattention] = useState<ADHDSymptomRating[]>(Array(9).fill(0))
  const [hyperactivity, setHyperactivity] = useState<ADHDSymptomRating[]>(Array(9).fill(0))
  const [notes, setNotes] = useState('')

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

  function resetForm() {
    setDate(new Date().toISOString().slice(0, 10))
    setSetting('home'); setRater('')
    setInattention(Array(9).fill(0)); setHyperactivity(Array(9).fill(0))
    setNotes('')
  }

  async function handleSave() {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    const report: ADHDSymptomReport = {
      id: crypto.randomUUID(),
      date, setting,
      rater: rater || undefined,
      inattention, hyperactivity,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    }
    await persist({
      ...child,
      adhd_reports: [...(child.adhd_reports ?? []), report],
    })
    resetForm()
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child || !confirm('Delete this report?')) return
    await persist({
      ...child,
      adhd_reports: (child.adhd_reports ?? []).filter(r => r.id !== id),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-rose-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const reports = (selected?.adhd_reports ?? []).slice().sort((a, b) => b.date.localeCompare(a.date))

  // Aggregate scores: per setting, count items rated 2-3 ("often" or "very often")
  function scoreReport(r: ADHDSymptomReport) {
    const inattScore = r.inattention.filter(v => v >= 2).length
    const hyperScore = r.hyperactivity.filter(v => v >= 2).length
    return { inattention: inattScore, hyperactivity: hyperScore, total: inattScore + hyperScore }
  }

  // Cross-setting consistency check (DSM-5 requires symptoms in 2+ settings)
  const recentByDate = (() => {
    const map = new Map<string, { home?: ADHDSymptomReport; school?: ADHDSymptomReport }>()
    for (const r of reports.slice(0, 30)) {
      const e = map.get(r.date) ?? {}
      e[r.setting] = r
      map.set(r.date, e)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 5)
  })()

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-md shadow-rose-200">
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ADHD Log</h1>
        </div>
      </div>

      <AuraChildSwitcher profiles={profiles} selectedId={selectedId} onSelect={handleSelect} />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Vanderbilt-style DSM-5 checklist.</strong> Use this to track symptoms across home and school over weeks.
              DSM-5 requires symptoms in <strong>2+ settings</strong> for ADHD diagnosis. Bring filled reports to your paediatrician.
            </p>
          </div>

          {/* Cross-setting summary */}
          {recentByDate.length > 0 && (
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Recent reports — both settings</p>
              <div className="space-y-2">
                {recentByDate.map(([date, pair]) => {
                  const home = pair.home && scoreReport(pair.home)
                  const school = pair.school && scoreReport(pair.school)
                  return (
                    <div key={date} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 w-20 shrink-0">
                        {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <SettingBadge icon={Home} label="Home" score={home?.total} max={18} />
                        <SettingBadge icon={School} label="School" score={school?.total} max={18} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {showForm ? (
            <ReportForm
              date={date} setDate={setDate}
              setting={setting} setSetting={setSetting}
              rater={rater} setRater={setRater}
              inattention={inattention} setInattention={setInattention}
              hyperactivity={hyperactivity} setHyperactivity={setHyperactivity}
              notes={notes} setNotes={setNotes}
              onSave={handleSave}
              onCancel={() => { resetForm(); setShowForm(false) }}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 text-rose-600 text-sm font-semibold hover:bg-rose-50"
            >
              <Plus className="h-4 w-4" />
              New report
            </button>
          )}

          {/* History list */}
          {reports.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">No reports yet.</p>
              <p className="text-xs text-gray-400 mt-1">Aim for one home + one school report every 2-4 weeks before your paediatric visit.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reports</p>
              {reports.slice(0, 30).map(r => {
                const score = scoreReport(r)
                const Icon = r.setting === 'home' ? Home : School
                return (
                  <div key={r.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 flex items-start gap-3">
                    <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
                      r.setting === 'home' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 capitalize">{r.setting}</p>
                        <span className="text-[11px] text-gray-400">
                          {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {r.rater && <span className="text-[10px] text-gray-500">by {r.rater}</span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Inattention: <strong>{score.inattention}/9</strong> · Hyperactivity: <strong>{score.hyperactivity}/9</strong>
                      </p>
                      {r.notes && <p className="text-[11px] text-gray-500 mt-1">{r.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Report form ────────────────────────────────────────────────────────────────
interface FormProps {
  date: string; setDate: (v: string) => void
  setting: ADHDSetting; setSetting: (v: ADHDSetting) => void
  rater: string; setRater: (v: string) => void
  inattention: ADHDSymptomRating[]; setInattention: (v: ADHDSymptomRating[]) => void
  hyperactivity: ADHDSymptomRating[]; setHyperactivity: (v: ADHDSymptomRating[]) => void
  notes: string; setNotes: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

function ReportForm({
  date, setDate, setting, setSetting, rater, setRater,
  inattention, setInattention, hyperactivity, setHyperactivity,
  notes, setNotes, onSave, onCancel,
}: FormProps) {
  function setRating(arr: ADHDSymptomRating[], setter: (v: ADHDSymptomRating[]) => void, idx: number, val: ADHDSymptomRating) {
    const next = [...arr]
    next[idx] = val
    setter(next)
  }

  return (
    <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-4 space-y-4">
      <p className="text-sm font-bold text-gray-800">New ADHD report</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-semibold text-gray-500">Date</label>
          <input type="date" value={date} max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-500">Setting</label>
          <select value={setting} onChange={e => setSetting(e.target.value as ADHDSetting)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <option value="home">Home (parent rating)</option>
            <option value="school">School (teacher rating)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-gray-500">Rater (optional)</label>
        <input value={rater} onChange={e => setRater(e.target.value)}
          placeholder="e.g., Mom, Dad, Mrs. Patel"
          className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>

      <SymptomBlock title="Inattention (9 items)" items={ADHD_INATTENTION_ITEMS}
        ratings={inattention}
        onChange={(idx, val) => setRating(inattention, setInattention, idx, val)} />

      <SymptomBlock title="Hyperactivity & impulsivity (9 items)" items={ADHD_HYPERACTIVITY_ITEMS}
        ratings={hyperactivity}
        onChange={(idx, val) => setRating(hyperactivity, setHyperactivity, idx, val)} />

      <div>
        <label className="text-[11px] font-semibold text-gray-500">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Context, settings, anything else…"
          className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none" />
      </div>

      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600">
          Save report
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  )
}

function SymptomBlock({ title, items, ratings, onChange }: {
  title: string
  items: readonly string[]
  ratings: ADHDSymptomRating[]
  onChange: (idx: number, val: ADHDSymptomRating) => void
}) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-700 mb-2">{title}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl bg-gray-50 border border-gray-100 p-2">
            <p className="text-[11px] text-gray-700 leading-snug mb-1.5">{idx + 1}. {item}</p>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(v => (
                <button
                  key={v}
                  onClick={() => onChange(idx, v as ADHDSymptomRating)}
                  className={cn(
                    'flex-1 py-1 rounded-md border text-[10px] font-bold transition-colors',
                    ratings[idx] === v
                      ? v >= 2
                        ? 'bg-rose-100 border-rose-300 text-rose-700'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-500',
                  )}
                >
                  {RATING_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingBadge({ icon: Icon, label, score, max }: { icon: typeof Home; label: string; score: number | undefined; max: number }) {
  if (score === undefined) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-dashed border-gray-200">
        <Icon className="h-3 w-3 text-gray-300" />
        <span className="text-[10px] text-gray-300">{label} — none</span>
      </div>
    )
  }
  const pct = (score / max) * 100
  const color = pct >= 50 ? 'text-rose-700 bg-rose-50 border-rose-200'
    : pct >= 25 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
  return (
    <div className={cn('flex items-center gap-2 px-2 py-1 rounded-lg border', color)}>
      <Icon className="h-3 w-3" />
      <span className="text-[10px] font-semibold">{label}: {score}/{max}</span>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to log ADHD symptoms.</p>
      <Link href="/aura" className="text-xs font-bold text-rose-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
