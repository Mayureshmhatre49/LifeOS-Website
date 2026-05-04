export const siteConfig = {
  name: 'Life OS',
  tagline: 'AI for Everyday Life',
  description:
    'AI-powered personal assistant for everyday decisions — EMI calculator, scam checker, daily planner, budget tracker, family organizer, and more. Built for India.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app',
  ogImage: '/og.png',
  links: {
    twitter: 'https://twitter.com/lifeosapp',
  },
  keywords: [
    // Core
    'AI assistant India',
    'personal AI assistant',
    'life management app',
    'AI for everyday life',
    // Money
    'EMI calculator',
    'loan EMI calculator India',
    'budget planner India',
    'subscription tracker',
    'can I afford this',
    'loan comparison India',
    // Protection
    'scam checker India',
    'fraud detector',
    'is this a scam',
    'phishing detector India',
    'contract simplifier',
    'quote checker',
    'negotiation coach',
    // Planning
    'daily planner app',
    'AI task planner',
    'routine builder',
    'weekly planner India',
    // Focus
    'focus timer app',
    'pomodoro timer AI',
    'body doubling app',
    'beat procrastination',
    // Family
    'family planner app',
    'shared grocery list India',
    'family task manager',
    'elder care reminders',
    'home organization AI',
    // Voice & Language
    'Hindi AI assistant',
    'multilingual AI India',
    'voice assistant India',
  ],
  locale: 'en_IN',
  geo: {
    region: 'IN',
    placename: 'India',
  },
}

export type SiteConfig = typeof siteConfig
