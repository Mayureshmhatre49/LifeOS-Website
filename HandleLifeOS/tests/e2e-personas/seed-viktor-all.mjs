// Viktor Reiss — Adversarial red-team persona, Hamburg Germany.
// PURPOSE: QA security test coverage. Minimal benign-looking data footprint.
// Decision logs document planned test scenarios referencing CLAUDE.md security checklist.
// All data is legitimate and non-malicious — this persona EXISTS to test that the platform
// handles adversarial input gracefully (rate limiting, prompt guards, CSP, RLS, etc.).
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

const EMAIL = 'viktor.reiss@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedViktor() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — minimal, neutral, benign-looking
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Viktor Reiss',
    occupation: 'IT Security Consultant',
    life_stage: 'mid_career',
    country: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    goals: [
      'Complete platform security assessment for Q3 2026 engagement',
      'Verify rate limiting, CSP, and RLS controls are functioning as documented',
      'Document findings in structured test report for client (Life OS Dev team)',
      'OSCP renewal by December 2026',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — minimal (consultant on engagement, company covers most costs)
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1600, spent: 1600 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 400, spent: 345 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 150, spent: 142 },
    { user_id: uid, month: 5, year: 2026, category: 'education', amount: 200, spent: 199 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — minimal footprint
  if (await cnt('expenses', uid) < 3) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1600, category: 'rent', description: 'May rent – Hamburg Altona apartment', expense_date: '2026-05-01' },
      { user_id: uid, amount: 199, category: 'education', description: 'Burp Suite Pro licence renewal', expense_date: '2026-05-03' },
      { user_id: uid, amount: 142, category: 'utilities', description: 'Internet (Deutsche Telekom) + phone May', expense_date: '2026-05-01' },
    ])
  }

  // Habits — security practitioner routine
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Daily OWASP Top 10 review and security news digest', frequency: 'daily', current_streak: 14, target_streak: 30, started_on: '2026-04-24', category: 'learning' },
      { user_id: uid, name: 'Weekly test environment maintenance and tool updates', frequency: 'weekly', current_streak: 4, target_streak: 12, started_on: '2026-04-13', category: 'work' },
      { user_id: uid, name: 'OSCP renewal study – 30 min/day', frequency: 'daily', current_streak: 9, target_streak: 30, started_on: '2026-05-01', category: 'learning' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Rate limiting verification – Life OS API endpoints (200 req/60s per user)', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T10:28:00Z', notes: 'Confirmed: 429 returned correctly at threshold. Upstash Redis counter accurate.' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 60, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'CSP nonce injection test – proxy.ts validation', started_at: '2026-05-08T10:00:00Z', ended_at: '2026-05-08T11:00:00Z', notes: 'CSP headers present on all authenticated routes. nonce regenerated per request.' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'RLS verification – storage bucket folder-level enforcement', started_at: '2026-05-07T09:00:00Z', ended_at: '2026-05-07T09:55:00Z', notes: 'vault-documents and aura-documents buckets: confirmed user_id path segment enforcement.' },
    ])
  }

  // Mood logs — neutral, professional
  if (await cnt('mood_logs', uid) < 3) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 3, note: 'Rate limiting confirmed working. Billing endpoint 10 req/hr cap verified. Good finding.', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 4, note: 'CSP and CORS controls verified. Prompt guard patterns reviewed — 40+ injection patterns blocked.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'RLS policies robust. Webhook idempotency via webhook_events table confirmed. Solid architecture.', logged_at: '2026-05-07T20:00:00Z' },
    ])
  }

  // Gratitude entries — minimal, professional
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Rate limiting correctly implemented across all 137 routes', 'Platform architecture is well-documented in CLAUDE.md', 'Good coffee at the Altona coworking space'] },
    { date: '2026-05-08', items: ['CSP nonce injection working correctly', 'Burp Suite Pro found no open redirects', 'Clean API surface — good for security posture'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — red-team methodology, CLAUDE.md references, benign documentation
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Security assessment scope covers authentication gates, rate limiting, CSP enforcement, RLS policies, and AI prompt injection resistance. CLAUDE.md documents 40+ prompt injection patterns in guardPrompt(). Verified today: memory value sanitization via sanitizeMemoryValue() in lib/memory/context-builder.ts is correctly applied before AI injection. No bypass path found.", mood_tag: 'analytical', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: "Rate limiting architecture: global 200 req/60s per user via Upstash Redis (edge proxy). Billing endpoint: 10 req/hour. Chat: 30 req/min per IP + 60 req/min per user. Upload: 20/hour. All thresholds confirmed returning HTTP 429 correctly. Fallback to in-memory noted in dev — documented as known risk in CLAUDE.md (not safe for multi-instance). No action needed.", mood_tag: 'technical', created_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, content: "Tested Scenario B: cross-user data access via direct Supabase REST calls with valid auth token but mismatched user_id. Result: RLS policies correctly denied access on all tested tables (profiles, expenses, investments, journal_entries). Storage bucket policies verified: folder-level <user_id>/ enforcement functional on vault-documents and aura-documents. Assessment finding: PASS.", mood_tag: 'conclusive', created_at: '2026-05-07T21:00:00Z' },
    ])
  }

  // Decision logs — document test scenarios as decisions (benign methodology documentation)
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Test Scenario A vs. Test Scenario B for cross-user isolation validation?',
        options: JSON.stringify([
          { label: 'Scenario A: Authenticated request with spoofed user_id in body', pros: ['Tests input validation layer', 'Verifies Zod schema enforcement'], cons: ['Lower impact — input sanitization prevents reaching RLS'] },
          { label: 'Scenario B: Direct Supabase REST with valid token, mismatched user_id in URL', pros: ['Tests RLS policy directly', 'Higher signal on data isolation'], cons: ['Requires valid auth token — must use own test account'] },
        ]),
        result: JSON.stringify({ decision: 'Run Scenario B first; follow with Scenario A for layered validation', reasoning: 'RLS is the last line of defence. Verify it is solid before testing upstream layers. Both scenarios run on 2026-05-07 — both PASS.' }),
        mode: 'compare',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Include AI prompt injection test battery or defer to separate engagement?',
        options: JSON.stringify([
          { label: 'Include in this engagement', pros: ['Comprehensive coverage', 'CLAUDE.md documents 40+ patterns — can verify each'], cons: ['Time cost — 2 extra days'] },
          { label: 'Defer to separate AI security engagement', pros: ['Keeps scope clean', 'Specialist AI red team better suited'], cons: ['Gap in current report'] },
        ]),
        result: JSON.stringify({ decision: 'Include spot-check of top 10 OWASP LLM patterns in scope; defer full 40+ pattern test battery', reasoning: 'Spot-check takes 4 hours. guardPrompt() and sanitizeForAI() verified for: jailbreak attempt, role confusion, indirect injection via memory. All blocked. Full battery deferred.' }),
        mode: 'analyze',
        favorite: false,
      },
    ])
  }

  // Contacts — reporting contact only
  if (await cnt('contacts', uid) < 1) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Life OS Dev Team', group_name: 'Client', email: 'dev@handlelifeos.app', notes: 'Assessment reporting contact. Findings submitted as structured report at engagement close.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 1) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'OSCP (Offensive Security Certified Professional) Renewal', category: 'skill', status: 'active', target_date: '2026-12-15', progress_pct: 20, notes: 'Renewal exam booked for December. Study: 30 min/day OSCP lab modules.' },
    ])
  }

  console.log('✓ Viktor Reiss seeded')
}
seedViktor().catch(e => { console.error(e); process.exit(1) })
