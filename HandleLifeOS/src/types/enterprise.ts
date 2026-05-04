export interface ApiKey {
  id: string
  userId: string
  name: string
  keyPrefix: string       // first 12 chars shown after creation, e.g. "lok_live_ab12"
  keyHash: string         // SHA-256 of full key, stored in DB
  lastUsedAt?: string
  requestCount: number
  isActive: boolean
  createdAt: string
}

export interface ApiKeyWithSecret extends ApiKey {
  secret: string          // full key — returned ONCE on creation only
}

export interface ApiKeyCreateRequest {
  name: string
}

export interface V1ChatRequest {
  message: string
  language?: string
}

export interface V1ChatResponse {
  text: string
  model: string
  requestId: string
}

export interface V1ProtectRequest {
  text: string
  type?: 'scam' | 'quote' | 'contract' | 'auto'
}

export interface V1ProtectResponse {
  riskLevel: 'low' | 'medium' | 'high' | 'unknown'
  summary: string
  redFlags: string[]
  recommendation: string
}

export interface V1UsageResponse {
  month: string
  aiRequests: number
  apiRequests: number
  plan: string
}
