// Brute-force / account lockout tracker.
// Uses Upstash Redis when configured (required for multi-instance deployments).
// Falls back to in-memory for local development only.

import { Redis } from '@upstash/redis'

const MAX_FAILURES = 5
const LOCKOUT_MS = 15 * 60 * 1000       // 15 minutes
const FAILURE_WINDOW_MS = 15 * 60 * 1000
const LOCKOUT_TTL_S = Math.ceil(LOCKOUT_MS / 1000) + 60 // Redis TTL with buffer

interface LockoutEntry {
  failures: number
  lockedUntil: number | null
  lastFailureAt: number
}

export interface LockoutStatus {
  locked: boolean
  remainingMs: number
  failuresRemaining: number
}

// ── Redis client (when Upstash is configured) ─────────────────────────────────
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = upstashUrl && upstashToken
  ? new Redis({ url: upstashUrl, token: upstashToken })
  : null

if (!redis && process.env.NODE_ENV === 'production') {
  console.error(
    '[AccountLockout] SECURITY: Redis not configured. Account lockout state is in-memory only. ' +
    'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production multi-instance safety.'
  )
}

// ── In-memory fallback (dev only) ─────────────────────────────────────────────
const localStore = new Map<string, LockoutEntry>()

function cacheKey(email: string): string {
  return `lifeos:lockout:${email.toLowerCase().trim()}`
}

async function getEntry(email: string): Promise<LockoutEntry | null> {
  const k = cacheKey(email)
  if (redis) {
    const raw = await redis.get<LockoutEntry>(k)
    return raw ?? null
  }
  return localStore.get(k) ?? null
}

async function setEntry(email: string, entry: LockoutEntry): Promise<void> {
  const k = cacheKey(email)
  if (redis) {
    await redis.set(k, entry, { ex: LOCKOUT_TTL_S })
    return
  }
  localStore.set(k, entry)
}

async function deleteEntry(email: string): Promise<void> {
  const k = cacheKey(email)
  if (redis) {
    await redis.del(k)
    return
  }
  localStore.delete(k)
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function checkLockout(email: string): Promise<LockoutStatus> {
  const entry = await getEntry(email)
  if (!entry) return { locked: false, remainingMs: 0, failuresRemaining: MAX_FAILURES }

  const now = Date.now()

  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, remainingMs: entry.lockedUntil - now, failuresRemaining: 0 }
  }

  if (now - entry.lastFailureAt > FAILURE_WINDOW_MS) {
    await deleteEntry(email)
    return { locked: false, remainingMs: 0, failuresRemaining: MAX_FAILURES }
  }

  return {
    locked: false,
    remainingMs: 0,
    failuresRemaining: MAX_FAILURES - entry.failures,
  }
}

export async function recordFailure(email: string): Promise<LockoutStatus> {
  const now = Date.now()
  const existing = await getEntry(email)

  const shouldReset = !existing || (now - existing.lastFailureAt > FAILURE_WINDOW_MS)
  const failures = shouldReset ? 1 : existing!.failures + 1

  const locked = failures >= MAX_FAILURES
  const entry: LockoutEntry = {
    failures,
    lockedUntil: locked ? now + LOCKOUT_MS : null,
    lastFailureAt: now,
  }
  await setEntry(email, entry)

  return {
    locked,
    remainingMs: locked ? LOCKOUT_MS : 0,
    failuresRemaining: Math.max(0, MAX_FAILURES - failures),
  }
}

export async function clearLockout(email: string): Promise<void> {
  await deleteEntry(email)
}

// In-memory cleanup (dev fallback only)
if (!redis && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, entry] of localStore) {
      const expired =
        (entry.lockedUntil !== null && now > entry.lockedUntil) ||
        (entry.lockedUntil === null && now - entry.lastFailureAt > FAILURE_WINDOW_MS)
      if (expired) localStore.delete(k)
    }
  }, 30 * 60 * 1000)
}
