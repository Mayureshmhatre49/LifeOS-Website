import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { breadcrumbSchema, toolPageSchema } from '@/lib/seo/json-ld'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Free EMI Calculator — Home, Car & Personal Loan Monthly Payment',
  description: 'Calculate your exact EMI instantly for home, car or personal loans. See total interest, true cost and amortization. Free, instant, and mobile-friendly for India.',
  keywords: ['emi calculator', 'loan emi calculator', 'home loan emi', 'car loan emi calculator', 'personal loan emi', 'emi calculator india', 'emi kaise calculate kare'],
  path: '/emi-calculator',
})

// Safely serialize JSON-LD: replace '<' with its unicode escape to prevent
// XSS via </script> injection, as recommended by Next.js 16.2.4 docs.
function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default async function EMICalculatorPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const toolName = 'EMI Calculator'
  const toolDesc = 'Free loan EMI calculator for home, car, and personal loans in India.'
  const toolUrl = 'https://lifeos.app/emi-calculator'

  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data */}
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbSchema([
              { name: 'Home', url: 'https://lifeos.app' },
              { name: toolName, url: toolUrl },
            ])
          ),
        }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            toolPageSchema({
              name: toolName,
              description: toolDesc,
              url: toolUrl,
            })
          ),
        }}
      />

      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            🧮 EMI Calculator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Know exactly what<br />you'll pay each month
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Enter your loan amount, interest rate and tenure. Get your exact EMI, total interest and true cost — instantly. No spreadsheets, no confusion.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Calculate your EMI free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { icon: '🏠', title: 'Home loan', desc: '₹50L at 8.5% for 20 years → EMI ₹43,391 · Total interest ₹54.1L' },
            { icon: '🚗', title: 'Car loan', desc: '₹8L at 9% for 5 years → EMI ₹16,607 · Total interest ₹96,420' },
            { icon: '💳', title: 'Personal loan', desc: '₹3L at 14% for 3 years → EMI ₹10,247 · Total interest ₹68,897' },
          ].map((ex) => (
            <div key={ex.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl">{ex.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-1">{ex.title}</h3>
              <p className="text-sm text-gray-500">{ex.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { label: 'Monthly EMI', desc: 'Exact amount due each month' },
            { label: 'Total interest', desc: 'How much the bank earns from you' },
            { label: 'Total cost', desc: 'What the loan actually costs you' },
            { label: 'Loan comparison', desc: 'Compare two loans side by side' },
          ].map((f) => (
            <div key={f.label} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4">
              <span className="text-green-500 font-bold text-lg shrink-0">✓</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{f.label}</p>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Make smarter loan decisions</h2>
          <p className="text-indigo-200 mb-6">EMI calculator + loan comparator + AI guidance — all in one place.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
            Try it free
          </Link>
        </div>
      </div>
    </main>
  )
}
