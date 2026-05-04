/**
 * Razorpay integration — India-first payment gateway.
 * Uses Razorpay REST API directly (no SDK dependency needed).
 *
 * Docs: https://razorpay.com/docs/api/
 */

const RAZORPAY_API = 'https://api.razorpay.com/v1'

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

function getAuthHeader(): string {
  const keyId = process.env.RAZORPAY_KEY_ID!
  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
}

interface RazorpayOrderOptions {
  amount: number      // in paise (INR × 100)
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
  receipt: string
}

export async function createOrder(opts: RazorpayOrderOptions): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: opts.amount,
      currency: opts.currency ?? 'INR',
      receipt: opts.receipt,
      notes: opts.notes ?? {},
    }),
  })

  if (!res.ok) {
    const err = await res.json() as { error?: { description?: string } }
    throw new Error(err.error?.description ?? 'Failed to create Razorpay order')
  }

  return res.json() as Promise<RazorpayOrder>
}

/**
 * Validates the Razorpay webhook signature.
 * https://razorpay.com/docs/webhooks/validate-test/
 */
export async function validateWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const expected = Buffer.from(sigBuffer).toString('hex')
  return expected === signature
}

/**
 * Validates a Razorpay payment signature after client-side payment completion.
 * order_id + "|" + payment_id signed with key_secret.
 */
export async function validatePaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false

  const payload = `${orderId}|${paymentId}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expected = Buffer.from(sigBuffer).toString('hex')
  return expected === signature
}
