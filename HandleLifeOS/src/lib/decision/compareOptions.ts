import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { getBudget } from '@/lib/db/money-queries'
import { buildCompareSystemPrompt } from './decisionPrompts'
import { stripJsonFences } from './scoreDecision'
import type { DecisionInput, CompareResult } from '@/types/decision'

function buildMockCompare(question: string, options: string[]): CompareResult {
  const factors = ['Cost Impact', 'Quality of Life', 'Career Growth', 'Risk Level', 'Timeline']
  return {
    question,
    factors,
    options: options.map((opt, i) => ({
      label: opt,
      scores: {
        'Cost Impact': Math.max(1, 8 - i * 2),
        'Quality of Life': Math.min(10, 5 + i),
        'Career Growth': 6,
        'Risk Level': Math.max(1, 7 - i),
        'Timeline': Math.min(10, 5 + i),
      },
      pros: ['Viable path with clear advantages', 'Aligns with common goals'],
      cons: ['Trade-offs exist that require planning'],
      summary: `${opt} is a viable option with distinct trade-offs worth considering.`,
    })),
    recommendation: `${options[0]} appears strongest based on a balanced view, but the right choice depends on your personal priorities and risk tolerance.`,
    winner: options[0],
  }
}

export async function compareOptions(
  userId: string,
  input: DecisionInput,
  isPremium: boolean,
): Promise<{ result: CompareResult; contextSnapshot: Record<string, unknown> }> {
  const options = input.options ?? []
  if (options.length < 2) throw new Error('Comparison requires at least 2 options')

  if (isMockMode()) {
    return {
      result: buildMockCompare(input.question, options),
      contextSnapshot: {},
    }
  }

  const [memCtx, budget] = await Promise.all([
    isPremium
      ? buildMemoryContext(userId).catch(() => null)
      : Promise.resolve(null),
    getBudget(userId, new Date().getMonth() + 1, new Date().getFullYear()).catch(() => null),
  ])

  const memoryText = memCtx ? formatMemoryForPrompt(memCtx) : ''
  const finText = budget?.monthly_income
    ? `Monthly income: ₹${budget.monthly_income.toLocaleString('en-IN')}${budget.savings_target ? `, savings target: ₹${budget.savings_target.toLocaleString('en-IN')}` : ''}`
    : ''

  const systemPrompt = buildCompareSystemPrompt(memoryText, finText)
  const userMessage = [
    `Question: ${input.question}`,
    `Options to compare:\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
    input.additionalContext ? `Additional context: ${input.additionalContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const { text } = await generateText({
    model: getAIModel(),
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxOutputTokens: 2000,
    temperature: 0.3,
  })

  let result: CompareResult
  try {
    result = JSON.parse(stripJsonFences(text)) as CompareResult
  } catch {
    result = buildMockCompare(input.question, options)
  }

  return {
    result,
    contextSnapshot: {
      hasMemory: !!memoryText,
      isPremium,
      analyzedAt: new Date().toISOString(),
    },
  }
}
