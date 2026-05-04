import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/db/client'
import { getProfile, getMemoryItems } from '@/lib/db/memory-queries'
import { MemoryCenterClient } from '@/components/memory/MemoryCenterClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Center — Life OS',
  description: 'Manage what Life OS remembers about you to personalise every AI response.',
}

export default async function MemoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  // Fetch all memory data server-side
  const [profile, allItems] = await Promise.all([
    isSupabaseConfigured() ? getProfile(userId) : Promise.resolve(null),
    isSupabaseConfigured() ? getMemoryItems(userId, false, 200, 0) : Promise.resolve([]),
  ])

  console.info('[Analytics] memory_center_viewed', userId)

  return (
    <MemoryCenterClient
      initialItems={allItems}
      initialProfile={profile}
      totalCount={allItems.filter((i) => i.is_active).length}
    />
  )
}
