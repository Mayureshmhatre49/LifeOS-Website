import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'AI Negotiation Coach — Get the Right Script',
  description: 'Need to negotiate rent, salary, refunds, or vendor prices? Life OS writes you a polite, effective script in seconds.',
  keywords: ['negotiation coach', 'negotiation script', 'how to negotiate rent', 'salary negotiation script', 'refund request script', 'how to negotiate india', 'salary negotiation tips india'],
  path: '/negotiation-coach',
})

export default function NegotiationCoachPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            🤝 Negotiation Coach
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Don't know what to say?<br />We'll write it for you.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Tell Life OS what you want to negotiate. Get a polite, firm, or professional script — tailored to your situation, ready to use in seconds.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Get a script free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: '🏠', title: 'Rent reduction', desc: '"I\'ve been here 3 years and the market rate is lower now. Can we discuss?"' },
            { icon: '💼', title: 'Salary negotiation', desc: '"Based on market data and my contributions, I\'d like to discuss compensation."' },
            { icon: '🛒', title: 'Vendor discounts', desc: '"For bulk orders / long-term business, is there flexibility on pricing?"' },
            { icon: '↩️', title: 'Refund requests', desc: '"The product didn\'t match the description. I\'d like to request a full refund."' },
            { icon: '📱', title: 'Subscription cancellation', desc: '"I\'d like to cancel but would consider staying if there\'s a better rate."' },
            { icon: '⚡', title: 'Service disputes', desc: '"The work wasn\'t completed as agreed. Let\'s find a fair resolution."' },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{s.icon}</span>
                <span className="font-semibold text-sm text-gray-900">{s.title}</span>
              </div>
              <p className="text-xs text-gray-500 italic">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-green-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Negotiate better. Get more.</h2>
          <p className="text-green-200 mb-6">Polite, firm, or professional — your choice.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors">
            Get your script free
          </Link>
        </div>
      </div>
    </main>
  )
}
