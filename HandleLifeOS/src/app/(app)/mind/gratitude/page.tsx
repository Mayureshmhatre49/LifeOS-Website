'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, Flame, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GratitudeEntry } from '@/lib/db/mind-queries'

const AFFIRMATIONS = [
  'Small things add up to a beautiful life.',
  'Gratitude turns what you have into enough.',
  'Where attention goes, energy flows.',
  'The present moment always will have been.',
  'You are doing better than you think.',
  'Appreciation is a magnet for more good.',
  'Noticing beauty is a skill you can build.',
]

function todayAffirmation() {
  return AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length]
}

const GRATITUDE_STARTERS = [
  'I am grateful for…',
  'Something that made me smile today…',
  'A person I appreciate…',
  'A challenge that taught me…',
  'A simple pleasure I enjoyed…',
]

export default function GratitudePage() {
  const [items, setItems] = useState<string[]>(['', '', ''])
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [streak, setStreak] = useState(0)
  const [todayDone, setTodayDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mind/gratitude')
      .then(r => r.json())
      .then(({ entries, streak }) => {
        setEntries(entries ?? [])
        setStreak(streak ?? 0)
        const today = new Date().toISOString().split('T')[0]
        const done = (entries ?? []).some((e: GratitudeEntry) => e.date === today)
        if (done) {
          const todayEntry = (entries ?? []).find((e: GratitudeEntry) => e.date === today)
          setItems(todayEntry?.items ?? ['', '', ''])
          setTodayDone(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function updateItem(index: number, value: string) {
    setItems(prev => prev.map((v, i) => (i === index ? value : v)))
  }

  function addItem() {
    if (items.length < 8) setItems(prev => [...prev, ''])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function useStarter(index: number) {
    const starter = GRATITUDE_STARTERS[index % GRATITUDE_STARTERS.length]
    setItems(prev => prev.map((v, i) => (i === index && !v ? starter : v)))
  }

  async function handleSave() {
    const filled = items.filter(i => i.trim())
    if (!filled.length || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/mind/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: filled }),
      })
      if (res.ok) {
        const { entry } = await res.json()
        const today = new Date().toISOString().split('T')[0]
        setEntries(prev => {
          const filtered = prev.filter(e => e.date !== today)
          return [entry, ...filtered]
        })
        setStreak(s => s + (todayDone ? 0 : 1))
        setTodayDone(true)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleEdit() {
    setTodayDone(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Gratitude</h1>
        </div>
        {streak > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{streak}d streak</span>
          </div>
        )}
      </div>

      {/* Affirmation */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 px-5 py-4 text-center">
        <p className="text-sm text-amber-800 font-medium italic">&ldquo;{todayAffirmation()}&rdquo;</p>
      </div>

      {/* Today's practice */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">Today&apos;s gratitudes</p>
          {todayDone && (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved today
            </div>
          )}
        </div>

        {todayDone ? (
          <div className="space-y-2">
            {items.filter(i => i.trim()).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-amber-500 font-bold text-sm shrink-0">{idx + 1}.</span>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
            <button
              onClick={handleEdit}
              className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Edit today&apos;s entries
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold text-sm mt-2.5 shrink-0 w-5">{idx + 1}.</span>
                <div className="flex-1 relative">
                  <textarea
                    value={item}
                    onChange={e => updateItem(idx, e.target.value)}
                    placeholder={`I'm grateful for…`}
                    rows={2}
                    maxLength={300}
                    className="w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-gray-300"
                  />
                  {!item && (
                    <button
                      onClick={() => useStarter(idx)}
                      className="absolute right-2 top-2 text-[10px] text-amber-400 hover:text-amber-600 font-medium"
                    >
                      hint
                    </button>
                  )}
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="mt-2 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              {items.length < 8 && (
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add more
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!items.some(i => i.trim()) || saving}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save gratitudes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Past entries</p>
          {entries
            .filter(e => e.date !== new Date().toISOString().split('T')[0])
            .slice(0, 10)
            .map(entry => (
              <div key={entry.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </p>
                <div className="space-y-1">
                  {entry.items.map((item, idx) => (
                    <p key={idx} className={cn('text-sm text-gray-600 leading-relaxed', idx > 0 && 'border-t border-gray-50 pt-1')}>
                      <span className="text-amber-400 font-bold mr-1">{idx + 1}.</span>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
