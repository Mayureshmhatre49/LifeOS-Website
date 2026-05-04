'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UsageMeter } from '@/components/billing/usage-meter'
import { isUnlimited } from '@/lib/billing/plans'
import type { Plan, QuotaStatus, Subscription } from '@/types/billing'

interface BillingData {
  planId: string
  plan: Plan
  quota: QuotaStatus | null
  subscription: Subscription | null
}

function BillingContent() {
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === '1'

  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((r) => r.json())
      .then((d: BillingData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel() {
    if (!confirm('Cancel your subscription? You\'ll keep access until the end of your billing period.')) return
    setCancelling(true)
    try {
      await fetch('/api/billing/subscription', { method: 'DELETE' })
      setData((prev) => prev && prev.subscription
        ? { ...prev, subscription: { ...prev.subscription, cancelAtPeriodEnd: true } }
        : prev
      )
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  const plan = data?.plan
  const quota = data?.quota
  const sub = data?.subscription
  const isFree = data?.planId === 'free'

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Success banner */}
      {justUpgraded && (
        <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">You&apos;re on {plan?.name}!</p>
            <p className="text-xs text-green-600">Enjoy unlimited AI and all premium features.</p>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Current plan</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-bold text-gray-900">{plan?.name ?? '—'}</h2>
              {!isFree && (
                <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {sub?.interval ?? 'monthly'}
                </span>
              )}
            </div>
          </div>
          {isFree ? (
            <Link href="/billing/plans">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                <Zap className="h-4 w-4" />
                Upgrade
              </Button>
            </Link>
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
          )}
        </div>

        {sub && (
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              {sub.cancelAtPeriodEnd
                ? `Cancels on ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { dateStyle: 'long' })}`
                : `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { dateStyle: 'long' })}`}
            </p>
            {sub.cancelAtPeriodEnd && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Subscription scheduled to cancel</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage */}
      {quota && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Usage this month</p>
          <UsageMeter
            label="AI requests"
            used={quota.aiRequests.used}
            limit={quota.aiRequests.limit}
          />
          {!isUnlimited(quota.whatsappMessages.limit) && (
            <UsageMeter
              label="WhatsApp messages"
              used={quota.whatsappMessages.used}
              limit={quota.whatsappMessages.limit}
            />
          )}
          {quota.aiRequests.exceeded && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>You&apos;ve used all free AI requests this month. Upgrade for unlimited access.</span>
            </div>
          )}
        </div>
      )}

      {/* Plan features */}
      {plan && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">What&apos;s included</p>
          <ul className="space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isFree && (
            <Link href="/billing/plans" className="block mt-3">
              <Button variant="outline" className="w-full">
                Compare all plans
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Cancel */}
      {!isFree && sub && !sub.cancelAtPeriodEnd && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  )
}
