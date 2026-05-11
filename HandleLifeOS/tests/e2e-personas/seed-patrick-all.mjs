/**
 * Seed all data for Patrick O'Brien (E2E persona #28).
 * 46yo Traditional Pub Owner, Galway, Ireland. EUR. GAA community, seasonal tourism.
 * Run: node tests/e2e-personas/seed-patrick-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'patrick.obrien@e2e-test.handlelifeos.app'
const PASSWORD = 'E2eTest1234!'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function main() {
  /* ── user ── */
  let uid
  const { data: existing } = await sb.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === EMAIL)
  if (found) {
    uid = found.id
    console.log('User exists:', uid)
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL, password: PASSWORD, email_confirm: true
    })
    if (error) throw error
    uid = data.user.id
    console.log('User created:', uid)
  }

  /* ── profile ── */
  await sb.from('profiles').upsert({
    id: uid,
    display_name: "Patrick O'Brien",
    occupation: "Traditional Pub Owner — O'Brien's Bar, Galway",
    life_stage: 'mid_career',
    country: 'IE',
    currency: 'EUR',
    timezone: 'Europe/Dublin',
    goals: ['survive slow winter months without debt', 'renovate pub back snug', 'retire mortgage in 8 years', 'see son play for Connacht GAA senior'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'pub_details', value: "O'Brien's Bar — family pub est. 1962 by Patrick's father Séamus. High St, Galway city. Traditional live music 4 nights/week. Capacity 80. Famous for trad sessions Thursday-Sunday", confidence: 95 },
      { user_id: uid, type: 'fact', key: 'seasonality', value: 'Peak: June-September (tourism) + Galway Races July (€25K+ weekly revenue). Low: November-February (~€8,000/month). Annual revenue avg: ~€480,000. Margin tight at 18%', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'family', value: 'Married to Siobhán (primary school teacher). 3 children: Ciarán (19, studying Commerce NUI Galway), Áine (16), Seán (14, GAA star). Mortgage on family home in Salthill', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'community', value: 'GAA Galway — Galway FC vice-chairman. Mass on Sundays. Pub is the community anchor — has hosted wakes, engagements, Communion parties since 1962', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'challenges', value: 'Minimum wage increases (€13.50/hr) squeezing margins. Business rates up 12% in 2026. Craft beer competition from 3 new venues on Quay St. Staff retention difficult', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'management', value: '3 full-time bar staff, 2 kitchen staff, 4 part-time weekend. Patrick works the bar himself Tuesday-Thursday plus Sunday. Siobhán does accounts on weekends', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 9500, savings_target: 800, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 11200, savings_target: 1200, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 13500, savings_target: 2000, currency: 'EUR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'bills', amount: 6800, description: 'Staff wages — 5 full-time + 4 part-time May', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'bills', amount: 1850, description: 'Drinks supplier: Diageo + Heineken + local craft ales (monthly order)', expense_date: '2026-05-04', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'rent', amount: 1620, description: 'Salthill family home mortgage (Bank of Ireland)', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'utilities', amount: 680, description: 'Pub electricity + gas + broadband (commercial rate)', expense_date: '2026-05-03', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'misc', amount: 1200, description: 'Galway City Council commercial rates (monthly instalments)', expense_date: '2026-05-02', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'food', amount: 480, description: 'Pub kitchen supplies (toasted sandwiches + Irish stew)', expense_date: '2026-05-06', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'misc', amount: 350, description: 'Trad musicians sessún fees (4 sessions × €87)', expense_date: '2026-05-08', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'education', amount: 280, description: "Ciarán's NUI Galway book allowance + Seán's GAA gear", expense_date: '2026-05-05', is_recurring: false, currency: 'EUR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Winter survival reserve (Nov-Feb)', category: 'emergency_fund', target_amount: 35000, current_amount: 22000, currency: 'EUR', target_date: '2026-10-31' },
      { user_id: uid, title: 'Back snug renovation fund', category: 'home', target_amount: 45000, current_amount: 8500, currency: 'EUR', target_date: '2027-10-31' },
      { user_id: uid, title: 'Ciarán\'s third and fourth year university', category: 'education', target_amount: 18000, current_amount: 6500, currency: 'EUR', target_date: '2028-06-30' },
      { user_id: uid, title: 'Early mortgage overpayment plan', category: 'home', target_amount: 50000, current_amount: 12000, currency: 'EUR', target_date: '2030-01-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: "O'Brien's Bar Property (freehold)", type: 'real_estate', invested_amount: 380000, current_value: 620000, currency: 'EUR', account: 'Family asset', notes: 'Inherited from father Séamus in 2009. Primary business asset. Surveyed 2024 at €620K. Never selling' },
      { user_id: uid, name: 'Salthill Family Home', type: 'real_estate', invested_amount: 285000, current_value: 520000, currency: 'EUR', account: 'Bank of Ireland mortgage', notes: '€132K remaining on mortgage. €1,620/month. 8 years left. Property up significantly since 2018 purchase' },
      { user_id: uid, name: 'Zurich Life Pension (PRB)', type: 'other', invested_amount: 85000, current_value: 102000, currency: 'EUR', account: 'Zurich Life', notes: 'Personal Retirement Bond. Contributing €500/month. Revenue-approved — full tax relief at 40% rate' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: '7am pub prep + stock check', icon: '🍺', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'GAA training / match (Seán)', icon: '⚽', color: 'emerald', frequency: 'weekly', days_of_week: [3,6], target_per_day: 1 },
      { user_id: uid, name: 'Weekly accounts (Siobhán + Patrick)', icon: '📊', color: 'indigo', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: 'Morning walk (Salthill prom)', icon: '🚶', color: 'cyan', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Sunday Mass', icon: '⛪', color: 'violet', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
    ]
    const { data } = await sb.from('habits').insert(habits).select()
    data.forEach(h => { habitIds[h.name] = h.id })
  } else {
    const { data } = await sb.from('habits').select('id, name').eq('user_id', uid)
    data.forEach(h => { habitIds[h.name] = h.id })
  }

  /* ── habit_logs ── */
  if (await cnt('habit_logs', uid) === 0) {
    const logs = []
    const allDates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                      '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const pubId = habitIds['7am pub prep + stock check']
    const walkId = habitIds['Morning walk (Salthill prom)']
    if (pubId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: pubId, date: d, count: 1 }))
    if (walkId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: walkId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Complete back snug renovation before summer 2027', category: 'impact', target_date: '2027-06-01', status: 'active', progress_pct: 19, description: 'Original 1960s snug restored to full use. Will seat 12 for private trad sessions — premium revenue stream' },
      { user_id: uid, title: 'Reduce winter cash-flow reliance on overdraft', category: 'income', target_date: '2026-10-31', status: 'active', progress_pct: 63, description: 'Target: €35K reserve before November. Currently €22K. Need strong summer to hit this' },
      { user_id: uid, title: 'Win Best Traditional Pub — Connacht Bar & Restaurant Awards', category: 'role', target_date: '2027-03-01', status: 'active', progress_pct: 35, description: 'Nominated 2025 — missed shortlist. 2026 application being prepared. Live trad music angle is differentiator' },
      { user_id: uid, title: 'Achieve full pension contribution ceiling (€20K/year)', category: 'other', target_date: '2027-12-31', status: 'active', progress_pct: 30, description: 'Currently contributing €6K/year. Revenue allows relief up to €20K at 40% — significant tax saving' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Máire Ní Fhlathartha', email: 'maire@galwaytourism.ie', company: 'Galway Tourism Office', notes: "Sends tour groups for trad music evenings. Block bookings for culture trails. O'Brien's on official heritage pub list", currency: 'EUR' },
      { user_id: uid, name: 'Brian Dempsey', email: 'bdempsey@connachtrugby.ie', company: 'Connacht Rugby (corporate events)', notes: 'Post-match functions for corporate sponsors. 3 events per season at €2,400 each. Reliable repeat client', currency: 'EUR' },
    ]
    const { data } = await sb.from('business_clients').insert(clients).select()
    clientIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('business_clients').select('id').eq('user_id', uid)
    clientIds = data.map(c => c.id)
  }

  /* ── business_projects ── */
  if (await cnt('business_projects', uid) === 0) {
    await sb.from('business_projects').insert([
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'Galway Tourism Trad Music Evenings (Summer 2026)', status: 'active', fee: 18000, currency: 'EUR', notes: '15 Tuesday evening sessions booked June-September. €1,200 per session (pre-paid deposit received)' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Connacht Rugby Season End Function', status: 'active', fee: 2400, currency: 'EUR', notes: 'May 22 post-match dinner function. 60 guests. Full bar tab + hot buffet from kitchen' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Siobhán O\'Brien', email: 'siobhan.obrien@gmail.com', group_name: 'family', role: 'Wife — Primary school teacher, accountant-in-chief', notes: 'Does all pub accounts weekends. Steady income €52K as teacher — family financial anchor when pub has slow months', strength: 5 },
      { user_id: uid, name: 'Declan Flaherty', group_name: 'friend', email: 'declan@lenaflaherty.com', role: 'Solicitor & GAA chairman', notes: 'Best friend since school. GAA Galway chairman. Advised on pub licensing renewals. Pint every Thursday', strength: 5 },
      { user_id: uid, name: 'Tomás Ó Flaithearta', group_name: 'work', email: 'tomas.trad@gmail.com', role: 'Traditional musician — regular trad session leader', notes: 'Plays uilleann pipes. Leads Thursday sessions since 2014. The reason tourists come back', strength: 4 },
    ]
    const { data } = await sb.from('contacts').insert(contacts).select()
    contactIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('contacts').select('id').eq('user_id', uid)
    contactIds = data.map(c => c.id)
  }

  /* ── contact_interactions ── */
  if (contactIds.length > 0) {
    const { count } = await sb.from('contact_interactions').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!count) {
      await sb.from('contact_interactions').insert([
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Declan reviewed lease renewal terms — advised on rate negotiation with Council. Saved €800/year', interacted_at: '2026-05-06T20:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Tomás confirmed summer sessún schedule — every Thursday and Saturday May-October confirmed', interacted_at: '2026-05-07T22:00:00Z' },
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: "Monthly accounts review — Siobhán found €2,200 in recoverable VAT. April best month since 2024. O'Brien's turning a corner", interacted_at: '2026-05-05T19:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 80, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Bar & Restaurant Awards application — pub history and community story', notes: 'Wrote 1,200 words on O\'Brien\'s 64-year heritage. Siobhán found old photos for submission', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T10:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 42, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Summer staffing plan and rotas', notes: 'Hired 2 additional summer barstaff. Students from NUI Galway. Rota built May-September', started_at: '2026-05-06T09:00:00Z', ended_at: '2026-05-06T09:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Lisdoonvarna — Matchmaking Festival (staff excursion)', start_date: '2026-09-05', end_date: '2026-09-07', status: 'planning', budget_total: 1200, currency: 'EUR', travellers: 4, notes: 'Annual staff trip. Patrick drives the minibus. Research trip — looking at what rival rural pubs do right' },
    ]).select()
    tripIds = data.map(t => t.id)
  } else {
    const { data } = await sb.from('trips').select('id').eq('user_id', uid)
    tripIds = data.map(t => t.id)
  }

  if (tripIds.length > 0) {
    const { count: tiCount } = await sb.from('trip_items').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!tiCount) {
      await sb.from('trip_items').insert([
        { trip_id: tripIds[0], user_id: uid, type: 'transport', title: 'Galway → Lisdoonvarna (minibus — Patrick driving)', starts_at: '2026-09-05T10:00:00Z', cost: 120, notes: 'Petrol and toll costs' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Hydro Hotel Lisdoonvarna', starts_at: '2026-09-05T15:00:00Z', ends_at: '2026-09-07T11:00:00Z', cost: 680, notes: '2 nights for 4 people — team bonding' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Matchmaking Festival trad sessions — competitor research', starts_at: '2026-09-06T20:00:00Z', cost: 0, notes: 'Visit 3 rival pubs to observe their trad night format and pricing' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Summer looking strong — Galway Film Fleadh confirmed, 3 block bookings from American tour groups', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Minimum wage increase biting hard. Margins thin. Need summer to deliver', logged_at: '2026-05-04T22:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: "Seán's GAA team won the Connacht U-14 final! He scored 1-4. Proudest da in Galway tonight", logged_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Siobhán found the VAT recovery. €2,200 we were owed. An angel that woman is', logged_at: '2026-05-05T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'Séamus built something that lasted', content: "Went through the old photos tonight for the awards application. Found one of Da behind the bar in 1971, a Galway shirt on the wall behind him. He built this pub with money borrowed from three uncles and sheer stubbornness. Tonight Seán scored the winner in the Connacht final and we all watched it on the same TV screen Da bought in 1994. Three generations in the same building. That is not a pub — that is a family.", mood: 5, tags: ['family', 'legacy', 'pub', 'GAA', 'father'], created_at: '2026-05-09T23:00:00Z' },
      { user_id: uid, title: 'On running an Irish pub in 2026', content: "The minimum wage went up again. €13.50 an hour. I pay it without complaint — my staff deserve it and more. But the margin disappears at this rate. We made 18% last year. A decent chef in Dublin makes twice what I can pay. The future of the local pub is not guaranteed and anyone who tells you different has never seen a January balance sheet in Galway.", mood: 3, tags: ['hospitality', 'challenges', 'margins', 'honesty'], created_at: '2026-05-04T23:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Tourism bookings building for summer', 'Tomás and the trad sessions', 'Siobhán keeping it all together']
        : gd === '2026-05-09'
        ? ["Seán's Connacht title and 1-4 performance", 'Da\'s building still standing and thriving', '3 generations in one pub']
        : ['Salthill prom morning walks clearing the head', 'Declan watching our back on legal matters', 'A good Sunday Mass and a full Monday pub']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Add craft beer from 3 Dublin micros to tap selection or keep traditional Irish and continental lineup?',
        category: 'business', mode: 'analyze',
        options: [{ label: 'Add 3 craft taps', pros: ['younger demographic', '€1.50 premium per pint'] }, { label: 'Keep traditional lineup', pros: ['authenticity', 'no supplier complexity'], cons: ['losing younger crowd to competitors'] }],
        result: { summary: "Add 2 craft taps (one local Galway, one Dublin) — preserve identity while not losing the 25-35 demographic entirely. O'Brien's is traditional, not dated", chosen: '2 craft taps (1 local, 1 Dublin)', outcome: 'decided' },
        favorite: false, created_at: '2026-05-07T21:00:00Z'
      },
      {
        user_id: uid, question: 'Take AIB €40K loan at 7.8% to fund snug renovation now vs save 2 more years and pay cash?',
        category: 'finance', mode: 'compare',
        options: [{ label: 'AIB loan now', pros: ['snug operational summer 2027', 'premium revenue sooner'] }, { label: 'Save 2 more years', pros: ['no interest cost'], cons: ['miss 2 summer revenue seasons'] }],
        result: { summary: 'Snug completed summer 2027 via loan adds estimated €18K/year in private function revenue. Loan cost €6,200 over 3 years — net positive', chosen: 'AIB loan autumn 2026', outcome: 'decided' },
        favorite: true, created_at: '2026-05-08T22:00:00Z'
      },
    ])
  }

  console.log("✅ Patrick O'Brien seeded successfully.")
}

main().catch(err => { console.error(err); process.exit(1) })
