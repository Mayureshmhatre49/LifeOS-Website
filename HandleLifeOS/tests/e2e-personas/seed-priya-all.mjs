/**
 * Full seed for Priya Sharma — Software PM in Bangalore, India.
 * Covers: memory, habits, focus, decisions, business, home, travel, protection, legal, briefings.
 * Run: node tests/e2e-personas/seed-priya-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '1e83ae5f-38eb-4e93-be26-3d4dd26dfc37'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

// offset 0 = 2026-04-19 (Sun=0)
function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

// ── MEMORY ────────────────────────────────────────────────────────────────────
async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Priya Sharma', occupation: 'Product Manager', life_stage: 'mid_career',
    country: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', preferred_language: 'en',
    goals: [
      'Launch 3 product features before Q3 2026 performance review',
      'Complete PMI-ACP certification by October 2026',
      'Save ₹20 lakh for home down payment by December 2027',
      'Run a 10K race before end of 2026',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Priya Sharma (PM, Bangalore)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: '₹1,85,000 total — ₹1,45,000 salary at LearnBridge EdTech + ~₹40,000 freelance PM consulting' },
    { type: 'fact',         key: 'home_location',          value: '2BHK, Koramangala 5th Block, Bangalore 560095 — rented at ₹28,000/month' },
    { type: 'fact',         key: 'vehicle',                value: 'Honda Activa 6G (2023), registration KA-05-HM-4421' },
    { type: 'fact',         key: 'employer',               value: 'LearnBridge EdTech (Series B, ~400 employees) — Product Manager, Growth & Engagement squad' },
    { type: 'fact',         key: 'languages',              value: 'Hindi (native), English (fluent), Marathi (conversational), Kannada (basic — learning)' },
    { type: 'preference',   key: 'work_style',             value: 'Deep work 7–9am before standups; async communication preferred; Notion for all planning' },
    { type: 'preference',   key: 'diet',                   value: 'Vegetarian (no meat or eggs, dairy ok); aims for plant-based 3 days/week; loves South Indian food' },
    { type: 'preference',   key: 'communication_style',    value: 'Data-driven summaries; dislikes vague feedback; prefers written async over long meetings' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Product management books (Inspired, Shape Up), startup memoir, Indian literary fiction — 20 pages/night target' },
    { type: 'goal',         key: 'career_goal',            value: 'Achieve Group PM role at LearnBridge by April 2027 performance cycle' },
    { type: 'goal',         key: 'financial_goal',         value: 'Accumulate ₹20L in savings for first home down payment — currently at ₹11.4L across PPF + FD + mutual funds' },
    { type: 'goal',         key: 'fitness_goal',           value: 'Complete 10K run — currently running 5K 3×/week. Target: TCS World 10K Bangalore October 2026' },
    { type: 'concern',      key: 'job_security',           value: 'Layoffs at peer EdTech companies in 2025 created anxiety — prioritising freelance income as safety buffer' },
    { type: 'concern',      key: 'ttc_stress',             value: 'Trying to conceive — managing work pressure alongside health focus; avoiding overcommitment on travel' },
    { type: 'relationship', key: 'spouse',                 value: 'Vikram Sharma — Data Scientist at Amazon Bangalore; birthday March 12; very supportive; handles most cooking' },
  ]
  let n = 0
  for (const it of items) {
    const { error } = await db.from('memory_items').insert({ user_id: UID, source: 'manual', confidence: 95, is_active: true, ...it })
    if (!error) n++; else console.log(`  ✗  memory "${it.key}": ${error.message}`)
  }
  console.log(`  ✔  ${n}/${items.length} memory items`)
}

// ── HABITS ────────────────────────────────────────────────────────────────────
async function seedHabits() {
  console.log('\n🌱  Seeding habits...')
  const defs = [
    { name: 'Morning Yoga (30 min)', icon: '🧘', color: 'violet',  frequency: 'weekdays', days_of_week: [1,2,3,4,5], reminder_time: '06:30', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18] },
    { name: 'Drink 2L Water',        icon: '💧', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,20] },
    { name: 'Read 20 Pages',         icon: '📚', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:30', completedOffsets: [0,1,2,3,5,6,7,8,9,10,12,13,14,15,16,18,19,20] },
    { name: 'Evening Run/Walk',      icon: '🏃', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '18:30', completedOffsets: [1,2,4,5,8,9,10,11,15,16,17,19] },
    { name: 'Vitamin + Iron Tablet', icon: '💊', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:30', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Daily Journal 5 min',   icon: '📔', color: 'amber',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,3,4,6,7,8,10,11,13,14,15,17,18,20] },
    { name: 'No Phone Before 9am',   icon: '📵', color: 'purple',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '06:00', completedOffsets: [1,2,3,4,8,9,10,12,15,16,17,18,19] },
  ]
  let hOk = 0, lOk = 0
  for (const h of defs) {
    const { completedOffsets, ...row } = h
    const { data: habit, error } = await db.from('habits').insert({ user_id: UID, ...row }).select().single()
    if (error || !habit) { console.log(`  ✗  habit "${h.name}": ${error?.message}`); continue }
    hOk++
    for (const off of completedOffsets) {
      if (!h.days_of_week.includes(DOW[off])) continue
      const { error: le } = await db.from('habit_logs').insert({ habit_id: habit.id, user_id: UID, date: dateOffset(off), count: 1 })
      if (!le) lOk++
    }
  }
  console.log(`  ✔  ${hOk}/${defs.length} habits, ${lOk} habit logs`)
}

// ── FOCUS ─────────────────────────────────────────────────────────────────────
async function seedFocus() {
  console.log('\n🎯  Seeding focus...')
  const { error: pe } = await db.from('focus_preferences').upsert({
    user_id: UID, default_mode: 'deep', break_interval_minutes: 5, long_break_minutes: 15,
    sessions_before_long_break: 4, body_doubling_default: false, daily_focus_goal_minutes: 120,
  }, { onConflict: 'user_id' })
  if (pe) console.log(`  ✗  focus_preferences: ${pe.message}`)
  else console.log('  ✔  focus prefs: 2h/day goal, deep-work default')

  // IST = UTC+5:30 so 07:00 IST = 01:30 UTC
  const sessions = [
    { off: 1,  mode: 'deep',     plan: 90, act: 88, done: true,  title: 'Growth feature PRD — user research synthesis',             time: '01:30' },
    { off: 2,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Sprint planning prep & JIRA ticket grooming',              time: '02:30' },
    { off: 2,  mode: 'deep',     plan: 60, act: 55, done: true,  title: 'DataKraft consulting — Q1 metrics deep dive',              time: '04:00' },
    { off: 3,  mode: 'pomodoro', plan: 25, act: 23, done: true,  title: 'OKR mid-quarter review notes',                            time: '02:00' },
    { off: 4,  mode: 'deep',     plan: 75, act: 72, done: true,  title: 'Feature spec: adaptive quiz engine v2',                   time: '01:30' },
    { off: 5,  mode: 'pomodoro', plan: 25, act: 20, done: false, title: 'Competitor analysis — UrbanLearn advisory', time: '03:00', abandoned: true },
    { off: 8,  mode: 'deep',     plan: 90, act: 91, done: true,  title: 'LearnBridge Q2 roadmap — prioritisation workshop doc',    time: '01:30' },
    { off: 8,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Async stakeholder update emails',                         time: '04:00' },
    { off: 9,  mode: 'deep',     plan: 60, act: 57, done: true,  title: 'PMI-ACP study: Agile frameworks Chapter 3',               time: '02:00' },
    { off: 10, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Figma prototype review with design team',                 time: '03:30' },
    { off: 10, mode: 'deep',     plan: 60, act: 60, done: true,  title: 'DataKraft monthly report — April data',                   time: '01:30' },
    { off: 11, mode: 'pomodoro', plan: 25, act: 22, done: true,  title: 'PMI-ACP mock test — set 4',                              time: '02:30' },
    { off: 12, mode: 'deep',     plan: 45, act: 42, done: true,  title: 'UrbanLearn advisory — content strategy doc',              time: '02:00' },
    { off: 14, mode: 'deep',     plan: 90, act: 87, done: true,  title: 'Q3 product strategy presentation — first draft',          time: '01:30' },
    { off: 15, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'User interview notes consolidation (6 sessions)',         time: '03:30' },
    { off: 15, mode: 'deep',     plan: 60, act: 63, done: true,  title: 'PMI-ACP study: iterative delivery & velocity',            time: '02:00' },
    { off: 16, mode: 'deep',     plan: 75, act: 70, done: true,  title: 'Feature spec: gamification layer for quiz module',        time: '01:30' },
    { off: 16, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'DataKraft invoice and scope check',                       time: '04:00' },
    { off: 17, mode: 'deep',     plan: 60, act: 58, done: true,  title: 'LearnBridge — A/B test analysis: notification timing',    time: '02:00' },
    { off: 17, mode: 'pomodoro', plan: 25, act: 15, done: false, title: 'Goa trip research (hotels, flights)', time: '05:00', abandoned: true },
    { off: 18, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Sprint retrospective notes & action items',               time: '03:00' },
    { off: 18, mode: 'deep',     plan: 90, act: 85, done: true,  title: 'Q3 product strategy presentation — final polish',         time: '01:30' },
    { off: 19, mode: 'deep',     plan: 60, act: 55, done: true,  title: 'PMI-ACP study: risk management in Agile',                 time: '02:00' },
    { off: 19, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Weekly OKR self-assessment update',                       time: '04:30' },
    { off: 20, mode: 'quick',    plan: 15, act: 12, done: true,  title: 'Goa hotel shortlist — final 3 options reviewed',          time: '05:00' },
  ]
  let n = 0
  for (const s of sessions) {
    const date = dateOffset(s.off)
    const startedAt = `${date}T${s.time}:00Z`
    const endedAt = new Date(new Date(startedAt).getTime() + (s.act ?? s.plan) * 60000).toISOString()
    const { error } = await db.from('focus_sessions').insert({
      user_id: UID, mode: s.mode, planned_minutes: s.plan, actual_minutes: s.act ?? null,
      completed: s.done, abandoned: s.abandoned ?? false, body_doubling_enabled: false,
      task_title: s.title, started_at: startedAt, ended_at: endedAt,
    })
    if (!error) n++; else console.log(`  ✗  focus "${s.title}": ${error.message}`)
  }
  console.log(`  ✔  ${n}/${sessions.length} focus sessions`)
}

// ── DECISIONS ─────────────────────────────────────────────────────────────────
async function seedDecisions() {
  console.log('\n🤔  Seeding decisions...')
  const decisions = [
    {
      question: 'Should I accept the Group PM offer from Flipkart (₹2.1L/month CTC) or stay at LearnBridge and target the internal promotion?',
      category: 'career', mode: 'compare', options: ['Accept Flipkart offer', 'Stay at LearnBridge for promotion'],
      created_at: '2026-04-20T03:30:00Z', favorite: true,
      result: {
        question: 'Flipkart Group PM (₹2.1L) vs LearnBridge promotion path',
        factors: ['Compensation', 'Career growth', 'Work-life balance', 'Mission alignment', 'Job stability'],
        options: [
          { label: 'Accept Flipkart offer', scores: { Compensation: 90, 'Career growth': 80, 'Work-life balance': 50, 'Mission alignment': 55, 'Job stability': 65 },
            pros: ['₹56K/month more than current CTC', 'Flipkart brand on resume — strong signal', 'Larger product scope (10M+ users vs 300K)'],
            cons: ['E-commerce not Priya\'s passion — EdTech feels more meaningful', 'Flipkart culture is known for long hours', 'Loses deep institutional knowledge at LearnBridge'],
            summary: 'Higher pay, bigger brand, but culture misalignment risk.' },
          { label: 'Stay at LearnBridge for promotion', scores: { Compensation: 60, 'Career growth': 70, 'Work-life balance': 80, 'Mission alignment': 90, 'Job stability': 75 },
            pros: ['EdTech mission aligns with personal values', 'Group PM role visible internally — promotion likely by April 2027', 'Maintains TTC-friendly work schedule'],
            cons: ['₹56K/month gap is significant for home savings goal', 'Internal promotion not guaranteed — depends on Q3 results', 'LearnBridge growth slower than competitor platforms'],
            summary: 'Mission fit and balance but opportunity cost is high.' },
        ],
        recommendation: 'Stay at LearnBridge with a plan: deliver strong Q3 results, formally discuss promotion timeline with manager in June, and re-evaluate external options in October 2026.',
        winner: 'Stay at LearnBridge for promotion',
      },
    },
    {
      question: 'Should I increase monthly SIP from ₹15,000 to ₹25,000 to reach the ₹20L home savings goal faster?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-04-27T04:00:00Z', favorite: false,
      result: {
        summary: 'Increasing the SIP by ₹10,000/month is financially viable given the current income surplus of ~₹18,000/month after all expenses. At ₹25,000/month in equity mutual funds, you would reach ₹20L in approximately 28 months (by September 2028) vs 38 months at ₹15,000.',
        recommendation: 'Increase SIP to ₹22,000 (not full ₹25,000) to preserve a ₹10K emergency buffer. Choose a 70/30 split: large-cap index fund + mid-cap flexi fund.',
        confidenceScore: 79, riskScore: 28, riskLevel: 'low',
        financialImpact: { summary: 'Extra ₹7,000/month investment. Reaches ₹20L goal ~8 months earlier.', monthlyCostChange: 7000, oneTimeCost: null, opportunityCost: 'Reduced dining-out and discretionary spending', affordabilityScore: 82 },
        timeImpact: 'Goal reached by ~Jan 2028 instead of Oct 2028 at current rate.',
        pros: ['Compounding benefit accelerates with higher principal', 'Forces positive spending discipline', 'Tax-efficient via ELSS if needed for 80C'],
        cons: ['Tighter monthly budget — less buffer for unexpected medical costs', 'TTC may increase healthcare expenses in 2026–27'],
        nextSteps: ['Set SIP increase from June 1 (after reviewing May payslip)', 'Check if ELSS allocation helps reach ₹1.5L 80C limit', 'Create separate emergency fund of ₹3L before increasing SIP'],
        memoryFactorsUsed: ['Financial goal: ₹20L by Dec 2027', 'Monthly income: ₹1,85,000'],
        dataSourcesUsed: ['Indian mutual fund return projections (CAGR 12% large-cap)', 'CPI inflation estimate 5.5%'],
      },
    },
    {
      question: 'Should I take the DataKraft consulting project to a paid retainer or keep it as hourly?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-03T02:30:00Z', favorite: false,
      result: {
        summary: 'DataKraft wants a 3-month retainer at ₹15,000/month (fixed) vs current hourly billing averaging ₹18,000/month. The retainer reduces income but guarantees predictability. Given the TTC priority, lower stress from variable income may outweigh the ₹3,000/month gap.',
        recommendation: 'Accept the retainer at ₹17,000/month (negotiate up from ₹15,000). Frame it as value-based pricing — their product has shipped 3 features with your input. The guaranteed income supports financial stability during a health-focused period.',
        confidenceScore: 73, riskScore: 22, riskLevel: 'low',
        financialImpact: { summary: 'Guaranteed ₹17,000/month vs variable ₹18,000 average (but can be ₹12K–24K).', monthlyCostChange: -1000, oneTimeCost: null, opportunityCost: null, affordabilityScore: 90 },
        pros: ['Predictable freelance income — easier to plan savings', 'Fewer billing hours — more focus on quality', 'Formalises relationship with DataKraft'],
        cons: ['May miss upside months if project scope grows', 'Lock-in for 3 months reduces flexibility'],
        nextSteps: ['Counter-propose ₹17,000/month, 3-month initial term', 'Draft simple consulting agreement with IP carve-out', 'Add exit clause: 30-day written notice by either party'],
        memoryFactorsUsed: ['Monthly income: freelance ~₹40K', 'Concern: job security — want stable income buffers'],
        dataSourcesUsed: ['Indian product consulting market rates 2026'],
      },
    },
    {
      question: 'Goa July trip: stay in North Goa (Calangute area) or South Goa (Palolem) for a 5-night getaway?',
      category: 'family', mode: 'compare', options: ['North Goa — Calangute', 'South Goa — Palolem'],
      created_at: '2026-05-06T04:00:00Z', favorite: false,
      result: {
        question: 'North Goa vs South Goa for July anniversary trip',
        factors: ['Beach quality', 'Budget', 'Crowd level', 'Activities variety', 'Ease of access'],
        options: [
          { label: 'North Goa — Calangute', scores: { 'Beach quality': 60, Budget: 70, 'Crowd level': 30, 'Activities variety': 90, 'Ease of access': 95 },
            pros: ['More restaurant and nightlife options', 'Easier to reach from airport (30 min)', 'More water sport options for Vikram'],
            cons: ['Crowded in July even off-season', 'Beach quality inconsistent near touristy spots', 'Noisier — not relaxing for TTC recovery rest'],
            summary: 'Convenient and activities-rich but noisier and more crowded.' },
          { label: 'South Goa — Palolem', scores: { 'Beach quality': 92, Budget: 65, 'Crowd level': 75, 'Activities variety': 60, 'Ease of access': 60 },
            pros: ['Quieter, more peaceful — better for rest and relaxation', 'Palolem beach consistently rated among India\'s best', 'Better for couples — more intimate atmosphere'],
            cons: ['60–75 min from airport in July monsoon traffic', 'Fewer restaurant options (but quality is high)', 'Limited activities beyond beach and kayaking'],
            summary: 'More restful, beautiful beach — ideal for anniversary relaxation.' },
        ],
        recommendation: 'Book South Goa, Palolem. The peace and beauty of the beach aligns much better with the goal of a restorative couple\'s trip. Vikram can kayak and Priya can rest.',
        winner: 'South Goa — Palolem',
      },
    },
    {
      question: 'Should I enrol in the PMI-ACP exam in September 2026 or wait until November?',
      category: 'education', mode: 'analyze', options: [], created_at: '2026-05-08T03:00:00Z', favorite: true,
      result: {
        summary: 'The PMI-ACP exam preparation is tracking on schedule — 60% of study material completed by May 9. September is achievable with 3 more months of focused preparation (1 hour/day). Waiting until November gives more buffer but delays the credential by 2 months with no clear benefit.',
        recommendation: 'Book September exam slot. This gives exactly 4 months, aligns with Q3 performance review cycle, and adds the credential before LearnBridge promotion discussions in October.',
        confidenceScore: 81, riskScore: 25, riskLevel: 'low',
        financialImpact: { summary: 'Exam fee: ~₹27,000 (USD 330). No significant change in study cost.', monthlyCostChange: 0, oneTimeCost: 27000, opportunityCost: '1 hour/day study time for 4 months', affordabilityScore: 85 },
        pros: ['Credential ready before October internal promotion review', 'September timing avoids monsoon stress of delay', 'Builds momentum — positive anxiety drives focus'],
        cons: ['3 months remaining on study plan — tight if work intensifies in Q3', 'Exam failure means rebooking at additional cost'],
        nextSteps: ['Book September 15 exam slot on PMI portal this week', 'Increase study to 1.5h/day from June (before Q3 sprint)', 'Complete 2 full mock exams in August'],
        memoryFactorsUsed: ['Goal: PMI-ACP by October 2026', 'Work schedule: deep work 7–9am available'],
        dataSourcesUsed: ['PMI-ACP exam preparation guidelines 2026'],
      },
    },
  ]
  let n = 0
  for (const d of decisions) {
    const { error } = await db.from('decision_logs').insert({
      user_id: UID, question: d.question, category: d.category, mode: d.mode,
      options: d.options, context_snapshot: {}, result: d.result, favorite: d.favorite, created_at: d.created_at,
    })
    if (!error) n++; else console.log(`  ✗  decision: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${decisions.length} decision logs`)
}

// ── BUSINESS ──────────────────────────────────────────────────────────────────
async function seedBusiness() {
  console.log('\n💼  Seeding business...')
  const dk = await ins('business_clients', {
    user_id: UID, name: 'DataKraft Solutions', company: 'DataKraft Solutions Pvt Ltd',
    email: 'accounts@datakraft.in', phone: '+912025556789', address: 'Baner, Pune 411045', currency: 'INR',
    notes: 'EdTech platform — PM consulting for analytics product. Monthly retainer under discussion.',
  }, 'client: DataKraft')
  const ul = await ins('business_clients', {
    user_id: UID, name: 'UrbanLearn', company: 'UrbanLearn Technologies Pvt Ltd',
    email: 'founder@urbanlearn.co', phone: '+918041112233', address: 'Indiranagar, Bangalore 560038', currency: 'INR',
    notes: 'Early-stage startup — advisory for product-market fit. Equity + ₹8,000/month retainer.',
  }, 'client: UrbanLearn')
  if (!dk || !ul) return

  const projDK = await ins('business_projects', {
    user_id: UID, client_id: dk.id, name: 'DataKraft — Analytics Dashboard PM Consulting',
    status: 'active', start_date: '2026-01-01', end_date: '2026-06-30',
    fee: 18000, currency: 'INR', notes: 'Monthly hours-based consulting; 10–15 hrs/month',
  }, 'project: DataKraft analytics')
  const projUL = await ins('business_projects', {
    user_id: UID, client_id: ul.id, name: 'UrbanLearn — Product Advisory (seed stage)',
    status: 'active', start_date: '2025-10-01', end_date: null,
    fee: 8000, currency: 'INR', notes: '0.25% equity + ₹8K/month advisory retainer',
  }, 'project: UrbanLearn advisory')

  if (projDK) {
    await ins('business_invoices', {
      user_id: UID, client_id: dk.id, project_id: projDK.id,
      invoice_no: 'PS-2026-001', issued_at: '2026-02-28', due_at: '2026-03-14',
      items: [{ description: 'PM Consulting Feb 2026 — 12 hours @ ₹1,500/hr', qty: 12, rate: 1500, amount: 18000 }],
      subtotal: 18000, tax_pct: 18, tax_amt: 3240, discount_amt: 0, total: 21240, currency: 'INR', status: 'paid', paid_at: '2026-03-12',
    }, 'invoice: PS-2026-001 (paid)')
    await ins('business_invoices', {
      user_id: UID, client_id: dk.id, project_id: projDK.id,
      invoice_no: 'PS-2026-002', issued_at: '2026-04-30', due_at: '2026-05-14',
      items: [{ description: 'PM Consulting Apr 2026 — 13 hours @ ₹1,500/hr', qty: 13, rate: 1500, amount: 19500 }],
      subtotal: 19500, tax_pct: 18, tax_amt: 3510, discount_amt: 0, total: 23010, currency: 'INR', status: 'sent',
    }, 'invoice: PS-2026-002 (sent)')
  }
  if (projUL) {
    await ins('business_invoices', {
      user_id: UID, client_id: ul.id, project_id: projUL.id,
      invoice_no: 'PS-2026-003', issued_at: '2026-04-30', due_at: '2026-05-15',
      items: [{ description: 'UrbanLearn Advisory Retainer — April 2026', qty: 1, rate: 8000, amount: 8000 }],
      subtotal: 8000, tax_pct: 18, tax_amt: 1440, discount_amt: 0, total: 9440, currency: 'INR', status: 'paid', paid_at: '2026-05-02',
    }, 'invoice: PS-2026-003 (paid)')
  }

  const expenses = [
    { category: 'software', vendor: 'Notion', amount: 960, occurred_at: '2026-04-01', description: 'Notion Pro annual plan — workspace for consulting deliverables' },
    { category: 'software', vendor: 'Figma', amount: 1200, occurred_at: '2026-03-01', description: 'Figma Professional — product wireframing and prototyping' },
    { category: 'travel', vendor: 'IndiGo', amount: 5800, occurred_at: '2026-03-18', description: 'Bangalore → Hyderabad → Bangalore (DataKraft stakeholder meeting)' },
    { category: 'professional_fees', vendor: 'PMI India Chapter', amount: 8500, occurred_at: '2026-02-15', description: 'PMI-ACP exam registration + study materials' },
    { category: 'office', vendor: '91springboard', amount: 2500, occurred_at: '2026-04-01', description: 'Co-working day passes × 5 (Indiranagar hub)' },
    { category: 'marketing', vendor: 'LinkedIn', amount: 1699, occurred_at: '2026-04-01', description: 'LinkedIn Premium Career — April subscription' },
  ]
  let n = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'INR', is_billable: false, ...e })
    if (!error) n++; else console.log(`  ✗  expense: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${expenses.length} business expenses`)
}

// ── HOME ──────────────────────────────────────────────────────────────────────
async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const wm = await ins('home_assets', { user_id: UID, name: 'LG 8kg Front Load Washing Machine', type: 'appliance', brand: 'LG', model: 'FHM1408BDL', purchased_at: '2022-06-10', warranty_until: '2027-06-10', cost: 45000, notes: 'Koramangala apartment — laundry room' }, 'asset: LG WM')
  const fridge = await ins('home_assets', { user_id: UID, name: 'Samsung 253L Refrigerator', type: 'appliance', brand: 'Samsung', model: 'RT28C3122S8', purchased_at: '2021-08-15', warranty_until: '2026-08-15', cost: 28000, notes: 'Kitchen — Curd Maker feature used daily' }, 'asset: Samsung Fridge')
  const ac = await ins('home_assets', { user_id: UID, name: 'LG 1.5-ton Split AC (Living Room)', type: 'appliance', brand: 'LG', model: 'MS-Q18YNZA', purchased_at: '2022-04-20', warranty_until: '2027-04-20', cost: 38000, notes: '5-star rated — high use Apr–Sep' }, 'asset: LG AC')
  const activa = await ins('home_assets', { user_id: UID, name: 'Honda Activa 6G', type: 'vehicle', brand: 'Honda', model: 'Activa 6G DLX (2023)', serial_no: 'ME4JF7174NB002345', purchased_at: '2023-02-10', warranty_until: '2025-02-10', cost: 79000, notes: 'Registration KA-05-HM-4421 — daily commute' }, 'asset: Honda Activa')
  const laptop = await ins('home_assets', { user_id: UID, name: 'Dell Inspiron 15 (Personal)', type: 'electronics', brand: 'Dell', model: 'Inspiron 15 3530', purchased_at: '2024-01-05', warranty_until: '2026-01-05', cost: 62000, notes: 'Personal laptop for consulting deliverables' }, 'asset: Dell Laptop')

  if (ac) await ins('home_maintenance', { user_id: UID, asset_id: ac.id, title: 'AC Annual Service & Gas Check', category: 'service', recurrence_months: 12, last_done_at: '2025-04-15', next_due_at: '2026-04-15', vendor: 'Daikin Service Centre Koramangala', cost: 1200, is_active: true }, 'maint: AC service')
  if (activa) {
    await ins('home_maintenance', { user_id: UID, asset_id: activa.id, title: 'Honda Activa Free Service (3rd)', category: 'service', recurrence_months: 6, last_done_at: '2025-08-10', next_due_at: '2026-08-10', vendor: 'Honda Service Centre, Sarjapur Road', cost: 800, is_active: true }, 'maint: Activa service')
    await ins('home_maintenance', { user_id: UID, asset_id: activa.id, title: 'Tyre Replacement', category: 'service', recurrence_months: 24, last_done_at: '2024-02-01', next_due_at: '2026-02-01', vendor: null, cost: 2200, is_active: true, notes: 'Both tyres — check tread depth in Jan 2026' }, 'maint: Activa tyres')
  }
  if (wm) await ins('home_maintenance', { user_id: UID, asset_id: wm.id, title: 'Washing Machine Drum Cleaning', category: 'cleaning', recurrence_months: 3, last_done_at: '2026-02-15', next_due_at: '2026-05-15', vendor: null, cost: 0, is_active: true }, 'maint: WM clean')

  const bills = [
    { utility: 'electricity', provider: 'BESCOM', amount: 1350, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'BESCOM-500009821' },
    { utility: 'electricity', provider: 'BESCOM', amount: 1180, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'BESCOM-500009821' },
    { utility: 'electricity', provider: 'BESCOM', amount: 1520, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'BESCOM-500009821' },
    { utility: 'water', provider: 'BWSSB', amount: 820, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'BWSSB-80044213' },
    { utility: 'water', provider: 'BWSSB', amount: 790, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'BWSSB-80044213' },
    { utility: 'water', provider: 'BWSSB', amount: 850, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'BWSSB-80044213' },
    { utility: 'internet', provider: 'ACT Fibernet', amount: 899, bill_date: '2026-03-05', due_date: '2026-03-10', is_paid: true, account_no: 'ACT-BLR-4421890' },
    { utility: 'internet', provider: 'ACT Fibernet', amount: 899, bill_date: '2026-04-05', due_date: '2026-04-10', is_paid: true, account_no: 'ACT-BLR-4421890' },
    { utility: 'internet', provider: 'ACT Fibernet', amount: 899, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'ACT-BLR-4421890' },
    { utility: 'phone', provider: 'Jio', amount: 299, bill_date: '2026-03-15', due_date: '2026-03-15', is_paid: true, account_no: 'JIO-9008214421' },
    { utility: 'phone', provider: 'Jio', amount: 299, bill_date: '2026-04-15', due_date: '2026-04-15', is_paid: true, account_no: 'JIO-9008214421' },
    { utility: 'phone', provider: 'Jio', amount: 299, bill_date: '2026-05-05', due_date: '2026-05-05', is_paid: false, account_no: 'JIO-9008214421' },
  ]
  let n = 0
  for (const b of bills) {
    const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b })
    if (!error) n++; else console.log(`  ✗  bill: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${bills.length} utility bills`)
}

// ── TRAVEL ────────────────────────────────────────────────────────────────────
async function seedTravel() {
  console.log('\n✈️   Seeding travel...')
  const goa = await ins('trips', { user_id: UID, destination: 'Goa, India', start_date: '2026-07-04', end_date: '2026-07-09', status: 'planning', budget_total: 35000, currency: 'INR', travellers: 2, notes: '5th wedding anniversary trip with Vikram. South Goa — Palolem.', cover_emoji: '🏖️' }, 'trip: Goa')
  if (goa) {
    const items = [
      { type: 'flight', title: 'IndiGo 6E-XXX Bangalore → Goa (GOI)', starts_at: '2026-07-04T04:00:00+05:30', location: 'Kempegowda International Airport, Bangalore', cost: 8400, order_index: 1 },
      { type: 'hotel', title: 'Ciaran\'s Palolem Beach Resort', starts_at: '2026-07-04T14:00:00+05:30', ends_at: '2026-07-09T12:00:00+05:30', location: 'Palolem Beach, South Goa', cost: 18000, booking_ref: null, order_index: 2, notes: 'Sea-facing cottage — 5 nights' },
      { type: 'activity', title: 'Kayaking & Dolphin Spotting Tour', starts_at: '2026-07-06T07:00:00+05:30', location: 'Palolem Beach, Goa', cost: 2400, order_index: 3 },
      { type: 'meal', title: 'Anniversary dinner — Ourem 88 Palolem', starts_at: '2026-07-05T19:30:00+05:30', location: 'Palolem Village, South Goa', cost: 3000, order_index: 4 },
      { type: 'flight', title: 'IndiGo 6E-XXX Goa (GOI) → Bangalore', starts_at: '2026-07-09T17:00:00+05:30', location: 'Manohar International Airport, Goa', cost: 7200, order_index: 5 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: goa.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Passports / Aadhaar', category: 'documents', qty: 2, is_packed: false },
      { item: 'Sunscreen SPF 50+', category: 'toiletries', qty: 2, is_packed: false },
      { item: 'Swimwear', category: 'clothing', qty: 2, is_packed: false },
      { item: 'Light cotton dresses (4)', category: 'clothing', qty: 4, is_packed: false },
      { item: 'Mosquito repellent', category: 'health', qty: 1, is_packed: false },
      { item: 'Waterproof sandals', category: 'clothing', qty: 2, is_packed: false },
      { item: 'Portable charger', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Cash ₹5,000 (INR)', category: 'documents', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: goa.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Goa: ${iOk} items, ${pOk} packing`)
  }

  const hyd = await ins('trips', { user_id: UID, destination: 'Hyderabad, India', start_date: '2026-03-18', end_date: '2026-03-20', status: 'completed', budget_total: 12000, currency: 'INR', travellers: 1, notes: 'Product leaders summit — DataKraft stakeholder meeting.', cover_emoji: '🏢' }, 'trip: Hyderabad')
  if (hyd) {
    const items = [
      { type: 'flight', title: 'IndiGo BLR → HYD', starts_at: '2026-03-18T07:30:00+05:30', location: 'Bangalore Airport', cost: 5800, is_done: true, order_index: 1 },
      { type: 'hotel', title: 'Novotel Hyderabad Airport', starts_at: '2026-03-18T12:00:00+05:30', ends_at: '2026-03-20T11:00:00+05:30', location: 'Shamshabad, Hyderabad', cost: 7200, is_done: true, order_index: 2 },
      { type: 'activity', title: 'Product Leaders Summit 2026', starts_at: '2026-03-19T09:00:00+05:30', location: 'HITEX Exhibition Centre, Hyderabad', cost: 0, is_done: true, order_index: 3 },
      { type: 'flight', title: 'IndiGo HYD → BLR', starts_at: '2026-03-20T16:00:00+05:30', location: 'Rajiv Gandhi International Airport', cost: 5200, is_done: true, order_index: 4 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: hyd.id, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Business casual (2 outfits)', category: 'clothing', qty: 2, is_packed: true },
      { item: 'MacBook Pro + charger', category: 'electronics', qty: 1, is_packed: true },
      { item: 'Business cards', category: 'work', qty: 1, is_packed: true },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: hyd.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Hyderabad: ${iOk} items, ${pOk} packing`)
  }

  const shimla = await ins('trips', { user_id: UID, destination: 'Shimla & Manali, India', start_date: '2026-10-08', end_date: '2026-10-15', status: 'planning', budget_total: 55000, currency: 'INR', travellers: 2, notes: 'Anniversary trip (Oct 10 = 5 years). Delhi → Shimla → Manali road trip.', cover_emoji: '🏔️' }, 'trip: Shimla-Manali')
  if (shimla) {
    const items = [
      { type: 'flight', title: 'Air India BLR → DEL (depart)', starts_at: '2026-10-08T06:00:00+05:30', location: 'Kempegowda International Airport', cost: 9200, order_index: 1 },
      { type: 'activity', title: 'Delhi → Shimla (HRTC Volvo bus)', starts_at: '2026-10-08T21:30:00+05:30', location: 'ISBT Kashmere Gate, Delhi', cost: 1200, order_index: 2 },
      { type: 'hotel', title: 'Wildflower Hall Shimla (3 nights)', starts_at: '2026-10-09T12:00:00+05:30', ends_at: '2026-10-12T11:00:00+05:30', location: 'Mashobra, Shimla', cost: 22000, order_index: 3 },
      { type: 'activity', title: 'Shimla → Manali (road trip, hired cab)', starts_at: '2026-10-12T08:00:00+05:30', location: 'Shimla', cost: 5500, order_index: 4 },
      { type: 'hotel', title: 'Apple Country Resort Manali (3 nights)', starts_at: '2026-10-12T18:00:00+05:30', ends_at: '2026-10-15T10:00:00+05:30', location: 'Old Manali, Manali', cost: 10500, order_index: 5 },
      { type: 'flight', title: 'Air India DEL → BLR (return)', starts_at: '2026-10-15T20:00:00+05:30', location: 'Indira Gandhi International Airport', cost: 8800, order_index: 6 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: shimla.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Shimla-Manali: ${iOk} items`)
  }
}

// ── PROTECTION ────────────────────────────────────────────────────────────────
async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'SBI Reward Points Phishing SMS', content: 'SBI: Your 84,000 reward points worth Rs.8,400 are expiring. Redeem now: bit.ly/sbi-rwd-priya', risk_level: 'high', result_summary: 'Classic bank reward-points phishing. SBI never sends redemption links via SMS. The bit.ly URL hides a credential harvesting page.', red_flags: ['Unofficial short URL (not sbi.co.in)', 'Creates urgency with "expiring" points', 'No greeting — bulk message format', 'SBI reward points portal is only via YONO app or SBI website'], safe_next_step: 'Delete immediately. Report to SBI helpline 1800 1111 09. Report to cybercrime.gov.in.' },
    { type: 'scam', title: 'Fake WFH Job Offer — WhatsApp', content: 'Hi Priya, we found your LinkedIn profile. We offer remote Product Manager role at ₹3.8L/month for just 3 hours/day. No experience required. Pay ₹2,000 registration to start.', risk_level: 'high', result_summary: 'This is a job scam. No legitimate employer requests registration fees. The ₹3.8L/month for 3 hours/day offer is fabricated — it is 5× market rate for part-time PM work.', red_flags: ['Upfront registration fee of ₹2,000', 'Unsolicited WhatsApp contact', 'Salary far above market rate', '"No experience required" for a PM role'], safe_next_step: 'Block and report on WhatsApp. Report to National Cyber Crime helpline 1930.' },
    { type: 'contract', title: 'DataKraft Consulting Agreement — IP Clause', content: 'All analyses, reports, frameworks, and deliverables created by the Consultant under this agreement shall become the exclusive intellectual property of DataKraft Solutions upon completion, regardless of pre-existing knowledge or tools used by the Consultant.', risk_level: 'medium', result_summary: 'The IP clause is overly broad. The phrase "regardless of pre-existing knowledge or tools" would transfer ownership of your PM frameworks and templates that you use across clients — not just the DataKraft-specific output.', red_flags: ['Transfers pre-existing methodologies and frameworks to client', 'No carve-out for general knowledge and skills developed independently', 'No clause permitting use of similar work with other clients'], safe_next_step: 'Request an IP carve-out: "deliverables specifically created for DataKraft" — not pre-existing tools and frameworks. Consult a tech-startup lawyer.' },
    { type: 'subscription', title: 'LinkedIn Premium Auto-Renewal', content: 'LinkedIn Premium Career renews automatically for ₹1,699/month on May 15. To cancel, go to Settings > Premium > Manage Subscription.', risk_level: 'low', result_summary: 'Legitimate notification. LinkedIn Premium is a real cost but assess ROI — if job hunting is not active, the ₹1,699/month may not justify renewal.', red_flags: [], safe_next_step: 'Evaluate ROI: check InMail usage, profile view stats, and job applications in last 30 days. Cancel if not actively job hunting.' },
    { type: 'quote', title: 'Honda Activa Comprehensive Insurance Renewal (HDFC Ergo)', content: 'HDFC Ergo Motor Insurance: Honda Activa 6G, KA-05-HM-4421. IDV: ₹58,500. OD premium: ₹1,890. TP premium: ₹714. Total: ₹2,604/year.', risk_level: 'low', result_summary: 'Competitive and fairly priced renewal. IDV of ₹58,500 is slightly low for a 2023 Activa (current market ₹62,000–65,000) — request IDV revision upward before renewing.', red_flags: ['IDV ₹58,500 is below current market value for a 2023 Activa — risks under-settlement on claims'], safe_next_step: 'Request IDV increase to ₹63,000. Compare with Acko and Bajaj Allianz — Acko often cheaper for two-wheelers via app.' },
    { type: 'contract', title: 'Koramangala Apartment Lease Renewal', content: 'The Tenant agrees to pay ₹28,000 per month for a period of 11 months commencing 1st November 2026. A security deposit of ₹56,000 (2 months\' rent) is required. Rent shall increase by 10% per annum at renewal.', risk_level: 'medium', result_summary: 'The 10% annual escalation clause is above Bangalore market norms (5–7%). The 11-month lease (not 12) is standard Karnataka practice to avoid long-term lease stamp duty, which is fine.', red_flags: ['10% rent escalation is above market standard for Koramangala (typically 5–7%)', 'No clause for early exit without forfeiting security deposit'], safe_next_step: 'Negotiate escalation to 7% and add a 2-month notice early-exit clause. Get the agreement registered with Karnataka sub-registrar.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'Honda Activa Insurance Renewal 2026 — HDFC Ergo', amount: 2604, currency: 'INR', category: 'insurance', region: 'Bangalore, Karnataka', result_summary: 'Comprehensive cover at ₹2,604/year. IDV needs revision to ₹63,000 before signing.', risk_level: 'low', negotiation_script: 'I have been an HDFC Ergo customer since 2023 with zero claims. I need the IDV revised to ₹63,000 for the 2023 Activa — current market value. Please confirm the revised quote.' },
    { title: 'LG AC Annual Service — Daikin Centre', amount: 1200, currency: 'INR', category: 'home_service', region: 'Koramangala, Bangalore', result_summary: 'Fair rate for comprehensive AC service. Last serviced April 2025 — due for 2026 annual check.', risk_level: 'low', negotiation_script: 'I have used your service centre for 3 years. I would appreciate a loyal customer discount — ₹999 for a one-unit comprehensive service? I am happy to leave a Google review.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'rate_increase', tone: 'professional', context: 'Requesting ₹1,700/hr rate increase from DataKraft Solutions for Q3 2026 consulting', script: `Hi [Contact],\n\nThank you for the continued partnership — it has been great seeing the analytics product ship 3 major features this year.\n\nAs we enter Q3, I wanted to discuss a rate adjustment. Given the value delivered and current market benchmarks for senior PM consulting in Bangalore (₹1,800–2,200/hr), I am proposing to move to ₹1,700/hr from July 1, 2026.\n\nThis represents a modest 13% increase and keeps our engagement well within market range. I am happy to discuss further.\n\nBest,\nPriya` },
    { type: 'payment_terms', tone: 'firm', context: 'Requesting invoice payment within 15 days net from DataKraft (currently slow payers)', script: `Hi [Accounts Team],\n\nI am following up on Invoice PS-2026-002 (₹23,010) issued April 30, due May 14.\n\nAs per our agreement, payment is due within 14 days of invoice date. I would appreciate settlement by May 16 to avoid the 2% monthly late payment charge outlined in our contract.\n\nPlease confirm the payment date.\n\nBest,\nPriya Sharma` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

// ── LEGAL ─────────────────────────────────────────────────────────────────────
async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'Income Tax Return AY 2026-27', type: 'other', due_date: '2026-07-31', amount: null, currency: 'INR', status: 'pending', authority: 'Income Tax Department of India', reference_no: 'PAN-BQRPS9901K', notes: 'ITR-1 for FY 2025-26. Includes salary + consulting (Form 16 + bank statements). Appoint CA by June 15.' },
    { title: 'Advance Tax Q1 2026-27 (June instalment)', type: 'other', due_date: '2026-06-15', amount: 18000, currency: 'INR', status: 'pending', authority: 'Income Tax Department', reference_no: null, notes: 'Advance tax on consulting income (not covered by TDS). 15% of annual consulting tax liability.' },
    { title: 'Professional Tax — Karnataka 2026-27', type: 'other', due_date: '2026-04-30', amount: 2500, currency: 'INR', status: 'filed', authority: 'Karnataka Commercial Taxes Department', reference_no: 'PT-KA-2025-881234', notes: 'Annual professional tax paid by employer on Priya\'s behalf — confirm with HR.' },
    { title: 'Rental Agreement Registration Renewal', type: 'renewal', due_date: '2026-10-31', amount: 1500, currency: 'INR', status: 'pending', authority: 'Karnataka Sub-Registrar Office', reference_no: null, notes: '11-month lease expires Oct 31 2026. Register new agreement 30 days before expiry.' },
    { title: 'Honda Activa Pollution Certificate (PUC)', type: 'renewal', due_date: '2026-08-10', amount: 100, currency: 'INR', status: 'pending', authority: 'Karnataka Transport Department', reference_no: 'KA-05-HM-4421', notes: 'PUC certificate expires Aug 10 2026 — renew at any petrol station.' },
    { title: 'PMI-ACP Exam Registration Deadline', type: 'other', due_date: '2026-08-15', amount: 27000, currency: 'INR', status: 'pending', authority: 'Project Management Institute (PMI)', reference_no: null, notes: 'September 2026 exam slot — book before August 15 to confirm preferred date/centre.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'DataKraft Consulting Agreement — Jan 2026', doc_type: 'contract', original_text: 'CONSULTING AGREEMENT\nParties: DataKraft Solutions Pvt Ltd (Client) and Priya Sharma (Consultant).\nScope: Product Management advisory for DataKraft analytics platform.\nFees: ₹1,500/hour, invoiced monthly, payable within 14 days of invoice.\nIP: All deliverables created specifically for DataKraft shall become Client\'s property upon payment.\nTerm: January 1, 2026 to June 30, 2026, renewable by mutual agreement.\nGoverning Law: Laws of India, jurisdiction: Pune courts.', summary_md: '## DataKraft Consulting Agreement\n\n**What:** 6-month PM consulting contract at ₹1,500/hr, monthly billing.\n\n**Key terms:**\n- Start: Jan 1 – Jun 30, 2026 (renewable)\n- Payment: 14 days from invoice\n- IP: Deliverables for DataKraft → DataKraft ownership\n- Jurisdiction: Pune\n\n**Action needed:** Negotiate IP carve-out before renewing.', key_points: ['₹1,500/hr rate — market rate is ₹1,700–2,200 for senior PMs', 'IP clause covers deliverables created specifically for DataKraft', '14-day payment terms — reasonable', '6-month term — opportunity to renegotiate in June'], red_flags: ['Broad IP clause could be interpreted to include reusable PM templates'], expires_at: '2026-06-30', notes: 'Up for renewal in June 2026. Negotiate rate increase + IP carve-out.' },
    { name: 'Koramangala Apartment Rental Agreement 2025', doc_type: 'rental', original_text: 'RENTAL AGREEMENT\nLandlord: Suresh Nair\nTenant: Priya Sharma & Vikram Sharma\nProperty: Flat 4B, 5th Block, Koramangala, Bangalore 560095\nRent: ₹28,000/month\nTerm: November 1, 2025 – September 30, 2026 (11 months)\nSecurity Deposit: ₹56,000\nRent Escalation: 10% per annum on renewal\nRegistered with BBMP.', summary_md: '## Koramangala Rental Agreement\n\n**What:** 11-month lease at ₹28,000/month.\n\n**Key terms:**\n- Period: Nov 2025 – Sep 2026\n- Deposit: ₹56,000 (refundable)\n- Escalation: 10% at renewal (above market — negotiate down to 7%)\n\n**Action:** Begin renewal discussions by August 2026.', key_points: ['Monthly rent ₹28,000 — fair for Koramangala 2BHK', 'Security deposit ₹56,000 — confirm deduction conditions in writing', '10% escalation clause — above Bangalore market norm of 5–7%', 'Registered with BBMP — legally protected'], red_flags: ['10% escalation is above market standard'], expires_at: '2026-09-30', notes: 'Renewal due Sep 2026 — start negotiation by Aug.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'Income Tax Return (ITR-1) AY 2026-27', category: 'tax', frequency: 'annual', last_done_at: '2025-07-20', next_due_at: '2026-07-31', is_done: false, applicable: true, notes: 'FY 2025-26. Salary + consulting income. File before July 31.' },
    { item: 'Advance Tax Payment (Quarterly)', category: 'tax', frequency: 'quarterly', last_done_at: '2026-03-15', next_due_at: '2026-06-15', is_done: false, applicable: true, notes: 'Applies to consulting income not covered by TDS.' },
    { item: 'GST Registration (if consulting crosses ₹20L threshold)', category: 'business', frequency: 'annual', last_done_at: null, next_due_at: '2026-12-31', is_done: false, applicable: true, notes: 'Watch: if annual consulting income crosses ₹20L in FY 2026-27, GST registration becomes mandatory.' },
    { item: 'Honda Activa Insurance Renewal', category: 'personal', frequency: 'annual', last_done_at: '2025-02-10', next_due_at: '2026-02-10', is_done: false, applicable: true, notes: 'HDFC Ergo comprehensive — review IDV at renewal.' },
    { item: 'Honda Activa PUC Certificate', category: 'personal', frequency: 'annual', last_done_at: '2025-08-10', next_due_at: '2026-08-10', is_done: false, applicable: true, notes: 'Renew at any authorised petrol station before August 10.' },
    { item: 'Employee PF Annual Statement Review', category: 'business', frequency: 'annual', last_done_at: '2025-05-01', next_due_at: '2026-05-01', is_done: true, applicable: true, notes: 'Download UAN passbook annually from epfindia.gov.in — verify LearnBridge contributions.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

// ── BRIEFINGS ─────────────────────────────────────────────────────────────────
async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, Priya.** Sunday — and a productive week ahead. Your DataKraft invoice PS-2026-002 (₹23,010) is due May 14 — it\'s still outstanding. The PMI-ACP study plan is tracking well, but this week\'s target is finishing Chapter 5 (risk management). Vikram\'s birthday is less than 2 months away — March felt closer than it was. **Today\'s one thing: set aside 45 minutes for a PMI mock test.** Low stress, high gain.', highlights: [{ label: 'Pending invoice', value: '₹23,010 due May 14', link: '/business', emoji: '🧾' }, { label: 'Unpaid bills', value: '3', link: '/home', emoji: '💡' }, { label: 'Next trip', value: 'Goa (Jul 4)', link: '/travel', emoji: '✈️' }, { label: 'Top goal', value: 'PMI-ACP by Oct 2026', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-04', content_md: '**Good morning, Priya.** Monday. ACT Fibernet bill (₹899) is due today — pay it during lunch. Your Q3 product strategy presentation is mid-draft; this is the week to complete it before sprint cycle intensifies. The Goa hotel isn\'t booked yet — prices go up closer to July. **One thing: book the Goa hotel today** before rates climb in monsoon season. You\'ve made the decision (Palolem) — just execute it.', highlights: [{ label: 'Pending invoice', value: '₹23,010 due May 14', link: '/business', emoji: '🧾' }, { label: 'ACT bill due today', value: '₹899', link: '/home', emoji: '💡' }, { label: 'Trip not booked', value: 'Goa Jul 4', link: '/travel', emoji: '✈️' }, { label: 'Goal', value: 'Q3 product strategy', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-05', content_md: '**Good morning, Priya.** Great yoga session this morning — your streak is building. 🌱 You\'ve completed 12 of the last 14 days on the morning yoga habit. The UrbanLearn advisory retainer (₹9,440) came in Friday — good cash flow this month. DataKraft invoice still outstanding though. **Focus today: finish the Q3 strategy presentation deck — you have a 2-hour deep work window at 7am.** Make it count.', highlights: [{ label: 'Habit streak', value: 'Yoga 12/14 days', link: '/habits', emoji: '🌱' }, { label: 'Pending invoice', value: 'DataKraft ₹23,010', link: '/business', emoji: '🧾' }, { label: 'Fitness goal', value: '10K run — Oct 2026', link: '/career', emoji: '🏃' }, { label: 'Savings', value: '₹11.4L of ₹20L goal', link: '/money', emoji: '💰' }] },
    { date: '2026-05-06', content_md: '**Good morning, Priya.** Midweek energy check. Your BESCOM bill (₹1,520) is due by May 20 — not urgent but worth logging. The PMI-ACP Chapter 5 target should wrap up today. The DataKraft retainer negotiation conversation is overdue — you\'ve been meaning to send the counter-proposal. **Today\'s priority: send the DataKraft retainer counter-proposal email (₹17,000/month, 3-month term).** You\'ve already made the decision.', highlights: [{ label: 'Pending invoice', value: '₹23,010 due May 14', link: '/business', emoji: '🧾' }, { label: 'BESCOM bill', value: '₹1,520 due May 20', link: '/home', emoji: '💡' }, { label: 'PMI-ACP progress', value: 'Ch 5 in progress', link: '/career', emoji: '🎯' }, { label: 'Next trip', value: 'Goa Jul 4', link: '/travel', emoji: '✈️' }] },
    { date: '2026-05-07', content_md: '**Good morning, Priya.** Thursday — the Q3 presentation is almost ready. Good progress this week. Your Activa PUC is due August 10 — comfortable runway, but worth a calendar reminder. The Shimla-Manali October trip is still in the planning stage — flights will get expensive by July. **Today\'s one thing: follow up with DataKraft accounts on invoice PS-2026-002.** Polite but firm — it\'s been a week since it was due.', highlights: [{ label: 'Pending invoice', value: '₹23,010 — follow up today', link: '/business', emoji: '🧾' }, { label: 'Upcoming trip', value: 'Goa Jul 4 (book hotel!)', link: '/travel', emoji: '✈️' }, { label: 'Legal deadline', value: 'Activa PUC — Aug 10', link: '/legal', emoji: '⚖️' }, { label: 'Top goal', value: 'PMI-ACP by Oct 2026', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-08', content_md: '**Good morning, Priya.** Friday. The week has been strong — presentation drafted, PMI chapter done, habits tracking. You deserve the weekend without guilt. One small admin: the BWSSB water bill (₹850) is due May 20 — pay it on Saturday morning in 2 minutes. **For today: no deep work after 3pm — protect your Friday afternoon for planning next week and decompressing.** You\'ve earned it.', highlights: [{ label: 'Pending invoice', value: '₹23,010 due May 14', link: '/business', emoji: '🧾' }, { label: 'Water bill due', value: '₹850 by May 20', link: '/home', emoji: '💧' }, { label: 'Habit streak', value: 'Evening run 4/5 days', link: '/habits', emoji: '🏃' }, { label: 'Next trip', value: 'Goa Jul 4', link: '/travel', emoji: '✈️' }] },
    { date: '2026-05-09', content_md: '**Good morning, Priya.** Saturday. Rest day — but a productive one if you want it. Three bills due this month (BESCOM, BWSSB, ACT, Jio) — pay them all at once in 10 minutes via UPI. The Goa hotel still needs booking. **Today\'s real priority: do the 30-min morning yoga, pay the pending bills, and book the Palolem hotel.** Then the rest of the weekend is truly yours. You\'ve had a great week — celebrate with Vikram tonight.', highlights: [{ label: 'Bills pending', value: '3 unpaid', link: '/home', emoji: '💡' }, { label: 'Goa hotel', value: 'Not booked yet', link: '/travel', emoji: '🏖️' }, { label: 'Savings progress', value: '₹11.4L / ₹20L goal', link: '/money', emoji: '💰' }, { label: 'PMI-ACP', value: 'Ch 5 complete this week', link: '/career', emoji: '🎯' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T00:30:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Priya Sharma uid: ${UID}`)
  await seedMemory()
  await seedHabits()
  await seedFocus()
  await seedDecisions()
  await seedBusiness()
  await seedHome()
  await seedTravel()
  await seedProtection()
  await seedLegal()
  await seedBriefings()
  console.log('\n✅  Seed complete.\n')
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
