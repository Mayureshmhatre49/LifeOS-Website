import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'

const TABLE_MAP: Record<string, string> = {
  recipe: 'recipes',
  meal: 'meal_plans',
  log: 'food_logs',
  grocery: 'nutrition_grocery_items',
  target: 'nutrition_targets',
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ recipes: [], meals: [], logs: [], groceries: [], target: null })
  }

  const url = new URL(req.url)
  const from = url.searchParams.get('from') // YYYY-MM-DD
  const to = url.searchParams.get('to')
  const today = new Date().toISOString().slice(0, 10)
  const fromDate = from ?? today
  const toDate = to ?? new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const db = getSupabaseAdmin()
  const [recipes, meals, logs, groceries, target] = await Promise.all([
    db.from('recipes').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(200),
    db.from('meal_plans').select('*').eq('user_id', session.user.id).gte('date', fromDate).lte('date', toDate).order('date', { ascending: true }),
    db.from('food_logs').select('*').eq('user_id', session.user.id).gte('date', fromDate).lte('date', toDate).order('logged_at', { ascending: false }),
    db.from('nutrition_grocery_items').select('*').eq('user_id', session.user.id).order('is_bought', { ascending: true }).order('category', { ascending: true }),
    db.from('nutrition_targets').select('*').eq('user_id', session.user.id).maybeSingle(),
  ])

  return NextResponse.json({
    recipes: recipes.data ?? [],
    meals: meals.data ?? [],
    logs: logs.data ?? [],
    groceries: groceries.data ?? [],
    target: target.data ?? null,
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { kind, ...payload } = body
  const table = TABLE_MAP[kind]
  if (!table) return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
  const safe = stripServerFields(payload)

  const db = getSupabaseAdmin()

  // nutrition_targets is a per-user singleton — upsert
  if (kind === 'target') {
    const { data, error } = await db
      .from('nutrition_targets')
      .upsert({ ...safe, user_id: session.user.id }, { onConflict: 'user_id' })
      .select().single()
    if (error) return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    return NextResponse.json({ record: data }, { status: 200 })
  }

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

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(table)
    .update(stripServerFields(patch))
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
