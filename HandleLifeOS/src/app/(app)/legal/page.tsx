'use client'

import { useState, useEffect } from 'react'
import {
  Scale, Plus, Trash2, Calendar, FileWarning, Sparkles, X, AlertTriangle,
  CheckCircle2, Clock, ListChecks, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

type DeadlineType = 'itr' | 'gst' | 'advance_tax' | 'tds' | 'property_tax' | 'renewal' | 'court' | 'other'
type DeadlineStatus = 'pending' | 'filed' | 'paid' | 'dismissed' | 'overdue'

interface LegalDeadline {
  id: string; user_id: string; title: string; type: DeadlineType;
  due_date: string; amount: number | null; currency: string; status: DeadlineStatus;
  reference_no: string | null; authority: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

interface LegalDocument {
  id: string; name: string; doc_type: string; summary_md: string;
  key_points: string[]; red_flags: string[]; expires_at: string | null; created_at: string;
}

interface LegalCompliance {
  id: string; user_id: string; item: string; category: string;
  frequency: string; last_done_at: string | null; next_due_at: string | null;
  is_done: boolean; applicable: boolean; notes: string | null;
}

type Tab = 'deadlines' | 'documents' | 'compliance'

const DEADLINE_TYPE_LABEL: Record<DeadlineType, string> = {
  itr: 'Income Tax Return', gst: 'Sales Tax / VAT', advance_tax: 'Advance Tax', tds: 'Withholding Tax',
  property_tax: 'Property Tax', renewal: 'Renewal', court: 'Court Hearing', other: 'Other',
}

const STARTER_COMPLIANCE: { item: string; category: string; frequency: string }[] = [
  { item: 'Nominee added to bank accounts',    category: 'personal', frequency: 'one-time' },
  { item: 'Nominee added to investments',      category: 'personal', frequency: 'one-time' },
  { item: 'Emergency fund documented',         category: 'personal', frequency: 'one-time' },
  { item: 'Will / estate documents updated',   category: 'personal', frequency: 'annual' },
  { item: 'Annual tax return filed',           category: 'tax',      frequency: 'annual' },
  { item: 'Insurance premiums paid',           category: 'personal', frequency: 'annual' },
  { item: 'Identity / KYC documents current',  category: 'personal', frequency: 'annual' },
  { item: 'Business licenses renewed',         category: 'business', frequency: 'annual' },
]

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>('deadlines')
  const [deadlines, setDeadlines] = useState<LegalDeadline[]>([])
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [compliances, setCompliances] = useState<LegalCompliance[]>([])
  const [loading, setLoading] = useState(true)
  const [showDForm, setShowDForm] = useState(false)
  const [showSimplify, setShowSimplify] = useState(false)
  const [showAddCompliance, setShowAddCompliance] = useState(false)
  const [newItem, setNewItem] = useState({ item: '', category: 'personal', frequency: 'one-time' })

  async function refresh() {
    const r = await fetch('/api/legal').then(r => r.json())
    setDeadlines(r.deadlines ?? []); setDocuments(r.documents ?? []); setCompliances(r.compliances ?? [])
  }
  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  async function patch(kind: string, id: string, p: Record<string, unknown>) {
    try {
      const res = await fetch('/api/legal', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, ...p }) })
      if (!res.ok) { toast({ kind: 'error', message: 'Could not save change' }); return }
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }
  async function add(kind: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch('/api/legal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, ...payload }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast({ kind: 'error', message: 'Could not save', description: j.error })
        return
      }
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }
  async function del(kind: string, id: string) {
    if (!confirm('Delete this?')) return
    try {
      const res = await fetch(`/api/legal?kind=${kind}&id=${id}`, { method: 'DELETE' })
      if (!res.ok) { toast({ kind: 'error', message: 'Could not delete' }); return }
      toast({ kind: 'info', message: 'Deleted' })
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }

  async function seedCompliance() {
    for (const s of STARTER_COMPLIANCE) await add('compliance', s)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent" /></div>

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = deadlines.filter(d => d.status === 'pending' && d.due_date >= today).slice(0, 5)
  const overdue = deadlines.filter(d => (d.status === 'pending' || d.status === 'overdue') && d.due_date < today)
  const pendingCompliance = compliances.filter(c => !c.is_done).length

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md shadow-amber-200">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Legal & Compliance</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Tax · documents · checklists</p>
        </div>
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-3 gap-2">
        <Stat value={String(upcoming.length)} label="Upcoming" hint={overdue.length > 0 ? `${overdue.length} overdue` : ''} hintColor="red" />
        <Stat value={String(documents.length)} label="Documents" />
        <Stat value={String(pendingCompliance)} label="Open items" />
      </div>

      <div className="flex rounded-2xl bg-gray-100 p-0.5">
        {(['deadlines', 'documents', 'compliance'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all',
            tab === t ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500',
          )}>{t}</button>
        ))}
      </div>

      {tab === 'deadlines' && (
        <>
          {showDForm
            ? <DeadlineForm onSave={async (d) => { await add('deadline', d); setShowDForm(false) }} onCancel={() => setShowDForm(false)} />
            : <button onClick={() => setShowDForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-amber-700 text-sm font-semibold hover:bg-amber-50">
                <Plus className="h-4 w-4" /> Add deadline
              </button>}

          {overdue.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Overdue
              </p>
              <div className="space-y-2">
                {overdue.map(d => <DeadlineRow key={d.id} d={d} overdue onPatch={(p) => patch('deadline', d.id, p)} onDel={() => del('deadline', d.id)} />)}
              </div>
            </div>
          )}

          {upcoming.length === 0 && overdue.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <Calendar className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No deadlines tracked yet.</p>
            </div>
          ) : upcoming.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Upcoming</p>
              <div className="space-y-2">
                {upcoming.map(d => <DeadlineRow key={d.id} d={d} onPatch={(p) => patch('deadline', d.id, p)} onDel={() => del('deadline', d.id)} />)}
              </div>
            </div>
          )}

          {/* Filed/paid history */}
          {deadlines.filter(d => d.status === 'filed' || d.status === 'paid').length > 0 && (
            <details className="rounded-2xl bg-white/60 border border-white/60 p-3">
              <summary className="text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer">History</summary>
              <div className="mt-2 space-y-1">
                {deadlines.filter(d => d.status === 'filed' || d.status === 'paid').map(d => (
                  <div key={d.id} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="flex-1 truncate">{d.title}</span>
                    <span className="text-[10px] text-gray-400">{d.due_date}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {tab === 'documents' && (
        <>
          {showSimplify
            ? <SimplifyForm onSaved={() => { setShowSimplify(false); refresh() }} onCancel={() => setShowSimplify(false)} />
            : <button onClick={() => setShowSimplify(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-md hover:shadow-lg">
                <Sparkles className="h-4 w-4" /> Simplify a document with AI
              </button>}

          {documents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <FileWarning className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No documents simplified yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">Paste a contract, notice or agreement to get a plain-English summary.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(d => (
                <details key={d.id} className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3">
                  <summary className="cursor-pointer flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{d.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{d.doc_type} · {new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); del('document', d.id) }} className="p-1 text-gray-300 hover:text-red-400 shrink-0">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </summary>
                  <div className="mt-3 text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMd(d.summary_md) }} />
                  {d.key_points.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Key points</p>
                      <ul className="space-y-0.5 text-xs text-gray-700 list-disc pl-4">
                        {d.key_points.map((k, i) => <li key={i}>{k}</li>)}
                      </ul>
                    </div>
                  )}
                  {d.red_flags.length > 0 && (
                    <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-2.5">
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Red flags
                      </p>
                      <ul className="space-y-0.5 text-xs text-red-800 list-disc pl-4">
                        {d.red_flags.map((k, i) => <li key={i}>{k}</li>)}
                      </ul>
                    </div>
                  )}
                </details>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'compliance' && (
        <>
          {compliances.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <ListChecks className="h-6 w-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No compliance items yet.</p>
              <button onClick={seedCompliance} className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">
                Add starter checklist (8 items)
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {compliances.map(c => (
                <div key={c.id} className={cn('rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 flex items-center gap-3', c.is_done && 'opacity-60')}>
                  <button onClick={() => patch('compliance', c.id, { is_done: !c.is_done })} className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2', c.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200')}>
                    {c.is_done && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold text-gray-800 truncate', c.is_done && 'line-through')}>{c.item}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{c.category} · {c.frequency}{c.next_due_at ? ` · due ${c.next_due_at}` : ''}</p>
                  </div>
                  <button onClick={() => del('compliance', c.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              {showAddCompliance ? (
                <div className="rounded-xl bg-white border border-gray-200 p-3 space-y-2">
                  <input value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} autoFocus placeholder="Item description" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                      <option value="personal">Personal</option>
                      <option value="tax">Tax</option>
                      <option value="business">Business</option>
                      <option value="property">Property</option>
                      <option value="other">Other</option>
                    </select>
                    <select value={newItem.frequency} onChange={e => setNewItem({ ...newItem, frequency: e.target.value })} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs">
                      <option value="one-time">One-time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { if (newItem.item.trim()) { add('compliance', newItem); setShowAddCompliance(false); setNewItem({ item: '', category: 'personal', frequency: 'one-time' }) } }} disabled={!newItem.item.trim()} className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold disabled:opacity-40">Save</button>
                    <button onClick={() => setShowAddCompliance(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddCompliance(true)} className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 hover:bg-gray-50">
                  + Add custom item
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ value, label, hint, hintColor }: { value: string; label: string; hint?: string; hintColor?: 'red' | 'amber' }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/60 p-3 text-center">
      <p className="text-xl font-bold text-amber-700">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      {hint && <p className={cn('text-[9px] mt-0.5 font-bold', hintColor === 'red' ? 'text-red-500' : 'text-amber-600')}>{hint}</p>}
    </div>
  )
}

function DeadlineRow({ d, overdue, onPatch, onDel }: { d: LegalDeadline; overdue?: boolean; onPatch: (p: Record<string, unknown>) => Promise<void>; onDel: () => Promise<void> }) {
  const days = Math.ceil((new Date(d.due_date).getTime() - Date.now()) / 86_400_000)
  return (
    <div className={cn('rounded-2xl bg-white/80 border shadow-sm p-3', overdue ? 'border-red-200 bg-red-50' : 'border-white/60')}>
      <div className="flex items-start gap-3">
        <Clock className={cn('h-4 w-4 mt-1 shrink-0', overdue ? 'text-red-500' : 'text-amber-500')} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{d.title}</p>
          <p className="text-[11px] text-gray-500">
            {DEADLINE_TYPE_LABEL[d.type]}
            {d.amount && ` · ${fmtAmount(d.amount, d.currency)}`}
            {' · '}
            <span className={overdue ? 'text-red-700 font-bold' : ''}>
              {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'due today' : `in ${days}d`}
            </span>
          </p>
          {d.authority && <p className="text-[10px] text-gray-400">{d.authority}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onPatch({ status: ['itr', 'gst', 'advance_tax', 'tds'].includes(d.type) ? 'filed' : 'paid' })} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            Done
          </button>
          <button onClick={onDel} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
        </div>
      </div>
    </div>
  )
}

function DeadlineForm({ onSave, onCancel }: { onSave: (d: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DeadlineType>('itr')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [authority, setAuthority] = useState('')

  return (
    <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">New deadline</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} autoFocus placeholder="e.g. ITR FY 2024-25" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <select value={type} onChange={e => setType(e.target.value as DeadlineType)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          {Object.entries(DEADLINE_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min={0} step="0.01" placeholder="Amount (optional)" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        <input value={authority} onChange={e => setAuthority(e.target.value)} placeholder="Authority (optional)" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>
      <button onClick={() => title.trim() && date && onSave({ title: title.trim(), type, due_date: date, amount: amount ? Number(amount) : null, authority: authority.trim() || null })}
        disabled={!title.trim() || !date}
        className="w-full py-2 rounded-xl bg-amber-600 text-white text-sm font-bold disabled:opacity-40">
        Save
      </button>
    </div>
  )
}

function SimplifyForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [docType, setDocType] = useState('contract')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ summary_md: string; key_points: string[]; red_flags: string[] } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function run() {
    setBusy(true); setErr(null); setResult(null)
    try {
      const res = await fetch('/api/legal/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, doc_type: docType }) })
      const json = await res.json()
      if (!res.ok) { setErr(json.error ?? 'Failed'); return }
      setResult(json)
    } catch (e) { setErr(String(e)) } finally { setBusy(false) }
  }

  async function save() {
    if (!result || !name.trim()) return
    await fetch('/api/legal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'document', name: name.trim(), doc_type: docType, original_text: text, summary_md: result.summary_md, key_points: result.key_points, red_flags: result.red_flags }) })
    onSaved()
  }

  return (
    <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-amber-500" /> AI Document Simplifier</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Document name" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        <select value={docType} onChange={e => setDocType(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <option value="contract">Contract</option>
          <option value="notice">Notice</option>
          <option value="agreement">Agreement</option>
          <option value="rental">Rental</option>
          <option value="employment">Employment</option>
          <option value="will">Will</option>
          <option value="poa">Power of Attorney</option>
          <option value="other">Other</option>
        </select>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste the legal text here…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono" />
      <div className="flex gap-2">
        <button onClick={run} disabled={busy || text.trim().length < 40} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? 'Analyzing…' : 'Simplify with AI'}
        </button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {result && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 space-y-2">
          <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMd(result.summary_md) }} />
          {result.key_points.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Key points</p>
              <ul className="space-y-0.5 text-xs text-gray-700 list-disc pl-4">
                {result.key_points.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
          {result.red_flags.length > 0 && (
            <div className="rounded-lg bg-red-50 p-2">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-0.5">Red flags</p>
              <ul className="space-y-0.5 text-xs text-red-800 list-disc pl-4">
                {result.red_flags.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}
          <button onClick={save} disabled={!name.trim()} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40">
            Save to library
          </button>
        </div>
      )}
    </div>
  )
}

function fmtAmount(n: number, cur: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n) }
  catch { return `${cur} ${n.toLocaleString()}` }
}

function simpleMd(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
