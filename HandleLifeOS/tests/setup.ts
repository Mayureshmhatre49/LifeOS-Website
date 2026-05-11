import { vi } from 'vitest'

// Load test environment variables
// @ts-expect-error -- vitest needs to override NODE_ENV at test bootstrap
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret-for-vitest-only-not-production'
process.env.AUTH_SECRET = 'test-secret-for-vitest-only-not-production'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-razorpay-webhook-secret'
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-key-secret'

// Ensure rate limiters don't initialise (no Upstash URL)
process.env.UPSTASH_REDIS_REST_URL = ''
process.env.UPSTASH_REDIS_REST_TOKEN = ''

// Stub Next.js server-only module (not available in vitest node environment)
vi.mock('server-only', () => ({}))

// Stub next/headers (unavailable outside Next.js request context)
vi.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => ({ get: () => null, set: () => {}, delete: () => {} }),
}))

// Stub next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: () => unknown) => fn,
}))
