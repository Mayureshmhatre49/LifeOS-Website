import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'
import { createMemoryEvent } from '@/lib/db/memory-queries'

// Archive low-value memories that haven't been used recently.
// Thresholds (soft — can be tuned):
//   • importance < 4 unused for 90 days  → archive
//   • importance < 7 unused for 180 days → archive
//
// This function is safe to run as a background job or on-demand.
export async function decayStaleMemories(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const db = getSupabaseAdmin()
  const now = new Date()

  const threshold90 = new Date(now.getTime() - 90 * 86_400_000).toISOString()
  const threshold180 = new Date(now.getTime() - 180 * 86_400_000).toISOString()

  // Fetch candidates
  const { data } = await db
    .from('memory_items')
    .select('id, importance, last_used_at, updated_at')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!data?.length) return 0

  const toArchive: string[] = []

  for (const row of data) {
    const lastActive = row.last_used_at ?? row.updated_at
    if (row.importance < 4 && lastActive < threshold90) toArchive.push(row.id)
    else if (row.importance < 7 && lastActive < threshold180) toArchive.push(row.id)
  }

  if (!toArchive.length) return 0

  await db
    .from('memory_items')
    .update({ is_active: false, updated_at: now.toISOString() })
    .in('id', toArchive)
    .eq('user_id', userId)

  for (const id of toArchive) {
    await createMemoryEvent(userId, 'archived', id, { reason: 'decay' })
  }

  return toArchive.length
}
