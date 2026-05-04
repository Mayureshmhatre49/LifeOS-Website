import type { Metadata } from 'next'
import { ProtectionHome } from '@/components/protection/protection-home'

export const metadata: Metadata = {
  title: 'Protection — Life OS',
  description: 'Your trusted protection companion. Check for scams, analyze quotes, simplify contracts, and get negotiation help.',
}

export default function ProtectionPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <ProtectionHome />
      </div>
    </div>
  )
}
