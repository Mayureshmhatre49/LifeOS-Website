import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Subscription Checker — Find & Cut Wasted Subscriptions',
  description: 'List all your subscriptions and let AI find which ones are wasted, duplicated, or overpriced. Cut your monthly bills in minutes.',
  keywords: ['subscription checker', 'cancel subscriptions', 'subscription tracker', 'find unused subscriptions', 'cut subscription costs', 'netflix hotstar subscription tracker india'],
  path: '/subscription-checker',
})

export default function SubscriptionCheckerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6">
            ✂️ Subscription Checker
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Stop paying for things<br />you don't use
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            The average person wastes ₹800–₹2,000 per month on forgotten or duplicate subscriptions. Life OS helps you find and cut the waste in minutes.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Check my subscriptions free
            </Link>
          </div>
        </div>

        <div className="space-y-3 mb-16">
          {[
            { name: 'Netflix', billing: 'Monthly', amount: '₹649', flag: 'Also paying for Amazon Prime — overlap?' },
            { name: 'Spotify', billing: 'Annual', amount: '₹1,189/yr', flag: null },
            { name: 'Gym membership', billing: 'Monthly', amount: '₹1,500', flag: '3 months since last check-in — still using this?' },
            { name: 'Dropbox Plus', billing: 'Annual', amount: '₹1,360/yr', flag: 'Google Drive (free 15GB) may cover your needs' },
          ].map((s) => (
            <div key={s.name} className={`rounded-xl border px-5 py-3 flex items-center justify-between ${s.flag ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
              <div>
                <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                <span className="text-gray-400 text-xs ml-2">{s.billing}</span>
                {s.flag && <p className="text-xs text-orange-700 mt-0.5">⚠ {s.flag}</p>}
              </div>
              <span className="text-sm font-semibold text-gray-700">{s.amount}</span>
            </div>
          ))}
          <p className="text-center text-xs text-gray-400 pt-1">AI finds waste patterns across all your subscriptions</p>
        </div>

        <div className="text-center rounded-3xl bg-purple-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Find your subscription waste</h2>
          <p className="text-purple-200 mb-6">Most users save ₹500–₹2,000 per month in the first check.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-purple-700 hover:bg-purple-50 transition-colors">
            Start for free
          </Link>
        </div>
      </div>
    </main>
  )
}
