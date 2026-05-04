import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quote Checker — Life OS',
  description: 'Paste a quote for repairs, services, or purchases. Life OS estimates fairness and gives you negotiation scripts.',
}

const QUOTE_CATEGORIES = [
  'painting', 'plumbing', 'electrical', 'repairs', 'construction',
  'tuition', 'freelance', 'electronics', 'medical', 'legal', 'other',
]

export default function QuoteCheckerPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">💰 Quote Checker</h1>
            <p className="text-sm text-gray-400 mt-0.5">Is this price fair? Get an honest assessment</p>
          </div>
        </div>
        <CheckInput
          type="quote"
          title="Describe the quote or paste it"
          placeholder={`Examples:\n"Painter quoted ₹25,000 for a 2BHK — labour + materials"\n"Plumber wants ₹8,000 to fix a tap leak"\n"Freelancer quoted ₹50,000 for a website"`}
          icon="💰"
          showAmount
          showCategory
          categories={QUOTE_CATEGORIES}
        />
      </div>
    </div>
  )
}
