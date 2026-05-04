import type { Metadata } from 'next'
import { WeekView } from '@/components/planner/week-view'

export const metadata: Metadata = {
  title: 'Week View — Life OS',
  description: 'See your tasks across the week at a glance.',
}

export default function WeekPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <WeekView />
      </div>
    </div>
  )
}
