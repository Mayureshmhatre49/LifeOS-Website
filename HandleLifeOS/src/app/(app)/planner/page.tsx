import type { Metadata } from 'next'
import { TodayPlanner } from '@/components/planner/today-planner'

export const metadata: Metadata = {
  title: 'Daily Planner — Life OS',
  description: 'Plan your day with AI-powered task prioritization and smart scheduling.',
}

export default function PlannerPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <TodayPlanner />
      </div>
    </div>
  )
}
