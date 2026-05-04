'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCoachModeConfig, type CoachMode } from '@/lib/aura/coach-prompts'
import { VoiceMicButton } from '@/components/voice/voice-mic-button'
import type { AuraCoachSession, AuraCoachMessage } from '@/lib/db/aura-coach-queries'

export default function AuraCoachChatPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sessionId = params.id

  const [coachSession, setCoachSession] = useState<AuraCoachSession | null>(null)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [loadingSession, setLoadingSession] = useState(true)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/aura/coach/sessions').then(r => r.json()),
      fetch(`/api/aura/coach/messages?session_id=${sessionId}`).then(r => r.json()),
    ])
      .then(([sessionsRes, messagesRes]) => {
        const found = (sessionsRes.sessions ?? []).find((s: AuraCoachSession) => s.id === sessionId)
        if (!found) {
          router.replace('/aura/coach')
          return
        }
        setCoachSession(found)
        const history = (messagesRes.messages ?? []) as AuraCoachMessage[]
        const ui: UIMessage[] = history.map(m => ({
          id: m.id,
          role: m.role,
          parts: [{ type: 'text', text: m.content }],
        } as UIMessage))
        setInitialMessages(ui)
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false))
  }, [sessionId, router])

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-fuchsia-500 border-t-transparent" />
      </div>
    )
  }
  if (!coachSession) return null

  return (
    <ChatBody
      session={coachSession}
      initialMessages={initialMessages}
      input={input}
      setInput={setInput}
      bottomRef={bottomRef}
    />
  )
}

interface ChatBodyProps {
  session: AuraCoachSession
  initialMessages: UIMessage[]
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  bottomRef: React.RefObject<HTMLDivElement | null>
}

function ChatBody({ session, initialMessages, input, setInput, bottomRef }: ChatBodyProps) {
  const cfg = getCoachModeConfig(session.mode as CoachMode)
  const Icon = cfg?.icon

  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/aura/coach/chat',
      body: { session_id: session.id },
    }),
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, bottomRef])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage({ text })
  }

  const showGreeting = messages.length === 0 && cfg

  return (
    <div className="min-h-full flex flex-col max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/aura/coach" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        {Icon && cfg && (
          <>
            <div className={cn('h-8 w-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', cfg.bgGradient)}>
              <Icon className={cn('h-4 w-4', cfg.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{cfg.title}</p>
              <p className="text-[11px] text-gray-400 truncate">{cfg.tagline}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showGreeting && cfg && (
          <div className="rounded-2xl bg-gray-50 px-4 py-3 max-w-[85%]">
            <p className="text-sm text-gray-700 leading-relaxed">{cfg.greeting}</p>
          </div>
        )}

        {messages.map(m => {
          const text = m.parts
            ?.filter(p => p.type === 'text')
            .map(p => (p as { type: 'text'; text: string }).text)
            .join('') ?? ''
          return (
            <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-sm whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-fuchsia-600 text-white rounded-br-sm'
                  : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100',
              )}>
                {text}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 bg-gray-50 border border-gray-100 inline-flex items-center gap-2 text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-xs">Typing…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as FormEvent)
              }
            }}
            placeholder="Share what's on your mind…"
            rows={1}
            maxLength={2000}
            className="flex-1 max-h-32 resize-none text-sm rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 placeholder:text-gray-400"
          />
          <VoiceMicButton
            onTranscript={t => setInput(prev => {
              const base = prev.replace(/\s*\(speaking…\)\s*$/, '')
              return base ? `${base} ${t} (speaking…)` : `${t} (speaking…)`
            })}
            onFinalTranscript={t => setInput(prev => {
              const base = prev.replace(/\s*\(speaking…\)\s*$/, '').trimEnd()
              return base ? `${base} ${t}` : t
            })}
            className="h-10 w-10"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-2xl bg-fuchsia-600 text-white flex items-center justify-center hover:bg-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          AURA Coach is AI-generated. Not a substitute for professional care.
        </p>
      </form>
    </div>
  )
}
