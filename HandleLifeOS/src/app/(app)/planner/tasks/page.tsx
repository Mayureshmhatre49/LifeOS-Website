'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/planner/task-list'
import { AddTaskModal } from '@/components/planner/add-task-modal'
import { Plus } from 'lucide-react'
import type { Task, TaskStatus, CreateTaskInput } from '@/types/planner'

const STATUS_TABS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

export default function AllTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const url = activeTab === 'all' ? '/api/tasks' : `/api/tasks?status=${activeTab}`
    const res = await fetch(url)
    if (res.ok) setTasks(await res.json())
    setLoading(false)
  }, [activeTab])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function handleSave(input: CreateTaskInput) {
    const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks'
    const res = await fetch(url, {
      method: editTask ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const data = await res.json()
      setTasks((prev) => editTask ? prev.map((t) => (t.id === data.id ? data : t)) : [data, ...prev])
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

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">All tasks</h1>
          <Button size="sm" onClick={() => { setEditTask(null); setModalOpen(true) }}>
            <Plus className="h-4 w-4" />Add
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={(t) => { setEditTask(t); setModalOpen(true) }}
            emptyMessage="No tasks here."
          />
        )}

        {/* Mobile FAB */}
        <div className="lg:hidden fixed bottom-6 right-6 z-30">
          <Button size="lg" onClick={() => { setEditTask(null); setModalOpen(true) }} className="rounded-2xl shadow-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AddTaskModal
        open={modalOpen}
        editTask={editTask}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
