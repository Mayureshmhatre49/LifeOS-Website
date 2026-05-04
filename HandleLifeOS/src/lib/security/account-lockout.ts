// In-memory brute-force / account lockout tracker.
// For multi-instance deployments, replace the store with Redis.

const MAX_FAILURES = 5
const LOCKOUT_MS = 15 * 60 * 1000       // 15 minutes
const FAILURE_WINDOW_MS = 15 * 60 * 1000 // count failures within 15 min window

interface LockoutEntry {
  failures: number
  lockedUntil: number | null
  lastFailureAt: number
}

const store = new Map<string, LockoutEntry>()

function key(email: string) {
  return email.toLowerCase().trim()
}

export interface LockoutStatus {
  locked: boolean
  remainingMs: number
  failuresRemaining: number
}

export function checkLockout(email: string): LockoutStatus {
  const entry = store.get(key(email))
  if (!entry) return { locked: false, remainingMs: 0, failuresRemaining: MAX_FAILURES }

  const now = Date.now()

  // Lockout active
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, remainingMs: entry.lockedUntil - now, failuresRemaining: 0 }
  }

  // Lockout or window expired — clear
  if (now - entry.lastFailureAt > FAILURE_WINDOW_MS) {
    store.delete(key(email))
    return { locked: false, remainingMs: 0, failuresRemaining: MAX_FAILURES }
  }

  return {
    locked: false,
    remainingMs: 0,
    failuresRemaining: MAX_FAILURES - entry.failures,
  }
}

export function recordFailure(email: string): LockoutStatus {
  const now = Date.now()
  const k = key(email)
  const existing = store.get(k)

  // Reset window if last failure was old
  const shouldReset = !existing || (now - existing.lastFailureAt > FAILURE_WINDOW_MS)
  const failures = shouldReset ? 1 : existing!.failures + 1

  const locked = failures >= MAX_FAILURES
  const entry: LockoutEntry = {
    failures,
    lockedUntil: locked ? now + LOCKOUT_MS : null,
    lastFailureAt: now,
  }
  store.set(k, entry)

  return {
    locked,
    remainingMs: locked ? LOCKOUT_MS : 0,
    failuresRemaining: Math.max(0, MAX_FAILURES - failures),
  }
}

export function clearLockout(email: string): void {
  store.delete(key(email))
}

// Periodic cleanup of expired entries (every 30 min)
setInterval(() => {
  const now = Date.now()
  for (const [k, entry] of store) {
    const expired =
      (entry.lockedUntil && now > entry.lockedUntil) ||
      (!entry.lockedUntil && now - entry.lastFailureAt > FAILURE_WINDOW_MS)
    if (expired) store.delete(k)
  }
}, 30 * 60 * 1000)
