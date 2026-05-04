import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCategoryBudgets, upsertCategoryBudget, deleteCategoryBudget } from '@/lib/db/liabilities-queries'

const UpsertSchema = z.object({
  category:      z.string().min(1),
  monthly_limit: z.number().positive(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await getCategoryBudgets(session.user.id)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = UpsertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = await upsertCategoryBudget(session.user.id, parsed.data)
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await deleteCategoryBudget(session.user.id, id)
  return NextResponse.json({ success: true })
}
