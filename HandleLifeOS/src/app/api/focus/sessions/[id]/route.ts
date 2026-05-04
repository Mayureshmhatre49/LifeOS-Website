import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateFocusSession } from '@/lib/db/focus-queries'
import { z } from 'zod'

const updateSchema = z.object({
  actual_minutes: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  abandoned: z.boolean().optional(),
  ended_at: z.string().datetime().optional(),
  notes: z.string().max(1000).trim().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const focusSession = await updateFocusSession(id, session.user.id, parsed.data)
    return NextResponse.json(focusSession)
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
