'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { TaskList } from './task-list'
import { AddTaskModal } from './add-task-modal'
import { OverwhelmMode } from './overwhelm-mode'
import { AIPlanPanel } from './ai-plan-panel'
import { Plus, Sparkles } from 'lucide-react'
import type { Task, CreateTaskInput } from '@/types/planner'

const OVERWHELM_THRESHOLD = 6

export function TodayPlanner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [overwhelmMode, setOverwhelmMode] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const [todayStr] = useState(() => new Date().toISOString().slice(0, 10))

  const activeTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress')
  const completedTasks = tasks.filter((t) => t.status === 'done' || t.status === 'skipped')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks?due_date=${todayStr}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
        if (data.filter((t: Task) => t.status === 'todo').length >= OVERWHELM_THRESHOLD) {
          setOverwhelmMode(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [todayStr])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function handleSaveTask(input: CreateTaskInput) {
    const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks'
    const method = editTask ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, due_date: input.due_date ?? todayStr }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) =>
        editTask ? prev.map((t) => (t.id === updated.id ? updated : t)) : [updated, ...prev]
      )
    }
    setEditTask(null)
  }

  async function handleComplete(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function handleEdit(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  const top3 = activeTasks.slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Today</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAiOpen((p) => !p)}>
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </Button>
          <Button size="sm" onClick={() => { setEditTask(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* AI Panel */}
      {aiOpen && (
        <AIPlanPanel
          tasks={activeTasks}
          onPrioritized={fetchTasks}
        />
      )}

      {/* Overwhelm mode */}
      {overwhelmMode && activeTasks.length >= OVERWHELM_THRESHOLD ? (
        <OverwhelmMode
          top3={top3}
          totalCount={activeTasks.length}
          onComplete={handleComplete}
          onExit={() => setOverwhelmMode(false)}
        />
      ) : (
        <>
          {/* Progress bar */}
          {tasks.length > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{completedTasks.length} of {tasks.length} done</span>
                <span>{Math.round((completedTasks.length / tasks.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Active tasks */}
          <TaskList
            tasks={activeTasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            emptyMessage="All clear! Add something to do today."
          />

          {/* Completed */}
          {completedTasks.length > 0 && (
            <details className="group">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                {completedTasks.length} completed
              </summary>
              <div className="mt-2">
                <TaskList
                  tasks={completedTasks}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  compact
                />
              </div>
            </details>
          )}
        </>
      )}

      {/* Quick add button for mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <Button
          size="lg"
          onClick={() => { setEditTask(null); setModalOpen(true) }}
          className="rounded-2xl shadow-lg"
          aria-label="Add task"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <AddTaskModal
        open={modalOpen}
        editTask={editTask}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSave={handleSaveTask}
      />
    </div>
  )
}
