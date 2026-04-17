'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'

function ChatPageInner() {
  const searchParams = useSearchParams()
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt) {
      setInitialPrompt(decodeURIComponent(prompt))
      window.history.replaceState({}, '', '/chat')
    }
  }, [searchParams])

  return <ChatInterface key={initialPrompt ?? 'new'} />
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <ChatPageInner />
    </Suspense>
  )
}
