'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Sparkles, Trash2, Tag, RefreshCw, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JournalEntry } from '@/lib/db/mind-queries'
import { EmergencyBanner } from '@/components/mind/EmergencyBanner'
import type { RiskAssessment } from '@/lib/mind/risk-detection'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'

const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😐', 3: '🙂', 4: '😊', 5: '🤩' }
const MOOD_LABELS: Record<number, string> = { 1: 'Rough', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }

const CBT_PROMPTS = [
  'What is one thought that is weighing on you right now? Is there evidence against it?',
  'Describe a moment today where you felt in control. What made that possible?',
  'What would you tell a close friend who was feeling exactly how you feel right now?',
  'Name three things that went well today, even if they feel small.',
  'What emotion is strongest right now? Where do you feel it in your body?',
  'Is there a situation you are avoiding? What is the smallest step you could take toward it?',
  'What are you grateful for that you have been taking for granted?',
  'Describe a recent challenge. What did you learn about yourself from it?',
  'What would a calmer version of you do differently in a situation you faced today?',
  'Write about a fear you have. How likely is the worst case? What would you do if it happened?',
  'What boundaries do you need to set or reinforce right now?',
  'What is draining your energy? What is filling it?',
]

function getPromptForToday(): string {
  const idx = new Date().getDate() % CBT_PROMPTS.length
  return CBT_PROMPTS[idx]
}

const SUGGESTED_TAGS = ['work', 'family', 'health', 'growth', 'anxiety', 'win', 'gratitude', 'reflection']

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [activePrompt, setActivePrompt] = useState(getPromptForToday())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<'write' | 'history'>('write')
  const [risk, setRisk] = useState<RiskAssessment | null>(null)

  useEffect(() => {
    fetch('/api/mind/journal?limit=30')
      .then(r => r.json())
      .then(({ entries }) => setEntries(entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function rotatePrompt() {
    const current = CBT_PROMPTS.indexOf(activePrompt)
    setActivePrompt(CBT_PROMPTS[(current + 1) % CBT_PROMPTS.length])
  }

  function usePrompt() {
    setContent(prev => prev ? prev : activePrompt + '\n\n')
  }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSave() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/mind/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          mood: mood ?? undefined,
          tags,
          prompt: content.startsWith(activePrompt) ? activePrompt : undefined,
        }),
      })
      if (res.ok) {
        const { entry, risk: riskResult } = await res.json()
        setEntries(prev => [entry, ...prev])
        if (riskResult?.severity === 'severe' || riskResult?.severity === 'moderate') {
          setRisk(riskResult)
        }
        setContent('')
        setMood(null)
        setTags([])
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/mind/journal?id=${id}`, { method: 'DELETE' })
      setEntries(prev => prev.filter(e => e.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Journal</h1>
        </div>
        <div className="ml-auto flex rounded-xl bg-gray-100 p-0.5">
          {(['write', 'history'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all',
                view === v ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              )}
            >
              {v === 'write' ? 'Write' : `History (${entries.length})`}
            </button>
          ))}
        </div>
      </div>

      {risk && (
        <EmergencyBanner severity={risk.severity} message={risk.message} dismissable={risk.severity !== 'severe'} />
      )}

      {view === 'write' ? (
        <>
          {/* CBT prompt card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Today&apos;s Prompt</span>
              </div>
              <button onClick={rotatePrompt} className="p-1.5 rounded-lg hover:bg-violet-100 transition-colors" title="Next prompt">
                <RefreshCw className="h-3.5 w-3.5 text-violet-500" />
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{activePrompt}</p>
            <button
              onClick={usePrompt}
              className="mt-3 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
            >
              Use this prompt →
            </button>
          </div>

          {/* Write area */}
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3">
            <div className="relative">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind today? Write freely… or press the mic to speak."
                rows={8}
                className="w-full text-sm text-gray-800 leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-gray-300 pr-10"
              />
              <div className="absolute right-0 bottom-0">
                <VoiceMicButton
                  onTranscript={(t) => {
                    // Live interim updates: replace any trailing "(speaking...)" placeholder
                    setContent(prev => {
                      const base = prev.replace(/\s*\(speaking…\)\s*$/, '')
                      return base ? `${base} ${t} (speaking…)` : `${t} (speaking…)`
                    })
                  }}
                  onFinalTranscript={(t) => {
                    setContent(prev => {
                      const base = prev.replace(/\s*\(speaking…\)\s*$/, '').trimEnd()
                      return base ? `${base} ${t}` : t
                    })
                  }}
                />
              </div>
            </div>

            {/* Mood for entry */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">How are you feeling as you write this?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => setMood(v === mood ? null : v)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl border text-xs transition-all',
                      mood === v
                        ? 'bg-violet-100 border-violet-300 text-violet-700'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                    )}
                  >
                    <span className="text-lg">{MOOD_EMOJIS[v]}</span>
                    <span className="text-[9px]">{MOOD_LABELS[v]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-semibold text-gray-500">Tags</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-all',
                      tags.includes(tag)
                        ? 'bg-violet-100 border-violet-300 text-violet-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-violet-200'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className={cn(
                'w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save entry'}
            </button>
          </div>
        </>
      ) : (
        /* History */
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          )}
          {!loading && entries.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No journal entries yet. Start writing above.
            </div>
          )}
          {entries.map(entry => (
            <div key={entry.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {entry.mood && <span className="text-lg">{MOOD_EMOJIS[entry.mood]}</span>}
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {entry.title && <p className="text-sm font-bold text-gray-800 mb-1">{entry.title}</p>}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{entry.content}</p>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
