'use client'

import { useState } from 'react'
import { Plus, X, Mic, Sparkles, ArrowRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DECISION_TEMPLATES } from '@/types/decision'
import type { DecisionCategory, DecisionMode } from '@/types/decision'

interface Props {
  onSubmit: (payload: {
    question: string
    category?: DecisionCategory
    mode: DecisionMode
    options?: string[]
    additionalContext?: string
  }) => void
  loading: boolean
}

export function DecisionForm({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<DecisionMode>('analyze')
  const [category, setCategory] = useState<DecisionCategory | undefined>()
  const [options, setOptions] = useState<string[]>(['', ''])
  const [additionalContext, setAdditionalContext] = useState('')
  const [showContext, setShowContext] = useState(false)
  const [listening, setListening] = useState(false)

  function addOption() {
    if (options.length < 5) setOptions(prev => [...prev, ''])
  }

  function removeOption(i: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  function setOption(i: number, val: string) {
    setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)))
  }

  function handleTemplate(q: string, cat: DecisionCategory) {
    setQuestion(q)
    setCategory(cat)
    setMode('analyze')
  }

  function handleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Ctor() as any
    rec.lang = 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => setQuestion(e.results[0][0].transcript)
    rec.onerror = () => setListening(false)
    rec.start()
  }

  function handleSubmit() {
    if (!question.trim() || loading) return
    const validOptions = options.filter(o => o.trim())
    onSubmit({
      question: question.trim(),
      category,
      mode,
      options: mode === 'compare' ? validOptions : undefined,
      additionalContext: additionalContext.trim() || undefined,
    })
  }

  const canSubmit =
    question.trim().length >= 5 &&
    (mode === 'analyze' || options.filter(o => o.trim()).length >= 2)

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['analyze', 'compare'] as DecisionMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              mode === m
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white/80 border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600',
            )}
          >
            {m === 'analyze' ? <Sparkles className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
            {m === 'analyze' ? 'Analyze Decision' : 'Compare Options'}
          </button>
        ))}
      </div>

      {/* Main question input */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {mode === 'analyze' ? 'Your Decision Question' : 'What are you choosing between?'}
        </label>
        <div className="relative">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            placeholder={
              mode === 'analyze'
                ? 'e.g. Should I buy a ₹20 lakh car right now?\ne.g. Should I quit my job and start a business?'
                : 'e.g. Which city should I move to?\ne.g. Which job offer should I accept?'
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white focus:shadow-sm transition-all leading-relaxed"
          />
          <button
            onClick={handleVoice}
            className={cn(
              'absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center transition-all',
              listening
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600',
            )}
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Compare options */}
        {mode === 'compare' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400">Options to Compare</label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <input
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1} — e.g. Mumbai, Pune, Dubai`}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <button
                onClick={addOption}
                className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all w-full"
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </button>
            )}
          </div>
        )}

        {/* Optional context */}
        <button
          onClick={() => setShowContext(v => !v)}
          className="text-xs text-gray-400 hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add context (optional)
        </button>
        {showContext && (
          <textarea
            value={additionalContext}
            onChange={e => setAdditionalContext(e.target.value)}
            placeholder="Any specific details — budget range, timeline, personal constraints..."
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
          />
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
            canSubmit && !loading
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          )}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Analyzing with AI…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {mode === 'analyze' ? 'Analyze This Decision' : 'Compare Options'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Template library */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-0.5">
          Quick Templates
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DECISION_TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => handleTemplate(t.question, t.category)}
              className={cn(
                'rounded-2xl border bg-white/80 backdrop-blur p-3 text-left hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200',
                category === t.category && question === t.question
                  ? 'border-indigo-300 bg-indigo-50/80'
                  : 'border-white/60',
              )}
            >
              <span className="text-xl block mb-1">{t.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
