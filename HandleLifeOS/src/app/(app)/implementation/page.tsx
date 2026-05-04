import type { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LIFEOS_PHASES, getOverallProgress, getPhaseSummary } from '@/data/phases'
import { CheckCircle2, Clock, Lock, ArrowRight, Zap, Target, Rocket } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { RoadmapLockGate } from '@/components/protection/RoadmapLockGate'

export const metadata: Metadata = {
  title: 'Implementation Dashboard — Life OS',
  description: 'Track the progress of all 28 planned phases of HandleLife OS.',
}

export default async function ImplementationPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const overallProgress = getOverallProgress()
  const { complete, inProgress, planned, total } = getPhaseSummary()

  return (
    <RoadmapLockGate>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 uppercase tracking-widest">
            <Rocket className="h-3.5 w-3.5" />
            HandleLife OS Roadmap
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Implementation Dashboard
          </h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Real-time snapshot of every phase — what&apos;s been built, what&apos;s in flight, and what&apos;s coming next.
          </p>
        </div>

        {/* ── Overall Progress Banner ────────────────────────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-200/40 overflow-hidden">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Overall Completion</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black tracking-tight">{overallProgress}%</span>
                <span className="text-indigo-200 mb-2 text-sm">across {total} phases</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/60 transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 shrink-0">
              {[
                { label: 'Complete', value: complete, icon: CheckCircle2, color: 'text-emerald-300' },
                { label: 'In Progress', value: inProgress, icon: Zap, color: 'text-amber-300' },
                { label: 'Planned', value: planned, icon: Target, color: 'text-indigo-300' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <Icon className={cn('h-5 w-5 mx-auto mb-1', color)} />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-indigo-200 text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Phase Grid ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {LIFEOS_PHASES.map((phase) => {
            const isComplete = phase.status === 'complete'
            const isInProgress = phase.status === 'in-progress'
            const isPlanned = phase.status === 'planned'

            return (
              <div
                key={phase.id}
                className={cn(
                  'group relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5',
                  isComplete
                    ? 'bg-white border-emerald-100 shadow-sm hover:shadow-md hover:shadow-emerald-100/50'
                    : isInProgress
                    ? 'bg-white border-amber-100 shadow-sm hover:shadow-md hover:shadow-amber-100/50'
                    : 'bg-white/60 border-gray-100 shadow-sm',
                )}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Phase number badge */}
                    <div
                      className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                        isComplete
                          ? 'bg-emerald-50 text-emerald-700'
                          : isInProgress
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-400',
                      )}
                    >
                      {phase.id}
                    </div>
                    <div>
                      <p className={cn('text-[13px] font-bold leading-tight', isPlanned ? 'text-gray-500' : 'text-gray-900')}>
                        {phase.title}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      isComplete
                        ? 'bg-emerald-50 text-emerald-700'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-400',
                    )}
                  >
                    {isComplete && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {isInProgress && <Clock className="h-2.5 w-2.5" />}
                    {isPlanned && <Lock className="h-2.5 w-2.5" />}
                    {isComplete ? 'Complete' : isInProgress ? 'In Progress' : 'Planned'}
                  </div>
                </div>

                {/* Description */}
                <p className={cn('text-[12.5px] leading-relaxed -mt-1', isPlanned ? 'text-gray-400' : 'text-gray-500')}>
                  {phase.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-[11px] font-semibold uppercase tracking-wider', isPlanned ? 'text-gray-300' : 'text-gray-400')}>
                      Progress
                    </p>
                    <span
                      className={cn(
                        'text-[12px] font-bold',
                        isComplete ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-gray-300',
                      )}
                    >
                      {phase.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        isComplete
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : isInProgress
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-gray-200',
                      )}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>

                {/* Functionality pills */}
                <div className="flex flex-wrap gap-1.5">
                  {phase.functionalities.slice(0, 4).map((fn) => (
                    <span
                      key={fn}
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-tight',
                        isComplete
                          ? 'bg-emerald-50 text-emerald-700'
                          : isInProgress
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-gray-100 text-gray-400',
                      )}
                    >
                      {fn}
                    </span>
                  ))}
                  {phase.functionalities.length > 4 && (
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium text-gray-400 bg-gray-100">
                      +{phase.functionalities.length - 4} more
                    </span>
                  )}
                </div>

                {/* Link to route if available */}
                {phase.route && (
                  <Link
                    href={phase.route}
                    className={cn(
                      'mt-auto -mb-1 inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                      isComplete
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-indigo-500 hover:text-indigo-700',
                    )}
                  >
                    Open module <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 pb-4">
          {complete} of {total} phases complete · {Math.round((complete / total) * 100)}% of phases shipped
        </p>
      </div>
      </div>
    </RoadmapLockGate>
  )
}
