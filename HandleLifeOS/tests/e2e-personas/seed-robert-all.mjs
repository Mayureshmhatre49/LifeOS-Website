/**
 * Seed all data for Robert Williams (E2E persona #24).
 * 58yo Retired US Army Colonel, Northern Virginia, USA. USD. Veteran community leader.
 * Run: node tests/e2e-personas/seed-robert-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'robert.williams@e2e-test.handlelifeos.app'
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
    display_name: 'Robert Williams',
    occupation: 'Retired US Army Colonel & Veterans Affairs Consultant',
    life_stage: 'senior',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    goals: ['complete home renovation', 'launch veteran mentorship nonprofit', 'travel with Linda for 30th anniversary', 'optimize retirement income strategy'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'retirement_income', value: 'Army pension: $5,850/month (30 years service, 75% base pay). VA disability compensation: $1,680/month (40% rating). Part-time VA consulting: $2,800/month. Total gross: ~$10,330/month', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'military_service', value: 'US Army Infantry. Served 1990-2020. Deployments: Gulf War, OIF, OEF (Afghanistan x2). Retired O-6 Colonel at Fort Belvoir. Combat Infantryman Badge, Bronze Star', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'family', value: 'Married to Linda Williams (retired teacher, now part-time real estate agent). 3 adult children: 2 in military (son Army Captain), 1 civilian. 2 grandchildren', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Structured daily routine. 0530 wake. PT (run/weights). Organized, punctual, direct communication. Volunteers at local VFW post', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'nonprofit', value: 'Launching "Valor to Vocation" nonprofit — veteran transition mentorship. 501(c)(3) application filed. Target: 50 veterans mentored by end of 2026', confidence: 80 },
      { user_id: uid, type: 'fact', key: 'property', value: '4-bedroom home in Woodbridge, VA. Bought 2012 for $385K — paid off 2024. Estimated value $680K. Major renovation planned: kitchen, master bath, basement', confidence: 90 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 10330, savings_target: 3000, currency: 'USD' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 10330, savings_target: 3000, currency: 'USD' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 10330, savings_target: 2500, currency: 'USD' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'utilities', amount: 380, description: 'Dominion Energy electricity + gas + Comcast internet + water', expense_date: '2026-05-03', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'food', amount: 850, description: 'Costco + Harris Teeter groceries (family of 2 + regular grandkid visits)', expense_date: '2026-05-05', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'health', amount: 420, description: 'TRICARE supplemental + dental + Linda\'s Medicare gap insurance', expense_date: '2026-05-01', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'transport', amount: 280, description: 'Gas (2 cars: F-150 + Camry) + auto insurance', expense_date: '2026-05-04', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'misc', amount: 3500, description: 'Kitchen renovation contractor payment (milestone 2 of 5)', expense_date: '2026-05-10', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'entertainment', amount: 180, description: 'Golf club quarterly dues + range fees', expense_date: '2026-05-01', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'misc', amount: 250, description: 'VFW Post 1503 annual dues + fundraiser contribution', expense_date: '2026-05-06', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'shopping', amount: 320, description: 'Home improvement supplies (Home Depot — basement project)', expense_date: '2026-05-09', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'travel', amount: 1200, description: '30th anniversary trip deposit — Portugal (Lisbon + Alentejo wine region)', expense_date: '2026-05-08', is_recurring: false, currency: 'USD' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Home renovation complete (kitchen + master bath)', category: 'home', target_amount: 85000, current_amount: 42000, currency: 'USD', target_date: '2026-12-31' },
      { user_id: uid, title: 'Portugal 30th anniversary trip', category: 'vacation', target_amount: 12000, current_amount: 7500, currency: 'USD', target_date: '2026-10-15' },
      { user_id: uid, title: 'Valor to Vocation nonprofit seed fund', category: 'other', target_amount: 50000, current_amount: 18000, currency: 'USD', target_date: '2027-01-01' },
      { user_id: uid, title: 'Grandchildren education fund (529)', category: 'education', target_amount: 100000, current_amount: 35000, currency: 'USD', target_date: '2035-09-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Thrift Savings Plan (TSP) — C Fund + G Fund', type: 'mutual_fund', invested_amount: 620000, current_value: 885000, currency: 'USD', account: 'Federal TSP', notes: 'TSP balance from 30 years of military contributions. 80% C Fund / 20% G Fund. No new contributions (retired)' },
      { user_id: uid, name: 'Vanguard IRA (Rollover)', type: 'etf', invested_amount: 145000, current_value: 198000, currency: 'USD', account: 'Vanguard', notes: 'Rolled over previous civilian stint retirement plan. Target date 2025 fund (now 100% bonds/conservative)' },
      { user_id: uid, name: 'Woodbridge VA Property', type: 'real_estate', invested_amount: 385000, current_value: 680000, currency: 'USD', account: 'Primary residence (paid off)', notes: 'No mortgage since 2024. Not planning to sell — downsizing considered at 65+' },
      { user_id: uid, name: 'Vanguard Taxable — S&P 500 ETF (VOO)', type: 'etf', invested_amount: 95000, current_value: 128000, currency: 'USD', account: 'Vanguard Brokerage', notes: 'Post-retirement wealth building. Linda adds from real estate commissions' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning PT (0530 run or weights)', icon: '🏃', color: 'emerald', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Read news & veteran affairs briefing', icon: '📰', color: 'indigo', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Valor to Vocation mentee check-in', icon: '🤝', color: 'amber', frequency: 'weekly', days_of_week: [2,4], target_per_day: 1 },
      { user_id: uid, name: 'Golf round / practice', icon: '⛳', color: 'cyan', frequency: 'weekly', days_of_week: [6], target_per_day: 1 },
      { user_id: uid, name: 'Renovation progress photo log', icon: '🔨', color: 'rose', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
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
    const ptId = habitIds['Morning PT (0530 run or weights)']
    const newsId = habitIds['Read news & veteran affairs briefing']
    if (ptId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: ptId, date: d, count: 1 }))
    if (newsId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: newsId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Obtain 501(c)(3) approval for Valor to Vocation', category: 'impact', target_date: '2026-09-30', status: 'active', progress_pct: 60, description: 'Filed IRS Form 1023 in March 2026. Expected approval within 6 months' },
      { user_id: uid, title: 'Mentor 50 transitioning veterans by end of 2026', category: 'other', target_date: '2026-12-31', status: 'active', progress_pct: 28, description: 'Currently 14 active mentees. Need partner organizations — approaching SHRM and LinkedIn' },
      { user_id: uid, title: 'Complete PMP Certification (project management)', category: 'skill', target_date: '2026-10-31', status: 'active', progress_pct: 45, description: 'Studying for PMP — aligns with VA consulting work and nonprofit management' },
      { user_id: uid, title: 'Complete kitchen + master bath renovation', category: 'other', target_date: '2026-12-31', status: 'active', progress_pct: 42, description: 'Contractor on schedule. Kitchen milestone 2 complete. Bath starts August' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Linda Williams', email: 'linda.williams@remax.com', group_name: 'family', role: 'Wife — RE/MAX real estate agent', notes: 'Partner in everything. Handles financial records, travel planning. Supports nonprofit fully', strength: 5 },
      { user_id: uid, name: 'Col. James McKinley (Ret.)', group_name: 'friend', email: 'jmckinley@vfw1503.org', role: 'VFW Post Commander', notes: 'Best friend from Army. Co-founder of Valor to Vocation. Golf every Saturday', strength: 5 },
      { user_id: uid, name: 'SFC Marcus Thompson', group_name: 'mentor', email: 'marcust@army.mil', role: 'Active duty — transitioning NCO (mentee)', notes: 'First Valor to Vocation mentee. Exceptional NCO headed to logistics career. Success story', strength: 4 },
      { user_id: uid, name: 'Dr. Patricia Hess', group_name: 'work', email: 'phess@va.gov', role: 'VA Regional Director', notes: 'Client for consulting work. Potential nonprofit partnership for veteran job placement', strength: 3 },
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
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Golf at Woodbridge National. Discussed Valor to Vocation corporate partner outreach strategy', interacted_at: '2026-05-09T09:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Marcus accepted logistics manager position at Amazon — Valor to Vocation first placement success', interacted_at: '2026-05-07T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'meeting', note: 'VA consulting deliverable — PTSD program evaluation report submitted and approved', interacted_at: '2026-05-05T10:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Valor to Vocation corporate outreach deck', notes: 'Pitch to SHRM and LinkedIn Veteran Initiative program', started_at: '2026-05-06T08:00:00Z', ended_at: '2026-05-06T09:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 110, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'VA consulting — PTSD program report final edit', notes: 'Evidence-based recommendations section. Approved by Dr. Hess', started_at: '2026-05-05T09:00:00Z', ended_at: '2026-05-05T11:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'PMP study — Ch. 8 Quality Management', notes: 'Practice questions — 82% pass rate on mock. Exam scheduled Oct 15', started_at: '2026-05-08T19:00:00Z', ended_at: '2026-05-08T19:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Lisbon & Alentejo, Portugal — 30th Anniversary', start_date: '2026-10-18', end_date: '2026-10-28', status: 'booked', budget_total: 12000, currency: 'USD', travellers: 2, notes: 'Linda planned the itinerary. 4 nights Lisbon, 3 nights Évora wine country, 3 nights coastal Comporta' },
      { user_id: uid, destination: 'Gettysburg, PA — History Trip with Grandkids', start_date: '2026-07-04', end_date: '2026-07-06', status: 'planning', budget_total: 1800, currency: 'USD', travellers: 4, notes: 'Independence Day weekend. Teaching grandkids American military history firsthand' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'IAD → LIS (United Airlines UA918)', starts_at: '2026-10-18T18:30:00Z', cost: 2800, notes: 'Business class — Linda\'s treat for the anniversary' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Bairro Alto Hotel Lisbon', starts_at: '2026-10-19T14:00:00Z', ends_at: '2026-10-23T11:00:00Z', cost: 3200, notes: '4 nights — Linda found a rave-reviewed boutique hotel' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Alentejo wine tour — Herdade do Esporão', starts_at: '2026-10-24T10:00:00Z', cost: 280, notes: 'Private tasting and vineyard tour. Pre-booked' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Marcus got the Amazon job. Best day I\'ve had since retirement. That\'s why we built this program', logged_at: '2026-05-07T19:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Good golf round with Jim — 82. Talked through nonprofit next steps. Clear heads make clear plans', logged_at: '2026-05-09T17:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Renovation dust everywhere. Contractor 3 days behind schedule. Staying patient', logged_at: '2026-05-10T19:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'VA report approved. Dr. Hess called to say it\'s the best she\'s seen this year. Good work is good work', logged_at: '2026-05-05T18:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'What the mission looks like now', content: "Marcus texted: 'Sir, I got the Amazon offer. $92K base and full benefits.' I drove to the VFW to tell Jim in person. We are two old soldiers sitting in a parking lot trying not to cry over a logistics manager job. But Marcus was on the edge a year ago — lost, angry, invisible. Now he is employed, purposeful, and calling himself a veteran with pride instead of shame. That is what Valor to Vocation is for.", mood: 5, tags: ['valor-to-vocation', 'purpose', 'veterans', 'mission'], created_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, title: '30 years together', content: "Linda showed me the Portugal itinerary tonight. 11 days, 3 regions, one bottle of Alentejo red per evening. Thirty years ago I was in the Gulf and she was managing two toddlers alone in Fort Bragg housing. We have earned this trip ten times over. She built this family while I served. I keep finding ways to tell her that are not adequate. I will try again in Lisbon.", mood: 5, tags: ['linda', 'marriage', 'gratitude', 'portugal'], created_at: '2026-05-08T21:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Linda planning our anniversary trip', 'VA pension providing security', 'Health to still run PT at 58']
        : gd === '2026-05-09'
        ? ['Marcus landing the Amazon job', 'Jim as lifelong friend and partner', 'Good golf and clear thinking']
        : ['30 years of marriage still strong', 'Grandkids visiting this weekend', 'Woodbridge home paid off']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Begin TSP Required Minimum Distributions (RMDs) now at 58 or delay to 73?',
        category: 'finance', mode: 'analyze',
        options: [{ label: 'Begin withdrawals now voluntarily', pros: ['supplement income', 'Roth conversion opportunity'] }, { label: 'Delay to age 73 (RMD required)', pros: ['tax-deferred growth', 'more compounding'] }],
        result: { summary: 'Delay TSP RMDs — pension + VA + consulting income sufficient. Begin Roth conversion ladder instead for tax efficiency', chosen: 'Delay RMDs + Roth conversion', outcome: 'decided' },
        favorite: true, created_at: '2026-05-06T20:00:00Z'
      },
      {
        user_id: uid, question: 'Should Valor to Vocation seek government grants or rely on corporate sponsorship?',
        category: 'business', mode: 'compare',
        options: [{ label: 'Government grants (DOL, VA)', pros: ['large grants', 'aligned mission'], cons: ['slow', 'bureaucratic reporting'] }, { label: 'Corporate sponsorship', pros: ['faster', 'relationship-based'] }],
        result: { summary: 'Both tracks simultaneously — corporate sponsorship for speed in year 1, government grants for sustainability in year 2', chosen: 'Dual track approach', outcome: 'decided' },
        favorite: false, created_at: '2026-05-09T18:00:00Z'
      },
    ])
  }

  console.log('✅ Robert Williams seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
