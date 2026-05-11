/**
 * Seed all data for Amelia Roberts (E2E persona #29).
 * 31yo Single Parent Elementary School Teacher, Denver, Colorado, USA. USD. ADHD.
 * Run: node tests/e2e-personas/seed-amelia-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'amelia.roberts@e2e-test.handlelifeos.app'
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
    display_name: 'Amelia Roberts',
    occupation: '3rd Grade Teacher — Denver Public Schools (DPS)',
    life_stage: 'early_career',
    country: 'US',
    currency: 'USD',
    timezone: 'America/Denver',
    goals: ['pay off student loans in 5 years', 'save for Lily\'s college fund', 'stop living paycheck to paycheck', 'get promoted to instructional coach'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'income', value: 'DPS teacher salary: $58,200/year ($4,850/month gross, ~$3,680 take-home). Side income: online tutoring via Wyzant ~$600-900/month. Total: ~$4,400-4,500/month', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'family', value: 'Single mom to Lily (7, 2nd grade). Co-parenting with ex-husband Marcus (every other weekend). Amelia\'s mom nearby in Aurora — helps with Lily pickup 3x/week', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'adhd', value: 'Diagnosed ADHD-inattentive type at 28. Takes Vyvanse daily. Uses body-doubling, timers, and written lists to manage lesson planning and admin', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'debt', value: 'Student loans: $44,200 remaining (original $68K from Colorado State University). Income-driven repayment plan ($380/month). Working toward PSLF (Public Service Loan Forgiveness) — 4 years in, 6 more to go', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Tight budget. Meal preps on Sundays. Uses YNAB for budgeting. Drives 2019 Civic (paid off). Parks and free activities with Lily on weekends', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'career', value: 'Instructional coaching role opens in 2027. Would pay $12K more. Working on master\'s degree in Education Leadership (online, University of Denver) — 4 courses remaining', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 4280, savings_target: 200, currency: 'USD' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 4650, savings_target: 300, currency: 'USD' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 4480, savings_target: 250, currency: 'USD' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 1450, description: 'Apartment rent — Westwood neighborhood Denver (2BR, Lily gets the bigger room)', expense_date: '2026-05-01', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'food', amount: 420, description: 'Groceries + meal prep (Trader Joe\'s + King Soopers) + occasional Lily school lunch', expense_date: '2026-05-04', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'bills', amount: 380, description: 'Student loan IDR payment (PSLF track — 4/10 years in)', expense_date: '2026-05-01', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'utilities', amount: 165, description: 'Xcel Energy + Comcast internet + cell phone (T-Mobile)', expense_date: '2026-05-02', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'health', amount: 95, description: 'ADHD medication copay (Vyvanse) + therapy ($50 copay bi-weekly)', expense_date: '2026-05-05', is_recurring: true, currency: 'USD' },
      { user_id: uid, category: 'transport', amount: 120, description: 'Gas (Civic) + occasional Lyft when Lily sleepover runs late', expense_date: '2026-05-06', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'education', amount: 890, description: 'UDenver master\'s course payment (1 course, 8-week term)', expense_date: '2026-05-01', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'entertainment', amount: 85, description: "Lily's activities: Denver Zoo membership + swim class this month", expense_date: '2026-05-08', is_recurring: false, currency: 'USD' },
      { user_id: uid, category: 'shopping', amount: 95, description: 'Classroom supplies (DPS reimburses ~$150/year — spends $600)', expense_date: '2026-05-07', is_recurring: false, currency: 'USD' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: "Lily's 529 College Fund", category: 'education', target_amount: 50000, current_amount: 4200, currency: 'USD', target_date: '2036-09-01' },
      { user_id: uid, title: 'Emergency fund (3 months)', category: 'emergency_fund', target_amount: 13500, current_amount: 4800, currency: 'USD', target_date: '2027-06-30' },
      { user_id: uid, title: 'Summer family road trip with Lily', category: 'vacation', target_amount: 2500, current_amount: 1200, currency: 'USD', target_date: '2026-07-15' },
      { user_id: uid, title: 'Car repair reserve fund', category: 'other', target_amount: 3000, current_amount: 850, currency: 'USD', target_date: '2026-12-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'DPS Teacher Pension (PERA)', type: 'other', invested_amount: 18000, current_value: 22000, currency: 'USD', account: 'Colorado PERA', notes: 'Public Employees Retirement Association — mandatory DPS contribution. Vested after 5 years (Year 4 now)' },
      { user_id: uid, name: 'Roth IRA — Vanguard Target 2055', type: 'mutual_fund', invested_amount: 3200, current_value: 3850, currency: 'USD', account: 'Vanguard', notes: 'Started in 2024. Contributing $100/month when possible. Target date fund at her risk level' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Take Vyvanse + check daily schedule', icon: '💊', color: 'rose', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Lesson plan block (body-doubling timer)', icon: '📚', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Budget check (YNAB)', icon: '💰', color: 'emerald', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
      { user_id: uid, name: 'Reading time with Lily (bedtime)', icon: '📖', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Tutoring session (Wyzant)', icon: '🎓', color: 'violet', frequency: 'weekly', days_of_week: [2,4], target_per_day: 1 },
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
    const medId = habitIds['Take Vyvanse + check daily schedule']
    const readId = habitIds['Reading time with Lily (bedtime)']
    if (medId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: medId, date: d, count: 1 }))
    if (readId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: readId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Complete M.Ed in Education Leadership (UDenver)', category: 'learning', target_date: '2027-05-31', status: 'active', progress_pct: 60, description: '6 of 10 courses complete. 4 remaining. Studying online around Lily\'s schedule — Tuesday/Thursday nights' },
      { user_id: uid, title: 'Apply for Instructional Coach position (DPS 2027)', category: 'role', target_date: '2027-04-01', status: 'active', progress_pct: 35, description: 'M.Ed required for application. Two coaches retiring 2027. Principal endorsement likely given classroom results' },
      { user_id: uid, title: 'Pay off student loans via PSLF (6 years remaining)', category: 'income', target_date: '2032-01-01', status: 'active', progress_pct: 40, description: 'IDR payments made consistently. 4/10 qualifying payments verified. $44K will be forgiven at 10 years' },
      { user_id: uid, title: 'Build $10K emergency fund', category: 'other', target_date: '2027-12-31', status: 'active', progress_pct: 36, description: 'Currently $4,800 of $13,500 target. Contributing $100-200/month depending on tutoring income' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Diane Roberts', email: 'diane.roberts@gmail.com', group_name: 'family', role: 'Mom — Aurora, CO', notes: 'Picks up Lily from school Mon/Wed/Fri. Amelia\'s childcare lifeline. Retired dental hygienist', strength: 5 },
      { user_id: uid, name: 'Jessica Park', group_name: 'friend', email: 'jess.park@dps.k12.co.us', role: '5th Grade Teacher — Denver Public Schools', notes: 'Teacher bestie. Both navigating ADHD + teaching. Body-doubling partner for lesson planning Sundays', strength: 5 },
      { user_id: uid, name: 'Ms. Hernandez', email: 'rhernandez@dps.k12.co.us', group_name: 'mentor', role: 'Principal — Westwood Elementary, DPS', notes: 'Supportive principal — observed Amelia\'s class and praised differentiation strategies. Key for coaching referral', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Sunday Zoom body-doubling session — both finished unit plans for the week. So much more productive together', interacted_at: '2026-05-10T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Ms. Hernandez observed math stations lesson. Said it was "exemplary differentiation." Mentioned coaching track', interacted_at: '2026-05-07T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[0], type: 'call', note: "Mom took Lily to swim class when tutoring ran late. She's a saint", interacted_at: '2026-05-06T17:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: true, task_title: 'Week 3 math unit plan — fractions', notes: 'Body-doubling with Jess on Zoom. Finished differentiated activities for all 3 reading levels', started_at: '2026-05-10T14:00:00Z', ended_at: '2026-05-10T15:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 45, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'UDenver course assignment — Curriculum Design Theory', notes: 'Rough draft done. Need to revise introduction. Due Thursday', started_at: '2026-05-08T21:00:00Z', ended_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 28, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'YNAB monthly budget reconciliation', notes: 'Under budget by $120 in food — tutoring was good this month. Added $50 extra to Lily\'s 529', started_at: '2026-05-04T20:00:00Z', ended_at: '2026-05-04T20:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Rocky Mountain National Park — Summer Road Trip with Lily', start_date: '2026-07-19', end_date: '2026-07-22', status: 'planning', budget_total: 2500, currency: 'USD', travellers: 2, notes: 'Annual tradition: Lily picks one park. She chose RMNP this year. Camping 2 nights to save money' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'transport', title: 'Denver → Estes Park (Amelia driving Civic)', starts_at: '2026-07-19T08:00:00Z', cost: 45, notes: 'Gas money. 1.5 hour drive' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Moraine Park Campground RMNP', starts_at: '2026-07-19T14:00:00Z', ends_at: '2026-07-21T11:00:00Z', cost: 60, notes: '2 nights camping. Reserved via Recreation.gov. Lily loves the tent' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Sprague Lake hike with Lily', starts_at: '2026-07-20T08:00:00Z', cost: 25, notes: 'Easy 1.5mi loop — perfect for a 7-year-old. Park entrance fee' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 4, note: 'Ms. Hernandez said "exemplary" about my math lesson. First time a principal has ever said that', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'ADHD brain would not focus after 4pm. Lesson plans still unfinished at 9pm with Lily asleep', logged_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Body-doubling with Jess worked perfectly — finished the whole unit in 90 mins. Science!', logged_at: '2026-05-10T16:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Lily lost her first tooth! She was so brave. Tooth fairy forgot and Amelia had to slip $5 in at 2am', logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 2, energy: 1, note: 'Paycheck came and I had to make choices again. ADHD makes budgeting feel impossible. YNAB helps but it still hurts', logged_at: '2026-05-04T22:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The tooth fairy forgot', content: "Lily was asleep before 8pm, tooth under her pillow, so proud. By 2am I remembered. I found a crumpled $5 in my coat pocket and tiptoed into her room and she woke up and saw me and I panicked and said 'the tooth fairy told me to put it because she couldn't find parking.' She believed me completely. I don't know whether to feel guilty or proud.", mood: 4, tags: ['Lily', 'motherhood', 'humor', 'parenthood'], created_at: '2026-05-08T23:00:00Z' },
      { user_id: uid, title: 'Why I keep going', content: "Marcus called to ask about Lily's summer schedule. Formal, polite, distant. Then I walked into my classroom and Miguel — the kid who could barely write his name in September — read two paragraphs out loud today. Slowly, carefully, perfectly. That's why. Not for Marcus. Not for the salary. For Miguel and the 21 other reasons I do this job.", mood: 4, tags: ['teaching', 'purpose', 'students', 'resilience'], created_at: '2026-05-06T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Lily\'s first lost tooth moment', 'Miguel reading two paragraphs today', 'Vyvanse making teaching possible']
        : gd === '2026-05-09'
        ? ['Mom picking Lily up without complaint', 'PSLF counting down — 6 more years', 'Roth IRA existing at all on this income']
        : ['Body-doubling with Jess — 90 minutes of focus', 'Lily saying "Mama you\'re the best teacher"', 'Rocky Mountains always visible from Denver']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Drop one UDenver master\'s course this term to reduce stress, or push through and finish on timeline?',
        category: 'career', mode: 'analyze',
        options: [{ label: 'Drop course, reduce stress', pros: ['better mental health', 'more Lily time'], cons: ['extend graduation by 1 semester', 'delay coaching application'] }, { label: 'Push through', pros: ['on track for coaching 2027'], cons: ['burnout risk', 'ADHD overwhelm'] }],
        result: { summary: 'Push through this term only — Ms. Hernandez\'s endorsement window is 2027. Dropping now risks missing it', chosen: 'Push through', outcome: 'decided' },
        favorite: false, created_at: '2026-05-04T21:00:00Z'
      },
      {
        user_id: uid, question: 'Put extra $200 this month into emergency fund vs Lily\'s 529?',
        category: 'finance', mode: 'compare',
        options: [{ label: 'Emergency fund', pros: ['financial security', 'one car repair away from crisis'] }, { label: 'Lily\'s 529', pros: ['time in market', 'state tax deduction'], cons: ['emergency fund still only 35% funded'] }],
        result: { summary: 'Emergency fund until 6 months covered — one surprise bill could derail everything. 529 is long-term and can wait', chosen: 'Emergency fund priority', outcome: 'decided' },
        favorite: true, created_at: '2026-05-04T20:30:00Z'
      },
    ])
  }

  console.log('✅ Amelia Roberts seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
