import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const EMAIL = 'daniel.reyes@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedDaniel() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Daniel Reyes',
    occupation: 'Senior Accessibility Engineer',
    life_stage: 'mid_career',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Chicago',
    goals: [
      'Contribute WCAG 3.0 success criteria via W3C working group',
      'Release open-source ARIA component library v2',
      'Speak at Axe-Con accessibility conference 2027',
      'Achieve staff engineer promotion at current employer',
      'Mentor two junior engineers from underrepresented communities',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 2200, spent: 2200 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 600, spent: 512 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 200, spent: 145 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 300, spent: 220 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 180, spent: 172 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 150, spent: 88 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 1500, spent: 1500 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 2200, category: 'rent', description: 'May rent – East Austin apartment', expense_date: '2026-05-01' },
      { user_id: uid, amount: 128, category: 'food', description: 'HEB grocery delivery', expense_date: '2026-05-03' },
      { user_id: uid, amount: 45, category: 'transport', description: 'Lyft to office (accessible vehicle)', expense_date: '2026-05-07' },
      { user_id: uid, amount: 220, category: 'health', description: 'Low-vision specialist follow-up', expense_date: '2026-05-06' },
      { user_id: uid, amount: 29, category: 'entertainment', description: 'Audible subscription', expense_date: '2026-05-01' },
      { user_id: uid, amount: 99, category: 'entertainment', description: 'Axe-Con virtual conference ticket', expense_date: '2026-05-08' },
      { user_id: uid, amount: 172, category: 'utilities', description: 'Internet + electricity May', expense_date: '2026-05-02' },
      { user_id: uid, amount: 1500, category: 'investment', description: '401(k) contribution May', expense_date: '2026-05-15' },
    ])
  }

  // Habits
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Morning keyboard-focused code review', frequency: 'daily', current_streak: 22, target_streak: 30, started_on: '2026-04-12', category: 'work' },
      { user_id: uid, name: 'Gym – strength training', frequency: 'weekly', current_streak: 8, target_streak: 12, started_on: '2026-03-01', category: 'health' },
      { user_id: uid, name: 'ARIA spec reading – 20 min', frequency: 'daily', current_streak: 15, target_streak: 30, started_on: '2026-04-20', category: 'learning' },
      { user_id: uid, name: 'Weekly screen-reader compatibility audit', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-15', category: 'work' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'ARIA live region implementation – chat module', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T10:28:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'WCAG 2.2 audit report – client portal', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T10:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 45, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'Axe-Con talk outline – keyboard navigation patterns', notes: 'Interrupted by team standup', started_at: '2026-05-07T14:00:00Z', ended_at: '2026-05-07T14:45:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 3) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Productive deep work day. ARIA PR merged.', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Steady. Long meeting disrupted flow but manageable.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Great gym session. Axe-Con talk proposal accepted.', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Tired. Accessibility audit took longer than estimated.', logged_at: '2026-05-06T20:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Screen reader support merged into main codebase', 'Colleague offered to help test keyboard flows', 'Fresh air walk to the coffee shop'] },
    { date: '2026-05-08', items: ['W3C working group accepted my ARIA 1.3 draft comment', 'Good sleep – felt sharp all day', 'Favourite podcast episode on inclusive design'] },
    { date: '2026-05-07', items: ['Axe-Con 2027 talk slot confirmed', 'Gym PR on deadlift', 'Text from mentor Alex checking in'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: 'Spent the morning reviewing the new input component. The focus ring is gone in Chrome after the latest update — filed a bug immediately. This kind of regression is exactly why we need automated accessibility CI. Working on a proposal to add axe-core to the PR pipeline.', mood_tag: 'focused', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: 'Great conversation with the product team today about WCAG 2.2 pointer target size. Genuine curiosity from their side, not the usual pushback. Progress. The Axe-Con keynote is shaping up: keyboard traps and why modal dialogs still fail 60% of tested sites.', mood_tag: 'motivated', created_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, content: "Mentor session with Alex. Reminded me that staff eng isn't just about code — it's about influence and documentation. I need to finally write up the ARIA live region guide. Stop procrastinating. Blocking time next week.", mood_tag: 'reflective', created_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Should I return to the office 3 days/week or negotiate fully remote?',
        options: JSON.stringify([
          { label: 'Return to office 3×/week', pros: ['In-person whiteboard sessions', 'Team visibility for promotion'], cons: ['Commute accessibility challenges', 'Rigid schedule', 'Open floor plan sensory overload'] },
          { label: 'Negotiate fully remote', pros: ['Optimised home setup (NVDA, custom shortcuts)', 'No commute barriers', 'More deep work time'], cons: ['Less organic visibility', 'Miss some team culture moments'] },
        ]),
        result: JSON.stringify({ decision: 'Negotiate fully remote with quarterly in-person sprints', reasoning: 'Home setup is optimised for accessibility. Quarterly sprints maintain team connection. Company agreed to remote accommodations.' }),
        mode: 'compare',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Which accessibility certification should I pursue next — CPACC or WAS?',
        options: JSON.stringify([
          { label: 'CPACC (Accessibility Core Competencies)', pros: ['Broader recognition', 'Good for leadership path'], cons: ['Less technical depth'] },
          { label: 'WAS (Web Accessibility Specialist)', pros: ['Deeply technical', 'Directly relevant to ARIA/WCAG work'], cons: ['Narrower scope'] },
        ]),
        result: JSON.stringify({ decision: 'WAS first, then CPACC in 2027', reasoning: 'WAS aligns directly with current work and supports the staff eng promotion case.' }),
        mode: 'compare',
        favorite: false,
      },
    ])
  }

  // Investments
  if (await cnt('investments', uid) < 3) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Fidelity 401(k) – Aggressive Growth', type: 'mutual_fund', invested_amount: 48000, current_value: 56200, account: 'Fidelity 401(k)' },
      { user_id: uid, name: 'Vanguard S&P 500 ETF (VOO)', type: 'etf', invested_amount: 22000, current_value: 25800, account: 'Vanguard Brokerage' },
      { user_id: uid, name: 'Apple Inc. (AAPL)', type: 'stocks', invested_amount: 8000, current_value: 9100, account: 'Vanguard Brokerage' },
    ])
  }

  // Contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Alex Torres', group_name: 'Mentor', email: 'alex.torres@example.com', notes: 'Staff accessibility engineer at Google. Mentor since 2024. Monthly 1:1 calls.' },
      { user_id: uid, name: 'Priya Mani', group_name: 'Colleague', email: 'priya.mani@example.com', notes: 'Front-end lead, key ally for accessibility advocacy on the team.' },
      { user_id: uid, name: 'Jordan Kim', group_name: 'Friend', notes: 'Austin disability advocacy group. Meets monthly for coffee.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Promote to Staff Engineer', category: 'role', status: 'active', target_date: '2027-06-01', progress_pct: 45, notes: 'Sponsor identified. Scope doc in progress. Axe-Con talk will help visibility.' },
      { user_id: uid, title: 'WAS (Web Accessibility Specialist) Certification', category: 'skill', status: 'active', target_date: '2026-11-01', progress_pct: 30, notes: 'Self-study 4 weeks in. Mock exam scheduled for September.' },
      { user_id: uid, title: 'Publish open-source ARIA component library', category: 'impact', status: 'active', target_date: '2026-08-01', progress_pct: 60, notes: 'v1 beta live on GitHub. v2 adds live regions + alert patterns.' },
    ])
  }

  // Trip
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Denver',
      country: 'US',
      starts_on: '2027-03-10',
      ends_on: '2027-03-13',
      budget_total: 1200,
      status: 'planning',
      purpose: 'conference',
      notes: 'Axe-Con 2027 — speaking on keyboard navigation patterns. Need accessible hotel room with roll-in shower confirmed.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'flight', title: 'Austin → Denver (accessible seating pre-booked)', starts_at: '2027-03-10T08:00:00Z', ends_at: '2027-03-10T10:15:00Z', cost: 280 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Hyatt Regency Denver (ADA accessible room confirmed)', starts_at: '2027-03-10T15:00:00Z', ends_at: '2027-03-13T11:00:00Z', cost: 620 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Axe-Con keynote — presenter (keyboard navigation patterns)', starts_at: '2027-03-11T10:00:00Z', ends_at: '2027-03-11T11:00:00Z', cost: 0 },
      ])
    }
  }

  console.log('✓ Daniel Reyes seeded')
}
seedDaniel().catch(e => { console.error(e); process.exit(1) })
