export const siteConfig = {
  name: 'Life OS',
  tagline: 'AI for Everyday Life',
  description:
    'Instant AI help for daily decisions — shopping, planning, money, scam protection, comparisons, and more. Your personal life co-pilot.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app',
  ogImage: '/og.png',
  links: {
    twitter: 'https://twitter.com/lifeosapp',
  },
  keywords: [
    'AI assistant',
    'life helper',
    'decision making',
    'shopping assistant',
    'EMI calculator',
    'scam checker',
    'daily planner',
    'money helper',
    'AI for life',
  ],
}

export type SiteConfig = typeof siteConfig
