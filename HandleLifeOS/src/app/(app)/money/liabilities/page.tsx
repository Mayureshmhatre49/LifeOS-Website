'use client'

import { useEffect, useState, useCallback } from 'react'
import { CreditCard, Plus, Trash2, TrendingDown, Calendar, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import type { Liability, LiabilityType, CreateLiabilityInput } from '@/types/money'
import { LIABILITY_TYPE_LABELS } from '@/types/money'

function fmt(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${n}`
}

const TYPE_COLORS: Record<LiabilityType, string> = {
  home_loan:      'bg-indigo-50 text-indigo-700',
  car_loan:       'bg-sky-50 text-sky-700',
  personal_loan:  'bg-rose-50 text-rose-700',
  credit_card:    'bg-amber-50 text-amber-700',
  education_loan: 'bg-violet-50 text-violet-700',
  business_loan:  'bg-emerald-50 text-emerald-700',
  other:          'bg-gray-50 text-gray-700',
}

const EMPTY_FORM: CreateLiabilityInput = {
  name: '', type: 'personal_loan', principal: 0, outstanding: 0,
  emi: undefined, interest_rate: undefined, due_day: undefined, lender: '',
}

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateLiabilityInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/money/liabilities')
    const data = await res.json()
    setLiabilities(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totalOutstanding = liabilities.reduce((s, l) => s + l.outstanding, 0)
  const totalEMI = liabilities.reduce((s, l) => s + (l.emi ?? 0), 0)

  async function handleAdd() {
    if (!form.name || form.principal <= 0) return
    setSaving(true)
    const res = await fetch('/api/money/liabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await load()
      setShowForm(false)
      setForm(EMPTY_FORM)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/money/liabilities/${id}`, { method: 'DELETE' })
    setLiabilities(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-200">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Liabilities</h1>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Debt
        </button>
      </div>

      <MoneyNavBar />

      {/* Summary */}
      {liabilities.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white shadow-md shadow-rose-200/40">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Total Outstanding</p>
              <p className="text-2xl font-black mt-1">{fmt(totalOutstanding)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Monthly EMI</p>
              <p className="text-2xl font-black mt-1">{fmt(totalEMI)}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/60 mt-2">{liabilities.length} active {liabilities.length === 1 ? 'liability' : 'liabilities'}</p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl bg-white/90 border border-gray-200 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Add Liability</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. SBI Home Loan"
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-indigo-300"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as LiabilityType }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              >
                {(Object.entries(LIABILITY_TYPE_LABELS) as [LiabilityType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Principal (₹)</label>
              <input
                type="number"
                value={form.principal || ''}
                onChange={e => setForm(f => ({ ...f, principal: Number(e.target.value) }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Outstanding (₹)</label>
              <input
                type="number"
                value={form.outstanding || ''}
                onChange={e => setForm(f => ({ ...f, outstanding: Number(e.target.value) }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Monthly EMI (₹)</label>
              <input
                type="number"
                value={form.emi || ''}
                onChange={e => setForm(f => ({ ...f, emi: Number(e.target.value) || undefined }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.interest_rate || ''}
                onChange={e => setForm(f => ({ ...f, interest_rate: Number(e.target.value) || undefined }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">EMI Due Day</label>
              <input
                type="number"
                min={1} max={31}
                value={form.due_day || ''}
                onChange={e => setForm(f => ({ ...f, due_day: Number(e.target.value) || undefined }))}
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Lender</label>
              <input
                value={form.lender || ''}
                onChange={e => setForm(f => ({ ...f, lender: e.target.value }))}
                placeholder="e.g. SBI, HDFC"
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.name || form.principal <= 0 || saving}
              className="flex-1 rounded-xl bg-rose-600 text-white py-2.5 text-xs font-bold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Liability'}
            </button>
          </div>
        </div>
      )}

      {/* Liability cards */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : liabilities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-semibold text-gray-700">Debt-free!</p>
          <p className="text-xs text-gray-400 mt-1">No liabilities logged. Add any loans or debts to track them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {liabilities.map(lib => (
            <div key={lib.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-bold rounded-full px-2 py-0.5', TYPE_COLORS[lib.type])}>
                      {LIABILITY_TYPE_LABELS[lib.type]}
                    </span>
                    {lib.lender && (
                      <span className="text-[10px] text-gray-400">{lib.lender}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800">{lib.name}</p>
                </div>
                <button
                  onClick={() => handleDelete(lib.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <TrendingDown className="h-3 w-3 text-rose-400" />
                    <p className="text-[9px] text-gray-400 uppercase font-semibold">Outstanding</p>
                  </div>
                  <p className="text-sm font-bold text-rose-600">{fmt(lib.outstanding)}</p>
                </div>
                {lib.emi && (
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">EMI</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{fmt(lib.emi)}/mo</p>
                    {lib.due_day && (
                      <p className="text-[9px] text-gray-400">Due on {lib.due_day}th</p>
                    )}
                  </div>
                )}
                {lib.interest_rate && (
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Percent className="h-3 w-3 text-gray-400" />
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">Rate</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{lib.interest_rate}% p.a.</p>
                  </div>
                )}
              </div>

              {/* Progress bar: outstanding / principal */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-gray-400">Paid off</span>
                  <span className="text-[9px] text-gray-400">
                    {Math.round(((lib.principal - lib.outstanding) / lib.principal) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((lib.principal - lib.outstanding) / lib.principal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
