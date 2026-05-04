import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getDashboardData } from '@/lib/dashboard/getDashboardData'
import { GreetingHero } from '@/components/home/GreetingHero'
import { AIFeed } from '@/components/home/AIFeed'
import { LifeModuleGrid } from '@/components/home/LifeModuleGrid'
import { RightPanel } from '@/components/home/RightPanel'
import { PremiumInputBar, HomeQuickActions } from '@/components/home/PremiumInputBar'
import { BriefingCard } from '@/components/home/BriefingCard'
import {
  BackgroundProvider,
  BackgroundCanvas,
  BackgroundPickerPanel,
} from '@/components/home/BackgroundPicker'

export const metadata: Metadata = {
  title: 'Life OS — Your AI Life Companion',
  description: 'Your personal AI-powered life operating system.',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  console.info('[Analytics] home_reverted_viewed', session.user.id)

  const data = await getDashboardData(session.user.id, session.user.name)

  return (
    <BackgroundProvider>
      <div className="flex flex-col min-h-full relative">
        <BackgroundCanvas />

        <div className="flex flex-1 min-h-0">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-6 max-w-[840px] mx-auto">
              <GreetingHero data={data} userImage={session.user?.image ?? null} />
              <HomeQuickActions />
              <BriefingCard />
              <AIFeed data={data} />
              <LifeModuleGrid data={data} />
            </div>
          </div>

          {/* Right panel — xl+ only */}
          <div className="hidden xl:flex xl:w-[300px] xl:shrink-0 xl:border-l xl:border-[var(--color-border-soft)] xl:overflow-y-auto xl:bg-[var(--color-surface-raised)]">
            <RightPanel data={data} />
          </div>
        </div>

        <PremiumInputBar />
      </div>

      <BackgroundPickerPanel />
    </BackgroundProvider>
  )
}
