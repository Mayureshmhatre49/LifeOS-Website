export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'error'

export interface VoicePreferences {
  inputLanguage: string
  outputLanguage: string
  speechRate: number
  speechPitch: number
  autoSubmit: boolean
  readResponses: boolean
}

export interface VoiceMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  spokenAt?: Date
}

export interface VoiceSession {
  id: string
  userId: string
  messages: VoiceMessage[]
  startedAt: Date
  preferences: VoicePreferences
}

export const DEFAULT_VOICE_PREFERENCES: VoicePreferences = {
  inputLanguage: 'en-IN',
  outputLanguage: 'en-IN',
  speechRate: 0.95,
  speechPitch: 1.0,
  autoSubmit: true,
  readResponses: true,
}
