import type { MemoryItemType, CreateMemoryItemInput } from '@/types/memory'

// Candidate produced by the extractor — ready to pass to saveMemory
export type MemoryCandidate = CreateMemoryItemInput & {
  source: 'chat'
  confidence: number
}

interface PatternRule {
  regex: RegExp
  type: MemoryItemType
  key: string | ((m: RegExpMatchArray) => string)
  importance: number
  // Which capture group index to use as the short value (1-based). 0 = full match.
  captureIndex: number
}

function slugKey(s: string, max = 35): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, max)
}

// Resolve pattern key (static string or function)
function resolveKey(rule: PatternRule, match: RegExpMatchArray): string {
  return typeof rule.key === 'function' ? rule.key(match) : rule.key
}

const RULES: PatternRule[] = [
  // ── FAMILY ──────────────────────────────────────────────────────
  {
    regex: /\bmy (son|daughter|child|kid|baby)\b([^.!?\n]{5,100})/i,
    type: 'relationship',
    key: (m) => `child_${m[1].toLowerCase()}`,
    importance: 9,
    captureIndex: 0,
  },
  {
    regex: /\bmy (wife|husband|spouse|partner)\b([^.!?\n]{0,80})/i,
    type: 'relationship',
    key: 'spouse',
    importance: 8,
    captureIndex: 0,
  },
  {
    regex: /\bmy (mother|father|mom|dad|brother|sister|parent)\b([^.!?\n]{0,60})/i,
    type: 'relationship',
    key: (m) => `family_${m[1].toLowerCase()}`,
    importance: 7,
    captureIndex: 0,
  },

  // ── LOCATION ────────────────────────────────────────────────────
  {
    regex: /\bi (?:live|stay|am based|reside|am settled) in ([a-zA-Z\s,]{3,50}?)(?:\.|,|$|\band\b)/i,
    type: 'fact',
    key: 'location',
    importance: 8,
    captureIndex: 1,
  },
  {
    regex: /\bi(?:'m| am) from ([a-zA-Z\s,]{3,40}?)(?:\.|,|$|\band\b)/i,
    type: 'fact',
    key: 'location',
    importance: 7,
    captureIndex: 1,
  },

  // ── OCCUPATION ──────────────────────────────────────────────────
  {
    regex: /\bi (?:work as|am currently a|am currently an) ([a-zA-Z\s]{3,60}?)(?:\.|,|$|\bat\b|\bwith\b|\band\b)/i,
    type: 'fact',
    key: 'occupation',
    importance: 8,
    captureIndex: 1,
  },
  {
    regex: /\bi(?:'m| am) (?:a|an) ([a-zA-Z\s]{3,50}?) (?:at|by|for|in|who|and|but|with|from)/i,
    type: 'fact',
    key: 'occupation',
    importance: 7,
    captureIndex: 1,
  },

  // ── GOALS ───────────────────────────────────────────────────────
  {
    regex: /\bi (?:want to|plan to|am planning to|intend to|hope to|am trying to|would like to|wish to) ([a-zA-Z\s,'-]{5,120}?)(?:\.|!|$)/i,
    type: 'goal',
    key: (m) => slugKey('goal_' + m[1], 35),
    importance: 8,
    captureIndex: 1,
  },

  // ── PREFERENCES ─────────────────────────────────────────────────
  {
    regex: /\bi (?:prefer|always prefer|like to|love to) ([a-zA-Z\s,'-]{5,80}?)(?:\.|,|$)/i,
    type: 'preference',
    key: (m) => slugKey('pref_' + m[1], 35),
    importance: 6,
    captureIndex: 1,
  },
  {
    regex: /\bi (?:don't like|hate|dislike|avoid) ([a-zA-Z\s,'-]{5,80}?)(?:\.|,|$)/i,
    type: 'preference',
    key: (m) => slugKey('avoid_' + m[1], 35),
    importance: 6,
    captureIndex: 1,
  },

  // ── FINANCIAL ───────────────────────────────────────────────────
  {
    regex: /\bmy (?:monthly )?(?:income|salary|earnings)(?: is| are) (?:around |about |approximately )?(?:₹|rs\.?|inr|usd|\$|£|€)?\s?([0-9][0-9,]*(?:\.[0-9]+)?(?:\s*(?:k|lakh|l|cr|thousand|million))?)/i,
    type: 'fact',
    key: 'monthly_income',
    importance: 8,
    captureIndex: 0,
  },
  {
    regex: /\bmy (?:monthly )?budget(?: is| are) (?:around |about |approximately )?(?:₹|rs\.?|inr|usd|\$|£|€)?\s?([0-9][0-9,]*(?:\.[0-9]+)?(?:\s*(?:k|lakh|l|cr|thousand|million))?)/i,
    type: 'fact',
    key: 'monthly_budget',
    importance: 7,
    captureIndex: 0,
  },

  // ── DIET / HEALTH ────────────────────────────────────────────────
  {
    regex: /\bi(?:'m| am) (?:a )?(?:strict )?vegetarian/i,
    type: 'preference',
    key: 'diet_vegetarian',
    importance: 7,
    captureIndex: 0,
  },
  {
    regex: /\bi(?:'m| am) (?:a )?vegan/i,
    type: 'preference',
    key: 'diet_vegan',
    importance: 7,
    captureIndex: 0,
  },
  {
    regex: /\bi(?:'m| am) (?:type [12] )?diabetic/i,
    type: 'fact',
    key: 'health_diabetic',
    importance: 9,
    captureIndex: 0,
  },
  {
    regex: /\bi have ([a-zA-Z\s]{3,40}?) (?:condition|disease|disorder|syndrome)/i,
    type: 'fact',
    key: (m) => slugKey('health_' + m[1], 35),
    importance: 9,
    captureIndex: 0,
  },

  // ── CONCERNS ────────────────────────────────────────────────────
  {
    regex: /\bi(?:'m| am) (?:worried|concerned|anxious|stressed) about ([a-zA-Z\s,'-]{5,100}?)(?:\.|!|$)/i,
    type: 'concern',
    key: (m) => slugKey('concern_' + m[1], 35),
    importance: 7,
    captureIndex: 1,
  },

  // ── HABITS ──────────────────────────────────────────────────────
  {
    regex: /\bi wake up (?:at |around )?([0-9]{1,2}(?::[0-9]{2})? ?(?:am|pm))/i,
    type: 'habit',
    key: 'wake_up_time',
    importance: 6,
    captureIndex: 1,
  },
  {
    regex: /\bi (?:sleep|go to bed|sleep at) (?:at |around )?([0-9]{1,2}(?::[0-9]{2})? ?(?:am|pm))/i,
    type: 'habit',
    key: 'sleep_time',
    importance: 5,
    captureIndex: 1,
  },
  {
    regex: /\bi (?:usually|typically|always|every day) ([a-zA-Z\s,'-]{5,80}?)(?:\.|,|$)/i,
    type: 'habit',
    key: (m) => slugKey('habit_' + m[1], 35),
    importance: 5,
    captureIndex: 1,
  },

  // ── CURRENT CONTEXT ──────────────────────────────────────────────
  {
    regex: /\bi(?:'m| am) (?:currently )?(?:building|working on|developing|launching|starting) ([a-zA-Z\s,'-]{5,80}?)(?:\.|,|$)/i,
    type: 'context',
    key: (m) => slugKey('project_' + m[1], 35),
    importance: 7,
    captureIndex: 1,
  },
  {
    regex: /\bi(?:'m| am) (?:currently )?(?:looking for a|searching for a|job hunting|seeking) ([a-zA-Z\s,'-]{5,60}?)(?:\.|,|$)/i,
    type: 'context',
    key: (m) => slugKey('seeking_' + m[1], 35),
    importance: 7,
    captureIndex: 1,
  },
]

// Trim and clean a captured value
function cleanValue(raw: string): string {
  return raw.trim().replace(/^[,\s]+|[,\s]+$/g, '').replace(/\s+/g, ' ')
}

// Minimum lengths to prevent junk extractions
const MIN_TEXT = 25
const MIN_VALUE = 3
const MAX_TEXT = 2500

export function extractMemoryCandidates(text: string): MemoryCandidate[] {
  if (text.length < MIN_TEXT) return []
  const truncated = text.slice(0, MAX_TEXT)
  const candidates: MemoryCandidate[] = []
  const seenKeys = new Set<string>()

  for (const rule of RULES) {
    const match = rule.regex.exec(truncated)
    if (!match) continue

    const rawValue =
      rule.captureIndex === 0
        ? match[0]
        : (match[rule.captureIndex] ?? match[0])
    const value = cleanValue(rawValue)

    if (value.length < MIN_VALUE) continue

    const key = resolveKey(rule, match)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    candidates.push({
      type: rule.type,
      key,
      value,
      source: 'chat',
      confidence: 85,
      importance: rule.importance,
      metadata: { extracted_from: truncated.slice(0, 200) },
    })
  }

  return candidates
}
