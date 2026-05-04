import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: "Contract Simplifier — Understand What You're Signing",
  description: 'Paste any contract clause or terms of service. Life OS explains it in plain language, flags hidden risks, and tells you what to watch out for.',
  keywords: ['contract simplifier', 'contract explainer', 'terms of service explained', 'legal clause simplifier', 'understand contract', 'rental agreement simplifier india', 'legal document explainer'],
  path: '/contract-simplifier',
})

export default function ContractSimplifierPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-6">
            📄 Contract Simplifier
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Finally understand<br />what you're signing
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Legal language is designed to confuse. Life OS translates contract clauses into plain language, flags hidden risks, and tells you exactly what to watch out for.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Simplify a contract free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: '🏠', title: 'Rental agreements', desc: 'Security deposits, maintenance clauses, early exit penalties, lock-in periods.' },
            { icon: '📱', title: 'App terms of service', desc: 'Data collection, auto-renewals, arbitration clauses, refund policies.' },
            { icon: '💼', title: 'Employment contracts', desc: 'Non-compete, IP ownership, notice period, severance terms.' },
            { icon: '🏦', title: 'Financial agreements', desc: 'Loan terms, penalty clauses, prepayment charges, insurance exclusions.' },
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

        <div className="text-center rounded-3xl bg-purple-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Read before you sign</h2>
          <p className="text-purple-200 mb-6">Plain language. Hidden risks. What to ask about.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-purple-700 hover:bg-purple-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
