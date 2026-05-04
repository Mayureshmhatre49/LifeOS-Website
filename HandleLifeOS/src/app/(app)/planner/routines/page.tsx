import type { Metadata } from 'next'
import { RoutineBuilder } from '@/components/planner/routine-builder'

export const metadata: Metadata = {
  title: 'Routines — Life OS',
  description: 'Build daily routines that help you stay consistent.',
}

export default function RoutinesPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <RoutineBuilder />
      </div>
    </div>
  )
}
