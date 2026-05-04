'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, ArrowUp, Plus, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_PROMPTS = [
  'Plan my week',
  'Compare phone under ₹20k',
  'Where to invest ₹10 lakh?',
  'Help me reduce stress',
]

export function PremiumInputBar() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function submit(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/chat?prompt=${encodeURIComponent(trimmed)}`)
    setText('')
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(text)
    }
  }

  function handleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) {
      inputRef.current?.focus()
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new Ctor() as any
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      submit(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  // Auto-resize the textarea up to 6 lines
  useEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 144)}px`
  }, [text])

  // Cmd+K to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hasText = text.trim().length > 0

  return (
    <div className="sticky bottom-0 z-20 bg-[var(--color-surface-overlay)] backdrop-blur-xl border-t border-[var(--color-border-soft)]">
      <div className="px-4 pt-3 pb-3 max-w-[800px] mx-auto">
        {/* Composer — ChatGPT/Notion style: bordered surface with embedded controls */}
        <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)] focus-within:border-[var(--color-border-strong)] focus-within:shadow-[var(--shadow-md)] transition-all duration-[var(--duration-base)]">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Life OS anything…"
            rows={1}
            className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none max-h-[144px] leading-relaxed"
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-0.5">
              <ToolbarButton title="Attach (coming soon)" disabled>
                <Paperclip className="h-[16px] w-[16px]" strokeWidth={1.75} />
              </ToolbarButton>
              <ToolbarButton title="More (coming soon)" disabled>
                <Plus className="h-[16px] w-[16px]" strokeWidth={1.75} />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleVoice}
                title={listening ? 'Listening…' : 'Voice'}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded-lg transition-colors duration-[var(--duration-fast)]',
                  listening
                    ? 'bg-[var(--color-brand-600)] text-white'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-100)]',
                )}
              >
                <Mic className={cn('h-[16px] w-[16px]', listening && 'animate-pulse')} strokeWidth={1.75} />
              </button>

              <button
                onClick={() => submit(text)}
                disabled={!hasText}
                title="Send (Enter)"
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-[var(--duration-fast)]',
                  hasText
                    ? 'bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)]'
                    : 'bg-[var(--color-gray-100)] text-[var(--color-text-disabled)] cursor-not-allowed',
                )}
              >
                <ArrowUp className="h-[16px] w-[16px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick prompts — only when input is empty */}
        {!hasText && (
          <div className="flex gap-1.5 overflow-x-auto pt-2 no-scrollbar">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="flex-none rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  disabled,
  title,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  title?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-100)] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}

// Quick actions row (above the input on home)
export function HomeQuickActions() {
  const router = useRouter()
  const actions = [
    { label: 'New chat',  onClick: () => router.push('/chat'),    primary: true },
    { label: 'Add task',  onClick: () => router.push('/planner') },
    { label: 'Log mood',  onClick: () => router.push('/mind') },
    { label: 'Briefing',  onClick: () => router.push('/briefing') },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3.5 h-8 text-[13px] font-medium transition-colors duration-[var(--duration-fast)]',
            a.primary
              ? 'bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)]'
              : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
