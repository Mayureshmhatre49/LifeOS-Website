'use client'

import { FormEvent, KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onStop?: () => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSubmit, onStop, isLoading, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (value.trim() && !isLoading && !disabled) {
        onSubmit(e as unknown as FormEvent)
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Life OS anything… (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          aria-label="Chat message input"
          className={cn(
            'w-full resize-none rounded-2xl border border-gray-200 bg-white',
            'px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'shadow-sm transition-all duration-150',
            'min-h-[48px] max-h-[200px]',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        <div className="absolute right-2 bottom-2">
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150',
                value.trim() && !disabled
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              )}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
