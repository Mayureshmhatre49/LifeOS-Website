'use client'

import { Button } from '@/components/ui/button'
import type { Task } from '@/types/planner'

interface OverwhelmModeProps {
  top3: Task[]
  totalCount: number
  onComplete: (id: string) => void
  onExit: () => void
}

export function OverwhelmMode({ top3, totalCount, onComplete, onExit }: OverwhelmModeProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">Focus on just 3 things</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            You have {totalCount} tasks — that's a lot. Let's start with what matters most.
          </p>
        </div>
        <button
          onClick={onExit}
          className="text-xs text-indigo-600 hover:underline shrink-0 mt-0.5"
        >
          Show all
        </button>
      </div>

      <div className="space-y-2.5">
        {top3.map((task, i) => (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-xl bg-white border border-gray-200 p-3"
          >
            <button
              onClick={() => onComplete(task.id)}
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-indigo-300 hover:border-indigo-600 hover:bg-indigo-50 transition-colors font-semibold text-xs text-indigo-600"
              aria-label="Mark complete"
            >
              {i + 1}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              {task.estimated_minutes && (
                <p className="text-xs text-gray-400 mt-0.5">~{task.estimated_minutes} min</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Just these 3. You've got this. 🌱
      </p>
    </div>
  )
}
