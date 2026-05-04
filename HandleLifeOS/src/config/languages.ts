export interface Language {
  code: string        // BCP-47 tag used in Web Speech API
  name: string        // English name
  nativeName: string  // Name in the language itself
  script: string      // Writing system hint for AI
  region: 'india' | 'global'
}

export const LANGUAGES: Language[] = [
  // Indian languages (primary audience)
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', script: 'Latin', region: 'india' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari', region: 'india' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'india' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'india' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'india' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'india' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'india' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'india' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'india' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'india' },
  { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'india' },
  // Global languages
  { code: 'en-US', name: 'English (US)', nativeName: 'English', script: 'Latin', region: 'global' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', script: 'Latin', region: 'global' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arabic', region: 'global' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文', script: 'Hanzi', region: 'global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin', region: 'global' },
  { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin', region: 'global' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin', region: 'global' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'Latin', region: 'global' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', script: 'Latin', region: 'global' },
]

export const DEFAULT_LANGUAGE = 'en-IN'

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}

export function languageSystemPromptSnippet(code: string): string {
  const lang = getLanguage(code)
  if (code === 'en-IN' || code === 'en-US' || code === 'en-GB') return ''
  return `\n\n## Language\nThe user's preferred language is ${lang.name} (${lang.nativeName}). Respond in ${lang.name} using the ${lang.script} script. If the user writes in English, still reply in ${lang.name} unless they explicitly ask otherwise.`
}
