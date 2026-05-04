'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X, GripVertical } from 'lucide-react'
import type { Routine, RoutineType } from '@/types/planner'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ROUTINE_TYPES: RoutineType[] = ['morning', 'evening', 'work', 'study', 'weekend', 'custom']

export function RoutineBuilder() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<RoutineType>('morning')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState('07:00')
  const [steps, setSteps] = useState<Array<{ title: string; duration_minutes: string; order_index: number }>>([])

  useEffect(() => {
    fetch('/api/routines')
      .then((r) => r.ok ? r.json() : [])
      .then(setRoutines)
      .finally(() => setLoading(false))
  }, [])

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort())
  }

  function addStep() {
    setSteps((prev) => [...prev, { title: '', duration_minutes: '10', order_index: prev.length }])
  }

  function updateStep(i: number, field: 'title' | 'duration_minutes', value: string) {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order_index: idx })))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          days_of_week: days,
          start_time: startTime,
          steps: steps.filter((s) => s.title.trim()).map((s, i) => ({
            title: s.title.trim(),
            duration_minutes: parseInt(s.duration_minutes) || undefined,
            order_index: i,
          })),
        }),
      })
      if (res.ok) {
        const routine = await res.json()
        setRoutines((prev) => [routine, ...prev])
        setShowForm(false)
        resetForm()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(routine: Routine) {
    await fetch(`/api/routines/${routine.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !routine.is_active }),
    })
    setRoutines((prev) => prev.map((r) => r.id === routine.id ? { ...r, is_active: !r.is_active } : r))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/routines/${id}`, { method: 'DELETE' })
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  function resetForm() {
    setName(''); setType('morning'); setDays([1, 2, 3, 4, 5]); setStartTime('07:00'); setSteps([])
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Routines</h1>
          <p className="text-sm text-gray-400 mt-0.5">Build habits that stick</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />New routine
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">New routine</h2>
            <Button variant="ghost" size="icon-sm" onClick={() => { setShowForm(false); resetForm() }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Routine name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning routine" className="mt-1" autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RoutineType)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ROUTINE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <Label>Start time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Days</Label>
              <div className="mt-1 flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                      days.includes(i) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Steps</Label>
                <button type="button" onClick={addStep} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" />Add step
                </button>
              </div>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(i, 'title', e.target.value)}
                      placeholder={`Step ${i + 1}`}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={step.duration_minutes}
                      onChange={(e) => updateStep(i, 'duration_minutes', e.target.value)}
                      className="w-20"
                      placeholder="min"
                      min={1}
                    />
                    <Button variant="ghost" size="icon-sm" type="button" onClick={() => removeStep(i)} className="hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }} className="flex-1">Cancel</Button>
              <Button type="submit" loading={saving} disabled={!name.trim()} className="flex-1">Save routine</Button>
            </div>
          </form>
        </div>
      )}

      {/* Routine list */}
      {routines.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">🌅</div>
          <p className="text-sm text-gray-500 font-medium">No routines yet</p>
          <p className="text-xs text-gray-400 mt-1">Build a morning or evening routine to start your days right.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div key={routine.id} className={`rounded-xl border bg-white p-4 transition-opacity ${routine.is_active ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{routine.name}</span>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{routine.type}</span>
                    {routine.start_time && (
                      <span className="text-xs text-gray-400">{routine.start_time}</span>
                    )}
                  </div>
                  <div className="mt-1 flex gap-1">
                    {DAY_LABELS.map((label, i) => (
                      <span
                        key={i}
                        className={`text-xs ${routine.days_of_week.includes(i) ? 'text-indigo-600 font-medium' : 'text-gray-300'}`}
                      >
                        {label.slice(0, 1)}
                      </span>
                    ))}
                  </div>
                  {routine.steps && routine.steps.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{routine.steps.length} steps</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(routine)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${routine.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    aria-label={routine.is_active ? 'Disable routine' : 'Enable routine'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${routine.is_active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(routine.id)}
                    className="hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
