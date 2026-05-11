/**
 * Seed all data for Arjun Nair (E2E persona #20).
 * 31yo FinTech Founder & CEO (PayEdge), Singapore. SGD. YC S25 alum.
 * Run: node tests/e2e-personas/seed-arjun-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'arjun.nair@e2e-test.handlelifeos.app'
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
    display_name: 'Arjun Nair',
    occupation: 'FinTech Founder & CEO — PayEdge',
    life_stage: 'early_career',
    country: 'SG',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    goals: ['raise Series A (USD 8M)', 'expand to India market', 'hit SGD 5M ARR', 'maintain work-life boundaries'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'company', value: 'PayEdge — B2B cross-border payment infrastructure for Southeast Asian SMEs. 240 clients. ARR: SGD 2.8M', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'yc_batch', value: 'Y Combinator S25 alumnus. YC investment: USD 500K for 7%. Demo Day led to 4 active VC conversations', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'work_style', value: 'Ships every Friday. Weekly all-hands Monday 9am. Prefers async communication via Notion + Slack over meetings', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'background', value: 'From Kochi, Kerala. Studied CS at IIT Bombay, 3 years at Stripe Singapore before founding PayEdge in 2024', confidence: 90 },
      { user_id: uid, type: 'goal', key: 'india_expansion', value: 'India is the next market — RBI Sandbox approval applied for March 2026. Target launch Q4 2026', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Runs in East Coast Park at 6am. Vegetarian (Nair family tradition). Calls parents in Kochi every Sunday', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 14000, savings_target: 3000, currency: 'SGD' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 14000, savings_target: 3500, currency: 'SGD' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 15000, savings_target: 4000, currency: 'SGD' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 3800, description: 'Tanjong Pagar apartment — 1BR', expense_date: '2026-05-01', is_recurring: true, currency: 'SGD' },
      { user_id: uid, category: 'food', amount: 650, description: 'Hawker centres + groceries (Cold Storage) — vegetarian', expense_date: '2026-05-05', is_recurring: false, currency: 'SGD' },
      { user_id: uid, category: 'utilities', amount: 180, description: 'SP Services electricity + internet (StarHub fibre)', expense_date: '2026-05-02', is_recurring: true, currency: 'SGD' },
      { user_id: uid, category: 'transport', amount: 85, description: 'EZ-Link top-up + Grab (client meetings)', expense_date: '2026-05-06', is_recurring: false, currency: 'SGD' },
      { user_id: uid, category: 'health', amount: 120, description: 'Integrated Shield Plan premium (AIA)', expense_date: '2026-05-01', is_recurring: true, currency: 'SGD' },
      { user_id: uid, category: 'education', amount: 480, description: 'AWS Fintech Competency training + Stripe certification', expense_date: '2026-05-08', is_recurring: false, currency: 'SGD' },
      { user_id: uid, category: 'entertainment', amount: 220, description: 'Team dinner (monthly morale event)', expense_date: '2026-05-09', is_recurring: false, currency: 'SGD' },
      { user_id: uid, category: 'travel', amount: 1800, description: 'Jakarta trip — enterprise client onboarding', expense_date: '2026-05-04', is_recurring: false, currency: 'SGD' },
      { user_id: uid, category: 'misc', amount: 350, description: 'Parents Kochi — monthly remittance via PayEdge (dogfooding)', expense_date: '2026-05-01', is_recurring: true, currency: 'SGD' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Emergency fund (4 months)', category: 'emergency_fund', target_amount: 60000, current_amount: 48000, currency: 'SGD', target_date: '2026-09-30' },
      { user_id: uid, title: 'India market launch reserve', category: 'business', target_amount: 120000, current_amount: 35000, currency: 'SGD', target_date: '2026-12-31' },
      { user_id: uid, title: 'Parents\' Kochi house renovation', category: 'home', target_amount: 40000, current_amount: 18000, currency: 'SGD', target_date: '2027-06-30' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'PayEdge Founder Equity (7.5% post-YC)', type: 'other', invested_amount: 0, current_value: 420000, currency: 'SGD', account: 'Founder equity', notes: 'Paper value at YC SAFE valuation cap. Series A will set real price' },
      { user_id: uid, name: 'STI ETF (ES3) — SGX', type: 'etf', invested_amount: 18000, current_value: 21500, currency: 'SGD', account: 'Tiger Brokers', notes: 'Singapore index exposure via regular savings plan' },
      { user_id: uid, name: 'Infosys & Wipro ADR', type: 'stocks', invested_amount: 12000, current_value: 15200, currency: 'SGD', account: 'Tiger Brokers', notes: 'India tech exposure. Emotional connection to Indian IT industry' },
      { user_id: uid, name: 'CPF (Ordinary Account)', type: 'other', invested_amount: 8500, current_value: 8850, currency: 'SGD', account: 'CPF Board', notes: 'Mandatory Singapore CPF contributions since EP. 2.5% on OA' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Early run — East Coast Park', icon: '🏃', color: 'emerald', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Weekly product ship checklist', icon: '🚢', color: 'indigo', frequency: 'weekly', days_of_week: [5], target_per_day: 1 },
      { user_id: uid, name: 'Read fintech & payments news', icon: '📰', color: 'amber', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Sunday call with parents (Kochi)', icon: '📞', color: 'rose', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
      { user_id: uid, name: 'Journaling / weekly reflection', icon: '📓', color: 'violet', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
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
    const runId = habitIds['Early run — East Coast Park']
    const newsId = habitIds['Read fintech & payments news']
    if (runId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: runId, date: d, count: 1 }))
    if (newsId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: newsId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Close Series A — USD 8M', category: 'income', target_date: '2026-12-31', status: 'active', progress_pct: 30, description: 'Term sheets from Sequoia SEA and Jungle Ventures. Due diligence underway' },
      { user_id: uid, title: 'Launch PayEdge India (RBI Sandbox)', category: 'impact', target_date: '2026-12-31', status: 'active', progress_pct: 45, description: 'RBI Regulatory Sandbox application submitted March 2026. Approval expected Q3' },
      { user_id: uid, title: 'Grow to SGD 5M ARR', category: 'income', target_date: '2027-06-30', status: 'active', progress_pct: 56, description: 'Currently SGD 2.8M. 4 enterprise deals closing could add SGD 1.5M' },
      { user_id: uid, title: 'Complete YC Fellowship leadership programme', category: 'skill', target_date: '2026-08-31', status: 'active', progress_pct: 70, description: '5 sessions completed, 2 remaining. Focused on CEO transition from technical founder' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Budi Santoso', email: 'budi@jktimports.co.id', company: 'JKT Imports Indonesia', notes: 'Flagship client — 80 cross-border transactions per month. ARR SGD 48K. Expanding to Malaysia', currency: 'SGD' },
      { user_id: uid, name: 'Priya Chandran', email: 'priya@textilesme.com', company: 'Textiles ME (Singapore SME)', notes: 'India fabric importer. Saves 2.3% vs bank FX on every transaction', currency: 'SGD' },
      { user_id: uid, name: 'Thida Kyaw', email: 'thida@yagonexport.com', company: 'Yangon Export Co.', notes: 'Myanmar client — complex compliance requirements. Piloting new corridor', currency: 'SGD' },
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
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'JKT Imports — Malaysia Corridor Expansion', status: 'active', fee: 72000, currency: 'SGD', notes: 'Expanding existing Indonesia relationship to add MYR payments' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Textiles ME — INR Payment Corridor', status: 'lead', fee: 35000, currency: 'SGD', notes: 'Awaiting RBI sandbox approval to launch India leg' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Yangon Export — MMK Compliance Pilot', status: 'on_hold', fee: 28000, currency: 'SGD', notes: 'Paused pending FATF Myanmar compliance review' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Vikram Anand', group_name: 'investor', email: 'vikram@junglee.vc', role: 'Partner, Jungle Ventures', notes: 'Led YC seed follow-on. Series A lead candidate. Golf once a month', strength: 5 },
      { user_id: uid, name: 'Nadia Osman', group_name: 'mentor', email: 'nadia@stripe.com', role: 'Head of SEA Partnerships, Stripe', notes: 'Former colleague. Invaluable for enterprise client intros. Quarterly dinner', strength: 4 },
      { user_id: uid, name: 'Rajan Nair', email: 'rajan.nair@kochi.home', group_name: 'family', role: 'Father', notes: 'Retired schoolteacher Kochi. Sunday calls. First user of PayEdge for remittances', strength: 5 },
      { user_id: uid, name: 'Siddharth Rao', group_name: 'friend', email: 'siddharth@payedge.sg', role: 'CTO, PayEdge', notes: 'Co-founder and best friend from IIT Bombay. Technical genius, terrible at email', strength: 5 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Series A term sheet discussion — Jungle Ventures leading at USD 28M pre-money. Sequoia countering', interacted_at: '2026-05-08T11:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Stripe API partnership — could co-sell to their enterprise clients in SEA', interacted_at: '2026-05-06T15:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'meeting', note: 'Sprint planning — India gateway architecture. RBI sandbox tech requirements reviewed', interacted_at: '2026-05-07T10:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 115, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Series A data room — financial model', notes: 'Revenue forecast, unit economics, CAC/LTV by corridor', started_at: '2026-05-05T06:30:00Z', ended_at: '2026-05-05T08:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'India RBI sandbox response document', notes: 'Compliance questionnaire — 47 questions. Siddharth handling tech sections', started_at: '2026-05-07T07:00:00Z', ended_at: '2026-05-07T08:30:00Z' },
      { user_id: uid, mode: 'meeting', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'All-hands Monday — Q2 OKR review', notes: 'Team morale high. Malaysia launch on track. Myanmar on hold', started_at: '2026-05-04T09:00:00Z', ended_at: '2026-05-04T10:00:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'San Francisco — YC Founders Summit 2026', start_date: '2026-08-20', end_date: '2026-08-25', status: 'booked', budget_total: 9500, currency: 'SGD', travellers: 1, notes: 'Annual YC alumni summit. Sequoia and Andreessen follow-up meetings scheduled' },
      { user_id: uid, destination: 'Kochi — Parents Visit', start_date: '2026-12-20', end_date: '2027-01-05', status: 'planning', budget_total: 3200, currency: 'SGD', travellers: 1, notes: 'Annual Kerala trip. Working remotely from parents\' home. Sacred downtime' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'SIN → SFO (Singapore Airlines SQ31)', starts_at: '2026-08-20T00:30:00Z', cost: 3800, notes: 'Business class — justified for red-eye to arrive fresh for VC meetings' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Hotel Zetta San Francisco', starts_at: '2026-08-20T15:00:00Z', ends_at: '2026-08-25T11:00:00Z', cost: 3200, notes: '5 nights in SoMa — walking distance from YC venue' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'YC Founders Summit — Fundraising Workshop', starts_at: '2026-08-22T09:00:00Z', cost: 0, notes: 'Session with Dalton & Michael on Series A readiness' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Sequoia Capital meeting — Series A', starts_at: '2026-08-23T14:00:00Z', cost: 0, notes: 'Follow-up from YC Demo Day intro. Partner meeting at Menlo Park' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Jungle Ventures term sheet arrived. Series A is real. Called parents', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Good run this morning. RBI document draining — 47 compliance questions', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Myanmar put on hold by compliance team. Disappointing but right call', logged_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Sunday call with Appa and Amma. They used PayEdge to pay the contractor. Dogfood moment', logged_at: '2026-05-10T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The term sheet call', content: "Vikram called at 11am. Jungle Ventures will lead at USD 28M pre-money — that's more than I asked for. I should have felt joy immediately but I sat in silence for a minute. The company my father thought was 'too risky' is now worth more than his entire lifetime savings. He was worried about me, not wrong to be. I need to call him Sunday and say nothing — just hear his voice.", mood: 5, tags: ['series-A', 'family', 'milestone'], created_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, title: 'Being the bottleneck', content: "The RBI compliance document took 6 hours of my time today. Every question sent to me eventually. I am still the chief problem-solver and I need to stop being that. Siddharth can own technical compliance. I need to own investors and strategy. If I am the bottleneck at 31, what happens at 100 people?", mood: 3, tags: ['leadership', 'delegation', 'scaling'], created_at: '2026-05-07T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Jungle Ventures term sheet', 'Siddharth\'s engineering excellence', 'Singapore ecosystem support']
        : gd === '2026-05-09'
        ? ['Parents proud of PayEdge', 'YC network value', 'Morning runs keeping me grounded']
        : ['Parents using PayEdge for real', 'Strong team execution', 'Kerala heritage that shaped me']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Accept Jungle Ventures Series A term (USD 28M pre) or wait for Sequoia counter?',
        category: 'business', mode: 'compare',
        options: [{ label: 'Accept Jungle Ventures', pros: ['SEA-focused, deeply relevant', 'board seat value', 'speed'] }, { label: 'Wait for Sequoia', pros: ['higher valuation potential', 'global brand'], cons: ['uncertainty', '6-week delay'] }],
        result: { summary: 'Give Sequoia 2 weeks to respond — miss this window and take Jungle at current terms', chosen: '2-week deadline for Sequoia', outcome: 'pending' },
        favorite: true, created_at: '2026-05-08T23:00:00Z'
      },
      {
        user_id: uid, question: 'Hire Head of Compliance (full-time) or use specialist law firm?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Full-time hire', pros: ['institutional knowledge', 'scalable'] }, { label: 'Law firm', pros: ['no equity cost', 'immediate expertise'], cons: ['expensive hourly', 'context lost between matters'] }],
        result: { summary: 'Law firm now, Head of Compliance after Series A closes and India launches', chosen: 'Law firm (Rajah & Tann)', outcome: 'decided' },
        favorite: false, created_at: '2026-05-05T20:00:00Z'
      },
    ])
  }

  console.log('✅ Arjun Nair seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
