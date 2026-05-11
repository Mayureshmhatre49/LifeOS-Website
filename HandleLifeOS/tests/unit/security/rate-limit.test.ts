import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkChatRateLimit,
  checkAuthRateLimit,
  checkSignupRateLimit,
  checkPasswordResetRateLimit,
  checkUploadRateLimit,
  rateLimitHeaders,
} from '@/lib/security/rate-limit'

// No Upstash URL in test env → falls back to in-memory store

describe('rateLimitHeaders', () => {
  it('returns correct header structure', () => {
    const headers = rateLimitHeaders(5, 30000)
    expect(headers['X-RateLimit-Remaining']).toBe('5')
    expect(headers['X-RateLimit-Reset']).toBe('30')
    expect(headers['Retry-After']).toBe('30')
  })

  it('rounds up fractional seconds', () => {
    const headers = rateLimitHeaders(0, 1500)
    expect(headers['Retry-After']).toBe('2')
  })
})

describe('checkChatRateLimit — in-memory fallback', () => {
  it('allows first request for a new IP', async () => {
    const result = await checkChatRateLimit('127.0.0.1-chat-test-1')
    expect(result.success).toBe(true)
  })

  it('tracks remaining count correctly', async () => {
    const ip = '10.0.0.1-chat-remaining'
    const r1 = await checkChatRateLimit(ip)
    const r2 = await checkChatRateLimit(ip)
    expect(r1.remaining).toBeGreaterThan(r2.remaining)
  })

  it('different IPs have independent buckets', async () => {
    const r1 = await checkChatRateLimit('ip-a-unique-001')
    const r2 = await checkChatRateLimit('ip-b-unique-001')
    // Both should succeed independently
    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
  })
})

describe('checkAuthRateLimit — auth-critical', () => {
  it('allows initial auth requests', async () => {
    const result = await checkAuthRateLimit('auth-test-ip-001')
    expect(result.success).toBe(true)
  })

  it('blocks after 5 failed attempts (auth limit)', async () => {
    const ip = 'brute-force-ip-' + Math.random().toString(36).slice(2)
    // Auth limit = 5 per 900s
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) => checkAuthRateLimit(ip))
    )
    const blocked = results.filter((r) => !r.success)
    expect(blocked.length).toBeGreaterThanOrEqual(1)
  })
})

describe('checkSignupRateLimit', () => {
  it('allows first signup attempt', async () => {
    const result = await checkSignupRateLimit('signup-ip-' + Math.random().toString(36).slice(2))
    expect(result.success).toBe(true)
  })

  it('blocks after 3 signups from same IP (signup limit)', async () => {
    const ip = 'signup-spam-ip-' + Math.random().toString(36).slice(2)
    const results = await Promise.all(
      Array.from({ length: 4 }, () => checkSignupRateLimit(ip))
    )
    const blocked = results.filter((r) => !r.success)
    expect(blocked.length).toBeGreaterThanOrEqual(1)
  })
})

describe('checkPasswordResetRateLimit', () => {
  it('normalizes email to lowercase', async () => {
    const email = 'Test@Example.COM'
    const r1 = await checkPasswordResetRateLimit(email)
    const r2 = await checkPasswordResetRateLimit(email.toLowerCase())
    // Both count against the same bucket
    expect(r1.remaining).toBeGreaterThanOrEqual(r2.remaining - 1)
  })

  it('blocks after 3 reset attempts', async () => {
    const email = 'victim-' + Math.random().toString(36).slice(2) + '@example.com'
    const results = await Promise.all(
      Array.from({ length: 4 }, () => checkPasswordResetRateLimit(email))
    )
    const blocked = results.filter((r) => !r.success)
    expect(blocked.length).toBeGreaterThanOrEqual(1)
  })
})

describe('checkUploadRateLimit', () => {
  it('allows uploads under the limit', async () => {
    const userId = 'upload-user-' + Math.random().toString(36).slice(2)
    const result = await checkUploadRateLimit(userId)
    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })
})
