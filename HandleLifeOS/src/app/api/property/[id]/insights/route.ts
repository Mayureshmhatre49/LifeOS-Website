import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { getAIModel, isMockMode } from '@/lib/ai/provider'

interface Insight {
  priority: 'high' | 'medium' | 'low'
  title: string
  body: string
  action: string
}

async function assertPropertyOwner(propertyId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await getSupabaseAdmin()
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

function buildRuleBasedInsights(ctx: {
  overdueCount: number; emergencyCount: number; missingCritical: string[]
  expiringLeases: number; netPL: number; totalIncome: number; totalExpenses: number; hasTransactions: boolean
}): Insight[] {
  const list: Insight[] = []

  if (ctx.overdueCount > 0) list.push({
    priority: 'high',
    title: `${ctx.overdueCount} overdue maintenance task${ctx.overdueCount > 1 ? 's' : ''}`,
    body: 'Deferred maintenance compounds into costlier repairs. Schedule service visits this week to avoid escalation.',
    action: 'Open the Maintenance tab and mark tasks done or reschedule.',
  })

  if (ctx.emergencyCount > 0) list.push({
    priority: 'high',
    title: `${ctx.emergencyCount} open emergency issue${ctx.emergencyCount > 1 ? 's' : ''}`,
    body: 'Emergency issues carry safety risk and liability. Assign a vendor immediately and track to closure.',
    action: 'Open the Issues tab, call the listed vendor, and update the status.',
  })

  if (ctx.expiringLeases > 0) list.push({
    priority: 'high',
    title: 'Lease expiring within 30 days',
    body: 'Vacancy gaps reduce yield and increase tenant-finding costs. Initiate renewal discussions now.',
    action: 'Contact the tenant and update the lease end date in the Tenants tab.',
  })

  if (ctx.missingCritical.length > 0) list.push({
    priority: 'medium',
    title: `Missing critical documents`,
    body: `${ctx.missingCritical.map(c => c.replace(/_/g, ' ')).join(', ')} not uploaded. These protect ownership rights and are required for insurance claims or sale.`,
    action: 'Upload the missing documents in the Documents tab.',
  })

  if (ctx.hasTransactions && ctx.netPL < 0) list.push({
    priority: 'medium',
    title: 'Property is cash-flow negative',
    body: `Expenses (₹${ctx.totalExpenses.toLocaleString('en-IN')}) exceed income (₹${ctx.totalIncome.toLocaleString('en-IN')}). Review recurring costs for reduction opportunities.`,
    action: 'Review expense categories in the Finance tab.',
  })

  if (list.length === 0) list.push({
    priority: 'low',
    title: 'Property is in good shape',
    body: 'No critical issues detected. Maintain your schedule for regular maintenance and document renewal.',
    action: 'Consider logging a quarterly inspection in the Maintenance tab.',
  })

  return list.slice(0, 5)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ insights: [] })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  // Fetch all property data in parallel
  const [propRes, maintRes, issuesRes, docsRes, finRes, tenantsRes] = await Promise.all([
    db.from('properties').select('*').eq('id', id).eq('user_id', session.user.id).single(),
    db.from('home_maintenance').select('next_due_at,title,category').eq('property_id', id).eq('user_id', session.user.id),
    db.from('property_issues').select('priority,status,title').eq('property_id', id).eq('user_id', session.user.id),
    db.from('property_documents').select('category,expires_at').eq('property_id', id).eq('user_id', session.user.id),
    db.from('property_transactions').select('type,amount').eq('property_id', id).eq('user_id', session.user.id),
    db.from('property_tenants').select('status,lease_end,name').eq('property_id', id).eq('user_id', session.user.id),
  ])

  if (!propRes.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const prop      = propRes.data
  const maint     = maintRes.data ?? []
  const issues    = issuesRes.data ?? []
  const docs      = docsRes.data ?? []
  const txns      = finRes.data ?? []
  const tenants   = tenantsRes.data ?? []

  const overdueCount    = maint.filter(m => m.next_due_at && m.next_due_at < today).length
  const upcomingCount   = maint.filter(m => m.next_due_at && m.next_due_at >= today).length
  const openIssues      = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed')
  const emergencyCount  = openIssues.filter(i => i.priority === 'emergency').length
  const presentCats     = new Set(docs.map(d => d.category))
  const missingCritical = ['sale_deed','insurance','property_tax'].filter(c => !presentCats.has(c))
  const expiringDocs    = docs.filter(d => {
    if (!d.expires_at) return false
    const days = Math.ceil((new Date(d.expires_at).getTime() - Date.now()) / 86_400_000)
    return days >= 0 && days <= 60
  })
  const totalIncome   = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const netPL         = totalIncome - totalExpenses
  const activeTenants = tenants.filter(t => t.status !== 'vacated')
  const expiringLeases = activeTenants.filter(t => {
    if (!t.lease_end) return false
    return Math.ceil((new Date(t.lease_end).getTime() - Date.now()) / 86_400_000) <= 30
  })

  const ctx = { overdueCount, emergencyCount, missingCritical, expiringLeases: expiringLeases.length,
    netPL, totalIncome, totalExpenses, hasTransactions: txns.length > 0 }

  if (isMockMode()) {
    return NextResponse.json({ insights: buildRuleBasedInsights(ctx) })
  }

  const gain = prop.purchase_value && prop.current_value
    ? (((prop.current_value - prop.purchase_value) / prop.purchase_value) * 100).toFixed(1)
    : null

  const prompt = `You are an expert Indian property management advisor. Analyze this property portfolio entry and provide 4–5 concise, prioritized, actionable insights for the owner.

Property: "${prop.name}" — ${prop.type} in ${[prop.city, prop.state].filter(Boolean).join(', ') || 'India'}
Status: ${prop.status}${gain ? ` | Appreciation: ${gain}%` : ''}${prop.current_value ? ` | Current value: ₹${Number(prop.current_value).toLocaleString('en-IN')}` : ''}

Maintenance: ${overdueCount} overdue, ${upcomingCount} upcoming scheduled tasks
Open issues: ${openIssues.length} total (${emergencyCount} emergency-level)
Documents: ${docs.length} uploaded${expiringDocs.length > 0 ? `, ${expiringDocs.length} expiring in <60 days` : ''}
Missing critical docs: ${missingCritical.length > 0 ? missingCritical.map(c => c.replace(/_/g, ' ')).join(', ') : 'none'}
Finance (cumulative): Income ₹${totalIncome.toLocaleString('en-IN')}, Expenses ₹${totalExpenses.toLocaleString('en-IN')}, Net P&L ₹${netPL.toLocaleString('en-IN')}
Tenants: ${activeTenants.length} active${expiringLeases.length > 0 ? `, ${expiringLeases.length} lease(s) expiring within 30 days` : ''}

Return ONLY a valid JSON array — no markdown, no explanation, no code fences:
[{"priority":"high|medium|low","title":"under 8 words","body":"under 55 words, specific and actionable","action":"one concrete next step"}]`

  try {
    const { text } = await generateText({
      model: getAIModel(),
      prompt,
      temperature: 0.3,
      maxOutputTokens: 900,
    })

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')
    const insights: Insight[] = JSON.parse(match[0])
    return NextResponse.json({ insights: insights.slice(0, 5) })
  } catch {
    return NextResponse.json({ insights: buildRuleBasedInsights(ctx) })
  }
}
