'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Plus, Trash2, X, ArrowUpRight, ArrowDownRight, Calendar, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'

type InvType = 'mutual_fund' | 'stock' | 'etf' | 'fd' | 'rd' | 'ppf' | 'epf' | 'nps' | 'gold' | 'real_estate' | 'crypto' | 'bond' | 'other'

interface Investment {
  id: string; name: string; type: InvType;
  invested_amount: number; current_value: number;
  units: number | null; avg_cost: number | null;
  account: string | null; start_date: string | null; notes: string | null;
  is_active: boolean; last_synced_at: string | null;
  created_at: string; updated_at: string;
}

interface SIPPlan {
  id: string; investment_id: string | null; name: string;
  amount: number; frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string; next_date: string; end_date: string | null; is_active: boolean; notes: string | null;
}

const INV_TYPE_LABELS: Record<InvType, { label: string; color: string; emoji: string }> = {
  mutual_fund:  { label: 'Mutual Fund',  color: 'text-violet-700',  emoji: '📊' },
  stock:        { label: 'Stock',        color: 'text-emerald-700', emoji: '📈' },
  etf:          { label: 'ETF',          color: 'text-blue-700',    emoji: '🔗' },
  fd:           { label: 'FD',           color: 'text-amber-700',   emoji: '🏦' },
  rd:           { label: 'RD',           color: 'text-amber-700',   emoji: '💸' },
  ppf:          { label: 'PPF',          color: 'text-indigo-700',  emoji: '🇮🇳' },
  epf:          { label: 'EPF',          color: 'text-indigo-700',  emoji: '🇮🇳' },
  nps:          { label: 'NPS',          color: 'text-indigo-700',  emoji: '🏛️' },
  gold:         { label: 'Gold',         color: 'text-yellow-700',  emoji: '🥇' },
  real_estate:  { label: 'Real Estate',  color: 'text-teal-700',    emoji: '🏠' },
  crypto:       { label: 'Crypto',       color: 'text-orange-700',  emoji: '₿'  },
  bond:         { label: 'Bond',         color: 'text-rose-700',    emoji: '📜' },
  other:        { label: 'Other',        color: 'text-gray-700',    emoji: '💼' },
}

export default function InvestmentsPage() {
  const [inv, setInv] = useState<Investment[]>([])
  const [sips, setSips] = useState<SIPPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'portfolio' | 'sips'>('portfolio')
  const [showInv, setShowInv] = useState(false)
  const [showSip, setShowSip] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)

  // forms
  const [invF, setInvF] = useState<Partial<Investment>>({ type: 'mutual_fund', invested_amount: 0, current_value: 0 })
  const [sipF, setSipF] = useState<Partial<SIPPlan>>({ frequency: 'monthly', amount: 0 })

  async function load() {
    const r = await fetch('/api/investments').then(r => r.json())
    setInv(r.investments ?? []); setSips(r.sips ?? [])
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function saveInv() {
    if (!invF.name?.trim()) return
    if (editing) {
      await fetch('/api/investments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'investment', id: editing.id, ...invF }) })
    } else {
      await fetch('/api/investments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'investment', ...invF }) })
    }
    setShowInv(false); setInvF({ type: 'mutual_fund', invested_amount: 0, current_value: 0 }); setEditing(null); load()
  }

  async function saveSip() {
    if (!sipF.name?.trim() || !sipF.amount || !sipF.start_date) return
    await fetch('/api/investments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'sip', ...sipF, next_date: sipF.next_date ?? sipF.start_date }) })
    setShowSip(false); setSipF({ frequency: 'monthly', amount: 0 }); load()
  }

  async function delInv(id: string) {
    if (!confirm('Delete this investment?')) return
    await fetch(`/api/investments?kind=investment&id=${id}`, { method: 'DELETE' })
    load()
  }
  async function delSip(id: string) {
    if (!confirm('Delete this SIP plan?')) return
    await fetch(`/api/investments?kind=sip&id=${id}`, { method: 'DELETE' })
    load()
  }

  // Aggregates
  const totalInvested = inv.reduce((s, i) => s + Number(i.invested_amount), 0)
  const totalCurrent = inv.reduce((s, i) => s + Number(i.current_value), 0)
  const totalGain = totalCurrent - totalInvested
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  // Breakdown by type
  const byType = new Map<InvType, number>()
  for (const i of inv) byType.set(i.type, (byType.get(i.type) ?? 0) + Number(i.current_value))
  const breakdown = [...byType.entries()].sort((a, b) => b[1] - a[1])

  // Monthly SIP commitment
  const monthlyCommit = sips.reduce((s, p) => {
    const factor = p.frequency === 'monthly' ? 1 : p.frequency === 'weekly' ? 4 : p.frequency === 'quarterly' ? 1/3 : 1/12
    return s + Number(p.amount) * factor
  }, 0)

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Investments</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Portfolio · SIPs · gain/loss</p>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white p-6 shadow-md shadow-emerald-200">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Total portfolio value</p>
        <p className="text-3xl font-bold">₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        <div className="flex items-center gap-2 mt-1 text-sm">
          {totalGain >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span className="font-bold">₹{Math.abs(totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span className="text-white/80">({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)</span>
          <span className="text-white/60 text-xs ml-2">on ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })} invested</span>
        </div>
        {monthlyCommit > 0 && (
          <p className="text-xs text-white/70 mt-3">SIP commitment: ₹{Math.round(monthlyCommit).toLocaleString('en-IN')}/month</p>
        )}
      </div>

      {/* Type breakdown */}
      {breakdown.length > 0 && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Allocation</p>
          <div className="space-y-1.5">
            {breakdown.slice(0, 6).map(([type, value]) => {
              const pct = totalCurrent > 0 ? (value / totalCurrent) * 100 : 0
              const cfg = INV_TYPE_LABELS[type]
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-sm w-8">{cfg.emoji}</span>
                  <span className={cn('text-xs font-semibold w-24 truncate', cfg.color)}>{cfg.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-14 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <div className="flex flex-1 rounded-xl bg-gray-100 p-0.5">
          <button onClick={() => setTab('portfolio')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold', tab === 'portfolio' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>Portfolio ({inv.length})</button>
          <button onClick={() => setTab('sips')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold', tab === 'sips' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>SIPs ({sips.length})</button>
        </div>
        <button onClick={() => tab === 'portfolio' ? (setEditing(null), setInvF({ type: 'mutual_fund', invested_amount: 0, current_value: 0 }), setShowInv(true)) : setShowSip(true)}
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />Add
        </button>
      </div>

      {showInv && (
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">{editing ? 'Edit' : 'New'} investment</p>
            <button onClick={() => { setShowInv(false); setEditing(null) }} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
          </div>
          <input value={invF.name ?? ''} onChange={e => setInvF({ ...invF, name: e.target.value })} placeholder="Name (e.g., Parag Parikh Flexi Cap)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <select value={invF.type} onChange={e => setInvF({ ...invF, type: e.target.value as InvType })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            {(Object.entries(INV_TYPE_LABELS) as [InvType, typeof INV_TYPE_LABELS[InvType]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Invested</label><input type="number" value={invF.invested_amount ?? 0} onChange={e => setInvF({ ...invF, invested_amount: parseFloat(e.target.value) || 0 })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Current value</label><input type="number" value={invF.current_value ?? 0} onChange={e => setInvF({ ...invF, current_value: parseFloat(e.target.value) || 0 })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
          <input value={invF.account ?? ''} onChange={e => setInvF({ ...invF, account: e.target.value })} placeholder="Broker / account (optional)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={saveInv} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Save</button>
            <button onClick={() => { setShowInv(false); setEditing(null) }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {showSip && (
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">New SIP</p>
            <button onClick={() => setShowSip(false)} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
          </div>
          <input value={sipF.name ?? ''} onChange={e => setSipF({ ...sipF, name: e.target.value })} placeholder="SIP name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Amount</label><input type="number" value={sipF.amount ?? 0} onChange={e => setSipF({ ...sipF, amount: parseFloat(e.target.value) || 0 })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Frequency</label>
              <select value={sipF.frequency} onChange={e => setSipF({ ...sipF, frequency: e.target.value as SIPPlan['frequency'] })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Start date</label><input type="date" value={sipF.start_date ?? ''} onChange={e => setSipF({ ...sipF, start_date: e.target.value, next_date: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Next date</label><input type="date" value={sipF.next_date ?? sipF.start_date ?? ''} onChange={e => setSipF({ ...sipF, next_date: e.target.value })} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveSip} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Save</button>
            <button onClick={() => setShowSip(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8"><div className="animate-spin h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent" /></div>
      ) : tab === 'portfolio' ? (
        inv.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">No investments yet</p>
            <p className="text-xs text-gray-400 mt-1">Track funds, stocks, FDs, gold — all asset types in one place.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inv.map(i => {
              const cfg = INV_TYPE_LABELS[i.type]
              const gain = i.current_value - i.invested_amount
              const gainPct = i.invested_amount > 0 ? (gain / i.invested_amount) * 100 : 0
              return (
                <div key={i.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-800">{i.name}</p>
                        <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100', cfg.color)}>{cfg.label}</span>
                      </div>
                      {i.account && <p className="text-[10px] text-gray-400 mt-0.5">{i.account}</p>}
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-base font-bold text-gray-800">₹{Number(i.current_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <span className={cn('text-xs font-bold flex items-center gap-0.5', gain >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                          {gain >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {gainPct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Invested ₹{Number(i.invested_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <button onClick={() => { setEditing(i); setInvF(i); setShowInv(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 text-[10px]">edit</button>
                    <button onClick={() => delInv(i.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        sips.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
            <Calendar className="h-5 w-5 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">No SIP plans yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sips.map(s => {
              const daysUntil = Math.ceil((new Date(s.next_date).getTime() - Date.now()) / 86_400_000)
              return (
                <div key={s.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <IndianRupee className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{s.name}</p>
                    <p className="text-[11px] text-gray-500">₹{Number(s.amount).toLocaleString('en-IN')} · {s.frequency}</p>
                    <p className={cn('text-[10px] font-semibold mt-0.5', daysUntil <= 7 ? 'text-amber-700' : 'text-gray-400')}>
                      Next: {new Date(s.next_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {daysUntil >= 0 && ` (in ${daysUntil}d)`}
                    </p>
                  </div>
                  <button onClick={() => delSip(s.id)} className="p-1 rounded text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
