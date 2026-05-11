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

const EMAIL = 'jennifer.park@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedJennifer() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Jennifer Park',
    occupation: 'ICU Registered Nurse',
    life_stage: 'mid_career',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    goals: [
      'Complete MSN-NP (Family Nurse Practitioner) program application by Jan 2027',
      'Research memory care facility options for Mom — decision by September 2026',
      'Support Ethan through college application season (Early Decision Nov 2026)',
      'Build a self-care routine that survives 12-hour shift weeks',
      'Build 6-month emergency fund',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 2200, spent: 2200 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 800, spent: 742 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 250, spent: 198 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 400, spent: 400 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 200, spent: 188 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 500, spent: 500 },
    { user_id: uid, month: 5, year: 2026, category: 'misc', amount: 300, spent: 265 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 2200, category: 'rent', description: 'May rent – house, Lakewood OH', expense_date: '2026-05-01' },
      { user_id: uid, amount: 400, category: 'health', description: 'In-home aide for Mom (Sun-Hee) – 8 hrs/week May', expense_date: '2026-05-05' },
      { user_id: uid, amount: 188, category: 'utilities', description: 'Gas + electric May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 85, category: 'misc', description: 'Common App fee – Ethan Ohio State', expense_date: '2026-05-08' },
      { user_id: uid, amount: 55, category: 'misc', description: 'College prep book – SAT Math Workbook for Ethan', expense_date: '2026-05-04' },
      { user_id: uid, amount: 120, category: 'health', description: 'Yoga studio monthly membership (self-care)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 198, category: 'transport', description: 'Gas – commute + Mom appointments', expense_date: '2026-05-10' },
      { user_id: uid, amount: 500, category: 'investment', description: '403(b) + HSA contributions May', expense_date: '2026-05-15' },
    ])
  }

  // Habits
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Self-care Sunday – yoga or bath, no work email', frequency: 'weekly', current_streak: 7, target_streak: 12, started_on: '2026-03-22', category: 'mind' },
      { user_id: uid, name: 'Weekly check-in with Ethan on college apps', frequency: 'weekly', current_streak: 10, target_streak: 20, started_on: '2026-03-01', category: 'family' },
      { user_id: uid, name: 'Mom\'s medication log review (before night shift)', frequency: 'daily', current_streak: 18, target_streak: 30, started_on: '2026-04-18', category: 'family' },
      { user_id: uid, name: 'Journal 10 min after shift', frequency: 'daily', current_streak: 5, target_streak: 14, started_on: '2026-05-04', category: 'mind' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Research MSN-NP programs – Case Western vs. Cleveland State', started_at: '2026-05-09T14:00:00Z', ended_at: '2026-05-09T14:55:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 45, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Review memory care facilities – list for September decision', started_at: '2026-05-06T13:00:00Z', ended_at: '2026-05-06T13:45:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 4) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 2, note: 'Exhausted after three 12-hour shifts. Mom had a hard night. Ethan stressed about SAT scores. Kept it together.', logged_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Self-care Sunday made a real difference. Yoga and a long bath. Felt human again.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Decent day. Mom was calm and recognised me this morning. Those moments are gifts.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Hard. ICU was overwhelming. Came home and Mom was confused and upset. Ethan had a meltdown over an essay. I just needed five minutes alone.', logged_at: '2026-05-05T23:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Ethan showed me his Ohio State essay — it\'s really good', 'Colleague covered for me during a difficult moment on the floor', 'Mom smiled at me this morning — full recognition'] },
    { date: '2026-05-08', items: ['Sunday yoga class — hour where I was just me, not a nurse or caregiver', 'Ethan made dinner without being asked', 'Spring sunlight in the backyard'] },
    { date: '2026-05-07', items: ['Home aide Rosa is so gentle with Mom — trust is everything', 'NP program brochure arrived — this path is real', 'Hot coffee before the shift started'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "I am running on empty and I know it. Three 12-hour shifts, then home to Mom's 2am confusion, then up with Ethan over Common App deadlines. The care coordinator at University Hospitals said 'compassion fatigue is real' like that's news. I know it's real. I live it. What I need is a plan, not a diagnosis of something I already know I have.", mood_tag: 'exhausted', created_at: '2026-05-09T23:00:00Z' },
      { user_id: uid, content: "Ethan's college essay is genuinely good. He wrote about watching me care for Mom and what it taught him about dignity. I cried in the kitchen. He doesn't know how much this family is riding on him having a full life. I want more for him than what I've had to carry. That's the whole point.", mood_tag: 'emotional', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "Looking seriously at the MSN-NP route. Case Western Reserve has a part-time Family NP track for working nurses — 3 years, mostly online. I need to run the numbers. Tuition is $52K. My 403(b) match vests in 18 months. If I start in Jan 2027, Ethan will be in college, which actually frees up some mental bandwidth. Maybe this is the window.", mood_tag: 'planning', created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Start MSN-NP program Jan 2027 (while caregiving) or wait until Mom situation is resolved?',
        options: JSON.stringify([
          { label: 'Start Jan 2027 – Case Western part-time track', pros: ['Window opens when Ethan leaves for college', 'Program takes 3 years – sooner in = sooner done', 'Salary bump +$40K on completion'], cons: ['Juggling school + Mom caregiving + ICU job', '$52K tuition debt risk', 'May need to reduce ICU hours'] },
          { label: 'Wait until Mom situation is stable (2028+)', pros: ['Less immediate overwhelm', 'Cleaner financial picture'], cons: ['2-year delay to higher income', 'Lose momentum on career goal', 'NP need in Ohio remains high either way'] },
        ]),
        result: JSON.stringify({ decision: 'Apply for Jan 2027 start; defer enrollment if Mom placement is not resolved by Oct 2026', reasoning: 'The application process itself is low-risk. Keeping optionality is the right move. Final go/no-go at Thanksgiving.' }),
        mode: 'analyze',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'In-home aide continuing vs. memory care facility for Sun-Hee?',
        options: JSON.stringify([
          { label: 'Continue in-home aide (8 hrs/week)', pros: ['Mom in familiar environment', 'Ethan can still see her daily', 'Lower cost short-term (~$400/mo)'], cons: ['Jennifer absorbs remaining 160 hrs/week of care burden', 'Not sustainable as dementia progresses', 'Safety risk alone overnight'] },
          { label: 'Memory care facility (Broadview Heights, rated 4.5★)', pros: ['24/7 specialist care', 'Safety', 'Jennifer can focus on work and Ethan'], cons: ['$5,200/month – may need Medicaid planning', 'Mom\'s grief at relocation', 'Guilt'] },
        ]),
        result: JSON.stringify({ decision: 'Begin Medicaid asset planning now; target facility placement by Dec 2026', reasoning: 'Current arrangement is not sustainable and is compromising Jennifer\'s health. Medicaid planning needs to start 5+ months before placement.' }),
        mode: 'compare',
        favorite: false,
      },
    ])
  }

  // Investments
  if (await cnt('investments', uid) < 2) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'University Hospitals 403(b) – Target Date 2045', type: 'mutual_fund', invested_amount: 34000, current_value: 38800, account: 'Fidelity 403(b)' },
      { user_id: uid, name: 'HSA – Health Savings Account', type: 'savings', invested_amount: 4200, current_value: 4200, account: 'HSA Bank' },
    ])
  }

  // Contacts
  if (await cnt('contacts', uid) < 3) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Sun-Hee Park', group_name: 'Family', phone: '216-555-0124', notes: 'Mom (78). Moderate-stage dementia. In-home aide Rosa attends Mon-Sat 9am-1pm. Sundowning peaks 5-7pm.' },
      { user_id: uid, name: 'Ethan Park', group_name: 'Family', phone: '216-555-0198', notes: 'Son (17). Senior year. Ohio State Early Decision Nov 2026. SAT 1380. College essay nearly final.' },
      { user_id: uid, name: 'Rosa Mendez', group_name: 'Healthcare', phone: '216-555-0177', notes: 'In-home aide for Sun-Hee. Reliable, gentle, bilingual Korean-English.' },
      { user_id: uid, name: 'Dr. Amanda Cho', group_name: 'Healthcare', email: 'acho@cwru-np.edu', notes: 'MSN-NP program advisor, Case Western Reserve University. Email for application questions.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Apply to MSN Family NP Program (Case Western)', category: 'role', status: 'active', target_date: '2026-12-01', progress_pct: 25, notes: 'Gathering transcripts and references. Application deadline Dec 1 for Jan 2027 start.' },
      { user_id: uid, title: 'Achieve BLS + ACLS re-certification', category: 'skill', status: 'active', target_date: '2026-07-15', progress_pct: 80, notes: 'ACLS renewal workshop booked for June 20.' },
    ])
  }

  // Trip — Ohio State campus visit with Ethan
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Columbus',
      country: 'US',
      starts_on: '2026-09-19',
      ends_on: '2026-09-20',
      budget_total: 400,
      status: 'planning',
      purpose: 'family',
      notes: 'Ohio State campus visit with Ethan before Early Decision deadline. Arrange Mom coverage for the overnight.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'transport', title: 'Drive Cleveland → Columbus (2.5 hrs)', starts_at: '2026-09-19T08:00:00Z', ends_at: '2026-09-19T10:30:00Z', cost: 60 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Ohio State campus tour + admissions info session', starts_at: '2026-09-19T13:00:00Z', ends_at: '2026-09-19T15:30:00Z', cost: 0 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Graduate Columbus (overnight)', starts_at: '2026-09-19T16:00:00Z', ends_at: '2026-09-20T11:00:00Z', cost: 220 },
        { trip_id: trip.id, user_id: uid, type: 'restaurant', title: 'Dinner with Ethan – North High Brewing area (soda + food)', starts_at: '2026-09-19T18:30:00Z', ends_at: '2026-09-19T20:00:00Z', cost: 75 },
      ])
    }
  }

  // AURA profile — Ethan Park (17yo)
  const { count: auraCount } = await sb.from('aura_profiles').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!auraCount) {
    await sb.from('aura_profiles').insert({
      user_id: uid,
      data: {
        full_name: 'Ethan Park',
        date_of_birth: '2008-09-15',
        age: 17,
        school_name: 'Bay Village High School',
        class_grade: 'Grade 12',
        notes: 'Senior year. Ohio State Early Decision Nov 2026. SAT 1380. College essay nearly final. Mom tracking college apps and home aide schedule simultaneously.',
      },
    })
  }

  console.log('✓ Jennifer Park seeded')
}
seedJennifer().catch(e => { console.error(e); process.exit(1) })
