import { generateText } from 'ai'
import { getAIModel, isMockMode } from '@/lib/ai/provider'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'
import { getBudget, getExpenses, getSavingsGoals } from '@/lib/db/money-queries'
import { buildAnalysisSystemPrompt, getCategoryHint } from './decisionPrompts'
import { normalizeResult, stripJsonFences } from './scoreDecision'
import type { DecisionInput, DecisionResult } from '@/types/decision'

// ── Financial context builder ─────────────────────────────────────────────────

async function buildFinancialContext(userId: string): Promise<{
  text: string
  snapshot: Record<string, unknown>
}> {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [budget, expenses, goals] = await Promise.all([
    getBudget(userId, month, year).catch(() => null),
    getExpenses(userId, month, year).catch(() => []),
    getSavingsGoals(userId).catch(() => []),
  ])

  const monthlySpend = expenses.reduce((s, e) => s + e.amount, 0)
  const snapshot: Record<string, unknown> = {}

  if (!budget && expenses.length === 0 && goals.length === 0) {
    return { text: '', snapshot }
  }

  const lines: string[] = []

  if (budget) {
    const income = budget.monthly_income ?? 0
    const savingsTarget = budget.savings_target ?? 0
    const spendBudget = income - savingsTarget
    const headroom = spendBudget - monthlySpend
    snapshot.monthlyIncome = income
    snapshot.savingsTarget = savingsTarget
    snapshot.monthlySpend = monthlySpend
    snapshot.headroom = headroom
    if (income > 0) lines.push(`Monthly income: ₹${income.toLocaleString('en-IN')}`)
    if (savingsTarget > 0) lines.push(`Monthly savings target: ₹${savingsTarget.toLocaleString('en-IN')}`)
    if (headroom > 0) lines.push(`Available spending headroom: ₹${headroom.toLocaleString('en-IN')}`)
    else if (headroom < 0) lines.push(`Over budget by: ₹${Math.abs(headroom).toLocaleString('en-IN')}`)
  }

  if (monthlySpend > 0) {
    lines.push(`Current month spend so far: ₹${monthlySpend.toLocaleString('en-IN')}`)
  }

  if (goals.length > 0) {
    snapshot.savingsGoals = goals.map(g => g.title)
    const goalSummary = goals
      .map(g => `${g.title} (₹${g.target_amount.toLocaleString('en-IN')})`)
      .join(', ')
    lines.push(`Active savings goals: ${goalSummary}`)
  }

  return { text: lines.join('\n'), snapshot }
}

// ── Mock fallback ─────────────────────────────────────────────────────────────

function getMockResult(): DecisionResult {
  return normalizeResult({
    summary:
      'Based on your profile, this decision has meaningful financial and lifestyle implications. The timing and approach matter significantly for a positive outcome.',
    recommendation:
      'Consider: Gather specific financial data and set a firm decision deadline within the next 2 weeks.',
    confidenceScore: 62,
    riskScore: 42,
    riskLevel: 'medium',
    financialImpact: {
      summary:
        'Connect your budget data for precise numbers. Initial estimates suggest moderate financial impact requiring 3–6 months of preparation.',
      monthlyCostChange: null,
      oneTimeCost: null,
      opportunityCost: 'Capital deployed here cannot compound elsewhere for the same period.',
      affordabilityScore: null,
    },
    timeImpact: 'Expect 2–4 weeks of active planning and 3–6 months to fully transition.',
    emotionalImpact:
      'Major decisions create short-term stress but long-term clarity once committed.',
    pros: ['Alignment with long-term goals', 'Opens new opportunities', 'Builds forward momentum'],
    cons: ['Requires upfront commitment', 'Short-term uncertainty', 'Resource allocation needed'],
    hiddenFactors: [
      'Market timing relative to your specific situation',
      'Network and social capital effects you may not have factored in',
      'Reversibility cost if you change your mind within 12 months',
    ],
    bestCase: {
      label: 'Smooth execution',
      description:
        'Decision implemented within 3 months, results visible by month 6. Confidence and momentum build naturally.',
      probability: 'possible',
    },
    worstCase: {
      label: 'Extended transition',
      description:
        'Takes 12+ months to see results. Higher stress during the transition period strains other areas.',
      probability: 'possible',
    },
    threeYearView:
      'If executed with clear milestones, this decision puts you in a materially stronger position—financially and personally—by year 3.',
    nextSteps: [
      'Define your specific success criteria for this decision',
      'Calculate the exact financial requirement with conservative estimates',
      'Set a hard decision deadline and share it with someone for accountability',
    ],
    memoryFactorsUsed: [],
    dataSourcesUsed: [],
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function analyzeDecision(
  userId: string,
  input: DecisionInput,
  isPremium: boolean,
): Promise<{ result: DecisionResult; contextSnapshot: Record<string, unknown> }> {
  if (isMockMode()) {
    return { result: getMockResult(), contextSnapshot: {} }
  }

  // Fetch memory and financial context in parallel
  const [memCtx, finCtx] = await Promise.all([
    isPremium
      ? buildMemoryContext(userId).catch(() => null)
      : Promise.resolve(null),
    buildFinancialContext(userId),
  ])

  const memoryText = memCtx ? formatMemoryForPrompt(memCtx) : ''
  const categoryHint = getCategoryHint(input.category)
  const systemPrompt = buildAnalysisSystemPrompt(memoryText, finCtx.text, isPremium)

  const userMessage = [
    `Decision question: ${input.question}`,
    input.category ? `Decision category: ${input.category}` : '',
    categoryHint ? `Key focus areas: ${categoryHint}` : '',
    input.additionalContext ? `Additional context from user: ${input.additionalContext}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const { text } = await generateText({
    model: getAIModel(),
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxOutputTokens: 1800,
    temperature: 0.35,
  })

  let result: DecisionResult
  try {
    const parsed = JSON.parse(stripJsonFences(text)) as Partial<DecisionResult>
    result = normalizeResult(parsed)
    if (finCtx.text && !result.dataSourcesUsed.includes('budget')) {
      result.dataSourcesUsed = ['budget', 'expenses', ...result.dataSourcesUsed]
    }
  } catch {
    result = getMockResult()
    result.summary = text.slice(0, 400)
  }

  const contextSnapshot = {
    ...finCtx.snapshot,
    hasMemory: !!memoryText,
    isPremium,
    analyzedAt: new Date().toISOString(),
  }

  return { result, contextSnapshot }
}
