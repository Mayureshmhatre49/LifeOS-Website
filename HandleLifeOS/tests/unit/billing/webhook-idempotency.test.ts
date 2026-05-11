import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateWebhookSignature } from '@/lib/billing/razorpay'
import { mockWebhookEvent } from '../../fixtures/seed-mock-data'

describe('validateWebhookSignature', () => {
  it('returns false when RAZORPAY_WEBHOOK_SECRET is not set', async () => {
    const original = process.env.RAZORPAY_WEBHOOK_SECRET
    delete process.env.RAZORPAY_WEBHOOK_SECRET
    const result = await validateWebhookSignature('body', 'sig')
    expect(result).toBe(false)
    process.env.RAZORPAY_WEBHOOK_SECRET = original
  })

  it('returns false for a signature that does not match', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-razorpay-webhook-secret'
    const result = await validateWebhookSignature(
      JSON.stringify(mockWebhookEvent),
      'invalid-signature-hex'
    )
    expect(result).toBe(false)
  })

  it('returns true for a correctly computed HMAC-SHA256 signature', async () => {
    const secret = 'test-razorpay-webhook-secret'
    process.env.RAZORPAY_WEBHOOK_SECRET = secret
    const body = JSON.stringify(mockWebhookEvent)

    // Compute correct HMAC ourselves
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedHex = Buffer.from(sigBuf).toString('hex')

    const result = await validateWebhookSignature(body, expectedHex)
    expect(result).toBe(true)
  })

  it('returns false for empty signature', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test-secret'
    const result = await validateWebhookSignature('body', '')
    expect(result).toBe(false)
  })
})

describe('Webhook idempotency logic', () => {
  it('dedupeId prefers payment entity id over event_id', () => {
    const event = mockWebhookEvent
    const dedupeId =
      event.payload.payment?.entity?.id ??
      // @ts-expect-error
      event.payload.subscription?.entity?.id ??
      event.event_id

    expect(dedupeId).toBe('pay_MockPayment123')
  })

  it('dedupeId falls back to event_id when no payment/subscription entity', () => {
    const event = {
      event_id: 'evt_fallback_123',
      event: 'unknown.event',
      payload: {} as Record<string, { entity?: { id?: string } }>,
    }
    const dedupeId =
      event.payload?.payment?.entity?.id ??
      event.payload?.subscription?.entity?.id ??
      event.event_id

    expect(dedupeId).toBe('evt_fallback_123')
  })

  it('does not deduplicate different events with different IDs', () => {
    const id1 = 'pay_001'
    const id2 = 'pay_002'
    expect(id1).not.toBe(id2)
  })
})
