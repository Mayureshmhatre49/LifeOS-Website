import { NextResponse } from 'next/server'
import { PLANS, PLAN_ORDER } from '@/lib/billing/plans'
import { isRazorpayConfigured } from '@/lib/billing/razorpay'

export async function GET() {
  const plans = PLAN_ORDER.map((id) => PLANS[id])
  return NextResponse.json({
    plans,
    paymentConfigured: isRazorpayConfigured(),
  })
}
