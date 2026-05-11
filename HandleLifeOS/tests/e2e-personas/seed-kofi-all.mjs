/**
 * Seed all data for Kofi Mensah (E2E persona #18).
 * 38yo Secondary School Teacher & Cocoa Farmer, Kumasi, Ghana. GHS.
 * Run: node tests/e2e-personas/seed-kofi-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'kofi.mensah@e2e-test.handlelifeos.app'
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
    display_name: 'Kofi Mensah',
    occupation: 'Secondary School Teacher & Cocoa Farmer',
    life_stage: 'mid_career',
    country: 'GH',
    currency: 'GHS',
    timezone: 'Africa/Accra',
    goals: ['expand cocoa farm to 5 acres', 'become head of department', 'educate children abroad', 'build family house'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'income_sources', value: 'Teaching salary: GHS 4,200/month (GES scale). Cocoa farm (2.5 acres, Juaben area): GHS 8,000-12,000 per harvest (Oct/Nov). Also tutors privately: GHS 500-800/month', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'family', value: 'Married (Abena, nurse). 2 children: Ama (11) and Kweku (8). Mother and 2 siblings in village depend on monthly remittances (~GHS 800)', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'financial_stress', value: 'High inflation stress — GHS has depreciated 35% in 2 years. Prefers USD savings where possible', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'farm_details', value: 'Cocoa farm in Juaben (Ashanti Region). Member of Kuapa Kokoo cooperative. Sells certified fair-trade. GHS 1,200/bag this season', confidence: 90 },
      { user_id: uid, type: 'goal', key: 'family_house', value: 'Building 4-bedroom house in Kumasi. Ongoing project, ~60% complete. Target: 2027', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'tech_use', value: 'Uses MoMo (MTN Mobile Money) for all transactions. First smartphone was in 2021. Prefers simple, clear UX', confidence: 90 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 5100, savings_target: 600, currency: 'GHS' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 4800, savings_target: 500, currency: 'GHS' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 5200, savings_target: 700, currency: 'GHS' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 650, description: 'House rent — Adum, Kumasi', expense_date: '2026-05-01', is_recurring: true, currency: 'GHS' },
      { user_id: uid, category: 'food', amount: 900, description: 'Weekly market (Kumasi Central Market) + provisions', expense_date: '2026-05-03', is_recurring: false, currency: 'GHS' },
      { user_id: uid, category: 'utilities', amount: 280, description: 'ECG electricity + water bill + mobile data', expense_date: '2026-05-02', is_recurring: true, currency: 'GHS' },
      { user_id: uid, category: 'education', amount: 450, description: "Children's school fees (Ama & Kweku) — term payment", expense_date: '2026-05-05', is_recurring: false, currency: 'GHS' },
      { user_id: uid, category: 'transport', amount: 180, description: 'Trotro and taxi to school + farm visits', expense_date: '2026-05-04', is_recurring: false, currency: 'GHS' },
      { user_id: uid, category: 'health', amount: 120, description: 'NHIS top-up + pharmacy for family', expense_date: '2026-05-06', is_recurring: true, currency: 'GHS' },
      { user_id: uid, category: 'misc', amount: 800, description: 'Monthly remittance to mother in Juaben village (MoMo)', expense_date: '2026-05-01', is_recurring: true, currency: 'GHS' },
      { user_id: uid, category: 'misc', amount: 350, description: 'Farm inputs: fertiliser and weed spray (half of monthly)', expense_date: '2026-05-08', is_recurring: false, currency: 'GHS' },
      { user_id: uid, category: 'misc', amount: 200, description: 'Church offering and community contributions', expense_date: '2026-05-03', is_recurring: true, currency: 'GHS' },
      { user_id: uid, category: 'misc', amount: 420, description: 'House construction instalment (roofing materials)', expense_date: '2026-05-10', is_recurring: false, currency: 'GHS' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Complete family house (roofing)', category: 'home', target_amount: 18000, current_amount: 9500, currency: 'GHS', target_date: '2027-06-30' },
      { user_id: uid, title: 'Emergency fund (3 months)', category: 'emergency_fund', target_amount: 15000, current_amount: 4200, currency: 'GHS', target_date: '2027-01-31' },
      { user_id: uid, title: "Ama's university fund", category: 'education', target_amount: 30000, current_amount: 8500, currency: 'GHS', target_date: '2033-09-01' },
      { user_id: uid, title: 'Farm expansion (5 acres)', category: 'other', target_amount: 12000, current_amount: 3800, currency: 'GHS', target_date: '2027-10-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'SSNIT Pension Contributions', type: 'other', invested_amount: 18000, current_value: 22500, currency: 'GHS', account: 'SSNIT', notes: 'Mandatory social security — employer + employee contributions since 2014' },
      { user_id: uid, name: 'MTN MoMo Savings (MoMo Kasa)', type: 'other', invested_amount: 3500, current_value: 3780, currency: 'GHS', account: 'MTN Mobile Money', notes: 'Earns 12% p.a. on locked savings — easy access in emergency' },
      { user_id: uid, name: 'Ghana Cocoa Board Bond', type: 'bonds', invested_amount: 5000, current_value: 5650, currency: 'GHS', account: 'GCB Capital', notes: 'Purchased via cooperative as hedge on cocoa income' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning devotion & prayer', icon: '🙏', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Lesson plan preparation', icon: '📝', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Farm check-in (call or visit)', icon: '🌾', color: 'emerald', frequency: 'weekly', days_of_week: [6], target_per_day: 1 },
      { user_id: uid, name: 'Evening walk with family', icon: '🚶', color: 'cyan', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Budget review (MoMo)', icon: '📊', color: 'violet', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
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
    const prayerId = habitIds['Morning devotion & prayer']
    const lessonId = habitIds['Lesson plan preparation']
    const walkId = habitIds['Evening walk with family']
    if (prayerId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: prayerId, date: d, count: 1 }))
    if (lessonId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: lessonId, date: d, count: 1 }))
    if (walkId) ['2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: walkId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Become Head of Science Department', category: 'role', target_date: '2027-09-01', status: 'active', progress_pct: 50, description: 'Current position: Senior Teacher (12 years). Need to complete M.Ed and internal interview' },
      { user_id: uid, title: "Complete M.Ed (Science Education) — UEW", category: 'learning', target_date: '2027-06-30', status: 'active', progress_pct: 65, description: 'University of Education, Winneba — part-time. 3 courses remaining' },
      { user_id: uid, title: 'Expand cocoa farm to 5 acres', category: 'income', target_date: '2028-10-01', status: 'active', progress_pct: 30, description: 'Current: 2.5 acres. Need GHS 12,000 for land purchase and planting' },
      { user_id: uid, title: 'Obtain Fair-Trade Certified Farmer status', category: 'other', target_date: '2026-12-31', status: 'active', progress_pct: 80, description: 'Already member of Kuapa Kokoo. Final audit scheduled November 2026' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Mr. Emmanuel Asante', group_name: 'work', email: 'easante@ghanaedu.gov.gh', role: 'School Headmaster, Kumasi SHTS', notes: 'Direct supervisor. Supportive of M.Ed pursuit. Writing reference letter for HOD application', strength: 4 },
      { user_id: uid, name: 'Kweku Boateng', group_name: 'friend', email: 'kweku.boateng@gmail.com', role: 'Cooperative Chairman, Kuapa Kokoo', notes: 'Childhood friend. Helps navigate fair-trade certification and farm pricing', strength: 5 },
      { user_id: uid, name: 'Abena Mensah', group_name: 'family', email: 'abena.mensah@gmail.com', role: 'Wife — Nurse, KATH', notes: 'Kumasi Teaching Hospital nurse. Strong support system', strength: 5 },
      { user_id: uid, name: 'Prof. Ofori-Asante', group_name: 'mentor', email: 'oforiasante@uew.edu.gh', role: 'M.Ed Supervisor, UEW', notes: 'Thesis advisor for Education Research Methods. Very encouraging', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Mid-year performance review. Headmaster confirmed recommending me for HOD vacancy in September', interacted_at: '2026-05-07T12:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Farm cooperative update — COCOBOD price floor stays at GHS 1,200/bag. Planning Nov harvest logistics', interacted_at: '2026-05-09T18:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'call', note: 'Chapter 4 feedback received. 2 revisions needed. Thesis on track for December submission', interacted_at: '2026-05-06T16:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'M.Ed thesis — Chapter 4 revision', notes: 'Data analysis section on STEM pedagogy in rural Ghana', started_at: '2026-05-06T20:00:00Z', ended_at: '2026-05-06T21:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 60, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'WASSCE revision lessons — Biology paper 3', notes: 'Prepared mock exam questions for Form 3', started_at: '2026-05-08T05:30:00Z', ended_at: '2026-05-08T06:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 25, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Farm budget planning — November harvest prep', notes: 'Estimated inputs needed and projected MoMo savings', started_at: '2026-05-10T19:00:00Z', ended_at: '2026-05-10T19:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Accra — GES Regional Education Conference', start_date: '2026-07-14', end_date: '2026-07-16', status: 'planning', budget_total: 1800, currency: 'GHS', travellers: 1, notes: 'Ghana Education Service annual conference. School pays registration, I cover transport' },
      { user_id: uid, destination: 'Juaben Farm — Harvest Season Visit', start_date: '2026-11-01', end_date: '2026-11-03', status: 'planning', budget_total: 600, currency: 'GHS', travellers: 3, notes: 'Family trip for cocoa harvest. Kids see the farm and learn' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'transport', title: 'STC bus Kumasi → Accra', starts_at: '2026-07-14T06:00:00Z', cost: 180, notes: 'Book early — fills fast' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'GES Guest House, Accra', starts_at: '2026-07-14T14:00:00Z', ends_at: '2026-07-16T10:00:00Z', cost: 420, notes: 'Subsidised accommodation for conference delegates' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'GES Regional Conference — STEM session', starts_at: '2026-07-15T08:00:00Z', cost: 0, notes: 'Presenting poster: "Improving WASSCE pass rates in rural schools"' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Headmaster confirmed HOD recommendation. Been waiting 3 years for this', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Tired after marking 60 scripts. But Ama came second in class — so proud', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Electricity bill went up again. Cedi keeps falling. Inflation is a real problem', logged_at: '2026-05-03T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Church service was uplifting. Reminded me what matters — family, faith, purpose', logged_at: '2026-05-10T19:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Farm cooperative meeting — fair-trade audit is next, and I am ready', logged_at: '2026-05-09T19:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The price of raising children right', content: "Ama's school fees went up 18% this term. Kweku will need a new uniform before long. Some of my colleagues have given up educating their children in private schools. I refuse. Education is the one inheritance that can never be taken. Everything I do — the farm, the tutoring, the M.Ed — is for them. God willing, they will have it easier than I did.", mood: 4, tags: ['family', 'education', 'sacrifice'], created_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, title: 'Holding two worlds', content: 'Sometimes I wonder what my students would think if they knew their biology teacher spent Saturday knee-deep in cocoa leaves checking for capsid damage. But I am not ashamed. My grandfather farmed this land. It connects me to who I am. And the income has kept this family afloat when the teaching salary stretched thin.', mood: 4, tags: ['identity', 'farming', 'teaching', 'heritage'], created_at: '2026-05-09T21:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Good health for the whole family', 'Chapter 4 feedback received', 'Students passing WASSCE mocks']
        : gd === '2026-05-09'
        ? ['Fair-trade audit on track', 'Kweku aced his maths test', 'Cooperative community support']
        : ['Sunday church and rest', "Ama's academic ambition", 'Rain on the farm this week']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Should I take a bank loan (GHS 15,000 at 28% p.a.) to finish the house roofing now or save for 18 months?',
        category: 'finance', mode: 'analyze',
        options: [{ label: 'Take bank loan', pros: ['complete house now', 'end rental cost'], cons: ['28% interest', 'monthly repayment stress'] }, { label: 'Save 18 months', pros: ['no debt', 'peace of mind'], cons: ['continue paying rent', 'inflation risk on materials'] }],
        result: { summary: 'Take loan but negotiate down to 24% via GCB — rental cost vs interest roughly equal, but owning the house ends the cycle', chosen: 'Negotiate bank loan', outcome: 'pending' },
        favorite: true, created_at: '2026-05-08T21:00:00Z'
      },
      {
        user_id: uid, question: 'Apply for HOD position or wait another year to strengthen M.Ed thesis?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Apply now with Headmaster support', pros: ['timing is right', 'headmaster backing'] }, { label: 'Wait until M.Ed complete', pros: ['stronger credentials'], cons: ['another year at same grade'] }],
        result: { summary: 'Apply now — Headmaster recommendation carries weight, M.Ed near completion is sufficient', chosen: 'Apply September 2026', outcome: 'decided' },
        favorite: false, created_at: '2026-05-07T22:00:00Z'
      },
    ])
  }

  console.log('✅ Kofi Mensah seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
