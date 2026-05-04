// In-memory OTP store — ephemeral, not persisted (intentional: OTPs are transient)
// Entries are stored as SHA-256 hashes, never plaintext, to prevent leak via heap
// snapshot or memory dump.
import crypto from 'crypto'

interface OTPRecord {
  otpHash: string
  expires: number
  attempts: number
  userId: string
  purpose: string
}

const store = new Map<string, OTPRecord>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (record.expires < now) store.delete(key)
  }
}, 5 * 60_000)

/**
 * Cryptographically secure 6-digit OTP via crypto.randomInt (uniform distribution).
 * Math.random is not cryptographic and produces a brute-forceable space.
 */
function generateOTP(): string {
  // randomInt(min, max) — exclusive max — gives uniform 100000..999999
  const n = crypto.randomInt(100_000, 1_000_000)
  return String(n)
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

// Constant-time string comparison to defeat timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  return crypto.timingSafeEqual(bufA, bufB)
}

export function createOTP(userId: string, key: string, purpose = 'verification'): string {
  const otp = generateOTP()
  store.set(key, {
    otpHash: hashOtp(otp),
    expires: Date.now() + 10 * 60_000, // 10 minutes
    attempts: 0,
    userId,
    purpose,
  })
  return otp
}

export function verifyOTP(key: string, submittedOtp: string): { valid: boolean; reason?: string } {
  const record = store.get(key)
  if (!record) return { valid: false, reason: 'not_found' }
  if (Date.now() > record.expires) {
    store.delete(key)
    return { valid: false, reason: 'expired' }
  }
  record.attempts += 1
  if (record.attempts > 5) {
    store.delete(key)  // Burn the OTP after too many attempts
    return { valid: false, reason: 'too_many_attempts' }
  }
  // Validate shape before hashing to avoid wasted work on malformed input
  if (typeof submittedOtp !== 'string' || !/^\d{6}$/.test(submittedOtp)) {
    return { valid: false, reason: 'wrong_otp' }
  }
  const submittedHash = hashOtp(submittedOtp)
  if (!timingSafeEqual(record.otpHash, submittedHash)) {
    return { valid: false, reason: 'wrong_otp' }
  }
  store.delete(key)  // Single-use
  return { valid: true }
}
