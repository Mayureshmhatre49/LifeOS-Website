import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const db = getSupabaseAdmin()

  const [propRes, maintRes, billsRes, assetsRes] = await Promise.all([
    db.from('properties').select('*').eq('id', id).eq('user_id', session.user.id).single(),
    db.from('home_maintenance').select('*').eq('property_id', id).eq('user_id', session.user.id).eq('is_active', true).order('next_due_at', { ascending: true, nullsFirst: false }),
    db.from('utility_bills').select('*').eq('property_id', id).eq('user_id', session.user.id).order('bill_date', { ascending: false }).limit(60),
    db.from('home_assets').select('*').eq('property_id', id).eq('user_id', session.user.id).order('updated_at', { ascending: false }),
  ])

  if (!propRes.data) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  return NextResponse.json({
    property:    propRes.data,
    maintenance: maintRes.data  ?? [],
    bills:       billsRes.data  ?? [],
    assets:      assetsRes.data ?? [],
  })
}
