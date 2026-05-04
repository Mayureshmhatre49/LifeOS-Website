'use client'

import { useState, useEffect } from 'react'
import { Repeat, Plus, Flame, Check, Trash2, X, TrendingUp, Calendar } from 'lucide-react'
import type { HabitWithStats, HabitLog, HabitColor, HabitFrequency } from '@/lib/db/habit-queries'
import { cn } from '@/lib/utils'

const COLORS: { id: HabitColor; bg: string; text: string; ring: string; bar: string }[] = [
  { id: 'violet',  bg: 'bg-violet-50',  text: 'text-violet-700',  ring: 'border-violet-300',  bar: 'bg-violet-500'  },
  { id: 'indigo',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'border-indigo-300',  bar: 'bg-indigo-500'  },
  { id: 'blue',    bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'border-blue-300',    bar: 'bg-blue-500'    },
  { id: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'border-emerald-300', bar: 'bg-emerald-500' },
  { id: 'amber',   bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'border-amber-300',   bar: 'bg-amber-500'   },
  { id: 'rose',    bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'border-rose-300',    bar: 'bg-rose-500'    },
  { id: 'pink',    bg: 'bg-pink-50',    text: 'text-pink-700',    ring: 'border-pink-300',    bar: 'bg-pink-500'    },
  { id: 'purple',  bg: 'bg-purple-50',  text: 'text-purple-700',  ring: 'border-purple-300',  bar: 'bg-purple-500'  },
  { id: 'sky',     bg: 'bg-sky-50',     text: 'text-sky-700',     ring: 'border-sky-300',     bar: 'bg-sky-500'     },
  { id: 'teal',    bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'border-teal-300',    bar: 'bg-teal-500'    },
]

function colorCfg(c: string) {
  return COLORS.find(x => x.id === c) ?? COLORS[0]
}

const FREQ_LABELS: Record<HabitFrequency, string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  custom: 'Custom',
  weekly: 'Weekly',
}

const SUGGESTED_HABITS = [
  { name: '10-min meditation',     icon: '🧘', color: 'violet'  as HabitColor, frequency: 'daily'   as HabitFrequency },
  { name: 'Morning walk',          icon: '🚶', color: 'emerald' as HabitColor, frequency: 'daily'   as HabitFrequency },
  { name: 'Read 30 minutes',       icon: '📖', color: 'indigo'  as HabitColor, frequency: 'daily'   as HabitFrequency },
  { name: 'Drink 2L water',        icon: '💧', color: 'sky'     as HabitColor, frequency: 'daily'   as HabitFrequency, target_per_day: 8 },
  { name: 'No phone after 10pm',   icon: '📵', color: 'rose'    as HabitColor, frequency: 'daily'   as HabitFrequency },
  { name: 'Strength training',     icon: '💪', color: 'amber'   as HabitColor, frequency: 'weekdays' as HabitFrequency },
  { name: 'Family dinner',         icon: '🍽️', color: 'pink'    as HabitColor, frequency: 'daily'   as HabitFrequency },
  { name: 'Weekly review',         icon: '✍️', color: 'purple'  as HabitColor, frequency: 'weekly'  as HabitFrequency },
]

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/habits')
      .then(r => r.json())
      .then(({ habits }) => setHabits(habits ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleToday(habit: HabitWithStats) {
    // Optimistic
    const prevDone = habit.done_today
    const nextCount = prevDone ? 0 : Math.min(habit.target_per_day, habit.count_today + 1)
    setHabits(prev => prev.map(h => h.id === habit.id
      ? { ...h, count_today: nextCount, done_today: nextCount >= h.target_per_day,
          current_streak: nextCount >= h.target_per_day ? Math.max(h.current_streak, 1) : Math.max(0, h.current_streak - (prevDone ? 1 : 0)) }
      : h))
    const res = await fetch(`/api/habits/${habit.id}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    if (res.ok) {
      // Refresh to get accurate streak
      const refreshed = await fetch('/api/habits').then(r => r.json())
      setHabits(refreshed.habits ?? [])
    }
  }

  async function handleAdd(name: string, icon: string, color: HabitColor, frequency: HabitFrequency, target_per_day = 1) {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon, color, frequency, target_per_day }),
    })
    if (res.ok) {
      const refreshed = await fetch('/api/habits').then(r => r.json())
      setHabits(refreshed.habits ?? [])
      setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this habit and all its history?')) return
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  // Sort: today's habits not yet done first, then done, then non-today (different day-of-week)
  const today = new Date().getDay()
  const sorted = [...habits].sort((a, b) => {
    const aToday = a.days_of_week.includes(today)
    const bToday = b.days_of_week.includes(today)
    if (aToday !== bToday) return aToday ? -1 : 1
    if (aToday && a.done_today !== b.done_today) return a.done_today ? 1 : -1
    return 0
  })

  const todayHabits = habits.filter(h => h.days_of_week.includes(today))
  const todayDone = todayHabits.filter(h => h.done_today).length

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Repeat className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Habits</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Small actions, daily compounding</p>
        </div>
      </div>

      {/* Today summary */}
      {todayHabits.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Today</p>
            <p className="text-sm font-bold text-violet-800">{todayDone} / {todayHabits.length} done</p>
          </div>
          <div className="h-2 rounded-full bg-white/60 overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${(todayDone / Math.max(1, todayHabits.length)) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Add */}
      {showForm ? (
        <AddHabitForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 text-violet-600 text-sm font-semibold hover:bg-violet-50"
        >
          <Plus className="h-4 w-4" />
          Add a habit
        </button>
      )}

      {/* Habits list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : habits.length === 0 ? (
        <SuggestedHabits onAdd={handleAdd} />
      ) : (
        <div className="space-y-2">
          {sorted.map(h => (
            <HabitRow key={h.id} habit={h} onToggle={() => toggleToday(h)} onDelete={() => handleDelete(h.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function HabitRow({ habit, onToggle, onDelete }: {
  habit: HabitWithStats
  onToggle: () => void
  onDelete: () => void
}) {
  const c = colorCfg(habit.color)
  const today = new Date().getDay()
  const isToday = habit.days_of_week.includes(today)

  return (
    <div className={cn('rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-3', isToday ? c.ring : 'border-gray-200')}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          disabled={!isToday}
          className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-2xl transition-all',
            habit.done_today ? cn(c.bar, 'text-white shadow-md') : cn(c.bg, c.text, 'hover:scale-105'),
            !isToday && 'opacity-50',
          )}
          title={isToday ? (habit.done_today ? 'Tap to undo' : 'Tap to complete') : 'Not scheduled today'}
        >
          {habit.done_today ? <Check className="h-5 w-5" /> : (habit.icon ?? '✨')}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{habit.name}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {FREQ_LABELS[habit.frequency]}
            {habit.target_per_day > 1 && ` · ${habit.count_today}/${habit.target_per_day} today`}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {habit.current_streak > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                <Flame className="h-3 w-3" />
                {habit.current_streak}d streak
              </span>
            )}
            {habit.completion_rate_30d > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                <TrendingUp className="h-3 w-3" />
                {habit.completion_rate_30d}% (30d)
              </span>
            )}
          </div>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 14-day mini-strip */}
      <div className="flex gap-0.5 mt-3">
        <Mini14Days habit={habit} />
      </div>
    </div>
  )
}

function Mini14Days({ habit }: { habit: HabitWithStats }) {
  const c = colorCfg(habit.color)
  const [logs, setLogs] = useState<HabitLog[]>([])

  useEffect(() => {
    fetch(`/api/habits/${habit.id}`)
      .then(r => r.json())
      .then(({ logs }) => setLogs(logs ?? []))
      .catch(() => {})
  }, [habit.id])

  const byDate = new Map<string, number>()
  for (const l of logs) byDate.set(l.date, l.count)

  const days: { date: string; count: number; expected: boolean; today: boolean }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({
      date: dateStr,
      count: byDate.get(dateStr) ?? 0,
      expected: habit.days_of_week.includes(d.getDay()),
      today: i === 0,
    })
  }

  return (
    <>
      {days.map(d => {
        const met = d.count >= habit.target_per_day
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count}/${habit.target_per_day}`}
            className={cn(
              'flex-1 h-3 rounded-sm border',
              !d.expected ? 'bg-gray-50 border-gray-100' :
                met ? cn(c.bar, c.ring) :
                d.count > 0 ? cn(c.bg, c.ring) :
                'bg-gray-50 border-gray-200',
              d.today && 'ring-1 ring-violet-300 ring-offset-1',
            )}
          />
        )
      })}
    </>
  )
}

// ── Add form ───────────────────────────────────────────────────────────────────
function AddHabitForm({ onAdd, onCancel }: {
  onAdd: (name: string, icon: string, color: HabitColor, frequency: HabitFrequency, target?: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✨')
  const [color, setColor] = useState<HabitColor>('violet')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [target, setTarget] = useState(1)

  return (
    <div className="rounded-2xl bg-white border border-violet-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">New habit</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-2">
        <input
          value={icon}
          onChange={e => setIcon(e.target.value.slice(0, 4))}
          placeholder="✨"
          className="w-14 text-center text-xl rounded-xl border border-gray-200 bg-gray-50 px-2 py-2"
        />
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="What habit?"
          autoFocus
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Frequency</p>
        <div className="grid grid-cols-4 gap-1">
          {(['daily','weekdays','weekends','weekly'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                'py-1.5 rounded-lg text-[11px] font-semibold capitalize',
                frequency === f ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 text-gray-500',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Color</p>
        <div className="flex gap-1.5">
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={cn('h-7 w-7 rounded-full border-2', c.bar, color === c.id ? 'border-gray-800 scale-110' : 'border-transparent')}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Target per day</p>
        <input
          type="number"
          min={1} max={50} value={target}
          onChange={e => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAdd(name.trim(), icon, color, frequency, target)}
          disabled={!name.trim()}
          className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40"
        >
          Create habit
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  )
}

function SuggestedHabits({ onAdd }: { onAdd: (name: string, icon: string, color: HabitColor, frequency: HabitFrequency, target?: number) => void }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-violet-500" />
        <p className="text-sm font-bold text-gray-800">Get started — popular habits</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTED_HABITS.map(s => {
          const c = colorCfg(s.color)
          return (
            <button
              key={s.name}
              onClick={() => onAdd(s.name, s.icon, s.color, s.frequency, s.target_per_day ?? 1)}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:shadow-sm', c.bg, c.ring)}
            >
              <span className="text-lg">{s.icon}</span>
              <span className={cn('text-xs font-semibold', c.text)}>{s.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
