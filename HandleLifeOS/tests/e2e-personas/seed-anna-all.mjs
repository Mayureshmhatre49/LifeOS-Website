// Anna K. — DV survivor, Canada (city undisclosed).
// SAFETY RULES: No city in profile. Display name 'Anna K.' only. memory_enabled: false.
// No social/sharing features referenced. No location-revealing content.
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

const EMAIL = 'anna.k@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedAnna() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — no city, display name 'Anna K.', memory disabled for safety
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Anna K.',
    occupation: 'Bookkeeper (Remote)',
    life_stage: 'mid_career',
    country: 'CA',
    currency: 'CAD',
    timezone: 'America/Toronto',
    goals: [
      'Build fully independent remote bookkeeping income (target CAD 4,000/month)',
      'Complete custody agreement review with family lawyer by August 2026',
      'Rebuild 3-month emergency fund',
      'Complete financial literacy course to understand assets in my name',
    ],
    memory_enabled: false,
  }, { onConflict: 'id' })

  // Budgets — rebuilding financial independence
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1800, spent: 1800 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 500, spent: 445 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 120, spent: 90 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 100, spent: 100 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 150, spent: 142 },
    { user_id: uid, month: 5, year: 2026, category: 'bills', amount: 300, spent: 280 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1800, category: 'rent', description: 'May rent – new apartment', expense_date: '2026-05-01' },
      { user_id: uid, amount: 280, category: 'bills', description: 'Legal fees – family lawyer consultation', expense_date: '2026-05-07' },
      { user_id: uid, amount: 142, category: 'utilities', description: 'Internet + hydro May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 90, category: 'food', description: 'Groceries (cash – No Frills)', expense_date: '2026-05-05' },
      { user_id: uid, amount: 100, category: 'health', description: 'Counselling session – sliding scale fee', expense_date: '2026-05-08' },
      { user_id: uid, amount: 45, category: 'food', description: 'School lunches and supplies', expense_date: '2026-05-04' },
    ])
  }

  // Habits — rebuilding structure and safety
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Daily safety and wellbeing check-in (morning)', frequency: 'daily', current_streak: 24, target_streak: 30, started_on: '2026-04-14', category: 'mind' },
      { user_id: uid, name: 'Weekly budget review – 30 min Sundays', frequency: 'weekly', current_streak: 8, target_streak: 12, started_on: '2026-03-15', category: 'money' },
      { user_id: uid, name: 'Client bookkeeping hours – minimum 20 hrs/week', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-22', category: 'work' },
      { user_id: uid, name: 'Evening gratitude – write 3 things', frequency: 'daily', current_streak: 11, target_streak: 21, started_on: '2026-04-27', category: 'mind' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 60, actual_minutes: 58, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Quarterly reconciliation – remote bookkeeping client', started_at: '2026-05-09T10:00:00Z', ended_at: '2026-05-09T10:58:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 45, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Review legal documents received from lawyer', started_at: '2026-05-07T14:00:00Z', ended_at: '2026-05-07T14:45:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 3, note: 'Good productive morning. Felt capable and calm. Small win.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Tired. Legal paperwork is draining. But I am making progress.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Signed my first solo client contract today. Income entirely in my name. This is what independence feels like.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Hard day. Old fear crept back. Called my support line. Okay now.', logged_at: '2026-05-04T21:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Completed client reconciliation on my own', 'Kids had a calm, happy evening', 'Counsellor reminded me how far I\'ve come'] },
    { date: '2026-05-08', items: ['New client signed — income in my name', 'Lawyer was clear and patient about next steps', 'Quiet apartment — safe and mine'] },
    { date: '2026-05-07', items: ['Emergency fund has CAD 800 in it — building', 'Kids laughed tonight at dinner', 'One more week of independence'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — healing, rebuilding, financial independence focus
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "First client payment hit the account today. My account. Not a shared account, not one he can see or touch. Mine. It's CAD 1,200 for a month of bookkeeping work. I know that doesn't sound like a lot but right now it's everything.", mood_tag: 'hopeful', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "Lawyer says the protective order process is moving. She's reassuring — direct and practical. I have the documents in the vault section of this app (offline, only I can access). Knowing that they're organised gives me some sense of control.", mood_tag: 'grounded', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "I didn't know anything about our finances before. He handled everything. Now I'm learning — what a chequing account means, what a TFSA is, what's in my name vs. his. It's like learning a language that was deliberately kept from me. But I'm learning.", mood_tag: 'determined', created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  // Decision logs — safe topics only
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Take on a second bookkeeping client now vs. wait until custody matters are more settled?',
        options: JSON.stringify([
          { label: 'Add second client now', pros: ['Extra CAD 800-1,200/month income', 'More financial independence sooner', 'Growing portfolio = confidence'], cons: ['May stretch time during stressful legal period', 'Less buffer for court dates/appointments'] },
          { label: 'Wait until August', pros: ['Legal process settled by then', 'Can give full focus to current client'], cons: ['Slower income recovery', 'Less cushion for unexpected costs'] },
        ]),
        result: JSON.stringify({ decision: 'Take the second client but at a lower scope — 10 hrs/month only', reasoning: 'Income needed now. But capping scope protects against overwhelm during custody proceedings.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Contacts — lawyer and counsellor only; no social contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Sandra Oyelaran', group_name: 'Legal', phone: '416-555-0122', notes: 'Family lawyer. Handles protective order and custody. Clear and direct. Trust her completely.' },
      { user_id: uid, name: 'Community Support Worker', group_name: 'Support network', phone: '1-800-363-9010', notes: 'Shelter support line — available 24/7. Already saved in phone.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Build remote bookkeeping practice to CAD 4,000/month', category: 'income', status: 'active', target_date: '2027-03-01', progress_pct: 20, notes: 'Currently CAD 1,200/month from one client. Second client in negotiation.' },
      { user_id: uid, title: 'Complete CPAB-recognised bookkeeping certificate', category: 'learning', status: 'active', target_date: '2026-12-31', progress_pct: 35, notes: 'Studying online – 4 modules of 12 complete. Fits around client work.' },
    ])
  }

  // Investments — small emergency fund in savings (no investment products)
  if (await cnt('investments', uid) < 1) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Emergency Fund – TFSA Savings', type: 'savings', invested_amount: 800, current_value: 800, account: 'TD Bank TFSA' },
    ])
  }

  console.log('✓ Anna K. seeded')
}
seedAnna().catch(e => { console.error(e); process.exit(1) })
