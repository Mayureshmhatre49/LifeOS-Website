'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlanCard } from '@/components/billing/plan-card'
import { PLAN_ORDER, PLANS } from '@/lib/billing/plans'
import type { Plan, BillingInterval, PlanId } from '@/types/billing'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function PlansPage() {
  const router = useRouter()
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('free')
  const [loading, setLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((r) => r.json())
      .then((d: { planId?: PlanId }) => { if (d.planId) setCurrentPlanId(d.planId) })
      .catch(() => {})
  }, [])

  async function handleSelect(plan: Plan) {
    if (plan.id === 'free') return
    setSelectedPlanId(plan.id)
    setLoading(true)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, interval }),
      })
      const order = await res.json() as {
        orderId: string
        amount: number
        currency: string
        keyId: string
        planId: string
        planName: string
        error?: string
      }

      if (!res.ok || order.error) {
        alert(order.error ?? 'Could not initiate payment. Please try again.')
        return
      }

      // Load Razorpay checkout script dynamically
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Life OS',
        description: `${order.planName} — ${interval}`,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              planId: order.planId,
              interval,
            }),
          })
          if (verifyRes.ok) {
            router.push('/billing?upgraded=1')
          } else {
            alert('Payment verified but activation failed. Please contact support.')
          }
        },
        theme: { color: '#4f46e5' },
      })

      rzp.open()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setSelectedPlanId(null)
    }
  }

  const plans = PLAN_ORDER.map((id) => PLANS[id])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Choose your plan</h1>
        <p className="text-gray-500 mt-1.5">Upgrade anytime. Cancel anytime.</p>

        {/* Interval toggle */}
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 mt-5">
          {(['monthly', 'yearly'] as BillingInterval[]).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                interval === i ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {i === 'monthly' ? 'Monthly' : 'Yearly'}
              {i === 'yearly' && (
                <span className="ml-1.5 text-xs text-green-600 font-semibold">Save ~30%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            interval={interval}
            currentPlanId={currentPlanId}
            onSelect={handleSelect}
            loading={loading && selectedPlanId === plan.id}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Payments processed securely via Razorpay. Prices in INR. GST may apply.
      </p>
    </div>
  )
}
