import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

function calcDays(expiry: string) {
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86_400_000)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ stats: null })

  const { data } = await getSupabaseAdmin()
    .from('renewal_items')
    .select('category,expiry_date,estimated_cost,recurring_frequency,recurring_months,risk_level,status,currency')
    .eq('user_id', session.user.id)
    .is('deleted_at', null)

  const items = data ?? []
  const active = items.filter(i => i.status === 'active')
  const today  = new Date()

  // Urgency distribution
  const urgency = { overdue: 0, critical: 0, high: 0, medium: 0, low: 0 }
  for (const item of active) {
    const d = calcDays(item.expiry_date)
    if (d < 0)   urgency.overdue++
    else if (d <= 7)  urgency.critical++
    else if (d <= 30) urgency.high++
    else if (d <= 90) urgency.medium++
    else              urgency.low++
  }

  // Category breakdown: count + estimated annual cost
  const byCategory: Record<string, { count: number; annual_cost: number }> = {}
  for (const item of active) {
    if (!byCategory[item.category]) byCategory[item.category] = { count: 0, annual_cost: 0 }
    byCategory[item.category].count++
    if (item.estimated_cost) {
      const months = item.recurring_months ?? (
        item.recurring_frequency === 'monthly' ? 1 :
        item.recurring_frequency === 'quarterly' ? 3 :
        item.recurring_frequency === 'half_yearly' ? 6 : 12
      )
      byCategory[item.category].annual_cost += Number(item.estimated_cost) * (12 / months)
    }
  }

  // Monthly expiry distribution — next 12 months
  const monthlyExpiry: Array<{ month: string; count: number }> = []
  for (let m = 0; m < 12; m++) {
    const dt = new Date(today)
    dt.setDate(1)
    dt.setMonth(dt.getMonth() + m)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    monthlyExpiry.push({
      month: key,
      count: active.filter(i => i.expiry_date.startsWith(key)).length,
    })
  }

  // Risk distribution
  const byRisk = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const item of active) {
    byRisk[item.risk_level as keyof typeof byRisk]++
  }

  // Annual cost total
  const annualCost = active.reduce((sum, i) => {
    if (!i.estimated_cost) return sum
    const months = i.recurring_months ?? (
      i.recurring_frequency === 'monthly' ? 1 :
      i.recurring_frequency === 'quarterly' ? 3 :
      i.recurring_frequency === 'half_yearly' ? 6 : 12
    )
    return sum + Number(i.estimated_cost) * (12 / months)
  }, 0)

  // Status breakdown
  const byStatus: Record<string, number> = {}
  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1
  }

  return NextResponse.json({
    stats: {
      total:         items.length,
      active:        active.length,
      urgency,
      byCategory,
      monthlyExpiry,
      byRisk,
      byStatus,
      annualCost:    Math.round(annualCost),
      monthlyCost:   Math.round(annualCost / 12),
    },
  })
}
