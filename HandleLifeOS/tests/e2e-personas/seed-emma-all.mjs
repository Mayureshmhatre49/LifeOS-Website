/**
 * Full seed for Emma Wilson — Digital Marketing Manager in Bondi Junction, Sydney.
 * Run: node tests/e2e-personas/seed-emma-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = 'b414febc-3ef8-42a4-a24e-cec6b6a77349'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Emma Wilson', occupation: 'Digital Marketing Manager', life_stage: 'early_career',
    country: 'AU', currency: 'AUD', timezone: 'Australia/Sydney', preferred_language: 'en',
    goals: [
      'Head of Performance Marketing or Marketing Director role by 2028',
      'Save AUD $50,000 for home deposit by 2028',
      'Bali trip with Jess in August 2026',
      'Canada working holiday January–April 2027',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Emma Wilson (Digital Marketing, Sydney AU)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: 'AUD $7,917/month salary (AUD $95K/year, Forge Digital) + AUD $1,400/month freelance avg (Bondi Surf Collective + Coastal Property Group)' },
    { type: 'fact',         key: 'home_location',          value: '1BR apartment, Bondi Junction NSW 2022 — renting AUD $2,400/month from Jan 2025. 5-min walk to Westfield, 10-min bus to Bondi Beach.' },
    { type: 'fact',         key: 'vehicle',                value: 'No car — walks, Cityrail T4, Uber for late nights; owns Brompton folding bike for Surry Hills office commute (3.2km)' },
    { type: 'fact',         key: 'employer',               value: 'Forge Digital (independent digital agency, Surry Hills Sydney, 45 employees) — Digital Marketing Manager, 2.5 years; oversees Google Ads, Meta, LinkedIn campaigns for 8 clients' },
    { type: 'fact',         key: 'education',              value: 'Bachelor of Communications (Marketing) — UTS Sydney 2020; Google Analytics 4 certified; HubSpot Inbound Marketing certified (March 2026); 3.8 GPA' },
    { type: 'preference',   key: 'work_style',             value: 'Morning person — peak focus 8–11am; hybrid 3 days office (Surry Hills), 2 days WFH; uses Asana + Google Workspace + Looker Studio for dashboards' },
    { type: 'preference',   key: 'diet',                   value: 'Pescatarian + dairy (no red meat or poultry); Bondi Junction farmer\'s market Saturday tradition; loves açaí bowls at Bondi Beach on Sunday; gluten-free when possible' },
    { type: 'preference',   key: 'communication_style',    value: 'Collaborative and visual — prefers Figma decks and data dashboards over long docs; direct feedback culture; loves celebrating team wins publicly' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Marketing strategy books (Building a StoryBrand, This is Marketing); Substack newsletters (Marketing Brew, The Hustle); audiobooks on morning beach walks' },
    { type: 'goal',         key: 'career_goal',            value: 'Head of Performance Marketing at Afterpay, Canva, or Atlassian by 2028. Currently evaluating an Afterpay opening (AUD $125K, team of 5).' },
    { type: 'goal',         key: 'financial_goal',         value: 'Save AUD $50,000 for home deposit — current savings AUD $18,500 (Macquarie HISA 5.3%). Target 2028 if Sydney median stabilises below AUD $1.2M.' },
    { type: 'goal',         key: 'travel_goal',            value: 'Bali with Jess (close friend) August 2026; Canada working holiday January–April 2027 — Vancouver first, then Montreal or Toronto' },
    { type: 'concern',      key: 'rental_pressure',        value: 'Bondi Junction rent up 12% at Jan 2025 renewal (from AUD $2,140 to $2,400). Fear of another increase at Aug 2026 renewal — considering Newtown (cheaper by AUD $400/month)' },
    { type: 'concern',      key: 'career_plateau',         value: 'No senior marketing leadership above her at Forge Digital who are leaving. Feeling capped — evaluating Afterpay, Canva, and Atlassian which have real leadership progression paths' },
    { type: 'relationship', key: 'friend_network',         value: 'Jess Clark (close friend, Bali trip planned Aug 2026, works at ANZ); Sophie Bain (moved to London, UTS housemate); Hamish Turner (Canva UX, Sydney, weekly coffee Fridays)' },
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
    { name: 'Morning Beach Walk / Jog 4km',   icon: '🏃', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '06:30', completedOffsets: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    { name: 'LinkedIn + Industry News 20 min', icon: '📱', color: 'sky',     frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:30', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Gym Strength Session',            icon: '🏋️', color: 'violet',  frequency: 'custom',   days_of_week: [1,3,5],         reminder_time: '18:00', completedOffsets: [1,3,5,8,10,12,15,17,19] },
    { name: 'Read Marketing Book 20 Pages',    icon: '📖', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:00', completedOffsets: [0,1,2,3,5,6,7,8,9,10,12,13,14,15,16,17,19,20] },
    { name: 'Monday Content Calendar Planning',icon: '📅', color: 'amber',   frequency: 'custom',   days_of_week: [1],             reminder_time: '09:00', completedOffsets: [1,8,15] },
    { name: 'No Phone/Scroll After 9pm',       icon: '📵', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:00', completedOffsets: [0,1,2,6,7,8,9,13,14,15,16,19,20] },
    { name: 'Sunday Outdoor Activity',         icon: '🌿', color: 'purple',  frequency: 'custom',   days_of_week: [0],             reminder_time: '09:00', completedOffsets: [0,7,14] },
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
    user_id: UID, preferred_mode: 'deep', session_length: 75, break_length: 15,
    daily_goal: 2, ambient_sound: 'cafe_sounds', notifications_blocked: true,
  }, { onConflict: 'user_id' })

  // AEST = UTC+10 (May 2026): 14:00 AEST = T04:00:00Z, 15:00 AEST = T05:00:00Z, 16:00 AEST = T06:00:00Z
  const sessions = [
    { off: 0,  mode: 'deep',     plan: 90,  act: 88,  done: true,  title: 'Bondi Surf Collective Q2 social strategy doc',                         time: '04:00' },
    { off: 1,  mode: 'pomodoro', plan: 75,  act: 70,  done: true,  title: 'Afterpay job application — tailoring cover letter and portfolio deck', time: '04:00' },
    { off: 2,  mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Forge Digital Q2 report — Google Ads ROAS deep dive',                  time: '04:00' },
    { off: 3,  mode: 'deep',     plan: 90,  act: 93,  done: true,  title: 'Coastal Property Google Display campaign targeting setup',              time: '04:00' },
    { off: 4,  mode: 'pomodoro', plan: 50,  act: 47,  done: true,  title: 'Bali trip planning — Canggu vs Seminyak vs Uluwatu comparison',         time: '04:00' },
    { off: 5,  mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'Bondi Surf invoicing + April timesheet + EW-2026-003 draft',            time: '04:00' },
    { off: 6,  mode: 'deep',     plan: 60,  act: 60,  done: true,  title: 'Personal brand content — draft 3 LinkedIn posts for May',               time: '05:00' },
    { off: 7,  mode: 'pomodoro', plan: 75,  act: 72,  done: true,  title: 'Social media coaching side hustle research — pricing and positioning',  time: '05:00' },
    { off: 8,  mode: 'deep',     plan: 120, act: 117, done: true,  title: 'Forge Digital Woolworths campaign — attribution model rebuild',         time: '04:00' },
    { off: 9,  mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'HubSpot Marketing Certification — automation workflows module',          time: '04:00' },
    { off: 10, mode: 'deep',     plan: 75,  act: 72,  done: true,  title: 'Afterpay application — marketing case study: growth loop write-up',     time: '04:00' },
    { off: 11, mode: 'pomodoro', plan: 25,  act: 20,  done: true,  title: 'Coastal Property invoice status + April project summary',                time: '05:00' },
    { off: 12, mode: 'deep',     plan: 60,  act: 58,  done: true,  title: 'Forge Digital competitor analysis — recent Publicis and WPP campaigns',  time: '04:00' },
    { off: 13, mode: 'pomodoro', plan: 50,  act: 50,  done: true,  title: 'Canada working holiday research — visa process, Vancouver job market',   time: '05:00' },
    { off: 14, mode: 'deep',     plan: 90,  act: 85,  done: true,  title: 'Social media coaching: business plan draft and revenue model',            time: '05:00' },
    { off: 15, mode: 'deep',     plan: 90,  act: 90,  done: true,  title: 'Woolworths campaign review + Looker Studio dashboard build',              time: '04:00' },
    { off: 16, mode: 'pomodoro', plan: 50,  act: 48,  done: true,  title: 'ABN/GST admin — Q4 FY26 BAS prep, quarterly turnover review',            time: '04:00' },
    { off: 17, mode: 'deep',     plan: 75,  act: 70,  done: true,  title: 'Bondi Surf Collective: Instagram Reels strategy for Autumn 2026',         time: '04:00' },
    { off: 19, mode: 'quick',    plan: 25,  act: 22,  done: true,  title: 'Client invoices reconciliation + May outstanding payments check',         time: '04:00' },
    { off: 20, mode: 'deep',     plan: 60,  act: 58,  done: true,  title: '2026 financial review — savings AUD $18.5K vs AUD $50K goal',             time: '05:00' },
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
      question: 'Should I accept the Head of Performance Marketing role at Afterpay (AUD $125K, team of 5) or stay at Forge Digital?',
      category: 'career', mode: 'compare', options: ['Accept Afterpay role (AUD $125K)', 'Stay at Forge Digital (AUD $95K)'],
      created_at: '2026-04-21T04:30:00Z', favorite: true,
      result: {
        question: 'Afterpay Head of Performance Marketing vs Stay at Forge Digital',
        factors: ['Compensation', 'Career growth', 'Work-life balance', 'Brand prestige', 'Learning velocity'],
        options: [
          { label: 'Accept Afterpay role (AUD $125K)', scores: { Compensation: 92, 'Career growth': 85, 'Work-life balance': 45, 'Brand prestige': 90, 'Learning velocity': 80 },
            pros: ['AUD $30K salary increase — direct impact on home deposit timeline', 'Head of title at age 27 — significant for CV and future Director applications', 'Large budget responsibility ($4M+ media spend) — experience most agencies can\'t offer'],
            cons: ['Afterpay post-acquisition culture (Block Inc) is faster-paced with higher pressure', 'Head roles at fintechs often require 50+ hour weeks — affects gym, beach, and WLB', 'Team of 5 management responsibility — no people management experience yet (steep learning curve)'],
            summary: 'Major career and financial upgrade but significant WLB trade-off.' },
          { label: 'Stay at Forge Digital (AUD $95K)', scores: { Compensation: 60, 'Career growth': 45, 'Work-life balance': 85, 'Brand prestige': 50, 'Learning velocity': 50 },
            pros: ['Strong WLB — beach mornings maintained, gym routine intact', 'Comfortable with clients and processes — low stress', 'Freedom to build freelance income on the side'],
            cons: ['AUD $30K/year less — home deposit goal delayed by 18 months', 'Career ceiling is real — no senior leadership at Forge to promote into', 'Risk of complacency — same clients, same tools, lower growth trajectory'],
            summary: 'Comfortable but underutilising potential and slowing financial goal.' },
        ],
        recommendation: 'Accept the Afterpay role — but negotiate: 4 days per week or strong WFH-Friday policy, plus a 6-month review with a $10K performance bonus milestone. The career and financial acceleration at 27 outweighs the WLB cost.',
        winner: 'Accept Afterpay role (AUD $125K)',
      },
    },
    {
      question: 'When my Bondi Junction lease ends August 2026, should I stay or move to Newtown?',
      category: 'family', mode: 'compare', options: ['Renew in Bondi Junction', 'Move to Newtown'],
      created_at: '2026-04-28T04:30:00Z', favorite: false,
      result: {
        question: 'Bondi Junction lease renewal vs Newtown relocation',
        factors: ['Monthly cost', 'Lifestyle fit', 'Commute', 'Social scene', 'Home deposit impact'],
        options: [
          { label: 'Renew in Bondi Junction', scores: { 'Monthly cost': 40, 'Lifestyle fit': 85, Commute: 75, 'Social scene': 80, 'Home deposit impact': 35 },
            pros: ['10-min walk to Bondi Beach — beach mornings are a lifestyle cornerstone', 'Close to Jess and existing social circle', 'Westfield convenience, good cafes, familiar area'],
            cons: ['AUD $2,400/month likely to rise 10–15% at renewal = AUD $2,640–2,760', 'Every extra $200/month = AUD $2,400/year less toward home deposit'],
            summary: 'Lifestyle-optimal but expensive and rising.' },
          { label: 'Move to Newtown', scores: { 'Monthly cost': 80, 'Lifestyle fit': 65, Commute: 55, 'Social scene': 70, 'Home deposit impact': 80 },
            pros: ['AUD $1,900–2,000/month for a 1BR in Newtown — AUD $400/month saving', 'Hamish is in Newtown — new social scene with UTS/Canva crowd', 'Inner West arts/food culture — different energy, good for life stage transition'],
            cons: ['40-min commute to Surry Hills (Forge) and 20-min to Bondi Beach', 'Would lose the daily Bondi beach walk habit (cornerstone of wellbeing)'],
            summary: 'Saves AUD $5K/year but sacrifices a cornerstone lifestyle element.' },
        ],
        recommendation: 'Negotiate hard to renew in Bondi Junction: cap increase at 5% ($2,520). If landlord insists on 10%+, then Newtown with a weekend Bondi ritual is the right call. Start apartment search in June to have options ready.',
        winner: 'Renew in Bondi Junction',
      },
    },
    {
      question: 'Should I launch a social media coaching side business targeting Sydney SMEs? Viable at AUD $1,500/month target?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-02T04:00:00Z', favorite: false,
      result: {
        summary: 'Social media coaching for SMEs is a viable side income with existing skills and clients. With 2 retainer clients at $750/month each (or 3–4 workshop clients at $500/session), AUD $1,500/month is achievable in 3–4 months. The constraint is time — if Afterpay role is accepted, available evening hours drop significantly.',
        recommendation: 'Launch the coaching service now (before any role change): 2 retainer clients, 4hr/month each, at $750/month. Focus on industries you already know (retail, real estate). Use existing Bondi Surf Collective relationship as case study. Then pause or scale down if Afterpay role demands more hours.',
        confidenceScore: 71, riskScore: 28, riskLevel: 'low',
        financialImpact: { summary: 'AUD $1,500/month net = AUD $18,000/year extra. Cuts home deposit timeline by 15 months.', monthlyCostChange: 1500, oneTimeCost: 0, opportunityCost: '8 hours/month client work + setup time', affordabilityScore: 88 },
        pros: ['Leverages existing marketing skills with zero additional training investment', 'Builds personal brand and LinkedIn authority', 'Scalable to AUD $3,000/month with 4 clients before needing to incorporate'],
        cons: ['Time-intensive if not managed well', 'ABN GST threshold: if turnover crosses AUD $75K combined, GST registration triggers'],
        nextSteps: ['Write 3 LinkedIn posts about Sydney SME social media challenges (this week)', 'Reach out to 5 Bondi Junction small businesses for discovery calls (May)', 'Price at AUD $750/month retainer (4 hours) or AUD $500/one-off workshop'],
        memoryFactorsUsed: ['Financial goal: AUD $50K deposit', 'Current freelance: Bondi Surf + Coastal Property (AUD $1,400/month)'],
        dataSourcesUsed: ['Sydney SME digital marketing pricing 2026', 'ABL GST threshold AUD $75K'],
      },
    },
    {
      question: 'Canada working holiday January 2027 — Vancouver and Toronto, or SE Asia backpacking instead?',
      category: 'family', mode: 'compare', options: ['Canada Working Holiday (Vancouver + Toronto)', 'SE Asia Backpacking (Thailand + Vietnam + Bali)'],
      created_at: '2026-05-05T05:00:00Z', favorite: true,
      result: {
        question: 'Canada working holiday vs SE Asia backpacking — January 2027',
        factors: ['Career value', 'Budget required', 'Social connections', 'New experiences', 'Timeline flexibility'],
        options: [
          { label: 'Canada Working Holiday (Vancouver + Toronto)', scores: { 'Career value': 88, 'Budget required': 45, 'Social connections': 70, 'New experiences': 75, 'Timeline flexibility': 65 },
            pros: ['IHV (International Holiday Visa) opens right to work — earn while travelling', 'Vancouver digital marketing market strong — potential $500–700 CAD/day contract work', 'Sophie\'s contact in Toronto marketing agency could lead to a contract role'],
            cons: ['AUD $12,000 budget required for 3–4 months (more expensive than SE Asia)', 'January in Vancouver is cold (4°C) — significant lifestyle change from Sydney'],
            summary: 'Higher investment but career-relevant, income-potential, and unique Northern Hemisphere winter experience.' },
          { label: 'SE Asia Backpacking (Thailand + Vietnam + Bali)', scores: { 'Career value': 35, 'Budget required': 90, 'Social connections': 75, 'New experiences': 90, 'Timeline flexibility': 90 },
            pros: ['AUD $5,000–7,000 for 3 months — half the Canada budget', 'Jess interested in joining for Thailand leg', 'Bali already planned Aug 2026 — SE Asia extends that energy'],
            cons: ['No working rights — pure burn of savings', 'Less career-differentiating than international work experience', 'Delays home deposit by AUD $5–7K spent on pure leisure'],
            summary: 'Cheaper and more adventurous but no career benefit and pure saving cost.' },
        ],
        recommendation: 'Canada working holiday. The combination of working rights, Sophie\'s network, and career-relevant experience beats SE Asia for where Emma is at in her career. SE Asia can be a 2-week trip anytime — a Canada IHV expires at 30.',
        winner: 'Canada Working Holiday (Vancouver + Toronto)',
      },
    },
    {
      question: 'Is the HubSpot Marketing Certification worth 6 hours of study time for my career growth?',
      category: 'education', mode: 'analyze', options: [], created_at: '2026-05-07T04:00:00Z', favorite: false,
      result: {
        summary: 'HubSpot Marketing Certification (6 hours) is a low-cost, high-signal credential for a marketing manager pursuing Head roles. 78% of Afterpay job postings in marketing mention HubSpot CRM experience. Google Analytics 4 is already certified — HubSpot completes the major martech stack on the CV.',
        recommendation: 'Complete it this week (already 40% through). It is a strong CV signal for Afterpay application, costs nothing, and takes 6 hours total.',
        confidenceScore: 91, riskScore: 5, riskLevel: 'low',
        financialImpact: { summary: 'Free certification. CV signal worth estimated AUD $5–10K in salary negotiation leverage.', monthlyCostChange: 0, oneTimeCost: 0, opportunityCost: '6 hours total study time', affordabilityScore: 100 },
        pros: ['Free and recognised by Afterpay, Canva, and most martech platforms', 'Complements GA4 cert — shows full martech stack competency', '3.5 hours remaining — completable in one afternoon'],
        cons: ['Not as heavyweight as a paid certification (CIM, DMA)'],
        nextSteps: ['Complete 3 remaining HubSpot modules by Thursday', 'Add to LinkedIn and CV before submitting Afterpay application', 'Screenshot certificate for portfolio PDF'],
        memoryFactorsUsed: ['Career goal: Head of Performance Marketing', 'Applying for Afterpay role'],
        dataSourcesUsed: ['HubSpot Academy certification details 2026', 'Afterpay marketing JD requirements analysis'],
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
  const bsc = await ins('business_clients', {
    user_id: UID, name: 'Bondi Surf Collective', company: 'Bondi Surf Collective Pty Ltd',
    email: 'info@bondisurfcollective.com.au', phone: '+61298888100', address: '2 Campbell Parade, Bondi Beach NSW 2026', currency: 'AUD',
    notes: 'Local surf brand — organic social media management (Instagram, TikTok). Monthly retainer AUD $1,200/month + GST. Ongoing since Jan 2026.',
  }, 'client: Bondi Surf Collective')
  const cpg = await ins('business_clients', {
    user_id: UID, name: 'Coastal Property Group', company: 'Coastal Property Group Pty Ltd',
    email: 'marketing@coastalproperty.com.au', phone: '+61283320800', address: '100 Pacific Hwy, North Sydney NSW 2060', currency: 'AUD',
    notes: 'Independent real estate agency — Google Ads + Meta campaigns for property listings. Project-based campaigns. ~$1,800/project.',
  }, 'client: Coastal Property Group')
  if (!bsc || !cpg) return

  const projBSC = await ins('business_projects', {
    user_id: UID, client_id: bsc.id, name: 'Bondi Surf Collective — Social Media Management 2026',
    status: 'active', start_date: '2026-01-01', end_date: null,
    fee: 1200, currency: 'AUD', notes: 'Monthly retainer: Instagram (4 posts/week), TikTok (2 reels/week), community management.',
  }, 'project: Bondi Surf social media')
  const projCPG = await ins('business_projects', {
    user_id: UID, client_id: cpg.id, name: 'Coastal Property — Digital Campaigns Q2 2026',
    status: 'active', start_date: '2026-04-01', end_date: '2026-06-30',
    fee: 1800, currency: 'AUD', notes: 'Google Ads + Meta for Q2 property listings (5 properties). Performance-based.',
  }, 'project: Coastal Property Q2 campaigns')

  if (projBSC) {
    await ins('business_invoices', {
      user_id: UID, client_id: bsc.id, project_id: projBSC.id,
      invoice_no: 'EW-2026-001', issued_at: '2026-03-31', due_at: '2026-04-14',
      items: [{ description: 'Social Media Management — March 2026 retainer', qty: 1, rate: 1200, amount: 1200 }],
      subtotal: 1200, tax_pct: 10, tax_amt: 120, discount_amt: 0, total: 1320, currency: 'AUD', status: 'paid', paid_at: '2026-04-10',
    }, 'invoice: EW-2026-001 (paid)')
    await ins('business_invoices', {
      user_id: UID, client_id: bsc.id, project_id: projBSC.id,
      invoice_no: 'EW-2026-003', issued_at: '2026-04-30', due_at: '2026-05-14',
      items: [{ description: 'Social Media Management — April 2026 retainer', qty: 1, rate: 1200, amount: 1200 }],
      subtotal: 1200, tax_pct: 10, tax_amt: 120, discount_amt: 0, total: 1320, currency: 'AUD', status: 'sent',
    }, 'invoice: EW-2026-003 (sent)')
  }
  if (projCPG) {
    await ins('business_invoices', {
      user_id: UID, client_id: cpg.id, project_id: projCPG.id,
      invoice_no: 'EW-2026-002', issued_at: '2026-04-15', due_at: '2026-04-29',
      items: [{ description: 'Coastal Property Q2 campaign setup — Google Ads + Meta (5 listings)', qty: 1, rate: 1800, amount: 1800 }],
      subtotal: 1800, tax_pct: 10, tax_amt: 180, discount_amt: 0, total: 1980, currency: 'AUD', status: 'paid', paid_at: '2026-04-24',
    }, 'invoice: EW-2026-002 (paid)')
  }

  const expenses = [
    { category: 'software', vendor: 'Canva Pro', amount: 180, occurred_at: '2026-04-01', description: 'Canva Pro annual plan — client social content design (AUD $180/year)' },
    { category: 'software', vendor: 'Ahrefs', amount: 159, occurred_at: '2026-04-01', description: 'Ahrefs Lite — SEO audit for Coastal Property content strategy' },
    { category: 'software', vendor: 'Later', amount: 45, occurred_at: '2026-04-01', description: 'Later social scheduling platform — Bondi Surf Collective Instagram posts' },
    { category: 'education', vendor: 'Google', amount: 0, occurred_at: '2026-03-15', description: 'Google Analytics 4 Certification — free, completed March 2026' },
  ]
  let n = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'AUD', is_billable: false, ...e })
    if (!error) n++; else console.log(`  ✗  expense: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${expenses.length} business expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const mba = await ins('home_assets', { user_id: UID, name: 'MacBook Air 13" M2', type: 'electronics', brand: 'Apple', model: 'MacBook Air M2 (2023, Midnight)', purchased_at: '2023-07-10', warranty_until: '2024-07-10', cost: 1849, notes: 'Primary work laptop — Forge Digital remote days + all freelance work. 8GB RAM / 256GB SSD.' }, 'asset: MacBook Air M2')
  const iphone = await ins('home_assets', { user_id: UID, name: 'iPhone 15 Pro (Natural Titanium)', type: 'electronics', brand: 'Apple', model: 'iPhone 15 Pro 256GB', purchased_at: '2023-10-15', warranty_until: '2024-10-15', cost: 1699, notes: 'Primary phone — content creation camera for Bondi Surf Collective. AppleCare+ expires Nov 2025.' }, 'asset: iPhone 15 Pro')
  const peloton = await ins('home_assets', { user_id: UID, name: 'Peloton Bike+', type: 'fitness', brand: 'Peloton', model: 'Peloton Bike+ (Gen 2)', purchased_at: '2024-02-14', warranty_until: '2026-02-14', cost: 3295, notes: 'Home gym — 4 rides/week target. Peloton All-Access $59/month subscription.' }, 'asset: Peloton Bike+')
  const tv = await ins('home_assets', { user_id: UID, name: 'Samsung 55" QLED 4K TV', type: 'electronics', brand: 'Samsung', model: 'QN55Q70CAFXZA (2023)', purchased_at: '2022-12-26', warranty_until: '2024-12-26', cost: 1199, notes: 'Living room — used for Netflix, Disney+, and Peloton screen mirroring.' }, 'asset: Samsung 55" QLED')
  const dyson = await ins('home_assets', { user_id: UID, name: 'Dyson V12 Detect Slim Cordless', type: 'appliance', brand: 'Dyson', model: 'V12 Detect Slim (2024)', purchased_at: '2024-04-20', warranty_until: '2026-04-20', cost: 699, notes: 'Apartment vacuum — particularly important for beach sand management post-Bondi walks.' }, 'asset: Dyson V12')

  if (peloton) await ins('home_maintenance', { user_id: UID, asset_id: peloton.id, title: 'Peloton Belt Tension Check + Calibration', category: 'service', recurrence_months: 6, last_done_at: '2025-12-01', next_due_at: '2026-06-01', vendor: 'Peloton Service (in-home)', cost: 0, is_active: true, notes: 'Free service under warranty. Book via Peloton app 2 weeks ahead.' }, 'maint: Peloton service')
  if (mba) await ins('home_maintenance', { user_id: UID, asset_id: mba.id, title: 'MacBook External SSD Backup + OS Update', category: 'cleaning', recurrence_months: 3, last_done_at: '2026-02-01', next_due_at: '2026-05-01', vendor: null, cost: 0, is_active: true, notes: 'Monthly Time Machine backup to Samsung T7 SSD (2TB). Check disk health with DiskDiag.' }, 'maint: MacBook backup')

  const bills = [
    { utility: 'electricity', provider: 'Energy Australia', amount: 138, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'EA-BJ-4420182' },
    { utility: 'electricity', provider: 'Energy Australia', amount: 142, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'EA-BJ-4420182' },
    { utility: 'electricity', provider: 'Energy Australia', amount: 148, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'EA-BJ-4420182' },
    { utility: 'internet', provider: 'Aussie Broadband NBN 250/25', amount: 95, bill_date: '2026-03-05', due_date: '2026-03-12', is_paid: true, account_no: 'ABB-NBN-88210' },
    { utility: 'internet', provider: 'Aussie Broadband NBN 250/25', amount: 95, bill_date: '2026-04-05', due_date: '2026-04-12', is_paid: true, account_no: 'ABB-NBN-88210' },
    { utility: 'internet', provider: 'Aussie Broadband NBN 250/25', amount: 95, bill_date: '2026-05-05', due_date: '2026-05-12', is_paid: false, account_no: 'ABB-NBN-88210' },
    { utility: 'phone', provider: 'Telstra 100GB Postpaid (SIM Only)', amount: 65, bill_date: '2026-03-10', due_date: '2026-03-25', is_paid: true, account_no: 'TEL-SIM-1002341' },
    { utility: 'phone', provider: 'Telstra 100GB Postpaid (SIM Only)', amount: 65, bill_date: '2026-04-10', due_date: '2026-04-25', is_paid: true, account_no: 'TEL-SIM-1002341' },
    { utility: 'phone', provider: 'Telstra 100GB Postpaid (SIM Only)', amount: 65, bill_date: '2026-05-10', due_date: '2026-05-25', is_paid: false, account_no: 'TEL-SIM-1002341' },
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
  const bali = await ins('trips', { user_id: UID, destination: 'Bali, Indonesia', start_date: '2026-08-05', end_date: '2026-08-12', status: 'planning', budget_total: 3200, currency: 'AUD', travellers: 2, notes: 'Girls trip with Jess Clark. Fly from SYD to DPS. Mix of Canggu (first 4 days) and Uluwatu (last 3).', cover_emoji: '🌴' }, 'trip: Bali')
  if (bali) {
    const items = [
      { type: 'flight', title: 'Jetstar SYD → DPS (outbound, 2 tickets)', starts_at: '2026-08-05T06:00:00+10:00', location: 'Sydney Kingsford Smith Airport', cost: 560, order_index: 1, notes: '2 × AUD $280 Jetstar — book ASAP before price rises' },
      { type: 'hotel', title: 'Finns Villas — Canggu (4 nights)', starts_at: '2026-08-05T14:00:00+08:00', ends_at: '2026-08-09T11:00:00+08:00', location: 'Canggu, Bali', cost: 480, order_index: 2, notes: 'AUD $480 split 2 ways = $240 each. Pool villa, rice field view.' },
      { type: 'activity', title: 'Surf lesson at Batu Bolong Beach', starts_at: '2026-08-06T08:00:00+08:00', location: 'Canggu, Bali', cost: 80, order_index: 3, notes: '2 × AUD $40' },
      { type: 'hotel', title: 'Karma Kandara Resort — Uluwatu (3 nights)', starts_at: '2026-08-09T14:00:00+08:00', ends_at: '2026-08-12T11:00:00+08:00', location: 'Uluwatu, Bali', cost: 720, order_index: 4, notes: 'Cliff-top resort. Emma\'s birthday treat (Aug 11). AUD $360 each.' },
      { type: 'activity', title: 'Uluwatu Temple sunset + Kecak Fire Dance', starts_at: '2026-08-11T17:00:00+08:00', location: 'Uluwatu Temple, Bali', cost: 40, order_index: 5, notes: 'Emma\'s 28th birthday — sunset at the temple' },
      { type: 'flight', title: 'Jetstar DPS → SYD (return, 2 tickets)', starts_at: '2026-08-12T18:00:00+08:00', location: 'Ngurah Rai International Airport, Bali', cost: 580, order_index: 6 },
    ]
    let iOk = 0
    for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: bali.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Australian passport (valid to 2031)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Bali arrival e-visa (USD 35 — complete 3 days before)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Sunscreen SPF 50+ (3 bottles)', category: 'health', qty: 3, is_packed: false },
      { item: 'Light sundresses (5)', category: 'clothing', qty: 5, is_packed: false },
      { item: 'Swimwear (3 sets)', category: 'clothing', qty: 3, is_packed: false },
      { item: 'Insect repellent (DEET-based)', category: 'health', qty: 1, is_packed: false },
      { item: 'Travel insurance print-out (World Nomads)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Portable USB-C charger', category: 'electronics', qty: 1, is_packed: false },
      { item: 'USD $200 cash (for arrival + taxis)', category: 'documents', qty: 1, is_packed: false },
      { item: 'MacBook Air (work from Bali — one remote day)', category: 'electronics', qty: 1, is_packed: false },
    ]
    let pOk = 0
    for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: bali.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Bali: ${iOk} items, ${pOk} packing`)
  }

  const melb = await ins('trips', { user_id: UID, destination: 'Melbourne, VIC', start_date: '2026-03-12', end_date: '2026-03-15', status: 'completed', budget_total: 1100, currency: 'AUD', travellers: 1, notes: 'SXSW Sydney satellite event + Forge Digital client dinner. 4 days solo.', cover_emoji: '🏙️' }, 'trip: Melbourne')
  if (melb) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: melb.id, type: 'flight', title: 'Qantas SYD → MEL (outbound)', starts_at: '2026-03-12T07:00:00+11:00', location: 'Sydney Airport', cost: 280, is_done: true, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: melb.id, type: 'hotel', title: 'The Langham Melbourne (3 nights, Forge budget)', starts_at: '2026-03-12T15:00:00+11:00', ends_at: '2026-03-15T11:00:00+11:00', location: 'Melbourne CBD', cost: 650, is_done: true, order_index: 2 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: melb.id, type: 'flight', title: 'Qantas MEL → SYD (return)', starts_at: '2026-03-15T18:00:00+11:00', location: 'Melbourne Airport', cost: 260, is_done: true, order_index: 3 })
  }

  const canada = await ins('trips', { user_id: UID, destination: 'Vancouver + Toronto, Canada', start_date: '2027-01-08', end_date: '2027-04-15', status: 'planning', budget_total: 12000, currency: 'AUD', travellers: 1, notes: 'IHV working holiday visa — 3.5 months. Remote work for Forge 3 days/week, freelance and contract exploration rest. Sophie\'s Toronto contact to explore.', cover_emoji: '🍁' }, 'trip: Canada working holiday')
  if (canada) {
    await db.from('trip_items').insert({ user_id: UID, trip_id: canada.id, type: 'flight', title: 'Qantas SYD → YVR (Sydney → Vancouver)', starts_at: '2027-01-08T11:00:00+11:00', location: 'Sydney Airport', cost: 2200, is_done: false, order_index: 1 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: canada.id, type: 'activity', title: 'Vancouver: Whistler ski day + Stanley Park cycling', starts_at: '2027-01-20T09:00:00-08:00', location: 'Vancouver, BC', cost: 350, is_done: false, order_index: 2 })
    await db.from('trip_items').insert({ user_id: UID, trip_id: canada.id, type: 'flight', title: 'Air Canada YVR → YYZ (Vancouver → Toronto)', starts_at: '2027-02-15T08:00:00-08:00', location: 'Vancouver International Airport', cost: 480, is_done: false, order_index: 3 })
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'ATO "Tax Refund" Phishing Email', content: 'Australian Taxation Office: You are entitled to a tax refund of $2,847.00. To process your refund, verify your myGov credentials at: ato-refund-portal.site/claim. Your refund expires in 48 hours.', risk_level: 'high', result_summary: 'Classic ATO impersonation phishing. The ATO never sends refund notifications via email with time limits or external links. All ATO refunds are processed via myGov.gov.au and deposited directly — no verification required.', red_flags: ['Domain is "ato-refund-portal.site" — not ato.gov.au', 'ATO never emails refund notifications with links', '"48 hours" urgency tactic', 'No personalisation — bulk phishing email format'], safe_next_step: 'Delete immediately. Forward to reportscams@ato.gov.au. Check genuine ATO myGov account at my.gov.au to confirm actual tax status.' },
    { type: 'scam', title: 'Instagram "Marketing Mastery" $997 Course Ad', content: 'LIMITED: Emma, learn how I went from 0 to $47K/month as a social media coach in 3 months with my MARKETING MASTERY BOOTCAMP. Only AUD $997 for 12 modules. Get the exact strategy I used. 47 spots left. 30-day money back "guarantee".', risk_level: 'high', result_summary: 'Classic high-pressure digital course scam. "$47K/month in 3 months" is unsubstantiated and designed to target marketing professionals who are validating their own career ambitions. The refund "guarantee" is typically unenforceable and accompanied by burdensome conditions.', red_flags: ['Unverifiable $47K/month income claim', '"Only 47 spots left" — false scarcity, ads run continuously', '$997 price point is a psychological anchor common in info-product scams', 'Instagram ads for courses at this price point have high chargeback rates'], safe_next_step: 'Do not buy. Emma already has professional marketing experience that exceeds any course like this. If interested in business building, use free HubSpot Academy, CXL Institute, or free Reforge content instead.' },
    { type: 'contract', title: 'Coastal Property Group — Performance KPI Clause', content: 'Campaign performance is measured against the following KPIs: minimum 25 qualified leads per month, maximum cost per lead of AUD $85, and minimum 4.5x ROAS on property listing campaigns. Failure to meet 2 or more KPIs for 2 consecutive months shall entitle Coastal Property Group to a pro-rata fee reduction of 30%.', risk_level: 'medium', result_summary: 'The KPI-linked fee reduction clause is aggressive and unusual for a campaign management contract. Cost per lead targets depend heavily on listing quality, budget, and market conditions — all of which Emma does not fully control.', red_flags: ['KPI targets (CPL $85, ROAS 4.5x) are market-dependent and may be unrealistic in slow property seasons', 'Pro-rata reduction of 30% is significant — AUD $540/month reduction on $1,800 project fee', 'No clause for market conditions or advertiser-side changes that affect performance'], safe_next_step: 'Negotiate: add a force majeure clause for market conditions (property market slowdowns), increase KPI ranges (CPL AUD $95, ROAS 4.0x), and cap the fee reduction at 15% max. Get this in writing before next project.' },
    { type: 'subscription', title: 'NBN "Free Upgrade" Door-to-Door Salesperson', content: 'Hi, I\'m from SpeedBoost Telco. We\'re upgrading NBN cables in your building. I can offer you a free 3-month upgrade from 250 to 1000Mbps — just sign here for our NBN 1000/50 plan at $119/month after the trial.', risk_level: 'low', result_summary: 'This is a pressure sales tactic, not technically a scam, but the "free upgrade" is a bait-and-switch to a $119/month plan after 3 months. Aussie Broadband NBN 250 at $95/month is already adequate for a single person\'s home office.', red_flags: ['Door-to-door sales with "sign here now" pressure', 'Post-trial price $119/month is $24 more than current plan for marginal benefit', '"Free" upgrade is marketing for a paid service'], safe_next_step: 'Decline and close the door. If genuinely interested in higher speeds (not needed for a single person), compare plans at whistleout.com.au rather than signing anything at the door.' },
    { type: 'quote', title: 'Budget Jetstar SYD–DPS Bali Airfares — Aug 5 2026', content: 'Jetstar JQ-60 SYD → DPS August 5 2026: AUD $279/person return (including 20kg checked bag and a meal). Price valid until May 15 2026. 2 tickets = AUD $558 total.', risk_level: 'low', result_summary: 'Fair price for the route and season. August Bali is school holidays — prices typically rise from June. The AUD $279/return per person is good value. Book before May 15 to lock in this rate.', red_flags: ['Price valid until May 15 — will rise for school holidays', 'Jetstar bag allowance only 20kg — enough for 8-day trip but pack light'], safe_next_step: 'Book before May 15. Confirm Jess is in before purchasing. Also check AirAsia and Qantas basic economy for comparison — but this Jetstar price is competitive.' },
  ]
  let n = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null })
    if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  const quotes = [
    { title: 'Jetstar SYD–DPS Bali Return — August 2026 (×2)', amount: 558, currency: 'AUD', category: 'travel', region: 'Sydney to Bali', result_summary: 'AUD $279/return per person. Good market rate for Aug 2026. Book before May 15 to lock in.', risk_level: 'low', negotiation_script: 'No negotiation possible with Jetstar on published fares. Use PriceBeat or compare Scoot, AirAsia, and Qantas Economy. If Jess has a Qantas Points balance, check Qantas Classic Rewards instead.' },
    { title: 'Bondi Surf Collective Retainer Rate Review — $1,200/month', amount: 1200, currency: 'AUD', category: 'employment', region: 'Sydney, NSW', result_summary: 'Market rate for social media management (Instagram + TikTok, 4 posts/week) in Sydney is AUD $1,500–2,500/month. AUD $1,200 is below market at Emma\'s experience level. Justified to request $1,500/month at 6-month review.', risk_level: 'low', negotiation_script: 'Hi [Bondi Surf team], I\'ve been managing your social accounts for 5 months with consistent engagement growth (+34% followers, +51% reach). I\'d like to revisit the retainer to AUD $1,500/month from July. This is below the Sydney market rate for this scope and our results justify it. Happy to discuss at your next convenience.' },
  ]
  let qn = 0
  for (const q of quotes) { const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q }); if (!error) qn++; else console.log(`  ✗  quote: ${error.message}`) }
  console.log(`  ✔  ${qn}/${quotes.length} saved quotes`)

  const templates = [
    { type: 'rate_increase', tone: 'professional', context: 'Requesting Bondi Surf Collective retainer increase from AUD $1,200 to $1,500/month', script: `Hi [Name],\n\nThank you for the ongoing partnership — it has been a great 5 months. I have really enjoyed building the Bondi Surf Collective community on Instagram and TikTok.\n\nAs we pass the 6-month mark, I wanted to discuss updating the retainer to AUD $1,500/month. The scope has grown (TikTok was added in February with no rate adjustment), and the results have been strong — follower growth +34%, story reach up 51%, and the March paddle-out content reached 47K organically.\n\nThe Sydney market rate for this scope and quality of work is AUD $1,500–2,500/month. I think AUD $1,500 is fair for both sides.\n\nLet me know if you'd like to discuss. Looking forward to continuing the work.\n\nBest,\nEmma Wilson` },
    { type: 'payment_terms', tone: 'friendly', context: 'Following up on EW-2026-003 Bondi Surf invoice ($1,320 inc GST, due May 14)', script: `Hi [Name],\n\nJust a friendly follow-up on Invoice EW-2026-003 ($1,320 inc. GST) issued April 30, due May 14.\n\nHappy to resend if it got lost in the inbox! Let me know if there are any issues.\n\nThanks so much,\nEmma` },
  ]
  let tn = 0
  for (const t of templates) { const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t }); if (!error) tn++; else console.log(`  ✗  template: ${error.message}`) }
  console.log(`  ✔  ${tn}/${templates.length} negotiation templates`)
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'ATO Individual Tax Return FY 2025–26', type: 'tax', due_date: '2026-10-31', amount: null, currency: 'AUD', status: 'pending', authority: 'Australian Taxation Office', reference_no: 'TFN-488-271-993', notes: 'Lodge with registered tax agent by Oct 31 (or Feb 28 if on tax agent\'s lodgement list). Includes Forge Digital salary + freelance income. Engage H&R Block by September.' },
    { title: 'GST BAS Quarterly (Q4 FY2025–26)', type: 'tax', due_date: '2026-07-28', amount: null, currency: 'AUD', status: 'pending', authority: 'Australian Taxation Office', reference_no: null, notes: 'Q4 Apr–Jun 2026 BAS due Jul 28. Freelance income (Bondi Surf + Coastal Property) generates GST obligations. Keep Xero records current.' },
    { title: 'Bondi Junction Lease Renewal', type: 'renewal', due_date: '2026-08-31', amount: 2400, currency: 'AUD', status: 'pending', authority: 'LJ Hooker Bondi Junction (Property Manager)', reference_no: 'LEASE-BJ-2025-2024', notes: 'Current lease expires Aug 31. Give notice of intent to renew by July 1. Negotiate: aim for 5% max increase (current $2,400 → max $2,520). If 10%+ proposed, evaluate Newtown.' },
    { title: 'ABN Business Name Annual Review', type: 'renewal', due_date: '2026-06-30', amount: 42, currency: 'AUD', status: 'pending', authority: 'Australian Business Register (ABR)', reference_no: 'ABN-83-441-228-892', notes: 'Emma Wilson Creative ABN annual check and ASIC business name renewal if applicable ($42/year). Confirm GST registration status — turnover approaching $75K threshold.' },
    { title: 'Peloton AppleCare+ / Warranty Check', type: 'renewal', due_date: '2026-06-30', amount: 0, currency: 'AUD', status: 'pending', authority: 'Peloton Australia', reference_no: null, notes: 'Peloton Bike+ warranty expires Feb 2026 — already expired. Consider extended service plan for $199/year or review repair options if issues arise.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Bondi Surf Collective Social Media Management Agreement — Jan 2026', doc_type: 'contract', original_text: 'SERVICE AGREEMENT\nParties: Bondi Surf Collective Pty Ltd (Client) and Emma Wilson (Freelancer ABN 83 441 228 892).\nServices: Monthly social media management — Instagram and TikTok content creation and scheduling.\nFee: AUD $1,200/month + 10% GST. Invoiced monthly, payable within 14 days.\nIP: All content created specifically for Bondi Surf Collective shall be the property of the Client upon payment.\nTerm: January 1, 2026. Month-to-month, 30 days notice to terminate.\nGoverning Law: New South Wales, Australia.', summary_md: '## Bondi Surf Collective Agreement\n\n**What:** Monthly social media management at AUD $1,200/month + GST.\n\n**Key terms:**\n- Rate: $1,200/month (below market for scope — negotiate to $1,500 in July)\n- TikTok added Feb 2026 with no rate adjustment\n- Month-to-month with 30 days notice — flexible\n\n**Action:** Rate review in July 2026.', key_points: ['$1,200/month is below market for Instagram + TikTok management at this quality level', 'TikTok added to scope in February — rate not adjusted', '14-day payment terms — has been met consistently'], red_flags: [], expires_at: null, notes: 'Rate negotiation due July 2026. Target $1,500/month.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'ATO Individual Tax Return (Annual)', category: 'tax', frequency: 'annual', last_done_at: '2025-10-20', next_due_at: '2026-10-31', is_done: false, applicable: true, notes: 'FY 2025–26. Includes Forge Digital salary + freelance (Bondi Surf + Coastal Property). Engage tax agent by September.' },
    { item: 'GST BAS Quarterly Lodgement', category: 'tax', frequency: 'quarterly', last_done_at: '2026-04-28', next_due_at: '2026-07-28', is_done: false, applicable: true, notes: 'Q4 FY26 (Apr–Jun). Lodge via myGov or tax agent. GST collected from clients must be remitted.' },
    { item: 'ABN Annual Confirmation (ABR)', category: 'business', frequency: 'annual', last_done_at: '2025-06-01', next_due_at: '2026-06-30', is_done: false, applicable: true, notes: 'Confirm ABN details correct on ABN Lookup. ASIC business name renewal $42.' },
    { item: 'Super (SGC) Check — Forge Digital', category: 'business', frequency: 'quarterly', last_done_at: '2026-04-01', next_due_at: '2026-07-01', is_done: false, applicable: true, notes: 'Ensure Forge Digital is paying 11% SGC to Australian Retirement Trust. Check ATO myGov super tracker quarterly.' },
    { item: 'Bondi Junction Lease Renewal Notice', category: 'personal', frequency: 'annual', last_done_at: '2025-09-01', next_due_at: '2026-07-01', is_done: false, applicable: true, notes: 'Give 30-day renewal intent notice by July 1 for August 31 expiry. Negotiate rent increase cap at 5%.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  // 07:00 AEST (UTC+10) ≈ T21:00:00Z (prior day UTC but using same date for simplicity)
  const briefings = [
    { date: '2026-05-03', content_md: '**Good morning, Emma.** Sunday — Manly coastal walk today, perfect weather. A couple of things on the radar: Bali flights (Jetstar AUD $558 total for 2) need to be booked before May 15 before school holiday prices kick in. Your Afterpay application cover letter is 80% done — finish the case study section this week. **One thing: confirm Jess is in for Bali, then book the flights this afternoon.** You\'ve done the research. Execute.', highlights: [{ label: 'Bali flights', value: 'Book before May 15 — $558 for 2', link: '/travel', emoji: '🌴' }, { label: 'Afterpay application', value: 'Cover letter 80% done', link: '/career', emoji: '🎯' }, { label: 'Habit streak', value: 'Morning walks: 15/15 weekdays', link: '/habits', emoji: '🏃' }, { label: 'Savings', value: 'AUD $18,500 of $50K goal', link: '/money', emoji: '💰' }] },
    { date: '2026-05-04', content_md: '**Good morning, Emma.** Monday — content calendar planning day. Four Bondi Surf posts to schedule this week + the May TikTok Reel brief. The Bondi Surf invoice EW-2026-003 ($1,320) was sent Friday — payment due May 14. Energy Australia bill ($148) is due May 20. **Priority this week: submit the Afterpay application before Friday.** HubSpot cert has 3 modules left — complete them Tuesday for the CV before submitting.', highlights: [{ label: 'Afterpay application', value: 'Submit this week', link: '/career', emoji: '🎯' }, { label: 'HubSpot cert', value: '3 modules remaining', link: '/career', emoji: '📋' }, { label: 'Invoice pending', value: '$1,320 due May 14', link: '/business', emoji: '🧾' }, { label: 'Energy bill', value: '$148 due May 20', link: '/home', emoji: '💡' }] },
    { date: '2026-05-05', content_md: '**Good morning, Emma.** Tuesday — office day in Surry Hills. Great beach walk this morning. The Afterpay case study is looking strong — the Woolworths attribution model rebuild is the perfect proof point for a performance marketing role. **Today\'s deep work block (2–4pm): finish the Afterpay case study.** One clear, concise page with results-first structure. Hamish said the hiring manager is analytical — lead with numbers.', highlights: [{ label: 'Afterpay case study', value: 'Finish today — submit Friday', link: '/career', emoji: '🎯' }, { label: 'Gym session', value: 'Tonight at 6pm — Mon/Wed/Fri', link: '/habits', emoji: '🏋️' }, { label: 'Bondi Surf', value: 'May content calendar planned ✓', link: '/business', emoji: '📱' }, { label: 'Bali', value: 'Need to confirm Jess + book flights', link: '/travel', emoji: '🌴' }] },
    { date: '2026-05-06', content_md: '**Good morning, Emma.** Wednesday — WFH day. GST BAS for Q4 FY26 is due July 28 — start collecting invoices and expense records now so it doesn\'t become a scramble in July. Also, your ABN annual confirmation is due June 30 — 7 weeks away. **Today: 90-minute deep work block on the Coastal Property Google Display campaign optimisation — client review is Friday.** Also: book that Bali visa online (USD $35, 3 days processing).', highlights: [{ label: 'Coastal Property review', value: 'Friday — prepare today', link: '/business', emoji: '📊' }, { label: 'GST BAS Q4', value: 'Due Jul 28 — collect docs now', link: '/legal', emoji: '⚖️' }, { label: 'Bali e-visa', value: 'Book USD $35 — do it now', link: '/travel', emoji: '🌴' }, { label: 'Afterpay application', value: 'Submit Thursday', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-07', content_md: '**Good morning, Emma.** Thursday — Afterpay application submission day. The cover letter, case study, and HubSpot cert are all ready. A good submission now beats a perfect submission next week. **One thing: submit the Afterpay application this morning before 10am.** Then protect the rest of the day for Forge Digital client work. Coffee with Hamish tomorrow — ask him about the Canva marketing director opening too.', highlights: [{ label: 'Afterpay application', value: 'Submit TODAY — all ready', link: '/career', emoji: '🎯' }, { label: 'Hamish coffee', value: 'Friday — ask about Canva role too', link: '/career', emoji: '☕' }, { label: 'Invoice outstanding', value: '$1,320 Bondi Surf due May 14', link: '/business', emoji: '🧾' }, { label: 'Lease renewal', value: 'Give notice by Jul 1', link: '/legal', emoji: '🏠' }] },
    { date: '2026-05-08', content_md: '**Good morning, Emma.** Friday — Afterpay application was submitted yesterday. Well done. Beach walk done. Coffee with Hamish at 3pm. The Coastal Property client review went well — ROAS 4.8× against a 4.5× target. **Today: send the Bondi Surf rate review email (AUD $1,500 from July) — you\'ve delivered strong results and the timing is right.** The negotiation template is already in your protection vault. 2 minutes, done.', highlights: [{ label: 'Afterpay application', value: 'Submitted ✓', link: '/career', emoji: '✅' }, { label: 'Bondi Surf rate review', value: 'Send email today — $1,200 → $1,500', link: '/business', emoji: '💼' }, { label: 'Coastal Property ROAS', value: '4.8× (target 4.5×)', link: '/business', emoji: '📊' }, { label: 'Bali with Jess', value: 'Planning Aug 5–12', link: '/travel', emoji: '🌴' }] },
    { date: '2026-05-09', content_md: '**Good morning, Emma.** Saturday — coastal walk to Bondi, açaí bowl earned. Strong week: Afterpay applied, Hamish coffee done, Coastal Property strong results. Bills due this month: Energy Australia ($148, due May 20), Aussie Broadband ($95, due May 12), Telstra ($65, due May 25). **Pay Aussie Broadband today (due in 3 days) — AUD $95 in 2 minutes via BPAY.** Then enjoy the weekend. You\'re on track.', highlights: [{ label: 'ABB internet bill', value: '$95 due May 12 — pay today', link: '/home', emoji: '🌐' }, { label: 'Savings progress', value: 'AUD $18,500 of $50K goal', link: '/money', emoji: '💰' }, { label: 'Afterpay next step', value: 'Interview prep if callback', link: '/career', emoji: '🎯' }, { label: 'Bali flights', value: 'Book before May 15!', link: '/travel', emoji: '🌴' }] },
  ]
  let n = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T21:00:00Z` }, { onConflict: 'user_id,date' })
    if (!error) n++; else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Emma Wilson uid: ${UID}`)
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
