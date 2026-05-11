/**
 * Full seed for Rajesh Patel — Textile Trader, Varachha Surat, Gujarat India.
 * Run: node tests/e2e-personas/seed-rajesh-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = 'e164b5cd-1b17-49e2-930d-7700cace70a5'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Rajesh Patel', occupation: 'Textile Trader', life_stage: 'mid_career',
    country: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', preferred_language: 'en',
    goals: [
      'Expand warehouse from 3,000 to 5,000 sq ft by March 2027',
      'Build ₹18 lakh education corpus for Aryan by 2027',
      'Clear HDFC business loan ₹4.8 lakh by December 2026',
      'Add polyester-viscose blend product line by Q4 2026',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Rajesh Patel (Textile Trader, Surat GJ)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: '₹2,80,000/month owner\'s draw avg (varies ₹1,80,000–₹3,80,000 — peaks Oct–Dec Diwali+wedding season). Business turnover ₹42–48 lakh/year.' },
    { type: 'fact',         key: 'home_location',          value: '3BHK, Varachha Road, Surat 395006 — jointly owned family property (father purchased 2005, fully paid off). No home loan.' },
    { type: 'fact',         key: 'vehicle',                value: 'Maruti Suzuki Ciaz VXi (2020, registration GJ-05-TH-6234, insurance due Jul 2026). Honda Activa 6G (2022, GJ-05-PK-8821, daily market errands).' },
    { type: 'fact',         key: 'business',               value: 'Patel Textile Traders (proprietorship) — cotton and synthetic fabric wholesale, Maskati Market, Surat. 16 years in trade, 3 regular buyers in Ahmedabad/Mumbai/Coimbatore.' },
    { type: 'fact',         key: 'business_peak_season',   value: 'Oct–Dec is peak season (Diwali + wedding season) — turnover 40% higher. Cash flow is tight Apr–Jun (off-season inventory buildup).' },
    { type: 'preference',   key: 'work_style',             value: 'Market hours 10am–7pm at Maskati Market (Mon–Sat). Reviews ledger and accounts at home 8–9am before leaving. Uses Tally Prime for accounts, WhatsApp for all client communication.' },
    { type: 'preference',   key: 'diet',                   value: 'Strictly Jain vegetarian — no root vegetables (no onion, garlic, potato, carrot), no meat/eggs, dairy ok. Meena prepares all meals from scratch. Prefers simple Gujarati thali.' },
    { type: 'preference',   key: 'communication_style',    value: 'WhatsApp-first for business; prefers verbal agreements with long-term clients (Sai Garments, Lalitha Sarees); formal written contracts with new clients (MK Fashion).' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Gujarat Samachar (Gujarati newspaper) every morning; Economic Times for business news; Textile Industry Monthly trade magazine; occasional Gujarati devotional texts on Sunday.' },
    { type: 'goal',         key: 'business_goal',          value: 'Expand warehouse to 5,000 sq ft in Kapodra Industrial Area by March 2027; add polyester-viscose blend line to diversify from pure cotton dependency.' },
    { type: 'goal',         key: 'financial_goal',         value: 'Aryan\'s engineering education corpus: ₹18L by 2027 (currently ₹9.2L in FD + ELSS). HDFC business loan ₹4.8L — clear by December 2026 to save ₹58,000/year interest.' },
    { type: 'goal',         key: 'family_goal',            value: 'Aryan (16, Class 11 Science) targeting NIT/BITS Pilani for engineering. JEE coaching fees ₹1.8L/year at Resonance coaching. Priya (13, Class 8) excels in dance.' },
    { type: 'concern',      key: 'supplier_dependency',    value: 'Girish Textile Mills (Ahmedabad) supplies 60% of cotton inventory. Price volatility in 2025–26 harvest season created margin pressure. Need alternative supplier.' },
    { type: 'concern',      key: 'cash_flow',              value: 'MK Fashion Mumbai pays 45–60 days after delivery — creates ITC (Input Tax Credit) blockage under GST. Outstanding as of May 2026: ₹2,52,000 (invoice RP-2026-002, 30 days overdue).' },
    { type: 'relationship', key: 'family',                 value: 'Meena Patel (wife, birthday Oct 3, part-time tailoring ₹8K/month, manages household). Aryan (16, son, cricket, JEE prep). Priya (13, daughter, Bharatnatyam dance, 85% in Class 8).' },
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
    { name: 'Morning Puja 30 min',           icon: '🪔', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '06:30', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Brisk Walk 45 min',             icon: '🚶', color: 'emerald', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:00', completedOffsets: [0,1,2,3,4,6,7,8,9,10,12,13,14,15,16,18,19,20] },
    { name: 'Business Ledger Review 30 min', icon: '📊', color: 'amber',   frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '08:00', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'Gujarat Samachar Read',         icon: '📰', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:45', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Family Dinner by 8pm',          icon: '🍽️', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '20:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20] },
    { name: 'Maskati Market Early Visit',    icon: '🏪', color: 'violet',  frequency: 'custom',   days_of_week: [6],             reminder_time: '09:00', completedOffsets: [6,13,20] },
    { name: 'Sunday Temple + Family Time',   icon: '🕌', color: 'purple',  frequency: 'custom',   days_of_week: [0],             reminder_time: '08:00', completedOffsets: [0,7,14] },
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
    daily_goal: 2, ambient_sound: null, notifications_blocked: false,
  }, { onConflict: 'user_id' })

  // IST = UTC+5:30: 09:00 IST = T03:30:00Z, 10:00 IST = T04:30:00Z, 08:00 IST = T02:30:00Z
  const sessions = [
    { off: 0,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Family financial planning — Aryan education fund FD + ELSS allocation',    time: '02:30' },
    { off: 1,  mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'Sai Garments order: 500m cotton — quality checklist and dispatch note',      time: '03:30' },
    { off: 2,  mode: 'deep',     plan: 75,  act: 72,  done: true,  title: 'MK Fashion proposal — polyester-viscose pricing negotiation prep',            time: '03:30' },
    { off: 3,  mode: 'pomodoro', plan: 25,  act: 25,  done: true,  title: 'GSTR-1 April reconciliation — invoice matching with sales register',          time: '03:30' },
    { off: 4,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Warehouse expansion research — 3 Kapodra area properties compared',          time: '03:30' },
    { off: 5,  mode: 'pomodoro', plan: 50,  act: 47,  done: true,  title: 'SIDBI loan application — financial projections and collateral documents',     time: '03:30' },
    { off: 6,  mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'Saturday market brief — cotton bale prices and new supplier contact list',    time: '02:30' },
    { off: 7,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'Zoho Inventory trial — April stock movements import and testing',             time: '02:30' },
    { off: 8,  mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'MK Fashion follow-up — invoice RP-2026-002 and MSME payment enforcement',   time: '03:30' },
    { off: 9,  mode: 'deep',     plan: 60,  act: 57,  done: true,  title: 'Polyester-viscose supplier research — Surat Textile Park listings',           time: '03:30' },
    { off: 10, mode: 'pomodoro', plan: 25,  act: 25,  done: true,  title: 'Advance tax Q1 estimate — FY 2026-27 projected income calculation',           time: '04:30' },
    { off: 11, mode: 'deep',     plan: 75,  act: 73,  done: true,  title: 'HDFC business loan — prepayment penalty review and July 2026 payoff plan',   time: '03:30' },
    { off: 12, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'Lalitha Sarees quote — silk-cotton blend 250m costing and markup calc',     time: '03:30' },
    { off: 13, mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'Tirupati trip planning — IRCTC train booking and TTD darshan slot',           time: '02:30' },
    { off: 14, mode: 'deep',     plan: 90,  act: 87,  done: true,  title: 'Zoho Inventory setup — supplier + customer master data entry (Phase 2)',      time: '02:30' },
    { off: 15, mode: 'pomodoro', plan: 50,  act: 50,  done: true,  title: 'Sai Garments May repeat order — cotton pricing and margins for June',        time: '03:30' },
    { off: 16, mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Business 5-year P&L analysis — margin trends and peak season breakdown',     time: '03:30' },
    { off: 17, mode: 'pomodoro', plan: 25,  act: 25,  done: true,  title: 'GSTR-3B May ITC reconciliation — input credit vs output liability',           time: '03:30' },
    { off: 19, mode: 'deep',     plan: 75,  act: 72,  done: true,  title: 'Manali trip planning — HP Tourism Volvo buses and hotel shortlist for Oct',   time: '03:30' },
    { off: 20, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'Annual business review — Q1 2026-27 turnover + client performance summary',  time: '02:30' },
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
      question: 'Should I expand into polyester-viscose blend fabrics to reduce cotton dependency?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-04-22T03:30:00Z', favorite: true,
      result: {
        summary: 'Cotton makes up 85% of current inventory. Polyester-viscose blends are growing 18%/year in Indian apparel market due to lower cost (25–30% cheaper) and superior drape for kurtis and lehengas. MK Fashion specifically requested blend options in April. Surat Textile Park has 4 suppliers already stocking them.',
        recommendation: 'Expand into polyester-viscose blends — start with a ₹3 lakh trial order from 2 Surat Textile Park suppliers in Q3 2026 (July). Use existing MK Fashion and Lalitha Sarees relationships as first buyers.',
        confidenceScore: 82, riskScore: 28, riskLevel: 'low',
        financialImpact: { summary: '₹3L trial investment. Target ₹8–12L additional revenue in FY 2026-27 at 18% margin.', monthlyCostChange: 0, oneTimeCost: 300000, opportunityCost: '₹3L tied up in inventory for 45–60 days before buyers pay', affordabilityScore: 78 },
        pros: ['Reduces single-supplier (Girish Textile Mills) and single-product concentration risk', 'MK Fashion ready buyer — confirmed interest in April meeting', 'Polyester-viscose margins (18–22%) are comparable to cotton (15–20%) but more stable'],
        cons: ['New product category requires learning curve — quality parameters different from cotton', 'Additional storage space needed (already at warehouse capacity)'],
        nextSteps: ['Visit Surat Textile Park for supplier meetings in June 2026', 'Get samples from 3 suppliers — send to MK Fashion and Lalitha Sarees for approval', 'Only expand fully after warehouse expansion is confirmed (Q4 2026)'],
        memoryFactorsUsed: ['Business goal: polyester-viscose by Q4 2026', 'Concern: Girish Textile Mills 60% dependency'],
        dataSourcesUsed: ['India apparel fabric market report 2026', 'Surat Textile Park supplier directory'],
      },
    },
    {
      question: 'SIDBI loan ₹25 lakh vs NBFC loan for warehouse expansion — which to choose?',
      category: 'business', mode: 'compare', options: ['SIDBI MSME Loan (₹25L)', 'NBFC Business Loan (Bajaj Finserv)'],
      created_at: '2026-04-30T03:30:00Z', favorite: false,
      result: {
        question: 'SIDBI MSME loan vs Bajaj Finserv NBFC for ₹25L warehouse expansion',
        factors: ['Interest rate', 'Approval speed', 'Processing hassle', 'Collateral requirement', 'Repayment flexibility'],
        options: [
          { label: 'SIDBI MSME Loan (₹25L)', scores: { 'Interest rate': 90, 'Approval speed': 45, 'Processing hassle': 40, 'Collateral requirement': 55, 'Repayment flexibility': 70 },
            pros: ['8.5–9.5% interest rate — 4–6% lower than NBFC', 'Government MSME scheme — partial guarantee reduces personal collateral', 'Longer tenure options (5–7 years) reduce monthly EMI burden'],
            cons: ['3–5 month approval process — warehouse property may be taken by then', 'Requires Udyam certificate, 3 years ITR, GST returns, CA-certified financials', 'SIDBI agent approached for ₹5,000 processing fee — suspicious (likely fraud)'],
            summary: 'Best rate but slow and bureaucratic. Fraud risk from agents.' },
          { label: 'NBFC Business Loan (Bajaj Finserv)', scores: { 'Interest rate': 45, 'Approval speed': 85, 'Processing hassle': 80, 'Collateral requirement': 75, 'Repayment flexibility': 65 },
            pros: ['Approval in 3–5 days — can secure warehouse property quickly', 'Minimal paperwork — Udyam + GST + bank statements sufficient', 'Online tracking and prepayment allowed'],
            cons: ['14–18% interest rate — ₹4.2–5.4L more interest over 5 years vs SIDBI', 'Higher EMI at short tenure puts cash flow pressure in off-season (Apr–Jun)'],
            summary: 'Faster and easier but significantly more expensive.' },
        ],
        recommendation: 'Apply for SIDBI loan NOW and simultaneously negotiate with Bajaj Finserv as a backup. If SIDBI approval comes within 60 days (before the Kapodra property deal closes), proceed with SIDBI. If not, use Bajaj Finserv and refinance to SIDBI in Year 2 when the business can absorb the cost.',
        winner: 'SIDBI MSME Loan (₹25L)',
      },
    },
    {
      question: 'Should I switch fabric inventory management from Excel to Zoho Inventory?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-04T03:30:00Z', favorite: false,
      result: {
        summary: 'Current Excel system has 3 known problems: double-billing risk (happened once in 2024), no real-time stock visibility, and GST invoice generation requires re-entry into Tally. Zoho Inventory integrates with Tally and WhatsApp Business — both tools already used. 30-day free trial ongoing; import of April data was successful.',
        recommendation: 'Migrate to Zoho Inventory Standard (₹3,599/year). The ROI is clear: 1–2 hours saved daily on manual entry, GST integration, and reduced billing errors. April trial showed all existing workflows can be replicated.',
        confidenceScore: 85, riskScore: 15, riskLevel: 'low',
        financialImpact: { summary: '₹3,599/year (≈₹300/month). Saves 1.5 hours daily @ ₹350/hour implicit cost = ₹15,750/month savings.', monthlyCostChange: -300, oneTimeCost: 3599, opportunityCost: '8 hours migration effort + 1 week learning curve', affordabilityScore: 97 },
        pros: ['WhatsApp invoice sending — clients prefer it', 'Real-time stock levels prevent overselling', 'GST-compliant GSTR-1 auto-population reduces CA time', 'Meena can access inventory from home — better household business visibility'],
        cons: ['Aryan needs to learn Zoho to help with data entry (minor)', 'Annual subscription adds to fixed costs'],
        nextSteps: ['Complete migration in May 2026 before June GST filing season', 'Train Meena on basic stock entry view', 'Connect Zoho to Tally via Zoho Books API integration'],
        memoryFactorsUsed: ['Work style: uses Tally Prime for accounts', 'Communication: WhatsApp for all client communication'],
        dataSourcesUsed: ['Zoho Inventory pricing May 2026', 'SME accounting software India 2026'],
      },
    },
    {
      question: 'Aryan\'s Class 11 board: CBSE or ICSE — which is better for IIT/NIT JEE preparation?',
      category: 'family', mode: 'compare', options: ['CBSE Board (Class 11)', 'ICSE Board (Class 11)'],
      created_at: '2026-05-06T03:30:00Z', favorite: true,
      result: {
        question: 'CBSE vs ICSE for Aryan\'s Class 11 engineering aspirant',
        factors: ['JEE alignment', 'Coaching compatibility', 'Subject depth', 'Marks inflation', 'Stress level'],
        options: [
          { label: 'CBSE Board (Class 11)', scores: { 'JEE alignment': 92, 'Coaching compatibility': 90, 'Subject depth': 75, 'Marks inflation': 80, 'Stress level': 72 },
            pros: ['JEE syllabus is 90% CBSE — direct alignment minimises dual-track study burden', 'Resonance coaching (where Aryan is enrolled) uses CBSE textbooks', 'National benchmark — easier college comparison for NITs/IITs'],
            cons: ['CBSE Physics and Chemistry are less deep than ICSE', 'More rote-learning style vs conceptual depth'],
            summary: 'JEE-optimal, coaching-compatible, lower dual-study burden.' },
          { label: 'ICSE Board (Class 11)', scores: { 'JEE alignment': 55, 'Coaching compatibility': 50, 'Subject depth': 88, 'Marks inflation': 65, 'Stress level': 45 },
            pros: ['Stronger conceptual depth in Science — better for advanced understanding', 'English and literature components improve communication skills'],
            cons: ['ICSE syllabus diverges from JEE — Aryan will need to study board + coaching simultaneously', 'Resonance coaching assumes CBSE — extra effort to reconcile topics', 'Higher workload risk during Class 12 — JEE + ICSE boards simultaneously'],
            summary: 'Deeper education but significantly harder to manage alongside JEE coaching.' },
        ],
        recommendation: 'CBSE for Aryan. With Resonance coaching already running on CBSE framework, switching to ICSE would create unnecessary friction. The marginal conceptual depth benefit of ICSE does not outweigh the JEE alignment advantage of CBSE.',
        winner: 'CBSE Board (Class 11)',
      },
    },
    {
      question: 'Should I hire 2 full-time helpers for Oct–Dec 2026 peak season or use a day-labour agent?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-08T03:30:00Z', favorite: false,
      result: {
        summary: 'Oct–Dec 2026 is projected to be 35–40% higher turnover than off-season (based on 3-year average). Last year, Rajesh managed peak season with 1 permanent helper + ad-hoc day labourers via Ramesh agency (₹600/day). The ad-hoc approach created 3 dispatch delays in December 2025. Full-time helpers provide reliability but add fixed cost.',
        recommendation: 'Hire 1 full-time additional helper (not 2) from September 2026. Supplement with Ramesh agency for the highest-volume December weeks. This balances reliability and cost. Full-time helper annual cost: ₹2.4L/year — well within projected incremental revenue.',
        confidenceScore: 76, riskScore: 22, riskLevel: 'low',
        financialImpact: { summary: '1 FT helper: ₹20K/month = ₹60K for 3 months peak. vs ad-hoc: ₹600/day × 60 days = ₹36K + reliability risk.', monthlyCostChange: 20000, oneTimeCost: 0, opportunityCost: 'Management overhead for new hire', affordabilityScore: 82 },
        pros: ['Eliminates dispatch delays that cost goodwill with Sai Garments (3 complaints Dec 2025)', 'Full-time helper can be trained on Zoho Inventory before Oct', 'Marginal cost vs benefit strongly positive given projected revenue'],
        cons: ['Fixed cost during off-season (Jan–Mar) — need part-time option or short-term contract'],
        nextSteps: ['Place hiring ad in Maskati Market notice board by August', 'Offer 3-month contract with option to extend — avoids long-term fixed cost', 'Train on Zoho before October when volume starts rising'],
        memoryFactorsUsed: ['Business peak season: Oct–Dec', 'Business concern: dispatch reliability'],
        dataSourcesUsed: ['Surat textile market seasonal patterns', 'SME Surat labour rates 2026'],
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
  const sg = await ins('business_clients', {
    user_id: UID, name: 'Sai Garments Pvt Ltd', company: 'Sai Garments Pvt Ltd',
    email: 'purchase@saigarments.co.in', phone: '+917926440088', address: 'GIDC Estate, Naroda, Ahmedabad 382330', currency: 'INR',
    notes: 'Long-standing client — 8 years. Purchases cotton fabric for kurta manufacturing. Pays within 30 days. 500–1,200m/order.',
  }, 'client: Sai Garments Ahmedabad')
  const mk = await ins('business_clients', {
    user_id: UID, name: 'MK Fashion Exports', company: 'MK Fashion Exports Pvt Ltd',
    email: 'sourcing@mkfashion.in', phone: '+912226553300', address: 'SEEPZ-SEZ, Andheri East, Mumbai 400093', currency: 'INR',
    notes: 'Garment exporter — buys synthetic blends and cotton for export orders. Pays 45–60 days (MSME late payer). High volume but slow payments.',
  }, 'client: MK Fashion Mumbai')
  const ls = await ins('business_clients', {
    user_id: UID, name: 'Lalitha Sarees', company: 'Lalitha Sarees & Textiles',
    email: 'orders@lalithasarees.com', phone: '+914222550022', address: 'Gandhipuram, Coimbatore 641012', currency: 'INR',
    notes: 'Saree and ethnic wear retailer. Buys silk-cotton blends and georgette. Smaller orders (200–350m), pays within 15 days. Reliable client.',
  }, 'client: Lalitha Sarees Coimbatore')
  if (!sg || !mk || !ls) return

  const projSG = await ins('business_projects', {
    user_id: UID, client_id: sg.id, name: 'Sai Garments — Cotton Fabric Supply FY 2026-27',
    status: 'active', start_date: '2026-04-01', end_date: '2027-03-31',
    fee: 250, currency: 'INR', notes: 'Annual supply agreement. Rate ₹250–300/meter depending on cotton quality. ~1,000m/month avg.',
  }, 'project: Sai Garments supply')
  const projMK = await ins('business_projects', {
    user_id: UID, client_id: mk.id, name: 'MK Fashion — Synthetic & Cotton Fabric Supply',
    status: 'active', start_date: '2025-10-01', end_date: null,
    fee: 300, currency: 'INR', notes: 'Ongoing supply. MK places large irregular orders (600–900m). Pays 45–60 days.',
  }, 'project: MK Fashion supply')
  const projLS = await ins('business_projects', {
    user_id: UID, client_id: ls.id, name: 'Lalitha Sarees — Silk-Cotton Blend Supply',
    status: 'active', start_date: '2026-01-01', end_date: '2026-12-31',
    fee: 340, currency: 'INR', notes: 'Specialty silk-cotton and georgette blends. 250m orders every 6–8 weeks.',
  }, 'project: Lalitha Sarees supply')

  if (projSG) {
    await ins('business_invoices', {
      user_id: UID, client_id: sg.id, project_id: projSG.id,
      invoice_no: 'RP-2026-001', issued_at: '2026-03-31', due_at: '2026-04-30',
      items: [{ description: 'Cotton fabric supply — 500 meters @ ₹250/meter (March 2026)', qty: 500, rate: 250, amount: 125000 }],
      subtotal: 125000, tax_pct: 5, tax_amt: 6250, discount_amt: 0, total: 131250, currency: 'INR', status: 'paid', paid_at: '2026-04-28',
    }, 'invoice: RP-2026-001 (paid)')
  }
  if (projMK) {
    await ins('business_invoices', {
      user_id: UID, client_id: mk.id, project_id: projMK.id,
      invoice_no: 'RP-2026-002', issued_at: '2026-04-10', due_at: '2026-05-10',
      items: [{ description: 'Cotton fabric supply — 800 meters @ ₹300/meter (April 2026)', qty: 800, rate: 300, amount: 240000 }],
      subtotal: 240000, tax_pct: 5, tax_amt: 12000, discount_amt: 0, total: 252000, currency: 'INR', status: 'sent',
    }, 'invoice: RP-2026-002 (sent — overdue)')
  }
  if (projLS) {
    await ins('business_invoices', {
      user_id: UID, client_id: ls.id, project_id: projLS.id,
      invoice_no: 'RP-2026-003', issued_at: '2026-05-05', due_at: '2026-05-20',
      items: [{ description: 'Silk-cotton blend fabric — 250 meters @ ₹340/meter', qty: 250, rate: 340, amount: 85000 }],
      subtotal: 85000, tax_pct: 5, tax_amt: 4250, discount_amt: 0, total: 89250, currency: 'INR', status: 'draft',
    }, 'invoice: RP-2026-003 (draft)')
  }

  const expenses = [
    { category: 'transport', vendor: 'Vijay Roadlines', amount: 3800, occurred_at: '2026-04-10', description: 'Freight: 800m cotton fabric from Girish Textile Mills Ahmedabad to Surat warehouse' },
    { category: 'transport', vendor: 'DTDC Courier', amount: 1200, occurred_at: '2026-04-15', description: 'Sample dispatch: 2m swatches to MK Fashion and Lalitha Sarees (express delivery)' },
    { category: 'software', vendor: 'Zoho', amount: 3599, occurred_at: '2026-05-01', description: 'Zoho Inventory Standard — annual plan. Trial-to-paid conversion.' },
    { category: 'professional', vendor: 'CA Dhruv Shah & Associates', amount: 8500, occurred_at: '2026-04-15', description: 'CA fees: GST return filing (GSTR-1 + GSTR-3B) for March 2026' },
  ]
  let n = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'INR', is_billable: false, ...e })
    if (!error) n++; else console.log(`  ✗  expense: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${expenses.length} business expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const ciaz = await ins('home_assets', { user_id: UID, name: 'Maruti Suzuki Ciaz VXi (2020)', type: 'vehicle', brand: 'Maruti Suzuki', model: 'Ciaz VXi (BS6)', purchased_at: '2020-06-15', warranty_until: '2023-06-15', cost: 930000, notes: 'Registration GJ-05-TH-6234. Insurance due July 31 2026. Used for family outings, client visits in Surat.' }, 'asset: Maruti Ciaz')
  const activa = await ins('home_assets', { user_id: UID, name: 'Honda Activa 6G (2022)', type: 'vehicle', brand: 'Honda', model: 'Activa 6G Deluxe', purchased_at: '2022-03-10', warranty_until: '2024-03-10', cost: 88000, notes: 'Registration GJ-05-PK-8821. Daily market commute (Varachha to Maskati Market, 4km). Meena also uses for errands.' }, 'asset: Honda Activa')
  const ac = await ins('home_assets', { user_id: UID, name: 'Voltas 1.5T 5-Star Inverter AC', type: 'appliance', brand: 'Voltas', model: '185V Vectra Platina (2022)', purchased_at: '2022-04-01', warranty_until: '2027-04-01', cost: 44000, notes: 'Living room AC. Heavily used May–Sep. Annual service due April 2026 — overdue.' }, 'asset: Voltas AC')
  const tv = await ins('home_assets', { user_id: UID, name: 'Samsung 55" Crystal 4K UHD Smart TV', type: 'electronics', brand: 'Samsung', model: 'UA55AUE60AK', purchased_at: '2022-10-15', warranty_until: '2024-10-15', cost: 55000, notes: 'Living room — Aryan uses for YouTube/cricket; Priya for dance tutorials.' }, 'asset: Samsung TV')
  const laptop = await ins('home_assets', { user_id: UID, name: 'Lenovo ThinkPad E14 Gen 4', type: 'electronics', brand: 'Lenovo', model: 'ThinkPad E14 Gen 4 (AMD Ryzen 5)', purchased_at: '2023-07-20', warranty_until: '2026-07-20', cost: 65000, notes: 'Business laptop — Tally Prime, Zoho Inventory, GST portal, bank NEFT. Aryan also uses for JEE coaching online.' }, 'asset: Lenovo ThinkPad')

  if (ciaz) {
    await ins('home_maintenance', { user_id: UID, asset_id: ciaz.id, title: 'Ciaz Annual Service (Maruti Authorised)', category: 'service', recurrence_months: 12, last_done_at: '2025-06-10', next_due_at: '2026-06-10', vendor: 'Maruti Suzuki Arena, Varachha Road Surat', cost: 8500, is_active: true }, 'maint: Ciaz annual service')
    await ins('home_maintenance', { user_id: UID, asset_id: ciaz.id, title: 'Ciaz Insurance Renewal (Comprehensive)', category: 'service', recurrence_months: 12, last_done_at: '2025-07-31', next_due_at: '2026-07-31', vendor: 'HDFC Ergo / New India Assurance', cost: 14000, is_active: true, notes: 'Comprehensive insurance due July 31. Compare HDFC Ergo vs Bajaj Allianz before renewal.' }, 'maint: Ciaz insurance')
  }
  if (activa) await ins('home_maintenance', { user_id: UID, asset_id: activa.id, title: 'Activa 6-Month Service', category: 'service', recurrence_months: 6, last_done_at: '2025-12-10', next_due_at: '2026-06-10', vendor: 'Honda Care Varachha Road', cost: 1800, is_active: true }, 'maint: Activa service')
  if (ac) await ins('home_maintenance', { user_id: UID, asset_id: ac.id, title: 'Voltas AC Annual Service + Gas Top-Up', category: 'service', recurrence_months: 12, last_done_at: '2025-04-20', next_due_at: '2026-04-20', vendor: 'Voltas Authorised Service, Surat', cost: 2200, is_active: true, notes: 'Overdue by 20 days — schedule before summer peak temperatures (40°C+ in May).' }, 'maint: AC service')

  const bills = [
    { utility: 'electricity', provider: 'MGVCL (Madhya Gujarat Vij Company)', amount: 5100, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'MGVCL-35-4421098' },
    { utility: 'electricity', provider: 'MGVCL (Madhya Gujarat Vij Company)', amount: 4850, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'MGVCL-35-4421098' },
    { utility: 'electricity', provider: 'MGVCL (Madhya Gujarat Vij Company)', amount: 5400, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'MGVCL-35-4421098' },
    { utility: 'water', provider: 'SUDA / SMC Water', amount: 760, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'SMC-WTR-88214' },
    { utility: 'water', provider: 'SUDA / SMC Water', amount: 790, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'SMC-WTR-88214' },
    { utility: 'water', provider: 'SUDA / SMC Water', amount: 810, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'SMC-WTR-88214' },
    { utility: 'internet', provider: 'Jio Fiber (Premium 300 Mbps)', amount: 999, bill_date: '2026-03-05', due_date: '2026-03-10', is_paid: true, account_no: 'JIO-FBR-SRT-88210' },
    { utility: 'internet', provider: 'Jio Fiber (Premium 300 Mbps)', amount: 999, bill_date: '2026-04-05', due_date: '2026-04-10', is_paid: true, account_no: 'JIO-FBR-SRT-88210' },
    { utility: 'internet', provider: 'Jio Fiber (Premium 300 Mbps)', amount: 999, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'JIO-FBR-SRT-88210' },
    { utility: 'phone', provider: 'Airtel Postpaid Family (3 lines)', amount: 1299, bill_date: '2026-03-15', due_date: '2026-03-25', is_paid: true, account_no: 'AIR-PP-SRT-44219' },
    { utility: 'phone', provider: 'Airtel Postpaid Family (3 lines)', amount: 1299, bill_date: '2026-04-15', due_date: '2026-04-25', is_paid: true, account_no: 'AIR-PP-SRT-44219' },
    { utility: 'phone', provider: 'Airtel Postpaid Family (3 lines)', amount: 1299, bill_date: '2026-05-15', due_date: '2026-05-25', is_paid: false, account_no: 'AIR-PP-SRT-44219' },
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
  const tirupati = await ins('trips', { user_id: UID, destination: 'Tirupati, Andhra Pradesh', start_date: '2026-08-09', end_date: '2026-08-11', status: 'planning', budget_total: 32000, currency: 'INR', travellers: 4, notes: 'Family pilgrimage — Rajesh, Meena, Aryan, Priya. TTD Darshan booking required 45 days in advance. Sri Vari darshan.', cover_emoji: '🙏' }, 'trip: Tirupati pilgrimage')
  if (tirupati) {
    const items = [
      { type: 'transport', title: 'Train: Surat → Tirupati (Tirupati Exp 16687)', starts_at: '2026-08-09T06:15:00+05:30', location: 'Surat Railway Station', cost: 7200, order_index: 1, notes: '4 tickets (2A class) ₹1,800 each — book via IRCTC immediately (60-day window opens Jun 9)' },
      { type: 'hotel', title: 'Bhimas Deluxe Hotel — 2 nights', starts_at: '2026-08-09T20:00:00+05:30', ends_at: '2026-08-11T10:00:00+05:30', location: 'Tirupati, Andhra Pradesh', cost: 6400, order_index: 2, notes: '₹3,200/night family room. Walking distance to temple buses.' },
      { type: 'activity', title: 'TTD Darshan (SSD Special Entry Darshan)', starts_at: '2026-08-10T06:00:00+05:30', location: 'Tirumala Temple, Tirupati', cost: 1200, order_index: 3, notes: '4 × ₹300 SSD darshan — book on TTD portal exactly 60 days before (Jun 10).' },
      { type: 'activity', title: 'Prashad + Laddu (official TTD laddu)', starts_at: '2026-08-10T10:00:00+05:30', location: 'Tirumala, Tirupati', cost: 400, order_index: 4, notes: '4 × ₹100 official laddu prasad' },
      { type: 'transport', title: 'Train: Tirupati → Surat (return)', starts_at: '2026-08-11T15:30:00+05:30', location: 'Tirupati Railway Station', cost: 7200, order_index: 5, notes: '4 × ₹1,800 return tickets — book same time as outbound' },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: tirupati.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Aadhaar cards (all 4)', category: 'documents', qty: 4, is_packed: false },
      { item: 'TTD Darshan booking printout', category: 'documents', qty: 1, is_packed: false },
      { item: 'Traditional clothes (dhoti for Rajesh, sarees for Meena/Priya)', category: 'clothing', qty: 4, is_packed: false },
      { item: 'Comfortable footwear (no leather allowed in temple)', category: 'clothing', qty: 4, is_packed: false },
      { item: 'Cash ₹5,000 (donations, prasad, incidentals)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Jain snacks for train (Meena will prepare)', category: 'health', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: tirupati.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Tirupati: ${iOk} items, ${pOk} packing`)
  }

  const mumbai = await ins('trips', { user_id: UID, destination: 'Mumbai, Maharashtra', start_date: '2026-04-15', end_date: '2026-04-15', status: 'completed', budget_total: 8500, currency: 'INR', travellers: 1, notes: 'Business trip — MK Fashion sourcing meeting + India International Textile Expo at BKC.', cover_emoji: '🏢' }, 'trip: Mumbai business')
  if (mumbai) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: mumbai.id, type: 'transport', title: 'Vande Bharat Express ST → CSTM (Surat to Mumbai)', starts_at: '2026-04-15T06:25:00+05:30', location: 'Surat Railway Station', cost: 1800, is_done: true, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: mumbai.id, type: 'activity', title: 'MK Fashion office meeting — sourcing negotiation', starts_at: '2026-04-15T12:00:00+05:30', location: 'SEEPZ-SEZ, Andheri East, Mumbai', cost: 0, is_done: true, order_index: 2 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: mumbai.id, type: 'transport', title: 'Vande Bharat return CSTM → ST', starts_at: '2026-04-15T19:05:00+05:30', location: 'CSMT Mumbai', cost: 1800, is_done: true, order_index: 3 })
  }

  const manali = await ins('trips', { user_id: UID, destination: 'Shimla & Manali, Himachal Pradesh', start_date: '2026-10-10', end_date: '2026-10-14', status: 'planning', budget_total: 120000, currency: 'INR', travellers: 4, notes: 'Family holiday — Aryan\'s 17th birthday gift (Oct 12). First hill station trip for the family.', cover_emoji: '🏔️' }, 'trip: Manali family')
  if (manali) {
    const items = [
      { type: 'flight', title: 'IndiGo 6E Surat → Delhi (all 4)', starts_at: '2026-10-10T07:00:00+05:30', location: 'Surat Airport (STV)', cost: 28000, order_index: 1, notes: '4 tickets ≈ ₹7,000 each' },
      { type: 'transport', title: 'HRTC Volvo AC: Delhi ISBT → Manali', starts_at: '2026-10-10T17:00:00+05:30', location: 'ISBT Kashmere Gate, New Delhi', cost: 6400, order_index: 2, notes: '4 × ₹1,600 — overnight bus, 14 hours' },
      { type: 'hotel', title: 'Snow Valley Resorts Manali (3 nights)', starts_at: '2026-10-11T10:00:00+05:30', ends_at: '2026-10-14T10:00:00+05:30', location: 'Old Manali, Manali 175131', cost: 24000, order_index: 3, notes: '₹8,000/night family room. Mountain view, Beas River walking distance.' },
      { type: 'activity', title: 'Rohtang Pass day excursion (snowfall!)', starts_at: '2026-10-12T07:00:00+05:30', location: 'Rohtang Pass, Manali', cost: 8000, order_index: 4, notes: 'Aryan\'s birthday — snow for the first time! Hired jeep ₹2,000 + activity fees' },
      { type: 'flight', title: 'IndiGo 6E Delhi → Surat (return, all 4)', starts_at: '2026-10-14T20:00:00+05:30', location: 'Indira Gandhi International Airport, Delhi', cost: 26000, order_index: 5 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: manali.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Manali: ${iOk} items`)
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: '"GST Refund Pending" SMS from Fake GSTN Portal', content: 'GSTN ALERT: Your GST refund of Rs.48,230 is approved. Click here to claim: bit.ly/gst-refund-rp22 within 48 hours. Ref: GST/REF/2026/044812. Helpline: 1800-XXX-XXXX', risk_level: 'high', result_summary: 'This is a GST impersonation phishing scam. GSTN (GST Network) never sends refund notifications via SMS with shortened URLs. All legitimate GST refund processing happens only through the official GST portal (gst.gov.in) and requires a valid GSTIN login — no SMS links.', red_flags: ['GSTN never uses bit.ly shortened links', 'GST refunds are credited directly to bank — no claim link required', '"48 hours" urgency is a manipulation tactic', 'Fake helpline number (not 1800-103-4786 official GSTN helpline)'], safe_next_step: 'Delete the SMS. Check actual GST refund status at gst.gov.in by logging in with your GSTIN. Report to cybercrime.gov.in. Never click SMS links from financial authorities.' },
    { type: 'scam', title: 'Fake MK Fashion Payment Email + Banking Credential Phishing', content: 'Dear Rajesh ji, The payment of Rs.2,52,000 against invoice RP-2026-002 has been initiated. Please login to your HDFC Business Banking portal to confirm receipt: hdfcbank-netbanking-verify.com/corporate-confirm. Thank you. MK Fashion Accounts Team.', risk_level: 'high', result_summary: 'This is a phishing email disguised as a supplier payment confirmation. The domain "hdfcbank-netbanking-verify.com" is not HDFC Bank (official: hdfcbank.com). Clicking the link would lead to a fake banking portal designed to steal corporate netbanking credentials.', red_flags: ['Domain "hdfcbank-netbanking-verify.com" is fraudulent — not hdfcbank.com', 'HDFC Bank never asks you to "confirm receipt" via external links', 'MK Fashion would not send this — they know direct bank credit doesn\'t require confirmation', 'The phrasing "Rajesh ji" is social engineering for familiarity'], safe_next_step: 'Do NOT click. Log in to HDFC Business Banking directly at hdfcbank.com (type manually). Check if payment actually arrived. Call MK Fashion directly to verify. Report to cybercrime.gov.in.' },
    { type: 'scam', title: 'SIDBI Loan Agent Requesting ₹5,000 "Processing Fee"', content: 'Sir, I am from SIDBI\'s MSME loan department. Your loan of ₹25 lakhs is pre-approved. To proceed with the sanction letter, please pay ₹5,000 processing fee via UPI to ID: sidbiloanhelp@paytm. We will waive this from your disbursement amount.', risk_level: 'medium', result_summary: 'Fraudulent SIDBI impersonation. SIDBI does not collect processing fees via UPI or advance payment. Legitimate SIDBI loan processing fees (if applicable) are deducted from the disbursed loan amount — never paid in advance via UPI. This agent is either a middleman scammer or not affiliated with SIDBI at all.', red_flags: ['SIDBI never collects fees via UPI before loan sanction', '"Waive from disbursement" is a common scam framing — money collected, loan never disburses', 'No official SIDBI communication comes via mobile call with UPI payment requests'], safe_next_step: 'Do not pay. Verify SIDBI loan status only through sidbi.in or their official helpline (1800-22-6753). If you need a SIDBI loan, apply directly on the SIDBI portal or through Axis Bank/SBI MSME desk.' },
    { type: 'scam', title: 'MGVCL Smart Meter Replacement Demand + Upfront Fee', content: 'Dear Consumer, MGVCL is mandatorily upgrading all meters to Smart AMI meters in Varachha zone. Your old meter will be disconnected in 3 days unless you pay ₹2,800 installation fee. Contact 9XXX-XXXXXX immediately.', risk_level: 'medium', result_summary: 'MGVCL is conducting AMI smart meter rollouts in Surat, but they do NOT charge consumers any upfront fees. The installation cost is borne by MGVCL/Government. This phone call is either a fraudulent scammer using the real meter rollout news as cover.', red_flags: ['MGVCL smart meter installation is free for consumers under central government scheme', '"3 days disconnection" threat to create panic', 'Private mobile number — official MGVCL communication uses official channels'], safe_next_step: 'Do not pay. Call MGVCL official helpline 19121 to verify your meter replacement status. Smart meter replacement in Surat is genuine but free — no payment required.' },
    { type: 'quote', title: 'New India Assurance vs Star Health Family Health Insurance Comparison', content: 'New India Assurance Family Floater (₹10L coverage, 4 members): ₹28,400/year. Star Health Family Health Optima (₹10L, 4 members): ₹32,100/year. Both include pre-existing disease coverage after 2 years. Star Health has cashless network of 14,000 hospitals vs New India\'s 8,000.', risk_level: 'low', result_summary: 'Both are legitimate and well-rated insurers. New India saves ₹3,700/year but Star Health\'s larger cashless network (14,000 vs 8,000) is more relevant for a family in Surat city. Aryan at 16 has no pre-existing conditions — the 2-year waiting period is not a concern for a new policy.', red_flags: [], safe_next_step: 'Opt for Star Health Family Health Optima at ₹32,100 if cashless hospital access matters. Or compare Niva Bupa (formerly Max Bupa) which is often better rated for claim settlement in Gujarat. Buy before June to avoid premium increase at next renewal cycle.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'Star Health Family Health Optima — ₹10L Floater (4 members)', amount: 32100, currency: 'INR', category: 'insurance', region: 'Surat, Gujarat', result_summary: 'Competitive family floater at ₹32,100/year. 14,000 cashless hospitals nationally. Better claim settlement than New India in Gujarat.', risk_level: 'low', negotiation_script: 'I am comparing Star Health and Niva Bupa for a ₹10 lakh family floater for 4 members aged 43, 39, 16, and 13. Could you provide: (1) last 3 years\' claim settlement ratio for Gujarat, (2) specific cashless hospitals in Varachha/Surat, and (3) any no-claim bonus for a new policy? I will decide within 7 days.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'payment_terms', tone: 'firm', context: 'Requesting overdue payment from MK Fashion for invoice RP-2026-002 (₹2,52,000, 29 days overdue)', script: `Dear MK Fashion Accounts Team,\n\nThis is a formal reminder regarding Invoice RP-2026-002 for ₹2,52,000 (including GST) raised on April 10, 2026 with due date May 10, 2026 — now 29 days overdue.\n\nAs per MSMED Act 2006, payment for goods supplied by an MSME must be made within 45 days. Delayed payment attracts compound interest at 3× RBI bank rate (currently ~18% per annum).\n\nPlease arrange payment of ₹2,52,000 by May 20, 2026 to avoid interest applicability and adverse reporting to the MSME Samadhaan portal.\n\nOur bank details:\nBank: HDFC Bank\nAccount: XXXXXXXXXXXX\nIFSC: HDFC0003421\n\nRegards,\nRajesh Patel\nPatel Textile Traders\nGSTIN: 24ABCPQ1234R1Z5` },
    { type: 'rate_increase', tone: 'professional', context: 'Negotiating cotton fabric price increase with Sai Garments due to rising input costs', script: `Dear [Sai Garments Purchase Manager],\n\nThank you for the continued partnership of 8 years.\n\nI am writing to inform you that cotton prices have increased 12% this season at Girish Textile Mills due to lower Gujarat harvest yield. Effective June 1, 2026, the fabric rate for standard cotton (60s count) will move from ₹250/meter to ₹272/meter.\n\nThis is below the full cost increase I am absorbing to protect our relationship. I hope you will understand.\n\nFor orders placed before May 20, the existing rate of ₹250 applies.\n\nWarm regards,\nRajesh Patel` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'GST GSTR-3B Monthly Return (June 2026)', type: 'tax', due_date: '2026-06-20', amount: null, currency: 'INR', status: 'pending', authority: 'Goods and Services Tax Network (GSTN)', reference_no: 'GSTIN-24ABCPQ1234R1Z5', notes: 'Monthly GSTR-3B due 20th of following month. June return due Jul 20. File via GST portal with CA Dhruv.' },
    { title: 'GST GSTR-1 Monthly Return (June 2026)', type: 'tax', due_date: '2026-06-11', amount: null, currency: 'INR', status: 'pending', authority: 'GSTN', reference_no: 'GSTIN-24ABCPQ1234R1Z5', notes: 'GSTR-1 (outward supply details) due 11th of following month. June return due Jul 11. File before GSTR-3B.' },
    { title: 'Income Tax Return AY 2026-27 (ITR-4 Presumptive)', type: 'tax', due_date: '2026-07-31', amount: null, currency: 'INR', status: 'pending', authority: 'Income Tax Department of India', reference_no: 'PAN-BKZPP5534J', notes: 'ITR-4 (presumptive taxation under 44AD) for FY 2025-26. Engage CA Dhruv by June 15. Estimated tax: ~₹1.8L.' },
    { title: 'TDS Quarterly Deposit Q1 FY 2026-27', type: 'tax', due_date: '2026-07-07', amount: null, currency: 'INR', status: 'pending', authority: 'Income Tax Department (TDS Division)', reference_no: null, notes: 'TDS on rent paid for warehouse space (Section 194I) — deposit quarterly. Q1 (Apr–Jun 2026) due July 7.' },
    { title: 'Udyam / MSME Certificate Annual Update', type: 'renewal', due_date: '2026-09-30', amount: 0, currency: 'INR', status: 'pending', authority: 'Ministry of MSME', reference_no: 'UDYAM-GJ-05-0034821', notes: 'Annual self-declaration on Udyam portal required. Update turnover figures for FY 2025-26. Critical for SIDBI loan eligibility.' },
    { title: 'Maruti Ciaz Comprehensive Insurance Renewal', type: 'renewal', due_date: '2026-07-31', amount: 14000, currency: 'INR', status: 'pending', authority: 'HDFC Ergo / New India Assurance', reference_no: 'GJ-05-TH-6234', notes: 'Comprehensive insurance due Jul 31. Get 3 quotes: HDFC Ergo, Bajaj Allianz, New India. IDV of ~₹5.8L expected.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'MK Fashion Supply Agreement — Oct 2025', doc_type: 'contract', original_text: 'SUPPLY AGREEMENT\nSupplier: Patel Textile Traders (GSTIN: 24ABCPQ1234R1Z5)\nBuyer: MK Fashion Exports Pvt Ltd (GSTIN: 27AABCM1234N1Z4)\nGoods: Cotton and synthetic fabrics as per purchase orders.\nPayment: Within 45 days of invoice date as per MSMED Act 2006.\nDispute Resolution: Arbitration, Surat jurisdiction.\nTerm: October 1, 2025 – September 30, 2026. Auto-renewable.', summary_md: '## MK Fashion Supply Agreement\n\n**What:** Annual fabric supply agreement.\n\n**Key terms:**\n- Payment: 45 days (MSMED Act compliant — but MK Fashion is currently 29 days late on RP-2026-002)\n- Jurisdiction: Surat\n- Dispute: Arbitration\n\n**Action needed:** File delay complaint via MSME Samadhaan if payment not received by May 20.', key_points: ['MSMED Act 45-day payment term protects Rajesh as an MSME supplier', 'Late payment can be reported to MSME Samadhaan portal for free conciliation', 'Arbitration clause in Surat is favourable for Rajesh'], red_flags: ['MK Fashion currently 29 days late on RP-2026-002 (₹2,52,000)'], expires_at: '2026-09-30', notes: 'Renew in September 2026 with stronger credit term: 30 days + advance payment on orders above ₹2L.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'GST GSTR-3B Monthly Filing', category: 'tax', frequency: 'monthly', last_done_at: '2026-05-20', next_due_at: '2026-06-20', is_done: false, applicable: true, notes: 'Filed via CA Dhruv Shah. Monthly outward + inward supply reconciliation. ITC claim for transport and CA fees.' },
    { item: 'GST GSTR-1 Monthly Filing', category: 'tax', frequency: 'monthly', last_done_at: '2026-05-11', next_due_at: '2026-06-11', is_done: false, applicable: true, notes: 'Outward supply details. Must reconcile with all three buyers — Sai Garments, MK Fashion, Lalitha Sarees.' },
    { item: 'Income Tax ITR-4 Annual Filing', category: 'tax', frequency: 'annual', last_done_at: '2025-07-28', next_due_at: '2026-07-31', is_done: false, applicable: true, notes: 'Presumptive taxation under Section 44AD. 6% of turnover (digital) or 8% (cash) treated as income.' },
    { item: 'Udyam Certificate Annual Self-Declaration', category: 'business', frequency: 'annual', last_done_at: '2025-09-15', next_due_at: '2026-09-30', is_done: false, applicable: true, notes: 'Update ITR and GST figures on Udyam portal. Required for SIDBI MSME loan application — must be current.' },
    { item: 'HDFC Business Loan EMI (₹4.8L balance)', category: 'personal', frequency: 'monthly', last_done_at: '2026-05-01', next_due_at: '2026-06-01', is_done: false, applicable: true, notes: '₹4.8L at 14% p.a. → ₹58,000/year interest. Plan: 4 prepayments of ₹1.2L in May, Jun, Sep, Dec 2026 to clear by December.' },
    { item: 'Ciaz Vehicle Pollution Certificate (PUC)', category: 'personal', frequency: 'annual', last_done_at: '2025-08-01', next_due_at: '2026-08-01', is_done: false, applicable: true, notes: 'PUCC certificate mandatory for RTO registration. Get from authorised petrol station in July before insurance renewal.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  // 06:00 IST = UTC+5:30 = T00:30:00Z
  const briefings = [
    { date: '2026-05-03', content_md: '**Jai Jinendra, Rajesh bhai.** Sunday — temple with family. After prasad, two important things: the MK Fashion payment (₹2,52,000) is now 23 days overdue. The MSME law is on your side — but a formal reminder needs to go out this week. Also, the Voltas AC annual service is overdue (due April 20) — Surat temperatures will hit 42°C next week. **One thing today: book the Voltas AC service before temperatures peak.**', highlights: [{ label: 'MK Fashion overdue', value: '₹2,52,000 — 23 days late', link: '/business', emoji: '🧾' }, { label: 'AC service overdue', value: 'Voltas annual service — book today', link: '/home', emoji: '❄️' }, { label: 'Aryan JEE', value: 'May test: Physics target 85%', link: '/family', emoji: '📚' }, { label: 'HDFC loan', value: '₹4.8L — payoff plan active', link: '/money', emoji: '💰' }] },
    { date: '2026-05-04', content_md: '**Jai Jinendra, Rajesh bhai.** Monday — market day. Cotton prices are stable this week (Girish Textile Mills confirmed). The Sai Garments May repeat order is pending — they need 600m of 60s count cotton by June 1. Zoho Inventory trial: May data entry is 70% complete. **Today: call Sai Garments purchase manager before 11am to confirm May order quantity and pricing.** Get the order in writing on WhatsApp.', highlights: [{ label: 'Sai Garments order', value: '600m due Jun 1 — confirm today', link: '/business', emoji: '📦' }, { label: 'MK Fashion payment', value: '₹2,52,000 overdue — send reminder', link: '/business', emoji: '🧾' }, { label: 'Zoho Inventory', value: 'May data 70% migrated', link: '/focus', emoji: '📊' }, { label: 'Manali trip', value: 'Planning Oct 10–14', link: '/travel', emoji: '🏔️' }] },
    { date: '2026-05-05', content_md: '**Jai Jinendra, Rajesh bhai.** Tuesday — GSTR-3B for April needs filing by May 20. Send transaction summary to CA Dhruv today so he has time to prepare. MK Fashion payment is 25 days overdue — send the formal MSME payment reminder today. The negotiation template is ready in your protection vault. **One action: forward the MK Fashion WhatsApp message with invoice RP-2026-002 reference and MSME Act citation.** Politely firm.', highlights: [{ label: 'MK Fashion reminder', value: 'Send MSME notice today — template ready', link: '/protection', emoji: '⚖️' }, { label: 'GSTR-3B April', value: 'Send data to CA Dhruv today', link: '/legal', emoji: '📋' }, { label: 'SIDBI loan', value: 'Application documents 60% ready', link: '/business', emoji: '🏦' }, { label: 'Tirupati booking', value: 'IRCTC opens Jun 9 — set reminder', link: '/travel', emoji: '🙏' }] },
    { date: '2026-05-06', content_md: '**Jai Jinendra, Rajesh bhai.** Wednesday — Lalitha Sarees quote (250m silk-cotton blend, RP-2026-003) is ready to finalise. The quote is ₹89,250 including 5% GST — good margin at 21%. Also, the Jio Fiber bill (₹999) is due May 10 — pay via Jio app. **Focus today: finalise Lalitha Sarees order and send the dispatch schedule. She is a reliable payer — this will help cash flow after the MK Fashion delay.**', highlights: [{ label: 'Lalitha Sarees order', value: '₹89,250 — finalise and dispatch', link: '/business', emoji: '📦' }, { label: 'Jio Fiber bill', value: '₹999 due May 10', link: '/home', emoji: '🌐' }, { label: 'MK Fashion', value: 'Payment reminder sent — follow up Thu', link: '/business', emoji: '🧾' }, { label: 'Aryan board exam', value: 'CBSE Class 11 decision due by Jun', link: '/family', emoji: '📚' }] },
    { date: '2026-05-07', content_md: '**Jai Jinendra, Rajesh bhai.** Thursday — market half-day (market closes 2pm for Akshaya Tritiya preparation tomorrow). MGVCL electricity bill (₹5,400) due May 20 — pay it this weekend via MGVCL app. Warehouse expansion research: 2nd site visit to Kapodra property is pending — schedule with broker this week. **One thing: call SIDBI\'s official helpline (1800-22-6753) to verify the loan agent who asked for ₹5,000 UPI fee — that is suspicious.**', highlights: [{ label: 'SIDBI agent fraud check', value: 'Call 1800-22-6753 to verify', link: '/protection', emoji: '🛡️' }, { label: 'MGVCL bill', value: '₹5,400 due May 20', link: '/home', emoji: '💡' }, { label: 'Kapodra property', value: 'Site visit 2 — schedule today', link: '/business', emoji: '🏭' }, { label: 'HDFC loan payoff', value: '₹1.2L prepayment this month', link: '/money', emoji: '💰' }] },
    { date: '2026-05-08', content_md: '**Jai Jinendra, Rajesh bhai.** Friday — MK Fashion replied: payment of ₹2,52,000 expected by May 15. Note it in Zoho — if not received by May 15, file on MSME Samadhaan portal. Priya\'s Bharatnatyam recital is tomorrow (Saturday) — don\'t let market hours overrun into her performance. **Today: review the SIDBI loan documents checklist. The Udyam certificate, 3 years ITR, and CA-certified balance sheet are the three critical items.** Dhruv can certify by June 1.', highlights: [{ label: 'MK Fashion payment', value: 'Promised May 15 — note it', link: '/business', emoji: '✅' }, { label: 'Priya\'s recital', value: 'Tomorrow — leave market by 4pm', link: '/family', emoji: '💃' }, { label: 'SIDBI documents', value: 'Udyam + ITR + balance sheet needed', link: '/business', emoji: '🏦' }, { label: 'Zoho Inventory', value: 'May migration 90% complete', link: '/focus', emoji: '📊' }] },
    { date: '2026-05-09', content_md: '**Jai Jinendra, Rajesh bhai.** Saturday — market morning (early exit for Priya\'s recital at 5pm). Bills to pay this month: MGVCL (₹5,400, May 20), Jio Fiber (₹999, May 10 — TODAY), SMC Water (₹810, May 20). **Pay Jio Fiber via app right now — it\'s due tomorrow.** Then check on Tirupati trip: TTD Darshan booking window opens June 10 at 10am — put a calendar reminder for June 9 evening. Aryan will help book online.', highlights: [{ label: 'Jio bill — pay now', value: '₹999 due tomorrow', link: '/home', emoji: '🌐' }, { label: 'TTD Darshan booking', value: 'Opens Jun 10 — remind Aryan', link: '/travel', emoji: '🙏' }, { label: 'MK Fashion', value: 'Watch for ₹2,52,000 by May 15', link: '/business', emoji: '🧾' }, { label: 'Priya\'s recital', value: 'Today 5pm — leave market by 4pm', link: '/family', emoji: '💃' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T00:30:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Rajesh Patel uid: ${UID}`)
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
