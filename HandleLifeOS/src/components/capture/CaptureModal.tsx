'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Mic, Send, Zap, CalendarPlus, DollarSign,
  Brain, StickyNote, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParsedAction {
  type: 'task' | 'expense' | 'mood' | 'note' | 'chat' | 'unknown'
  label: string
  icon: React.ReactNode
  action: string
  href?: string
  color: string
}

const QUICK_PROMPTS = [
  'Remind me to call mom tomorrow',
  'I spent ₹450 on lunch',
  'Feeling stressed today',
  'Note: great book recommendation',
  'Plan my weekend',
]

const TYPE_META: Record<ParsedAction['type'], { icon: React.ReactNode; color: string; label: string }> = {
  task:    { icon: <CalendarPlus className="h-4 w-4" />,  color: 'bg-indigo-100 text-indigo-700',  label: 'Add to Planner' },
  expense: { icon: <DollarSign className="h-4 w-4" />,   color: 'bg-emerald-100 text-emerald-700', label: 'Log Expense'    },
  mood:    { icon: <Brain className="h-4 w-4" />,        color: 'bg-violet-100 text-violet-700',   label: 'Log Mood'       },
  note:    { icon: <StickyNote className="h-4 w-4" />,   color: 'bg-amber-100 text-amber-700',     label: 'Save Note'      },
  chat:    { icon: <Zap className="h-4 w-4" />,          color: 'bg-blue-100 text-blue-700',       label: 'Ask AI'         },
  unknown: { icon: <Zap className="h-4 w-4" />,          color: 'bg-gray-100 text-gray-600',       label: 'Handle it'      },
}

function parseCapture(text: string): ParsedAction {
  const lower = text.toLowerCase()

  // Expense detection
  if (/\b(spent|paid|bought|cost|₹|\$|rs\.?|inr|dollar|lunch|dinner|grocery|shopping)\b/i.test(lower)) {
    return { ...TYPE_META.expense, type: 'expense', action: text, href: `/money?capture=${encodeURIComponent(text)}` }
  }
  // Task / reminder
  if (/\b(remind|todo|task|schedule|book|call|meet|pick|drop|buy|don't forget|remember)\b/i.test(lower)) {
    return { ...TYPE_META.task, type: 'task', action: text, href: `/planner?capture=${encodeURIComponent(text)}` }
  }
  // Mood
  if (/\b(feel|feeling|mood|stress|anxious|happy|sad|tired|excited|calm|frustrated|depressed|overwhelm)\b/i.test(lower)) {
    return { ...TYPE_META.mood, type: 'mood', action: text, href: `/mind?capture=${encodeURIComponent(text)}` }
  }
  // Note
  if (/\b(note|remember|write|save|jot|idea|thought)\b/i.test(lower)) {
    return { ...TYPE_META.note, type: 'note', action: text, href: `/mind?note=${encodeURIComponent(text)}` }
  }
  // AI chat fallback
  return { ...TYPE_META.chat, type: 'chat', action: text, href: `/chat?prompt=${encodeURIComponent(text)}` }
}

interface Props {
  open: boolean
  onClose: () => void
}

export function CaptureModal({ open, onClose }: Props) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [parsed, setParsed] = useState<ParsedAction | null>(null)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-parse as user types
  useEffect(() => {
    if (text.trim().length > 6) {
      setParsed(parseCapture(text.trim()))
    } else {
      setParsed(null)
    }
  }, [text])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setDone(false)
      setText('')
      setParsed(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) { inputRef.current?.focus(); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Ctor() as any
    rec.lang = 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => setText(e.results[0][0].transcript)
    rec.onerror = () => setListening(false)
    rec.start()
  }

  function handleHandle() {
    if (!parsed?.href && !text.trim()) return
    const target = parsed?.href ?? `/chat?prompt=${encodeURIComponent(text)}`
    setDone(true)
    setTimeout(() => {
      router.push(target)
      onClose()
    }, 600)
  }

  function handleQuick(prompt: string) {
    setText(prompt)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — slides up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:bottom-6 md:right-6 md:w-[420px]">
        <div className="rounded-t-3xl md:rounded-3xl bg-white shadow-[0_-8px_40px_rgba(79,70,229,0.18)] overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Handle Something</p>
                <p className="text-[11px] text-gray-400">Speak or type — AI will figure it out</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Input area */}
          <div className="px-5 py-3">
            <div className="relative rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-md focus-within:shadow-indigo-100/50 transition-all">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleHandle()
                  }
                }}
                placeholder="Remind me to call mom tomorrow at 6pm…"
                rows={3}
                className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none leading-relaxed"
              />

              {/* Action row */}
              <div className="flex items-center justify-between px-3 pb-2.5">
                <button
                  onClick={handleVoice}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all',
                    listening
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 animate-pulse'
                      : 'bg-gray-200 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600',
                  )}
                  aria-label={listening ? 'Listening' : 'Speak'}
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleHandle}
                  disabled={!text.trim() || done}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all',
                    text.trim() && !done
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
                      : done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                >
                  {done ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </>
                  ) : (
                    <>
                      Handle this <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Parsed action preview */}
            {parsed && !done && (
              <div className={cn('mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2', parsed.color)}>
                {parsed.icon}
                <span className="text-xs font-semibold">
                  {parsed.label} — will open {parsed.href?.split('?')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-5 pb-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Try saying
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleQuick(p)}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
