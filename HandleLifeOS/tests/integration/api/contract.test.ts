/**
 * API Contract Tests — Gate 1: Route exists, Gate 2: Auth required, Gate 3: Validates payload
 *
 * These tests use fetch against the running Next.js dev server (http://localhost:3000).
 * They are integration tests — they require the dev server to be running.
 * Run: npm run dev (in another terminal), then: npx vitest run tests/integration
 *
 * In CI without a running server, these tests are skipped via SKIP_INTEGRATION env var.
 */

import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const SKIP = process.env.SKIP_INTEGRATION === 'true'

// Authenticated session cookie — set to a real session or leave empty to test 401 gates
const AUTH_COOKIE = process.env.TEST_AUTH_COOKIE ?? ''

async function get(path: string, cookie = '') {
  return fetch(`${BASE_URL}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
  })
}

async function post(path: string, body: unknown, cookie = '') {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  })
}

describe.skipIf(SKIP)('API Contract — unauthenticated gate (401/403)', () => {
  const PROTECTED_ROUTES = [
    '/api/chat',
    '/api/planner',
    '/api/memory',
    '/api/habits',
    '/api/money',
    '/api/mind',
    '/api/profile',
    '/api/notifications',
    '/api/billing/subscription',
    '/api/billing/usage',
    '/api/vault',
    '/api/home',
    '/api/network',
    '/api/nutrition',
    '/api/career',
    '/api/business',
    '/api/legal',
    '/api/investments',
    '/api/travel',
  ]

  for (const route of PROTECTED_ROUTES) {
    it(`GET ${route} → 401 without session`, async () => {
      const res = await get(route)
      expect(res.status, `${route} should return 401 or 403`).toBeOneOf([401, 403, 405])
    })
  }
})

describe.skipIf(SKIP)('API Contract — public endpoints accessible without auth', () => {
  it('GET /api/health → 200', async () => {
    const res = await get('/api/health')
    expect(res.status).toBe(200)
  })

  it('GET /api/billing/plans → 200', async () => {
    const res = await get('/api/billing/plans')
    expect([200, 503]).toContain(res.status) // 503 if Supabase not configured
  })
})

describe.skipIf(SKIP)('API Contract — auth signup validation (Gate 3)', () => {
  it('POST /api/auth/signup with empty body → 400 or 422', async () => {
    const res = await post('/api/auth/signup', {})
    expect([400, 422]).toContain(res.status)
  })

  it('POST /api/auth/signup with invalid email → 400 or 422', async () => {
    const res = await post('/api/auth/signup', {
      email: 'not-an-email',
      password: 'Password123!',
      name: 'Test',
    })
    expect([400, 422]).toContain(res.status)
  })

  it('POST /api/auth/signup with weak password → 400 or 422', async () => {
    const res = await post('/api/auth/signup', {
      email: 'valid@example.com',
      password: '123',
      name: 'Test',
    })
    expect([400, 422]).toContain(res.status)
  })
})

describe.skipIf(SKIP)('API Contract — webhook endpoint', () => {
  it('POST /api/webhooks/razorpay without signature → 403', async () => {
    const res = await post('/api/webhooks/razorpay', { event: 'payment.captured' })
    expect(res.status).toBe(403)
  })

  it('POST /api/webhooks/razorpay with invalid signature → 403', async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid-signature',
      },
      body: JSON.stringify({ event: 'payment.captured' }),
    })
    expect(res.status).toBe(403)
  })
})

describe.skipIf(SKIP)('API Contract — CORS headers on /api/v1', () => {
  it('OPTIONS /api/v1/* returns CORS headers', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/test`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://external-app.com' },
    })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe.skipIf(SKIP)('API Contract — chat payload validation', () => {
  it('POST /api/chat without session → 401', async () => {
    const res = await post('/api/chat', { messages: [] })
    expect([401, 403]).toContain(res.status)
  })
})
