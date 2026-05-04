'use client'

import { TaskCard } from './task-card'
import type { Task } from '@/types/planner'

interface TaskListProps {
  tasks: Task[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  emptyMessage?: string
  compact?: boolean
}

export function TaskList({ tasks, onComplete, onDelete, onEdit, emptyMessage = 'No tasks yet', compact }: TaskListProps) {
  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">✨</div>
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          compact={compact}
        />
      ))}
    </div>
  )
}
