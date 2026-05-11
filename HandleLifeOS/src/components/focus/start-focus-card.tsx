'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EnergySelector } from './energy-selector'
import { Play, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FOCUS_MODE_MINUTES, FOCUS_MODE_LABELS } from '@/types/focus'
import type { FocusMode, EnergyState, FocusSession } from '@/types/focus'

interface Task { id: string; title: string; estimated_minutes?: number | null }

const MODES: FocusMode[] = ['quick', 'pomodoro', 'deep', 'custom']

interface StartFocusCardProps {
  onSessionStart: (session: FocusSession) => void
  lastSession?: FocusSession | null
}

export function StartFocusCard({ onSessionStart, lastSession }: StartFocusCardProps) {
  const [mode, setMode] = useState<FocusMode>('pomodoro')
  const [customMinutes, setCustomMinutes] = useState(30)
  const [energy, setEnergy] = useState<EnergyState>('normal')
  const [bodyDoubling, setBodyDoubling] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [suggestedTasks, setSuggestedTasks] = useState<Array<{ id: string; reason: string }>>([])
  const [starting, setStarting] = useState(false)
  const [loadingSuggest, setLoadingSuggest] = useState(false)

  const plannedMinutes = mode === 'custom' ? customMinutes : FOCUS_MODE_MINUTES[mode]

  useEffect(() => {
    fetch('/api/tasks?status=todo')
      .then((r) => r.ok ? r.json() : [])
      .then(setTasks)
  }, [])

  async function handleEnergySuggest(e: EnergyState) {
    setEnergy(e)
    if (!tasks.length) return
    setLoadingSuggest(true)
    try {
      const res = await fetch('/api/focus/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'energy_suggest', energy: e }),
      })
      if (res.ok) setSuggestedTasks(await res.json())
    } finally {
      setLoadingSuggest(false)
    }
  }

  async function handleStart() {
    setStarting(true)
    try {
      const res = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          planned_minutes: plannedMinutes,
          task_id: selectedTask?.id,
          task_title: selectedTask?.title,
          body_doubling_enabled: bodyDoubling,
        }),
      })
      if (res.ok) {
        const session = await res.json()
        onSessionStart(session)
      }
    } finally {
      setStarting(false)
    }
  }

  const suggestedTaskIds = new Set(suggestedTasks.map((s) => s.id))

  return (
    <div className="space-y-5">
      {/* Restart last session */}
      {lastSession && !lastSession.completed && !lastSession.abandoned && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-amber-800">Resume last session</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lastSession.task_title ?? 'Untitled'} — {lastSession.planned_minutes}min {lastSession.mode}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onSessionStart(lastSession)} className="border-amber-300 text-amber-700 hover:bg-amber-100">
            Resume
          </Button>
        </div>
      )}

      {/* Mode selector */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Focus mode</p>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-2.5 px-1 text-center transition-all',
                mode === m ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <span className={cn('text-base font-bold tabular-nums', mode === m ? 'text-indigo-700' : 'text-gray-700')}>
                {m === 'custom' ? '?' : `${FOCUS_MODE_MINUTES[m]}`}
              </span>
              <span className={cn('text-xs', mode === m ? 'text-indigo-600' : 'text-gray-500')}>
                {FOCUS_MODE_LABELS[m]}
              </span>
            </button>
          ))}
        </div>
        {mode === 'custom' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Minutes:</span>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-gray-900 w-10 text-right">{customMinutes}m</span>
          </div>
        )}
      </div>

      {/* Energy */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Your energy right now</p>
        <EnergySelector value={energy} onChange={handleEnergySuggest} />
      </div>

      {/* Task selection */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">What will you work on?</p>
            {loadingSuggest && <span className="text-xs text-indigo-400 flex items-center gap-1"><Sparkles className="h-3 w-3" />Suggesting...</span>}
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            <button
              onClick={() => setSelectedTask(null)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm border transition-colors',
                !selectedTask ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              Free focus (no specific task)
            </button>
            {tasks.map((task) => {
              const isSuggested = suggestedTaskIds.has(task.id)
              const suggestion = suggestedTasks.find((s) => s.id === task.id)
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left border transition-colors',
                    selectedTask?.id === task.id
                      ? 'border-indigo-400 bg-indigo-50'
                      : isSuggested
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm truncate', selectedTask?.id === task.id ? 'text-indigo-700 font-medium' : 'text-gray-700')}>
                      {task.title}
                    </span>
                    {isSuggested && <span className="text-xs text-green-600 shrink-0">✨ Suggested</span>}
                  </div>
                  {isSuggested && suggestion && (
                    <p className="text-xs text-green-600 mt-0.5">{suggestion.reason}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Body doubling toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">AI Body Doubling</p>
          <p className="text-xs text-gray-400">Life OS stays present with gentle check-ins</p>
        </div>
        <button
          onClick={() => setBodyDoubling((p) => !p)}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            bodyDoubling ? 'bg-indigo-600' : 'bg-gray-200'
          )}
          aria-label="Toggle body doubling"
        >
          <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', bodyDoubling ? 'translate-x-4.5' : 'translate-x-0.5')} />
        </button>
      </div>

      {/* Start button */}
      <Button data-testid="start-timer-btn" onClick={handleStart} loading={starting} size="lg" className="w-full rounded-2xl text-base">
        <Play className="h-5 w-5" />
        Start {plannedMinutes}-minute session
      </Button>
    </div>
  )
}
