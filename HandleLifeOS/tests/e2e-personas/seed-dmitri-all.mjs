/**
 * Seed all data for Dmitri Volkov (E2E persona #16).
 * 36yo CloudOps SaaS founder in Dubai, UAE. AED.
 * Run: node tests/e2e-personas/seed-dmitri-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'dmitri.volkov@e2e-test.handlelifeos.app'
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
    display_name: 'Dmitri Volkov',
    occupation: 'SaaS Founder & CEO — CloudOps ME',
    life_stage: 'mid_career',
    country: 'AE',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    goals: ['scale to $5M ARR', 'Series A fundraise', 'hire MENA engineering team', 'diversify crypto holdings'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'company_name', value: 'CloudOps ME — B2B SaaS for cloud cost optimization, 85 enterprise clients', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'arr', value: 'Current ARR: AED 7.2M (~$2M USD). Target: AED 18M by end of 2026', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'work_routine', value: 'Deep work 5–8am before Dubai traffic. Remote-first culture, team across UAE/Egypt/India', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'crypto_strategy', value: 'BTC and ETH long-term holds; no altcoins; hardware wallet in safe', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'communication', value: 'Async-first. Slack for team, WhatsApp for clients, weekly all-hands Friday 3pm', confidence: 80 },
      { user_id: uid, type: 'goal', key: 'residency', value: 'UAE Golden Visa obtained 2024. No plans to relocate — Dubai tax efficiency suits business', confidence: 95 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 55000, savings_target: 15000, currency: 'AED' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 58000, savings_target: 15000, currency: 'AED' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 55000, savings_target: 18000, currency: 'AED' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 18000, description: 'Dubai Marina apartment — monthly rent', expense_date: '2026-05-01', is_recurring: true, currency: 'AED' },
      { user_id: uid, category: 'utilities', amount: 1200, description: 'DEWA electricity + internet (du)', expense_date: '2026-05-03', is_recurring: true, currency: 'AED' },
      { user_id: uid, category: 'food', amount: 3500, description: 'Dining + grocery (Waitrose, Carrefour)', expense_date: '2026-05-05', is_recurring: false, currency: 'AED' },
      { user_id: uid, category: 'transport', amount: 2200, description: 'Tesla Model 3 lease payment', expense_date: '2026-05-01', is_recurring: true, currency: 'AED' },
      { user_id: uid, category: 'health', amount: 1800, description: 'Fitness First platinum membership + supplements', expense_date: '2026-05-02', is_recurring: true, currency: 'AED' },
      { user_id: uid, category: 'education', amount: 2500, description: 'AWS certification course + tech books', expense_date: '2026-05-08', is_recurring: false, currency: 'AED' },
      { user_id: uid, category: 'entertainment', amount: 1500, description: 'DIFC restaurants + weekend brunch', expense_date: '2026-05-10', is_recurring: false, currency: 'AED' },
      { user_id: uid, category: 'travel', amount: 4500, description: 'Abu Dhabi GITEX Tech Week — registration + hotel', expense_date: '2026-05-07', is_recurring: false, currency: 'AED' },
      { user_id: uid, category: 'investment', amount: 5000, description: 'Monthly BTC purchase (DCA strategy)', expense_date: '2026-05-01', is_recurring: true, currency: 'AED' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: '6-Month Emergency Fund', category: 'emergency_fund', target_amount: 330000, current_amount: 280000, currency: 'AED', target_date: '2026-08-31' },
      { user_id: uid, title: 'Series A War Chest', category: 'business', target_amount: 500000, current_amount: 180000, currency: 'AED', target_date: '2027-06-30' },
      { user_id: uid, title: 'Moscow Family Visit', category: 'vacation', target_amount: 25000, current_amount: 18000, currency: 'AED', target_date: '2026-12-20' },
      { user_id: uid, title: 'Retirement Portfolio (USD)', category: 'retirement', target_amount: 2000000, current_amount: 420000, currency: 'AED', target_date: '2040-01-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Bitcoin (BTC)', type: 'crypto', invested_amount: 280000, current_value: 420000, currency: 'AED', account: 'Ledger Nano X', notes: 'Long-term hold, DCA monthly' },
      { user_id: uid, name: 'Ethereum (ETH)', type: 'crypto', invested_amount: 95000, current_value: 115000, currency: 'AED', account: 'Ledger Nano X', notes: 'Staked via Lido 4.2% APY' },
      { user_id: uid, name: 'S&P 500 ETF (VOO)', type: 'etf', invested_amount: 180000, current_value: 215000, currency: 'AED', account: 'Interactive Brokers', notes: 'USD-denominated, auto-invest monthly' },
      { user_id: uid, name: 'NASDAQ-100 QQQ', type: 'etf', invested_amount: 120000, current_value: 148000, currency: 'AED', account: 'Interactive Brokers', notes: 'Tech-heavy exposure' },
      { user_id: uid, name: 'UAE Real Estate REIT', type: 'real_estate', invested_amount: 200000, current_value: 235000, currency: 'AED', account: 'Emaar Properties', notes: 'Dubai commercial REIT, 6.5% yield' },
      { user_id: uid, name: 'CloudOps ME Equity', type: 'other', invested_amount: 0, current_value: 2500000, currency: 'AED', account: 'Founder equity', notes: 'Own 68% post-seed' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Deep Work Block (5–8am)', icon: '⚡', color: 'indigo', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Gym / Functional Training', icon: '🏋️', color: 'emerald', frequency: 'daily', days_of_week: [1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Read Tech / VC Newsletter', icon: '📰', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Weekly Investor Update Draft', icon: '📊', color: 'violet', frequency: 'weekly', days_of_week: [5], target_per_day: 1 },
      { user_id: uid, name: 'Cold Shower', icon: '🚿', color: 'cyan', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
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
    const deepWorkId = habitIds['Deep Work Block (5–8am)']
    const gymId = habitIds['Gym / Functional Training']
    const coldId = habitIds['Cold Shower']
    const allDates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                      '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const weekdays = ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08']
    if (deepWorkId) weekdays.forEach(d => logs.push({ user_id: uid, habit_id: deepWorkId, date: d, count: 1 }))
    if (gymId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-09'].forEach(d =>
      logs.push({ user_id: uid, habit_id: gymId, date: d, count: 1 }))
    if (coldId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: coldId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Scale CloudOps ME to $5M ARR', category: 'income', target_date: '2026-12-31', status: 'active', progress_pct: 38, description: 'ARR currently $2M. Need 15 new enterprise clients at $200K ACV' },
      { user_id: uid, title: 'Raise Series A ($8M)', category: 'impact', target_date: '2027-03-31', status: 'active', progress_pct: 20, description: 'MENA-focused VC approach. Target: Wamda, STV, Global Ventures' },
      { user_id: uid, title: 'AWS Partner Network — Advanced Tier', category: 'skill', target_date: '2026-09-30', status: 'active', progress_pct: 55, description: 'Complete APN requirements for reseller margins' },
      { user_id: uid, title: 'Build Engineering Team in Egypt (Cairo)', category: 'role', target_date: '2026-08-31', status: 'active', progress_pct: 40, description: 'Hire 5 senior engineers, establish Cairo hub for cost efficiency' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Ahmed Al Rashidi', email: 'ahmed@emaardigital.ae', company: 'Emaar Digital', notes: 'Flagship client — cloud cost reduced 40% with CloudOps. Annual renewal in Q3', currency: 'AED' },
      { user_id: uid, name: 'Priya Nair', email: 'priya@fabdubai.com', company: 'FAB (First Abu Dhabi Bank) FinTech', notes: 'Pilot in Q2, targeting full enterprise rollout worth AED 800K ARR', currency: 'AED' },
      { user_id: uid, name: 'Karim Essam', email: 'karim@orascomtelecom.eg', company: 'Orascom Telecom Egypt', notes: 'Largest deal — AED 1.2M ARR. Multi-cloud optimization for 3 data centers', currency: 'AED' },
      { user_id: uid, name: 'Shreya Mehta', email: 'shreya@careem.com', company: 'Careem (Uber MENA)', notes: 'New lead from GITEX. Kubernetes cost optimization POC underway', currency: 'AED' },
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
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'Emaar Annual Cloud Optimization', status: 'active', fee: 480000, currency: 'AED', notes: 'Renewal negotiations underway. Added ML cost prediction module' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'FAB FinTech Enterprise Rollout', status: 'lead', fee: 800000, currency: 'AED', notes: 'POC results excellent — 35% cost reduction demo. Contract draft sent' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Orascom Multi-Cloud Phase 2', status: 'active', fee: 1200000, currency: 'AED', notes: 'Expanding to AWS + Azure + GCP unified dashboard' },
      { user_id: uid, client_id: clientIds[3] ?? null, name: 'Careem K8s POC', status: 'lead', fee: 350000, currency: 'AED', notes: '90-day POC for Kubernetes cost reduction. Results due June 2026' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Walid Mansour', group_name: 'investor', email: 'walid@wamdacapital.com', role: 'Partner, Wamda Capital', notes: 'Series A target investor. Warm intro via Ahmed. Coffee scheduled May 20', strength: 4 },
      { user_id: uid, name: 'Sergei Petrov', group_name: 'friend', email: 'sergei@petrov.dev', role: 'CTO at Berlin fintech', notes: 'Former colleague at Yandex. Monthly catch-up call', strength: 5 },
      { user_id: uid, name: 'Layla Al Hashimi', group_name: 'work', email: 'layla@cloudops.me', role: 'Head of Sales, CloudOps ME', notes: 'First hire. Closed 60% of current ARR. Needs equity incentive revision', strength: 5 },
      { user_id: uid, name: 'Omar Almansouri', group_name: 'mentor', email: 'omar@menavc.com', role: 'Founder, MENA VC Network', notes: 'Valuable introductions to regional family offices. Quarterly lunch', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Intro coffee at DIFC. Wamda interested in MENA cloud infrastructure thesis', interacted_at: '2026-05-08T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Quarterly review — Layla hit 120% quota, discussed equity increase to 1.5%', interacted_at: '2026-05-06T15:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Discussed Berlin hiring market and remote engineering culture', interacted_at: '2026-05-04T18:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 175, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Series A pitch deck — financial model', notes: 'Revenue projections and unit economics section', started_at: '2026-05-05T05:00:00Z', ended_at: '2026-05-05T08:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 120, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'CloudOps product roadmap Q3/Q4', notes: 'ML cost prediction feature spec and AI integration roadmap', started_at: '2026-05-07T05:00:00Z', ended_at: '2026-05-07T07:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 60, actual_minutes: 45, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Weekly investor update email', notes: 'ARR update, Cairo team progress, new GITEX leads', started_at: '2026-05-08T16:00:00Z', ended_at: '2026-05-08T17:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 30, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'Competitor analysis — AWS Cost Optimizer vs CloudOps', notes: 'Interrupted by urgent Orascom client escalation', started_at: '2026-05-09T05:00:00Z', ended_at: '2026-05-09T05:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'San Francisco — SaaStr Annual 2026', start_date: '2026-09-08', end_date: '2026-09-12', status: 'booked', budget_total: 22000, currency: 'AED', travellers: 1, notes: 'Speaking slot confirmed. Target 5 VC meetings and 10 partner intros' },
      { user_id: uid, destination: 'Cairo — Engineering Team Launch', start_date: '2026-07-15', end_date: '2026-07-20', status: 'planning', budget_total: 8000, currency: 'AED', travellers: 2, notes: 'Office space viewing + final candidate interviews' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'Dubai → SFO (Emirates EK225)', starts_at: '2026-09-08T02:00:00Z', cost: 8500, notes: 'Business class — miles redeemed for upgrade' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Marriott Marquis SF', starts_at: '2026-09-08T18:00:00Z', ends_at: '2026-09-12T11:00:00Z', cost: 7200, notes: '4 nights near Moscone Center' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'SaaStr speaking slot — MENA Cloud Market', starts_at: '2026-09-10T14:00:00Z', cost: 0, notes: 'Main stage, 30 min + networking' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Wamda meeting went better than expected — they want to see Q2 numbers', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Orascom escalation ate my deep work. Need better delegation', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Good gym session and solid product work. Cairo team taking shape', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Careem POC results are exceptional — 42% cost reduction. Converting this deal', logged_at: '2026-05-10T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The Delegation Problem', content: "I built this company by being the best engineer in the room. But scaling means getting out of the way. The Orascom escalation hit me personally because I should have trusted Layla to handle it. She would have. I need to stop being a founder who codes at 2am and start being a CEO who enables others. That is the real work of this stage.", mood: 3, tags: ['leadership', 'delegation', 'growth'], created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, title: 'Why I moved to Dubai', content: "Three years ago I was at Yandex Moscow, engineering manager, good salary, no equity, watching oligarchs play with the company I loved. Now I run something real. Dubai has given me legal clarity, zero income tax, and access to capital that doesn't care about my passport. The trade-off is missing family in Moscow. Both things are true.", mood: 4, tags: ['reflection', 'dubai', 'entrepreneurship'], created_at: '2026-05-05T21:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Wamda investor interest', 'Layla closing another deal', 'Morning gym session']
        : gd === '2026-05-09'
        ? ['Still solved the Orascom issue', 'Dubai life quality', 'Financial freedom from tax savings']
        : ['Careem POC success', 'Team execution', 'BTC up this week']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Should CloudOps ME raise Series A now or wait until $4M ARR?',
        category: 'business', mode: 'analyze',
        options: [{ label: 'Raise now at $2M ARR', pros: ['runway', 'hire faster'], cons: ['lower valuation', 'dilution'] }, { label: 'Wait for $4M ARR', pros: ['better terms', 'stronger position'], cons: ['slower growth', 'cash risk'] }],
        result: { summary: 'Wait until $3.5M ARR — 9 months runway remaining gives breathing room', chosen: 'Wait for stronger metrics', outcome: 'pending' },
        favorite: true, created_at: '2026-05-08T23:00:00Z'
      },
      {
        user_id: uid, question: 'Cairo vs Bangalore for second engineering hub?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Cairo', pros: ['timezone alignment', 'Arabic talent', 'lower cost'], cons: ['smaller pool'] }, { label: 'Bangalore', pros: ['huge talent pool'], cons: ['timezone gap', 'higher cost', 'competition'] }],
        result: { summary: 'Cairo wins — MENA talent, timezone overlap, Arabic language advantage for regional clients', chosen: 'Cairo', outcome: 'decided' },
        favorite: false, created_at: '2026-05-03T20:00:00Z'
      },
    ])
  }

  console.log('✅ Dmitri Volkov seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
