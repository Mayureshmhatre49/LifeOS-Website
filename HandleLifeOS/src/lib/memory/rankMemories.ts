import type { MemoryItem } from '@/types/memory'

// Score a memory item for AI context relevance.
// Higher = more likely to be included in the prompt.
export function scoreMemory(item: MemoryItem): number {
  const importanceScore = item.importance / 10  // 0–1

  const now = Date.now()
  const referenceDate = item.last_used_at ?? item.updated_at
  const ageDays = (now - new Date(referenceDate).getTime()) / 86_400_000
  // Exponential decay: half-life ~30 days
  const recencyScore = Math.exp(-ageDays / 30)

  const confidenceScore = item.confidence / 100  // 0–1

  // Importance matters most, then recency, then confidence
  return importanceScore * 0.5 + recencyScore * 0.3 + confidenceScore * 0.2
}

// Return at most `limit` items sorted by score (highest first).
// Skips expired items.
export function rankMemories(items: MemoryItem[], limit = 20): MemoryItem[] {
  const now = new Date()
  return items
    .filter((item) => !item.expires_at || new Date(item.expires_at) > now)
    .map((item) => ({ item, score: scoreMemory(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item)
}
