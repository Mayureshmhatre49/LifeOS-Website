'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users } from 'lucide-react'

interface Props {
  onCreated: (familyId: string, name: string) => void
}

export function FamilySetup({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to create family'); setSaving(false); return }
    onCreated(json.family.id, json.family.name)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your family space</h1>
          <p className="text-gray-500">Give your household a name and start coordinating together.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="family-name">Family name</Label>
            <Input
              id="family-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Sharma Family"
              className="mt-1"
              maxLength={80}
              autoFocus
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
            {saving ? 'Creating…' : 'Create family space'}
          </Button>
        </form>
      </div>
    </div>
  )
}
