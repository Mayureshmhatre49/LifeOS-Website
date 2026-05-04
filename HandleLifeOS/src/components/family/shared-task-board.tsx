'use client'

import { useState } from 'react'
import type { SharedTask, FamilyMember, SharedTaskCategory } from '@/types/family'
import { TASK_CATEGORY_LABELS } from '@/types/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, Trash2, PlusCircle, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = Object.entries(TASK_CATEGORY_LABELS) as [SharedTaskCategory, string][]

interface Props {
  tasks: SharedTask[]
  members: FamilyMember[]
  familyId: string
  userId: string
  onAdd: (data: { title: string; category?: SharedTaskCategory; assigned_to?: string; due_date?: string }) => Promise<void>
  onToggle: (id: string, status: 'pending' | 'done') => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SharedTaskBoard({ tasks, members, familyId, userId, onAdd, onToggle, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SharedTaskCategory>('misc')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const activeMembers = members.filter(m => m.status === 'active')
  const pending = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')

  function memberName(id?: string) {
    if (!id) return null
    const m = members.find(m => m.user_id === id)
    return m?.display_name ?? m?.invited_email?.split('@')[0] ?? 'Member'
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onAdd({ title: title.trim(), category, assigned_to: assignedTo || undefined, due_date: dueDate || undefined })
    setTitle(''); setCategory('misc'); setAssignedTo(''); setDueDate(''); setAdding(false)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Shared tasks <span className="text-gray-400 font-normal">({pending.length} open)</span>
        </h3>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          <PlusCircle className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
          <div>
            <Label className="text-xs">Task</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Buy groceries" className="mt-1" autoFocus required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value as SharedTaskCategory)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Assign to</Label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                <option value="">Unassigned</option>
                {activeMembers.map(m => (
                  <option key={m.id} value={m.user_id ?? ''}>{m.display_name ?? m.invited_email}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Due date (optional)</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 h-8 text-sm" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Adding…' : 'Add task'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {pending.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">No open tasks — nice work! 🎉</p>
          <button onClick={() => setAdding(true)} className="mt-2 text-sm text-indigo-600 font-medium">Add a task</button>
        </div>
      )}

      <ul className="space-y-2">
        {pending.map(task => (
          <li key={task.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 group">
            <button onClick={() => onToggle(task.id, 'done')} className="mt-0.5 shrink-0 text-gray-300 hover:text-green-500 transition-colors">
              <Circle className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{TASK_CATEGORY_LABELS[task.category]}</span>
                {task.due_date && <span className="text-xs text-orange-500">{task.due_date}</span>}
                {task.assigned_to && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-400">
                    <UserCircle className="h-3 w-3" />
                    {memberName(task.assigned_to)}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => onDelete(task.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <details>
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">{done.length} completed</summary>
          <ul className="mt-2 space-y-1.5">
            {done.slice(0, 5).map(task => (
              <li key={task.id} className="flex items-center gap-2 px-3 py-1.5 opacity-50">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-sm text-gray-600 line-through">{task.title}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
