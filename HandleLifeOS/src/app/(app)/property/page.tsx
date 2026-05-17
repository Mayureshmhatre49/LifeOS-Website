'use client'

import { useState, useEffect } from 'react'
import {
  Building2, Plus, MapPin, ChevronRight, X,
  Home, Warehouse, Trees, Store, Landmark, TrendingUp, TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Property {
  id: string
  name: string
  type: string
  status: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  purchase_value: number | null
  current_value: number | null
  built_up_area: number | null
  area_unit: string
  ownership_type: string
  society_name: string | null
  notes: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  primary_residence: 'Primary Residence',
  apartment:         'Apartment',
  villa:             'Villa',
  vacation_home:     'Vacation Home',
  farmhouse:         'Farmhouse',
  commercial:        'Commercial',
  office:            'Office',
  shop:              'Shop',
  warehouse:         'Warehouse',
  land:              'Land',
  ancestral:         'Ancestral',
  other:             'Other',
}

const STATUS_STYLES: Record<string, string> = {
  owned:             'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]',
  rented_out:        'bg-emerald-50 text-emerald-700',
  vacant:            'bg-amber-50 text-amber-700',
  under_renovation:  'bg-orange-50 text-orange-700',
  for_sale:          'bg-purple-50 text-purple-700',
}

const STATUS_LABELS: Record<string, string> = {
  owned:             'Owned',
  rented_out:        'Rented out',
  vacant:            'Vacant',
  under_renovation:  'Under renovation',
  for_sale:          'For sale',
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = cn('h-5 w-5', className)
  if (type === 'land')                      return <Trees   className={cls} />
  if (type === 'commercial' || type === 'shop') return <Store  className={cls} />
  if (type === 'warehouse')                 return <Warehouse className={cls} />
  if (type === 'office')                    return <Landmark className={cls} />
  return <Home className={cls} />
}

function formatValue(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)} Cr`
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)} L`
  return `₹${v.toLocaleString('en-IN')}`
}

const EMPTY: Record<string, string> = {
  name: '', type: 'primary_residence', status: 'owned',
  address: '', city: '', state: '', country: 'India', pincode: '',
  purchase_value: '', current_value: '',
  built_up_area: '', carpet_area: '', plot_area: '', area_unit: 'sqft',
  ownership_type: 'sole', co_owners: '', society_name: '',
  registration_no: '', property_tax_no: '', notes: '',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Inp({ k, f, set, ...rest }: { k: string; f: Record<string, string>; set: (k: string, v: string) => void; [key: string]: unknown }) {
  return (
    <input
      value={f[k]}
      onChange={e => set(k, (e.target as HTMLInputElement).value)}
      className="w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
      {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  )
}

function Sel({ k, f, set, options }: { k: string; f: Record<string, string>; set: (k: string, v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={f[k]}
      onChange={e => set(k, e.target.value)}
      className="w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

export default function PropertyPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [f, setFState]              = useState({ ...EMPTY })

  const set = (k: string, v: string) => setFState(prev => ({ ...prev, [k]: v }))

  async function load() {
    const r = await fetch('/api/property').then(r => r.json()).catch(() => ({ properties: [] }))
    setProperties(r.properties ?? [])
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function save() {
    if (!f.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          purchase_value: f.purchase_value ? parseFloat(f.purchase_value) : null,
          current_value:  f.current_value  ? parseFloat(f.current_value)  : null,
          built_up_area:  f.built_up_area  ? parseFloat(f.built_up_area)  : null,
          carpet_area:    f.carpet_area    ? parseFloat(f.carpet_area)    : null,
          plot_area:      f.plot_area      ? parseFloat(f.plot_area)      : null,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setFState({ ...EMPTY })
        load()
      }
    } finally {
      setSaving(false)
    }
  }

  const totalValue    = properties.reduce((s, p) => s + (p.current_value ?? p.purchase_value ?? 0), 0)
  const totalPurchase = properties.reduce((s, p) => s + (p.purchase_value ?? 0), 0)
  const appreciation  = totalPurchase > 0 ? ((totalValue - totalPurchase) / totalPurchase) * 100 : 0

  if (loading) return null

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)]">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)] leading-tight">Properties</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Your real estate portfolio</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add property
          </button>
        </div>

        {/* Portfolio summary */}
        {properties.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Properties',       value: `${properties.length}`,         sub: 'in portfolio' },
              { label: 'Portfolio value',  value: formatValue(totalValue),         sub: 'estimated current' },
              { label: 'Appreciation',     value: `${appreciation >= 0 ? '+' : ''}${appreciation.toFixed(1)}%`, sub: 'vs purchase price', positive: appreciation >= 0 },
              { label: 'Active rentals',   value: `${properties.filter(p => p.status === 'rented_out').length}`, sub: 'earning income' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-medium">{stat.label}</p>
                <p className={cn(
                  'text-[20px] font-semibold mt-1 leading-none flex items-center gap-1',
                  stat.positive === true  ? 'text-emerald-600' :
                  stat.positive === false ? 'text-[var(--color-danger-600)]' :
                  'text-[var(--color-text-primary)]',
                )}>
                  {stat.positive === true  && <TrendingUp   className="h-4 w-4" />}
                  {stat.positive === false && <TrendingDown  className="h-4 w-4" />}
                  {stat.value}
                </p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Property list */}
        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="h-10 w-10 text-[var(--color-text-tertiary)] mb-3" strokeWidth={1.25} />
            <p className="text-[15px] font-medium text-[var(--color-text-primary)]">No properties yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xs">
              Add your first property to start managing your real estate portfolio.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add property
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {properties.map(p => {
              const displayValue = p.current_value ?? p.purchase_value
              const gain = p.purchase_value && p.current_value
                ? ((p.current_value - p.purchase_value) / p.purchase_value) * 100
                : null
              return (
                <Link
                  key={p.id}
                  href={`/property/${p.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-5 py-4 hover:border-[var(--color-brand-200)] hover:shadow-sm transition-all"
                >
                  <div className="h-11 w-11 rounded-lg bg-[var(--color-gray-100)] flex items-center justify-center shrink-0">
                    <TypeIcon type={p.type} className="text-[var(--color-text-secondary)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', STATUS_STYLES[p.status] ?? STATUS_STYLES.owned)}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
                      <span>{TYPE_LABELS[p.type] ?? p.type}</span>
                      {(p.city || p.state) && (
                        <>
                          <span className="text-[var(--color-text-tertiary)] mx-0.5">·</span>
                          <MapPin className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                          <span>{[p.city, p.state].filter(Boolean).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    {displayValue != null && (
                      <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{formatValue(displayValue)}</p>
                    )}
                    {gain !== null && (
                      <p className={cn('text-[12px] font-medium', gain >= 0 ? 'text-emerald-600' : 'text-[var(--color-danger-600)]')}>
                        {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                      </p>
                    )}
                    {p.built_up_area && !displayValue && (
                      <p className="text-[13px] text-[var(--color-text-secondary)]">{p.built_up_area} {p.area_unit ?? 'sqft'}</p>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface-raised)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            <div className="sticky top-0 bg-[var(--color-surface-raised)] border-b border-[var(--color-border-soft)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Add property</h2>
              <button
                onClick={() => { setShowForm(false); setFState({ ...EMPTY }) }}
                className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-gray-100)] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Identity */}
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-semibold">Identity</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Property name *">
                    <Inp k="name" f={f} set={set} placeholder="e.g. Bandra Flat, Alibag Farmhouse" />
                  </Field>
                </div>
                <Field label="Type">
                  <Sel k="type" f={f} set={set} options={Object.entries(TYPE_LABELS)} />
                </Field>
                <Field label="Status">
                  <Sel k="status" f={f} set={set} options={Object.entries(STATUS_LABELS)} />
                </Field>
              </div>

              {/* Location */}
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-semibold pt-2">Location</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Address">
                    <Inp k="address" f={f} set={set} placeholder="Street address" />
                  </Field>
                </div>
                <Field label="City"><Inp k="city" f={f} set={set} placeholder="Mumbai" /></Field>
                <Field label="State"><Inp k="state" f={f} set={set} placeholder="Maharashtra" /></Field>
                <Field label="Country"><Inp k="country" f={f} set={set} placeholder="India" /></Field>
                <Field label="PIN / ZIP"><Inp k="pincode" f={f} set={set} placeholder="400001" /></Field>
              </div>

              {/* Financials */}
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-semibold pt-2">Financials</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Purchase value (₹)">
                  <Inp k="purchase_value" f={f} set={set} type="number" placeholder="0" />
                </Field>
                <Field label="Current estimated value (₹)">
                  <Inp k="current_value" f={f} set={set} type="number" placeholder="0" />
                </Field>
              </div>

              {/* Area */}
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-semibold pt-2">Area</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Built-up area">
                  <Inp k="built_up_area" f={f} set={set} type="number" placeholder="0" />
                </Field>
                <Field label="Carpet area">
                  <Inp k="carpet_area" f={f} set={set} type="number" placeholder="0" />
                </Field>
                <Field label="Unit">
                  <Sel k="area_unit" f={f} set={set} options={[['sqft','sq ft'],['sqm','sq m'],['sqyd','sq yd'],['acres','acres'],['guntha','guntha']]} />
                </Field>
              </div>

              {/* Ownership */}
              <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)] font-semibold pt-2">Ownership</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ownership type">
                  <Sel k="ownership_type" f={f} set={set} options={[['sole','Sole owner'],['joint','Joint'],['inherited','Inherited'],['trust','Trust'],['company','Company']]} />
                </Field>
                <Field label="Co-owners / partners">
                  <Inp k="co_owners" f={f} set={set} placeholder="Name, Name…" />
                </Field>
                <Field label="Society / building name">
                  <Inp k="society_name" f={f} set={set} placeholder="Raheja Gardens" />
                </Field>
                <Field label="Registration number">
                  <Inp k="registration_no" f={f} set={set} placeholder="REG-XXXX" />
                </Field>
              </div>

              {/* Notes */}
              <Field label="Notes">
                <textarea
                  value={f.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={2}
                  placeholder="Any additional notes…"
                  className="w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); setFState({ ...EMPTY }) }}
                  className="flex-1 rounded-lg border border-[var(--color-border-soft)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!f.name.trim() || saving}
                  className="flex-1 rounded-lg bg-[var(--color-gray-900)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-gray-800)] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save property'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
