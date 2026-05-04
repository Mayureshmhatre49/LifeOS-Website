'use client'

import {
  CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Eye,
  Lightbulb, ArrowRight, Star, Clock, Heart, Wallet, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RiskMeter } from './RiskMeter'
import type { DecisionResult as TDecisionResult } from '@/types/decision'

interface Props {
  result: TDecisionResult
  question: string
  isPremium: boolean
}

function fmtINR(n: number | null | undefined): string {
  if (n == null) return '—'
  if (Math.abs(n) >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
  if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(0)}k`
  return `₹${n}`
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function BulletList({ items, color }: { items: string[]; color: 'green' | 'red' | 'amber' }) {
  const Icon = color === 'green' ? TrendingUp : color === 'red' ? TrendingDown : AlertTriangle
  const textColor = color === 'green' ? 'text-emerald-500' : color === 'red' ? 'text-rose-400' : 'text-amber-500'
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <Icon className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', textColor)} />
          <span className="text-[13px] text-gray-600 leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ScenarioCard({
  scenario,
  variant,
}: {
  scenario: TDecisionResult['bestCase']
  variant: 'best' | 'worst'
}) {
  const isBest = variant === 'best'
  return (
    <div
      className={cn(
        'rounded-xl border p-3 space-y-1.5',
        isBest ? 'bg-emerald-50/80 border-emerald-100' : 'bg-rose-50/80 border-rose-100',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-bold', isBest ? 'text-emerald-700' : 'text-rose-700')}>
          {isBest ? '✦ Best case' : '✦ Worst case'}
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold rounded-full px-2 py-0.5',
            isBest ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600',
          )}
        >
          {scenario.probability}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-800">{scenario.label}</p>
      <p className="text-[11px] text-gray-500 leading-relaxed">{scenario.description}</p>
    </div>
  )
}

export function DecisionResult({ result, question, isPremium }: Props) {
  const [showHidden, setShowHidden] = useState(false)

  const recStarts = result.recommendation.split(' ')[0].toLowerCase()
  const recColor =
    recStarts === 'yes' ? 'emerald' :
    recStarts === 'no' ? 'rose' :
    recStarts === 'wait' ? 'amber' : 'indigo'

  const recColors = {
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-200' },
    rose:    { bg: 'bg-rose-600',    text: 'text-rose-600',    light: 'bg-rose-50 border-rose-200'       },
    amber:   { bg: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50 border-amber-200'     },
    indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-600',  light: 'bg-indigo-50 border-indigo-200'   },
  }[recColor]

  return (
    <div className="space-y-4">
      {/* Question echo */}
      <p className="text-xs text-gray-400 font-medium truncate">
        Analysis for: <span className="text-gray-600 font-semibold">{question}</span>
      </p>

      {/* Executive summary + recommendation */}
      <div className={cn('rounded-2xl border p-4 space-y-3', recColors.light)}>
        <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
        <div className="flex items-start gap-3 pt-1 border-t border-current/10">
          <span
            className={cn(
              'shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white',
              recColors.bg,
            )}
          >
            {result.recommendation.split(' ')[0].toUpperCase()}
          </span>
          <p className={cn('text-sm font-semibold leading-snug', recColors.text)}>
            {result.recommendation.split(' ').slice(1).join(' ')}
          </p>
        </div>
      </div>

      {/* Risk meter + financial row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <RiskMeter
          riskScore={result.riskScore}
          riskLevel={result.riskLevel}
          confidenceScore={result.confidenceScore}
        />

        {/* Financial impact */}
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Financial Impact</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">{result.financialImpact.summary}</p>
          <div className="grid grid-cols-2 gap-2">
            {result.financialImpact.monthlyCostChange != null && (
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-[10px] text-gray-400 font-medium">Monthly change</p>
                <p className={cn('text-sm font-bold', result.financialImpact.monthlyCostChange > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                  {result.financialImpact.monthlyCostChange > 0 ? '+' : ''}{fmtINR(result.financialImpact.monthlyCostChange)}
                </p>
              </div>
            )}
            {result.financialImpact.oneTimeCost != null && (
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-[10px] text-gray-400 font-medium">One-time cost</p>
                <p className="text-sm font-bold text-gray-800">{fmtINR(result.financialImpact.oneTimeCost)}</p>
              </div>
            )}
            {result.financialImpact.affordabilityScore != null && (
              <div className="rounded-xl bg-gray-50 px-3 py-2 col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gray-400 font-medium">Affordability</p>
                  <p className="text-xs font-bold text-gray-700">{result.financialImpact.affordabilityScore}/100</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      result.financialImpact.affordabilityScore >= 70 ? 'bg-emerald-500' :
                      result.financialImpact.affordabilityScore >= 40 ? 'bg-amber-500' : 'bg-rose-500',
                    )}
                    style={{ width: `${result.financialImpact.affordabilityScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {result.financialImpact.opportunityCost && (
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed border-t border-gray-100 pt-2">
              💡 {result.financialImpact.opportunityCost}
            </p>
          )}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="Pros" icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}>
          <BulletList items={result.pros} color="green" />
        </Section>
        <Section title="Cons" icon={<TrendingDown className="h-3.5 w-3.5 text-rose-500" />}>
          <BulletList items={result.cons} color="red" />
        </Section>
      </div>

      {/* Time & Emotional impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="Time Impact" icon={<Clock className="h-3.5 w-3.5 text-sky-600" />}>
          <p className="text-[13px] text-gray-600 leading-relaxed">{result.timeImpact}</p>
        </Section>
        <Section title="Emotional Impact" icon={<Heart className="h-3.5 w-3.5 text-rose-400" />}>
          <p className="text-[13px] text-gray-600 leading-relaxed">{result.emotionalImpact}</p>
        </Section>
      </div>

      {/* Hidden factors (collapsible) */}
      {result.hiddenFactors.length > 0 && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-100 overflow-hidden">
          <button
            onClick={() => setShowHidden(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">
                {result.hiddenFactors.length} Hidden Factors You Might Have Missed
              </span>
            </div>
            {showHidden ? (
              <ChevronUp className="h-4 w-4 text-amber-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-600" />
            )}
          </button>
          {showHidden && (
            <div className="px-4 pb-4">
              <BulletList items={result.hiddenFactors} color="amber" />
            </div>
          )}
        </div>
      )}

      {/* Scenarios */}
      {isPremium && (
        <Section title="Scenarios" icon={<Star className="h-3.5 w-3.5 text-violet-500" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScenarioCard scenario={result.bestCase} variant="best" />
            <ScenarioCard scenario={result.worstCase} variant="worst" />
          </div>
          {result.threeYearView && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 mt-1">
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">3-Year View</p>
              <p className="text-[13px] text-gray-700 leading-relaxed">{result.threeYearView}</p>
            </div>
          )}
        </Section>
      )}

      {/* Next steps */}
      {result.nextSteps.length > 0 && (
        <Section title="Your Action Plan" icon={<Lightbulb className="h-3.5 w-3.5 text-indigo-600" />}>
          <ol className="space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[13px] text-gray-700 leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Data sources + memory factors */}
      {(result.dataSourcesUsed.length > 0 || result.memoryFactorsUsed.length > 0) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {result.dataSourcesUsed.map(src => (
            <span key={src} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> {src} data used
            </span>
          ))}
          {result.memoryFactorsUsed.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
              <Star className="h-3 w-3" /> memory-aware analysis
            </span>
          )}
        </div>
      )}

      {/* Premium upsell */}
      {!isPremium && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-800">Unlock Premium Analysis</p>
              <p className="text-xs text-indigo-500 mt-0.5">
                Get full scenarios, memory-aware insights, and 3-year projections.
              </p>
            </div>
            <a
              href="/billing"
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shrink-0"
            >
              Upgrade <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
