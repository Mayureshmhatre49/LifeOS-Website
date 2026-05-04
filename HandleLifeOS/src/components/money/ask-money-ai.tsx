'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'
import type {
  SpendingInsightResult,
  AffordabilityResult,
  SavingsSuggestionResult,
  FinancialCalmResult,
  SubscriptionOptimizationResult,
} from '@/types/money'
import { cn } from '@/lib/utils'

type AnyMoneyResult =
  | SpendingInsightResult
  | AffordabilityResult
  | SavingsSuggestionResult
  | FinancialCalmResult
  | SubscriptionOptimizationResult

type ActionOption = {
  action: string
  label: string
  description: string
  emoji: string
}

const ACTIONS: ActionOption[] = [
  { action: 'spending_insight', label: 'Spending insight', description: 'Analyse this month\'s expenses', emoji: '📊' },
  { action: 'affordability', label: 'Can I afford this?', description: 'Ask about a purchase', emoji: '🛒' },
  { action: 'savings_suggestion', label: 'Savings coach', description: 'Get a personalised savings plan', emoji: '🎯' },
  { action: 'financial_calm', label: 'I\'m stressed about money', description: 'Calm mode — stabilise first', emoji: '💛' },
  { action: 'optimize_subscriptions', label: 'Optimise subscriptions', description: 'Find waste & savings', emoji: '✂️' },
]

function ResultCard({ result }: { result: AnyMoneyResult }) {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)

  const isAffordability = 'verdict' in result
  const isInsight = 'highlights' in result && !('immediate_steps' in result)
  const isSavings = 'monthly_savings_suggestion' in result
  const isCalm = 'immediate_steps' in result
  const isSubscriptions = 'monthly_total' in result

  const VERDICT_CONFIG = {
    yes: { label: 'Yes, go for it', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    stretch: { label: 'Stretch purchase', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    no: { label: 'Not recommended now', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    needs_context: { label: 'Need more context', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 text-sm">
      {isAffordability && (
        <>
          <div className={cn('rounded-xl border px-4 py-3', VERDICT_CONFIG[(result as AffordabilityResult).verdict].bg)}>
            <p className={cn('font-semibold', VERDICT_CONFIG[(result as AffordabilityResult).verdict].color)}>
              {VERDICT_CONFIG[(result as AffordabilityResult).verdict].label}
            </p>
            <p className="text-gray-700 mt-1">{(result as AffordabilityResult).reasoning}</p>
          </div>
          {(result as AffordabilityResult).monthly_impact && (
            <p className="text-gray-600">{(result as AffordabilityResult).monthly_impact}</p>
          )}
          {(result as AffordabilityResult).alternatives.length > 0 && (
            <ul className="space-y-1">
              {(result as AffordabilityResult).alternatives.map((a, i) => (
                <li key={i} className="text-gray-600">• {a}</li>
              ))}
            </ul>
          )}
        </>
      )}

      {isInsight && (
        <>
          <p className="text-gray-700">{(result as SpendingInsightResult).summary}</p>
          {(result as SpendingInsightResult).highlights.length > 0 && (
            <ul className="space-y-1">
              {(result as SpendingInsightResult).highlights.map((h, i) => (
                <li key={i} className="text-gray-600">• {h}</li>
              ))}
            </ul>
          )}
          {(result as SpendingInsightResult).suggestions.length > 0 && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-1">
              <p className="text-xs font-medium text-indigo-700">Suggestions</p>
              {(result as SpendingInsightResult).suggestions.map((s, i) => (
                <p key={i} className="text-indigo-700">→ {s}</p>
              ))}
            </div>
          )}
        </>
      )}

      {isSavings && (
        <>
          {(result as SavingsSuggestionResult).monthly_savings_suggestion > 0 && (
            <p className="font-semibold text-green-700">
              Suggested monthly savings: {new Intl.NumberFormat('en-IN').format((result as SavingsSuggestionResult).monthly_savings_suggestion)}
            </p>
          )}
          {(result as SavingsSuggestionResult).emergency_fund_target > 0 && (
            <p className="text-gray-600">Emergency fund target: {new Intl.NumberFormat('en-IN').format((result as SavingsSuggestionResult).emergency_fund_target)}</p>
          )}
          <ul className="space-y-1">
            {(result as SavingsSuggestionResult).next_steps.map((s, i) => <li key={i} className="text-gray-600">→ {s}</li>)}
          </ul>
          <p className="text-gray-500 italic">{(result as SavingsSuggestionResult).motivational_note}</p>
        </>
      )}

      {isCalm && (
        <>
          <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3">
            <p className="text-yellow-800">{(result as FinancialCalmResult).acknowledgment}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Immediate steps</p>
            <ul className="space-y-1">
              {(result as FinancialCalmResult).immediate_steps.map((s, i) => <li key={i} className="text-gray-600">→ {s}</li>)}
            </ul>
          </div>
          {(result as FinancialCalmResult).priority_order.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Priority order</p>
              <ol className="space-y-1 list-decimal list-inside">
                {(result as FinancialCalmResult).priority_order.map((p, i) => <li key={i} className="text-gray-600">{p}</li>)}
              </ol>
            </div>
          )}
          <p className="text-gray-500 italic">{(result as FinancialCalmResult).calming_note}</p>
        </>
      )}

      {isSubscriptions && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">Monthly total</p>
              <p className="text-lg font-bold text-gray-900">{new Intl.NumberFormat('en-IN').format((result as SubscriptionOptimizationResult).monthly_total)}</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-center">
              <p className="text-xs text-gray-500">Potential savings</p>
              <p className="text-lg font-bold text-green-700">{new Intl.NumberFormat('en-IN').format((result as SubscriptionOptimizationResult).potential_savings)}/mo</p>
            </div>
          </div>
          {(result as SubscriptionOptimizationResult).waste_flags.length > 0 && (
            <div className="space-y-1">
              <p className="font-medium text-gray-700">Possible waste</p>
              {(result as SubscriptionOptimizationResult).waste_flags.map((w, i) => (
                <div key={i} className="flex gap-2 text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{w.name}: {w.reason}</span>
                </div>
              ))}
            </div>
          )}
          <ul className="space-y-1">
            {(result as SubscriptionOptimizationResult).suggestions.map((s, i) => <li key={i} className="text-gray-600">→ {s}</li>)}
          </ul>
        </>
      )}

      {/* Disclaimer */}
      <button
        onClick={() => setDisclaimerOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-500"
      >
        {disclaimerOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Educational guidance only
      </button>
      {disclaimerOpen && <p className="text-xs text-gray-400">{result.disclaimer}</p>}
    </div>
  )
}

interface Props {
  onSubmit: (action: string, extra?: string) => Promise<AnyMoneyResult | null>
}

export function AskMoneyAI({ onSubmit }: Props) {
  const [selected, setSelected] = useState<ActionOption | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnyMoneyResult | null>(null)

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    setResult(null)
    const res = await onSubmit(selected.action, question)
    setResult(res)
    setLoading(false)
  }

  const needsQuestion = selected?.action === 'affordability' || selected?.action === 'financial_calm'

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-indigo-700">Ask money AI</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(a => (
          <button
            key={a.action}
            onClick={() => { setSelected(a); setResult(null) }}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selected?.action === a.action
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
            )}
          >
            <span>{a.emoji}</span>
            {a.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-2">
          {needsQuestion && (
            <div className="relative">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={selected.action === 'affordability' ? 'e.g. Can I afford a new iPhone 15?' : 'Tell me what\'s stressing you out…'}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={2}
              />
              <div className="absolute right-1 top-1">
                <VoiceMicButton
                  onTranscript={setQuestion}
                  className="h-8 w-8 bg-transparent hover:bg-white/50 text-gray-400"
                />
              </div>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading || (needsQuestion && !question.trim())}
            size="sm"
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? 'Analysing…' : 'Get insight'}
          </Button>
        </div>
      )}

      {result && <ResultCard result={result} />}
    </div>
  )
}
