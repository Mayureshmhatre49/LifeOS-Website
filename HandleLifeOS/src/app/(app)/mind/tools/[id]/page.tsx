'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { getTool, MIND_TOOLS } from '@/lib/mind/tools'
import { ToolPlayer } from '@/components/mind/ToolPlayer'
import { cn } from '@/lib/utils'

export default function ToolPlayerPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const tool = getTool(params.id)

  if (!tool) {
    return (
      <div className="min-h-full flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Tool not found.</p>
          <Link href="/mind/tools" className="text-indigo-600 text-sm font-semibold">
            Browse calm tools →
          </Link>
        </div>
      </div>
    )
  }

  const Icon = tool.icon
  const others = MIND_TOOLS.filter(t => t.id !== tool.id).slice(0, 3)

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn('h-8 w-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md', tool.bgGradient)}>
            <Icon className={cn('h-4 w-4', tool.color)} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{tool.title}</h1>
            <p className="text-[11px] text-gray-400 truncate">{tool.tagline}</p>
          </div>
        </div>
      </div>

      {/* Intent */}
      <p className="text-sm text-gray-600 leading-relaxed text-center max-w-md mx-auto">{tool.intent}</p>

      {/* Player */}
      <ToolPlayer tool={tool} />

      {/* Try another */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Try another</p>
        <div className="space-y-2">
          {others.map(t => {
            const TIcon = t.icon
            return (
              <Link
                key={t.id}
                href={`/mind/tools/${t.id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/60 bg-gradient-to-br hover:shadow-md transition-all',
                  t.bgGradient
                )}
              >
                <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                  <TIcon className={cn('h-4 w-4', t.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold', t.color)}>{t.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{t.intent}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
