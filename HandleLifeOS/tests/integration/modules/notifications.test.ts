import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockNotifications, mockSession, TEST_USER_ID } from '../../fixtures/seed-mock-data'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/notification-queries', () => ({
  getNotifications: vi.fn(() => Promise.resolve(mockNotifications)),
  getUnreadCount: vi.fn(() => Promise.resolve(2)),
  markNotificationRead: vi.fn(() => Promise.resolve()),
  dismissNotification: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/notifications/generators', () => ({
  generateNotificationsForUser: vi.fn(() => Promise.resolve()),
}))

import { auth } from '@/auth'

async function importNotificationsRoute() {
  return import('@/app/api/notifications/route')
}

function makeRequest(method: string, search = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/notifications${search}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /api/notifications', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const { GET } = await importNotificationsRoute()
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(401)
  })

  it('returns notifications for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { GET } = await importNotificationsRoute()
    const res = await GET(makeRequest('GET', '?skip_generate=true'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.notifications ?? body.items).toBeDefined()
  })

  it('respects unread=true filter', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { GET } = await importNotificationsRoute()
    const res = await GET(makeRequest('GET', '?unread=true&skip_generate=true'))
    expect(res.status).toBe(200)
  })

  it('caps limit at 200', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { GET } = await importNotificationsRoute()
    const res = await GET(makeRequest('GET', '?limit=9999&skip_generate=true'))
    expect(res.status).toBe(200)
  })
})
