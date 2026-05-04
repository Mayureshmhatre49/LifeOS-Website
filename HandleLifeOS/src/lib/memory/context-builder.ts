import type { MemoryContext } from '@/types/memory'
import { getProfile, getMemoryItems, getPreferences, touchMemoryItems } from '@/lib/db/memory-queries'
import { rankMemories } from './rankMemories'

// Maximum memories to inject into the AI prompt (token budget)
const MAX_PROMPT_MEMORIES = 20

export async function buildMemoryContext(userId: string): Promise<MemoryContext> {
  const [profile, items, preferences] = await Promise.all([
    getProfile(userId),
    getMemoryItems(userId, true, 150, 0),
    getPreferences(userId),
  ])

  // Rank and limit for prompt efficiency
  const ranked = rankMemories(items, MAX_PROMPT_MEMORIES)

  // Track usage fire-and-forget (don't block the chat stream)
  if (ranked.length) {
    touchMemoryItems(ranked.map((i) => i.id), userId).catch(() => {})
  }

  return { profile, items: ranked, preferences }
}

export function formatMemoryForPrompt(ctx: MemoryContext): string {
  if (!ctx.profile?.memory_enabled) return ''

  const lines: string[] = []

  if (ctx.profile) {
    const p = ctx.profile
    const parts: string[] = []
    if (p.display_name) parts.push(`name: ${p.display_name}`)
    if (p.occupation) parts.push(`occupation: ${p.occupation}`)
    if (p.life_stage) parts.push(`life stage: ${p.life_stage.replace('_', ' ')}`)
    if (p.country) parts.push(`country: ${p.country}`)
    if (p.currency) parts.push(`currency: ${p.currency}`)
    if (p.timezone) parts.push(`timezone: ${p.timezone}`)
    if (p.goals?.length) parts.push(`goals: ${p.goals.join(', ')}`)
    if (parts.length) lines.push(`User profile — ${parts.join(' | ')}`)
  }

  if (ctx.items.length) {
    // Group by type for compact formatting
    const grouped: Record<string, string[]> = {}
    for (const item of ctx.items) {
      if (!grouped[item.type]) grouped[item.type] = []
      grouped[item.type].push(`${item.key}: ${item.value}`)
    }
    for (const [type, facts] of Object.entries(grouped)) {
      const label = type.charAt(0).toUpperCase() + type.slice(1)
      lines.push(`${label}s — ${facts.join(' | ')}`)
    }
  }

  if (ctx.preferences.length) {
    const prefLines = ctx.preferences.map((p) => `${p.category}/${p.key}: ${p.value}`)
    lines.push(`Preferences — ${prefLines.join(' | ')}`)
  }

  if (!lines.length) return ''

  return `\n\n--- User Memory (use naturally, don't quote verbatim) ---\n${lines.join('\n')}\n---`
}
