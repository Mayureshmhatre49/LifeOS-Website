'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough',   selectedBg: 'bg-rose-50 border-rose-300'    },
  { value: 2, emoji: '😐', label: 'Low',     selectedBg: 'bg-orange-50 border-orange-300' },
  { value: 3, emoji: '🙂', label: 'Okay',    selectedBg: 'bg-amber-50 border-amber-300'   },
  { value: 4, emoji: '😊', label: 'Good',    selectedBg: 'bg-green-50 border-green-300'   },
  { value: 5, emoji: '🤩', label: 'Great',   selectedBg: 'bg-emerald-50 border-emerald-300' },
]

const EMOTION_TAGS = [
  'anxious', 'calm', 'grateful', 'tired', 'energised',
  'hopeful', 'frustrated', 'focused', 'overwhelmed', 'excited',
  'lonely', 'content', 'stressed', 'motivated', 'sad',
]

const STRESS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'None',   color: 'text-emerald-600' },
  2: { label: 'Mild',   color: 'text-green-600'   },
  3: { label: 'Moderate', color: 'text-amber-600' },
  4: { label: 'High',   color: 'text-orange-600'  },
  5: { label: 'Severe', color: 'text-red-600'      },
}

const ENERGY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Drained',     color: 'text-rose-600'    },
  2: { label: 'Low',         color: 'text-orange-600'  },
  3: { label: 'Steady',      color: 'text-amber-600'   },
  4: { label: 'Energised',   color: 'text-green-600'   },
  5: { label: 'High',        color: 'text-emerald-600' },
}

type StressCategory = 'work' | 'health' | 'social' | 'personal' | 'environment'
const STRESS_CATEGORIES: { id: StressCategory; label: string; emoji: string }[] = [
  { id: 'work',         label: 'Work',         emoji: '💼' },
  { id: 'health',       label: 'Health',       emoji: '💗' },
  { id: 'social',       label: 'Social',       emoji: '👥' },
  { id: 'personal',     label: 'Personal',     emoji: '🧠' },
  { id: 'environment',  label: 'Environment',  emoji: '🌍' },
]

export function MoodCheckin() {
  const [selected, setSelected] = useState<number | null>(null)
  const [stress, setStress] = useState<number>(3)
  const [energy, setEnergy] = useState<number>(3)
  const [stressCategories, setStressCategories] = useState<StressCategory[]>([])
  const [emotions, setEmotions] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [todayMood, setTodayMood] = useState<number | null>(null)

  // Load today's mood on mount
  useEffect(() => {
    fetch('/api/mind/mood?today=true')
      .then(r => r.json())
      .then(({ entry }) => {
        if (entry) {
          setTodayMood(entry.mood)
          setSaved(true)
          setSelected(entry.mood)
        }
      })
      .catch(() => {})
  }, [])

  function toggleEmotion(tag: string) {
    setEmotions(prev =>
      prev.includes(tag) ? prev.filter(e => e !== tag) : [...prev, tag].slice(0, 6)
    )
  }

  function toggleStressCategory(c: StressCategory) {
    setStressCategories(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  async function handleSave() {
    if (!selected || saving) return
    setSaving(true)
    try {
      await fetch('/api/mind/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selected, stress, energy, emotions,
          stress_categories: stressCategories.length ? stressCategories : undefined,
          note: note.trim() || undefined,
        }),
      })
      setTodayMood(selected)
      setSaved(true)
      setExpanded(false)
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setSaved(false)
    setSelected(null)
    setEmotions([])
    setNote('')
    setExpanded(false)
    setTodayMood(null)
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">How are you feeling?</p>
        {saved && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Logged
          </span>
        )}
      </div>

      {/* Saved state */}
      {saved && todayMood ? (
        <div className="flex items-center gap-3">
          <span className="text-3xl">{MOODS.find(m => m.value === todayMood)?.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Feeling {MOODS.find(m => m.value === todayMood)?.label} today
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Mood logged ·{' '}
              <button onClick={handleReset} className="text-indigo-500 hover:underline">
                Update
              </button>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mood picker */}
          <div className="flex gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.value}
                onClick={() => { setSelected(mood.value); setExpanded(true) }}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 transition-all duration-150 active:scale-95',
                  selected === mood.value
                    ? mood.selectedBg
                    : 'border-gray-100 bg-gray-50/80',
                )}
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-[9px] font-semibold text-gray-500 leading-none">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Expanded details */}
          {selected && (
            <div className="mt-3 space-y-3">
              {/* Toggle expand */}
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs text-indigo-500 font-medium"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? 'Less detail' : 'Add detail (stress, emotions, note)'}
              </button>

              {expanded && (
                <div className="space-y-3">
                  {/* Stress slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Stress level</span>
                      <span className={cn('text-xs font-bold', STRESS_LABELS[stress].color)}>
                        {STRESS_LABELS[stress].label}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={stress}
                      onChange={e => setStress(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>

                  {/* Energy slider — separates "high energy + low mood" (anxiety) from "low energy + low mood" (down) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">Energy</span>
                      <span className={cn('text-xs font-bold', ENERGY_LABELS[energy].color)}>
                        {ENERGY_LABELS[energy].label}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={energy}
                      onChange={e => setEnergy(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Stress source */}
                  {stress >= 3 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">
                        Where&apos;s the stress coming from? <span className="text-gray-400 font-normal">(optional)</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {STRESS_CATEGORIES.map(c => (
                          <button
                            key={c.id}
                            onClick={() => toggleStressCategory(c.id)}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                              stressCategories.includes(c.id)
                                ? 'bg-amber-100 border-amber-300 text-amber-700'
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-200',
                            )}
                          >
                            <span>{c.emoji}</span>{c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emotion tags */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Emotions <span className="text-gray-400 font-normal">(pick up to 6)</span></p>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOTION_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleEmotion(tag)}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                            emotions.includes(tag)
                              ? 'bg-violet-100 border-violet-300 text-violet-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-violet-200',
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional note */}
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Anything on your mind? (optional)"
                    maxLength={300}
                    rows={2}
                    className="w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-gray-400"
                  />
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Log mood'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
