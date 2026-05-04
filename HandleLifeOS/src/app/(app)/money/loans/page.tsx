import type { Metadata } from 'next'
import { LoanScenariosPage } from '@/components/money/loan-scenarios'

export const metadata: Metadata = {
  title: 'Loans & EMI — Life OS',
  description: 'Calculate EMIs, compare loans, and understand total costs.',
}

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Loans & EMI</h1>
        <p className="text-sm text-gray-500 mt-0.5">Calculate, compare and save loan scenarios</p>
      </div>
      <LoanScenariosPage />
    </div>
  )
}
