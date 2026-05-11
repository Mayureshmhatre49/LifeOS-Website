// Kenji Allen — Autistic adult, Manchester UK. QA Test Engineer.
// Highly structured identical habits. 50-minute focus cycles (not 25-min Pomodoro).
// Literal AI personality preference. Consistent, predictable data — no variation.
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

const EMAIL = 'kenji.allen@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedKenjiA() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — structured, literal goals
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Kenji Allen',
    occupation: 'QA Test Engineer',
    life_stage: 'early_career',
    country: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    goals: [
      'Pass ISTQB Advanced Level Test Analyst exam by October 2026',
      'Transition from manual QA to SDET (Software Development Engineer in Test) role by 2027',
      'Save GBP 12,000 in ISA by end of 2026',
      'Maintain consistent daily routine with no disruption to core schedule',
      'Establish remote-only working arrangement with current employer',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — GBP 38K/year (~£2,580 net/month after tax + NI)
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 950, spent: 950 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 280, spent: 280 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 80, spent: 80 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 60, spent: 60 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 120, spent: 120 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 100, spent: 95 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 500, spent: 500 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — identical predictable pattern (same shops, same amounts each month)
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 950, category: 'rent', description: 'Monthly rent – Didsbury, Manchester (always same amount, paid 1st)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 280, category: 'food', description: 'Aldi weekly shop ×4 weeks (same list every week – GBP 70/week)', expense_date: '2026-05-07' },
      { user_id: uid, amount: 120, category: 'utilities', description: 'Utilities bundle – EDF + BT broadband (direct debit, fixed amount)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 80, category: 'transport', description: 'Metrolink monthly tram pass (only on office days – Tue/Thu)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 60, category: 'health', description: 'Monthly therapy – sensory processing support, NHS referral', expense_date: '2026-05-08' },
      { user_id: uid, amount: 95, category: 'entertainment', description: 'Tech hobby: new USB hub for test environment + tech books', expense_date: '2026-05-05' },
      { user_id: uid, amount: 500, category: 'investment', description: 'Vanguard Stocks & Shares ISA – monthly direct debit', expense_date: '2026-05-01' },
    ])
  }

  // Habits — IDENTICAL daily routine, very consistent, no variation in names or timing
  if (await cnt('habits', uid) < 5) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Wake at 07:00 – same time every day', frequency: 'daily', current_streak: 48, target_streak: 60, started_on: '2026-03-20', category: 'health' },
      { user_id: uid, name: 'Breakfast: porridge + banana (same meal, 07:20)', frequency: 'daily', current_streak: 48, target_streak: 60, started_on: '2026-03-20', category: 'health' },
      { user_id: uid, name: 'Work block 1: 09:00–09:50 (50-min focus, 10-min break)', frequency: 'daily', current_streak: 44, target_streak: 60, started_on: '2026-03-25', category: 'work' },
      { user_id: uid, name: 'Work block 2: 10:00–10:50 (50-min focus, 10-min break)', frequency: 'daily', current_streak: 44, target_streak: 60, started_on: '2026-03-25', category: 'work' },
      { user_id: uid, name: 'Lunch: 12:00 exactly (same meal Mon/Wed/Fri, alternate Tue/Thu)', frequency: 'daily', current_streak: 48, target_streak: 60, started_on: '2026-03-20', category: 'health' },
      { user_id: uid, name: 'ISTQB study: 19:00–19:50 (50-min, structured flashcards)', frequency: 'daily', current_streak: 28, target_streak: 60, started_on: '2026-04-10', category: 'learning' },
    ])
  }

  // Focus sessions — always 50-minute cycles, consistent task types
  if (await cnt('focus_sessions', uid) < 5) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 50, actual_minutes: 50, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Test case authoring – Sprint 22 user authentication module', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T09:50:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 50, actual_minutes: 50, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Test case authoring – Sprint 22 payment module', started_at: '2026-05-09T10:00:00Z', ended_at: '2026-05-09T10:50:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 50, actual_minutes: 50, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'ISTQB study – Chapter 3.2: Equivalence Partitioning', started_at: '2026-05-09T19:00:00Z', ended_at: '2026-05-09T19:50:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 50, actual_minutes: 50, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Test case authoring – Sprint 22 notification module', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T09:50:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 50, actual_minutes: 48, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'ISTQB study – Chapter 3.1: Black Box Testing Techniques', notes: '2 minutes short — meeting interrupt at 19:48', started_at: '2026-05-08T19:00:00Z', ended_at: '2026-05-08T19:48:00Z' },
    ])
  }

  // Mood logs — consistent 3/5, stable (not variable)
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 3, note: 'Day was as expected. Routine followed. Work tasks completed on schedule. Satisfactory.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Standard day. All sessions completed. ISTQB chapter finished. Good.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Unexpected 3pm meeting disrupted work block 3. Difficult to recover focus. Routine broken.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Good day. No interruptions. All blocks completed. Porridge was correctly portioned.', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'ISTQB mock exam result: 78%. Above passing threshold. This is factually good progress.', logged_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Gratitude entries — literal, factual, structured format
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Completed 4 of 4 planned work blocks today (100% completion rate)', 'No unexpected interruptions during focus hours', 'ISTQB chapter 3.2 fully read and notes filed'] },
    { date: '2026-05-08', items: ['Sprint 22 test cases completed 2 days ahead of deadline', 'Internet connection was stable all day (zero interruptions)', 'Aldi had the correct stock of my usual oat brand'] },
    { date: '2026-05-07', items: ['ISTQB mock score: 78% (passing threshold is 65%)', 'ISA balance reached GBP 4,800 (40% of annual target)', 'Weather was consistent and mild — no sensory discomfort from heat'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — literal, structured, matter-of-fact
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Today I completed all six scheduled work and study blocks. The unexpected 3pm meeting on Wednesday was disruptive. I have requested that my manager move recurring meetings to 11am or 3:30pm only, because these fall in my designated break windows. This is a concrete request with a clear rationale and I expect it to be accommodated. Remote-only arrangement would resolve this class of problem entirely.", mood_tag: 'analytical', created_at: '2026-05-09T21:30:00Z' },
      { user_id: uid, content: "ISTQB Advanced mock exam result: 78%. The passing threshold is 65%. I have 22 more days of study before the examination date of June 1. Based on current progress rate (2 chapters per week, mock score improving by 4 points per test cycle), I project a final score of approximately 82%. This is within the acceptable range.", mood_tag: 'factual', created_at: '2026-05-07T21:30:00Z' },
      { user_id: uid, content: "I prefer AI responses that are direct and literal. Metaphors and idioms cause me to spend processing time decoding intent rather than information. Example of preferred response: 'The bug was in line 42 of auth.ts' — not 'you were almost there, just a tiny tweak needed.' I am noting this here as a preference record.", mood_tag: 'informational', created_at: '2026-05-05T21:30:00Z' },
    ])
  }

  // Decision logs — structured, literal framing
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Transition to SDET role vs. continue as manual QA Test Analyst?',
        options: JSON.stringify([
          { label: 'Continue as QA Test Analyst', pros: ['Current role is fully understood', 'Routine is established', 'No skill gap risk'], cons: ['Salary ceiling lower than SDET', 'Less automation work — I prefer structured code to unstructured exploratory testing'] },
          { label: 'Transition to SDET', pros: ['Structured coding work suits my preference for deterministic tasks', 'Higher salary band (GBP 48K–55K)', 'Clear skill path: Python + Pytest + Selenium'], cons: ['6-12 month learning period with uncertainty', 'Role change disrupts established routine'] },
        ]),
        result: JSON.stringify({ decision: 'Pursue SDET transition; begin Python + Pytest study after ISTQB exam in June', reasoning: 'SDET work is more deterministic and structured than exploratory manual QA. This matches my cognitive preference. Timeline: ISTQB June, Python Q3, SDET role applications Q4 2026.' }),
        mode: 'analyze',
        favorite: true,
      },
      {
        user_id: uid,
        question: 'Request permanent remote-only arrangement vs. continue hybrid (Tue/Thu office)?',
        options: JSON.stringify([
          { label: 'Request permanent remote-only', pros: ['Eliminates sensory disruption in open office', 'Removes commute (80 mins total, disrupts routine)', 'Better focus output (verified: 4 blocks remote vs. 2.5 blocks office days)'], cons: ['Manager may resist', 'Some team rituals require presence'] },
          { label: 'Continue hybrid (Tue/Thu)', pros: ['Current arrangement accepted', 'No negotiation required'], cons: ['Office disrupts focus blocks on two days per week (26% of working days)'] },
        ]),
        result: JSON.stringify({ decision: 'Submit formal flexible working request under UK Employment Rights Act (right to request after 26 weeks)', reasoning: 'Evidence-based case: remote days produce measurably higher output. ISTQB exam period is legitimate timing for this request.' }),
        mode: 'compare',
        favorite: false,
      },
    ])
  }

  // Investments
  if (await cnt('investments', uid) < 2) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Vanguard FTSE Global All Cap (Stocks & Shares ISA)', type: 'etf', invested_amount: 4800, current_value: 5020, account: 'Vanguard ISA' },
      { user_id: uid, name: 'Cash ISA – Marcus by Goldman Sachs', type: 'savings', invested_amount: 2400, current_value: 2412, account: 'Marcus Cash ISA' },
    ])
  }

  // Contacts — structured, minimal, purposeful
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'David Thorpe', group_name: 'Work mentor', email: 'd.thorpe@currentemployer.example.com', notes: 'Engineering manager. Reasonable and direct. Monthly 1:1 on last Thursday of month.' },
      { user_id: uid, name: 'NAS (National Autistic Society) Helpline', group_name: 'Support network', phone: '0808 800 4104', notes: 'Reference contact. Workplace advocacy and rights. Used once in 2025.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Pass ISTQB Advanced Test Analyst (CTAL-TA)', category: 'skill', status: 'active', target_date: '2026-06-01', progress_pct: 62, notes: 'Exam booked: June 1, 2026. Mock score 78%. 22 study days remaining. On track.' },
      { user_id: uid, title: 'Begin Python + Pytest for SDET transition', category: 'learning', status: 'active', target_date: '2026-07-01', progress_pct: 0, notes: 'Starts post-ISTQB. Course selected: Python Institute PCAP + Real Python Pytest track.' },
    ])
  }

  // Trip — Edinburgh (familiar destination, revisit)
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Edinburgh',
      country: 'GB',
      starts_on: '2026-08-08',
      ends_on: '2026-08-11',
      budget_total: 550,
      status: 'booked',
      purpose: 'leisure',
      notes: 'Return visit — same hotel as 2025, same itinerary. Familiar = lower sensory load. Avoided Fringe peak (Fringe is Aug 1-25, going early week when crowds are lower).',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'transport', title: 'Manchester Piccadilly → Edinburgh Waverley (Avanti, seat 22A reserved)', starts_at: '2026-08-08T08:15:00Z', ends_at: '2026-08-08T11:30:00Z', cost: 72 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Ibis Edinburgh Centre (same room type as 2025 – standard double, quiet floor requested)', starts_at: '2026-08-08T14:00:00Z', ends_at: '2026-08-11T11:00:00Z', cost: 285 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'National Museum of Scotland (visited before — no surprises)', starts_at: '2026-08-09T10:00:00Z', ends_at: '2026-08-09T13:00:00Z', cost: 0 },
        { trip_id: trip.id, user_id: uid, type: 'restaurant', title: 'Breakfast: same café as 2025 (Hideout Café, known menu)', starts_at: '2026-08-09T08:30:00Z', ends_at: '2026-08-09T09:15:00Z', cost: 24 },
      ])
    }
  }

  console.log('✓ Kenji Allen seeded')
}
seedKenjiA().catch(e => { console.error(e); process.exit(1) })
