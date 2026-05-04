import type { Metadata } from 'next'
import { WeeklyInsights } from '@/components/focus/weekly-insights'

export const metadata: Metadata = {
  title: 'Focus Insights — Life OS',
  description: 'Track your focus sessions, productivity trends, and weekly stats.',
}

export default function FocusInsightsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <WeeklyInsights />
      </div>
    </div>
  )
}
