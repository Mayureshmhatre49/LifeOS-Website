/**
 * Seed all data for Omar Almansouri (E2E persona #22).
 * 45yo Boutique Riad Hotel Owner, Marrakech, Morocco. MAD. Heritage tourism.
 * Run: node tests/e2e-personas/seed-omar-m-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'omar.almansouri@e2e-test.handlelifeos.app'
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
    display_name: 'عمر المنصوري',
    occupation: 'Riad Hotel Owner & Heritage Tourism Entrepreneur',
    life_stage: 'mid_career',
    country: 'MA',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
    goals: ['expand riad to 12 suites', 'earn sustainable tourism certification', 'reach TripAdvisor #1 in Marrakech medina', 'preserve family heritage property'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'riad_details', value: 'Riad Al Mansor — 8 suites, Derb Sidi Ahmed, Marrakech Medina. Built 1890s, restored 2018. Listing on Airbnb, Booking.com, and own site', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'seasonal_income', value: 'Peak season: March-May, September-November (~MAD 95,000/month). Low season: July-August (~MAD 22,000). Ramadan varies annually', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'operations', value: 'Employs 6 staff full-time: 2 housekeepers, 1 chef, 1 receptionist, 1 gardener, 1 night manager. Family-run ethos', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'background', value: 'From Fès originally. Moved to Marrakech 2015. Grandfather was a master artisan (zellige tile-maker). Riad restoration honours that craft heritage', confidence: 90 },
      { user_id: uid, type: 'goal', key: 'expansion', value: 'Adjacent riad property available for purchase (MAD 3.2M). Adding 4 suites would enable higher-margin small group bookings', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'booking_philosophy', value: 'Prefers direct bookings (no commission). Uses Booking.com and Airbnb reluctantly — 15% and 3% commission respectively', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 95000, savings_target: 18000, currency: 'MAD' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 88000, savings_target: 15000, currency: 'MAD' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 72000, savings_target: 12000, currency: 'MAD' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'bills', amount: 38000, description: 'Staff wages — 6 full-time employees (monthly)', expense_date: '2026-05-01', is_recurring: true, currency: 'MAD' },
      { user_id: uid, category: 'utilities', amount: 4500, description: 'ONEE electricity + water + wifi (riad and family quarters)', expense_date: '2026-05-03', is_recurring: true, currency: 'MAD' },
      { user_id: uid, category: 'food', amount: 12000, description: 'Riad kitchen supplies — breakfast + afternoon tea for guests (Jemaa el-Fna market)', expense_date: '2026-05-05', is_recurring: false, currency: 'MAD' },
      { user_id: uid, category: 'misc', amount: 3800, description: 'Riad maintenance — zellige tile repair + plumbing', expense_date: '2026-05-08', is_recurring: false, currency: 'MAD' },
      { user_id: uid, category: 'misc', amount: 2200, description: 'Booking.com + Airbnb commissions (past month)', expense_date: '2026-05-02', is_recurring: true, currency: 'MAD' },
      { user_id: uid, category: 'education', amount: 1500, description: 'Sustainable tourism certification course (GSTC)', expense_date: '2026-05-10', is_recurring: false, currency: 'MAD' },
      { user_id: uid, category: 'rent', amount: 2500, description: 'Family home rental — separate from riad (Hivernage district)', expense_date: '2026-05-01', is_recurring: true, currency: 'MAD' },
      { user_id: uid, category: 'shopping', amount: 4200, description: 'Riad furnishing updates — kilim rugs and Moroccan lanterns for 2 renovated suites', expense_date: '2026-05-06', is_recurring: false, currency: 'MAD' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Adjacent riad purchase deposit (30%)', category: 'home', target_amount: 960000, current_amount: 420000, currency: 'MAD', target_date: '2027-12-31' },
      { user_id: uid, title: 'Low season reserve fund (3 months)', category: 'emergency_fund', target_amount: 250000, current_amount: 185000, currency: 'MAD', target_date: '2026-08-31' },
      { user_id: uid, title: 'Riad website & direct booking upgrade', category: 'business', target_amount: 45000, current_amount: 22000, currency: 'MAD', target_date: '2026-07-31' },
      { user_id: uid, title: 'Children education fund', category: 'education', target_amount: 400000, current_amount: 145000, currency: 'MAD', target_date: '2030-09-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Riad Al Mansor Property', type: 'real_estate', invested_amount: 2800000, current_value: 4200000, currency: 'MAD', account: 'Primary business asset', notes: 'Purchased 2018 for MAD 2.1M (pre-restoration). Restoration cost MAD 700K. Current valuation by agent' },
      { user_id: uid, name: 'Wafa Assurance Life Insurance', type: 'other', invested_amount: 120000, current_value: 138000, currency: 'MAD', account: 'Wafa Assurance', notes: 'Endowment policy — matures 2035. For children education' },
      { user_id: uid, name: 'OPCVM Fonds Obligataire (CDG Capital)', type: 'bonds', invested_amount: 80000, current_value: 88500, currency: 'MAD', account: 'CDG Capital', notes: 'Morocco government bond fund — low season cash buffer, 4.2% annual yield' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Fajr prayer + morning riad walk', icon: '🌅', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Guest reviews check + response', icon: '⭐', color: 'rose', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Weekly accounts & booking review', icon: '📊', color: 'indigo', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: 'Souk & market walk (artisan relations)', icon: '🏺', color: 'emerald', frequency: 'weekly', days_of_week: [6], target_per_day: 1 },
      { user_id: uid, name: 'Family dinner — no devices', icon: '🍽️', color: 'violet', frequency: 'daily', days_of_week: [5], target_per_day: 1 },
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
    const prayerId = habitIds['Fajr prayer + morning riad walk']
    const reviewId = habitIds['Guest reviews check + response']
    if (prayerId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: prayerId, date: d, count: 1 }))
    if (reviewId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: reviewId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Earn GSTC Sustainable Tourism Certification', category: 'other', target_date: '2026-12-31', status: 'active', progress_pct: 35, description: 'Global Sustainable Tourism Council audit. Water recycling and solar panel installation needed' },
      { user_id: uid, title: 'Reach TripAdvisor #1 in Marrakech Medina Riads', category: 'impact', target_date: '2027-06-30', status: 'active', progress_pct: 60, description: 'Currently ranked #4. Need 40 more 5-star reviews. Response rate already 100%' },
      { user_id: uid, title: 'Launch riad direct booking website with SEO', category: 'skill', target_date: '2026-08-31', status: 'active', progress_pct: 25, description: 'Cut Booking.com dependency. Target 60% direct bookings (currently 35%)' },
      { user_id: uid, title: 'Acquire adjacent riad property', category: 'income', target_date: '2027-12-31', status: 'active', progress_pct: 44, description: 'MAD 3.2M asking price. Saving deposit of MAD 960K. Bank financing for remainder' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Sophie Durand', email: 'sophie@almarocsafaris.fr', company: 'Al Maroc Safaris (Paris)', notes: 'French luxury travel agency — sends 15-20 guests/month. 2-year partnership. Prefers 10-day notice', currency: 'EUR' },
      { user_id: uid, name: 'James Whitfield', email: 'james@authentic-morocco.co.uk', company: 'Authentic Morocco (London)', notes: 'UK specialist tour operator. Group bookings of 4-6 guests. Excellent reviews from their clients', currency: 'GBP' },
      { user_id: uid, name: 'Rania Benali', email: 'rania.benali@moroccotravel.ma', company: 'Morocco Premium Travel (Casablanca)', notes: 'Domestic agency — sends Moroccan business travellers and Ramadan staycation guests', currency: 'MAD' },
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
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'Al Maroc Safaris — Summer 2026 Block Booking', status: 'active', fee: 185000, currency: 'MAD', notes: '22 room-nights confirmed July-September. 15% agency rate applied' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Authentic Morocco — Artisan Heritage Tour Package', status: 'active', fee: 96000, currency: 'MAD', notes: '4 group packages confirmed. Includes zellige workshop experience with local master artisan' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Riad Direct Website Build', status: 'lead', fee: 45000, currency: 'MAD', notes: 'Contracting local web agency in Casablanca. Booking engine integration with own payment gateway' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Hamid Lahriri', group_name: 'mentor', email: 'hamid@marrakechriads.org', role: 'President, Marrakech Riad Owners Association', notes: 'Veteran hotelier — 3 riads. Invaluable for city council negotiations and best practices', strength: 4 },
      { user_id: uid, name: 'Fatima Almansouri', email: 'fatima@home.ma', group_name: 'family', role: 'Wife', notes: 'Manages guest relations when Omar travels. Former teacher. The heart of the riad operations', strength: 5 },
      { user_id: uid, name: 'Said Bensouda', group_name: 'work', email: 'said@zelligeartisan.ma', role: 'Master Zellige Artisan', notes: 'Grandfather apprenticed under his grandfather. Repairs riad tilework. Cultural treasure', strength: 5 },
      { user_id: uid, name: 'Dr. Nadia El Fassi', group_name: 'mentor', email: 'n.elfassi@iam.ma', role: 'Sustainable Tourism Consultant', notes: 'GSTC audit specialist — guiding certification process for Riad Al Mansor', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Association meeting — discussed new Marrakech medina Airbnb regulations affecting small riads', interacted_at: '2026-05-06T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'meeting', note: 'GSTC pre-audit walkthrough — water recycling system and solar roof inspection. Good progress', interacted_at: '2026-05-08T09:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Commissioned 2 new zellige panels for renovated suite 5 & 6. Agreed design with Said', interacted_at: '2026-05-09T11:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Direct booking website brief for web agency', notes: 'Spec: multilingual (AR/FR/EN/ES), Stripe + CMI integration, 3-step booking funnel', started_at: '2026-05-05T07:00:00Z', ended_at: '2026-05-05T08:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 60, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Q2 financial review — revenue vs budget', notes: 'May occupancy at 78%. Target was 82%. Identified 4 late cancellations as cause', started_at: '2026-05-04T08:00:00Z', ended_at: '2026-05-04T09:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 28, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'TripAdvisor review responses (8 pending)', notes: 'All responded in Arabic, French, or English matching guest language', started_at: '2026-05-07T08:00:00Z', ended_at: '2026-05-07T08:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'London — World Travel Market 2026', start_date: '2026-11-04', end_date: '2026-11-07', status: 'planning', budget_total: 18000, currency: 'MAD', travellers: 1, notes: 'Annual travel trade show. Meeting UK and European tour operators for 2027 bookings' },
      { user_id: uid, destination: 'Fès — Family & Supplier Visit', start_date: '2026-07-10', end_date: '2026-07-14', status: 'planning', budget_total: 3500, currency: 'MAD', travellers: 3, notes: 'Family origins. Visiting Almansouri cousins. Meeting Fès zellige suppliers for riad expansion materials' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'RAK → LHR (Royal Air Maroc AT800)', starts_at: '2026-11-04T08:30:00Z', cost: 5800, notes: 'Economy. Direct Marrakech-Menara to Heathrow' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Travelodge Excel London', starts_at: '2026-11-04T16:00:00Z', ends_at: '2026-11-07T10:00:00Z', cost: 3200, notes: '3 nights near ExCeL venue — practical, not luxury' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'WTM Morocco pavilion — riad showcase stand', starts_at: '2026-11-05T09:00:00Z', cost: 6500, notes: 'Stand booking paid. Bringing zellige tile samples and riad photo book' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'GSTC pre-audit went well. Solar quote received — payback in 6 years. Worthwhile', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'May occupancy 4% below target. Late cancellations are painful without stricter policy', logged_at: '2026-05-04T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'New 5-star review from London guests: "best hotel of our Morocco trip." TripAdvisor climbing', logged_at: '2026-05-09T19:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Friday family dinner — children growing so fast. This is what the work is for', logged_at: '2026-05-08T21:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'What Said taught me about time', content: "Said spent four hours replacing one damaged zellige panel in suite 3 today. Every tile cut by hand, each angle checked three times. A machine could do it in twenty minutes. I asked him why he does not use power tools. He said: 'Omar, a riad built to last 200 years deserves a craftsman who works for 200 years.' I think about that when I am impatient with the certification process.", mood: 5, tags: ['heritage', 'patience', 'craft', 'philosophy'], created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, title: 'The Booking.com problem', content: "We paid MAD 2,200 in commissions last month. On a direct booking that would be pure profit. But without Booking.com we would have had 20% lower occupancy in low season. The dependency is the trap. The website project must happen before July. I need to stop resenting the platform and start building the alternative.", mood: 3, tags: ['business', 'strategy', 'direct-bookings'], created_at: '2026-05-04T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['GSTC audit progress', 'Friday family dinner', 'Said Bensouda\'s irreplaceable craft']
        : gd === '2026-05-09'
        ? ['5-star TripAdvisor review', 'Grandfather\'s heritage we still live in', 'Loyal staff team']
        : ['Guests who value the medina experience', 'Morning call to prayer in the riad courtyard', 'Children healthy and happy']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Implement 30% non-refundable deposit policy to reduce cancellations?',
        category: 'business', mode: 'analyze',
        options: [{ label: 'Implement strict policy', pros: ['reduce lost revenue', 'better cash flow'], cons: ['may deter some bookings', 'OTA policy conflicts'] }, { label: 'Keep current lenient policy', pros: ['higher conversion'], cons: ['continued cancellation losses'] }],
        result: { summary: 'Implement 30% non-refundable for bookings >7 days. Exempt agency partners with track record', chosen: '30% deposit policy', outcome: 'decided' },
        favorite: false, created_at: '2026-05-05T21:00:00Z'
      },
      {
        user_id: uid, question: 'Should I borrow to purchase adjacent riad now or wait 18 months and pay cash?',
        category: 'finance', mode: 'compare',
        options: [{ label: 'Bank financing now (CIH Bank MAD 2.2M)', pros: ['secure property before price rises', '4 extra suites sooner'], cons: ['7.5% Morocco rate', 'debt burden'] }, { label: 'Save 18 months and pay cash', pros: ['no interest', 'flexibility'], cons: ['property may sell', 'inflation erodes savings'] }],
        result: { summary: 'Negotiate purchase price down to MAD 2.8M and finance 70% — inflation and opportunity cost make waiting risky', chosen: 'Finance 70% via CIH Bank', outcome: 'pending' },
        favorite: true, created_at: '2026-05-08T22:00:00Z'
      },
    ])
  }

  console.log('✅ Omar Almansouri seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
