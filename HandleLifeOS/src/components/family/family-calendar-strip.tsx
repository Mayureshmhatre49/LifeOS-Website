'use client'

import { useState } from 'react'
import type { FamilyEvent, FamilyEventType } from '@/types/family'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, CalendarDays, Trash2 } from 'lucide-react'

interface Props {
  events: FamilyEvent[]
  familyId: string
  onAdd: (data: { title: string; event_type?: FamilyEventType; start_date: string; notes?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS) as [FamilyEventType, string][]

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return date.toLocaleDateString('en', { weekday: 'long' })
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function FamilyCalendarStrip({ events, familyId, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<FamilyEventType>('other')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startDate) return
    setSaving(true)
    await onAdd({ title: title.trim(), event_type: eventType, start_date: startDate, notes: notes || undefined })
    setTitle(''); setNotes(''); setAdding(false)
    setSaving(false)
  }

  const upcoming = events.slice(0, 8)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-700">Upcoming</h3>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          <PlusCircle className="h-3.5 w-3.5" />
          Add event
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Event title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Doctor appointment" className="mt-1" autoFocus required />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select value={eventType} onChange={e => setEventType(e.target.value as FamilyEventType)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                {EVENT_TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 h-8 text-sm" required />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Add event'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {upcoming.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-400">No upcoming events in the next 30 days</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {upcoming.map(ev => (
            <li key={ev.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 group">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: EVENT_TYPE_COLORS[ev.event_type] }}
                role="presentation"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{ev.title}</p>
                <p className="text-xs text-gray-400">{dayLabel(ev.start_date)} · {EVENT_TYPE_LABELS[ev.event_type]}</p>
              </div>
              <button onClick={() => onDelete(ev.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
