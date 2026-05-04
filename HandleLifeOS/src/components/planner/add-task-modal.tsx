'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'
import type { Task, CreateTaskInput, TaskPriority, TaskCategory } from '@/types/planner'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
const CATEGORIES: TaskCategory[] = ['work', 'personal', 'health', 'finance', 'family', 'learning', 'errands', 'other']

interface AddTaskModalProps {
  open: boolean
  editTask?: Task | null
  defaultValues?: Partial<CreateTaskInput>
  onClose: () => void
  onSave: (data: CreateTaskInput) => Promise<void>
}

export function AddTaskModal({ open, editTask, defaultValues, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [category, setCategory] = useState<TaskCategory>('personal')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setNotes(editTask.notes ?? '')
      setDueDate(editTask.due_date ?? '')
      setPriority(editTask.priority)
      setCategory(editTask.category)
      setEstimatedMinutes(editTask.estimated_minutes?.toString() ?? '')
    } else if (defaultValues) {
      setTitle(defaultValues.title ?? '')
      setPriority(defaultValues.priority ?? 'medium')
      setCategory(defaultValues.category ?? 'personal')
    } else {
      setTitle(''); setNotes(''); setDueDate('')
      setPriority('medium'); setCategory('personal'); setEstimatedMinutes('')
    }
  }, [editTask, defaultValues, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        notes: notes.trim() || undefined,
        due_date: dueDate || undefined,
        priority,
        category,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {editTask ? 'Edit task' : 'Add task'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label htmlFor="task-title">Task *</Label>
            <div className="relative mt-1">
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="pr-10"
              />
              <div className="absolute right-1 top-1">
                <VoiceMicButton
                  onTranscript={setTitle}
                  className="h-8 w-8 bg-transparent hover:bg-gray-50 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <div className="mt-1 flex gap-1 flex-wrap">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                      priority === p
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-category">Category</Label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="task-time">Est. minutes</Label>
              <Input
                id="task-time"
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                min={1}
                max={480}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="task-notes">Notes</Label>
            <div className="relative mt-1">
              <textarea
                id="task-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-1 top-1">
                <VoiceMicButton
                  onTranscript={setNotes}
                  className="h-8 w-8 bg-transparent hover:bg-gray-50 text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!title.trim()} className="flex-1">
              {editTask ? 'Save changes' : 'Add task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
