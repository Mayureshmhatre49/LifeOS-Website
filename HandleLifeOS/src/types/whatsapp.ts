export interface WhatsAppSession {
  id: string
  userId: string
  phoneNumber: string
  waId: string
  displayName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WhatsAppMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface TwilioWebhookPayload {
  AccountSid: string
  MessageSid: string
  From: string
  To: string
  Body: string
  NumMedia: string
  ProfileName?: string
  WaId?: string
}

export interface WhatsAppLinkRequest {
  phoneNumber: string
}

export interface WhatsAppStatus {
  linked: boolean
  phoneNumber?: string
  displayName?: string
  linkedAt?: string
}

// ── Meta Cloud API Types ─────────────────────────────────────────────────────
export interface MetaWebhookBody {
  object: string
  entry: MetaWebhookEntry[]
}

export interface MetaWebhookEntry {
  id: string
  changes: MetaWebhookChange[]
}

export interface MetaWebhookChange {
  value: MetaWebhookValue
  field: string
}

export interface MetaWebhookValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: { profile: { name: string }; wa_id: string }[]
  messages?: MetaIncomingMessage[]
  statuses?: MetaMessageStatus[]
}

export interface MetaIncomingMessage {
  from: string
  id: string
  timestamp: string
  text?: { body: string }
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'interactive'
  interactive?: { type: string; list_reply?: { id: string; title: string } }
}

export interface MetaMessageStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
}
