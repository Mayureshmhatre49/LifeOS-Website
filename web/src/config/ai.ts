export const AI_CONFIG = {
  defaultProvider: (process.env.AI_PROVIDER ?? 'anthropic') as 'anthropic' | 'openai',
  models: {
    anthropic: 'claude-sonnet-4-6',
    openai: 'gpt-4o',
  },
  systemPrompt: `You are Life OS, a personal AI assistant that helps people with everyday life decisions.
You help with: shopping decisions, quick calculations, planning, comparisons, explaining bills or documents,
and any daily life question. Be concise, practical, and friendly. Always prioritize the user's wellbeing.`,
  maxOutputTokens: 1024,
  temperature: 0.7,
} as const
