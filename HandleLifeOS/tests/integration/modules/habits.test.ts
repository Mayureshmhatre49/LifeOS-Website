/**
 * Habits module integration tests.
 * Tests Zod validation + auth guard logic by importing and calling route handlers directly
 * with mocked auth and DB layers.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { mockHabits, mockSession } from '../../fixtures/seed-mock-data'

// Mock auth and DB — route handler imports these
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  isSupabaseConfigured: vi.fn(() => true),
  getSupabaseAdmin: vi.fn(),
}))

vi.mock('@/lib/db/habit-queries', () => ({
  getHabitsWithStats: vi.fn(() => Promise.resolve(mockHabits)),
  createHabit: vi.fn((data) => Promise.resolve({ id: 'habit-new-001', ...data })),
  logHabit: vi.fn(() => Promise.resolve({ id: 'log-001' })),
}))

import { auth } from '@/auth'

async function importHabitsRoute() {
  return import('@/app/api/habits/route')
}

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/habits', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('GET /api/habits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const { GET } = await importHabitsRoute()
    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns habits list when authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { GET } = await importHabitsRoute()
    const req = makeRequest('GET')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.habits).toBeDefined()
    expect(Array.isArray(body.habits)).toBe(true)
  })
})

describe('POST /api/habits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const { POST } = await importHabitsRoute()
    const req = makeRequest('POST', { name: 'Morning run' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid payload (empty name)', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { POST } = await importHabitsRoute()
    const req = makeRequest('POST', { name: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid frequency', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { POST } = await importHabitsRoute()
    const req = makeRequest('POST', { name: 'Run', frequency: 'invalid_freq' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates habit for valid payload', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { POST } = await importHabitsRoute()
    const req = makeRequest('POST', { name: 'Morning run', frequency: 'daily' })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.habit).toBeDefined()
    expect(body.habit.name ?? body.habit.id).toBeTruthy()
  })

  it('rejects name over 80 chars', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never)
    const { POST } = await importHabitsRoute()
    const req = makeRequest('POST', { name: 'a'.repeat(81) })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
