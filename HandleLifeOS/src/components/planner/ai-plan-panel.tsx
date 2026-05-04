'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { DayPlan, Task } from '@/types/planner'

interface AIPlanPanelProps {
  tasks: Task[]
  onPlanGenerated?: (plan: DayPlan) => void
  onPrioritized?: () => void
}

export function AIPlanPanel({ tasks, onPlanGenerated, onPrioritized }: AIPlanPanelProps) {
  const [loading, setLoading] = useState<'plan' | 'prioritize' | null>(null)
  const [plan, setPlan] = useState<DayPlan | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [inputText, setInputText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<string | null>(null)

  async function handleGeneratePlan() {
    setLoading('plan')
    try {
      const res = await fetch('/api/planner/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'day_plan' }),
      })
      const data = await res.json()
      setPlan(data)
      setExpanded(true)
      onPlanGenerated?.(data)
    } finally {
      setLoading(null)
    }
  }

  async function handlePrioritize() {
    setLoading('prioritize')
    try {
      await fetch('/api/planner/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prioritize' }),
      })
      onPrioritized?.()
    } finally {
      setLoading(null)
    }
  }

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return
    setExtracting(true)
    setExtractResult(null)
    try {
      const res = await fetch('/api/planner/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract', text: inputText }),
      })
      const data = await res.json()
      setExtractResult(data.summary)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick add from text */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Dump your brain — Life OS will structure it</p>
        <form onSubmit={handleExtract} className="space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. Pay bill, buy groceries, finish report, call mom..."
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {extractResult && (
            <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">{extractResult}</p>
          )}
          <Button type="submit" size="sm" variant="outline" loading={extracting} disabled={!inputText.trim()} className="w-full">
            <Sparkles className="h-3.5 w-3.5" />
            Turn into tasks
          </Button>
        </form>
      </div>

      {/* AI action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrioritize}
          loading={loading === 'prioritize'}
          disabled={!tasks.length || !!loading}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Prioritize
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGeneratePlan}
          loading={loading === 'plan'}
          disabled={!tasks.length || !!loading}
        >
          {loading === 'plan'
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Sparkles className="h-3.5 w-3.5" />
          }
          Plan my day
        </Button>
      </div>

      {/* Day plan result */}
      {plan && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <button
            className="flex w-full items-center justify-between text-sm font-medium text-gray-900"
            onClick={() => setExpanded((p) => !p)}
          >
            <span>Today's schedule ({plan.schedule.length} blocks)</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expanded && (
            <div className="mt-3 space-y-2">
              {plan.schedule.map((block, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-gray-400 w-12 shrink-0 font-mono">{block.time}</span>
                  <span className={`flex-1 ${block.type === 'break' ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                    {block.task_title}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{block.duration_minutes}m</span>
                </div>
              ))}
              {plan.skipped_tasks.length > 0 && (
                <p className="text-xs text-gray-400 pt-1 border-t border-indigo-100">
                  +{plan.skipped_tasks.length} tasks moved to tomorrow
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
