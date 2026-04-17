interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CHAT_LIMIT = 30
const CHAT_WINDOW_MS = 60 * 1000

const AUTH_LIMIT = 5
const AUTH_WINDOW_MS = 15 * 60 * 1000

function check(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetIn: entry.resetAt - now }
}

export function checkChatRateLimit(identifier: string) {
  return check(`chat:${identifier}`, CHAT_LIMIT, CHAT_WINDOW_MS)
}

export function checkAuthRateLimit(identifier: string) {
  return check(`auth:${identifier}`, AUTH_LIMIT, AUTH_WINDOW_MS)
}

export function rateLimitHeaders(remaining: number, resetIn: number) {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
    'Retry-After': String(Math.ceil(resetIn / 1000)),
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)
