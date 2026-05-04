'use client'

import { useState, useEffect } from 'react'
import type { LoanScenario } from '@/types/money'
import { EMICalculator } from './emi-calculator'
import { Trash2 } from 'lucide-react'

function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function LoanScenariosPage() {
  const [scenarios, setScenarios] = useState<LoanScenario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/money/loans').then(r => r.json()).then(d => {
      setScenarios(d.scenarios ?? [])
      setLoading(false)
    })
  }, [])

  async function handleSave(loan: { name: string; principal: number; annual_rate: number; tenure_months: number }) {
    const res = await fetch('/api/money/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loan),
    })
    const json = await res.json()
    if (json.scenario) setScenarios(prev => [json.scenario, ...prev])
  }

  async function handleDelete(id: string) {
    await fetch(`/api/money/loans?id=${id}`, { method: 'DELETE' })
    setScenarios(prev => prev.filter(s => s.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <EMICalculator onSave={handleSave} />

      {scenarios.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Saved scenarios</h3>
          <ul className="space-y-3">
            {scenarios.map(s => (
              <li key={s.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-50 bg-gray-50 p-3 group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmt(s.principal, s.currency)} at {s.annual_rate}% for {s.tenure_months} months
                  </p>
                  {s.emi_amount && (
                    <div className="flex gap-4 mt-1.5 text-xs">
                      <span className="text-indigo-700 font-medium">EMI {fmt(s.emi_amount, s.currency)}/mo</span>
                      {s.total_interest && <span className="text-orange-600">Interest {fmt(s.total_interest, s.currency)}</span>}
                      {s.total_cost && <span className="text-gray-500">Total {fmt(s.total_cost, s.currency)}</span>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                  aria-label="Delete scenario"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
