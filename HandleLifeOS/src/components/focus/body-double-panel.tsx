'use client'

import { useState, useEffect } from 'react'
import type { BodyDoubleMessage } from '@/types/focus'

interface BodyDoublePanelProps {
  taskTitle: string
  sessionId: string
  minutesElapsed: number
  minutesRemaining: number
  completed?: boolean
  abandoned?: boolean
}

export function BodyDoublePanel({
  taskTitle,
  sessionId,
  minutesElapsed,
  minutesRemaining,
  completed,
  abandoned,
}: BodyDoublePanelProps) {
  const [message, setMessage] = useState<BodyDoubleMessage | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchMessage(type: BodyDoubleMessage['type']) {
    setLoading(true)
    try {
      const res = await fetch('/api/focus/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'body_double',
          type,
          task_title: taskTitle,
          minutes_elapsed: minutesElapsed,
          minutes_remaining: minutesRemaining,
        }),
      })
      if (res.ok) setMessage(await res.json())
    } finally {
      setLoading(false)
    }
  }

  // Fetch start message on mount
  useEffect(() => {
    fetchMessage('start')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check-ins at 5 and 15 minutes
  useEffect(() => {
    if (minutesElapsed === 5 || minutesElapsed === 15) {
      fetchMessage('checkin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutesElapsed])

  // Completion/abandon
  useEffect(() => {
    if (completed) fetchMessage('complete')
    if (abandoned) fetchMessage('restart')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, abandoned])

  if (!message && !loading) return null

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-indigo-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent" />
          <span>Life OS is here with you...</span>
        </div>
      ) : message ? (
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{message.message}</p>
          {message.suggestion && (
            <p className="mt-1.5 text-xs text-indigo-600 font-medium">→ {message.suggestion}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
