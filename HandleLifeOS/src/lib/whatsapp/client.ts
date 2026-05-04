/**
 * Twilio REST client for sending WhatsApp messages.
 * Uses Twilio's Messaging API directly — no SDK dependency needed.
 */

const TWILIO_API = 'https://api.twilio.com/2010-04-01/Accounts'

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return null
  }

  return { accountSid, authToken, fromNumber }
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  )
}

export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const config = getTwilioConfig()
  if (!config) {
    console.warn('[WhatsApp] Twilio not configured — skipping message send')
    return { success: false, error: 'Twilio not configured' }
  }

  const from = config.fromNumber.startsWith('whatsapp:')
    ? config.fromNumber
    : `whatsapp:${config.fromNumber}`

  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

  const params = new URLSearchParams({
    To: toFormatted,
    From: from,
    Body: body,
  })

  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')

  try {
    const res = await fetch(
      `${TWILIO_API}/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    )

    const data = await res.json() as { sid?: string; message?: string }

    if (!res.ok) {
      return { success: false, error: data.message ?? 'Twilio API error' }
    }

    return { success: true, messageSid: data.sid }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: msg }
  }
}

/**
 * Validates the Twilio webhook signature to confirm the request is from Twilio.
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export async function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  // Build the string to sign: URL + sorted key-value pairs
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys.map((k) => k + params[k]).join('')
  const value = url + paramString

  // HMAC-SHA1
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  const expected = Buffer.from(signatureBuffer).toString('base64')

  return expected === signature
}
