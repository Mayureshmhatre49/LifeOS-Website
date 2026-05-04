'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Brain, Plus, Trash2, Sparkles, TrendingUp, AlertTriangle, X
} from 'lucide-react'
import type {
  AuraChildProfile, BehaviourLog, BehaviourMood, BehaviourTag,
} from '@/types/aura'
import { BEHAVIOUR_MOOD_LABELS, BEHAVIOUR_TAGS } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { cn } from '@/lib/utils'

export default function AuraBehaviourPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [mood, setMood] = useState<BehaviourMood>('good')
  const [tags, setTags] = useState<BehaviourTag[]>([])
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [triggers, setTriggers] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

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

  function toggleTag(tag: BehaviourTag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function resetForm() {
    setMood('good'); setTags([]); setIntensity(3); setTriggers(''); setNotes('')
    setFormDate(new Date().toISOString().slice(0, 10))
  }

  async function handleAdd() {
    if (!selectedId || saving) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    setSaving(true)
    try {
      const log: BehaviourLog = {
        id: crypto.randomUUID(),
        date: formDate,
        mood, tags,
        intensity: (mood === 'tough' || mood === 'low') ? intensity : undefined,
        triggers: triggers || undefined,
        notes: notes || undefined,
        created_at: new Date().toISOString(),
      }
      const updated: AuraChildProfile = {
        ...child,
        behaviour_logs: [...(child.behaviour_logs ?? []), log],
      }
      await persist(updated)
      resetForm()
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child || !confirm('Delete this entry?')) return
    const updated: AuraChildProfile = {
      ...child,
      behaviour_logs: (child.behaviour_logs ?? []).filter(l => l.id !== id),
    }
    await persist(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-rose-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const logs = (selected?.behaviour_logs ?? []).slice().sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Behaviour Log</h1>
        </div>
      </div>

      <AuraChildSwitcher
        children={profiles}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          {/* Pattern insights */}
          {logs.length >= 3 && <Patterns logs={logs} />}

          {/* 30-day strip */}
          {logs.length > 0 && <ThirtyDayStrip logs={logs} />}

          {/* Add form / button */}
          {showForm ? (
            <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">New behaviour entry</p>
                <button onClick={() => { resetForm(); setShowForm(false) }} className="text-gray-400 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Field label="Date">
                <input type="date" value={formDate} max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setFormDate(e.target.value)}
                  className={inputCls} />
              </Field>

              {/* Mood picker */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Overall mood</p>
                <div className="flex gap-2">
                  {(Object.entries(BEHAVIOUR_MOOD_LABELS) as [BehaviourMood, typeof BEHAVIOUR_MOOD_LABELS[BehaviourMood]][]).map(([m, cfg]) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border transition-all',
                        mood === m ? 'bg-rose-100 border-rose-300' : 'border-gray-100 bg-gray-50',
                      )}
                    >
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="text-[9px] font-semibold text-gray-500">{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">What was the day like? (pick any)</p>
                <div className="flex flex-wrap gap-1.5">
                  {BEHAVIOUR_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all',
                        tags.includes(tag)
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-rose-200',
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity (only if low/tough) */}
              {(mood === 'tough' || mood === 'low') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-gray-500">Intensity</span>
                    <span className="text-[11px] font-semibold text-rose-600">{intensity}/5</span>
                  </div>
                  <input type="range" min={1} max={5} value={intensity}
                    onChange={e => setIntensity(Number(e.target.value) as 1|2|3|4|5)}
                    className="w-full accent-rose-500" />
                </div>
              )}

              <Field label="Possible triggers">
                <input value={triggers} onChange={e => setTriggers(e.target.value)} placeholder="Sensory overload, missed nap, transition…" className={inputCls} />
              </Field>
              <Field label="Notes">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="What helped, what made it worse, anything to remember…" className={cn(inputCls, 'resize-none')} />
              </Field>

              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-40">
                  {saving ? 'Saving…' : 'Log entry'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 text-rose-600 text-sm font-semibold hover:bg-rose-50"
            >
              <Plus className="h-4 w-4" />
              Log today
            </button>
          )}

          {/* History */}
          {logs.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">No behaviour logs yet.</p>
              <p className="text-xs text-gray-400 mt-1">Daily entries help you notice patterns over weeks.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent</p>
              {logs.slice(0, 30).map(log => (
                <LogCard key={log.id} log={log} onDelete={() => handleDelete(log.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Pattern detection ──────────────────────────────────────────────────────────
function Patterns({ logs }: { logs: BehaviourLog[] }) {
  // Tag frequency
  const tagCounts = new Map<BehaviourTag, number>()
  for (const log of logs) {
    for (const t of log.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
  }
  const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  // Tough-day weekday pattern
  const toughByWeekday: number[] = Array(7).fill(0)
  let toughCount = 0
  for (const log of logs) {
    if (log.mood === 'tough' || log.mood === 'low') {
      toughByWeekday[new Date(log.date + 'T12:00:00').getDay()]++
      toughCount++
    }
  }
  const peak = toughByWeekday.reduce((p, c, i) => c > p.c ? { c, i } : p, { c: 0, i: -1 })
  const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

  // Mood split
  const moodCounts: Record<BehaviourMood, number> = { great: 0, good: 0, okay: 0, low: 0, tough: 0 }
  for (const l of logs) moodCounts[l.mood]++
  const positivePct = Math.round(((moodCounts.great + moodCounts.good) / logs.length) * 100)

  const insights: string[] = []
  if (positivePct >= 60) insights.push(`${positivePct}% of recent days were Good or Great — strong overall.`)
  else if (positivePct < 30) insights.push(`Only ${positivePct}% of recent days are positive. Worth flagging at next check-in.`)
  if (topTag && topTag[1] >= 3) insights.push(`"${topTag[0]}" appears in ${topTag[1]} entries — a recurring theme.`)
  if (peak.c >= 2 && toughCount >= 3) insights.push(`${dayNames[peak.i]} show the most tough days (${peak.c} of ${toughCount}). Consider what makes them harder.`)
  if (insights.length === 0) insights.push('Keep logging — patterns become visible after ~7-10 entries.')

  return (
    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-rose-500" />
        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Patterns</p>
      </div>
      <ul className="space-y-1.5">
        {insights.map((line, i) => (
          <li key={i} className="text-xs text-gray-700 leading-relaxed flex gap-2">
            <span className="text-rose-400 font-bold shrink-0">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── 30-day strip ───────────────────────────────────────────────────────────────
function ThirtyDayStrip({ logs }: { logs: BehaviourLog[] }) {
  const byDate = new Map<string, BehaviourLog>()
  for (const l of logs) byDate.set(l.date, l) // last log per day wins

  const days: Array<{ date: string; log: BehaviourLog | null; isToday: boolean }> = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, log: byDate.get(key) ?? null, isToday: i === 0 })
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">30-day overview</p>
        <span className="text-[10px] text-gray-400">{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <div className="grid grid-cols-[repeat(30,_1fr)] gap-0.5">
        {days.map(d => {
          const cfg = d.log ? BEHAVIOUR_MOOD_LABELS[d.log.mood] : null
          return (
            <div
              key={d.date}
              title={d.log ? `${d.date}: ${cfg!.label}` : d.date}
              className={cn(
                'aspect-square rounded-sm border',
                d.log ? cellColor(d.log.mood) : 'bg-gray-50 border-gray-100',
                d.isToday && 'ring-1 ring-rose-300',
              )}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
      <div className="flex gap-2 mt-2 text-[10px] text-gray-500">
        <Legend label="Great" cls={cellColor('great')} />
        <Legend label="Good"  cls={cellColor('good')} />
        <Legend label="Okay"  cls={cellColor('okay')} />
        <Legend label="Low"   cls={cellColor('low')} />
        <Legend label="Tough" cls={cellColor('tough')} />
      </div>
    </div>
  )
}

function cellColor(m: BehaviourMood): string {
  switch (m) {
    case 'great': return 'bg-emerald-400 border-emerald-500'
    case 'good':  return 'bg-green-300 border-green-400'
    case 'okay':  return 'bg-amber-200 border-amber-300'
    case 'low':   return 'bg-orange-300 border-orange-400'
    case 'tough': return 'bg-rose-400 border-rose-500'
  }
}

function Legend({ label, cls }: { label: string; cls: string }) {
  return <span className="flex items-center gap-1"><span className={cn('h-2 w-2 rounded-sm', cls)} />{label}</span>
}

// ── Log card ───────────────────────────────────────────────────────────────────
function LogCard({ log, onDelete }: { log: BehaviourLog; onDelete: () => void }) {
  const cfg = BEHAVIOUR_MOOD_LABELS[log.mood]
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 flex items-start gap-3">
      <span className="text-2xl shrink-0">{cfg.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</p>
          <span className="text-[11px] text-gray-400">
            {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          {log.intensity && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">Intensity {log.intensity}</span>}
        </div>
        {log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {log.tags.map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">{t}</span>
            ))}
          </div>
        )}
        {log.triggers && (
          <p className="text-xs text-gray-600 mt-1.5 flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
            <span><span className="font-semibold">Trigger:</span> {log.triggers}</span>
          </p>
        )}
        {log.notes && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{log.notes}</p>}
      </div>
      <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 shrink-0">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Reusable bits ──────────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to start tracking behaviour patterns.</p>
      <Link href="/aura" className="text-xs font-bold text-rose-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
