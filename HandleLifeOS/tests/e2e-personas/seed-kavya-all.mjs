/**
 * Seed all data for Kavya Reddy (E2E persona #25).
 * 22yo Final-year CS Engineering Student, IIT Hyderabad, India. INR.
 * Run: node tests/e2e-personas/seed-kavya-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'kavya.reddy@e2e-test.handlelifeos.app'
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
    display_name: 'Kavya Reddy',
    occupation: 'B.Tech Computer Science Student (Final Year) — IIT Hyderabad',
    life_stage: 'student',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: ['crack Google/Microsoft placement', 'launch SaaS side project', 'clear UPSC Prelims 2027', 'build first ₹1L investment portfolio'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'academics', value: 'IIT Hyderabad CS, CGPA 8.7/10. Final year thesis: "Federated Learning for Privacy-Preserving Medical Diagnosis". Thesis supervisor: Prof. Arjun Bansal', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'income', value: 'Summer internship (Google STEP 2025): ₹1,20,000/month stipend saved. Current: ₹12,000/month IITH merit scholarship + ₹8,000-15,000 freelance (hackathon prizes + campus tutoring)', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'placement', value: 'Google SWE offer: CTC ₹52L p.a. (₹40L base + ₹12L bonus+equity). Joining date: July 2026. Also has Microsoft fallback offer at ₹45L', confidence: 95 },
      { user_id: uid, type: 'goal', key: 'upsc', value: 'UPSC Civil Services as a 5-year parallel goal — influenced by father (IAS officer). Prelims 2027. Will attempt 2 years before fully committing', confidence: 70 },
      { user_id: uid, type: 'preference', key: 'study_style', value: 'Night owl. Peak productivity 10pm-2am. Uses Pomodoro. Notion for everything. GitHub streak: 287 days', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'family', value: 'From Warangal, Telangana. Father: IAS officer (Collector, Nalgonda). Mother: Telugu teacher. Elder brother (Karthik): works at TCS Pune. Family financially comfortable — Kavya is the high achiever', confidence: 90 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 22000, savings_target: 5000, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 18000, savings_target: 4000, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 25000, savings_target: 8000, currency: 'INR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 4500, description: 'PG accommodation near IITH campus (single room)', expense_date: '2026-05-01', is_recurring: true, currency: 'INR' },
      { user_id: uid, category: 'food', amount: 3200, description: 'Mess fees + outside food (Zomato biryani twice a week)', expense_date: '2026-05-05', is_recurring: false, currency: 'INR' },
      { user_id: uid, category: 'utilities', amount: 800, description: 'Mobile recharge (Jio) + electricity share', expense_date: '2026-05-02', is_recurring: true, currency: 'INR' },
      { user_id: uid, category: 'education', amount: 2500, description: 'Coursera ML Specialization (last month of subscription) + LeetCode Premium', expense_date: '2026-05-08', is_recurring: false, currency: 'INR' },
      { user_id: uid, category: 'transport', amount: 600, description: 'Rapido and auto to campus + monthly trip to Warangal', expense_date: '2026-05-06', is_recurring: false, currency: 'INR' },
      { user_id: uid, category: 'entertainment', amount: 450, description: 'Netflix (shared with 4 friends) + coding contest fees', expense_date: '2026-05-10', is_recurring: false, currency: 'INR' },
      { user_id: uid, category: 'investment', amount: 2000, description: 'Nifty 50 Index SIP (first month — starting investment journey)', expense_date: '2026-05-01', is_recurring: true, currency: 'INR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'First ₹1L investment portfolio', category: 'other', target_amount: 100000, current_amount: 38000, currency: 'INR', target_date: '2026-12-31' },
      { user_id: uid, title: 'MacBook Pro M4 for Google joining', category: 'gadget', target_amount: 180000, current_amount: 95000, currency: 'INR', target_date: '2026-07-01' },
      { user_id: uid, title: 'Emergency fund (3 months pre-joining)', category: 'emergency_fund', target_amount: 75000, current_amount: 42000, currency: 'INR', target_date: '2026-07-01' },
      { user_id: uid, title: 'UPSC preparation course fund', category: 'education', target_amount: 60000, current_amount: 15000, currency: 'INR', target_date: '2027-01-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Nifty 50 Index Fund (UTI)', type: 'mutual_fund', invested_amount: 4000, current_value: 4280, currency: 'INR', account: 'Zerodha Coin', notes: 'SIP ₹2,000/month started May 2026. First investment ever!' },
      { user_id: uid, name: 'Infosys Shares', type: 'stocks', invested_amount: 15000, current_value: 18500, currency: 'INR', account: 'Zerodha', notes: 'Bought during campus investing club exercise. Gift from uncle for topping placement' },
      { user_id: uid, name: 'Google STEP Internship Savings', type: 'other', invested_amount: 120000, current_value: 120000, currency: 'INR', account: 'HDFC Savings Account', notes: 'Saved full internship stipend. Waiting for best deployment — may start FD or buy ELSS' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'LeetCode / coding practice (2 problems)', icon: '💻', color: 'indigo', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Thesis writing (1 hour)', icon: '✍️', color: 'violet', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Read UPSC current affairs (30 min)', icon: '📰', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Morning walk + podcast', icon: '🎧', color: 'emerald', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'GitHub commit streak', icon: '🐙', color: 'cyan', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
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
    const leetId = habitIds['LeetCode / coding practice (2 problems)']
    const gitId = habitIds['GitHub commit streak']
    const upscId = habitIds['Read UPSC current affairs (30 min)']
    if (leetId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: leetId, date: d, count: 1 }))
    if (gitId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: gitId, date: d, count: 1 }))
    if (upscId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09'].forEach(d =>
      logs.push({ user_id: uid, habit_id: upscId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Join Google SWE — July 2026', category: 'role', target_date: '2026-07-28', status: 'active', progress_pct: 85, description: 'Offer letter signed. Background check cleared. Onboarding paperwork submitted. Need to submit thesis and grades' },
      { user_id: uid, title: 'Submit B.Tech thesis with distinction', category: 'learning', target_date: '2026-06-15', status: 'active', progress_pct: 75, description: 'Federated Learning paper. 3 chapters written, results chapter in progress. Prof. Bansal says strong for best thesis award' },
      { user_id: uid, title: 'Launch SaaS side project (UPSC study tool)', category: 'impact', target_date: '2026-12-31', status: 'active', progress_pct: 20, description: 'AI-powered UPSC current affairs quiz app. MVP designed. Need time after Google joining' },
      { user_id: uid, title: 'UPSC Prelims 2027 registration and preparation', category: 'other', target_date: '2027-06-01', status: 'active', progress_pct: 10, description: 'Father wants her to attempt. She wants to at least try once before committing to tech career' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Shreya Gupta', group_name: 'friend', email: 'shreya.g@iith.ac.in', role: 'Friend & classmate — IIT Hyderabad CS', notes: 'Best friend on campus. Also placed at Microsoft. Study group partner for thesis. Will be in Bangalore together', strength: 5 },
      { user_id: uid, name: 'Prof. Arjun Bansal', group_name: 'mentor', email: 'arjun.bansal@iith.ac.in', role: 'Thesis Supervisor — Dept. of CS, IITH', notes: 'Brilliant ML professor. Pushing Kavya to publish her thesis work as a paper at ICML', strength: 4 },
      { user_id: uid, name: 'Narayana Reddy', email: 'nreddy.ias@telangana.gov.in', group_name: 'family', role: 'Father — IAS Collector, Nalgonda', notes: 'Very proud but wants UPSC attempt. Kavya respects him deeply. Weekly family calls Sunday 8pm', strength: 5 },
      { user_id: uid, name: 'Vikram Iyer', group_name: 'mentor', email: 'vikram.iyer@google.com', role: 'Software Engineer L5, Google Bangalore', notes: 'Connected via Coding Club. Helping Kavya understand Google onboarding and L3 growth path', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Thesis review — Prof. Bansal suggesting submitting results to ICML 2026 workshop. Exciting but tight deadline', interacted_at: '2026-05-07T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Shreya and Kavya did 6-hour study session. Both finished respective thesis chapters. Celebrated with Hyd biryani', interacted_at: '2026-05-08T20:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'call', note: 'Vikram explained Google Bangalore L3 onboarding — 6-week boot camp, then team matching. Very helpful', interacted_at: '2026-05-06T21:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: true, task_title: 'Thesis Chapter 4 — Federated Learning results analysis', notes: 'Study session with Shreya. Got federation accuracy to 93.2% on MNIST — thesis-worthy result', started_at: '2026-05-08T14:00:00Z', ended_at: '2026-05-08T16:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'LeetCode Hard — 5 DP problems (Google interview prep)', notes: 'Solved 4/5. Missed the knapsack variant. Reviewed editorial and understood', started_at: '2026-05-05T22:00:00Z', ended_at: '2026-05-05T23:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'SaaS MVP Figma wireframes', notes: 'UPSC quiz app — drew 8 screens. Feature scope reduced to MVP for solo build', started_at: '2026-05-09T21:00:00Z', ended_at: '2026-05-09T21:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Bangalore — Google joining + apartment hunting', start_date: '2026-07-20', end_date: '2026-07-30', status: 'planning', budget_total: 25000, currency: 'INR', travellers: 1, notes: 'Joining July 28. Need to find flat before that. Shreya (Microsoft) also looking in Indiranagar area' },
      { user_id: uid, destination: 'Warangal — Home visit before Google joining', start_date: '2026-07-01', end_date: '2026-07-10', status: 'planning', budget_total: 5000, currency: 'INR', travellers: 1, notes: 'Last long visit home before Bangalore life. Amma making favourite food. Father wants career chat' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'transport', title: 'Hyderabad → Bangalore (Telangana Express / Rapido bus)', starts_at: '2026-07-20T06:00:00Z', cost: 650, notes: 'Bus or train — will decide based on availability' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'OYO near Google Bangalore office (Whitefield)', starts_at: '2026-07-20T12:00:00Z', ends_at: '2026-07-28T11:00:00Z', cost: 6400, notes: '8 nights while flat hunting. Budget: ₹800/night' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Google India Bangalore — First Day Joining', starts_at: '2026-07-28T09:00:00Z', cost: 0, notes: 'Orientation and badge collection. Bring original degree certificates' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Federated learning model hit 93.2% accuracy. Prof. Bansal called it publishable. Screamed in lab corridor', logged_at: '2026-05-08T16:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Google joining is real. Mixed feelings — excited but leaving IITH family', logged_at: '2026-05-06T22:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'UPSC vs tech career guilt hitting again. Appa wants me to attempt once. I need to decide', logged_at: '2026-05-05T23:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'GitHub streak hit 300 days! Small thing but it represents discipline I\'m proud of', logged_at: '2026-05-10T01:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: '93.2% and what it cost', content: "The federated learning model converged at 93.2% accuracy tonight. Shreya bought cold coffee from the vending machine. Prof. Bansal thinks it's ICML-worthy. I sat in the lab at 11pm thinking about the 14 failed experiments before this one. I almost switched topics in January. Tonight I am very glad I did not. This is what staying looks like from the inside.", mood: 5, tags: ['thesis', 'research', 'persistence', 'IITH'], created_at: '2026-05-08T23:00:00Z' },
      { user_id: uid, title: 'Appa and the UPSC question', content: "He asked again on Sunday. Gently but clearly. He built a 30-year career serving the nation and he wants that legacy continued. I love him and I understand. But I also know I light up differently when I am coding. Maybe I can serve differently — build products that touch millions. I have decided: I will attempt UPSC Prelims once in 2027. If I clear it, I will think again. If not, the decision is made by the universe.", mood: 3, tags: ['family', 'UPSC', 'career', 'father', 'identity'], created_at: '2026-05-05T23:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['93.2% model accuracy', 'Shreya always studying alongside', 'IITH scholarship enabling this journey']
        : gd === '2026-05-09'
        ? ['Google offer at ₹52L CTC', 'Prof. Bansal believing in publishable quality', 'LeetCode streak 287 days']
        : ['GitHub streak 300 days 🎉', 'Parents\' sacrifices for education', 'Clarity on UPSC decision path']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Accept Google Bangalore offer (₹52L CTC) or try for Google Mountain View US transfer later?',
        category: 'career', mode: 'analyze',
        options: [{ label: 'Accept Bangalore now', pros: ['close to family', 'secure', 'strong team'] }, { label: 'Negotiate US transfer timeline', pros: ['US comp much higher', 'global exposure'], cons: ['may not be possible at L3', 'visa uncertainty'] }],
        result: { summary: 'Accept Bangalore fully. Perform excellently at L3 for 2 years, then apply for internal transfer to US via L4 promotion', chosen: 'Accept Bangalore + plan US transfer in 2 years', outcome: 'decided' },
        favorite: true, created_at: '2026-05-07T22:00:00Z'
      },
      {
        user_id: uid, question: 'Submit thesis to ICML 2026 workshop (tight deadline) or focus on graduation first?',
        category: 'other', mode: 'compare',
        options: [{ label: 'Submit to ICML workshop', pros: ['publication CV boost', 'Prof. Bansal excited'] }, { label: 'Skip ICML, focus graduation', pros: ['less stress', 'Google joining prep'] }],
        result: { summary: 'Attempt ICML workshop — deadline is June 1, graduation June 15. Tight but manageable with Shreya pair programming support', chosen: 'Submit to ICML workshop', outcome: 'decided' },
        favorite: false, created_at: '2026-05-08T17:00:00Z'
      },
    ])
  }

  console.log('✅ Kavya Reddy seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
