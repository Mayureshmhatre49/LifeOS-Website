import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Is This a Scam? — Instant AI Fraud Check',
  description: 'Wondering "is this a scam?" — paste it into Life OS. Instant AI analysis of fraud patterns, red flags, and safe next steps.',
  keywords: ['is this a scam', 'is this legit', 'scam or not', 'how to check scam', 'verify if scam', 'scam check india', 'fraud detection india'],
  path: '/is-this-a-scam',
})

export default function IsThisAScamPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 mb-6">
            🚨 Scam Detector
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            "Is this a scam?"
          </h1>
          <p className="text-xl text-gray-500 mb-6">
            Paste it. Get an instant answer.
          </p>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
            You got a suspicious message. Your gut says something's off. Life OS tells you in seconds — with the red flags, risk level, and exactly what to do next.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Check it now — free
            </Link>
          </div>
        </div>

        <div className="space-y-3 mb-16">
          {[
            '"Congratulations! You\'ve won ₹1 lakh. Click here to claim."',
            '"KYC not updated. Your account will be blocked. Share OTP."',
            '"Work from home. Earn ₹50,000/month. No experience needed."',
            '"Your package is held. Pay ₹299 customs fee to release."',
            '"I\'m from the Income Tax dept. You owe ₹18,000. Pay now."',
          ].map((msg) => (
            <div key={msg} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-800 italic">{msg}</p>
            </div>
          ))}
          <p className="text-center text-sm text-gray-400 pt-2">Life OS catches all of these — and thousands more patterns.</p>
        </div>

        <div className="text-center rounded-3xl border border-gray-100 bg-gray-50 px-8 py-10">
          <p className="text-xl font-bold text-gray-900 mb-2">Stop. Check. Stay safe.</p>
          <p className="text-sm text-gray-500 mb-5">Free to use. No credit card. Works on mobile.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
            Check a message now
          </Link>
        </div>
      </div>
    </main>
  )
}
