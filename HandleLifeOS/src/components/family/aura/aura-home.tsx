'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowLeft, Bell, BrainCircuit, Baby, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AuraChildProfile, MilestoneStatus, AuraAITopic, DevelopmentalAlert } from '@/types/aura'
import { ChildForm } from './child-form'
import { MilestoneTracker } from './milestone-tracker'
import { AlertsPanel } from './alerts-panel'
import { AskAuraAI } from './ask-aura-ai'
import { calculateAlerts, getAgeDisplay, getMilestoneProgress } from '@/lib/aura-logic'
import { cn } from '@/lib/utils'

async function fetchProfiles(): Promise<AuraChildProfile[]> {
  const res = await fetch('/api/family/aura/profiles')
  if (!res.ok) return []
  const data = await res.json()
  return data.profiles ?? []
}

// ── View types ────────────────────────────────────────────────────────────────

type HomeTab = 'children' | 'alerts' | 'ai'
type ChildTab = 'milestones' | 'conditions' | 'ai'

// ── Condition badge helper ────────────────────────────────────────────────────

function ConditionBadges({ child }: { child: AuraChildProfile }) {
  const badges: string[] = []
  if (child.neurodivergence?.adhd)  badges.push('ADHD')
  if (child.neurodivergence?.asd)   badges.push('ASD')
  if (child.physical_disabilities?.conditions.length) badges.push(...child.physical_disabilities.conditions.slice(0, 1))
  if (child.genetic_conditions?.conditions.length)    badges.push(...child.genetic_conditions.conditions.slice(0, 1))
  if (badges.length === 0) return null
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {badges.slice(0, 3).map(b => (
        <span key={b} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs text-indigo-600 font-medium">
          {b}
        </span>
      ))}
      {badges.length > 3 && <span className="text-xs text-gray-400">+{badges.length - 3}</span>}
    </div>
  )
}

// ── Child detail: conditions summary ─────────────────────────────────────────

function ConditionsDetail({ child }: { child: AuraChildProfile }) {
  const nd = child.neurodivergence
  const pd = child.physical_disabilities
  const gc = child.genetic_conditions
  const ep = child.education_plan
  const fp = child.financial_plan
  const meds = child.medications
  const therapies = child.therapies

  const hasAny = nd || (pd?.conditions.length ?? 0) > 0 || (gc?.conditions.length ?? 0) > 0

  return (
    <div className="space-y-3">
      {!hasAny && (
        <p className="text-sm text-gray-400 text-center py-4">No conditions documented. Edit the child profile to add details.</p>
      )}

      {nd && (nd.adhd || nd.asd) && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Neurodivergence</p>
          {nd.adhd && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-yellow-50 border border-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">ADHD</span>
              {nd.adhd_type && <span className="text-xs text-gray-500 capitalize">{nd.adhd_type.replace('_', '-')}</span>}
            </div>
          )}
          {nd.asd && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">ASD</span>
              {nd.asd_support_level && <span className="text-xs text-gray-500">Level {nd.asd_support_level}</span>}
            </div>
          )}
        </div>
      )}

      {(pd?.conditions.length ?? 0) > 0 && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Physical disabilities</p>
          {pd!.conditions.map(c => (
            <p key={c} className="text-sm text-gray-700">{c}</p>
          ))}
          {pd!.environmental_mods.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Environmental modifications:</p>
              {pd!.environmental_mods.map((m, i) => <p key={i} className="text-xs text-gray-600">• {m}</p>)}
            </div>
          )}
        </div>
      )}

      {(gc?.conditions.length ?? 0) > 0 && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Genetic conditions</p>
          {gc!.conditions.map(c => <p key={c} className="text-sm text-gray-700">{c}</p>)}
          {gc!.specialist_contacts.length > 0 && (
            <div className="mt-1">
              {gc!.specialist_contacts.map((s, i) => (
                <p key={i} className="text-xs text-gray-500">{s.name} · {s.specialty}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {ep && ep.plan_type !== 'none' && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Education — {ep.plan_type.toUpperCase()}
          </p>
          {ep.accommodations.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Accommodations:</p>
              {ep.accommodations.map((a, i) => <p key={i} className="text-xs text-gray-600">• {a}</p>)}
            </div>
          )}
          {ep.goals.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Goals:</p>
              {ep.goals.map((g, i) => <p key={i} className="text-xs text-gray-600">→ {g}</p>)}
            </div>
          )}
        </div>
      )}

      {therapies.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active therapies</p>
          {therapies.map((t, i) => (
            <p key={i} className="text-xs text-gray-600">
              {t.type}{t.frequency ? ` · ${t.frequency}` : ''}
            </p>
          ))}
        </div>
      )}

      {meds.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Medications</p>
          {meds.map((m, i) => (
            <p key={i} className="text-xs text-gray-600">
              {m.name}{m.dose ? ` · ${m.dose}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
            </p>
          ))}
        </div>
      )}

      {fp && (fp.able_account || fp.special_needs_trust || fp.legal_documents.length > 0) && (
        <div className="rounded-xl border border-gray-100 p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial & legal</p>
          {fp.able_account && <p className="text-xs text-gray-600">✓ ABLE Account (529A)</p>}
          {fp.special_needs_trust && <p className="text-xs text-gray-600">✓ Special Needs Trust</p>}
          {fp.legal_documents.map(d => (
            <p key={d} className="text-xs text-gray-600 capitalize">✓ {d.replace(/_/g, ' ')}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AuraHome() {
  const [children, setChildren] = useState<AuraChildProfile[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [homeTab, setHomeTab] = useState<HomeTab>('children')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [childTab, setChildTab] = useState<ChildTab>('milestones')
  const [aiInitProps, setAiInitProps] = useState<{ childId?: string; milestones?: string[] }>({})

  useEffect(() => {
    fetchProfiles().then(profiles => {
      setChildren(profiles)
      setHydrated(true)
    })
  }, [])

  const allAlerts: DevelopmentalAlert[] = children.flatMap(c => calculateAlerts(c))
  const urgentCount = allAlerts.filter(a => a.severity === 'urgent').length
  const alertCount = allAlerts.length

  const selectedChild = children.find(c => c.id === selectedChildId) ?? null

  // ── Persistence helpers ───────────────────────────────────────────────────

  async function addChild(payload: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>) {
    setSaving(true)
    try {
      const res = await fetch('/api/family/aura/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setChildren(prev => [...prev, data.profile])
        setShowAddForm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function updateMilestone(childId: string, milestoneId: string, status: MilestoneStatus) {
    const now = new Date().toISOString()
    const child = children.find(c => c.id === childId)
    if (!child) return

    const existing = child.milestone_records.findIndex(r => r.milestone_id === milestoneId)
    const record = { milestone_id: milestoneId, status, updated_at: now }
    const milestone_records =
      existing >= 0
        ? child.milestone_records.map((r, i) => (i === existing ? record : r))
        : [...child.milestone_records, record]
    const updated = { ...child, milestone_records, updated_at: now }

    // Optimistic update
    setChildren(prev => prev.map(c => c.id === childId ? updated : c))

    const { id, created_at, updated_at, ...profileData } = updated
    await fetch(`/api/family/aura/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profileData, created_at, updated_at }),
    })
  }

  async function deleteChild(id: string) {
    setChildren(prev => prev.filter(c => c.id !== id))
    if (selectedChildId === id) setSelectedChildId(null)
    await fetch(`/api/family/aura/profiles/${id}`, { method: 'DELETE' })
  }

  // ── Child detail view ─────────────────────────────────────────────────────

  if (selectedChild) {
    const childAlerts = calculateAlerts(selectedChild)
    const progress = getMilestoneProgress(selectedChild)

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChildId(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{selectedChild.full_name}</h3>
              {childAlerts.some(a => a.severity === 'urgent') && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">!</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{getAgeDisplay(selectedChild.date_of_birth)} · {progress.achieved}/{progress.total} milestones achieved</p>
          </div>
        </div>

        {/* Child alerts strip */}
        {childAlerts.length > 0 && (
          <div className={cn(
            'rounded-xl border px-3 py-2 text-xs font-medium',
            childAlerts.some(a => a.severity === 'urgent') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700',
          )}>
            {childAlerts.length} alert{childAlerts.length > 1 ? 's' : ''} — see Milestones tab for details
          </div>
        )}

        {/* Child tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {([
            { id: 'milestones', label: 'Milestones' },
            { id: 'conditions', label: 'Profile' },
            { id: 'ai',         label: 'Ask AURA' },
          ] as { id: ChildTab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setChildTab(t.id)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                childTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {childTab === 'milestones' && (
          <MilestoneTracker
            child={selectedChild}
            onUpdate={(milestoneId, status) => updateMilestone(selectedChild.id, milestoneId, status)}
            onAskAI={missing => {
              setAiInitProps({ childId: selectedChild.id, milestones: missing })
              setChildTab('ai')
            }}
          />
        )}

        {childTab === 'conditions' && <ConditionsDetail child={selectedChild} />}

        {childTab === 'ai' && (
          <AskAuraAI
            children={children}
            initialChildId={aiInitProps.childId ?? selectedChild.id}
            initialMissingMilestones={aiInitProps.milestones}
          />
        )}
      </div>
    )
  }

  // ── Home view ─────────────────────────────────────────────────────────────

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      {/* AURA header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">AURA</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adaptive Universal Resource for All-Ability — evidence-based developmental tracking, neuroadaptive alerts, and AI guidance for every child's unique journey.
            </p>
          </div>
        </div>
        {alertCount > 0 && (
          <div className={cn(
            'mt-3 rounded-xl border px-3 py-2 text-xs font-medium',
            urgentCount > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700',
          )}>
            {urgentCount > 0 ? `${urgentCount} urgent alert${urgentCount > 1 ? 's' : ''} require attention · ` : ''}
            {alertCount} total alert{alertCount > 1 ? 's' : ''} across all children
          </div>
        )}
      </div>

      {/* Home tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {([
          { id: 'children', label: 'Children' },
          { id: 'alerts',   label: `Alerts${alertCount > 0 ? ` (${alertCount})` : ''}` },
          { id: 'ai',       label: 'Ask AURA' },
        ] as { id: HomeTab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setHomeTab(t.id)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
              homeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Children tab */}
      {homeTab === 'children' && (
        <div className="space-y-3">
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add child to AURA
            </Button>
          )}

          {showAddForm && (
            <ChildForm
              onSave={addChild}
              onCancel={() => { if (!saving) setShowAddForm(false) }}
            />
          )}

          {children.length === 0 && !showAddForm && (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center space-y-2">
              <Baby className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500 font-medium">No children added yet</p>
              <p className="text-xs text-gray-400">Add your first child to start tracking milestones and getting personalised developmental guidance.</p>
            </div>
          )}

          {children.map(child => {
            const childAlerts = calculateAlerts(child)
            const progress = getMilestoneProgress(child)
            const urgent = childAlerts.filter(a => a.severity === 'urgent').length
            const warning = childAlerts.filter(a => a.severity === 'warning').length

            return (
              <div
                key={child.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 space-y-2 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <button
                    className="flex-1 text-left"
                    onClick={() => { setSelectedChildId(child.id); setChildTab('milestones'); setAiInitProps({}) }}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{child.full_name}</p>
                      {urgent > 0 && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">{urgent}!</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{getAgeDisplay(child.date_of_birth)}</p>
                    <ConditionBadges child={child} />
                  </button>
                  <button
                    onClick={() => deleteChild(child.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    title="Remove child"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress mini-bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${progress.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{progress.pct}%</span>
                </div>

                {/* Alert counts */}
                {(urgent > 0 || warning > 0) && (
                  <div className="flex gap-1.5">
                    {urgent > 0 && (
                      <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-xs text-red-600">
                        {urgent} urgent
                      </span>
                    )}
                    {warning > 0 && (
                      <span className="rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-xs text-orange-600">
                        {warning} action needed
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Alerts tab */}
      {homeTab === 'alerts' && (
        <AlertsPanel
          alerts={allAlerts}
          onMarkMilestone={(childId, milestoneId) =>
            updateMilestone(childId, milestoneId, 'achieved')
          }
        />
      )}

      {/* AI tab */}
      {homeTab === 'ai' && (
        <AskAuraAI children={children} />
      )}
    </div>
  )
}
