import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Life OS — Your AI Life Companion',
    short_name: 'Life OS',
    description: 'AI-powered personal life operating system for tasks, money, family, mind, career and more.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'lifestyle', 'finance', 'health'],
    icons: [
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Today',         short_name: 'Today',    url: '/today',    description: "Today's plan and schedule" },
      { name: 'Daily Briefing',short_name: 'Briefing', url: '/briefing', description: 'AI briefing across all life areas' },
      { name: 'Chat',          short_name: 'Chat',     url: '/chat',     description: 'Talk to your AI assistant' },
      { name: 'Money',         short_name: 'Money',    url: '/money',    description: 'Budget, expenses and goals' },
    ],
  }
}
