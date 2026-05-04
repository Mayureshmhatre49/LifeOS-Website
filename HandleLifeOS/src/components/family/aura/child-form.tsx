'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import type { AuraChildProfile, NeurodivergenceProfile, TherapyRecord } from '@/types/aura'
import { THERAPY_TYPE_LABELS } from '@/types/aura'
import { cn } from '@/lib/utils'

interface Props {
  onSave: (child: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
  initial?: Partial<AuraChildProfile>
}

type FormStep = 'basic' | 'conditions' | 'education' | 'therapies'

const STEPS: { id: FormStep; label: string }[] = [
  { id: 'basic',      label: 'Basic info' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'education',  label: 'Education' },
  { id: 'therapies',  label: 'Therapies' },
]

export function ChildForm({ onSave, onCancel, initial }: Props) {
  const [step, setStep] = useState<FormStep>('basic')

  // Basic
  const [name, setName]     = useState(initial?.full_name ?? '')
  const [dob, setDob]       = useState(initial?.date_of_birth ?? '')
  const [gender, setGender] = useState<AuraChildProfile['gender']>(initial?.gender)
  const [school, setSchool] = useState(initial?.school_name ?? '')
  const [grade, setGrade]   = useState(initial?.class_grade ?? '')

  // Conditions
  const [hasADHD, setHasADHD]   = useState(initial?.neurodivergence?.adhd ?? false)
  const [adhdType, setAdhdType]  = useState(initial?.neurodivergence?.adhd_type ?? '')
  const [hasASD, setHasASD]     = useState(initial?.neurodivergence?.asd ?? false)
  const [asdLevel, setAsdLevel]  = useState<number>(initial?.neurodivergence?.asd_support_level ?? 0)
  const [physConditions, setPhysConditions] = useState(initial?.physical_disabilities?.conditions.join(', ') ?? '')
  const [genConditions, setGenConditions]   = useState(initial?.genetic_conditions?.conditions.join(', ') ?? '')

  // Education
  const [planType, setPlanType] = useState<'iep' | '504' | 'none'>(initial?.education_plan?.plan_type ?? 'none')
  const [accommodations, setAccommodations] = useState(initial?.education_plan?.accommodations.join('\n') ?? '')
  const [goals, setGoals]                   = useState(initial?.education_plan?.goals.join('\n') ?? '')

  // Therapies
  const [therapies, setTherapies] = useState<TherapyRecord[]>(initial?.therapies ?? [])
  const [newTherapyType, setNewTherapyType] = useState<TherapyRecord['type']>('PT')
  const [newTherapyFreq, setNewTherapyFreq] = useState('')

  function addTherapy() {
    setTherapies(prev => [...prev, { type: newTherapyType, frequency: newTherapyFreq || undefined }])
    setNewTherapyFreq('')
  }

  function removeTherapy(i: number) {
    setTherapies(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (!name.trim() || !dob) return

    const payload: Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'> = {
      full_name: name.trim(),
      date_of_birth: dob,
      gender,
      school_name: school.trim() || undefined,
      class_grade: grade.trim() || undefined,
      milestone_records: initial?.milestone_records ?? [],
      medical_records: initial?.medical_records ?? [],
      medications: initial?.medications ?? [],
      growth_records: initial?.growth_records ?? [],
      therapies,
      neurodivergence: (hasADHD || hasASD)
        ? {
            adhd: hasADHD,
            adhd_type: hasADHD && adhdType ? adhdType as NeurodivergenceProfile['adhd_type'] : undefined,
            asd: hasASD,
            asd_support_level: hasASD && asdLevel ? asdLevel as 1 | 2 | 3 : undefined,
            other: [],
          }
        : undefined,
      physical_disabilities: physConditions.trim()
        ? {
            conditions: physConditions.split(',').map(s => s.trim()).filter(Boolean),
            therapies: [],
            environmental_mods: [],
          }
        : undefined,
      genetic_conditions: genConditions.trim()
        ? {
            conditions: genConditions.split(',').map(s => s.trim()).filter(Boolean),
            specialist_contacts: [],
          }
        : undefined,
      education_plan: planType !== 'none'
        ? {
            plan_type: planType,
            school_name: school.trim() || undefined,
            grade: grade.trim() || undefined,
            accommodations: accommodations.split('\n').map(s => s.trim()).filter(Boolean),
            goals: goals.split('\n').map(s => s.trim()).filter(Boolean),
          }
        : undefined,
    }

    onSave(payload)
  }

  const stepIdx = STEPS.findIndex(s => s.id === step)
  const isLast  = stepIdx === STEPS.length - 1
  const isFirst = stepIdx === 0
  const canAdvance = step === 'basic' ? (name.trim() && dob) : true

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5 shadow-sm">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                s.id === step
                  ? 'bg-indigo-600 text-white'
                  : i < stepIdx
                  ? 'bg-indigo-100 text-indigo-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-default',
              )}
            >
              {s.label}
            </button>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step: Basic */}
      {step === 'basic' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Child's full name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Aria Sharma"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Date of birth *</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Gender</label>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border capitalize',
                    gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600',
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">School</label>
              <input
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="School name"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Grade / Class</label>
              <input
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="e.g. Grade 2"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step: Conditions */}
      {step === 'conditions' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">Leave blank if not applicable. AURA uses this to personalise alerts and guidance.</p>

          {/* ADHD */}
          <div className="rounded-xl border border-gray-100 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasADHD} onChange={e => setHasADHD(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-gray-700">ADHD</span>
            </label>
            {hasADHD && (
              <select
                value={adhdType}
                onChange={e => setAdhdType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Type (optional)</option>
                <option value="inattentive">Inattentive</option>
                <option value="hyperactive_impulsive">Hyperactive-Impulsive</option>
                <option value="combined">Combined</option>
              </select>
            )}
          </div>

          {/* ASD */}
          <div className="rounded-xl border border-gray-100 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasASD} onChange={e => setHasASD(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Autism Spectrum Disorder (ASD)</span>
            </label>
            {hasASD && (
              <div className="flex gap-2">
                {([1, 2, 3] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setAsdLevel(l)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium border',
                      asdLevel === l ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600',
                    )}
                  >
                    Level {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Physical */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Physical disabilities (comma-separated)</label>
            <input
              value={physConditions}
              onChange={e => setPhysConditions(e.target.value)}
              placeholder="e.g. Cerebral Palsy, Spina Bifida"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Genetic */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Genetic conditions (comma-separated)</label>
            <input
              value={genConditions}
              onChange={e => setGenConditions(e.target.value)}
              placeholder="e.g. Down Syndrome, Fragile X"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      )}

      {/* Step: Education */}
      {step === 'education' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Education plan</label>
            <div className="flex gap-2">
              {(['none', 'iep', '504'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPlanType(p)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border uppercase',
                    planType === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600',
                  )}
                >
                  {p === 'none' ? 'None' : p}
                </button>
              ))}
            </div>
          </div>

          {planType !== 'none' && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Accommodations (one per line)
                </label>
                <textarea
                  value={accommodations}
                  onChange={e => setAccommodations(e.target.value)}
                  placeholder="e.g. Extended time on tests&#10;Preferential seating&#10;Breaks every 30 minutes"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              {planType === 'iep' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    IEP goals (one per line)
                  </label>
                  <textarea
                    value={goals}
                    onChange={e => setGoals(e.target.value)}
                    placeholder="e.g. Read 50 words per minute by December&#10;Follow 3-step instructions independently"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step: Therapies */}
      {step === 'therapies' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {therapies.map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm">
                <span className="flex-1 text-gray-700">
                  {THERAPY_TYPE_LABELS[t.type]}
                  {t.frequency && <span className="text-gray-400 ml-1">· {t.frequency}</span>}
                </span>
                <button onClick={() => removeTherapy(i)} className="text-gray-300 hover:text-red-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={newTherapyType}
              onChange={e => setNewTherapyType(e.target.value as TherapyRecord['type'])}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {(Object.entries(THERAPY_TYPE_LABELS) as [TherapyRecord['type'], string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              value={newTherapyFreq}
              onChange={e => setNewTherapyFreq(e.target.value)}
              placeholder="Frequency (e.g. 2x/week)"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={addTherapy}
              className="rounded-xl bg-indigo-50 text-indigo-600 px-3 py-2 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400">Add all ongoing therapies. You can edit these later.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={isFirst ? onCancel : () => setStep(STEPS[stepIdx - 1].id)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {isFirst ? 'Cancel' : '← Back'}
        </button>
        {isLast ? (
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !dob}
            size="sm"
          >
            Save child profile
          </Button>
        ) : (
          <Button
            onClick={() => setStep(STEPS[stepIdx + 1].id)}
            disabled={!canAdvance}
            size="sm"
            variant="outline"
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  )
}
