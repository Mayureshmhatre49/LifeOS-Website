'use client'

import { useState } from 'react'
import { ArrowLeft, History, Sparkles, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DecisionForm } from './DecisionForm'
import { DecisionResult } from './DecisionResult'
import { CompareTable } from './CompareTable'
import { DecisionHistory } from './DecisionHistory'
import type {
  DecisionMode,
  DecisionCategory,
  DecisionResult as TDecisionResult,
  CompareResult,
  DecisionLog,
} from '@/types/decision'

type View = 'form' | 'result' | 'history'

interface AnalysisState {
  id: string | null
  mode: DecisionMode
  question: string
  result: TDecisionResult | CompareResult
  isPremium: boolean
}

interface Props {
  userId: string
}

export function DecisionsCopilot({ userId: _ }: Props) {
  const [view, setView] = useState<View>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null)

  async function handleSubmit(payload: {
    question: string
    category?: DecisionCategory
    mode: DecisionMode
    options?: string[]
    additionalContext?: string
  }) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/decisions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 402) {
        const json = await res.json()
        setError(
          `AI quota exceeded. ${json.upgradeUrl ? 'Upgrade to Pro for unlimited analyses.' : ''}`,
        )
        setLoading(false)
        return
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Analysis failed. Please try again.')
        setLoading(false)
        return
      }

      const json = await res.json()
      setAnalysis({
        id: json.id ?? null,
        mode: payload.mode,
        question: payload.question,
        result: json.result,
        isPremium: json.isPremium ?? false,
      })
      setView('result')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleRerun(log: DecisionLog) {
    // Pre-fill the form by triggering a submit with the logged question
    setView('form')
    // The form doesn't hold external state, so just reset to form
    // The user will see the templates and can retype / modify
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(view === 'result' || view === 'history') && (
            <button
              onClick={() => setView('form')}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Decision Copilot</h1>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-10">
              {view === 'form'
                ? 'AI-powered life decision intelligence'
                : view === 'history'
                ? 'Your saved analyses'
                : 'Analysis complete'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'history' ? 'form' : 'history')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
              view === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/80 border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600',
            )}
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
          {error}
          {error.includes('upgrade') && (
            <a href="/billing" className="ml-2 underline font-bold">
              Upgrade →
            </a>
          )}
        </div>
      )}

      {/* Views */}
      {view === 'form' && (
        <DecisionForm onSubmit={handleSubmit} loading={loading} />
      )}

      {view === 'result' && analysis && (
        <div className="space-y-4">
          {/* New analysis CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setView('form'); setAnalysis(null) }}
              className="flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> New analysis
            </button>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              <History className="h-3.5 w-3.5" /> Past decisions
            </button>
          </div>

          {analysis.mode === 'compare' ? (
            <CompareTable result={analysis.result as CompareResult} />
          ) : (
            <DecisionResult
              result={analysis.result as TDecisionResult}
              question={analysis.question}
              isPremium={analysis.isPremium}
            />
          )}
        </div>
      )}

      {view === 'history' && (
        <DecisionHistory onRerun={handleRerun} />
      )}
    </div>
  )
}
