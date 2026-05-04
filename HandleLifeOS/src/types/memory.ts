export type MemoryItemType =
  | 'fact'
  | 'preference'
  | 'goal'
  | 'concern'
  | 'context'
  | 'habit'
  | 'relationship'

export type LifeStage =
  | 'student'
  | 'early_career'
  | 'mid_career'
  | 'senior'
  | 'retired'
  | 'other'

export type MemoryEventType =
  | 'created'
  | 'used'
  | 'updated'
  | 'deleted'
  | 'archived'
  | 'restored'
  | 'corrected'
  | 'exported'

export interface UserProfile {
  id: string
  display_name?: string | null
  occupation?: string | null
  life_stage?: LifeStage | null
  country: string
  currency: string
  timezone: string
  goals?: string[] | null
  memory_enabled: boolean
  onboarding_completed?: boolean
  preferred_language?: string | null
  created_at: string
  updated_at: string
}

export interface UserPreference {
  id: string
  user_id: string
  category: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface MemoryItem {
  id: string
  user_id: string
  type: MemoryItemType
  key: string
  value: string
  source: 'manual' | 'chat'
  confidence: number         // 0–100
  importance: number         // 1–10, default 5
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MemoryEvent {
  id: string
  user_id: string
  memory_id: string | null
  event_type: MemoryEventType
  created_at: string
  metadata: Record<string, unknown>
}

export interface MemoryContext {
  profile: UserProfile | null
  items: MemoryItem[]
  preferences: UserPreference[]
}

// ── Input types ──────────────────────────────────────────────────

export interface UpsertProfileInput {
  display_name?: string
  occupation?: string
  life_stage?: LifeStage
  country?: string
  currency?: string
  timezone?: string
  goals?: string[]
  memory_enabled?: boolean
  onboarding_completed?: boolean
  preferred_language?: string
}

export interface CreateMemoryItemInput {
  type: MemoryItemType
  key: string
  value: string
  source?: 'manual' | 'chat'
  confidence?: number
  importance?: number
  expires_at?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateMemoryItemInput {
  key?: string
  value?: string
  type?: MemoryItemType
  importance?: number
  is_active?: boolean
  expires_at?: string | null
  metadata?: Record<string, unknown>
}

export interface UpsertPreferenceInput {
  category: string
  key: string
  value: string
}
