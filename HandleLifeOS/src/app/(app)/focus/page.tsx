'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StartFocusCard } from '@/components/focus/start-focus-card'
import { FocusTimer } from '@/components/focus/focus-timer'
import { SessionSummary } from '@/components/focus/session-summary'
import { TaskBreakdown } from '@/components/focus/task-breakdown'
import type { FocusSession } from '@/types/focus'

type Phase = 'start' | 'session' | 'summary'

export default function FocusPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('start')
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null)
  const [actualMinutes, setActualMinutes] = useState(0)
  const [lastSession, setLastSession] = useState<FocusSession | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/focus/sessions', { signal: controller.signal })
      .then((r) => r.ok ? r.json() : [])
      .then((sessions: FocusSession[]) => {
        const incomplete = sessions.find((s) => !s.completed && !s.abandoned)
        if (incomplete) setLastSession(incomplete)
      })
      .catch(() => {/* aborted or network error — ignore */})
    return () => controller.abort()
  }, [])

  function handleSessionStart(session: FocusSession) {
    setActiveSession(session)
    setPhase('session')
  }

  async function handleComplete(mins: number) {
    if (!activeSession) return
    setActualMinutes(mins)
    await fetch(`/api/focus/sessions/${activeSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: true,
        actual_minutes: mins,
        ended_at: new Date().toISOString(),
      }),
    })
    setPhase('summary')
  }

  async function handleAbandon() {
    if (!activeSession) return
    const elapsed = Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 60000)
    setActualMinutes(Math.max(1, elapsed))
    await fetch(`/api/focus/sessions/${activeSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        abandoned: true,
        actual_minutes: Math.max(1, elapsed),
        ended_at: new Date().toISOString(),
      }),
    })
    // Don't go to summary — let timer component handle restart UX
  }

  function handleNewSession() {
    setActiveSession(null)
    setActualMinutes(0)
    setPhase('start')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        {phase === 'start' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Focus</h1>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">One task. One session. Real progress.</p>
            </div>
            <StartFocusCard onSessionStart={handleSessionStart} lastSession={lastSession} />

            {/* Quick breakdown for top task */}
            {activeSession?.task_title && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Break it down</p>
                <TaskBreakdown taskTitle={activeSession.task_title} />
              </div>
            )}
          </div>
        )}

        {phase === 'session' && activeSession && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">In session</h1>
              <button
                onClick={() => setPhase('start')}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              >
                ← Back
              </button>
            </div>
            <FocusTimer
              session={activeSession}
              onComplete={handleComplete}
              onAbandon={handleAbandon}
            />
            {activeSession.task_title && (
              <TaskBreakdown
                taskTitle={activeSession.task_title}
                taskId={activeSession.task_id ?? undefined}
              />
            )}
          </div>
        )}

        {phase === 'summary' && activeSession && (
          <SessionSummary
            session={activeSession}
            actualMinutes={actualMinutes}
            onNewSession={handleNewSession}
            onGoToTasks={() => router.push('/planner/tasks')}
          />
        )}
      </div>
    </div>
  )
}
