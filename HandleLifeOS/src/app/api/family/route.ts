import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { createFamily, getUserFamilies } from '@/lib/db/family-queries'

const createSchema = z.object({
  name: z.string().min(1).max(80),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const families = await getUserFamilies(session.user.id)
  return NextResponse.json({ families })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const family = await createFamily(session.user.id, parsed.data)
  if (!family) return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
  return NextResponse.json({ family }, { status: 201 })
}
