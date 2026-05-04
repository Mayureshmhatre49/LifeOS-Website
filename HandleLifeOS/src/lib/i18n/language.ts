/**
 * Server-side helper: looks up the authenticated user's preferred language
 * and returns a system-prompt snippet to inject into AI calls.
 */
import { getProfile } from '@/lib/db/memory-queries'
import { languageSystemPromptSnippet, DEFAULT_LANGUAGE } from '@/config/languages'
import { isSupabaseConfigured } from '@/lib/db/client'

export async function getLanguagePromptSnippet(userId: string): Promise<string> {
  if (!isSupabaseConfigured()) return ''
  try {
    const profile = await getProfile(userId)
    const code = (profile as { preferred_language?: string } | null)?.preferred_language ?? DEFAULT_LANGUAGE
    return languageSystemPromptSnippet(code)
  } catch {
    return ''
  }
}
