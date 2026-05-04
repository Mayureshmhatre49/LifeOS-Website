'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, ChevronRight, Brain, Target, User } from 'lucide-react'

type LifeStage = 'student' | 'early_career' | 'mid_career' | 'senior' | 'retired' | 'other'

const LIFE_STAGES: { value: LifeStage; label: string; emoji: string }[] = [
  { value: 'student', label: 'Student', emoji: '📚' },
  { value: 'early_career', label: 'Early career', emoji: '🚀' },
  { value: 'mid_career', label: 'Mid career', emoji: '💼' },
  { value: 'senior', label: 'Senior professional', emoji: '🏆' },
  { value: 'retired', label: 'Retired', emoji: '🌅' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

const GOAL_SUGGESTIONS = [
  'Stay organised daily',
  'Save more money',
  'Focus better at work',
  'Protect family finances',
  'Build healthy habits',
  'Manage family tasks',
  'Reduce stress',
  'Plan for the future',
]

const STEPS = [
  { id: 1, title: 'Welcome', icon: User },
  { id: 2, title: 'Your context', icon: Brain },
  { id: 3, title: 'Your goals', icon: Target },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1
  const [displayName, setDisplayName] = useState(session?.user?.name ?? '')

  // Step 2
  const [occupation, setOccupation] = useState('')
  const [lifeStage, setLifeStage] = useState<LifeStage | ''>('')

  // Step 3
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState('')

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  async function handleFinish() {
    setSaving(true)
    const goals = [...selectedGoals, ...(customGoal.trim() ? [customGoal.trim()] : [])]
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName || undefined,
          occupation: occupation || undefined,
          life_stage: lifeStage || undefined,
          goals: goals.length > 0 ? goals : undefined,
          onboarding_completed: true,
        }),
      })
    } catch {}
    router.push('/chat')
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    step > s.id
                      ? 'bg-indigo-600 text-white'
                      : step === s.id
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-24 mx-2 ${step > s.id ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl mb-4">👋</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Life OS!</h1>
                <p className="text-gray-500">
                  Let&apos;s take 2 minutes to set up your AI assistant so it can give you personalised advice.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button className="w-full gap-2" onClick={() => setStep(2)}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
              <button
                onClick={() => router.push('/chat')}
                className="w-full text-sm text-gray-400 hover:text-gray-600 text-center"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 2: Context */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
                <p className="text-sm text-gray-500">
                  This helps the AI tailor its advice to your situation.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occupation">What do you do?</Label>
                <Input
                  id="occupation"
                  placeholder="e.g. Software engineer, Teacher, Student…"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Life stage</Label>
                <div className="grid grid-cols-2 gap-2">
                  {LIFE_STAGES.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      onClick={() => setLifeStage(value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                        lifeStage === value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">What do you want to achieve?</h2>
                <p className="text-sm text-gray-500">Pick all that apply. You can always update these later.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {GOAL_SUGGESTIONS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                      selectedGoals.includes(goal)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customGoal">Anything else?</Label>
                <Input
                  id="customGoal"
                  placeholder="Add your own goal…"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 gap-2"
                  loading={saving}
                >
                  Start using Life OS 🎉
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
