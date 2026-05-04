import Link from 'next/link'
import { CheckCircle2, Circle, RotateCcw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineItem } from '@/lib/dashboard/getDashboardData'

interface Props {
  timeline: TimelineItem[]
}

const TYPE_STYLES = {
  task:    { dot: 'bg-indigo-400', icon: <Circle className="h-3.5 w-3.5 text-indigo-400" /> },
  routine: { dot: 'bg-amber-400',  icon: <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> },
  focus:   { dot: 'bg-violet-400', icon: <Clock className="h-3.5 w-3.5 text-violet-400" /> },
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-500',
  high:   'text-orange-500',
  medium: 'text-gray-400',
  low:    'text-gray-300',
}

function EmptyTimeline() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center space-y-1.5">
      <CheckCircle2 className="h-7 w-7 text-gray-200 mx-auto" />
      <p className="text-sm text-gray-400">No tasks or routines scheduled for today.</p>
      <Link href="/planner" className="text-xs text-indigo-500 hover:underline font-medium">
        Plan your day →
      </Link>
    </div>
  )
}

export function TodayTimeline({ timeline }: Props) {
  if (timeline.length === 0) return <EmptyTimeline />

  return (
    <div className="space-y-1">
      {timeline.map((item, idx) => {
        const style = TYPE_STYLES[item.type]
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50 group',
              item.done && 'opacity-50',
            )}
          >
            {/* Timeline dot + connector */}
            <div className="flex flex-col items-center shrink-0">
              <div className={cn('h-2 w-2 rounded-full', item.done ? 'bg-green-400' : style.dot)} />
              {idx < timeline.length - 1 && (
                <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[16px]" />
              )}
            </div>

            {/* Time */}
            <div className="w-12 shrink-0">
              {item.time ? (
                <p className="text-xs font-mono text-gray-400">{item.time.slice(0, 5)}</p>
              ) : (
                <p className="text-xs text-gray-200">—</p>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm text-gray-800 truncate group-hover:text-indigo-600 transition-colors',
                item.done && 'line-through text-gray-400',
              )}>
                {item.title}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              {item.badge && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  item.badge === 'Urgent' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500',
                )}>
                  {item.badge}
                </span>
              )}
              {item.done && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
            </div>
          </Link>
        )
      })}

      <Link
        href="/planner"
        className="block text-center text-xs text-indigo-500 hover:text-indigo-700 font-medium pt-2 transition-colors"
      >
        Open full planner →
      </Link>
    </div>
  )
}
