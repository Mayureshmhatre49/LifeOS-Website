import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Decision Checker — Life OS',
  description: 'Should you do it? Paste your situation and Life OS gives a balanced risk analysis with pros, cons, and red flags.',
}

export default function DecisionCheckerPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">🤔 Decision Checker</h1>
            <p className="text-sm text-gray-400 mt-0.5">Get a balanced view before you decide</p>
          </div>
        </div>
        <CheckInput
          type="decision"
          title="Describe your situation"
          placeholder={`Examples:\n"Should I pay a large advance to a contractor I just met?"\n"Is this investment plan too good to be true? Returns 3% per month"\n"Should I sign a 2-year lease on this apartment?"\n"Should I trust this online seller? No reviews but great price"`}
          icon="🤔"
        />
      </div>
    </div>
  )
}
