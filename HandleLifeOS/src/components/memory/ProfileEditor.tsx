'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserProfile, UpsertProfileInput, LifeStage } from '@/types/memory'

const LIFE_STAGES: { value: LifeStage; label: string }[] = [
  { value: 'student',      label: 'Student' },
  { value: 'early_career', label: 'Early career' },
  { value: 'mid_career',   label: 'Mid career' },
  { value: 'senior',       label: 'Senior professional' },
  { value: 'retired',      label: 'Retired' },
  { value: 'other',        label: 'Other' },
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED', 'CAD', 'AUD']

interface Props {
  profile: UserProfile | null
  onSaved: (profile: UserProfile) => void
}

export function ProfileEditor({ profile, onSaved }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [occupation, setOccupation] = useState(profile?.occupation ?? '')
  const [lifeStage, setLifeStage] = useState<LifeStage>(profile?.life_stage ?? 'mid_career')
  const [country, setCountry] = useState(profile?.country ?? 'IN')
  const [currency, setCurrency] = useState(profile?.currency ?? 'INR')
  const [timezone, setTimezone] = useState(profile?.timezone ?? 'Asia/Kolkata')
  const [goalsRaw, setGoalsRaw] = useState((profile?.goals ?? []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const goals = goalsRaw
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 10)

    const input: UpsertProfileInput = {
      display_name: displayName.trim() || undefined,
      occupation: occupation.trim() || undefined,
      life_stage: lifeStage,
      country: country.trim() || 'IN',
      currency,
      timezone: timezone.trim() || 'Asia/Kolkata',
      goals,
    }

    try {
      const res = await fetch('/api/memory/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      const data = await res.json()
      onSaved(data.profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Profile Memory</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          This information is used to personalise every AI response.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Display name</Label>
            <Input id="p-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-occ">Occupation</Label>
            <Input id="p-occ" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Software Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-stage">Life stage</Label>
            <select
              id="p-stage"
              value={lifeStage}
              onChange={(e) => setLifeStage(e.target.value as LifeStage)}
              className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LIFE_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-currency">Currency</Label>
            <select
              id="p-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-country">Country code</Label>
            <Input id="p-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="IN" maxLength={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-tz">Timezone</Label>
            <Input id="p-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Kolkata" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-goals">Life goals <span className="text-gray-400">(one per line, max 10)</span></Label>
          <textarea
            id="p-goals"
            value={goalsRaw}
            onChange={(e) => setGoalsRaw(e.target.value)}
            rows={4}
            placeholder={"Buy a house\nImprove fitness\nGrow my business"}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            Save profile
          </Button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
