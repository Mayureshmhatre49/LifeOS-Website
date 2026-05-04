'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap, Mic, Send, CalendarPlus, DollarSign, Brain,
  StickyNote, CheckCircle2, ArrowRight, X, Clock,
  Heart, ShoppingCart, MessageSquare, Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParsedAction {
  type: 'task' | 'expense' | 'mood' | 'note' | 'chat' | 'unknown'
  label: string
  icon: React.ReactNode
  action: string
  href?: string
  color: string
  bg: string
}

const TYPE_META: Record<ParsedAction['type'], { icon: React.ReactNode; color: string; label: string; bg: string }> = {
  task:    { icon: <CalendarPlus className="h-5 w-5" />, color: 'text-indigo-700', bg: 'bg-indigo-100', label: 'Add to Planner' },
  expense: { icon: <DollarSign className="h-5 w-5" />,  color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Log Expense'   },
  mood:    { icon: <Brain className="h-5 w-5" />,       color: 'text-violet-700', bg: 'bg-violet-100', label: 'Log Mood'        },
  note:    { icon: <StickyNote className="h-5 w-5" />,  color: 'text-amber-700', bg: 'bg-amber-100', label: 'Save Note'         },
  chat:    { icon: <Zap className="h-5 w-5" />,         color: 'text-blue-700', bg: 'bg-blue-100', label: 'Ask AI'              },
  unknown: { icon: <Zap className="h-5 w-5" />,         color: 'text-gray-600', bg: 'bg-gray-100', label: 'Handle it'           },
}

const QUICK_CAPTURES = [
  { id: 'q1', icon: Clock,         label: 'Task',     prompt: 'Remind me to ',          type: 'task'    },
  { id: 'q2', icon: ShoppingCart,  label: 'Expense',  prompt: 'I spent ₹',              type: 'expense' },
  { id: 'q3', icon: Heart,         label: 'Mood',     prompt: 'Feeling ',               type: 'mood'    },
  { id: 'q4', icon: Lightbulb,     label: 'Idea',     prompt: 'Note: ',                 type: 'note'    },
  { id: 'q5', icon: MessageSquare, label: 'Ask AI',   prompt: 'Help me think through ', type: 'chat'    },
]

const EXAMPLE_PROMPTS = [
  'Remind me to call mom tomorrow at 6pm',
  'I spent ₹450 on lunch',
  'Feeling stressed about the Q2 deadline',
  'Note: try the new coffee shop near office',
  'What should I prioritise this afternoon?',
  'I spent ₹1,200 on groceries today',
  "Book Tanish's dentist appointment this week",
  'Idea: start a reading habit before bed',
]

function parseCapture(text: string): ParsedAction {
  const lower = text.toLowerCase()
  if (/\b(spent|paid|bought|cost|₹|\$|rs\.?|inr|lunch|dinner|grocery|shopping|expense)\b/i.test(lower)) {
    return { ...TYPE_META.expense, type: 'expense', action: text, href: `/money?capture=${encodeURIComponent(text)}` }
  }
  if (/\b(remind|todo|task|schedule|book|call|meet|pick|drop|buy|don't forget|remember|appointment)\b/i.test(lower)) {
    return { ...TYPE_META.task, type: 'task', action: text, href: `/planner?capture=${encodeURIComponent(text)}` }
  }
  if (/\b(feel|feeling|mood|stress|anxious|happy|sad|tired|excited|calm|frustrated|overwhelm|depressed)\b/i.test(lower)) {
    return { ...TYPE_META.mood, type: 'mood', action: text, href: `/mind?capture=${encodeURIComponent(text)}` }
  }
  if (/\b(note|remember|write|save|jot|idea|thought|insight)\b/i.test(lower)) {
    return { ...TYPE_META.note, type: 'note', action: text, href: `/mind?note=${encodeURIComponent(text)}` }
  }
  return { ...TYPE_META.chat, type: 'chat', action: text, href: `/chat?prompt=${encodeURIComponent(text)}` }
}

export default function CapturePage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [parsed, setParsed] = useState<ParsedAction | null>(null)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (text.trim().length > 6) setParsed(parseCapture(text.trim()))
    else setParsed(null)
  }, [text])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) { inputRef.current?.focus(); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Ctor() as any
    rec.lang = 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend   = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => setText(e.results[0][0].transcript)
    rec.onerror  = () => setListening(false)
    rec.start()
  }

  function handleHandle() {
    if (!text.trim() || done) return
    const target = parsed?.href ?? `/chat?prompt=${encodeURIComponent(text)}`
    setHistory(h => [text, ...h].slice(0, 5))
    setDone(true)
    setTimeout(() => {
      router.push(target)
    }, 700)
  }

  function handleQuick(prompt: string) {
    setText(prompt)
    inputRef.current?.focus()
  }

  function clearInput() {
    setText('')
    setParsed(null)
    setDone(false)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Capture</h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">Speak or type — AI routes it instantly</p>
      </div>

      {/* Main input */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/80 shadow-md shadow-indigo-100/30 overflow-hidden fade-in fade-in-delay-1">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => { setText(e.target.value); setDone(false) }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleHandle()
              }
            }}
            placeholder="What's on your mind? Task, expense, mood, idea — anything…"
            rows={4}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none leading-relaxed"
          />
          {text && (
            <button
              onClick={clearInput}
              className="absolute top-4 right-4 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Parsed preview */}
        {parsed && !done && (
          <div className={cn('mx-4 mb-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5', parsed.bg)}>
            <span className={parsed.color}>{parsed.icon}</span>
            <div>
              <p className={cn('text-xs font-bold', parsed.color)}>{parsed.label}</p>
              <p className="text-[10px] text-gray-500">Will open {parsed.href?.split('?')[0]}</p>
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-between px-4 pb-4 gap-3">
          <button
            onClick={handleVoice}
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0',
              listening
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 animate-pulse'
                : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600',
            )}
            aria-label={listening ? 'Listening…' : 'Voice input'}
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            onClick={handleHandle}
            disabled={!text.trim() || done}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all',
              text.trim() && !done
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01] active:scale-[0.99]'
                : done
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            )}
          >
            {done ? (
              <><CheckCircle2 className="h-4 w-4" /> Done!</>
            ) : (
              <>Handle this <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>

      {/* Quick type buttons */}
      <div className="fade-in fade-in-delay-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick capture</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_CAPTURES.map(q => {
            const Icon = q.icon
            return (
              <button
                key={q.id}
                onClick={() => handleQuick(q.prompt)}
                className="flex-none flex items-center gap-1.5 rounded-full bg-white/80 border border-white/60 shadow-sm px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {q.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Example prompts */}
      <div className="fade-in fade-in-delay-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Try saying</p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => handleQuick(p)}
              className="rounded-full bg-gray-100/80 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recent captures */}
      {history.length > 0 && (
        <div className="fade-in">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recent</p>
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleQuick(h)}
                className="w-full text-left rounded-xl bg-white/60 border border-white/60 px-3.5 py-2.5 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
