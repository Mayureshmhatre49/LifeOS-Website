import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateAuraProfile, deleteAuraProfile } from '@/lib/db/aura-queries'
import { isSupabaseConfigured } from '@/lib/db/client'
import { stripServerFields } from '@/lib/security/safe-payload'
import type { AuraChildProfile } from '@/types/aura'

const MAX_NAME = 120
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function sanitizeAuraProfile(input: unknown): Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'> | null {
  if (!input || typeof input !== 'object') return null
  const safe = stripServerFields(input as Record<string, unknown>) as Record<string, unknown>

  const fullName = typeof safe.full_name === 'string' ? safe.full_name.trim() : ''
  const dob = typeof safe.date_of_birth === 'string' ? safe.date_of_birth.trim() : ''
  if (!fullName || fullName.length > MAX_NAME) return null
  if (!ISO_DATE.test(dob)) return null
  // Cap arbitrary string length anywhere to defend against pathological payloads
  const json = JSON.stringify(safe)
  if (json.length > 200_000) return null
  return safe as unknown as Omit<AuraChildProfile, 'id' | 'created_at' | 'updated_at'>
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const sanitized = sanitizeAuraProfile(body)
  if (!sanitized) {
    return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 })
  }

  const profile = await updateAuraProfile(id, session.user.id, sanitized)
  return NextResponse.json({ profile })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { id } = await params
  await deleteAuraProfile(id, session.user.id)
  return NextResponse.json({ success: true })
}
