/**
 * Seed: Ivan Marchenko — Freelance Full-Stack Developer, Warsaw, Poland (PLN)
 * Email: ivan.marchenko@e2e-test.handlelifeos.app
 * Persona #38 — Ukrainian displaced to Poland (2022), remote EU clients, sending remittances to Kharkiv family
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

const EMAIL = 'ivan.marchenko@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedIvan() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Ivan Marchenko',
    occupation: 'Freelance Full-Stack Developer — React / Node / AWS, Remote EU Clients',
    life_stage: 'mid_career',
    country: 'PL',
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
    goals: [
      'Obtain Polish Permanent Residency (Stałe Pobyt) — application ready by September 2026',
      'Save PLN 120,000 for Warsaw apartment deposit by end 2027',
      'Grow monthly billings to PLN 25,000 through rate increase or fourth client',
      'Support parents in Kharkiv — USD 1,200/month remittance maintained through any market change'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 4200, spent: 4200, currency: 'PLN' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 2200, spent: 2050, currency: 'PLN' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 500, spent: 420, currency: 'PLN' },
    { user_id: uid, month: 4, year: 2026, category: 'Bills', budgeted: 4800, spent: 4800, currency: 'PLN' },
    { user_id: uid, month: 4, year: 2026, category: 'Education', budgeted: 800, spent: 650, currency: 'PLN' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 5000, spent: 5000, currency: 'PLN' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 4200, spent: 2100, currency: 'PLN' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 2200, spent: 1080, currency: 'PLN' },
    { user_id: uid, month: 5, year: 2026, category: 'Bills', budgeted: 4800, spent: 2400, currency: 'PLN' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 5000, spent: 5000, currency: 'PLN' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 4200, currency: 'PLN', category: 'rent', description: 'Mieszkanie Mokotów — czynsz kwiecień 2026 (1BR, plac Unii Lubelskiej)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 4800, currency: 'PLN', category: 'bills', description: 'Przekaz pieniężny rodzinie w Charkowie — Wise USD 1,200 → UAH przelicznik', expense_date: '2026-04-02' },
      { user_id: uid, amount: 980, currency: 'PLN', category: 'food', description: 'Biedronka + Lidl — zakupy tygodniowe, 2 tygodnie', expense_date: '2026-04-07' },
      { user_id: uid, amount: 650, currency: 'PLN', category: 'education', description: 'AWS Solutions Architect Professional — Udemy course + practice exams', expense_date: '2026-04-10' },
      { user_id: uid, amount: 1070, currency: 'PLN', category: 'food', description: 'Restauracje + Pyszne.pl — lunche i obiady przy pracy (zdalnie z domu)', expense_date: '2026-04-17' },
      { user_id: uid, amount: 420, currency: 'PLN', category: 'transport', description: 'ZTM bilet miesięczny Warszawa + Bolt/Uber wizyty klientów', expense_date: '2026-04-19' },
      { user_id: uid, amount: 380, currency: 'PLN', category: 'misc', description: 'JetBrains IDE + GitHub Pro + Linear — narzędzia deweloperskie (miesięczne)', expense_date: '2026-04-22' },
      { user_id: uid, amount: 4200, currency: 'PLN', category: 'rent', description: 'Mieszkanie Mokotów — czynsz maj 2026', expense_date: '2026-05-01' },
      { user_id: uid, amount: 4800, currency: 'PLN', category: 'bills', description: 'Przekaz pieniężny rodzinie w Charkowie — Wise USD 1,200 (maj)', expense_date: '2026-05-02' },
      { user_id: uid, amount: 320, currency: 'PLN', category: 'misc', description: 'Opłata notarialna — weryfikacja dokumentów do wniosku o stały pobyt', expense_date: '2026-05-06' },
      { user_id: uid, amount: 850, currency: 'PLN', category: 'food', description: 'Tydzień zakupów — Żabka + Carrefour + jeden obiad na mieście', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Daily client standup — async or video', description: '15-minute async standup via Loom or video call. All 3 clients synced before 10am Warsaw time.', frequency: 'daily',
        target_count: 1, current_streak: 42, longest_streak: 80, completed_today: true,
        category: 'work', color: '#10b981', icon: '💻', reminder_time: '09:00', active: true, created_at: '2026-01-05T00:00:00Z'
      },
      {
        user_id: uid, name: 'Polish language — 30 min Duolingo/Anki', description: 'Permanent residency requires B1 Polish. Consistent daily practice. Goal: B1 exam by September 2026.', frequency: 'daily',
        target_count: 1, current_streak: 65, longest_streak: 90, completed_today: true,
        category: 'learning', color: '#f59e0b', icon: '🇵🇱', reminder_time: '20:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Wise transfer to parents — first Friday of month', description: 'USD 1,200 to parents in Kharkiv via Wise. Non-negotiable. Check exchange rate, send with note.', frequency: 'monthly',
        target_count: 1, current_streak: 12, longest_streak: 20, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '💸', reminder_time: '10:00', active: true, created_at: '2025-05-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Evening walk — Pole Mokotowskie park', description: 'Physical and mental health. Screen time is 10+ hours/day. The park is 5 minutes away — use it.', frequency: 'daily',
        target_count: 1, current_streak: 18, longest_streak: 35, completed_today: true,
        category: 'health', color: '#8b5cf6', icon: '🌳', reminder_time: '18:30', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Weekly savings transfer to IKE', description: 'PLN 1,250 every Monday to PKO IKE pension account. Tax-advantaged. Part of apartment deposit strategy.', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 20, completed_today: false,
        category: 'finance', color: '#ec4899', icon: '🏦', reminder_time: '09:00', active: true, created_at: '2026-01-05T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 238, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'VanLogix NL — real-time shipment tracking dashboard (React + WebSocket)',
        notes: 'WebSocket reconnect logic fixed. Dashboard now handles 40K concurrent events/minute without memory leak. Dutch client happy.',
        started_at: '2026-04-07T09:00:00Z', ended_at: '2026-04-07T13:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 176, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'AWS SAP-C02 exam preparation — architecture whiteboarding sessions 8-10',
        notes: 'Covered: Transit Gateway, PrivateLink, Direct Connect redundancy patterns. Exam booked May 28. Confidence: 75%.',
        started_at: '2026-04-18T14:00:00Z', ended_at: '2026-04-18T16:56:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 45, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Polish B1 exam application — document gathering and registration',
        notes: 'Stopped at 45 min — urgent prod bug at VanLogix. Fixed bug. Returned to exam application next morning.',
        started_at: '2026-04-25T20:00:00Z', ended_at: '2026-04-25T20:45:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 150, actual_minutes: 152, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'FinTrack DE — SEPA payment module refactor + PSD2 compliance audit',
        notes: 'PSD2 SCA flow redesigned. SEPA PAIN.001 XML generation moved to queue worker. German fintech audit scheduled for June.',
        started_at: '2026-05-05T09:00:00Z', ended_at: '2026-05-05T11:32:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'VanLogix WebSocket fix shipped and client called to thank personally. Good work well delivered — that never gets old.', logged_at: '2026-04-08T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Tata called from Kharkiv. Power outages again. My parents sound tired in a way they try to hide. The money helps but cannot fix everything.', logged_at: '2026-04-15T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Polish exam registration done. B1 exam: September 12. Realistic if I maintain current Duolingo streak. 65-day streak now.', logged_at: '2026-04-26T19:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'FinTrack DE offered full-time remote at €5,800/month + benefits (private health). Big decision. Freedom of freelance vs. security of employment.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Pole Mokotowskie in spring is beautiful. Warsaw adopted me better than I expected. When I walk by the lake I can forget, briefly, that I am elsewhere from home.', logged_at: '2026-05-10T19:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-08', items: ['Poland for giving me legal ground to stand on when I had nowhere to go', 'Three EU clients who trust Ukrainian engineers completely', 'Wise — the tool that keeps my parents financially stable every month'] },
    { date: '2026-04-26', items: ['Polish language slowly becoming less foreign', 'Pole Mokotowskie park five minutes from my door', 'Parents who are alive and reachable — not everyone I know can say this'] },
    { date: '2026-05-10', items: ['FinTrack DE — a German company valuing my work enough to offer full-time', 'This city that does not ask too many questions about where I came from', 'The IKE account growing quietly every Monday'] },
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
        user_id: uid, title: 'The FinTrack Offer — Security vs. Freedom',
        content: 'They offered €5,800/month permanent remote + private health insurance in Germany. That is PLN 25K — more than I make freelancing now, stable. The offer is good. But freelance means I can take a week off without asking. It means I can fire a bad client. It means my time is mine. My parents want me "settled." I understand why. But settled is not the same as secure.',
        mood: 3, tags: ['decision', 'career', 'freedom'], created_at: '2026-05-09T23:00:00Z'
      },
      {
        user_id: uid, title: 'Letter to Tata — Unsent',
        content: 'I write this and do not send it. You told me last week you are fine and I know you are lying. The generator sounds closer now when we talk. Mama pretends not to hear it. I send the money every month and it feels like the only concrete thing I can do across 1,800 kilometres. I am applying for permanent residency in September. If I get it, I can travel more freely. I want to visit. I do not know when that will be safe.',
        mood: 2, tags: ['family', 'Kharkiv', 'distance'], created_at: '2026-04-16T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Accept FinTrack DE full-time remote offer (€5,800/month + benefits) or continue freelancing with 3 EU clients (PLN 20,000/month)?',
        category: 'Career',
        mode: 'compare',
        options: [
          { label: 'Accept FinTrack DE full-time', pros: ['€5,800/month + private German health insurance (PKV)', 'Stability — no client churn risk', 'Employment contract = stronger visa/residency applications', 'Potential for EU permanent residency via Germany long-term'], cons: ['Lose 2 other clients (VanLogix, Belgian NGO) — contractual conflict risk', 'Fixed hours reduce flexibility', 'German employment law: notice periods restrict switching', '30-40% salary uplift but lose freelance autonomy'] },
          { label: 'Stay freelance — 3 clients', pros: ['Full schedule flexibility — important for family emergency travel', 'Can raise rates to PLN 22K-24K by adding fourth client', 'No single point of failure — diversified income', 'Polish permanent residency application unaffected'], cons: ['No employer-provided health insurance (ZUS or private separately)', 'VAT, accountancy overhead', 'Client churn risk — VanLogix contract renewal August 2026'] }
        ],
        result: { summary: 'Full-time provides stability but locks in single-employer dependency at a time when residency flexibility is critical. Counter-propose FinTrack: 6-month contract with renewal, not permanent employment. Test relationship before locking in.', chosen: 'Counter-propose 6-month contract to FinTrack — maintain freelance status', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-09T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Apply for Polish Permanent Residency (Stałe Pobyt) in September 2026, or relocate to Germany first for stronger EU long-term residency options?',
        category: 'role',
        mode: 'analyze',
        options: [
          { label: 'Polish Permanent Residency (September 2026)', pros: ['Eligible now: 4+ years legal residence in Poland', 'Warsaw life established — apartment search in progress', 'No relocation disruption to client relationships', 'Polish B1 exam in September — timeline aligns'], cons: ['Polish PR does not grant EU mobility as freely as German PR', 'Zloty exposure — PLN weaker than EUR long-term', 'Poland political risk (rule of law concerns) for long-term settlement'] },
          { label: 'Relocate Germany — stronger EU residency path', pros: ['German Permanent Residency = strongest EU protection', 'EUR earnings — no currency exposure', 'FinTrack offer provides legitimate basis for German residence permit'], cons: ['Starting residency clock from zero in Germany', 'Berlin/Munich cost of living 60% higher than Warsaw', 'Losing Warsaw network built over 3+ years'] }
        ],
        result: { summary: 'Poland PR is the right immediate step — do not disrupt stability for hypothetical Germany upgrade. After PR is secured (est. March 2027), reassess Germany relocation from a position of security, not urgency.', chosen: 'Polish Permanent Residency September 2026 — Germany decision deferred', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-30T11:00:00Z'
      }
    ])
  }

  // 11. Investments (PLN — pragmatic, apartment-focused)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'PKO Bank Polski IKE — Obligacje Skarbowe', type: 'bonds', invested_amount: 18000, current_value: 19800, currency: 'PLN', account: 'PKO Bank Polski IKE', notes: 'Indywidualne Konto Emerytalne — obligacje skarbowe 6.2% ROC. Tax-advantaged. PLN 1,250/week automated.', purchase_date: '2024-01-01' },
      { user_id: uid, name: 'Obligacje Skarbowe — Rodzinne OS0932', type: 'bonds', invested_amount: 25000, current_value: 27400, currency: 'PLN', account: 'PKO BP MaklerSKI', notes: 'Polish state bonds 4-year tenor. Apartment deposit fund. Safe and liquid enough for 2027 purchase window.', purchase_date: '2023-06-01' },
      { user_id: uid, name: 'Lokata PKO BP — EUR savings', type: 'savings', invested_amount: 12000, current_value: 12480, currency: 'PLN', category: 'savings', account: 'PKO Bank Polski', notes: 'EUR-denominated deposit (PLN equivalent). Partial hedge against PLN/EUR exchange risk. 4% EUR rate.', purchase_date: '2025-03-01' },
    ])
  }

  // 12. Business clients (EU freelance portfolio)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'VanLogix Netherlands — Engineering Team', email: 'dev@vanlogix.nl', company: 'VanLogix B.V.', notes: 'Dutch logistics SaaS. React + Node + AWS. PLN 9,000/month retainer. Contract renewal August 2026. Real-time tracking dashboard primary deliverable.', currency: 'PLN' },
      { user_id: uid, name: 'FinTrack DE — Product Engineering', email: 'engineering@fintrack.de', company: 'FinTrack GmbH', notes: 'German fintech. PLN 7,000/month. SEPA payments module + PSD2 compliance. Offered full-time €5,800/month — counter-proposal pending.', currency: 'PLN' },
      { user_id: uid, name: 'BelNGO Brussels — Digital Infrastructure', email: 'tech@belngo.org', company: 'BelNGO asbl', notes: 'Belgian humanitarian NGO. PLN 4,000/month. Drupal CMS + Salesforce integration. Small scope but reliable payment within 15 days.', currency: 'PLN' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'VanLogix Real-Time Tracking Dashboard — v3', status: 'active', fee: 27000, currency: 'PLN', notes: 'PLN 9K/month × 3 months Q2. WebSocket reconnect fix shipped April. v3: Multi-carrier integration (DHL, DPD, GLS) via unified API layer.', due_date: '2026-06-30' },
        { user_id: uid, client_id: clients[1].id, name: 'FinTrack SEPA Module — PSD2 SCA Compliance', status: 'active', fee: 21000, currency: 'PLN', notes: 'PLN 7K/month × 3 months. PSD2 SCA redesign complete. SEPA PAIN.001 queue worker shipped. Audit with German BaFin June 15.', due_date: '2026-06-15' },
        { user_id: uid, client_id: clients[1].id, name: 'FinTrack Full-Time Offer — Counter Proposal', status: 'proposal', fee: 0, currency: 'PLN', notes: 'Counter-proposing 6-month fixed-term contract at €5,200/month (EUR not PLN). Maintains freelance tax status, tests relationship before committing permanently.', due_date: '2026-05-25' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Marek Kowalski', email: 'm.kowalski@vanlogix.nl', phone: '+31201234567', group_name: 'Business', notes: 'VanLogix CTO. Dutch. Clear communicator. Contract renewal August — prepare rate increase proposal for July.' },
      { user_id: uid, name: 'Sarah Fischer', email: 's.fischer@fintrack.de', company: '', phone: '+4930987654', group_name: 'Business', notes: 'FinTrack Head of Engineering. Made the full-time offer. Awaiting counter-proposal response. Professional, fair negotiator.' },
      { user_id: uid, name: 'Tato (Vasyl Marchenko)', email: '', phone: '+380501234567', group_name: 'Family', notes: 'Father in Kharkiv. Retired engineer. Calls every Sunday. Wise remittance arrives first Friday every month. Pretends everything is fine.' },
      { user_id: uid, name: 'Olena Kovalchuk', email: 'olena.k@uahelpwarsaw.org', phone: '+48501234567', group_name: 'Mentors', notes: 'Ukrainian community coordinator in Warsaw. Helped with Karta Pobytu documents in 2022. Still the first call for any legal residency questions.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Submit Polish Permanent Residency application (Stałe Pobyt)', category: 'other',
        description: 'Eligible from August 2022 + 4 years. Polish B1 exam booked September 12. Documents: apostille, translations, tax returns 2022-25. Apply October 2026.',
        target_date: '2026-10-31', status: 'active', progress_pct: 55
      },
      {
        user_id: uid, title: 'Pass Polish B1 Language Exam', category: 'skill',
        description: 'Exam date: September 12, 2026 — Państwowa Komisja ds. Poświadczania Znajomości Języka Polskiego. Current Duolingo streak: 65 days. B1 required for Stałe Pobyt.',
        target_date: '2026-09-12', status: 'active', progress_pct: 60
      },
      {
        user_id: uid, title: 'Save PLN 120,000 for Warsaw apartment deposit', category: 'income',
        description: 'Current savings (IKE + bonds): PLN 55,000. PLN 5,000/month savings rate. Target: PLN 120K by end 2027 for 20% deposit on PLN 600K Warsaw apartment.',
        target_date: '2027-12-31', status: 'active', progress_pct: 46
      },
      {
        user_id: uid, title: 'Raise freelance monthly revenue to PLN 25,000', category: 'income',
        description: 'Current: PLN 20,000 from 3 clients. Route: VanLogix rate increase July (PLN 9K → 11K), or add fourth client to replace low-margin BelNGO.',
        target_date: '2026-12-31', status: 'active', progress_pct: 30
      },
    ])
  }

  // 15. Trip — Kraków + Wrocław (domestic Polish cities for cultural integration)
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Kraków, Poland', country_code: 'PL',
        starts_on: '2026-05-22', ends_on: '2026-05-25',
        purpose: 'leisure', status: 'booked',
        budget_total: 1800, currency: 'PLN',
        notes: 'Long weekend in Kraków. Part work (AWS SAP-C02 study days), part Polish cultural integration. Wawel, Kazimierz, salt mine. Speaking Polish with locals is good practice before the B1 exam.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'PKP Intercity Warszawa → Kraków — Express', starts_at: '2026-05-22T07:00:00Z', ends_at: '2026-05-22T09:20:00Z', cost: 140, currency: 'PLN', notes: '2h20min direct. FlixBus was cheaper but PKP is faster and more reliable.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Hostel Rynek Kraków — 3 nights', starts_at: '2026-05-22T14:00:00Z', ends_at: '2026-05-25T10:00:00Z', cost: 450, currency: 'PLN', notes: 'Private room in hostel. Rynek Główny location. Budget-conscious — saving for apartment.' },
        { trip_id: trips[0].id, type: 'activity', title: 'AWS SAP-C02 exam study — 2 mornings at Café Camelot', starts_at: '2026-05-23T08:00:00Z', ends_at: '2026-05-23T12:00:00Z', cost: 80, currency: 'PLN', notes: 'Studying architecture patterns on laptop. Coffee + quiet. Exam is May 28.' },
        { trip_id: trips[0].id, type: 'activity', title: 'Wieliczka Salt Mine guided tour', starts_at: '2026-05-24T10:00:00Z', ends_at: '2026-05-24T14:00:00Z', cost: 120, currency: 'PLN', notes: 'Polish language tour group — B1 exam practice in real context. Stunning place.' },
      ])
    }
  }

  // 16. Meal plans (practical Warsaw developer diet)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Owsianka z bananem + kawa czarna', calories: 420, notes: 'Fast and cheap. Oats bought at Biedronka for the week.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Bar mleczny Mokotów — zupa + drugie danie', calories: 680, notes: 'PLN 18 entire meal. Polish milk bars are the best value in Warsaw.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Jajecznica z warzywami + chleb', calories: 450, notes: 'Eggs and vegetables — simple after long screen day' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Bigos domowy — Ukrainian version (kapusniak)', calories: 620, notes: 'Made a big pot Sunday — Ukrainian borscht variation. Eating through the week.' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'dinner', recipe_name: 'Pizza z Pyszne.pl — piątkowa nagroda', calories: 820, notes: 'Friday pizza — weekly reward. Delivery PLN 42. Worth it after 60-hour work week.' },
    ])
  }

  console.log('✅ Ivan Marchenko (#38) seeded — PLN, Warsaw, Ukrainian freelancer, 3 EU clients, Stałe Pobyt application')
}

seedIvan().catch(e => { console.error(e); process.exit(1) })
