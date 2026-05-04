import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

interface IngredientLike {
  item: string
  qty?: number
  unit?: string
  category?: string
}

/**
 * Aggregate ingredients across all meal_plans in a date range and create
 * nutrition_grocery_items rows. Skips items that already exist (case-insensitive name + unit).
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const today = new Date().toISOString().slice(0, 10)
  const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
  const from = (body.from as string) || today
  const to = (body.to as string) || weekAhead

  const db = getSupabaseAdmin()
  const { data: meals } = await db
    .from('meal_plans')
    .select('recipe_id, servings')
    .eq('user_id', session.user.id)
    .gte('date', from)
    .lte('date', to)
    .not('recipe_id', 'is', null)

  const recipeIds = Array.from(new Set(((meals ?? []) as { recipe_id: string }[]).map(m => m.recipe_id)))
  if (recipeIds.length === 0) return NextResponse.json({ added: 0 })

  const { data: recipes } = await db
    .from('recipes')
    .select('id, ingredients, servings')
    .in('id', recipeIds)

  const aggregated = new Map<string, { item: string; qty: number; unit: string; category: string }>()

  for (const meal of (meals ?? []) as { recipe_id: string; servings: number }[]) {
    const recipe = (recipes ?? []).find((r: { id: string }) => r.id === meal.recipe_id) as
      | { id: string; ingredients: IngredientLike[]; servings: number }
      | undefined
    if (!recipe) continue
    const scale = (meal.servings || 1) / Math.max(1, recipe.servings || 1)
    for (const ing of recipe.ingredients ?? []) {
      const item = (ing.item ?? '').trim()
      if (!item) continue
      const unit = (ing.unit ?? '').trim().toLowerCase()
      const key = `${item.toLowerCase()}::${unit}`
      const existing = aggregated.get(key)
      const addQty = (ing.qty ?? 0) * scale
      if (existing) {
        existing.qty += addQty
      } else {
        aggregated.set(key, { item, qty: addQty, unit, category: (ing.category ?? '').trim() })
      }
    }
  }

  if (aggregated.size === 0) return NextResponse.json({ added: 0 })

  const { data: existing } = await db
    .from('nutrition_grocery_items')
    .select('name, unit, is_bought')
    .eq('user_id', session.user.id)
    .eq('is_bought', false)

  const existingKeys = new Set(
    ((existing ?? []) as { name: string; unit: string | null }[]).map(
      g => `${g.name.toLowerCase()}::${(g.unit ?? '').toLowerCase()}`,
    ),
  )

  const rows = Array.from(aggregated.entries())
    .filter(([key]) => !existingKeys.has(key))
    .map(([, v]) => ({
      user_id: session.user.id,
      name: v.item,
      qty: v.qty > 0 ? Number(v.qty.toFixed(2)) : null,
      unit: v.unit || null,
      category: v.category || null,
    }))

  if (rows.length === 0) return NextResponse.json({ added: 0 })
  await db.from('nutrition_grocery_items').insert(rows)
  return NextResponse.json({ added: rows.length })
}
