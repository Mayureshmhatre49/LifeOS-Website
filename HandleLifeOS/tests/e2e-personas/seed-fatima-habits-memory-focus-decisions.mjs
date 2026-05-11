/**
 * Seeds Habits, Memory (profile + items), Focus sessions, and Decision logs
 * for Fatima Al-Rashid.
 *
 * Run:
 *   node tests/e2e-personas/seed-fatima-habits-memory-focus-decisions.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '899098ae-2f59-4c02-983c-1b84fefa875d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Apr 19 – May 9 (21 days). Offset 0 = Apr 19 (Sunday)
function dateOffset(offset) {
  const d = new Date('2026-04-19')
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}
const ALL_DATES   = Array.from({ length: 21 }, (_, i) => dateOffset(i))
// Day-of-week per offset (0=Sun): [0,1,2,3,4,5,6, 0,1,2,3,4,5,6, 0,1,2,3,4,5,6]
const DOW_BY_OFF  = ALL_DATES.map((_, i) => (0 + i) % 7)

// ── MEMORY ────────────────────────────────────────────────────────────────────

async function seedMemory() {
  console.log('\n🧠  Seeding memory (profile + items)...')

  // Profile — id IS the user_id in this table
  const { error: profErr } = await db.from('profiles').upsert({
    id:                 UID,
    display_name:       'Fatima Al-Rashid',
    occupation:         'Healthcare Consultant',
    life_stage:         'mid_career',
    country:            'AE',
    currency:           'AED',
    timezone:           'Asia/Dubai',
    preferred_language: 'en',
    goals: [
      'Expand AlRashid Health Advisory to 5 active clients by Dec 2026',
      'Complete 40 DHA CME hours before January 2027 licence renewal',
      'Build consistent morning routine — Fajr + exercise + journaling',
      'Visit Petra and Dead Sea in Amman with Ahmed and the children',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  if (profErr) console.log(`  ✗  profile: ${profErr.message}`)
  else console.log('  ✔  profile: Fatima Al-Rashid (Healthcare Consultant, Dubai)')

  // Memory items — 15 curated facts about Fatima
  const items = [
    // ── fact ──
    { type: 'fact', key: 'monthly_consulting_income', value: 'AED 18,500 average across 2 active retainer/project clients (Al Rafah + NMC Health)' },
    { type: 'fact', key: 'home_location',             value: 'JLT Cluster X, Apt 1204, Dubai, UAE — 3-bedroom apartment, family of 4' },
    { type: 'fact', key: 'children',                  value: 'Layla (9 years, Grade 4 at GEMS school) and Omar (5 years, KG2) — both in school until 2pm daily' },
    { type: 'fact', key: 'vehicle',                   value: 'Toyota Fortuner 2020, plate P19244, Dubai — primary family vehicle' },
    { type: 'fact', key: 'languages',                 value: 'Arabic (native), English (fluent — primary work language), Hindi (conversational)' },
    // ── preference ──
    { type: 'preference', key: 'communication_style', value: 'Direct and professional; prefers bullet-point summaries over long paragraphs' },
    { type: 'preference', key: 'dietary_restrictions', value: 'Halal food only — no pork or alcohol; follows Mediterranean diet principles' },
    { type: 'preference', key: 'work_schedule',       value: 'Works 8am–2pm Dubai time on weekdays; afternoons reserved for school runs and family' },
    { type: 'preference', key: 'reading_preferences', value: 'Healthcare management, Islamic non-fiction, Arabic contemporary fiction — aims for 10 pages per night' },
    // ── goal ──
    { type: 'goal', key: 'business_goal_2026',        value: 'Sign 2 new healthcare consulting clients by Q3 2026 to reach 5 active engagements' },
    { type: 'goal', key: 'professional_development',  value: 'Complete 40 CME hours before DHA licence renewal in January 2027 — currently at 22 hours' },
    { type: 'goal', key: 'fitness_goal',              value: 'Walk 8,000 steps daily and maintain Mediterranean diet — tracking via Fitbit' },
    // ── concern ──
    { type: 'concern', key: 'cash_flow_pressure',     value: 'NMC Health 60–90 day payment terms create monthly cash-flow gap — invoice ARHA-2026-002 (AED 20k) still unpaid' },
    { type: 'concern', key: 'work_life_balance',      value: 'Tends to overcommit client work during school term — needs to protect family evenings strictly' },
    // ── relationship ──
    { type: 'relationship', key: 'spouse',            value: 'Ahmed Al-Rashid, software engineer at du Telecom — birthday May 30; supportive of consulting career' },
  ]

  let memCount = 0
  for (const item of items) {
    const { error } = await db.from('memory_items').insert({
      user_id: UID, source: 'manual', confidence: 95, is_active: true, ...item,
    })
    if (!error) memCount++
    else console.log(`  ✗  memory "${item.key}": ${error.message}`)
  }
  console.log(`  ✔  ${memCount}/${items.length} memory items`)
}

// ── HABITS ────────────────────────────────────────────────────────────────────

async function seedHabits() {
  console.log('\n🌱  Seeding habits + logs...')

  const habitDefs = [
    { name: 'Fajr Prayer & Morning Dhikr', icon: '🌙', color: 'violet', frequency: 'daily',   days_of_week: [0,1,2,3,4,5,6], reminder_time: '05:30', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19] },
    { name: 'Drink 8 Glasses of Water',    icon: '💧', color: 'sky',    frequency: 'daily',   days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:00', completedOffsets: [0,1,2,4,5,6,7,8,9,10,12,14,15,16,17,19,20] },
    { name: '30-Min Walk or Exercise',     icon: '🚶', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '07:00', completedOffsets: [1,2,3,4,5,8,9,10,11,15,16,18,19] },
    { name: 'Evening Journal Entry',       icon: '📔', color: 'indigo',  frequency: 'daily',   days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:00', completedOffsets: [0,1,3,4,7,8,9,11,12,14,15,17,18] },
    { name: 'Read 10 Pages Before Bed',   icon: '📚', color: 'purple',  frequency: 'daily',   days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,2,3,4,5,7,8,9,10,12,13,14,15,16,18,19,20] },
    { name: 'Screen-Free Family Dinner',  icon: '🍽️', color: 'rose',    frequency: 'daily',   days_of_week: [0,1,2,3,4,5,6], reminder_time: null,    completedOffsets: [0,1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Arabic Duolingo Lesson',     icon: '🌍', color: 'amber',   frequency: 'custom',  days_of_week: [5],              reminder_time: '20:00', completedOffsets: [5,12,19] },
  ]

  let habitInserted = 0
  let logsInserted  = 0

  for (const h of habitDefs) {
    const { completedOffsets, ...habitRow } = h
    const { data: habit, error } = await db.from('habits').insert({
      user_id: UID, ...habitRow,
    }).select().single()

    if (error || !habit) { console.log(`  ✗  habit "${h.name}": ${error?.message}`); continue }
    habitInserted++

    // Insert logs only for offsets where this habit should be scheduled
    for (const offset of completedOffsets) {
      const dow = DOW_BY_OFF[offset]
      if (!h.days_of_week.includes(dow)) continue  // skip off-schedule days
      const date = dateOffset(offset)
      const { error: logErr } = await db.from('habit_logs').insert({
        habit_id: habit.id, user_id: UID, date, count: 1,
      })
      if (!logErr) logsInserted++
      // Silently skip duplicates
    }
  }

  console.log(`  ✔  ${habitInserted}/${habitDefs.length} habits, ${logsInserted} habit logs`)
}

// ── FOCUS ─────────────────────────────────────────────────────────────────────

async function seedFocus() {
  console.log('\n🎯  Seeding focus sessions + preferences...')

  // Focus preferences
  const { error: prefErr } = await db.from('focus_preferences').upsert({
    user_id:                    UID,
    default_mode:               'deep',
    break_interval_minutes:     5,
    long_break_minutes:         20,
    sessions_before_long_break: 3,
    body_doubling_default:      false,
    daily_focus_goal_minutes:   180,
  }, { onConflict: 'user_id' })
  if (prefErr) console.log(`  ✗  focus_preferences: ${prefErr.message}`)
  else console.log('  ✔  focus preferences: 3h/day goal, deep-work default')

  // Focus sessions — 25 sessions over past 4 weeks (weekdays mostly, Dubai time UTC+4)
  // started_at is UTC; Dubai = UTC+4, so 8am Dubai = 04:00 UTC
  const sessions = [
    // Week 1: Apr 19 (Sun) – Apr 25 (Sat)
    { offset: 1,  mode: 'deep',     planned: 90,  actual: 85,  completed: true,  title: 'Al Rafah Phase 2 — Gap Analysis Report Draft',            time: '04:30' },
    { offset: 2,  mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'Client emails & invoice follow-up',                        time: '07:00' },
    { offset: 2,  mode: 'deep',     planned: 60,  actual: 58,  completed: true,  title: 'NMC Health — Workflow Audit Final Review',                 time: '05:00' },
    { offset: 3,  mode: 'pomodoro', planned: 25,  actual: 23,  completed: true,  title: 'DHA CPD Module: Patient Safety (CME)',                    time: '06:00' },
    { offset: 4,  mode: 'deep',     planned: 75,  actual: 70,  completed: true,  title: 'Al Rafah — Staff Training Curriculum Design',             time: '04:30' },
    { offset: 5,  mode: 'pomodoro', planned: 25,  actual: 20,  completed: false, title: 'Wellness Hub proposal prep',                               time: '07:30', abandoned: true },

    // Week 2: Apr 26 (Sun) – May 2 (Sat)
    { offset: 8,  mode: 'deep',     planned: 90,  actual: 92,  completed: true,  title: 'Al Rafah Phase 2 — Implementation Progress Report',       time: '04:00' },
    { offset: 8,  mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'Business admin — expense reconciliation',                  time: '07:00' },
    { offset: 9,  mode: 'deep',     planned: 60,  actual: 60,  completed: true,  title: 'NMC contract terms review + counter-proposal draft',       time: '05:00' },
    { offset: 10, mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'CME Module: Healthcare Quality Management',               time: '06:30' },
    { offset: 10, mode: 'deep',     planned: 60,  actual: 55,  completed: true,  title: 'Wellness Hub Dubai — Nutrition Programme Proposal v1',     time: '04:30' },
    { offset: 11, mode: 'pomodoro', planned: 25,  actual: 22,  completed: true,  title: 'LinkedIn Premium — connection requests + InMail',         time: '07:00' },
    { offset: 12, mode: 'deep',     planned: 45,  actual: 40,  completed: true,  title: 'Monthly invoice preparation (ARHA-2026-002)',              time: '05:00' },

    // Week 3: May 3 (Sun) – May 9 (Sat)
    { offset: 14, mode: 'deep',     planned: 90,  actual: 87,  completed: true,  title: 'Al Rafah — Phase 2 Month 3 deliverable report',            time: '04:00' },
    { offset: 15, mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'Client follow-up calls — ARHA-2026-002 payment status',   time: '07:30' },
    { offset: 15, mode: 'deep',     planned: 60,  actual: 63,  completed: true,  title: 'Wellness Hub — Nutrition Programme Proposal FINAL v2',     time: '05:00' },
    { offset: 16, mode: 'deep',     planned: 75,  actual: 72,  completed: true,  title: 'NMC Health — Retainer vs project rate financial model',    time: '04:30' },
    { offset: 16, mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'Duolingo + Arabic lesson prep (weekly review)',           time: '07:30' },
    { offset: 17, mode: 'deep',     planned: 60,  actual: 58,  completed: true,  title: 'CME Module: UAE Healthcare Regulations 2026 update',      time: '05:00' },
    { offset: 17, mode: 'pomodoro', planned: 25,  actual: 18,  completed: false, title: 'Abu Dhabi trip logistics planning',                        time: '08:00', abandoned: true },
    { offset: 18, mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'Business expense tracking — Apr receipts',                time: '07:00' },
    { offset: 18, mode: 'deep',     planned: 90,  actual: 88,  completed: true,  title: 'Al Rafah Phase 3 — Scope document draft',                 time: '04:30' },
    { offset: 19, mode: 'deep',     planned: 60,  actual: 55,  completed: true,  title: 'Rate increase proposal to Al Rafah — email draft + review', time: '05:00' },
    { offset: 19, mode: 'pomodoro', planned: 25,  actual: 25,  completed: true,  title: 'DHA licence CME tracker update',                          time: '08:00' },
    { offset: 20, mode: 'quick',    planned: 15,  actual: 12,  completed: true,  title: 'Quick review: Abu Dhabi Marriott booking confirmation',    time: '09:00' },
  ]

  let sessCount = 0
  for (const s of sessions) {
    const date = dateOffset(s.offset)
    const startedAt = `${date}T${s.time}:00Z`
    const endedMin = s.actual ?? s.planned
    const endedAt = new Date(new Date(startedAt).getTime() + endedMin * 60_000).toISOString()

    const { error } = await db.from('focus_sessions').insert({
      user_id:               UID,
      mode:                  s.mode,
      planned_minutes:       s.planned,
      actual_minutes:        s.actual ?? null,
      completed:             s.completed,
      abandoned:             s.abandoned ?? false,
      body_doubling_enabled: false,
      task_title:            s.title,
      started_at:            startedAt,
      ended_at:              endedAt,
    })
    if (!error) sessCount++
    else console.log(`  ✗  focus session "${s.title}": ${error.message}`)
  }
  console.log(`  ✔  ${sessCount}/${sessions.length} focus sessions`)
}

// ── DECISIONS ─────────────────────────────────────────────────────────────────

async function seedDecisions() {
  console.log('\n🤔  Seeding decision logs...')

  const decisions = [
    {
      question:   'Should I accept NMC Health\'s monthly retainer offer of AED 8,500 or continue on project-based billing?',
      category:   'career',
      mode:       'analyze',
      options:    [],
      created_at: '2026-04-22T07:15:00Z',
      favorite:   true,
      result: {
        summary: 'The NMC Health retainer offers income stability at AED 8,500/month (AED 102,000/year) but represents an effective rate cut versus your current project pricing. The decision hinges on whether you value predictability over maximising hourly value.',
        recommendation: 'Counter-propose a retainer at AED 10,500/month with a 6-month initial term and no IP assignment clause. This matches your effective project rate while giving NMC the stability they want.',
        confidenceScore: 78,
        riskScore: 42,
        riskLevel: 'medium',
        financialImpact: {
          summary: 'Retainer at AED 8,500 = AED 102,000/year vs average project revenue of ~AED 135,000/year from NMC-equivalent work. Net difference: -AED 33,000/year.',
          monthlyCostChange: -2750,
          oneTimeCost: null,
          opportunityCost: 'Loss of flexibility to take higher-value short-term projects',
          affordabilityScore: 85,
        },
        timeImpact: 'Retainer reduces time spent on business development by ~4 hours/week. However, it locks 5 days/month of on-site capacity.',
        emotionalImpact: 'Stability would reduce the anxiety of irregular income. However, the IP clause and long payment terms remain unresolved stressors.',
        pros: ['Predictable monthly income reduces cash-flow anxiety', 'Reduces time spent on new client acquisition', 'Solidifies relationship with NMC Health as anchor client'],
        cons: ['AED 2,000+/month less than effective project rate', 'Broad IP assignment clause is unfavourable', '60–90 day payment terms remain unchanged', 'Limits capacity for higher-value client onboarding'],
        hiddenFactors: ['NMC\'s 60–90 day payment terms mean the "stable income" is still delayed by 2–3 months', 'Retainer creates opportunity cost if Wellness Hub or Al Rafah Phase 3 needs more capacity'],
        bestCase: { label: 'Counter accepted at AED 10,500 + net-30 terms', description: 'NMC accepts the counter-proposal; you earn AED 126,000/year with cash-flow predictability. Ideal outcome.', probability: 'possible' },
        worstCase: { label: 'Retainer accepted at 8,500 with original IP terms', description: 'All work products assigned to NMC; income drops AED 33k/year. Reusable frameworks are lost to the client.', probability: 'unlikely' },
        threeYearView: 'A well-negotiated NMC retainer creates a stable revenue floor that lets you scale AlRashid Health Advisory without dependency on individual project wins. By 2029, the anchor retainer model could free 40% of your time for higher-margin work.',
        nextSteps: ['Draft counter-proposal at AED 10,500/month with net-30 payment terms', 'Add IP carve-out for pre-existing methodologies', 'Set 6-month initial term with mutual renewal option'],
        memoryFactorsUsed: ['Monthly consulting income: AED 18,500 avg', 'Cash-flow concern: 60–90 day payment terms'],
        dataSourcesUsed: ['UAE healthcare consulting market benchmarks', 'NMC Health contract terms reviewed'],
      },
    },
    {
      question:   'Which should I prioritise in Q3 2026: deepening the Al Rafah engagement with Phase 3, or onboarding Wellness Hub Dubai as a new client?',
      category:   'business',
      mode:       'compare',
      options:    ['Al Rafah Phase 3 (deepen existing)', 'Wellness Hub Dubai (new client)'],
      created_at: '2026-04-28T06:45:00Z',
      favorite:   false,
      result: {
        question: 'Al Rafah Phase 3 vs Wellness Hub Dubai — which to prioritise in Q3 2026?',
        factors:  ['Revenue certainty', 'Strategic growth', 'Time investment', 'Relationship risk', 'Learning opportunity'],
        options: [
          {
            label: 'Al Rafah Phase 3',
            scores: { 'Revenue certainty': 85, 'Strategic growth': 65, 'Time investment': 75, 'Relationship risk': 20, 'Learning opportunity': 55 },
            pros: ['Known scope and working relationship — low onboarding friction', 'Higher per-day rate already established', 'Strong reference for future healthcare group clients'],
            cons: ['Revenue concentration risk — two clients become one if NMC is on hold', 'Limited new learning after 18 months in same organisation', 'Phase 3 scope negotiation still pending'],
            summary: 'Safest revenue choice with lower uncertainty but carries concentration risk.',
          },
          {
            label: 'Wellness Hub Dubai',
            scores: { 'Revenue certainty': 45, 'Strategic growth': 88, 'Time investment': 55, 'Relationship risk': 60, 'Learning opportunity': 90 },
            pros: ['Enters wellness/lifestyle medicine segment — growing market in UAE', 'New service design skills applicable to future clients', 'Diversifies client portfolio away from hospital groups'],
            cons: ['AED 12,000 proposal not yet signed — revenue uncertain', 'Requires new relationship investment (3–4 months to trusted-advisor status)', 'Scope undefined — potential for scope creep'],
            summary: 'Higher growth potential but requires significant upfront relationship investment with uncertain conversion.',
          },
        ],
        recommendation: 'Pursue both in parallel with clear capacity boundaries. Al Rafah Phase 3 funds Q3; dedicate 30% of time to converting Wellness Hub. If both sign simultaneously, consider engaging a sub-consultant for Wellness Hub delivery support.',
        winner: 'Al Rafah Phase 3',
      },
    },
    {
      question:   'Should I hire a part-time research assistant at AED 2,500/month to help scale my healthcare consultancy?',
      category:   'business',
      mode:       'analyze',
      options:    [],
      created_at: '2026-05-02T05:30:00Z',
      favorite:   false,
      result: {
        summary: 'Hiring a part-time research assistant at AED 2,500/month would free approximately 6–8 hours/week of your time currently spent on literature review, data compilation, and report formatting. This capacity could be redirected to billable client work or business development.',
        recommendation: 'Wait until Wellness Hub contract is confirmed before hiring. At that point, a research assistant becomes clearly ROI-positive. Start with a 3-month trial contract sourced via UAEU or Zayed University graduate programme for healthcare management.',
        confidenceScore: 71,
        riskScore: 35,
        riskLevel: 'low',
        financialImpact: {
          summary: 'AED 2,500/month cost (AED 30,000/year). If 6 freed hours/week converts to 1 extra consulting day/month at AED 3,500/day, ROI is positive within 2 months.',
          monthlyCostChange: 2500,
          oneTimeCost: 500,
          opportunityCost: 'None if revenue scales proportionally',
          affordabilityScore: 80,
        },
        timeImpact: 'Frees 6–8 hours/week from research and formatting tasks. Allows focus on strategic delivery and client relationship management.',
        emotionalImpact: 'Delegation is a positive step toward building a real consultancy. Will require initial time investment in onboarding and quality control.',
        pros: ['Frees billable hours from admin/research tasks', 'Enables scaling beyond solo consultant capacity', 'Fresh graduate brings current academic and policy knowledge'],
        cons: ['AED 2,500/month fixed cost regardless of workload', 'Requires time to onboard and quality-check deliverables', 'Dependency risk if assistant leaves after 3 months'],
        hiddenFactors: ['Part-time UAE work visa requirements may apply if assistant is not a UAE national or spouse visa holder', 'Consider remote-first arrangement to avoid office rental implication'],
        bestCase: { label: 'Research assistant accelerates Wellness Hub proposal quality', description: 'Faster, higher-quality proposals convert at higher rates. Three new clients by Q4 2026.', probability: 'possible' },
        worstCase: { label: 'Revenue stays flat — cost becomes a drain', description: 'No new clients in Q3. AED 2,500/month becomes a net loss for the quarter.', probability: 'unlikely' },
        threeYearView: 'This is the first delegation step that defines whether AlRashid Health Advisory stays a solo practice or becomes a boutique consultancy. The hire itself matters less than developing the systems to support it.',
        nextSteps: ['Wait for Wellness Hub contract confirmation', 'Draft a 3-month trial contract template', 'Post on UAEU/Zayed University career portals for healthcare management graduates'],
        memoryFactorsUsed: ['Business goal 2026: 5 active clients', 'Work schedule: 8am–2pm constraint'],
        dataSourcesUsed: ['UAE freelance employment cost benchmarks', 'Consultancy scaling models'],
      },
    },
    {
      question:   'Should I enrol in the INSEAD Healthcare Management Leadership online programme (AED 8,500, 3 months)?',
      category:   'education',
      mode:       'analyze',
      options:    [],
      created_at: '2026-05-05T06:00:00Z',
      favorite:   true,
      result: {
        summary: 'The INSEAD Healthcare Management programme offers strong brand credibility in the Gulf region and 15 CME-eligible hours toward your DHA renewal. At AED 8,500 for a 3-month online format, the cost-to-credential ratio is excellent for a practising consultant.',
        recommendation: 'Enrol in the September 2026 cohort (after Q3 client delivery commitments). The 3-month online format aligns with your 8am–2pm work schedule and the CME hours count toward your January 2027 DHA renewal.',
        confidenceScore: 84,
        riskScore: 18,
        riskLevel: 'low',
        financialImpact: {
          summary: 'One-time cost AED 8,500. Expected ROI: INSEAD credential justifies 10–15% rate premium on future proposals. Payback in 1 additional consulting day.',
          monthlyCostChange: 0,
          oneTimeCost: 8500,
          opportunityCost: '~12 hours/week study time for 3 months — minimal impact on client capacity if enrolled in Sep-Nov',
          affordabilityScore: 88,
        },
        timeImpact: '12 hours/week for 12 weeks. Online format fits within existing work schedule. Sep–Nov timing avoids peak summer client demand.',
        emotionalImpact: 'High. Learning new leadership frameworks will build confidence in positioning AlRashid Health Advisory for hospital-group contracts vs individual-department engagements.',
        pros: ['INSEAD brand recognition in MENA healthcare procurement', '15 CME-eligible hours toward DHA renewal', 'Online format with no travel required', 'Peer network from Gulf healthcare sector'],
        cons: ['AED 8,500 is a material outlay during cash-flow pressure period (NMC invoice unpaid)', 'Study time competes with leisure and family evenings in Sep–Nov', 'Certificate alone does not substitute for on-the-ground experience'],
        hiddenFactors: ['Check if INSEAD partners with a UAE entity for Continuing Professional Education (CPE) credit — may qualify for additional DHA hours', 'Alumni network access often more valuable than the certificate itself in Gulf markets'],
        bestCase: { label: 'Programme leads to hospital-group board-level engagement', description: 'One new hospital-group client at AED 15,000/month directly attributed to INSEAD credential. ROI in year 1.', probability: 'possible' },
        worstCase: { label: 'Programme is academically strong but practically already familiar', description: 'Content covers known ground. Credential adds some value but no immediate revenue impact. AED 8,500 cost is the outcome.', probability: 'possible' },
        threeYearView: 'Positioning matters for 2028–2030 contracts. If AlRashid Health Advisory targets hospital-group strategic advisory, an INSEAD credential is the right signal to send now.',
        nextSteps: ['Confirm September cohort availability at INSEAD', 'Verify CME eligibility with DHA before enrolling', 'Budget AED 8,500 in May–June to avoid cashflow pressure later'],
        memoryFactorsUsed: ['Professional development goal: 40 CME hours', 'Business goal: 5 active clients by 2026'],
        dataSourcesUsed: ['INSEAD programme brochure 2026', 'DHA CME credit guidelines'],
      },
    },
    {
      question:   'Amman family trip timing: Aug 14–22 vs Aug 21–29 — which dates work better?',
      category:   'family',
      mode:       'compare',
      options:    ['Aug 14–22 (depart earlier)', 'Aug 21–29 (depart later)'],
      created_at: '2026-05-07T08:00:00Z',
      favorite:   false,
      result: {
        question: 'Amman trip timing: Aug 14–22 vs Aug 21–29?',
        factors:  ['School schedule alignment', 'Flight price', 'Weather', 'Sister Maha availability', 'Ramadan proximity'],
        options: [
          {
            label: 'Aug 14–22',
            scores: { 'School schedule alignment': 90, 'Flight price': 70, 'Weather': 65, 'Sister Maha availability': 85, 'Ramadan proximity': 95 },
            pros: ['Layla and Omar still in summer break — no school disruption', 'Maha confirmed availability Aug 14–20', 'Well clear of September school start'],
            cons: ['Peak summer pricing on flights — slightly more expensive than late August', 'Amman can be hot in mid-August (35°C+)'],
            summary: 'Better for school schedule and Maha availability. Higher flight cost offset by simplicity.',
          },
          {
            label: 'Aug 21–29',
            scores: { 'School schedule alignment': 55, 'Flight price': 85, 'Weather': 80, 'Sister Maha availability': 50, 'Ramadan proximity': 90 },
            pros: ['Slightly lower flight prices in late August', 'Cooler temperatures — more comfortable for Petra trek'],
            cons: ['Layla starts school Sep 1 — only 3 days margin, creates stress risk', 'Maha unavailable Aug 21–25 (work trip)', 'Risk of flight disruption impacting school start'],
            summary: 'Better weather and price, but conflicts with Maha\'s schedule and creates school-start risk.',
          },
        ],
        recommendation: 'Book Aug 14–22. Maha\'s availability is the deciding factor — the whole purpose of the trip is the family reunion. The school schedule margin is also much more comfortable.',
        winner: 'Aug 14–22',
      },
    },
  ]

  let decCount = 0
  for (const d of decisions) {
    const { question, category, mode, options, result, favorite, created_at } = d
    const { error } = await db.from('decision_logs').insert({
      user_id:          UID,
      question,
      category,
      mode,
      options,
      context_snapshot: {},
      result,
      favorite,
      created_at,
    })
    if (!error) decCount++
    else console.log(`  ✗  decision "${question.slice(0, 60)}...": ${error.message}`)
  }
  console.log(`  ✔  ${decCount}/${decisions.length} decision logs`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n👤  Fatima uid: ${UID}`)
  await seedMemory()
  await seedHabits()
  await seedFocus()
  await seedDecisions()
  console.log('\n✅  Seed complete.\n')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
