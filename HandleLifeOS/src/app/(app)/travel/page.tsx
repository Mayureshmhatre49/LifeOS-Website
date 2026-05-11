'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plane, Plus, Trash2, MapPin, Calendar, Wallet, Users, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

interface Trip {
  id: string; user_id: string; destination: string;
  start_date: string | null; end_date: string | null;
  status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled';
  budget_total: number | null; spent_total: number;
  currency: string; travellers: number; notes: string | null; cover_emoji: string | null;
  created_at: string; updated_at: string;
}

const STATUS_CFG: Record<Trip['status'], { label: string; color: string; bg: string }> = {
  planning:  { label: 'Planning',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'   },
  booked:    { label: 'Booked',     color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'     },
  active:    { label: 'Active',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  completed: { label: 'Completed',  color: 'text-gray-700',    bg: 'bg-gray-50 border-gray-200'     },
  cancelled: { label: 'Cancelled',  color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200'     },
}

export default function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [f, setF] = useState<Partial<Trip>>({ status: 'planning', cover_emoji: '✈️', travellers: 1, currency: 'INR' })

  useEffect(() => {
    fetch('/api/travel').then(r => r.json()).then(({ trips }) => setTrips(trips ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function create() {
    if (!f.destination?.trim()) return
    try {
      const res = await fetch('/api/travel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      if (res.ok) {
        const { trip } = await res.json()
        setTrips(prev => [trip, ...prev])
        setShowForm(false); setF({ status: 'planning', cover_emoji: '✈️', travellers: 1, currency: 'INR' })
        toast({ kind: 'success', message: 'Trip created' })
      } else {
        const j = await res.json().catch(() => ({}))
        toast({ kind: 'error', message: 'Could not create trip', description: j.error })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this trip? Itinerary, packing list and notes will be lost.')) return
    try {
      const res = await fetch(`/api/travel/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== id))
        toast({ kind: 'info', message: 'Trip deleted' })
      } else {
        toast({ kind: 'error', message: 'Could not delete trip' })
      }
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  const upcoming = trips.filter(t => t.status === 'planning' || t.status === 'booked' || t.status === 'active')
  const past = trips.filter(t => t.status === 'completed' || t.status === 'cancelled')

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200">
              <Plane className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Travel</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Plan trips · pack smart · spend mindfully</p>
        </div>
        <button data-testid="new-trip-btn" onClick={() => setShowForm(true)} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />Plan trip
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">New trip</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-2">
            <input value={f.cover_emoji ?? ''} onChange={e => setF({ ...f, cover_emoji: e.target.value.slice(0, 4) })} className="w-14 text-center text-xl rounded-xl border border-gray-200 bg-gray-50 px-2 py-2" placeholder="✈️" />
            <input value={f.destination ?? ''} onChange={e => setF({ ...f, destination: e.target.value })} placeholder="Destination" autoFocus className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Start</label><input type="date" value={f.start_date ?? ''} onChange={e => setF({ ...f, start_date: e.target.value || null })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">End</label><input type="date" value={f.end_date ?? ''} onChange={e => setF({ ...f, end_date: e.target.value || null })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Budget</label><input type="number" value={f.budget_total ?? ''} onChange={e => setF({ ...f, budget_total: e.target.value ? parseFloat(e.target.value) : null })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Travellers</label><input type="number" min={1} value={f.travellers ?? 1} onChange={e => setF({ ...f, travellers: parseInt(e.target.value) || 1 })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} disabled={!f.destination?.trim()} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40">Create trip</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent" /></div>
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <Plane className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No trips yet</p>
          <p className="text-xs text-gray-400 mt-1">Plan your next escape — itinerary, budget, packing list, all in one.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming</p>
              {upcoming.map(t => <TripCard key={t.id} trip={t} onDelete={() => del(t.id)} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Past</p>
              {past.map(t => <TripCard key={t.id} trip={t} onDelete={() => del(t.id)} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function fmt(n: number, cur: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n) }
  catch { return `${cur} ${n.toLocaleString()}` }
}

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: () => void }) {
  const cfg = STATUS_CFG[trip.status]
  const days = trip.start_date && trip.end_date ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86_400_000) + 1 : null
  const daysUntil = trip.start_date ? Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / 86_400_000) : null
  const budgetPct = trip.budget_total ? Math.min(100, (trip.spent_total / trip.budget_total) * 100) : 0

  return (
    <Link href={`/travel/${trip.id}`} className={cn('block rounded-2xl border p-4 hover:shadow-md transition-all', cfg.bg)}>
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{trip.cover_emoji ?? '✈️'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-800">{trip.destination}</p>
            <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white border', cfg.color)}>{cfg.label}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-600">
            {trip.start_date && (
              <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />
                {new Date(trip.start_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {trip.end_date && ` → ${new Date(trip.end_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {days && ` · ${days} days`}
              </span>
            )}
            {trip.travellers > 1 && <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{trip.travellers}</span>}
            {trip.budget_total && (
              <span className="flex items-center gap-1"><Wallet className="h-2.5 w-2.5" />{fmt(trip.spent_total, trip.currency)}{trip.budget_total != null ? `/${fmt(trip.budget_total, trip.currency)}` : ''}</span>
            )}
          </div>
          {daysUntil != null && daysUntil >= 0 && daysUntil <= 60 && trip.status !== 'completed' && (
            <p className={cn('text-[11px] font-bold mt-1', daysUntil <= 7 ? 'text-rose-600' : 'text-blue-600')}>
              {daysUntil === 0 ? 'Today!' : `${daysUntil} days to go`}
            </p>
          )}
          {trip.budget_total && (
            <div className="h-1 rounded-full bg-white/60 overflow-hidden mt-2">
              <div className={cn('h-full rounded-full', budgetPct > 100 ? 'bg-rose-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${Math.min(100, budgetPct)}%` }} />
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete() }} className="p-1 rounded text-gray-300 hover:text-red-400">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </Link>
  )
}
