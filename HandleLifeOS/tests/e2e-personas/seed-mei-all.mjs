/**
 * Seed all data for Mei Chen (E2E persona #21).
 * 28yo PhD Researcher (Materials Science), University of Edinburgh, UK. GBP.
 * Run: node tests/e2e-personas/seed-mei-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'mei.chen@e2e-test.handlelifeos.app'
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
    display_name: 'Mei Chen',
    occupation: 'PhD Researcher — Materials Science (Graphene & 2D Materials)',
    life_stage: 'student',
    country: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    goals: ['submit PhD thesis by December 2026', 'secure postdoc in US or EU', 'publish 2 first-author papers', 'build emergency savings'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'phd_topic', value: 'PhD thesis: "Defect engineering in graphene heterostructures for energy storage applications". Supervisor: Prof. Alastair Reid', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'income', value: 'EPSRC stipend: £19,200/year (£1,600/month). No other income. Supplemented by occasional lab demonstrating (£12/hr)', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'background', value: 'Born Shenzhen, China. BSc Physics, Peking University. Moved to Edinburgh 2022. British PR via Skilled Worker route (post-PhD plan)', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Frugal by necessity and habit. Cooks all meals at home, cycles everywhere, uses university library over Amazon. Yoga 3x/week', confidence: 90 },
      { user_id: uid, type: 'goal', key: 'postdoc', value: 'Target: MIT Media Lab or ETH Zürich postdoc in nanomaterials. Applications due October 2026', confidence: 80 },
      { user_id: uid, type: 'preference', key: 'communication', value: 'Weekly supervisor meeting Thursdays 10am. Collaborates with lab team in shared Notion. Calls parents in Shenzhen weekly via WeChat', confidence: 85 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 1600, savings_target: 150, currency: 'GBP' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 1600, savings_target: 150, currency: 'GBP' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 1720, savings_target: 200, currency: 'GBP' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 650, description: 'Shared flat — Marchmont, Edinburgh (3 flatmates)', expense_date: '2026-05-01', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'food', amount: 180, description: 'Weekly Lidl shop + Chinese supermarket (Cantonese cooking)', expense_date: '2026-05-04', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'utilities', amount: 65, description: 'Share of electricity, broadband, council tax', expense_date: '2026-05-02', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'transport', amount: 0, description: 'Cycle to university — no transport cost', expense_date: '2026-05-05', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'health', amount: 18, description: 'Yoga studio (concessionary rate for students)', expense_date: '2026-05-01', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'education', amount: 45, description: 'Conference registration — RSC Chemistry Poster Session', expense_date: '2026-05-07', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'entertainment', amount: 25, description: 'Edinburgh Fringe early-bird tickets + book (secondhand)', expense_date: '2026-05-10', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'misc', amount: 80, description: 'WeChat transfer to parents Shenzhen (birthday gift)', expense_date: '2026-05-06', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'bills', amount: 12, description: 'Phone SIM (GiffGaff, data-only)', expense_date: '2026-05-01', is_recurring: true, currency: 'GBP' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Emergency fund (2 months stipend)', category: 'emergency_fund', target_amount: 3200, current_amount: 1850, currency: 'GBP', target_date: '2026-12-31' },
      { user_id: uid, title: 'Postdoc relocation fund', category: 'vacation', target_amount: 2500, current_amount: 800, currency: 'GBP', target_date: '2027-03-31' },
      { user_id: uid, title: 'Visit parents in Shenzhen (Christmas)', category: 'vacation', target_amount: 900, current_amount: 550, currency: 'GBP', target_date: '2026-12-15' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Stocks & Shares ISA — Vanguard LifeStrategy 80', type: 'mutual_fund', invested_amount: 3500, current_value: 3920, currency: 'GBP', account: 'Vanguard UK', notes: 'Started in 2024 — contributes £100/month when possible. ISA allowance £20K/year never used fully' },
      { user_id: uid, name: 'NS&I Premium Bonds', type: 'bonds', invested_amount: 1000, current_value: 1000, currency: 'GBP', account: 'NS&I', notes: 'Prize-linked savings. No guaranteed return but 100% capital safe' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning yoga (30 min)', icon: '🧘', color: 'emerald', frequency: 'daily', days_of_week: [1,3,5], target_per_day: 1 },
      { user_id: uid, name: 'Read one research paper', icon: '📄', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Thesis writing block (2 hours)', icon: '✍️', color: 'violet', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Cycle commute (no shortcuts)', icon: '🚴', color: 'cyan', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'WeChat call parents (Shenzhen)', icon: '📞', color: 'rose', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
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
    const paperId = habitIds['Read one research paper']
    const thesisId = habitIds['Thesis writing block (2 hours)']
    const cycleId = habitIds['Cycle commute (no shortcuts)']
    if (paperId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: paperId, date: d, count: 1 }))
    if (thesisId) ['2026-05-04','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: thesisId, date: d, count: 1 }))
    if (cycleId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: cycleId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Submit PhD thesis', category: 'role', target_date: '2026-12-15', status: 'active', progress_pct: 70, description: 'Chapters 1-3 complete and reviewed. Chapter 4 (results) in draft. Conclusion TBD' },
      { user_id: uid, title: 'Publish 2nd first-author paper (Nature Materials)', category: 'impact', target_date: '2026-09-30', status: 'active', progress_pct: 55, description: 'Defect engineering paper. Under review at Nature Materials since March 2026' },
      { user_id: uid, title: 'Apply to MIT and ETH postdoc positions', category: 'learning', target_date: '2026-10-31', status: 'active', progress_pct: 20, description: '3 target labs identified. Need 3 reference letters — supervisor plus 2 collaborators' },
      { user_id: uid, title: 'Present at MRS Fall Meeting (Boston)', category: 'skill', target_date: '2026-11-30', status: 'active', progress_pct: 40, description: 'Abstract submitted — 12-minute oral presentation on graphene defect mapping' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Prof. Alastair Reid', group_name: 'mentor', email: 'a.reid@ed.ac.uk', role: 'PhD Supervisor — School of Physics, UoE', notes: 'Brilliant but brutally honest. Weekly Thursday meetings. Writing Nature Materials rec letter', strength: 4 },
      { user_id: uid, name: 'Dr. Yuki Tanaka', group_name: 'mentor', email: 'y.tanaka@mit.edu', role: 'Postdoc Mentor — MIT Nanoscience Lab', notes: 'Connected via MRS conference 2025. Key target for MIT postdoc recommendation', strength: 3 },
      { user_id: uid, name: 'Priya Krishnamurthy', group_name: 'friend', email: 'priya.k@ed.ac.uk', role: 'Fellow PhD researcher, UoE (Chemistry)', notes: 'Best friend in Edinburgh. Study sessions, coffee, mental health check-ins', strength: 5 },
      { user_id: uid, name: 'Chen Wei', email: 'wei.chen@shenzhen.cn', group_name: 'family', role: 'Father', notes: 'Retired engineer. Proud but occasionally anxious about academic career stability. Weekly WeChat', strength: 5 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Weekly supervisor meeting — Chapter 4 draft feedback. Results section needs more statistical analysis', interacted_at: '2026-05-07T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Library study session — both working on theses. Helped each other through a tough writing day', interacted_at: '2026-05-08T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'message', note: 'Emailed Dr. Tanaka regarding MIT postdoc application timeline and research fit', interacted_at: '2026-05-09T11:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 105, completed: true, abandoned: false, body_doubling_enabled: true, task_title: 'Chapter 4 — statistical analysis (ANOVA)', notes: 'Library body-doubling with Priya. Completed defect density analysis', started_at: '2026-05-08T10:00:00Z', ended_at: '2026-05-08T12:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Write MRS abstract — 250 words', notes: 'Graphene defect mapping via scanning tunnelling microscopy', started_at: '2026-05-06T09:00:00Z', ended_at: '2026-05-06T10:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 20, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'Thesis Chapter 4 discussion section', notes: 'Could not concentrate — supervisor feedback created anxiety spiral. Stepped away', started_at: '2026-05-07T14:00:00Z', ended_at: '2026-05-07T14:20:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Boston — MRS Fall Meeting 2026', start_date: '2026-11-28', end_date: '2026-12-04', status: 'planning', budget_total: 1800, currency: 'GBP', travellers: 1, notes: 'University covering £1,200. Self-funding gap. Oral presentation accepted' },
      { user_id: uid, destination: 'Shenzhen — Family Christmas Visit', start_date: '2026-12-18', end_date: '2027-01-05', status: 'planning', budget_total: 900, currency: 'GBP', travellers: 1, notes: 'Annual family trip. Saving £100/month from stipend for flights' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'EDI → BOS (via LHR, British Airways)', starts_at: '2026-11-28T07:30:00Z', cost: 620, notes: 'Economy — cheapest fare found so far' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Marriott Copley Place Boston', starts_at: '2026-11-28T19:00:00Z', ends_at: '2026-12-04T11:00:00Z', cost: 720, notes: 'Conference hotel — sharing room with Priya to split cost' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Oral presentation — graphene defect mapping', starts_at: '2026-12-01T10:00:00Z', cost: 0, notes: 'Session IV-B: 2D Materials and Applications. 12-minute slot' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 2, energy: 1, note: 'Supervisor meeting hard today. He said Chapter 4 needs complete rewrite of stats section. Felt crushed', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Library study with Priya helped so much. Got 2 hours of solid work done. Body-doubling is real', logged_at: '2026-05-08T19:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'MRS abstract submitted. Small win. PhD feels endless some days', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Dr. Tanaka replied to my email! He would be happy to discuss MIT postdoc possibility', logged_at: '2026-05-09T18:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Sunday call with Baba and Mama. They worry but they are proud. That matters more than anything', logged_at: '2026-05-10T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The weight of "not enough"', content: "Professor Reid said the statistics section needs to be redone. Not revised — redone. I sat in the corridor outside his office for ten minutes trying not to cry. Then I went to the lab, opened R, and started the ANOVA from scratch. I do not know if I am built for this. I know I cannot quit. Both things are true at once.", mood: 2, tags: ['phd', 'struggle', 'resilience', 'imposter-syndrome'], created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, title: 'Dr. Tanaka replied', content: "He replied in 4 hours. Said my graphene defect paper was 'impressive work for a third-year PhD' and would be happy to arrange a video call. MIT. I made tea and sat very still for a while. I moved from Shenzhen to Edinburgh with one suitcase and a scholarship. My parents were scared. I was terrified. This email is why.", mood: 5, tags: ['postdoc', 'MIT', 'hope', 'family'], created_at: '2026-05-09T19:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Priya always showing up', 'EPSRC stipend covering basics', 'Edinburgh beauty (even in rain)']
        : gd === '2026-05-09'
        ? ['Dr. Tanaka reply — MIT possibility', 'Thesis is 70% written', 'Yoga keeping me sane']
        : ['Parents call and their pride', 'Strong cup of tea and a finished chapter', 'Free bicycle that gets me everywhere']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'MIT postdoc vs ETH Zürich — which to prioritise in applications?',
        category: 'career', mode: 'compare',
        options: [{ label: 'MIT (Boston)', pros: ['Dr. Tanaka fit', 'top-ranked', 'US networking'] }, { label: 'ETH Zürich', pros: ['Europe lifestyle', 'Switzerland visa easier', 'family closer'] }],
        result: { summary: 'Apply to both. Prioritise MIT application first given Dr. Tanaka contact; ETH as strong backup', chosen: 'Apply to both — MIT first', outcome: 'decided' },
        favorite: true, created_at: '2026-05-09T21:00:00Z'
      },
      {
        user_id: uid, question: 'Submit Chapter 4 with current stats or delay for complete reanalysis?',
        category: 'other', mode: 'analyze',
        options: [{ label: 'Delay and reanalyse', pros: ['stronger chapter', 'supervisor satisfied'], cons: ['3 weeks delay to thesis'] }, { label: 'Patch current stats', pros: ['faster'], cons: ['supervisor will notice, reject again'] }],
        result: { summary: 'Full reanalysis is unavoidable — doing it properly saves more time than patching', chosen: 'Full reanalysis', outcome: 'decided' },
        favorite: false, created_at: '2026-05-07T23:00:00Z'
      },
    ])
  }

  console.log('✅ Mei Chen seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
