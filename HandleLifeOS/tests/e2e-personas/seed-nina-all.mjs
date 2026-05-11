/**
 * Full seed for Nina Okonkwo — Investment Analyst, Cardinal Stone Partners, Victoria Island Lagos.
 * Run: node tests/e2e-personas/seed-nina-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '0dc7d4d9-0dd3-41f2-a272-40f95c0a98b0'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Nina Okonkwo', occupation: 'Investment Analyst', life_stage: 'early_career',
    country: 'NG', currency: 'NGN', timezone: 'Africa/Lagos', preferred_language: 'en',
    goals: [
      'Pass CFA Level 1 in December 2026 — first attempt',
      'Save ₦3.2M for apartment down payment on Lekki Phase 1 by Q1 2028',
      'Build a side income of ₦200K/month through financial advisory consulting by end-2026',
      'Travel to London for Canary Wharf finance networking and tourist visit in June 2027',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Nina Okonkwo (Investment Analyst, Lagos NG)')

  const items = [
    { type: 'fact',         key: 'income',              value: '₦580,000/month gross salary from Cardinal Stone Partners (take-home ~₦490,000 after PAYE). Consulting income: ₦180K–₦258K/month depending on active contracts. Total household income ₦650K–₦750K/month.' },
    { type: 'fact',         key: 'home_location',       value: 'Studio apartment, Admiralty Way, Lekki Phase 1, Lagos 106104. Monthly rent ₦1.4M/year (₦116,667/month equivalent), lease expires Dec 2026. Planning to negotiate renewal or upgrade to 1BHK.' },
    { type: 'fact',         key: 'vehicle',             value: 'Honda HR-V 1.5L (2019, white, LSD-338-NG, Lagos Mainland registration). Full insurance due August 2026. Used for VI commute and weekend errands.' },
    { type: 'fact',         key: 'employer',            value: 'Cardinal Stone Partners Ltd — leading Nigerian investment banking and securities firm, Victoria Island Lagos. Focus areas: equities research, corporate finance advisory, asset management. Joined July 2023 as Analyst.' },
    { type: 'fact',         key: 'certifications',      value: 'CFA Level 1 candidate — registered December 2026 exam (Prometric CBT, Lagos). ICAN ACA (chartered — Nov 2022, annual renewal due Dec 2026). B.Sc. Accounting (First Class), University of Lagos 2021.' },
    { type: 'preference',   key: 'work_style',          value: 'In-office Mon–Fri (Cardinal Stone VI). Deep work 8am–10am before meetings. CFA study 7pm–9pm weekdays at home. Weekend mornings for church, family video calls (parents in Enugu), personal projects. Uses Notion for notes, Bloomberg Terminal at work.' },
    { type: 'preference',   key: 'diet',                value: 'No specific dietary restrictions. Eats Nigerian food at home (Mama Cass canteen in VI for lunch, ₦2,500–₦3,000/meal). Cooks egusi soup and jollof rice on Sundays. Intermittent fasting 16:8 on weekdays — first meal at 12pm.' },
    { type: 'preference',   key: 'fitness',             value: '5-day gym routine at Puma Fitness Lekki Phase 1. Weight training focus (5am–6:30am before work). Rest days Saturday–Sunday. Marathon runner — Lagos City Marathon participant (next: Feb 2027). 10,000 steps daily goal.' },
    { type: 'preference',   key: 'faith',               value: 'Strong Christian faith. Sunday service at House on the Rock, Lekki (8am service). Weekday morning devotion 5:30am (Bible app, prayer). Tithes ₦58K/month (10% of take-home). Financial giving is non-negotiable.' },
    { type: 'goal',         key: 'cfa_study',           value: 'CFA Level 1 December 2026: targeting 270-hour study plan (18 weeks × 15 hrs/week). Strongest: Financial Reporting (ICAN background). Weakest: Fixed Income and Derivatives. Using Kaplan Schweser + AnalystPrep mock exams. Scheduled: 4 full mock exams before exam day.' },
    { type: 'goal',         key: 'financial_goal',      value: 'Apartment down payment: ₦3.2M by Q1 2028. Current savings: ₦1.1M (Stanbic IBTC mutual fund + GTBank savings). Monthly saving target: ₦120,000 post-tithe. Lekki Phase 1 2BR target price: ₦48–55M (mortgage or outright).' },
    { type: 'goal',         key: 'consulting_goal',     value: 'Financial advisory consulting via sole proprietorship "Nino Advisory". Current clients: Tola & Associates (SME financial modelling) and LBS Alumni Network (quarterly investor briefings). Target 3 clients by year-end at ₦200K+ MRR.' },
    { type: 'concern',      key: 'nigeria_economy',     value: 'FX volatility (₦/USD) affects client portfolios at Cardinal Stone. Inflation at 32% in early 2026 erodes real returns. Salary is NGN-denominated — USD-linked income from international consulting is a goal.' },
    { type: 'concern',      key: 'power_supply',        value: 'EKEDC grid unreliable — typically 8–10 hours of grid power/day in Lekki Phase 1. Relies on generator for evening CFA study (₦35,000/month petrol). Solar inverter installation (₦800K) under evaluation.' },
    { type: 'relationship', key: 'family',              value: 'Parents: Emeka and Ngozi Okonkwo (Enugu — call every Sunday after church). Older brother Kelechi (Abuja, civil servant). Sister Adaeze (UNILAG, 3rd year Medicine — Nina pays part of her fees ₦280K/semester). Boyfriend Tunde (software engineer, Andela, based in Lagos).' },
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
    { name: 'Morning Devotion & Prayer 30 min',   icon: '✝️',  color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '05:30', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Gym Workout 5am',                    icon: '🏋️',  color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '05:00', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'CFA Level 1 Study Block 2 hrs',      icon: '📖',  color: 'violet',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '19:00', completedOffsets: [1,2,3,5,8,9,10,12,15,16,17,18,19] },
    { name: 'Financial Report Review 30 min',     icon: '📈',  color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20] },
    { name: 'Expense Tracking & Budget Log',      icon: '💳',  color: 'amber',   frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '21:00', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'Sunday Church Service',              icon: '⛪',  color: 'rose',    frequency: 'custom',   days_of_week: [0],             reminder_time: '07:30', completedOffsets: [0,7,14] },
    { name: 'Gratitude Journaling 10 min',        icon: '📓',  color: 'purple',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20] },
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
    daily_goal: 2, ambient_sound: 'rain', notifications_blocked: true,
  }, { onConflict: 'user_id' })

  // WAT = UTC+1: 08:00 WAT = T07:00:00Z; 07:00 WAT = T06:00:00Z; 09:00 WAT = T08:00:00Z
  const sessions = [
    { off: 0,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'CFA Fixed Income — bond pricing, yield curves and duration study',                          time: '07:00' },
    { off: 1,  mode: 'deep',     plan: 90,  act: 87,  done: true,  title: 'Tola & Associates — financial model update: FY 2026 revenue projections and scenario analysis', time: '07:00' },
    { off: 2,  mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'NSE equities research — banking sector Q1 2026 earnings review for Cardinal Stone',          time: '07:00' },
    { off: 3,  mode: 'deep',     plan: 90,  act: 90,  done: true,  title: 'CFA Derivatives — options pricing, Black-Scholes intuition and practice problems',            time: '07:00' },
    { off: 4,  mode: 'deep',     plan: 120, act: 115, done: true,  title: 'LBS Alumni Network — Q2 2026 investor briefing report: Emerging Markets outlook Nigeria',     time: '07:00' },
    { off: 5,  mode: 'pomodoro', plan: 25,  act: 25,  done: true,  title: 'Personal finance review — April savings target vs actual, consulting invoice tracking',       time: '08:00' },
    { off: 6,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'CFA mock exam 1 — 90-question morning session (Ethics + Quant + Economics)',                  time: '07:00' },
    { off: 7,  mode: 'deep',     plan: 90,  act: 85,  done: true,  title: 'Solar inverter research — 5kVA system quotes from 3 Lagos vendors and ROI analysis',          time: '07:00' },
    { off: 8,  mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'CFA Financial Reporting — IFRS vs US GAAP differences, intercorporate investments',           time: '07:00' },
    { off: 9,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'Tola & Associates — working capital optimisation model, debtor days analysis',                time: '07:00' },
    { off: 10, mode: 'deep',     plan: 90,  act: 87,  done: true,  title: 'Cardinal Stone research — FGN bond yield analysis, CBN MPR trajectory H2 2026',              time: '07:00' },
    { off: 11, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'CFA Equity Valuation — DCF modelling, Gordon Growth Model and relative valuation',            time: '07:00' },
    { off: 12, mode: 'deep',     plan: 60,  act: 60,  done: true,  title: 'CFA mock exam review — scored 62%, fixed income and derivatives weak areas',                  time: '07:00' },
    { off: 13, mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'Dubai trip planning — Airbnb shortlist, Burj Khalifa tickets, DIFC finance walk',             time: '07:00' },
    { off: 14, mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'CFA Alternative Investments — hedge funds, private equity, real estate and commodities',       time: '07:00' },
    { off: 15, mode: 'deep',     plan: 90,  act: 87,  done: true,  title: 'LBS Alumni Network Q3 briefing prep — Nigerian inflation and equity market 2026 H2 outlook', time: '07:00' },
    { off: 16, mode: 'pomodoro', plan: 50,  act: 50,  done: true,  title: 'FIRS PIT filing — gather P60 equivalent payslips and consulting income receipts for 2025',   time: '08:00' },
    { off: 17, mode: 'deep',     plan: 90,  act: 85,  done: true,  title: 'CFA Portfolio Management — IPS construction, risk budgeting and asset allocation',            time: '07:00' },
    { off: 19, mode: 'deep',     plan: 120, act: 117, done: true,  title: 'Tola & Associates — fundraising deck: investor-ready financial model for Seed round',         time: '07:00' },
    { off: 20, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'May month-end review — savings rate, consulting revenue, CFA progress tracker update',        time: '08:00' },
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
      question: 'Should I take the CFA Level 1 exam in December 2026 or defer to June 2027?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-04-20T07:00:00Z', favorite: true,
      result: {
        summary: 'Nina has 8 months until December 2026 exam. Required study hours: 270–300 (CFA Institute recommendation). Available weekday evenings (2 hrs × 5 days) + weekend mornings (4 hrs × 2 days) = 18 hrs/week, yielding 288 hours over 16 weeks. ICAN ACA background gives strong advantage in Financial Reporting and Ethics. Weak areas: Fixed Income, Derivatives, Alternative Investments.',
        recommendation: 'Proceed with December 2026. The 270-hour target is achievable within the timeline. ICAN background provides a 20–25% efficiency boost on Accounting/FRA topics. Use AnalystPrep mock exams from Week 10 onwards. Target pass with mock scores consistently above 65% before the exam.',
        confidenceScore: 78, riskScore: 35, riskLevel: 'medium',
        financialImpact: { summary: 'Exam fee already paid ($1,150 / ₦920K at ₦800/USD). Schweser materials: ₦185K. Total investment ₦1.1M. CFA charter adds estimated ₦4–6M NPV in career earnings over 10 years at Cardinal Stone.', monthlyCostChange: 0, oneTimeCost: 185000, opportunityCost: '4 hours/day study commitment reduces social and consulting time', affordabilityScore: 85 },
        pros: ['ICAN ACA overlap with CFA FRA = 25–30% content already mastered', 'December 2026 keeps momentum — June 2027 deferral delays Level 2 by 12 months', 'Cardinal Stone management aware and supportive — study leave likely for exam week'],
        cons: ['Fixed Income and Derivatives (combined 24% of exam) require heavy effort', 'Q4 is peak corporate finance season at Cardinal Stone — workload risk'],
        nextSteps: ['Build 18-week study calendar now — prioritise Fixed Income (Week 1–3) and Derivatives (Week 8–10)', 'Schedule 4 full mock exams: Weeks 13, 14, 15, 16 (final mock 48 hrs before exam)', 'Inform Cardinal Stone partner about exam week — request lighter workload November 30 – December 5'],
        memoryFactorsUsed: ['CFA goal: December 2026 first attempt', 'ICAN ACA background: strong FRA foundation'],
        dataSourcesUsed: ['CFA Institute 2026 Level 1 curriculum overview', 'AnalystPrep pass rate data 2025'],
      },
    },
    {
      question: 'Should I renew my Lekki Phase 1 studio lease at ₦1.4M or move to a 1BHK flat?',
      category: 'family', mode: 'compare', options: ['Renew studio at ₦1.4M/year', 'Move to 1BHK at ₦2.2–2.5M/year'],
      created_at: '2026-04-28T07:00:00Z', favorite: false,
      result: {
        question: 'Studio renewal vs 1BHK upgrade in Lekki Phase 1',
        factors: ['Monthly cost impact', 'CFA study environment', 'Apartment down payment savings', 'Commute to VI', 'Quality of life'],
        options: [
          { label: 'Renew studio at ₦1.4M/year', scores: { 'Monthly cost impact': 90, 'CFA study environment': 60, 'Apartment down payment savings': 85, 'Commute to VI': 85, 'Quality of life': 60 },
            pros: ['₦800K–₦1.1M/year cheaper — accelerates apartment down payment by 8–10 months', 'Familiar building, estate security, EKEDC allocation known', 'CFA exam is December — no move disruption risk during study period'],
            cons: ['Studio is cramped for long CFA study sessions (no dedicated desk space)', 'Tunde visits frequently — studio is uncomfortable for 2 people'],
            summary: 'Financially optimal — saves significantly toward apartment goal.' },
          { label: 'Move to 1BHK at ₦2.2–2.5M/year', scores: { 'Monthly cost impact': 45, 'CFA study environment': 90, 'Apartment down payment savings': 50, 'Commute to VI': 75, 'Quality of life': 88 },
            pros: ['Dedicated bedroom + sitting room = proper CFA study setup', 'Better quality of life for Tunde visits and sister Adaeze when she visits Lagos', 'Can host parents without awkwardness'],
            cons: ['Additional ₦67K–₦92K/month vs studio slows down payment savings', 'Moving during H2 2026 = potential CFA study disruption in peak study period'],
            summary: 'Better quality of life but financially sets back apartment goal by ~10 months.' },
        ],
        recommendation: 'Renew the studio for one more year (December 2026 – December 2027). Pass CFA first — then upgrade to 1BHK in January 2027 as a reward. The ₦800K savings in 2026 accelerates the ₦3.2M apartment down payment by nearly a year.',
        winner: 'Renew studio at ₦1.4M/year',
      },
    },
    {
      question: 'Should I invest ₦500K in a Nigerian fintech startup (friend\'s offer) or keep it in mutual funds?',
      category: 'business', mode: 'compare', options: ['Nigerian fintech startup equity', 'Stanbic IBTC mutual fund (existing)'],
      created_at: '2026-05-03T07:00:00Z', favorite: true,
      result: {
        question: 'Startup equity vs mutual fund for ₦500K investment',
        factors: ['Liquidity', 'Risk level', 'Return potential', 'Alignment with goals', 'Due diligence burden'],
        options: [
          { label: 'Nigerian fintech startup equity', scores: { 'Liquidity': 10, 'Risk level': 25, 'Return potential': 85, 'Alignment with goals': 55, 'Due diligence burden': 30 },
            pros: ['10–50× return possible if startup reaches Series A+', 'Networking and deal exposure useful for Cardinal Stone career'],
            cons: ['Completely illiquid — ₦500K locked for 5–7+ years', 'Nigerian fintech regulatory risk (CBN sandbox, FX restrictions)', 'No audited financials provided — no proper DD completed', '₦500K is 45% of current liquid savings — concentration risk'],
            summary: 'High potential but illiquid, unaudited, and concentrates too much of savings.' },
          { label: 'Stanbic IBTC mutual fund (existing)', scores: { 'Liquidity': 85, 'Risk level': 70, 'Return potential': 55, 'Alignment with goals': 90, 'Due diligence burden': 90 },
            pros: ['T+3 liquidity — accessible if apartment opportunity arises', 'Professionally managed, regulated by SEC Nigeria', 'Consistent with apartment down payment goal (₦3.2M by Q1 2028)', 'Average annual return 18–22% in NGN (inflation-beating in 2025)'],
            cons: ['No moonshot upside — capped at market return', 'NGN-denominated (inflation risk at 32%)'],
            summary: 'Aligns with near-term apartment goal and keeps savings liquid.' },
        ],
        recommendation: 'Keep the ₦500K in mutual funds. The apartment down payment timeline (Q1 2028) requires liquid, accessible savings. ₦500K in an illiquid startup at 45% of liquid savings is an unacceptable concentration. If the startup is compelling, revisit with ₦100K maximum (10% of savings) after proper DD.',
        winner: 'Stanbic IBTC mutual fund (existing)',
      },
    },
    {
      question: 'Should I install a 5kVA solar inverter system (₦800K) to solve EKEDC power issues?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-05-07T07:00:00Z', favorite: false,
      result: {
        summary: 'Current generator costs: ₦35,000/month petrol + ₦8,000/month maintenance = ₦43,000/month. Annual cost: ₦516,000/year. 5kVA solar inverter (12 panels + lithium batteries): ₦780,000–₦850,000 installed. Break-even: 19–20 months. CFA study critically depends on evening power (7pm–9pm) — generator noise also disrupts concentration.',
        recommendation: 'Install solar inverter after CFA exam (January 2027). Installing during peak study period risks construction noise disruption. The ₦800K cost is better deployed toward apartment savings in 2026. Budget ₦850K for Q1 2027 installation after December exam.',
        confidenceScore: 80, riskScore: 20, riskLevel: 'low',
        financialImpact: { summary: '₦800K upfront, saves ₦516K/year in generator costs. Payback: 19 months. NPV positive over 7-year battery life.', monthlyCostChange: -43000, oneTimeCost: 800000, opportunityCost: 'Delays apartment savings by ~7 months if done in 2026', affordabilityScore: 60 },
        pros: ['Eliminates ₦516K/year recurring generator cost', 'Silent operation — dramatically better CFA study environment (post-install)', 'Adds value to apartment negotiation / eventual property purchase'],
        cons: ['₦800K in 2026 slows apartment down payment by 7 months', 'Building landlord approval needed (external panels on balcony)'],
        nextSteps: ['Get final quotes from Solar Trust and Rensource in December 2026', 'Negotiate with landlord before installing — confirm lease renewal first', 'Target installation January 2027 after exam and lease renewal'],
        memoryFactorsUsed: ['Concern: EKEDC power supply, generator ₦35K/month', 'Goal: apartment down payment ₦3.2M by Q1 2028'],
        dataSourcesUsed: ['Lagos solar installer quotes May 2026', 'EKEDC tariff schedule 2026'],
      },
    },
    {
      question: 'Expand Nino Advisory to 3 consulting clients — target which sector?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-08T07:00:00Z', favorite: false,
      result: {
        summary: 'Current consulting: Tola & Associates (SME financial modelling, ₦180K/month), LBS Alumni Network (quarterly briefings, ₦78K/quarter = ₦26K/month). MRR: ₦206K. Target: ₦400K+ MRR with 1 new client. Highest demand for financial advisory in Nigeria: agribusiness SMEs seeking CBN Agric Credit Scheme compliance, and tech startups needing investor-ready models for Series A.',
        recommendation: 'Target a Lagos-based agribusiness or agritech startup for the 3rd client. The CBN Agricultural Credit Guarantee Scheme Fund (ACGSF) creates a recurring compliance and reporting need — 12-month retainer potential at ₦180K–₦240K/month. This aligns with current Tola & Associates skillset (SME financial modelling).',
        confidenceScore: 72, riskScore: 30, riskLevel: 'low',
        financialImpact: { summary: 'New client at ₦200K/month = ₦400K consulting MRR (₦4.8M/year). Adds 8 hrs/month work — manageable within current schedule.', monthlyCostChange: 200000, oneTimeCost: 0, opportunityCost: 'CFA study time during client onboarding — defer new client to January 2027', affordabilityScore: 95 },
        pros: ['Agribusiness CBN compliance is evergreen — not project-based like pitch decks', 'LBS network has agribusiness alumni connections', 'Cardinal Stone has agritech deal flow that can surface referrals'],
        cons: ['Agricultural finance due diligence is specialised — learning curve in crop cycles, commodity prices', 'January 2027 start avoids CFA study disruption'],
        nextSteps: ['After CFA exam, reach out to 3 LBS alumni in agribusiness in January 2027', 'Develop Nino Advisory "Agribusiness Financial Health Check" service offering (Nov 2026)', 'Register Nino Advisory as a business name at CAC (₦15,000) before year-end'],
        memoryFactorsUsed: ['Goal: ₦200K/month consulting by end-2026', 'Relationship: LBS Alumni Network client'],
        dataSourcesUsed: ['CBN ACGSF scheme 2026', 'Lagos SME advisory market sizing'],
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
  const tola = await ins('business_clients', {
    user_id: UID, name: 'Tola & Associates', company: 'Tola & Associates SME Advisory Ltd',
    email: 'tola@tolaadvisory.ng', phone: '+2348031234567', address: '14 Bode Thomas St, Surulere, Lagos 101241', currency: 'NGN',
    notes: 'SME advisory firm. Engaged Nino Advisory for financial modelling and monthly management accounts. ₦180K/month retainer. Pays promptly on 1st.',
  }, 'client: Tola & Associates')
  const lbs = await ins('business_clients', {
    user_id: UID, name: 'Lagos Business School Alumni Network', company: 'LBS Alumni Association Lagos Chapter',
    email: 'alumni@lbs.edu.ng', phone: '+2348098765432', address: 'Km 22, Lekki-Epe Expressway, Ajah, Lagos', currency: 'NGN',
    notes: 'Quarterly investor briefing reports for LBS alumni investors. ₦78,000/quarter. Presentation at quarterly alumni luncheons.',
  }, 'client: LBS Alumni Network')
  if (!tola || !lbs) return

  const projTola = await ins('business_projects', {
    user_id: UID, client_id: tola.id, name: 'Tola & Associates — Monthly Financial Modelling Retainer',
    status: 'active', start_date: '2026-01-01', end_date: null,
    fee: 180000, currency: 'NGN', notes: 'Monthly retainer: management accounts, financial projections, scenario analysis for 4 SME clients of Tola & Associates.',
  }, 'project: Tola retainer')
  const projLBS = await ins('business_projects', {
    user_id: UID, client_id: lbs.id, name: 'LBS Alumni Network — Quarterly Investor Briefings',
    status: 'active', start_date: '2026-01-01', end_date: '2026-12-31',
    fee: 78000, currency: 'NGN', notes: 'Quarterly reports on Nigerian macro, equity markets, and investment opportunities. Q2 report due May 30 2026.',
  }, 'project: LBS quarterly briefing')

  if (projTola) {
    await ins('business_invoices', {
      user_id: UID, client_id: tola.id, project_id: projTola.id,
      invoice_no: 'NO-2026-001', issued_at: '2026-02-28', due_at: '2026-03-07',
      items: [
        { description: 'Monthly financial modelling retainer — February 2026', qty: 1, rate: 180000, amount: 180000 },
      ],
      subtotal: 180000, tax_pct: 7.5, tax_amt: 13500, discount_amt: 0, total: 193500, currency: 'NGN', status: 'paid', paid_at: '2026-03-01',
    }, 'invoice: NO-2026-001 (paid)')
    await ins('business_invoices', {
      user_id: UID, client_id: tola.id, project_id: projTola.id,
      invoice_no: 'NO-2026-002', issued_at: '2026-03-31', due_at: '2026-04-07',
      items: [
        { description: 'Monthly financial modelling retainer — March 2026', qty: 1, rate: 75000, amount: 75000 },
        { description: 'Additional: Seed fundraising model (one-off)', qty: 1, rate: 0, amount: 0 },
      ],
      subtotal: 75000, tax_pct: 7.5, tax_amt: 5625, discount_amt: 0, total: 80625, currency: 'NGN', status: 'paid', paid_at: '2026-04-05',
    }, 'invoice: NO-2026-002 (paid)')
  }
  if (projLBS) {
    await ins('business_invoices', {
      user_id: UID, client_id: lbs.id, project_id: projLBS.id,
      invoice_no: 'NO-2026-003', issued_at: '2026-04-30', due_at: '2026-05-14',
      items: [
        { description: 'Q2 2026 Investor Briefing Report — Nigerian Equities & Macro Outlook', qty: 1, rate: 78000, amount: 78000 },
        { description: 'Presentation at LBS Q2 Alumni Luncheon (May 28)', qty: 1, rate: 162000, amount: 162000 },
      ],
      subtotal: 240000, tax_pct: 7.5, tax_amt: 18000, discount_amt: 0, total: 258000, currency: 'NGN', status: 'sent',
    }, 'invoice: NO-2026-003 (sent)')
  }

  const expenses = [
    { category: 'transport', vendor: 'Bolt / Uber', amount: 28000, occurred_at: '2026-04-30', description: 'April ride-hailing: VI office commute + client meetings in Surulere and Ajah' },
    { category: 'software', vendor: 'AnalystPrep', amount: 47000, occurred_at: '2026-04-01', description: 'AnalystPrep CFA Level 1 mock exam subscription — 6 months (April–September 2026)' },
    { category: 'software', vendor: 'Microsoft 365', amount: 9000, occurred_at: '2026-04-05', description: 'Microsoft 365 Personal — Excel, Word, PowerPoint for Nino Advisory deliverables (annual)' },
    { category: 'professional', vendor: 'ICAN', amount: 35000, occurred_at: '2026-04-10', description: 'ICAN ACA annual practising certificate renewal fee — 2026' },
    { category: 'meals', vendor: 'Mama Cass / local canteens', amount: 60000, occurred_at: '2026-04-30', description: 'April business lunches at VI canteens during client review meetings' },
  ]
  let n = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'NGN', is_billable: false, ...e })
    if (!error) n++; else console.log(`  ✗  expense: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${expenses.length} business expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const hrv = await ins('home_assets', { user_id: UID, name: 'Honda HR-V 1.5L (2019)', type: 'vehicle', brand: 'Honda', model: 'HR-V 1.5L CVT Sport', purchased_at: '2020-06-10', warranty_until: '2023-06-10', cost: 9800000, notes: 'Registration LSD-338-NG. Bought second-hand from trusted dealer. Full comprehensive insurance due August 31 2026. Used for VI commute and weekend runs.' }, 'asset: Honda HR-V')
  const mac = await ins('home_assets', { user_id: UID, name: 'Apple MacBook Pro 14" M2 Pro', type: 'electronics', brand: 'Apple', model: 'MacBook Pro 14-inch M2 Pro (2023)', purchased_at: '2023-08-15', warranty_until: '2024-08-15', cost: 2450000, notes: 'Primary work machine for Nino Advisory. Bloomberg data exports, Excel modelling, presentations. AppleCare expired — accidental damage risk.' }, 'asset: MacBook Pro M2')
  const tv = await ins('home_assets', { user_id: UID, name: 'Hisense 55" 4K ULED Smart TV', type: 'electronics', brand: 'Hisense', model: '55U6H ULED (2022)', purchased_at: '2022-11-20', warranty_until: '2024-11-20', cost: 380000, notes: 'Living area TV. Netflix, YouTube. DSTV Compact Plus connected (₦7,400/month). Used for Bloomberg TV and CFA video lectures on large screen.' }, 'asset: Hisense TV')
  const fridge = await ins('home_assets', { user_id: UID, name: 'Samsung 385L Bottom-Mount Fridge', type: 'appliance', brand: 'Samsung', model: 'RT38K5030S8 (2022)', purchased_at: '2022-04-05', warranty_until: '2024-04-05', cost: 290000, notes: 'Kitchen fridge. Runs on inverter/solar during power outage — high generator petrol consumer.' }, 'asset: Samsung fridge')
  const ac = await ins('home_assets', { user_id: UID, name: 'Daikin 1.5HP Inverter Split AC', type: 'appliance', brand: 'Daikin', model: 'FTKG35TV16U (2023)', purchased_at: '2023-05-10', warranty_until: '2026-05-10', cost: 420000, notes: 'Bedroom AC. Critical for quality sleep and CFA study comfort. Warranty expires May 2026 — check extended warranty options.' }, 'asset: Daikin AC')

  if (hrv) {
    await ins('home_maintenance', { user_id: UID, asset_id: hrv.id, title: 'Honda HR-V Annual Service (authorised dealer)', category: 'service', recurrence_months: 12, last_done_at: '2025-07-15', next_due_at: '2026-07-15', vendor: 'Honda Place Nigeria, Victoria Island', cost: 85000, is_active: true, notes: '₦85K for full service including oil, filters, brake inspection. Book June for July slot.' }, 'maint: HR-V service')
    await ins('home_maintenance', { user_id: UID, asset_id: hrv.id, title: 'Honda HR-V Comprehensive Insurance Renewal', category: 'service', recurrence_months: 12, last_done_at: '2025-08-31', next_due_at: '2026-08-31', vendor: 'AXA Mansard / Leadway Assurance', cost: 185000, is_active: true, notes: 'Comprehensive insurance due Aug 31. Compare AXA Mansard (current) and Leadway Assurance before renewal. Vehicle value ₦9.5M.' }, 'maint: HR-V insurance')
  }
  if (ac) await ins('home_maintenance', { user_id: UID, asset_id: ac.id, title: 'Daikin AC Annual Service + Warranty Check', category: 'service', recurrence_months: 12, last_done_at: '2025-05-20', next_due_at: '2026-05-20', vendor: 'Daikin Nigeria Authorised Service, Lekki', cost: 25000, is_active: true, notes: 'Warranty expires May 2026 — get extended warranty quote at same service. Cleaning + refrigerant top-up.' }, 'maint: Daikin AC service')

  const bills = [
    { utility: 'electricity', provider: 'EKEDC (Eko Electricity Distribution Company)', amount: 28500, bill_date: '2026-02-28', due_date: '2026-03-10', is_paid: true, account_no: 'EKEDC-LK1-4421097' },
    { utility: 'electricity', provider: 'EKEDC (Eko Electricity Distribution Company)', amount: 31000, bill_date: '2026-03-31', due_date: '2026-04-10', is_paid: true, account_no: 'EKEDC-LK1-4421097' },
    { utility: 'electricity', provider: 'EKEDC (Eko Electricity Distribution Company)', amount: 29500, bill_date: '2026-04-30', due_date: '2026-05-10', is_paid: false, account_no: 'EKEDC-LK1-4421097' },
    { utility: 'water', provider: 'Lekki Phase 1 Estate Water (LSTC)', amount: 8500, bill_date: '2026-02-28', due_date: '2026-03-15', is_paid: true, account_no: 'LSTC-LK1-21098' },
    { utility: 'water', provider: 'Lekki Phase 1 Estate Water (LSTC)', amount: 8500, bill_date: '2026-03-31', due_date: '2026-04-15', is_paid: true, account_no: 'LSTC-LK1-21098' },
    { utility: 'water', provider: 'Lekki Phase 1 Estate Water (LSTC)', amount: 8500, bill_date: '2026-04-30', due_date: '2026-05-15', is_paid: false, account_no: 'LSTC-LK1-21098' },
    { utility: 'internet', provider: 'Spectranet 4G LTE (30 Mbps Unlimited)', amount: 15000, bill_date: '2026-03-05', due_date: '2026-03-10', is_paid: true, account_no: 'SPEC-NG-LK-88412' },
    { utility: 'internet', provider: 'Spectranet 4G LTE (30 Mbps Unlimited)', amount: 15000, bill_date: '2026-04-05', due_date: '2026-04-10', is_paid: true, account_no: 'SPEC-NG-LK-88412' },
    { utility: 'internet', provider: 'Spectranet 4G LTE (30 Mbps Unlimited)', amount: 15000, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'SPEC-NG-LK-88412' },
    { utility: 'phone', provider: 'MTN Nigeria Postpaid 5G (XtraTime 30GB)', amount: 12500, bill_date: '2026-03-15', due_date: '2026-03-25', is_paid: true, account_no: 'MTN-NG-PP-44228' },
    { utility: 'phone', provider: 'MTN Nigeria Postpaid 5G (XtraTime 30GB)', amount: 12500, bill_date: '2026-04-15', due_date: '2026-04-25', is_paid: true, account_no: 'MTN-NG-PP-44228' },
    { utility: 'phone', provider: 'MTN Nigeria Postpaid 5G (XtraTime 30GB)', amount: 12500, bill_date: '2026-05-15', due_date: '2026-05-25', is_paid: false, account_no: 'MTN-NG-PP-44228' },
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
  const dubai = await ins('trips', { user_id: UID, destination: 'Dubai, UAE', start_date: '2026-11-07', end_date: '2026-11-12', status: 'planning', budget_total: 1800000, currency: 'NGN', travellers: 2, notes: 'Leisure + finance networking trip with Tunde. Post-CFA exam reward. DIFC finance district walk, Burj Khalifa, Desert Safari. FinTech Connect conference Nov 10.', cover_emoji: '🏙️' }, 'trip: Dubai')
  if (dubai) {
    const items = [
      { type: 'flight', title: 'Emirates EK787 Lagos (LOS) → Dubai (DXB)', starts_at: '2026-11-07T23:00:00+01:00', location: 'Murtala Muhammed International Airport, Lagos', cost: 720000, order_index: 1, notes: '2 × ₦360K return tickets (Lagos–Dubai). Book by July to avoid Harmattan season surge pricing.' },
      { type: 'hotel', title: 'Rove Downtown Dubai — 5 nights', starts_at: '2026-11-08T14:00:00+04:00', ends_at: '2026-11-12T11:00:00+04:00', location: 'Downtown Dubai, UAE', cost: 480000, order_index: 2, notes: '₦96K/night (~$120 USD). Walking distance to Dubai Mall, Burj Khalifa, DIFC.' },
      { type: 'activity', title: 'Burj Khalifa At the Top (floors 124 + 125)', starts_at: '2026-11-09T18:00:00+04:00', location: 'Burj Khalifa, Downtown Dubai', cost: 64000, order_index: 3, notes: '2 tickets × ₦32K (~$40 USD each). Sunset slot — book online in advance.' },
      { type: 'activity', title: 'FinTech Connect MENA 2026 Conference (1 day pass)', starts_at: '2026-11-10T09:00:00+04:00', location: 'Dubai International Financial Centre (DIFC)', cost: 160000, order_index: 4, notes: '₦160K (~$200 USD) conference pass. Network with African fintech founders and Gulf investors.' },
      { type: 'activity', title: 'Desert Safari with BBQ dinner (evening)', starts_at: '2026-11-11T15:00:00+04:00', location: 'Dubai Desert Conservation Reserve', cost: 96000, order_index: 5, notes: '₦48K/person. Sand dune bashing, camel ride, Arabic dinner.' },
      { type: 'flight', title: 'Emirates EK786 Dubai (DXB) → Lagos (LOS)', starts_at: '2026-11-12T14:30:00+04:00', location: 'Dubai International Airport (DXB)', cost: 0, order_index: 6, notes: 'Return leg included in round-trip ticket.' },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: dubai.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'International passport (validity check — must be valid until May 2027)', category: 'documents', qty: 1, is_packed: false },
      { item: 'UAE visa confirmation / e-visa printout', category: 'documents', qty: 2, is_packed: false },
      { item: 'Travel insurance documents', category: 'documents', qty: 2, is_packed: false },
      { item: 'Modest clothing (Dubai dress code for malls)', category: 'clothing', qty: 5, is_packed: false },
      { item: 'Sunscreen SPF 50 (desert safari)', category: 'health', qty: 1, is_packed: false },
      { item: 'Business cards for FinTech Connect conference', category: 'documents', qty: 50, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: dubai.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Dubai: ${iOk} items, ${pOk} packing`)
  }

  const accra = await ins('trips', { user_id: UID, destination: 'Accra, Ghana', start_date: '2026-03-14', end_date: '2026-03-17', status: 'completed', budget_total: 420000, currency: 'NGN', travellers: 1, notes: 'Cardinal Stone regional research trip — West Africa banking sector coverage. Met with GT Bank Ghana and Absa Ghana teams.', cover_emoji: '🌍' }, 'trip: Accra (completed)')
  if (accra) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: accra.id, type: 'flight', title: 'Arik Air W3 Lagos (LOS) → Accra (ACC)', starts_at: '2026-03-14T10:00:00+01:00', location: 'Murtala Muhammed International Airport', cost: 95000, is_done: true, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: accra.id, type: 'hotel', title: 'Kempinski Hotel Gold Coast City Accra — 3 nights', starts_at: '2026-03-14T15:00:00+00:00', ends_at: '2026-03-17T11:00:00+00:00', location: 'Airport City, Accra, Ghana', cost: 210000, is_done: true, order_index: 2 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: accra.id, type: 'activity', title: 'GT Bank Ghana & Absa Ghana research meetings', starts_at: '2026-03-15T09:00:00+00:00', location: 'Cantonments, Accra', cost: 0, is_done: true, order_index: 3, notes: 'Cardinal Stone West Africa banking sector research — in-person meetings' })
    await db.from('trip_items').insert({ user_id: UID, trip_id: accra.id, type: 'flight', title: 'Arik Air W3 Accra (ACC) → Lagos (LOS)', starts_at: '2026-03-17T16:00:00+00:00', location: 'Kotoka International Airport, Accra', cost: 90000, is_done: true, order_index: 4 })
  }

  const london = await ins('trips', { user_id: UID, destination: 'London, United Kingdom', start_date: '2027-06-05', end_date: '2027-06-14', status: 'planning', budget_total: 4500000, currency: 'NGN', travellers: 1, notes: 'Post-CFA charter target trip. Canary Wharf networking, Bank of England museum, meeting LBS alumni in London finance sector.', cover_emoji: '🇬🇧' }, 'trip: London 2027')
  if (london) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: london.id, type: 'flight', title: 'British Airways BA076 Lagos (LOS) → London Heathrow (LHR)', starts_at: '2027-06-05T22:00:00+01:00', location: 'Murtala Muhammed International Airport, Lagos', cost: 1800000, is_done: false, order_index: 1, notes: '₦1.8M return ticket estimate (prices likely different in 2027 — book 3 months in advance)' })
    await db.from('trip_items').insert({ user_id: UID, trip_id: london.id, type: 'hotel', title: 'Premier Inn London Canary Wharf — 9 nights', starts_at: '2027-06-06T14:00:00+01:00', ends_at: '2027-06-14T11:00:00+01:00', location: 'Canary Wharf, London E14', cost: 1620000, is_done: false, order_index: 2, notes: '₦180K/night (~£90) — budget hotel but great Canary Wharf location for finance networking' })
    await db.from('trip_items').insert({ user_id: UID, trip_id: london.id, type: 'activity', title: 'Canary Wharf networking events + LBS alumni meetup', starts_at: '2027-06-08T18:00:00+01:00', location: 'Canary Wharf, London', cost: 120000, is_done: false, order_index: 3, notes: 'LBS London alumni chapter quarterly dinner. Contact alumni coordinator 3 months in advance.' })
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'Fake CBN "Account Verification" Phishing Email', content: 'CENTRAL BANK OF NIGERIA NOTICE: Your BVN-linked accounts require mandatory CBN verification by May 31 2026 or accounts will be frozen. Click to verify: cbn-verify-bvn.ng/update. For queries call: 09011234567.', risk_level: 'high', result_summary: 'This is a CBN impersonation phishing scam. The Central Bank of Nigeria does not send email or SMS messages requesting BVN verification through external links. BVN updates and account verifications are done only through your bank\'s official app or branch. The domain "cbn-verify-bvn.ng" is fraudulent — CBN\'s official website is cbn.gov.ng.', red_flags: ['CBN never sends account freeze threats via email with external links', 'Domain "cbn-verify-bvn.ng" is not cbn.gov.ng', '"Frozen account" urgency is a classic phishing manipulation tactic', 'Phone number 090-prefix is a mobile number — CBN uses landlines only'], safe_next_step: 'Delete the email immediately. Do NOT click any links. Report to EFCC (efcc.gov.ng) and CBN Consumer Protection (cpd@cbn.gov.ng). If concerned about your BVN, visit your GTBank or Stanbic IBTC branch directly.' },
    { type: 'scam', title: 'WhatsApp Investment Scheme — "35% Monthly Returns" Crypto Bot', content: 'Dear Nina, My trading bot generated ₦450,000 profit last month from ₦200,000 investment (35% return). I want to invite only 5 trusted people to join. Minimum entry ₦150,000. Profits paid monthly via bank transfer. WhatsApp me now before slots fill up.', risk_level: 'high', result_summary: 'This is a classic Ponzi scheme / investment fraud. 35% monthly returns (420% annual) are mathematically impossible through any legitimate investment. This is a typical Nigerian advance-fee investment scam targeting young finance professionals who understand returns terminology but may be tempted by high numbers.', red_flags: ['35% monthly return is 420%/year — no legitimate investment generates this', '"Only 5 slots" creates artificial scarcity and urgency', 'No regulatory registration — SEC Nigeria would never approve this', 'WhatsApp-only communication — no official documents, no regulatory number', 'Targeting personally by name suggests social engineering from contact list breach'], safe_next_step: 'Block and report the contact on WhatsApp. Report to SEC Nigeria (sec.gov.ng/investor-protection) and Nigeria Police Force Cybercrime unit. Do NOT share with others even to warn them — sharing the number exposes your contact list.' },
    { type: 'scam', title: 'Lekki Land "Distress Sale" with No Title Documents', content: 'URGENT: Owner travelling abroad. 600sqm plot, Lekki Phase 2, ₦18M (market value ₦35M). Buyer must pay 50% deposit within 72 hours. C of O and survey plan to be provided after initial payment. Call Mr Adeyemi: 08066001234.', risk_level: 'high', result_summary: 'This is a land fraud scheme, extremely common in Lekki Phase 2 and Ajah areas. The pattern — "distress price + no documents upfront + 72-hour deadline" — is a textbook Lagos land scam. No legitimate land seller withholds C of O and survey plan before receiving any payment. Lekki Phase 2 is also heavily litigated with multiple ownership disputes.', red_flags: ['"Owner travelling abroad" is a classic reason to remove in-person verification', 'Documents promised AFTER payment is the core fraud mechanism', '72-hour deadline prevents proper due diligence', 'Price at 51% below market value is implausibly cheap', 'Lekki Phase 2 land ownership disputes are well-documented — many plots have multiple claimants'], safe_next_step: 'Do not pay any deposit. If genuinely interested in Lekki land, engage only Lagos Land Bureau registered surveyors and lawyers. Verify title documents at the Land Registry, Alausa, before any payment. Report this number to EFCC (1-800-CALL-EFCC).' },
    { type: 'scam', title: 'Spectranet Internet Upgrade Offer — Caller Requests OTP', content: 'Caller ID: Spectranet Customer Care. Good afternoon, Ms Okonkwo. Your account has been selected for a free upgrade to Spectranet 5G. To activate, please provide the OTP sent to your registered number 0803XXX.', risk_level: 'low', result_summary: 'This is a SIM swap / account takeover social engineering attempt. Spectranet (or any legitimate ISP) never requests OTP codes over the phone. OTPs are one-time codes that should never be shared — sharing it would allow the caller to take over your Spectranet account, change the password, and potentially access linked payment methods.', red_flags: ['Legitimate ISPs never request OTPs from customers over the phone', '"Free upgrade" is bait to make the call seem beneficial', 'Spectranet does not have a 5G product (as of 2026 — they operate 4G LTE)', 'Call spoofing makes caller ID unreliable'], safe_next_step: 'Hang up immediately. Do NOT share any OTP. If concerned, call Spectranet official line (0700-SPECTRANET) to verify. Change your Spectranet account password via their official website.' },
    { type: 'contract', title: 'Cardinal Stone IT Security Policy Compliance Review', content: 'This Employee Information Security Policy Agreement governs acceptable use of Cardinal Stone Partners IT systems, including Bloomberg Terminal, internal research databases, and client data. Employees may not extract non-public price-sensitive information for personal use. Violations subject to immediate termination and regulatory reporting to SEC Nigeria and NSE.', risk_level: 'low', result_summary: 'This is a standard corporate IT security policy — legitimate and compliant with SEC Nigeria regulations for investment firms. The data handling restrictions are mandatory for regulated firms to comply with insider trading laws. The termination clause is standard industry practice.', red_flags: [], safe_next_step: 'Sign and acknowledge the policy. Key compliance point: Bloomberg Terminal data and company research materials must not be shared externally or used for personal trading positions. Annual re-signing is required — keep a copy of the signed document in your personal records.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'AXA Mansard Comprehensive Motor Insurance — Honda HR-V (₦9.5M value)', amount: 185000, currency: 'NGN', category: 'insurance', region: 'Lagos, Nigeria', result_summary: 'AXA Mansard comprehensive cover at ₦185K/year for HR-V. Covers third party, theft, fire, accidental damage. Cashless garage at CFAO Lagos and Elizade. Claim settlement ratio 91% (2025). Compare with Leadway before renewal in August.', risk_level: 'low', negotiation_script: 'I am renewing my Honda HR-V 2019 comprehensive insurance. Current insured value is ₦9.5M. I have been a no-claim customer for 2 years. Can you offer: (1) a no-claim bonus discount, (2) confirm your cashless garage network includes Lekki Phase 1 area mechanics, and (3) provide the exact claim settlement timeline SLA? I am also comparing with Leadway and will decide by July 31.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'rate_increase', tone: 'professional', context: 'Raising consulting retainer from ₦180K to ₦240K with Tola & Associates after 6 months of delivery', script: `Dear Tola,\n\nThank you for our productive 6 months of partnership. The financial modelling work has directly contributed to two of your clients securing new credit facilities, and Q1 management accounts were delivered 3 days ahead of schedule.\n\nI would like to discuss adjusting our monthly retainer from ₦180,000 to ₦240,000 effective July 1, 2026. This reflects: (1) the expanded scope now covering 4 SME clients vs 2 initially agreed, (2) the Seed fundraising model delivered in March as a complimentary add-on, and (3) inflation of 32% over the past year.\n\nI remain committed to the same quality and turnaround standards.\n\nCould we schedule a 30-minute call this week to discuss?\n\nWarm regards,\nNina Okonkwo\nNino Advisory` },
    { type: 'payment_terms', tone: 'firm', context: 'Following up on overdue invoice NO-2026-003 (₦258,000) with LBS Alumni Network', script: `Dear [LBS Alumni Network Administrator],\n\nThis is a follow-up on Invoice NO-2026-003 for ₦258,000 issued April 30, 2026, with payment due May 14, 2026 — now overdue.\n\nThe Q2 2026 investor briefing report was delivered on April 28 and the Alumni Luncheon presentation was delivered on May 1 as agreed.\n\nPlease arrange payment of ₦258,000 to:\nBank: GTBank (Guaranty Trust Bank)\nAccount Name: Nino Advisory\nAccount Number: 0XXXXXXXXX\n\nIf there is any dispute about the invoice, please contact me within 48 hours. Otherwise, I request payment by May 20, 2026.\n\nThank you,\nNina Okonkwo` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'FIRS Personal Income Tax Return 2025 (Form A)', type: 'tax', due_date: '2026-03-31', amount: null, currency: 'NGN', status: 'overdue', authority: 'Federal Inland Revenue Service (FIRS)', reference_no: 'TIN-2291044887', notes: 'PIT 2025 return was due March 31 2026 — now overdue. Cardinal Stone PAYE covers employment income but consulting income (Nino Advisory) must be self-assessed. Estimated tax owed: ₦185,000. File immediately via FIRS e-Services portal to avoid 10% penalty per quarter.' },
    { title: 'FIRS Withholding Tax Remittance — Q2 2026', type: 'tax', due_date: '2026-07-21', amount: null, currency: 'NGN', status: 'pending', authority: 'Federal Inland Revenue Service (FIRS)', reference_no: 'TIN-2291044887', notes: 'WHT on consulting fees received from clients: 5% WHT on ₦438K Q2 consulting income = ₦21,900. Remit by 21st of month following quarter-end (July 21 for Q2 Apr–Jun). Use FIRS e-Services.' },
    { title: 'CFA Institute Level 1 Exam Registration Confirmation', type: 'renewal', due_date: '2026-08-31', amount: null, currency: 'NGN', status: 'pending', authority: 'CFA Institute (Prometric CBT)', reference_no: 'CFA-2026-DEC-CANDIDATE', notes: 'Exam already registered for December 2026. Confirm testing center (Prometric Lagos, Victoria Island) by August 31. Download Candidate Study Planner and update with current schedule.' },
    { title: 'Honda HR-V Comprehensive Insurance Renewal', type: 'renewal', due_date: '2026-08-31', amount: 185000, currency: 'NGN', status: 'pending', authority: 'AXA Mansard / Leadway Assurance', reference_no: 'LSD-338-NG', notes: 'Comprehensive insurance expires August 31. Get 3 quotes: AXA Mansard (current), Leadway Assurance, Old Mutual. Insured value ₦9.5M. No-claim bonus expected to reduce premium.' },
    { title: 'Lekki Phase 1 Studio Lease Renewal Negotiation', type: 'contract', due_date: '2026-11-01', amount: 1400000, currency: 'NGN', status: 'pending', authority: 'Landlord: Chief Balogun (c/o Lagos Property Management Ltd)', reference_no: 'LEASE-LK1-2024-117', notes: 'Lease expires December 31 2026. Start renewal discussions by November 1 to avoid pressure. Target: renew at ₦1.4M (0% increase) for 1 year given stable occupancy. Explore 1BHK upgrade in same estate at ₦1.8M if available.' },
    { title: 'ICAN ACA Annual Practising Certificate Renewal', type: 'renewal', due_date: '2026-12-31', amount: 35000, currency: 'NGN', status: 'pending', authority: 'Institute of Chartered Accountants of Nigeria (ICAN)', reference_no: 'ICAN-ACA-2022-08714', notes: 'Annual ICAN practising certificate renewal. Required to maintain ACA designation and provide consulting services as Nino Advisory. Pay via ICAN portal (ican.org.ng) before December 31. Late fee applies from January.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Tola & Associates Consulting Agreement — Jan 2026', doc_type: 'contract', original_text: 'CONSULTING AGREEMENT\nConsultant: Nino Advisory (Nina Okonkwo)\nClient: Tola & Associates SME Advisory Ltd\nServices: Monthly financial modelling, management accounts and strategic financial analysis for Client\'s SME portfolio.\nFee: ₦180,000 per month + 7.5% VAT, payable on 1st of following month.\nConfidentiality: All client financial data is strictly confidential.\nTerm: January 1, 2026 – December 31, 2026. Renewable by mutual consent.\nNotice: 30 days written notice to terminate.', summary_md: '## Tola & Associates Consulting Agreement\n\n**What:** Annual consulting contract for Nino Advisory.\n\n**Key terms:**\n- Fee: ₦180,000/month + 7.5% VAT = ₦193,500 total\n- Payment: 1st of following month\n- Termination: 30 days notice\n- Confidentiality: All SME client data is confidential\n\n**Renewal:** Review in November 2026 — request rate increase to ₦240,000/month.', key_points: ['7.5% VAT must be charged and remitted to FIRS', 'Confidentiality clause covers all 4 SME clients under Tola & Associates', '30-day notice protects against sudden cancellation during CFA study period'], red_flags: ['No IP clause — add one at renewal to protect Nino Advisory models and templates'], expires_at: '2026-12-31', notes: 'Rate increase discussion scheduled for June 2026. Add IP clause and increase to ₦240K at renewal.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'FIRS Personal Income Tax Self-Assessment (Consulting Income)', category: 'tax', frequency: 'annual', last_done_at: '2025-03-28', next_due_at: '2026-03-31', is_done: false, applicable: true, notes: 'OVERDUE: 2025 PIT return (consulting income from Nino Advisory). File immediately on FIRS e-Services. Estimated liability ₦185K — penalty accruing at 10% per quarter.' },
    { item: 'FIRS WHT Quarterly Remittance (Consulting Fees)', category: 'tax', frequency: 'quarterly', last_done_at: '2026-04-18', next_due_at: '2026-07-21', is_done: false, applicable: true, notes: 'Clients withhold 5% WHT on consulting fees. Remit and reconcile quarterly via FIRS. Q1 done Apr 18. Q2 due Jul 21.' },
    { item: 'ICAN ACA Annual Practising Certificate', category: 'professional', frequency: 'annual', last_done_at: '2026-01-15', next_due_at: '2026-12-31', is_done: false, applicable: true, notes: 'Paid ₦35K in January via ICAN portal. Next renewal December 2026. Required for Nino Advisory consulting.' },
    { item: 'Cardinal Stone Investment Research Disclosure Policy', category: 'business', frequency: 'annual', last_done_at: '2026-01-20', next_due_at: '2027-01-20', is_done: true, applicable: true, notes: 'Annual sign-off on Cardinal Stone IT security and research disclosure policy. Completed January 2026.' },
    { item: 'Honda HR-V Road Worthiness Certificate (Roadworthiness)', category: 'personal', frequency: 'annual', last_done_at: '2025-08-15', next_due_at: '2026-08-15', is_done: false, applicable: true, notes: 'Lagos State FRSC roadworthiness renewal. Get simultaneously with insurance renewal in August to save a trip.' },
    { item: 'Lekki Phase 1 Estate Service Charge Payment', category: 'personal', frequency: 'annual', last_done_at: '2026-01-10', next_due_at: '2027-01-10', is_done: true, applicable: true, notes: '₦250K estate service charge paid January 2026. Covers security, waste management, estate roads.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  // WAT = UTC+1: 07:00 WAT = T06:00:00Z
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, Nina.** Sunday — church at House on the Rock (8am service). Devotion done. **One financial alert: your FIRS PIT 2025 return is overdue since March 31.** The 10% penalty per quarter has already started. Gather Nino Advisory income receipts (invoices NO-2026-001 and NO-2026-002) and file this week via the FIRS e-Services portal. **Today: church, family call with Enugu, and CFA mock exam review (scored 62% Friday — Fixed Income needs work).**', highlights: [{ label: 'FIRS PIT return — OVERDUE', value: 'March 31 deadline passed — file now', link: '/legal', emoji: '⚠️' }, { label: 'CFA mock score', value: '62% — target 70%+ by Week 14', link: '/habits', emoji: '📖' }, { label: 'LBS invoice outstanding', value: '₦258,000 — NO-2026-003 due May 14', link: '/business', emoji: '🧾' }, { label: 'Dubai planning', value: 'Book flights by July for best rate', link: '/travel', emoji: '🏙️' }] },
    { date: '2026-05-04', content_md: '**Good morning, Nina.** Monday — gym at 5am, devotion done. NSE markets open. **CFA priority this week: Fixed Income chapters 43–47 (duration and convexity).** These were your weakest area in Friday\'s mock. Tola & Associates retainer invoice NO-2026-001 confirmed paid ₦193,500. Spectranet internet bill (₦15,000) is due May 10 — pay via USSD today. **One action: send the FIRS PIT filing appointment request to your tax consultant.**', highlights: [{ label: 'Spectranet bill', value: '₦15,000 due May 10 — pay via USSD', link: '/home', emoji: '🌐' }, { label: 'CFA Fixed Income', value: 'Duration + convexity — weak area focus', link: '/habits', emoji: '📖' }, { label: 'FIRS PIT', value: 'Contact tax consultant today', link: '/legal', emoji: '⚠️' }, { label: 'Tola retainer', value: '₦193,500 received — April invoice prepare', link: '/business', emoji: '✅' }] },
    { date: '2026-05-05', content_md: '**Good morning, Nina.** Tuesday — gym done, running 20 minutes late. NSE Equities Research: Access Bank Q1 results out — beat estimates by 12%. Flag for Cardinal Stone morning briefing. **CFA tonight: Fixed Income session 2 — yield curve shapes and spot rates.** EKEDC bill (₦29,500) due May 10 — set a GTBank transfer for this weekend. **LBS invoice NO-2026-003 (₦258,000) due May 14 — send a polite reminder to the alumni coordinator today.**', highlights: [{ label: 'Access Bank Q1 results', value: 'Beat estimates 12% — flag for CS briefing', link: '/focus', emoji: '📈' }, { label: 'LBS invoice reminder', value: '₦258,000 due May 14 — send today', link: '/business', emoji: '🧾' }, { label: 'EKEDC bill', value: '₦29,500 due May 10 — schedule GTBank', link: '/home', emoji: '💡' }, { label: 'CFA Fixed Income', value: 'Session 2 tonight: yield curves', link: '/habits', emoji: '📖' }] },
    { date: '2026-05-06', content_md: '**Good morning, Nina.** Wednesday — midweek checkpoint. CFA study hours this week: 6/15 target (40%). Push to 10 hrs by Friday. **Daikin AC warranty expires this month — book the annual service today before it lapses.** The service costs ₦25,000 and includes warranty extension quote. FIRS e-Services portal: your TIN is 2291044887 — login and start the PIT 2025 form to verify all consulting income is correct.', highlights: [{ label: 'Daikin warranty expiring', value: 'Book service this week — May 2026', link: '/home', emoji: '❄️' }, { label: 'CFA study pace', value: '6/15 hrs this week — push to 10 by Friday', link: '/habits', emoji: '📖' }, { label: 'FIRS PIT', value: 'Login FIRS portal — verify TIN 2291044887', link: '/legal', emoji: '⚠️' }, { label: 'LBS briefing', value: 'Q2 report delivery confirmed May 1', link: '/business', emoji: '📊' }] },
    { date: '2026-05-07', content_md: '**Good morning, Nina.** Thursday — gym, strong session (personal best on deadlift). Important: **a caller claiming to be Spectranet offered a "free 5G upgrade" and asked for your OTP.** You flagged this — it was a SIM swap attempt. Well handled. Spectranet does not have 5G and never asks for OTPs. Change your Spectranet account password now as a precaution. Tonight: CFA Derivatives session 1 (forwards and futures).', highlights: [{ label: 'Spectranet OTP scam — blocked', value: 'Change Spectranet password now', link: '/protection', emoji: '🛡️' }, { label: 'CFA Derivatives', value: 'Session 1 tonight: forwards + futures', link: '/habits', emoji: '📖' }, { label: 'Apartment savings', value: '₦1.1M → ₦1.22M target (May)', link: '/money', emoji: '🏠' }, { label: 'Dubai flights', value: 'Book Emirates by July — prices rising', link: '/travel', emoji: '🏙️' }] },
    { date: '2026-05-08', content_md: '**Good morning, Nina.** Friday — end of work week. CFA study recap: 14/15 hours target met this week (Fixed Income + Derivatives). **Great momentum.** Cardinal Stone: submit the West Africa Banking Sector research note for partner review before EOD. Weekend plan: Sunday church + parents video call + CFA mock exam (mock 2 of 4). **Bills to pay this weekend: EKEDC ₦29,500 (due May 10), Spectranet ₦15,000 (due May 10).**', highlights: [{ label: 'CFA Week 3 pace', value: '14/15 hrs — excellent', link: '/habits', emoji: '📖' }, { label: 'Bills due Monday', value: 'EKEDC ₦29.5K + Spectranet ₦15K — pay this weekend', link: '/home', emoji: '💡' }, { label: 'CS research note', value: 'West Africa Banking — submit today', link: '/focus', emoji: '📊' }, { label: 'CFA mock 2', value: 'Sunday — target 67%+ (improve 5pp)', link: '/habits', emoji: '📝' }] },
    { date: '2026-05-09', content_md: '**Good morning, Nina.** Saturday — rest day (no gym). Three bills due Monday: **pay EKEDC (₦29,500) and Spectranet (₦15,000) via GTBank app now.** MTN postpaid (₦12,500) due May 25 — no rush. LBS invoice NO-2026-003 (₦258,000): you sent the reminder Thursday — expect payment by May 14. **Tomorrow: CFA mock exam 2. Review Fixed Income notes tonight for 1 hour before bed.** Call Enugu after church.', highlights: [{ label: 'Pay EKEDC + Spectranet now', value: '₦29.5K + ₦15K — due Monday', link: '/home', emoji: '💡' }, { label: 'LBS payment expected', value: '₦258,000 — watch for May 14', link: '/business', emoji: '🧾' }, { label: 'CFA mock 2 tomorrow', value: 'Review Fixed Income tonight', link: '/habits', emoji: '📖' }, { label: 'FIRS PIT — urgent', value: 'File this week — penalty growing', link: '/legal', emoji: '⚠️' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T06:00:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Nina Okonkwo uid: ${UID}`)
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
