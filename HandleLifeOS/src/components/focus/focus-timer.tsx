'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { BodyDoublePanel } from './body-double-panel'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FocusSession } from '@/types/focus'

interface FocusTimerProps {
  session: FocusSession
  onComplete: (actualMinutes: number) => void
  onAbandon: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function FocusTimer({ session, onComplete, onAbandon }: FocusTimerProps) {
  const totalSeconds = session.planned_minutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [running, setRunning] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [abandoned, setAbandoned] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  const progress = 1 - secondsLeft / totalSeconds
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const minutesElapsed = Math.floor((totalSeconds - secondsLeft) / 60)
  const minutesRemaining = Math.ceil(secondsLeft / 60)

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setRunning(false)
        setCompleted(true)
        return 0
      }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  useEffect(() => {
    if (completed) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000)
      onComplete(Math.max(1, elapsed))
    }
  }, [completed, onComplete])

  function handleAbandon() {
    setRunning(false)
    setAbandoned(true)
    onAbandon()
  }

  function handleRestart() {
    setSecondsLeft(totalSeconds)
    setAbandoned(false)
    setCompleted(false)
    setRunning(true)
    startTimeRef.current = Date.now()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Task title */}
      {session.task_title && (
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Focusing on</p>
          <p className="text-base font-semibold text-gray-900 max-w-xs truncate">{session.task_title}</p>
        </div>
      )}

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={completed ? '#22c55e' : '#6366f1'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-bold tabular-nums', completed ? 'text-green-600' : 'text-gray-900')}>
            {completed ? '✓' : formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-gray-400 mt-1 capitalize">{session.mode}</span>
        </div>
      </div>

      {/* Controls */}
      {!completed && !abandoned && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRunning((p) => !p)}
            aria-label={running ? 'Pause' : 'Resume'}
            className="h-12 w-12 rounded-full"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAbandon}
            aria-label="End session"
            className="h-10 w-10 rounded-full hover:text-red-600 hover:bg-red-50"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}

      {abandoned && !completed && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <p className="text-sm text-gray-500 text-center">Session ended. Want to restart?</p>
          <Button variant="outline" size="sm" onClick={handleRestart} className="w-full">
            <RotateCcw className="h-3.5 w-3.5" />
            Restart session
          </Button>
        </div>
      )}

      {completed && (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-700">Session complete! 🎉</p>
          <p className="text-sm text-gray-400 mt-1">{session.planned_minutes} minutes focused.</p>
        </div>
      )}

      {/* Body doubling panel */}
      {session.body_doubling_enabled && (
        <div className="w-full max-w-sm">
          <BodyDoublePanel
            taskTitle={session.task_title ?? 'your task'}
            sessionId={session.id}
            minutesElapsed={minutesElapsed}
            minutesRemaining={minutesRemaining}
            completed={completed}
            abandoned={abandoned}
          />
        </div>
      )}
    </div>
  )
}
