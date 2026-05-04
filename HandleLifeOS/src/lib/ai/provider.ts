import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { AI_CONFIG } from '@/config/ai'

function getAnthropicModel() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const baseURL = process.env.ANTHROPIC_BASE_URL
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured')
  const anthropic = createAnthropic({ apiKey, baseURL })
  return anthropic(AI_CONFIG.models.anthropic)
}

function getOpenAIModel() {
  const apiKey = process.env.OPENAI_API_KEY
  const baseURL = process.env.OPENAI_BASE_URL
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  const openai = createOpenAI({ apiKey, baseURL })
  return openai(AI_CONFIG.models.openai)
}

function getGoogleModel() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
  const google = createGoogleGenerativeAI({ apiKey })
  return google(AI_CONFIG.models.google)
}

export function getAIModel() {
  const provider = (process.env.AI_PROVIDER ?? AI_CONFIG.defaultProvider) as typeof AI_CONFIG.defaultProvider

  if (provider === 'openai') return getOpenAIModel()
  if (provider === 'anthropic') return getAnthropicModel()
  if (provider === 'google') return getGoogleModel()

  throw new Error(`Unknown AI provider: ${provider}. Set AI_PROVIDER to 'anthropic', 'openai', or 'google'.`)
}

export function isMockMode(): boolean {
  const provider = (process.env.AI_PROVIDER ?? AI_CONFIG.defaultProvider) as string
  if (provider === 'openai') return !process.env.OPENAI_API_KEY
  if (provider === 'anthropic') return !process.env.ANTHROPIC_API_KEY
  if (provider === 'google') return !process.env.GOOGLE_GEMINI_API_KEY
  // Unknown provider — fall back to mock so we don't throw at runtime
  return true
}
