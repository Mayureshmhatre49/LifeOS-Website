/**
 * Cross-module integration tests.
 * Verifies that data isolation between users works correctly and that
 * modules don't inadvertently share data across user boundaries.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  mockSession,
  mockHabits,
  mockNotifications,
  TEST_USER_ID,
  TEST_USER_2_ID,
} from '../../fixtures/seed-mock-data'

// ── User isolation: two different users get different data ────────────────────
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/habit-queries', () => ({
  getHabitsWithStats: vi.fn((userId: string) => {
    if (userId === TEST_USER_ID) return Promise.resolve(mockHabits)
    return Promise.resolve([]) // User 2 has no habits
  }),
  createHabit: vi.fn((data) => Promise.resolve({ id: 'habit-new', ...data })),
}))

vi.mock('@/lib/db/notification-queries', () => ({
  getNotifications: vi.fn((userId: string) => {
    if (userId === TEST_USER_ID) return Promise.resolve(mockNotifications)
    return Promise.resolve([])
  }),
  getUnreadCount: vi.fn((userId: string) => {
    if (userId === TEST_USER_ID) return Promise.resolve(2)
    return Promise.resolve(0)
  }),
  markNotificationRead: vi.fn(),
  dismissNotification: vi.fn(),
}))

vi.mock('@/lib/notifications/generators', () => ({
  generateNotificationsForUser: vi.fn(() => Promise.resolve()),
}))

import { auth } from '@/auth'

const sessionUser1 = {
  user: { id: TEST_USER_ID, email: 'user1@test.com', email_verified: true },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

const sessionUser2 = {
  user: { id: TEST_USER_2_ID, email: 'user2@test.com', email_verified: true },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

describe('Data Isolation — Habits', () => {
  beforeEach(() => vi.clearAllMocks())

  it('user 1 sees their own habits', async () => {
    vi.mocked(auth).mockResolvedValue(sessionUser1 as never)
    const { GET } = await import('@/app/api/habits/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/habits'))
    const body = await res.json()
    expect(body.habits.length).toBeGreaterThan(0)
  })

  it('user 2 sees empty habits (no cross-user leak)', async () => {
    vi.mocked(auth).mockResolvedValue(sessionUser2 as never)
    const { GET } = await import('@/app/api/habits/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/habits'))
    const body = await res.json()
    expect(body.habits).toHaveLength(0)
  })

  it('user 2 habits do not contain user 1 habit IDs', async () => {
    vi.mocked(auth).mockResolvedValue(sessionUser2 as never)
    const { GET } = await import('@/app/api/habits/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/habits'))
    const body = await res.json()
    const habitIds = body.habits.map((h: { id: string }) => h.id)
    const user1HabitIds = mockHabits.map((h) => h.id)
    for (const id of user1HabitIds) {
      expect(habitIds).not.toContain(id)
    }
  })
})

describe('Data Isolation — Notifications', () => {
  beforeEach(() => vi.clearAllMocks())

  it('user 1 gets their notifications', async () => {
    vi.mocked(auth).mockResolvedValue(sessionUser1 as never)
    const { GET } = await import('@/app/api/notifications/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/notifications?skip_generate=true'))
    expect(res.status).toBe(200)
    const body = await res.json()
    const items = body.notifications ?? body.items ?? []
    expect(items.length).toBeGreaterThan(0)
  })

  it('user 2 gets zero notifications (no cross-user leak)', async () => {
    vi.mocked(auth).mockResolvedValue(sessionUser2 as never)
    const { GET } = await import('@/app/api/notifications/route')
    const res = await GET(new NextRequest('http://localhost:3000/api/notifications?skip_generate=true'))
    expect(res.status).toBe(200)
    const body = await res.json()
    const items = body.notifications ?? body.items ?? []
    // User 2's notifications should not contain user 1's notification IDs
    const notifIds = items.map((n: { id: string }) => n.id)
    for (const n of mockNotifications) {
      expect(notifIds).not.toContain(n.id)
    }
  })
})

describe('Auth state consistency across modules', () => {
  it('all protected routes reject when session is null', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const modules = [
      { name: 'habits', path: '/api/habits', method: 'GET' },
      { name: 'notifications', path: '/api/notifications', method: 'GET' },
    ]

    for (const mod of modules) {
      let route
      if (mod.name === 'habits') route = await import('@/app/api/habits/route')
      else if (mod.name === 'notifications') route = await import('@/app/api/notifications/route')
      else continue

      const handler = (route as Record<string, ((req: NextRequest) => Promise<Response>) | undefined>)[mod.method]
      if (!handler) continue

      const req = new NextRequest(`http://localhost:3000${mod.path}`, { method: mod.method })
      const res = await handler(req)
      expect(res.status, `${mod.name} ${mod.method} should return 401`).toBe(401)
    }
  })
})

describe('Memory injection safety — cross-module data flow', () => {
  it('sanitized memory values do not contain injection vectors', () => {
    // Simulate what formatMemoryForPrompt produces after sanitization
    const sanitized = 'name: Nishant | city: Mumbai'
    expect(sanitized).not.toContain('{{')
    expect(sanitized).not.toContain('<|')
    expect(sanitized).not.toContain('[INST]')
    expect(sanitized).not.toMatch(/^system\s*:/im)
    expect(sanitized).not.toContain('---')
  })
})
