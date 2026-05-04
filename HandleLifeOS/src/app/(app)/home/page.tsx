'use client'

import { useState, useEffect } from 'react'
import {
  Home as HomeIcon, Wrench, Lightbulb, Plus, Trash2, X, Calendar, AlertCircle,
  Check, Box, Car as CarIcon, Sofa, Building, Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomeAsset {
  id: string; name: string; type: 'appliance' | 'furniture' | 'vehicle' | 'property' | 'other';
  brand: string | null; model: string | null; serial_no: string | null;
  purchased_at: string | null; warranty_until: string | null; cost: number | null; notes: string | null;
  created_at: string;
}

interface Maintenance {
  id: string; asset_id: string | null; title: string; category: string | null;
  recurrence_months: number | null; last_done_at: string | null; next_due_at: string | null;
  vendor: string | null; cost: number | null; notes: string | null; is_active: boolean;
}

interface Bill {
  id: string; utility: string; provider: string | null; amount: number;
  bill_date: string; due_date: string | null; is_paid: boolean; account_no: string | null; notes: string | null;
}

const ASSET_ICONS = { appliance: Box, furniture: Sofa, vehicle: CarIcon, property: Building, other: Box } as const

export default function HomePage() {
  const [assets, setAssets] = useState<HomeAsset[]>([])
  const [maint, setMaint] = useState<Maintenance[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'maintenance' | 'bills' | 'assets'>('maintenance')
  const [showForm, setShowForm] = useState<'asset' | 'maintenance' | 'bill' | null>(null)
  const [f, setF] = useState<Record<string, string | number | boolean>>({})

  async function load() {
    const r = await fetch('/api/home').then(r => r.json())
    setAssets(r.assets ?? []); setMaint(r.maintenance ?? []); setBills(r.bills ?? [])
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function save() {
    if (!showForm) return
    const payload = { kind: showForm, ...f }
    await fetch('/api/home', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setShowForm(null); setF({}); load()
  }
  async function del(kind: string, id: string) {
    if (!confirm('Delete?')) return
    await fetch(`/api/home?kind=${kind}&id=${id}`, { method: 'DELETE' })
    load()
  }
  async function patch(kind: string, id: string, p: Record<string, unknown>) {
    await fetch('/api/home', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, ...p }) })
    load()
  }

  const today = new Date().toISOString().slice(0, 10)
  const overdueMaint = maint.filter(m => m.next_due_at && m.next_due_at < today)
  const dueSoon = maint.filter(m => {
    if (!m.next_due_at || m.next_due_at < today) return false
    const days = Math.ceil((new Date(m.next_due_at).getTime() - Date.now()) / 86_400_000)
    return days <= 30
  })
  const unpaidBills = bills.filter(b => !b.is_paid)
  const expiringWarranties = assets.filter(a => {
    if (!a.warranty_until) return false
    const days = Math.ceil((new Date(a.warranty_until).getTime() - Date.now()) / 86_400_000)
    return days >= 0 && days <= 60
  })

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-200">
              <HomeIcon className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Home & Property</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Maintenance · bills · warranties</p>
        </div>
        <button onClick={() => setShowForm(tab === 'assets' ? 'asset' : tab === 'bills' ? 'bill' : 'maintenance')} className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />Add
        </button>
      </div>

      {/* Alerts */}
      {(overdueMaint.length > 0 || unpaidBills.length > 0 || expiringWarranties.length > 0) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800">Needs attention</p>
          </div>
          {overdueMaint.length > 0 && <p className="text-xs text-amber-700 pl-6">{overdueMaint.length} overdue maintenance task{overdueMaint.length === 1 ? '' : 's'}</p>}
          {unpaidBills.length > 0 && <p className="text-xs text-amber-700 pl-6">{unpaidBills.length} unpaid bill{unpaidBills.length === 1 ? '' : 's'} (₹{unpaidBills.reduce((s, b) => s + Number(b.amount), 0).toLocaleString('en-IN')})</p>}
          {expiringWarranties.length > 0 && <p className="text-xs text-amber-700 pl-6">{expiringWarranties.length} warranty expiring in 60 days</p>}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Wrench} color="text-amber-600" value={`${dueSoon.length}`} label="Due in 30d" />
        <Stat icon={Lightbulb} color="text-rose-600" value={`${unpaidBills.length}`} label="Unpaid bills" />
        <Stat icon={Box} color="text-teal-600" value={`${assets.length}`} label="Assets" />
      </div>

      <div className="flex rounded-xl bg-gray-100 p-0.5">
        {(['maintenance', 'bills', 'assets'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize', tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>
            {t} ({t === 'maintenance' ? maint.length : t === 'bills' ? bills.length : assets.length})
          </button>
        ))}
      </div>

      {showForm && <FormPanel kind={showForm} f={f} setF={setF} onSave={save} onCancel={() => { setShowForm(null); setF({}) }} assets={assets} />}

      {loading ? <div className="flex items-center justify-center py-8"><div className="animate-spin h-5 w-5 rounded-full border-2 border-teal-500 border-t-transparent" /></div> : (
        <>
          {tab === 'maintenance' && <MaintenanceList items={maint} onPatch={(id, p) => patch('maintenance', id, p)} onDelete={(id) => del('maintenance', id)} />}
          {tab === 'bills' && <BillsList bills={bills} onPatch={(id, p) => patch('bill', id, p)} onDelete={(id) => del('bill', id)} />}
          {tab === 'assets' && <AssetsList assets={assets} onDelete={(id) => del('asset', id)} />}
        </>
      )}
    </div>
  )
}

function MaintenanceList({ items, onPatch, onDelete }: { items: Maintenance[]; onPatch: (id: string, p: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <Empty msg="No maintenance scheduled. Add: AC service every 6mo, water tank cleaning, pest control…" />
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="space-y-2">
      {items.map(m => {
        const overdue = m.next_due_at && m.next_due_at < today
        const days = m.next_due_at ? Math.ceil((new Date(m.next_due_at).getTime() - Date.now()) / 86_400_000) : null
        return (
          <div key={m.id} className={cn('rounded-2xl border p-3 flex items-center gap-3', overdue ? 'bg-rose-50 border-rose-200' : 'bg-white/80 border-white/60')}>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{m.title}</p>
              <p className="text-[11px] text-gray-500">
                {m.category && <span>{m.category} · </span>}
                {m.next_due_at && (
                  <span className={cn(overdue ? 'text-rose-700 font-bold' : 'text-gray-500')}>
                    {overdue ? 'Overdue ' : 'Due '}
                    {new Date(m.next_due_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {days !== null && days >= 0 && ` (in ${days}d)`}
                  </span>
                )}
                {m.recurrence_months && <span className="ml-2">· every {m.recurrence_months}mo</span>}
              </p>
              {m.vendor && <p className="text-[10px] text-gray-400 mt-0.5">{m.vendor}{m.cost && ` · ₹${m.cost}`}</p>}
            </div>
            <button
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10)
                const next = m.recurrence_months
                  ? new Date(new Date().setMonth(new Date().getMonth() + m.recurrence_months)).toISOString().slice(0, 10)
                  : null
                onPatch(m.id, { last_done_at: today, next_due_at: next })
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 flex items-center gap-1"
            >
              <Check className="h-3 w-3" />Done
            </button>
            <button onClick={() => onDelete(m.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
          </div>
        )
      })}
    </div>
  )
}

function BillsList({ bills, onPatch, onDelete }: { bills: Bill[]; onPatch: (id: string, p: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  if (bills.length === 0) return <Empty msg="No utility bills logged." />
  return (
    <div className="space-y-2">
      {bills.map(b => (
        <div key={b.id} className={cn('rounded-2xl border p-3 flex items-center gap-3', !b.is_paid ? 'bg-rose-50 border-rose-200' : 'bg-white/80 border-white/60', b.is_paid && 'opacity-70')}>
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 capitalize">{b.utility}{b.provider && ` · ${b.provider}`}</p>
            <p className="text-[11px] text-gray-500">
              ₹{Number(b.amount).toLocaleString('en-IN')}
              {b.due_date && <span className={cn('ml-2', !b.is_paid && b.due_date < new Date().toISOString().slice(0, 10) && 'text-rose-700 font-bold')}>
                Due {new Date(b.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>}
            </p>
          </div>
          <button onClick={() => onPatch(b.id, { is_paid: !b.is_paid })} className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1', b.is_paid ? 'bg-gray-100 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700')}>
            <Check className="h-3 w-3" />{b.is_paid ? 'Paid' : 'Mark paid'}
          </button>
          <button onClick={() => onDelete(b.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
    </div>
  )
}

function AssetsList({ assets, onDelete }: { assets: HomeAsset[]; onDelete: (id: string) => void }) {
  if (assets.length === 0) return <Empty msg="No assets tracked. Add appliances, vehicles, furniture for warranty + maintenance reminders." />
  return (
    <div className="space-y-2">
      {assets.map(a => {
        const Icon = ASSET_ICONS[a.type] ?? Box
        const today = new Date().toISOString().slice(0, 10)
        const expSoon = a.warranty_until && a.warranty_until >= today && Math.ceil((new Date(a.warranty_until).getTime() - Date.now()) / 86_400_000) <= 60
        return (
          <div key={a.id} className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{a.name}</p>
              <p className="text-[11px] text-gray-500">
                <span className="capitalize">{a.type}</span>
                {a.brand && ` · ${a.brand}`}
                {a.model && ` ${a.model}`}
              </p>
              {(a.purchased_at || a.warranty_until) && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {a.purchased_at && <>Bought {new Date(a.purchased_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>}
                  {a.warranty_until && <span className={cn('ml-2', expSoon && 'text-amber-600 font-bold')}>
                    Warranty {new Date(a.warranty_until + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>}
                </p>
              )}
            </div>
            <button onClick={() => onDelete(a.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
          </div>
        )
      })}
    </div>
  )
}

function FormPanel({ kind, f, setF, onSave, onCancel, assets }: {
  kind: 'asset' | 'maintenance' | 'bill'
  f: Record<string, string | number | boolean>
  setF: (f: Record<string, string | number | boolean>) => void
  onSave: () => void
  onCancel: () => void
  assets: HomeAsset[]
}) {
  return (
    <div className="rounded-2xl bg-white border border-teal-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800 capitalize">New {kind}</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      {kind === 'asset' && (
        <>
          <input value={String(f.name ?? '')} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Name (e.g., LG fridge)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <select value={String(f.type ?? 'appliance')} onChange={e => setF({ ...f, type: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <option value="appliance">Appliance</option><option value="furniture">Furniture</option><option value="vehicle">Vehicle</option><option value="property">Property</option><option value="other">Other</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input value={String(f.brand ?? '')} onChange={e => setF({ ...f, brand: e.target.value })} placeholder="Brand" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
            <input value={String(f.model ?? '')} onChange={e => setF({ ...f, model: e.target.value })} placeholder="Model" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Purchased</label><input type="date" value={String(f.purchased_at ?? '')} onChange={e => setF({ ...f, purchased_at: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Warranty until</label><input type="date" value={String(f.warranty_until ?? '')} onChange={e => setF({ ...f, warranty_until: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
        </>
      )}
      {kind === 'maintenance' && (
        <>
          <input value={String(f.title ?? '')} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Title (e.g., AC service)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input value={String(f.category ?? '')} onChange={e => setF({ ...f, category: e.target.value })} placeholder="Category (cleaning/service/repair)" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
            <input type="number" placeholder="Recur every X months (optional)" value={String(f.recurrence_months ?? '')} onChange={e => setF({ ...f, recurrence_months: parseInt(e.target.value) || 0 })} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          </div>
          <div><label className="text-[10px] text-gray-500">Next due</label><input type="date" value={String(f.next_due_at ?? '')} onChange={e => setF({ ...f, next_due_at: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          {assets.length > 0 && (
            <select value={String(f.asset_id ?? '')} onChange={e => setF({ ...f, asset_id: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <option value="">Linked asset (optional)</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
        </>
      )}
      {kind === 'bill' && (
        <>
          <input value={String(f.utility ?? '')} onChange={e => setF({ ...f, utility: e.target.value })} placeholder="Utility (electricity, water, internet…)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <input value={String(f.provider ?? '')} onChange={e => setF({ ...f, provider: e.target.value })} placeholder="Provider (optional)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] text-gray-500">Amount</label><input type="number" value={String(f.amount ?? '')} onChange={e => setF({ ...f, amount: parseFloat(e.target.value) || 0 })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Bill date</label><input type="date" value={String(f.bill_date ?? new Date().toISOString().slice(0, 10))} onChange={e => setF({ ...f, bill_date: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Due date</label><input type="date" value={String(f.due_date ?? '')} onChange={e => setF({ ...f, due_date: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
        </>
      )}
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700">Save</button>
        <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, color, value, label }: { icon: typeof Wrench; color: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">{msg}</p></div>
}
