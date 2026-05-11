import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const schema = z.object({
  q: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(50).optional(),
})

export type SearchResultType =
  | 'task' | 'journal' | 'gratitude' | 'mood'
  | 'family_task' | 'aura_child' | 'aura_document'
  | 'memory' | 'conversation' | 'companion_session'
  | 'expense' | 'savings_goal'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  snippet?: string
  link: string
  module: string                  // 'planner' | 'mind' | 'family' | 'aura' | 'memory' | 'chat' | 'money'
  score: number
  date?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ results: [] })

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })

  const { q } = parsed.data
  const limit = parsed.data.limit ?? 30
  const userId = session.user.id
  const db = getSupabaseAdmin()
  const ilike = `%${q}%`

  // Run all module searches in parallel. Each returns up to ~5 hits.
  const queries = [
    // Tasks
    db.from('tasks').select('id, title, notes, status, due_date, updated_at').eq('user_id', userId).or(`title.ilike.${ilike},notes.ilike.${ilike}`).order('updated_at', { ascending: false }).limit(5),
    // Journal entries
    db.from('journal_entries').select('id, title, content, mood, created_at').eq('user_id', userId).or(`title.ilike.${ilike},content.ilike.${ilike}`).order('created_at', { ascending: false }).limit(5),
    // Gratitude (text array — match via to_tsvector would be ideal but we'll do a simpler scan)
    db.from('gratitude_entries').select('id, items, date, created_at').eq('user_id', userId).order('date', { ascending: false }).limit(50),
    // Mood notes
    db.from('mood_logs').select('id, note, mood, logged_at').eq('user_id', userId).ilike('note', ilike).order('logged_at', { ascending: false }).limit(5),
    // Family shared tasks
    db.from('shared_tasks').select('id, title, notes, family_id, status, updated_at').or(`title.ilike.${ilike},notes.ilike.${ilike}`).order('updated_at', { ascending: false }).limit(5),
    // AURA profiles
    db.from('aura_profiles').select('id, data, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(20),
    // AURA documents
    db.from('aura_documents').select('id, name, doc_type, child_id, created_at').eq('user_id', userId).ilike('name', ilike).order('created_at', { ascending: false }).limit(5),
    // Memory items
    db.from('memory_items').select('id, key, value, type, updated_at').eq('user_id', userId).eq('is_active', true).or(`key.ilike.${ilike},value.ilike.${ilike}`).order('updated_at', { ascending: false }).limit(5),
    // Conversations (chat)
    db.from('conversations').select('id, title, updated_at').eq('user_id', userId).ilike('title', ilike).order('updated_at', { ascending: false }).limit(5),
    // Companion sessions
    db.from('mind_companion_sessions').select('id, title, mode, updated_at').eq('user_id', userId).or(`title.ilike.${ilike},mode.ilike.${ilike}`).order('updated_at', { ascending: false }).limit(5),
    // Money — expenses
    db.from('expenses').select('id, description, amount, expense_date, category').eq('user_id', userId).ilike('description', ilike).order('expense_date', { ascending: false }).limit(5),
    // Money — savings goals
    db.from('savings_goals').select('id, title, target_amount, current_amount').eq('user_id', userId).ilike('title', ilike).limit(5),
  ]

  const results: SearchResult[] = []

  try {
    const [
      tasks, journals, gratitudes, moods, familyTasks, auraProfiles,
      auraDocs, memories, conversations, companions, expenses, savings,
    ] = await Promise.all(queries)

    for (const t of (tasks.data ?? []) as { id: string; title: string; notes: string | null; status: string; due_date: string | null; updated_at: string }[]) {
      results.push({
        type: 'task', module: 'planner', id: t.id,
        title: t.title, snippet: t.notes ?? undefined,
        link: `/planner`, score: scoreText(q, t.title, t.notes), date: t.updated_at,
      })
    }
    for (const j of (journals.data ?? []) as { id: string; title: string | null; content: string; mood: number | null; created_at: string }[]) {
      results.push({
        type: 'journal', module: 'mind', id: j.id,
        title: j.title || 'Journal entry',
        snippet: j.content.slice(0, 120),
        link: '/mind/journal', score: scoreText(q, j.title ?? '', j.content), date: j.created_at,
      })
    }
    // Gratitude: client-side filter on items array
    const lowerQ = q.toLowerCase()
    for (const g of (gratitudes.data ?? []) as { id: string; items: string[]; date: string; created_at: string }[]) {
      const matched = g.items.filter(it => it.toLowerCase().includes(lowerQ))
      if (matched.length > 0) {
        results.push({
          type: 'gratitude', module: 'mind', id: g.id,
          title: 'Gratitude entry', snippet: matched[0].slice(0, 120),
          link: '/mind/gratitude', score: 4, date: g.date,
        })
      }
    }
    for (const m of (moods.data ?? []) as { id: string; note: string | null; mood: number; logged_at: string }[]) {
      if (!m.note) continue
      results.push({
        type: 'mood', module: 'mind', id: m.id,
        title: `Mood note (${m.mood}/5)`, snippet: m.note.slice(0, 120),
        link: '/mind', score: scoreText(q, '', m.note), date: m.logged_at,
      })
    }
    for (const ft of (familyTasks.data ?? []) as { id: string; title: string; notes: string | null; family_id: string; status: string; updated_at: string }[]) {
      results.push({
        type: 'family_task', module: 'family', id: ft.id,
        title: ft.title, snippet: ft.notes ?? undefined,
        link: `/family`, score: scoreText(q, ft.title, ft.notes), date: ft.updated_at,
      })
    }
    // AURA profiles — client-side filter on full_name
    for (const row of (auraProfiles.data ?? []) as { id: string; data: { full_name?: string }; updated_at: string }[]) {
      const name = row.data.full_name ?? ''
      if (name.toLowerCase().includes(lowerQ)) {
        results.push({
          type: 'aura_child', module: 'aura', id: row.id,
          title: name, snippet: 'Child profile',
          link: '/aura', score: scoreText(q, name, null) + 1, date: row.updated_at,
        })
      }
    }
    for (const d of (auraDocs.data ?? []) as { id: string; name: string; doc_type: string; child_id: string | null; created_at: string }[]) {
      results.push({
        type: 'aura_document', module: 'aura', id: d.id,
        title: d.name, snippet: `Document · ${d.doc_type}`,
        link: '/aura/documents', score: scoreText(q, d.name, null), date: d.created_at,
      })
    }
    for (const m of (memories.data ?? []) as { id: string; key: string; value: string; type: string; updated_at: string }[]) {
      results.push({
        type: 'memory', module: 'memory', id: m.id,
        title: m.key, snippet: m.value.slice(0, 120),
        link: '/dashboard/memory', score: scoreText(q, m.key, m.value), date: m.updated_at,
      })
    }
    for (const c of (conversations.data ?? []) as { id: string; title: string; updated_at: string }[]) {
      results.push({
        type: 'conversation', module: 'chat', id: c.id,
        title: c.title,
        link: `/chat/${c.id}`, score: scoreText(q, c.title, null), date: c.updated_at,
      })
    }
    for (const c of (companions.data ?? []) as { id: string; title: string | null; mode: string; updated_at: string }[]) {
      results.push({
        type: 'companion_session', module: 'mind', id: c.id,
        title: c.title || `Companion · ${c.mode.replace(/_/g, ' ')}`,
        snippet: 'AI companion conversation',
        link: `/mind/companion/${c.id}`, score: scoreText(q, c.title ?? '', c.mode), date: c.updated_at,
      })
    }
    for (const e of (expenses.data ?? []) as { id: string; description: string | null; amount: number; expense_date: string; category: string }[]) {
      if (!e.description) continue
      results.push({
        type: 'expense', module: 'money', id: e.id,
        title: e.description, snippet: `${e.category} · ${e.amount}`,
        link: '/money', score: scoreText(q, e.description, null), date: e.expense_date,
      })
    }
    for (const s of (savings.data ?? []) as { id: string; title: string; target_amount: number; current_amount: number }[]) {
      results.push({
        type: 'savings_goal', module: 'money', id: s.id,
        title: s.title, snippet: `Savings goal · ${s.current_amount}/${s.target_amount}`,
        link: '/money', score: scoreText(q, s.title, null),
      })
    }
  } catch (e) {
    console.warn('[search] error:', e)
  }

  // Sort: primary by score, secondary by recency
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (b.date ?? '').localeCompare(a.date ?? '')
  })

  return NextResponse.json({ results: results.slice(0, limit) })
}

function scoreText(query: string, title: string | null, body: string | null): number {
  const q = query.toLowerCase()
  const t = (title ?? '').toLowerCase()
  const b = (body ?? '').toLowerCase()
  if (t === q) return 10
  if (t.startsWith(q)) return 8
  if (t.includes(q)) return 6
  if (b.includes(q)) return 3
  return 1
}
