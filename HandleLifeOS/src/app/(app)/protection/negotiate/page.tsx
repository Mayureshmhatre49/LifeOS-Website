import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Negotiation Coach — Life OS',
  description: 'Get polite, firm, or professional scripts to negotiate rent, salary, vendor prices, refunds, and more.',
}

export default function NegotiationCoachPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">🤝 Negotiation Coach</h1>
            <p className="text-sm text-gray-400 mt-0.5">Get the right words for any negotiation</p>
          </div>
        </div>
        <CheckInput
          type="subscription"
          title="Describe your negotiation situation"
          placeholder={`Examples:\n"I want to ask my landlord to reduce rent by ₹2,000. We've been tenants for 3 years."\n"Need to negotiate salary — currently offered ₹8L but market rate is ₹10L"\n"Vendor sent wrong product, want a full refund"`}
          icon="🤝"
          showAmount
          showTone
        />
      </div>
    </div>
  )
}
