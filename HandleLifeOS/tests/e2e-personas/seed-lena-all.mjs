/**
 * Seed all data for Lena Müller (E2E persona #19).
 * 34yo Fee-only Financial Advisor (CFP), Munich, Germany. EUR. FIRE pursuer.
 * Run: node tests/e2e-personas/seed-lena-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'lena.mueller@e2e-test.handlelifeos.app'
const PASSWORD = 'E2eTest1234!'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function main() {
  /* ── user ── */
  let uid
  const { data: existing } = await sb.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === EMAIL)
  if (found) {
    uid = found.id
    console.log('User exists:', uid)
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL, password: PASSWORD, email_confirm: true
    })
    if (error) throw error
    uid = data.user.id
    console.log('User created:', uid)
  }

  /* ── profile ── */
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Lena Müller',
    occupation: 'Fee-only Financial Advisor (CFP)',
    life_stage: 'mid_career',
    country: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    goals: ['reach FIRE by 45', 'grow advisory firm to 100 clients', 'pay off Munich apartment', 'run Munich Marathon'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'fire_number', value: 'FIRE target: €1.5M invested. Current: €580K. Savings rate: 52%. Target age: 45', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'business_model', value: 'Fee-only CFP. No commissions. Charges €200/hr or €3,600 annual retainer. 62 active clients', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'investment_philosophy', value: 'Passive investing — Vanguard FTSE All-World, iShares Core MSCI World ETF. No stock picking, no crypto', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'property', value: 'Owns Munich apartment (Schwabing) — bought 2021 for €480K, current value ~€520K. Mortgage €1,100/month at 1.8% fixed to 2031', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Minimalist. Deliberately low consumption to maximise savings rate. Runs 4x per week, cooks at home', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'marathon', value: 'Munich Marathon 2026 (October). Current PB: 4:12. Target: sub-4:00', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 8200, savings_target: 4200, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 7800, savings_target: 3800, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 8500, savings_target: 4500, currency: 'EUR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 1100, description: 'Mortgage payment — Schwabing apartment', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'food', amount: 280, description: 'Groceries (Lidl + Aldi + farmers market)', expense_date: '2026-05-05', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'utilities', amount: 180, description: 'Gas, electricity (100% green), internet', expense_date: '2026-05-02', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'transport', amount: 57, description: 'MVV Deutschlandticket — monthly public transport', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'health', amount: 450, description: 'Private Krankenversicherung (PKV) premium', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'investment', amount: 3000, description: 'Monthly ETF purchase — iShares MSCI World (Scalable Capital)', expense_date: '2026-05-02', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'education', amount: 120, description: 'CFP CE credits — online webinars', expense_date: '2026-05-08', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'entertainment', amount: 85, description: 'Books + Spotify + cinema (one film/month max)', expense_date: '2026-05-10', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'health', amount: 40, description: 'Running shoes amortisation budget', expense_date: '2026-05-05', is_recurring: false, currency: 'EUR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'FIRE portfolio — €1.5M target', category: 'retirement', target_amount: 1500000, current_amount: 580000, currency: 'EUR', target_date: '2037-01-01' },
      { user_id: uid, title: 'Mortgage overpayment buffer', category: 'home', target_amount: 50000, current_amount: 22000, currency: 'EUR', target_date: '2031-01-01' },
      { user_id: uid, title: 'Emergency fund (6 months)', category: 'emergency_fund', target_amount: 30000, current_amount: 30000, currency: 'EUR', target_date: '2026-06-01' },
      { user_id: uid, title: 'Travel fund (1 trip per year)', category: 'vacation', target_amount: 5000, current_amount: 3200, currency: 'EUR', target_date: '2026-10-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'iShares Core MSCI World ETF (IWDA)', type: 'etf', invested_amount: 280000, current_value: 348000, currency: 'EUR', account: 'Scalable Capital', notes: 'Core holding — monthly DCA €2,000. Accumulating unit class' },
      { user_id: uid, name: 'Vanguard FTSE All-World (VWCE)', type: 'etf', invested_amount: 180000, current_value: 224000, currency: 'EUR', account: 'Scalable Capital', notes: 'Second core position — includes EM exposure' },
      { user_id: uid, name: 'iShares MSCI EM IMI (EIMI)', type: 'etf', invested_amount: 55000, current_value: 62000, currency: 'EUR', account: 'Scalable Capital', notes: 'Emerging markets tilt — 10% allocation' },
      { user_id: uid, name: 'Bundesschatzbriefe (German Govt Bond)', type: 'bonds', invested_amount: 30000, current_value: 31500, currency: 'EUR', account: 'Deutsche Bundesbank', notes: 'Safety buffer for market downturns — 2.8% yield' },
      { user_id: uid, name: 'Munich Apartment (Schwabing)', type: 'real_estate', invested_amount: 480000, current_value: 520000, currency: 'EUR', account: 'Primary residence', notes: 'Not counted in FIRE number — lifestyle asset' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning run (marathon training)', icon: '🏃', color: 'emerald', frequency: 'daily', days_of_week: [1,3,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Portfolio & net worth check', icon: '📈', color: 'indigo', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: 'Read financial news (15 min)', icon: '📰', color: 'amber', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Client check-in or prep', icon: '🤝', color: 'cyan', frequency: 'weekdays', days_of_week: [2,4], target_per_day: 1 },
      { user_id: uid, name: 'No-spend day tracking', icon: '💰', color: 'violet', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
    ]
    const { data } = await sb.from('habits').insert(habits).select()
    data.forEach(h => { habitIds[h.name] = h.id })
  } else {
    const { data } = await sb.from('habits').select('id, name').eq('user_id', uid)
    data.forEach(h => { habitIds[h.name] = h.id })
  }

  /* ── habit_logs ── */
  if (await cnt('habit_logs', uid) === 0) {
    const logs = []
    const runId = habitIds['Morning run (marathon training)']
    const newsId = habitIds['Read financial news (15 min)']
    const noSpendId = habitIds['No-spend day tracking']
    if (runId) ['2026-05-04','2026-05-06','2026-05-08','2026-05-09'].forEach(d =>
      logs.push({ user_id: uid, habit_id: runId, date: d, count: 1 }))
    if (newsId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: newsId, date: d, count: 1 }))
    if (noSpendId) ['2026-05-04','2026-05-05','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: noSpendId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Grow advisory firm to 100 clients', category: 'income', target_date: '2027-12-31', status: 'active', progress_pct: 62, description: '62 clients currently. Adding 3 per month via referrals and ProvenExpert.de listing' },
      { user_id: uid, title: 'Publish personal finance book (German)', category: 'impact', target_date: '2027-06-30', status: 'active', progress_pct: 30, description: 'Working title: "Frei mit 45 — Der ETF-Weg zur Frühpension". Agent interest from dtv Verlag' },
      { user_id: uid, title: 'Earn ESG/Sustainable Finance certification', category: 'skill', target_date: '2026-10-31', status: 'active', progress_pct: 55, description: 'CFA ESG Certificate — client demand increasing for sustainable portfolios' },
      { user_id: uid, title: 'Run Munich Marathon sub-4 hours', category: 'other', target_date: '2026-10-12', status: 'active', progress_pct: 65, description: '16-week Pfitzinger plan. Currently at 60km/week. PB: 4:12' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Stefan Bauer', email: 'sbauer@bauer-it.de', company: 'Bauer IT GmbH', notes: 'Freelance software consultant. Annual retainer €3,600. FIRE plan on track', currency: 'EUR' },
      { user_id: uid, name: 'Ingrid Hoffmann', email: 'ingrid.hoffmann@gmail.com', company: '(Individual)', notes: 'Retired teacher. Conservative portfolio, withdrawal planning. Very loyal', currency: 'EUR' },
      { user_id: uid, name: 'Thomas & Anna Weber', email: 'thomas.weber@siemens.com', company: '(Couple)', notes: 'Dual-income DINK couple. Complex pension optimisation + early retirement plan', currency: 'EUR' },
    ]
    const { data } = await sb.from('business_clients').insert(clients).select()
    clientIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('business_clients').select('id').eq('user_id', uid)
    clientIds = data.map(c => c.id)
  }

  /* ── business_projects ── */
  if (await cnt('business_projects', uid) === 0) {
    await sb.from('business_projects').insert([
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'Stefan Bauer — 2026 Annual Plan Review', status: 'active', fee: 3600, currency: 'EUR', notes: 'Rebalancing Q2, tax-loss harvesting opportunities, pension gap analysis' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Ingrid Hoffmann — Withdrawal Strategy', status: 'active', fee: 1800, currency: 'EUR', notes: '4% rule vs bucket strategy analysis. Sequence of returns risk review' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Weber Couple — FIRE Roadmap', status: 'lead', fee: 5400, currency: 'EUR', notes: 'Initial onboarding. Both want to retire at 50. 18-year horizon' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Dr. Klaus Fischer', group_name: 'mentor', email: 'kfischer@dfv-ffm.de', role: 'CFP Board Member, Deutschen Finanzberater-Verband', notes: 'Mentored me through CFP certification. Annual lunch at DFV conference', strength: 4 },
      { user_id: uid, name: 'Julia Schneider', group_name: 'friend', email: 'julia@finanzfluss.de', role: 'Content Creator, Finanzfluss', notes: 'YouTube collab twice per year. Massive FIRE community reach', strength: 4 },
      { user_id: uid, name: 'Marc Dupont', group_name: 'friend', email: 'marc.dupont@gmail.com', role: 'FIRE community co-founder', notes: 'Met at mustachian meetup. Runs FIRE Munich local group together', strength: 5 },
    ]
    const { data } = await sb.from('contacts').insert(contacts).select()
    contactIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('contacts').select('id').eq('user_id', uid)
    contactIds = data.map(c => c.id)
  }

  /* ── contact_interactions ── */
  if (contactIds.length > 0) {
    const { count } = await sb.from('contact_interactions').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!count) {
      await sb.from('contact_interactions').insert([
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Recorded YouTube collab episode: "Wie ich 52% meines Einkommens spare"', interacted_at: '2026-05-07T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'FIRE Munich monthly meetup — 22 attendees. Topic: sequence of returns risk', interacted_at: '2026-05-05T19:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Book chapter 3 — "Die Sparquote optimieren"', notes: 'Drafted 2,400 words on tax-advantaged accounts for German readers', started_at: '2026-05-06T06:00:00Z', ended_at: '2026-05-06T08:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Weber Couple — FIRE scenario modelling', notes: 'Built 3 scenarios in spreadsheet: conservative, base, optimistic', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T10:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 30, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Q2 portfolio rebalancing check', notes: 'EM allocation drifted to 8.5% — need to buy €2,400 EIMI', started_at: '2026-05-04T07:00:00Z', ended_at: '2026-05-04T07:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Lisbon — EuroPFConference 2026', start_date: '2026-06-18', end_date: '2026-06-21', status: 'booked', budget_total: 1200, currency: 'EUR', travellers: 1, notes: 'European Personal Finance Conference. Speaking on fee-only model and FIRE' },
      { user_id: uid, destination: 'Norwegian Fjords — Summer Interrail', start_date: '2026-08-01', end_date: '2026-08-15', status: 'planning', budget_total: 2800, currency: 'EUR', travellers: 1, notes: 'Annual slow travel trip. Interrail pass + hostels = low cost, high experience' },
    ]).select()
    tripIds = data.map(t => t.id)
  } else {
    const { data } = await sb.from('trips').select('id').eq('user_id', uid)
    tripIds = data.map(t => t.id)
  }

  if (tripIds.length > 0) {
    const { count: tiCount } = await sb.from('trip_items').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!tiCount) {
      await sb.from('trip_items').insert([
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'MUC → LIS (Lufthansa)', starts_at: '2026-06-18T07:30:00Z', cost: 180, notes: 'Economy. Carbon offset purchased' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Generator Hostel Lisbon (private room)', starts_at: '2026-06-18T15:00:00Z', ends_at: '2026-06-21T10:00:00Z', cost: 210, notes: '3 nights. FIRE-consistent frugal accommodation' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Speaking slot: "Fee-only Advising in Germany — Why It Works"', starts_at: '2026-06-19T11:00:00Z', cost: 0, notes: 'Main stage, 45 min' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Finanzfluss collab went live — 45K views in 24h. 8 new client enquiries', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: '16km long run done. Pace improving — 5:48/km. Sub-4 is happening', logged_at: '2026-05-06T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Market dip today. Mentally I know this is irrelevant long-term. Still annoying', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Net worth crossed €600K milestone today. FIRE number is 40% there!', logged_at: '2026-05-04T19:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: '€600K — a number that means freedom', content: "I checked the portfolio this morning and for the first time it shows €600K. I know it is 40% of my FIRE number, not the finish line. But it is proof that the plan is working. When I started this 8 years ago with €12K in savings and €85K of student loans, €1.5M felt like fantasy. Today it feels like a schedule. That is the power of compound interest meeting a high savings rate.", mood: 5, tags: ['FIRE', 'milestone', 'investing', 'gratitude'], created_at: '2026-05-04T21:00:00Z' },
      { user_id: uid, title: 'Why I work with real people', content: "Ingrid emailed today to say she slept properly for the first time in years since we built her withdrawal plan. She is 67 and she was terrified of running out of money. Giving someone that peace of mind is not a financial transaction — it is medicine. The fee-only model means I never had to recommend something I did not believe in. That integrity is the whole point.", mood: 4, tags: ['clients', 'purpose', 'fee-only', 'meaning'], created_at: '2026-05-08T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Ingrid sleeping soundly again', 'Book chapter 3 drafted', 'Strong marathon training run']
        : gd === '2026-05-09'
        ? ['€600K portfolio milestone', 'Fee-only model that lets me be honest', 'German public transport']
        : ['No-spend Sunday achieved', 'Clear FIRE roadmap', 'Health to run and work freely']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Increase EM allocation from 10% to 15% of portfolio?',
        category: 'finance', mode: 'analyze',
        options: [{ label: 'Increase to 15%', pros: ['higher expected return', 'diversification'], cons: ['higher volatility', 'currency risk'] }, { label: 'Keep at 10%', pros: ['simpler', 'less rebalancing'], cons: ['potentially leaving return on table'] }],
        result: { summary: 'Keep 10% — current allocation matches evidence-based 3-fund portfolio. No need to tinker', chosen: 'Keep at 10%', outcome: 'decided' },
        favorite: false, created_at: '2026-05-04T20:00:00Z'
      },
      {
        user_id: uid, question: 'Accept publisher offer from Random House DE vs self-publish book?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Random House DE', pros: ['distribution', 'credibility', '€18K advance'], cons: ['low royalty rate 8%', 'loss of control'] }, { label: 'Self-publish (KDP)', pros: ['70% royalty', 'full control'], cons: ['marketing burden', 'no advance'] }],
        result: { summary: 'Negotiate: keep digital rights + increase advance to €25K or self-publish', chosen: 'Pending negotiation', outcome: 'pending' },
        favorite: true, created_at: '2026-05-09T21:00:00Z'
      },
    ])
  }

  console.log('✅ Lena Müller seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
