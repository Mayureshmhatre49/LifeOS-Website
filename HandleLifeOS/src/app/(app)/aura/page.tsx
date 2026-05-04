'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, Milestone, Activity, Stethoscope, Bell, BrainCircuit,
  ArrowRight, AlertCircle, Plus, Shield, X, Brain, GraduationCap,
  MessageCircleHeart, Settings as SettingsIcon, Syringe, Scale,
  ClipboardList, FolderArchive,
} from 'lucide-react'
import type { AuraChildProfile } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { calculateAlerts, getAgeDisplay, getAgeInMonths } from '@/lib/aura-logic'
import { computeAuraScore } from '@/lib/aura/score'
import { IMMUNIZATION_SCHEDULE, classifyDose } from '@/lib/aura/immunizations'
import { ChildForm } from '@/components/family/aura/child-form'
import { cn } from '@/lib/utils'

export default function AuraDashboardPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetch('/api/family/aura/profiles')
      .then(r => r.json())
      .then(({ profiles }) => {
        const list: AuraChildProfile[] = profiles ?? []
        setProfiles(list)
        // Auto-select: stored ID if still valid, else first child, else null
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        const next = valid ? stored : (list[0]?.id ?? null)
        setSelectedId(next)
        if (next) storeSelectedChildId(next)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  async function handleAddChild(data: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>) {
    const res = await fetch('/api/family/aura/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { profile } = await res.json()
      setProfiles(prev => [...prev, profile])
      setSelectedId(profile.id)
      storeSelectedChildId(profile.id)
      setShowAddForm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md shadow-pink-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AURA</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Adaptive child development intelligence</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Link
            href="/aura/coach"
            title="AI parenting coach"
            className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:bg-fuchsia-50 flex items-center justify-center transition-all"
          >
            <MessageCircleHeart className="h-4 w-4 text-fuchsia-600" />
          </Link>
          <Link
            href="/aura/settings"
            title="Settings & privacy"
            className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <SettingsIcon className="h-4 w-4 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Child switcher */}
      <AuraChildSwitcher
        children={profiles}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddNew={() => setShowAddForm(true)}
      />

      {/* Add-child modal/inline */}
      {showAddForm && (
        <div className="rounded-2xl bg-white border border-pink-100 shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Add a child profile</p>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChildForm
            onSave={handleAddChild}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {selected ? (
        <ChildSnapshot child={selected} />
      ) : profiles.length === 0 && !showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-6 hover:bg-pink-50 transition-colors text-center"
        >
          <Plus className="h-6 w-6 text-pink-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-pink-600">Add your first child</p>
          <p className="text-xs text-pink-400 mt-1">Track milestones, growth, and health all in one place</p>
        </button>
      ) : null}
    </div>
  )
}

function ChildSnapshot({ child }: { child: AuraChildProfile }) {
  const score = computeAuraScore(child)
  const alerts = calculateAlerts(child)
  const urgent = alerts.filter(a => a.severity === 'urgent')
  const warnings = alerts.filter(a => a.severity === 'warning')
  const ageMonths = getAgeInMonths(child.date_of_birth)

  const lastGrowth = child.growth_records.length
    ? child.growth_records.slice().sort((a, b) => b.date.localeCompare(a.date))[0]
    : null

  return (
    <>
      {/* Urgent alerts banner */}
      {urgent.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <p className="text-sm font-bold text-rose-800">
              {urgent.length} urgent {urgent.length === 1 ? 'alert' : 'alerts'} for {child.full_name}
            </p>
          </div>
          {urgent.slice(0, 2).map((a, i) => (
            <p key={i} className="text-xs text-rose-700 leading-relaxed pl-6">{a.message}</p>
          ))}
          <Link href="/aura/milestones" className="block pl-6 text-xs font-bold text-rose-700 hover:text-rose-900">
            View all alerts →
          </Link>
        </div>
      )}

      {/* AURA Score */}
      <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-fuchsia-500" />
            <p className="text-xs font-bold text-fuchsia-700 uppercase tracking-wider">AURA Score</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-fuchsia-700">{score.total}</span>
            <span className="text-xs text-fuchsia-400">/100</span>
          </div>
        </div>
        <div className="space-y-2">
          <ScoreBar label="Milestones" value={score.milestones} color="bg-pink-400" />
          <ScoreBar label="Growth tracked" value={score.growth} color="bg-fuchsia-400" />
          <ScoreBar label="Health" value={score.health} color="bg-purple-400" />
        </div>
        {ageMonths < 60 && (
          <p className="text-[11px] text-fuchsia-500 mt-3 leading-relaxed">
            Score weights milestones (50%), growth tracking (25%), and health alert pressure (25%).
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat
          icon={Milestone}
          color="text-pink-500"
          value={`${score.milestones}%`}
          label="Milestones"
          sub={`Age ${getAgeDisplay(child.date_of_birth)}`}
        />
        <Stat
          icon={Activity}
          color="text-fuchsia-500"
          value={lastGrowth ? `${lastGrowth.weight_kg ?? '—'}kg` : '—'}
          label="Last weigh-in"
          sub={lastGrowth ? new Date(lastGrowth.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No data'}
        />
        <Stat
          icon={Bell}
          color={alerts.length > 0 ? 'text-amber-500' : 'text-emerald-500'}
          value={alerts.length.toString()}
          label="Alerts"
          sub={`${urgent.length} urgent · ${warnings.length} warn`}
        />
      </div>

      {/* Section navigation */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Track & manage</p>
        <NavCard
          href="/aura/milestones"
          icon={Milestone}
          gradient="from-pink-100 to-rose-100"
          color="text-pink-600"
          title="Milestones"
          subtitle={`${score.milestones}% of age-appropriate milestones complete`}
        />
        <NavCard
          href="/aura/growth"
          icon={Activity}
          gradient="from-fuchsia-100 to-pink-100"
          color="text-fuchsia-600"
          title="Growth"
          subtitle={lastGrowth
            ? `Last logged ${score.recencyDays.growth} days ago`
            : 'No growth records yet — start tracking'}
        />
        <NavCard
          href="/aura/health"
          icon={Stethoscope}
          gradient="from-purple-100 to-violet-100"
          color="text-purple-600"
          title="Health"
          subtitle={`${child.medications.length} medications · ${child.medical_records.length} medical records · ${child.therapies.length} therapies`}
        />
        <NavCard
          href="/aura/behaviour"
          icon={Brain}
          gradient="from-rose-100 to-orange-100"
          color="text-rose-600"
          title="Behaviour"
          subtitle={behaviourSubtitle(child)}
        />
        <NavCard
          href="/aura/learning"
          icon={GraduationCap}
          gradient="from-emerald-100 to-teal-100"
          color="text-emerald-600"
          title="Learning"
          subtitle={learningSubtitle(child)}
        />
        <NavCard
          href="/aura/immunizations"
          icon={Syringe}
          gradient="from-violet-100 to-purple-100"
          color="text-violet-600"
          title="Immunisations"
          subtitle={immunizationSubtitle(child)}
        />
        <NavCard
          href="/aura/legal-financial"
          icon={Scale}
          gradient="from-amber-100 to-orange-100"
          color="text-amber-700"
          title="Legal & Financial"
          subtitle={legalSubtitle(child)}
        />
        <NavCard
          href="/aura/documents"
          icon={FolderArchive}
          gradient="from-indigo-100 to-violet-100"
          color="text-indigo-700"
          title="Documents"
          subtitle="IEPs · evaluations · medical records"
        />
        {child.neurodivergence?.adhd && (
          <NavCard
            href="/aura/adhd-log"
            icon={ClipboardList}
            gradient="from-rose-100 to-pink-100"
            color="text-rose-700"
            title="ADHD Log"
            subtitle="DSM-5 home + school symptom tracker"
          />
        )}
      </div>

      {/* AI Coach CTA */}
      <Link
        href="/aura/coach"
        className="block rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-600 text-white p-4 shadow-md shadow-fuchsia-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Talk to AURA Coach</p>
            <p className="text-[11px] text-white/80 mt-0.5">General · Behaviour · School · Medical · Sleep</p>
          </div>
          <ArrowRight className="h-4 w-4 text-white/80 shrink-0" />
        </div>
      </Link>
    </>
  )
}

function behaviourSubtitle(child: AuraChildProfile): string {
  const logs = child.behaviour_logs ?? []
  if (logs.length === 0) return 'Log daily moods to spot patterns'
  const recent = logs.slice().sort((a, b) => b.date.localeCompare(a.date))[0]
  return `${logs.length} ${logs.length === 1 ? 'entry' : 'entries'} · last on ${new Date(recent.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function legalSubtitle(child: AuraChildProfile): string {
  const ageYears = getAgeInMonths(child.date_of_birth) / 12
  const plan = child.financial_plan
  if (!plan) {
    if (ageYears >= 16.5) return '⚠ Transition planning recommended at 17'
    return 'ABLE / SNT / Guardianship — start tracking'
  }
  const parts: string[] = []
  if (plan.able?.enabled) parts.push('ABLE on')
  if (plan.snt?.enabled) parts.push('SNT on')
  const docs = plan.legal_docs?.length ?? 0
  if (docs > 0) parts.push(`${docs} doc${docs === 1 ? '' : 's'}`)
  if (parts.length === 0) {
    if (ageYears >= 16.5) return '⚠ Transition planning recommended at 17'
    return 'ABLE / SNT / Guardianship'
  }
  return parts.join(' · ')
}

function immunizationSubtitle(child: AuraChildProfile): string {
  const ageMonths = getAgeInMonths(child.date_of_birth)
  const completedIds = new Set<string>()
  for (const r of child.medical_records) {
    if (r.type === 'vaccination') {
      const m = r.notes?.match(/dose:([a-z0-9-]+)/i)
      if (m) completedIds.add(m[1])
    }
  }
  let overdue = 0, due = 0, completed = 0
  for (const d of IMMUNIZATION_SCHEDULE) {
    const s = classifyDose(d, ageMonths, completedIds)
    if (s === 'overdue') overdue++
    else if (s === 'due') due++
    else if (s === 'completed') completed++
  }
  if (overdue > 0) return `${overdue} overdue · ${due} due now`
  if (due > 0) return `${due} due now · ${completed} completed`
  return `${completed} completed · all caught up`
}

function learningSubtitle(child: AuraChildProfile): string {
  const l = child.learning
  if (!l) return 'Track school progress, skills, and interests'
  const skills = l.skills.length, interests = l.interests.length
  if (skills === 0 && interests === 0 && !l.school) return 'Track school progress, skills, and interests'
  const parts: string[] = []
  if (l.school?.current_grade) parts.push(l.school.current_grade)
  if (skills > 0) parts.push(`${skills} skill${skills === 1 ? '' : 's'}`)
  if (interests > 0) parts.push(`${interests} interest${interests === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function Stat({ icon: Icon, color, value, label, sub }: { icon: typeof Milestone; color: string; value: string; label: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-base font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
      <p className="text-[9px] text-gray-300 leading-tight truncate">{sub}</p>
    </div>
  )
}

function NavCard({ href, icon: Icon, gradient, color, title, subtitle }: {
  href: string; icon: typeof Milestone; gradient: string; color: string; title: string; subtitle: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-white/60 bg-gradient-to-br p-4 hover:shadow-md hover:-translate-y-0.5 transition-all',
        gradient,
      )}
    >
      <div className="h-10 w-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-bold', color)}>{title}</p>
        <p className="text-[11px] text-gray-600 leading-relaxed">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
    </Link>
  )
}
