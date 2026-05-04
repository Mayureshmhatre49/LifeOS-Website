'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { WeeklyStats } from '@/types/focus'

function hourLabel(h: number): string {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

export function WeeklyInsights() {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/focus/stats')
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  }

  if (!stats || stats.sessions_completed === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm font-medium text-gray-600">No data yet</p>
        <p className="text-xs text-gray-400 mt-1">Complete your first focus session to see insights.</p>
      </div>
    )
  }

  // Build last 7 days bar chart data
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  const maxMinutes = Math.max(...days.map((d) => stats.daily_minutes[d] ?? 0), 1)

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">This week</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Sessions done', value: stats.sessions_completed, color: 'text-indigo-600' },
          { label: 'Minutes focused', value: `${stats.total_minutes}m`, color: 'text-gray-900' },
          { label: 'Day streak', value: `${stats.streak_days}🔥`, color: 'text-orange-500' },
          { label: 'Best hour', value: stats.best_hour != null ? hourLabel(stats.best_hour) : '—', color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">Daily focus (minutes)</p>
        <div className="flex items-end gap-1.5 h-20">
          {days.map((day) => {
            const mins = stats.daily_minutes[day] ?? 0
            const heightPct = (mins / maxMinutes) * 100
            const isToday = day === new Date().toISOString().slice(0, 10)
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end" style={{ height: '64px' }}>
                  <div
                    className={cn('w-full rounded-t-md transition-all', isToday ? 'bg-indigo-500' : 'bg-indigo-200')}
                    style={{ height: `${Math.max(heightPct, mins > 0 ? 8 : 0)}%` }}
                    title={`${mins} min`}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion rate */}
      {stats.sessions_completed + stats.sessions_abandoned > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Completion rate</span>
            <span>{Math.round((stats.sessions_completed / (stats.sessions_completed + stats.sessions_abandoned)) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(stats.sessions_completed / (stats.sessions_completed + stats.sessions_abandoned)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {stats.sessions_completed} completed · {stats.sessions_abandoned} abandoned
          </p>
        </div>
      )}
    </div>
  )
}
