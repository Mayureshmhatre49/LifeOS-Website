'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/types/planner'

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-gray-300',
}

function getWeekDays(anchor: Date): Date[] {
  const monday = new Date(anchor)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function WeekView() {
  const [anchor, setAnchor] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string>(toDateStr(new Date()))

  const weekDays = getWeekDays(anchor)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]

  useEffect(() => {
    setLoading(true)
    fetch('/api/tasks')
      .then((r) => r.ok ? r.json() : [])
      .then((data: Task[]) => setTasks(data))
      .finally(() => setLoading(false))
  }, [])

  function prevWeek() {
    const d = new Date(anchor)
    d.setDate(d.getDate() - 7)
    setAnchor(d)
  }

  function nextWeek() {
    const d = new Date(anchor)
    d.setDate(d.getDate() + 7)
    setAnchor(d)
  }

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!t.due_date) return acc
    acc[t.due_date] = [...(acc[t.due_date] ?? []), t]
    return acc
  }, {})

  const todayStr = toDateStr(new Date())
  const selectedTasks = tasksByDate[selectedDay] ?? []

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={prevWeek} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Previous week">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <button onClick={() => setAnchor(new Date())} className="rounded-lg px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 font-medium">
            Today
          </button>
          <button onClick={nextWeek} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Next week">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const ds = toDateStr(day)
          const dayTasks = tasksByDate[ds] ?? []
          const activeDayTasks = dayTasks.filter((t) => t.status !== 'done' && t.status !== 'skipped')
          const isToday = ds === todayStr
          const isSelected = ds === selectedDay

          return (
            <button
              key={ds}
              onClick={() => setSelectedDay(ds)}
              className={cn(
                'flex flex-col items-center rounded-xl p-2 transition-colors',
                isSelected ? 'bg-indigo-600 text-white' : isToday ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'
              )}
            >
              <span className="text-xs font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={cn('text-lg font-semibold leading-tight', isSelected ? 'text-white' : '')}>
                {day.getDate()}
              </span>
              <div className="flex gap-0.5 mt-1 min-h-[8px]">
                {activeDayTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className={cn('h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white/70' : PRIORITY_DOT[t.priority])} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Day tasks */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          <span className="ml-2 text-xs text-gray-400">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </span>
        </p>
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No tasks for this day</p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                <span className={cn('flex-1 text-sm', (task.status === 'done' || task.status === 'skipped') && 'line-through text-gray-400')}>
                  {task.title}
                </span>
                {task.estimated_minutes && (
                  <span className="text-xs text-gray-400">{task.estimated_minutes}m</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
