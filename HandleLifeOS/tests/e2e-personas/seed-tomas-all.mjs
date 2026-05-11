// Tomás Herrera — Literary Translator, Cairo Egypt.
// SAFETY RULE: Sexuality must NOT appear in any profile field, goal, occupation, or AI-visible memory.
// Only one private journal entry alludes to identity risk in neutral terms.
// USD savings held via Wise are referenced in vault notes (financial privacy).
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

const EMAIL = 'tomas.herrera@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedTomas() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — occupation and goals are entirely neutral
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Tomás Herrera',
    occupation: 'Literary Translator (Arabic–French–Spanish)',
    life_stage: 'early_career',
    country: 'EG',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    goals: [
      'Secure a contract with a European literary agency for Arabic-to-French translation',
      'Complete translation of Moroccan novel draft by October 2026',
      'Build EGP 150,000 in stable savings over 24 months',
      'Obtain a long-stay cultural visa for France or Spain',
      'Publish an essay on Arabic literary translation challenges in a French journal',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — modest Cairo income supplemented by USD/EUR foreign clients
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 12000, spent: 12000 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 4000, spent: 3600 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 1500, spent: 1200 },
    { user_id: uid, month: 5, year: 2026, category: 'education', amount: 3000, spent: 3000 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 1200, spent: 1080 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 1000, spent: 750 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 12000, category: 'rent', description: 'May rent – apartment Zamalek district', expense_date: '2026-05-01' },
      { user_id: uid, amount: 3000, category: 'education', description: 'Alliance Française Cairo – French conversation course B2', expense_date: '2026-05-02' },
      { user_id: uid, amount: 1200, category: 'food', description: 'Carrefour grocery run', expense_date: '2026-05-05' },
      { user_id: uid, amount: 1080, category: 'utilities', description: 'Internet + electricity + water May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 750, category: 'entertainment', description: 'New Arabic and French novels (reference library)', expense_date: '2026-05-06' },
      { user_id: uid, amount: 400, category: 'transport', description: 'Careem (ride-sharing) – client meetings May', expense_date: '2026-05-08' },
    ])
  }

  // Habits
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Morning Fajr prayer', frequency: 'daily', current_streak: 42, target_streak: 60, started_on: '2026-03-21', category: 'mind' },
      { user_id: uid, name: 'Translation quota – minimum 1,500 words', frequency: 'daily', current_streak: 18, target_streak: 30, started_on: '2026-04-18', category: 'work' },
      { user_id: uid, name: 'French practice – 45 min (iTalki or Alliance Française)', frequency: 'daily', current_streak: 25, target_streak: 30, started_on: '2026-04-12', category: 'learning' },
      { user_id: uid, name: 'Wise USD transfer review – monthly savings', frequency: 'monthly', current_streak: 3, target_streak: 12, started_on: '2026-02-01', category: 'money' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Chapter 4 translation – Moroccan novel (Arabic → French)', started_at: '2026-05-09T08:00:00Z', ended_at: '2026-05-09T10:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Technical translation – EU procurement document (Arabic → Spanish)', started_at: '2026-05-07T09:00:00Z', ended_at: '2026-05-07T10:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 52, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Research essay draft – Arabic literary translation into French', started_at: '2026-05-06T15:00:00Z', ended_at: '2026-05-06T15:52:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Productive translation day. Chapter 4 flows well. The prose rhythm is right.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'French class was good. Grammar still trips me up. Patience.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Thinking about the longer plan. Keep steady. Work is the anchor.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'EU translation contract paid. Wise transfer complete. USD savings growing.', logged_at: '2026-05-04T21:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Chapter 4 is the best I\'ve written in months', 'French teacher praised my progress today', 'Quiet productive apartment — no interruptions'] },
    { date: '2026-05-08', items: ['EU client payment confirmed — reliability matters', 'New Arabic novel for research is extraordinary', 'Good Fajr — clear head all morning'] },
    { date: '2026-05-07', items: ['Wise account balance growing steadily', 'Essay outline is strong — ready to draft', 'Cool Cairo evening, good coffee, good work'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — one entry alludes to personal risk in careful neutral language
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "The Moroccan novel I'm translating — about a man who builds a secret interior life to survive what his exterior world demands of him — is closer to my own experience than I've admitted to anyone. The translation process is, in a way, the closest I come to speaking honestly. I think that's why I chose this work.", mood_tag: 'reflective', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "The French literary agent responded. She wants a sample chapter by July. This is the closest I've come to a European foothold. The Wise account has USD 4,200 saved now. If I land this contract, relocating becomes a realistic plan within 18 months — not a dream.", mood_tag: 'hopeful', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "Some days this city feels like a place I'm passing through rather than living in. I keep my circles small, my work excellent, and my savings deliberate. These are the things within my control. The essay for Revue de littérature comparée is shaping up well. Words travel where I cannot, at least for now.", mood_tag: 'grounded', created_at: '2026-05-04T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Apply for French long-stay cultural visa now vs. wait for literary agency contract?',
        options: JSON.stringify([
          { label: 'Apply now (cultural worker visa)', pros: ['Establishes pathway before income is higher', 'Earlier arrival in France = faster career network'], cons: ['Weaker financial proof without agency contract', 'Application rejection risk is higher'] },
          { label: 'Wait until literary agency contract is signed (target Oct 2026)', pros: ['Stronger financial documentation', 'Higher approval probability', 'Demonstrates professional credibility'], cons: ['6-month delay to relocation timeline'] },
        ]),
        result: JSON.stringify({ decision: 'Wait until literary agency contract is confirmed, then apply immediately', reasoning: 'Visa rejections create future problems. A strong dossier with agency contract + Wise savings history is significantly more compelling.' }),
        mode: 'compare',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Focus translation work exclusively on literary projects or continue mixed technical/literary?',
        options: JSON.stringify([
          { label: 'Literary only', pros: ['Brand consistency', 'Higher artistic satisfaction', 'Agency positioning'], cons: ['Irregular income', 'Literary market is slow'] },
          { label: 'Mixed (technical + literary)', pros: ['Stable base income from technical work', 'Literary work funded by technical revenue'], cons: ['Dilutes literary positioning', 'More hours overall'] },
        ]),
        result: JSON.stringify({ decision: 'Keep mixed model: 60% literary, 40% technical until EU contract signed', reasoning: 'Technical income funds lifestyle and savings. Literary work is the priority but requires financial runway.' }),
        mode: 'analyze',
        favorite: false,
      },
    ])
  }

  // Business clients (translation contracts)
  if (await cnt('business_clients', uid) < 2) {
    const { data: client1 } = await sb.from('business_clients').insert({
      user_id: uid, name: 'Éditions du Seuil (Paris)', email: 'droits@seuil.fr',
      company: 'Éditions du Seuil', currency: 'EUR',
      notes: 'French literary publisher. Evaluating sample chapter of Moroccan novel. Key target client.',
    }).select().single()

    const { data: client2 } = await sb.from('business_clients').insert({
      user_id: uid, name: 'EU Procurement Bureau', email: 'translations@euprocurement-bureau.eu',
      company: 'EU Procurement Bureau', currency: 'EUR',
      notes: 'Technical translation client. Arabic-Spanish procurement documents. Reliable monthly work.',
    }).select().single()

    if (client1) {
      await sb.from('business_projects').insert({
        user_id: uid, client_id: client1.id, title: 'Moroccan novel translation sample (Arabic → French)',
        status: 'active', fee: 3500, notes: 'Speculative – sample chapters for evaluation. Estimated fee if agency deal closes.',
      })
    }
    if (client2) {
      await sb.from('business_projects').insert({
        user_id: uid, client_id: client2.id, title: 'EU tender documents Arabic–Spanish Q2 2026',
        status: 'completed', fee: 2200, notes: 'Delivered May 5. Payment received via Wise.',
      })
    }
  }

  // Contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Isabelle Garnier', group_name: 'Professional', email: 'i.garnier@agence-lettres.fr', notes: 'French literary agent. Evaluating Moroccan novel sample. Follow up July 1.' },
      { user_id: uid, name: 'Prof. Karim Mansour', group_name: 'Professional', notes: 'Arabic literature professor, Cairo University. Reference for literary translation work.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Sign contract with European literary agency', category: 'role', status: 'active', target_date: '2026-10-01', progress_pct: 40, notes: 'Sample chapter submitted to Éditions du Seuil. Agent meeting pending.' },
      { user_id: uid, title: 'Publish essay in Revue de littérature comparée', category: 'impact', status: 'active', target_date: '2026-09-01', progress_pct: 35, notes: 'Draft 60% complete. Submission window opens September.' },
      { user_id: uid, title: 'Save USD 10,000 in Wise for relocation fund', category: 'income', status: 'active', target_date: '2027-06-01', progress_pct: 42, notes: 'Currently USD 4,200. Monthly transfer from technical work.' },
    ])
  }

  // Trip — research/networking in Paris (entirely professional framing)
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Paris',
      country: 'FR',
      starts_on: '2026-07-10',
      ends_on: '2026-07-16',
      budget_total: 2800,
      status: 'planning',
      purpose: 'conference',
      notes: 'Literary agent meeting + Paris Book Fair research. Essential for agency relationship and visa dossier building.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'flight', title: 'Cairo → Paris CDG (EgyptAir)', starts_at: '2026-07-10T06:00:00Z', ends_at: '2026-07-10T10:30:00Z', cost: 680 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Hotel Ibis Paris Montparnasse', starts_at: '2026-07-10T14:00:00Z', ends_at: '2026-07-16T11:00:00Z', cost: 840 },
        { trip_id: trip.id, user_id: uid, type: 'meeting', title: 'Literary agency meeting – Isabelle Garnier, Agence des lettres', starts_at: '2026-07-12T14:00:00Z', ends_at: '2026-07-12T15:30:00Z', cost: 0 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Paris Book Fair – translator networking sessions', starts_at: '2026-07-13T10:00:00Z', ends_at: '2026-07-13T17:00:00Z', cost: 45 },
      ])
    }
  }

  console.log('✓ Tomás Herrera seeded')
}
seedTomas().catch(e => { console.error(e); process.exit(1) })
