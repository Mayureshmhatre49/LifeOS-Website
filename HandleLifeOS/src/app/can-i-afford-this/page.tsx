import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Can I Afford This? — AI Purchase Decision Helper',
  description: 'Wondering if you can afford a new phone, laptop, car, or trip? Ask Life OS. Get an honest, personalised answer based on your budget.',
  keywords: ['can i afford this', 'should i buy this', 'purchase decision', 'afford a car', 'afford iphone', 'buy or wait', 'kya main afford kar sakta hoon'],
  path: '/can-i-afford-this',
})

export default function CanIAffordThisPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
            🤔 Affordability Check
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            "Can I afford this?"<br />Get an honest answer.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Stop guessing. Life OS looks at your income, expenses, and savings goals — then gives you a real, guilt-free answer: yes, stretch, or not right now.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Ask for free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {[
            { q: 'Can I afford a new iPhone 15?', a: '✅ Yes — you have room this month with your current savings pace.' },
            { q: 'Should I buy a car on EMI?', a: '⚠️ Stretch — EMI would be 22% of income. Consider a smaller loan.' },
            { q: 'Can I afford a 5-day Goa trip?', a: '✅ Yes if booked 6 weeks ahead — price drops significantly.' },
            { q: 'Is now a good time to buy a laptop?', a: '⚠️ Wait — sale season in 3 weeks. Save ~15% with no budget change.' },
          ].map((ex) => (
            <div key={ex.q} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-700 italic mb-2">"{ex.q}"</p>
              <p className="text-sm text-gray-600">{ex.a}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { emoji: '🎯', title: 'Personalised', desc: 'Based on your actual income and expenses, not generic advice.' },
            { emoji: '😌', title: 'No shame', desc: 'Honest answer delivered kindly. We never judge your choices.' },
            { emoji: '💡', title: 'Alternatives', desc: 'If the answer is no, we suggest how to make it possible.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="font-semibold text-gray-900 mt-3 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-emerald-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Decide with confidence</h2>
          <p className="text-emerald-200 mb-6">No more buyer's remorse. No more missed opportunities.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
            Get your answer free
          </Link>
        </div>
      </div>
    </main>
  )
}
