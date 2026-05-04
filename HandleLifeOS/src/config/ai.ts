export const AI_CONFIG = {
  defaultProvider: (process.env.AI_PROVIDER ?? 'google') as 'anthropic' | 'openai' | 'google',
  models: {
    anthropic: 'claude-3-5-sonnet-20241022',
    openai: 'gpt-4o',
    google: 'gemini-flash-latest',
  },
  maxOutputTokens: 1500,
  temperature: 0.7,
  maxMessagesInContext: 20,
} as const
