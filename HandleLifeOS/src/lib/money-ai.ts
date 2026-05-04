import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type {
  Budget,
  Expense,
  SavingsGoal,
  MoneySubscription,
  CreateLoanInput,
  SpendingInsightResult,
  AffordabilityResult,
  SavingsSuggestionResult,
  LoanComparisonResult,
  BillExplainerResult,
  FinancialCalmResult,
  SubscriptionOptimizationResult,
} from '@/types/money'
import { EXPENSE_CATEGORY_LABELS } from '@/types/money'

const DISCLAIMER = 'This is educational guidance only, not licensed financial advice. For major financial decisions, consult a certified financial advisor.'

// EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths
  const r = annualRate / 12 / 100
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
  return Math.round(emi * 100) / 100
}

export function calculateLoanTotals(
  principal: number,
  annualRate: number,
  tenureMonths: number
): { emi: number; totalInterest: number; totalCost: number } {
  const emi = calculateEMI(principal, annualRate, tenureMonths)
  const totalCost = Math.round(emi * tenureMonths * 100) / 100
  const totalInterest = Math.round((totalCost - principal) * 100) / 100
  return { emi, totalInterest, totalCost }
}

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return fallback
  try { return JSON.parse(match[0]) as T } catch { return fallback }
}

// ── Spending Insight ──────────────────────────────────────────────────────────

export async function generateSpendingInsight(
  expenses: Expense[],
  budget: Budget | null,
  memoryContext?: string
): Promise<SpendingInsightResult> {
  if (isMockMode() || expenses.length === 0) {
    const total = expenses.reduce((s, e) => s + e.amount, 0)
    return {
      summary: `You've spent ${budget?.currency ?? 'INR'} ${total.toLocaleString()} this month across ${expenses.length} transactions.`,
      highlights: ['Your largest spending category is food & dining.', 'You have a few recurring bills coming up.'],
      suggestions: ['Consider setting a weekly food budget.', 'Review your subscriptions for unused services.'],
      disclaimer: DISCLAIMER,
    }
  }

  const summary = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + e.amount; return acc }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `${EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat}: ${amt}`)
    .join(', ')

  const prompt = `You are a calm, non-judgmental personal finance assistant.

User's expense summary for this month (${budget?.currency ?? 'INR'}):
${summary}
${budget ? `Monthly income: ${budget.monthly_income}, Savings target: ${budget.savings_target}` : ''}
${memoryContext ? `User context: ${memoryContext}` : ''}

Provide a spending insight as JSON:
{
  "summary": "1-2 sentence overview",
  "highlights": ["2-3 notable patterns or facts"],
  "suggestions": ["2-3 actionable, non-shaming suggestions"],
  "disclaimer": "${DISCLAIMER}"
}

Tone: warm, practical, non-judgmental. No shame. Use the user's currency.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 600 })
  return parseJSON<SpendingInsightResult>(result.text, {
    summary: 'Unable to generate insight at this time.',
    highlights: [],
    suggestions: [],
    disclaimer: DISCLAIMER,
  })
}

// ── Affordability ─────────────────────────────────────────────────────────────

export async function checkAffordability(
  question: string,
  budget: Budget | null,
  monthlyExpenses: number,
  memoryContext?: string
): Promise<AffordabilityResult> {
  if (isMockMode()) {
    return {
      verdict: 'stretch',
      reasoning: 'Based on your current budget, this purchase would stretch your finances but is manageable if you cut back on discretionary spending this month.',
      monthly_impact: 'You have moderate free cash this month.',
      alternatives: ['Consider buying second-hand or refurbished.', 'Save for 2 months and buy without strain.'],
      disclaimer: DISCLAIMER,
    }
  }

  const freeCash = budget ? budget.monthly_income - budget.savings_target - monthlyExpenses : null

  const prompt = `You are a calm, practical personal finance assistant.

User question: "${question}"
${budget ? `Monthly income: ${budget.monthly_income} ${budget.currency}, Monthly expenses so far: ${monthlyExpenses}, Savings target: ${budget.savings_target}, Free cash estimate: ${freeCash}` : 'No budget data available.'}
${memoryContext ? `User context: ${memoryContext}` : ''}

Respond as JSON:
{
  "verdict": "yes" | "stretch" | "no" | "needs_context",
  "reasoning": "2-3 sentences, practical and non-shaming",
  "monthly_impact": "how this affects their month",
  "alternatives": ["1-2 alternatives or tips"],
  "disclaimer": "${DISCLAIMER}"
}

Be honest but kind. Never shame low income.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<AffordabilityResult>(result.text, {
    verdict: 'needs_context',
    reasoning: 'I need a bit more context to answer this well. Try adding your monthly budget.',
    monthly_impact: '',
    alternatives: [],
    disclaimer: DISCLAIMER,
  })
}

// ── Savings Suggestion ────────────────────────────────────────────────────────

export async function generateSavingsSuggestion(
  budget: Budget | null,
  monthlyExpenses: number,
  goals: SavingsGoal[],
  memoryContext?: string
): Promise<SavingsSuggestionResult> {
  if (isMockMode() || !budget) {
    return {
      monthly_savings_suggestion: 0,
      emergency_fund_target: 0,
      next_steps: ['Set up your monthly budget to get personalized savings suggestions.', 'Track your expenses for one month to understand your spending patterns.'],
      motivational_note: 'Every rupee saved, however small, is a step forward.',
      disclaimer: DISCLAIMER,
    }
  }

  const freeCash = budget.monthly_income - budget.savings_target - monthlyExpenses
  const goalsSummary = goals.map(g => `${g.title}: target ${g.target_amount}, saved ${g.current_amount}`).join('; ')

  const prompt = `You are a warm, encouraging personal finance coach.

Monthly income: ${budget.monthly_income} ${budget.currency}
Monthly expenses: ${monthlyExpenses}
Current savings target: ${budget.savings_target}
Estimated free cash: ${freeCash}
${goalsSummary ? `Savings goals: ${goalsSummary}` : 'No savings goals yet.'}
${memoryContext ? `User context: ${memoryContext}` : ''}

Suggest a realistic savings plan as JSON:
{
  "monthly_savings_suggestion": <number in ${budget.currency}>,
  "emergency_fund_target": <number, typically 3-6 months expenses>,
  "next_steps": ["3-4 concrete, achievable steps"],
  "motivational_note": "one encouraging sentence",
  "disclaimer": "${DISCLAIMER}"
}

Be realistic. Don't suggest saving more than free cash allows. No shame.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<SavingsSuggestionResult>(result.text, {
    monthly_savings_suggestion: Math.max(0, Math.round(freeCash * 0.2)),
    emergency_fund_target: monthlyExpenses * 3,
    next_steps: ['Start with a small automatic transfer on payday.'],
    motivational_note: 'Progress over perfection.',
    disclaimer: DISCLAIMER,
  })
}

// ── Loan Comparison ───────────────────────────────────────────────────────────

export async function compareLoans(
  loanA: CreateLoanInput,
  loanB: CreateLoanInput
): Promise<LoanComparisonResult> {
  const a = calculateLoanTotals(loanA.principal, loanA.annual_rate, loanA.tenure_months)
  const b = calculateLoanTotals(loanB.principal, loanB.annual_rate, loanB.tenure_months)

  if (isMockMode()) {
    return {
      recommendation: `${loanA.name} has a lower total cost.`,
      loan_a_summary: `EMI: ${a.emi}, Total interest: ${a.totalInterest}, Total cost: ${a.totalCost}`,
      loan_b_summary: `EMI: ${b.emi}, Total interest: ${b.totalInterest}, Total cost: ${b.totalCost}`,
      key_differences: [`${loanA.name} saves you ${(b.totalInterest - a.totalInterest).toLocaleString()} in interest.`],
      disclaimer: DISCLAIMER,
    }
  }

  const prompt = `You are a practical personal finance assistant. Compare these two loan options:

Loan A — ${loanA.name}:
  Principal: ${loanA.principal}, Rate: ${loanA.annual_rate}% p.a., Tenure: ${loanA.tenure_months} months
  EMI: ${a.emi}, Total interest: ${a.totalInterest}, Total cost: ${a.totalCost}

Loan B — ${loanB.name}:
  Principal: ${loanB.principal}, Rate: ${loanB.annual_rate}% p.a., Tenure: ${loanB.tenure_months} months
  EMI: ${b.emi}, Total interest: ${b.totalInterest}, Total cost: ${b.totalCost}

Respond as JSON:
{
  "recommendation": "which loan is better and why (1-2 sentences)",
  "loan_a_summary": "brief summary of loan A",
  "loan_b_summary": "brief summary of loan B",
  "key_differences": ["2-3 key differences to note"],
  "disclaimer": "${DISCLAIMER}"
}

Be clear and practical.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 500 })
  return parseJSON<LoanComparisonResult>(result.text, {
    recommendation: `${a.totalCost <= b.totalCost ? loanA.name : loanB.name} has the lower total cost.`,
    loan_a_summary: `EMI: ${a.emi}, Total interest: ${a.totalInterest}`,
    loan_b_summary: `EMI: ${b.emi}, Total interest: ${b.totalInterest}`,
    key_differences: [],
    disclaimer: DISCLAIMER,
  })
}

// ── Bill Explainer ────────────────────────────────────────────────────────────

export async function explainBill(billText: string): Promise<BillExplainerResult> {
  if (isMockMode()) {
    return {
      plain_language: 'This bill includes your base plan charge, a few add-on fees, and applicable taxes.',
      key_charges: [{ label: 'Base plan', amount: 'See bill' }, { label: 'Taxes', amount: 'See bill' }],
      red_flags: ['Check for auto-renewal clauses.'],
      questions_to_ask: ['Can I get a better rate if I switch to annual billing?'],
      disclaimer: DISCLAIMER,
    }
  }

  const prompt = `You are a helpful consumer finance assistant. Explain this bill/charge in plain language:

"${billText.slice(0, 2000)}"

Respond as JSON:
{
  "plain_language": "2-3 sentence plain explanation",
  "key_charges": [{"label": "charge name", "amount": "amount or description"}],
  "red_flags": ["any hidden fees, auto-renewals, or surprises"],
  "questions_to_ask": ["questions the user should ask the provider"],
  "disclaimer": "${DISCLAIMER}"
}

Be concise and consumer-friendly.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 600 })
  return parseJSON<BillExplainerResult>(result.text, {
    plain_language: 'Unable to analyze this bill. Please try again with more details.',
    key_charges: [],
    red_flags: [],
    questions_to_ask: [],
    disclaimer: DISCLAIMER,
  })
}

// ── Financial Calm Mode ───────────────────────────────────────────────────────

export async function financialCalmMode(
  message: string,
  budget: Budget | null,
  monthlyExpenses: number
): Promise<FinancialCalmResult> {
  if (isMockMode()) {
    return {
      acknowledgment: "Money stress is real. Let's take this one step at a time.",
      immediate_steps: ['Take a breath — this is manageable.', 'List all bills due this week and their amounts.', 'Focus only on what needs to be paid in the next 7 days.'],
      priority_order: ['Rent/housing first', 'Essential utilities', 'Food', 'Other bills'],
      calming_note: "You don't have to solve everything today. Small steps forward still count.",
      disclaimer: DISCLAIMER,
    }
  }

  const freeCash = budget ? budget.monthly_income - budget.savings_target - monthlyExpenses : null

  const prompt = `You are a compassionate, calm financial companion. The user is expressing money stress.

User message: "${message}"
${budget ? `Monthly income: ${budget.monthly_income} ${budget.currency}, Expenses this month: ${monthlyExpenses}, Estimated free cash: ${freeCash}` : ''}

Respond with calming, practical support as JSON:
{
  "acknowledgment": "1-2 sentences acknowledging their stress with empathy",
  "immediate_steps": ["3-4 concrete first steps they can do today or this week"],
  "priority_order": ["ordered list of what to pay first"],
  "calming_note": "one warm, encouraging closing sentence",
  "disclaimer": "${DISCLAIMER}"
}

Tone: warm, non-judgmental, stabilizing. No toxic positivity. Practical focus.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 600 })
  return parseJSON<FinancialCalmResult>(result.text, {
    acknowledgment: "Money stress is valid. Let's focus on what we can control right now.",
    immediate_steps: ['List your immediate obligations.', 'Identify any expenses you can pause.'],
    priority_order: ['Essentials first: housing, food, utilities'],
    calming_note: 'One step at a time.',
    disclaimer: DISCLAIMER,
  })
}

// ── Subscription Optimization ─────────────────────────────────────────────────

export async function optimizeSubscriptions(
  subscriptions: MoneySubscription[]
): Promise<SubscriptionOptimizationResult> {
  const active = subscriptions.filter(s => s.is_active)
  const CYCLE_MONTHS: Record<string, number> = { weekly: 0.25, monthly: 1, quarterly: 3, annual: 12 }
  const monthlyTotal = active.reduce((sum, s) => sum + s.amount / (CYCLE_MONTHS[s.billing_cycle] ?? 1), 0)
  const annualTotal = monthlyTotal * 12

  if (isMockMode() || active.length === 0) {
    return {
      monthly_total: Math.round(monthlyTotal * 100) / 100,
      annual_total: Math.round(annualTotal * 100) / 100,
      potential_savings: 0,
      waste_flags: [],
      suggestions: active.length === 0 ? ['Add your subscriptions to see optimization suggestions.'] : ['Review which subscriptions you actually used this month.'],
      disclaimer: DISCLAIMER,
    }
  }

  const subList = active.map(s => `${s.name} (${s.billing_cycle}: ${s.amount} ${s.currency}${s.category ? ', category: ' + s.category : ''})`).join('\n')

  const prompt = `You are a practical subscription optimization assistant.

User's active subscriptions:
${subList}

Monthly total: ~${Math.round(monthlyTotal)} ${active[0]?.currency ?? 'INR'}
Annual cost: ~${Math.round(annualTotal)} ${active[0]?.currency ?? 'INR'}

Analyze for waste and savings as JSON:
{
  "monthly_total": ${Math.round(monthlyTotal * 100) / 100},
  "annual_total": ${Math.round(annualTotal * 100) / 100},
  "potential_savings": <estimated monthly savings if suggestions followed>,
  "waste_flags": [{"name": "subscription name", "reason": "why it might be waste"}],
  "suggestions": ["2-4 actionable suggestions"],
  "disclaimer": "${DISCLAIMER}"
}

Look for: duplicates, low-use services, annual vs monthly savings, cheaper alternatives.`

  const result = await generateText({ model: getAIModel(), prompt, maxOutputTokens: 600 })
  return parseJSON<SubscriptionOptimizationResult>(result.text, {
    monthly_total: Math.round(monthlyTotal * 100) / 100,
    annual_total: Math.round(annualTotal * 100) / 100,
    potential_savings: 0,
    waste_flags: [],
    suggestions: ['Review your subscription list for services you rarely use.'],
    disclaimer: DISCLAIMER,
  })
}
