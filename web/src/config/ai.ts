export const AI_CONFIG = {
  defaultProvider: (process.env.AI_PROVIDER ?? 'anthropic') as 'anthropic' | 'openai',
  models: {
    anthropic: 'claude-sonnet-4-6',
    openai: 'gpt-4o',
  },
  maxOutputTokens: 1500,
  temperature: 0.7,
  maxMessagesInContext: 20,
} as const
