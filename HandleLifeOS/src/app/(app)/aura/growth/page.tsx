'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Activity, Plus, Trash2, TrendingUp, Scale, Ruler } from 'lucide-react'
import type { AuraChildProfile, GrowthRecord } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { getAgeInMonths } from '@/lib/aura-logic'
import { calculateBMI, classifyBMI } from '@/lib/aura/score'
import { getPercentile, type PercentileResult } from '@/lib/aura/who-lms'
import { cn } from '@/lib/utils'

export default function AuraGrowthPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [headCm, setHeadCm] = useState('')
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

  async function persistChild(updated: AuraChildProfile) {
    setProfiles(prev => prev.map(c => c.id === updated.id ? updated : c))
    await fetch(`/api/family/aura/profiles/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }

  async function handleAdd() {
    if (!selectedId || saving) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    if (!weightKg && !heightCm && !headCm) return

    setSaving(true)
    try {
      const newRecord: GrowthRecord = {
        id: crypto.randomUUID(),
        date,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        head_circumference_cm: headCm ? parseFloat(headCm) : undefined,
      }
      const updated: AuraChildProfile = {
        ...child,
        growth_records: [...child.growth_records, newRecord].sort((a, b) => a.date.localeCompare(b.date)),
      }
      await persistChild(updated)
      // Reset
      setWeightKg(''); setHeightCm(''); setHeadCm('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(recordId: string) {
    if (!selectedId) return
    const child = profiles.find(c => c.id === selectedId)
    if (!child) return
    if (!confirm('Delete this growth record?')) return
    const updated: AuraChildProfile = {
      ...child,
      growth_records: child.growth_records.filter(r => r.id !== recordId),
    }
    await persistChild(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const records = selected?.growth_records ?? []
  const sorted = records.slice().sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]

  // BMI from latest record
  const bmi = latest?.weight_kg && latest?.height_cm
    ? calculateBMI(latest.weight_kg, latest.height_cm)
    : null
  const ageYears = selected ? getAgeInMonths(selected.date_of_birth) / 12 : 0
  const bmiClass = bmi ? classifyBMI(bmi, ageYears) : null

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center shadow-md shadow-fuchsia-200">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Growth</h1>
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
          {/* Latest snapshot */}
          {latest && (() => {
            const ageMonths = getAgeInMonths(selected.date_of_birth)
            const sex = selected.gender ?? 'male'
            const wPct = latest.weight_kg ? getPercentile('weight', sex, ageMonths, latest.weight_kg) : null
            const hPct = latest.height_cm ? getPercentile('height', sex, ageMonths, latest.height_cm) : null
            return (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Stat icon={Scale}      color="text-fuchsia-500" value={latest.weight_kg ? `${latest.weight_kg}kg` : '—'} label="Weight" sub={wPct ? `P${wPct.percentile}` : undefined} />
                  <Stat icon={Ruler}      color="text-pink-500"    value={latest.height_cm ? `${latest.height_cm}cm` : '—'} label="Height" sub={hPct ? `P${hPct.percentile}` : undefined} />
                  <Stat icon={TrendingUp} color={bmiClass?.color ?? 'text-gray-400'} value={bmi ? bmi.toString() : '—'}    label="BMI"    sub={bmiClass?.label} />
                </div>
                {(wPct || hPct) && <PercentileBands wPct={wPct} hPct={hPct} />}
              </>
            )
          })()}

          {/* Add form */}
          {showForm ? (
            <div className="rounded-2xl bg-white border border-fuchsia-100 shadow-sm p-4 space-y-3">
              <p className="text-sm font-bold text-gray-800">New growth record</p>
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumInput label="Weight (kg)" value={weightKg} onChange={setWeightKg} step="0.1" />
                <NumInput label="Height (cm)" value={heightCm} onChange={setHeightCm} step="0.1" />
                <NumInput label="Head (cm)"   value={headCm}   onChange={setHeadCm}   step="0.1" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={saving || (!weightKg && !heightCm && !headCm)}
                  className="flex-1 py-2 rounded-xl bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save record'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50/50 text-fuchsia-600 text-sm font-semibold hover:bg-fuchsia-50"
            >
              <Plus className="h-4 w-4" />
              Add growth record
            </button>
          )}

          {/* Chart */}
          {records.length >= 2 && <GrowthChart records={records} />}

          {/* History list */}
          {records.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">History</p>
              {sorted.map(r => (
                <div key={r.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {r.weight_kg && <span><Scale className="h-3 w-3 inline mr-0.5 text-fuchsia-400" />{r.weight_kg}kg</span>}
                      {r.height_cm && <span><Ruler className="h-3 w-3 inline mr-0.5 text-pink-400" />{r.height_cm}cm</span>}
                      {r.head_circumference_cm && <span>head {r.head_circumference_cm}cm</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">No growth records yet.</p>
              <p className="text-xs text-gray-400 mt-1">Track height and weight to build a growth chart over time.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function NumInput({ label, value, onChange, step }: { label: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        step={step ?? '0.1'}
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
      />
    </div>
  )
}

function Stat({ icon: Icon, color, value, label, sub }: { icon: typeof Scale; color: string; value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-base font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
      {sub && <p className="text-[9px] text-gray-300 leading-tight truncate">{sub}</p>}
    </div>
  )
}

function GrowthChart({ records }: { records: GrowthRecord[] }) {
  const sorted = records.slice().sort((a, b) => a.date.localeCompare(b.date))
  const weights = sorted.filter(r => r.weight_kg != null).map(r => ({ date: r.date, value: r.weight_kg! }))
  const heights = sorted.filter(r => r.height_cm != null).map(r => ({ date: r.date, value: r.height_cm! }))

  if (weights.length < 2 && heights.length < 2) return null

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
      <p className="text-sm font-bold text-gray-800">Growth chart</p>
      {weights.length >= 2 && <Sparkline points={weights} color="fuchsia" label="Weight (kg)" />}
      {heights.length >= 2 && <Sparkline points={heights} color="pink" label="Height (cm)" />}
    </div>
  )
}

function Sparkline({ points, color, label }: { points: { date: string; value: number }[]; color: 'fuchsia' | 'pink'; label: string }) {
  const minV = Math.min(...points.map(p => p.value))
  const maxV = Math.max(...points.map(p => p.value))
  const range = maxV - minV || 1
  const W = 280, H = 56, P = 4

  const path = points.map((p, i) => {
    const x = P + (i / (points.length - 1)) * (W - 2 * P)
    const y = P + (1 - (p.value - minV) / range) * (H - 2 * P)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const stroke = color === 'fuchsia' ? '#d946ef' : '#ec4899'
  const fill = color === 'fuchsia' ? 'rgba(217, 70, 239, 0.08)' : 'rgba(236, 72, 153, 0.08)'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        <p className="text-[11px] text-gray-400">
          {minV.toFixed(1)} → {maxV.toFixed(1)} <span className="text-emerald-600 font-semibold">↑ {(maxV - minV).toFixed(1)}</span>
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
        <path d={`${path} L${W - P},${H - P} L${P},${H - P} Z`} fill={fill} />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const x = P + (i / (points.length - 1)) * (W - 2 * P)
          const y = P + (1 - (p.value - minV) / range) * (H - 2 * P)
          return <circle key={i} cx={x} cy={y} r="2" fill={stroke} />
        })}
      </svg>
    </div>
  )
}

function PercentileBands({ wPct, hPct }: { wPct: PercentileResult | null; hPct: PercentileResult | null }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">WHO percentile</p>
        <p className="text-[10px] text-gray-400">Approximate · not for diagnosis</p>
      </div>
      {wPct && <Band label="Weight"  result={wPct} />}
      {hPct && <Band label="Height"  result={hPct} />}
    </div>
  )
}

function Band({ label, result }: { label: string; result: PercentileResult }) {
  // Position the marker on a 0-100 bar
  const markerPos = Math.max(2, Math.min(98, result.percentile))
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <span className={cn('text-xs font-bold', result.color)}>
          P{result.percentile} · {result.label}
        </span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden">
        {/* Reference bands: red < P3, amber P3-P15, green P15-P85, amber P85-P97, red > P97 */}
        <div className="absolute inset-0 flex">
          <div className="bg-rose-200" style={{ width: '3%' }} />
          <div className="bg-amber-200" style={{ width: '12%' }} />
          <div className="bg-emerald-200" style={{ width: '70%' }} />
          <div className="bg-amber-200" style={{ width: '12%' }} />
          <div className="bg-rose-200" style={{ width: '3%' }} />
        </div>
        <div className="absolute h-3 w-1 -mt-0.5 bg-gray-800 rounded-sm shadow-sm" style={{ left: `calc(${markerPos}% - 2px)` }} />
      </div>
      <div className="flex justify-between mt-0.5 text-[9px] text-gray-400">
        <span>P3</span><span>P15</span><span>P50</span><span>P85</span><span>P97</span>
      </div>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to start tracking growth.</p>
      <Link href="/aura" className="text-xs font-bold text-fuchsia-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
