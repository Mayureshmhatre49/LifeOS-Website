import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { AI_CONFIG } from '@/config/ai'

function getAnthropicModel() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured')
  const anthropic = createAnthropic({ apiKey })
  return anthropic(AI_CONFIG.models.anthropic)
}

function getOpenAIModel() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
  const openai = createOpenAI({ apiKey })
  return openai(AI_CONFIG.models.openai)
}

export function getAIModel() {
  const provider = (process.env.AI_PROVIDER ?? AI_CONFIG.defaultProvider) as typeof AI_CONFIG.defaultProvider

  if (provider === 'openai') return getOpenAIModel()
  if (provider === 'anthropic') return getAnthropicModel()

  throw new Error(`Unknown AI provider: ${provider}. Set AI_PROVIDER to 'anthropic' or 'openai'.`)
}

export function isMockMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY
}
