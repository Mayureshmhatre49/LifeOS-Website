/**
 * Full seed for James Mitchell — Senior Financial Analyst in London, UK.
 * Run: node tests/e2e-personas/seed-james-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '80b91361-6dff-4ef0-8c88-06f36006e56d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

// ── MEMORY ────────────────────────────────────────────────────────────────────
async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'James Mitchell', occupation: 'Senior Financial Analyst', life_stage: 'mid_career',
    country: 'GB', currency: 'GBP', timezone: 'Europe/London', preferred_language: 'en',
    goals: [
      'Pass CFA Level 3 exam in August 2026',
      'Overpay mortgage by £500/month to clear it 4 years early',
      'Achieve Director-level role at Barclays Capital by 2028',
      'Train for and complete the Edinburgh Half Marathon in July 2026',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: James Mitchell (Senior FA, London)')

  const items = [
    { type: 'fact',         key: 'annual_salary',          value: '£98,000 base + £15,000 performance bonus at Barclays Capital (London). Total package with benefits ~£125,000.' },
    { type: 'fact',         key: 'home',                   value: '2-bed flat, Clapham South, London SW4 — owner-occupied with Nationwide mortgage. Remaining balance ~£189,000. Monthly repayment £1,240.' },
    { type: 'fact',         key: 'vehicle',                value: 'Volkswagen Golf R 2022 (grey), plate LK22 XRR — Clapham residents\' parking. MOT due September 2026.' },
    { type: 'fact',         key: 'employer',               value: 'Barclays Capital (Investment Banking Division) — Senior Financial Analyst, Coverage Team. 8 years with the firm.' },
    { type: 'fact',         key: 'family',                 value: 'Divorced since 2023. Daughter: Alice (8 years old, lives with ex-wife Sophie in Edinburgh). Video call every Sunday; has Alice every school holiday week.' },
    { type: 'preference',   key: 'work_schedule',          value: 'In office Mon–Thu (7:30am–6:30pm Canary Wharf). WFH Friday. Best thinking happens before 8am.' },
    { type: 'preference',   key: 'communication_style',    value: 'Direct, concise, evidence-based. Dislikes meetings that could be emails. Bloomberg Terminal is primary research tool.' },
    { type: 'preference',   key: 'diet',                   value: 'Reduced alcohol (tracking days sober — on a 60-day streak). Mostly Mediterranean. Gym 3×/week. No fast food.' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Financial history (Barbarians at the Gate, Liar\'s Poker), macroeconomics, occasionally sci-fi thriller.' },
    { type: 'goal',         key: 'cfa_goal',               value: 'CFA Level 3 — exam August 2026. Currently studying 10 hours/week. Chartered Financial Analyst credential needed for Director promotion path.' },
    { type: 'goal',         key: 'mortgage_goal',          value: 'Overpay Nationwide mortgage by £500/month — reduces total interest by £22,000 and clears debt 4 years early (by 2036 instead of 2040).' },
    { type: 'goal',         key: 'fitness_goal',           value: 'Edinburgh Half Marathon July 13, 2026. Currently running 8–10 miles/week. Race day target: sub-2 hours.' },
    { type: 'concern',      key: 'work_stress',            value: 'Q1 2026 deal pipeline was slow — bonus at risk if Q2 does not deliver. Market conditions volatile post-US rate decisions.' },
    { type: 'concern',      key: 'father_daughter_time',   value: 'Edinburgh distance makes daily contact hard with Alice. Prioritising one UK trip per term and all school holidays.' },
    { type: 'relationship', key: 'daughter',               value: 'Alice Mitchell (8 years old) — lives in Edinburgh with Sophie. Loves animals and Minecraft. Birthday September 14.' },
  ]
  let n = 0
  for (const it of items) { const { error } = await db.from('memory_items').insert({ user_id: UID, source: 'manual', confidence: 95, is_active: true, ...it }); if (!error) n++; else console.log(`  ✗  memory: ${error.message}`) }
  console.log(`  ✔  ${n}/${items.length} memory items`)
}

// ── HABITS ────────────────────────────────────────────────────────────────────
async function seedHabits() {
  console.log('\n🌱  Seeding habits...')
  const defs = [
    { name: 'Morning Run (5K+)',       icon: '🏃', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5], reminder_time: '06:15', completedOffsets: [1,2,3,4,5,8,9,10,11,15,16,17,18,19] },
    { name: 'No Alcohol Today',        icon: '🚫', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: null,    completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'CFA Study (45 min)',      icon: '📊', color: 'indigo',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '06:30', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'Sunday Video Call — Alice', icon: '📱', color: 'sky',   frequency: 'custom',   days_of_week: [0],             reminder_time: '10:30', completedOffsets: [0,7,14] },
    { name: 'Gym (Strength)',          icon: '💪', color: 'amber',   frequency: 'custom',   days_of_week: [1,3,5],         reminder_time: '07:00', completedOffsets: [1,3,5,8,10,12,15,17,19] },
    { name: 'Meditate 10 min',         icon: '🧘', color: 'violet',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:00', completedOffsets: [0,1,2,3,5,6,7,8,9,11,12,14,15,16,18,19,20] },
    { name: 'Read 20 Pages',           icon: '📚', color: 'purple',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,2,3,4,6,7,8,9,10,12,13,14,15,16,17,19,20] },
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
  await db.from('focus_preferences').upsert({ user_id: UID, default_mode: 'deep', break_interval_minutes: 5, long_break_minutes: 20, sessions_before_long_break: 3, body_doubling_default: false, daily_focus_goal_minutes: 150 }, { onConflict: 'user_id' })
  console.log('  ✔  focus prefs: 2.5h/day goal, deep-work default')

  // BST = UTC+1; 06:30 BST = 05:30 UTC
  const sessions = [
    { off: 1,  mode: 'deep',     plan: 90, act: 88, done: true,  title: 'CFA L3 study: portfolio management chapter',         time: '05:30' },
    { off: 1,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Q2 client pipeline review + deal tracking update',   time: '07:30' },
    { off: 2,  mode: 'deep',     plan: 60, act: 62, done: true,  title: 'Meridian advisory: Q2 portfolio review memo',        time: '05:30' },
    { off: 3,  mode: 'pomodoro', plan: 25, act: 23, done: true,  title: 'CFA mock test — section 2 (economics)',             time: '06:00' },
    { off: 4,  mode: 'deep',     plan: 90, act: 85, done: true,  title: 'Deal pitch deck: mid-market M&A target analysis',   time: '05:30' },
    { off: 5,  mode: 'deep',     plan: 60, act: 58, done: true,  title: 'CFA L3 study: fixed income attribution',            time: '05:30' },
    { off: 5,  mode: 'pomodoro', plan: 25, act: 18, done: false, title: 'Edinburgh trip logistics', time: '08:00', abandoned: true },
    { off: 7,  mode: 'quick',    plan: 15, act: 14, done: true,  title: 'Weekly financial review — personal accounts',       time: '09:00' },
    { off: 8,  mode: 'deep',     plan: 90, act: 91, done: true,  title: 'CFA L3 study: equity investments & valuation',      time: '05:30' },
    { off: 8,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Bloomberg data pull: European bank sector report',  time: '08:00' },
    { off: 9,  mode: 'deep',     plan: 75, act: 72, done: true,  title: 'Barclays Coverage team: sector initiation note',    time: '05:30' },
    { off: 10, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Mortgage overpayment: Nationwide portal review',    time: '06:30' },
    { off: 10, mode: 'deep',     plan: 60, act: 60, done: true,  title: 'CFA L3 study: derivatives and alternatives',        time: '07:00' },
    { off: 11, mode: 'deep',     plan: 90, act: 86, done: true,  title: 'Deal pitch: Meridian asset allocation memo Q2',     time: '05:30' },
    { off: 11, mode: 'pomodoro', plan: 25, act: 22, done: true,  title: 'Edinburgh half-marathon training plan review',      time: '08:00' },
    { off: 14, mode: 'deep',     plan: 90, act: 89, done: true,  title: 'CFA L3 study: wealth planning & tax efficiency',    time: '05:30' },
    { off: 15, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Q2 client call prep: Meridian quarterly review',   time: '07:00' },
    { off: 15, mode: 'deep',     plan: 60, act: 63, done: true,  title: 'Edinburgh trip: activities planning for Alice',     time: '05:30' },
    { off: 16, mode: 'deep',     plan: 90, act: 87, done: true,  title: 'Barclays: mid-year performance self-assessment doc', time: '05:30' },
    { off: 17, mode: 'pomodoro', plan: 25, act: 15, done: false, title: 'Car MOT research & garage booking', time: '08:30', abandoned: true },
    { off: 17, mode: 'deep',     plan: 60, act: 60, done: true,  title: 'CFA L3 study: ethical and professional standards',  time: '05:30' },
    { off: 18, mode: 'deep',     plan: 90, act: 88, done: true,  title: 'Coverage team sector note: European banks Q2 2026', time: '05:30' },
    { off: 19, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Lisbon trip: hotels shortlist + flight comparison', time: '07:30' },
    { off: 19, mode: 'deep',     plan: 60, act: 57, done: true,  title: 'CFA L3 full mock exam — 3 hours (session 1 of 2)',  time: '06:00' },
    { off: 20, mode: 'quick',    plan: 15, act: 12, done: true,  title: 'CFA mock exam result review — weak areas note',    time: '09:00' },
  ]
  let n = 0
  for (const s of sessions) {
    const date = dateOffset(s.off)
    const startedAt = `${date}T${s.time}:00Z`
    const endedAt = new Date(new Date(startedAt).getTime() + (s.act ?? s.plan) * 60000).toISOString()
    const { error } = await db.from('focus_sessions').insert({ user_id: UID, mode: s.mode, planned_minutes: s.plan, actual_minutes: s.act ?? null, completed: s.done, abandoned: s.abandoned ?? false, body_doubling_enabled: false, task_title: s.title, started_at: startedAt, ended_at: endedAt })
    if (!error) n++; else console.log(`  ✗  focus: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${sessions.length} focus sessions`)
}

// ── DECISIONS ─────────────────────────────────────────────────────────────────
async function seedDecisions() {
  console.log('\n🤔  Seeding decisions...')
  const decisions = [
    {
      question: 'Should I fix my Nationwide mortgage at 4.85% for 5 years or take the tracker rate at 4.2% + base?',
      category: 'career', mode: 'compare', options: ['5-year fixed at 4.85%', 'Tracker rate at 4.2% + BoE base'],
      created_at: '2026-04-21T05:45:00Z', favorite: true,
      result: {
        question: 'Mortgage: 5-year fix (4.85%) vs tracker (4.2% + base rate)',
        factors: ['Monthly cost certainty', 'Total 5-year cost', 'Rate risk exposure', 'Overpayment flexibility', 'BoE rate forecast'],
        options: [
          { label: '5-year fixed at 4.85%', scores: { 'Monthly cost certainty': 95, 'Total 5-year cost': 60, 'Rate risk exposure': 10, 'Overpayment flexibility': 70, 'BoE rate forecast': 50 },
            pros: ['Complete certainty — £1,240/month locked for 5 years', 'Allows confident budgeting of £500/month overpayments', 'Protected against rate rises beyond 4.85%'],
            cons: ['Higher rate if BoE cuts to 3.5% or below in 2026-27', 'Early repayment charge if circumstances change'], summary: 'Safety and certainty at cost of rate flexibility.' },
          { label: 'Tracker at 4.2% + base', scores: { 'Monthly cost certainty': 40, 'Total 5-year cost': 75, 'Rate risk exposure': 60, 'Overpayment flexibility': 85, 'BoE rate forecast': 72 },
            pros: ['Currently £85/month cheaper (base 0.65% = 4.85% effective but cuts expected)', 'Unlimited overpayment — no ERC', 'Captures upside if BoE cuts to 3.5% by 2027'],
            cons: ['Budget uncertainty — payment rises if BoE base rate increases', 'Rate risk exposure until 2031'], summary: 'Cheaper today and captures cuts but budget uncertainty.' },
        ],
        recommendation: 'Fix for 5 years. The certainty supports the £500/month overpayment goal, protects against a wage-shock scenario, and removes mental overhead. The BoE rate cut scenario is plausible but not guaranteed.',
        winner: '5-year fixed at 4.85%',
      },
    },
    {
      question: 'Should I take the Meridian Asset Partners advisory engagement at £1,800/day or hold out for a higher-rate client?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-04-28T06:30:00Z', favorite: false,
      result: {
        summary: 'Meridian Asset Partners is a legitimate small family office with £85M AUM seeking quarterly macro overlay advice. At £1,800/day for 2 days/month (£3,600/month, £43,200/year), this supplements the Barclays bonus meaningfully without the time commitment of a larger mandate.',
        recommendation: 'Accept the Meridian engagement. The 2-day/month commitment fits within WFH Fridays and does not conflict with Barclays compliance requirements (checked separately). £43,200/year accelerates mortgage paydown significantly.',
        confidenceScore: 82, riskScore: 20, riskLevel: 'low',
        financialImpact: { summary: '£3,600/month additional consulting income. After tax (~40%), net £2,160/month.', monthlyCostChange: -3600, oneTimeCost: null, opportunityCost: 'Two Fridays per month for Meridian work', affordabilityScore: 92 },
        pros: ['£43,200/year gross supplements bonus uncertainty', 'Builds private wealth management experience — valuable for Director path', 'Small family office — low bureaucracy and quick decisions'],
        cons: ['Barclays outside-activity approval required before starting', 'Consulting income needs to be declared via self-assessment', 'Conflict of interest risk if Meridian holds Barclays-covered stocks'],
        nextSteps: ['Submit Barclays outside business interests form (HR compliance)', 'Draft consulting agreement with IP and confidentiality clause', 'Register for self-assessment with HMRC if not already done'],
        memoryFactorsUsed: ['Work schedule: WFH Friday available', 'Mortgage goal: £500/month overpayment target'],
        dataSourcesUsed: ['London financial advisory day rates 2026', 'FCA registered adviser obligations'],
      },
    },
    {
      question: 'Edinburgh vs Lisbon for a solo week break in September 2026?',
      category: 'family', mode: 'compare', options: ['Edinburgh (visit Alice)', 'Lisbon, Portugal (holiday)'],
      created_at: '2026-05-05T06:00:00Z', favorite: false,
      result: {
        question: 'September break: Edinburgh family visit or Lisbon holiday?',
        factors: ['Alice time', 'Personal recharge', 'Cost', 'Travel effort', 'September availability'],
        options: [
          { label: 'Edinburgh (visit Alice)', scores: { 'Alice time': 100, 'Personal recharge': 60, Cost: 75, 'Travel effort': 80, 'September availability': 85 },
            pros: ['Alice is in school Sep 1 — full school holiday means extra quality time', 'Lower cost (£180 LNER + Sophie\'s spare room)', 'Strong relationship investment'],
            cons: ['Less personal recharge — parenting solo requires energy', 'Alice\'s school schedule limits flexibility after Sep 1'], summary: 'Prioritises the father-daughter relationship — the most important factor.' },
          { label: 'Lisbon, Portugal', scores: { 'Alice time': 0, 'Personal recharge': 90, Cost: 60, 'Travel effort': 65, 'September availability': 75 },
            pros: ['Solo travel for genuine rest and recovery', 'Lisbon in September is peak season — warm and beautiful', 'Food, culture, mild climate'], cons: ['No Alice time — October half-term already planned for Edinburgh', 'Flights + hotel £600–900'], summary: 'Better for personal rest but comes at cost of Alice time.' },
        ],
        recommendation: 'Edinburgh in September, Lisbon in the new year. Alice starts school September 1 — go before then for a proper holiday-mode visit. Book Lisbon for February half-term 2027 as a solo reset.',
        winner: 'Edinburgh (visit Alice)',
      },
    },
    {
      question: 'Should I sell my Volkswagen Golf and switch to an EV (Tesla Model 3 or similar)?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-05-07T05:30:00Z', favorite: false,
      result: {
        summary: 'The Golf R has ~22,000 miles with 4 years remaining on finance. Current settlement figure is approximately £18,500, and used EV prices have fallen — a Tesla Model 3 (LR) would cost ~£27,000 used in 2026. The switch makes financial and environmental sense but requires careful timing.',
        recommendation: 'Wait until finance ends (April 2027). Then sell Golf R privately (estimated £21,000), purchase a 2024 Tesla Model 3 Long Range used (~£26,000–28,000). Net cost: £5,000–7,000 transition. Use ULEZ savings and lower fuel costs to offset.',
        confidenceScore: 68, riskScore: 38, riskLevel: 'medium',
        financialImpact: { summary: 'Selling Golf + switching to EV: net £5K–7K transition cost. Monthly fuel savings: ~£120 (charging vs petrol). Annual servicing savings: ~£400.', monthlyCostChange: -120, oneTimeCost: 6000, opportunityCost: 'Car finance settlement penalty if sold early', affordabilityScore: 72 },
        pros: ['Significant fuel cost savings (London charging ~3p/mile vs 18p/mile petrol)', 'No ULEZ charge (Golf R is compliant but EV future-proofs)', 'Environmental benefit — aligned with personal values'],
        cons: ['Finance settlement penalty if sold before April 2027', 'London flat has no dedicated charging — must use public charging', 'EV range anxiety on Edinburgh trips (300+ miles each way)'],
        nextSteps: ['Get Golf R finance settlement quote from VW Finance', 'Test drive Tesla Model 3 at Battersea Tesla Centre', 'Check Clapham flat landlord consent for EV charger installation'],
        memoryFactorsUsed: ['Vehicle: Golf R 2022, plate LK22 XRR', 'Mortgage overpayment: £500/month goal — watch impact'],
        dataSourcesUsed: ['UK used EV market prices Q2 2026', 'ULEZ zone compliance checker'],
      },
    },
    {
      question: 'Director promotion in 2027 or 2028 — when is the right moment to push?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-05-08T06:00:00Z', favorite: true,
      result: {
        summary: 'The Director promotion at Barclays Capital typically requires: (1) CFA charterholder status, (2) deal credit as lead analyst on 2+ transactions, and (3) strong client relationship track record. James has 2 of these — the CFA is pending August 2026.',
        recommendation: 'Target the 2027 promotion cycle (December 2026 nominations). Book a candid conversation with your MD in September 2026 — after CFA results — to formally discuss the timeline. The Q2 deal pipeline needs to deliver at least one closed transaction as lead analyst to complete the credit.',
        confidenceScore: 74, riskScore: 30, riskLevel: 'low',
        financialImpact: { summary: 'Director promotion at Barclays = ~£120K–145K base + 25–40% bonus. Net gain over Senior Analyst: £25K–35K/year.', monthlyCostChange: 0, oneTimeCost: null, opportunityCost: 'Staying Senior Analyst for 2 years costs £50K+ in foregone comp vs Director', affordabilityScore: 95 },
        pros: ['CFA credential (August 2026) is the final missing criterion', 'Strong institutional knowledge — 8 years at Barclays is a significant retention argument', 'Meridian advisory experience adds client-facing credibility'],
        cons: ['Q2 deal pipeline is slow — may need to wait for a Q3 deal to close', 'Barclays Director promotions are limited — competitive internally', '2027 cycle means 18 more months as Senior Analyst'],
        nextSteps: ['Pass CFA Level 3 in August 2026 — this is non-negotiable', 'Close at least one lead analyst deal in Q2/Q3 2026', 'Schedule September MD conversation — frame it as career development discussion'],
        memoryFactorsUsed: ['CFA goal: August 2026', 'Employer: Barclays Capital, 8 years tenure', 'Career goal: Director by 2028'],
        dataSourcesUsed: ['Barclays Capital promotion criteria (publicly known benchmarks)', 'UK investment banking compensation data 2026'],
      },
    },
  ]
  let n = 0
  for (const d of decisions) { const { error } = await db.from('decision_logs').insert({ user_id: UID, question: d.question, category: d.category, mode: d.mode, options: d.options, context_snapshot: {}, result: d.result, favorite: d.favorite, created_at: d.created_at }); if (!error) n++; else console.log(`  ✗  decision: ${error.message}`) }
  console.log(`  ✔  ${n}/${decisions.length} decision logs`)
}

// ── BUSINESS ──────────────────────────────────────────────────────────────────
async function seedBusiness() {
  console.log('\n💼  Seeding business...')
  const meridian = await ins('business_clients', { user_id: UID, name: 'Meridian Asset Partners', company: 'Meridian Asset Partners LLP', email: 'office@meridianap.co.uk', phone: '+442076218800', address: 'Mayfair, London W1J 6LB', currency: 'GBP', notes: 'Small family office, £85M AUM. Quarterly macro overlay advisory. 2 days/month retainer.' }, 'client: Meridian')
  if (!meridian) return

  const projM = await ins('business_projects', { user_id: UID, client_id: meridian.id, name: 'Meridian — Quarterly Macro Advisory 2026', status: 'active', start_date: '2026-01-01', end_date: '2026-12-31', fee: 3600, currency: 'GBP', notes: '2 days/month at £1,800/day. Quarterly written memo included.' }, 'project: Meridian advisory')
  if (projM) {
    await ins('business_invoices', { user_id: UID, client_id: meridian.id, project_id: projM.id, invoice_no: 'JM-2026-001', issued_at: '2026-01-31', due_at: '2026-02-14', items: [{ description: 'Macro Advisory — January 2026 (2 days)', qty: 2, rate: 1800, amount: 3600 }], subtotal: 3600, tax_pct: 20, tax_amt: 720, discount_amt: 0, total: 4320, currency: 'GBP', status: 'paid', paid_at: '2026-02-12' }, 'invoice: JM-2026-001')
    await ins('business_invoices', { user_id: UID, client_id: meridian.id, project_id: projM.id, invoice_no: 'JM-2026-002', issued_at: '2026-02-28', due_at: '2026-03-14', items: [{ description: 'Macro Advisory — February 2026 (2 days)', qty: 2, rate: 1800, amount: 3600 }], subtotal: 3600, tax_pct: 20, tax_amt: 720, discount_amt: 0, total: 4320, currency: 'GBP', status: 'paid', paid_at: '2026-03-10' }, 'invoice: JM-2026-002')
    await ins('business_invoices', { user_id: UID, client_id: meridian.id, project_id: projM.id, invoice_no: 'JM-2026-003', issued_at: '2026-04-30', due_at: '2026-05-14', items: [{ description: 'Macro Advisory — March 2026 (2 days)', qty: 2, rate: 1800, amount: 3600 }, { description: 'Q1 Written Macro Memo (April delivery)', qty: 1, rate: 500, amount: 500 }], subtotal: 4100, tax_pct: 20, tax_amt: 820, discount_amt: 0, total: 4920, currency: 'GBP', status: 'sent' }, 'invoice: JM-2026-003 (sent)')
  }
  const expenses = [
    { category: 'software', vendor: 'Bloomberg LP', amount: 0, occurred_at: '2026-01-01', description: 'Bloomberg Terminal — covered by Barclays for personal research crossover (tracked for records)' },
    { category: 'professional_fees', vendor: 'CFA Institute', amount: 990, occurred_at: '2026-02-01', description: 'CFA Level 3 exam registration fee 2026 (USD 1,250 converted)' },
    { category: 'travel', vendor: 'LNER / National Rail', amount: 182, occurred_at: '2026-04-11', description: 'London King\'s Cross → Edinburgh Waverley (Alice Easter visit — 1st class)' },
    { category: 'software', vendor: 'Refinitiv Eikon (personal)', amount: 89, occurred_at: '2026-03-01', description: 'Eikon personal subscription — supplementary data for Meridian memos' },
    { category: 'professional_fees', vendor: 'CFA UK (membership)', amount: 290, occurred_at: '2026-01-15', description: 'CFA UK annual membership 2026' },
    { category: 'office', vendor: 'WeWork Soho', amount: 350, occurred_at: '2026-04-01', description: 'WeWork Soho day passes — Meridian client meetings x4' },
  ]
  let n = 0
  for (const e of expenses) { const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'GBP', is_billable: false, ...e }); if (!error) n++; else console.log(`  ✗  expense: ${error.message}`) }
  console.log(`  ✔  ${n}/${expenses.length} expenses`)
}

// ── HOME ──────────────────────────────────────────────────────────────────────
async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const boiler = await ins('home_assets', { user_id: UID, name: 'Worcester Bosch Combi Boiler', type: 'appliance', brand: 'Worcester Bosch', model: 'Greenstar 4000 24kW', purchased_at: '2021-09-10', warranty_until: '2031-09-10', cost: 2400, notes: 'Clapham flat — 10-year manufacturer warranty. Service annually.' }, 'asset: Boiler')
  const golf = await ins('home_assets', { user_id: UID, name: 'Volkswagen Golf R', type: 'vehicle', brand: 'Volkswagen', model: 'Golf R 2.0T 4MOTION (2022)', serial_no: 'WVWZZZ1KZNW001234', purchased_at: '2022-04-15', warranty_until: '2025-04-15', cost: 42000, notes: 'Plate: LK22 XRR. Finance via VW Finance — ends April 2027. MOT due Sep 2026.' }, 'asset: Golf R')
  const dw = await ins('home_assets', { user_id: UID, name: 'Smeg Dishwasher', type: 'appliance', brand: 'Smeg', model: 'ST2123', purchased_at: '2022-01-20', warranty_until: '2027-01-20', cost: 550, notes: 'Kitchen — runs daily cycle' }, 'asset: Smeg Dishwasher')
  const wm = await ins('home_assets', { user_id: UID, name: 'Miele Washing Machine', type: 'appliance', brand: 'Miele', model: 'WDB020 WPS', purchased_at: '2021-09-10', warranty_until: '2026-09-10', cost: 750, notes: 'Warranty expires Sep 2026 — consider extended warranty' }, 'asset: Miele WM')

  if (boiler) await ins('home_maintenance', { user_id: UID, asset_id: boiler.id, title: 'Annual Boiler Service', category: 'service', recurrence_months: 12, last_done_at: '2025-10-15', next_due_at: '2026-10-15', vendor: 'British Gas HomeCare', cost: 110, is_active: true, notes: 'Part of British Gas HomeCare plan — included in £99/month cover' }, 'maint: boiler service')
  if (golf) {
    await ins('home_maintenance', { user_id: UID, asset_id: golf.id, title: 'VW Golf MOT', category: 'inspection', recurrence_months: 12, last_done_at: '2025-09-05', next_due_at: '2026-09-05', vendor: 'Halfords Autocentre Clapham', cost: 55, is_active: true }, 'maint: Golf MOT')
    await ins('home_maintenance', { user_id: UID, asset_id: golf.id, title: 'VW Golf Annual Service', category: 'service', recurrence_months: 12, last_done_at: '2025-09-05', next_due_at: '2026-09-05', vendor: 'VW Retailer Battersea', cost: 350, is_active: true }, 'maint: Golf service')
  }
  if (wm) await ins('home_maintenance', { user_id: UID, asset_id: wm.id, title: 'Washing Machine Drum Clean', category: 'cleaning', recurrence_months: 3, last_done_at: '2026-02-01', next_due_at: '2026-05-01', vendor: null, cost: 0, is_active: true }, 'maint: Miele WM clean')

  const bills = [
    { utility: 'electricity', provider: 'British Gas', amount: 142, bill_date: '2026-02-28', due_date: '2026-03-15', is_paid: true, account_no: 'BG-SW4-441229' },
    { utility: 'electricity', provider: 'British Gas', amount: 128, bill_date: '2026-03-31', due_date: '2026-04-15', is_paid: true, account_no: 'BG-SW4-441229' },
    { utility: 'electricity', provider: 'British Gas', amount: 118, bill_date: '2026-04-30', due_date: '2026-05-15', is_paid: false, account_no: 'BG-SW4-441229' },
    { utility: 'water', provider: 'Thames Water', amount: 45, bill_date: '2026-02-28', due_date: '2026-03-31', is_paid: true, account_no: 'TW-SW4-99821' },
    { utility: 'water', provider: 'Thames Water', amount: 45, bill_date: '2026-03-31', due_date: '2026-04-30', is_paid: true, account_no: 'TW-SW4-99821' },
    { utility: 'water', provider: 'Thames Water', amount: 45, bill_date: '2026-04-30', due_date: '2026-05-31', is_paid: false, account_no: 'TW-SW4-99821' },
    { utility: 'internet', provider: 'BT Broadband', amount: 48, bill_date: '2026-03-05', due_date: '2026-03-10', is_paid: true, account_no: 'BT-SW4-8812345' },
    { utility: 'internet', provider: 'BT Broadband', amount: 48, bill_date: '2026-04-05', due_date: '2026-04-10', is_paid: true, account_no: 'BT-SW4-8812345' },
    { utility: 'internet', provider: 'BT Broadband', amount: 48, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'BT-SW4-8812345' },
    { utility: 'phone', provider: 'O2', amount: 35, bill_date: '2026-03-15', due_date: '2026-03-15', is_paid: true, account_no: 'O2-07700900441' },
    { utility: 'phone', provider: 'O2', amount: 35, bill_date: '2026-04-15', due_date: '2026-04-15', is_paid: true, account_no: 'O2-07700900441' },
    { utility: 'phone', provider: 'O2', amount: 35, bill_date: '2026-05-05', due_date: '2026-05-05', is_paid: false, account_no: 'O2-07700900441' },
  ]
  let n = 0
  for (const b of bills) { const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b }); if (!error) n++; else console.log(`  ✗  bill: ${error.message}`) }
  console.log(`  ✔  ${n}/${bills.length} utility bills`)
}

// ── TRAVEL ────────────────────────────────────────────────────────────────────
async function seedTravel() {
  console.log('\n✈️   Seeding travel...')
  const nyc = await ins('trips', { user_id: UID, destination: 'New York, USA', start_date: '2026-03-09', end_date: '2026-03-13', status: 'completed', budget_total: 3200, currency: 'GBP', travellers: 1, notes: 'Barclays NY office — client roadshow support and banking conference.', cover_emoji: '🗽' }, 'trip: NYC (done)')
  if (nyc) {
    const items = [
      { type: 'flight', title: 'British Airways BA117 LHR → JFK', starts_at: '2026-03-09T10:00:00Z', ends_at: '2026-03-09T13:00:00-05:00', location: 'Heathrow T5', cost: 890, is_done: true, order_index: 1 },
      { type: 'hotel', title: 'Park Hyatt New York', starts_at: '2026-03-09T15:00:00-05:00', ends_at: '2026-03-13T12:00:00-05:00', location: '153 W 57th St, New York', cost: 1800, booking_ref: 'PH-JM-442021', is_done: true, order_index: 2 },
      { type: 'activity', title: 'Barclays NY Client Roadshow — Day 1', starts_at: '2026-03-10T09:00:00-05:00', location: 'Barclays Capital Americas HQ, 745 7th Ave', cost: 0, is_done: true, order_index: 3 },
      { type: 'activity', title: 'Global Banking Conference 2026', starts_at: '2026-03-11T08:00:00-05:00', location: 'Javits Center, New York', cost: 0, is_done: true, order_index: 4 },
      { type: 'flight', title: 'British Airways BA178 JFK → LHR', starts_at: '2026-03-13T21:00:00-05:00', ends_at: '2026-03-14T09:00:00Z', location: 'JFK Terminal 7', cost: 870, is_done: true, order_index: 5 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: nyc.id, ...it }); if (!error) iOk++ }
    console.log(`  ✔  NYC: ${iOk} trip items`)
  }

  const edin = await ins('trips', { user_id: UID, destination: 'Edinburgh, Scotland', start_date: '2026-07-18', end_date: '2026-07-26', status: 'booked', budget_total: 800, currency: 'GBP', travellers: 1, notes: 'Edinburgh Half Marathon July 13 (race!) + Alice school holiday. Staying with Sophie\'s spare room + 3 nights Airbnb.', cover_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, 'trip: Edinburgh')
  if (edin) {
    const items = [
      { type: 'flight', title: 'LNER King\'s Cross → Edinburgh Waverley', starts_at: '2026-07-18T09:00:00+01:00', location: 'London King\'s Cross', cost: 89, order_index: 1 },
      { type: 'activity', title: 'Edinburgh Half Marathon 2026', starts_at: '2026-07-19T08:00:00+01:00', location: 'Edinburgh City Centre', cost: 55, order_index: 2, notes: 'Race bib registered. Target: sub-2 hours.' },
      { type: 'activity', title: 'Alice week — day trips (Arthur\'s Seat, Edinburgh Zoo)', starts_at: '2026-07-20T09:00:00+01:00', location: 'Edinburgh', cost: 120, order_index: 3 },
      { type: 'flight', title: 'LNER Edinburgh Waverley → London King\'s Cross', starts_at: '2026-07-26T17:30:00+01:00', location: 'Edinburgh Waverley', cost: 92, order_index: 4 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: edin.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Running kit (race day)', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Recovery gear + foam roller', category: 'health', qty: 1, is_packed: false },
      { item: 'Smart casual (4 nights)', category: 'clothing', qty: 4, is_packed: false },
      { item: 'Gifts for Alice', category: 'accessories', qty: 1, is_packed: false },
      { item: 'Waterproof jacket (Scottish weather)', category: 'clothing', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: edin.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Edinburgh: ${iOk} items, ${pOk} packing`)
  }

  const lisbon = await ins('trips', { user_id: UID, destination: 'Lisbon, Portugal', start_date: '2027-02-06', end_date: '2027-02-13', status: 'planning', budget_total: 1800, currency: 'GBP', travellers: 1, notes: 'February half-term solo break. Cuisine, wine, Sintra day trip. Rest and recharge.', cover_emoji: '🇵🇹' }, 'trip: Lisbon')
  if (lisbon) {
    const items = [
      { type: 'flight', title: 'TAP Air Portugal LHR → LIS', starts_at: '2027-02-06T07:30:00Z', location: 'Heathrow T2', cost: 280, order_index: 1 },
      { type: 'hotel', title: 'Bairro Alto Hotel Lisbon', starts_at: '2027-02-06T14:00:00+00:00', ends_at: '2027-02-13T11:00:00+00:00', location: 'Praça Luís de Camões, Lisbon', cost: 1100, order_index: 2, notes: '7 nights — superior room overlooking Chiado' },
      { type: 'activity', title: 'Sintra & Cascais day trip', starts_at: '2027-02-09T09:00:00+00:00', location: 'Sintra, Portugal', cost: 80, order_index: 3 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: lisbon.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Lisbon: ${iOk} trip items`)
  }
}

// ── PROTECTION ────────────────────────────────────────────────────────────────
async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'HMRC Tax Refund Phishing Email', content: 'Dear James Mitchell, HMRC has calculated that you are owed a tax refund of £2,841.00 for the 2024-25 tax year. To claim, click here: hmrc-refund-gov.uk/claim-now. Expires in 48 hours.', risk_level: 'high', result_summary: 'HMRC phishing email. The domain "hmrc-refund-gov.uk" is not an HMRC official domain — gov.uk is always the only legitimate domain. HMRC never issues refunds via email links or creates 48-hour urgency.', red_flags: ['Domain is hmrc-refund-gov.uk — not gov.uk', '48-hour urgency is a social engineering technique', 'HMRC never contacts via unsolicited email with refund links', 'No personalised tax reference or UTR number in the message'], safe_next_step: 'Forward to phishing@hmrc.gov.uk. Delete immediately. Check HMRC account at gov.uk/personal-tax-account directly.' },
    { type: 'contract', title: 'Meridian Asset Partners — Advisory Agreement', content: 'ADVISORY AGREEMENT\nMeridian Asset Partners LLP ("Client") engages James Mitchell ("Adviser") to provide macro investment advisory services for a fee of £1,800 per day, 2 days per month. All research, memos, and oral advice provided become the exclusive property of Meridian upon delivery. This engagement does not create an employment relationship. Adviser confirms no conflict of interest with current employer.', risk_level: 'medium', result_summary: 'The agreement is broadly reasonable but has two issues: (1) The IP clause assigns "oral advice" — impractical and unenforceable, but worth removing for clarity. (2) The self-certification of no employer conflict should be replaced with a reference to the Barclays compliance approval actually obtained, for liability protection.', red_flags: ['IP clause covers "oral advice" — ambiguous and potentially overreaching', 'No indemnity clause protecting Adviser from reliance on incorrect data provided by Client', 'Self-certification of conflict avoidance without reference to Barclays compliance approval'], safe_next_step: 'Amend IP clause to "written deliverables only". Add reference to Barclays OBI form reference number. Request 30-day notice termination clause.' },
    { type: 'scam', title: 'Fake Investment Platform — "Guaranteed 25% Returns"', content: 'Hi James, We are TradingVault Pro — we have identified your LinkedIn profile as a suitable investor. Our proprietary algorithm guarantees 25% annual returns on crypto-backed investments. Minimum investment: £2,000. Join 14,000 satisfied investors.', risk_level: 'high', result_summary: 'Classic investment fraud. No legitimate FCA-regulated firm guarantees returns. "Crypto-backed" combined with guaranteed percentages is a textbook warning combination. TradingVault Pro is not on the FCA register.', red_flags: ['Guarantees 25% annual returns — impossible and illegal to promise', 'Not on FCA Financial Services Register', 'LinkedIn cold outreach for investment solicitation is unusual and suspicious', '"14,000 satisfied investors" is unverifiable — common in Ponzi schemes'], safe_next_step: 'Report to FCA using Action Fraud: actionfraud.police.uk. Block contact. Do not share any financial details.' },
    { type: 'quote', title: 'VW Golf R Comprehensive Car Insurance Renewal (Direct Line)', content: 'Direct Line: 2022 VW Golf R (LK22 XRR). Annual comprehensive premium: £1,240. Excess: £500 compulsory + £250 voluntary. Protected no-claims. Includes EU cover for 90 days.', risk_level: 'low', result_summary: 'Competitive premium for a Golf R in SW4 London. £1,240/year with protected NCB and EU cover is fair. Comparison sites typically show £1,180–1,380 for this profile. The voluntary excess of £250 is reasonable.', red_flags: [], safe_next_step: 'Compare via Comparethemarket and Admiral. If renewing Direct Line, request loyalty discount — 5–8% available for 3+ years.' },
    { type: 'subscription', title: 'Barclays Premier Banking Auto-Renewal Review', content: 'Your Barclays Premier account fee of £16/month auto-renews. Benefits include: worldwide travel insurance, mobile phone insurance, breakdown cover, and access to the Premier service line. Total annual cost: £192.', risk_level: 'low', result_summary: 'Good value for a high earner using all three insurance benefits. Worldwide travel insurance alone would cost £80–120/year. Mobile phone insurance £120/year. Combined value significantly exceeds £192.', red_flags: [], safe_next_step: 'Continue — the packaged benefits exceed the cost. Review annually to confirm the travel insurance still covers Edinburgh half-marathon activities.' },
  ]
  let n = 0
  for (const c of checks) { const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null }); if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`) }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  await db.from('saved_quotes').insert({ user_id: UID, title: 'VW Golf R Car Insurance 2026 — Direct Line', amount: 1240, currency: 'GBP', category: 'insurance', region: 'Clapham, London SW4', result_summary: 'Competitive at £1,240/year with protected NCB and EU cover. Compare before auto-renewing.', risk_level: 'low', negotiation_script: 'I\'ve been a Direct Line customer for 3 years with zero claims. I\'ve received a quote from Admiral at £1,165 for identical cover. Can you match that? I\'d prefer to stay for continuity.' })
  await db.from('saved_quotes').insert({ user_id: UID, title: 'British Gas HomeCare Plan (boiler + appliances)', amount: 1188, currency: 'GBP', category: 'home_service', region: 'Clapham, London SW4', result_summary: '£99/month for boiler + appliance cover. Includes annual boiler service and 24/7 emergency call-out.', risk_level: 'low', negotiation_script: 'I\'ve been a HomeCare customer for 4 years. Ovo Energy is offering comparable cover for £79/month. Can you offer £85/month to retain my business?' })
  console.log('  ✔  2/2 saved quotes')
  await db.from('negotiation_templates').insert({ user_id: UID, type: 'rate_increase', tone: 'professional', context: 'Requesting Meridian advisory rate increase from £1,800 to £2,000/day for 2027', script: 'Dear [Contact],\n\nThank you for the continued partnership — the Q1 and Q2 macro memos have been well received and I understand the allocation decisions they have informed.\n\nAs we approach our year-end review, I would like to propose a modest rate adjustment for 2027 — from £1,800 to £2,000 per advisory day. This represents an 11% increase and remains within the market range for senior macro advisory in London.\n\nI am committed to maintaining the quality and depth of analysis Meridian relies on.\n\nBest,\nJames Mitchell' })
  console.log('  ✔  1/1 negotiation templates')
}

// ── LEGAL ─────────────────────────────────────────────────────────────────────
async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'UK Self-Assessment Tax Return 2025-26', type: 'other', due_date: '2027-01-31', amount: null, currency: 'GBP', status: 'pending', authority: 'HMRC (His Majesty\'s Revenue & Customs)', reference_no: 'UTR-3841229', notes: 'Online self-assessment for consulting income from Meridian. File by Jan 31 2027. Register by Oct 5 2026 if new to self-assessment.' },
    { title: 'Payment on Account (HMRC) — July 2026', type: 'other', due_date: '2026-07-31', amount: 4800, currency: 'GBP', status: 'pending', authority: 'HMRC', reference_no: 'UTR-3841229', notes: 'Second payment on account for 2025-26. Estimated £4,800 (50% of prior year consulting tax liability).' },
    { title: 'VW Golf R — MOT', type: 'renewal', due_date: '2026-09-05', amount: 55, currency: 'GBP', status: 'pending', authority: 'DVLA / DVSA', reference_no: 'LK22XRR', notes: 'Book Halfords Autocentre Clapham 2 weeks before. Combined with annual service at VW.' },
    { title: 'Nationwide Mortgage Annual Statement Review', type: 'other', due_date: '2026-09-30', amount: null, currency: 'GBP', status: 'pending', authority: 'Nationwide Building Society', reference_no: 'NW-MORT-441229', notes: 'Review annual statement. Confirm £500/month overpayments are being applied correctly to reduce capital.' },
    { title: 'CFA Level 3 Exam', type: 'other', due_date: '2026-08-15', amount: 990, currency: 'GBP', status: 'pending', authority: 'CFA Institute', reference_no: 'CFA-L3-JM-2026', notes: 'Exam window August 2026. Minimum 300 hours study required. Currently at ~180 hours.' },
    { title: 'Car Insurance Renewal — VW Golf R', type: 'renewal', due_date: '2026-08-22', amount: 1240, currency: 'GBP', status: 'pending', authority: 'Direct Line', reference_no: 'DL-LK22XRR-2026', notes: 'Review and compare before auto-renewal. Get Admiral and Comparethemarket quotes by August 10.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Nationwide Mortgage Agreement', doc_type: 'agreement', original_text: 'MORTGAGE AGREEMENT\nMortgagee: Nationwide Building Society\nMortgagor: James Christopher Mitchell\nProperty: Flat 2A, Clapham South, London SW4 8RQ\nAmount: £230,000 original; remaining balance ~£189,000\nInterest Rate: 4.85% fixed for 5 years (from September 2024)\nMonthly Repayment: £1,240\nOverpayment Allowance: Up to 10% of balance per year without ERC\nTerm: 25 years (ending September 2047)', summary_md: '## Nationwide Mortgage Summary\n\n**What:** 25-year residential mortgage, 5-year fix at 4.85%.\n\n**Key terms:**\n- Remaining balance: ~£189,000\n- Monthly payment: £1,240\n- Fixed rate until Sep 2029, then revert to SVR\n- Overpayment: Up to 10%/year (£18,900) without ERC\n\n**Action:** £500/month overpayment is within the 10% allowance — continue. Review fixed rate in August 2029.', key_points: ['5-year fixed at 4.85% — expires Sep 2029', '£1,240/month regular payment', 'Up to 10% overpayment per year (≈£18,900) without early repayment charge', 'Reverts to SVR after fixed period — plan for remortgage in 2029'], red_flags: [], expires_at: '2029-09-30', notes: 'Currently making £500/month overpayments within allowed limit.' },
    { name: 'Meridian Asset Partners Advisory Agreement 2026', doc_type: 'contract', original_text: 'ADVISORY AGREEMENT\nClient: Meridian Asset Partners LLP\nAdviser: James Mitchell\nServices: Macro investment advisory, 2 days/month\nFee: £1,800/day\nIP: All deliverables become property of Meridian upon payment\nTerm: January 2026 – December 2026, annual renewal\nConflict: Adviser confirms no employer conflict of interest\nGoverning Law: England and Wales', summary_md: '## Meridian Advisory Agreement\n\n**What:** 2 days/month macro advisory at £1,800/day.\n\n**Key terms:**\n- Fee: £3,600/month gross (£43,200/year)\n- IP: Written deliverables → Meridian property\n- Term: Jan–Dec 2026\n\n**Issues:** IP clause could be tightened. Add reference to Barclays OBI approval.', key_points: ['£1,800/day — 2 days/month (£43,200/year gross)', 'Written deliverables become Meridian property', '12-month term — January to December 2026', 'Barclays OBI compliance approval prerequisite'], red_flags: ['IP clause could be interpreted broadly to include oral advice', 'Self-certification of employer conflict without reference to formal approval'], expires_at: '2026-12-31', notes: 'Renew Jan 2027. Request rate increase to £2,000/day.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'UK Self-Assessment (HMRC) — Annual Filing', category: 'tax', frequency: 'annual', last_done_at: '2026-01-28', next_due_at: '2027-01-31', is_done: false, applicable: true, notes: 'For consulting income from Meridian. Register by Oct 5 2026 if not already on SA. File by Jan 31 2027.' },
    { item: 'Barclays Outside Business Interests (OBI) — Annual Renewal', category: 'business', frequency: 'annual', last_done_at: '2025-12-01', next_due_at: '2026-12-01', is_done: false, applicable: true, notes: 'Must renew Meridian engagement declaration annually per Barclays compliance policy.' },
    { item: 'CFA Annual Membership — CFA Institute', category: 'business', frequency: 'annual', last_done_at: '2026-01-15', next_due_at: '2027-01-15', is_done: false, applicable: true, notes: 'CFA UK annual membership £290. Renew before January 15 to maintain access.' },
    { item: 'VW Golf MOT & Road Tax Renewal', category: 'personal', frequency: 'annual', last_done_at: '2025-09-05', next_due_at: '2026-09-05', is_done: false, applicable: true, notes: 'MOT due September 2026. Road tax auto-renews via DVLA. Book garage 2 weeks ahead.' },
    { item: 'FCA Competency — Annual CPD Statement', category: 'business', frequency: 'annual', last_done_at: '2025-12-31', next_due_at: '2026-12-31', is_done: false, applicable: true, notes: 'Barclays requires annual CPD statement. Minimum 35 hours CPD. CFA study counts.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

// ── BRIEFINGS ─────────────────────────────────────────────────────────────────
async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, James.** Sunday — Alice video call at 10:30. Don\'t be late. Meridian invoice JM-2026-003 (£4,920) is outstanding — due May 14. Your CFA study target for this week is Chapter 6 (wealth planning). **Today\'s one thing: 45 minutes of CFA study before the Alice call.** Start the week with a win.', highlights: [{ label: 'Alice call', value: 'Today 10:30', link: '/habits', emoji: '📱' }, { label: 'Pending invoice', value: '£4,920 due May 14', link: '/business', emoji: '🧾' }, { label: 'CFA exam', value: 'August 2026', link: '/career', emoji: '📊' }, { label: 'Edinburgh run', value: 'Jul 19 — 11 weeks', link: '/travel', emoji: '🏃' }] },
    { date: '2026-05-04', content_md: '**Good morning, James.** Monday. BT bill (£48) due May 10. Your 60-day no-alcohol streak is intact — respect that. The Meridian Q1 macro memo review is overdue — Meridian will ask about it this week. The Edinburgh half-marathon is 11 weeks out: today\'s run matters. **Priority: complete the Meridian Q1 macro memo today.** It\'s 80% done.', highlights: [{ label: 'Alcohol-free streak', value: '60 days', link: '/habits', emoji: '🚫' }, { label: 'BT bill due', value: '£48 by May 10', link: '/home', emoji: '💡' }, { label: 'Pending invoice', value: '£4,920 due May 14', link: '/business', emoji: '🧾' }, { label: 'Run distance', value: '9 miles this week', link: '/habits', emoji: '🏃' }] },
    { date: '2026-05-05', content_md: '**Good morning, James.** Tuesday. CFA study streak: 10 days consecutive — excellent. The British Gas electricity bill (£118) is due May 15 — pay it with the O2 bill in one session. Barclays Q2 pipeline briefing is Thursday — prepare 15-minute update. **Today: CFA mock test session — section 3. You need to know which areas to target in the final 12 weeks.** No half-measures.', highlights: [{ label: 'CFA study streak', value: '10 days', link: '/habits', emoji: '📊' }, { label: 'Bills due', value: '3 pending by May 15', link: '/home', emoji: '💡' }, { label: 'Pending invoice', value: '£4,920 Meridian', link: '/business', emoji: '🧾' }, { label: 'Alice', value: 'Holiday starts Jul 20', link: '/travel', emoji: '📱' }] },
    { date: '2026-05-06', content_md: '**Good morning, James.** Midweek. The Meridian invoice hasn\'t moved yet — email accounts today. Your O2 phone bill (£35) due May 5 is still showing unpaid — handle that now. The mortgage overpayment of £500 went through April 30 — Nationwide balance now £188,000. Small progress, big picture. **Today: pipeline briefing prep + Meridian invoice follow-up. Clear the decks for Thursday.**', highlights: [{ label: 'Mortgage balance', value: '£188,000 (↓)', link: '/money', emoji: '🏠' }, { label: 'Invoice follow-up', value: 'Meridian £4,920', link: '/business', emoji: '🧾' }, { label: 'O2 bill overdue', value: '£35', link: '/home', emoji: '📱' }, { label: 'Edinburgh run', value: '10 weeks to race', link: '/travel', emoji: '🏃' }] },
    { date: '2026-05-07', content_md: '**Good morning, James.** Thursday — pipeline briefing day. You\'re prepared. The CFA study is on track: Chapter 6 done. Your Alice Edinburgh trip is booked — she doesn\'t know yet. When are you telling her? **For today: deliver the pipeline briefing clearly and concisely. No filler.** Then gym at 6pm — you promised yourself.', highlights: [{ label: 'Alice surprise', value: 'Edinburgh Jul 18', link: '/travel', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, { label: 'CFA Chapter', value: '6 of 8 complete', link: '/habits', emoji: '📊' }, { label: 'Alcohol-free', value: 'Day 63', link: '/habits', emoji: '🚫' }, { label: 'Pending invoice', value: '£4,920 Meridian', link: '/business', emoji: '🧾' }] },
    { date: '2026-05-08', content_md: '**Good morning, James.** Friday — WFH. Meridian invoice is still outstanding. Chase again this afternoon — firm but professional. The British Gas, BT and O2 bills are all pending: do them in one online session before 10am. CFA study this morning: Chapter 7 target by end of day. **Real focus today: 90-minute CFA deep session + clear all pending bills.** Then a proper weekend.', highlights: [{ label: 'CFA study', value: 'Chapter 7 target today', link: '/habits', emoji: '📊' }, { label: 'Bills pending', value: '3 (Gas, BT, O2)', link: '/home', emoji: '💡' }, { label: 'Invoice chase', value: 'Meridian £4,920 — Day 9', link: '/business', emoji: '🧾' }, { label: 'Run this weekend', value: 'Long run: 10 miles', link: '/habits', emoji: '🏃' }] },
    { date: '2026-05-09', content_md: '**Good morning, James.** Saturday. 10-mile long run day — that\'s the plan. Alice video call was great last Sunday — she showed you her Minecraft build. Lisbon is planned for next February — something to look forward to after the Edinburgh race. The Meridian invoice came in yesterday — £4,920 cleared. Good. **Today: run, then rest. Nothing else.** You\'ve had a strong week.', highlights: [{ label: 'Long run target', value: '10 miles today', link: '/habits', emoji: '🏃' }, { label: 'Meridian invoice', value: '£4,920 cleared ✓', link: '/business', emoji: '🧾' }, { label: 'Edinburgh race', value: '10 weeks away', link: '/travel', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }, { label: 'CFA exam', value: 'August 2026 — 12 weeks', link: '/career', emoji: '📊' }] },
  ]
  let n = 0
  for (const b of briefings) { const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T06:00:00Z` }, { onConflict: 'user_id,date' }); if (!error) n++; else console.log(`  ✗  briefing: ${error.message}`) }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  James Mitchell uid: ${UID}`)
  await seedMemory(); await seedHabits(); await seedFocus(); await seedDecisions()
  await seedBusiness(); await seedHome(); await seedTravel()
  await seedProtection(); await seedLegal(); await seedBriefings()
  console.log('\n✅  Seed complete.\n')
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
