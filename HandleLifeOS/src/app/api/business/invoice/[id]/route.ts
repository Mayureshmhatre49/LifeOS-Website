import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const db = getSupabaseAdmin()
  const { data: invoice } = await db.from('business_invoices').select('*').eq('id', id).eq('user_id', session.user.id).maybeSingle()
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [client, project, profile] = await Promise.all([
    invoice.client_id  ? db.from('business_clients').select('*').eq('id', invoice.client_id).maybeSingle()  : Promise.resolve({ data: null }),
    invoice.project_id ? db.from('business_projects').select('name').eq('id', invoice.project_id).maybeSingle() : Promise.resolve({ data: null }),
    db.from('users').select('email, name').eq('id', session.user.id).maybeSingle(),
  ])

  return NextResponse.json({ invoice, client: client.data, project: project.data, issuer: profile.data })
}
