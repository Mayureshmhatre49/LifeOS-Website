import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Loan Comparison Tool — Which Loan Is Better?',
  description: 'Compare two loans side by side. See which has lower EMI, less total interest, and better overall value. Free loan comparison calculator.',
  keywords: ['loan comparison', 'compare loans', 'which loan is better', 'loan calculator india', 'home loan comparison', 'personal loan vs home loan', 'best loan india'],
  path: '/loan-comparison',
})

export default function LoanComparisonPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
            ⚖️ Loan Comparator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Which loan<br />saves you more?
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Two banks, two offers. Life OS compares EMI, total interest, and total cost side by side — then tells you which deal is genuinely better.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Compare loans free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: '📊', title: 'Side-by-side comparison', desc: 'See both loans on one screen — EMI, interest, and total cost.' },
            { icon: '🏆', title: 'Clear recommendation', desc: 'AI tells you which loan is better and exactly why.' },
            { icon: '💰', title: 'Interest savings', desc: 'See exactly how much you save by choosing the right loan.' },
            { icon: '📅', title: 'Tenure optimiser', desc: 'Find the sweet spot between affordable EMI and less interest.' },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-blue-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Don't guess. Compare.</h2>
          <p className="text-blue-200 mb-6">A few minutes of comparison can save lakhs over the life of a loan.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
            Start comparing free
          </Link>
        </div>
      </div>
    </main>
  )
}
