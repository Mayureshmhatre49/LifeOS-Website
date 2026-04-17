'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useEffect, useRef, FormEvent, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { WelcomeScreen } from './welcome-screen'
import { Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  conversationId?: string
  initialTitle?: string
  onTitleChange?: (title: string) => void
}

export function ChatInterface({ conversationId, initialTitle, onTitleChange }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstMessage = useRef(true)

  const { messages, sendMessage, status, stop, setMessages } = useChat()
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const text = input.trim()
      if (!text || isLoading) return

      setInput('')
      setErrorMsg(null)

      try {
        sendMessage({ text })

        if (isFirstMessage.current && onTitleChange) {
          isFirstMessage.current = false
          const shortTitle = text.length > 50 ? text.slice(0, 47) + '...' : text
          onTitleChange(shortTitle)
        }
      } catch {
        setErrorMsg('Failed to send message. Please try again.')
      }
    },
    [input, isLoading, sendMessage, onTitleChange]
  )

  const handlePrompt = useCallback(
    (text: string) => {
      setInput(text)
    },
    []
  )

  const handleClearChat = useCallback(() => {
    setMessages([])
    isFirstMessage.current = true
    setErrorMsg(null)
  }, [setMessages])

  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return
    const lastUserText = lastUserMsg.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { type: 'text'; text: string }).text)
      .join('')
    const withoutLast = messages.slice(0, -1)
    setMessages(withoutLast)
    sendMessage({ text: lastUserText })
  }, [messages, sendMessage, setMessages])

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      {messages.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-medium text-gray-700 truncate">
            {initialTitle ?? 'New conversation'}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClearChat}
            title="Clear conversation"
            aria-label="Clear conversation"
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onPrompt={handlePrompt} />
        ) : (
          <div className="py-6">
            {messages.map((m, i) => (
              <ChatMessage
                key={m.id}
                message={m}
                isLast={i === messages.length - 1}
                isStreaming={isLoading && i === messages.length - 1 && m.role === 'assistant'}
                onRegenerate={
                  i === messages.length - 1 && m.role === 'assistant' ? handleRegenerate : undefined
                }
                userImage={session?.user?.image}
                userName={session?.user?.name}
              />
            ))}

            {isLoading && (
              messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 mb-6 px-4">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="2.5" fill="white" />
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="shrink-0 mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs border border-red-100">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4">
        {!session && messages.length > 2 && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs text-indigo-700">
              <a href="/signup" className="font-semibold hover:underline">Sign up free</a>{' '}
              to save your conversations and access chat history.
            </p>
          </div>
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          isLoading={isLoading}
        />
        <p className="text-center text-xs text-gray-300 mt-2.5">
          Life OS can make mistakes. Verify important decisions independently.
        </p>
      </div>
    </div>
  )
}
