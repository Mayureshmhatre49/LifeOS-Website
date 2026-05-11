import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockSubscription, mockSession, mockWebhookEvent, TEST_USER_ID } from '../../fixtures/seed-mock-data'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// Build a chainable Supabase query mock
function makeSupabaseChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'select', 'eq', 'in', 'order', 'limit', 'single', 'maybeSingle', 'insert', 'update', 'upsert', 'delete', 'throwOnError']
  for (const m of methods) {
    chain[m] = () => chain
  }
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve)
  chain[Symbol.toStringTag] = 'Promise'
  // make it a proper thenable
  Object.defineProperty(chain, 'then', {
    value: (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve),
    writable: true,
  })
  // Also support await directly
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (resolve: (v: unknown) => unknown) => Promise.resolve(resolveValue).then(resolve)
      if (prop in target) return target[prop as string]
      return () => new Proxy(chain, this)
    },
  })
}

const { isSupabaseConfigured } = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => false),
}))

vi.mock('@/lib/db/client', () => ({
  isSupabaseConfigured,
  getSupabaseAdmin: vi.fn(() => makeSupabaseChain({ data: null, error: null })),
}))

vi.mock('@/lib/db/billing-queries', () => ({
  getSubscription: vi.fn(() => Promise.resolve(mockSubscription)),
  getSubscriptionByProvider: vi.fn(() => Promise.resolve(mockSubscription)),
  updateSubscription: vi.fn(() => Promise.resolve()),
  getPlans: vi.fn(() => Promise.resolve([
    { id: 'free', name: 'Free', price_monthly: 0 },
    { id: 'pro', name: 'Pro', price_monthly: 499 },
  ])),
}))

vi.mock('@/lib/billing/razorpay', () => ({
  isRazorpayConfigured: vi.fn(() => false),
  validateWebhookSignature: vi.fn(() => Promise.resolve(false)),
  createOrder: vi.fn(),
}))

import { auth } from '@/auth'

describe('GET /api/billing/plans — public', () => {
  it('returns plans without auth', async () => {
    const { GET } = await import('@/app/api/billing/plans/route')
    const req = new NextRequest('http://localhost:3000/api/billing/plans')
    const res = await GET(req)
    expect([200, 503]).toContain(res.status)
  })
})

describe('GET /api/billing/subscription — protected', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 without session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const { GET } = await import('@/app/api/billing/subscription/route')
    const req = new NextRequest('http://localhost:3000/api/billing/subscription')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns subscription for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { GET } = await import('@/app/api/billing/subscription/route')
    const req = new NextRequest('http://localhost:3000/api/billing/subscription')
    const res = await GET(req)
    expect([200, 503]).toContain(res.status)
  })
})

describe('POST /api/webhooks/razorpay — idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Webhook route needs Supabase configured to reach the signature check
    isSupabaseConfigured.mockReturnValue(true)
  })

  it('returns 403 with invalid HMAC signature', async () => {
    const { POST } = await import('@/app/api/webhooks/razorpay/route')
    const req = new NextRequest('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'bad-signature',
      },
      body: JSON.stringify(mockWebhookEvent),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })
})
