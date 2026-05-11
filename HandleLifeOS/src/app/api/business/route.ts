import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TABLE_MAP: Record<string, string> = {
  client: 'business_clients',
  project: 'business_projects',
  invoice: 'business_invoices',
  expense: 'business_expenses',
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ clients: [], projects: [], invoices: [], expenses: [] })

  const db = getSupabaseAdmin()
  const [clients, projects, invoices, expenses] = await Promise.all([
    db.from('business_clients').select('*').eq('user_id', session.user.id).eq('archived', false).order('updated_at', { ascending: false }),
    db.from('business_projects').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
    db.from('business_invoices').select('*').eq('user_id', session.user.id).order('issued_at', { ascending: false }).limit(200),
    db.from('business_expenses').select('*').eq('user_id', session.user.id).order('occurred_at', { ascending: false }).limit(200),
  ])

  return NextResponse.json({
    clients: clients.data ?? [],
    projects: projects.data ?? [],
    invoices: invoices.data ?? [],
    expenses: expenses.data ?? [],
  })
}

interface InvoiceItem { description?: string; qty?: number; rate?: number; amount?: number }

function computeInvoiceTotals(items: InvoiceItem[], taxPct = 0, discount = 0) {
  const subtotal = items.reduce((s, it) => s + (Number(it.amount ?? (Number(it.qty ?? 0) * Number(it.rate ?? 0))) || 0), 0)
  const tax_amt = Math.round(((subtotal - discount) * (taxPct / 100)) * 100) / 100
  const total = Math.max(0, subtotal - discount + tax_amt)
  return { subtotal: Math.round(subtotal * 100) / 100, tax_amt, total: Math.round(total * 100) / 100 }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  const safe = stripServerFields(payload) as Record<string, unknown>

  // Auto-compute invoice totals if items present
  if (kind === 'invoice') {
    const items = (safe.items ?? []) as InvoiceItem[]
    const { subtotal, tax_amt, total } = computeInvoiceTotals(items, Number(safe.tax_pct ?? 0), Number(safe.discount_amt ?? 0))
    safe.subtotal = subtotal; safe.tax_amt = tax_amt; safe.total = total
    if (!safe.invoice_no) {
      safe.invoice_no = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    }
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db.from(table).insert({ ...safe, user_id: session.user.id }).select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, id, ...patch } = body
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const safe = stripServerFields(patch) as Record<string, unknown>

  if (kind === 'invoice' && Array.isArray(safe.items)) {
    const { subtotal, tax_amt, total } = computeInvoiceTotals(safe.items as InvoiceItem[], Number(safe.tax_pct ?? 0), Number(safe.discount_amt ?? 0))
    safe.subtotal = subtotal; safe.tax_amt = tax_amt; safe.total = total
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(table)
    .update(safe)
    .eq('id', id).eq('user_id', session.user.id)
    .select().single()
  if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const url = new URL(req.url)
  const kind = url.searchParams.get('kind')
  const id = url.searchParams.get('id')
  if (!kind || !id) return NextResponse.json({ error: 'Missing kind or id' }, { status: 400 })
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })

  await getSupabaseAdmin().from(table).delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
