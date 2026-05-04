'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Moon, ArrowLeft, Sun, TrendingUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SleepLog } from '@/lib/db/mind-queries'

const QUALITY_CONFIG: Record<number, { label: string; emoji: string; color: string; bg: string }> = {
  1: { label: 'Terrible', emoji: '😩', color: 'text-red-600',    bg: 'bg-red-50 border-red-200'     },
  2: { label: 'Poor',     emoji: '😞', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  3: { label: 'Okay',     emoji: '😐', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200'  },
  4: { label: 'Good',     emoji: '😊', color: 'text-green-600',  bg: 'bg-green-50 border-green-200'  },
  5: { label: 'Great',    emoji: '😴', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
}

const SLEEP_TIPS: Record<number, string[]> = {
  1: ['Avoid screens 1 hour before bed', 'Try a consistent wake time — even weekends', 'Consider a short body-scan meditation'],
  2: ['Keep your room cool and dark', 'Limit caffeine after 2 PM', 'Wind down with light reading or stretching'],
  3: ['You&apos;re close! Try going to bed 30 min earlier', 'Avoid heavy meals within 2 hours of sleep'],
  4: ['Great sleep! Keep the routine consistent', 'Morning light in the first 30 min helps anchor your rhythm'],
  5: ['Outstanding! You&apos;re hitting your sleep goals', 'Log what you did differently — replicate it'],
}

function parseDuration(bedtime: string, wakeTime: string): number | null {
  if (!bedtime || !wakeTime) return null
  try {
    const [bh, bm] = bedtime.split(':').map(Number)
    const [wh, wm] = wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    return Math.round((mins / 60) * 100) / 100
  } catch { return null }
}

export default function SleepPage() {
  const [logs, setLogs] = useState<SleepLog[]>([])
  const [loading, setLoading] = useState(true)
  const [bedtime, setBedtime] = useState('22:30')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [quality, setQuality] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [todayLogged, setTodayLogged] = useState(false)

  const duration = parseDuration(bedtime, wakeTime)

  useEffect(() => {
    fetch('/api/mind/sleep?limit=14')
      .then(r => r.json())
      .then(({ logs }) => {
        setLogs(logs ?? [])
        const today = new Date().toISOString().split('T')[0]
        const todayLog = (logs ?? []).find((l: SleepLog) => l.date === today)
        if (todayLog) {
          setBedtime(todayLog.bedtime ?? '22:30')
          setWakeTime(todayLog.wake_time ?? '06:30')
          setQuality(todayLog.quality ?? null)
          setNotes(todayLog.notes ?? '')
          setTodayLogged(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!quality || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/mind/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bedtime,
          wake_time: wakeTime,
          duration_hours: duration ?? undefined,
          quality,
          notes: notes.trim() || undefined,
        }),
      })
      if (res.ok) {
        const { log } = await res.json()
        const today = new Date().toISOString().split('T')[0]
        setLogs(prev => {
          const filtered = prev.filter(l => l.date !== today)
          return [log, ...filtered]
        })
        setTodayLogged(true)
      }
    } finally {
      setSaving(false)
    }
  }

  const avgQuality = logs.length
    ? logs.reduce((s, l) => s + (l.quality ?? 0), 0) / logs.filter(l => l.quality).length
    : 0

  const avgDuration = logs.filter(l => l.duration_hours).length
    ? logs.filter(l => l.duration_hours).reduce((s, l) => s + (l.duration_hours ?? 0), 0) /
      logs.filter(l => l.duration_hours).length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mind" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Moon className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sleep Log</h1>
        </div>
      </div>

      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
            <Moon className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
            <p className="text-lg font-bold text-indigo-600">{avgDuration ? avgDuration.toFixed(1) + 'h' : '—'}</p>
            <p className="text-[10px] text-gray-400">Avg duration</p>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-violet-500" />
            <p className="text-lg font-bold text-violet-600">{avgQuality ? avgQuality.toFixed(1) : '—'}/5</p>
            <p className="text-[10px] text-gray-400">Avg quality</p>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold text-emerald-600">{logs.length}</p>
            <p className="text-[10px] text-gray-400">Days tracked</p>
          </div>
        </div>
      )}

      {/* Log form */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800">Log last night&apos;s sleep</p>
          {todayLogged && (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Logged today
            </div>
          )}
        </div>

        {/* Bedtime & Wake time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
              <label className="text-xs font-semibold text-gray-600">Bedtime</label>
            </div>
            <input
              type="time"
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <label className="text-xs font-semibold text-gray-600">Wake time</label>
            </div>
            <input
              type="time"
              value={wakeTime}
              onChange={e => setWakeTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Duration display */}
        {duration !== null && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold',
            duration >= 7 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : duration >= 6 ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-red-50 border-red-200 text-red-700'
          )}>
            <Moon className="h-3.5 w-3.5" />
            {duration.toFixed(1)} hours sleep
            {duration >= 7 ? ' — Great!' : duration >= 6 ? ' — Almost enough' : ' — Under 6h, consider earlier bedtime'}
          </div>
        )}

        {/* Quality rating */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Sleep quality</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(v => {
              const cfg = QUALITY_CONFIG[v]
              return (
                <button
                  key={v}
                  onClick={() => setQuality(v === quality ? null : v)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all',
                    quality === v ? cfg.bg : 'border-gray-100 bg-gray-50'
                  )}
                >
                  <span className="text-xl">{cfg.emoji}</span>
                  <span className={cn('text-[9px] font-semibold', quality === v ? cfg.color : 'text-gray-400')}>
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tips based on quality */}
        {quality && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
            <p className="text-xs font-bold text-indigo-700 mb-1.5">Sleep tip</p>
            <p className="text-xs text-indigo-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: SLEEP_TIPS[quality][0] }} />
          </div>
        )}

        {/* Notes */}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything affecting sleep? (stress, caffeine, late screens…)"
          rows={2}
          maxLength={300}
          className="w-full text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400"
        />

        <button
          onClick={handleSave}
          disabled={!quality || saving}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : todayLogged ? 'Update log' : 'Save sleep log'}
        </button>
      </div>

      {/* 7-day chart */}
      {logs.length > 0 && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">14-Day Sleep Quality</p>
          <div className="flex items-end gap-1.5 h-16">
            {logs.slice(0, 14).reverse().map(log => (
              <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500',
                    (log.quality ?? 0) >= 4 ? 'bg-gradient-to-t from-indigo-400 to-violet-400'
                    : (log.quality ?? 0) >= 3 ? 'bg-gradient-to-t from-amber-300 to-amber-400'
                    : 'bg-gradient-to-t from-red-300 to-red-400'
                  )}
                  style={{ height: `${((log.quality ?? 0) / 5) * 52}px` }}
                />
                <span className="text-[8px] text-gray-400 font-medium">
                  {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">Poor</span>
            <span className="text-[10px] text-gray-400">Great</span>
          </div>
        </div>
      )}

      {/* History list */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent logs</p>
          {logs.slice(0, 7).map(log => {
            const cfg = QUALITY_CONFIG[log.quality ?? 3]
            return (
              <div key={log.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">{cfg.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.bedtime && log.wake_time ? `${log.bedtime} → ${log.wake_time}` : ''}
                    {log.duration_hours ? ` · ${log.duration_hours.toFixed(1)}h` : ''}
                  </p>
                  {log.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{log.notes}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
