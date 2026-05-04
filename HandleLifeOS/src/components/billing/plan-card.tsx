'use client'

import { Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatPrice, yearlyDiscount } from '@/lib/billing/plans'
import type { Plan, BillingInterval } from '@/types/billing'

interface PlanCardProps {
  plan: Plan
  interval: BillingInterval
  currentPlanId?: string
  onSelect: (plan: Plan) => void
  loading?: boolean
}

export function PlanCard({ plan, interval, currentPlanId, onSelect, loading }: PlanCardProps) {
  const isCurrent = plan.id === currentPlanId
  const isFree = plan.monthlyPriceINR === 0
  const discount = yearlyDiscount(plan)
  const price = formatPrice(
    interval === 'yearly' ? plan.yearlyPriceINR : plan.monthlyPriceINR,
    interval
  )

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-shadow',
        plan.highlighted
          ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
          : 'border-gray-200 bg-white'
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            <Zap className="h-3 w-3" />
            Most popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{plan.tagline}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{isFree ? 'Free' : price}</span>
          {!isFree && interval === 'yearly' && (
            <span className="text-sm text-gray-400">billed ₹{plan.yearlyPriceINR}/yr</span>
          )}
        </div>
        {!isFree && interval === 'yearly' && discount > 0 && (
          <p className="text-xs text-green-600 font-medium mt-1">Save {discount}% vs monthly</p>
        )}
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
            <Check className={cn('h-4 w-4 shrink-0 mt-0.5', plan.highlighted ? 'text-indigo-600' : 'text-green-600')} />
            {feature}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="text-center py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl">
          Current plan
        </div>
      ) : isFree ? (
        <div className="text-center py-2 text-sm text-gray-400">Always free</div>
      ) : (
        <Button
          onClick={() => onSelect(plan)}
          disabled={loading}
          className={cn(
            'w-full',
            plan.highlighted
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          )}
        >
          {loading ? 'Processing…' : `Upgrade to ${plan.name}`}
        </Button>
      )}
    </div>
  )
}
