'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Home, Warehouse, Trees, Store, Landmark,
  Wrench, Receipt, Box, AlertCircle, Check, ChevronRight,
  Edit3, Trash2, X, Plus, Calendar, Phone, Zap, TriangleAlert,
  CircleDot, CheckCircle2, Clock, FileText, Upload, Download, ShieldAlert,
  TrendingUp, TrendingDown, Sparkles, Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Property {
  id: string; name: string; type: string; status: string
  address: string | null; city: string | null; state: string | null
  country: string | null; pincode: string | null
  purchase_date: string | null; purchase_value: number | null; current_value: number | null
  built_up_area: number | null; carpet_area: number | null; plot_area: number | null
  area_unit: string; ownership_type: string
  co_owners: string | null; society_name: string | null
  registration_no: string | null; property_tax_no: string | null
  notes: string | null; created_at: string
}
interface Maintenance {
  id: string; title: string; category: string | null
  next_due_at: string | null; last_done_at: string | null
  recurrence_months: number | null; vendor: string | null; cost: number | null; notes: string | null
}
interface Bill {
  id: string; utility: string; provider: string | null; amount: number
  bill_date: string; due_date: string | null; is_paid: boolean; notes: string | null
}
interface Asset {
  id: string; name: string; type: string; brand: string | null; model: string | null
  purchased_at: string | null; warranty_until: string | null; cost: number | null
}
interface Issue {
  id: string; title: string; description: string | null; category: string | null
  priority: string; status: string; vendor_name: string | null; vendor_phone: string | null
  estimated_cost: number | null; actual_cost: number | null
  reported_at: string; resolved_at: string | null; notes: string | null
}
interface EmergencyContact {
  id: string; label: string; name: string | null; phone: string; category: string; notes: string | null
}
interface PropertyDocument {
  id: string; name: string; category: string; mime_type: string; size_bytes: number
  expires_at: string | null; notes: string | null; created_at: string
}
interface Transaction {
  id: string; type: 'income' | 'expense'; category: string
  amount: number; description: string | null
  transaction_date: string; notes: string | null; created_at: string
}
interface Tenant {
  id: string; name: string; phone: string | null; email: string | null
  id_type: string | null; id_number: string | null
  lease_start: string | null; lease_end: string | null
  monthly_rent: number | null; deposit_amount: number | null
  deposit_status: string; status: string; notes: string | null; created_at: string
}
interface RentPayment {
  id: string; tenant_id: string; amount: number
  month: string; paid_on: string; notes: string | null
}
interface Insight {
  priority: 'high' | 'medium' | 'low'
  title: string
  body: string
  action: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  primary_residence:'Primary Residence', apartment:'Apartment', villa:'Villa',
  vacation_home:'Vacation Home', farmhouse:'Farmhouse', commercial:'Commercial',
  office:'Office', shop:'Shop', warehouse:'Warehouse', land:'Land',
  ancestral:'Ancestral', other:'Other',
}
const STATUS_STYLES: Record<string, string> = {
  owned:'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
  rented_out:'bg-emerald-50 text-emerald-700',
  vacant:'bg-amber-50 text-amber-700',
  under_renovation:'bg-orange-50 text-orange-700',
  for_sale:'bg-purple-50 text-purple-700',
}
const STATUS_LABELS: Record<string, string> = {
  owned:'Owned', rented_out:'Rented out', vacant:'Vacant',
  under_renovation:'Under renovation', for_sale:'For sale',
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = cn('h-5 w-5', className)
  if (type === 'land') return <Trees className={cls} />
  if (type === 'commercial' || type === 'shop') return <Store className={cls} />
  if (type === 'warehouse') return <Warehouse className={cls} />
  if (type === 'office') return <Landmark className={cls} />
  return <Home className={cls} />
}

function fmt(v: number) {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`
  return `₹${v.toLocaleString('en-IN')}`
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const INCOME_CATS  = ['rent','lease_premium','deposit_received','sale_proceeds','other_income'] as const
const EXPENSE_CATS = ['maintenance_cost','renovation','property_tax','society_charges','insurance_premium','loan_emi','utility','legal_fees','brokerage','registration_charges','other_expense'] as const
const TXN_CAT_LABELS: Record<string, string> = {
  rent:'Rent received', lease_premium:'Lease premium', deposit_received:'Deposit received',
  sale_proceeds:'Sale proceeds', other_income:'Other income',
  maintenance_cost:'Maintenance', renovation:'Renovation', property_tax:'Property tax',
  society_charges:'Society charges', insurance_premium:'Insurance premium',
  loan_emi:'Loan EMI', utility:'Utility bill', legal_fees:'Legal fees',
  brokerage:'Brokerage', registration_charges:'Registration charges', other_expense:'Other expense',
}
const TXN_EMPTY = { type: 'expense' as 'income' | 'expense', category: 'other_expense', amount: '', description: '', transaction_date: new Date().toISOString().slice(0, 10) }

const TENANT_EMPTY = {
  name: '', phone: '', email: '', id_type: '', id_number: '',
  lease_start: '', lease_end: '', monthly_rent: '', deposit_amount: '',
  deposit_status: 'held', status: 'active', notes: '',
}
const DEPOSIT_STATUS_LABELS: Record<string, string> = { held: 'Held', refunded: 'Refunded', partial: 'Partial refund' }
const TENANT_STATUS_STYLES: Record<string, string> = {
  active:  'bg-emerald-50 text-emerald-700',
  notice:  'bg-amber-50 text-amber-700',
  vacated: 'bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)]',
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function ScoreRing({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = Math.max(0, Math.min(1, score / 100)) * circ
  const stroke = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle
        cx="48" cy="48" r={r} fill="none" stroke={stroke} strokeWidth="7"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="44" textAnchor="middle" fontSize="20" fontWeight="700" fill={stroke}>{score}</text>
      <text x="48" y="61" textAnchor="middle" fontSize="10" fill="#9ca3af">/100</text>
    </svg>
  )
}

const DOC_CAT_KEYS = [
  'sale_deed','agreement_to_sale','lease','society_share','mutation',
  'tax_receipt','encumbrance','na_order','survey_map','oc_cc',
  'title_report','poa','loan_agreement','insurance','deposit_receipt',
  'rent_receipt','structural_drawing','electrical_drawing','plumbing_layout',
  'hvac','solar','dg','appliance_manual','warranty','other',
] as const

const DOC_CATEGORY_LABELS: Record<string, string> = {
  sale_deed:'Sale Deed', agreement_to_sale:'Agreement to Sale', lease:'Lease Agreement',
  society_share:'Society Share Certificate', mutation:'Mutation / Khata',
  tax_receipt:'Property Tax Receipt', encumbrance:'Encumbrance Certificate',
  na_order:'NA Order', survey_map:'Survey Map / 7-12', oc_cc:'OC / CC',
  title_report:'Title Report', poa:'Power of Attorney',
  loan_agreement:'Loan Agreement', insurance:'Insurance Policy',
  deposit_receipt:'Deposit Receipt', rent_receipt:'Rent Receipt',
  structural_drawing:'Structural Drawing', electrical_drawing:'Electrical Drawing',
  plumbing_layout:'Plumbing Layout', hvac:'HVAC Drawing', solar:'Solar Documents',
  dg:'DG Set Documents', appliance_manual:'Appliance Manual', warranty:'Warranty Card',
  other:'Other',
}

// ─── Quick-add maintenance form ───────────────────────────────────────────────

const MAINT_CATEGORIES = ['AC servicing','Water tank','Pest control','Plumbing','Electrical','Generator','Pool','Solar panels','Painting','Waterproofing','Elevator','Garden','Security','Other']
const MAINT_EMPTY = { title:'', category:'', recurrence_months:'', next_due_at:'', vendor:'', cost:'', notes:'' }
const INP = 'w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]'

function AddMaintModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({ ...MAINT_EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  async function save() {
    if (!f.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'maintenance', property_id: propertyId,
          title: f.title, category: f.category || null,
          recurrence_months: f.recurrence_months ? parseInt(f.recurrence_months) : null,
          next_due_at: f.next_due_at || null,
          vendor: f.vendor || null,
          cost: f.cost ? parseFloat(f.cost) : null,
          notes: f.notes || null,
        }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Add maintenance task</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Task *</label>
            <input value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. AC servicing" className={INP} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
              <select value={f.category} onChange={e => set('category', e.target.value)} className={INP}>
                <option value="">Select…</option>
                {MAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Recurrence (months)</label>
              <input type="number" value={f.recurrence_months} onChange={e => set('recurrence_months', e.target.value)} placeholder="6" className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Next due</label>
              <input type="date" value={f.next_due_at} onChange={e => set('next_due_at', e.target.value)} className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Vendor</label>
              <input value={f.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Vendor name" className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Estimated cost (₹)</label>
              <input type="number" value={f.cost} onChange={e => set('cost', e.target.value)} placeholder="0" className={INP} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.title.trim() || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Edit property modal ──────────────────────────────────────────────────────

function EditPropertyModal({ property, onSaved, onClose }: { property: Property; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    name: property.name, type: property.type, status: property.status,
    address: property.address ?? '', city: property.city ?? '', state: property.state ?? '',
    country: property.country ?? '', pincode: property.pincode ?? '',
    purchase_value: property.purchase_value?.toString() ?? '',
    current_value: property.current_value?.toString() ?? '',
    built_up_area: property.built_up_area?.toString() ?? '',
    area_unit: property.area_unit, ownership_type: property.ownership_type,
    co_owners: property.co_owners ?? '', society_name: property.society_name ?? '',
    registration_no: property.registration_no ?? '', property_tax_no: property.property_tax_no ?? '',
    notes: property.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))
  const inp = 'w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]'

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/property', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: property.id, ...f,
          purchase_value: f.purchase_value ? parseFloat(f.purchase_value) : null,
          current_value:  f.current_value  ? parseFloat(f.current_value)  : null,
          built_up_area:  f.built_up_area  ? parseFloat(f.built_up_area)  : null,
        }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Edit property</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Name *</label>
              <input value={f.name} onChange={e => set('name', e.target.value)} className={inp} />
            </div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Type</label>
              <select value={f.type} onChange={e => set('type', e.target.value)} className={inp}>
                {Object.entries(TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Status</label>
              <select value={f.status} onChange={e => set('status', e.target.value)} className={inp}>
                {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Address</label><input value={f.address} onChange={e => set('address', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">City</label><input value={f.city} onChange={e => set('city', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">State</label><input value={f.state} onChange={e => set('state', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Purchase value (₹)</label><input type="number" value={f.purchase_value} onChange={e => set('purchase_value', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Current value (₹)</label><input type="number" value={f.current_value} onChange={e => set('current_value', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Built-up area</label><input type="number" value={f.built_up_area} onChange={e => set('built_up_area', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Unit</label>
              <select value={f.area_unit} onChange={e => set('area_unit', e.target.value)} className={inp}>
                {[['sqft','sq ft'],['sqm','sq m'],['sqyd','sq yd'],['acres','acres'],['guntha','guntha']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Society</label><input value={f.society_name} onChange={e => set('society_name', e.target.value)} className={inp} /></div>
            <div><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Registration no.</label><input value={f.registration_no} onChange={e => set('registration_no', e.target.value)} className={inp} /></div>
            <div className="col-span-2"><label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label><textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={2} className={cn(inp, 'resize-none')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.name.trim() || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Issue Modal ──────────────────────────────────────────────────────────

const ISSUE_CATS = ['plumbing','electrical','structural','appliance','security','pest','hvac','waterproofing','painting','other']
const ISSUE_EMPTY = { title:'', description:'', category:'', priority:'medium', vendor_name:'', vendor_phone:'', estimated_cost:'', notes:'' }

function AddIssueModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({ ...ISSUE_EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  async function save() {
    if (!f.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/property/${propertyId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'issue', ...f,
          category: f.category || null,
          estimated_cost: f.estimated_cost ? parseFloat(f.estimated_cost) : null,
        }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Report issue</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Issue title *</label>
            <input value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Bathroom tap leaking" className={INP} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
            <textarea value={f.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Details about the issue…" className={cn(INP, 'resize-none')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
              <select value={f.category} onChange={e => set('category', e.target.value)} className={INP}>
                <option value="">Select…</option>
                {ISSUE_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Priority</label>
              <select value={f.priority} onChange={e => set('priority', e.target.value)} className={INP}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Vendor / contractor</label>
              <input value={f.vendor_name} onChange={e => set('vendor_name', e.target.value)} placeholder="Name" className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Vendor phone</label>
              <input type="tel" value={f.vendor_phone} onChange={e => set('vendor_phone', e.target.value)} placeholder="+91 98765 43210" className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Estimated cost (₹)</label>
              <input type="number" value={f.estimated_cost} onChange={e => set('estimated_cost', e.target.value)} placeholder="0" className={INP} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.title.trim() || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Report issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Emergency Contact Modal ──────────────────────────────────────────────

const EC_CATS = ['electrician','plumber','security','locksmith','fire','police','hospital','caretaker','insurance','gas','water','other']
const EC_EMPTY = { label:'', name:'', phone:'', category:'other', notes:'' }

function AddContactModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({ ...EC_EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  async function save() {
    if (!f.label.trim() || !f.phone.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/property/${propertyId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'contact', ...f }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Add emergency contact</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Label *</label>
            <input value={f.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Trusted Electrician" className={INP} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
              <select value={f.category} onChange={e => set('category', e.target.value)} className={INP}>
                {EC_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Name</label>
              <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Contact name" className={INP} />
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Phone number *</label>
              <input type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={INP} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.label.trim() || !f.phone.trim() || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Tenant Modal ─────────────────────────────────────────────────────────

function AddTenantModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({ ...TENANT_EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  async function save() {
    if (!f.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/property/${propertyId}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'tenant',
          name: f.name,
          phone: f.phone || null,
          email: f.email || null,
          id_type: f.id_type || null,
          id_number: f.id_number || null,
          lease_start: f.lease_start || null,
          lease_end: f.lease_end || null,
          monthly_rent: f.monthly_rent ? parseFloat(f.monthly_rent) : null,
          deposit_amount: f.deposit_amount ? parseFloat(f.deposit_amount) : null,
          deposit_status: f.deposit_status,
          status: f.status,
          notes: f.notes || null,
        }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Add tenant</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Basic info */}
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-[var(--color-text-tertiary)] mb-2">Basic info</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Full name *</label>
                <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Sharma" className={INP} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Phone</label>
                  <input type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={INP} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
                  <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="tenant@email.com" className={INP} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">ID type</label>
                  <select value={f.id_type} onChange={e => set('id_type', e.target.value)} className={INP}>
                    <option value="">None</option>
                    {['aadhaar','pan','passport','voter_id','driving_license','other'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">ID number</label>
                  <input value={f.id_number} onChange={e => set('id_number', e.target.value)} placeholder="XXXX XXXX XXXX" className={INP} />
                </div>
              </div>
            </div>
          </div>

          {/* Lease */}
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-[var(--color-text-tertiary)] mb-2">Lease</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Lease start</label>
                <input type="date" value={f.lease_start} onChange={e => set('lease_start', e.target.value)} className={INP} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Lease end</label>
                <input type="date" value={f.lease_end} onChange={e => set('lease_end', e.target.value)} className={INP} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Status</label>
                <select value={f.status} onChange={e => set('status', e.target.value)} className={INP}>
                  <option value="active">Active</option>
                  <option value="notice">Notice period</option>
                  <option value="vacated">Vacated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-[var(--color-text-tertiary)] mb-2">Financials</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Monthly rent (₹)</label>
                <input type="number" min="0" value={f.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} placeholder="25000" className={INP} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Deposit amount (₹)</label>
                <input type="number" min="0" value={f.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} placeholder="50000" className={INP} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Deposit status</label>
                <select value={f.deposit_status} onChange={e => set('deposit_status', e.target.value)} className={INP}>
                  <option value="held">Held</option>
                  <option value="partial">Partial refund</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
            <textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional notes…" className={cn(INP, 'resize-none')} />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.name.trim() || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Add tenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Upload Document Modal ────────────────────────────────────────────────────

function UploadDocModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('other')
  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function save() {
    if (!file) return
    setSaving(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('category', category)
      if (name.trim()) form.append('name', name.trim())
      if (expiresAt) form.append('expires_at', expiresAt)
      if (notes.trim()) form.append('notes', notes.trim())
      const res = await fetch(`/api/property/${propertyId}/documents`, { method: 'POST', body: form })
      if (res.ok) { onSaved(); onClose() }
      else {
        const j = await res.json().catch(() => ({}))
        setUploadError(j.error ?? 'Upload failed')
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Upload document</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">File *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xlsx,.csv"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setFile(f); if (!name) setName(f.name.replace(/\.[^.]+$/, '')) }
              }}
              className="w-full text-sm text-[var(--color-text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-gray-100)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-gray-200)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={INP}>
              {DOC_CAT_KEYS.map(k => <option key={k} value={k}>{DOC_CATEGORY_LABELS[k]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Document name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Defaults to filename" className={INP} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Expiry date</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={INP} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes…" className={cn(INP, 'resize-none')} />
          </div>
          {uploadError && <p className="text-[13px] text-[var(--color-danger-600)]">{uploadError}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!file || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────

function AddTransactionModal({ propertyId, onSaved, onClose }: { propertyId: string; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({ ...TXN_EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  const cats = f.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  function switchType(t: 'income' | 'expense') {
    setF(prev => ({ ...prev, type: t, category: t === 'income' ? 'rent' : 'other_expense' }))
  }

  async function save() {
    const amt = parseFloat(f.amount)
    if (!f.amount || amt <= 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/property/${propertyId}/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: f.type,
          category: f.category,
          amount: amt,
          description: f.description || null,
          transaction_date: f.transaction_date,
        }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Add transaction</h3>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Type</label>
            <div className="flex gap-2">
              {(['income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => switchType(t)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    f.type === t
                      ? t === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)] text-[var(--color-danger-700)]'
                      : 'border-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]',
                  )}
                >
                  {t === 'income' ? '+ Income' : '− Expense'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
              <select value={f.category} onChange={e => set('category', e.target.value)} className={INP}>
                {cats.map(k => <option key={k} value={k}>{TXN_CAT_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Amount (₹) *</label>
              <input type="number" min="0" step="0.01" value={f.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" className={INP} />
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
              <input value={f.description} onChange={e => set('description', e.target.value)} placeholder="e.g. June 2026 rent" className={INP} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Date</label>
              <input type="date" value={f.transaction_date} onChange={e => set('transaction_date', e.target.value)} className={INP} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]">Cancel</button>
            <button onClick={save} disabled={!f.amount || parseFloat(f.amount) <= 0 || saving} className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50">
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty]   = useState<Property | null>(null)
  const [maintenance, setMaint]   = useState<Maintenance[]>([])
  const [bills, setBills]         = useState<Bill[]>([])
  const [assets, setAssets]       = useState<Asset[]>([])
  const [issues, setIssues]       = useState<Issue[]>([])
  const [contacts, setContacts]   = useState<EmergencyContact[]>([])
  const [documents, setDocuments]       = useState<PropertyDocument[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tenants, setTenants]           = useState<Tenant[]>([])
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'overview'|'maintenance'|'issues'|'documents'|'finance'|'tenants'|'emergency'|'bills'|'assets'>('overview')
  const [showEdit, setShowEdit]             = useState(false)
  const [showAddMaint, setShowAddMaint]     = useState(false)
  const [showAddIssue, setShowAddIssue]     = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showUploadDoc, setShowUploadDoc]   = useState(false)
  const [showAddTxn, setShowAddTxn]         = useState(false)
  const [showAddTenant, setShowAddTenant]   = useState(false)
  const [insights, setInsights]             = useState<Insight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  async function load() {
    const [r, r2, r3, r4, r5] = await Promise.all([
      fetch(`/api/property/${id}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/property/${id}/issues`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/property/${id}/documents`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/property/${id}/finance`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/property/${id}/tenants`).then(r => r.json()).catch(() => ({})),
    ])
    if (r.property) {
      setProperty(r.property)
      setMaint(r.maintenance ?? [])
      setBills(r.bills ?? [])
      setAssets(r.assets ?? [])
    }
    setIssues(r2.issues ?? [])
    setContacts(r2.contacts ?? [])
    setDocuments(r3.documents ?? [])
    setTransactions(r4.transactions ?? [])
    setTenants(r5.tenants ?? [])
    setRentPayments(r5.payments ?? [])
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [id])

  async function markDone(maintId: string) {
    const today = new Date().toISOString().slice(0, 10)
    await fetch('/api/home', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'maintenance', id: maintId, last_done_at: today }),
    })
    load()
  }

  async function deleteProp() {
    if (!confirm('Delete this property? This cannot be undone.')) return
    const res = await fetch(`/api/property?id=${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/property')
  }

  async function viewDoc(docId: string) {
    const res = await fetch(`/api/property/${id}/documents?docId=${docId}`)
    if (res.ok) {
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
    }
  }

  async function deleteDoc(docId: string) {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const res = await fetch(`/api/property/${id}/documents?docId=${docId}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  async function deleteTxn(txnId: string) {
    if (!confirm('Delete this transaction?')) return
    const res = await fetch(`/api/property/${id}/finance?txnId=${txnId}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  async function markRentPaid(tenantId: string, month: string, amount: number) {
    await fetch(`/api/property/${id}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'payment', tenant_id: tenantId, amount, month }),
    })
    load()
  }

  async function unmarkRentPaid(paymentId: string) {
    await fetch(`/api/property/${id}/tenants?kind=payment&recordId=${paymentId}`, { method: 'DELETE' })
    load()
  }

  async function vacateTenant(tenantId: string) {
    if (!confirm('Mark this tenant as vacated?')) return
    await fetch(`/api/property/${id}/tenants`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, status: 'vacated' }),
    })
    load()
  }

  async function deleteTenant(tenantId: string) {
    if (!confirm('Delete this tenant and all rent payment records?')) return
    const res = await fetch(`/api/property/${id}/tenants?kind=tenant&recordId=${tenantId}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  async function generateInsights() {
    setInsightsLoading(true)
    try {
      const res = await fetch(`/api/property/${id}/insights`)
      if (res.ok) {
        const { insights: data } = await res.json()
        setInsights(data ?? [])
      }
    } finally {
      setInsightsLoading(false)
    }
  }

  if (loading) return null
  if (!property) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-[var(--color-text-secondary)]">Property not found.</p>
      <Link href="/property" className="text-sm text-[var(--color-brand-600)] hover:underline">← Back to properties</Link>
    </div>
  )

  const today = new Date().toISOString().slice(0,10)
  const overdue = maintenance.filter(m => m.next_due_at && m.next_due_at < today)
  const upcoming = maintenance.filter(m => m.next_due_at && m.next_due_at >= today)
  const unpaid = bills.filter(b => !b.is_paid)
  const gain = property.purchase_value && property.current_value
    ? ((property.current_value - property.purchase_value) / property.purchase_value) * 100
    : null

  const openIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed')
  const expiringDocs = documents.filter(d => {
    if (!d.expires_at) return false
    const days = Math.ceil((new Date(d.expires_at).getTime() - Date.now()) / 86_400_000)
    return days >= 0 && days <= 60
  })

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const netPL         = totalIncome - totalExpenses

  const activeTenants    = tenants.filter(t => t.status !== 'vacated')
  const expiringLeases   = activeTenants.filter(t => t.lease_end && daysUntil(t.lease_end) <= 30)
  const thisMonth        = new Date().toISOString().slice(0, 7)
  const last3Months      = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  // ── Health Score ───────────────────────────────────────────────────────────
  const CRITICAL_DOC_CATS   = ['sale_deed', 'insurance', 'property_tax']
  const presentDocCats      = new Set(documents.map(d => d.category))
  const missingCriticalDocs = CRITICAL_DOC_CATS.filter(c => !presentDocCats.has(c))
  const emergencyIssues     = issues.filter(i => i.priority === 'emergency' && i.status !== 'resolved' && i.status !== 'closed')

  type HealthFactor = { label: string; impact: number; type: 'danger' | 'warning' | 'good' }
  const healthFactors: HealthFactor[] = []
  let healthScore = 100

  if (overdue.length > 0) {
    const d = Math.min(overdue.length * 5, 20)
    healthScore -= d
    healthFactors.push({ label: `${overdue.length} overdue maintenance task${overdue.length > 1 ? 's' : ''}`, impact: -d, type: 'warning' })
  }
  if (emergencyIssues.length > 0) {
    const d = Math.min(emergencyIssues.length * 15, 30)
    healthScore -= d
    healthFactors.push({ label: `${emergencyIssues.length} emergency issue${emergencyIssues.length > 1 ? 's' : ''} open`, impact: -d, type: 'danger' })
  }
  if (expiringDocs.length > 0) {
    const d = Math.min(expiringDocs.length * 5, 15)
    healthScore -= d
    healthFactors.push({ label: `${expiringDocs.length} document${expiringDocs.length > 1 ? 's' : ''} expiring soon`, impact: -d, type: 'warning' })
  }
  if (missingCriticalDocs.length > 0) {
    const d = Math.min(missingCriticalDocs.length * 5, 10)
    healthScore -= d
    healthFactors.push({ label: `${missingCriticalDocs.length} critical doc${missingCriticalDocs.length > 1 ? 's' : ''} missing`, impact: -d, type: 'warning' })
  }
  if (transactions.length > 0 && netPL < 0) {
    healthScore -= 10
    healthFactors.push({ label: 'Negative net P&L', impact: -10, type: 'warning' })
  }
  if (expiringLeases.length > 0) {
    healthScore -= 10
    healthFactors.push({ label: `${expiringLeases.length} lease${expiringLeases.length > 1 ? 's' : ''} expiring within 30 days`, impact: -10, type: 'warning' })
  }
  if (documents.length >= 5)
    healthFactors.push({ label: 'Good document coverage', impact: 0, type: 'good' })
  if (property.status === 'rented_out' && activeTenants.length > 0)
    healthFactors.push({ label: 'Active tenant in place', impact: 0, type: 'good' })

  healthScore = Math.max(0, Math.min(100, healthScore))
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Needs attention' : 'Critical'
  const healthColor = healthScore >= 80 ? 'emerald' : healthScore >= 60 ? 'indigo' : healthScore >= 40 ? 'amber' : 'red'
  const healthTextCls = healthScore >= 80 ? 'text-emerald-700' : healthScore >= 60 ? 'text-indigo-700' : healthScore >= 40 ? 'text-amber-700' : 'text-[var(--color-danger-700)]'

  const TABS: { key: typeof tab; label: string; count?: number; alert?: boolean }[] = [
    { key: 'overview',     label: 'Overview' },
    { key: 'maintenance',  label: 'Maintenance', count: maintenance.length, alert: overdue.length > 0 },
    { key: 'issues',       label: 'Issues',       count: openIssues.length, alert: openIssues.some(i => i.priority === 'emergency') },
    { key: 'documents',    label: 'Documents',    count: documents.length,    alert: expiringDocs.length > 0 },
    { key: 'finance',      label: 'Finance',      count: transactions.length,  alert: netPL < 0 && transactions.length > 0 },
    { key: 'tenants',      label: 'Tenants',      count: activeTenants.length, alert: expiringLeases.length > 0 },
    { key: 'emergency',    label: 'Emergency',    count: contacts.length },
    { key: 'bills',        label: 'Bills',        count: bills.length },
    { key: 'assets',       label: 'Assets',       count: assets.length },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      <div className="mx-auto max-w-4xl px-4 py-6">

        {/* Back */}
        <Link href="/property" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Properties
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-gray-100)] flex items-center justify-center shrink-0 mt-0.5">
              <TypeIcon type={property.type} className="text-[var(--color-text-secondary)]" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-[var(--color-text-primary)] leading-tight">{property.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-[var(--color-text-secondary)]">{TYPE_LABELS[property.type] ?? property.type}</span>
                <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', STATUS_STYLES[property.status] ?? STATUS_STYLES.owned)}>
                  {STATUS_LABELS[property.status] ?? property.status}
                </span>
              </div>
              {(property.city || property.state || property.country) && (
                <p className="flex items-center gap-1 text-[13px] text-[var(--color-text-tertiary)] mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {[property.city, property.state, property.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)]" aria-label="Edit property">
              <Edit3 className="h-4 w-4" />
            </button>
            <button onClick={deleteProp} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-600)] hover:border-[var(--color-danger-200)]" aria-label="Delete property">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {overdue.length > 0 && (
          <div className="mb-5 rounded-xl bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] px-4 py-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-[var(--color-danger-600)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--color-danger-700)]">
              <span className="font-medium">{overdue.length} maintenance {overdue.length === 1 ? 'task is' : 'tasks are'} overdue.</span>{' '}
              <button onClick={() => setTab('maintenance')} className="underline">View maintenance</button>
            </p>
          </div>
        )}

        {/* Tabs — scrollable on mobile */}
        <div className="flex gap-1 bg-[var(--color-gray-100)] rounded-lg p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex-shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors flex items-center gap-1.5',
                tab === t.key
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {t.label}
              {t.alert && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger-500)] shrink-0" />}
              {!t.alert && t.count !== undefined && t.count > 0 && (
                <span className={cn('text-[11px] rounded-full px-1.5 py-0.5 leading-none font-semibold',
                  tab === t.key ? 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)]' : 'bg-[var(--color-gray-200)] text-[var(--color-text-tertiary)]'
                )}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-5">

            {/* ── Health Score card ── */}
            <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5">
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <ScoreRing score={healthScore} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Property Health</p>
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', healthTextCls,
                      healthColor === 'emerald' ? 'bg-emerald-50' : healthColor === 'indigo' ? 'bg-indigo-50' : healthColor === 'amber' ? 'bg-amber-50' : 'bg-[var(--color-danger-50)]'
                    )}>{healthLabel}</span>
                  </div>
                  <div className="space-y-1">
                    {healthFactors.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px]">
                        {f.type === 'good'
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          : f.type === 'danger'
                            ? <AlertCircle className="h-3.5 w-3.5 text-[var(--color-danger-500)] shrink-0" />
                            : <TriangleAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        <span className={f.type === 'good' ? 'text-[var(--color-text-secondary)]' : f.type === 'danger' ? 'text-[var(--color-danger-700)]' : 'text-amber-700'}>
                          {f.label}
                        </span>
                        {f.impact < 0 && <span className="text-[11px] text-[var(--color-text-tertiary)] ml-auto shrink-0">{f.impact}</span>}
                      </div>
                    ))}
                    {healthFactors.length === 0 && (
                      <p className="text-[13px] text-[var(--color-text-secondary)]">All checks passed — great property condition.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI Insights ── */}
            <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-brand-500)]" />
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">AI Property Brain</p>
                </div>
                <button
                  onClick={generateInsights}
                  disabled={insightsLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-600)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-brand-700)] disabled:opacity-60 transition-colors"
                >
                  {insightsLoading
                    ? <><span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />Analysing…</>
                    : <><Sparkles className="h-3 w-3" />{insights.length > 0 ? 'Refresh' : 'Generate insights'}</>}
                </button>
              </div>
              {insights.length === 0 && !insightsLoading && (
                <div className="flex flex-col items-center py-6 text-center">
                  <Lightbulb className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                  <p className="text-[13px] text-[var(--color-text-secondary)]">Click &ldquo;Generate insights&rdquo; for an AI-powered review of this property&apos;s health, financials, and risks.</p>
                </div>
              )}
              {insights.length > 0 && (
                <div className="space-y-3">
                  {insights.map((ins, i) => {
                    const priorityStyles = {
                      high:   { bar: 'bg-[var(--color-danger-500)]',  label: 'bg-[var(--color-danger-50)] text-[var(--color-danger-700)]' },
                      medium: { bar: 'bg-amber-500',                   label: 'bg-amber-50 text-amber-700' },
                      low:    { bar: 'bg-emerald-500',                 label: 'bg-emerald-50 text-emerald-700' },
                    }[ins.priority]
                    return (
                      <div key={i} className="flex gap-3 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-4 py-3">
                        <div className={cn('w-1 rounded-full shrink-0 self-stretch', priorityStyles.bar)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{ins.title}</p>
                            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0', priorityStyles.label)}>{ins.priority}</span>
                          </div>
                          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{ins.body}</p>
                          {ins.action && (
                            <p className="text-[12px] text-[var(--color-brand-600)] font-medium mt-1.5 flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 shrink-0" />{ins.action}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Value summary */}
            {(property.purchase_value || property.current_value) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.purchase_value && (
                  <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Purchase value</p>
                    <p className="text-[18px] font-semibold text-[var(--color-text-primary)] mt-1">{fmt(property.purchase_value)}</p>
                  </div>
                )}
                {property.current_value && (
                  <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Current value</p>
                    <p className="text-[18px] font-semibold text-[var(--color-text-primary)] mt-1">{fmt(property.current_value)}</p>
                  </div>
                )}
                {gain !== null && (
                  <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Appreciation</p>
                    <p className={cn('text-[18px] font-semibold mt-1', gain >= 0 ? 'text-emerald-600' : 'text-[var(--color-danger-600)]')}>
                      {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Details grid */}
            <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] divide-y divide-[var(--color-border-soft)]">
              {[
                ['Address', [property.address, property.city, property.state, property.pincode, property.country].filter(Boolean).join(', ')],
                ['Built-up area', property.built_up_area ? `${property.built_up_area} ${property.area_unit}` : null],
                ['Carpet area',   property.carpet_area   ? `${property.carpet_area} ${property.area_unit}`   : null],
                ['Ownership',     property.ownership_type ? property.ownership_type.charAt(0).toUpperCase() + property.ownership_type.slice(1) : null],
                ['Co-owners',     property.co_owners],
                ['Society / building', property.society_name],
                ['Registration no.',   property.registration_no],
                ['Property tax no.',   property.property_tax_no],
                ['Notes',              property.notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex items-start px-4 py-3 gap-4">
                  <span className="text-[13px] text-[var(--color-text-tertiary)] w-36 shrink-0">{label}</span>
                  <span className="text-[13px] text-[var(--color-text-primary)] flex-1">{value}</span>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Maintenance tasks', value: maintenance.length, icon: Wrench, alert: overdue.length > 0, onClick: () => setTab('maintenance') },
                { label: 'Bills tracked',     value: bills.length,       icon: Receipt, alert: unpaid.length > 0, onClick: () => setTab('bills') },
                { label: 'Assets',            value: assets.length,      icon: Box,     alert: false, onClick: () => setTab('assets') },
              ].map(s => (
                <button key={s.label} onClick={s.onClick} className="group text-left rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 hover:border-[var(--color-brand-200)] hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                    {s.alert && <span className="h-2 w-2 rounded-full bg-[var(--color-danger-500)]" />}
                  </div>
                  <p className="text-[20px] font-semibold text-[var(--color-text-primary)]">{s.value}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{s.label}</p>
                  <ChevronRight className="h-3 w-3 text-[var(--color-text-tertiary)] mt-1 group-hover:text-[var(--color-text-secondary)] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MAINTENANCE ──────────────────────────────────────── */}
        {tab === 'maintenance' && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowAddMaint(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add task
              </button>
            </div>
            {maintenance.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <Wrench className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No maintenance tasks</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Add recurring tasks like AC servicing, pest control.</p>
              </div>
            ) : (
              [...overdue, ...upcoming].map(m => {
                const isOverdue = m.next_due_at && m.next_due_at < today
                const days = m.next_due_at ? daysUntil(m.next_due_at) : null
                return (
                  <div key={m.id} className={cn('flex items-start gap-4 rounded-xl border px-4 py-3.5 bg-[var(--color-surface-raised)]', isOverdue ? 'border-[var(--color-danger-200)]' : 'border-[var(--color-border-soft)]')}>
                    <button
                      onClick={() => markDone(m.id)}
                      className="mt-0.5 h-5 w-5 rounded-full border-2 border-[var(--color-border-soft)] hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-center transition-colors shrink-0"
                      aria-label="Mark done"
                    >
                      <Check className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {m.category && <span className="text-[12px] text-[var(--color-text-secondary)]">{m.category}</span>}
                        {m.vendor && <><span className="text-[var(--color-text-tertiary)]">·</span><span className="text-[12px] text-[var(--color-text-secondary)]">{m.vendor}</span></>}
                        {m.recurrence_months && <><span className="text-[var(--color-text-tertiary)]">·</span><span className="text-[12px] text-[var(--color-text-secondary)]">Every {m.recurrence_months}mo</span></>}
                      </div>
                    </div>
                    {m.next_due_at && (
                      <div className="text-right shrink-0">
                        <p className={cn('text-[12px] font-medium', isOverdue ? 'text-[var(--color-danger-600)]' : days !== null && days <= 7 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]')}>
                          {isOverdue ? `${Math.abs(days ?? 0)}d overdue` : days === 0 ? 'Due today' : `In ${days}d`}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">{m.next_due_at}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── BILLS ────────────────────────────────────────────── */}
        {tab === 'bills' && (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-2">Bills linked to this property. Add new bills via <Link href="/home" className="text-[var(--color-brand-600)] hover:underline">Home & assets</Link>.</p>
            {bills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <Receipt className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No bills linked</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Bills added in Home & assets can be linked here.</p>
              </div>
            ) : (
              bills.map(b => (
                <div key={b.id} className="flex items-center gap-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3.5">
                  <div className={cn('h-2 w-2 rounded-full shrink-0', b.is_paid ? 'bg-emerald-400' : 'bg-amber-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{b.utility}</p>
                    {b.provider && <p className="text-[12px] text-[var(--color-text-secondary)]">{b.provider}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">₹{b.amount.toLocaleString('en-IN')}</p>
                    <p className={cn('text-[11px]', b.is_paid ? 'text-emerald-600' : 'text-amber-600')}>{b.is_paid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ASSETS ───────────────────────────────────────────── */}
        {tab === 'assets' && (
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-2">Assets linked to this property. Add new assets via <Link href="/home" className="text-[var(--color-brand-600)] hover:underline">Home & assets</Link>.</p>
            {assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <Box className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No assets linked</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Assets like appliances and furniture can be linked here.</p>
              </div>
            ) : (
              assets.map(a => (
                <div key={a.id} className="flex items-center gap-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3.5">
                  <Box className="h-5 w-5 text-[var(--color-text-tertiary)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{a.name}</p>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">{[a.brand, a.model].filter(Boolean).join(' · ') || a.type}</p>
                  </div>
                  {a.cost && <p className="text-[13px] font-medium text-[var(--color-text-secondary)] shrink-0">{fmt(a.cost)}</p>}
                  {a.warranty_until && (
                    <div className="text-right shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] inline mr-1" />
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">{a.warranty_until}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ISSUES ───────────────────────────────────────────── */}
        {tab === 'issues' && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowAddIssue(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Report issue
              </button>
            </div>
            {issues.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <TriangleAlert className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No issues reported</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Log breakdowns, repairs, and defects here.</p>
              </div>
            ) : (
              issues.map(issue => {
                const PRIORITY_STYLE: Record<string, string> = {
                  emergency: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)]',
                  high: 'bg-orange-50 border-orange-200',
                  medium: 'bg-[var(--color-surface-raised)] border-[var(--color-border-soft)]',
                  low: 'bg-[var(--color-surface-raised)] border-[var(--color-border-soft)]',
                }
                const STATUS_ICON: Record<string, React.ReactNode> = {
                  open:        <CircleDot  className="h-4 w-4 text-amber-500" />,
                  in_progress: <Clock      className="h-4 w-4 text-[var(--color-brand-600)]" />,
                  resolved:    <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                  closed:      <CheckCircle2 className="h-4 w-4 text-[var(--color-text-tertiary)]" />,
                }
                return (
                  <div key={issue.id} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3.5', PRIORITY_STYLE[issue.priority] ?? PRIORITY_STYLE.medium)}>
                    <div className="mt-0.5 shrink-0">{STATUS_ICON[issue.status] ?? STATUS_ICON.open}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{issue.title}</p>
                        {issue.priority === 'emergency' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-danger-100)] text-[var(--color-danger-700)] uppercase tracking-wide">Emergency</span>
                        )}
                      </div>
                      {issue.description && <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{issue.description}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[12px] text-[var(--color-text-tertiary)]">
                        {issue.category && <span>{issue.category}</span>}
                        {issue.vendor_name && <><span>·</span><span>{issue.vendor_name}</span></>}
                        <span>·</span><span>{issue.reported_at}</span>
                      </div>
                    </div>
                    {(issue.actual_cost ?? issue.estimated_cost) && (
                      <p className="text-[13px] font-medium text-[var(--color-text-secondary)] shrink-0">
                        {fmt(issue.actual_cost ?? issue.estimated_cost ?? 0)}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── DOCUMENTS ────────────────────────────────────────── */}
        {tab === 'documents' && (
          <div className="space-y-3">
            {expiringDocs.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  <span className="font-medium">{expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expiring within 60 days.</span>
                  {' '}Review and renew before they lapse.
                </p>
              </div>
            )}
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowUploadDoc(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={2} />
                Upload document
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No documents uploaded</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Upload sale deeds, insurance, warranties, and more.</p>
              </div>
            ) : (
              documents.map(doc => {
                const daysLeft = doc.expires_at ? Math.ceil((new Date(doc.expires_at).getTime() - Date.now()) / 86_400_000) : null
                const isExpired  = daysLeft !== null && daysLeft < 0
                const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60
                return (
                  <div key={doc.id} className={cn(
                    'flex items-start gap-3 rounded-xl border px-4 py-3.5 bg-[var(--color-surface-raised)]',
                    isExpired ? 'border-[var(--color-danger-200)]' : isExpiring ? 'border-amber-200' : 'border-[var(--color-border-soft)]',
                  )}>
                    <FileText className="h-5 w-5 text-[var(--color-text-tertiary)] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[var(--color-text-primary)] truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[12px] text-[var(--color-text-tertiary)]">
                        <span>{DOC_CATEGORY_LABELS[doc.category] ?? doc.category}</span>
                        <span>·</span>
                        <span>{formatBytes(doc.size_bytes)}</span>
                        {doc.expires_at && (
                          <>
                            <span>·</span>
                            <span className={cn(isExpired ? 'text-[var(--color-danger-600)] font-medium' : isExpiring ? 'text-amber-600 font-medium' : '')}>
                              {isExpired
                                ? `Expired ${Math.abs(daysLeft!)}d ago`
                                : daysLeft === 0 ? 'Expires today'
                                : `Expires in ${daysLeft}d`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => viewDoc(doc.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-brand-600)]"
                        aria-label="View document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDoc(doc.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-600)]"
                        aria-label="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── FINANCE ──────────────────────────────────────────── */}
        {tab === 'finance' && (
          <div className="space-y-4">
            {/* P&L summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Total income</p>
                <p className="text-[18px] font-semibold text-emerald-600 mt-1">{totalIncome > 0 ? fmt(totalIncome) : '—'}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Total expenses</p>
                <p className="text-[18px] font-semibold text-[var(--color-danger-600)] mt-1">{totalExpenses > 0 ? fmt(totalExpenses) : '—'}</p>
              </div>
              <div className={cn('rounded-xl border p-4', transactions.length === 0 ? 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]' : netPL >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-[var(--color-danger-200)] bg-[var(--color-danger-50)]')}>
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Net P&amp;L</p>
                <p className={cn('text-[18px] font-semibold mt-1', transactions.length === 0 ? 'text-[var(--color-text-tertiary)]' : netPL >= 0 ? 'text-emerald-700' : 'text-[var(--color-danger-700)]')}>
                  {transactions.length === 0 ? '—' : `${netPL >= 0 ? '+' : ''}${fmt(Math.abs(netPL))}`}
                </p>
              </div>
            </div>

            {/* Yield / ROI */}
            {property.current_value && totalIncome > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Gross rental yield</p>
                  <p className="text-[18px] font-semibold text-[var(--color-brand-700)] mt-1">
                    {((totalIncome / property.current_value) * 100).toFixed(2)}%
                  </p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">income ÷ current value</p>
                </div>
                {property.purchase_value && (
                  <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                    <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">Net ROI</p>
                    <p className={cn('text-[18px] font-semibold mt-1', netPL >= 0 ? 'text-emerald-600' : 'text-[var(--color-danger-600)]')}>
                      {((netPL / property.purchase_value) * 100).toFixed(2)}%
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">net P&amp;L ÷ purchase value</p>
                  </div>
                )}
              </div>
            )}

            {/* Add button */}
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowAddTxn(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add transaction
              </button>
            </div>

            {/* Transaction list */}
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No transactions yet</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Log rent, expenses, EMIs, renovation costs, and more.</p>
              </div>
            ) : (
              transactions.map(txn => (
                <div key={txn.id} className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3.5',
                  txn.type === 'income'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]',
                )}>
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    txn.type === 'income' ? 'bg-emerald-100' : 'bg-[var(--color-gray-100)]',
                  )}>
                    {txn.type === 'income'
                      ? <TrendingUp className="h-4 w-4 text-emerald-600" />
                      : <TrendingDown className="h-4 w-4 text-[var(--color-text-secondary)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                      {txn.description || TXN_CAT_LABELS[txn.category] || txn.category}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                      <span>{TXN_CAT_LABELS[txn.category] ?? txn.category}</span>
                      <span>·</span>
                      <span>{txn.transaction_date}</span>
                    </div>
                  </div>
                  <p className={cn('text-[15px] font-semibold shrink-0',
                    txn.type === 'income' ? 'text-emerald-600' : 'text-[var(--color-text-primary)]',
                  )}>
                    {txn.type === 'income' ? '+' : '−'}{fmt(txn.amount)}
                  </p>
                  <button
                    onClick={() => deleteTxn(txn.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-600)] shrink-0"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TENANTS ──────────────────────────────────────────── */}
        {tab === 'tenants' && (
          <div className="space-y-3">
            {expiringLeases.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  <span className="font-medium">{expiringLeases.length} lease{expiringLeases.length > 1 ? 's' : ''} expiring within 30 days.</span>
                  {' '}Contact tenant(s) to renew or confirm vacating.
                </p>
              </div>
            )}
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowAddTenant(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add tenant
              </button>
            </div>
            {tenants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <Home className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No tenants added</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Track tenants, lease periods, and monthly rent collection.</p>
              </div>
            ) : (
              tenants.map(tenant => {
                const leaseActive = tenant.status === 'active' || tenant.status === 'notice'
                const leaseDays   = tenant.lease_end ? daysUntil(tenant.lease_end) : null
                const isExpiring  = leaseDays !== null && leaseDays >= 0 && leaseDays <= 30
                const isExpired   = leaseDays !== null && leaseDays < 0

                return (
                  <div key={tenant.id} className={cn(
                    'rounded-xl border bg-[var(--color-surface-raised)] overflow-hidden',
                    isExpiring ? 'border-amber-200' : 'border-[var(--color-border-soft)]',
                  )}>
                    {/* Tenant header */}
                    <div className="flex items-start justify-between px-4 pt-4 pb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{tenant.name}</p>
                          <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', TENANT_STATUS_STYLES[tenant.status] ?? TENANT_STATUS_STYLES.active)}>
                            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-[13px] text-[var(--color-text-secondary)]">
                          {tenant.phone && (
                            <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-[var(--color-brand-600)]">
                              <Phone className="h-3 w-3" />{tenant.phone}
                            </a>
                          )}
                          {tenant.email && <span>{tenant.email}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {leaseActive && (
                          <button
                            onClick={() => vacateTenant(tenant.id)}
                            className="rounded-md px-2 py-1 text-[12px] font-medium text-[var(--color-text-tertiary)] border border-[var(--color-border-soft)] hover:bg-[var(--color-gray-50)]"
                          >
                            Mark vacated
                          </button>
                        )}
                        <button
                          onClick={() => deleteTenant(tenant.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-danger-50)] hover:text-[var(--color-danger-600)]"
                          aria-label="Delete tenant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lease & financials */}
                    <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                      {tenant.lease_start && tenant.lease_end && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-[var(--color-text-tertiary)] mb-0.5">Lease period</p>
                          <p className={cn('font-medium', isExpired ? 'text-[var(--color-danger-600)]' : isExpiring ? 'text-amber-700' : 'text-[var(--color-text-primary)]')}>
                            {tenant.lease_start} → {tenant.lease_end}
                            {leaseDays !== null && (
                              <span className="text-[12px] font-normal text-[var(--color-text-tertiary)] ml-1">
                                {isExpired ? `(expired ${Math.abs(leaseDays)}d ago)` : leaseDays === 0 ? '(ends today)' : `(${leaseDays}d left)`}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      {tenant.monthly_rent && (
                        <div>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] mb-0.5">Monthly rent</p>
                          <p className="font-medium text-[var(--color-text-primary)]">{fmt(tenant.monthly_rent)}</p>
                        </div>
                      )}
                      {tenant.deposit_amount && (
                        <div>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] mb-0.5">Deposit</p>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {fmt(tenant.deposit_amount)}
                            <span className="text-[11px] font-normal text-[var(--color-text-tertiary)] ml-1">({DEPOSIT_STATUS_LABELS[tenant.deposit_status]})</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rent payment strip — last 3 months */}
                    {tenant.monthly_rent && (
                      <div className="border-t border-[var(--color-border-soft)] px-4 py-3 flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] uppercase tracking-wide font-semibold text-[var(--color-text-tertiary)]">Rent</span>
                        {last3Months.map(month => {
                          const payment = rentPayments.find(p => p.tenant_id === tenant.id && p.month === month)
                          const isCurrent = month === thisMonth
                          return (
                            <div key={month} className="flex items-center gap-1.5">
                              <span className="text-[12px] text-[var(--color-text-secondary)]">{fmtMonth(month)}</span>
                              {payment ? (
                                <button
                                  onClick={() => unmarkRentPaid(payment.id)}
                                  className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-medium hover:bg-emerald-200 transition-colors"
                                  title="Click to unmark"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Paid
                                </button>
                              ) : (
                                <button
                                  onClick={() => markRentPaid(tenant.id, month, tenant.monthly_rent!)}
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors',
                                    isCurrent
                                      ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                                      : 'border-[var(--color-border-soft)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)]',
                                  )}
                                >
                                  Mark paid
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── EMERGENCY CONTACTS ───────────────────────────────── */}
        {tab === 'emergency' && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-gray-800)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add contact
              </button>
            </div>
            {contacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] py-14 flex flex-col items-center text-center">
                <Phone className="h-8 w-8 text-[var(--color-text-tertiary)] mb-2" strokeWidth={1.25} />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No emergency contacts</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Add electrician, plumber, security, and caretaker numbers.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {contacts.map(c => (
                  <a
                    key={c.id}
                    href={`tel:${c.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3.5 hover:border-[var(--color-brand-200)] hover:shadow-sm transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-50)] transition-colors">
                      <Zap className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{c.label}</p>
                      {c.name && <p className="text-[12px] text-[var(--color-text-secondary)]">{c.name}</p>}
                      <p className="text-[13px] text-[var(--color-brand-600)] font-medium mt-0.5">{c.phone}</p>
                    </div>
                    <Phone className="h-4 w-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-600)] transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <EditPropertyModal
          property={property}
          onSaved={load}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showAddMaint && (
        <AddMaintModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowAddMaint(false)}
        />
      )}
      {showAddIssue && (
        <AddIssueModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowAddIssue(false)}
        />
      )}
      {showAddContact && (
        <AddContactModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowAddContact(false)}
        />
      )}
      {showUploadDoc && (
        <UploadDocModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowUploadDoc(false)}
        />
      )}
      {showAddTxn && (
        <AddTransactionModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowAddTxn(false)}
        />
      )}
      {showAddTenant && (
        <AddTenantModal
          propertyId={id}
          onSaved={load}
          onClose={() => setShowAddTenant(false)}
        />
      )}

    </div>
  )
}
