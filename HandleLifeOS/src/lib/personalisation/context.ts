/**
 * Builds a small, opinionated system-prompt fragment from the user's
 * personalisation preferences + their top discovered insights.
 *
 * Every AI route in the OS (chat, briefing, coach, simplify, …) can call
 * this and prepend the result to its system prompt. Result is bounded
 * (~600 chars) to avoid eating the model's context budget.
 */

import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'
import { DEFAULT_PREFERENCES, type PersonalisationPreferences, type PersonalisationInsight } from './types'

export interface PersonalisationContext {
  preferences: PersonalisationPreferences | (typeof DEFAULT_PREFERENCES & { user_id: string })
  systemFragment: string
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  warm:       'Use a warm, supportive tone. Speak like a thoughtful friend, not a coach.',
  concise:    'Be direct and concise. No filler. Short sentences. Get to the point.',
  analytical: 'Use a precise, analytical tone. Quantify where possible. Note tradeoffs.',
  playful:    'Use a light, playful tone with occasional well-placed humour. Stay useful.',
  formal:     'Use a formal, professional tone. Respectful, precise, no slang.',
}

const VERBOSITY_INSTRUCTIONS: Record<string, string> = {
  brief:    'Keep replies short — 1–3 sentences for most questions.',
  balanced: 'Match response length to the question. Avoid padding.',
  detailed: 'Provide thorough explanations with reasoning, examples, and follow-up suggestions.',
}

const PROACTIVITY_INSTRUCTIONS: Record<string, string> = {
  reactive: 'Answer only what was asked. Do not volunteer extra suggestions unless asked.',
  balanced: 'Answer the question, then add one short related suggestion if it would clearly help.',
  high:     'Answer the question, then proactively flag related actions, risks, or opportunities the user might not have noticed.',
}

/**
 * Load preferences (or defaults) and the top 3 insights for prompt injection.
 */
export async function getPersonalisationContext(userId: string): Promise<PersonalisationContext> {
  if (!isSupabaseConfigured()) {
    const fallback = { ...DEFAULT_PREFERENCES, user_id: userId }
    return {
      preferences: fallback,
      systemFragment: buildSystemFragment(fallback, []),
    }
  }

  const db = getSupabaseAdmin()
  const [prefsRes, insightsRes] = await Promise.all([
    db.from('personalisation_preferences').select('*').eq('user_id', userId).maybeSingle(),
    db.from('personalisation_insights')
      .select('kind, title, summary_md, severity')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('confidence', { ascending: false })
      .limit(3),
  ])

  const preferences = (prefsRes.data ?? { ...DEFAULT_PREFERENCES, user_id: userId }) as PersonalisationPreferences
  const insights = (insightsRes.data ?? []) as Pick<PersonalisationInsight, 'kind' | 'title' | 'summary_md' | 'severity'>[]

  return {
    preferences,
    systemFragment: buildSystemFragment(preferences, insights),
  }
}

/**
 * Cheap, synchronous helper for tests / non-DB callers.
 */
export function buildSystemFragment(
  prefs: PersonalisationPreferences | (typeof DEFAULT_PREFERENCES & { user_id: string }),
  insights: Pick<PersonalisationInsight, 'kind' | 'title' | 'summary_md' | 'severity'>[],
): string {
  if (!prefs.learning_enabled && insights.length > 0) {
    insights = []  // privacy — user opted out of pattern learning
  }

  const lines: string[] = []

  // Tone & verbosity
  lines.push('--- USER PREFERENCES ---')
  lines.push(TONE_INSTRUCTIONS[prefs.tone] ?? TONE_INSTRUCTIONS.warm)
  lines.push(VERBOSITY_INSTRUCTIONS[prefs.verbosity] ?? VERBOSITY_INSTRUCTIONS.balanced)
  lines.push(PROACTIVITY_INSTRUCTIONS[prefs.proactivity] ?? PROACTIVITY_INSTRUCTIONS.balanced)

  // Topical interests
  if (prefs.interests.length > 0) {
    lines.push(`Areas the user actively cares about: ${prefs.interests.slice(0, 8).join(', ')}.`)
  }

  // Locale
  if (prefs.currency && prefs.currency !== 'USD') {
    lines.push(`Format money values in ${prefs.currency} (Indian numbering when ${prefs.currency} = INR: lakh / crore).`)
  }

  // Discovered patterns — feed only top 3 with severity guard
  const usable = insights
    .filter(i => i.severity !== 'urgent' || prefs.proactivity !== 'reactive')
    .slice(0, 3)
  if (usable.length > 0) {
    lines.push('')
    lines.push('--- LEARNED ABOUT THIS USER (use only when relevant) ---')
    for (const i of usable) {
      // Strip markdown bold for the prompt — keep it dense
      const clean = i.summary_md.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\n+/g, ' ')
      lines.push(`• ${i.title}: ${clean.slice(0, 160)}`)
    }
  }

  lines.push('--- END PREFERENCES ---')
  return lines.join('\n')
}
