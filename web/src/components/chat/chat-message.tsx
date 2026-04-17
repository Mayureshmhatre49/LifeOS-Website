'use client'

import { UIMessage } from 'ai'
import { MessageActions } from './message-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: UIMessage
  isLast?: boolean
  isStreaming?: boolean
  onRegenerate?: () => void
  userImage?: string | null
  userName?: string | null
}

export function ChatMessage({
  message,
  isLast,
  isStreaming,
  onRegenerate,
  userImage,
  userName,
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

  if (!text && !isStreaming) return null

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 mb-6 group px-4">
        <div className="max-w-[75%] sm:max-w-[65%]">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </div>
        </div>
        <Avatar className="h-7 w-7 shrink-0 mt-1">
          <AvatarImage src={userImage ?? undefined} />
          <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
            {userName?.charAt(0)?.toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6 group px-4">
      <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-indigo-200">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" fill="white" />
        </svg>
      </div>
      <div className="flex-1 min-w-0 max-w-[80%]">
        <div
          className={cn(
            'bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm',
            'whitespace-pre-wrap',
            isStreaming && !text && 'streaming-cursor'
          )}
        >
          {text || (isStreaming ? '' : null)}
          {isStreaming && text && <span className="streaming-cursor" />}
        </div>
        {!isStreaming && text && (
          <MessageActions content={text} isLast={isLast} onRegenerate={onRegenerate} />
        )}
      </div>
    </div>
  )
}
