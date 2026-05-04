'use client'

import { useState } from 'react'
import type { ElderProfile, ChildProfile } from '@/types/family'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, GraduationCap, PlusCircle, Trash2 } from 'lucide-react'

interface ElderCardsProps {
  elders: ElderProfile[]
  canManage: boolean
  onAdd: (data: { full_name: string; medicines?: string[]; conditions?: string; emergency_contact?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ElderCards({ elders, canManage, onAdd, onDelete }: ElderCardsProps) {
  const [adding, setAdding] = useState(false)
  const [fullName, setFullName] = useState('')
  const [medicines, setMedicines] = useState('')
  const [conditions, setConditions] = useState('')
  const [emergency, setEmergency] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    const meds = medicines.split(',').map(s => s.trim()).filter(Boolean)
    await onAdd({ full_name: fullName.trim(), medicines: meds.length ? meds : undefined, conditions: conditions || undefined, emergency_contact: emergency || undefined })
    setFullName(''); setMedicines(''); setConditions(''); setEmergency(''); setAdding(false)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-gray-700">Elders ({elders.length})</h3>
        </div>
        {canManage && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <PlusCircle className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-orange-100 bg-orange-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Full name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Grandpa Sharma" className="mt-1" autoFocus required />
            </div>
            <div>
              <Label className="text-xs">Medicines (comma-separated)</Label>
              <Input value={medicines} onChange={e => setMedicines(e.target.value)} placeholder="Metformin, Aspirin" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Emergency contact</Label>
              <Input value={emergency} onChange={e => setEmergency(e.target.value)} placeholder="+91 98765 43210" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Add elder'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {elders.map(e => (
          <div key={e.id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4 group relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{e.full_name}</p>
                {e.medicines && e.medicines.length > 0 && (
                  <p className="text-xs text-orange-700 mt-1">💊 {e.medicines.join(', ')}</p>
                )}
                {e.conditions && <p className="text-xs text-gray-500 mt-0.5">{e.conditions}</p>}
                {e.emergency_contact && <p className="text-xs text-gray-400 mt-1">📞 {e.emergency_contact}</p>}
              </div>
              {canManage && (
                <button onClick={() => onDelete(e.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChildCardsProps {
  children: ChildProfile[]
  canManage: boolean
  onAdd: (data: { full_name: string; age?: number; school_name?: string; class_grade?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ChildCards({ children, canManage, onAdd, onDelete }: ChildCardsProps) {
  const [adding, setAdding] = useState(false)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    await onAdd({ full_name: fullName.trim(), age: age ? parseInt(age) : undefined, school_name: school || undefined, class_grade: grade || undefined })
    setFullName(''); setAge(''); setSchool(''); setGrade(''); setAdding(false)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-gray-700">Children ({children.length})</h3>
        </div>
        {canManage && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <PlusCircle className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-pink-100 bg-pink-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Full name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Aryan" className="mt-1" autoFocus required />
            </div>
            <div>
              <Label className="text-xs">Age</Label>
              <Input type="number" min="1" max="17" value={age} onChange={e => setAge(e.target.value)} placeholder="8" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Class / Grade</Label>
              <Input value={grade} onChange={e => setGrade(e.target.value)} placeholder="Class 3" className="mt-1 h-8 text-sm" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">School name</Label>
              <Input value={school} onChange={e => setSchool(e.target.value)} placeholder="DPS Bangalore" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Add child'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {children.map(c => (
          <div key={c.id} className="rounded-2xl border border-pink-100 bg-pink-50 p-4 group relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.full_name}</p>
                {c.age && <p className="text-xs text-gray-500 mt-0.5">Age {c.age}{c.class_grade ? ` · ${c.class_grade}` : ''}</p>}
                {c.school_name && <p className="text-xs text-gray-400 mt-0.5">🏫 {c.school_name}</p>}
              </div>
              {canManage && (
                <button onClick={() => onDelete(c.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
