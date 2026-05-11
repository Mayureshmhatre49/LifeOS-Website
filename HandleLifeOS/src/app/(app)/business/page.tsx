'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2, Plus, Trash2, Users, FolderKanban, Receipt, TrendingUp, X,
  ArrowRight, Send, Wallet, FileText, Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

type ProjectStatus = 'lead' | 'active' | 'on_hold' | 'done' | 'cancelled'
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
type ExpenseCategory = 'software' | 'hardware' | 'travel' | 'office' | 'marketing' | 'professional_fees' | 'utilities' | 'tax' | 'meals' | 'education' | 'other'

interface Client { id: string; name: string; company: string | null; email: string | null; phone: string | null; gst_no: string | null; pan_no: string | null; address: string | null; currency: string; notes: string | null; archived: boolean; created_at: string; updated_at: string }
interface Project { id: string; client_id: string | null; name: string; status: ProjectStatus; start_date: string | null; end_date: string | null; fee: number | null; currency: string; hourly_rate: number | null; notes: string | null; created_at: string; updated_at: string }
interface InvoiceItem { description: string; qty: number; rate: number; amount: number }
interface Invoice { id: string; client_id: string | null; project_id: string | null; invoice_no: string; issued_at: string; due_at: string | null; items: InvoiceItem[]; subtotal: number; tax_pct: number; tax_amt: number; discount_amt: number; total: number; currency: string; status: InvoiceStatus; paid_at: string | null; notes: string | null; terms: string | null; created_at: string }
interface Expense { id: string; project_id: string | null; client_id: string | null; category: ExpenseCategory; vendor: string | null; amount: number; currency: string; occurred_at: string; description: string | null; is_billable: boolean }

type Tab = 'overview' | 'clients' | 'projects' | 'invoices' | 'expenses'

const STATUS_CHIP: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

const PROJECT_CHIP: Record<ProjectStatus, string> = {
  lead: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-gray-100 text-gray-600',
  done: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const EXPENSE_LABEL: Record<ExpenseCategory, string> = {
  software: 'Software', hardware: 'Hardware', travel: 'Travel', office: 'Office',
  marketing: 'Marketing', professional_fees: 'Professional Fees', utilities: 'Utilities',
  tax: 'Tax', meals: 'Meals', education: 'Education', other: 'Other',
}

function fmt(n: number, cur: string, dec = 0) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: dec, minimumFractionDigits: dec }).format(n)
}

export default function BusinessPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<null | 'client' | 'project' | 'invoice' | 'expense'>(null)
  const [showGstCalc, setShowGstCalc] = useState(false)
  const [currency, setCurrency] = useState('USD')

  async function refresh() {
    const [r, p] = await Promise.all([
      fetch('/api/business').then(r => r.json()),
      fetch('/api/profile').then(r => r.json()).catch(() => ({})),
    ])
    setClients(r.clients ?? []); setProjects(r.projects ?? []); setInvoices(r.invoices ?? []); setExpenses(r.expenses ?? [])
    if (p?.currency) setCurrency(p.currency)
  }
  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  async function add(kind: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch('/api/business', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, ...payload }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast({ kind: 'error', message: 'Could not save', description: j.error })
        return
      }
      toast({ kind: 'success', message: `${kind[0].toUpperCase() + kind.slice(1)} added` })
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }
  async function patch(kind: string, id: string, p: Record<string, unknown>) {
    try {
      const res = await fetch('/api/business', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, ...p }) })
      if (!res.ok) { toast({ kind: 'error', message: 'Could not update' }); return }
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }
  async function del(kind: string, id: string) {
    if (!confirm('Delete this?')) return
    try {
      const res = await fetch(`/api/business?kind=${kind}&id=${id}`, { method: 'DELETE' })
      if (!res.ok) { toast({ kind: 'error', message: 'Could not delete' }); return }
      toast({ kind: 'info', message: 'Deleted' })
      refresh()
    } catch { toast({ kind: 'error', message: 'Network error' }) }
  }

  // ─── Overview computations ────────────────────────────────────────────────
  const ytdRevenue = invoices.filter(i => i.status === 'paid' && new Date(i.issued_at).getFullYear() === new Date().getFullYear()).reduce((s, i) => s + i.total, 0)
  const ytdExpenses = expenses.filter(e => new Date(e.occurred_at).getFullYear() === new Date().getFullYear()).reduce((s, e) => s + e.amount, 0)
  const profit = ytdRevenue - ytdExpenses
  const outstandingTotal = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const activeProjects = projects.filter(p => p.status === 'active').length

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" /></div>

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-md shadow-indigo-200">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Clients · projects · invoices · P&L</p>
        </div>
        <button onClick={() => setShowGstCalc(true)} className="px-3 py-2 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-bold hover:bg-indigo-50 flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5" /> Tax
        </button>
      </div>

      <div className="flex rounded-2xl bg-gray-100 p-0.5 overflow-x-auto">
        {(['overview', 'clients', 'projects', 'invoices', 'expenses'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap',
            tab === t ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500',
          )}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <BigStat label="Revenue YTD"      value={fmt(ytdRevenue, currency)}     Icon={TrendingUp} color="emerald" />
            <BigStat label="Expenses YTD"     value={fmt(ytdExpenses, currency)}     Icon={Wallet}     color="rose" />
            <BigStat label={profit >= 0 ? 'Profit YTD' : 'Loss YTD'} value={fmt(Math.abs(profit), currency)} Icon={TrendingUp} color={profit >= 0 ? 'emerald' : 'rose'} />
            <BigStat label="Outstanding"      value={fmt(outstandingTotal, currency)} Icon={Send}       color="amber" />
          </div>

          <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-4">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Snapshot</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini label="Clients" value={clients.length} Icon={Users} />
              <Mini label="Active projects" value={activeProjects} Icon={FolderKanban} />
              <Mini label="Invoices" value={invoices.length} Icon={Receipt} />
            </div>
          </div>

          {invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Outstanding invoices</p>
              <div className="space-y-1.5">
                {invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 5).map(i => {
                  const c = clients.find(x => x.id === i.client_id)
                  return (
                    <Link key={i.id} href={`/business/invoice/${i.id}`} className="flex items-center gap-3 rounded-xl bg-white/80 border border-white/60 p-2.5 hover:shadow-sm">
                      <Receipt className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{i.invoice_no}</p>
                        <p className="text-[10px] text-gray-500">{c?.name ?? '—'} · {fmt(i.total, i.currency)}</p>
                      </div>
                      <span className={cn('text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold', STATUS_CHIP[i.status])}>{i.status}</span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'clients' && (
        <>
          {showForm === 'client'
            ? <ClientForm onSave={async (d) => { await add('client', d); setShowForm(null) }} onCancel={() => setShowForm(null)} />
            : <button onClick={() => setShowForm('client')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-700 text-sm font-semibold hover:bg-indigo-50">
                <Plus className="h-4 w-4" /> Add client
              </button>}
          {clients.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">No clients yet.</p></div>
          ) : (
            <div className="space-y-2">
              {clients.map(c => (
                <div key={c.id} className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                      {c.company && <p className="text-[11px] text-gray-500 truncate">{c.company}</p>}
                      {(c.email || c.phone) && <p className="text-[10px] text-gray-400 truncate">{[c.email, c.phone].filter(Boolean).join(' · ')}</p>}
                      {c.gst_no && <p className="text-[10px] text-gray-400">GST: {c.gst_no}</p>}
                    </div>
                    <button onClick={() => del('client', c.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'projects' && (
        <>
          {showForm === 'project'
            ? <ProjectForm clients={clients} onSave={async (d) => { await add('project', d); setShowForm(null) }} onCancel={() => setShowForm(null)} />
            : <button onClick={() => setShowForm('project')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-700 text-sm font-semibold hover:bg-indigo-50">
                <Plus className="h-4 w-4" /> Add project
              </button>}
          {projects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">No projects yet.</p></div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => {
                const c = clients.find(x => x.id === p.client_id)
                return (
                  <div key={p.id} className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3">
                    <div className="flex items-start gap-2">
                      <FolderKanban className="h-4 w-4 text-indigo-500 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">{c?.name ?? '—'}{p.fee ? ` · ${fmt(p.fee, p.currency)}` : ''}</p>
                      </div>
                      <select value={p.status} onChange={e => patch('project', p.id, { status: e.target.value })}
                        className={cn('text-[10px] font-bold rounded-full px-2 py-0.5 border-0 cursor-pointer', PROJECT_CHIP[p.status])}>
                        {Object.keys(PROJECT_CHIP).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      <button onClick={() => del('project', p.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'invoices' && (
        <>
          {showForm === 'invoice'
            ? <InvoiceForm clients={clients} projects={projects} currency={currency} onSave={async (d) => { await add('invoice', d); setShowForm(null) }} onCancel={() => setShowForm(null)} />
            : <button onClick={() => setShowForm('invoice')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg">
                <Plus className="h-4 w-4" /> New invoice
              </button>}
          {invoices.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">No invoices yet.</p></div>
          ) : (
            <div className="space-y-2">
              {invoices.map(i => {
                const c = clients.find(x => x.id === i.client_id)
                const overdue = i.status === 'sent' && i.due_at && i.due_at < new Date().toISOString().slice(0, 10)
                return (
                  <Link key={i.id} href={`/business/invoice/${i.id}`} className="block rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <Receipt className="h-4 w-4 text-indigo-500 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{i.invoice_no}</p>
                        <p className="text-[11px] text-gray-500">{c?.name ?? '—'} · {fmt(i.total, i.currency)}{i.due_at ? ` · due ${i.due_at}` : ''}</p>
                      </div>
                      <span className={cn('text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold', STATUS_CHIP[overdue ? 'overdue' : i.status])}>
                        {overdue ? 'overdue' : i.status}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'expenses' && (
        <>
          {showForm === 'expense'
            ? <ExpenseForm projects={projects} onSave={async (d) => { await add('expense', d); setShowForm(null) }} onCancel={() => setShowForm(null)} />
            : <button onClick={() => setShowForm('expense')} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-700 text-sm font-semibold hover:bg-indigo-50">
                <Plus className="h-4 w-4" /> Log expense
              </button>}
          {expenses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">No expenses logged yet.</p></div>
          ) : (
            <div className="space-y-1.5">
              {expenses.map(e => (
                <div key={e.id} className="rounded-xl bg-white/80 border border-white/60 p-2.5 flex items-center gap-3">
                  <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.description ?? e.vendor ?? EXPENSE_LABEL[e.category]}</p>
                    <p className="text-[10px] text-gray-500">{EXPENSE_LABEL[e.category]} · {e.occurred_at}{e.is_billable ? ' · billable' : ''}</p>
                  </div>
                  <span className="text-sm font-bold text-rose-700">{fmt(e.amount, e.currency)}</span>
                  <button onClick={() => del('expense', e.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showGstCalc && <TaxCalculator currency={currency} onClose={() => setShowGstCalc(false)} />}
    </div>
  )
}

// ─── Stat tiles ─────────────────────────────────────────────────────────────
function BigStat({ label, value, Icon, color }: { label: string; value: string; Icon: typeof TrendingUp; color: 'emerald' | 'rose' | 'amber' | 'indigo' }) {
  const palette = {
    emerald: { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-100', icon: 'text-emerald-500', text: 'text-emerald-700' },
    rose:    { bg: 'from-rose-50 to-pink-50',     border: 'border-rose-100',    icon: 'text-rose-500',    text: 'text-rose-700' },
    amber:   { bg: 'from-amber-50 to-orange-50',  border: 'border-amber-100',   icon: 'text-amber-500',   text: 'text-amber-700' },
    indigo:  { bg: 'from-indigo-50 to-blue-50',   border: 'border-indigo-100',  icon: 'text-indigo-500',  text: 'text-indigo-700' },
  }[color]
  return (
    <div className={cn('rounded-2xl bg-gradient-to-br border p-3', palette.bg, palette.border)}>
      <Icon className={cn('h-4 w-4 mb-1', palette.icon)} />
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={cn('text-lg font-bold', palette.text)}>{value}</p>
    </div>
  )
}

function Mini({ label, value, Icon }: { label: string; value: number; Icon: typeof Users }) {
  return (
    <div>
      <Icon className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
      <p className="text-base font-bold text-gray-800">{value}</p>
      <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ─── Forms ──────────────────────────────────────────────────────────────────
function ClientForm({ onSave, onCancel }: { onSave: (d: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gst, setGst] = useState('')
  const [address, setAddress] = useState('')
  return (
    <FormShell title="New client" onCancel={onCancel}>
      <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="Name *" className={inputCls} />
      <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className={inputCls} />
      </div>
      <input value={gst} onChange={e => setGst(e.target.value)} placeholder="GST number" className={inputCls} />
      <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Address" className={inputCls} />
      <SaveBtn disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), company: company.trim() || null, email: email.trim() || null, phone: phone.trim() || null, gst_no: gst.trim() || null, address: address.trim() || null })} />
    </FormShell>
  )
}

function ProjectForm({ clients, onSave, onCancel }: { clients: Client[]; onSave: (d: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [fee, setFee] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  return (
    <FormShell title="New project" onCancel={onCancel}>
      <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="Project name *" className={inputCls} />
      <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputCls}>
        <option value="">— No client —</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className={inputCls} />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className={inputCls} />
      </div>
      <input type="number" value={fee} onChange={e => setFee(e.target.value)} placeholder="Total fee" className={inputCls} />
      <SaveBtn disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), client_id: clientId || null, start_date: start || null, end_date: end || null, fee: fee ? Number(fee) : null })} />
    </FormShell>
  )
}

function InvoiceForm({ clients, projects, currency, onSave, onCancel }: {
  clients: Client[]; projects: Project[]; currency: string;
  onSave: (d: Record<string, unknown>) => Promise<void>; onCancel: () => void
}) {
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [issued, setIssued] = useState(new Date().toISOString().slice(0, 10))
  const [due, setDue] = useState('')
  const [taxPct, setTaxPct] = useState(18)
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', qty: 1, rate: 0, amount: 0 }])
  const [notes, setNotes] = useState('')

  function updateItem(i: number, patch: Partial<InvoiceItem>) {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it
      const merged = { ...it, ...patch }
      if (patch.qty != null || patch.rate != null) merged.amount = Math.round(merged.qty * merged.rate * 100) / 100
      return merged
    }))
  }

  const subtotal = items.reduce((s, it) => s + it.amount, 0)
  const taxAmt = Math.round(subtotal * taxPct / 100 * 100) / 100
  const total = subtotal + taxAmt

  return (
    <FormShell title="New invoice" onCancel={onCancel}>
      <div className="grid grid-cols-2 gap-2">
        <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputCls}>
          <option value="">— Client *</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)} className={inputCls}>
          <option value="">— Project (optional) —</option>
          {projects.filter(p => !clientId || p.client_id === clientId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Issued</p>
          <input type="date" value={issued} onChange={e => setIssued(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Due</p>
          <input type="date" value={due} onChange={e => setDue(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Tax %</p>
          <input type="number" min={0} max={100} step="0.5" value={taxPct} onChange={e => setTaxPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className={inputCls} />
        </label>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Line items</p>
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-1 items-center">
              <input value={it.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Description" className={cn(inputCls, 'col-span-6')} />
              <input type="number" min={0} step="0.01" value={it.qty} onChange={e => updateItem(i, { qty: Math.max(0, Number(e.target.value) || 0) })} placeholder="Qty" className={cn(inputCls, 'col-span-2')} />
              <input type="number" min={0} step="0.01" value={it.rate} onChange={e => updateItem(i, { rate: Math.max(0, Number(e.target.value) || 0) })} placeholder="Rate" className={cn(inputCls, 'col-span-2')} />
              <span className="col-span-1 text-xs text-gray-700 font-bold text-right">{fmt(it.amount, currency, 0)}</span>
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="col-span-1 p-1 text-gray-300 hover:text-red-400"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => setItems([...items, { description: '', qty: 1, rate: 0, amount: 0 }])} className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">+ Add line</button>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes / payment instructions" className={inputCls} />
      <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900">
        <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{fmt(subtotal, currency, 2)}</span></div>
        <div className="flex justify-between"><span>Tax ({taxPct}%)</span><span className="font-bold">{fmt(taxAmt, currency, 2)}</span></div>
        <div className="flex justify-between mt-1 pt-1 border-t border-indigo-200"><span className="font-bold">Total</span><span className="font-bold text-base">{fmt(total, currency, 2)}</span></div>
      </div>
      <SaveBtn disabled={!clientId || items.every(i => !i.description.trim())} onClick={() => onSave({ client_id: clientId, project_id: projectId || null, issued_at: issued, due_at: due || null, tax_pct: taxPct, items: items.filter(i => i.description.trim()), notes: notes.trim() || null })} />
    </FormShell>
  )
}

function ExpenseForm({ projects, onSave, onCancel }: { projects: Project[]; onSave: (d: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [category, setCategory] = useState<ExpenseCategory>('software')
  const [vendor, setVendor] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [billable, setBillable] = useState(false)
  return (
    <FormShell title="Log expense" onCancel={onCancel}>
      <div className="grid grid-cols-2 gap-2">
        <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className={inputCls}>
          {Object.entries(EXPENSE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus placeholder="Amount *" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor" className={inputCls} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>
      <select value={projectId} onChange={e => setProjectId(e.target.value)} className={inputCls}>
        <option value="">— Project (optional) —</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className={inputCls} />
      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input type="checkbox" checked={billable} onChange={e => setBillable(e.target.checked)} /> Billable to client
      </label>
      <SaveBtn disabled={!amount} onClick={() => onSave({ category, vendor: vendor.trim() || null, amount: Number(amount), occurred_at: date, description: description.trim() || null, project_id: projectId || null, is_billable: billable })} />
    </FormShell>
  )
}

function TaxCalculator({ currency, onClose }: { currency: string; onClose: () => void }) {
  const [amount, setAmount] = useState(1000)
  const [rate, setRate] = useState(18)
  const [mode, setMode] = useState<'add' | 'extract'>('add')
  const result = useMemo(() => {
    if (mode === 'add') {
      const tax = Math.round(amount * rate / 100 * 100) / 100
      return { base: amount, tax, total: amount + tax }
    }
    const base = Math.round(amount / (1 + rate / 100) * 100) / 100
    return { base, tax: amount - base, total: amount }
  }, [amount, rate, mode])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><Calculator className="h-4 w-4 text-indigo-500" /> Tax Calculator</p>
          <button onClick={onClose} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex rounded-xl bg-gray-100 p-0.5">
          <button onClick={() => setMode('add')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', mode === 'add' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500')}>Add Tax</button>
          <button onClick={() => setMode('extract')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', mode === 'extract' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500')}>Extract Tax</button>
        </div>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} placeholder="Amount" className={inputCls} />
        <div className="grid grid-cols-4 gap-1">
          {[5, 12, 18, 28].map(r => (
            <button key={r} onClick={() => setRate(r)} className={cn('py-1.5 rounded-lg text-xs font-bold', rate === r ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-500')}>{r}%</button>
          ))}
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-sm">
          <div className="flex justify-between text-gray-700"><span>Base</span><span>{fmt(result.base, currency, 2)}</span></div>
          <div className="flex justify-between text-gray-700"><span>Tax ({rate}%)</span><span>{fmt(result.tax, currency, 2)}</span></div>
          <div className="flex justify-between font-bold text-indigo-900 mt-1 pt-1 border-t border-indigo-200"><span>Total</span><span>{fmt(result.total, currency, 2)}</span></div>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm'

function FormShell({ title, children, onCancel }: { title: string; children: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="rounded-2xl bg-white border border-indigo-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      {children}
    </div>
  )
}

function SaveBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-40">
      Save
    </button>
  )
}
