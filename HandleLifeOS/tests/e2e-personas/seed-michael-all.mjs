/**
 * Seed: Michael Osei — Football Coach & Youth Academy Founder, Accra, Ghana (GHS)
 * Email: michael.osei@e2e-test.handlelifeos.app
 * Persona #40 — Osei Youth Football Academy (80 students), part-time Accra Lions FC analyst, GFA affiliation goal
 */

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

const EMAIL = 'michael.osei@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedMichael() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Michael Osei',
    occupation: 'Football Coach & Founder — Osei Youth Football Academy, Accra',
    life_stage: 'mid_career',
    country: 'GH',
    currency: 'GHS',
    timezone: 'Africa/Accra',
    goals: [
      'Get 3 Osei Academy players signed by European youth academies by 2027',
      'Obtain GFA Phase 1 affiliation certificate by December 2026',
      'Grow academy enrollment to 120 students — currently 80',
      'Accept part-time Black Stars U-17 assistant analyst role if offered by GFA'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (GHS scale — 1 USD ≈ 15 GHS, idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 3000, spent: 3000, currency: 'GHS' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 2500, spent: 2300, currency: 'GHS' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 6000, spent: 5200, currency: 'GHS' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 1200, spent: 1080, currency: 'GHS' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 2500, spent: 2500, currency: 'GHS' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 3000, spent: 1500, currency: 'GHS' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 2500, spent: 1150, currency: 'GHS' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 6000, spent: 2800, currency: 'GHS' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 2500, spent: 2500, currency: 'GHS' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 3000, currency: 'GHS', category: 'rent', description: 'Apartment rent — East Legon, Accra (April)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 2800, currency: 'GHS', category: 'misc', description: 'Pitch hire — Accra Sports Stadium training ground (April — 12 sessions)', expense_date: '2026-04-03' },
      { user_id: uid, amount: 1400, currency: 'GHS', category: 'misc', description: 'Training bibs, cones, agility ladders — equipment restock', expense_date: '2026-04-07' },
      { user_id: uid, amount: 1200, currency: 'GHS', category: 'food', description: 'Groceries — Palace Mall Supermarket + chop bar weekly lunches', expense_date: '2026-04-10' },
      { user_id: uid, amount: 850, currency: 'GHS', category: 'transport', description: 'Trotro + Uber — academy site, GFA offices, Accra Lions training', expense_date: '2026-04-14' },
      { user_id: uid, amount: 1800, currency: 'GHS', category: 'misc', description: 'Goalkeeper kit — gloves + padded shorts for U-15 squad (12 pairs)', expense_date: '2026-04-18' },
      { user_id: uid, amount: 1100, currency: 'GHS', category: 'food', description: 'Family groceries — wife Abena + 2 children, rest of April', expense_date: '2026-04-24' },
      { user_id: uid, amount: 3000, currency: 'GHS', category: 'rent', description: 'Apartment rent — East Legon (May)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 2400, currency: 'GHS', category: 'misc', description: 'Academy player transport subsidy — 15 scholarship players from Ashaiman', expense_date: '2026-05-04' },
      { user_id: uid, amount: 1100, currency: 'GHS', category: 'food', description: 'Groceries + post-training team meal (rice and stew, 25 U-17 players)', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Pre-dawn run — 5km Labadi Beach Road', description: 'Running before training keeps energy high for 6-hour coaching days. 5am before the heat.', frequency: 'daily',
        target_count: 1, current_streak: 22, longest_streak: 45, completed_today: true,
        category: 'health', color: '#f59e0b', icon: '🏃', reminder_time: '05:00', active: true, created_at: '2026-01-05T00:00:00Z'
      },
      {
        user_id: uid, name: 'Tactical video analysis — 1 session', description: 'One hour of opponent or own team video analysis per coaching day. The game is won in preparation.', frequency: 'daily',
        target_count: 1, current_streak: 14, longest_streak: 30, completed_today: true,
        category: 'work', color: '#8b5cf6', icon: '📹', reminder_time: '19:00', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Academy player progress review — weekly', description: 'Every Sunday: review each player\'s development notes, flag standouts, update Europe scouting targets.', frequency: 'weekly',
        target_count: 1, current_streak: 7, longest_streak: 18, completed_today: false,
        category: 'work', color: '#10b981', icon: '⚽', reminder_time: '18:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'GFA compliance files — monthly update', description: 'Phase 1 affiliation requires updated registration docs, player medical records, pitch safety certificates.', frequency: 'monthly',
        target_count: 1, current_streak: 3, longest_streak: 6, completed_today: false,
        category: 'work', color: '#3b82f6', icon: '📋', reminder_time: '10:00', active: true, created_at: '2026-02-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'MoMo savings — weekly GHS 500', description: 'GHS 500 to MTN MoMo savings wallet every Friday. Academy future fund — building to own training ground deposit.', frequency: 'weekly',
        target_count: 1, current_streak: 10, longest_streak: 24, completed_today: false,
        category: 'finance', color: '#ec4899', icon: '💰', reminder_time: '17:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 176, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'U-17 squad scouting report — 5 European academies for Kofi Mensah and Yaw Dartey',
        notes: 'Compiled reports: PSV Eindhoven U17, FC Midtjylland, RSC Anderlecht youth, Vitesse Arnhem, RB Salzburg. Kofi (striker, 16) and Yaw (CM, 15) profiles sent to 3 scouts.',
        started_at: '2026-04-12T10:00:00Z', ended_at: '2026-04-12T12:56:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'GFA Phase 1 affiliation application — document pack assembly',
        notes: 'Assembled: constitution, pitch certification, 3-year financial records, DBS certificates for all coaches, medical officer letter. 2 documents outstanding: ownership deed and insurance certificate.',
        started_at: '2026-04-22T09:00:00Z', ended_at: '2026-04-22T11:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Accra Lions match prep — tactical analysis Ghana Premier League matchday 24',
        notes: 'Identified 3 set-piece vulnerabilities in Bechem United defensive shape. Prepared corner kick patterns for Accra Lions attackers. Sent to head coach Monday morning.',
        started_at: '2026-05-04T20:00:00Z', ended_at: '2026-05-04T21:28:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 35, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Hearts of Oak coaching offer — pros/cons analysis',
        notes: 'Stopped at 35 min — called to deal with injured player at academy. Resumed next evening. Big decision, needs clear head.',
        started_at: '2026-05-07T21:00:00Z', ended_at: '2026-05-07T21:35:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Kofi Mensah scored a hat trick in the GASSA U-17 finals. 16 years old. The PSV Eindhoven scout was in the stands. This is why we build academies.', logged_at: '2026-04-16T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'GFA Phase 1 docs nearly complete. Ownership deed is the last hurdle — landlord slow to provide. Patience. This is Ghana.', logged_at: '2026-04-23T19:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Hearts of Oak approached me to join as assistant coach. Full-time. GHS 12K/month. It is good money. But I would have to step back from the academy. This is a real dilemma.', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'PSV scout replied — they want to see Kofi and Yaw at the trial camp in Eindhoven this August! Bought the boys ice cream to celebrate. Two years of patient coaching showing up.', logged_at: '2026-05-10T21:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-16', items: ['Kofi Mensah and his natural gift — our job is just to protect it', 'The PSV scout being in the stands on exactly the right day', 'Abena for holding the family together when I am at training 12 hours a day'] },
    { date: '2026-04-23', items: ['GFA process moving forward despite the document delays', 'MTN MoMo making savings automatic and friction-free', 'The parents who trust us with their sons\' football dreams'] },
    { date: '2026-05-10', items: ['PSV Eindhoven trial camp invitation for Kofi and Yaw', 'Every coach who ever believed in me as a player — paying it forward', 'Accra — this city is hard but it is mine'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // 9. Journal entries
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      {
        user_id: uid, title: 'Kofi at the Finals — The Moment That Justifies Everything',
        content: 'Three goals. The third was a volley from outside the box that the goalkeeper had no answer for. I could hear one of the scouts on the phone. The academy runs on scholarship money we are still raising, pitch hire fees that strain the budget, and parents who don\'t always trust us. But in that moment, none of that mattered. Kofi is going to Eindhoven. I know it.',
        mood: 5, tags: ['player', 'breakthrough', 'academy'], created_at: '2026-04-17T22:00:00Z'
      },
      {
        user_id: uid, title: 'Hearts of Oak and the Academy — The Hardest Decision',
        content: 'The offer is real. GHS 12,000/month, full coaching staff support, Champions League qualifying exposure. It is more money than I have ever earned coaching. But the academy needs me here. We have 80 students. Kofi and Yaw need me to shepherd their Europe move. If I go full-time to Hearts, who runs the Tuesday sessions? Abena said: "You built this academy. Don\'t abandon it before it can walk." She is right. But GHS 12K is also school fees for our children.',
        mood: 3, tags: ['decision', 'career', 'hearts-of-oak'], created_at: '2026-05-08T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Accept Hearts of Oak FC assistant coach offer (GHS 12,000/month, full-time) or remain independent with Osei Academy + Accra Lions part-time?',
        category: 'Career',
        mode: 'compare',
        options: [
          { label: 'Accept Hearts of Oak full-time', pros: ['GHS 12,000/month — 2× current coaching income', 'Ghana Premier League platform — visibility for eventual national team role', 'Champions League qualifying exposure builds reputation'], cons: ['Must step back from Osei Academy day-to-day coaching', 'Kofi + Yaw Europe move loses primary shepherd', 'GFA Phase 1 affiliation momentum interrupted', 'Risk: if Hearts underperforms, contract not renewed'] },
          { label: 'Stay with Academy + Accra Lions part-time', pros: ['Osei Academy grows under direct leadership', 'Kofi + Yaw PSV trial camp has full support', 'GFA affiliation completed this year — first step to owned facility', 'Long-term: owning a certified academy is more valuable than coaching job'], cons: ['Lower income — GHS 6,000-8,000/month combined', 'School fees pressure on family budget', 'Slower national team pathway'] }
        ],
        result: { summary: 'Academy is the long-term asset. Hearts offer can be countered: propose consulting role (3 days/week, GHS 6K) that preserves academy leadership. If Hearts refuses part-time, decline and focus on GFA affiliation and Europe placements.', chosen: 'Counter-propose 3-day/week consulting — decline if full-time only', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-08T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Expand Osei Academy to Kumasi (second site) in 2026, or consolidate Accra first and wait until GFA Phase 1 is certified?',
        category: 'Business',
        mode: 'analyze',
        options: [
          { label: 'Open Kumasi site 2026', pros: ['Kumasi talent pool — Ashanti region produces top players', 'First mover in structured youth coaching there', 'Higher enrollment = more revenue and impact'], cons: ['Split management before Accra is stable', 'GFA affiliation for new site requires separate process', 'Capital needed: GHS 80K setup minimum'] },
          { label: 'Consolidate Accra first', pros: ['GFA Phase 1 certification completes this year', 'Kofi + Yaw Europe placements prove the model', '80→120 students grows revenue without new site overhead'], cons: ['Missing the Kumasi market window', 'Competitors may set up there first'] }
        ],
        result: { summary: 'Kumasi before Phase 1 cert is premature. Certify Accra, place 2 players in Europe, then Kumasi from position of validated reputation. Target Kumasi site Q1 2028.', chosen: 'Accra consolidation and GFA certification first — Kumasi 2028', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-28T11:00:00Z'
      }
    ])
  }

  // 11. Investments (GHS — football-focused savings)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'MTN MoMo Savings — Academy Future Fund', type: 'savings', invested_amount: 26000, current_value: 26000, currency: 'GHS', account: 'MTN MoMo', notes: 'GHS 500/week automated savings. Building toward own training ground deposit. Target GHS 80K.', purchase_date: '2024-01-01' },
      { user_id: uid, name: 'GCB Fixed Deposit — 12 months', type: 'savings', invested_amount: 18000, current_value: 19800, currency: 'GHS', account: 'GCB Bank Ghana', notes: '10% annual interest GCB fixed deposit. Emergency fund — covers 4 months of academy operating costs.', purchase_date: '2025-06-01' },
      { user_id: uid, name: 'Absa Ghana Unit Trust', type: 'mutual_fund', invested_amount: 12000, current_value: 13400, currency: 'GHS', account: 'Absa Ghana', notes: 'Balanced unit trust. Long-term family wealth building separate from academy finances.', purchase_date: '2024-09-01' },
    ])
  }

  // 12. Business clients (academy + coaching contracts)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Accra Lions FC — Technical Department', email: 'technical@accralions.gh', company: 'Accra Lions FC', notes: 'Ghana Premier League club. Part-time analyst role: GHS 3,500/month for tactical analysis + matchday support. 2 days per week.', currency: 'GHS' },
      { user_id: uid, name: 'MTN Ghana — CSR Sports Sponsorship', email: 'csr@mtn.com.gh', company: 'MTN Ghana', notes: 'Kit sponsorship: 80 jerseys + bibs + training balls annually. In-kind value GHS 12,000/year. Osei Academy logo on MTN community sports materials.', currency: 'GHS' },
      { user_id: uid, name: 'GFA Youth Development Directorate', email: 'youth@gfa.com.gh', company: 'Ghana Football Association', notes: 'Phase 1 affiliation application in process. GFA affiliation unlocks insurance access, referee access, official inter-academy competition.', currency: 'GHS' },
      { user_id: uid, name: 'Ashaiman District Schools', email: 'sports@ashaiman.edu.gh', company: 'Ashaiman Municipality', notes: 'Scholarship programme: 15 Ashaiman students at no cost (GHA government social fund covers transport subsidy). Community goodwill critical for pitch access.', currency: 'GHS' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'Accra Lions — Ghana Premier League Season 2025/26 Analysis', status: 'active', fee: 42000, currency: 'GHS', notes: 'GHS 3,500/month × 12 months = GHS 42,000. Matchday tactical reports, opposition analysis, set-piece design. Contract runs to May 2026.', due_date: '2026-05-31' },
        { user_id: uid, client_id: clients[1].id, name: 'MTN Kit Sponsorship — 2026/27 Season', status: 'proposal', fee: 14000, currency: 'GHS', notes: 'Renewal proposal: upgrade to GHS 14,000 in-kind (add training equipment + water bottles). Meeting MTN CSR manager June 2026.', due_date: '2026-07-01' },
        { user_id: uid, client_id: clients[2].id, name: 'GFA Phase 1 Affiliation — Osei Academy', status: 'active', fee: 0, currency: 'GHS', notes: 'No fee — process. Application 90% complete. Outstanding: ownership deed + insurance certificate. Target submission: June 30 2026.', due_date: '2026-06-30' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Abena Osei', email: 'abena.osei@gmail.com', phone: '+233244123456', group_name: 'Family', notes: 'Wife. Runs the academy administration and parent communications. The real CEO of Osei Academy. Two children: Kwame (8) and Ama (6).' },
      { user_id: uid, name: 'Erik van der Berg (PSV Eindhoven)', email: 'e.vandenberg@psv.nl', phone: '+31612345678', group_name: 'Business', notes: 'PSV Eindhoven U-17 scout for West Africa. Confirmed interest in Kofi Mensah and Yaw Dartey. Trial camp Eindhoven August 2026.' },
      { user_id: uid, name: 'Emmanuel Boateng (GFA)', email: 'e.boateng@gfa.com.gh', phone: '+233302554545', group_name: 'Business', notes: 'GFA Youth Development coordinator. Phase 1 affiliation contact. Responsive when you go in person — emails get lost.' },
      { user_id: uid, name: 'Coach Kweku Donkor', email: '', phone: '+233243456789', group_name: 'Mentors', notes: 'Former Ghanaian professional (Hearts of Oak 1998-2006). Michael\'s mentor. Monthly lunch in Osu to discuss academy development.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Place 2 academy players in European academies (Kofi + Yaw)', category: 'impact',
        description: 'PSV Eindhoven trial camp confirmed for August. Kofi Mensah (striker, 16) and Yaw Dartey (CM, 15). Also in contact with FC Midtjylland and Vitesse Arnhem.',
        target_date: '2026-12-31', status: 'active', progress_pct: 60
      },
      {
        user_id: uid, title: 'Obtain GFA Phase 1 Academy Affiliation', category: 'other',
        description: 'Application 90% complete. Outstanding: ownership deed (landlord) + insurance certificate. Target submission June 30, decision September 2026.',
        target_date: '2026-09-30', status: 'active', progress_pct: 90
      },
      {
        user_id: uid, title: 'Grow academy enrollment to 120 students', category: 'income',
        description: 'Currently 80 students (including 15 scholarship). Each paying student: GHS 400/term × 3 terms. Target 120 students by Q1 2027 via Kumasi referrals and GFA visibility.',
        target_date: '2027-03-31', status: 'active', progress_pct: 67
      },
      {
        user_id: uid, title: 'Accumulate GHS 80,000 training ground deposit', category: 'income',
        description: 'Current savings: GHS 56,000 (MoMo + GCB). Target GHS 80K for land deposit in Tema or Spintex Road. Own pitch removes GHS 33K/year hire costs.',
        target_date: '2027-12-31', status: 'active', progress_pct: 70
      },
    ])
  }

  // 15. Trip — GASSA U-17 Finals + PSV scout attendance
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Kumasi, Ghana — GASSA U-17 Zonal Finals', country_code: 'GH',
        starts_on: '2026-04-15', ends_on: '2026-04-17',
        purpose: 'business', status: 'completed',
        budget_total: 2800, currency: 'GHS',
        notes: 'Osei Academy U-17 squad at Ghana Amateur School Sports Association finals. Kofi Mensah scored hat-trick. PSV Eindhoven scout Erik van der Berg in attendance — contact established.'
      },
      {
        user_id: uid, destination: 'Eindhoven, Netherlands — PSV Academy Trial Camp', country_code: 'NL',
        starts_on: '2026-08-10', ends_on: '2026-08-17',
        purpose: 'business', status: 'planning',
        budget_total: 8500, currency: 'GHS',
        notes: 'Accompanying Kofi Mensah and Yaw Dartey to PSV Eindhoven U-17 trial camp. 1-week assessment. Need to arrange visas, travel insurance, chaperone documentation.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'Accra → Kumasi — VIP bus (Academy squad)', starts_at: '2026-04-15T05:00:00Z', ends_at: '2026-04-15T09:00:00Z', cost: 1200, currency: 'GHS', notes: 'VIP bus Accra to Kumasi. 15 players + 2 coaches. Departed 5am for afternoon match.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Golden Tulip City Hotel Kumasi — 2 nights', starts_at: '2026-04-15T14:00:00Z', ends_at: '2026-04-17T10:00:00Z', cost: 1000, currency: 'GHS', notes: 'Team accommodation. GASSA provided partial subsidy. Shared rooms for players.' },
        { trip_id: trips[0].id, type: 'activity', title: 'GASSA U-17 Zonal Finals — Osei Academy vs. St. Hubert Seminary', starts_at: '2026-04-16T14:00:00Z', ends_at: '2026-04-16T16:00:00Z', cost: 0, currency: 'GHS', notes: 'Won 4-1. Kofi hat-trick. PSV scout in stands. Erik contacted Michael after the match.' },
      ])
    }
  }

  // 16. Meal plans (Accra family man + coaching lifestyle)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Hausa koko + koose (5am pre-run meal)', calories: 380, notes: 'Light protein before 5km run. Abena makes the koose the night before.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Jollof rice + grilled chicken + fried plantain', calories: 820, notes: 'Post-morning training lunch. Chop bar near academy pitch — GHS 35.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Abena\'s palm nut soup + fufu', calories: 740, notes: 'Family dinner. The boys eat with us on training days.' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Waakye + fish + shito', calories: 720, notes: 'Wednesday is waakye day at the La roadside spot. Tradition.' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'dinner', recipe_name: 'Banku + tilapia + okro stew', calories: 780, notes: 'Friday family dinner. Kwame and Ama help Abena pound — small hands but enthusiastic.' },
    ])
  }

  console.log('✅ Michael Osei (#40) seeded — GHS, Accra, Osei Youth Football Academy, PSV Eindhoven trial camp booked')
}

seedMichael().catch(e => { console.error(e); process.exit(1) })
