// Devika Goldberg-Iyer — Hindu-Jewish interfaith, Mumbai India. Senior Architect.
// Dual religious calendar: Hindu (Diwali, Navratri, Holi) + Jewish (Shabbat, Pesach, Sukkot).
// Kosher-vegetarian diet (no pork, no shellfish, no meat — pure vegetarian covers both traditions).
// Shabbat-aware habits: Fri sunset–Sat sunset REST habit is non-punitive (weekly, not tracked as streak-breaker).
// Children: Maya (9) and Rohan (5) referenced in contacts and journal.
// Elder care: Father (post-stroke) referenced in contacts and journal.
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

const EMAIL = 'devika.goldberg-iyer@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedDevika() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Devika Goldberg-Iyer',
    occupation: 'Senior Architect',
    life_stage: 'mid_career',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: [
      'Establish own architecture practice by 2028 (Goldberg-Iyer Design Studio)',
      'Support Baba\'s full recovery from stroke through best available rehabilitation',
      'Create meaningful Hindu-Jewish family rituals that Maya and Rohan carry forward',
      'Complete Mumbai home purchase by December 2026',
      'Achieve GRIHA 4-star rating on current residential project',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — combined family income INR 720K/month
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 85000, spent: 85000 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 40000, spent: 36800 },
    { user_id: uid, month: 5, year: 2026, category: 'education', amount: 60000, spent: 60000 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 45000, spent: 42000 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 20000, spent: 18500 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 25000, spent: 18000 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 180000, spent: 180000 },
    { user_id: uid, month: 5, year: 2026, category: 'misc', amount: 30000, spent: 24000 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — family, interfaith, dual culture context
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 85000, category: 'rent', description: 'May rent – Bandra West apartment (4BHK, joint family)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 38000, category: 'education', description: 'Maya & Rohan school fees – Cathedral & John Connon School (May)', expense_date: '2026-05-03' },
      { user_id: uid, amount: 22000, category: 'education', description: 'Maya Hebrew lessons – Keneseth Eliyahoo Synagogue programme (term fee)', expense_date: '2026-05-04' },
      { user_id: uid, amount: 42000, category: 'health', description: 'Baba\'s physiotherapy – neuro-rehab 3x/week (Dr. Kulkarni clinic)', expense_date: '2026-05-08' },
      { user_id: uid, amount: 18500, category: 'utilities', description: 'Electricity (AC intensive) + internet + maintenance society', expense_date: '2026-05-03' },
      { user_id: uid, amount: 8000, category: 'misc', description: 'Shabbat candles, kiddush wine (kosher-certified), Shabbat table linens May', expense_date: '2026-05-02' },
      { user_id: uid, amount: 16000, category: 'misc', description: 'Synagogue donation (Keneseth Eliyahoo) + temple donation (Siddhivinayak)', expense_date: '2026-05-09' },
      { user_id: uid, amount: 180000, category: 'investment', description: 'Monthly SIP + home purchase down-payment fund + gold savings', expense_date: '2026-05-15' },
    ])
  }

  // Habits — dual religious practice, Shabbat-aware (Shabbat is weekly rest, non-punitive)
  if (await cnt('habits', uid) < 5) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Morning prayer – Shacharit + Ganesh vandana (dual tradition, 20 min)', frequency: 'daily', current_streak: 38, target_streak: 60, started_on: '2026-03-30', category: 'mind' },
      { user_id: uid, name: 'Shabbat rest – phone and laptop off Friday sunset to Saturday sunset', frequency: 'weekly', current_streak: 12, target_streak: 52, started_on: '2026-02-14', category: 'mind' },
      { user_id: uid, name: 'Family Shabbat dinner – Friday evening (candle lighting, blessings, full table)', frequency: 'weekly', current_streak: 12, target_streak: 52, started_on: '2026-02-14', category: 'family' },
      { user_id: uid, name: 'Baba check-in call (morning, before school run)', frequency: 'daily', current_streak: 24, target_streak: 30, started_on: '2026-04-14', category: 'family' },
      { user_id: uid, name: 'Architecture portfolio update – Saturday post-Shabbat (weekly)', frequency: 'weekly', current_streak: 8, target_streak: 20, started_on: '2026-03-14', category: 'work' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'GRIHA 4-star documentation – Worli residential project (Phase 2)', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T11:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Home purchase research – Bandra West vs. Juhu pricing comparison', started_at: '2026-05-07T14:00:00Z', ended_at: '2026-05-07T15:25:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Draft: own practice business plan outline (2028 launch)', started_at: '2026-05-05T19:00:00Z', ended_at: '2026-05-05T19:55:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Shabbat was peaceful. Maya lit the candles herself for the first time. Aaron cried. I cried. Rohan thought it was funny.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Long project meeting. Baba\'s physio report mixed — progress but slow. Holding steady.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Rohan asked about Diwali AND Hanukkah in the same breath — which one is bigger? Both, I said. He accepted that completely.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Home purchase meeting with broker. Numbers are challenging but not impossible with the down-payment fund by December.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'GRIHA documentation submitted. Good day\'s work. Maya had a happy day at school. Baba walked three steps unaided.', logged_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Gratitude entries — dual religious festivals, family moments
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Maya lit Shabbat candles herself — this tradition is taking root', 'GRIHA documentation complete — 4-star rating on track', 'Aaron and I cooked together tonight — rare luxury'] },
    { date: '2026-05-08', items: ['Baba spoke clearly for 10 minutes this morning — progress', 'Rohan recited the Shema before bed — Aaron\'s expression', 'Project team delivered on deadline — reliable people'] },
    { date: '2026-05-07', items: ['Shabbat was truly restful — phone off all day', 'Maya asked intelligent questions about why we light 8 candles (Hanukkah) vs. 2 (Shabbat)', 'Evening at home with the whole family around the table'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — interfaith family life, architecture, elder care
  if (await cnt('journal_entries', uid) < 4) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Maya asked me tonight why we do both Navratri fasting and Pesach seder. I said: because both traditions teach us to remember something important — one remembers the goddess and the triumph of good, one remembers slavery and the courage to leave it. She thought about that. Then she said: 'So we remember twice.' Exactly.", mood_tag: 'joyful', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "Baba walked three steps without support today. The physio says he's ahead of schedule for someone 8 weeks post-stroke. We are cautiously hopeful. Aaron and I have discussed the option of dedicated live-in nursing care vs. extending the physio-heavy approach. The conversation is hard but necessary.", mood_tag: 'hopeful', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "The Worli project is the most technically complex I've run. GRIHA 4-star on a luxury residential tower requires passive cooling design that the client initially resisted. I brought data — 22% operational energy saving projection — and they came around. The architecture has to argue its own case. That's what I love about this work.", mood_tag: 'engaged', created_at: '2026-05-05T22:00:00Z' },
      { user_id: uid, content: "Aaron asked if I worry that Maya and Rohan will feel split between two traditions. I said the opposite — I think they'll feel doubled. Two Diwalis, two Passovers, two sets of grandparents with different prayers and similar values. Abundance, not confusion. That's the theory. We're testing it in real time.", mood_tag: 'reflective', created_at: '2026-05-03T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Buy flat in Bandra West vs. Juhu for family home purchase?',
        options: JSON.stringify([
          { label: 'Bandra West (current rental area)', pros: ['Children\'s school 8 min walk', 'Keneseth Eliyahoo synagogue 15 min', 'Community established', 'Aaron\'s office 20 min'], cons: ['INR 4.8–5.2 Cr for 4BHK', '15% above Juhu on per-sqft', 'Limited new inventory'] },
          { label: 'Juhu', pros: ['INR 3.8–4.2 Cr for same size', '30% cheaper', 'Beach proximity'], cons: ['School commute 35 min', 'Synagogue 40 min', 'New community to build', 'Aaron\'s commute longer'] },
        ]),
        result: JSON.stringify({ decision: 'Bandra West — prioritise community and school proximity over price saving', reasoning: 'Children\'s school and synagogue proximity are non-negotiable for the interfaith family life we\'ve built. The INR 80L premium buys daily convenience, Maya\'s bat mitzvah prep logistics, and community continuity.' }),
        mode: 'compare',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Live-in nursing aide for Baba vs. continuing intensive physio-only care?',
        options: JSON.stringify([
          { label: 'Continue physio-heavy approach (3 sessions/week)', pros: ['Baba prefers independence', 'Progress is measurable', 'No lifestyle disruption for him'], cons: ['Daytime gap between sessions', 'Fall risk in gaps', 'Devika and Amma managing check-ins manually'] },
          { label: 'Add live-in nursing aide (12-hr coverage)', pros: ['24-hr safety monitoring', 'Consistent care', 'Relief for Amma'], cons: ['Baba\'s resistance — values privacy', 'INR 45K/month additional cost', 'Finding the right person takes time'] },
        ]),
        result: JSON.stringify({ decision: 'Introduce part-time aide (8am–6pm) as intermediate step with Baba\'s agreement', reasoning: 'Full live-in rejected by Baba. Part-time covers highest-risk hours and respects his autonomy. Re-evaluate at 3-month physio milestone in August.' }),
        mode: 'analyze',
        favorite: false,
      },
    ])
  }

  // Investments — gold (Hindu tradition), SIP, property fund
  if (await cnt('investments', uid) < 3) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Sovereign Gold Bond – SGB 2024-VIII', type: 'gold', invested_amount: 480000, current_value: 524000, account: 'HDFC Bank Demat' },
      { user_id: uid, name: 'Mirae Asset Large & Midcap Fund – SIP', type: 'mutual_fund', invested_amount: 960000, current_value: 1080000, account: 'Mirae Asset MF' },
      { user_id: uid, name: 'Home Purchase Down-Payment Fund', type: 'savings', invested_amount: 2400000, current_value: 2400000, account: 'HDFC Fixed Deposit (FD)' },
    ])
  }

  // Contacts — family, elder care, synagogue, school
  if (await cnt('contacts', uid) < 6) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Aaron Goldberg', group_name: 'Family', phone: '022-555-0111', notes: 'Husband. Software architect at ThoughtWorks Mumbai. INR 480K/month. Handles Hebrew education and synagogue coordination.' },
      { user_id: uid, name: 'Maya Goldberg-Iyer', group_name: 'Family', notes: 'Daughter, 9. Cathedral School Class 4. Bat mitzvah prep started at Keneseth Eliyahoo. Curious about both traditions.' },
      { user_id: uid, name: 'Rohan Goldberg-Iyer', group_name: 'Family', notes: 'Son, 5. Cathedral School KG. Loves Ganesh puja and reciting Shema. Energetic and joyful.' },
      { user_id: uid, name: 'Baba (Krishnamurthy Iyer)', group_name: 'Family', phone: '044-555-0155', notes: 'Father, 68. Post-stroke (March 2026). Physiotherapy at Dr. Kulkarni clinic 3x/week. Lives in Chennai — Amma primary caregiver. Daily morning call.' },
      { user_id: uid, name: 'Dr. Priya Kulkarni', group_name: 'Healthcare', phone: '022-555-0188', notes: 'Neurophysio, Hinduja Hospital. Baba\'s recovery. Next review August 2026.' },
      { user_id: uid, name: 'Rabbi Shmueli Cohen', group_name: 'Religious community', notes: 'Keneseth Eliyahoo Synagogue, Kala Ghoda. Maya\'s bat mitzvah instructor. Annual Pesach seder host.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Launch Goldberg-Iyer Design Studio (own practice)', category: 'role', status: 'active', target_date: '2028-01-01', progress_pct: 20, notes: 'Business plan drafted. Current employer exit strategy being developed. 2 anchor clients identified.' },
      { user_id: uid, title: 'GRIHA 4-star certification for Worli Residence project', category: 'impact', status: 'active', target_date: '2026-09-30', progress_pct: 70, notes: 'Documentation submitted. Site inspection scheduled July 15. Passive cooling data strong.' },
    ])
  }

  // Trips — family Pesach trip to Kochi (Jewish heritage + Kerala)
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Kochi (Cochin)',
      country: 'IN',
      starts_on: '2027-04-02',
      ends_on: '2027-04-07',
      budget_total: 180000,
      status: 'planning',
      purpose: 'family',
      notes: 'Pesach 2027 family trip. Synagogue Lane Mattancherry (Paradesi Synagogue — oldest active in Commonwealth). Seder night at Chabad Kochi. Kerala Jewish heritage for Maya and Rohan. Hindu temple visits in Fort Kochi included.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'flight', title: 'Mumbai → Kochi (IndiGo, family of 4)', starts_at: '2027-04-02T07:00:00Z', ends_at: '2027-04-02T08:45:00Z', cost: 42000 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Brunton Boatyard Heritage Hotel, Fort Kochi', starts_at: '2027-04-02T14:00:00Z', ends_at: '2027-04-07T11:00:00Z', cost: 95000 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Paradesi Synagogue + Synagogue Lane tour, Mattancherry', starts_at: '2027-04-03T10:00:00Z', ends_at: '2027-04-03T12:30:00Z', cost: 1000 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Pesach Seder night – Chabad Kochi (family registration)', starts_at: '2027-04-02T18:30:00Z', ends_at: '2027-04-02T22:00:00Z', cost: 8000 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Ernakulam Shiva Temple + Chinese Fishing Nets + Backwater cruise', starts_at: '2027-04-04T09:00:00Z', ends_at: '2027-04-04T17:00:00Z', cost: 4500 },
      ])
    }
  }

  // Meal plans — kosher-vegetarian (no pork, no shellfish, pure vegetarian)
  if (await cnt('meal_plans', uid) < 4) {
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'breakfast', title: 'Masala oats with almonds and banana', calories: 380, notes: 'Pareve, vegetarian, kosher-friendly. Avoids dairy-meat mixture.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'lunch', title: 'Dal tadka with brown rice and cucumber raita', calories: 620, notes: 'Full vegetarian, protein-rich. Dairy (raita) kept separate from lentils per kosher dairy practice.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'dinner', title: 'Paneer tikka with quinoa salad and tzatziki', calories: 720, notes: 'Shabbat Friday dinner adaptation — paneer substitutes meat, tzatziki is yoghurt-based (dairy meal).' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 5, meal_type: 'dinner', title: 'Shabbat dinner: challah, vegetable soup, roast vegetables, honey cake', calories: 880, notes: 'Friday Shabbat. Challah (Aaron\'s recipe), fish replaced with roast aubergine for vegetarian table. Honey cake for dessert (pareve).' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 2, meal_type: 'breakfast', title: 'Upma with coconut chutney', calories: 320, notes: 'South Indian breakfast. Pareve, vegan — kosher-compatible.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 3, meal_type: 'lunch', title: 'Chole bhature (chickpea curry with fried bread)', calories: 780, notes: 'Vegetarian. No dairy in bhatura — pareve meal, kosher-compatible.' },
    ])
  }

  // AURA profiles — Maya (9) and Rohan (5)
  const { count: auraCount } = await sb.from('aura_profiles').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (auraCount < 2) {
    await sb.from('aura_profiles').insert([
      {
        user_id: uid,
        data: {
          full_name: 'Maya Goldberg-Iyer',
          date_of_birth: '2016-11-22',
          age: 9,
          school_name: 'Cathedral and John Connon School',
          class_grade: 'Class 4',
          notes: 'Bat mitzvah prep at Keneseth Eliyahoo Synagogue. Curious about both Hindu and Jewish traditions. Reading level ahead of grade.',
        },
      },
      {
        user_id: uid,
        data: {
          full_name: 'Rohan Goldberg-Iyer',
          date_of_birth: '2020-03-08',
          age: 5,
          school_name: 'Cathedral and John Connon School',
          class_grade: 'Kindergarten',
          notes: 'Energetic and joyful. Loves Ganesh puja and reciting Shema. Just started reading.',
        },
      },
    ])
  }

  console.log('✓ Devika Goldberg-Iyer seeded')
}
seedDevika().catch(e => { console.error(e); process.exit(1) })
