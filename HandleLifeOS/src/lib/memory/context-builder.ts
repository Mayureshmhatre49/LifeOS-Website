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

// Strip characters that could act as prompt injection vectors from memory values.
// Memory is DB-stored user content — sanitize before injecting into system prompts.
function sanitizeMemoryValue(raw: string): string {
  return raw
    .replace(/---/g, '—')           // neutralize fence markers used in prompt structure
    .replace(/\{\{.*?\}\}/g, '')    // strip template injection tokens  {{...}}
    .replace(/<\|.*?\|>/g, '')      // strip LLM token delimiters  <|...|>
    .replace(/\[INST\]|\[\/INST\]/gi, '')  // strip Llama instruction tokens
    .replace(/^(system|user|assistant)\s*:/gim, '')  // neutralize role prefixes
    .slice(0, 200)                  // hard-cap each value (was already short, explicit defence)
    .trim()
}

export function formatMemoryForPrompt(ctx: MemoryContext): string {
  if (!ctx.profile?.memory_enabled) return ''

  const lines: string[] = []

  if (ctx.profile) {
    const p = ctx.profile
    const parts: string[] = []
    if (p.display_name) parts.push(`name: ${sanitizeMemoryValue(p.display_name)}`)
    if (p.occupation) parts.push(`occupation: ${sanitizeMemoryValue(p.occupation)}`)
    if (p.life_stage) parts.push(`life stage: ${p.life_stage.replaceAll('_', ' ')}`)
    if (p.country) parts.push(`country: ${sanitizeMemoryValue(p.country)}`)
    if (p.currency) parts.push(`currency: ${sanitizeMemoryValue(p.currency)}`)
    if (p.timezone) parts.push(`timezone: ${sanitizeMemoryValue(p.timezone)}`)
    if (p.goals?.length) parts.push(`goals: ${p.goals.map(sanitizeMemoryValue).join(', ')}`)
    if (parts.length) lines.push(`User profile — ${parts.join(' | ')}`)
  }

  if (ctx.items.length) {
    const grouped: Record<string, string[]> = {}
    for (const item of ctx.items) {
      if (!grouped[item.type]) grouped[item.type] = []
      const safeKey = sanitizeMemoryValue(item.key)
      const safeVal = sanitizeMemoryValue(item.value)
      grouped[item.type].push(`${safeKey}: ${safeVal}`)
    }
    for (const [type, facts] of Object.entries(grouped)) {
      const label = type.charAt(0).toUpperCase() + type.slice(1)
      lines.push(`${label}s — ${facts.join(' | ')}`)
    }
  }

  if (ctx.preferences.length) {
    const prefLines = ctx.preferences.map((p) =>
      `${sanitizeMemoryValue(p.category)}/${sanitizeMemoryValue(p.key)}: ${sanitizeMemoryValue(p.value)}`
    )
    lines.push(`Preferences — ${prefLines.join(' | ')}`)
  }

  if (!lines.length) return ''

  return `\n\n--- User Memory (use naturally, don't quote verbatim) ---\n${lines.join('\n')}\n---`
}
