'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, AlertTriangle, SkipForward, Sparkles } from 'lucide-react'
import type { AuraChildProfile, MilestoneDomain, MilestoneStatus, MilestoneAgeKey } from '@/types/aura'
import { MILESTONES, DOMAIN_LABELS, DOMAIN_COLORS, MILESTONE_AGES_MONTHS } from '@/types/aura'
import { getAgeInMonths, getRelevantAgeKeys, getMilestoneStatus, getMilestoneProgress } from '@/lib/aura-logic'
import { cn } from '@/lib/utils'

interface Props {
  child: AuraChildProfile
  onUpdate: (milestoneId: string, status: MilestoneStatus, notes?: string) => void
  onAskAI: (missingDescriptions: string[]) => void
}

const DOMAINS: MilestoneDomain[] = [
  'social_emotional',
  'language_communication',
  'cognitive',
  'movement_physical',
]

const STATUS_ICONS: Record<MilestoneStatus, React.ReactNode> = {
  achieved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  not_yet:  <Circle className="h-4 w-4 text-gray-300" />,
  concern:  <AlertTriangle className="h-4 w-4 text-orange-400" />,
  skipped:  <SkipForward className="h-4 w-4 text-gray-400" />,
}

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  achieved: 'Achieved',
  not_yet:  'Not yet',
  concern:  'Concern',
  skipped:  'Skipped',
}

const AGE_LABELS: Record<MilestoneAgeKey, string> = {
  '2m': '2 months', '4m': '4 months', '6m': '6 months',
  '9m': '9 months', '12m': '12 months', '15m': '15 months',
  '18m': '18 months', '2y': '2 years', '3y': '3 years',
  '4y': '4 years',  '5y': '5 years',
  '6y': '6 years', '7y': '7 years', '8y': '8 years',
  '10y': '10 years', '12y': '12 years', '14y': '14 years',
  '16y': '16 years', '18y': '18 years',
}

export function MilestoneTracker({ child, onUpdate, onAskAI }: Props) {
  const [activeDomain, setActiveDomain] = useState<MilestoneDomain>('social_emotional')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const ageMonths = getAgeInMonths(child.date_of_birth)
  const relevantKeys = getRelevantAgeKeys(ageMonths)
  const progress = getMilestoneProgress(child)

  const domainMilestones = MILESTONES.filter(m => m.domain === activeDomain)

  const dueMilestones    = domainMilestones.filter(m => relevantKeys.includes(m.age_key))
  const upcomingMilestones = domainMilestones.filter(m => !relevantKeys.includes(m.age_key))

  const colors = DOMAIN_COLORS[activeDomain]

  function getMissingDescriptions(): string[] {
    return dueMilestones
      .filter(m => {
        const s = getMilestoneStatus(child, m.id)
        return s === 'not_yet' || s === 'concern'
      })
      .map(m => `${m.description} (expected by ${m.age_key})`)
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-600">Overall milestone progress</p>
          <span className="text-xs font-semibold text-gray-800">{progress.achieved}/{progress.total} ({progress.pct}%)</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Domain tabs */}
      <div className="grid grid-cols-2 gap-1.5">
        {DOMAINS.map(d => {
          const c = DOMAIN_COLORS[d]
          const isActive = d === activeDomain
          const domainMils = MILESTONES.filter(m => m.domain === d && relevantKeys.includes(m.age_key))
          const domainAchieved = domainMils.filter(m => getMilestoneStatus(child, m.id) === 'achieved').length
          return (
            <button
              key={d}
              onClick={() => setActiveDomain(d)}
              className={cn(
                'rounded-xl p-2.5 text-left transition-colors border',
                isActive ? `${c.bg} ${c.border}` : 'bg-white border-gray-100 hover:border-gray-200',
              )}
            >
              <p className={cn('text-xs font-medium leading-tight', isActive ? c.text : 'text-gray-700')}>
                {DOMAIN_LABELS[d]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {domainAchieved}/{domainMils.length}
              </p>
            </button>
          )
        })}
      </div>

      {/* Due milestones */}
      {dueMilestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due by age</p>
          {dueMilestones.map(m => {
            const status = getMilestoneStatus(child, m.id)
            const isExpanded = expandedId === m.id
            return (
              <div
                key={m.id}
                className={cn(
                  'rounded-xl border p-3 transition-colors cursor-pointer',
                  status === 'achieved' ? 'border-green-100 bg-green-50/50'
                  : status === 'concern'  ? 'border-orange-100 bg-orange-50/50'
                  : 'border-gray-100 bg-white hover:border-gray-200',
                )}
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">{STATUS_ICONS[status]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{m.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{AGE_LABELS[m.age_key]}</span>
                      {m.red_flag && (
                        <span className="rounded-full bg-red-50 border border-red-100 px-1.5 py-0.5 text-xs text-red-500 font-medium">
                          red flag
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded: status buttons */}
                {isExpanded && (
                  <div
                    className="mt-3 pt-3 border-t border-gray-100"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-xs text-gray-400 mb-2">Mark status:</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['achieved', 'not_yet', 'concern', 'skipped'] as MilestoneStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => { onUpdate(m.id, s); setExpandedId(null) }}
                          className={cn(
                            'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors',
                            status === s
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
                          )}
                        >
                          {STATUS_ICONS[s]}
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI guidance for missing milestones */}
      {getMissingDescriptions().length > 0 && (
        <button
          onClick={() => onAskAI(getMissingDescriptions())}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Ask AURA about {getMissingDescriptions().length} unachieved milestone{getMissingDescriptions().length > 1 ? 's' : ''}
        </button>
      )}

      {/* Upcoming milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</p>
          {upcomingMilestones.slice(0, 4).map(m => (
            <div key={m.id} className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 opacity-60">
              <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{m.description}</p>
                <p className="text-xs text-gray-400">{AGE_LABELS[m.age_key]}</p>
              </div>
            </div>
          ))}
          {upcomingMilestones.length > 4 && (
            <p className="text-xs text-gray-400 pl-2">+{upcomingMilestones.length - 4} more upcoming</p>
          )}
        </div>
      )}
    </div>
  )
}
