'use client'

import { FormEvent, KeyboardEvent, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ value, onChange, onSubmit, isLoading, placeholder }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit(e as unknown as FormEvent)
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Ask Life OS anything...'}
        rows={1}
        disabled={isLoading}
        className={cn(
          'flex-1 resize-none rounded-2xl border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900 px-4 py-3 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500',
          'disabled:opacity-50 min-h-[48px] max-h-[200px]'
        )}
      />
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className={cn(
          'shrink-0 h-12 px-5 rounded-2xl text-sm font-medium transition-all',
          'bg-indigo-600 text-white hover:bg-indigo-700',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  )
}
