export type UserRole = 'user' | 'assistant' | 'system'

export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  role: UserRole
  content: string
  created_at: string
}

export interface Category {
  id: string
  label: string
  icon: string
  description: string
  starterPrompt: string
  color: string
}

export interface ChatSession {
  id: string
  messages: Message[]
}

export type AIProvider = 'anthropic' | 'openai' | 'mock'

export interface APIError {
  error: string
  code?: string
}
