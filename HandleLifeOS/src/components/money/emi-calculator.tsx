'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateLoanTotals } from '@/lib/money-ai'
import { BookmarkPlus, Calculator } from 'lucide-react'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

interface Props {
  currency?: string
  onSave?: (loan: { name: string; principal: number; annual_rate: number; tenure_months: number; emi_amount: number; total_interest: number; total_cost: number }) => void
}

export function EMICalculator({ currency = 'INR', onSave }: Props) {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('')
  const [tenure, setTenure] = useState('')
  const [result, setResult] = useState<{ emi: number; totalInterest: number; totalCost: number } | null>(null)
  const [name, setName] = useState('My Loan')

  function calculate() {
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const n = parseInt(tenure)
    if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || isNaN(n) || n <= 0) return
    setResult(calculateLoanTotals(p, r, n))
  }

  function handleSave() {
    if (!result) return
    const p = parseFloat(principal)
    const r = parseFloat(rate)
    const n = parseInt(tenure)
    onSave?.({ name, principal: p, annual_rate: r, tenure_months: n, emi_amount: result.emi, total_interest: result.totalInterest, total_cost: result.totalCost })
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-700">EMI Calculator</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="principal" className="text-xs">Loan amount ({currency})</Label>
          <Input id="principal" type="number" min="1" placeholder="500000" value={principal} onChange={e => setPrincipal(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="rate" className="text-xs">Interest rate (% p.a.)</Label>
          <Input id="rate" type="number" min="0" step="0.1" placeholder="9.5" value={rate} onChange={e => setRate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tenure" className="text-xs">Tenure (months)</Label>
          <Input id="tenure" type="number" min="1" placeholder="60" value={tenure} onChange={e => setTenure(e.target.value)} className="mt-1" />
        </div>
      </div>

      <Button onClick={calculate} className="w-full">Calculate EMI</Button>

      {result && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Monthly EMI</p>
              <p className="text-lg font-bold text-indigo-700">{fmt(result.emi, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total interest</p>
              <p className="text-lg font-bold text-orange-600">{fmt(result.totalInterest, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total cost</p>
              <p className="text-lg font-bold text-gray-900">{fmt(result.totalCost, currency)}</p>
            </div>
          </div>
          {onSave && (
            <div className="flex items-center gap-2 pt-1 border-t border-indigo-100">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Loan name"
                className="text-sm h-8"
              />
              <Button size="sm" variant="outline" onClick={handleSave} className="shrink-0 gap-1">
                <BookmarkPlus className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
