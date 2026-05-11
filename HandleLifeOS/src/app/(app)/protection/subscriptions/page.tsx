import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Subscription Audit — Life OS',
  description: 'List your subscriptions and bills. Life OS finds wasteful spending and suggests where to save money.',
}

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">💸 Subscription Audit</h1>
            <p className="text-sm text-gray-400 mt-0.5">Find hidden waste in your monthly spending</p>
          </div>
        </div>
        <CheckInput
          type="subscription"
          title="List your subscriptions and bills"
          placeholder={`List your monthly subscriptions and bills:\nNetflix $15.99\nSpotify $9.99\nGym $50\nCloud storage $9.99/year\nDomain renewal $15\nMobile plan $30\n...`}
          icon="💸"
        />
      </div>
    </div>
  )
}
