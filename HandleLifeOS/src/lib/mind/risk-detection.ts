// Risk detection for mental health content.
// Scans journal entries, mood notes, and companion chat input for crisis signals.
// CRITICAL: This is heuristic, not diagnostic. Always show resources, never diagnose.

export type RiskSeverity = 'none' | 'mild' | 'moderate' | 'severe'

export interface RiskAssessment {
  severity: RiskSeverity
  matches: string[]
  category: 'suicide' | 'self_harm' | 'abuse' | 'hopelessness' | 'crisis' | null
  message: string | null
}

// ── Severe: immediate crisis signals (always escalate) ─────────────────────────
const SEVERE_PATTERNS: Array<{ rx: RegExp; cat: RiskAssessment['category'] }> = [
  { rx: /\b(?:kill|end|hurt)\s+(?:my\s*self|myself)\b/i, cat: 'suicide' },
  { rx: /\bsuicid(?:e|al)\b/i, cat: 'suicide' },
  { rx: /\b(?:want|wish|going)\s+to\s+(?:die|disappear\s+forever)\b/i, cat: 'suicide' },
  { rx: /\bbetter\s+off\s+(?:dead|without\s+me)\b/i, cat: 'suicide' },
  { rx: /\b(?:no\s+reason|no\s+point)\s+(?:to\s+)?(?:live|living|going\s+on)\b/i, cat: 'suicide' },
  { rx: /\b(?:cut|cutting|harm(?:ing)?)\s+(?:my\s*self|myself)\b/i, cat: 'self_harm' },
  { rx: /\bself[-\s]?harm/i, cat: 'self_harm' },
  { rx: /\b(?:overdose|od\s+on\s+pills)\b/i, cat: 'self_harm' },
]

// ── Moderate: distress signals — show gentle support resource ──────────────────
const MODERATE_PATTERNS: Array<{ rx: RegExp; cat: RiskAssessment['category'] }> = [
  { rx: /\bhopeless(?:ness)?\b/i, cat: 'hopelessness' },
  { rx: /\bcan(?:no)?t\s+(?:go\s+on|take\s+(?:it|this)\s+anymore|cope)\b/i, cat: 'hopelessness' },
  { rx: /\b(?:nothing|nobody)\s+(?:matters|cares)\b/i, cat: 'hopelessness' },
  { rx: /\b(?:abus(?:e|ed|ive)|domestic\s+violence|hits?\s+me|beats?\s+me)\b/i, cat: 'abuse' },
  { rx: /\bunsafe\s+at\s+home\b/i, cat: 'abuse' },
  { rx: /\b(?:in|having)\s+(?:a\s+)?crisis\b/i, cat: 'crisis' },
  { rx: /\bbreak(?:ing)?\s+down\b/i, cat: 'crisis' },
]

// ── Mild: emotional flags, log but do not interrupt ────────────────────────────
const MILD_PATTERNS = [
  /\bextreme(?:ly)?\s+(?:sad|down|depressed|anxious|stressed)\b/i,
  /\boverwhelmed\b/i,
  /\bpanic\s+attack\b/i,
  /\bnumb\b/i,
  /\bworthless\b/i,
]

// Crisis helplines — globally curated. India-first but covers major regions per
// international suicide-prevention standards.
export const HELPLINES = [
  { name: 'Vandrevala Foundation',     number: '1860 2662 345',  hours: '24/7',                region: 'IN' },
  { name: 'iCall (India)',             number: '+91 9152987821', hours: 'Mon-Sat, 8am-10pm',   region: 'IN' },
  { name: 'AASRA (India)',             number: '+91 9820466726', hours: '24/7',                region: 'IN' },
  { name: '988 Suicide & Crisis Line', number: '988',            hours: '24/7',                region: 'US' },
  { name: 'Crisis Text Line',          number: 'Text HOME to 741741', hours: '24/7',           region: 'US/CA/UK' },
  { name: 'Samaritans',                number: '116 123',         hours: '24/7',                region: 'UK/IE' },
  { name: 'Lifeline Australia',        number: '13 11 14',        hours: '24/7',                region: 'AU' },
  { name: 'Befrienders Worldwide',     number: 'befrienders.org', hours: 'Find local line',    region: 'INTL' },
] as const

export function detectRisk(text: string): RiskAssessment {
  if (!text || text.length < 3) {
    return { severity: 'none', matches: [], category: null, message: null }
  }

  const matches: string[] = []
  let category: RiskAssessment['category'] = null

  // Severe wins
  for (const { rx, cat } of SEVERE_PATTERNS) {
    const m = text.match(rx)
    if (m) {
      matches.push(m[0])
      category = cat
      return {
        severity: 'severe',
        matches,
        category,
        message:
          "I hear that you're going through something really painful. " +
          "You don't have to face this alone — please reach out to someone who can help right now.",
      }
    }
  }

  // Moderate
  for (const { rx, cat } of MODERATE_PATTERNS) {
    const m = text.match(rx)
    if (m) {
      matches.push(m[0])
      category = cat
    }
  }
  if (matches.length) {
    return {
      severity: 'moderate',
      matches,
      category,
      message:
        "It sounds like you're carrying a heavy load. Talking to someone trained can help — " +
        'you deserve support.',
    }
  }

  // Mild
  for (const rx of MILD_PATTERNS) {
    const m = text.match(rx)
    if (m) matches.push(m[0])
  }
  if (matches.length) {
    return {
      severity: 'mild',
      matches,
      category: null,
      message: null,
    }
  }

  return { severity: 'none', matches: [], category: null, message: null }
}
