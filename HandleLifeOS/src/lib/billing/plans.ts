import type { Plan, PlanId } from '@/types/billing'

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Try Life OS at no cost',
    monthlyPriceINR: 0,
    yearlyPriceINR: 0,
    limits: {
      aiRequestsPerMonth: 50,
      conversationsRetained: 10,
      whatsappMessages: 20,
      familyMembers: 0,
    },
    features: [
      '50 AI requests / month',
      'Scam & fraud detection',
      'EMI & loan calculator',
      'Basic task planner',
      'Focus timer',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Unlimited AI for your daily life',
    monthlyPriceINR: 299,
    yearlyPriceINR: 2499,
    limits: {
      aiRequestsPerMonth: -1,
      conversationsRetained: -1,
      whatsappMessages: -1,
      familyMembers: 0,
    },
    highlighted: true,
    features: [
      'Unlimited AI requests',
      'Everything in Free',
      'Personal memory',
      'WhatsApp access',
      'Money & budget tracker',
      'Full focus & productivity',
      'Priority AI responses',
      'Email support',
    ],
  },
  family: {
    id: 'family',
    name: 'Family',
    tagline: 'One plan for the whole household',
    monthlyPriceINR: 499,
    yearlyPriceINR: 3999,
    limits: {
      aiRequestsPerMonth: -1,
      conversationsRetained: -1,
      whatsappMessages: -1,
      familyMembers: 6,
    },
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Shared tasks & grocery',
      'Elder & child profiles',
      'Family calendar',
      'Priority AI + support',
    ],
  },
}

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'family']

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId]
}

export function isUnlimited(limit: number): boolean {
  return limit === -1
}

export function formatPrice(priceINR: number, interval: 'monthly' | 'yearly'): string {
  if (priceINR === 0) return 'Free'
  if (interval === 'yearly') {
    const monthly = Math.round(priceINR / 12)
    return `₹${monthly}/mo`
  }
  return `₹${priceINR}/mo`
}

export function yearlyDiscount(plan: Plan): number {
  if (plan.monthlyPriceINR === 0) return 0
  const annualMonthly = plan.monthlyPriceINR * 12
  return Math.round(((annualMonthly - plan.yearlyPriceINR) / annualMonthly) * 100)
}
