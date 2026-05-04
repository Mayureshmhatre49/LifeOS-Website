import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Quote Checker — Is This Price Fair?',
  description: 'Paste any quote for repairs, services, or purchases. Life OS tells you if the price is fair and gives you a negotiation script.',
  keywords: ['quote checker', 'is this price fair', 'fair price checker', 'contractor quote checker', 'price comparison', 'service price checker india', 'repair quote fair'],
  path: '/quote-checker',
})

export default function QuoteCheckerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
            💰 Quote Checker
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Is this quote fair?<br />Find out instantly.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Painter, plumber, contractor, tutor, freelancer — paste the quote and Life OS estimates if it's reasonable, overpriced, or a great deal. Plus get a negotiation script.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Check a quote free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { icon: '🏠', title: 'Home services', items: ['Painting', 'Plumbing', 'Electrical', 'Carpentry', 'AC service'] },
            { icon: '🎓', title: 'Professional services', items: ['Tuition', 'Freelance design', 'Web development', 'Legal drafting'] },
            { icon: '🛒', title: 'Purchases', items: ['Electronics', 'Second-hand items', 'Vehicle repair', 'Moving services'] },
          ].map((cat) => (
            <div key={cat.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-2">{cat.title}</h3>
              <ul className="space-y-1">
                {cat.items.map((item) => (
                  <li key={item} className="text-sm text-gray-500">• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-blue-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Never overpay again</h2>
          <p className="text-blue-200 mb-6">Know the fair price before you say yes.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
            Check your quote free
          </Link>
        </div>
      </div>
    </main>
  )
}
