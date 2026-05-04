'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Check, Plane, Hotel, Activity, Car, Utensils, FileText, Wallet, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trip {
  id: string; destination: string; start_date: string | null; end_date: string | null;
  status: string; budget_total: number | null; spent_total: number; currency: string;
  travellers: number; notes: string | null; cover_emoji: string | null;
}

interface TripItem {
  id: string; trip_id: string; type: string; title: string;
  starts_at: string | null; ends_at: string | null; location: string | null;
  cost: number | null; booking_ref: string | null; notes: string | null;
  is_done: boolean; order_index: number;
}

interface PackingItem {
  id: string; trip_id: string; item: string; category: string | null; qty: number; is_packed: boolean;
}

const ITEM_ICONS: Record<string, typeof Plane> = {
  flight: Plane, hotel: Hotel, activity: Activity, transport: Car, meal: Utensils, note: FileText, expense: Wallet, other: FileText,
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [items, setItems] = useState<TripItem[]>([])
  const [packing, setPacking] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'itinerary' | 'packing' | 'notes'>('itinerary')
  const [newItem, setNewItem] = useState({ title: '', type: 'activity' })
  const [newPack, setNewPack] = useState('')

  async function load() {
    const r = await fetch(`/api/travel/${params.id}`).then(r => r.json())
    setTrip(r.trip); setItems(r.items ?? []); setPacking(r.packing ?? [])
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [params.id])

  async function addItem() {
    if (!newItem.title.trim()) return
    await fetch(`/api/travel/${params.id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'item', title: newItem.title, type: newItem.type }) })
    setNewItem({ title: '', type: 'activity' })
    load()
  }
  async function toggleItem(item: TripItem) {
    await fetch(`/api/travel/${params.id}/items`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'item', id: item.id, is_done: !item.is_done }) })
    load()
  }
  async function delItem(id: string) {
    await fetch(`/api/travel/${params.id}/items?kind=item&item_id=${id}`, { method: 'DELETE' })
    load()
  }

  async function addPack() {
    if (!newPack.trim()) return
    await fetch(`/api/travel/${params.id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'packing', item: newPack.trim() }) })
    setNewPack(''); load()
  }
  async function togglePack(p: PackingItem) {
    await fetch(`/api/travel/${params.id}/items`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'packing', id: p.id, is_packed: !p.is_packed }) })
    load()
  }
  async function delPack(id: string) {
    await fetch(`/api/travel/${params.id}/items?kind=packing&item_id=${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent" /></div>
  if (!trip) return <div className="p-6"><Link href="/travel" className="text-blue-600 text-sm">← Back</Link><p className="mt-4 text-sm text-gray-500">Trip not found</p></div>

  const totalCost = items.filter(i => i.cost).reduce((s, i) => s + (i.cost ?? 0), 0)
  const packed = packing.filter(p => p.is_packed).length

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/travel" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="h-4 w-4 text-gray-500" /></Link>
        <span className="text-2xl">{trip.cover_emoji ?? '✈️'}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{trip.destination}</h1>
          <p className="text-[11px] text-gray-400">
            {trip.start_date && new Date(trip.start_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {trip.end_date && ` → ${new Date(trip.end_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat value={`${items.length}`} label="Itinerary items" />
        <Stat value={`${packed}/${packing.length}`} label="Packed" />
        <Stat value={trip.budget_total ? `₹${totalCost}/${trip.budget_total}` : `₹${totalCost}`} label="Spending" />
      </div>

      <div className="flex rounded-xl bg-gray-100 p-0.5">
        {(['itinerary', 'packing', 'notes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize', tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'itinerary' && (
        <>
          <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-3 flex gap-2">
            <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-xs">
              <option value="flight">Flight</option><option value="hotel">Hotel</option><option value="activity">Activity</option>
              <option value="transport">Transport</option><option value="meal">Meal</option><option value="note">Note</option>
            </select>
            <input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="Add item…" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
            <button onClick={addItem} className="px-3 rounded-xl bg-blue-600 text-white"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">No itinerary items yet</p></div>
          ) : (
            <div className="space-y-2">
              {items.map(item => {
                const Icon = ITEM_ICONS[item.type] ?? FileText
                return (
                  <div key={item.id} className={cn('rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 flex items-center gap-3', item.is_done && 'opacity-60')}>
                    <button onClick={() => toggleItem(item)} className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2', item.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200')}>
                      {item.is_done && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <Icon className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold text-gray-800', item.is_done && 'line-through')}>{item.title}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{item.type}{item.cost ? ` · ₹${item.cost}` : ''}</p>
                    </div>
                    <button onClick={() => delItem(item.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'packing' && (
        <>
          <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-3 flex gap-2">
            <input value={newPack} onChange={e => setNewPack(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPack()} placeholder="Add packing item…" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
            <button onClick={addPack} className="px-3 rounded-xl bg-blue-600 text-white"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          {packing.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500">Packing list empty</p>
              <p className="text-xs text-gray-400 mt-1">Common: passport, phone charger, toothbrush, medication, swimsuit…</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {packing.map(p => (
                <div key={p.id} className={cn('rounded-xl bg-white/80 border border-white/60 shadow-sm p-2.5 flex items-center gap-3', p.is_packed && 'opacity-60')}>
                  <button onClick={() => togglePack(p)} className={cn('h-5 w-5 rounded flex items-center justify-center shrink-0 border-2', p.is_packed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200')}>
                    {p.is_packed && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className={cn('flex-1 text-sm', p.is_packed && 'line-through text-gray-500')}>{p.item}</span>
                  <button onClick={() => delPack(p.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'notes' && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <textarea
            value={trip.notes ?? ''}
            onChange={e => setTrip({ ...trip, notes: e.target.value })}
            onBlur={async () => {
              await fetch(`/api/travel/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: trip.notes }) })
            }}
            rows={10} placeholder="Notes — local tips, contacts, important info…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none"
          />
        </div>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 text-center">
      <p className="text-base font-bold text-blue-600">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  )
}
