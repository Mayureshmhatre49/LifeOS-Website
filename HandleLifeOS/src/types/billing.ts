export type PlanId = 'free' | 'pro' | 'family'
export type BillingInterval = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired'
export type PaymentProvider = 'razorpay' | 'stripe'

export interface PlanLimit {
  aiRequestsPerMonth: number  // -1 = unlimited
  conversationsRetained: number
  whatsappMessages: number
  familyMembers: number
}

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  monthlyPriceINR: number
  yearlyPriceINR: number
  limits: PlanLimit
  features: string[]
  highlighted?: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  interval: BillingInterval
  provider: PaymentProvider
  providerSubscriptionId?: string
  providerCustomerId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface UsageRecord {
  id: string
  userId: string
  month: string  // "YYYY-MM"
  aiRequests: number
  whatsappMessages: number
  updatedAt: string
}

export interface CheckoutSession {
  provider: PaymentProvider
  orderId?: string      // Razorpay
  sessionId?: string    // Stripe
  amount: number
  currency: string
  keyId?: string        // Razorpay public key
}

export interface QuotaStatus {
  planId: PlanId
  aiRequests: { used: number; limit: number; exceeded: boolean }
  whatsappMessages: { used: number; limit: number; exceeded: boolean }
}
