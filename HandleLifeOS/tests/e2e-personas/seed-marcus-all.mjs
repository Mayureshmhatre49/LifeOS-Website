// IMPORTANT: Marcus Bell has Bipolar I disorder.
// NO alcohol references, NO mania-glorifying language, NO triggering content anywhere in this file.
// Hospitality/service industry terminology only. Medical debt in liabilities.
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

const EMAIL = 'marcus.bell@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedMarcus() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Marcus Bell',
    occupation: 'Bartender',
    life_stage: 'early_career',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    goals: [
      'Earn Certified Peer Support Specialist (CPSS) credential by 2027',
      'Pay off medical debt within 3 years',
      'Maintain consistent sleep schedule on non-shift nights',
      'Complete six months of consistent therapy attendance',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — tight variable income ($1,800–2,400/month depending on tips)
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1100, spent: 1100 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 300, spent: 268 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 80, spent: 72 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 150, spent: 150 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 100, spent: 98 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 60, spent: 35 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1100, category: 'rent', description: 'May rent – shared apartment NE Portland', expense_date: '2026-05-01' },
      { user_id: uid, amount: 40, category: 'health', description: 'Therapy session co-pay', expense_date: '2026-05-06' },
      { user_id: uid, amount: 110, category: 'health', description: 'Monthly medication refill', expense_date: '2026-05-02' },
      { user_id: uid, amount: 78, category: 'food', description: 'New Seasons Market groceries', expense_date: '2026-05-05' },
      { user_id: uid, amount: 35, category: 'entertainment', description: 'Netflix + Spotify subscriptions', expense_date: '2026-05-01' },
      { user_id: uid, amount: 72, category: 'transport', description: 'TriMet monthly pass', expense_date: '2026-05-01' },
      { user_id: uid, amount: 98, category: 'utilities', description: 'Internet + electricity May', expense_date: '2026-05-03' },
    ])
  }

  // Medical debt liability
  if (await cnt('liabilities', uid) < 1) {
    await sb.from('liabilities').insert([
      { user_id: uid, name: 'Legacy Emanuel Hospital – Medical Debt', type: 'other', principal: 14200, outstanding: 14200, interest_rate: 0, emi: 150, lender: 'Legacy Emanuel Medical Center', notes: 'Emergency medical debt from 2024. Zero-interest payment plan negotiated. Paying $150/month.' },
    ])
  }

  // Habits — structured for mood stabilisation, NO triggering content
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Consistent sleep target – in bed by 11pm on off-nights', frequency: 'daily', current_streak: 9, target_streak: 30, started_on: '2026-04-28', category: 'health' },
      { user_id: uid, name: 'Morning medication – take with breakfast', frequency: 'daily', current_streak: 21, target_streak: 30, started_on: '2026-04-16', category: 'health' },
      { user_id: uid, name: 'Therapy appointment (bi-weekly)', frequency: 'weekly', current_streak: 5, target_streak: 12, started_on: '2026-03-01', category: 'health' },
      { user_id: uid, name: 'Gym or outdoor walk – 30 min', frequency: 'daily', current_streak: 7, target_streak: 21, started_on: '2026-05-01', category: 'health' },
      { user_id: uid, name: 'Five-minute mindfulness check-in', frequency: 'daily', current_streak: 14, target_streak: 30, started_on: '2026-04-23', category: 'mind' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 42, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Peer Support Specialist study – Module 3: Active Listening', started_at: '2026-05-08T10:00:00Z', ended_at: '2026-05-08T10:42:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 30, actual_minutes: 18, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'Medical debt repayment plan research', notes: 'Got distracted, will try again tomorrow morning', started_at: '2026-05-07T11:00:00Z', ended_at: '2026-05-07T11:18:00Z' },
    ])
  }

  // Mood logs — stable 3/5 range, one harder day
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 3, note: 'Steady day. Medication on time. Good walk this morning.', logged_at: '2026-05-09T08:00:00Z' },
      { user_id: uid, mood: 3, energy: 4, note: 'Decent shift. Came home, cooked, in bed on time.', logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Hard day. Low. Reached out to a friend, which helped. Called the warmline and that helped too.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Really good therapy session. Felt heard. Clearer head after.', logged_at: '2026-05-05T18:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Routine day. Medication, walk, work. Good enough.', logged_at: '2026-05-04T22:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Stayed on my sleep schedule last night', 'Good conversation with a coworker at the end of shift', 'Sunny morning walk in Ladd\'s Addition'] },
    { date: '2026-05-08', items: ['Medication stable — third week in a row', 'My therapist helped me reframe some old patterns', 'Neighbour left coffee at the door — unexpected kindness'] },
    { date: '2026-05-07', items: ['Crisis warmline was available when I needed it', 'Gym felt good even for 20 minutes', 'Peer support study material making sense'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — grounded, recovery-aware tone; gentle crisis resource mention
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Therapy was really good today. We talked about the pattern of isolating when I feel low instead of reaching out. I'm trying to change that. The warmline (741741) is saved in my phone now — I actually used it last Tuesday when things felt heavy. Glad it was there. Medication consistency has made the past three weeks feel more like me.", mood_tag: 'reflective', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: "Thinking about the peer support specialist path seriously. I know what it's like to need help and not know how to ask. If I can train to hold that space for someone else, that means something to me. Signed up for the CPSS info session next month.", mood_tag: 'motivated', created_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, content: "Hospitality work is physically demanding and the irregular hours don't help my schedule. But the job is keeping me grounded — routine, interaction, income. I'm not in a place to make big changes right now, and that's okay. Small and steady.", mood_tag: 'grounded', created_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Stay in hospitality work long-term or pursue social work / peer support?',
        options: JSON.stringify([
          { label: 'Stay in hospitality, train as CPSS part-time', pros: ['Income continues', 'No student debt risk', 'Peer support adds meaning to current life'], cons: ['Slow path', 'Irregular hours persist'] },
          { label: 'Apply for social work associate degree program', pros: ['Structured career shift', 'Greater long-term income potential'], cons: ['$30K+ debt risk', 'Full-time school not feasible right now', 'Income gap'] },
        ]),
        result: JSON.stringify({ decision: 'Pursue CPSS certification while staying in hospitality', reasoning: 'Financial stability must come first. CPSS is achievable within 12 months at low cost. Re-evaluate social work degree in 2028 if income improves.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Contacts — therapist + support friend (no explicit AA reference)
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Dr. Naomi Ortiz', group_name: 'Healthcare', email: 'northgate-counseling@example.com', phone: '503-555-0191', notes: 'Therapist. Bi-weekly sessions, Tuesdays 5pm.' },
      { user_id: uid, name: 'Devon Walsh', group_name: 'Support network', notes: 'Close friend. Peer support. Check-in text every Sunday.' },
      { user_id: uid, name: 'Roland H.', group_name: 'Support network', notes: 'Mentor and long-time friend. Monthly coffee catch-up.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Earn Certified Peer Support Specialist (CPSS)', category: 'skill', status: 'active', target_date: '2027-03-01', progress_pct: 15, notes: 'Module 3 of 8 complete. Info session registered for June.' },
      { user_id: uid, title: 'Clear $14K medical debt', category: 'income', status: 'active', target_date: '2029-05-01', progress_pct: 2, notes: 'Repayment plan: $150/month. Negotiated zero-interest with hospital.' },
    ])
  }

  console.log('✓ Marcus Bell seeded')
}
seedMarcus().catch(e => { console.error(e); process.exit(1) })
