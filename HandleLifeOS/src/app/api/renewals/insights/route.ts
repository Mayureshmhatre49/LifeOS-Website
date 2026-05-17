import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { getAIModel, isMockMode } from '@/lib/ai/provider'

function calcDays(expiry: string) {
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000)
}

function buildRuleBasedInsights(ctx: {
  total: number; overdue: number; critical: number; thisMonth: number
  annualCost: number; topRisk: string[]; categories: Record<string, number>
}): string[] {
  const insights: string[] = []

  if (ctx.overdue > 0)
    insights.push(`${ctx.overdue} renewal${ctx.overdue > 1 ? 's are' : ' is'} overdue — act immediately to avoid penalties or coverage gaps.`)
  if (ctx.critical > 0)
    insights.push(`${ctx.critical} critical renewal${ctx.critical > 1 ? 's' : ''} due within 7 days. Prioritise these today.`)
  if (ctx.thisMonth > 0)
    insights.push(`${ctx.thisMonth} renewal${ctx.thisMonth > 1 ? 's' : ''} due this month. Block time this week to complete them.`)
  if (ctx.topRisk.length > 0)
    insights.push(`High-risk items needing attention: ${ctx.topRisk.slice(0, 3).join(', ')}.`)
  if (ctx.annualCost > 0)
    insights.push(`Estimated annual renewal obligations: ₹${Math.round(ctx.annualCost).toLocaleString('en-IN')}.`)
  if (ctx.total > 20)
    insights.push(`You are managing ${ctx.total} active renewal obligations — consider batching similar renewals to reduce admin load.`)
  if (insights.length === 0)
    insights.push(`All ${ctx.total} tracked renewals are in good shape. Review quarterly to stay ahead.`)

  return insights.slice(0, 5)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ insights: [], stats: {} })

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('renewal_items')
    .select('title,category,expiry_date,risk_level,estimated_cost,recurring_frequency,recurring_months,status')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  const items = data ?? []
  const today = new Date()

  const withDays = items.map(i => ({ ...i, days: calcDays(i.expiry_date) }))
  const overdue    = withDays.filter(i => i.days < 0).length
  const critical   = withDays.filter(i => i.days >= 0 && i.days <= 7).length
  const thisMonth  = withDays.filter(i => i.days >= 0 && i.days <= 30).length
  const thisYear   = withDays.filter(i => i.days >= 0 && i.days <= 365)

  // Annual cost projection
  const annualCost = items.reduce((sum, i) => {
    if (!i.estimated_cost) return sum
    const months = i.recurring_months ?? (
      i.recurring_frequency === 'monthly' ? 1 :
      i.recurring_frequency === 'quarterly' ? 3 :
      i.recurring_frequency === 'half_yearly' ? 6 : 12
    )
    return sum + (Number(i.estimated_cost) * (12 / months))
  }, 0)

  // Category distribution
  const categories: Record<string, number> = {}
  for (const item of items) {
    categories[item.category] = (categories[item.category] || 0) + 1
  }

  // Top high-risk items by urgency
  const topRisk = withDays
    .filter(i => i.risk_level === 'critical' || i.risk_level === 'high')
    .sort((a, b) => a.days - b.days)
    .slice(0, 5)
    .map(i => i.title)

  const ctx = { total: items.length, overdue, critical, thisMonth, annualCost, topRisk, categories }

  if (isMockMode() || items.length === 0) {
    return NextResponse.json({ insights: buildRuleBasedInsights(ctx), stats: ctx })
  }

  // Monthly distribution for current year
  const monthlyDist: Record<string, number> = {}
  for (let m = 0; m < 12; m++) {
    const key = `${today.getFullYear()}-${String(m + 1).padStart(2, '0')}`
    monthlyDist[key] = thisYear.filter(i => i.expiry_date.startsWith(key)).length
  }

  const prompt = `You are a personal life-management advisor. A user has ${items.length} tracked renewal/expiry obligations.

Key metrics:
- Overdue renewals: ${overdue}
- Critical (≤7 days): ${critical}
- Due this month: ${thisMonth}
- Estimated annual cost: ₹${Math.round(annualCost).toLocaleString('en-IN')}
- Category breakdown: ${Object.entries(categories).map(([k,v]) => `${k}(${v})`).join(', ')}
- High-risk items due soonest: ${topRisk.join(', ') || 'none'}

Generate 4–5 concise, actionable insights to help this user stay on top of their renewal obligations.
Focus on: urgency, financial impact, risk consequences, cognitive-load reduction.
Tone: calm, supportive, professional. Avoid alarmism.

Return ONLY a JSON array of strings (no markdown, no code fences):
["insight 1", "insight 2", ...]`

  try {
    const { text } = await generateText({ model: getAIModel(), prompt, temperature: 0.3, maxOutputTokens: 600 })
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No array')
    const insights: string[] = JSON.parse(match[0])
    return NextResponse.json({ insights: insights.slice(0, 5), stats: ctx })
  } catch {
    return NextResponse.json({ insights: buildRuleBasedInsights(ctx), stats: ctx })
  }
}
