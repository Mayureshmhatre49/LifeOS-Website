'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, X, CheckCheck, ExternalLink, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification, NotificationModule, NotificationSeverity } from '@/lib/db/notification-queries'

const POLL_INTERVAL_MS = 60_000  // refresh every 60s while panel mounted

const SEVERITY_CONFIG: Record<NotificationSeverity, { icon: typeof Info; color: string; bg: string }> = {
  info:    { icon: Info,           color: 'text-indigo-600',   bg: 'bg-indigo-50'   },
  success: { icon: CheckCircle2,   color: 'text-emerald-600',  bg: 'bg-emerald-50'  },
  warning: { icon: AlertTriangle,  color: 'text-amber-600',    bg: 'bg-amber-50'    },
  urgent:  { icon: AlertCircle,    color: 'text-rose-600',     bg: 'bg-rose-50'     },
}

const MODULE_LABELS: Record<NotificationModule, string> = {
  planner: 'Planner', aura: 'AURA', mind: 'Mind', money: 'Money',
  family: 'Family', protection: 'Protection', system: 'System',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchOnce(skipGenerate = true) {
    try {
      const url = `/api/notifications?limit=20${skipGenerate ? '&skip_generate=true' : ''}`
      const res = await fetch(url)
      if (!res.ok) return
      const j = await res.json()
      setItems(j.items ?? [])
      setUnreadCount(j.unread_count ?? 0)
    } catch {}
  }

  // Initial badge fetch (no generation — that's heavier)
  useEffect(() => {
    fetchOnce(true)
    const t = setInterval(() => fetchOnce(true), POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

  // When user opens panel, run generators + refresh
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchOnce(false).finally(() => setLoading(false))
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [open])

  async function markRead(id: string) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    setUnreadCount(c => Math.max(0, c - 1))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
  }

  async function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    setUnreadCount(0)
    await fetch('/api/notifications/mark-all-read', { method: 'POST' })
  }

  async function dismissOne(id: string) {
    setItems(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="notification-bell"
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        aria-label="Notifications"
        className="relative h-9 w-9 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md hover:bg-indigo-50 flex items-center justify-center transition-all"
      >
        <Bell className={cn('h-4 w-4', unreadCount > 0 ? 'text-indigo-600' : 'text-gray-500')} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-30 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all read"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">All caught up</p>
                <p className="text-xs text-gray-400 mt-1">No alerts. We&apos;ll let you know when something matters.</p>
              </div>
            ) : (
              <div>
                {items.map(n => <NotificationRow key={n.id} n={n} onMarkRead={markRead} onDismiss={dismissOne} />)}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 justify-center"
            >
              See all notifications <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function NotificationRow({ n, onMarkRead, onDismiss }: {
  n: Notification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const cfg = SEVERITY_CONFIG[n.severity]
  const Icon = cfg.icon
  const unread = !n.read_at

  const Content = (
    <div className={cn(
      'group relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
      unread && 'bg-indigo-50/30',
    )}>
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
        <Icon className={cn('h-4 w-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold text-gray-800 truncate', unread && 'font-bold')}>{n.title}</p>
          {unread && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />}
        </div>
        {n.body && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>}
        <p className="text-[10px] text-gray-400 mt-1">
          {MODULE_LABELS[n.module]} · {timeAgo(n.created_at)}
        </p>
      </div>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDismiss(n.id) }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-400 transition-opacity shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )

  const handleClick = () => {
    if (unread) onMarkRead(n.id)
  }

  return n.link ? (
    <Link href={n.link} onClick={handleClick}>{Content}</Link>
  ) : (
    <div onClick={handleClick}>{Content}</div>
  )
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
