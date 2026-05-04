import { en, type TranslationKey } from './locales/en'

export type Locale = 'en' | 'hi' | 'es' | 'ar' | 'fr' | 'de'

export const SUPPORTED_LOCALES: { code: Locale; label: string; nativeLabel: string; rtl?: boolean }[] = [
  { code: 'en', label: 'English',  nativeLabel: 'English'  },
  { code: 'hi', label: 'Hindi',    nativeLabel: 'हिंदी'     },
  { code: 'es', label: 'Spanish',  nativeLabel: 'Español'  },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  rtl: true },
  { code: 'fr', label: 'French',   nativeLabel: 'Français' },
  { code: 'de', label: 'German',   nativeLabel: 'Deutsch'  },
]

// Lazy-load locale dictionaries
const loaders: Record<Locale, () => Promise<Record<string, string>>> = {
  en: async () => (await import('./locales/en')).en as unknown as Record<string, string>,
  hi: async () => (await import('./locales/hi')).hi,
  es: async () => (await import('./locales/es')).es,
  ar: async () => ({}),  // placeholder
  fr: async () => ({}),  // placeholder
  de: async () => ({}),  // placeholder
}

const cache = new Map<Locale, Record<string, string>>()

export async function getDictionary(locale: Locale): Promise<Record<string, string>> {
  if (cache.has(locale)) return cache.get(locale)!
  const dict = await loaders[locale]()
  cache.set(locale, dict)
  return dict
}

// Synchronous translation with English fallback — use in client components
// after dict is already loaded via getDictionary()
export function createTranslator(dict: Record<string, string>) {
  return function t(key: TranslationKey, params?: Record<string, string>): string {
    let value = dict[key] ?? (en as Record<string, string>)[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{{${k}}}`, v)
      }
    }
    return value
  }
}

// Default English translator — always available, no async needed
export function t(key: TranslationKey, params?: Record<string, string>): string {
  return createTranslator(en as unknown as Record<string, string>)(key, params)
}

// Get locale from browser or fallback
export function getLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language.split('-')[0] as Locale
  return SUPPORTED_LOCALES.some(l => l.code === lang) ? lang : 'en'
}
