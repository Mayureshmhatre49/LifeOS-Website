'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  RefreshCw, Plus, Sparkles, AlertTriangle, Clock, CheckCircle2,
  DollarSign, Shield, Car, Building, Heart, BookOpen, Globe, Users,
  Briefcase, Tag, MoreVertical, ChevronDown, Calendar, BarChart2,
  Zap, Loader2, X, ChevronLeft, ChevronRight, TrendingUp,
  Bell, AlertCircle, FileText, Search, Filter, Check, History,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'financial' | 'identity' | 'vehicle' | 'property' |
  'health' | 'education' | 'digital' | 'family' | 'business' | 'other'

type RiskLevel  = 'low' | 'medium' | 'high' | 'critical'
type Status     = 'active' | 'renewed' | 'expired' | 'cancelled' | 'archived'
type Frequency  = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom'
type UrgencyLevel = 'overdue' | 'critical' | 'high' | 'medium' | 'low'

interface RenewalItem {
  id: string
  title: string
  category: Category
  subcategory: string | null
  description: string | null
  provider: string | null
  reference_no: string | null
  start_date: string | null
  expiry_date: string
  last_renewed_at: string | null
  next_expected_renewal: string | null
  renewal_window_days: number
  recurring_frequency: Frequency | null
  recurring_months: number | null
  reminder_days: number[]
  estimated_cost: number | null
  actual_cost: number | null
  currency: string
  status: Status
  risk_level: RiskLevel
  auto_detected: boolean
  confidence_score: number | null
  ai_summary: string | null
  ai_risk_notes: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  days_until_expiry: number
  urgency_level: UrgencyLevel
}

type Tab = 'all' | 'soon' | 'risk' | 'calendar' | 'analytics'
type SortBy = 'urgency' | 'date' | 'cost' | 'name'

// ─── Category config ──────────────────────────────────────────────────────────

const CAT: Record<Category, {
  label: string
  Icon: React.ElementType
  color: string
  bg: string
}> = {
  financial:  { label: 'Financial',     Icon: DollarSign, color: '#d97706', bg: '#fef3c7' },
  identity:   { label: 'Identity',      Icon: Shield,     color: '#2563eb', bg: '#dbeafe' },
  vehicle:    { label: 'Vehicles',      Icon: Car,        color: '#475569', bg: '#f1f5f9' },
  property:   { label: 'Property',      Icon: Building,   color: '#7c3aed', bg: '#ede9fe' },
  health:     { label: 'Health',        Icon: Heart,      color: '#dc2626', bg: '#fee2e2' },
  education:  { label: 'Education',     Icon: BookOpen,   color: '#059669', bg: '#d1fae5' },
  digital:    { label: 'Digital',       Icon: Globe,      color: '#0891b2', bg: '#cffafe' },
  family:     { label: 'Family',        Icon: Users,      color: '#db2777', bg: '#fce7f3' },
  business:   { label: 'Business',      Icon: Briefcase,  color: '#4338ca', bg: '#e0e7ff' },
  other:      { label: 'Other',         Icon: Tag,        color: '#6b7280', bg: '#f3f4f6' },
}

const SUBCATS: Record<Category, string[]> = {
  financial:  ['Insurance','Loan EMI','Credit Card','SIP','Tax Filing','GST Filing','TDS','Rent Agreement','Property Tax','Other'],
  identity:   ['Passport','Visa','Driving License','Professional License','Work Permit','Contract','Certification','Other'],
  vehicle:    ['Vehicle Insurance','Pollution Certificate','Servicing','Registration','Warranty','FASTag Recharge','Other'],
  property:   ['Maintenance Contract','Pest Control','Water Tank Cleaning','Generator Service','Property Tax','Security Contract','AMC','Other'],
  health:     ['Medicine Refill','Health Checkup','Health Insurance','Therapy Appointment','Vaccination','Other'],
  education:  ['School Fees','Tuition','Certification Renewal','Course Subscription','Other'],
  digital:    ['Domain Renewal','Web Hosting','SaaS Subscription','Cloud Storage','Internet Plan','Streaming Service','Other'],
  family:     ['Elder Care Schedule','Child Vaccination','Shared Family Obligation','Other'],
  business:   ['Vendor Contract','Trade License','Compliance Filing','Employee Contract','Software License','Other'],
  other:      ['Other'],
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low risk', medium: 'Medium risk', high: 'High risk', critical: 'Critical risk',
}

const FREQ_LABELS: Record<Frequency, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', half_yearly: 'Half-yearly', yearly: 'Yearly', custom: 'Custom',
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'JPY']
const REMINDER_OPTIONS = [90, 60, 30, 14, 7, 3, 1]

// ─── Urgency helpers ──────────────────────────────────────────────────────────

function urgency(days: number): { label: string; border: string; badge: string; text: string; bg: string } {
  if (days < 0)   return { label: 'Overdue',         border: '#dc2626', badge: 'bg-red-100 text-red-800',     text: 'text-red-700',     bg: 'bg-red-50'    }
  if (days <= 7)  return { label: `${days}d left`,   border: '#ef4444', badge: 'bg-red-100 text-red-700',     text: 'text-red-600',     bg: 'bg-red-50'    }
  if (days <= 30) return { label: `${days}d left`,   border: '#f97316', badge: 'bg-orange-100 text-orange-700', text: 'text-orange-600', bg: 'bg-orange-50' }
  if (days <= 90) return { label: `${days}d left`,   border: '#f59e0b', badge: 'bg-amber-100 text-amber-700',  text: 'text-amber-600',   bg: 'bg-amber-50'  }
  return             { label: `${days}d`,            border: '#10b981', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', bg: 'bg-emerald-50' }
}

function fmtCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function annualisedCost(item: Pick<RenewalItem, 'estimated_cost' | 'recurring_frequency' | 'recurring_months'>) {
  if (!item.estimated_cost) return 0
  const m = item.recurring_months ?? (
    item.recurring_frequency === 'monthly' ? 1 :
    item.recurring_frequency === 'quarterly' ? 3 :
    item.recurring_frequency === 'half_yearly' ? 6 : 12
  )
  return item.estimated_cost * (12 / m)
}

// ─── Shared input class ───────────────────────────────────────────────────────

const INP = [
  'w-full rounded-lg border px-3 py-2 text-sm',
  'border-[var(--color-border)] bg-[var(--color-surface-raised)]',
  'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent',
].join(' ')

// ─── CategoryChip ─────────────────────────────────────────────────────────────

function CategoryChip({ category, size = 'sm' }: { category: Category; size?: 'sm' | 'xs' }) {
  const cfg = CAT[category] ?? CAT.other
  const Icon = cfg.Icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon size={size === 'xs' ? 10 : 12} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

// ─── RenewalCard ──────────────────────────────────────────────────────────────

function RenewalCard({
  item,
  onRenew,
  onEdit,
  onDelete,
}: {
  item: RenewalItem
  onRenew: (item: RenewalItem) => void
  onEdit:  (item: RenewalItem) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const u = urgency(item.days_until_expiry)
  const cfg = CAT[item.category] ?? CAT.other
  const Icon = cfg.Icon
  const annual = annualisedCost(item)

  return (
    <article
      className="relative flex rounded-xl overflow-hidden bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:shadow-md transition-shadow"
      aria-label={`${item.title} — expires ${fmtDate(item.expiry_date)}`}
    >
      {/* Urgency left bar */}
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: u.border }} aria-hidden="true" />

      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
            style={{ backgroundColor: cfg.bg }}
            aria-hidden="true"
          >
            <Icon size={18} style={{ color: cfg.color }} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug truncate">
                  {item.title}
                </h3>
                {item.provider && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                    {item.provider}
                    {item.reference_no && <span className="text-[var(--color-text-faint)]"> · {item.reference_no}</span>}
                  </p>
                )}
              </div>

              {/* Days-left badge + menu */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.badge}`}
                  aria-label={`Expires ${item.days_until_expiry < 0 ? 'overdue by' : 'in'} ${Math.abs(item.days_until_expiry)} days`}
                >
                  {item.days_until_expiry < 0 ? `${Math.abs(item.days_until_expiry)}d overdue` : u.label}
                </span>

                {/* Action menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
                    aria-label={`Actions for ${item.title}`}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <MoreVertical size={14} aria-hidden="true" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                      <div
                        role="menu"
                        className="absolute right-0 top-7 z-20 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg py-1 text-sm"
                      >
                        <button role="menuitem" className="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-hover)] flex items-center gap-2" onClick={() => { onRenew(item); setMenuOpen(false) }}>
                          <CheckCircle2 size={14} aria-hidden="true" className="text-emerald-500" /> Mark renewed
                        </button>
                        <button role="menuitem" className="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-hover)] flex items-center gap-2" onClick={() => { onEdit(item); setMenuOpen(false) }}>
                          <FileText size={14} aria-hidden="true" /> Edit details
                        </button>
                        <div className="my-1 border-t border-[var(--color-border)]" role="separator" />
                        <button role="menuitem" className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2" onClick={() => { onDelete(item.id); setMenuOpen(false) }}>
                          <X size={14} aria-hidden="true" /> Archive
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <CategoryChip category={item.category} size="xs" />
              {item.risk_level === 'critical' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Critical risk
                </span>
              )}
              {item.risk_level === 'high' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  High risk
                </span>
              )}
              {item.auto_detected && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                  <Sparkles size={10} aria-hidden="true" /> AI detected
                </span>
              )}
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-2.5">
              <div className="text-xs text-[var(--color-text-muted)]">
                <span>Expires {fmtDate(item.expiry_date)}</span>
                {item.recurring_frequency && (
                  <span className="ml-2 text-[var(--color-text-faint)]">
                    · {FREQ_LABELS[item.recurring_frequency]}
                  </span>
                )}
              </div>
              {annual > 0 && (
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {fmtCurrency(item.estimated_cost!, item.currency)}{item.recurring_frequency && item.recurring_frequency !== 'yearly' ? '/period' : '/yr'}
                </span>
              )}
            </div>

            {/* AI summary */}
            {item.ai_summary && (
              <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2 italic">
                {item.ai_summary}
              </p>
            )}
          </div>
        </div>

        {/* Quick renew button for urgent items */}
        {item.days_until_expiry <= 30 && (
          <button
            onClick={() => onRenew(item)}
            className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              borderColor: u.border,
              color: u.border,
              backgroundColor: u.bg.replace('bg-', '').includes('50') ? `color-mix(in srgb, ${u.border} 8%, white)` : undefined,
            }}
            aria-label={`Mark ${item.title} as renewed`}
          >
            <CheckCircle2 size={12} className="inline mr-1.5" aria-hidden="true" />
            Mark as Renewed
          </button>
        )}
      </div>
    </article>
  )
}

// ─── StatsBar ─────────────────────────────────────────────────────────────────

function StatsBar({ items }: { items: RenewalItem[] }) {
  const overdue   = items.filter(i => i.days_until_expiry < 0).length
  const critical  = items.filter(i => i.days_until_expiry >= 0 && i.days_until_expiry <= 7).length
  const thisMonth = items.filter(i => i.days_until_expiry >= 0 && i.days_until_expiry <= 30).length
  const annual    = Math.round(items.reduce((s, i) => s + annualisedCost(i), 0))

  const stats = [
    { label: 'Overdue',       value: overdue,   color: overdue   > 0 ? 'text-red-600'    : 'text-[var(--color-text-primary)]', bg: overdue   > 0 ? 'bg-red-50 border-red-200'       : '' },
    { label: 'Due this week', value: critical,  color: critical  > 0 ? 'text-orange-600' : 'text-[var(--color-text-primary)]', bg: critical  > 0 ? 'bg-orange-50 border-orange-200' : '' },
    { label: 'Due this month',value: thisMonth, color: thisMonth > 0 ? 'text-amber-600'  : 'text-[var(--color-text-primary)]', bg: thisMonth > 0 ? 'bg-amber-50 border-amber-200'   : '' },
    { label: 'Annual cost',   value: annual > 0 ? fmtCurrency(annual, 'INR') : '—', color: 'text-[var(--color-text-primary)]', bg: '' },
  ]

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div
          key={s.label}
          className={`rounded-xl border p-4 bg-[var(--color-surface-raised)] ${s.bg}`}
          aria-label={`${s.label}: ${s.value}`}
        >
          <dt className="text-xs text-[var(--color-text-muted)] font-medium">{s.label}</dt>
          <dd className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// ─── Calendar view ────────────────────────────────────────────────────────────

function CalendarView({ items }: { items: RenewalItem[] }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d
  })
  const [selected, setSelected] = useState<string | null>(null)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  const byDay: Record<number, RenewalItem[]> = {}
  for (const item of items) {
    if (item.expiry_date.startsWith(monthStr)) {
      const day = parseInt(item.expiry_date.slice(8, 10), 10)
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(item)
    }
  }

  const todayDay = new Date().toISOString().slice(0, 10) === `${year}-${String(month + 1).padStart(2, '0')}`
    ? new Date().getDate() : null

  const selectedItems = selected
    ? items.filter(i => i.expiry_date === `${monthStr}-${selected.padStart(2, '0')}`)
    : []

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          {viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)]"
          aria-label="Next month"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs text-[var(--color-text-muted)] font-medium">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Calendar for ${viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} role="gridcell" aria-hidden="true" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayItems = byDay[day] ?? []
          const isToday  = day === todayDay
          const isSel    = selected === String(day)
          const maxUrgency = dayItems.reduce((acc, item) => {
            const d = item.days_until_expiry
            if (d < 0 || d <= 7)   return Math.min(acc, 0)
            if (d <= 30)            return Math.min(acc, 1)
            return acc
          }, 99)

          return (
            <button
              key={day}
              role="gridcell"
              aria-label={`${day} ${viewDate.toLocaleDateString('en-IN', { month: 'long' })}${dayItems.length > 0 ? `, ${dayItems.length} renewal${dayItems.length > 1 ? 's' : ''}` : ''}`}
              aria-pressed={isSel}
              onClick={() => setSelected(isSel ? null : String(day))}
              className={[
                'relative flex flex-col items-center justify-start py-1.5 rounded-lg text-xs font-medium transition-colors',
                isToday ? 'ring-2 ring-[var(--color-brand-primary)]' : '',
                isSel   ? 'bg-[var(--color-brand-primary)] text-white' : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              {day}
              {dayItems.length > 0 && (
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : maxUrgency <= 0 ? 'bg-red-500' : maxUrgency <= 1 ? 'bg-orange-500' : 'bg-amber-400'}`}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day renewals */}
      {selected && selectedItems.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {selectedItems.length} renewal{selectedItems.length > 1 ? 's' : ''} on {monthStr}-{selected.padStart(2,'0')}
          </p>
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-hover)]">
              <CategoryChip category={item.category} size="xs" />
              <span className="text-sm text-[var(--color-text-primary)] truncate flex-1">{item.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgency(item.days_until_expiry).badge}`}>
                {item.days_until_expiry < 0 ? 'Overdue' : `${item.days_until_expiry}d`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Analytics view ───────────────────────────────────────────────────────────

function AnalyticsView({ items }: { items: RenewalItem[] }) {
  const byCategory = useMemo(() => {
    const map: Record<string, { count: number; cost: number }> = {}
    for (const item of items) {
      if (!map[item.category]) map[item.category] = { count: 0, cost: 0 }
      map[item.category].count++
      map[item.category].cost += annualisedCost(item)
    }
    return Object.entries(map).sort((a, b) => b[1].cost - a[1].cost || b[1].count - a[1].count)
  }, [items])

  const total = byCategory.reduce((s, [, v]) => s + v.cost, 0)
  const maxCount = Math.max(...byCategory.map(([, v]) => v.count), 1)

  const urgencyDist = useMemo(() => [
    { label: 'Overdue',  count: items.filter(i => i.days_until_expiry < 0).length,                           color: '#dc2626' },
    { label: '≤7 days',  count: items.filter(i => i.days_until_expiry >= 0 && i.days_until_expiry <= 7).length, color: '#ef4444' },
    { label: '≤30 days', count: items.filter(i => i.days_until_expiry > 7  && i.days_until_expiry <= 30).length, color: '#f97316' },
    { label: '≤90 days', count: items.filter(i => i.days_until_expiry > 30 && i.days_until_expiry <= 90).length, color: '#f59e0b' },
    { label: '90+ days', count: items.filter(i => i.days_until_expiry > 90).length,                            color: '#10b981' },
  ], [items])
  const maxUrgCount = Math.max(...urgencyDist.map(u => u.count), 1)

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Annual cost by category */}
      <section aria-labelledby="analytics-cost-heading">
        <h3 id="analytics-cost-heading" className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Annual cost by category
        </h3>
        {total === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No cost data yet. Add estimated costs to your renewals.</p>
        ) : (
          <div className="space-y-3" role="list" aria-label="Annual cost by category">
            {byCategory.filter(([, v]) => v.cost > 0).map(([cat, v]) => {
              const cfg = CAT[cat as Category] ?? CAT.other
              return (
                <div key={cat} role="listitem" aria-label={`${cfg.label}: ${fmtCurrency(v.cost, 'INR')} annually`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <CategoryChip category={cat as Category} size="xs" />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {fmtCurrency(Math.round(v.cost), 'INR')}/yr
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-hover)]" aria-hidden="true">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${(v.cost / total) * 100}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-[var(--color-text-muted)] pt-1">
              Total estimated annual obligations: <strong>{fmtCurrency(Math.round(total), 'INR')}</strong>
            </p>
          </div>
        )}
      </section>

      {/* Count by category */}
      <section aria-labelledby="analytics-count-heading">
        <h3 id="analytics-count-heading" className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Renewals by category
        </h3>
        <div className="space-y-3" role="list" aria-label="Renewals by category">
          {byCategory.map(([cat, v]) => {
            const cfg = CAT[cat as Category] ?? CAT.other
            return (
              <div key={cat} role="listitem" aria-label={`${cfg.label}: ${v.count} renewal${v.count !== 1 ? 's' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <CategoryChip category={cat as Category} size="xs" />
                  <span className="text-xs text-[var(--color-text-muted)]">{v.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-hover)]" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(v.count / maxCount) * 100}%`, backgroundColor: cfg.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Urgency distribution */}
      <section className="sm:col-span-2" aria-labelledby="analytics-urgency-heading">
        <h3 id="analytics-urgency-heading" className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Urgency distribution
        </h3>
        <div className="flex items-end gap-3" role="list" aria-label="Urgency distribution">
          {urgencyDist.map(u => (
            <div key={u.label} className="flex-1 flex flex-col items-center gap-1" role="listitem" aria-label={`${u.label}: ${u.count} items`}>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">{u.count}</span>
              <div
                className="w-full rounded-t-md min-h-[4px] transition-all"
                style={{ height: `${Math.max(4, (u.count / maxUrgCount) * 80)}px`, backgroundColor: u.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-[var(--color-text-muted)] text-center leading-tight">{u.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── AddRenewalModal ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '', category: 'other' as Category, subcategory: '', provider: '', reference_no: '',
  start_date: '', expiry_date: '', recurring_frequency: '' as Frequency | '',
  recurring_months: '', renewal_window_days: '30', reminder_days: [90, 30, 7, 1] as number[],
  estimated_cost: '', currency: 'INR', risk_level: 'medium' as RiskLevel,
  notes: '', tags: '',
}

function AddRenewalModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: RenewalItem | null
  onClose: () => void
  onSave: (item: RenewalItem) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...(initial ? {
      title:               initial.title,
      category:            initial.category,
      subcategory:         initial.subcategory ?? '',
      provider:            initial.provider ?? '',
      reference_no:        initial.reference_no ?? '',
      start_date:          initial.start_date ?? '',
      expiry_date:         initial.expiry_date,
      recurring_frequency: (initial.recurring_frequency ?? '') as Frequency | '',
      recurring_months:    initial.recurring_months ? String(initial.recurring_months) : '',
      renewal_window_days: String(initial.renewal_window_days),
      reminder_days:       initial.reminder_days,
      estimated_cost:      initial.estimated_cost ? String(initial.estimated_cost) : '',
      currency:            initial.currency,
      risk_level:          initial.risk_level,
      notes:               initial.notes ?? '',
      tags:                initial.tags.join(', '),
    } : {}),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function toggle(day: number) {
    setForm(f => ({
      ...f,
      reminder_days: f.reminder_days.includes(day)
        ? f.reminder_days.filter(d => d !== day)
        : [...f.reminder_days, day].sort((a, b) => b - a),
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.expiry_date)  { setError('Expiry date is required'); return }
    setSaving(true); setError('')

    const payload = {
      title:               form.title.trim(),
      category:            form.category,
      subcategory:         form.subcategory || null,
      provider:            form.provider || null,
      reference_no:        form.reference_no || null,
      start_date:          form.start_date || null,
      expiry_date:         form.expiry_date,
      recurring_frequency: form.recurring_frequency || null,
      recurring_months:    form.recurring_months ? parseInt(form.recurring_months, 10) : null,
      renewal_window_days: parseInt(form.renewal_window_days, 10) || 30,
      reminder_days:       form.reminder_days,
      estimated_cost:      form.estimated_cost ? parseFloat(form.estimated_cost) : null,
      currency:            form.currency,
      risk_level:          form.risk_level,
      notes:               form.notes || null,
      tags:                form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      source_type:         'manual',
    }

    try {
      const method = isEdit ? 'PATCH' : 'POST'
      const url    = isEdit ? `/api/renewals/${initial!.id}` : '/api/renewals'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Save failed'); return }
      const data = await res.json()
      onSave(data.item)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const subcats = SUBCATS[form.category] ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit renewal' : 'Add renewal'}>
      <div className="w-full max-w-xl bg-[var(--color-surface)] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            {isEdit ? 'Edit renewal' : 'Add renewal'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="r-title" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Title <span aria-hidden="true">*</span>
            </label>
            <input id="r-title" className={INP} value={form.title} required
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Car Insurance — Honda City" />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="r-cat" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Category</label>
              <select id="r-cat" className={INP} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category, subcategory: '' }))}>
                {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="r-subcat" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
              <select id="r-subcat" className={INP} value={form.subcategory}
                onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
                <option value="">Select type…</option>
                {subcats.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Provider + Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="r-prov" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Provider / Vendor</label>
              <input id="r-prov" className={INP} value={form.provider} placeholder="e.g. HDFC ERGO"
                onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="r-ref" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Policy / Reference No.</label>
              <input id="r-ref" className={INP} value={form.reference_no} placeholder="e.g. HNI2024001"
                onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="r-start" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Start date</label>
              <input id="r-start" type="date" className={INP} value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="r-expiry" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Expiry date <span aria-hidden="true">*</span>
              </label>
              <input id="r-expiry" type="date" className={INP} value={form.expiry_date} required
                onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
            </div>
          </div>

          {/* Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="r-freq" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Renewal cycle</label>
              <select id="r-freq" className={INP} value={form.recurring_frequency}
                onChange={e => setForm(f => ({ ...f, recurring_frequency: e.target.value as Frequency | '' }))}>
                <option value="">One-time / Unknown</option>
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="r-risk" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Risk level</label>
              <select id="r-risk" className={INP} value={form.risk_level}
                onChange={e => setForm(f => ({ ...f, risk_level: e.target.value as RiskLevel }))}>
                {(Object.entries(RISK_LABELS) as [RiskLevel, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="r-cost" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Estimated renewal cost</label>
              <input id="r-cost" type="number" min="0" step="0.01" className={INP} value={form.estimated_cost} placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="r-curr" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Currency</label>
              <select id="r-curr" className={INP} value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Reminders */}
          <fieldset>
            <legend className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Remind me before expiry</legend>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map(day => (
                <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reminder_days.includes(day)}
                    onChange={() => toggle(day)}
                    className="rounded"
                    aria-label={`Remind ${day} day${day !== 1 ? 's' : ''} before`}
                  />
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {day}d
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Notes + Tags */}
          <div>
            <label htmlFor="r-notes" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes</label>
            <textarea id="r-notes" rows={2} className={INP} value={form.notes} placeholder="Any additional details…"
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="r-tags" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Tags (comma-separated)</label>
            <input id="r-tags" className={INP} value={form.tags} placeholder="e.g. car, personal, high-value"
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            Cancel
          </button>
          <button
            onClick={e => { const form = document.querySelector('form'); form?.requestSubmit() }}
            disabled={saving}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add renewal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AIExtractModal ───────────────────────────────────────────────────────────

function AIExtractModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (prefill: Partial<typeof EMPTY_FORM>) => void
}) {
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<Record<string, unknown> | null>(null)
  const [error, setError]       = useState('')

  async function extract() {
    if (!text.trim()) { setError('Paste some document text first'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/renewals/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Extraction failed'); return }
      setResult(data.extraction)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (!result) return
    onConfirm({
      title:               String(result.title ?? ''),
      category:            String(result.category ?? 'other') as Category,
      subcategory:         String(result.subcategory ?? ''),
      provider:            String(result.provider ?? ''),
      reference_no:        String(result.reference_no ?? ''),
      expiry_date:         String(result.expiry_date ?? ''),
      start_date:          String(result.start_date ?? ''),
      recurring_frequency: String(result.recurring_frequency ?? '') as Frequency | '',
      estimated_cost:      result.estimated_cost ? String(result.estimated_cost) : '',
      currency:            String(result.currency ?? 'INR'),
      risk_level:          String(result.risk_level ?? 'medium') as RiskLevel,
    })
  }

  const confidence = result ? (result.confidence_score as number) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label="AI document extraction">
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} aria-hidden="true" className="text-violet-500" />
            <h2 className="font-semibold text-[var(--color-text-primary)]">AI Document Extraction</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Paste text from an insurance policy, invoice, certificate, prescription, or any document. AI will extract the renewal details for you to review.
          </p>

          <div>
            <label htmlFor="extract-text" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Document text
            </label>
            <textarea
              id="extract-text"
              rows={6}
              className={INP}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste document text here — e.g. policy details, invoice text, email content, or key fields from a document…"
              aria-describedby="extract-hint"
            />
            <p id="extract-hint" className="text-xs text-[var(--color-text-muted)] mt-1">
              Include dates, provider name, policy/reference numbers, and cost details for best results.
            </p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {result && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Extracted data</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidence >= 70 ? 'bg-emerald-100 text-emerald-700' : confidence >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                  aria-label={`Confidence: ${Math.round(confidence)}%`}>
                  {Math.round(confidence)}% confidence
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ['Title',    result.title],
                  ['Category', String(result.category ?? '').replace(/_/g, ' ')],
                  ['Provider', result.provider],
                  ['Expiry',   result.expiry_date],
                  ['Cost',     result.estimated_cost ? `${result.currency ?? 'INR'} ${result.estimated_cost}` : null],
                  ['Cycle',    result.recurring_frequency ? FREQ_LABELS[result.recurring_frequency as Frequency] : null],
                  ['Risk',     result.risk_level],
                ].filter((row): row is [string, string] => typeof row[1] === 'string' && !!row[1]).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-[var(--color-text-muted)]">{k}</dt>
                    <dd className="font-medium text-[var(--color-text-primary)] truncate">{v}</dd>
                  </div>
                ))}
              </dl>
              {typeof result.ai_summary === 'string' && result.ai_summary && (
                <p className="text-xs text-[var(--color-text-muted)] italic border-t border-[var(--color-border)] pt-2">
                  {result.ai_summary}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          {!result ? (
            <>
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                Cancel
              </button>
              <button onClick={extract} disabled={loading || !text.trim()} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-brand-primary)' }}>
                {loading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                {loading ? 'Extracting…' : 'Extract details'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setResult(null)} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                Try again
              </button>
              <button onClick={confirm} className="flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-brand-primary)' }}>
                <Check size={14} aria-hidden="true" /> Use & edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── RenewModal ───────────────────────────────────────────────────────────────

function RenewModal({
  item,
  onClose,
  onSave,
}: {
  item: RenewalItem
  onClose: () => void
  onSave:  (updated: RenewalItem) => void
}) {
  // Compute suggested new expiry
  function suggestExpiry(): string {
    if (!item.recurring_frequency && !item.recurring_months) return ''
    const base  = new Date(item.expiry_date)
    const months = item.recurring_months ?? (
      item.recurring_frequency === 'monthly' ? 1 :
      item.recurring_frequency === 'quarterly' ? 3 :
      item.recurring_frequency === 'half_yearly' ? 6 : 12
    )
    base.setMonth(base.getMonth() + months)
    return base.toISOString().slice(0, 10)
  }

  const [newExpiry, setNewExpiry] = useState(suggestExpiry)
  const [actualCost, setActualCost] = useState(item.actual_cost ? String(item.actual_cost) : '')
  const [notes, setNotes]  = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (newExpiry && !/^\d{4}-\d{2}-\d{2}$/.test(newExpiry)) { setError('Enter a valid date'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/renewals/${item.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renew',
          new_expiry_date: newExpiry || undefined,
          actual_cost: actualCost ? parseFloat(actualCost) : undefined,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return }
      const data = await res.json()
      onSave(data.item)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label={`Mark ${item.title} as renewed`}>
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" className="text-emerald-500" />
            <h2 className="font-semibold text-[var(--color-text-primary)]">Mark as renewed</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Marking <strong className="text-[var(--color-text-primary)]">{item.title}</strong> as renewed.
            {newExpiry && ` The next expiry date has been pre-filled based on the renewal cycle.`}
          </p>

          <div>
            <label htmlFor="rn-expiry" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              New expiry date
            </label>
            <input id="rn-expiry" type="date" className={INP} value={newExpiry}
              onChange={e => setNewExpiry(e.target.value)} />
          </div>

          <div>
            <label htmlFor="rn-cost" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Actual renewal cost ({item.currency})
            </label>
            <input id="rn-cost" type="number" min="0" step="0.01" className={INP}
              value={actualCost} placeholder="0.00"
              onChange={e => setActualCost(e.target.value)} />
          </div>

          <div>
            <label htmlFor="rn-notes" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Notes (optional)</label>
            <input id="rn-notes" className={INP} value={notes} placeholder="e.g. Renewed via agent, reference #…"
              onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={14} aria-hidden="true" />}
              {saving ? 'Saving…' : 'Confirm renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RenewalsPage() {
  const [items, setItems]           = useState<RenewalItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<Tab>('all')
  const [catFilter, setCatFilter]   = useState<string>('all')
  const [sortBy, setSortBy]         = useState<SortBy>('urgency')
  const [search, setSearch]         = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [editItem, setEditItem]     = useState<RenewalItem | null>(null)
  const [showExtract, setShowExtract] = useState(false)
  const [renewTarget, setRenewTarget] = useState<RenewalItem | null>(null)
  const [extractPrefill, setExtractPrefill] = useState<Partial<typeof EMPTY_FORM> | null>(null)
  const [insights, setInsights]     = useState<string[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/renewals?notify=1')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function generateInsights() {
    setInsightsLoading(true)
    try {
      const res = await fetch('/api/renewals/insights')
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights ?? [])
      }
    } finally {
      setInsightsLoading(false)
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  const activeItems = useMemo(() => items.filter(i => i.status === 'active'), [items])

  const displayed = useMemo(() => {
    let list = activeItems

    if (tab === 'soon') list = list.filter(i => i.days_until_expiry <= 90 && i.days_until_expiry >= 0)
    if (tab === 'risk') list = list.filter(i => i.risk_level === 'high' || i.risk_level === 'critical')

    if (catFilter !== 'all') list = list.filter(i => i.category === catFilter)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.provider?.toLowerCase().includes(q) ||
        i.reference_no?.toLowerCase().includes(q) ||
        i.subcategory?.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'urgency') return a.days_until_expiry - b.days_until_expiry
      if (sortBy === 'cost')    return (annualisedCost(b) || 0) - (annualisedCost(a) || 0)
      if (sortBy === 'name')    return a.title.localeCompare(b.title)
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    })
  }, [activeItems, tab, catFilter, search, sortBy])

  // Category counts for filter chips
  const catCounts = useMemo(() => {
    const map: Record<string, number> = { all: activeItems.length }
    for (const item of activeItems) {
      map[item.category] = (map[item.category] || 0) + 1
    }
    return map
  }, [activeItems])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSaved(saved: RenewalItem) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === saved.id)
      return idx >= 0 ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev]
    })
    setShowAdd(false)
    setEditItem(null)
  }

  function handleRenewed(updated: RenewalItem) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setRenewTarget(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Archive this renewal? It will be hidden from your dashboard.')) return
    const res = await fetch(`/api/renewals/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  function handleExtractConfirm(prefill: Partial<typeof EMPTY_FORM>) {
    setShowExtract(false)
    setExtractPrefill(prefill)
    setShowAdd(true)
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; Icon: React.ElementType; count?: number }[] = [
    { id: 'all',      label: 'All',          Icon: RefreshCw,  count: activeItems.length },
    { id: 'soon',     label: 'Due soon',     Icon: Clock,      count: activeItems.filter(i => i.days_until_expiry <= 90 && i.days_until_expiry >= 0).length },
    { id: 'risk',     label: 'High risk',    Icon: AlertTriangle, count: activeItems.filter(i => ['high','critical'].includes(i.risk_level)).length },
    { id: 'calendar', label: 'Calendar',     Icon: Calendar },
    { id: 'analytics',label: 'Analytics',    Icon: BarChart2 },
  ]

  // ── Overdue / critical banner ──────────────────────────────────────────────

  const overdueCount  = activeItems.filter(i => i.days_until_expiry < 0).length
  const criticalCount = activeItems.filter(i => i.days_until_expiry >= 0 && i.days_until_expiry <= 7).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <RefreshCw size={22} aria-hidden="true" className="text-[var(--color-brand-primary)]" />
            Renewal Intelligence
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Your life expiry dashboard — never miss a renewal, policy, or deadline.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExtract(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Extract renewal details from a document using AI"
          >
            <Sparkles size={14} aria-hidden="true" className="text-violet-500" />
            <span className="hidden sm:inline">AI Extract</span>
          </button>
          <button
            onClick={() => { setExtractPrefill(null); setEditItem(null); setShowAdd(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
            aria-label="Add a new renewal item"
          >
            <Plus size={14} aria-hidden="true" />
            Add renewal
          </button>
        </div>
      </div>

      {/* ── Alert banner for overdue/critical ─────────────────────────────── */}
      {(overdueCount > 0 || criticalCount > 0) && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50"
        >
          <AlertCircle size={18} aria-hidden="true" className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overdueCount > 0 && `${overdueCount} overdue renewal${overdueCount > 1 ? 's' : ''}`}
              {overdueCount > 0 && criticalCount > 0 && ' and '}
              {criticalCount > 0 && `${criticalCount} expiring this week`}
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Review the items below and take action to avoid lapses, penalties, or service interruptions.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      {!loading && <StatsBar items={activeItems} />}

      {/* ── AI Insights ────────────────────────────────────────────────────── */}
      {!loading && activeItems.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} aria-hidden="true" className="text-violet-500" />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">AI Insights</h2>
            </div>
            <button
              onClick={generateInsights}
              disabled={insightsLoading}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 flex items-center gap-1.5"
              aria-label="Generate AI insights for your renewals"
            >
              {insightsLoading
                ? <><Loader2 size={11} className="animate-spin" aria-hidden="true" /> Generating…</>
                : <><Zap size={11} aria-hidden="true" /> Generate</>}
            </button>
          </div>
          {insights.length > 0 ? (
            <ul className="space-y-2" aria-label="AI-generated insights">
              {insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" aria-hidden="true" />
                  {ins}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Click Generate to get personalised insights about your renewal obligations.
            </p>
          )}
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--color-border)]" role="tablist" aria-label="Renewal views">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`tab-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                tab === t.id
                  ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              <t.Icon size={14} aria-hidden="true" />
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-[var(--color-brand-primary)]/10' : 'bg-[var(--color-surface-hover)]'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab panels ─────────────────────────────────────────────────────── */}
      <div id={`tab-panel-all`} role="tabpanel" aria-label={tabs.find(t => t.id === tab)?.label ?? ''}>
        {/* Calendar and Analytics have their own layout */}
        {tab === 'calendar' && (
          <div className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-6">
            <CalendarView items={activeItems} />
          </div>
        )}

        {tab === 'analytics' && (
          <div className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-6">
            {activeItems.length === 0
              ? <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Add renewals to see analytics.</p>
              : <AnalyticsView items={activeItems} />}
          </div>
        )}

        {(tab === 'all' || tab === 'soon' || tab === 'risk') && (
          <>
            {/* Search + Sort + Category filter */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true" />
                  <input
                    className={`${INP} pl-8`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search renewals…"
                    aria-label="Search renewals by name, provider, or reference"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="sort-select" className="sr-only">Sort by</label>
                  <select
                    id="sort-select"
                    className={`${INP} pr-8`}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    aria-label="Sort renewals"
                  >
                    <option value="urgency">Urgency</option>
                    <option value="date">Expiry date</option>
                    <option value="cost">Cost</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>
              </div>

              {/* Category filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
                <button
                  onClick={() => setCatFilter('all')}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    catFilter === 'all'
                      ? 'bg-[var(--color-brand-primary)] text-white'
                      : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]',
                  ].join(' ')}
                  aria-pressed={catFilter === 'all'}
                >
                  All ({catCounts.all ?? 0})
                </button>
                {(Object.keys(CAT) as Category[]).filter(c => (catCounts[c] ?? 0) > 0).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatFilter(cat === catFilter ? 'all' : cat)}
                    className={[
                      'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      catFilter === cat
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]',
                    ].join(' ')}
                    aria-pressed={catFilter === cat}
                    aria-label={`Filter by ${CAT[cat].label}: ${catCounts[cat] ?? 0} items`}
                  >
                    {CAT[cat].label} ({catCounts[cat] ?? 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Card grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16" aria-live="polite" aria-label="Loading renewals">
                <Loader2 size={24} className="animate-spin text-[var(--color-brand-primary)]" aria-hidden="true" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 space-y-3" aria-live="polite">
                {activeItems.length === 0 ? (
                  <>
                    <RefreshCw size={40} aria-hidden="true" className="mx-auto text-[var(--color-text-muted)] opacity-40" />
                    <p className="text-[var(--color-text-muted)] font-medium">No renewals tracked yet</p>
                    <p className="text-sm text-[var(--color-text-faint)] max-w-xs mx-auto">
                      Add your first renewal — insurance, passport, vehicle service, or any recurring obligation — and never forget again.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <button
                        onClick={() => { setExtractPrefill(null); setShowAdd(true) }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      >
                        Add your first renewal
                      </button>
                      <button
                        onClick={() => setShowExtract(true)}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] flex items-center gap-1.5 hover:bg-[var(--color-surface-hover)]"
                      >
                        <Sparkles size={13} aria-hidden="true" /> AI Extract from document
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Filter size={32} aria-hidden="true" className="mx-auto text-[var(--color-text-muted)] opacity-40" />
                    <p className="text-[var(--color-text-muted)]">No renewals match your filters</p>
                    <button onClick={() => { setCatFilter('all'); setSearch('') }} className="text-sm text-[var(--color-brand-primary)] hover:underline">
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div
                className="grid sm:grid-cols-2 gap-3"
                aria-label={`${displayed.length} renewal${displayed.length !== 1 ? 's' : ''}`}
                aria-live="polite"
                aria-relevant="additions removals"
              >
                {displayed.map(item => (
                  <RenewalCard
                    key={item.id}
                    item={item}
                    onRenew={setRenewTarget}
                    onEdit={item => { setEditItem(item); setShowAdd(true) }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showAdd && (
        <AddRenewalModal
          initial={editItem}
          onClose={() => { setShowAdd(false); setEditItem(null); setExtractPrefill(null) }}
          onSave={handleSaved}
        />
      )}

      {showExtract && (
        <AIExtractModal
          onClose={() => setShowExtract(false)}
          onConfirm={handleExtractConfirm}
        />
      )}

      {renewTarget && (
        <RenewModal
          item={renewTarget}
          onClose={() => setRenewTarget(null)}
          onSave={handleRenewed}
        />
      )}
    </div>
  )
}
