'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

interface Props {
  userName: string
  taskStreak: number
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString(): string {
  return new Date().toLocaleDateString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function GreetingHeader({ userName, taskStreak }: Props) {
  const [hour, setHour] = useState(12)
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    setHour(now.getHours())
    setDateStr(getDateString())
  }, [])

  const greeting = getGreeting(hour)

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {greeting}, {userName}.
        </h1>
        {dateStr && (
          <p className="text-sm text-gray-400 mt-0.5">{dateStr}</p>
        )}
      </div>

      {taskStreak >= 2 && (
        <div className="flex items-center gap-1.5 rounded-2xl bg-orange-50 border border-orange-100 px-3 py-2 shrink-0">
          <Flame className="h-4 w-4 text-orange-500" />
          <div className="text-right">
            <p className="text-sm font-bold text-orange-600 leading-none">{taskStreak}</p>
            <p className="text-xs text-orange-400 leading-none mt-0.5">day streak</p>
          </div>
        </div>
      )}
    </div>
  )
}
