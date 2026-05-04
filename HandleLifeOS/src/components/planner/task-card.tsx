'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Trash2, Pencil, Clock, Calendar, ChevronDown } from 'lucide-react'
import type { Task } from '@/types/planner'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
}

const CATEGORY_ICONS: Record<string, string> = {
  work: '💼', personal: '🌿', health: '❤️', finance: '💰',
  family: '👨‍👩‍👧', learning: '📚', errands: '🛒', other: '📌',
}

interface TaskCardProps {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  compact?: boolean
}

export function TaskCard({ task, onComplete, onDelete, onEdit, compact = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isDone = task.status === 'done' || task.status === 'skipped'

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border bg-white p-3 transition-all duration-150',
        isDone ? 'opacity-60 border-gray-100' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      )}
    >
      {/* Complete checkbox */}
      <button
        onClick={() => !isDone && onComplete(task.id)}
        disabled={isDone}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isDone
            ? 'border-green-400 bg-green-400'
            : 'border-gray-300 hover:border-indigo-500'
        )}
        aria-label={isDone ? 'Completed' : 'Mark complete'}
      >
        {isDone && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('text-sm font-medium leading-snug', isDone && 'line-through text-gray-400')}>
            {CATEGORY_ICONS[task.category] && (
              <span className="mr-1.5 text-xs">{CATEGORY_ICONS[task.category]}</span>
            )}
            {task.title}
          </span>
          <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-medium', PRIORITY_COLORS[task.priority])}>
            {task.priority}
          </span>
        </div>

        {/* Meta row */}
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {task.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{task.estimated_minutes}m
              </span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{task.due_date}
              </span>
            )}
            {task.notes && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="flex items-center gap-0.5 text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
                notes
              </button>
            )}
          </div>
        )}

        {expanded && task.notes && (
          <p className="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-2">{task.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(task.id)}
          className="hover:text-red-600 hover:bg-red-50"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
