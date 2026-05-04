'use client'

import { Button } from '@/components/ui/button'
import { RotateCcw, Plus } from 'lucide-react'
import type { FocusSession } from '@/types/focus'

interface SessionSummaryProps {
  session: FocusSession
  actualMinutes: number
  onNewSession: () => void
  onGoToTasks: () => void
}

export function SessionSummary({ session, actualMinutes, onNewSession, onGoToTasks }: SessionSummaryProps) {
  const efficiency = Math.round((actualMinutes / session.planned_minutes) * 100)

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div>
        <div className="text-5xl mb-3">
          {session.completed ? '🎉' : '💪'}
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {session.completed ? 'Session complete!' : 'Good effort!'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {session.completed
            ? `You focused for ${actualMinutes} minutes.`
            : `You worked for ${actualMinutes} of ${session.planned_minutes} minutes.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        <div className="rounded-xl bg-gray-50 border border-gray-100 py-3">
          <p className="text-xl font-bold text-gray-900">{actualMinutes}</p>
          <p className="text-xs text-gray-400">minutes</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 py-3">
          <p className="text-xl font-bold text-indigo-600">{efficiency}%</p>
          <p className="text-xs text-gray-400">efficiency</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 py-3">
          <p className="text-xl font-bold text-gray-900 capitalize">{session.mode}</p>
          <p className="text-xs text-gray-400">mode</p>
        </div>
      </div>

      {session.task_title && (
        <p className="text-sm text-gray-500">
          Task: <span className="font-medium text-gray-800">{session.task_title}</span>
        </p>
      )}

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button onClick={onNewSession} className="w-full rounded-xl">
          <RotateCcw className="h-4 w-4" />
          Start another session
        </Button>
        <Button variant="outline" onClick={onGoToTasks} className="w-full rounded-xl">
          <Plus className="h-4 w-4" />
          Go to tasks
        </Button>
      </div>
    </div>
  )
}
