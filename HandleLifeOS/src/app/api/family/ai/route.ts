import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { checkChatRateLimit } from '@/lib/security/rate-limit'
import {
  getFamilyMembership,
  getSharedTasks,
  getFamilyEvents,
  getFamilyMembers,
  getOrCreateActiveList,
  getGroceryItems,
} from '@/lib/db/family-queries'
import {
  planHouseholdWeek,
  balanceChores,
  getMentalLoadCheck,
  generateHouseholdChecklist,
  suggestGroceries,
} from '@/lib/family-ai'

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('plan_week'), family_id: z.string().uuid() }),
  z.object({ action: z.literal('balance_chores'), family_id: z.string().uuid() }),
  z.object({ action: z.literal('mental_load'), family_id: z.string().uuid(), message: z.string().max(300).optional() }),
  z.object({ action: z.literal('checklist'), family_id: z.string().uuid(), context: z.string().min(1).max(300) }),
  z.object({ action: z.literal('suggest_groceries'), family_id: z.string().uuid() }),
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const rateLimit = await checkChatRateLimit(ip)
  if (!rateLimit.success) return NextResponse.json({ error: 'Rate limit exceeded. Please slow down.' }, { status: 429 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const userId = session.user.id
  const input = parsed.data

  const membership = await getFamilyMembership(userId, input.family_id)
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  try {
    if (input.action === 'plan_week') {
      const [tasks, events, members] = await Promise.all([
        getSharedTasks(input.family_id),
        getFamilyEvents(input.family_id, 14),
        getFamilyMembers(input.family_id),
      ])
      const result = await planHouseholdWeek(tasks, events, members)
      return NextResponse.json({ result })
    }

    if (input.action === 'balance_chores') {
      const [members, tasks] = await Promise.all([
        getFamilyMembers(input.family_id),
        getSharedTasks(input.family_id),
      ])
      const result = await balanceChores(members, tasks)
      return NextResponse.json({ result })
    }

    if (input.action === 'mental_load') {
      const [tasks, events, members] = await Promise.all([
        getSharedTasks(input.family_id),
        getFamilyEvents(input.family_id, 7),
        getFamilyMembers(input.family_id),
      ])
      const list = await getOrCreateActiveList(input.family_id, userId)
      const groceries = await getGroceryItems(list.id)
      const result = await getMentalLoadCheck(tasks, events, groceries, input.message)
      return NextResponse.json({ result })
    }

    if (input.action === 'checklist') {
      const members = await getFamilyMembers(input.family_id)
      const result = await generateHouseholdChecklist(input.context, members)
      return NextResponse.json({ result })
    }

    if (input.action === 'suggest_groceries') {
      const list = await getOrCreateActiveList(input.family_id, userId)
      const items = await getGroceryItems(list.id)
      const members = await getFamilyMembers(input.family_id)
      const existing = items.map(i => i.name)
      const suggestions = await suggestGroceries(existing, members.filter(m => m.status === 'active').length)
      return NextResponse.json({ suggestions })
    }
  } catch (err) {
    console.error('Family AI error:', err)
    return NextResponse.json({ error: 'AI request failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
