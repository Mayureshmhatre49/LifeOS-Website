/**
 * Seed: Rahul Mehta — Final Year Engineering Student & EdTech Startup Co-Founder, Pune, India (INR)
 * Email: rahul.mehta@e2e-test.handlelifeos.app
 * Persona #36 — VIT Pune, SkillBridge AI startup, scholarship holder, ambitious career crossroads
 */

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

const EMAIL = 'rahul.mehta@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedRahul() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Rahul Mehta',
    occupation: 'B.Tech Final Year & Co-Founder — SkillBridge AI (VIT Pune)',
    life_stage: 'student',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: [
      'Grow SkillBridge to 5,000 beta users before YC application deadline (August 2026)',
      'Complete B.Tech with CGPA 8.8+ — thesis on AI-driven skill gap analysis submitted by June',
      'Secure INR 30L angel round or YC acceptance by October 2026',
      'Get placed at Google/Microsoft as backup if startup runway runs out'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (student-scale amounts in INR, idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 9500, spent: 9500, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 6500, spent: 7200, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 2500, spent: 2200, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 8000, spent: 6800, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Education', budgeted: 3000, spent: 2400, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 9500, spent: 4750, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 6500, spent: 3200, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 8000, spent: 3900, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Education', budgeted: 3000, spent: 1800, currency: 'INR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 9500, currency: 'INR', category: 'rent', description: 'PG accommodation — Wakad, Pune (single room, meals included)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 3200, currency: 'INR', category: 'food', description: 'Outside mess + Zomato deliveries — late-night coding sessions', expense_date: '2026-04-07' },
      { user_id: uid, amount: 4200, currency: 'INR', category: 'misc', description: 'AWS EC2 + RDS — SkillBridge prod server April billing (student credits exhausted)', expense_date: '2026-04-10' },
      { user_id: uid, amount: 1800, currency: 'INR', category: 'transport', description: 'Rapido + Pune Metro — college, co-working, investor meetings', expense_date: '2026-04-14' },
      { user_id: uid, amount: 2400, currency: 'INR', category: 'education', description: 'Coursera ML Specialization certificate + LeetCode Premium', expense_date: '2026-04-16' },
      { user_id: uid, amount: 4000, currency: 'INR', category: 'misc', description: 'SkillBridge logo + UI design — Fiverr designer (₹2.5K) + Figma Pro', expense_date: '2026-04-20' },
      { user_id: uid, amount: 4000, currency: 'INR', category: 'food', description: 'Zomato + college mess + one team dinner (SkillBridge co-founders × 3)', expense_date: '2026-04-26' },
      { user_id: uid, amount: 9500, currency: 'INR', category: 'rent', description: 'PG accommodation — Wakad, Pune (May)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 3200, currency: 'INR', category: 'misc', description: 'OpenAI API usage — SkillBridge NLP model (April + May billing)', expense_date: '2026-05-06' },
      { user_id: uid, amount: 2800, currency: 'INR', category: 'travel', description: 'Pune → Mumbai train + auto — IIT Bombay startup pitch event', expense_date: '2026-05-08' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'LeetCode daily — 1 problem', description: 'Consistent placement prep. Even on startup days. 1 medium problem minimum.', frequency: 'daily',
        target_count: 1, current_streak: 58, longest_streak: 90, completed_today: true,
        category: 'learning', color: '#f59e0b', icon: '💻', reminder_time: '07:30', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'SkillBridge stand-up — daily 15 min', description: 'Video call with co-founders Priya and Karan. What shipped, what is blocked, what is next.', frequency: 'daily',
        target_count: 1, current_streak: 24, longest_streak: 35, completed_today: true,
        category: 'work', color: '#10b981', icon: '🚀', reminder_time: '09:00', active: true, created_at: '2026-02-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Thesis writing — 1 hour', description: '1 focused hour on B.Tech thesis daily. Supervisor says: write before you code, not after.', frequency: 'daily',
        target_count: 1, current_streak: 8, longest_streak: 22, completed_today: false,
        category: 'education', color: '#8b5cf6', icon: '📄', reminder_time: '22:00', active: true, created_at: '2026-03-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Weekly user interview — SkillBridge', description: 'Talk to one actual engineering student/campus recruiter per week. Build for real pain not assumed pain.', frequency: 'weekly',
        target_count: 1, current_streak: 6, longest_streak: 10, completed_today: false,
        category: 'work', color: '#3b82f6', icon: '🎤', reminder_time: '18:00', active: true, created_at: '2026-03-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'No screens after midnight', description: 'Sleep deprivation destroys decision quality. Started after a terrible code deploy at 3am that broke prod.', frequency: 'daily',
        target_count: 1, current_streak: 5, longest_streak: 15, completed_today: true,
        category: 'health', color: '#ec4899', icon: '🌙', reminder_time: '23:45', active: true, created_at: '2026-04-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 182, completed: true,
        abandoned: false, body_doubling_enabled: true, task_title: 'SkillBridge NLP model — skill extraction from JD parser v2',
        notes: 'Job description parser now extracts 87 skill categories with 91% precision. Karan pair-programmed. Shipped to beta.',
        started_at: '2026-04-08T20:00:00Z', ended_at: '2026-04-08T23:02:00Z'
      },
      {
        user_id: uid, mode: 'pomodoro', planned_minutes: 120, actual_minutes: 118, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'B.Tech thesis — Chapter 4: Evaluation methodology and dataset construction',
        notes: '4 Pomodoro sessions. Chapter 4 first draft done. 2,800 words. Need to add confusion matrix visualisations.',
        started_at: '2026-04-15T14:00:00Z', ended_at: '2026-04-15T16:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 35, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'YC application essay — Why us, why now',
        notes: 'Abandoned — Priya called emergency: beta server went down. Fixed prod issue instead. Essay rescheduled for Sunday.',
        started_at: '2026-04-28T21:00:00Z', ended_at: '2026-04-28T21:35:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 238, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'IIT Bombay pitch prep — SkillBridge 5-min deck and live demo',
        notes: 'Deck tightened to 9 slides. Demo flow: signup → JD paste → skill gap report in 8 seconds. Won 2nd place, got ₹25K prize. Two angel investors requested follow-up.',
        started_at: '2026-05-07T10:00:00Z', ended_at: '2026-05-07T14:00:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'NLP parser hitting 91% precision. Three more beta users signed up from VIT referral. This is actually working.', logged_at: '2026-04-09T00:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Thesis supervisor wants major revisions on Chapter 3. And we have a prod outage. And placement tests start next month. I need to clone myself.', logged_at: '2026-04-18T23:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'IIT Bombay pitch — 2nd place and ₹25K prize! Two angel investors want to meet. This is the validation I needed to believe SkillBridge is real.', logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Angel investor call went well. They want to see 2,000 users before writing a cheque. 847 now. The gap feels large but the growth curve is right.', logged_at: '2026-05-10T20:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-09', items: ['Priya and Karan — the best co-founders I could have chosen', 'VIT Pune professors who let me do startup work as thesis research', 'Papa\'s scholarship that funds this whole thing'] },
    { date: '2026-05-08', items: ['IIT Bombay pitch competition — 2nd place, ₹25K, 2 angels', 'The problem is real — every user tells us they needed SkillBridge', 'My LeetCode streak — backup plan if startup fails'] },
    { date: '2026-05-10', items: ['Angel investor taking us seriously after a 10-minute call', 'The 847 users who trust SkillBridge enough to upload their CVs', 'Pune startup ecosystem that gave us a stage'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // 9. Journal entries
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      {
        user_id: uid, title: 'IIT Bombay Pitch — Something Changed',
        content: 'We came 2nd. But what mattered was the audience. 300 engineers, 40 VCs and angels in the room, and when I showed the live demo — skill gap report generated in 8 seconds from a job description — people leaned forward. Not polite attention. Real interest. Two angels asked for decks after. One said "you\'re solving a problem I had 5 years ago and no one solved it well." That sentence is why we exist.',
        mood: 5, tags: ['milestone', 'startup', 'validation'], created_at: '2026-05-09T00:00:00Z'
      },
      {
        user_id: uid, title: 'The Decision I Keep Not Making',
        content: 'TCS offered 18L CTC. Microsoft DC offer still pending. If SkillBridge doesn\'t raise by October, I need to take a job. Papa worked 25 years in a company he hated to pay for my education. He wants me to "get settled." But settled is the enemy of the thing I am trying to build. I need to raise or I need to make the decision. 2,000 users is the bar. We are at 847. Four months left.',
        mood: 3, tags: ['anxiety', 'startup', 'career'], created_at: '2026-04-20T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Accept TCS/Infosys campus placement offer (INR 18L CTC) now as backup, or go all-in on SkillBridge and decline placement process entirely?',
        category: 'Career',
        mode: 'analyze',
        options: [
          { label: 'Accept placement — TCS/Infosys backup', pros: ['INR 18L CTC guaranteed financial security', 'Parents\' peace of mind', 'Can still run SkillBridge on evenings if offer has deferral option'], cons: ['Corporate schedule will kill startup momentum', 'Signal of no confidence in SkillBridge', 'Deferral unlikely — most IT companies want immediate joining'] },
          { label: 'Go all-in — skip placement entirely', pros: ['Full bandwidth for SkillBridge — hit 2,000 users target by October', 'Authentic founder signal to investors', 'Angel validation already started'], cons: ['Zero safety net if raise fails', 'Parents extremely disappointed (Papa is already anxious)', 'October deadline is real — no raise = crisis'] }
        ],
        result: { summary: 'Recommendation: participate in placement process as hedge but set internal deadline — if SkillBridge reaches 2,000 users AND angel term sheet by October, decline placement. If not, accept best offer. Both tracks in parallel for 4 months.', chosen: 'Parallel track: keep placement open + push SkillBridge growth', outcome: 'pending' },
        favorite: true,
        created_at: '2026-04-21T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Apply to Y Combinator (August deadline) or focus resources on closing Pune angel round (INR 30L) first?',
        category: 'Business',
        mode: 'compare',
        options: [
          { label: 'Apply Y Combinator (August 2026)', pros: ['YC network is the best startup accelerator globally', 'USD 500K for 7% — transforms the business', 'Forces team and narrative discipline'], cons: ['3% acceptance rate — huge time investment for likely rejection', 'SF move required during final semester and B.Tech submission', 'Distraction from angel round in progress'] },
          { label: 'Close Pune angel round (INR 30L)', pros: ['Higher probability of success (3 angels already interested)', 'Runway secured for 12 months — build product without distraction', 'India-based — no relocation needed during thesis'], cons: ['Smaller network than YC', 'INR 30L runway only 12 months at current burn', 'Missing YC brand on cap table'] }
        ],
        result: { summary: 'Angel round first: close INR 30L by August for runway security. Apply YC with the angel money as proof of traction. Both is possible — angels close in July, YC app due August. Sequence matters.', chosen: 'Angel round first (July), then YC application (August)', outcome: 'pending' },
        favorite: false,
        created_at: '2026-05-10T09:00:00Z'
      }
    ])
  }

  // 11. Investments (student — minimal but disciplined)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Zerodha SIP — Nifty 50 Index Fund', type: 'mutual_fund', invested_amount: 18000, current_value: 21200, currency: 'INR', account: 'Zerodha (Coin)', notes: 'INR 3,000/month SIP started 6 months ago. Nifty 50 passive index. Long-term wealth building regardless of startup outcome.', purchase_date: '2025-11-01' },
      { user_id: uid, name: 'SkillBridge equity — co-founder shares', type: 'other', invested_amount: 0, current_value: 0, currency: 'INR', account: 'SkillBridge Technologies', notes: '38% co-founder equity. Value speculative pre-investment. Sweat equity only. The real bet.', purchase_date: '2025-08-01' },
    ])
  }

  // 12. Business clients (SkillBridge early B2B — beta partners)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'VIT Pune — Training & Placement Cell', email: 'placement@vitpune.edu.in', company: 'VIT Pune', notes: 'Pilot partner. 120 VIT students using SkillBridge for placement prep. Free during beta. Key for product-market fit validation.', currency: 'INR' },
      { user_id: uid, name: 'Persistent Systems — Campus Recruitment', email: 'campus.hr@persistent.com', company: 'Persistent Systems', notes: 'Interested in SkillBridge for JD-to-candidate matching tool. Proof of concept demo done. Pilot pricing discussion pending.', currency: 'INR' },
      { user_id: uid, name: 'Rahul Shah — Angel Investor (Pune)', email: 'rahul.shah@angelsindia.com', company: 'Angels India Network', notes: 'Spoke at IIT Bombay pitch. Interested in leading INR 30L round. Term sheet discussion expected in June. References shared.', currency: 'INR' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'VIT Pune Placement Beta — 120 students Q2 2026', status: 'active', fee: 0, currency: 'INR', notes: 'Free beta access in exchange for case study and user feedback data. 120 students onboarded. NPS: 68. Converting to paid post-graduation season.', due_date: '2026-07-31' },
        { user_id: uid, client_id: clients[1].id, name: 'Persistent Systems JD Matcher — PoC pilot', status: 'proposal', fee: 480000, currency: 'INR', notes: 'Proposed INR 48K/month SaaS license for 10 recruiters. SkillBridge matches JD to ranked candidate profiles. Decision pending HR approval.', due_date: '2026-06-30' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Priya Nair', email: 'priya.nair@skillbridge.in', phone: '+919876543210', group_name: 'Team', notes: 'SkillBridge co-founder (CPO). VIT Pune batch. Runs product and user research. The most user-empathetic person on the team.' },
      { user_id: uid, name: 'Karan Joshi', email: 'karan.joshi@skillbridge.in', phone: '+919988776655', group_name: 'Team', notes: 'SkillBridge co-founder (CTO). Built the NLP pipeline. Ex-competitive programmer. Best engineer Rahul knows.' },
      { user_id: uid, name: 'Prof. Anand Kulkarni', email: 'a.kulkarni@vitpune.edu.in', phone: '+912031234567', group_name: 'Mentors', notes: 'B.Tech thesis supervisor. Supportive of startup integration into thesis. Key academic reference for NPTEL and research grants.' },
      { user_id: uid, name: 'Papa — Suresh Mehta', email: '', phone: '+919977665544', group_name: 'Family', notes: 'Ahmedabad. Textile business. Worried about placement vs. startup dilemma. Loves me, doesn\'t understand equity. Call every Sunday.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Grow SkillBridge to 2,000 beta users by October 2026', category: 'impact',
        description: 'Currently 847 users. Angel investor threshold is 2,000. Growth channels: VIT referral network, college placement cell partnerships, LinkedIn targeting.',
        target_date: '2026-10-31', status: 'active', progress_pct: 42
      },
      {
        user_id: uid, title: 'Close INR 30L angel seed round', category: 'income',
        description: 'Lead investor Rahul Shah (Angels India) interested. 2 more angels to close. Term sheet expected June. 12 months runway at current burn.',
        target_date: '2026-07-31', status: 'active', progress_pct: 30
      },
      {
        user_id: uid, title: 'Submit B.Tech thesis — CGPA 8.8+ maintained', category: 'learning',
        description: 'Chapter 4 draft done. Chapter 5 (results) and Chapter 6 (conclusion) remaining. Supervisor review cycle. Final submission June 2026.',
        target_date: '2026-06-30', status: 'active', progress_pct: 55
      },
      {
        user_id: uid, title: 'Apply to Y Combinator W27 batch', category: 'role',
        description: 'Application due August 2026. Need 2,000 users + angel money + India traction story. YC acceptance would transform the company.',
        target_date: '2026-08-31', status: 'active', progress_pct: 15
      },
    ])
  }

  // 15. Trip — Mumbai IIT Bombay startup pitch
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Mumbai, India — IIT Bombay E-Summit', country_code: 'IN',
        starts_on: '2026-05-08', ends_on: '2026-05-09',
        purpose: 'business', status: 'completed',
        budget_total: 3800, currency: 'INR',
        notes: 'E-Summit Startup Pitch 2026. Won 2nd place + ₹25K prize. 2 angel investor contacts generated. SkillBridge demo went viral on LinkedIn — 8,400 impressions.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'Pune → Mumbai Deccan Express + local', starts_at: '2026-05-08T06:15:00Z', ends_at: '2026-05-08T08:45:00Z', cost: 380, currency: 'INR', notes: 'Shivneri bus + local auto to IIT Powai. Budget travel.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'OYO Powai — 1 night', starts_at: '2026-05-08T14:00:00Z', ends_at: '2026-05-09T10:00:00Z', cost: 1200, currency: 'INR', notes: 'Basic but clean. 10 min from IIT Bombay gate.' },
        { trip_id: trips[0].id, type: 'activity', title: 'E-Summit Startup Pitch — SkillBridge 5-min demo', starts_at: '2026-05-08T15:00:00Z', ends_at: '2026-05-08T18:00:00Z', cost: 0, currency: 'INR', notes: '2nd place! ₹25K prize. Angel contacts Rahul Shah and Meera Iyer requested follow-up.' },
      ])
    }
  }

  // 16. Meal plans (student budget — practical)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Upma + chai (PG mess)', calories: 380, notes: 'Included in PG — fast before 9am standup' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Thali — dal, sabzi, rice, roti (college canteen)', calories: 720, notes: 'INR 80 college canteen thali. Best value in Pune.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Maggi + boiled eggs (late night code session)', calories: 520, notes: 'Classic developer dinner — deployed feature at 1am' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Misal pav + lassi', calories: 650, notes: 'Pune special — Wednesday treat at Bedekar Misal' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'dinner', recipe_name: 'Team dinner — pizza (SkillBridge weekly ritual)', calories: 880, notes: 'Priya + Karan + Rahul, Dominos Friday. Sprint retrospective over food.' },
    ])
  }

  console.log('✅ Rahul Mehta (#36) seeded — INR, Pune, VIT student co-founder, SkillBridge 847 users, IIT Bombay 2nd place')
}

seedRahul().catch(e => { console.error(e); process.exit(1) })
