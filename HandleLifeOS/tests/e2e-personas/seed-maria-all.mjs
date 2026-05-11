/**
 * Seed all data for Maria Santos (E2E persona #23).
 * 35yo OFW Registered Nurse, Jeddah, Saudi Arabia. SAR. Remits to Manila family.
 * Run: node tests/e2e-personas/seed-maria-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'maria.santos@e2e-test.handlelifeos.app'
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
    display_name: 'Maria Santos',
    occupation: 'Registered Nurse (OFW) — King Faisal Specialist Hospital, Jeddah',
    life_stage: 'mid_career',
    country: 'SA',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    goals: ['build family house in Cavite', 'fund sister\'s nursing degree', 'save for return to Philippines by 35', 'grow OFW investments'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'employment', value: 'Registered Nurse at King Faisal Specialist Hospital, Jeddah. ICU ward. 9th year in KSA. Contract renewed annually. SAR 9,200/month tax-free + accommodation allowance SAR 800', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'family_manila', value: 'Parents (retired) + younger sister (nursing student) in Cavite, Metro Manila. Monthly remittance: SAR 3,500-4,000 (approx PHP 50,000)', confidence: 90 },
      { user_id: uid, type: 'goal', key: 'house_project', value: 'Building 2-storey house in Imus, Cavite. Currently at structural stage (~60% done). Budget: PHP 2.8M total', confidence: 85 },
      { user_id: uid, type: 'preference', key: 'communication', value: 'WhatsApp video call with family every Sunday morning (Manila time). Tawid remittance via RCBC or Western Union every 28th of month', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Lives in hospital staff quarters (subsidised). Saves aggressively — sends 40-45% of salary to Manila. Cooks Filipino food on days off', confidence: 85 },
      { user_id: uid, type: 'fact', key: 'return_plan', value: 'Plans to return to Philippines by age 40 (5 years). Target: house completed, sister graduated, SAR 180K saved for return capital', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 10000, savings_target: 2500, currency: 'SAR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 10000, savings_target: 2500, currency: 'SAR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 10000, savings_target: 2800, currency: 'SAR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'misc', amount: 3800, description: 'Monthly remittance to family in Manila (Western Union to Cavite)', expense_date: '2026-05-28', is_recurring: true, currency: 'SAR' },
      { user_id: uid, category: 'food', amount: 380, description: 'Filipino grocery store (Al Balad) + Filipino restaurant on weekend', expense_date: '2026-05-05', is_recurring: false, currency: 'SAR' },
      { user_id: uid, category: 'utilities', amount: 150, description: 'Mobile data (STC) + international WhatsApp calls', expense_date: '2026-05-02', is_recurring: true, currency: 'SAR' },
      { user_id: uid, category: 'health', amount: 0, description: 'Hospital health coverage included in employment contract', expense_date: '2026-05-01', is_recurring: true, currency: 'SAR' },
      { user_id: uid, category: 'education', amount: 280, description: "Sister's nursing allowance top-up (on top of remittance)", expense_date: '2026-05-10', is_recurring: false, currency: 'SAR' },
      { user_id: uid, category: 'shopping', amount: 420, description: 'Pasalubong items to send home (chocolates, perfume)', expense_date: '2026-05-08', is_recurring: false, currency: 'SAR' },
      { user_id: uid, category: 'entertainment', amount: 120, description: 'Filipino community gatherings + streaming (Netflix)', expense_date: '2026-05-06', is_recurring: false, currency: 'SAR' },
      { user_id: uid, category: 'misc', amount: 850, description: 'House construction instalment (bank transfer to Cavite contractor)', expense_date: '2026-05-15', is_recurring: false, currency: 'SAR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Cavite house completion fund', category: 'home', target_amount: 75000, current_amount: 38000, currency: 'SAR', target_date: '2027-06-30' },
      { user_id: uid, title: 'Return-to-PH capital fund', category: 'other', target_amount: 50000, current_amount: 22000, currency: 'SAR', target_date: '2031-01-01' },
      { user_id: uid, title: "Emergency fund (Jeddah)", category: 'emergency_fund', target_amount: 20000, current_amount: 14500, currency: 'SAR', target_date: '2026-12-31' },
      { user_id: uid, title: "Sister's nursing school fees", category: 'education', target_amount: 18000, current_amount: 11000, currency: 'SAR', target_date: '2027-03-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Pag-IBIG MP2 (Philippines)', type: 'other', invested_amount: 12000, current_value: 14200, currency: 'SAR', account: 'Pag-IBIG Fund Manila', notes: 'MP2 savings — 7% dividend rate. OFW contribution continued remotely. Matures 2028' },
      { user_id: uid, name: 'BDO Easy Investment Plan (EIP)', type: 'mutual_fund', invested_amount: 6500, current_value: 7100, currency: 'SAR', account: 'BDO Philippines', notes: 'Monthly auto-invest PHP 5,000 into balanced fund. Managed from Jeddah via BDO online' },
      { user_id: uid, name: 'Cavite House (under construction)', type: 'real_estate', invested_amount: 40000, current_value: 52000, currency: 'SAR', account: 'Imus, Cavite property', notes: 'Estimated value on completion PHP 3.5M. Current investment: PHP 1.9M' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Daily rosary / prayer', icon: '🙏', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Savings tracker update', icon: '💰', color: 'emerald', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: 'Exercise (hospital gym)', icon: '🏋️', color: 'indigo', frequency: 'weekly', days_of_week: [2,4,6], target_per_day: 1 },
      { user_id: uid, name: 'Sunday video call with family', icon: '📞', color: 'rose', frequency: 'weekly', days_of_week: [7], target_per_day: 1 },
      { user_id: uid, name: 'PRC/nursing CPD module', icon: '📚', color: 'violet', frequency: 'weekly', days_of_week: [5], target_per_day: 1 },
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
    const prayerId = habitIds['Daily rosary / prayer']
    const gymId = habitIds['Exercise (hospital gym)']
    if (prayerId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: prayerId, date: d, count: 1 }))
    if (gymId) ['2026-05-05','2026-05-07','2026-05-09'].forEach(d =>
      logs.push({ user_id: uid, habit_id: gymId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Obtain Saudi Prometric Certification renewal', category: 'skill', target_date: '2026-09-30', status: 'active', progress_pct: 70, description: 'Annual KSA nurse license renewal. 30 CPD hours required by September' },
      { user_id: uid, title: 'Complete Advanced ICU nursing course (online)', category: 'learning', target_date: '2026-12-31', status: 'active', progress_pct: 40, description: 'AACN online certificate — improves promotion chances to Senior Staff Nurse' },
      { user_id: uid, title: 'Secure Senior Staff Nurse promotion', category: 'role', target_date: '2027-06-30', status: 'active', progress_pct: 30, description: 'SAR 1,200 salary increase on promotion. Supervisor supportive — 1 position open Q1 2027' },
      { user_id: uid, title: 'Complete Cavite house and return to Philippines', category: 'impact', target_date: '2031-01-01', status: 'active', progress_pct: 35, description: 'House 60% complete. Return plan: house done + sister graduated + PHP 4M savings' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Ate Lourdes Reyes', group_name: 'friend', email: 'lourdes.reyes@kfsh.sa', role: 'Senior Staff Nurse, KFSH Jeddah', notes: 'Fellow OFW nurse, 5 years ahead of Maria. Mentor on KSA work culture and promotion path', strength: 5 },
      { user_id: uid, name: 'Nanay Estela Santos', email: 'estela.santos@gmail.com', group_name: 'family', role: 'Mother — Cavite, Philippines', notes: 'Weekly Sunday calls. Manages house construction on Manila end. Maria\'s emotional anchor', strength: 5 },
      { user_id: uid, name: 'Jen Santos', email: 'jennifer.santos.nursing@gmail.com', group_name: 'family', role: 'Younger sister — nursing student, MCU Manila', notes: 'Maria is funding her degree. Graduating 2027. Very motivated — honour student', strength: 5 },
      { user_id: uid, name: 'Dr. Abdullah Al-Harbi', group_name: 'work', email: 'a.alharbi@kfsh.sa', role: 'ICU Chief Physician, KFSH', notes: 'Department head. Has praised Maria\'s patient care quality. Key for promotion recommendation', strength: 3 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Coffee in staff quarters — Lourdes explained how to apply for Senior Staff Nurse track. Very helpful', interacted_at: '2026-05-07T16:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Sunday call — Nanay says contractor finished 3rd floor walls. Roof next. Photo sent via Viber', interacted_at: '2026-05-10T08:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'message', note: 'Jen passed 3rd year nursing board examination with distinction. Maria cried from joy', interacted_at: '2026-05-08T19:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'AACN online module — Advanced Haemodynamics', notes: 'Module 4 completed. Quiz score 87%. 6 more modules remaining', started_at: '2026-05-06T20:00:00Z', ended_at: '2026-05-06T21:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 30, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Monthly budget vs actual review', notes: 'Saved SAR 2,650 — slightly below SAR 2,800 target. Pasalubong spending reduced next month', started_at: '2026-05-05T21:00:00Z', ended_at: '2026-05-05T21:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 60, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'CPD log documentation for Prometric renewal', notes: 'Logged 18 hours so far. Need 12 more by September', started_at: '2026-05-08T21:00:00Z', ended_at: '2026-05-08T22:00:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Cavite, Philippines — Annual Home Leave', start_date: '2026-12-20', end_date: '2027-01-10', status: 'booked', budget_total: 6500, currency: 'SAR', travellers: 1, notes: 'Annual leave approved. Hospital contract includes annual return flight. Check house progress' },
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
        { trip_id: tripIds[0], user_id: uid, type: 'flight', title: 'JED → MNL (Philippine Airlines PR655)', starts_at: '2026-12-20T02:00:00Z', cost: 0, notes: 'Covered by employer annual leave benefit' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'House inspection with contractor', starts_at: '2026-12-22T09:00:00Z', cost: 0, notes: 'Walk-through of 3rd floor completion. Finalise interior finishing schedule' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Jen\'s nursing school family day', starts_at: '2026-12-26T10:00:00Z', cost: 150, notes: 'Attend sister\'s nursing school annual celebration' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Jen passed her boards with distinction. All those sacrifices are worth it. Sobrang proud', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Long ICU shift (12 hours). Missed home. But overtime pay will help house fund', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Sunday call with Nanay — roof being installed next week. Almost there', logged_at: '2026-05-10T09:00:00Z' },
      { user_id: uid, mood: 2, energy: 1, note: 'Homesick today. 9 years in KSA. Hard to miss Nanay\'s cooking and Simbang Gabi', logged_at: '2026-05-03T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Lourdes helped me understand promotion process. Feeling more confident now', logged_at: '2026-05-07T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'Jen passed her boards', content: "She messaged at 3am Jeddah time: 'Ate, passed!' with a photo holding her results. 87th percentile nationwide. I stayed awake until Fajr just feeling the weight of nine years lifting slightly. She is going to be an excellent nurse. Better than me. That was always the goal.", mood: 5, tags: ['family', 'sacrifice', 'joy', 'sister'], created_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, title: 'Nine years away', content: "I calculated it today — I have spent 3,285 days in Saudi Arabia. I have missed Nanay's 60th birthday, Tatay's hospitalization, two Christmas mornings, Jen's high school graduation. Every SAR I send home is a small apology for every moment I missed. The house will stand. The family will be secure. Then I come home. That is the deal I made with myself.", mood: 2, tags: ['homesickness', 'sacrifice', 'purpose', 'OFW'], created_at: '2026-05-03T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Jen passing her nursing boards', 'Stable employment and contract renewal', 'Lourdes as workplace big sister']
        : gd === '2026-05-09'
        ? ['OFW community in Jeddah', 'House roof being installed', 'My health holding up after 9 years']
        : ['Sunday call with Nanay', 'Another month of savings target hit', 'Faith that carries me through hard shifts']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Renew KSA contract for 2 more years or explore hospital in Qatar (higher SAR equivalent)?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Renew at KFSH Jeddah', pros: ['known environment', 'promotion track', 'community'] }, { label: 'Move to Qatar (Hamad Medical)', pros: ['20% higher salary', 'fresh start'], cons: ['lose 9 years of KFSH standing', 'family visits harder'] }],
        result: { summary: 'Renew Jeddah for 2 years — promotion opportunity and house completion are higher priority than marginal salary gain', chosen: 'Renew KFSH contract', outcome: 'decided' },
        favorite: false, created_at: '2026-05-06T21:00:00Z'
      },
      {
        user_id: uid, question: 'Invest SAR 5,000 in SSS PESO Fund vs keep in BDO savings for house flexibility?',
        category: 'finance', mode: 'compare',
        options: [{ label: 'SSS PESO Fund', pros: ['5.2% guaranteed return', 'government-backed'] }, { label: 'BDO Savings', pros: ['instant access', 'no lock-in'], cons: ['only 0.5% interest'] }],
        result: { summary: 'SSS PESO Fund — house has separate savings. Better returns and SSS contribution record for retirement', chosen: 'SSS PESO Fund', outcome: 'decided' },
        favorite: false, created_at: '2026-05-04T20:00:00Z'
      },
    ])
  }

  console.log('✅ Maria Santos seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
