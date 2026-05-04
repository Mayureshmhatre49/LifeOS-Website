import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── Limits Configuration ──────────────────────────────────────────────────────
const LIMITS = {
  chat_ip:        { max: 30,  window: '60s' },
  chat_user:      { max: 60,  window: '60s' },
  auth:           { max: 5,   window: '900s' },
  signup:         { max: 3,   window: '3600s' },
  voice:          { max: 20,  window: '60s' },
  api_v1:         { max: 100, window: '60s' },
  password_reset: { max: 3,   window: '3600s' },
  whatsapp:       { max: 20,  window: '60s' },   // 20 msg/min per phone number
} as const

type LimitKey = keyof typeof LIMITS

// ── Persistent Store (Upstash) ────────────────────────────────────────────────
let ratelimit: Record<LimitKey, Ratelimit> | null = null

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

if (upstashUrl && upstashToken) {
  const redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  })

  // Pre-initialize ratelimiters for each type
  ratelimit = Object.keys(LIMITS).reduce((acc, key) => {
    const k = key as LimitKey
    const { max, window } = LIMITS[k]
    acc[k] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, window as `${number}s`),
      analytics: true,
      prefix: `@lifeos/ratelimit:${k}`,
    })
    return acc
  }, {} as Record<LimitKey, Ratelimit>)
}

// ── In-Memory Fallback Store (for Dev/Local) ──────────────────────────────────
interface RateLimitEntry {
  count: number
  resetAt: number
}
const localStore = new Map<string, RateLimitEntry>()

// Window parsing for local fallback (e.g., '60s' -> 60000ms)
function parseWindow(window: string): number {
  return parseInt(window.replace('s', '')) * 1000
}

// Auth-critical limit types that must not fall back to in-memory in production
const AUTH_CRITICAL: LimitKey[] = ['auth', 'signup', 'password_reset']

async function check(
  type: LimitKey,
  identifier: string
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  // 1. Try Upstash Persistent Rate Limiting
  if (ratelimit) {
    const result = await ratelimit[type].limit(identifier)
    return {
      success: result.success,
      remaining: result.remaining,
      resetIn: result.reset - Date.now(),
    }
  }

  // 2. No Redis configured
  if (process.env.NODE_ENV === 'production') {
    console.error(
      `[RateLimit] SECURITY: Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. ` +
      `In-memory fallback is unsafe for multi-instance deployments.`
    )
    // Fail-closed for auth endpoints — never allow brute-force bypass
    if (AUTH_CRITICAL.includes(type)) {
      return { success: false, remaining: 0, resetIn: 60000 }
    }
  }

  // 3. In-Memory Fallback (Dev mode / non-critical in production)
  const { max, window } = LIMITS[type]
  const windowMs = parseWindow(window)
  const storeKey = `${type}:${identifier}`
  const now = Date.now()
  const entry = localStore.get(storeKey)

  if (!entry || now > entry.resetAt) {
    localStore.set(storeKey, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: max - 1, resetIn: windowMs }
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { success: true, remaining: max - entry.count, resetIn: entry.resetAt - now }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function checkChatRateLimit(ip: string) {
  return check('chat_ip', ip)
}

export async function checkChatUserRateLimit(userId: string) {
  return check('chat_user', userId)
}

export async function checkAuthRateLimit(ip: string) {
  return check('auth', ip)
}

export async function checkSignupRateLimit(ip: string) {
  return check('signup', ip)
}

export async function checkVoiceRateLimit(ip: string) {
  return check('voice', ip)
}

export async function checkApiV1RateLimit(apiKeyId: string) {
  return check('api_v1', apiKeyId)
}

export async function checkPasswordResetRateLimit(email: string) {
  return check('password_reset', email.toLowerCase())
}

export async function checkWhatsAppRateLimit(phoneNumber: string) {
  return check('whatsapp', phoneNumber)
}

export function rateLimitHeaders(remaining: number, resetIn: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
    'Retry-After': String(Math.ceil(resetIn / 1000)),
  }
}

// Periodic cleanup for local store
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, entry] of localStore) {
      if (now > entry.resetAt) localStore.delete(k)
    }
  }, 5 * 60 * 1000)
}
