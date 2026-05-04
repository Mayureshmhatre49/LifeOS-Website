import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { breadcrumbSchema, toolPageSchema } from '@/lib/seo/json-ld'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Free Scam Checker — Detect Fraud & Phishing Instantly',
  description: 'Instantly check WhatsApp messages, job offers, and UPI payment requests for fraud. Paste any message to detect scam patterns before you lose money. Free for all of India.',
  keywords: ['scam checker india', 'detect fraud online', 'is this a scam', 'whatsapp scam checker', 'upi scam protection', 'phishing detector india', 'online fraud check'],
  path: '/scam-checker',
})

// Safely serialize JSON-LD: replace '<' with its unicode escape to prevent
// XSS via </script> injection, as recommended by Next.js 16.2.4 docs.
function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default async function ScamCheckerPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const toolName = 'Scam Checker'
  const toolDesc = 'AI-powered fraud detection tool to analyze suspicious messages and offers instantly.'
  const toolUrl = 'https://lifeos.app/scam-checker'

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
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 mb-6">
            🛡️ Scam Checker
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Not sure if it's a scam?<br />Paste it. We'll tell you.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            SMS, WhatsApp messages, job offers, investment schemes, payment requests — Life OS analyzes them instantly and tells you the risk level, red flags, and what to do next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Check a message free
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { level: '🟢 Low Risk', desc: 'Looks legitimate. Here\'s why and what to verify.' },
            { level: '🟡 Medium Risk', desc: 'Some red flags. Proceed with caution.' },
            { level: '🔴 High Risk', desc: 'Strong scam indicators. Do not engage.' },
          ].map((r) => (
            <div key={r.level} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
              <p className="font-semibold text-gray-900 mb-1">{r.level}</p>
              <p className="text-sm text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: '📱', title: 'SMS & WhatsApp', desc: 'Fake OTP requests, prize claims, KYC fraud, loan scams.' },
            { icon: '📧', title: 'Emails', desc: 'Phishing, fake invoices, impersonation, urgent payment requests.' },
            { icon: '💼', title: 'Job offers', desc: 'Work-from-home scams, fake recruiter messages, advance fee fraud.' },
            { icon: '📈', title: 'Investments', desc: 'Too-good returns, pyramid schemes, fake apps, crypto fraud.' },
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

        <div className="text-center rounded-3xl bg-indigo-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Don't get cheated. Check first.</h2>
          <p className="text-indigo-200 mb-6">Free for everyone. No personal data stored.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Start checking free
          </Link>
        </div>
      </div>
    </main>
  )
}
