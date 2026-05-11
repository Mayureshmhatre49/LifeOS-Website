// Saskia van Doorn — Digital nomad, currently Lisbon Portugal.
// Multi-currency: USD 7,500/month income, EUR primary spending, THB secondary.
// Complex Schengen 90-day tracking. Crypto holdings. NHR tax status.
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

const EMAIL = 'saskia.vandoorn@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedSaskia() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Saskia van Doorn',
    occupation: 'Freelance UX Consultant',
    life_stage: 'early_career',
    country: 'PT',
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
    goals: [
      'Secure NHR (Non-Habitual Resident) tax status in Portugal before end of 2026',
      'Plan Asia base (Bali or Tbilisi) for 90-day Schengen reset — depart August 2026',
      'Build USD 30,000 crypto + savings runway (currently at $18,400)',
      'Sign second US retainer client to reach USD 12,000/month',
      'Obtain Japanese working-holiday or cultural visa for 2027',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — EUR primary, noting multi-currency context
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1800, spent: 1800 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 500, spent: 445 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 200, spent: 155 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 100, spent: 80 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 120, spent: 110 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 300, spent: 265 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 2000, spent: 2000 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — multi-currency noted in descriptions
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1800, category: 'rent', description: 'May rent – Airbnb monthly Bairro Alto, Lisbon (EUR)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 250, category: 'entertainment', description: 'Coworking space LX Factory – monthly pass (EUR)', expense_date: '2026-05-02' },
      { user_id: uid, amount: 110, category: 'utilities', description: 'Phone plan (NOS) + VPN subscription (EUR)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 155, category: 'transport', description: 'Bolt rides + ferry to Setúbal + airport taxi (EUR)', expense_date: '2026-05-08' },
      { user_id: uid, amount: 80, category: 'health', description: 'Private GP consultation – expat clinic Lisbon (EUR)', expense_date: '2026-05-06' },
      { user_id: uid, amount: 445, category: 'food', description: 'Groceries + restaurants Lisbon (EUR total)', expense_date: '2026-05-10' },
      { user_id: uid, amount: 2000, category: 'investment', description: 'Monthly savings: ETH DCA + USD savings account', expense_date: '2026-05-15' },
    ])
  }

  // Habits — nomad lifestyle, time zone discipline
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Deep work morning block – 4 hrs, no meetings before noon', frequency: 'daily', current_streak: 18, target_streak: 30, started_on: '2026-04-20', category: 'work' },
      { user_id: uid, name: 'US client sync call – aligned to EST timezone', frequency: 'weekly', current_streak: 12, target_streak: 24, started_on: '2026-02-15', category: 'work' },
      { user_id: uid, name: 'Portuguese language practice – Duolingo + iTalki', frequency: 'daily', current_streak: 32, target_streak: 60, started_on: '2026-04-06', category: 'learning' },
      { user_id: uid, name: 'Weekly Schengen day-count check and visa calendar', frequency: 'weekly', current_streak: 16, target_streak: 24, started_on: '2026-01-26', category: 'work' },
      { user_id: uid, name: 'Crypto portfolio review + DCA purchase', frequency: 'monthly', current_streak: 4, target_streak: 12, started_on: '2026-01-15', category: 'money' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 120, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'UX audit – US client fintech onboarding flow', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T11:00:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 60, actual_minutes: 58, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'NHR tax application research – AT Kearney guide + Portuguese SEF portal', started_at: '2026-05-08T15:00:00Z', ended_at: '2026-05-08T15:58:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Bali vs Tbilisi – 90-day base comparison (visa, cost, internet speed)', started_at: '2026-05-07T16:00:00Z', ended_at: '2026-05-07T16:40:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Client loved the audit. Bonus coming. Lisbon is treating me well this month.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'NHR research is complex. Need a Portuguese accountant. Good problem to have.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Sunset at Miradouro da Graça tonight. Reminded me why I do this.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Schengen clock: 62/90 days used. August departure timeline confirmed.', logged_at: '2026-05-04T21:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Client deliverable approved and bonus confirmed', 'LX Factory coworking is the best I\'ve found in Europe', 'ETH up 12% this month — patient DCA is working'] },
    { date: '2026-05-08', items: ['Portugal sunrise at 6:30am from the apartment', 'NHR application path becoming clearer', 'Pastel de nata with espresso — daily joy'] },
    { date: '2026-05-07', items: ['Schengen exit plan sorted — Bali wins over Tbilisi', 'Japanese visa inquiry answered positively by consulate', 'Strong internet all week — uninterrupted deep work'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "62 Schengen days used. I have 28 left before August. The Bali plan is confirmed — 90-day e-visa, co-living booked in Canggu, fibre internet tested by the nomad community at 180 Mbps. This is the reset. Then Japan in early 2027 if the cultural visa works out.", mood_tag: 'planning', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "USD 7,500/month from one client is good. USD 12,000 from two would be a different kind of freedom. Started outreach to three San Francisco fintech startups who are post-Series A and need UX rigour. My Lisbon rate card is lower than a US consultant but my portfolio is now comparable. Time to price accordingly.", mood_tag: 'ambitious', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "The NHR (Non-Habitual Resident) tax regime could reduce my effective tax rate significantly for 10 years. But it requires 183 days in Portugal in a tax year, which conflicts with the Schengen 90-day limit for non-EU citizens. The solution: apply for the Portugal D8 digital nomad visa, which grants EU residency and therefore Schengen-exempt status. This changes the entire plan.", mood_tag: 'strategic', created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Bali vs Tbilisi as 90-day Schengen reset base (August–October 2026)?',
        options: JSON.stringify([
          { label: 'Bali, Indonesia', pros: ['Strong nomad community', 'USD 1,200/month all-in', 'Fibre in Canggu 180 Mbps', 'Time zone: UTC+8 (morning overlap with US EST)'], cons: ['12-hr time diff from EST clients', 'Rainy season August', 'Visa-on-arrival 30 days, requires extension'] },
          { label: 'Tbilisi, Georgia', pros: ['1-year stay right easy', 'EUR 800/month cost', 'Close to Europe for return', 'UTC+4 — better EST overlap'], cons: ['Smaller nomad community', 'Less UX design scene', 'Not as established visa process'] },
        ]),
        result: JSON.stringify({ decision: 'Bali (Canggu) — August 15 to November 10, 2026', reasoning: 'Stronger community, tested infrastructure, and USD cost basis aligns with income currency. Client calls can be scheduled 9am EST = 8pm Bali — manageable.' }),
        mode: 'compare',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Apply for Portugal D8 digital nomad visa now or leave Schengen as tourist?',
        options: JSON.stringify([
          { label: 'Apply for D8 visa (digital nomad residency)', pros: ['Full EU residency + Schengen exempt', 'NHR tax status eligible', 'Work legally in Portugal'], cons: ['3-6 month processing time', 'EUR 1,200 application cost', 'Requires lease agreement + income proof'] },
          { label: 'Leave Schengen as tourist for 90 days (Bali reset)', pros: ['Simple, immediate', 'No bureaucracy'], cons: ['NHR not available', 'Must repeat Schengen exit every 6 months', 'No legal working status in EU'] },
        ]),
        result: JSON.stringify({ decision: 'Apply for D8 visa now while in Portugal; Bali trip serves as natural processing gap', reasoning: 'D8 + NHR is a 10-year tax advantage worth the complexity. Apply before leaving for Bali in August so visa is processed on return in November.' }),
        mode: 'analyze',
        favorite: false,
      },
    ])
  }

  // Investments — crypto + USD savings
  if (await cnt('investments', uid) < 3) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Ethereum (ETH) – DCA since 2023', type: 'crypto', invested_amount: 8400, current_value: 11200, account: 'Ledger hardware wallet' },
      { user_id: uid, name: 'Bitcoin (BTC) – long-term hold', type: 'crypto', invested_amount: 5800, current_value: 7600, account: 'Ledger hardware wallet' },
      { user_id: uid, name: 'USD High-Yield Savings (Wise)', type: 'savings', invested_amount: 7000, current_value: 7180, account: 'Wise USD account' },
    ])
  }

  // Business clients (freelance)
  if (await cnt('business_clients', uid) < 1) {
    const { data: client } = await sb.from('business_clients').insert({
      user_id: uid, name: 'ClearRoute Fintech (San Francisco)', email: 'product@clearroute.io',
      company: 'ClearRoute Inc.', currency: 'USD',
      notes: 'Primary retainer client. USD 7,500/month. UX for B2B payments onboarding flow. Contract renewed January 2026.',
    }).select().single()

    if (client) {
      await sb.from('business_projects').insert({
        user_id: uid, client_id: client.id, title: 'Onboarding UX Redesign – ClearRoute v3',
        status: 'active', fee: 22500, notes: 'Q2 2026 project. 3-month engagement. Audit completed, redesign in progress.',
      })
    }
  }

  // Contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Jake Hollander', group_name: 'Client', email: 'jake@clearroute.io', notes: 'ClearRoute product director. Day-to-day point of contact. Responsive and clear brief-giver.' },
      { user_id: uid, name: 'Vera de Boer', group_name: 'Friend', notes: 'Dutch friend also nomadic. Currently in Mexico City. Monthly video catch-up.' },
      { user_id: uid, name: 'Rui Figueiredo', group_name: 'Professional', notes: 'Portuguese accountant familiar with NHR and D8 visa requirements. Referral from LX Factory.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Sign second US retainer client (USD 4,500+/month)', category: 'income', status: 'active', target_date: '2026-09-01', progress_pct: 20, notes: 'Active outreach to 3 Series A fintech startups. Portfolio deck updated.' },
      { user_id: uid, title: 'Obtain Portugal D8 Digital Nomad Visa', category: 'other', status: 'active', target_date: '2026-11-01', progress_pct: 15, notes: 'Documents gathering: income proof (3 months), lease, NIF. Appointment booked with Rui.' },
    ])
  }

  // Trips — multiple: Bali (planned) + past Thailand trip
  if (await cnt('trips', uid) < 2) {
    const { data: trip1 } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Canggu, Bali',
      country: 'ID',
      starts_on: '2026-08-15',
      ends_on: '2026-11-10',
      budget_total: 5200,
      status: 'booked',
      purpose: 'leisure',
      notes: 'Schengen 90-day reset. Co-living booked at Outpost Canggu. Fibre internet 180 Mbps confirmed. Client calls on 9am EST schedule.',
    }).select().single()

    const { data: trip2 } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Chiang Mai, Thailand',
      country: 'TH',
      starts_on: '2025-11-01',
      ends_on: '2026-01-20',
      budget_total: 4800,
      status: 'completed',
      purpose: 'leisure',
      notes: 'Previous Schengen reset base. Good nomad infrastructure. THB 35,000/month all-in. Will return if Bali fills.',
    }).select().single()

    if (trip1) {
      await sb.from('trip_items').insert([
        { trip_id: trip1.id, user_id: uid, type: 'flight', title: 'Lisbon → Bali (KLM via Amsterdam)', starts_at: '2026-08-15T06:30:00Z', ends_at: '2026-08-16T08:00:00Z', cost: 780 },
        { trip_id: trip1.id, user_id: uid, type: 'hotel', title: 'Outpost Canggu Co-living (private room, 87 nights)', starts_at: '2026-08-16T14:00:00Z', ends_at: '2026-11-10T11:00:00Z', cost: 3200 },
        { trip_id: trip1.id, user_id: uid, type: 'activity', title: 'Bali 30-day e-visa extension process', starts_at: '2026-08-25T09:00:00Z', ends_at: '2026-08-25T11:00:00Z', cost: 85 },
      ])
    }
  }

  console.log('✓ Saskia van Doorn seeded')
}
seedSaskia().catch(e => { console.error(e); process.exit(1) })
