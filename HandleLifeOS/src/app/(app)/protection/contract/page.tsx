import type { Metadata } from 'next'
import { CheckInput } from '@/components/protection/check-input'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contract Simplifier — Life OS',
  description: 'Paste contract clauses or terms. Life OS explains them in plain language and flags hidden risks.',
}

export default function ContractSimplifierPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/protection" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">📄 Contract Simplifier</h1>
            <p className="text-sm text-gray-400 mt-0.5">Understand what you're signing — in plain language</p>
          </div>
        </div>
        <CheckInput
          type="contract"
          title="Paste the clause or section"
          placeholder={`Paste any contract text, terms of service clause, rental agreement section, or subscription terms you want explained in plain English...`}
          icon="📄"
        />
        <p className="text-xs text-gray-400 text-center">
          Don't paste full contracts with personal info — paste only the clauses you want explained.
        </p>
      </div>
    </div>
  )
}
