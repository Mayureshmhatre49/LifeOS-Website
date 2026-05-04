import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Budget Planner — Know Where Your Money Goes',
  description: 'Set your monthly budget, track expenses by category, and get AI insights on where your money goes. Simple, visual, stress-free budgeting.',
  keywords: ['budget planner', 'monthly budget planner', 'expense tracker', 'budget app india', 'personal budget planner', 'bahi khata app', 'budget kaise banaye'],
  path: '/budget-planner',
})

export default function BudgetPlannerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            📊 Budget Planner
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Finally know<br />where your money goes
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Set your income and savings target. Track spending by category. Life OS shows you exactly where money is leaking — and how to plug it.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Start budgeting free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { emoji: '🏠', cat: 'Rent & Housing', pct: '35%' },
            { emoji: '🍽️', cat: 'Food & Dining', pct: '18%' },
            { emoji: '🚗', cat: 'Travel & Transport', pct: '12%' },
            { emoji: '🛒', cat: 'Shopping', pct: '15%' },
            { emoji: '⚡', cat: 'Bills & Utilities', pct: '10%' },
            { emoji: '🎯', cat: 'Savings', pct: '10%' },
          ].map((c) => (
            <div key={c.cat} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span className="text-2xl shrink-0">{c.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.cat}</p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-1.5">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: c.pct }} />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-500">{c.pct}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { title: 'Monthly snapshot', desc: 'See income, expenses, savings and free cash at a glance.' },
            { title: 'AI spending insights', desc: 'Get plain-English analysis of your spending patterns.' },
            { title: 'Savings goals', desc: 'Set goals for emergency fund, travel, home — and track progress.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-green-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Budgeting doesn't have to be hard</h2>
          <p className="text-green-200 mb-6">Simple. Visual. Guilt-free. Life OS makes money feel manageable.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors">
            Try it free
          </Link>
        </div>
      </div>
    </main>
  )
}
