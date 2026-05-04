'use client'

import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompareResult } from '@/types/decision'

interface CompareTableProps {
  result: CompareResult
}

const OPTION_COLORS = [
  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  bar: 'bg-indigo-500',  border: 'border-indigo-200' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  bar: 'bg-violet-500',  border: 'border-violet-200' },
  { bg: 'bg-sky-50',     text: 'text-sky-700',     bar: 'bg-sky-500',     border: 'border-sky-200'    },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', border: 'border-emerald-200'},
  { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-500',   border: 'border-amber-200'  },
]

function ScoreBar({ score, colorClass }: { score: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-4 text-right">{score}</span>
    </div>
  )
}

export function CompareTable({ result }: CompareTableProps) {
  // Compute total scores per option
  const totals = result.options.map(opt =>
    result.factors.reduce((sum, f) => sum + (opt.scores[f] ?? 0), 0),
  )
  const maxTotal = Math.max(...totals)

  return (
    <div className="space-y-5">
      {/* Recommendation banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
              Recommendation
            </p>
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Score summary chips */}
      <div className="flex flex-wrap gap-2">
        {result.options.map((opt, i) => {
          const col = OPTION_COLORS[i % OPTION_COLORS.length]
          const isWinner = opt.label === result.winner
          return (
            <div
              key={opt.label}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-1.5 border text-sm font-semibold',
                isWinner ? 'bg-indigo-600 text-white border-indigo-600' : `${col.bg} ${col.text} ${col.border}`,
              )}
            >
              {isWinner && <Trophy className="h-3.5 w-3.5" />}
              <span>{opt.label}</span>
              <span className={cn('text-xs font-bold', isWinner ? 'text-indigo-200' : 'opacity-60')}>
                {totals[i]}/{result.factors.length * 10}
              </span>
            </div>
          )
        })}
      </div>

      {/* Factor scores table */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
        {/* Header */}
        <div
          className="grid border-b border-gray-100 bg-gray-50/80"
          style={{ gridTemplateColumns: `1fr repeat(${result.options.length}, 1fr)` }}
        >
          <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Factor
          </div>
          {result.options.map((opt, i) => {
            const col = OPTION_COLORS[i % OPTION_COLORS.length]
            const isWinner = opt.label === result.winner
            return (
              <div
                key={opt.label}
                className={cn(
                  'px-3 py-3 text-xs font-bold text-center border-l border-gray-100',
                  isWinner ? 'text-indigo-700' : col.text,
                )}
              >
                {isWinner && <Trophy className="h-3 w-3 inline mr-1 mb-0.5" />}
                {opt.label}
              </div>
            )
          })}
        </div>

        {/* Rows */}
        {result.factors.map((factor, fi) => (
          <div
            key={factor}
            className={cn(
              'grid border-b border-gray-50 last:border-0',
              fi % 2 === 0 ? 'bg-white' : 'bg-gray-50/40',
            )}
            style={{ gridTemplateColumns: `1fr repeat(${result.options.length}, 1fr)` }}
          >
            <div className="px-4 py-3 text-xs font-semibold text-gray-600 flex items-center">
              {factor}
            </div>
            {result.options.map((opt, i) => {
              const col = OPTION_COLORS[i % OPTION_COLORS.length]
              const score = opt.scores[factor] ?? 0
              const maxScore = Math.max(...result.options.map(o => o.scores[factor] ?? 0))
              const isTop = score === maxScore
              return (
                <div key={opt.label} className="px-3 py-3 border-l border-gray-50">
                  <ScoreBar
                    score={score}
                    colorClass={isTop ? col.bar : 'bg-gray-300'}
                  />
                </div>
              )
            })}
          </div>
        ))}

        {/* Total row */}
        <div
          className="grid bg-gray-50/80 border-t border-gray-100"
          style={{ gridTemplateColumns: `1fr repeat(${result.options.length}, 1fr)` }}
        >
          <div className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
            Total
          </div>
          {result.options.map((opt, i) => {
            const col = OPTION_COLORS[i % OPTION_COLORS.length]
            const isWinner = opt.label === result.winner
            return (
              <div key={opt.label} className="px-3 py-3 border-l border-gray-100 text-center">
                <span
                  className={cn(
                    'text-sm font-bold',
                    isWinner ? 'text-indigo-700' : col.text,
                  )}
                >
                  {totals[i]}/{result.factors.length * 10}
                  {totals[i] === maxTotal && (
                    <TrendingUp className="h-3 w-3 inline ml-1 text-emerald-500" />
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-option summaries */}
      <div className={cn('grid gap-3', result.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}>
        {result.options.map((opt, i) => {
          const col = OPTION_COLORS[i % OPTION_COLORS.length]
          const isWinner = opt.label === result.winner
          return (
            <div
              key={opt.label}
              className={cn(
                'rounded-2xl border p-4 space-y-3',
                isWinner
                  ? 'bg-indigo-50/80 border-indigo-200'
                  : 'bg-white/80 border-white/60 backdrop-blur',
              )}
            >
              <div className="flex items-center gap-2">
                {isWinner && <Trophy className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                <span className={cn('text-sm font-bold', isWinner ? 'text-indigo-700' : col.text)}>
                  {opt.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{opt.summary}</p>
              <div className="space-y-1.5">
                {opt.pros.slice(0, 2).map(p => (
                  <div key={p} className="flex items-start gap-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-gray-600">{p}</span>
                  </div>
                ))}
                {opt.cons.slice(0, 2).map(c => (
                  <div key={c} className="flex items-start gap-1.5">
                    <TrendingDown className="h-3 w-3 text-rose-400 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-gray-600">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
