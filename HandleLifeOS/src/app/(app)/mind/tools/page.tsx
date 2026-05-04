import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Sparkles, Clock } from 'lucide-react'
import { MIND_TOOLS } from '@/lib/mind/tools'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Calm Tools — Mind · HandleLife OS',
  description: 'One-click emotional reset tools.',
}

export default function ToolsIndexPage() {
  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Calm Tools</h1>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        Pick the tool that matches what you&apos;re feeling. Each one is a guided 1-3 minute experience.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MIND_TOOLS.map(tool => {
          const Icon = tool.icon
          const minutes = Math.ceil(tool.totalSeconds / 60)
          return (
            <Link
              key={tool.id}
              href={`/mind/tools/${tool.id}`}
              className={cn(
                'rounded-2xl border border-white/60 bg-gradient-to-br p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
                tool.bgGradient
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center shrink-0">
                  <Icon className={cn('h-5 w-5', tool.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold leading-tight', tool.color)}>{tool.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{tool.tagline}</p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium shrink-0 mt-1">
                  <Clock className="h-3 w-3" />
                  {minutes}m
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{tool.intent}</p>
            </Link>
          )
        })}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 mt-6">
        <p className="text-xs text-rose-700 leading-relaxed">
          <strong>If you&apos;re in crisis right now:</strong> these tools help with everyday emotional waves.
          For severe distress, please call <strong>1860 2662 345 (Vandrevala, 24/7)</strong> or your local emergency line.
        </p>
      </div>
    </div>
  )
}
