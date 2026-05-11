/**
 * Full seed for Yuki Tanaka — Marketing Manager in Tokyo, Japan.
 * Run: node tests/e2e-personas/seed-yuki-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '612d3c25-22e2-44d7-8b2b-a52ebbf7167d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Yuki Tanaka', occupation: 'Marketing Manager', life_stage: 'mid_career',
    country: 'JP', currency: 'JPY', timezone: 'Asia/Tokyo', preferred_language: 'ja',
    goals: [
      'Promote to Marketing Director at Canon Japan by Q2 2027',
      'Travel to France and Italy for 2 weeks in autumn 2026 with Kenji',
      'Improve English to business-level fluency — TOEIC 900+ by end of 2026',
      'Run Tokyo Marathon 2027 — first full marathon',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Yuki Tanaka (Marketing Manager, Tokyo)')

  const items = [
    { type: 'fact',         key: 'annual_salary',          value: 'JPY 7,200,000/year (¥600,000/month base) at Canon Japan — Marketing Division, Consumer Products Group. Plus annual bonus ~20–30% of base.' },
    { type: 'fact',         key: 'home_location',          value: '2LDK apartment, Ebisu, Shibuya-ku, Tokyo — monthly rent ¥195,000. 10 min walk to Ebisu station. Signed lease until March 2027.' },
    { type: 'fact',         key: 'household',              value: 'Lives with husband Kenji Tanaka (high school PE teacher, Setagaya-ku). No children — considering starting family in 2027-28.' },
    { type: 'fact',         key: 'employer',               value: 'Canon Inc. — Marketing Manager, Consumer & Imaging Division. 9 years with Canon. Team of 8 reports.' },
    { type: 'fact',         key: 'languages',              value: 'Japanese (native), English (B1-B2 — improving actively; daily study via Duolingo and BBC), French (beginner — planning to learn for Paris trip)' },
    { type: 'preference',   key: 'work_schedule',          value: 'Office 9am–6pm weekdays (Shibuya). Occasional overtime until 8pm for campaign launches. Works from home Wednesdays.' },
    { type: 'preference',   key: 'diet',                   value: 'Japanese home cooking (Kenji cooks most nights). Avoids raw fish (fish allergy discovered 2024). Loves Italian and French cuisine for date nights.' },
    { type: 'preference',   key: 'communication_style',    value: 'Detail-oriented and collaborative — prefers consensus before decisions (nemawashi). Thorough written proposals for major decisions.' },
    { type: 'preference',   key: 'fitness',                value: 'Started running seriously in 2025 after sedentary work life. Currently 5–6 km 3×/week. Target: Tokyo Marathon 2027. Also does yoga Sunday mornings.' },
    { type: 'goal',         key: 'career_goal',            value: 'Marketing Director promotion at Canon Japan — needs to lead one more major campaign launch and mentor 2 junior managers' },
    { type: 'goal',         key: 'travel_goal',            value: 'France and Italy autumn 2026 — Paris (5 days), Tuscany (4 days), Rome (3 days). Anniversary trip with Kenji.' },
    { type: 'goal',         key: 'financial_goal',         value: 'Build savings of JPY 5,000,000 by 2027 for potential home purchase or family planning costs. Currently at JPY 2,800,000.' },
    { type: 'concern',      key: 'work_pressure',          value: 'Q1 2026 campaign underperformed budget targets by 12% — management scrutinizing Q2 closely. Director promotion depends on Q2 recovery.' },
    { type: 'concern',      key: 'work_life_balance',      value: 'Overtime is frequent during campaign seasons (March-April, October-November). Kenji feels neglected during busy periods.' },
    { type: 'relationship', key: 'spouse',                 value: 'Kenji Tanaka — PE teacher, Setagaya-ku. Birthday February 28. Loves hiking and cycling. Very supportive of Yuki\'s career ambitions.' },
  ]
  let n = 0
  for (const it of items) { const { error } = await db.from('memory_items').insert({ user_id: UID, source: 'manual', confidence: 95, is_active: true, ...it }); if (!error) n++; else console.log(`  ✗  memory: ${error.message}`) }
  console.log(`  ✔  ${n}/${items.length} memory items`)
}

async function seedHabits() {
  console.log('\n🌱  Seeding habits...')
  const defs = [
    { name: 'Morning Run (5–7km)',       icon: '🏃', color: 'emerald', frequency: 'custom',   days_of_week: [1,3,5],         reminder_time: '06:30', completedOffsets: [1,3,5,8,10,12,15,17,19] },
    { name: 'English Study (30 min)',    icon: '🌍', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Sunday Yoga with Kenji',    icon: '🧘', color: 'violet',  frequency: 'custom',   days_of_week: [0],             reminder_time: '09:00', completedOffsets: [0,7,14] },
    { name: 'Read 15 Pages (JP/EN)',     icon: '📚', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,2,3,5,6,7,8,9,10,12,13,14,15,16,18,19,20] },
    { name: 'No overtime past 7pm',      icon: '⏰', color: 'rose',    frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '19:00', completedOffsets: [1,2,3,4,8,9,10,11,15,16,17,18] },
    { name: 'Date night prep (cook together)', icon: '🍳', color: 'amber', frequency: 'custom', days_of_week: [5],          reminder_time: '18:00', completedOffsets: [5,12,19] },
    { name: 'Campaign data review 30min', icon: '📊', color: 'purple', frequency: 'weekdays', days_of_week: [1,2,3,4,5],   reminder_time: '08:30', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
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

async function seedFocus() {
  console.log('\n🎯  Seeding focus...')
  await db.from('focus_preferences').upsert({ user_id: UID, default_mode: 'deep', break_interval_minutes: 5, long_break_minutes: 15, sessions_before_long_break: 3, body_doubling_default: false, daily_focus_goal_minutes: 90 }, { onConflict: 'user_id' })
  console.log('  ✔  focus prefs: 90min/day, deep-work default')

  // JST = UTC+9; 07:00 JST = 22:00 UTC previous day
  // For simplicity use offset-1 day approach: 07:00 JST on offset day N = offset day (N-1)T22:00Z
  // But easier to just express as same day with time: date(N)T22:00Z = 07:00 JST next day
  // Let's just use: work hours in JST. 09:00 JST = 00:00 UTC
  const sessions = [
    { off: 1,  mode: 'deep',     plan: 60, act: 58, done: true,  title: 'Q2 campaign strategy document — draft v1',                  time: '00:00' },
    { off: 2,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Monthly KPI dashboard update and stakeholder prep',         time: '01:00' },
    { off: 3,  mode: 'deep',     plan: 75, act: 72, done: true,  title: 'Canon EOS R campaign creative brief — Q2 launch',           time: '00:00' },
    { off: 4,  mode: 'pomodoro', plan: 25, act: 23, done: true,  title: 'TOEIC practice test — listening section',                  time: '22:30' },
    { off: 4,  mode: 'deep',     plan: 60, act: 55, done: true,  title: 'Agency briefing document for Q2 digital campaign',         time: '00:30' },
    { off: 5,  mode: 'deep',     plan: 45, act: 42, done: true,  title: 'France-Italy trip research — itinerary draft v1',           time: '00:00' },
    { off: 5,  mode: 'pomodoro', plan: 25, act: 20, done: false, title: 'Budget reconciliation Q1', time: '02:00', abandoned: true },
    { off: 8,  mode: 'deep',     plan: 90, act: 88, done: true,  title: 'Canon imaging division — H2 marketing roadmap',            time: '00:00' },
    { off: 9,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'English study: business presentation phrases',             time: '22:00' },
    { off: 9,  mode: 'deep',     plan: 60, act: 60, done: true,  title: 'Q2 campaign: SNS content calendar (Instagram, Twitter)',   time: '01:00' },
    { off: 10, mode: 'deep',     plan: 60, act: 62, done: true,  title: 'Mid-year performance self-assessment — Director prep',      time: '00:00' },
    { off: 10, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Hotel research Paris and Tuscany — compare 3 options',     time: '02:00' },
    { off: 11, mode: 'deep',     plan: 75, act: 70, done: true,  title: 'Canon EOS R launch — influencer partnership brief',        time: '00:00' },
    { off: 12, mode: 'pomodoro', plan: 25, act: 22, done: true,  title: 'Weekly review and next-week sprint plan',                  time: '01:30' },
    { off: 14, mode: 'deep',     plan: 90, act: 87, done: true,  title: 'Q2 campaign creative: approval presentation to VP',        time: '00:00' },
    { off: 15, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Agency call prep: Q2 digital execution timeline',         time: '01:00' },
    { off: 15, mode: 'deep',     plan: 60, act: 63, done: true,  title: 'TOEIC practice: reading comprehension + vocabulary',       time: '22:30' },
    { off: 16, mode: 'deep',     plan: 75, act: 72, done: true,  title: 'Marathon training plan research — Tokyo 2027 program',     time: '00:00' },
    { off: 17, mode: 'deep',     plan: 60, act: 58, done: true,  title: 'France trip: restaurant reservations and museum booking',  time: '00:30' },
    { off: 17, mode: 'pomodoro', plan: 25, act: 16, done: false, title: 'Apartment lease renewal review', time: '02:30', abandoned: true },
    { off: 18, mode: 'deep',     plan: 90, act: 85, done: true,  title: 'Canon Q2 campaign — final approval document + exec deck',  time: '00:00' },
    { off: 19, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'English — BBC Worklife podcast + note-taking',            time: '22:00' },
    { off: 19, mode: 'deep',     plan: 60, act: 55, done: true,  title: 'Director promotion: portfolio of achievements doc',        time: '00:30' },
    { off: 20, mode: 'quick',    plan: 15, act: 13, done: true,  title: 'Italy visa requirements review + checklist',              time: '00:00' },
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

async function seedDecisions() {
  console.log('\n🤔  Seeding decisions...')
  const decisions = [
    {
      question: 'Should I volunteer to lead the Canon EOS R launch campaign to strengthen my Director promotion case?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-04-20T01:00:00Z', favorite: true,
      result: {
        summary: 'The Canon EOS R Q2 launch is a high-visibility campaign — managing it successfully would be a compelling Director promotion data point. However, the Q1 shortfall means scrutiny is high and failure would be damaging.',
        recommendation: 'Volunteer to co-lead (not solo lead) the EOS R campaign with a senior colleague as sponsor. This shares risk while still building the promotion case. Present a clear KPI plan to VP Hayashi before taking on the role.',
        confidenceScore: 77, riskScore: 45, riskLevel: 'medium',
        financialImpact: { summary: 'Director promotion = ~JPY 1,200,000/year salary increase + higher bonus tier.', monthlyCostChange: 0, oneTimeCost: null, opportunityCost: 'Significant overtime during campaign — Kenji will feel this', affordabilityScore: 90 },
        pros: ['High-visibility campaign directly visible to VP and Board', 'Success would decisively make the Q2 recovery narrative', 'Demonstrates leadership initiative — key Director criterion'],
        cons: ['Q1 miss puts extra pressure on Q2 — risk of second underperformance', 'Campaign requires overtime (Kenji factor)', 'Sole failure ownership if co-lead arrangement is misunderstood'],
        nextSteps: ['Request meeting with VP Hayashi to propose co-lead structure', 'Set clear KPIs upfront: reach, conversion, brand awareness lift', 'Tell Kenji about the overtime plan — align expectations'],
        memoryFactorsUsed: ['Career goal: Director by Q2 2027', 'Work pressure: Q1 underperformed by 12%'],
        dataSourcesUsed: ['Canon Japan internal promotion criteria (inferred)', 'Consumer imaging market trends Q2 2026'],
      },
    },
    {
      question: 'France and Italy trip — Paris first or Rome first?',
      category: 'family', mode: 'compare', options: ['Paris first (then Tuscany → Rome)', 'Rome first (then Tuscany → Paris)'],
      created_at: '2026-04-27T00:30:00Z', favorite: false,
      result: {
        question: 'France-Italy trip: Paris → Tuscany → Rome or Rome → Tuscany → Paris?',
        factors: ['Energy curve', 'Flight connection efficiency', 'Romantic ending', 'Weather in October', 'Cultural preference'],
        options: [
          { label: 'Paris first', scores: { 'Energy curve': 80, 'Flight connection efficiency': 85, 'Romantic ending': 70, 'Weather in October': 78, 'Cultural preference': 75 },
            pros: ['Easier flight Tokyo → CDG (direct ANA or JAL)', 'Start with French immersion — apply language basics first', 'Tuscany is a natural transition from France to Italy', 'Ends in Rome — most logistically flexible return flights'], cons: ['Rome in late October can be crowded', 'Less climactic ending if Paris is the dream city'], summary: 'More practical routing and starts with France immersion.' },
          { label: 'Rome first', scores: { 'Energy curve': 65, 'Flight connection efficiency': 60, 'Romantic ending': 95, 'Weather in October': 80, 'Cultural preference': 70 },
            pros: ['Ends in Paris — most romantic conclusion', 'Energy usually highest at start of trip — explore Rome before fatigue sets in'], cons: ['Tokyo → Rome requires more connections', 'Returns Paris → Tokyo — some airlines are indirect'], summary: 'More romantic ending but logistically harder.' },
        ],
        recommendation: 'Paris first. Fly Tokyo → Paris (direct JAL flight, 14h), then Tuscany by train (TGV via Milan), then Rome. Return Rome → Tokyo. Simpler, equally beautiful.',
        winner: 'Paris first (then Tuscany → Rome)',
      },
    },
    {
      question: 'Should I hire a marketing assistant (JPY 250,000/month) or continue with freelance support per project?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-04T01:00:00Z', favorite: false,
      result: {
        summary: 'Hiring a full-time marketing assistant at JPY 250,000/month (JPY 3,000,000/year) would free 8–10 hours/week for strategic work — critical for the Director promotion path. However, the hire requires VP approval and a budget justification.',
        recommendation: 'Propose a 6-month contract assistant (via staffing agency) rather than a permanent hire — lower barrier to approval. Frame it as "Q2 campaign resource" with a Director-level ROI argument.',
        confidenceScore: 70, riskScore: 30, riskLevel: 'low',
        financialImpact: { summary: 'JPY 250,000/month vs current freelance average JPY 180,000/month. Net increase: JPY 70,000/month from marketing budget.', monthlyCostChange: 70000, oneTimeCost: null, opportunityCost: 'Requires VP budget approval — possible political friction', affordabilityScore: 75 },
        pros: ['Frees strategic time for Director promotion activities', 'Consistent support vs inconsistent freelancers', 'Demonstrates leadership — managing a direct report'],
        cons: ['Budget approval may be delayed or denied', 'Permanent hire is riskier if Q2 campaign does not perform'], nextSteps: ['Draft business case: assistant ROI in Q2 campaign hours saved', 'Request 6-month contract trial through Canon staffing framework', 'Identify strong candidate via professional network first'],
        memoryFactorsUsed: ['Career goal: Director by Q2 2027', 'Work-life balance concern: overtime frequency'],
        dataSourcesUsed: ['Tokyo marketing assistant salary benchmarks 2026'],
      },
    },
    {
      question: 'TOEIC target: aim for 900 by December 2026 or be realistic with 820?',
      category: 'education', mode: 'analyze', options: [], created_at: '2026-05-09T22:00:00Z', favorite: false,
      result: {
        summary: 'Current TOEIC estimated score is ~760 based on practice tests. Moving from 760 to 900 in 7 months requires significant study (2+ hours/day) — difficult during campaign season. A 820 target (140 points improvement) is achievable at 1 hour/day.',
        recommendation: 'Target 820 as the commitment, with 860 as the stretch goal. Study 1 hour/day consistently using official TOEIC materials + 30-min conversation practice. Take a mock exam in September.',
        confidenceScore: 78, riskScore: 20, riskLevel: 'low',
        financialImpact: { summary: 'TOEIC exam fee: JPY 8,000. Study materials: JPY 5,000. Total: JPY 13,000.', monthlyCostChange: 0, oneTimeCost: 13000, opportunityCost: '1 hour/day — consistent but sustainable', affordabilityScore: 95 },
        pros: ['820+ opens international Canon project opportunities', 'English fluency is a clear Director criterion at Canon global', 'Daily habit already established (30 min study) — extend to 60 min'],
        cons: ['900 target would require sacrificing evening family time during campaigns', '820 may not differentiate enough vs other Director candidates with TOEIC 850+'],
        nextSteps: ['Purchase TOEIC official practice test (3 volumes)', 'Book December exam date immediately on TOEIC website', 'Add 30 min conversation practice 3×/week via HelloTalk app'],
        memoryFactorsUsed: ['Goal: TOEIC 900+ by end 2026', 'English daily study already established habit'],
        dataSourcesUsed: ['TOEIC score improvement benchmarks — average 80-100 points per 100 study hours'],
      },
    },
    {
      question: 'Should I apply for the Canon Asia Pacific marketing rotation (6 months in Singapore) for promotion visibility?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-05-07T01:00:00Z', favorite: true,
      result: {
        summary: 'The Canon APAC rotation in Singapore is a prestigious 6-month program that has been a stepping stone for 3 of the last 5 Marketing Directors in Japan. Yuki qualifies and the timing (Q4 2026 start) avoids the Q2 campaign. However, the personal cost is significant — 6 months away from Kenji in Tokyo.',
        recommendation: 'Apply. This rotation is likely the fastest path to Director. Negotiate with Kenji first — explore whether he can take an unpaid leave for 2 months to visit Singapore. The professional gain far outweighs the temporary distance.',
        confidenceScore: 73, riskScore: 50, riskLevel: 'medium',
        financialImpact: { summary: 'Rotation includes housing allowance in Singapore. Net financial impact: approximately neutral. Director promotion accelerated by 12–18 months.', monthlyCostChange: 0, oneTimeCost: null, opportunityCost: 'Kenji cannot visit more than 4 weeks on teacher holidays', affordabilityScore: 88 },
        pros: ['3 of last 5 Japan Marketing Directors did APAC rotation first', 'Singapore exposure adds global credential to resume', 'Direct visibility with Canon APAC VP and regional C-suite'],
        cons: ['6 months away from Kenji — strain on relationship', 'Disrupts marathon training momentum', 'If rotation goes poorly, it could delay promotion instead of accelerate it'],
        nextSteps: ['Discuss with Kenji honestly — map out visit schedule across 6 months', 'Talk to Taniguchi-san (previous rotation participant) for reality check', 'Express interest to VP Hayashi informally before formal application cycle opens in June'],
        memoryFactorsUsed: ['Career goal: Director by Q2 2027', 'Work-life balance concern: Kenji feels neglected during busy periods'],
        dataSourcesUsed: ['Canon Japan Director promotion paths (internal knowledge)', 'Singapore housing allowance benchmarks'],
      },
    },
  ]
  let n = 0
  for (const d of decisions) { const { error } = await db.from('decision_logs').insert({ user_id: UID, question: d.question, category: d.category, mode: d.mode, options: d.options, context_snapshot: {}, result: d.result, favorite: d.favorite, created_at: d.created_at }); if (!error) n++; else console.log(`  ✗  decision: ${error.message}`) }
  console.log(`  ✔  ${n}/${decisions.length} decision logs`)
}

async function seedBusiness() {
  console.log('\n💼  Seeding business...')
  const agency = await ins('business_clients', { user_id: UID, name: 'Hakuhodo Digital', company: 'Hakuhodo Digital Co., Ltd.', email: 'projects@hakuhodo-digital.co.jp', phone: '+81334444000', address: 'Minato-ku, Tokyo 107-6311', currency: 'JPY', notes: 'Primary creative agency for Canon consumer campaigns. Annual contract ¥18M.' }, 'client: Hakuhodo')
  const photo = await ins('business_clients', { user_id: UID, name: 'Fuji Portrait Studio', company: 'Fuji Portrait Studio K.K.', email: 'info@fuji-portrait.jp', phone: '+81354441234', address: 'Shibuya-ku, Tokyo 150-0002', currency: 'JPY', notes: 'Photography studio — occasional Canon equipment consulting and brand ambassador referrals.' }, 'client: Fuji Portrait')
  if (!agency || !photo) return

  const projH = await ins('business_projects', { user_id: UID, client_id: agency.id, name: 'Canon EOS R Q2 2026 Launch Campaign', status: 'active', start_date: '2026-04-01', end_date: '2026-07-31', fee: 4500000, currency: 'JPY', notes: '4-month agency engagement. Managed from Canon side.' }, 'project: EOS R campaign')
  if (projH) {
    await ins('business_invoices', { user_id: UID, client_id: agency.id, project_id: projH.id, invoice_no: 'YT-2026-001', issued_at: '2026-04-30', due_at: '2026-05-30', items: [{ description: 'EOS R Campaign — April deliverables (creative brief, mood boards, initial assets)', qty: 1, rate: 1200000, amount: 1200000 }], subtotal: 1200000, tax_pct: 10, tax_amt: 120000, discount_amt: 0, total: 1320000, currency: 'JPY', status: 'sent' }, 'invoice: YT-2026-001')
    await ins('business_invoices', { user_id: UID, client_id: agency.id, project_id: projH.id, invoice_no: 'YT-2026-000', issued_at: '2026-03-31', due_at: '2026-04-30', items: [{ description: 'EOS R Campaign — March pre-production (strategy, agency brief)', qty: 1, rate: 800000, amount: 800000 }], subtotal: 800000, tax_pct: 10, tax_amt: 80000, discount_amt: 0, total: 880000, currency: 'JPY', status: 'paid', paid_at: '2026-04-25' }, 'invoice: YT-2026-000')
  }
  await ins('business_invoices', { user_id: UID, client_id: photo.id, project_id: null, invoice_no: 'YT-2026-002', issued_at: '2026-04-15', due_at: '2026-04-30', items: [{ description: 'Canon Brand Ambassador consultation — Fuji Portrait Studio', qty: 1, rate: 150000, amount: 150000 }], subtotal: 150000, tax_pct: 10, tax_amt: 15000, discount_amt: 0, total: 165000, currency: 'JPY', status: 'paid', paid_at: '2026-04-28' }, 'invoice: YT-2026-002')

  const expenses = [
    { category: 'professional_fees', vendor: 'TOEIC (IIBC)', amount: 8000, occurred_at: '2026-03-01', description: 'TOEIC L&R exam registration — December 2026 sitting' },
    { category: 'software', vendor: 'Slack Business+', amount: 0, occurred_at: '2026-04-01', description: 'Canon-covered Slack — tracked for personal project reference' },
    { category: 'travel', vendor: 'ANA', amount: 85000, occurred_at: '2026-03-15', description: 'Tokyo → Osaka (Osaka agency pitch presentation) return — business class upgrade' },
    { category: 'marketing', vendor: 'Canva Pro (personal)', amount: 15000, occurred_at: '2026-01-15', description: 'Canva Pro annual — personal portfolio and freelance presentation design' },
    { category: 'professional_fees', vendor: 'JAA (Japan Advertising Association)', amount: 12000, occurred_at: '2026-02-01', description: 'JAA annual membership — advertising industry network events' },
    { category: 'office', vendor: 'Shinjuku co-working day pass', amount: 4400, occurred_at: '2026-04-20', description: 'WeWork Shinjuku day pass × 4 — Hakuhodo creative review sessions' },
  ]
  let n = 0
  for (const e of expenses) { const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'JPY', is_billable: false, ...e }); if (!error) n++; else console.log(`  ✗  expense: ${error.message}`) }
  console.log(`  ✔  ${n}/${expenses.length} expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const washer = await ins('home_assets', { user_id: UID, name: 'Panasonic Drum Washer-Dryer', type: 'appliance', brand: 'Panasonic', model: 'NA-VX900BL', purchased_at: '2022-03-01', warranty_until: '2027-03-01', cost: 158000, notes: 'Ebisu apartment — drum type with heat pump dryer. Use warm wash for work clothes.' }, 'asset: Panasonic washer-dryer')
  const ac = await ins('home_assets', { user_id: UID, name: 'Daikin Split AC (2.5kW)', type: 'appliance', brand: 'Daikin', model: 'S25ZTES-W (2023)', purchased_at: '2023-07-10', warranty_until: '2028-07-10', cost: 145000, notes: 'Living room AC — run heavily May–Sep. Annual filter clean required.' }, 'asset: Daikin AC')
  const camera = await ins('home_assets', { user_id: UID, name: 'Canon EOS R6 Mark II (personal)', type: 'electronics', brand: 'Canon', model: 'EOS R6 Mark II + 24-105mm', purchased_at: '2023-12-15', warranty_until: '2025-12-15', cost: 420000, notes: 'Personal camera — staff discount purchase. Insured separately.' }, 'asset: Canon EOS R6')

  if (ac) await ins('home_maintenance', { user_id: UID, asset_id: ac.id, title: 'Daikin AC Filter & Annual Maintenance', category: 'cleaning', recurrence_months: 12, last_done_at: '2025-06-15', next_due_at: '2026-06-15', vendor: 'Daikin Service (Shibuya)', cost: 15000, is_active: true }, 'maint: AC annual')
  if (washer) await ins('home_maintenance', { user_id: UID, asset_id: washer.id, title: 'Drum Washer-Dryer Descaling', category: 'cleaning', recurrence_months: 3, last_done_at: '2026-02-15', next_due_at: '2026-05-15', vendor: null, cost: 0, is_active: true, notes: 'Use Panasonic drum cleaner tablets — cycle 95°C 3h' }, 'maint: washer descaling')

  const bills = [
    { utility: 'electricity', provider: 'TEPCO (Tokyo Electric Power)', amount: 12800, bill_date: '2026-02-28', due_date: '2026-03-25', is_paid: true, account_no: 'TEPCO-0441-2290' },
    { utility: 'electricity', provider: 'TEPCO (Tokyo Electric Power)', amount: 11400, bill_date: '2026-03-31', due_date: '2026-04-25', is_paid: true, account_no: 'TEPCO-0441-2290' },
    { utility: 'electricity', provider: 'TEPCO (Tokyo Electric Power)', amount: 13200, bill_date: '2026-04-30', due_date: '2026-05-25', is_paid: false, account_no: 'TEPCO-0441-2290' },
    { utility: 'water', provider: 'Tokyo Waterworks Bureau', amount: 3800, bill_date: '2026-02-28', due_date: '2026-03-31', is_paid: true, account_no: 'TWB-SHI-44122' },
    { utility: 'water', provider: 'Tokyo Waterworks Bureau', amount: 3800, bill_date: '2026-04-30', due_date: '2026-05-31', is_paid: false, account_no: 'TWB-SHI-44122' },
    { utility: 'internet', provider: 'NTT Hikari (光回線 1Gbps)', amount: 5500, bill_date: '2026-03-05', due_date: '2026-03-15', is_paid: true, account_no: 'NTT-EBI-441229' },
    { utility: 'internet', provider: 'NTT Hikari (光回線 1Gbps)', amount: 5500, bill_date: '2026-04-05', due_date: '2026-04-15', is_paid: true, account_no: 'NTT-EBI-441229' },
    { utility: 'internet', provider: 'NTT Hikari (光回線 1Gbps)', amount: 5500, bill_date: '2026-05-05', due_date: '2026-05-15', is_paid: false, account_no: 'NTT-EBI-441229' },
    { utility: 'phone', provider: 'au (KDDI) — iPhone plan', amount: 7800, bill_date: '2026-03-15', due_date: '2026-03-25', is_paid: true, account_no: 'AU-090-4412-2290' },
    { utility: 'phone', provider: 'au (KDDI) — iPhone plan', amount: 7800, bill_date: '2026-04-15', due_date: '2026-04-25', is_paid: true, account_no: 'AU-090-4412-2290' },
    { utility: 'phone', provider: 'au (KDDI) — iPhone plan', amount: 7800, bill_date: '2026-05-05', due_date: '2026-05-15', is_paid: false, account_no: 'AU-090-4412-2290' },
  ]
  let n = 0
  for (const b of bills) { const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b }); if (!error) n++; else console.log(`  ✗  bill: ${error.message}`) }
  console.log(`  ✔  ${n}/${bills.length} utility bills`)
}

async function seedTravel() {
  console.log('\n✈️   Seeding travel...')
  const fr = await ins('trips', { user_id: UID, destination: 'Paris, Tuscany & Rome', start_date: '2026-10-10', end_date: '2026-10-22', status: 'planning', budget_total: 800000, currency: 'JPY', travellers: 2, notes: '12-day anniversary trip with Kenji. Paris 5 days, Tuscany 4 days, Rome 3 days. JAL direct to CDG.', cover_emoji: '🗼' }, 'trip: France-Italy')
  if (fr) {
    const items = [
      { type: 'flight', title: 'JAL JL45 Tokyo Narita (NRT) → Paris CDG', starts_at: '2026-10-10T10:30:00+09:00', ends_at: '2026-10-10T16:00:00+02:00', location: 'Narita Airport Terminal 2', cost: 220000, order_index: 1 },
      { type: 'hotel', title: 'Hôtel de Crillon, Paris (5 nights)', starts_at: '2026-10-10T17:00:00+02:00', ends_at: '2026-10-15T12:00:00+02:00', location: '10 Pl. de la Concorde, Paris', cost: 250000, booking_ref: null, order_index: 2, notes: 'Luxury 5-star — anniversary splurge. Near Champs-Élysées and Louvre.' },
      { type: 'activity', title: 'Musée du Louvre + Musée d\'Orsay tickets', starts_at: '2026-10-11T09:00:00+02:00', location: 'Paris, France', cost: 8000, order_index: 3 },
      { type: 'activity', title: 'Paris cooking class — French pastry', starts_at: '2026-10-13T10:00:00+02:00', location: 'Le Cordon Bleu Paris, 13 Quai André Citroën', cost: 25000, order_index: 4 },
      { type: 'flight', title: 'Air France CDG → FCO (Rome) via Tuscany by train', starts_at: '2026-10-15T15:00:00+02:00', location: 'Gare de Lyon, Paris → Firenze Santa Maria Novella', cost: 18000, order_index: 5 },
      { type: 'hotel', title: 'Agriturismo in Chianti, Tuscany (4 nights)', starts_at: '2026-10-15T18:00:00+02:00', ends_at: '2026-10-19T11:00:00+02:00', location: 'Chianti, Tuscany', cost: 90000, order_index: 6 },
      { type: 'hotel', title: 'Hotel de Russie, Rome (3 nights)', starts_at: '2026-10-19T14:00:00+02:00', ends_at: '2026-10-22T11:00:00+02:00', location: 'Via del Babuino 9, Rome', cost: 120000, order_index: 7 },
      { type: 'flight', title: 'ANA NH207 Rome FCO → Tokyo NRT', starts_at: '2026-10-22T14:00:00+02:00', ends_at: '2026-10-23T08:00:00+09:00', location: 'Rome Fiumicino Airport (FCO)', cost: 195000, order_index: 8 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: fr.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Passports', category: 'documents', qty: 2, is_packed: false },
      { item: 'Schengen visa documents', category: 'documents', qty: 1, is_packed: false },
      { item: 'Elegant dress for Paris dinner', category: 'clothing', qty: 2, is_packed: false },
      { item: 'Comfortable walking shoes', category: 'clothing', qty: 2, is_packed: false },
      { item: 'Canon EOS R6 + travel lens', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Universal travel adapter (EU)', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Kenji\'s hiking gear (Tuscany)', category: 'clothing', qty: 1, is_packed: false },
      { item: 'French phrasebook', category: 'accessories', qty: 1, is_packed: false },
    ]
    let pOk = 0; for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: fr.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  France-Italy: ${iOk} items, ${pOk} packing`)
  }

  const osaka = await ins('trips', { user_id: UID, destination: 'Osaka, Japan', start_date: '2026-03-14', end_date: '2026-03-15', status: 'completed', budget_total: 95000, currency: 'JPY', travellers: 1, notes: 'Agency pitch presentation — Hakuhodo Osaka creative team review.', cover_emoji: '🏯' }, 'trip: Osaka (done)')
  if (osaka) {
    const items = [
      { type: 'flight', title: 'ANA HND → KIX', starts_at: '2026-03-14T07:00:00+09:00', location: 'Haneda Airport', cost: 42000, is_done: true, order_index: 1 },
      { type: 'activity', title: 'Hakuhodo Osaka — agency creative review', starts_at: '2026-03-14T14:00:00+09:00', location: 'Nakanoshima, Osaka', cost: 0, is_done: true, order_index: 2 },
      { type: 'flight', title: 'ANA KIX → HND', starts_at: '2026-03-15T19:00:00+09:00', location: 'Kansai International Airport', cost: 38000, is_done: true, order_index: 3 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: osaka.id, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Osaka: ${iOk} trip items`)
  }

  const kyoto = await ins('trips', { user_id: UID, destination: 'Kyoto & Nara, Japan', start_date: '2026-08-13', end_date: '2026-08-16', status: 'booked', budget_total: 120000, currency: 'JPY', travellers: 2, notes: 'Obon holiday long weekend with Kenji. Temple hopping and ryokan stay.', cover_emoji: '⛩️' }, 'trip: Kyoto-Nara (booked)')
  if (kyoto) {
    const items = [
      { type: 'flight', title: 'Shinkansen Tokyo → Kyoto (Hikari)', starts_at: '2026-08-13T08:00:00+09:00', location: 'Tokyo Station', cost: 28000, order_index: 1 },
      { type: 'hotel', title: 'Ryokan Hiiragiya Honkan, Kyoto (3 nights)', starts_at: '2026-08-13T15:00:00+09:00', ends_at: '2026-08-16T10:00:00+09:00', location: 'Nakagyo-ku, Kyoto', cost: 84000, booking_ref: 'HIR-2026-YT', order_index: 2 },
      { type: 'activity', title: 'Fushimi Inari & Arashiyama bamboo grove', starts_at: '2026-08-14T07:00:00+09:00', location: 'Kyoto', cost: 0, order_index: 3 },
      { type: 'activity', title: 'Nara deer park + Todai-ji temple day trip', starts_at: '2026-08-15T09:00:00+09:00', location: 'Nara Park, Nara', cost: 4000, order_index: 4 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: kyoto.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Kyoto-Nara: ${iOk} trip items`)
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'Amazon Japan fake order confirmation phishing', content: 'Amazon.co.jp: Your order #250-4412229-FAKE has been placed. Total: ¥58,000. If you did not authorize this, click here to cancel: amazon-jp-secure.com/cancel', risk_level: 'high', result_summary: 'Phishing email impersonating Amazon Japan. The domain "amazon-jp-secure.com" is fake — Amazon always uses amazon.co.jp. The fake order number triggers panic to click the link.', red_flags: ['Domain is amazon-jp-secure.com — not amazon.co.jp', 'Fake order number format', 'Creates urgency with cancellation link', 'Amazon does not send cancellation links via unsolicited email'], safe_next_step: 'Do not click. Check actual orders at amazon.co.jp directly. Report to Amazon via their official website.' },
    { type: 'contract', title: 'Canon Housing Lease Renewal — Ebisu Apartment', content: 'This tenancy agreement is renewed for 12 months (April 2026 – March 2027) at ¥195,000/month. Security deposit ¥390,000 (held, non-interest bearing). Renewal fee: ¥195,000 (1 month\'s rent). Auto-renews annually unless 2 months\' notice given. Managed by Ken Corporation Real Estate.', risk_level: 'medium', result_summary: 'The renewal fee of ¥195,000 (1 month\'s rent) is standard in Tokyo but worth confirming in writing. The auto-renewal with only 2-month notice window is tight — set a calendar alert for January 2027.', red_flags: ['¥195,000 renewal fee is significant — confirm in writing', '2-month notice required — alert needed January 2027 for March deadline', 'No provision for rent reduction despite being a 3-year tenant'], safe_next_step: 'Set January 2027 renewal reminder. Request tenant loyalty discount or free renewal in year 4 given 3-year clean rental history.' },
    { type: 'scam', title: 'Investment fraud — "AI trading robot" LINE message', content: 'こんにちは田中様。私たちのAIトレーディングシステムは月利10%を保証しています。初期投資は¥100,000から始められます。LINE@AI-FX-88888 に今すぐ登録してください。', risk_level: 'high', result_summary: 'Investment fraud using LINE messaging. Monthly 10% returns (120% annually) are impossible for legitimate investments. The use of LINE for financial solicitation and the emotional urgency are classic fraud signals common in Japan.', red_flags: ['Monthly 10% return guarantee is fraudulent — no legitimate investment offers this', 'LINE-based financial solicitation is not permitted by FSA regulations', 'No FSA registration number provided', 'Urgency to register "now"'], safe_next_step: 'Block the LINE account. Report to FSA Financial ADR Center and Japan Consumer Affairs Agency (消費者庁).' },
    { type: 'quote', title: 'Canon EOS R6 Home Insurance Addition (Sony Assurance)', content: 'Sony Assurance: Add Canon EOS R6 Mark II (valued ¥420,000) to your home contents insurance. Additional premium: ¥18,000/year. Covers theft, accidental damage, water damage. No deductible for items over ¥50,000.', risk_level: 'low', result_summary: 'Reasonable insurance addition for a high-value camera. ¥18,000/year (4.3% of camera value) with zero deductible is good value for a frequently-used professional-grade camera.', red_flags: [], safe_next_step: 'Add to existing Sony Assurance home contents policy. Confirm the policy covers international use (for Paris trip in October).' },
  ]
  let n = 0
  for (const c of checks) { const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null }); if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`) }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)
  await db.from('saved_quotes').insert({ user_id: UID, title: 'Canon EOS R6 insurance — Sony Assurance addition', amount: 18000, currency: 'JPY', category: 'insurance', region: 'Tokyo, Shibuya-ku', result_summary: '¥18,000/year zero-deductible for ¥420,000 camera is good value. Confirm international coverage.', risk_level: 'low', negotiation_script: 'I am an existing Sony Assurance home contents customer (3 years, no claims). Can you add the camera rider at ¥15,000/year given my loyalty? I would also like to confirm international travel coverage for Europe.' })
  await db.from('saved_quotes').insert({ user_id: UID, title: 'NTT Hikari Gigabit Plan — annual review', amount: 5500, currency: 'JPY', category: 'home_service', region: 'Ebisu, Shibuya-ku Tokyo', result_summary: '¥5,500/month for 1Gbps is competitive in Tokyo. SoftBank Hikari offers ¥4,900 for same speed.', risk_level: 'low', negotiation_script: 'I have been an NTT Hikari customer for 4 years. SoftBank Hikari is quoting ¥4,900 for equivalent speed. Can you match or reduce my current ¥5,500 rate?' })
  console.log('  ✔  2/2 saved quotes')
  await db.from('negotiation_templates').insert({ user_id: UID, type: 'rate_increase', tone: 'professional', context: 'Negotiating Canon internal budget increase for Q2 campaign with VP Hayashi', script: 'VP Hayashiさん、\n\nEOS R Q2キャンペーンについてご相談です。現在の予算850万円では、YouTubeとInstagramでの視聴者リーチ目標（2,000万リーチ）を達成するためにインフルエンサー費用が不足しています。\n\n追加予算150万円（合計1,000万円）で、Q1の不振を回収し、Q2目標を超過達成できると確信しています。詳細なROI計算書をご用意しています。\n\nご検討をよろしくお願いいたします。\n田中友紀' })
  console.log('  ✔  1/1 negotiation templates')
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'Furusato Nozei (ふるさと納税) — deadline December', type: 'other', due_date: '2026-12-31', amount: 80000, currency: 'JPY', status: 'pending', authority: '各自治体 (Municipal authorities)', reference_no: null, notes: 'Max furusato nozei for Yuki\'s income bracket ~¥80,000. Use before Dec 31 and file iDeCo/confirmation.' },
    { title: 'Apartment Lease Renewal Notice Deadline', type: 'renewal', due_date: '2027-01-31', amount: 195000, currency: 'JPY', status: 'pending', authority: 'Ken Corporation Real Estate', reference_no: 'KEN-EBI-441229', notes: 'Must give 2 months notice before March 31 2027 renewal to cancel or negotiate. Deadline: Jan 31 2027.' },
    { title: 'Year-end Tax Adjustment (年末調整) — November', type: 'other', due_date: '2026-11-30', amount: null, currency: 'JPY', status: 'pending', authority: 'Canon Japan HR / National Tax Agency', reference_no: null, notes: 'Submit deduction certificates to HR by end of November. Include life insurance, iDeCo certificates.' },
    { title: 'TOEIC Exam — December 2026', type: 'other', due_date: '2026-12-20', amount: 8000, currency: 'JPY', status: 'pending', authority: 'IIBC (Institute for International Business Communication)', reference_no: null, notes: 'Registered for December sitting. Study target: TOEIC 820+. Practice test in September.' },
    { title: 'Canon APAC Rotation Application Window', type: 'other', due_date: '2026-06-30', amount: null, currency: 'JPY', status: 'pending', authority: 'Canon Inc. HR — Global Mobility', reference_no: null, notes: 'Application window opens June 2026 for Q4 2026 start. Discuss with Kenji first.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Ebisu Apartment Lease Agreement 2026', doc_type: 'rental', original_text: 'LEASE RENEWAL AGREEMENT\nLandlord: Ken Corporation K.K.\nTenant: Yuki Tanaka, Kenji Tanaka\nProperty: 2LDK Apartment, Ebisu, Shibuya-ku, Tokyo\nMonthly Rent: ¥195,000\nLease Period: April 1, 2026 – March 31, 2027\nRenewal Fee: ¥195,000 (1 month at renewal)\nSecurity Deposit: ¥390,000 (held, non-interest bearing)\nNotice: 2 months before lease end date required for cancellation.', summary_md: '## Ebisu Apartment Lease 2026\n\n**What:** Annual renewal at ¥195,000/month.\n\n**Key terms:**\n- Renewal fee: ¥195,000 (paid April 2026)\n- Notice: 2 months before March 31, 2027 → deadline Jan 31 2027\n- Deposit ¥390,000 held by Ken Corporation\n\n**Action:** Set calendar alert January 31 2027.', key_points: ['¥195,000/month — Ebisu is premium but justified by commute convenience', '2-month notice clause — alert required January 2027', 'Renewal fee ¥195,000 payable at each renewal — factor into annual budget', 'Security deposit ¥390,000 — request return conditions in writing'], red_flags: ['No rent reduction clause despite 3-year residency', 'Non-interest bearing deposit — ¥390,000 earning nothing'], expires_at: '2027-03-31', notes: 'Year 4 of residency. Negotiate free renewal fee in April 2027.' },
    { name: 'Canon Japan Employment Contract — Marketing Manager', doc_type: 'agreement', original_text: 'EMPLOYMENT AGREEMENT\nEmployer: Canon Inc.\nEmployee: Yuki Tanaka\nPosition: Marketing Manager, Consumer & Imaging Division\nBase Salary: ¥600,000/month\nBonus: Performance-based, paid June and December (target: 4 months\' base)\nAnnual Leave: 20 days (carry forward max 10 days)\nConfidentiality: Standard IP and NDA provisions\nOutside Activities: Require prior written approval from Division Head', summary_md: '## Canon Employment Contract\n\n**What:** Employment terms as Marketing Manager at Canon Japan.\n\n**Key terms:**\n- Base: ¥600,000/month (¥7,200,000/year)\n- Bonus: Target 4 months\' base (¥2,400,000) if performance met\n- Outside activities require approval — Hakuhodo consulting noted\n\n**Action:** Confirm Hakuhodo consulting arrangement is formally approved.', key_points: ['¥600,000/month base + ~¥2,400,000 annual bonus at target', 'Outside business activities require Division Head written approval', '20 days annual leave — use fully especially during campaigns', 'Canon owns all IP created in scope of employment'], red_flags: ['Outside activities clause — Hakuhodo consulting must be formally approved in writing', 'IP ownership is broad — personal marketing side work could be claimed'], expires_at: null, notes: 'Confirm Hakuhodo consulting approval letter with Division Head.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'Year-end Tax Adjustment (年末調整)', category: 'tax', frequency: 'annual', last_done_at: '2025-11-30', next_due_at: '2026-11-30', is_done: false, applicable: true, notes: 'Submit life insurance and iDeCo certificates to Canon HR by November 30.' },
    { item: 'Furusato Nozei (Hometown Tax) — annual limit', category: 'tax', frequency: 'annual', last_done_at: '2025-12-31', next_due_at: '2026-12-31', is_done: false, applicable: true, notes: 'Use annual limit ~¥80,000 before December 31. Coordinate with year-end adjustment.' },
    { item: 'iDeCo Monthly Contribution', category: 'personal', frequency: 'monthly', last_done_at: '2026-04-27', next_due_at: '2026-05-27', is_done: false, applicable: true, notes: '¥23,000/month iDeCo contribution — deducted automatically. Confirm investment allocation annually.' },
    { item: 'Apartment Lease Renewal Notice (2 months before March 31)', category: 'personal', frequency: 'annual', last_done_at: '2025-01-31', next_due_at: '2027-01-31', is_done: false, applicable: true, notes: 'Must notify Ken Corporation by January 31 2027 whether renewing or vacating.' },
    { item: 'Canon Outside Activity Annual Approval Renewal', category: 'business', frequency: 'annual', last_done_at: '2026-01-10', next_due_at: '2027-01-10', is_done: false, applicable: true, notes: 'Annual approval for Hakuhodo/Fuji consulting side work. Renew with Division Head signature.' },
    { item: 'Schengen Visa Application (for France-Italy trip)', category: 'personal', frequency: 'once', last_done_at: null, next_due_at: '2026-08-10', is_done: false, applicable: true, notes: 'Apply 90 days before Oct 10 departure = July 12. Apply at French Embassy Tokyo. Both Yuki and Kenji.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, Yuki.** Sunday — yoga with Kenji and rest before the intense Q2 campaign week. TEPCO bill (¥13,200) is due May 25. The EOS R agency invoice (¥1,320,000) sent April 30 is unpaid — follow up this week. **Today: rest and recharge. Sunday yoga non-negotiable.** Campaign week starts tomorrow.', highlights: [{ label: 'Agency invoice', value: '¥1,320,000 due May 30', link: '/business', emoji: '🧾' }, { label: 'Unpaid bills', value: '3 pending', link: '/home', emoji: '💡' }, { label: 'France trip', value: 'Planning — Oct 10', link: '/travel', emoji: '🗼' }, { label: 'TOEIC goal', value: 'Daily study: 21 days 🔥', link: '/habits', emoji: '🌍' }] },
    { date: '2026-05-04', content_md: '**Good morning, Yuki.** Monday. EOS R campaign presentation to VP Hayashi is Thursday — prepare your Q2 KPI plan today. The Schengen visa application for France needs to be submitted by July 12 — check documents this week. NTT internet bill (¥5,500) due May 15. **Priority today: Q2 campaign presentation first draft.** No overtime past 7pm — Kenji\'s rule, and yours.', highlights: [{ label: 'VP presentation', value: 'Thursday — Q2 KPIs', link: '/career', emoji: '📊' }, { label: 'Schengen visa', value: 'Apply by Jul 12', link: '/legal', emoji: '⚖️' }, { label: 'NTT bill', value: '¥5,500 due May 15', link: '/home', emoji: '💡' }, { label: 'English study', value: 'Day 16 streak', link: '/habits', emoji: '🌍' }] },
    { date: '2026-05-05', content_md: '**Good morning, Yuki.** Tuesday. Your English study streak is 17 days. 🌱 Yesterday\'s Duolingo + BBC session was strong. The Canon APAC rotation window opens next month — have you talked to Kenji about Singapore yet? **Today: EOS R presentation draft to 70% completion. Stay focused — no campaign data rabbit holes.** Deep work 9am–12pm.', highlights: [{ label: 'English streak', value: '17 days 🌱', link: '/habits', emoji: '🌍' }, { label: 'VP presentation', value: 'Thursday — prep in progress', link: '/career', emoji: '📊' }, { label: 'APAC rotation', value: 'Apply window opens June', link: '/legal', emoji: '🎯' }, { label: 'France trip', value: 'Oct 10 — visa needed', link: '/travel', emoji: '🗼' }] },
    { date: '2026-05-06', content_md: '**Good morning, Yuki.** Wednesday — WFH day. Perfect for deep focus on the presentation without meeting interruptions. au phone bill (¥7,800) due May 15 — pay via app today. The France-Italy hotel research session last night was fun — Tuscany agriturismo looks beautiful. **Today: complete EOS R presentation. Send to Tanaka-san (peer review) before lunch.** No self-doubt — you\'ve done this before.', highlights: [{ label: 'EOS R presentation', value: 'Due Friday to VP', link: '/career', emoji: '📊' }, { label: 'au bill', value: '¥7,800 due May 15', link: '/home', emoji: '📱' }, { label: 'Tuscany booking', value: 'Agriturismo shortlisted', link: '/travel', emoji: '🏡' }, { label: 'Invoice', value: '¥1,320,000 — follow up today', link: '/business', emoji: '🧾' }] },
    { date: '2026-05-07', content_md: '**Good morning, Yuki.** Thursday — VP presentation day. You are prepared. Q1 story is acknowledged, Q2 plan is clear, KPIs are concrete. The Kyoto ryokan (¥84,000) for August Obon is booked — something to look forward to with Kenji. **After the presentation: take 30 minutes to decompress. Whatever the outcome, you showed up.** That is the only thing in your control today.', highlights: [{ label: 'VP Hayashi presentation', value: 'Today — Q2 campaign', link: '/career', emoji: '📊' }, { label: 'Kyoto ryokan', value: 'Aug 13–16 booked ✓', link: '/travel', emoji: '⛩️' }, { label: 'Invoice unpaid', value: '¥1,320,000 Hakuhodo', link: '/business', emoji: '🧾' }, { label: 'English study', value: 'Day 19 — do it after work', link: '/habits', emoji: '🌍' }] },
    { date: '2026-05-08', content_md: '**Good morning, Yuki.** Friday. VP Hayashi approved the Q2 campaign plan — well done. Budget confirmed at ¥8,500,000. Now the real work starts. Bills: pay TEPCO, NTT, au today in one session (10 minutes total). **Today: 2-hour campaign execution planning with Hakuhodo team.** Then leave at 6pm sharp. Kenji is cooking tonight.', highlights: [{ label: 'Q2 campaign approved ✓', value: '¥8,500,000 budget', link: '/career', emoji: '🎉' }, { label: 'Bills — pay today', value: '3 utilities pending', link: '/home', emoji: '💡' }, { label: 'Kenji', value: 'Home dinner tonight', link: '/habits', emoji: '🍳' }, { label: 'France trip', value: 'Oct 10 — book JAL by June', link: '/travel', emoji: '🗼' }] },
    { date: '2026-05-09', content_md: '**Good morning, Yuki.** Saturday. A great week ends. Q2 approved, Hakuhodo meeting booked, Kenji had a lovely evening together. Your English study streak is 21 days — strong. The Schengen visa documents need to be prepared: July 12 deadline but May is the time to gather. **Today: morning run with Kenji + pay outstanding bills + Schengen checklist.** Light day, full heart.', highlights: [{ label: 'English study', value: '21 days straight 🔥', link: '/habits', emoji: '🌍' }, { label: 'Schengen visa', value: 'Deadline Jul 12 — start now', link: '/legal', emoji: '⚖️' }, { label: 'Bills paid?', value: '3 pending — handle today', link: '/home', emoji: '💡' }, { label: 'Running', value: '5km this morning', link: '/habits', emoji: '🏃' }] },
  ]
  let n = 0
  for (const b of briefings) { const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T22:00:00Z` }, { onConflict: 'user_id,date' }); if (!error) n++; else console.log(`  ✗  briefing: ${error.message}`) }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Yuki Tanaka uid: ${UID}`)
  await seedMemory(); await seedHabits(); await seedFocus(); await seedDecisions()
  await seedBusiness(); await seedHome(); await seedTravel()
  await seedProtection(); await seedLegal(); await seedBriefings()
  console.log('\n✅  Seed complete.\n')
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
