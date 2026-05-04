import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { checkChatRateLimit } from '@/lib/security/rate-limit'
import {
  getBudget,
  getExpenses,
  getExpenseSummary,
  getSavingsGoals,
  getSubscriptions,
} from '@/lib/db/money-queries'
import {
  generateSpendingInsight,
  checkAffordability,
  generateSavingsSuggestion,
  compareLoans,
  explainBill,
  financialCalmMode,
  optimizeSubscriptions,
} from '@/lib/money-ai'
import { buildMemoryContext, formatMemoryForPrompt } from '@/lib/memory/context-builder'

const loanInputSchema = z.object({
  name: z.string().min(1).max(100),
  principal: z.number().positive(),
  annual_rate: z.number().min(0).max(100),
  tenure_months: z.number().int().positive(),
  currency: z.string().max(10).optional(),
  notes: z.string().max(200).optional(),
})

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('spending_insight'), month: z.number().int().min(1).max(12), year: z.number().int().min(2020).max(2100) }),
  z.object({ action: z.literal('affordability'), question: z.string().min(1).max(500) }),
  z.object({ action: z.literal('savings_suggestion') }),
  z.object({ action: z.literal('compare_loans'), loan_a: loanInputSchema, loan_b: loanInputSchema }),
  z.object({ action: z.literal('explain_bill'), bill_text: z.string().min(1).max(3000) }),
  z.object({ action: z.literal('financial_calm'), message: z.string().min(1).max(500) }),
  z.object({ action: z.literal('optimize_subscriptions') }),
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimit = await checkChatRateLimit(ip)
  if (!rateLimit.success) return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const userId = session.user.id
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Load memory context
  let memoryContext: string | undefined
  try {
    const memCtx = await buildMemoryContext(userId)
    if (memCtx) memoryContext = formatMemoryForPrompt(memCtx) || undefined
  } catch { /* non-critical */ }

  const input = parsed.data

  try {
    if (input.action === 'spending_insight') {
      const [expenses, budget] = await Promise.all([
        getExpenses(userId, input.month, input.year),
        getBudget(userId, input.month, input.year),
      ])
      const result = await generateSpendingInsight(expenses, budget, memoryContext)
      return NextResponse.json({ result })
    }

    if (input.action === 'affordability') {
      const [budget, summary] = await Promise.all([
        getBudget(userId, month, year),
        getExpenseSummary(userId, month, year),
      ])
      const result = await checkAffordability(input.question, budget, summary.total, memoryContext)
      return NextResponse.json({ result })
    }

    if (input.action === 'savings_suggestion') {
      const [budget, summary, goals] = await Promise.all([
        getBudget(userId, month, year),
        getExpenseSummary(userId, month, year),
        getSavingsGoals(userId),
      ])
      const result = await generateSavingsSuggestion(budget, summary.total, goals, memoryContext)
      return NextResponse.json({ result })
    }

    if (input.action === 'compare_loans') {
      const result = await compareLoans(input.loan_a, input.loan_b)
      return NextResponse.json({ result })
    }

    if (input.action === 'explain_bill') {
      const result = await explainBill(input.bill_text)
      return NextResponse.json({ result })
    }

    if (input.action === 'financial_calm') {
      const [budget, summary] = await Promise.all([
        getBudget(userId, month, year),
        getExpenseSummary(userId, month, year),
      ])
      const result = await financialCalmMode(input.message, budget, summary.total)
      return NextResponse.json({ result })
    }

    if (input.action === 'optimize_subscriptions') {
      const subscriptions = await getSubscriptions(userId)
      const result = await optimizeSubscriptions(subscriptions)
      return NextResponse.json({ result })
    }
  } catch (err) {
    console.error('Money AI error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
