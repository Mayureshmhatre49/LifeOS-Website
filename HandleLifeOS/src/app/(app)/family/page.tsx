import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FamilyHome } from '@/components/family/family-home'

export const metadata: Metadata = {
  title: 'Family — Life OS',
  description: 'Coordinate your household — shared tasks, grocery list, family calendar, and AI assistance.',
}

export default async function FamilyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <FamilyHome userId={session.user.id} />
    </div>
  )
}
