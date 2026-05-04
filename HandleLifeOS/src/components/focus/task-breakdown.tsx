'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { TaskStep } from '@/types/focus'

interface TaskBreakdownProps {
  taskTitle: string
  taskId?: string
  estimatedMinutes?: number
  notes?: string
  onStepSelect?: (step: TaskStep) => void
}

export function TaskBreakdown({ taskTitle, taskId, estimatedMinutes, notes, onStepSelect }: TaskBreakdownProps) {
  const [steps, setSteps] = useState<TaskStep[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  async function handleBreakdown() {
    setLoading(true)
    try {
      const res = await fetch('/api/focus/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decompose',
          task_title: taskTitle,
          notes,
          estimated_minutes: estimatedMinutes,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSteps(data)
        setExpanded(true)
      }
    } finally {
      setLoading(false)
    }
  }

  function toggleComplete(order: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(order)) next.delete(order)
      else next.add(order)
      return next
    })
  }

  if (!steps.length) {
    return (
      <Button variant="outline" size="sm" onClick={handleBreakdown} loading={loading} className="w-full">
        <Sparkles className="h-3.5 w-3.5" />
        Break into steps
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-900"
        onClick={() => setExpanded((p) => !p)}
      >
        <span>Steps ({steps.length})</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {steps.map((step) => (
            <div
              key={step.order}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <button
                onClick={() => toggleComplete(step.order)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  completedSteps.has(step.order)
                    ? 'border-green-400 bg-green-400'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {completedSteps.has(step.order) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${completedSteps.has(step.order) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {step.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{step.duration_minutes}m</span>
                {onStepSelect && (
                  <button
                    onClick={() => onStepSelect(step)}
                    className="hidden group-hover:block text-xs text-indigo-600 hover:underline"
                  >
                    Focus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
