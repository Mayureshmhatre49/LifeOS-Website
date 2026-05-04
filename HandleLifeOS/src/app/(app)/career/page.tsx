'use client'

import { useState, useEffect } from 'react'
import {
  Briefcase, Plus, Trash2, Target, BookOpen, Award, TrendingUp, X, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CareerGoal {
  id: string; user_id: string; title: string; category: string;
  target_date: string | null; description: string | null;
  progress_pct: number; status: 'active' | 'achieved' | 'paused' | 'dropped';
  notes: string | null; created_at: string; updated_at: string;
}

interface Skill {
  id: string; user_id: string; name: string; category: string | null;
  current_level: number; target_level: number; hours_invested: number;
  notes: string | null; is_active: boolean; created_at: string; updated_at: string;
}

interface Resource {
  id: string; user_id: string; skill_id: string | null; title: string;
  url: string | null; type: string; status: 'queued' | 'active' | 'completed' | 'dropped';
  rating: number | null; notes: string | null; completed_at: string | null; created_at: string;
}

type Tab = 'goals' | 'skills' | 'learning'

export default function CareerPage() {
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('goals')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/career').then(r => r.json()).then(d => {
      setGoals(d.goals ?? []); setSkills(d.skills ?? []); setResources(d.resources ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function refresh() {
    const r = await fetch('/api/career').then(r => r.json())
    setGoals(r.goals ?? []); setSkills(r.skills ?? []); setResources(r.resources ?? [])
  }

  async function patch(kind: string, id: string, patch: Record<string, unknown>) {
    await fetch('/api/career', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, ...patch }) })
    refresh()
  }
  async function del(kind: string, id: string) {
    if (!confirm('Delete this?')) return
    await fetch(`/api/career?kind=${kind}&id=${id}`, { method: 'DELETE' })
    refresh()
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const overallProgress = activeGoals.length ? Math.round(activeGoals.reduce((s, g) => s + g.progress_pct, 0) / activeGoals.length) : 0

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Career & Growth</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Goals · skills · learning queue</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />Add
        </button>
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Target} color="text-emerald-600" value={`${activeGoals.length}`} label="Active goals" />
        <Stat icon={Award} color="text-amber-600" value={`${skills.filter(s => s.is_active).length}`} label="Tracking skills" />
        <Stat icon={BookOpen} color="text-blue-600" value={`${resources.filter(r => r.status !== 'completed' && r.status !== 'dropped').length}`} label="In learning queue" />
      </div>

      {activeGoals.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Goal momentum</p>
            <p className="text-sm font-bold text-emerald-800">{overallProgress}%</p>
          </div>
          <div className="h-2 rounded-full bg-white/60 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex rounded-xl bg-gray-100 p-0.5">
        {(['goals', 'skills', 'learning'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize', tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500')}>
            {t}{t === 'goals' && goals.length > 0 && ` (${goals.length})`}
            {t === 'skills' && skills.length > 0 && ` (${skills.length})`}
            {t === 'learning' && resources.length > 0 && ` (${resources.length})`}
          </button>
        ))}
      </div>

      {showForm && <AddForm tab={tab} skills={skills} onClose={() => setShowForm(false)} onAdded={refresh} />}

      {loading ? <Loading /> : (
        <>
          {tab === 'goals' && <GoalsList goals={goals} onPatch={(id, p) => patch('goal', id, p)} onDelete={(id) => del('goal', id)} />}
          {tab === 'skills' && <SkillsList skills={skills} onPatch={(id, p) => patch('skill', id, p)} onDelete={(id) => del('skill', id)} />}
          {tab === 'learning' && <ResourcesList resources={resources} skills={skills} onPatch={(id, p) => patch('resource', id, p)} onDelete={(id) => del('resource', id)} />}
        </>
      )}
    </div>
  )
}

function GoalsList({ goals, onPatch, onDelete }: { goals: CareerGoal[]; onPatch: (id: string, p: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  if (goals.length === 0) return <Empty msg="No career goals yet. Set 1-3 stretch goals." />
  return (
    <div className="space-y-2">
      {goals.map(g => (
        <div key={g.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
          <div className="flex items-start gap-2 mb-2">
            <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200')}>
              {g.category}
            </span>
            <p className="text-sm font-semibold text-gray-800 flex-1">{g.title}</p>
            <select value={g.status} onChange={e => onPatch(g.id, { status: e.target.value })} className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-white capitalize',
              g.status === 'achieved' ? 'text-emerald-700' : g.status === 'active' ? 'text-amber-700' : 'text-gray-500',
            )}>
              <option value="active">Active</option>
              <option value="achieved">Achieved</option>
              <option value="paused">Paused</option>
              <option value="dropped">Dropped</option>
            </select>
            <button onClick={() => onDelete(g.id)} className="p-1 rounded text-gray-300 hover:text-red-400">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          {g.description && <p className="text-[11px] text-gray-600 mb-2">{g.description}</p>}
          {g.target_date && <p className="text-[10px] text-gray-400 mb-1">Target: {new Date(g.target_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={100} step={5} value={g.progress_pct} onChange={e => onPatch(g.id, { progress_pct: parseInt(e.target.value) })} className="flex-1 accent-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 w-12 text-right">{g.progress_pct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkillsList({ skills, onPatch, onDelete }: { skills: Skill[]; onPatch: (id: string, p: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  if (skills.length === 0) return <Empty msg="No skills tracked. Add ones you're actively building." />
  return (
    <div className="space-y-2">
      {skills.map(s => (
        <div key={s.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{s.name}</p>
              {s.category && <p className="text-[10px] text-gray-400">{s.category}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-500 w-16 shrink-0">Lv {s.current_level}/{s.target_level}</span>
                <div className="flex gap-0.5 flex-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => onPatch(s.id, { current_level: v })}
                      className={cn('flex-1 h-2 rounded-full',
                        v <= s.current_level ? 'bg-amber-500' : v <= s.target_level ? 'bg-amber-100' : 'bg-gray-100')}
                    />
                  ))}
                </div>
              </div>
              {s.hours_invested > 0 && <p className="text-[10px] text-gray-400 mt-1">{s.hours_invested}h invested</p>}
            </div>
            <button onClick={() => onDelete(s.id)} className="p-1 rounded text-gray-300 hover:text-red-400">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ResourcesList({ resources, skills, onPatch, onDelete }: { resources: Resource[]; skills: Skill[]; onPatch: (id: string, p: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  if (resources.length === 0) return <Empty msg="No learning resources queued. Add books, courses, articles." />
  const grouped: Record<Resource['status'], Resource[]> = { queued: [], active: [], completed: [], dropped: [] }
  for (const r of resources) grouped[r.status].push(r)

  return (
    <div className="space-y-3">
      {(['active', 'queued', 'completed'] as const).map(status => grouped[status].length === 0 ? null : (
        <div key={status} className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">{status} ({grouped[status].length})</p>
          {grouped[status].map(r => (
            <div key={r.id} className="rounded-xl bg-white/80 border border-white/60 shadow-sm p-3 flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                <p className="text-[10px] text-gray-500 capitalize">{r.type}{r.skill_id && ` · ${skills.find(s => s.id === r.skill_id)?.name}`}</p>
              </div>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <select value={r.status} onChange={e => onPatch(r.id, { status: e.target.value, completed_at: e.target.value === 'completed' ? new Date().toISOString().slice(0, 10) : null })} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-white capitalize">
                <option value="queued">Queued</option>
                <option value="active">Active</option>
                <option value="completed">Done</option>
                <option value="dropped">Dropped</option>
              </select>
              <button onClick={() => onDelete(r.id)} className="p-1 rounded text-gray-300 hover:text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function AddForm({ tab, skills, onClose, onAdded }: { tab: Tab; skills: Skill[]; onClose: () => void; onAdded: () => void }) {
  const [f, setF] = useState<Record<string, string | number>>({})

  async function save() {
    let payload: Record<string, unknown> = {}
    if (tab === 'goals') {
      if (!f.title) return
      payload = { kind: 'goal', title: f.title, category: f.category ?? 'role', description: f.description, target_date: f.target_date || null }
    } else if (tab === 'skills') {
      if (!f.name) return
      payload = { kind: 'skill', name: f.name, category: f.category, current_level: Number(f.current_level ?? 1), target_level: Number(f.target_level ?? 3) }
    } else if (tab === 'learning') {
      if (!f.title) return
      payload = { kind: 'resource', title: f.title, type: f.type ?? 'article', url: f.url, skill_id: f.skill_id || null }
    }
    await fetch('/api/career', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    onAdded(); onClose(); setF({})
  }

  return (
    <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800 capitalize">New {tab.slice(0, -1)}</p>
        <button onClick={onClose} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      {tab === 'goals' && (
        <>
          <input value={String(f.title ?? '')} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Goal title (e.g., Senior eng promotion)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <select value={String(f.category ?? 'role')} onChange={e => setF({ ...f, category: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <option value="role">Role / promotion</option><option value="skill">Skill</option><option value="income">Income</option><option value="impact">Impact</option><option value="learning">Learning</option><option value="other">Other</option>
          </select>
          <textarea value={String(f.description ?? '')} onChange={e => setF({ ...f, description: e.target.value })} rows={2} placeholder="Why this matters" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none" />
          <input type="date" value={String(f.target_date ?? '')} onChange={e => setF({ ...f, target_date: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        </>
      )}
      {tab === 'skills' && (
        <>
          <input value={String(f.name ?? '')} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Skill (e.g., Public speaking)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <input value={String(f.category ?? '')} onChange={e => setF({ ...f, category: e.target.value })} placeholder="Category (technical/soft/language)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-gray-500">Current 1-5</label><input type="number" min={1} max={5} value={String(f.current_level ?? 1)} onChange={e => setF({ ...f, current_level: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-gray-500">Target 1-5</label><input type="number" min={1} max={5} value={String(f.target_level ?? 3)} onChange={e => setF({ ...f, target_level: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" /></div>
          </div>
        </>
      )}
      {tab === 'learning' && (
        <>
          <input value={String(f.title ?? '')} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Title (e.g., Atomic Habits)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          <select value={String(f.type ?? 'book')} onChange={e => setF({ ...f, type: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <option value="book">Book</option><option value="course">Course</option><option value="article">Article</option><option value="video">Video</option><option value="podcast">Podcast</option><option value="project">Project</option><option value="mentorship">Mentorship</option><option value="other">Other</option>
          </select>
          <input value={String(f.url ?? '')} onChange={e => setF({ ...f, url: e.target.value })} placeholder="URL (optional)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
          {skills.length > 0 && (
            <select value={String(f.skill_id ?? '')} onChange={e => setF({ ...f, skill_id: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <option value="">Linked skill (optional)</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </>
      )}
      <div className="flex gap-2">
        <button onClick={save} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Save</button>
        <button onClick={onClose} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, color, value, label }: { icon: typeof TrendingUp; color: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 text-center">
      <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
    </div>
  )
}

function Loading() {
  return <div className="flex items-center justify-center py-8"><div className="animate-spin h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent" /></div>
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center"><p className="text-sm text-gray-500">{msg}</p></div>
}
