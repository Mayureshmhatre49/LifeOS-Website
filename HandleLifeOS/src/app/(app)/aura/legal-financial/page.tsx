'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Scale, PiggyBank, FileText, AlertTriangle, CheckCircle2,
  Plus, Trash2, Calendar, Info,
} from 'lucide-react'
import type {
  AuraChildProfile, DisabilityFinancialPlan, AbleAccountInfo, SNTInfo,
  LegalDocumentRecord, LegalDocumentType,
} from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { getAgeInMonths } from '@/lib/aura-logic'
import { cn } from '@/lib/utils'

type Tab = 'able' | 'snt' | 'legal' | 'transition'

const ABLE_LIMIT_2025 = 19000  // $19,000 yearly contribution cap

const LEGAL_DOC_LABELS: Record<LegalDocumentType, string> = {
  poa: 'Power of Attorney',
  limited_guardianship: 'Limited Guardianship',
  guardian_advocacy: 'Guardian Advocacy',
  health_proxy: 'Healthcare Proxy',
  will: 'Will / Estate Plan',
}

const TRANSITION_CHECKLIST_TEMPLATE = [
  { id: 'consult-attorney',  due_at_age: 17,    label: 'Consult special-needs attorney' },
  { id: 'choose-doc-type',   due_at_age: 17,    label: 'Decide POA / Limited Guardianship / Guardian Advocacy' },
  { id: 'gather-evals',      due_at_age: 17.5,  label: 'Gather medical / educational evaluations' },
  { id: 'apply-ssi',         due_at_age: 17.75, label: 'Apply for SSI / disability benefits if eligible' },
  { id: 'file-paperwork',    due_at_age: 17.9,  label: 'File legal paperwork before 18th birthday' },
  { id: 'register-voting',   due_at_age: 18,    label: 'Register to vote (if applicable to chosen plan)' },
  { id: 'update-bank',       due_at_age: 18,    label: 'Open ABLE / financial accounts in adult name' },
]

export default function AuraLegalFinancialPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('able')

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

  async function persist(updated: AuraChildProfile) {
    setProfiles(prev => prev.map(c => c.id === updated.id ? updated : c))
    await fetch(`/api/family/aura/profiles/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }

  function ensurePlan(child: AuraChildProfile): DisabilityFinancialPlan {
    return child.financial_plan ?? {
      able_account: false,
      special_needs_trust: false,
      legal_documents: [],
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null
  const ageMonths = selected ? getAgeInMonths(selected.date_of_birth) : 0
  const ageYears = ageMonths / 12
  const showTransitionAlert = ageYears >= 16.5 && ageYears < 18

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Legal & Financial</h1>
        </div>
      </div>

      <AuraChildSwitcher children={profiles} selectedId={selectedId} onSelect={handleSelect} />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          {showTransitionAlert && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">18th-birthday transition window</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Parental legal authority ends at 18. {selected.full_name} is{' '}
                    {ageYears.toFixed(1)} — start the legal/financial transition checklist now.
                    A special-needs attorney can guide you through Power of Attorney, Limited Guardianship, or Guardian Advocacy.
                  </p>
                  <button onClick={() => setTab('transition')} className="text-xs font-bold text-amber-800 underline mt-2">
                    Open transition checklist →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex rounded-xl bg-gray-100 p-0.5">
            {(['able', 'snt', 'legal', 'transition'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500',
                )}
              >
                {t === 'able' ? 'ABLE'
                : t === 'snt' ? 'Trust'
                : t === 'legal' ? 'Documents'
                : 'Transition'}
              </button>
            ))}
          </div>

          {tab === 'able' && <AbleTab child={selected} ensurePlan={ensurePlan} onChange={persist} />}
          {tab === 'snt' && <SntTab child={selected} ensurePlan={ensurePlan} onChange={persist} />}
          {tab === 'legal' && <LegalTab child={selected} ensurePlan={ensurePlan} onChange={persist} />}
          {tab === 'transition' && <TransitionTab child={selected} ageYears={ageYears} ensurePlan={ensurePlan} onChange={persist} />}

          <p className="text-[11px] text-gray-400 leading-relaxed text-center px-4">
            This module is informational only. Always consult a special-needs attorney and licensed financial planner for binding advice.
          </p>
        </>
      )}
    </div>
  )
}

// ── ABLE Account Tab ───────────────────────────────────────────────────────────
function AbleTab({ child, ensurePlan, onChange }: {
  child: AuraChildProfile
  ensurePlan: (c: AuraChildProfile) => DisabilityFinancialPlan
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const plan = ensurePlan(child)
  const able = plan.able ?? { enabled: plan.able_account ?? false }
  const [editing, setEditing] = useState(!able.enabled)
  const [form, setForm] = useState<AbleAccountInfo>(able)

  async function handleSave() {
    const updatedPlan: DisabilityFinancialPlan = {
      ...plan,
      able_account: form.enabled,
      able: form,
    }
    await onChange({ ...child, financial_plan: updatedPlan })
    setEditing(false)
  }

  const contribPct = form.yearly_contributions
    ? Math.min(100, Math.round((form.yearly_contributions / ABLE_LIMIT_2025) * 100))
    : 0
  const remaining = Math.max(0, ABLE_LIMIT_2025 - (form.yearly_contributions ?? 0))

  if (!editing && able.enabled) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
              <PiggyBank className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">ABLE Account · Active</p>
              {able.institution && <p className="text-xs text-amber-700 mt-0.5">{able.institution}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="text-xs font-bold text-amber-700 underline">
              Edit
            </button>
          </div>

          {able.account_balance != null && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Current balance</p>
              <p className="text-2xl font-bold text-amber-900">${able.account_balance.toLocaleString()}</p>
            </div>
          )}

          {able.yearly_contributions != null && (
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-amber-700">2025 contributions</span>
                <span className="text-xs font-bold text-amber-900">
                  ${able.yearly_contributions.toLocaleString()} / ${ABLE_LIMIT_2025.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${contribPct}%` }} />
              </div>
              <p className="text-[10px] text-amber-700 mt-1">
                ${remaining.toLocaleString()} remaining within 2025 cap
              </p>
            </div>
          )}
        </div>

        <InfoCard
          title="What is an ABLE Account?"
          body="A 529A tax-advantaged savings account for qualified disability expenses (education, housing, transport, healthcare). Funds don't affect SSI / Medicaid eligibility. 2025 limit: $19,000/year per beneficiary."
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 space-y-3">
      <p className="text-sm font-bold text-gray-800">ABLE Account details</p>

      <Toggle
        label="Account is open"
        checked={form.enabled}
        onChange={v => setForm(f => ({ ...f, enabled: v }))}
      />

      {form.enabled && (
        <>
          <Field label="Institution / plan name">
            <input value={form.institution ?? ''} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
              placeholder="e.g., ABLE United, Fidelity ABLE" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Current balance ($)">
              <input type="number" value={form.account_balance ?? ''}
                onChange={e => setForm(f => ({ ...f, account_balance: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className={inputCls} />
            </Field>
            <Field label="2025 contributions ($)">
              <input type="number" value={form.yearly_contributions ?? ''}
                onChange={e => setForm(f => ({ ...f, yearly_contributions: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className={inputCls} />
            </Field>
          </div>
          <Field label="Beneficiary name">
            <input value={form.beneficiary_name ?? ''} onChange={e => setForm(f => ({ ...f, beneficiary_name: e.target.value }))}
              placeholder={child.full_name} className={inputCls} />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
          Save
        </button>
        {able.enabled && <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>}
      </div>
    </div>
  )
}

// ── SNT Tab ────────────────────────────────────────────────────────────────────
function SntTab({ child, ensurePlan, onChange }: {
  child: AuraChildProfile
  ensurePlan: (c: AuraChildProfile) => DisabilityFinancialPlan
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const plan = ensurePlan(child)
  const snt = plan.snt ?? { enabled: plan.special_needs_trust ?? false, trustee_name: plan.snt_trustee }
  const [form, setForm] = useState<SNTInfo>(snt)

  async function handleSave() {
    const updatedPlan: DisabilityFinancialPlan = {
      ...plan,
      special_needs_trust: form.enabled,
      snt_trustee: form.trustee_name,
      snt: form,
    }
    await onChange({ ...child, financial_plan: updatedPlan })
  }

  return (
    <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 space-y-3">
      <p className="text-sm font-bold text-gray-800">Special Needs Trust</p>

      <Toggle
        label="Trust is established"
        checked={form.enabled}
        onChange={v => setForm(f => ({ ...f, enabled: v }))}
      />

      {form.enabled && (
        <>
          <Field label="Trust type">
            <select
              value={form.trust_type ?? ''}
              onChange={e => setForm(f => ({ ...f, trust_type: (e.target.value || undefined) as SNTInfo['trust_type'] }))}
              className={inputCls}
            >
              <option value="">Select…</option>
              <option value="first_party">First-Party (d4A) — funded with beneficiary&apos;s own assets</option>
              <option value="third_party">Third-Party — funded by parents/family</option>
              <option value="pooled">Pooled — managed by non-profit</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Trustee name">
              <input value={form.trustee_name ?? ''} onChange={e => setForm(f => ({ ...f, trustee_name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Trustee contact">
              <input value={form.trustee_contact ?? ''} onChange={e => setForm(f => ({ ...f, trustee_contact: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Attorney">
              <input value={form.attorney_name ?? ''} onChange={e => setForm(f => ({ ...f, attorney_name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Attorney contact">
              <input value={form.attorney_contact ?? ''} onChange={e => setForm(f => ({ ...f, attorney_contact: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
        </>
      )}

      <button onClick={handleSave} className="w-full py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
        Save
      </button>

      <InfoCard
        title="Why a SNT?"
        body="Assets in a Special Needs Trust aren't directly owned by the beneficiary, so they don't count against means-tested benefits like SSI / Medicaid. Always set up via a special-needs attorney."
      />
    </div>
  )
}

// ── Legal Documents Tab ────────────────────────────────────────────────────────
function LegalTab({ child, ensurePlan, onChange }: {
  child: AuraChildProfile
  ensurePlan: (c: AuraChildProfile) => DisabilityFinancialPlan
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const plan = ensurePlan(child)
  const docs = plan.legal_docs ?? []
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<LegalDocumentType>('poa')
  const [status, setStatus] = useState<LegalDocumentRecord['status']>('planned')
  const [filed, setFiled] = useState('')
  const [attorney, setAttorney] = useState('')
  const [notes, setNotes] = useState('')

  async function handleAdd() {
    const doc: LegalDocumentRecord = {
      id: crypto.randomUUID(),
      type, status,
      filed_date: filed || undefined,
      attorney: attorney || undefined,
      notes: notes || undefined,
    }
    const updatedPlan: DisabilityFinancialPlan = {
      ...plan,
      legal_docs: [...docs, doc],
      legal_documents: Array.from(new Set([...plan.legal_documents, type])).filter(t => t === 'poa' || t === 'limited_guardianship' || t === 'guardian_advocacy') as DisabilityFinancialPlan['legal_documents'],
    }
    await onChange({ ...child, financial_plan: updatedPlan })
    setType('poa'); setStatus('planned'); setFiled(''); setAttorney(''); setNotes('')
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this document?')) return
    await onChange({ ...child, financial_plan: { ...plan, legal_docs: docs.filter(d => d.id !== id) } })
  }

  async function updateStatus(id: string, newStatus: LegalDocumentRecord['status']) {
    await onChange({
      ...child,
      financial_plan: { ...plan, legal_docs: docs.map(d => d.id === id ? { ...d, status: newStatus } : d) },
    })
  }

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Add legal document</p>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value as LegalDocumentType)} className={inputCls}>
              {(Object.entries(LEGAL_DOC_LABELS) as [LegalDocumentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as LegalDocumentRecord['status'])} className={inputCls}>
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Filed date">
              <input type="date" value={filed} onChange={e => setFiled(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Attorney">
              <input value={attorney} onChange={e => setAttorney(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">Save</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-amber-700 text-sm font-semibold hover:bg-amber-50">
          <Plus className="h-4 w-4" />
          Add legal document
        </button>
      )}

      {docs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <FileText className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No legal documents tracked yet.</p>
          <p className="text-xs text-gray-400 mt-1">POA / Guardianship / Healthcare Proxy / Will should be considered before age 18.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(d => {
            const cfg = {
              planned:     { color: 'text-gray-600',     bg: 'bg-gray-50',      label: 'Planned' },
              in_progress: { color: 'text-amber-700',    bg: 'bg-amber-50',     label: 'In progress' },
              completed:   { color: 'text-emerald-700',  bg: 'bg-emerald-50',   label: 'Completed' },
            }[d.status]
            return (
              <div key={d.id} className={cn('rounded-2xl border border-white/60 shadow-sm p-3 flex items-start gap-3', cfg.bg)}>
                <FileText className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{LEGAL_DOC_LABELS[d.type]}</p>
                    <select value={d.status} onChange={e => updateStatus(d.id, e.target.value as LegalDocumentRecord['status'])}
                      className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-white', cfg.color)}>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  {d.attorney && <p className="text-[11px] text-gray-500 mt-0.5">Attorney: {d.attorney}</p>}
                  {d.filed_date && <p className="text-[11px] text-gray-500">Filed: {new Date(d.filed_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                  {d.notes && <p className="text-[11px] text-gray-500 mt-1">{d.notes}</p>}
                </div>
                <button onClick={() => handleDelete(d.id)} className="p-1 rounded text-gray-300 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Transition Checklist Tab ───────────────────────────────────────────────────
function TransitionTab({ child, ageYears, ensurePlan, onChange }: {
  child: AuraChildProfile
  ageYears: number
  ensurePlan: (c: AuraChildProfile) => DisabilityFinancialPlan
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const plan = ensurePlan(child)
  const checklist = plan.transition_checklist ?? TRANSITION_CHECKLIST_TEMPLATE.map(t => ({ id: t.id, done: false, due_at_age: t.due_at_age }))

  async function toggle(id: string) {
    const next = TRANSITION_CHECKLIST_TEMPLATE.map(t => {
      const existing = checklist.find(c => c.id === t.id)
      if (t.id === id) {
        return { id: t.id, done: !(existing?.done ?? false), due_at_age: t.due_at_age }
      }
      return existing ?? { id: t.id, done: false, due_at_age: t.due_at_age }
    })
    await onChange({ ...child, financial_plan: { ...plan, transition_checklist: next } })
  }

  const completed = checklist.filter(c => c.done).length
  const total = TRANSITION_CHECKLIST_TEMPLATE.length

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">18th-birthday transition</p>
          <span className="text-xs font-bold text-amber-900">{completed}/{total}</span>
        </div>
        <div className="h-2 rounded-full bg-white/60 overflow-hidden mb-2">
          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
        <p className="text-[11px] text-amber-700 leading-relaxed">
          {child.full_name} is currently <strong>{ageYears.toFixed(1)} years</strong> old.
          Most checklist items are best started at age 17 or earlier.
        </p>
      </div>

      <div className="space-y-2">
        {TRANSITION_CHECKLIST_TEMPLATE.map(item => {
          const state = checklist.find(c => c.id === item.id)
          const done = state?.done ?? false
          const overdue = !done && ageYears >= (item.due_at_age ?? 0)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left',
                done
                  ? 'bg-emerald-50 border-emerald-200'
                  : overdue
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-white border-gray-200',
              )}
            >
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2',
                done ? 'bg-emerald-500 border-emerald-500' : overdue ? 'border-rose-300' : 'border-gray-300',
              )}>
                {done && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-medium', done ? 'text-emerald-800 line-through' : overdue ? 'text-rose-800' : 'text-gray-800')}>
                  {item.label}
                </p>
                <p className={cn('text-[10px] mt-0.5', done ? 'text-emerald-600' : overdue ? 'text-rose-600' : 'text-gray-400')}>
                  {overdue ? '⚠ Overdue · ' : ''}Recommended by age {item.due_at_age}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── Reusable bits ──────────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button onClick={() => onChange(!checked)} className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-amber-500' : 'bg-gray-200',
      )}>
        <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-3 flex items-start gap-2">
      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-blue-700">{title}</p>
        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to start planning.</p>
      <Link href="/aura" className="text-xs font-bold text-amber-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
