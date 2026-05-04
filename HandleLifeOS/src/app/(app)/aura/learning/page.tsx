'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, GraduationCap, Plus, Trash2, BookOpen, Heart, School, Edit3,
  Target, Calendar,
} from 'lucide-react'
import type {
  AuraChildProfile, LearningArea, LearningLevel, LearningSkill, Interest,
  SchoolProgress, LearningProfile, IEPGoal, IEPGoalArea, EducationPlan,
} from '@/types/aura'
import { LEARNING_AREA_LABELS, LEARNING_LEVEL_LABELS, IEP_GOAL_AREA_LABELS } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { cn } from '@/lib/utils'

type Tab = 'school' | 'goals' | 'skills' | 'interests'

export default function AuraLearningPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('school')

  useEffect(() => {
    fetch('/api/family/aura/profiles')
      .then(r => r.json())
      .then(({ profiles }) => {
        const list: AuraChildProfile[] = profiles ?? []
        setProfiles(list)
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        setSelectedId(valid ? stored : (list[0]?.id ?? null))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  async function persist(updated: AuraChildProfile) {
    setProfiles(prev => prev.map(c => c.id === updated.id ? updated : c))
    await fetch(`/api/family/aura/profiles/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
  }

  function ensureLearning(child: AuraChildProfile): LearningProfile {
    return child.learning ?? { skills: [], interests: [] }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const selected = profiles.find(c => c.id === selectedId) ?? null

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Learning</h1>
        </div>
      </div>

      <AuraChildSwitcher
        children={profiles}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      {!selected ? (
        <EmptyChild />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-0.5">
            {(['school', 'goals', 'skills', 'interests'] as const).map(t => {
              const goalCount = selected.education_plan?.iep_goals?.length ?? 0
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                    tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500',
                  )}
                >
                  {t === 'goals' ? `IEP Goals${goalCount ? ` (${goalCount})` : ''}` : t}
                  {t === 'skills' && (selected.learning?.skills?.length ?? 0) > 0 && ` (${selected.learning!.skills.length})`}
                  {t === 'interests' && (selected.learning?.interests?.length ?? 0) > 0 && ` (${selected.learning!.interests.length})`}
                </button>
              )
            })}
          </div>

          {tab === 'school' && (
            <SchoolTab child={selected} ensureLearning={ensureLearning} onChange={persist} />
          )}
          {tab === 'goals' && (
            <GoalsTab child={selected} onChange={persist} />
          )}
          {tab === 'skills' && (
            <SkillsTab child={selected} ensureLearning={ensureLearning} onChange={persist} />
          )}
          {tab === 'interests' && (
            <InterestsTab child={selected} ensureLearning={ensureLearning} onChange={persist} />
          )}
        </>
      )}
    </div>
  )
}

// ── IEP Goals tab ──────────────────────────────────────────────────────────────
function GoalsTab({ child, onChange }: {
  child: AuraChildProfile
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const plan: EducationPlan = child.education_plan ?? { plan_type: 'none', accommodations: [], goals: [] }
  const goals = plan.iep_goals ?? []

  const [showForm, setShowForm] = useState(false)
  const [area, setArea] = useState<IEPGoalArea>('academic')
  const [goalText, setGoalText] = useState('')
  const [baseline, setBaseline] = useState('')
  const [target, setTarget] = useState('')
  const [notes, setNotes] = useState('')

  // Annual review date editor
  const [reviewEditing, setReviewEditing] = useState(false)
  const [nextReview, setNextReview] = useState(plan.next_review_date ?? '')

  async function handleAdd() {
    if (!goalText.trim()) return
    const g: IEPGoal = {
      id: crypto.randomUUID(),
      area, goal: goalText.trim(),
      baseline: baseline || undefined,
      target: target || undefined,
      progress_pct: 0,
      last_updated: new Date().toISOString(),
      notes: notes || undefined,
    }
    await onChange({
      ...child,
      education_plan: { ...plan, iep_goals: [...goals, g] },
    })
    setGoalText(''); setBaseline(''); setTarget(''); setNotes(''); setArea('academic')
    setShowForm(false)
  }

  async function updateProgress(id: string, pct: number) {
    await onChange({
      ...child,
      education_plan: {
        ...plan,
        iep_goals: goals.map(g => g.id === id ? { ...g, progress_pct: pct, last_updated: new Date().toISOString() } : g),
      },
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return
    await onChange({
      ...child,
      education_plan: { ...plan, iep_goals: goals.filter(g => g.id !== id) },
    })
  }

  async function saveReview() {
    await onChange({
      ...child,
      education_plan: { ...plan, next_review_date: nextReview || undefined },
    })
    setReviewEditing(false)
  }

  const overallProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progress_pct, 0) / goals.length)
    : 0

  // Review reminder
  const reviewSoon = (() => {
    if (!plan.next_review_date) return false
    const days = Math.floor((new Date(plan.next_review_date).getTime() - Date.now()) / 86_400_000)
    return days <= 30 && days >= -7
  })()

  return (
    <>
      {/* Review status */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Annual review</p>
            {plan.next_review_date && !reviewEditing ? (
              <p className={cn('text-sm font-bold mt-1', reviewSoon ? 'text-amber-700' : 'text-emerald-800')}>
                Next: {new Date(plan.next_review_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {reviewSoon && <span className="text-[10px] font-bold ml-2 px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">UPCOMING</span>}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">No review date set</p>
            )}
          </div>
          {!reviewEditing ? (
            <button onClick={() => setReviewEditing(true)} className="text-xs font-bold text-emerald-700 underline">
              {plan.next_review_date ? 'Change' : 'Set'}
            </button>
          ) : (
            <div className="flex gap-1">
              <input type="date" value={nextReview} onChange={e => setNextReview(e.target.value)}
                className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1" />
              <button onClick={saveReview} className="text-xs font-bold text-white bg-emerald-600 px-2 py-1 rounded-lg">
                Save
              </button>
            </div>
          )}
        </div>

        {goals.length > 0 && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-emerald-700">Overall progress</span>
              <span className="text-xs font-bold text-emerald-800">{overallProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/60 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Add form */}
      {showForm ? (
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">New IEP goal</p>
          <Field label="Area">
            <select value={area} onChange={e => setArea(e.target.value as IEPGoalArea)} className={inputCls}>
              {(Object.entries(IEP_GOAL_AREA_LABELS) as [IEPGoalArea, typeof IEP_GOAL_AREA_LABELS[IEPGoalArea]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Goal (measurable) *">
            <textarea value={goalText} onChange={e => setGoalText(e.target.value)} rows={2}
              placeholder="e.g., Read aloud 50 sight words with 90% accuracy in 4/5 trials"
              className={cn(inputCls, 'resize-none')} />
          </Field>
          <Field label="Current baseline">
            <input value={baseline} onChange={e => setBaseline(e.target.value)}
              placeholder="e.g., reads 20 sight words with 70% accuracy" className={inputCls} />
          </Field>
          <Field label="Target / criterion">
            <input value={target} onChange={e => setTarget(e.target.value)}
              placeholder="e.g., 50 words, 90%, 4/5 trials" className={inputCls} />
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!goalText.trim()}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
              Add goal
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 text-sm font-semibold hover:bg-emerald-50">
          <Plus className="h-4 w-4" />
          Add IEP goal
        </button>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <Target className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No IEP goals tracked yet.</p>
          <p className="text-xs text-gray-400 mt-1">Track measurable goals so you can review progress before the annual meeting.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map(g => {
            const cfg = IEP_GOAL_AREA_LABELS[g.area]
            return (
              <div key={g.id} className={cn('rounded-2xl border p-3', cfg.bg)}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white border', cfg.color)}>
                    {cfg.label}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 flex-1 leading-snug">{g.goal}</p>
                  <button onClick={() => handleDelete(g.id)} className="p-1 rounded text-gray-300 hover:text-red-400 shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {g.baseline && <p className="text-[11px] text-gray-600"><span className="font-semibold">Baseline:</span> {g.baseline}</p>}
                {g.target && <p className="text-[11px] text-gray-600"><span className="font-semibold">Target:</span> {g.target}</p>}
                {g.notes && <p className="text-[11px] text-gray-500 mt-1">{g.notes}</p>}

                {/* Progress slider */}
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-500">Progress</span>
                    <span className={cn('text-[11px] font-bold', cfg.color)}>{g.progress_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0} max={100} step={5}
                    value={g.progress_pct}
                    onChange={e => updateProgress(g.id, parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Last updated {new Date(g.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── School tab ─────────────────────────────────────────────────────────────────
function SchoolTab({ child, ensureLearning, onChange }: {
  child: AuraChildProfile
  ensureLearning: (c: AuraChildProfile) => LearningProfile
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const learning = ensureLearning(child)
  const school = learning.school
  const [editing, setEditing] = useState(!school)

  // Form state
  const [grade, setGrade] = useState(school?.current_grade ?? child.class_grade ?? '')
  const [year, setYear] = useState(school?.school_year ?? '')
  const [teacher, setTeacher] = useState(school?.teacher_name ?? '')
  const [iep, setIep] = useState<'iep' | '504' | 'none'>(school?.iep_status ?? 'none')
  const [report, setReport] = useState(school?.recent_report ?? '')
  const [strengths, setStrengths] = useState<string[]>(school?.strengths ?? [])
  const [challenges, setChallenges] = useState<string[]>(school?.challenges ?? [])
  const [strInput, setStrInput] = useState('')
  const [chalInput, setChalInput] = useState('')

  function addStrength() {
    if (!strInput.trim()) return
    setStrengths(prev => [...prev, strInput.trim()])
    setStrInput('')
  }
  function addChallenge() {
    if (!chalInput.trim()) return
    setChallenges(prev => [...prev, chalInput.trim()])
    setChalInput('')
  }

  async function handleSave() {
    const updated: SchoolProgress = {
      current_grade: grade || undefined,
      school_year: year || undefined,
      teacher_name: teacher || undefined,
      iep_status: iep,
      recent_report: report || undefined,
      strengths,
      challenges,
      last_review_date: new Date().toISOString().slice(0, 10),
    }
    await onChange({
      ...child,
      learning: { ...learning, school: updated },
    })
    setEditing(false)
  }

  if (!editing && school) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <School className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">
                {school.current_grade ?? 'Grade not set'}
                {school.school_year && <span className="text-xs text-gray-400 ml-2">({school.school_year})</span>}
              </p>
              {school.teacher_name && <p className="text-xs text-gray-500 mt-0.5">Teacher: {school.teacher_name}</p>}
              {school.iep_status && school.iep_status !== 'none' && (
                <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {school.iep_status === 'iep' ? 'IEP' : '504 Plan'}
                </span>
              )}
            </div>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {school.recent_report && (
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recent report</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{school.recent_report}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <ListCard title="Strengths" items={school.strengths} color="emerald" />
          <ListCard title="Challenges" items={school.challenges} color="amber" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
      <p className="text-sm font-bold text-gray-800">{school ? 'Edit school details' : 'Add school details'}</p>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Grade / class">
          <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="3rd grade" className={inputCls} />
        </Field>
        <Field label="School year">
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="2025-26" className={inputCls} />
        </Field>
      </div>

      <Field label="Teacher">
        <input value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="Mrs. Patel" className={inputCls} />
      </Field>

      <Field label="Plan type">
        <select value={iep} onChange={e => setIep(e.target.value as typeof iep)} className={inputCls}>
          <option value="none">No formal plan</option>
          <option value="iep">IEP (Individualised Education Plan)</option>
          <option value="504">504 Plan</option>
        </select>
      </Field>

      <Field label="Recent report / progress notes">
        <textarea value={report} onChange={e => setReport(e.target.value)} rows={3} placeholder="Latest teacher feedback or report card highlights…" className={cn(inputCls, 'resize-none')} />
      </Field>

      {/* Strengths */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Strengths</p>
        <div className="flex gap-2 mb-2">
          <input value={strInput} onChange={e => setStrInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStrength() }}} placeholder="e.g., Great memory" className={inputCls} />
          <button onClick={addStrength} className="px-3 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200">+</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {strengths.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1">
              {s}
              <button onClick={() => setStrengths(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-emerald-900">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Challenges</p>
        <div className="flex gap-2 mb-2">
          <input value={chalInput} onChange={e => setChalInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChallenge() }}} placeholder="e.g., Struggles with writing" className={inputCls} />
          <button onClick={addChallenge} className="px-3 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200">+</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {challenges.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-center gap-1">
              {c}
              <button onClick={() => setChallenges(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-amber-900">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          Save
        </button>
        {school && (
          <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ── Skills tab ─────────────────────────────────────────────────────────────────
function SkillsTab({ child, ensureLearning, onChange }: {
  child: AuraChildProfile
  ensureLearning: (c: AuraChildProfile) => LearningProfile
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const learning = ensureLearning(child)
  const skills = learning.skills

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [area, setArea] = useState<LearningArea>('reading')
  const [level, setLevel] = useState<LearningLevel>('developing')
  const [notes, setNotes] = useState('')

  async function handleAdd() {
    if (!name.trim()) return
    const skill: LearningSkill = {
      id: crypto.randomUUID(),
      area, name: name.trim(), level,
      notes: notes || undefined,
      updated_at: new Date().toISOString(),
    }
    await onChange({
      ...child,
      learning: { ...learning, skills: [...skills, skill] },
    })
    setName(''); setNotes(''); setLevel('developing'); setShowForm(false)
  }

  async function updateLevel(id: string, newLevel: LearningLevel) {
    await onChange({
      ...child,
      learning: {
        ...learning,
        skills: skills.map(s => s.id === id ? { ...s, level: newLevel, updated_at: new Date().toISOString() } : s),
      },
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this skill?')) return
    await onChange({
      ...child,
      learning: { ...learning, skills: skills.filter(s => s.id !== id) },
    })
  }

  // Group by area
  const byArea = new Map<LearningArea, LearningSkill[]>()
  for (const s of skills) {
    const list = byArea.get(s.area) ?? []
    list.push(s)
    byArea.set(s.area, list)
  }

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">New skill to track</p>
          <Field label="Skill name *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Reading aloud, Multiplication tables…" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Area">
              <select value={area} onChange={e => setArea(e.target.value as LearningArea)} className={inputCls}>
                {(Object.entries(LEARNING_AREA_LABELS) as [LearningArea, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Current level">
              <select value={level} onChange={e => setLevel(e.target.value as LearningLevel)} className={inputCls}>
                {(Object.entries(LEARNING_LEVEL_LABELS) as [LearningLevel, typeof LEARNING_LEVEL_LABELS[LearningLevel]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} />
          </Field>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
              Add skill
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 text-sm font-semibold hover:bg-emerald-50">
          <Plus className="h-4 w-4" />
          Add skill
        </button>
      )}

      {skills.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No skills tracked yet.</p>
          <p className="text-xs text-gray-400 mt-1">Track specific skills to see growth across areas over time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...byArea.entries()].map(([area, list]) => (
            <div key={area} className="space-y-1.5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">{LEARNING_AREA_LABELS[area]}</p>
              {list.map(s => {
                const cfg = LEARNING_LEVEL_LABELS[s.level]
                return (
                  <div key={s.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                      {s.notes && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{s.notes}</p>}
                    </div>
                    <select
                      value={s.level}
                      onChange={e => updateLevel(s.id, e.target.value as LearningLevel)}
                      className={cn('text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer', cfg.bg, cfg.color)}
                    >
                      {(Object.entries(LEARNING_LEVEL_LABELS) as [LearningLevel, typeof cfg][]).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Interests tab ──────────────────────────────────────────────────────────────
function InterestsTab({ child, ensureLearning, onChange }: {
  child: AuraChildProfile
  ensureLearning: (c: AuraChildProfile) => LearningProfile
  onChange: (c: AuraChildProfile) => Promise<void>
}) {
  const learning = ensureLearning(child)
  const interests = learning.interests

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [intensity, setIntensity] = useState<Interest['intensity']>('strong')
  const [notes, setNotes] = useState('')

  async function handleAdd() {
    if (!name.trim()) return
    const interest: Interest = {
      id: crypto.randomUUID(),
      name: name.trim(),
      intensity,
      notes: notes || undefined,
      added_at: new Date().toISOString(),
    }
    await onChange({
      ...child,
      learning: { ...learning, interests: [...interests, interest] },
    })
    setName(''); setNotes(''); setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this interest?')) return
    await onChange({
      ...child,
      learning: { ...learning, interests: interests.filter(i => i.id !== id) },
    })
  }

  const intensityCfg: Record<Interest['intensity'], { label: string; color: string; bg: string }> = {
    casual: { label: 'Casual',       color: 'text-gray-600',   bg: 'bg-gray-50' },
    strong: { label: 'Strong',       color: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200' },
    special_interest: { label: 'Special interest', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  }

  return (
    <>
      {showForm ? (
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Add an interest</p>
          <Field label="Interest *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dinosaurs, Drawing, Trains…" className={inputCls} />
          </Field>
          <Field label="How strong">
            <select value={intensity} onChange={e => setIntensity(e.target.value as Interest['intensity'])} className={inputCls}>
              <option value="casual">Casual interest</option>
              <option value="strong">Strong interest</option>
              <option value="special_interest">Special interest (deep, focused)</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="What sparked it, how it shows up…" className={cn(inputCls, 'resize-none')} />
          </Field>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 text-sm font-semibold hover:bg-emerald-50">
          <Plus className="h-4 w-4" />
          Add interest
        </button>
      )}

      {interests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <Heart className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No interests captured yet.</p>
          <p className="text-xs text-gray-400 mt-1">Special interests are powerful learning anchors — track them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {interests.map(i => {
            const cfg = intensityCfg[i.intensity]
            return (
              <div key={i.id} className={cn('rounded-2xl border p-3', cfg.bg)}>
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-bold text-gray-800 break-words flex-1">{i.name}</p>
                  <button onClick={() => handleDelete(i.id)} className="p-1 rounded text-gray-300 hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className={cn('text-[10px] font-bold uppercase tracking-wider mt-1', cfg.color)}>{cfg.label}</p>
                {i.notes && <p className="text-[11px] text-gray-600 mt-1 leading-snug">{i.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Reusable bits ──────────────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function ListCard({ title, items, color }: { title: string; items: string[]; color: 'emerald' | 'amber' }) {
  if (items.length === 0) return null
  const cls = color === 'emerald'
    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
    : 'bg-amber-50 border-amber-100 text-amber-700'
  return (
    <div className={cn('rounded-2xl border p-3', cls)}>
      <p className="text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">{title}</p>
      <ul className="space-y-1">
        {items.map((s, i) => <li key={i} className="text-xs leading-relaxed">• {s}</li>)}
      </ul>
    </div>
  )
}

function EmptyChild() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500">Add a child profile to start tracking learning.</p>
      <Link href="/aura" className="text-xs font-bold text-emerald-600 mt-2 inline-block">
        Go to dashboard →
      </Link>
    </div>
  )
}
