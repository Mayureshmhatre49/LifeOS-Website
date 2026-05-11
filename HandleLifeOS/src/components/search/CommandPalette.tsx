'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, Loader2, ArrowRight, Briefcase, Heart, Users, BookOpen,
  Wallet, FileText, MessageSquare, Lightbulb, Sparkles, Calendar,
  Crown, Settings as SettingsIcon, BarChart3, Home, Sun, ShieldCheck, GraduationCap,
  Apple, Scale, Building2, FolderArchive, UsersRound, Plane, Building, TrendingUp, Repeat,
  Wand2, Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult, SearchResultType } from '@/app/api/search/route'

const TYPE_ICONS: Record<SearchResultType, typeof Briefcase> = {
  task:               Briefcase,
  journal:            BookOpen,
  gratitude:          Sparkles,
  mood:               Heart,
  family_task:        Users,
  aura_child:         Sparkles,
  aura_document:      FileText,
  memory:             Lightbulb,
  conversation:       MessageSquare,
  companion_session:  MessageSquare,
  expense:            Wallet,
  savings_goal:       Wallet,
}

interface QuickAction {
  label: string
  hint?: string
  icon: typeof Home
  href: string
  keywords: string[]
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Home',           icon: Home,           href: '/dashboard',          keywords: ['home', 'dashboard'] },
  { label: 'Today',          icon: Sun,            href: '/today',              keywords: ['today'] },
  { label: 'Chat',           icon: MessageSquare,  href: '/chat',               keywords: ['chat', 'ai'] },
  { label: 'Planner',        icon: Calendar,       href: '/planner',            keywords: ['tasks', 'planner', 'todo'] },
  { label: 'Money',          icon: Wallet,         href: '/money',              keywords: ['money', 'budget', 'expenses'] },
  { label: 'Family',         icon: Users,          href: '/family',             keywords: ['family'] },
  { label: 'AURA',           icon: Sparkles,       href: '/aura',               keywords: ['aura', 'children', 'kids'] },
  { label: 'Mental Health',  icon: Heart,          href: '/mind',               keywords: ['mind', 'mental', 'mood'] },
  { label: 'Habits',          icon: Repeat,         href: '/habits',             keywords: ['habits', 'streaks'] },
  { label: 'Nutrition',       icon: Apple,          href: '/nutrition',          keywords: ['food', 'meal', 'recipes', 'calories', 'grocery', 'nutrition'] },
  { label: 'Daily Briefing',  icon: Sparkles,       href: '/briefing',           keywords: ['briefing', 'morning', 'coach'] },
  { label: 'Investments',     icon: TrendingUp,     href: '/investments',        keywords: ['investments', 'sip', 'mutual fund', 'portfolio'] },
  { label: 'Network',         icon: UsersRound,     href: '/network',            keywords: ['network', 'contacts', 'crm', 'follow up'] },
  { label: 'Career',          icon: Briefcase,      href: '/career',             keywords: ['career', 'goals', 'skills', 'learning'] },
  { label: 'Business',        icon: Building2,      href: '/business',           keywords: ['business', 'invoice', 'clients', 'projects', 'gst', 'p&l'] },
  { label: 'Travel',          icon: Plane,          href: '/travel',             keywords: ['travel', 'trip', 'packing', 'itinerary'] },
  { label: 'Home & Property', icon: Building,       href: '/home',               keywords: ['home', 'property', 'maintenance', 'bills', 'utility'] },
  { label: 'Document Vault',  icon: FolderArchive,  href: '/vault',              keywords: ['vault', 'documents', 'pan', 'aadhaar', 'passport'] },
  { label: 'Legal',           icon: Scale,          href: '/legal',              keywords: ['legal', 'tax', 'itr', 'gst', 'compliance', 'contract'] },
  { label: 'Notifications',   icon: BarChart3,      href: '/notifications',      keywords: ['notifications', 'alerts'] },
  { label: 'Insights',        icon: BarChart3,      href: '/insights',           keywords: ['insights', 'analytics'] },
  { label: 'Protection',      icon: ShieldCheck,    href: '/protection',         keywords: ['protection', 'scam'] },
  { label: 'Memory Vault',    icon: Lightbulb,      href: '/dashboard/memory',   keywords: ['memory', 'vault'] },
  { label: 'AURA Coach',      icon: GraduationCap,  href: '/aura/coach',         keywords: ['aura coach', 'parenting'] },
  { label: 'Mind Companion',  icon: MessageSquare,  href: '/mind/companion',     keywords: ['companion', 'mind chat'] },
  { label: 'Premium',         icon: Crown,          href: '/premium',            keywords: ['premium', 'upgrade', 'plan'] },
  { label: 'Community',       icon: Trophy,         href: '/community',          keywords: ['community', 'challenges', 'partners', 'achievements', 'accountability', 'leaderboard'] },
  { label: 'Personalisation', icon: Wand2,          href: '/settings/personalisation', keywords: ['personalisation', 'tone', 'preferences', 'ai personality', 'patterns'] },
  { label: 'Settings',        icon: SettingsIcon,   href: '/settings',           keywords: ['settings'] },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter quick actions by query (instant, no API call)
  const matchingActions = query.trim().length === 0
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.some(k => k.includes(query.toLowerCase())),
      )

  // Combined navigable list: actions first, then results
  const allItems: { kind: 'action'; data: QuickAction }[] | { kind: 'result'; data: SearchResult }[] | (
    { kind: 'action'; data: QuickAction } | { kind: 'result'; data: SearchResult }
  )[] = [
    ...matchingActions.map(a => ({ kind: 'action' as const, data: a })),
    ...results.map(r => ({ kind: 'result' as const, data: r })),
  ]

  // Debounced server search
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, limit: 30 }),
        })
        if (res.ok) {
          const j = await res.json()
          setResults(j.results ?? [])
        }
      } catch {} finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query, open])

  // Reset when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Clamp activeIdx to valid range during render (avoids derived-state effect)
  const clampedIdx = activeIdx < allItems.length ? activeIdx : 0

  const handleSelect = useCallback((item: { kind: 'action'; data: QuickAction } | { kind: 'result'; data: SearchResult }) => {
    onClose()
    router.push(item.kind === 'action' ? item.data.href : item.data.link)
  }, [onClose, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = allItems[clampedIdx]
      if (item) handleSelect(item)
    }
  }, [allItems, clampedIdx, handleSelect, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-white/40 overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search anything · or type to navigate"
            className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-500">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {allItems.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="h-6 w-6 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{query ? 'No matches' : 'Start typing'}</p>
              {!query && <p className="text-xs text-gray-400 mt-1">Search tasks, journal, family, money, AURA, memory…</p>}
            </div>
          ) : (
            <div className="py-1">
              {/* Quick actions section */}
              {matchingActions.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {query ? 'Quick navigation' : 'Go to'}
                  </p>
                  {matchingActions.map((a, i) => {
                    const idx = i
                    const Icon = a.icon
                    return (
                      <button
                        key={a.href}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect({ kind: 'action', data: a })}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                          clampedIdx === idx ? 'bg-indigo-50' : 'hover:bg-gray-50',
                        )}
                      >
                        <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{a.label}</p>
                          {a.hint && <p className="text-[11px] text-gray-400">{a.hint}</p>}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                      </button>
                    )
                  })}
                </>
              )}

              {/* Search results section */}
              {results.length > 0 && (
                <>
                  <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Across your data
                  </p>
                  {results.map((r, i) => {
                    const idx = matchingActions.length + i
                    const Icon = TYPE_ICONS[r.type] ?? Briefcase
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect({ kind: 'result', data: r })}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2 text-left transition-colors',
                          clampedIdx === idx ? 'bg-indigo-50' : 'hover:bg-gray-50',
                        )}
                      >
                        <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                          {r.snippet && <p className="text-[11px] text-gray-500 truncate">{r.snippet}</p>}
                          <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{r.module} · {r.type.replace(/_/g, ' ')}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-1" />
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600">↑↓</kbd> navigate
            <kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600">↵</kbd> select
          </span>
          <span><kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 text-gray-600">⌘K</kbd> to open</span>
        </div>
      </div>
    </div>
  )
}
