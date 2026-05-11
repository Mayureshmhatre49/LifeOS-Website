import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Scam Check — Life OS',
  description: 'Paste a suspicious message, email, or offer. Life OS analyzes it for scam patterns and tells you what to do.',
}

export default function ScamCheckPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">🛡️ Scam Check</h1>
            <p className="text-sm text-gray-400 mt-0.5">Paste any suspicious message — we'll analyze it</p>
          </div>
        </div>
        <CheckInput
          type="scam"
          title="Paste message, email, or offer"
          placeholder={`Examples:\n"Congratulations! You've won a cash prize. Click here to claim..."\n"Urgent: Your account will be closed. Share OTP immediately."\n"Job offer: Work from home, earn big salary, no experience needed."`}
          icon="🛡️"
        />
      </div>
    </div>
  )
}
