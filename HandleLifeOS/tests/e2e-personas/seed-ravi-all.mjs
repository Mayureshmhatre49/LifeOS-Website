/**
 * Seed all data for Ravi Krishnan (E2E persona #30).
 * 38yo Senior IT Consultant (remote — EU clients), Colombo, Sri Lanka. LKR.
 * Run: node tests/e2e-personas/seed-ravi-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'ravi.krishnan@e2e-test.handlelifeos.app'
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
    display_name: 'Ravi Krishnan',
    occupation: 'Senior IT Consultant (Remote) — Cloud & DevOps for European Clients',
    life_stage: 'mid_career',
    country: 'LK',
    currency: 'LKR',
    timezone: 'Asia/Colombo',
    goals: ['grow remote income to $7,000/month', 'complete Colombo apartment purchase', 'build US dollar savings buffer', 'transition to product consultancy'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'income', value: 'Remote IT consulting: €4,500-5,200/month (~LKR 1,460,000-1,690,000 at current rate). Invoices in EUR via Wise, converts to LKR for local expenses, keeps 30% in USD/EUR savings', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'clients', value: '3 active EU clients: Dutch logistics SaaS (40hr/month), German fintech startup (20hr/month), Belgian healthcare NGO (10hr/month). All remote, async-first', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'background', value: 'Tamil-Sri Lankan from Jaffna. Moved to Colombo 2018. BSc Computer Science, University of Jaffna. 8 years consulting (local then remote since 2022). AWS Certified Solutions Architect', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'property', value: 'Targeting 2BR apartment in Colombo 3 (Kollupitiya) — LKR 32M asking price. Has LKR 8M saved. Bank of Ceylon construction loan application in progress', confidence: 80 },
      { user_id: uid, type: 'preference', key: 'work_routine', value: 'Works 7am-12pm (Sri Lanka time = 2:30-7:30am UTC) to overlap with EU morning. Afternoons free for property research, gym, and family. No night calls', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'family', value: 'Parents in Jaffna — monthly support LKR 40,000. Younger sister (Priya) studying medicine at Kelaniya. Wife Deepa (graphic designer, works part-time remotely). No children yet', confidence: 90 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 1480000, savings_target: 350000, currency: 'LKR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 1550000, savings_target: 380000, currency: 'LKR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 1620000, savings_target: 420000, currency: 'LKR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 75000, description: 'Apartment rent — Kollupitiya, Colombo 3', expense_date: '2026-05-01', is_recurring: true, currency: 'LKR' },
      { user_id: uid, category: 'food', amount: 45000, description: 'Groceries (Keells + Cargills) + home cooking (Deepa and Ravi both cook)', expense_date: '2026-05-05', is_recurring: false, currency: 'LKR' },
      { user_id: uid, category: 'utilities', amount: 18000, description: 'Ceylon Electricity Board + SLT fibre (100Mbps for remote work) + Dialog mobile', expense_date: '2026-05-03', is_recurring: true, currency: 'LKR' },
      { user_id: uid, category: 'transport', amount: 22000, description: 'Motorbike fuel + PickMe rides + annual service', expense_date: '2026-05-06', is_recurring: false, currency: 'LKR' },
      { user_id: uid, category: 'health', amount: 12000, description: 'Private gym membership + Ayurveda session monthly', expense_date: '2026-05-02', is_recurring: true, currency: 'LKR' },
      { user_id: uid, category: 'misc', amount: 40000, description: 'Monthly Jaffna family support (parents + Priya allowance)', expense_date: '2026-05-01', is_recurring: true, currency: 'LKR' },
      { user_id: uid, category: 'education', amount: 28000, description: 'AWS re:Certification exam fee + O\'Reilly online subscription', expense_date: '2026-05-07', is_recurring: false, currency: 'LKR' },
      { user_id: uid, category: 'investment', amount: 350000, description: 'Monthly USD savings transfer (Wise → IBKR account) for property deposit and FX buffer', expense_date: '2026-05-02', is_recurring: true, currency: 'LKR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Colombo apartment deposit (25%)', category: 'home', target_amount: 8000000, current_amount: 5200000, currency: 'LKR', target_date: '2027-06-30' },
      { user_id: uid, title: 'USD safety net (6 months expenses)', category: 'emergency_fund', target_amount: 18000000, current_amount: 8500000, currency: 'LKR', target_date: '2027-12-31' },
      { user_id: uid, title: 'Priya\'s medical school fees (4 years remaining)', category: 'education', target_amount: 3600000, current_amount: 1200000, currency: 'LKR', target_date: '2029-06-30' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Interactive Brokers — Vanguard VWCE ETF (USD)', type: 'etf', invested_amount: 7200000, current_value: 8900000, currency: 'LKR', account: 'Interactive Brokers', notes: 'USD-denominated ETF. Funded from monthly Wise transfers. FX hedge against LKR depreciation' },
      { user_id: uid, name: 'CSE Unit Trust (NDB Wealth)', type: 'mutual_fund', invested_amount: 1500000, current_value: 1680000, currency: 'LKR', account: 'NDB Wealth Management', notes: 'Colombo Stock Exchange exposure. Moderate risk fund. Monthly SIP LKR 50,000' },
      { user_id: uid, name: 'NSB Fixed Deposit (LKR)', type: 'other', invested_amount: 2000000, current_value: 2220000, currency: 'LKR', account: 'National Savings Bank', notes: '3-year FD at 11.5% — LKR high yield. Matures October 2026. Will roll into apartment deposit' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'EU client work block (7–12am SL time)', icon: '💻', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Afternoon gym session', icon: '🏋️', color: 'emerald', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'AWS / tech certification study (1 hr)', icon: '☁️', color: 'cyan', frequency: 'daily', days_of_week: [1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Weekly USD savings transfer (Wise)', icon: '💱', color: 'amber', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: 'Evening walk with Deepa (Galle Face Green)', icon: '🚶', color: 'rose', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
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
    const allDates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                      '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const workId = habitIds['EU client work block (7–12am SL time)']
    const walkId = habitIds['Evening walk with Deepa (Galle Face Green)']
    const awsId = habitIds['AWS / tech certification study (1 hr)']
    if (workId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: workId, date: d, count: 1 }))
    if (walkId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: walkId, date: d, count: 1 }))
    if (awsId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09'].forEach(d =>
      logs.push({ user_id: uid, habit_id: awsId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Grow remote income to $7,000/month', category: 'income', target_date: '2026-12-31', status: 'active', progress_pct: 64, description: 'Currently ~$4,800/month from 3 clients. Need 1 more client at 20hr/month rate €120/hr or raise existing rates' },
      { user_id: uid, title: 'Complete AWS Solutions Architect Professional (SAP-C02)', category: 'skill', target_date: '2026-07-31', status: 'active', progress_pct: 75, description: 'Associate already held. Professional cert enables €150/hr rate with enterprise clients. Exam booked June 15' },
      { user_id: uid, title: 'Purchase Colombo 3 apartment', category: 'other', target_date: '2027-09-30', status: 'active', progress_pct: 65, description: 'Deposit LKR 5.2M saved. Need LKR 8M. NSB FD matures October — will bring to LKR 7.4M. Almost there' },
      { user_id: uid, title: 'Transition to product consultancy model (hourly → retainer)', category: 'role', target_date: '2027-06-30', status: 'active', progress_pct: 30, description: 'Dutch logistics client open to monthly retainer. Pitching €8,000/month 3-day/week engagement' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Jan van der Berg', email: 'jan@logisticsflow.nl', company: 'LogisticsFlow BV (Netherlands)', notes: 'Longest client — 2.5 years. AWS infrastructure + CI/CD for SaaS platform. 40hr/month at €120/hr. Renewal every 6 months', currency: 'EUR' },
      { user_id: uid, name: 'Dr. Annika Braun', email: 'annika.braun@fintech-gmbh.de', company: 'FinTech Solutions GmbH (Germany)', notes: 'Newer client — 8 months. Kubernetes and Terraform for banking platform. 20hr/month at €130/hr', currency: 'EUR' },
      { user_id: uid, name: 'Marc Dubois', email: 'marc.dubois@healthaid.org', company: 'HealthAid Belgium NGO', notes: 'Healthcare data pipeline consultancy. 10hr/month at €90/hr — below rate but meaningful project. May end in 6 months', currency: 'EUR' },
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
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'LogisticsFlow — Multi-region AWS Rollout', status: 'active', fee: 28800, currency: 'EUR', notes: '6-month engagement. Expanding from EU-West-1 to AP-Southeast-1 (Singapore) for APAC clients' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'FinTech GmbH — PCI-DSS Kubernetes Hardening', status: 'active', fee: 10400, currency: 'EUR', notes: 'Banking compliance audit prep. Network policies and secrets management implementation' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'HealthAid — FHIR Data Pipeline', status: 'on_hold', fee: 3600, currency: 'EUR', notes: 'Healthcare data interoperability. On hold pending grant funding confirmation from EU' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Deepa Krishnan', email: 'deepa.krishnan@gmail.com', group_name: 'family', role: 'Wife — Graphic Designer (remote)', notes: 'Deepa earns LKR 120,000/month from freelance clients. Handles Ravi\'s invoicing and Wise accounts. Team effort', strength: 5 },
      { user_id: uid, name: 'Suresh Nair', group_name: 'mentor', email: 'suresh.nair@toptal.com', role: 'Senior Consultant — Toptal network (Mumbai)', notes: 'Fellow Tamil diaspora consultant. Mentored Ravi into first EU client engagement. Monthly WhatsApp call', strength: 4 },
      { user_id: uid, name: 'Priya Krishnan', email: 'priya.kri@kelaniya.ac.lk', group_name: 'family', role: 'Younger sister — Medical student, Kelaniya', notes: '2nd year medicine. Ravi funds her fees. Top of cohort — will be an excellent doctor', strength: 5 },
      { user_id: uid, name: 'Nimal Perera', group_name: 'friend', email: 'nimal@ceylontech.lk', role: 'CTO, Ceylon Tech Solutions', notes: 'Colombo tech community friend. Regular Thursday dev meetup co-organizer. Good for local networking', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Monthly call with Suresh — discussed pitching retainer model to Jan. Suresh did similar at Toptal. Valuable framing advice', interacted_at: '2026-05-07T19:00:00Z' },
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Deepa reviewed Q2 invoicing — two invoices unpaid 30 days. Sent chaser to Jan and Dr. Braun. Both paid within 48 hours', interacted_at: '2026-05-05T18:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'meeting', note: 'Thursday dev meetup — Ravi presented "Remote consulting for EU clients from Colombo — practical guide". 22 attendees', interacted_at: '2026-05-08T19:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 150, actual_minutes: 145, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'LogisticsFlow AP-Southeast-1 Terraform modules', notes: 'VPC, ECS, and RDS modules complete. Multi-region state management configured', started_at: '2026-05-07T07:00:00Z', ended_at: '2026-05-07T09:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'AWS SAP-C02 practice exam (AWS Skill Builder)', notes: 'Mock exam 2: 84% score — above 75% pass threshold. Feeling confident for June 15 exam', started_at: '2026-05-08T13:00:00Z', ended_at: '2026-05-08T14:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'LogisticsFlow retainer proposal draft', notes: 'Proposed €8,500/month for 3 dedicated days. Jan requested call to discuss', started_at: '2026-05-06T13:00:00Z', ended_at: '2026-05-06T13:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Jaffna — Family Visit & Parents', start_date: '2026-07-18', end_date: '2026-07-25', status: 'planning', budget_total: 85000, currency: 'LKR', travellers: 2, notes: 'Annual Jaffna trip with Deepa. Priya home from university. Drive the A9 — now safe and scenic' },
      { user_id: uid, destination: 'Amsterdam — LogisticsFlow Client Visit', start_date: '2026-10-06', end_date: '2026-10-10', status: 'planning', budget_total: 850000, currency: 'LKR', travellers: 1, notes: 'Jan invited for in-person retainer negotiation. First time meeting EU clients face-to-face in 2 years' },
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
        { trip_id: tripIds[1], user_id: uid, type: 'flight', title: 'CMB → AMS (SriLankan Airlines UL506)', starts_at: '2026-10-06T03:00:00Z', cost: 580000, notes: 'Economy. 11-hour flight via Doha. Expensed by LogisticsFlow (€1,600 cap)' },
        { trip_id: tripIds[1], user_id: uid, type: 'hotel', title: 'ibis Amsterdam Centre', starts_at: '2026-10-06T16:00:00Z', ends_at: '2026-10-10T11:00:00Z', cost: 220000, notes: '4 nights. Jan covering 2 nights — splitting remainder' },
        { trip_id: tripIds[1], user_id: uid, type: 'activity', title: 'LogisticsFlow HQ — Retainer pitch meeting', starts_at: '2026-10-07T10:00:00Z', cost: 0, notes: 'Face-to-face for first time. Bringing architecture proposal deck' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'AWS practice exam 84%! June 15 certification will happen. Then €150/hr rate unlocked', logged_at: '2026-05-08T15:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Jan replied about retainer — interested. Amsterdam trip likely. First EU in-person since 2024', logged_at: '2026-05-06T14:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'LKR fell 2% vs EUR this week. Apartment deposit value shrinking in real terms. Need to accelerate', logged_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Galle Face walk with Deepa at sunset. She said she loves this life we have built. Me too', logged_at: '2026-05-09T19:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'Working at dawn for Dutch logistics', content: "At 7am in Colombo I am already deep in Terraform code while Amsterdam is still asleep. By the time Jan starts his day at 9am CET (1:30pm SL time) I have a status update ready. This timezone advantage is the whole business model. I work while Europe sleeps, deliver while Europe wakes. Colombo has everything I need — family, low cost of living, Deepa — and I can earn European rates without leaving it.", mood: 5, tags: ['remote-work', 'strategy', 'Colombo', 'gratitude'], created_at: '2026-05-07T12:00:00Z' },
      { user_id: uid, title: 'The LKR problem', content: "The rupee fell again. In three years since I started invoicing in EUR, the LKR has lost 38% of its value. My local expenses are LKR-denominated and my income is EUR — theoretically this should make me richer. But the apartment I want in Colombo 3 costs LKR 32M and rising. The property market is denominated in hard currency anyway. This country is one of the most complex places to build wealth in. I love it and I am staying.", mood: 3, tags: ['LKR', 'economics', 'property', 'Sri Lanka'], created_at: '2026-05-05T21:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['84% on AWS practice exam', 'Jan open to retainer conversation', 'Colombo coastline to walk every evening']
        : gd === '2026-05-09'
        ? ['Deepa as life and business partner', 'NSB FD growing at 11.5% LKR yield', 'Galle Face Green sunset ritual']
        : ['EU clients trusting a Sri Lankan consultant', 'Priya thriving in medicine', '3 years building this remote career from Colombo']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Pitch LogisticsFlow retainer at €8,500/month or €9,000/month?',
        category: 'business', mode: 'analyze',
        options: [{ label: '€8,500/month', pros: ['more likely to close', 'still 40% increase'] }, { label: '€9,000/month', pros: ['higher ceiling', '€6K more per year'] }],
        result: { summary: 'Open at €9,000 — they need the service more than I need them right now. If pushback, come down to €8,700 not €8,500', chosen: 'Open at €9,000, floor €8,700', outcome: 'pending' },
        favorite: true, created_at: '2026-05-06T20:00:00Z'
      },
      {
        user_id: uid, question: 'Roll NSB FD maturity (LKR 2.2M in October) into apartment deposit or reinvest in higher-yield FD?',
        category: 'finance', mode: 'compare',
        options: [{ label: 'Add to apartment deposit', pros: ['deposit at LKR 7.4M — very close to target', 'buy by 2027'] }, { label: 'Reinvest at 11.5% for 1 more year', pros: ['another LKR 250K in interest', 'delays purchase 6 months'] }],
        result: { summary: 'Move to deposit — apartment prices rising faster than 11.5% FD yield. The opportunity cost of waiting is higher than the interest gain', chosen: 'Add to deposit', outcome: 'decided' },
        favorite: false, created_at: '2026-05-04T20:00:00Z'
      },
    ])
  }

  console.log('✅ Ravi Krishnan seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
