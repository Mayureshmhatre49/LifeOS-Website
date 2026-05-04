'use client'

import { useState, useEffect } from 'react'
import {
  Brain, Heart, Wind, Moon, Sparkles, BookOpen,
  TrendingUp, Sun, Flame, ArrowRight, Music2, TreePine,
  Shield, MessageCircleHeart, BarChart3, Settings as SettingsIcon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MoodCheckin } from '@/components/home/MoodCheckin'
import type { MoodLog, JournalEntry } from '@/lib/db/mind-queries'

const CALM_TOOLS = [
  { id: 'breathe',     title: 'Breathing Reset', desc: '2-min box breathing',   icon: Wind,     color: 'bg-sky-50 text-sky-600',         href: '/mind/tools/breathing'    },
  { id: 'grounding',   title: 'Panic Grounding', desc: '5-4-3-2-1 senses',      icon: Heart,    color: 'bg-rose-50 text-rose-500',       href: '/mind/tools/grounding'    },
  { id: 'gratitude',   title: 'Gratitude',       desc: '3 things today',        icon: Sparkles, color: 'bg-amber-50 text-amber-600',     href: '/mind/gratitude'          },
  { id: 'journal',     title: 'Journal',         desc: 'Free write + prompts',  icon: BookOpen, color: 'bg-violet-50 text-violet-600',   href: '/mind/journal'            },
  { id: 'sleep',       title: 'Sleep Log',       desc: 'Track rest quality',    icon: Moon,     color: 'bg-indigo-50 text-indigo-600',   href: '/mind/sleep'              },
  { id: 'all-tools',   title: 'All Tools',       desc: '7 calm tools',          icon: TreePine, color: 'bg-emerald-50 text-emerald-600', href: '/mind/tools'              },
]

const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😐', 3: '🙂', 4: '😊', 5: '🤩' }
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WellbeingData {
  score: number
  mood: number
  sleep: number
  gratitude: number
  journal: number
}

function WellbeingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function MindPage() {
  const [wellbeing, setWellbeing] = useState<WellbeingData | null>(null)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [recentJournal, setRecentJournal] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mind/wellbeing')
      .then(r => r.json())
      .then(({ wellbeing, moodLogs, recentJournal }) => {
        setWellbeing(wellbeing)
        setMoodLogs(moodLogs ?? [])
        setRecentJournal(recentJournal ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build 7-day mood chart from real logs
  const today = new Date()
  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const log = moodLogs.find(l => l.logged_at.startsWith(dateStr))
    return { day: DAY_LABELS[d.getDay()], value: log?.mood ?? 0, logged: !!log }
  })

  const logged7 = moodLogs.length
  const avg7 = logged7
    ? (moodLogs.reduce((s, m) => s + m.mood, 0) / logged7).toFixed(1)
    : '—'
  const bestLog = moodLogs.reduce((best, m) => (!best || m.mood > best.mood) ? m : best, null as MoodLog | null)
  const streak = (() => {
    let s = 0
    const cur = new Date(today)
    for (let i = 0; i < 30; i++) {
      const ds = cur.toISOString().split('T')[0]
      if (moodLogs.some(m => m.logged_at.startsWith(ds))) { s++; cur.setDate(cur.getDate() - 1) }
      else break
    }
    return s
  })()

  return (
    <div className="min-h-full px-4 py-5 md:px-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="fade-in flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mind</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Awareness · Calm · Growth</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Link
            href="/mind/analytics"
            title="Analytics & insights"
            className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:bg-violet-50 flex items-center justify-center transition-all"
          >
            <BarChart3 className="h-4 w-4 text-violet-600" />
          </Link>
          <Link
            href="/mind/settings"
            title="Settings & privacy"
            className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <SettingsIcon className="h-4 w-4 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Panic / quick relief — strategic predictability: always 1 tap from anywhere on /mind */}
      <div className="grid grid-cols-2 gap-2 fade-in fade-in-delay-1">
        <Link
          href="/mind/tools/grounding"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Heart className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Panic relief</p>
            <p className="text-[10px] text-white/85">5-4-3-2-1 grounding</p>
          </div>
        </Link>
        <Link
          href="/mind/tools/breathing"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Wind className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Breathing reset</p>
            <p className="text-[10px] text-white/85">2-min box breathing</p>
          </div>
        </Link>
      </div>

      {/* Mood check-in */}
      <div className="fade-in fade-in-delay-1">
        <MoodCheckin />
      </div>

      {/* Wellbeing score */}
      {!loading && wellbeing && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4 fade-in fade-in-delay-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-500" />
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Wellbeing Score</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-violet-700">{wellbeing.score}</span>
              <span className="text-xs text-violet-400">/100</span>
            </div>
          </div>
          <div className="space-y-2">
            <WellbeingBar label="Mood"      value={wellbeing.mood}      color="bg-violet-400" />
            <WellbeingBar label="Sleep"     value={wellbeing.sleep}     color="bg-indigo-400" />
            <WellbeingBar label="Gratitude" value={wellbeing.gratitude} color="bg-amber-400"  />
            <WellbeingBar label="Journal"   value={wellbeing.journal}   color="bg-emerald-400" />
          </div>
        </div>
      )}

      {/* Mood stats row */}
      <div className="grid grid-cols-3 gap-2 fade-in fade-in-delay-1">
        {[
          { id: 'avg',    label: '7-day avg',  value: avg7,      sub: logged7 ? 'entries' : 'no data',    color: 'text-emerald-600', icon: TrendingUp },
          { id: 'best',   label: 'Best day',   value: bestLog ? DAY_LABELS[new Date(bestLog.logged_at).getDay()] : '—', sub: bestLog ? `Score ${bestLog.mood}/5` : 'no data', color: 'text-violet-600', icon: Sun },
          { id: 'streak', label: 'Streak',     value: streak > 0 ? `${streak}d` : '—',  sub: 'logged daily', color: 'text-amber-600', icon: Flame },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
              <Icon className={cn('h-4 w-4 mx-auto mb-1', stat.color)} />
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{stat.label}</p>
              <p className="text-[9px] text-gray-300 leading-tight">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Mood chart — last 7 days */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 fade-in fade-in-delay-2">
        <p className="text-sm font-bold text-gray-800 mb-3">7-Day Mood</p>
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent" />
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-16">
            {chartDays.map(({ day, value, logged }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500',
                    logged ? 'bg-gradient-to-t from-violet-400 to-indigo-400' : 'bg-gray-100'
                  )}
                  style={{ height: value > 0 ? `${(value / 5) * 52}px` : '4px' }}
                />
                <span className="text-[9px] text-gray-400 font-medium">{day}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-400">😔 Low</span>
          <span className="text-[10px] text-gray-400">Great 🤩</span>
        </div>
      </div>

      {/* AI Companion CTA */}
      <Link
        href="/mind/companion"
        className="block rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-4 shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5 transition-all fade-in fade-in-delay-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Talk to a Companion</p>
            <p className="text-[11px] text-white/80 mt-0.5">Calm Friend · Therapist · Founder · Relationship · Sleep</p>
          </div>
          <ArrowRight className="h-4 w-4 text-white/70 shrink-0" />
        </div>
      </Link>

      {/* Calm tools */}
      <div className="fade-in fade-in-delay-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Calm Tools</p>
        <div className="grid grid-cols-3 gap-2">
          {CALM_TOOLS.map(tool => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', tool.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{tool.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tool.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent journal notes — real data */}
      <div className="fade-in fade-in-delay-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Notes</p>
          </div>
          <Link href="/mind/journal" className="text-[11px] text-indigo-500 font-semibold hover:text-indigo-700 flex items-center gap-1">
            All notes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="h-20 flex items-center justify-center text-xs text-gray-400">Loading…</div>
        ) : recentJournal.length === 0 ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-dashed border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400">No journal entries yet.</p>
            <Link href="/mind/journal" className="text-xs text-indigo-500 font-semibold mt-1 inline-block">
              Write your first entry →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentJournal.map(entry => (
              <div key={entry.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{entry.mood ? MOOD_EMOJIS[entry.mood] : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{entry.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI insight */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4 fade-in fade-in-delay-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Insight</p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {wellbeing && wellbeing.score >= 70
            ? "Your wellbeing score is strong. Keep the momentum — consistency with journaling and sleep quality are your biggest drivers right now."
            : wellbeing && wellbeing.sleep < 50
            ? "Sleep quality is pulling your score down. Even one earlier night this week can shift your mood and focus significantly."
            : wellbeing && wellbeing.gratitude < 50
            ? "Logging 3 gratitudes takes under a minute and consistently boosts mood within 2 weeks. Try the Gratitude tool today."
            : "Journaling on low-mood days correlates with faster recovery. Try a 2-min note on rough days — the prompt will guide you."}
        </p>
        <Link
          href="/chat?prompt=How can I improve my mental wellness this week?"
          className="mt-3 flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 transition-colors"
        >
          Ask AI for guidance <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Music / ambience */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 flex items-center gap-4 fade-in fade-in-delay-5">
        <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
          <Music2 className="h-6 w-6 text-purple-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Focus Sounds</p>
          <p className="text-xs text-gray-400 mt-0.5">Rain · Forest · White noise · Lo-fi</p>
        </div>
        <Link
          href="/focus?mode=sounds"
          className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
        >
          Play
        </Link>
      </div>
    </div>
  )
}
