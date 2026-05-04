'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserProfile, UpsertProfileInput, LifeStage } from '@/types/memory'

const LIFE_STAGES: { value: LifeStage; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'early_career', label: 'Early Career (0–5 yrs)' },
  { value: 'mid_career', label: 'Mid Career (5–15 yrs)' },
  { value: 'senior', label: 'Senior / Leadership' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' },
]

interface Props {
  profile: UserProfile | null
  onSave: (data: UpsertProfileInput) => Promise<void>
}

export function ProfileForm({ profile, onSave }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<UpsertProfileInput>({
    display_name: profile?.display_name ?? '',
    occupation: profile?.occupation ?? '',
    life_stage: profile?.life_stage ?? undefined,
    country: profile?.country ?? 'IN',
    currency: profile?.currency ?? 'INR',
    timezone: profile?.timezone ?? 'Asia/Kolkata',
    goals: profile?.goals ?? [],
    memory_enabled: profile?.memory_enabled ?? true,
  })
  const [goalsText, setGoalsText] = useState((profile?.goals ?? []).join('\n'))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const goals = goalsText.split('\n').map((g) => g.trim()).filter(Boolean)
      await onSave({ ...form, goals })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={form.display_name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder="How should the AI call you?"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={form.occupation ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
            placeholder="e.g. Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="life_stage">Life stage</Label>
          <select
            id="life_stage"
            value={form.life_stage ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, life_stage: e.target.value as LifeStage || undefined }))}
            className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select…</option>
            {LIFE_STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country ?? 'IN'}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase().slice(0, 2) }))}
            placeholder="IN"
            maxLength={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={form.currency ?? 'INR'}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase().slice(0, 3) }))}
            placeholder="INR"
            maxLength={3}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="goals">Goals <span className="text-gray-400 font-normal">(one per line)</span></Label>
        <textarea
          id="goals"
          rows={3}
          value={goalsText}
          onChange={(e) => setGoalsText(e.target.value)}
          placeholder="e.g. Buy a home by 2027&#10;Get promoted to Staff Engineer&#10;Build an emergency fund"
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
      </Button>
    </form>
  )
}
