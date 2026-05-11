/**
 * Full seed for Sarah Johnson — ICU Registered Nurse in Cedar Park TX (Austin).
 * Run: node tests/e2e-personas/seed-sarah-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '071ddf35-3dfe-4c1a-af54-ea6d1d29ece1'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

// offset 0 = 2026-04-19 (Sun=0)
function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Sarah Johnson', occupation: 'Registered Nurse (ICU)', life_stage: 'mid_career',
    country: 'US', currency: 'USD', timezone: 'America/Chicago', preferred_language: 'en',
    goals: [
      'Become ICU Charge Nurse or Nurse Manager at St. David\'s by 2028',
      'Complete 10K race by end of 2026',
      'Pay off Honda Odyssey loan by January 2027',
      'Build college fund to $150K combined for Maya and Jack by 2028',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Sarah Johnson (ICU RN, Cedar Park TX)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: '$8,200/month avg — $6,500 base salary + ~$1,700 night differential and overtime (3×12hr shifts/week)' },
    { type: 'fact',         key: 'home_location',          value: '3BR/2BA owned home, Cedar Park TX 78613 — purchased 2019 at $285K, mortgage $1,650/month with 13 years remaining' },
    { type: 'fact',         key: 'vehicle',                value: '2022 Honda Odyssey EX-L (family minivan) — $845/month payment, loan ends Jan 2027; Tom drives 2020 Ford F-150' },
    { type: 'fact',         key: 'employer',               value: 'St. David\'s Medical Center HealthCare — ICU (Level II Trauma), Cedar Park TX; 10 years; union member' },
    { type: 'fact',         key: 'work_schedule',          value: '3×12hr shifts/week rotating Tue/Wed/Thu — sometimes nights (7pm–7am) and sometimes days (7am–7pm)' },
    { type: 'fact',         key: 'certifications',         value: 'BSN — University of Texas Austin 2008; CCRN (Critical Care RN) expires Feb 2027; BLS/ACLS current until Jun 2027' },
    { type: 'preference',   key: 'work_style',             value: 'Early morning 5–7am focus before kids wake; paper planner + Notion; systematic protocols and checklists; strong clinical instincts' },
    { type: 'preference',   key: 'diet',                   value: 'Whole-food family cooking; Sunday meal prep for the week; Tom grills 3×/week; avoids processed food; occasional H-E-B meal kits for busy shift weeks' },
    { type: 'preference',   key: 'communication_style',    value: 'Direct and empathetic; strong patient advocate; data-driven clinical decisions; dislikes vague instructions' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Nursing CE articles (AACN journals, Critical Care Nurse) on Kindle; fiction audiobooks (crime/thriller) during commute prep' },
    { type: 'goal',         key: 'career_goal',            value: 'Charge Nurse or Nurse Manager at St. David\'s ICU by 2028 — currently completing leadership modules' },
    { type: 'goal',         key: 'financial_goal',         value: 'College fund: $120K already saved across 529 plans for Maya and Jack — target $150K by 2028 (Fidelity 529)' },
    { type: 'goal',         key: 'fitness_goal',           value: 'Complete a 10K race in 2026 — currently averaging 5K walks/jogs 4×/week. Target: Austin Turkey Trot Nov 2026' },
    { type: 'concern',      key: 'unit_staffing',          value: '3 ICU colleagues left for travel nursing in 2025; unit chronically short-staffed; personal burnout risk increasing' },
    { type: 'relationship', key: 'family',                 value: 'Tom Johnson (husband, T&J Construction LLC, birthday Nov 22, married Aug 15 2006); Maya (14, HS freshman, volleyball); Jack (12, 7th grade, soccer)' },
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
    { name: 'Morning Walk 30 min',          icon: '🚶', color: 'emerald', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '05:15', completedOffsets: [0,1,2,3,5,6,7,8,9,11,12,13,14,15,17,18,19,20] },
    { name: 'Take Vitamins + Meds',          icon: '💊', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Read Nursing CE Article 20 min',icon: '📖', color: 'indigo',  frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '20:30', completedOffsets: [1,2,4,5,8,9,11,12,15,16,17,19] },
    { name: 'Drink 64oz Water',              icon: '💧', color: 'amber',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Family Meal Prep (Weekend)',    icon: '🍱', color: 'rose',    frequency: 'weekends', days_of_week: [0,6],           reminder_time: '10:00', completedOffsets: [0,6,7,13,14,20] },
    { name: 'Date Night with Tom (Fri)',     icon: '🍷', color: 'violet',  frequency: 'custom',   days_of_week: [5],             reminder_time: '17:00', completedOffsets: [5,12] },
    { name: '10,000 Steps Daily',            icon: '👟', color: 'purple',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20] },
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
    user_id: UID, preferred_mode: 'pomodoro', session_length: 50, break_length: 10,
    daily_goal: 2, ambient_sound: 'brown_noise', notifications_blocked: true,
  }, { onConflict: 'user_id' })

  // CDT = UTC-5: 05:30 CDT = T10:30:00Z, 06:00 CDT = T11:00:00Z, 07:00 CDT = T12:00:00Z
  const sessions = [
    { off: 0,  mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'CCRN study — hemodynamic monitoring Chapter 7',            time: '10:30' },
    { off: 1,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'Cedar Valley invoice draft + consulting hours log',        time: '11:00' },
    { off: 2,  mode: 'quick',    plan: 25,  act: 20,  done: true,  title: 'Pre-shift prep — reviewed 2 high-acuity patient files',    time: '10:30' },
    { off: 3,  mode: 'quick',    plan: 25,  act: 25,  done: true,  title: 'Pre-shift: new sepsis bundle protocol review',             time: '10:30' },
    { off: 4,  mode: 'quick',    plan: 15,  act: 10,  done: true,  title: 'Pre-shift: CRRT circuit troubleshooting refresher',        time: '10:30' },
    { off: 5,  mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'Florida Keys vacation research — resorts and activities',  time: '11:00' },
    { off: 6,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Household budget April review + college fund update',      time: '12:00' },
    { off: 7,  mode: 'pomodoro', plan: 100, act: 97,  done: true,  title: 'CCRN practice exam — scored 79% on 60-question set',       time: '10:30' },
    { off: 8,  mode: 'deep',     plan: 90,  act: 92,  done: true,  title: 'Nurse manager application research + leadership journal',  time: '11:00' },
    { off: 9,  mode: 'quick',    plan: 15,  act: 12,  done: true,  title: 'Pre-shift: updated vasopressor dosing protocol notes',     time: '10:30' },
    { off: 11, mode: 'quick',    plan: 25,  act: 20,  done: true,  title: 'Tom\'s LLC Q1 financials review + insurance docs',          time: '10:30' },
    { off: 12, mode: 'deep',     plan: 75,  act: 70,  done: true,  title: 'Maya 529 plan research — Vanguard vs Fidelity comparison', time: '11:00' },
    { off: 13, mode: 'pomodoro', plan: 50,  act: 50,  done: true,  title: 'April budget reconciliation + pending utility bills',      time: '12:00' },
    { off: 14, mode: 'deep',     plan: 90,  act: 87,  done: true,  title: 'CCRN study — ventilator management and weaning protocols', time: '10:30' },
    { off: 15, mode: 'deep',     plan: 75,  act: 72,  done: true,  title: 'Cedar Valley contract review + rate negotiation prep',     time: '11:00' },
    { off: 16, mode: 'quick',    plan: 15,  act: 8,   done: false, title: 'Pre-shift prep (interrupted — early call-in)',             time: '10:30', abandoned: true },
    { off: 17, mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'Pre-shift: vasopressor and sedation protocols refresher',  time: '10:30' },
    { off: 18, mode: 'quick',    plan: 20,  act: 20,  done: true,  title: 'Pre-shift: reviewed complex ventilator weaning case',      time: '10:30' },
    { off: 19, mode: 'pomodoro', plan: 75,  act: 73,  done: true,  title: 'Jack soccer camp schedule + Disney World dates research',  time: '11:00' },
    { off: 20, mode: 'deep',     plan: 50,  act: 48,  done: true,  title: 'Annual household financial review + 2026 savings target',  time: '12:00' },
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
      question: 'Should I transfer to the Step-Down Unit (SDU) to reduce stress, even with a $8,000/year pay cut?',
      category: 'career', mode: 'compare', options: ['Transfer to Step-Down Unit', 'Stay in ICU'],
      created_at: '2026-04-21T11:00:00Z', favorite: true,
      result: {
        question: 'ICU vs Step-Down Unit (SDU) transfer',
        factors: ['Compensation', 'Stress level', 'Career growth', 'Skill maintenance', 'Family time'],
        options: [
          { label: 'Transfer to Step-Down Unit', scores: { Compensation: 55, 'Stress level': 80, 'Career growth': 60, 'Skill maintenance': 55, 'Family time': 85 },
            pros: ['Significantly lower acuity — fewer life-or-death decisions daily', 'Predictable scheduling — easier to manage Maya and Jack\'s activities', 'Lower risk of chronic burnout'],
            cons: ['$8,000/year salary reduction at a bad time (Odyssey loan + college fund goal)', 'CCRN specialty credential loses value outside ICU', 'May feel professionally underutilised after 10 years in critical care'],
            summary: 'Lower stress, more family time, but significant financial and professional cost.' },
          { label: 'Stay in ICU', scores: { Compensation: 85, 'Stress level': 30, 'Career growth': 80, 'Skill maintenance': 90, 'Family time': 55 },
            pros: ['Keeps CCRN value and ICU career trajectory intact', 'Charge Nurse/Manager path is only realistic from ICU role', 'Retains $8K/year and maintains college fund momentum'],
            cons: ['Staffing crisis driving burnout — 3 colleagues already left', 'Night shifts conflict with kids\' school events regularly', 'Risk of compassion fatigue increasing'],
            summary: 'Higher pay and career path, but burnout risk is real and growing.' },
        ],
        recommendation: 'Stay in ICU for now — but set a condition: if unit staffing does not improve by Q4 2026, revisit SDU transfer in January 2027. Pursue Charge Nurse application in October as a retention lever.',
        winner: 'Stay in ICU',
      },
    },
    {
      question: 'Round Rock Regional Hospital offered an $8,000 sign-on bonus with a 2-year commitment. Should I take it?',
      category: 'career', mode: 'analyze', options: [], created_at: '2026-04-28T11:00:00Z', favorite: false,
      result: {
        summary: 'The $8,000 sign-on bonus is attractive but comes with a 2-year lock-in at a hospital without St. David\'s ICU\'s Level II trauma designation. At St. David\'s, Charge Nurse candidacy is visible for October — that promotion would add $12,000–18,000/year permanently, dwarfing the one-time bonus.',
        recommendation: 'Decline the Round Rock offer. The sign-on bonus is less valuable than the Charge Nurse promotion path at St. David\'s. If no progress on promotion by December 2026, reassess.',
        confidenceScore: 78, riskScore: 32, riskLevel: 'low',
        financialImpact: { summary: '$8K one-time vs $12–18K/year raise potential. Long-term, St. David\'s path wins.', monthlyCostChange: 0, oneTimeCost: 0, opportunityCost: '$8,000 sign-on bonus foregone', affordabilityScore: 90 },
        pros: ['Keeps promotion track at St. David\'s', 'Avoids commute increase (Round Rock is 20 min further from Cedar Park)', 'No lock-in period reduces flexibility'],
        cons: ['Foregoes $8K that could accelerate college fund by 6 months', 'No guarantee of Charge Nurse promotion timeline'],
        nextSteps: ['Schedule leadership conversation with ICU manager in June', 'Complete 2 leadership development modules by September', 'Formally apply for Charge Nurse position if posted in October 2026'],
        memoryFactorsUsed: ['Goal: Charge Nurse/Manager by 2028', 'Financial goal: $150K college fund by 2028'],
        dataSourcesUsed: ['Texas ICU RN compensation benchmarks 2026', 'BLS nursing career progression data'],
      },
    },
    {
      question: 'Maya\'s college fund: 529 plan (Vanguard) vs taxable brokerage account — which is better for our situation?',
      category: 'family', mode: 'compare', options: ['Vanguard 529 Plan', 'Taxable Brokerage (Fidelity)'],
      created_at: '2026-05-01T12:00:00Z', favorite: false,
      result: {
        question: 'Maya college savings: 529 vs taxable brokerage',
        factors: ['Tax efficiency', 'Flexibility', 'Investment returns', 'Financial aid impact', 'Control'],
        options: [
          { label: 'Vanguard 529 Plan', scores: { 'Tax efficiency': 90, Flexibility: 55, 'Investment returns': 75, 'Financial aid impact': 60, Control: 65 },
            pros: ['Texas has no state income tax deduction but federal growth is tax-free', 'Qualified withdrawals tax-free for tuition, room & board, books', 'Can change beneficiary to Jack if Maya gets scholarship'],
            cons: ['10% penalty + income tax on non-qualified withdrawals', 'Investment options limited to plan\'s fund lineup'],
            summary: 'Optimised for education spending, tax-efficient, some flexibility restrictions.' },
          { label: 'Taxable Brokerage (Fidelity)', scores: { 'Tax efficiency': 50, Flexibility: 90, 'Investment returns': 80, 'Financial aid impact': 70, Control: 90 },
            pros: ['Full flexibility — funds accessible for any purpose without penalty', 'Broader investment options including ETFs and individual stocks'],
            cons: ['Capital gains tax owed on growth', 'Counts more heavily against financial aid (5.64% vs 5.64% for 529 — similar actually)'],
            summary: 'More flexible but less tax-efficient for pure education savings.' },
        ],
        recommendation: 'Keep and maximise the existing Vanguard 529 for Maya (4 years to college). Add Fidelity brokerage only if 529 is maxed. For Jack, open a new 529 now — 6 years of compounding is significant.',
        winner: 'Vanguard 529 Plan',
      },
    },
    {
      question: 'Is renewing my CCRN certification worth the $395 exam fee and study time, or should I let it lapse?',
      category: 'education', mode: 'analyze', options: [], created_at: '2026-05-05T11:30:00Z', favorite: false,
      result: {
        summary: 'CCRN renewal requires either $395 exam or 432 CE hours (ongoing). As a 10-year ICU nurse targeting Charge Nurse role, the CCRN is a non-negotiable credential. Hospital hiring data shows CCRN holders earn $3–6/hour more and are strongly preferred for leadership roles. Letting it lapse would be a significant career setback.',
        recommendation: 'Renew via exam (not CE hours). $395 investment vs $6K+/year salary differential from credential. Schedule the exam for January 2027 — gives 8 months of study time.',
        confidenceScore: 92, riskScore: 12, riskLevel: 'low',
        financialImpact: { summary: '$395 exam fee. CCRN premium: $3–6/hr extra = $6K–12K/year at 40hrs/week equivalent.', monthlyCostChange: 0, oneTimeCost: 395, opportunityCost: '20 hours study time over 8 months', affordabilityScore: 96 },
        pros: ['CCRN required for Charge Nurse applications at most Texas hospitals', 'Peer recognition and patient safety credential', 'Study reinforces clinical knowledge — professional development'],
        cons: ['$395 exam fee and study time during busy period'],
        nextSteps: ['Register for CCRN exam January 2027 by August 2026', 'Start practice question bank on AACN website in September', 'Complete 2 mock exams in November/December'],
        memoryFactorsUsed: ['Goal: Charge Nurse/Manager by 2028', 'Certification: CCRN expires Feb 2027'],
        dataSourcesUsed: ['AACN CCRN renewal guidelines 2026', 'Texas ICU nursing salary benchmarks'],
      },
    },
    {
      question: 'Summer 2026 family vacation: Florida Keys or Outer Banks NC — which works better for our family of 4?',
      category: 'family', mode: 'compare', options: ['Florida Keys', 'Outer Banks, North Carolina'],
      created_at: '2026-05-07T12:00:00Z', favorite: true,
      result: {
        question: 'Florida Keys vs Outer Banks NC for summer family vacation',
        factors: ['Budget', 'Activities for kids', 'Travel time', 'Beach quality', 'Unique experiences'],
        options: [
          { label: 'Florida Keys', scores: { Budget: 55, 'Activities for kids': 85, 'Travel time': 70, 'Beach quality': 80, 'Unique experiences': 90 },
            pros: ['Snorkeling, glass-bottom boat tours — unique to Keys', 'Key West is culturally rich — Maya and Jack will love the quirkiness', 'Drive-able from Cedar Park (12hr) or fly to Miami + drive 2hrs'],
            cons: ['More expensive — Keys resorts run $350–500/night', 'July heat + humidity is intense', 'Hurricane season risk (low probability but real)'],
            summary: 'More memorable and experientially unique but higher budget.' },
          { label: 'Outer Banks, North Carolina', scores: { Budget: 80, 'Activities for kids': 75, 'Travel time': 40, 'Beach quality': 85, 'Unique experiences': 65 },
            pros: ['Rental homes cheaper than Florida resorts — $2,500/week for 4BR beach house', 'Cape Hatteras National Seashore — natural and unspoiled'],
            cons: ['16+ hours drive or expensive flight from Austin', 'Less exotic for a family that has done East Coast before'],
            summary: 'Better value but longer travel distance from Texas.' },
        ],
        recommendation: 'Choose Florida Keys. The drive-or-fly flexibility, snorkeling, and Key West experiences are more memorable for Maya (14) and Jack (12) at this age. Budget $4,500 — fly into Miami and rent a car.',
        winner: 'Florida Keys',
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
  const cv = await ins('business_clients', {
    user_id: UID, name: 'Cedar Valley Senior Living', company: 'Cedar Valley Senior Living LLC',
    email: 'admin@cedarvalleysl.com', phone: '+15122667800', address: '1204 Pecan St, Pflugerville TX 78660', currency: 'USD',
    notes: 'Assisted living facility — contracts Sarah for relief RN shifts on Saturdays, $40/hr, typically 8–12hrs/shift.',
  }, 'client: Cedar Valley Senior Living')
  const acw = await ins('business_clients', {
    user_id: UID, name: 'Austin Corporate Wellness', company: 'Austin Corporate Wellness LLC',
    email: 'events@acwellness.com', phone: '+15128831200', address: '300 W 6th St Suite 1500, Austin TX 78701', currency: 'USD',
    notes: 'Workplace health screening events — biometrics, BP checks, flu shots. Project basis, $40/hr.',
  }, 'client: Austin Corporate Wellness')
  if (!cv || !acw) return

  const projCV = await ins('business_projects', {
    user_id: UID, client_id: cv.id, name: 'Cedar Valley Relief RN — Apr–Jun 2026',
    status: 'active', start_date: '2026-04-01', end_date: '2026-06-30',
    fee: 40, currency: 'USD', notes: 'Relief shift coverage Saturdays. Hourly rate $40, invoiced monthly.',
  }, 'project: Cedar Valley relief shifts')
  const projACW = await ins('business_projects', {
    user_id: UID, client_id: acw.id, name: 'Dell Technologies Health Fair — Jun 2026',
    status: 'active', start_date: '2026-06-10', end_date: '2026-06-10',
    fee: 40, currency: 'USD', notes: '8-hour event, biometrics screening station.',
  }, 'project: Dell health fair')

  if (projCV) {
    await ins('business_invoices', {
      user_id: UID, client_id: cv.id, project_id: projCV.id,
      invoice_no: 'SJ-2026-001', issued_at: '2026-04-30', due_at: '2026-05-14',
      items: [{ description: 'Relief RN shifts April 2026 — 17 hours @ $40/hr', qty: 17, rate: 40, amount: 680 }],
      subtotal: 680, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 680, currency: 'USD', status: 'paid', paid_at: '2026-05-10',
    }, 'invoice: SJ-2026-001 (paid)')
    await ins('business_invoices', {
      user_id: UID, client_id: cv.id, project_id: projCV.id,
      invoice_no: 'SJ-2026-003', issued_at: '2026-05-09', due_at: '2026-05-23',
      items: [{ description: 'Relief RN shifts May 2026 (partial) — 12 hours @ $40/hr', qty: 12, rate: 40, amount: 480 }],
      subtotal: 480, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 480, currency: 'USD', status: 'draft',
    }, 'invoice: SJ-2026-003 (draft)')
  }
  if (projACW) {
    await ins('business_invoices', {
      user_id: UID, client_id: acw.id, project_id: projACW.id,
      invoice_no: 'SJ-2026-002', issued_at: '2026-04-15', due_at: '2026-04-30',
      items: [{ description: 'Workplace wellness screening — 8 hours @ $40/hr', qty: 8, rate: 40, amount: 320 }],
      subtotal: 320, tax_pct: 0, tax_amt: 0, discount_amt: 0, total: 320, currency: 'USD', status: 'sent',
    }, 'invoice: SJ-2026-002 (sent)')
  }

  const expenses = [
    { category: 'equipment', vendor: 'Dansko', amount: 149, occurred_at: '2026-03-10', description: 'Dansko XP 2.0 professional nursing clogs — required ICU footwear' },
    { category: 'education', vendor: 'AACN', amount: 75, occurred_at: '2026-04-01', description: 'AACN membership annual renewal — includes CE access' },
    { category: 'supplies', vendor: 'Amazon', amount: 88, occurred_at: '2026-02-20', description: 'CCRN exam prep book (Barron\'s) + practice question flashcards' },
    { category: 'equipment', vendor: 'Figs', amount: 112, occurred_at: '2026-01-15', description: '2 sets nursing scrubs (Catarina) for ICU rotation' },
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
  const odyssey = await ins('home_assets', { user_id: UID, name: '2022 Honda Odyssey EX-L', type: 'vehicle', brand: 'Honda', model: 'Odyssey EX-L', purchased_at: '2022-01-15', warranty_until: '2027-01-15', cost: 45000, notes: 'Family minivan, loan ends Jan 2027. VIN 5FNRL6H78NB002341.' }, 'asset: Honda Odyssey')
  const wd = await ins('home_assets', { user_id: UID, name: 'Maytag Washer + Dryer Set', type: 'appliance', brand: 'Maytag', model: 'MVW6200KW + MED6200KW', purchased_at: '2021-07-20', warranty_until: '2024-07-20', cost: 1800, notes: 'Front-load set, laundry room off kitchen.' }, 'asset: Maytag W/D')
  const fridge = await ins('home_assets', { user_id: UID, name: 'LG Smart French Door Refrigerator', type: 'appliance', brand: 'LG', model: 'LRMVS3006S', purchased_at: '2020-05-10', warranty_until: '2025-05-10', cost: 1200, notes: 'Kitchen — InstaView door-in-door. Ice maker maintenance overdue.' }, 'asset: LG Fridge')
  const tv = await ins('home_assets', { user_id: UID, name: 'Samsung 65" 4K Smart TV (QLED)', type: 'electronics', brand: 'Samsung', model: 'QN65Q80CAFXZA', purchased_at: '2022-11-25', warranty_until: '2024-11-25', cost: 1100, notes: 'Living room — kids use for gaming and streaming.' }, 'asset: Samsung TV')
  const ring = await ins('home_assets', { user_id: UID, name: 'Ring Video Doorbell + Alarm System', type: 'electronics', brand: 'Ring', model: 'Video Doorbell Pro 2 + Alarm 5-piece', purchased_at: '2021-04-12', warranty_until: '2023-04-12', cost: 380, notes: 'Security — Ring Protect Plus plan $20/month.' }, 'asset: Ring Security')

  if (odyssey) {
    await ins('home_maintenance', { user_id: UID, asset_id: odyssey.id, title: 'Honda Odyssey Oil Change (5K miles)', category: 'service', recurrence_months: 4, last_done_at: '2026-03-01', next_due_at: '2026-07-01', vendor: 'Honda of Cedar Park', cost: 89, is_active: true }, 'maint: Odyssey oil change')
    await ins('home_maintenance', { user_id: UID, asset_id: odyssey.id, title: 'Tire Rotation + Brake Inspection', category: 'service', recurrence_months: 6, last_done_at: '2025-11-15', next_due_at: '2026-05-15', vendor: 'Discount Tire Cedar Park', cost: 65, is_active: true }, 'maint: Odyssey tires')
  }
  if (fridge) await ins('home_maintenance', { user_id: UID, asset_id: fridge.id, title: 'Refrigerator Filter Replacement', category: 'service', recurrence_months: 6, last_done_at: '2025-11-01', next_due_at: '2026-05-01', vendor: null, cost: 35, is_active: true, notes: 'LG LT1000P filter — order from Amazon' }, 'maint: Fridge filter')
  await ins('home_maintenance', { user_id: UID, asset_id: null, title: 'HVAC Annual Service (Summer prep)', category: 'service', recurrence_months: 12, last_done_at: '2025-05-20', next_due_at: '2026-05-20', vendor: 'Service Experts Cedar Park', cost: 189, is_active: true, notes: 'Critical before Texas summer. AC filter changed monthly ($12 each).' }, 'maint: HVAC service')

  const bills = [
    { utility: 'electricity', provider: 'Oncor / Reliant Energy', amount: 178, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'REL-1002883421' },
    { utility: 'electricity', provider: 'Oncor / Reliant Energy', amount: 165, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'REL-1002883421' },
    { utility: 'electricity', provider: 'Oncor / Reliant Energy', amount: 195, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'REL-1002883421' },
    { utility: 'water', provider: 'City of Cedar Park Water', amount: 82, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'CP-WTR-44812' },
    { utility: 'water', provider: 'City of Cedar Park Water', amount: 79, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'CP-WTR-44812' },
    { utility: 'water', provider: 'City of Cedar Park Water', amount: 88, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'CP-WTR-44812' },
    { utility: 'internet', provider: 'AT&T Fiber 1Gig', amount: 75, bill_date: '2026-03-05', due_date: '2026-03-15', is_paid: true, account_no: 'ATT-FBR-002198773' },
    { utility: 'internet', provider: 'AT&T Fiber 1Gig', amount: 75, bill_date: '2026-04-05', due_date: '2026-04-15', is_paid: true, account_no: 'ATT-FBR-002198773' },
    { utility: 'internet', provider: 'AT&T Fiber 1Gig', amount: 75, bill_date: '2026-05-05', due_date: '2026-05-15', is_paid: false, account_no: 'ATT-FBR-002198773' },
    { utility: 'phone', provider: 'T-Mobile Magenta Max (4 lines)', amount: 160, bill_date: '2026-03-10', due_date: '2026-03-10', is_paid: true, account_no: 'TMO-4L-88832910' },
    { utility: 'phone', provider: 'T-Mobile Magenta Max (4 lines)', amount: 160, bill_date: '2026-04-10', due_date: '2026-04-10', is_paid: true, account_no: 'TMO-4L-88832910' },
    { utility: 'phone', provider: 'T-Mobile Magenta Max (4 lines)', amount: 160, bill_date: '2026-05-10', due_date: '2026-05-10', is_paid: false, account_no: 'TMO-4L-88832910' },
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
  const keys = await ins('trips', { user_id: UID, destination: 'Florida Keys, FL', start_date: '2026-07-04', end_date: '2026-07-08', status: 'planning', budget_total: 4500, currency: 'USD', travellers: 4, notes: 'Family summer vacation — Sarah, Tom, Maya (14), Jack (12). Independence Day week.', cover_emoji: '🌊' }, 'trip: Florida Keys')
  if (keys) {
    const items = [
      { type: 'flight', title: 'American Airlines AUS → MIA (outbound)', starts_at: '2026-07-04T08:00:00-05:00', location: 'Austin-Bergstrom International Airport', cost: 1480, order_index: 1, notes: '4 tickets × $370' },
      { type: 'activity', title: 'Drive MIA → Key West (3.5hr Overseas Hwy)', starts_at: '2026-07-04T14:00:00-04:00', location: 'Miami International Airport', cost: 120, order_index: 2, notes: 'Enterprise rental car 5 days' },
      { type: 'hotel', title: 'Parrot Key Hotel & Villas — Key West', starts_at: '2026-07-04T18:00:00-04:00', ends_at: '2026-07-08T11:00:00-04:00', location: 'Key West, FL 33040', cost: 1650, booking_ref: null, order_index: 3, notes: '4 nights, 2-BR suite, pool + private marina' },
      { type: 'activity', title: 'Key West Snorkel & Glass-Bottom Boat Tour', starts_at: '2026-07-05T09:00:00-04:00', location: 'Mallory Square Dock, Key West', cost: 220, order_index: 4, notes: '4 × $55 — kids will love it' },
      { type: 'activity', title: 'Dolphin Research Center — Grassy Key', starts_at: '2026-07-06T10:00:00-04:00', location: 'Grassy Key, FL', cost: 120, order_index: 5, notes: '4 × $30 admission' },
      { type: 'flight', title: 'American Airlines MIA → AUS (return)', starts_at: '2026-07-08T17:00:00-04:00', location: 'Miami International Airport', cost: 1380, order_index: 6, notes: '4 tickets × $345' },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: keys.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Passports / US IDs', category: 'documents', qty: 4, is_packed: false },
      { item: 'Sunscreen SPF 50+ (4 bottles)', category: 'health', qty: 4, is_packed: false },
      { item: 'Snorkeling masks + fins (kids)', category: 'gear', qty: 2, is_packed: false },
      { item: 'Swimwear (2 sets each)', category: 'clothing', qty: 8, is_packed: false },
      { item: 'Insect repellent (DEET)', category: 'health', qty: 2, is_packed: false },
      { item: 'Maya\'s volleyball sandals', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Jack\'s rash guard', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Portable first aid kit (nurse kit)', category: 'health', qty: 1, is_packed: false },
      { item: 'Waterproof phone pouch', category: 'electronics', qty: 2, is_packed: false },
      { item: 'Cash $300 for incidentals', category: 'documents', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: keys.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Florida Keys: ${iOk} items, ${pOk} packing`)
  }

  const satx = await ins('trips', { user_id: UID, destination: 'San Antonio, TX', start_date: '2026-04-05', end_date: '2026-04-05', status: 'completed', budget_total: 450, currency: 'USD', travellers: 4, notes: 'Day trip — River Walk lunch + SeaWorld splash zone for Jack.', cover_emoji: '🌉' }, 'trip: San Antonio day trip')
  if (satx) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: satx.id, type: 'activity', title: 'San Antonio River Walk lunch', starts_at: '2026-04-05T12:00:00-05:00', location: 'River Walk, San Antonio TX', cost: 120, is_done: true, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: satx.id, type: 'activity', title: 'SeaWorld San Antonio (half-day)', starts_at: '2026-04-05T14:00:00-05:00', location: 'SeaWorld, San Antonio TX', cost: 240, is_done: true, order_index: 2 })
  }

  const disney = await ins('trips', { user_id: UID, destination: 'Walt Disney World, Orlando FL', start_date: '2026-12-27', end_date: '2026-12-31', status: 'planning', budget_total: 9500, currency: 'USD', travellers: 4, notes: 'Holiday tradition. Magic Kingdom + EPCOT + Hollywood Studios. Flying Southwest.', cover_emoji: '🏰' }, 'trip: Disney World')
  if (disney) {
    const items = [
      { type: 'flight', title: 'Southwest AUS → MCO (outbound, 4 tickets)', starts_at: '2026-12-27T07:00:00-06:00', location: 'Austin-Bergstrom International Airport', cost: 1600, order_index: 1 },
      { type: 'hotel', title: 'Disney\'s Art of Animation Resort (5 nights)', starts_at: '2026-12-27T15:00:00-05:00', ends_at: '2026-12-31T11:00:00-05:00', location: 'Walt Disney World, Orlando FL', cost: 4500, order_index: 2, notes: 'Little Mermaid family suite — kids chose it' },
      { type: 'activity', title: 'Walt Disney World 4-Day Park Hopper Passes (×4)', starts_at: '2026-12-28T09:00:00-05:00', location: 'Walt Disney World Resort', cost: 2200, order_index: 3 },
      { type: 'flight', title: 'Southwest MCO → AUS (return, 4 tickets)', starts_at: '2026-12-31T18:00:00-05:00', location: 'Orlando International Airport', cost: 1400, order_index: 4 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: disney.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Disney World: ${iOk} items`)
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'Medicare "Rebate Check" Phone Scam', content: 'This is Medicare calling. You are owed a $340 rebate check from unused benefits. To claim your check, please confirm your Medicare number and bank routing number.', risk_level: 'high', result_summary: 'Classic Medicare impersonation scam. Medicare never calls unsolicited requesting your Medicare number. These calls are run by fraud rings targeting healthcare workers and seniors who may be more familiar with Medicare.', red_flags: ['Unsolicited phone call requesting Medicare ID number', 'Asking for bank routing number — Medicare never does this', 'Artificial urgency around "unclaimed rebate"'], safe_next_step: 'Hang up immediately. Report to 1-800-MEDICARE and the FTC at reportfraud.ftc.gov. Block the caller.' },
    { type: 'scam', title: 'Fake Travel Nursing Agency — MedStaff Elite', content: 'Hi Sarah, MedStaff Elite has reviewed your credentials and is offering a travel nursing contract in Hawaii at $78/hr + $3,500/week tax-free stipend. Pay a $250 credential verification fee to process your assignment.', risk_level: 'high', result_summary: 'Fraudulent travel nursing agency. Legitimate travel nursing agencies NEVER charge registration or credential verification fees. The $78/hr + $3,500/week stipend combination is $350+/hr all-in — 4× the realistic market rate for ICU travel nurses.', red_flags: ['$250 upfront fee — legitimate agencies don\'t charge nurses fees', 'Hawaii contract rate is 4× market (real rates: $50–65/hr + housing stipend)', 'No JCAHO or NCQA accreditation mentioned', 'Generic email domain not matching any real agency'], safe_next_step: 'Do not pay. Verify any travel agency at NATHO.org (National Association of Travel Healthcare Organizations). Report to state nursing board if they have your license number.' },
    { type: 'contract', title: 'Cedar Valley Relief Contract — Non-Compete Clause', content: 'The Contractor agrees not to provide nursing services to any assisted living, skilled nursing, or long-term care facility within a 15-mile radius of Cedar Valley Senior Living for a period of 12 months following termination of this agreement.', risk_level: 'medium', result_summary: 'The 15-mile, 12-month non-compete in the Cedar Park/Austin area is broadly written and could cover many facilities Sarah might want to contract with in the future. Texas courts do enforce non-competes if reasonable in scope.', red_flags: ['15-mile radius covers most of Cedar Park, Pflugerville, and parts of Austin — very broad', '12 months is on the longer end for part-time per-diem work', 'No carve-out for your primary employer (St. David\'s)'], safe_next_step: 'Request scope reduction: 5-mile radius, 6-month term, with explicit carve-out for your primary hospital employer. Get any modification in writing before signing.' },
    { type: 'quote', title: 'Allstate Home + Auto Bundle Quote', content: 'Allstate Home + Auto bundle for Cedar Park TX home and 2022 Honda Odyssey: Home (HO-3): $1,840/year. Auto (full coverage, $500 deductible): $1,620/year. Bundle discount: 15%. Total: $2,941/year.', risk_level: 'low', result_summary: 'Competitive bundle quote for Cedar Park TX area. The $2,941/year bundled rate is within market range. Compare with State Farm and USAA (if eligible) before committing.', red_flags: ['$500 deductible may be low for the Odyssey — $1,000 deductible would lower premium further'], safe_next_step: 'Get a comparison quote from State Farm and check USAA eligibility (if Tom has military background). Also check if Umbrella policy add-on ($200–300/year) is worth it given two children.' },
    { type: 'subscription', title: 'AT&T Fiber Upgrade "Free for 3 Months" Offer', content: 'AT&T: Upgrade from 1Gig to 2Gig fiber for FREE for 3 months, then $10/month more. No equipment change needed. Call 1-800-288-2020 to accept.', risk_level: 'low', result_summary: 'Legitimate AT&T promotional offer, not a scam. However, the $10/month increase after the promo period adds $120/year. With 4 people on Wi-Fi (streaming, gaming, remote schoolwork), 1Gig is already sufficient.', red_flags: ['Promotional price that auto-increases after 3 months — easy to forget'], safe_next_step: 'Decline unless the family consistently hits speed limits. Run a speed test — if consistently above 500Mbps, 2Gig adds no real benefit. Call AT&T to confirm you want to keep 1Gig.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'Allstate Home + Auto Bundle — Cedar Park TX 2026', amount: 2941, currency: 'USD', category: 'insurance', region: 'Cedar Park, TX', result_summary: 'Competitive bundle quote. Compare with State Farm and USAA. Current coverage appears adequate; bundle discount is genuine.', risk_level: 'low', negotiation_script: 'I\'ve been reviewing quotes from multiple carriers. I\'m interested in the bundle discount but need to confirm: does the $1,840 home policy include replacement cost for a $285K home with current reconstruction costs? I also need confirmation the auto policy covers rideshare (Tom occasionally uses F-150 for Uber Freight). Please advise before I decide.' },
    { title: 'Cedar Valley Relief Contract Rate — $40/hr', amount: 40, currency: 'USD', category: 'employment', region: 'Cedar Park / Pflugerville, TX', result_summary: 'Market rate for per-diem ICU RN in Austin area is $42–52/hr in 2026. Current $40/hr is below market. Justified to ask for $45/hr at renewal.', risk_level: 'low', negotiation_script: 'I\'ve been providing reliable weekend coverage for Cedar Valley since April with zero call-outs. The per-diem RN market in Austin is currently $44–52/hr for ICU-credentialed nurses. I\'d like to discuss adjusting to $45/hr for the July renewal. I\'m committed to continuing — I just want fair market compensation.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'rate_increase', tone: 'professional', context: 'Requesting CCRN-justified rate increase from Cedar Valley Senior Living ($40 → $45/hr)', script: `Hi [Facility Manager],\n\nThank you for the continued partnership — I have covered every scheduled shift since April with no call-outs.\n\nAs we approach the July renewal, I wanted to revisit the hourly rate. The per-diem RN market in Cedar Park/Austin has moved to $44–52/hr for ICU-credentialed nurses, and I hold an active CCRN certification which adds additional clinical value for your residents.\n\nI am proposing $45/hr effective July 1. This is well within market range and reflects the reliability I have demonstrated.\n\nI enjoy working with your team and hope we can continue. Happy to discuss further.\n\nBest,\nSarah Johnson, BSN, RN, CCRN` },
    { type: 'payment_terms', tone: 'firm', context: 'Following up on Austin Corporate Wellness unpaid invoice SJ-2026-002 ($320, due Apr 30)', script: `Hi [Events Coordinator],\n\nI am following up on Invoice SJ-2026-002 for $320, issued April 15 and due April 30, for the workplace wellness screening on April 12.\n\nI have not yet received payment. Could you please confirm the expected payment date? If there are any issues with the invoice, please let me know.\n\nThank you.\n\nBest,\nSarah Johnson` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'Texas RN License Biennial Renewal', type: 'renewal', due_date: '2026-09-30', amount: 65, currency: 'USD', status: 'pending', authority: 'Texas Board of Nursing (BON)', reference_no: 'TX-RN-1082443', notes: 'Biennial renewal. Requires 20 CE hours including 2hrs pain management. Complete CEs by August 31.' },
    { title: 'CCRN Certification Renewal', type: 'renewal', due_date: '2027-02-28', amount: 395, currency: 'USD', status: 'pending', authority: 'AACN Certification Corporation', reference_no: 'CCRN-2024-009871', notes: 'Choose: exam ($395) or 432 CE hours. Exam path recommended. Register by Aug 2026 for Jan 2027 exam date.' },
    { title: 'IRS Estimated Taxes Q2 2026 (1099 Income)', type: 'tax', due_date: '2026-06-15', amount: 420, currency: 'USD', status: 'pending', authority: 'Internal Revenue Service', reference_no: null, notes: 'Self-employment tax on ~$7,000 consulting income (Cedar Valley + ACW). Approx 15.3% SE tax + income tax.' },
    { title: 'Honda Odyssey Vehicle Registration Renewal', type: 'renewal', due_date: '2026-11-30', amount: 85, currency: 'USD', status: 'pending', authority: 'Texas DMV — Williamson County', reference_no: 'TX-REG-2022OD8821', notes: 'Annual sticker renewal. Requires passing emissions inspection first (schedule October).' },
    { title: 'HIPAA + Hospital Annual Compliance Training', type: 'other', due_date: '2026-04-30', amount: null, currency: 'USD', status: 'filed', authority: 'St. David\'s Medical Center HealthCare', reference_no: 'SD-COMP-2026-SJ', notes: 'Completed April 22 2026 via hospital LMS. Next due April 2027.' },
    { title: 'Disney World Room Reservation (June 1 Booking Window)', type: 'other', due_date: '2026-06-01', amount: 500, currency: 'USD', status: 'pending', authority: 'Walt Disney World Resort', reference_no: null, notes: 'Disney\'s Art of Animation Resort — 6-month advance booking opens June 1 for Dec 27 stay. Deposit required at booking.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Cedar Valley Senior Living Relief Contract — Apr 2026', doc_type: 'contract', original_text: 'INDEPENDENT CONTRACTOR AGREEMENT\nParties: Cedar Valley Senior Living LLC (Facility) and Sarah Johnson, BSN RN (Contractor).\nServices: Per-diem relief registered nurse coverage, primarily Saturdays.\nRate: $40.00/hour, invoiced monthly.\nNon-Compete: 15-mile radius, 12 months post-termination, assisted living/SNF/LTC facilities.\nTerm: April 1 – June 30, 2026. Renewable by mutual agreement.\nGoverning Law: State of Texas.', summary_md: '## Cedar Valley Relief Contract\n\n**What:** Per-diem RN contract at $40/hr, Saturdays.\n\n**Key terms:**\n- Rate: $40/hr (below market $44–52)\n- Non-compete: 15-mile / 12-month — BROAD\n- Term: Apr–Jun 2026, renewable\n\n**Action needed:** Negotiate rate to $45/hr + reduce non-compete scope at renewal.', key_points: ['$40/hr is below market for ICU-credentialed RN in Austin area (market: $44–52)', 'Non-compete is broadly written — 15 miles covers much of Cedar Park and Pflugerville', 'Monthly invoicing with no stated payment timeline — add "net 14 days" at renewal'], red_flags: ['Non-compete scope may restrict future per-diem opportunities in Cedar Park area', 'No explicit payment term — invoices paid late'], expires_at: '2026-06-30', notes: 'Renewal negotiation due June 2026. Propose $45/hr + reduced non-compete + net-14 payment terms.' },
    { name: 'St. David\'s HealthCare Employment Agreement (2022 Renewal)', doc_type: 'employment', original_text: 'EMPLOYMENT AGREEMENT\nEmployer: St. David\'s HealthCare\nEmployee: Sarah Johnson, BSN RN, CCRN\nPosition: Registered Nurse III, Medical ICU — Cedar Park Campus\nSalary: $36.25/hour base + shift differentials (nights: +$5/hr, weekends: +$3.50/hr)\nSchedule: 3×12hr shifts/week (rotational)\nBenefits: Medical, dental, vision; 403(b) with 4% employer match; tuition reimbursement $3,500/year\nAt-Will Employment.', summary_md: '## St. David\'s Employment Agreement\n\n**What:** ICU RN III at $36.25/hr base + differentials.\n\n**Key benefits:**\n- 403(b) 4% employer match (maximise this!)\n- Tuition reimbursement $3,500/year (use for CCRN prep)\n- Night differential +$5/hr\n\n**Action:** Use tuition reimbursement for CCRN renewal study materials and CE courses.', key_points: ['$36.25/hr base ($75,400/year) with night differential reaches $41.25/hr overnight', '4% 403(b) match — ensure contributing at least 4% to capture full match', '$3,500 tuition reimbursement — claim for CCRN prep materials and CE courses'], red_flags: [], expires_at: null, notes: 'Annual review in January. CCRN credential due for renewal Feb 2027 — St. David\'s may cover exam fee via tuition reimbursement.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'Texas RN License Renewal (Biennial)', category: 'personal', frequency: 'annual', last_done_at: '2024-09-30', next_due_at: '2026-09-30', is_done: false, applicable: true, notes: '20 CE hours required including 2hrs pain management. Use AACN and HealthStream platforms.' },
    { item: 'CCRN Certification Renewal', category: 'personal', frequency: 'annual', last_done_at: '2024-02-28', next_due_at: '2027-02-28', is_done: false, applicable: true, notes: 'Exam pathway ($395) is more efficient than CE pathway (432 hours). Schedule Jan 2027.' },
    { item: 'IRS Estimated Tax Payments (Quarterly)', category: 'tax', frequency: 'quarterly', last_done_at: '2026-04-15', next_due_at: '2026-06-15', is_done: false, applicable: true, notes: '1099 income from Cedar Valley + Austin Corporate Wellness. Approximately $400–500/quarter.' },
    { item: 'HIPAA Annual Training — St. David\'s', category: 'business', frequency: 'annual', last_done_at: '2026-04-22', next_due_at: '2027-04-30', is_done: true, applicable: true, notes: 'Completed April 22 2026. Next due April 2027. Done via hospital LMS system.' },
    { item: 'BLS/ACLS Certification Renewal', category: 'personal', frequency: 'annual', last_done_at: '2025-06-10', next_due_at: '2027-06-10', is_done: false, applicable: true, notes: 'Current until June 2027. Schedule renewal at American Heart Association course by May 2027.' },
    { item: 'Honda Odyssey Annual Emissions Inspection (Texas)', category: 'personal', frequency: 'annual', last_done_at: '2025-11-10', next_due_at: '2026-11-01', is_done: false, applicable: true, notes: 'Required before registration renewal. Schedule at Jiffy Lube or Firestone in October.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  // 06:00 CDT = UTC-5 = T11:00:00Z
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, Sarah.** Sunday — shift starts Tuesday. Today\'s your meal prep day. A few things on the radar: the AT&T Fiber bill ($75) is due May 15 — pay it this week. Your HVAC service was due May 20 and it\'s getting warm in Cedar Park. **Today\'s one thing: schedule the HVAC tune-up before the first 90°F week hits.** Kids are good, Tom is on the Cedar Ridge job this week — enjoy the quiet morning before the house wakes up.', highlights: [{ label: 'Pending invoice', value: '$320 from Austin Corporate Wellness', link: '/business', emoji: '💼' }, { label: 'HVAC service due', value: 'May 20', link: '/home', emoji: '❄️' }, { label: 'Next trip', value: 'Florida Keys (Jul 4)', link: '/travel', emoji: '🌊' }, { label: 'Top goal', value: 'CCRN renewal — Feb 2027', link: '/career', emoji: '🎓' }] },
    { date: '2026-05-04', content_md: '**Good morning, Sarah.** Monday — your last off day before the Tue/Wed/Thu shift block. Cedar Valley invoice SJ-2026-001 ($680) came in Friday — great cash flow. The SJ-2026-002 from Austin Corporate Wellness ($320) is still outstanding. Reminder: Tom\'s F-150 registration is due November — not urgent but worth calendaring. **Today\'s priority: complete 2 CCRN practice questions sets (Ch 8 — respiratory).** You have a solid 2-hour window this morning.', highlights: [{ label: 'Paid this week', value: 'Cedar Valley $680', link: '/business', emoji: '✅' }, { label: 'Outstanding invoice', value: '$320 — due follow-up', link: '/business', emoji: '🧾' }, { label: 'Habit streak', value: 'Morning walk 12/14 days', link: '/habits', emoji: '🚶' }, { label: 'College fund', value: '$120K of $150K goal', link: '/money', emoji: '🎓' }] },
    { date: '2026-05-05', content_md: '**Good morning, Sarah.** Tuesday — first shift day this week. You\'re on days (7am). The 5am walk is done — great job maintaining the streak despite shift weeks. One admin note: the Cedar Valley July contract renewal is coming up June 30. Now is the time to prepare the $45/hr counter-proposal before they reach out first. **Shift focus today: stay hydrated (ICU nights drain fast in TX heat) and check in on Maya\'s volleyball schedule — semifinals are Thursday.** Tom\'s covering the kids.', highlights: [{ label: 'Shift today', value: 'ICU Days 7am–7pm', link: '/focus', emoji: '🏥' }, { label: 'Contract renewal', value: 'Cedar Valley — Jun 30', link: '/legal', emoji: '⚖️' }, { label: 'Maya: volleyball', value: 'Semifinals Thurs', link: '/family', emoji: '🏐' }, { label: 'Florida Keys', value: 'Planning — Jul 4', link: '/travel', emoji: '🌊' }] },
    { date: '2026-05-06', content_md: '**Good morning, Sarah.** Wednesday shift. The Reliant electricity bill ($195) is due May 20 — pay it on your next off day Friday. Disney World booking window opens June 1 — you need to have a deposit ready. Quick pulse on the Florida Keys trip: flights researched but not yet booked. Summer rates go up fast. **Shift note: you\'re covering for Martinez today — complex ARDS case, review the prone positioning protocol before 7am.** Off Friday — make it count.', highlights: [{ label: 'Electricity due', value: '$195 by May 20', link: '/home', emoji: '💡' }, { label: 'Disney deposit', value: 'Booking opens Jun 1', link: '/travel', emoji: '🏰' }, { label: 'Florida Keys flights', value: 'Not yet booked', link: '/travel', emoji: '✈️' }, { label: 'CCRN study', value: 'Ch 8 respiratory — in progress', link: '/career', emoji: '📖' }] },
    { date: '2026-05-07', content_md: '**Good morning, Sarah.** Thursday — last shift day this week. Once this block is done you have a 4-day break starting Friday. Key admin: Jack\'s soccer camp registration deadline is May 31 ($420). Also, the Austin Corporate Wellness invoice ($320) has been outstanding since April 30 — it\'s time to send a polite follow-up. **One thing before your shift: quickly text Austin Corporate Wellness about the invoice.** 2 minutes while coffee brews.', highlights: [{ label: 'Outstanding invoice', value: '$320 — 7 days overdue', link: '/business', emoji: '🧾' }, { label: 'Jack soccer camp', value: 'Registration due May 31', link: '/family', emoji: '⚽' }, { label: 'Upcoming break', value: 'Fri–Mon off (4 days)', link: '/focus', emoji: '🌅' }, { label: 'Next trip', value: 'Florida Keys Jul 4', link: '/travel', emoji: '🌊' }] },
    { date: '2026-05-08', content_md: '**Good morning, Sarah.** Friday — off day and date night with Tom tonight. The shift block is done. A clean 4-day stretch ahead. Three bills need paying this month: electricity ($195), water ($88), AT&T ($75) — do them all now in 5 minutes via autopay. **Today\'s real priority: book the Florida Keys flights before Memorial Day weekend makes them $200 more expensive.** American, United, and Southwest all have inventory. You\'ve already decided the Keys — just book it.', highlights: [{ label: 'Bills to pay', value: '3 pending (~$358)', link: '/home', emoji: '💡' }, { label: 'Florida Keys flights', value: 'Need to book — prices rising', link: '/travel', emoji: '✈️' }, { label: 'Date night', value: 'Tonight with Tom', link: '/habits', emoji: '🍷' }, { label: 'CCRN renewal', value: 'Register by Aug 2026', link: '/legal', emoji: '🎓' }] },
    { date: '2026-05-09', content_md: '**Good morning, Sarah.** Saturday — Tom\'s on the job site until noon. Maya has practice, Jack has a game. You have the morning to yourself before the chaos. Three wins this week: Cedar Valley paid ($680), CCRN chapter 8 done, and the date night happened. **Today: pay the bills (electricity, water, AT&T, T-Mobile — $518 total), then book the Florida Keys flights. Both take 15 minutes max.** Then enjoy your Saturday. You earned the peaceful morning.', highlights: [{ label: 'Bills pending', value: '$518 total, due this month', link: '/home', emoji: '💡' }, { label: 'Florida Keys flights', value: 'Prices will rise — book today', link: '/travel', emoji: '✈️' }, { label: 'Savings goal', value: '$120K of $150K college fund', link: '/money', emoji: '💰' }, { label: 'Habit streak', value: 'Vitamins: perfect 21/21', link: '/habits', emoji: '💊' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T11:00:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Sarah Johnson uid: ${UID}`)
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
