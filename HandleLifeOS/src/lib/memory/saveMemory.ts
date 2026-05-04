import {
  getMemoryItemByKey,
  createMemoryItem,
  updateMemoryItem,
  createMemoryEvent,
} from '@/lib/db/memory-queries'
import type { MemoryCandidate } from './extractMemory'

// Save a memory candidate, deduplicating by key.
// If a memory with the same key already exists, updates the value (chat source only updates
// if the existing item is also chat-sourced, to avoid overwriting deliberate manual entries).
export async function saveMemoryCandidate(
  userId: string,
  candidate: MemoryCandidate,
): Promise<void> {
  const existing = await getMemoryItemByKey(userId, candidate.key)

  if (!existing) {
    const item = await createMemoryItem(userId, candidate)
    await createMemoryEvent(userId, 'created', item.id, { source: 'chat_extraction' })
    return
  }

  // Don't downgrade manual entries with lower-confidence chat extractions
  if (existing.source === 'manual') return

  // Only update if value actually changed
  if (existing.value === candidate.value) return

  await updateMemoryItem(existing.id, userId, {
    value: candidate.value,
    importance: Math.max(existing.importance, candidate.importance ?? 5),
    metadata: {
      ...existing.metadata,
      last_extracted: new Date().toISOString(),
    },
  })
  await createMemoryEvent(userId, 'updated', existing.id, { source: 'chat_extraction' })
}

// Orchestrate extraction + save for all candidates from a single chat message
export async function saveMemoryCandidates(
  userId: string,
  candidates: MemoryCandidate[],
): Promise<void> {
  for (const candidate of candidates) {
    try {
      await saveMemoryCandidate(userId, candidate)
    } catch {
      // Silent fail per candidate — never crash the chat flow
    }
  }
}
