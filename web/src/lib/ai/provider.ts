import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { AI_CONFIG } from '@/config/ai'

function getAnthropicModel() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return anthropic(AI_CONFIG.models.anthropic)
}

function getOpenAIModel() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return openai(AI_CONFIG.models.openai)
}

export function getAIModel() {
  const provider = AI_CONFIG.defaultProvider
  if (provider === 'openai') return getOpenAIModel()
  return getAnthropicModel()
}
