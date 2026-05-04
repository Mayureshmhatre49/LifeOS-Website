/**
 * Client-side helper: calls /api/voice/respond and returns the text reply.
 * Supports conversation history for context across turns.
 */

export interface VoiceHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export interface VoiceAIResponse {
  text: string
  conversationId: string
}

export async function getAIResponse(
  userMessage: string,
  history: VoiceHistoryItem[] = [],
  conversationId?: string
): Promise<VoiceAIResponse> {
  const res = await fetch('/api/voice/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      // Send last 6 turns for context (3 exchanges)
      history: history.slice(-6).map((h) => ({
        role: h.role,
        content: h.content.slice(0, 400), // Truncate for speed
      })),
      conversationId,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'AI request failed')
  }

  const data = await res.json() as { text: string; conversationId?: string }
  return {
    text: data.text,
    conversationId: data.conversationId ?? crypto.randomUUID(),
  }
}
