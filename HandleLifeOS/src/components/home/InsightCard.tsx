import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InsightCardData {
  id: string
  emoji: string
  title: string
  body: string
  cta: string
  href: string
  variant: 'primary' | 'warning' | 'success' | 'calm'
}

const VARIANT_STYLES: Record<InsightCardData['variant'], { card: string; cta: string; badge: string }> = {
  primary: { card: 'from-indigo-50/90 to-violet-50/90 border-indigo-100',   cta: 'text-indigo-700 hover:text-indigo-900',   badge: 'bg-indigo-100 text-indigo-700'   },
  warning: { card: 'from-amber-50/90  to-orange-50/90  border-amber-100',   cta: 'text-amber-700  hover:text-amber-900',   badge: 'bg-amber-100  text-amber-700'    },
  success: { card: 'from-emerald-50/90 to-teal-50/90   border-emerald-100', cta: 'text-emerald-700 hover:text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' },
  calm:    { card: 'from-sky-50/90    to-blue-50/90    border-sky-100',     cta: 'text-sky-700    hover:text-sky-900',     badge: 'bg-sky-100    text-sky-700'      },
}

interface Props {
  card: InsightCardData
  className?: string
}

export function InsightCard({ card, className }: Props) {
  const s = VARIANT_STYLES[card.variant]
  return (
    <div
      className={cn(
        'flex-none w-[175px] rounded-2xl bg-gradient-to-br border p-3.5 flex flex-col gap-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm',
        s.card,
        className,
      )}
    >
      <span className="text-2xl">{card.emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{card.title}</p>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-1 line-clamp-2">{card.body}</p>
      </div>
      <Link
        href={card.href}
        className={cn('flex items-center gap-1 text-[11px] font-bold transition-colors', s.cta)}
      >
        {card.cta} <ArrowRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  )
}
