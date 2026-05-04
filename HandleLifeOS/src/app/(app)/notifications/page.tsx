'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCheck, Filter } from 'lucide-react'
import { NotificationRow } from '@/components/notifications/NotificationBell'
import type { Notification, NotificationModule } from '@/lib/db/notification-queries'
import { cn } from '@/lib/utils'

const MODULE_FILTERS: { id: NotificationModule | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'planner', label: 'Planner' },
  { id: 'aura', label: 'AURA' },
  { id: 'mind', label: 'Mind' },
  { id: 'money', label: 'Money' },
  { id: 'family', label: 'Family' },
  { id: 'system', label: 'System' },
]

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [filter, setFilter] = useState<NotificationModule | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications?limit=200')
      .then(r => r.json())
      .then(({ items }) => setItems(items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    await fetch('/api/notifications/mark-all-read', { method: 'POST' })
  }

  async function markRead(id: string) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
  }

  async function dismiss(id: string) {
    setItems(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
  }

  const filtered = items.filter(n => {
    if (filter !== 'all' && n.module !== filter) return false
    if (showUnreadOnly && n.read_at) return false
    return true
  })

  const unreadCount = items.filter(n => !n.read_at).length

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {MODULE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-3 py-1 rounded-full border text-xs font-semibold transition-all',
              filter === f.id
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-200',
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowUnreadOnly(v => !v)}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold transition-all',
            showUnreadOnly
              ? 'bg-rose-100 border-rose-300 text-rose-700'
              : 'bg-white border-gray-200 text-gray-500',
          )}
        >
          <Filter className="h-3 w-3" />
          Unread only
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white border border-white/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Bell className="h-10 w-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">
              {filter === 'all' && !showUnreadOnly ? 'All caught up' : 'Nothing matches your filter'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {filter === 'all' && !showUnreadOnly
                ? "We'll surface alerts when overdue tasks, milestone gaps, or other signals appear."
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(n => <NotificationRow key={n.id} n={n} onMarkRead={markRead} onDismiss={dismiss} />)}
          </div>
        )}
      </div>
    </div>
  )
}
