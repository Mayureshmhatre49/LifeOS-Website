import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

const FOOTER_LINKS = [
  {
    title: 'Money',
    links: [
      { name: 'EMI Calculator', href: '/emi-calculator' },
      { name: 'Loan Comparison', href: '/loan-comparison' },
      { name: 'Budget Planner', href: '/budget-planner' },
      { name: 'Subscription Checker', href: '/subscription-checker' },
      { name: 'Can I Afford This?', href: '/can-i-afford-this' },
    ],
  },
  {
    title: 'Protection',
    links: [
      { name: 'Scam Checker', href: '/scam-checker' },
      { name: 'Is this a scam?', href: '/is-this-a-scam' },
      { name: 'Quote Checker', href: '/quote-checker' },
      { name: 'Contract Simplifier', href: '/contract-simplifier' },
      { name: 'Negotiation Coach', href: '/negotiation-coach' },
    ],
  },
  {
    title: 'Planning',
    links: [
      { name: 'Daily Planner', href: '/daily-planner' },
      { name: 'AI Task Planner', href: '/ai-task-planner' },
      { name: 'Routine Builder', href: '/routine-builder' },
    ],
  },
  {
    title: 'Focus',
    links: [
      { name: 'Focus Timer', href: '/focus-timer' },
      { name: 'Pomodoro AI', href: '/pomodoro-ai' },
      { name: 'Body Doubling', href: '/body-doubling' },
      { name: 'Beat Procrastination', href: '/beat-procrastination' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-gray-500 mb-6">
              Your personal AI for everyday life decisions. Built for India.
            </p>
          </div>
          
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            © 2026 Life OS. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/docs" className="hover:text-gray-600 transition-colors">Docs</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-600 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
