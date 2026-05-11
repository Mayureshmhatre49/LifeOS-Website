/**
 * Seed all data for Tunde Adeyemi (E2E persona #26).
 * 34yo VP Investment Banking, London UK. GBP. Nigerian heritage, dual identity.
 * Run: node tests/e2e-personas/seed-tunde-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'tunde.adeyemi@e2e-test.handlelifeos.app'
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
    display_name: 'Tunde Adeyemi',
    occupation: 'VP Investment Banking — Barclays (M&A, Africa & Emerging Markets)',
    life_stage: 'mid_career',
    country: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    goals: ['make MD by 38', 'buy London flat', 'build Lagos real estate portfolio', 'fund younger siblings\' education'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'compensation', value: 'Barclays VP total comp: £215K (base £140K + bonus £75K). Bonus paid March. Tax rate ~45% at this bracket. Take-home ~£10,200/month', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'background', value: 'Born Lagos, Nigeria. Moved to London at 16 (FCO scholarship). Warwick University Economics. Started as Barclays analyst 2014, promoted VP 2021. Nigerian-British dual national', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'family_obligations', value: 'Monthly remittance to Lagos: £800 (parents + younger sister university). Sister Yetunde (19) studying Medicine at UNILAG — Tunde covering fees', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'work_style', value: 'Banking hours: typically 7am-9pm during live deals. Tries to gym 6am before work. Weekend sacred for family calls and mental recovery', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'property', value: 'Targeting London 2-bed flat in SE15/SE1 (Bermondsey/Peckham). Budget £520-580K. Saving £2,500/month for deposit. Need £100K for 20% down', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'lagos_investment', value: 'Victoria Island Lagos apartment: purchased 2023 for NGN 95M (~£85K then). Currently worth ~NGN 180M. Plan to expand to 2-3 properties before 40', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 10200, savings_target: 3500, currency: 'GBP' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 10200, savings_target: 3500, currency: 'GBP' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 10200, savings_target: 3800, currency: 'GBP' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 2800, description: 'Bermondsey 1-bed flat — monthly rent (saving for own purchase)', expense_date: '2026-05-01', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'food', amount: 620, description: 'Waitrose + eating out (client dinners counted on expenses) + Borough Market weekends', expense_date: '2026-05-05', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'utilities', amount: 240, description: 'British Gas + Thames Water + BT broadband + council tax', expense_date: '2026-05-02', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'transport', amount: 165, description: 'Oyster card monthly + Eurostar to Paris (deal trip expensed by Barclays)', expense_date: '2026-05-04', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'health', amount: 85, description: 'Anytime Fitness membership + therapy (bi-weekly session £90, alternates)', expense_date: '2026-05-01', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'misc', amount: 800, description: 'Lagos monthly remittance — parents and Yetunde\'s UNILAG fees (Western Union)', expense_date: '2026-05-28', is_recurring: true, currency: 'GBP' },
      { user_id: uid, category: 'entertainment', amount: 320, description: 'Dinner at Ikoyi restaurant (Lagos fine dining London — celebrating bonus), shows', expense_date: '2026-05-09', is_recurring: false, currency: 'GBP' },
      { user_id: uid, category: 'investment', amount: 2500, description: 'Monthly deposit to London flat savings fund (LISA + cash ISA)', expense_date: '2026-05-02', is_recurring: true, currency: 'GBP' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'London flat deposit (20% — Bermondsey/Peckham)', category: 'home', target_amount: 110000, current_amount: 72000, currency: 'GBP', target_date: '2027-06-30' },
      { user_id: uid, title: 'Lagos 2nd property (Victoria Island)', category: 'other', target_amount: 120000, current_amount: 35000, currency: 'GBP', target_date: '2028-12-31' },
      { user_id: uid, title: "Yetunde's UNILAG Medicine fees (5 years)", category: 'education', target_amount: 18000, current_amount: 11000, currency: 'GBP', target_date: '2029-06-30' },
      { user_id: uid, title: 'Emergency fund (4 months take-home)', category: 'emergency_fund', target_amount: 42000, current_amount: 42000, currency: 'GBP', target_date: '2026-06-01' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Stocks & Shares ISA — Vanguard LifeStrategy 100', type: 'etf', invested_amount: 65000, current_value: 82000, currency: 'GBP', account: 'Vanguard UK', notes: 'Max ISA every year since 2018. High-growth allocation at 34 — time on side' },
      { user_id: uid, name: 'Barclays ShareSave Scheme', type: 'stocks', invested_amount: 18000, current_value: 31500, currency: 'GBP', account: 'Barclays Employee Share Plan', notes: '3-year scheme maturing 2026. Discount price £5.20 vs current £8.70. Exercising in September' },
      { user_id: uid, name: 'Lagos Victoria Island Apartment', type: 'real_estate', invested_amount: 85000, current_value: 155000, currency: 'GBP', account: 'Lagos property portfolio', notes: 'Purchased NGN 95M in 2023. Now worth ~NGN 185M. Rented out — £450 equivalent/month income' },
      { user_id: uid, name: 'Lifetime ISA (LISA) — flat deposit', type: 'other', invested_amount: 16000, current_value: 20000, currency: 'GBP', account: 'Moneybox LISA', notes: '25% government bonus on £4K/year. Cash + 25% bonus = £5K/year building towards deposit' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: '6am gym before markets open', icon: '🏋️', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Read FT + Bloomberg AM briefing', icon: '📰', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Savings deposit tracker review', icon: '💰', color: 'amber', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
      { user_id: uid, name: 'Call Lagos family (Sunday)', icon: '📞', color: 'rose', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
      { user_id: uid, name: 'Therapy or journaling (mental health)', icon: '🧠', color: 'violet', frequency: 'weekly', days_of_week: [3], target_per_day: 1 },
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
    const gymId = habitIds['6am gym before markets open']
    const ftId = habitIds['Read FT + Bloomberg AM briefing']
    if (gymId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: gymId, date: d, count: 1 }))
    if (ftId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: ftId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Make Managing Director (MD) by age 38', category: 'role', target_date: '2030-01-01', status: 'active', progress_pct: 40, description: 'Currently VP. Need 2-3 landmark deals and strong performance reviews. Africa franchise is strategic priority for Barclays' },
      { user_id: uid, title: 'Close £200M+ Nigeria infrastructure deal', category: 'impact', target_date: '2026-12-31', status: 'active', progress_pct: 55, description: 'Mandated adviser on Lagos-Ibadan Expressway Phase 3 financing. Due diligence in progress' },
      { user_id: uid, title: 'Buy London flat — Bermondsey/Peckham', category: 'income', target_date: '2027-09-30', status: 'active', progress_pct: 65, description: 'Deposit: £72K of £110K target. On track for completion by mid-2027' },
      { user_id: uid, title: 'Complete CFA Level 3 examination', category: 'skill', target_date: '2026-11-15', status: 'active', progress_pct: 70, description: 'Level 1 and 2 passed. Level 3 sitting November 2026. Only 56% pass rate — needs solid prep' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Chidi Okonkwo', group_name: 'friend', email: 'chidi.o@lse.ac.uk', role: 'Associate Professor, LSE Economics', notes: 'Closest friend in London. Nigerian-British. Met at Warwick. Monthly dinner in Peckham', strength: 5 },
      { user_id: uid, name: 'Sarah Adeyemi', email: 'sarah.adeyemi@barclays.com', group_name: 'mentor', role: 'Managing Director, Barclays EMEA', notes: 'Mentor and direct line manager. Not related despite surname. Championed his VP promotion. Incredible sounding board', strength: 5 },
      { user_id: uid, name: 'Yetunde Adeyemi', email: 'yetunde.adeyemi@gmail.com', group_name: 'family', role: 'Younger sister — Medical student, UNILAG Lagos', notes: 'Tunde is funding her degree. Brilliant student — top of 2nd year Medicine cohort', strength: 5 },
      { user_id: uid, name: 'Emeka Nwosu', group_name: 'investor', email: 'emeka@chapriscapital.com', role: 'CEO, Chapris Capital (Lagos PE fund)', notes: 'Key contact for Lagos infrastructure deal. Has EFCC relationship that facilitates Nigerian FGN approvals', strength: 4 },
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
        { user_id: uid, contact_id: contactIds[1], type: 'meeting', note: 'Sarah gave mid-year review — "strongest VP in the Africa franchise." On MD track. Discussed Lagos deal strategy', interacted_at: '2026-05-08T18:00:00Z' },
        { user_id: uid, contact_id: contactIds[3], type: 'call', note: 'Emeka confirmed FGN Ministry of Works meeting scheduled for May 20. Lagos-Ibadan deal advancing', interacted_at: '2026-05-06T16:00:00Z' },
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Monthly Peckham dinner — Chidi and Tunde at Belu African Kitchen. Processed identity, success, and belonging over egusi soup', interacted_at: '2026-05-09T20:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 115, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Lagos-Ibadan financing model — debt structure', notes: 'Sized senior and mezzanine tranches. IRR at 14.2% for equity sponsor — attractive', started_at: '2026-05-07T07:00:00Z', ended_at: '2026-05-07T09:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'CFA Level 3 — Private Wealth Management study', notes: 'Mock exam section on asset allocation. Score: 71% — above pass threshold', started_at: '2026-05-05T06:30:00Z', ended_at: '2026-05-05T08:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 25, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Monthly flat savings review', notes: 'ISA maxed for 2026 tax year. Total deposit fund now £72K. On track for 2027 purchase', started_at: '2026-05-04T07:00:00Z', ended_at: '2026-05-04T07:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Lagos, Nigeria — Lagos-Ibadan Deal Close & Family', start_date: '2026-05-19', end_date: '2026-05-24', status: 'booked', budget_total: 3800, currency: 'GBP', travellers: 1, notes: 'FGN Ministry of Works meeting May 20. Family dinner at parents\' home in Ikeja. Lagos apartment inspection' },
      { user_id: uid, destination: 'New York — Barclays Americas IB Conference', start_date: '2026-09-14', end_date: '2026-09-18', status: 'planning', budget_total: 4500, currency: 'GBP', travellers: 1, notes: 'Presenting Africa infrastructure pipeline to US institutional investors. Expenses covered by Barclays' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'LHR → LOS (British Airways BA75)', starts_at: '2026-05-19T21:00:00Z', cost: 850, notes: 'Business class — claimable as client-facing travel' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Eko Hotel & Suites Victoria Island', starts_at: '2026-05-20T07:00:00Z', ends_at: '2026-05-23T12:00:00Z', cost: 1200, notes: '3 nights. Deal meetings and family visit split across the stay' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'FGN Ministry of Works — Lagos-Ibadan financing', starts_at: '2026-05-20T10:00:00Z', cost: 0, notes: 'Key decision meeting — permanent secretaries + Emeka Nwosu. Deal mandate likely confirmed here' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Family dinner — Ikeja home', starts_at: '2026-05-21T19:00:00Z', cost: 0, notes: 'Mum cooking jollof rice. Yetunde calling from UNILAG. Dad wants to discuss Lagos property plans' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 4, note: 'Sarah says I am on MD track. First time she has said it directly. Heavy feeling — good heavy', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Peckham dinner with Chidi. Talked about what success looks like when you carry two worlds. Need more of these conversations', logged_at: '2026-05-09T23:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Long week. Deal pressure. Therapy helped — working on not measuring self-worth by deal status', logged_at: '2026-05-06T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Lagos trip confirmed. Excited to see Mum. Haven\'t been back in 6 months', logged_at: '2026-05-07T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'Two worlds, one person', content: "Chidi asked me tonight who I am when no one is watching. In Lagos I am Tunde — my father's son, my mother's joy, Yetunde's protector. In London I am Adeyemi — VP, dealmaker, one of very few Nigerians at this level in Barclays. Both are true. Neither is the whole truth. I am still figuring out what it means to hold both without apologising for either one.", mood: 4, tags: ['identity', 'Nigeria', 'diaspora', 'belonging'], created_at: '2026-05-09T23:30:00Z' },
      { user_id: uid, title: 'What the MD title actually means', content: "Sarah told me I am on track for MD. My first thought was not celebration — it was the weight of it. My parents cleaned offices in Lagos so I could get the FCO scholarship. Now I am advising governments on £200M transactions. The title matters because of where I started, not despite it. I need to remember that.", mood: 5, tags: ['career', 'family', 'ambition', 'meaning'], created_at: '2026-05-08T23:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Sarah\'s MD endorsement', 'Lagos deal advancing', '6am gym keeping me sane']
        : gd === '2026-05-09'
        ? ['Chidi as a true mirror friend', 'Yetunde thriving at UNILAG', 'London flat deposit at £72K']
        : ['Therapy providing clarity', 'Parents\' sacrifice giving me this platform', 'Ikoyi restaurant jollof rice that tastes like home']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Buy London flat now at current market (£540K Bermondsey 2-bed) or wait 18 months for potential correction?',
        category: 'finance', mode: 'analyze',
        options: [{ label: 'Buy now', pros: ['lock in rate before BOE hike', 'stop renting £2,800', 'stability'] }, { label: 'Wait 18 months', pros: ['possible 5-8% price dip'], cons: ['18 months rent = £50K lost', 'market may not dip'] }],
        result: { summary: '18 months rent £50,400 vs. possible saving of £27-43K on price dip — mathematically buying is better once deposit is ready', chosen: 'Buy when deposit hits £100K — target Q3 2027', outcome: 'decided' },
        favorite: true, created_at: '2026-05-04T21:00:00Z'
      },
      {
        user_id: uid, question: 'Stay at Barclays for MD or explore lateral move to boutique African advisory firm?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Stay Barclays', pros: ['MD track confirmed', 'brand', 'deal flow'] }, { label: 'Boutique African advisory', pros: ['more autonomy', 'equity stake'], cons: ['no MD title', 'smaller deal size'] }],
        result: { summary: 'Stay Barclays — 4 years to MD is concrete. Boutique is a retirement option, not a next step', chosen: 'Stay at Barclays', outcome: 'decided' },
        favorite: false, created_at: '2026-05-08T22:00:00Z'
      },
    ])
  }

  console.log('✅ Tunde Adeyemi seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
