/**
 * Full seed for Abdullah Khan — Remote Software Engineer in DHA Lahore, Pakistan.
 * Run: node tests/e2e-personas/seed-abdullah-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '4c708502-97a4-494b-9611-ff3abb97903d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Abdullah Khan', occupation: 'Remote Software Engineer', life_stage: 'early_career',
    country: 'PK', currency: 'PKR', timezone: 'Asia/Karachi', preferred_language: 'en',
    goals: [
      'Achieve Lead Engineer role at RemoteFirst Technologies by Q4 2027',
      'AWS Solutions Architect Associate certification by August 2026',
      'Save PKR 3,000,000 for apartment down payment by December 2027',
      'Launch personal SaaS product MVP by end of 2027',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Abdullah Khan (SWE, Lahore PK)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: 'USD $5,417/month (PKR ~1,516,760/month at 280 PKR/USD) from RemoteFirst Technologies + freelance avg USD $1,500/month (PKR ~420,000)' },
    { type: 'fact',         key: 'home_location',          value: 'DHA Phase 5, Lahore 54810 — family-owned 4-bedroom house; lives with Ammi, Abba (retired), and younger sister Fatima; no rent expense' },
    { type: 'fact',         key: 'vehicle',                value: 'Honda CG 125 (2023, registration LHR-14-2024-8834) — used for local errands; no car; Careem/Uber for nights and meetings' },
    { type: 'fact',         key: 'employer',               value: 'RemoteFirst Technologies Inc (Austin TX, USA) — Full Stack Engineer, React/Node.js/TypeScript/AWS stack; 2 years; fully remote' },
    { type: 'fact',         key: 'languages',              value: 'Urdu (native), Punjabi (native), English (professional fluency — C1 level), Arabic (learning — A2 level, 8 months Duolingo streak)' },
    { type: 'preference',   key: 'work_style',             value: 'Deep work 9am–1pm PKT; fully async team (weekly sync calls 6pm PKT / 1pm UTC Tuesday); VS Code + Notion; thorough documentation preferred over verbal agreements' },
    { type: 'preference',   key: 'diet',                   value: 'Strictly halal; mostly home-cooked by Ammi; avoids alcohol absolutely; chai 4×/day; occasional biryani from Butt Karahi on Sundays after family dinner' },
    { type: 'preference',   key: 'communication_style',    value: 'Prefers async written communication; very thorough in code reviews and documentation; introvert at heart; values direct and respectful feedback' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Hacker News daily; Martin Fowler/Kent Beck engineering blogs; sci-fi novels (Foundation series, The Martian) on weekends; Islamic texts on Fridays' },
    { type: 'goal',         key: 'career_goal',            value: 'Lead Engineer at RemoteFirst by Q4 2027; start own SaaS product targeting HR/payroll automation for Pakistani SMEs by 2028' },
    { type: 'goal',         key: 'financial_goal',         value: 'Save PKR 3M by Dec 2027 for apartment down payment in DHA Lahore; clear UBL credit card PKR 220,000 debt by Dec 2026' },
    { type: 'goal',         key: 'certification_goal',     value: 'AWS Solutions Architect Associate by August 2026; then evaluate GCP Professional Cloud Architect or AWS Developer in 2027' },
    { type: 'concern',      key: 'currency_risk',          value: 'PKR/USD exchange rate volatility (PKR 280–310/USD in 2025–26) makes financial planning unpredictable; considering USD savings account at a remittance-friendly bank' },
    { type: 'concern',      key: 'visa_access',            value: 'Pakistani passport limits conference travel — UK, EU, USA all require visas; affects networking; considering UAE residency by employment visa route for travel flexibility' },
    { type: 'relationship', key: 'family',                 value: 'Ammi (homemaker, bakes sohan halwa on Eid); Abba (retired civil servant, PKR 85K pension); Fatima (younger sister, 22, CS undergrad LUMS, birthday Mar 8)' },
  ]
  let n = 0
  for (const it of items) {
    const { error } = await db.from('memory_items').insert({ user_id: UID, source: 'manual', confidence: 95, is_active: true, ...it })
    if (!error) n++; else console.log(`  ✗  memory "${it.key}": ${error.message}`)
  }
  console.log(`  ✔  ${n}/${items.length} memory items`)
}

async function seedHabits() {
  console.log('\n🌱  Seeding habits...')
  const defs = [
    { name: 'Fajr Prayer + Quran 15 min',    icon: '🕌', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '05:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Gym Workout 45 min',             icon: '🏋️', color: 'violet',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '07:30', completedOffsets: [1,2,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'Read Tech Article / Docs 20 min',icon: '💻', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '09:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Side Project Coding 1 hr',       icon: '🛠️', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '14:00', completedOffsets: [1,2,4,5,8,9,11,12,15,16,17,19] },
    { name: 'Arabic Study 30 min (Duolingo)', icon: '📚', color: 'purple',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '21:00', completedOffsets: [1,2,3,4,8,9,10,11,15,16,18,19] },
    { name: 'No Screens After 11pm',          icon: '📵', color: 'amber',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '23:00', completedOffsets: [0,1,2,5,6,7,8,9,12,13,14,15,16,19,20] },
    { name: 'Sunday Family Dinner',           icon: '🍽️', color: 'rose',    frequency: 'custom',   days_of_week: [0],             reminder_time: '19:00', completedOffsets: [0,7,14] },
  ]
  let hOk = 0, lOk = 0
  for (const h of defs) {
    const { completedOffsets, ...row } = h
    const { data: habit, error } = await db.from('habits').insert({ user_id: UID, ...row }).select().single()
    if (error || !habit) { console.log(`  ✗  habit "${h.name}": ${error?.message}`); continue }
    hOk++
    for (const off of completedOffsets) {
      if (!h.days_of_week.includes(DOW[off])) continue
      const { error: le } = await db.from('habit_logs').insert({ user_id: UID, habit_id: habit.id, date: dateOffset(off), completed: true })
      if (!le) lOk++
    }
  }
  console.log(`  ✔  ${hOk}/${defs.length} habits, ${lOk} logs`)
}

async function seedFocus() {
  console.log('\n🎯  Seeding focus...')
  await db.from('focus_preferences').upsert({
    user_id: UID, preferred_mode: 'deep', session_length: 90, break_length: 15,
    daily_goal: 3, ambient_sound: 'lo_fi', notifications_blocked: true,
  }, { onConflict: 'user_id' })

  // PKT = UTC+5: 09:00 PKT = T04:00:00Z, 10:00 PKT = T05:00:00Z, 14:00 PKT = T09:00:00Z
  const sessions = [
    { off: 0,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'SaaS side project — authentication flow architecture design',        time: '04:00' },
    { off: 1,  mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'RemoteFirst: PayFlow API — Stripe webhook handlers',                  time: '04:00' },
    { off: 2,  mode: 'deep',     plan: 120, act: 118, done: true,  title: 'RemoteFirst: payment race condition bug fix + unit tests',            time: '04:00' },
    { off: 3,  mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'AWS SAA study: IAM roles, policies, and permission boundaries',       time: '04:00' },
    { off: 4,  mode: 'deep',     plan: 90,  act: 91,  done: true,  title: 'RemoteFirst: code review responses + PR documentation updates',       time: '04:00' },
    { off: 5,  mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'SwirlUI: button component library PR — submitted for review',         time: '05:00' },
    { off: 6,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Dubai trip planning — UAE tourist visa requirements and process',     time: '09:00' },
    { off: 7,  mode: 'pomodoro', plan: 75,  act: 75,  done: true,  title: 'SaaS MVP: React dashboard prototype — user dashboard scaffold',       time: '09:00' },
    { off: 8,  mode: 'deep',     plan: 120, act: 115, done: true,  title: 'RemoteFirst: React Query migration — replace legacy SWR hooks',       time: '04:00' },
    { off: 9,  mode: 'pomodoro', plan: 50,  act: 47,  done: true,  title: 'AWS SAA study: EC2 instance types, EBS volumes, VPC networking',      time: '04:00' },
    { off: 10, mode: 'deep',     plan: 90,  act: 93,  done: true,  title: 'SwirlUI: date picker component with locale support',                  time: '04:00' },
    { off: 11, mode: 'pomodoro', plan: 25,  act: 20,  done: true,  title: 'Freelance invoice prep — PrimeApps April hours log + SwirlUI invoice',time: '05:00' },
    { off: 12, mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'PrimeApps: API documentation — endpoint specifications update',       time: '05:00' },
    { off: 13, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'AWS SAA practice exam — storage services: S3, EFS, Glacier',          time: '09:00' },
    { off: 14, mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'SaaS product: PostgreSQL schema design + ERD for HR module',          time: '09:00' },
    { off: 15, mode: 'deep',     plan: 120, act: 122, done: true,  title: 'RemoteFirst: notification microservice — event-driven architecture',  time: '04:00' },
    { off: 16, mode: 'pomodoro', plan: 50,  act: 50,  done: true,  title: 'AWS SAA: Route 53, CloudFront CDN, S3 static site hosting',           time: '04:00' },
    { off: 17, mode: 'deep',     plan: 90,  act: 85,  done: true,  title: 'RemoteFirst: weekly code review + architecture decision records',      time: '04:00' },
    { off: 19, mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'SwirlUI: final deliverable — data table with sorting and pagination',  time: '05:00' },
    { off: 20, mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'Personal finance review — PKR exchange rate tracking + savings target',time: '09:00' },
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

async function seedDecisions() {
  console.log('\n🤔  Seeding decisions...')
  const decisions = [
    {
      question: 'Should I accept RemoteFirst\'s full-time employment offer or continue as a contractor (6-month renewable)?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-04-22T04:30:00Z', favorite: true,
      result: {
        summary: 'RemoteFirst is offering full-time employment with USD $65K salary, health insurance (covered for US employees — not useful in Pakistan), and 4 weeks PTO. Current contractor rate generates roughly the same gross ($65K) but with more flexibility. The key difference: full-time comes with job security but contractor status allows parallel freelance income ($18K/year).',
        recommendation: 'Decline full-time and counter-propose: extend contractor agreement to 12 months (vs 6-month rolling) with a 10% rate increase. This gives more stability without sacrificing freelance income or flexibility.',
        confidenceScore: 74, riskScore: 38, riskLevel: 'medium',
        financialImpact: { summary: 'Contractor: $65K + $18K freelance = $83K. FTE: $65K + no freelance = $65K. Contractor wins by ~$18K/year.', monthlyCostChange: 0, oneTimeCost: 0, opportunityCost: 'Job security and benefits of FTE', affordabilityScore: 85 },
        pros: ['Maintains ~$18K/year additional freelance income stream', 'Flexibility to pivot if a better opportunity emerges', '12-month contract provides reasonable security'],
        cons: ['No employer-sponsored health insurance (minor in Pakistan — family has coverage)', 'Psychological insecurity of contractor status', 'May affect immigration sponsorship options long-term'],
        nextSteps: ['Draft counter-proposal: 12-month contract at current rate + 10% increase', 'Research RemoteFirst visa sponsorship policy (for future Dubai/EU opportunities)', 'Build 6-month emergency fund in USD before making final decision'],
        memoryFactorsUsed: ['Goal: Lead Engineer by Q4 2027', 'Financial goal: PKR 3M savings by Dec 2027'],
        dataSourcesUsed: ['Pakistan remote worker employment patterns 2026', 'USD/PKR exchange rate projections'],
      },
    },
    {
      question: 'Should I relocate to Dubai for 2–3 years, or stay in Lahore as a remote worker?',
      category: 'career', mode: 'compare', options: ['Relocate to Dubai (UAE)', 'Stay in Lahore (remote)'],
      created_at: '2026-04-29T05:00:00Z', favorite: true,
      result: {
        question: 'Dubai relocation vs staying Lahore remote',
        factors: ['Financial gain', 'Career networking', 'Family proximity', 'Lifestyle quality', 'Visa/travel access'],
        options: [
          { label: 'Relocate to Dubai (UAE)', scores: { 'Financial gain': 80, 'Career networking': 85, 'Family proximity': 30, 'Lifestyle quality': 75, 'Visa/travel access': 90 },
            pros: ['UAE residency opens Schengen visa process substantially', 'Dubai tech hub — networking with EU/US companies in person', 'Tax-free income: AED equivalent of ~$6K/month take-home (after ~$2K rent)'],
            cons: ['PKR 500K+ relocation costs upfront', 'Missing family — parents ageing, Fatima still in college', 'Dubai cost of living eats most salary premium vs current Lahore costs'],
            summary: 'Better career networking and travel access, but family cost is high.' },
          { label: 'Stay in Lahore (remote)', scores: { 'Financial gain': 65, 'Career networking': 40, 'Family proximity': 95, 'Lifestyle quality': 70, 'Visa/travel access': 25 },
            pros: ['Zero housing cost (family home) — saves PKR 1.5M+/year vs Dubai rent', 'Close to family — Abba\'s health is a concern', 'Faster savings accumulation for apartment deposit'],
            cons: ['Pakistani passport limits travel and conference attendance', 'Remote-only networking limits lead roles in competitive companies', 'PKR devaluation continues to erode savings value'],
            summary: 'Better savings rate and family access, but career ceiling is lower.' },
        ],
        recommendation: 'Stay in Lahore for now, but plan a Dubai exploration trip in August 2026 to assess the market firsthand. Set a decision deadline: if AWS cert + Lead Engineer role happen by Q1 2027, Dubai move makes sense. If not, reconsider.',
        winner: 'Stay in Lahore (remote)',
      },
    },
    {
      question: 'AWS Solutions Architect vs GCP Professional Cloud Architect — which certification should I pursue first?',
      category: 'education', mode: 'analyze', options: [], created_at: '2026-05-03T04:00:00Z', favorite: false,
      result: {
        summary: 'RemoteFirst is fully AWS-native (ECS, RDS, Lambda, CloudFront). AWS SAA directly applies to 90% of current daily work. GCP has strong AI/ML tooling and Google\'s ecosystem but zero relevance to current employer. Job market data shows AWS SAA is requested in 3× more job postings than GCP for backend/full-stack roles in MENA and remote positions.',
        recommendation: 'AWS SAA first (August 2026 target). Then AWS Developer Associate in early 2027 to deepen the backend specialisation. GCP is a 2028 consideration if the SaaS product targets GCP-hosted clients.',
        confidenceScore: 89, riskScore: 10, riskLevel: 'low',
        financialImpact: { summary: 'AWS SAA exam: $300 (PKR ~84K). Expected salary boost: +$8–15K/year in remote job market.', monthlyCostChange: 0, oneTimeCost: 84000, opportunityCost: '80–100 study hours', affordabilityScore: 92 },
        pros: ['Directly applicable to RemoteFirst codebase — immediate ROI', 'AWS SAA is the most widely recognised cloud cert globally', 'Structured study plan: A Cloud Guru + Stephane Maarek Udemy course'],
        cons: ['No GCP experience could be a gap if SaaS product needs multi-cloud'],
        nextSteps: ['Enrol in Stephane Maarek AWS SAA Udemy course (PKR 2,000)', 'Complete 2 practice exam sets by July', 'Book exam slot for August 15 2026 on Pearson VUE online'],
        memoryFactorsUsed: ['Goal: AWS SAA by August 2026', 'Employer: RemoteFirst (AWS-native stack)'],
        dataSourcesUsed: ['LinkedIn Jobs remote backend 2026', 'TechPays Pakistan 2026 salary survey'],
      },
    },
    {
      question: 'Should I launch an Upwork profile for premium freelancing, or apply to Toptal?',
      category: 'business', mode: 'compare', options: ['Launch Upwork Profile', 'Apply to Toptal Network'],
      created_at: '2026-05-06T05:00:00Z', favorite: false,
      result: {
        question: 'Upwork vs Toptal for premium freelance work',
        factors: ['Hourly rate potential', 'Time to first project', 'Vetting effort', 'Client quality', 'Long-term value'],
        options: [
          { label: 'Launch Upwork Profile', scores: { 'Hourly rate potential': 65, 'Time to first project': 80, 'Vetting effort': 70, 'Client quality': 55, 'Long-term value': 60 },
            pros: ['Fast to start — profile live in hours', 'Large client pool including SMEs willing to work with Pakistan-based developers', 'Existing reviews from PrimeApps/SwirlUI relationships can seed credibility'],
            cons: ['Race-to-the-bottom pricing culture on lower tiers', 'High 20% Upwork fee on early contracts', 'Client quality varies significantly'],
            summary: 'Quicker start, more volume but lower rates and more client filtering needed.' },
          { label: 'Apply to Toptal Network', scores: { 'Hourly rate potential': 90, 'Time to first project': 30, 'Vetting effort': 25, 'Client quality': 95, 'Long-term value': 85 },
            pros: ['Toptal developers earn $80–150/hr (3× current rates)', 'High-quality US/EU enterprise clients with long-term projects', 'Toptal "badge" is a strong career signal'],
            cons: ['3% acceptance rate — rigorous screening (algorithm tests + live coding)', 'Takes 2–4 weeks to complete the process', 'No guarantee of passing'],
            summary: 'Higher barrier but significantly higher earning potential if accepted.' },
        ],
        recommendation: 'Apply to Toptal — the screening process is the best interview prep available, and passing would 2–3× freelance income. While waiting, build an Upwork profile with the first 2 projects to generate reviews. Both in parallel.',
        winner: 'Apply to Toptal Network',
      },
    },
    {
      question: 'Should I invest PKR 500,000 in Pakistan Stock Exchange (PSX) or hold in USD savings account?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-05-08T05:00:00Z', favorite: false,
      result: {
        summary: 'PSX KSE-100 has returned 40%+ in PKR terms in 2025, but PKR itself lost 18% vs USD. Real USD-adjusted returns were much lower. For someone saving in USD for a long-term PKR-denominated goal (apartment), the calculus depends on how long until the purchase.',
        recommendation: 'Split: PKR 200,000 into a low-cost KSE-100 index ETF (ABL AMTF) for local inflation hedge; PKR 300,000 into a USD-denominated instrument (Roshan Digital Account at Meezan Bank — currently 5.5% USD savings rate). Review allocation after AWS exam in August.',
        confidenceScore: 67, riskScore: 52, riskLevel: 'medium',
        financialImpact: { summary: 'USD savings: 5.5% vs PKR equity: 30%+ nominal (but PKR risk). Blended approach reduces currency concentration risk.', monthlyCostChange: 0, oneTimeCost: 500000, opportunityCost: 'Liquidity — both routes reduce emergency fund below 6 months', affordabilityScore: 72 },
        pros: ['KSE-100 provides inflation hedge in PKR terms', 'USD Roshan account protected from devaluation', 'Diversified approach reduces single-asset risk'],
        cons: ['Reduces emergency fund temporarily — needs top-up before investing', 'PSX volatility high — could lose 30% in a political shock'],
        nextSteps: ['Top up emergency fund to PKR 800K (3 months expenses) before investing', 'Open Meezan Bank Roshan Digital Account for USD portion', 'Research ABL AMTF or NBP Fund KSE-100 ETF for PKR portion'],
        memoryFactorsUsed: ['Financial goal: PKR 3M by Dec 2027', 'Concern: PKR/USD volatility'],
        dataSourcesUsed: ['PSX KSE-100 performance 2025–2026', 'State Bank of Pakistan Roshan Digital Account rates May 2026'],
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

async function seedBusiness() {
  console.log('\n💼  Seeding business...')
  const pa = await ins('business_clients', {
    user_id: UID, name: 'PrimeApps Inc', company: 'PrimeApps Inc',
    email: 'dev@primeapps.io', phone: '+15124481900', address: '4110 Freidrich Ln, Austin TX 78744', currency: 'USD',
    notes: 'US-based SaaS company. React/Node.js projects. Abdullah does API integration and feature development. $45/hr, monthly invoicing.',
  }, 'client: PrimeApps Inc')
  const sw = await ins('business_clients', {
    user_id: UID, name: 'SwirlUI GmbH', company: 'SwirlUI GmbH',
    email: 'contracts@swirlui.dev', phone: '+4930220148880', address: 'Torstraße 72, 10119 Berlin, Germany', currency: 'USD',
    notes: 'German design-system startup. Component library development (React + TypeScript). Project-based. $40/hr.',
  }, 'client: SwirlUI GmbH')
  if (!pa || !sw) return

  const projPA = await ins('business_projects', {
    user_id: UID, client_id: pa.id, name: 'PrimeApps — PayFlow API Integration & Features',
    status: 'active', start_date: '2025-10-01', end_date: null,
    fee: 45, currency: 'USD', notes: 'Ongoing feature development and API integration. 40–50 hours/month.',
  }, 'project: PrimeApps PayFlow')
  const projSW = await ins('business_projects', {
    user_id: UID, client_id: sw.id, name: 'SwirlUI — Component Library (Phase 2)',
    status: 'active', start_date: '2026-02-01', end_date: '2026-06-30',
    fee: 40, currency: 'USD', notes: 'Component library: button, input, table, date picker, select. Project-based milestone delivery.',
  }, 'project: SwirlUI component library')

  if (projPA) {
    await ins('business_invoices', {
      user_id: UID, client_id: pa.id, project_id: projPA.id,
      invoice_no: 'AK-2026-001', issued_at: '2026-03-31', due_at: '2026-04-14',
      items: [{ description: 'PrimeApps API development — March 2026, 40 hours @ $45/hr', qty: 40, rate: 45, amount: 1800 }],
      subtotal: 1800, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 1800, currency: 'USD', status: 'paid', paid_at: '2026-04-10',
    }, 'invoice: AK-2026-001 (paid)')
    await ins('business_invoices', {
      user_id: UID, client_id: pa.id, project_id: projPA.id,
      invoice_no: 'AK-2026-003', issued_at: '2026-04-30', due_at: '2026-05-14',
      items: [{ description: 'PrimeApps API development — April 2026, 50 hours @ $45/hr', qty: 50, rate: 45, amount: 2250 }],
      subtotal: 2250, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 2250, currency: 'USD', status: 'sent',
    }, 'invoice: AK-2026-003 (sent)')
  }
  if (projSW) {
    await ins('business_invoices', {
      user_id: UID, client_id: sw.id, project_id: projSW.id,
      invoice_no: 'AK-2026-002', issued_at: '2026-04-15', due_at: '2026-04-29',
      items: [{ description: 'SwirlUI Phase 2 — button, input, select components, 30 hours @ $40/hr', qty: 30, rate: 40, amount: 1200 }],
      subtotal: 1200, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 1200, currency: 'USD', status: 'paid', paid_at: '2026-04-25',
    }, 'invoice: AK-2026-002 (paid)')
  }

  const expenses = [
    { category: 'software', vendor: 'GitHub', amount: 4, occurred_at: '2026-04-01', description: 'GitHub Copilot Individual — AI coding assistant ($4/month)' },
    { category: 'software', vendor: 'Notion', amount: 10, occurred_at: '2026-04-01', description: 'Notion Plus plan — project docs and consulting deliverables' },
    { category: 'education', vendor: 'Udemy', amount: 7, occurred_at: '2026-04-05', description: 'Stephane Maarek AWS SAA course (PKR ~1,960 / $7 on sale)' },
    { category: 'equipment', vendor: 'Shamsabad Electronics Lahore', amount: 85, occurred_at: '2026-03-15', description: 'USB-C hub + laptop stand for home office ergonomics' },
  ]
  let n = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'USD', is_billable: false, ...e })
    if (!error) n++; else console.log(`  ✗  expense: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${expenses.length} business expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const mbp = await ins('home_assets', { user_id: UID, name: 'MacBook Pro 14" M3 Pro', type: 'electronics', brand: 'Apple', model: 'MacBook Pro 14" M3 Pro (2023)', purchased_at: '2023-11-20', warranty_until: '2025-11-20', cost: 425000, notes: 'Primary work machine. PKR 425,000 purchase (Apple Authorized Reseller Lahore). 18GB RAM / 512GB SSD.' }, 'asset: MacBook Pro M3')
  const mon = await ins('home_assets', { user_id: UID, name: 'Dell UltraSharp 27" 4K USB-C Monitor', type: 'electronics', brand: 'Dell', model: 'U2723QE', purchased_at: '2023-12-01', warranty_until: '2026-12-01', cost: 88000, notes: 'Primary external monitor for home office. USB-C single-cable setup.' }, 'asset: Dell 4K Monitor')
  const bike = await ins('home_assets', { user_id: UID, name: 'Honda CG 125 (2023)', type: 'vehicle', brand: 'Honda', model: 'CG 125 Euro II', purchased_at: '2023-07-15', warranty_until: '2025-07-15', cost: 188000, notes: 'Registration LHR-14-2024-8834. Used for local errands, gym, and market visits.' }, 'asset: Honda CG 125')
  const kb = await ins('home_assets', { user_id: UID, name: 'Keychron K2 Pro Wireless Keyboard', type: 'electronics', brand: 'Keychron', model: 'K2 Pro QMK (Brown switches)', purchased_at: '2024-01-10', warranty_until: '2025-01-10', cost: 24000, notes: 'Primary keyboard — home office. Hot-swappable switches, RGB.' }, 'asset: Keychron K2 Pro')
  const hp = await ins('home_assets', { user_id: UID, name: 'Sony WH-1000XM5 Headphones', type: 'electronics', brand: 'Sony', model: 'WH-1000XM5', purchased_at: '2024-03-20', warranty_until: '2025-03-20', cost: 68000, notes: 'ANC headphones for deep work and remote calls. PKR 68,000 from Hafeez Centre.' }, 'asset: Sony WH-1000XM5')

  if (mbp) await ins('home_maintenance', { user_id: UID, asset_id: mbp.id, title: 'MacBook Time Machine Backup Verification', category: 'cleaning', recurrence_months: 3, last_done_at: '2026-02-01', next_due_at: '2026-05-01', vendor: null, cost: 0, is_active: true, notes: 'Verify Time Machine backup to external SSD is current. Check battery health in About This Mac.' }, 'maint: MacBook backup check')
  if (bike) {
    await ins('home_maintenance', { user_id: UID, asset_id: bike.id, title: 'Honda CG 125 Engine Oil Change', category: 'service', recurrence_months: 3, last_done_at: '2026-02-15', next_due_at: '2026-05-15', vendor: 'Honda Point DHA Phase 5', cost: 1800, is_active: true }, 'maint: CG125 oil change')
    await ins('home_maintenance', { user_id: UID, asset_id: bike.id, title: 'Honda CG 125 Annual Service', category: 'service', recurrence_months: 12, last_done_at: '2025-07-15', next_due_at: '2026-07-15', vendor: 'Honda Point DHA Phase 5', cost: 5500, is_active: true, notes: 'Full service: air filter, spark plug, carburetor cleaning, chain tension' }, 'maint: CG125 annual service')
  }

  const bills = [
    { utility: 'electricity', provider: 'LESCO (Lahore Electric Supply Company)', amount: 9200, bill_date: '2026-02-28', due_date: '2026-03-15', is_paid: true, account_no: 'LESCO-0341098821' },
    { utility: 'electricity', provider: 'LESCO (Lahore Electric Supply Company)', amount: 8800, bill_date: '2026-03-31', due_date: '2026-04-15', is_paid: true, account_no: 'LESCO-0341098821' },
    { utility: 'electricity', provider: 'LESCO (Lahore Electric Supply Company)', amount: 9500, bill_date: '2026-04-30', due_date: '2026-05-15', is_paid: false, account_no: 'LESCO-0341098821' },
    { utility: 'internet', provider: 'Jazz Home WiFi 4G (Unlimited)', amount: 3200, bill_date: '2026-03-05', due_date: '2026-03-10', is_paid: true, account_no: 'JAZZ-HW-2241893' },
    { utility: 'internet', provider: 'Jazz Home WiFi 4G (Unlimited)', amount: 3200, bill_date: '2026-04-05', due_date: '2026-04-10', is_paid: true, account_no: 'JAZZ-HW-2241893' },
    { utility: 'internet', provider: 'Jazz Home WiFi 4G (Unlimited)', amount: 3200, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'JAZZ-HW-2241893' },
    { utility: 'gas', provider: 'SNGPL (Sui Northern Gas)', amount: 1100, bill_date: '2026-03-01', due_date: '2026-03-20', is_paid: true, account_no: 'SNGPL-LHR-44821' },
    { utility: 'gas', provider: 'SNGPL (Sui Northern Gas)', amount: 950, bill_date: '2026-04-01', due_date: '2026-04-20', is_paid: true, account_no: 'SNGPL-LHR-44821' },
    { utility: 'gas', provider: 'SNGPL (Sui Northern Gas)', amount: 800, bill_date: '2026-05-01', due_date: '2026-05-20', is_paid: false, account_no: 'SNGPL-LHR-44821' },
    { utility: 'phone', provider: 'Zong 5G Postpaid (20GB data)', amount: 2800, bill_date: '2026-03-15', due_date: '2026-03-25', is_paid: true, account_no: 'ZONG-5G-38821044' },
    { utility: 'phone', provider: 'Zong 5G Postpaid (20GB data)', amount: 2800, bill_date: '2026-04-15', due_date: '2026-04-25', is_paid: true, account_no: 'ZONG-5G-38821044' },
    { utility: 'phone', provider: 'Zong 5G Postpaid (20GB data)', amount: 2800, bill_date: '2026-05-15', due_date: '2026-05-25', is_paid: false, account_no: 'ZONG-5G-38821044' },
  ]
  let n = 0
  for (const b of bills) {
    const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b })
    if (!error) n++; else console.log(`  ✗  bill: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${bills.length} utility bills`)
}

async function seedTravel() {
  console.log('\n✈️   Seeding travel...')
  const dubai = await ins('trips', { user_id: UID, destination: 'Dubai, UAE', start_date: '2026-08-07', end_date: '2026-08-14', status: 'planning', budget_total: 295000, currency: 'PKR', travellers: 1, notes: 'Solo trip post-AWS exam. UAE tourist visa, Airbnb Dubai Marina, tech meetups research.', cover_emoji: '🏙️' }, 'trip: Dubai')
  if (dubai) {
    const items = [
      { type: 'flight', title: 'FlyDubai LHE → DXB (outbound)', starts_at: '2026-08-07T06:00:00+05:00', location: 'Allama Iqbal International Airport, Lahore', cost: 48000, order_index: 1, notes: 'FlyDubai FZ-341, PKR 48K approx' },
      { type: 'hotel', title: 'Rove Downtown Dubai — 7 nights', starts_at: '2026-08-07T15:00:00+04:00', ends_at: '2026-08-14T11:00:00+04:00', location: 'Downtown Dubai, UAE', cost: 120000, order_index: 2, notes: 'PKR 120K approx (AED 1,600 × 7 nights). Includes breakfast.' },
      { type: 'activity', title: 'Dubai Future Foundation / GITEX meetup', starts_at: '2026-08-10T10:00:00+04:00', location: 'Dubai World Trade Centre', cost: 0, order_index: 3, notes: 'Free tech networking event — must register in advance' },
      { type: 'activity', title: 'Burj Khalifa At the Top observation deck', starts_at: '2026-08-12T18:00:00+04:00', location: 'Burj Khalifa, Downtown Dubai', cost: 14000, order_index: 4, notes: 'PKR ~14K (AED 185 sunset slot)' },
      { type: 'flight', title: 'FlyDubai DXB → LHE (return)', starts_at: '2026-08-14T22:00:00+04:00', location: 'Dubai International Airport Terminal 2', cost: 46000, order_index: 5 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: dubai.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Pakistani passport (valid to 2029)', category: 'documents', qty: 1, is_packed: false },
      { item: 'UAE tourist visa (print confirmation)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Business cards (printed — 50)', category: 'documents', qty: 50, is_packed: false },
      { item: 'MacBook + charger', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Sony WH-1000XM5 headphones', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Light formal shirt (networking event)', category: 'clothing', qty: 2, is_packed: false },
      { item: 'AED 500 cash on arrival', category: 'documents', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: dubai.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Dubai: ${iOk} items, ${pOk} packing`)
  }

  const isb = await ins('trips', { user_id: UID, destination: 'Islamabad, Pakistan', start_date: '2026-03-15', end_date: '2026-03-16', status: 'completed', budget_total: 18000, currency: 'PKR', travellers: 1, notes: 'RemoteFirst team offsite — Islamabad hub office visit. First time meeting 3 colleagues in person.', cover_emoji: '🏔️' }, 'trip: Islamabad offsite')
  if (isb) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: isb.id, type: 'transport', title: 'Daewoo Express LHR → ISB (business class)', starts_at: '2026-03-15T07:00:00+05:00', location: 'Lahore Daewoo Terminal', cost: 2200, is_done: true, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: isb.id, type: 'hotel', title: 'Islamabad Marriott (1 night, company booking)', starts_at: '2026-03-15T18:00:00+05:00', ends_at: '2026-03-16T11:00:00+05:00', location: 'Islamabad, Pakistan', cost: 0, is_done: true, order_index: 2 })
  }

  const turkey = await ins('trips', { user_id: UID, destination: 'Istanbul + Athens (Turkey & Greece)', start_date: '2027-06-10', end_date: '2027-06-21', status: 'planning', budget_total: 680000, currency: 'PKR', travellers: 1, notes: 'Dream trip — post-AWS and Lead Engineer milestone reward. Turkish visa straightforward for Pakistani passport. Schengen (Greece) requires advance booking.', cover_emoji: '🕌' }, 'trip: Turkey & Greece')
  if (turkey) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: turkey.id, type: 'activity', title: 'Istanbul: Hagia Sophia + Grand Bazaar + Bosphorus Cruise', starts_at: '2027-06-11T09:00:00+03:00', location: 'Istanbul, Turkey', cost: 45000, is_done: false, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: turkey.id, type: 'activity', title: 'Athens: Acropolis + Plaka + day trip to Santorini', starts_at: '2027-06-16T09:00:00+03:00', location: 'Athens, Greece', cost: 120000, is_done: false, order_index: 2 })
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: '"50% Crypto Arbitrage" Discord Server Scam', content: 'Join our private arbitrage group. We exploit price differences between Binance and Coinbase to guarantee 50% monthly returns. Min investment $500 USDT. Members only. Limited spots. DM @CryptoKingPro for invite.', risk_level: 'high', result_summary: 'Classic crypto investment scam. No arbitrage opportunity generates 50% monthly returns consistently — that would be 600%/year. These schemes collect deposits and then disappear or run Ponzi payouts until collapse.', red_flags: ['50% monthly return claim — mathematically impossible to sustain', 'Unverified Discord server with no regulatory registration', 'USDT-only deposit — untraceable and irreversible', '"Limited spots" artificial scarcity tactic'], safe_next_step: 'Block the Discord account. Never send cryptocurrency to unverified parties. Report to Pakistan\'s FIA cybercrime unit at cybercrime.gov.pk.' },
    { type: 'scam', title: 'Upwork "Client" Sending Fake Bank Transfer Overpayment', content: 'Hello, I am sending $2,500 for your first milestone but accidentally sent $3,000. Please refund $500 via PayPal as your project manager cannot process a reversal. The Upwork escrow confirmation is attached.', risk_level: 'high', result_summary: 'Classic overpayment scam. The "Upwork escrow confirmation" is forged — no real payment was made. The victim refunds $500 via PayPal (irreversible), and the initial "payment" never clears.', red_flags: ['Upwork escrow is never sent separately by email', 'Request to refund via PayPal outside Upwork system', 'Attached confirmation is a fake PDF — Upwork notifications come from within the platform only', 'New account with no verified payment method'], safe_next_step: 'Never send money outside Upwork\'s platform. Report the user to Upwork Trust & Safety. Only accept Upwork escrow — never bank transfers or PayPal for Upwork work.' },
    { type: 'contract', title: 'PrimeApps Contractor Agreement — IP Ownership Clause', content: 'All work product, code, documentation, designs, and deliverables created by Contractor in connection with PrimeApps services shall become the sole and exclusive intellectual property of PrimeApps Inc upon creation, including any pre-existing tools, libraries, or frameworks incorporated into the deliverables.', risk_level: 'medium', result_summary: 'The clause "including pre-existing tools, libraries, or frameworks" is dangerously broad. This would transfer ownership of your personal utility libraries, React hooks, and development tools that you reuse across all clients — not just PrimeApps-specific work.', red_flags: ['Pre-existing tools and libraries would be transferred to PrimeApps — unacceptable for a consultant serving multiple clients', 'No carve-out for open-source contributions or personal tooling', '"Upon creation" language means no delivery required — just writing code transfers ownership'], safe_next_step: 'Request IP carve-out: "Only deliverables specifically created and delivered to PrimeApps, excluding pre-existing personal libraries and generic tools." Negotiate before August renewal.' },
    { type: 'subscription', title: 'Jazz "Free 100GB Data Bonus" Promotional Offer', content: 'Dear valued Jazz customer, you have been selected for a FREE 100GB data bonus! Dial *446# or click bit.ly/jazz-100gb-bonus to claim within 24 hours. Offer expires tonight.', risk_level: 'low', result_summary: 'This is a legitimate Jazz promotional offer format, though the bit.ly link is suspicious. Jazz does run such promos but always through official channels (*446# dial code is real). The shortened URL should be verified before clicking.', red_flags: ['Bit.ly shortened URL — could redirect to phishing page instead of jazz.com.pk', '24-hour urgency pressure to click without thinking'], safe_next_step: 'Dial *446# directly (do NOT click the link) to check for genuine Jazz promotions. Or log into the Jazz World app to see available offers.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'PrimeApps Contract Renewal Rate — $45/hr', amount: 45, currency: 'USD', category: 'employment', region: 'Remote (Austin TX client)', result_summary: 'Market rate for senior full-stack React/Node.js remote engineers in 2026 is $55–75/hr on Toptal; $40–60/hr on Upwork Top Rated. $45/hr is below market. Justified to request $52/hr at August renewal.', risk_level: 'low', negotiation_script: 'Hi PrimeApps team, I\'ve delivered consistently over 7 months — 0 PR reverts, strong sprint velocity, and the PayFlow module shipped on time. I\'d like to discuss moving to $52/hr effective August 1. This reflects current market for senior React/Node.js engineers (verified against Toptal benchmarks). I\'m committed to the engagement long-term and want fair compensation for the value I\'m delivering.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'rate_increase', tone: 'professional', context: 'Requesting rate increase from PrimeApps Inc at August 2026 contract renewal ($45 → $52/hr)', script: `Hi [PM Name],\n\nThank you for the continued trust in my work over the past 7 months. I have enjoyed building the PayFlow module and the performance improvements to the API layer.\n\nAs we approach the August renewal, I would like to discuss adjusting my rate to $52/hr. This reflects current market benchmarks for senior React/Node.js engineers (Toptal: $65–80/hr; Upwork Top Rated: $50–65/hr) — and I believe the quality and reliability I have demonstrated justifies the ask.\n\nI am committed to this project long-term and am happy to continue with no other changes to the arrangement.\n\nLet me know when you would like to discuss.\n\nBest,\nAbdullah Khan` },
    { type: 'payment_terms', tone: 'firm', context: 'Following up on SwirlUI invoice AK-2026-003 ($2,250, due May 14)', script: `Hi SwirlUI team,\n\nQuick follow-up on Invoice AK-2026-003 ($2,250) issued April 30 and due May 14.\n\nCould you please confirm the expected payment date? All milestone deliverables have been merged and accepted — happy to provide a summary of completed components if useful for your accounts team.\n\nThank you.\n\nBest,\nAbdullah Khan` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'FBR Income Tax Return 2025–26 (Pakistan)', type: 'tax', due_date: '2026-09-30', amount: null, currency: 'PKR', status: 'pending', authority: 'Federal Board of Revenue (FBR)', reference_no: 'NTN-7281993-2', notes: 'File via Iris portal. Income includes RemoteFirst USD income + freelance. Requires NTN active and bank challan payment.' },
    { title: 'NTN Freelancer Registration Completion', type: 'other', due_date: '2026-06-30', amount: 0, currency: 'PKR', status: 'pending', authority: 'Federal Board of Revenue (FBR)', reference_no: null, notes: 'SWCC (State Bank) requires active NTN for freelance forex receipts above $3,000/quarter. Overdue — complete via FBR Iris portal this month.' },
    { title: 'PrimeApps Contractor Agreement Renewal', type: 'renewal', due_date: '2026-08-31', amount: 0, currency: 'USD', status: 'pending', authority: 'PrimeApps Inc (USA)', reference_no: 'PA-CONT-2025-AK-02', notes: 'Current 6-month contract expires Aug 31. Counter-propose 12-month term at $52/hr. Prepare before August 1.' },
    { title: 'Honda CG 125 Registration Renewal (LHR-14)', type: 'renewal', due_date: '2026-10-31', amount: 4500, currency: 'PKR', status: 'pending', authority: 'Motor Registration Authority, Lahore', reference_no: 'LHR-14-2024-8834', notes: 'Annual registration + token tax for CG 125. Process at Excise & Taxation office DHA or online via Punjab e-Pay.' },
    { title: 'State Bank of Pakistan SWCC Freelance Compliance', type: 'other', due_date: '2026-12-31', amount: 0, currency: 'PKR', status: 'pending', authority: 'State Bank of Pakistan', reference_no: null, notes: 'Annual review of freelance IT export compliance. Ensure all USD receipts are channelled through designated bank account and converted to PKR within 90 days per SBP regulations.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'PrimeApps Contractor Agreement — Oct 2025', doc_type: 'contract', original_text: 'INDEPENDENT CONTRACTOR AGREEMENT\nParties: PrimeApps Inc (Company) and Abdullah Khan (Contractor).\nServices: Full-stack software development (React, Node.js, TypeScript, AWS).\nRate: $45.00/hour, invoiced monthly, payment within 14 days.\nIP: All work product created for PrimeApps, including pre-existing tools and frameworks incorporated into deliverables, become exclusive property of PrimeApps Inc.\nTerm: October 1, 2025 – March 31, 2026, renewable by 6-month extensions.\nGoverning Law: State of Texas, USA.', summary_md: '## PrimeApps Contractor Agreement\n\n**What:** 6-month renewable contract, $45/hr React/Node.js development.\n\n**Key terms:**\n- Rate: $45/hr (below market — target $52)\n- IP: Overly broad — includes pre-existing tools\n- Term: 6-month rolling (need 12-month for stability)\n\n**Action:** Renegotiate at August renewal: $52/hr + IP carve-out + 12-month term.', key_points: ['$45/hr is below market for senior React/Node.js engineers (market $55–75/hr Toptal)', 'IP clause covers pre-existing tools — needs carve-out before renewal', '6-month rolling creates uncertainty — negotiate 12-month contract'], red_flags: ['IP clause transfers pre-existing personal libraries to PrimeApps'], expires_at: '2026-08-31', notes: 'Current extension expires Aug 31. Negotiate rate + IP + term before then.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'FBR Income Tax Return (Annual)', category: 'tax', frequency: 'annual', last_done_at: '2025-09-25', next_due_at: '2026-09-30', is_done: false, applicable: true, notes: 'File via FBR Iris portal. Include all USD freelance income converted at SBP rates. Engage CA if income exceeds PKR 6M.' },
    { item: 'NTN Active Status Check + Update', category: 'business', frequency: 'annual', last_done_at: null, next_due_at: '2026-06-30', is_done: false, applicable: true, notes: 'NTN-7281993-2 — verify active status on Iris portal. Required for SWCC compliance.' },
    { item: 'SBP SWCC Freelance IT Export Reporting', category: 'business', frequency: 'quarterly', last_done_at: '2026-03-31', next_due_at: '2026-06-30', is_done: false, applicable: true, notes: 'Quarterly report of forex receipts from PrimeApps and SwirlUI to State Bank via bank portal.' },
    { item: 'Honda CG 125 Insurance Renewal', category: 'personal', frequency: 'annual', last_done_at: '2025-07-15', next_due_at: '2026-07-15', is_done: false, applicable: true, notes: 'Comprehensive insurance from Jubilee General Insurance — renew via EasyPaisa app or branch.' },
    { item: 'UBL Credit Card Debt Clearance Plan', category: 'personal', frequency: 'monthly', last_done_at: '2026-05-01', next_due_at: '2026-06-01', is_done: false, applicable: true, notes: 'PKR 220,000 outstanding at 36% APR. Pay PKR 25,000/month to clear by December 2026. Minimum payment is PKR 6,600 — always pay more.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  // 07:00 PKT = UTC+5 = T02:00:00Z
  const briefings = [
    { date: '2026-05-03', content_md: '**Assalamu Alaikum, Abdullah.** Sunday — family dinner tonight. This week: AWS SAA exam is 3.5 months out (Aug 15 target). Study pace needs to accelerate — complete Chapter 4 (databases: RDS, Aurora, DynamoDB) today. The PrimeApps invoice AK-2026-003 ($2,250) was issued Friday — expect payment by May 14. **One thing today: 2-hour AWS study block after Fajr.** Family dinner at 7pm — earn it.', highlights: [{ label: 'AWS SAA exam', value: 'Aug 15 — 3.5 months', link: '/career', emoji: '☁️' }, { label: 'Invoice sent', value: '$2,250 due May 14', link: '/business', emoji: '🧾' }, { label: 'Habit streak', value: 'Fajr: 21/21 days', link: '/habits', emoji: '🕌' }, { label: 'Dubai trip', value: 'Planning Aug 7–14', link: '/travel', emoji: '🏙️' }] },
    { date: '2026-05-04', content_md: '**Assalamu Alaikum, Abdullah.** Monday — deep work day. The RemoteFirst notification microservice is at 60% completion — push to 80% this week. NTN registration is overdue (SBP requirement) — this is blocking your Q2 forex reporting. **Priority this week: complete NTN registration on FBR Iris portal. It takes 30 minutes.** The LESCO electricity bill (PKR 9,500) is due May 15. Pay it via JazzCash before the weekend.', highlights: [{ label: 'NTN registration', value: 'Overdue — FBR Iris portal', link: '/legal', emoji: '⚖️' }, { label: 'Invoice outstanding', value: '$2,250 PrimeApps', link: '/business', emoji: '🧾' }, { label: 'LESCO bill', value: 'PKR 9,500 due May 15', link: '/home', emoji: '💡' }, { label: 'RemoteFirst sprint', value: 'Notification service — 60%', link: '/focus', emoji: '💻' }] },
    { date: '2026-05-05', content_md: '**Assalamu Alaikum, Abdullah.** Tuesday — midweek. The SwirlUI date picker was merged — great delivery. AWS SAA study: you\'re at 65% of the Maarek course. The UBL credit card (PKR 220K at 36% APR) is costing you PKR 6,600/month in interest — every month delayed is money lost. **Action this week: set up automatic PKR 25,000/month payment to UBL to clear by December.** Interest savings will be worth it.', highlights: [{ label: 'SwirlUI milestone', value: 'Date picker merged ✓', link: '/business', emoji: '✅' }, { label: 'UBL credit card', value: 'PKR 220K at 36% APR', link: '/money', emoji: '💳' }, { label: 'AWS SAA', value: '65% course complete', link: '/career', emoji: '☁️' }, { label: 'Dubai trip', value: 'UAE visa — apply 30 days before', link: '/travel', emoji: '🏙️' }] },
    { date: '2026-05-06', content_md: '**Assalamu Alaikum, Abdullah.** Wednesday — RemoteFirst sprint review call at 6pm PKT (1pm UTC). The notification microservice PR is ready for review. SwirlUI final deliverable (table component) is 80% done — complete before Friday. **One thing after Fajr: 90-minute deep work on the table component with sort and pagination. Ship it before Friday.** PKR savings target this month: PKR 180,000 — on track.', highlights: [{ label: 'RemoteFirst sprint call', value: 'Today 6pm PKT', link: '/focus', emoji: '💻' }, { label: 'SwirlUI table', value: '80% — ship by Friday', link: '/business', emoji: '🛠️' }, { label: 'Savings this month', value: 'PKR 180K target — on track', link: '/money', emoji: '💰' }, { label: 'Toptal application', value: 'Start prep this week', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-07', content_md: '**Assalamu Alaikum, Abdullah.** Thursday — home stretch of the work week. The JAZZ internet bill (PKR 3,200) is due May 10. Pay it today. The Zong 5G bill is due May 25 — no rush. PrimeApps invoice payment expected by May 14 — if not received by then, use the follow-up template in protection. **Focus today: complete AWS SAA Chapter 5 (EC2 advanced — Auto Scaling, Load Balancers, Spot instances). This is a high-exam-weight section.**', highlights: [{ label: 'Jazz bill due', value: 'PKR 3,200 — pay today', link: '/home', emoji: '🌐' }, { label: 'PrimeApps invoice', value: '$2,250 due May 14', link: '/business', emoji: '🧾' }, { label: 'AWS SAA', value: 'Ch 5 — Auto Scaling (high-weight)', link: '/career', emoji: '☁️' }, { label: 'Dubai visa', value: 'Apply June 7 (60 days before Aug 7)', link: '/travel', emoji: '🏙️' }] },
    { date: '2026-05-08', content_md: '**Assalamu Alaikum, Abdullah.** Friday — Jumu\'ah. The SwirlUI table component was shipped — excellent week. RemoteFirst sprint was strong. Freelance income this month: $2,250 PrimeApps + $1,200 SwirlUI paid = $3,450 total. Good month. **After Jumu\'ah: spend 2 hours on the side project — the PostgreSQL schema has been 80% done for a week. Finish it today, even if not perfect.** Fatima\'s call this evening.', highlights: [{ label: 'Freelance income May', value: '$3,450 pending + paid', link: '/business', emoji: '💰' }, { label: 'Side project', value: 'DB schema — finish today', link: '/focus', emoji: '🛠️' }, { label: 'Habit streak', value: 'Gym: 4/5 weekdays', link: '/habits', emoji: '🏋️' }, { label: 'AWS SAA target', value: 'Aug 15 — 13 weeks out', link: '/career', emoji: '☁️' }] },
    { date: '2026-05-09', content_md: '**Assalamu Alaikum, Abdullah.** Saturday — rest day but productive morning. Bills this month: LESCO (PKR 9,500 due May 15), Jazz (PKR 3,200 due May 10 — pay today), SNGPL (PKR 800 due May 20). Pay Jazz via JazzCash now. **Two priorities this weekend: 1) Complete NTN registration (FBR Iris, 30 minutes) — this is blocking Q2 forex compliance. 2) 2-hour AWS SAA mock exam. Exam is in 97 days.** Good week. Enjoy Sunday family dinner.', highlights: [{ label: 'Jazz bill — pay today', value: 'PKR 3,200 due May 10', link: '/home', emoji: '🌐' }, { label: 'NTN registration', value: 'Complete this weekend', link: '/legal', emoji: '⚖️' }, { label: 'AWS SAA', value: '97 days to exam', link: '/career', emoji: '☁️' }, { label: 'Savings target', value: 'PKR 3M by Dec 2027', link: '/money', emoji: '💰' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T02:00:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Abdullah Khan uid: ${UID}`)
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
