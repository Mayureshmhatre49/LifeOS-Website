/**
 * Meta Cloud API client for WhatsApp Business.
 * Uses Meta's Graph API v19.0 — no SDK needed.
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const META_API_VERSION = 'v19.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

function getMetaConfig() {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN

  return { accessToken, phoneNumberId, verifyToken }
}

export function isMetaConfigured(): boolean {
  const { accessToken, phoneNumberId } = getMetaConfig()
  return Boolean(accessToken && phoneNumberId)
}

// ── Send a plain text message ────────────────────────────────────────────────
export async function sendMetaTextMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { accessToken, phoneNumberId } = getMetaConfig()
  if (!accessToken || !phoneNumberId) {
    console.warn('[Meta WA] Not configured — skipping send')
    return { success: false, error: 'Meta WhatsApp not configured' }
  }

  // Meta API requires phone in E.164 without '+'
  const toClean = to.replace(/^\+/, '')

  try {
    const res = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toClean,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    })

    const data = await res.json() as { messages?: { id: string }[]; error?: { message: string } }

    if (!res.ok) {
      return { success: false, error: data.error?.message ?? 'Meta API error' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

// ── Send interactive list / buttons ─────────────────────────────────────────
export async function sendMetaInteractiveList(
  to: string,
  header: string,
  body: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
): Promise<{ success: boolean; error?: string }> {
  const { accessToken, phoneNumberId } = getMetaConfig()
  if (!accessToken || !phoneNumberId) return { success: false, error: 'Not configured' }

  const toClean = to.replace(/^\+/, '')

  try {
    const res = await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toClean,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: header },
          body: { text: body },
          footer: { text: 'Life OS · AI for Everyday Life' },
          action: {
            button: 'Choose an option',
            sections,
          },
        },
      }),
    })

    if (!res.ok) {
      const data = await res.json() as { error?: { message: string } }
      return { success: false, error: data.error?.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

// ── Mark message as read (shows double blue ticks) ───────────────────────────
export async function markMessageRead(messageId: string): Promise<void> {
  const { accessToken, phoneNumberId } = getMetaConfig()
  if (!accessToken || !phoneNumberId) return

  await fetch(`${META_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  }).catch(() => {})
}

// ── Verify webhook token for Meta verification challenge ────────────────────
export function verifyMetaWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge?: string } {
  const { verifyToken } = getMetaConfig()
  if (mode === 'subscribe' && token === verifyToken) {
    return { valid: true, challenge: challenge ?? '' }
  }
  return { valid: false }
}

// ── Parse incoming Meta webhook payload ─────────────────────────────────────
export interface MetaMessage {
  messageId: string
  from: string         // E.164 phone number e.g. "919876543210"
  text: string
  timestamp: number
  profileName?: string
}

export function parseMetaWebhook(body: Record<string, unknown>): MetaMessage | null {
  try {
    const entry = (body.entry as any[])?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value?.messages?.length) return null

    const msg = value.messages[0]
    if (msg.type !== 'text') return null  // Handle text only for now

    const profile = value?.contacts?.[0]?.profile?.name

    return {
      messageId: msg.id as string,
      from: msg.from as string,
      text: (msg.text?.body as string) ?? '',
      timestamp: parseInt(msg.timestamp as string, 10),
      profileName: profile,
    }
  } catch {
    return null
  }
}
