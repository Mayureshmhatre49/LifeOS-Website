// Reggie Thompson — Gig-stack worker, Houston TX. 5-platform gig economy.
// Vehicle maintenance tracked as business expenses. Variable income $2,800–4,200/month.
// Mobile-first user. All 5 platforms treated as business clients.
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

const EMAIL = 'reggie.thompson@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedReggie() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Reggie Thompson',
    occupation: 'Independent Contractor (Multi-Platform Gig Worker)',
    life_stage: 'early_career',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Chicago',
    goals: [
      'Maximise Q2 2026 gig earnings to hit $4,200/month target',
      'Pay Q2 estimated taxes (due June 15, 2026) on time',
      'Build $5,000 vehicle replacement/repair fund by year-end',
      'Explore W2 employment options with benefits for 2027',
      'Get health insurance through marketplace by open enrollment',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — variable income, managed tightly
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1200, spent: 1200 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 600, spent: 545 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 350, spent: 310 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 250, spent: 220 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 180, spent: 168 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 400, spent: 400 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — vehicle maintenance as business expense
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1200, category: 'rent', description: 'May rent – shared house, Midtown Houston', expense_date: '2026-05-01' },
      { user_id: uid, amount: 280, category: 'transport', description: 'Gasoline – full tank ×4 weeks (gig platform driving)', expense_date: '2026-05-10' },
      { user_id: uid, amount: 185, category: 'transport', description: 'Oil change + tire rotation – Toyota Camry 2019 (business vehicle)', expense_date: '2026-05-05' },
      { user_id: uid, amount: 80, category: 'transport', description: 'Ride platform insurance supplement (gap coverage)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 220, category: 'health', description: 'Marketplace health insurance premium May', expense_date: '2026-05-01' },
      { user_id: uid, amount: 168, category: 'utilities', description: 'Phone plan (required for gig apps) + internet + electricity', expense_date: '2026-05-03' },
      { user_id: uid, amount: 400, category: 'investment', description: 'Q2 estimated tax set-aside (IRS self-employment, ~25%)', expense_date: '2026-05-15' },
    ])
  }

  // Habits — gig worker schedule optimisation
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Pre-shift vehicle check (fluids, tires, dash cam)', frequency: 'daily', current_streak: 28, target_streak: 30, started_on: '2026-04-10', category: 'work' },
      { user_id: uid, name: 'Weekly mileage log – IRS deduction tracking', frequency: 'weekly', current_streak: 8, target_streak: 12, started_on: '2026-03-15', category: 'money' },
      { user_id: uid, name: 'Platform earnings review – compare rates weekly', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-22', category: 'money' },
      { user_id: uid, name: 'Early morning peak hours – online by 6am', frequency: 'daily', current_streak: 15, target_streak: 30, started_on: '2026-04-22', category: 'work' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 42, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Q2 tax planning – estimated payment calculation (Schedule C)', started_at: '2026-05-09T11:00:00Z', ended_at: '2026-05-09T11:42:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 30, actual_minutes: 30, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Research W2 job openings with benefits – Indeed + LinkedIn', started_at: '2026-05-07T12:00:00Z', ended_at: '2026-05-07T12:30:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 4, note: 'Good earnings day – hit $180 before noon. Surge pricing in Midtown.', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Slow DoorDash morning. Switched to Instacart – better rate.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 2, energy: 3, note: 'Car repair hit hard this month. Will survive but tight. Need that emergency fund.', logged_at: '2026-05-06T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Best week so far – $1,180 gross. If I keep this up, $4,200 target is real.', logged_at: '2026-05-04T20:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Hit $180 before noon — surge was real today', 'Car running smooth after the oil change', 'Submitted mileage log — taxes won\'t surprise me'] },
    { date: '2026-05-08', items: ['Instacart tip was generous today — kind customer', 'Platform flexibility let me skip slow hours', 'Podcast during driving kept the mind sharp'] },
    { date: '2026-05-07', items: ['One week closer to Q2 tax payment — almost there', 'Hydrated and rested before the early shift', 'Found a W2 posting worth applying for — options exist'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Crossed $4,000 gross for the first time this week. I'm doing five platforms — Uber, Lyft, DoorDash, Instacart, Uber Eats — and the key is reading demand. You chase surge on rideshare in the morning, shift to grocery delivery at lunch. The math is always there if you watch it. This week it worked.", mood_tag: 'focused', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: "The thing about gig work that nobody talks about is the mental load of being your own HR, your own accountant, your own vehicle manager. The car is the business. If the Camry goes down, income goes to zero in two hours. I need to take that repair fund more seriously.", mood_tag: 'reflective', created_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, content: "Applied for a fleet driver coordinator role at a logistics company today — W2, $38K, health insurance included. The pay is less, but the stability... I'm at the age where that calculation starts mattering differently. Not ready to quit the gig yet, but keeping options open.", mood_tag: 'planning', created_at: '2026-05-04T21:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Continue multi-platform gig model vs. accept W2 coordinator role ($38K)?',
        options: JSON.stringify([
          { label: 'Stay on multi-platform gig model', pros: ['$3,200-4,200 gross/month potential', 'Flexibility and autonomy', 'Tax deductions (vehicle, phone, etc.)'], cons: ['No benefits – health insurance $220/month out of pocket', 'Zero income when car breaks down', 'Retirement savings difficult', 'Tax complexity – quarterly estimated payments'] },
          { label: 'Accept W2 role ($38K + benefits)', pros: ['Health insurance included', '401(k) with employer match', 'Predictable income and schedule', 'Vehicle wear reduced'], cons: ['$18K-24K less gross income annually', 'Loss of flexibility', 'Fixed hours — less life control'] },
        ]),
        result: JSON.stringify({ decision: 'Stay gig for now; apply to 3 more W2 roles in Q3 and compare total compensation', reasoning: 'Current gig income significantly exceeds W2 offer. But the risk profile is unsustainable long-term without benefits and vehicle fund. Re-evaluate at $10K vehicle fund milestone.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Business clients — the 5 gig platforms
  const platforms = [
    { name: 'Uber Technologies', email: 'support@uber.com', company: 'Uber', notes: 'Rideshare platform. Peak hours 6-9am and 4-7pm weekdays. Surge monitoring essential.' },
    { name: 'Lyft Inc.', email: 'support@lyft.com', company: 'Lyft', notes: 'Rideshare platform. Secondary to Uber. Good for airport runs in off-peak Uber hours.' },
    { name: 'DoorDash', email: 'support@doordash.com', company: 'DoorDash', notes: 'Food delivery. Best 11am-2pm and 5-8pm. Dash Now zones tracked weekly.' },
    { name: 'Instacart', email: 'support@instacart.com', company: 'Instacart', notes: 'Grocery delivery. Higher tips than food delivery. Slower volume but better per-hour rate.' },
    { name: 'Uber Eats', email: 'support@ubereats.com', company: 'Uber Eats', notes: 'Food delivery. Use when DoorDash demand is low. Stacks with Uber driver app easily.' },
  ]
  for (const p of platforms) {
    const { count: pCount } = await sb.from('business_clients').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('company', p.company)
    if (!pCount) await sb.from('business_clients').insert({ user_id: uid, ...p, currency: 'USD' })
  }

  // Contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Dre Thompson', group_name: 'Family', phone: '713-555-0122', notes: 'Cousin. Also a gig worker. Share platform tips and zone intel weekly.' },
      { user_id: uid, name: 'H&R Block – Self-employed tax', group_name: 'Professional', notes: 'Used for annual 1099 filing. Appointment due late March 2027.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Build $5,000 vehicle emergency fund', category: 'income', status: 'active', target_date: '2026-12-31', progress_pct: 18, notes: 'Currently $900 saved. Adding $200-400/month depending on earnings.' },
      { user_id: uid, title: 'Explore W2 employment with benefits', category: 'other', status: 'active', target_date: '2026-09-30', progress_pct: 10, notes: 'Applied to 1 role (fleet coordinator). Target: apply to 3 more Q3 2026.' },
    ])
  }

  // Investments — tax set-aside + small savings
  if (await cnt('investments', uid) < 1) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Marcus Invest – Vehicle & Emergency Fund', type: 'savings', invested_amount: 900, current_value: 900, account: 'Marcus by Goldman Sachs' },
    ])
  }

  console.log('✓ Reggie Thompson seeded')
}
seedReggie().catch(e => { console.error(e); process.exit(1) })
