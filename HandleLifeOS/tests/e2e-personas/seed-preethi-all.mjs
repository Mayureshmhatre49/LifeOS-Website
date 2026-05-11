/**
 * Seed: Preethi Kumar — EdTech Founder & Former IIT-M Professor, Chennai, India (INR)
 * Email: preethi.kumar@e2e-test.handlelifeos.app
 * Persona #41 — Co-founder & CEO of VidyaPath (Tamil-medium K-12 EdTech, 180K students), Tamil Nadu
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

const EMAIL = 'preethi.kumar@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedPreethi() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Preethi Kumar',
    occupation: 'Co-Founder & CEO — VidyaPath EdTech | Former IIT Madras Associate Professor',
    life_stage: 'mid_career',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: [
      'Scale VidyaPath to 500,000 active students by December 2027',
      'Secure Tamil Nadu Government contract for all 37,000 state schools by end 2026',
      'Close Series B — INR 120 crore target raise by Q2 2027',
      'Expand VidyaPath content to Telugu, Kannada, Malayalam by Q4 2026'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (mid-career founder, dual-income household, INR scale)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 45000, spent: 45000, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 30000, spent: 28500, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Education', budgeted: 25000, spent: 25000, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 8000, spent: 7200, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Health', budgeted: 10000, spent: 6800, currency: 'INR' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 60000, spent: 60000, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 45000, spent: 22500, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 30000, spent: 14200, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Education', budgeted: 25000, spent: 12500, currency: 'INR' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 60000, spent: 60000, currency: 'INR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 45000, currency: 'INR', category: 'rent', description: 'Apartment rent — Adyar, Chennai 3BHK (April)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 25000, currency: 'INR', category: 'education', description: 'Children school fees — Vidya Mandir CBSE (Arjun + Kavitha, April term)', expense_date: '2026-04-03' },
      { user_id: uid, amount: 14500, currency: 'INR', category: 'food', description: 'Monthly groceries — More Supermarket + Nilgiris + Swiggy Instamart', expense_date: '2026-04-07' },
      { user_id: uid, amount: 6200, currency: 'INR', category: 'transport', description: 'Ola + Rapido — VidyaPath office, government meetings, TN Secretariat', expense_date: '2026-04-12' },
      { user_id: uid, amount: 8500, currency: 'INR', category: 'food', description: 'Team dinners (VidyaPath 85-person team — monthly celebration for 180K milestone)', expense_date: '2026-04-18' },
      { user_id: uid, amount: 5800, currency: 'INR', category: 'health', description: 'Family health checkup — Apollo Hospitals Greams Road (annual)', expense_date: '2026-04-22' },
      { user_id: uid, amount: 45000, currency: 'INR', category: 'rent', description: 'Apartment rent — Adyar (May)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 18500, currency: 'INR', category: 'travel', description: 'Delhi trip — Ministry of Education meeting + EdTech India Summit', expense_date: '2026-05-05' },
      { user_id: uid, amount: 12500, currency: 'INR', category: 'education', description: 'Children school fees — Vidya Mandir (May installment)', expense_date: '2026-05-05' },
      { user_id: uid, amount: 8200, currency: 'INR', category: 'food', description: 'Groceries + Swiggy + one family restaurant dinner', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Weekly all-hands — VidyaPath team (Friday 5pm)', description: 'Every Friday at 5pm IST — entire 85-person team. Product updates, regional wins, honest blockers.', frequency: 'weekly',
        target_count: 1, current_streak: 12, longest_streak: 28, completed_today: false,
        category: 'work', color: '#10b981', icon: '🏫', reminder_time: '17:00', active: true, created_at: '2026-01-10T00:00:00Z'
      },
      {
        user_id: uid, name: 'Tamil newspaper — morning read', description: 'Dinamalar 30 minutes every morning. Tamil-medium education advocacy requires understanding the Tamil reading public.', frequency: 'daily',
        target_count: 1, current_streak: 45, longest_streak: 90, completed_today: true,
        category: 'learning', color: '#f59e0b', icon: '📰', reminder_time: '06:30', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'No-laptop Saturday morning — family time', description: 'Laptop closed 7am-12pm on Saturdays. Arjun and Kavitha get full-attention Amma. Non-negotiable since co-founder burnout scare 2024.', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 20, completed_today: false,
        category: 'mental_health', color: '#ec4899', icon: '👨‍👩‍👧‍👦', reminder_time: '07:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'NPS contribution — monthly', description: 'NPS Tier I + Tier II contribution. INR 25,000/month. Tax benefit + retirement security. Investment discipline as founder.', frequency: 'monthly',
        target_count: 1, current_streak: 6, longest_streak: 18, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '🏦', reminder_time: '10:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Evening walk — Elliot\'s Beach', description: 'Evening 40-min walk at Besant Nagar beach when in Chennai. Unscheduled thinking time. Best product decisions happen walking.', frequency: 'daily',
        target_count: 1, current_streak: 10, longest_streak: 25, completed_today: true,
        category: 'health', color: '#8b5cf6', icon: '🌊', reminder_time: '18:30', active: true, created_at: '2026-03-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 242, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Tamil Nadu State School Contract — proposal 180-page document + financial model',
        notes: 'Proposal submitted to TN Education Secretary. INR 48 crore/year for 37,000 schools. Covers K-12 Tamil-medium curriculum, teacher training module, offline support for rural schools without reliable internet.',
        started_at: '2026-04-14T09:00:00Z', ended_at: '2026-04-14T13:02:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 175, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Series B investor deck — thesis update for 180K students milestone + TN Government pipeline',
        notes: 'Deck updated: 180K students, INR 42 crore ARR, 3.2× YoY growth, TN contract pipeline INR 48 crore. TLcom + Lightspeed India intro decks sent.',
        started_at: '2026-04-25T10:00:00Z', ended_at: '2026-04-25T12:55:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 55, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Telugu curriculum pilot — content gap analysis for Andhra Pradesh expansion',
        notes: 'Abandoned at 55 min — urgent call from TN Education Dept wanting next-day meeting. Telugu analysis rescheduled.',
        started_at: '2026-05-02T15:00:00Z', ended_at: '2026-05-02T15:55:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 178, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'UNESCO "Innovation in Regional Language Education" award application',
        notes: 'Application submitted. Documented: 180K students, 94% content completion rate, 22% learning outcome improvement in pilot schools, 8,200 teachers trained. Shortlist announcement July.',
        started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T11:58:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: '180,000 students learning in Tamil on VidyaPath. When I was at IIT-M, I used to wonder if leaving academia was the right call. On days like this I know it was.', logged_at: '2026-04-20T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'TN Education Secretary meeting went well. They want a pilot with 500 schools before full contract. That is frustrating but workable. Politicians want proof before commitment. Fair.', logged_at: '2026-04-28T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Board meeting prep is eating me alive. 4 board members with different priorities. Co-founder Senthil and I disagreed on Series B timing. First real tension in 3 years.', logged_at: '2026-05-03T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'UNESCO application submitted. The EdTech India Summit in Delhi was unexpectedly energising. Parents from Tamil Nadu kept telling me their kids are watching videos before school. That is why we exist.', logged_at: '2026-05-09T20:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-20', items: ['180,000 students learning in their mother tongue', 'Senthil and the founding team who took the leap with me', 'IIT Madras for teaching me how to think about pedagogy'] },
    { date: '2026-04-28', items: ['TN Education Secretary who actually took the meeting', 'Husband Vivek holding the family together during board week', 'Tamil — a language 2,000 years old that deserves world-class digital education'] },
    { date: '2026-05-09', items: ['UNESCO recognising regional language education as innovation worthy of award', 'The parents in Delhi who stopped to tell me their children love VidyaPath', 'Elliot\'s Beach existing in Chennai — the walk that saves my clarity'] },
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
        user_id: uid, title: 'Why I Left IIT-M — And Why I Would Do It Again',
        content: 'In my last semester at IIT Madras I published a paper on multilingual pedagogy. It got cited 400 times and changed nothing for the 2 million Tamil-medium students struggling with English-only digital content. The gap between research and impact was destroying me slowly. Senthil and I built the first VidyaPath prototype in a Koyambedu flat in 2020. Today 180,000 students are learning in Tamil on a platform we built. The paper has 400 citations. VidyaPath has 180,000 children. I chose correctly.',
        mood: 5, tags: ['mission', 'reflection', 'academia'], created_at: '2026-04-21T22:00:00Z'
      },
      {
        user_id: uid, title: 'The Senthil Disagreement — Series B Timing',
        content: 'Senthil wants to wait for TN contract before raising Series B — use the GRR to negotiate better terms. I want to raise now while the market narrative is strong (AI in education is hot). He is being conservative. I am being opportunistic. Both of us are probably partly right. We have disagreed before and found the middle path. But this one felt different. He used the phrase "you are rushing because of ego, not strategy." That landed. I need to sit with it.',
        mood: 3, tags: ['co-founder', 'tension', 'strategy'], created_at: '2026-05-04T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Raise Series B now (INR 120 crore, strong AI EdTech market narrative) or wait 6 months for Tamil Nadu Government contract to close before raising at better valuation?',
        category: 'Finance',
        mode: 'compare',
        options: [
          { label: 'Raise Series B now', pros: ['AI EdTech investor sentiment strong in 2026', 'Current ARR + growth rate supports strong valuation', 'Extra runway to accelerate Telugu/Kannada expansion pre-TN contract'], cons: ['Raising without TN contract = missing GRR validation', 'Co-founder Senthil strongly opposed — governance risk', 'Series B dilution before contract revenue may undervalue company'] },
          { label: 'Wait for TN contract to close (6 months)', pros: ['TN contract adds INR 48 crore ARR — transforms valuation math', 'Raises from position of demonstrated government trust', 'Co-founder alignment maintained'], cons: ['Market window may shift — investor appetite cyclical', 'Cash runway tightens to 14 months if we wait', 'Telugu expansion delayed by 6 months'] }
        ],
        result: { summary: 'Senthil is right on the valuation math but wrong on urgency — TN pilot will take 12 months not 6. Compromise: raise a bridge round (INR 25 crore) now to extend runway and accelerate TN pilot, then full Series B post-contract. Removes false either/or.', chosen: 'Bridge round INR 25 crore now + Series B post-TN contract', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-05T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Accept UNESCO "Innovation in Regional Language Education" award (requires 6-month advisory role commitment) or focus 100% on VidyaPath operations?',
        category: 'role',
        mode: 'analyze',
        options: [
          { label: 'Accept UNESCO advisory role', pros: ['Global recognition legitimises VidyaPath for international expansion', 'Access to 50+ country EdTech ministers and education officials', 'INR 40 crore grant opportunity tied to UNESCO recognition'], cons: ['6 months of travel: 8 international trips', 'CEO attention divided during Series B fundraising window', 'Senthil would have to cover more of the COO role'] },
          { label: 'Decline — focus on operations', pros: ['Series B fundraising requires CEO full attention', 'TN Government contract needs constant political relationship management', '85-person team needs stable leadership during growth phase'], cons: ['Missed global recognition window', 'UNESCO grant not captured', 'Less credibility for language expansion to Bangladesh, Sri Lanka, diaspora'] }
        ],
        result: { summary: 'UNESCO recognition directly supports TN and international expansion narrative. If shortlisted, negotiate travel commitment down to 4 trips maximum. Hire VP Government Relations to reduce Preethi bottleneck on TN relationship.', chosen: 'Accept if shortlisted — negotiate travel terms first', outcome: 'pending' },
        favorite: false,
        created_at: '2026-05-09T14:00:00Z'
      }
    ])
  }

  // 11. Investments (founder — modest salary, strong SIP discipline)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'NPS Tier I + II — HDFC Pension', type: 'other', invested_amount: 1800000, current_value: 2180000, currency: 'INR', account: 'HDFC Pension Management', notes: 'INR 25,000/month NPS contribution. Equity + debt mix (75/25). Tax benefit 80CCD(1B) + retirement security. IIT-M professorship years included.', purchase_date: '2018-06-01' },
      { user_id: uid, name: 'Zerodha SIP — Nifty 50 + Small Cap', type: 'mutual_fund', invested_amount: 2400000, current_value: 3150000, currency: 'INR', account: 'Zerodha (Coin)', notes: 'INR 25,000/month SIP: Nifty 50 index (₹15K) + Small Cap 250 (₹10K). Long-term family wealth separate from VidyaPath equity.', purchase_date: '2021-01-01' },
      { user_id: uid, name: 'VidyaPath founder equity — 28% stake', type: 'other', invested_amount: 0, current_value: 0, currency: 'INR', account: 'VidyaPath Technologies Pvt Ltd', notes: 'Co-founder equity 28% (post Series A dilution). Value speculative until Series B. Last-round valuation implied INR 480 crore company.', purchase_date: '2020-08-01' },
      { user_id: uid, name: 'PPF — State Bank of India', type: 'savings', invested_amount: 950000, current_value: 1024000, currency: 'INR', account: 'SBI PPF Account', notes: 'Public Provident Fund. INR 1.5L/year max. 7.1% tax-free return. Long-term lock-in for children\'s education corpus.', purchase_date: '2015-04-01' },
    ])
  }

  // 12. Business clients (VidyaPath B2G + B2B)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Tamil Nadu School Education Department', email: 'secretary@tnschool.gov.in', company: 'Government of Tamil Nadu', notes: 'Primary government target. 37,000 state schools, 8.2M students. Proposal submitted April 2026: INR 48 crore/year. 500-school pilot requested first. Decision expected Q3 2026.', currency: 'INR' },
      { user_id: uid, name: 'Saraswathi Vidyalaya Trust — Chennai', email: 'admin@svtchennai.edu.in', company: 'Saraswathi Vidyalaya Trust', notes: '14 Tamil-medium private schools, 18,000 students. Institutional SaaS license: INR 2,200/student/year. Longest-running VidyaPath B2B client (3 years).', currency: 'INR' },
      { user_id: uid, name: 'Ministry of Education — NEP Implementation Cell', email: 'nep.impl@education.gov.in', company: 'Government of India', notes: 'National Education Policy 2020 alignment. VidyaPath cited in NEP implementation report as model for mother-tongue digital education. Federal grant pipeline INR 8 crore exploratory.', currency: 'INR' },
      { user_id: uid, name: 'Google for India — EdTech Partnerships', email: 'india-edtech@google.com', company: 'Google India', notes: 'USD 200K Google.org grant + Play Store EdTech featured placement. Reporting requirement: 6-monthly impact report. Very good visibility channel.', currency: 'INR' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'TN State School 500-school Pilot — Phase 0', status: 'proposal', fee: 640000000, currency: 'INR', notes: 'INR 64 crore Phase 0 pilot for 500 schools. Teacher training + offline content packs + monitoring. Negotiations with TN Education Secretary ongoing.', due_date: '2026-12-31' },
        { user_id: uid, client_id: clients[1].id, name: 'Saraswathi Vidyalaya 2026/27 License Renewal', status: 'active', fee: 39600000, currency: 'INR', notes: 'INR 2,200/student × 18,000 students = INR 3.96 crore/year. Auto-renewal clause. Q3 2026 contract year renewal. 3-year client — lowest churn risk.', due_date: '2026-07-31' },
        { user_id: uid, client_id: clients[3].id, name: 'Google.org EdTech Grant — Year 2 Report', status: 'active', fee: 17000000, currency: 'INR', notes: 'USD 200K grant (INR ~1.7 crore). Impact report due June 30. Metrics: 180K students, 94% completion, 22% learning outcome improvement in pilot schools.', due_date: '2026-06-30' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Senthil Kumar', email: 'senthil@vidyapath.in', phone: '+919876543210', group_name: 'Team', notes: 'Co-founder & CTO. IIT-M batchmate. Built VidyaPath platform from scratch. Disagrees on Series B timing — valid concern, not a crisis. Call every morning 8am.' },
      { user_id: uid, name: 'Dr. Anitha Krishnaswamy (TN)', email: 'anitha.k@tnschool.gov.in', phone: '+914422678900', group_name: 'Business', notes: 'Tamil Nadu School Education Secretary. Primary government decision-maker for state contract. Met 3 times. Impressed by learning outcome data. Patient negotiator.' },
      { user_id: uid, name: 'Vivek Kumar', email: 'vivek.kumar.work@gmail.com', phone: '+919988776655', group_name: 'Family', notes: 'Husband. Senior Manager, TCS Chennai. The reason VidyaPath CEO can travel to Delhi for meetings. Our deal: he handles school runs, I handle the world.' },
      { user_id: uid, name: 'Prof. Ramachandran (IIT-M)', email: 'ramachandran@cs.iitm.ac.in', phone: '+914422578000', group_name: 'Mentors', notes: 'PhD supervisor at IIT Madras. Still mentors Preethi annually. Wrote the UNESCO nomination letter. Proud of what VidyaPath has become from his lab\' s research.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Scale VidyaPath to 500,000 active students by December 2027', category: 'impact',
        description: 'Currently 180,000 students. Growth path: TN government pilot (adds 100K), Telugu/Kannada expansion (adds 120K), B2B school licensing acceleration (adds 80K).',
        target_date: '2027-12-31', status: 'active', progress_pct: 36
      },
      {
        user_id: uid, title: 'Close Tamil Nadu State Government contract (INR 48 crore/year)', category: 'income',
        description: '500-school pilot requested. Pilot design submitted. Decision expected Q3 2026. Full contract INR 48 crore/year transforms ARR from INR 42 crore to INR 90 crore.',
        target_date: '2026-12-31', status: 'active', progress_pct: 35
      },
      {
        user_id: uid, title: 'Launch Telugu + Kannada language curriculum by Q4 2026', category: 'role',
        description: 'Andhra Pradesh and Karnataka markets combined 2.8M Telugu/Kannada-medium students. Content gap analysis in progress. Need 8 subject matter experts and 6 months of content development.',
        target_date: '2026-12-31', status: 'active', progress_pct: 20
      },
      {
        user_id: uid, title: 'Win UNESCO Innovation in Regional Language Education award', category: 'impact',
        description: 'Application submitted May 2026. Shortlist announcement July. Award brings INR 40 crore grant opportunity + international recognition for diaspora and Southeast Asia expansion.',
        target_date: '2026-12-31', status: 'active', progress_pct: 30
      },
    ])
  }

  // 15. Trip — Delhi EdTech India Summit + Ministry meeting
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'New Delhi, India — EdTech India Summit + Ministry of Education', country_code: 'IN',
        starts_on: '2026-05-05', ends_on: '2026-05-08',
        purpose: 'business', status: 'completed',
        budget_total: 38000, currency: 'INR',
        notes: 'EdTech India Summit — keynote on Tamil-medium education innovation. Ministry of Education bilateral meeting re: NEP implementation fund. UNESCO application networking. Energising trip — parents approached me to thank VidyaPath.'
      },
      {
        user_id: uid, destination: 'Geneva, Switzerland — UNESCO Education Innovation Forum', country_code: 'CH',
        starts_on: '2026-09-08', ends_on: '2026-09-12',
        purpose: 'business', status: 'planning',
        budget_total: 280000, currency: 'INR',
        notes: 'If UNESCO shortlisted, this is the forum for regional language education award presentation. Opportunity to meet ministers from 40 countries. Series B narrative benefit: global EdTech recognition.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'flight', title: 'MAA → DEL — IndiGo 6E-2001', starts_at: '2026-05-05T06:00:00Z', ends_at: '2026-05-05T08:30:00Z', cost: 8500, currency: 'INR', notes: 'Early morning flight. Work on keynote in flight. Business class one-way.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'The Lalit Hotel New Delhi — 3 nights', starts_at: '2026-05-05T11:00:00Z', ends_at: '2026-05-08T11:00:00Z', cost: 18000, currency: 'INR', notes: 'Conference hotel for EdTech India Summit. Ministry of Education is 15-minute drive.' },
        { trip_id: trips[0].id, type: 'activity', title: 'EdTech India Summit — Keynote: "Mother Tongue as Competitive Advantage"', starts_at: '2026-05-06T10:00:00Z', ends_at: '2026-05-06T12:00:00Z', cost: 0, currency: 'INR', notes: '1,200 attendees. Standing ovation. Three investors approached post-keynote. Parents in audience from Tamil Nadu who use VidyaPath thanked Preethi in person.' },
        { trip_id: trips[0].id, type: 'meeting', title: 'Ministry of Education — NEP Implementation Cell bilateral', starts_at: '2026-05-07T14:00:00Z', ends_at: '2026-05-07T16:00:00Z', cost: 0, currency: 'INR', notes: 'INR 8 crore federal grant exploratory discussion. NEP alignment documentation submitted. Follow-up meeting requested for June.' },
      ])
    }
  }

  // 16. Meal plans (Chennai household — Tamil home cooking focus)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Idli + sambar + coconut chutney', calories: 480, notes: 'Standard Tamil breakfast. Made at home — Vivek cooks when Preethi has early calls.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Office lunch — VidyaPath canteen rice + kolambu + papad', calories: 680, notes: 'In-office Monday. Team canteen — INR 80 subsidised meal.' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Vendakkai poriyal + dal + roti + curd rice', calories: 580, notes: 'Amma\'s recipe. Lighter dinner — busy week, no time to cook elaborate.' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Swiggy Instamart — Saapadams WFH thali', calories: 720, notes: 'Wednesday WFH — Tamil thali delivery when no time to cook.' },
      { user_id: uid, week_start: weekStart, day_of_week: 6, meal_type: 'breakfast', recipe_name: 'Dosa + tomato chutney + filter kaapi (family weekend)', calories: 540, notes: 'Saturday ritual — Preethi makes dosas, Vivek makes kaapi. Arjun and Kavitha present.' },
    ])
  }

  console.log('✅ Preethi Kumar (#41) seeded — INR, Chennai, VidyaPath EdTech 180K students, TN Govt contract, UNESCO application')
}

seedPreethi().catch(e => { console.error(e); process.exit(1) })
