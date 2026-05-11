/**
 * Seed: Aisha Mwangi — FinTech Founder (M-Bora Savings), Nairobi, Kenya (KES)
 * Email: aisha.mwangi@e2e-test.handlelifeos.app
 * Persona #33 — Mobile savings app for informal workers, M-Pesa integration, YC W25, TLcom Capital-backed
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

const EMAIL = 'aisha.mwangi@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedAisha() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Aisha Mwangi',
    occupation: 'FinTech Founder & CEO — M-Bora Savings (YC W25)',
    life_stage: 'early_career',
    country: 'KE',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    goals: [
      'Reach 500,000 registered M-Bora users in Kenya by December 2026',
      'Launch Tanzania M-Pesa pilot by Q4 2026',
      'Close Series A USD 8M round by mid-2027',
      'Hire a CTO — currently serving as technical CEO which is unsustainable at scale'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 95000, spent: 95000, currency: 'KES' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 40000, spent: 38500, currency: 'KES' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 20000, spent: 17800, currency: 'KES' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 180000, spent: 165000, currency: 'KES' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 120000, spent: 120000, currency: 'KES' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 95000, spent: 47500, currency: 'KES' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 40000, spent: 19200, currency: 'KES' },
    { user_id: uid, month: 5, year: 2026, category: 'Transport', budgeted: 20000, spent: 9400, currency: 'KES' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 180000, spent: 82000, currency: 'KES' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 95000, currency: 'KES', category: 'rent', description: 'Apartment rent — Westlands 2BR, April 2026', expense_date: '2026-04-01' },
      { user_id: uid, amount: 45000, currency: 'KES', category: 'bills', description: 'iHub Nairobi co-working — M-Bora team shared desks (monthly)', expense_date: '2026-04-02' },
      { user_id: uid, amount: 22000, currency: 'KES', category: 'food', description: 'Groceries — Carrefour Westgate + meal deliveries Glovo', expense_date: '2026-04-07' },
      { user_id: uid, amount: 85000, currency: 'KES', category: 'misc', description: 'AWS cloud infrastructure — April production billing', expense_date: '2026-04-10' },
      { user_id: uid, amount: 12000, currency: 'KES', category: 'transport', description: 'Uber + Bolt — investor meetings, co-working, airport', expense_date: '2026-04-14' },
      { user_id: uid, amount: 38000, currency: 'KES', category: 'misc', description: 'Legal retainer — Murang\'a & Associates startup IP + contracts', expense_date: '2026-04-16' },
      { user_id: uid, amount: 16000, currency: 'KES', category: 'food', description: 'Team lunch (9 people) — Carnivoré Friday celebration (user 300K milestone)', expense_date: '2026-04-22' },
      { user_id: uid, amount: 8500, currency: 'KES', category: 'transport', description: 'Bolt executive — two investor roadshow days, Kilimani to Westlands', expense_date: '2026-04-25' },
      { user_id: uid, amount: 95000, currency: 'KES', category: 'rent', description: 'Apartment rent — Westlands, May 2026', expense_date: '2026-05-01' },
      { user_id: uid, amount: 62000, currency: 'KES', category: 'travel', description: 'Lagos trip — African Tech Summit, flights + hotel + per diem', expense_date: '2026-05-04' },
      { user_id: uid, amount: 18500, currency: 'KES', category: 'food', description: 'Groceries + meal prep service — busy week working late', expense_date: '2026-05-08' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Morning metrics check — M-Bora dashboard', description: 'Review DAU, new signups, transaction volume and churn rate before any meetings', frequency: 'daily',
        target_count: 1, current_streak: 38, longest_streak: 60, completed_today: true,
        category: 'work', color: '#10b981', icon: '📊', reminder_time: '07:30', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Founder journaling — 15 minutes', description: 'Process decisions, track energy, write down what I am proud of and what is blocking me', frequency: 'daily',
        target_count: 1, current_streak: 22, longest_streak: 45, completed_today: true,
        category: 'mental_health', color: '#8b5cf6', icon: '✍️', reminder_time: '22:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'No-meeting Wednesday mornings', description: 'Block 07:00–12:00 every Wednesday for deep technical work and architecture thinking', frequency: 'weekly',
        target_count: 1, current_streak: 6, longest_streak: 12, completed_today: false,
        category: 'work', color: '#f59e0b', icon: '🔒', reminder_time: '07:00', active: true, created_at: '2026-03-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Weekly SACCO savings transfer', description: 'Transfer KES 30,000 to Stima Sacco every Friday. Non-negotiable personal wealth building.', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 20, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '💰', reminder_time: '17:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Evening walk — Karura Forest', description: '45-minute walk in Karura. No phone calls. Founder brain needs to decompress.', frequency: 'daily',
        target_count: 1, current_streak: 14, longest_streak: 28, completed_today: true,
        category: 'health', color: '#ec4899', icon: '🌳', reminder_time: '18:30', active: true, created_at: '2026-02-15T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 238, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'M-Bora Tanzania pilot architecture — M-Pesa Tanzania API integration scoping',
        notes: 'Tanzanian M-Pesa API has different authentication flow than Kenya. Estimated 6 weeks engineering effort. USSD fallback needed for feature phone users in rural areas.',
        started_at: '2026-04-09T08:00:00Z', ended_at: '2026-04-09T12:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 175, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Series A investor deck update — April 2026 metrics and Tanzania expansion slide',
        notes: 'Updated deck with 312K users, KES 890M in savings mobilised, 4.2% monthly churn. Tanzania slide added. TLcom intro deck sent to 4 new funds.',
        started_at: '2026-04-23T09:00:00Z', ended_at: '2026-04-23T12:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 60, completed: false,
        abandoned: true, task_title: 'CTO job spec draft — technical lead hire for M-Bora', body_doubling_enabled: false,
        notes: 'Abandoned at 60 minutes. Investor emergency call from TLcom re: due diligence timeline. Will finish Thursday.',
        started_at: '2026-05-06T14:00:00Z', ended_at: '2026-05-06T15:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 92, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Equity Bank API integration — savings sweep feature scoping',
        notes: 'Equity Bank partnership allows auto-sweep of idle balances into M-Bora goals. Engineering estimate: 3 weeks. Legal review needed for co-mingled funds.',
        started_at: '2026-05-09T10:00:00Z', ended_at: '2026-05-09T11:32:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: '312,000 registered users. We hit 300K three months ahead of plan. The informal market validation is undeniable. TLcom is very happy.', logged_at: '2026-04-22T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Lagos African Tech Summit was incredible — met 4 potential Series A funds. But exhausted. Nairobi to Lagos and back in 3 days is too much.', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Still acting as CTO while being CEO is going to break me. I know this. I need to hire faster. The technical debt is accumulating quietly.', logged_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Equity Bank partnership confirmed in principle. Auto-sweep feature will be a growth lever — informal workers trust Equity. This is the right partnership.', logged_at: '2026-05-10T19:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-22', items: ['312,000 Kenyans trusting M-Bora with their savings', 'The engineering team who shipped the group savings feature in 2 weeks', 'My YC batchmates who answer WhatsApp at 2am'] },
    { date: '2026-05-07', items: ['The Lagos connections — 4 serious Series A fund conversations started', 'Air travel working smoothly', 'Mom who raised me to build things, not just dream them'] },
    { date: '2026-05-10', items: ['Equity Bank saying yes to the partnership', 'Karura Forest existing 10 minutes from my apartment', 'Every chama member who told their friends about M-Bora'] },
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
        user_id: uid, title: '312,000 Users — The Informal Market Is Real',
        content: 'Three years ago I was a Safaricom engineer who kept asking why there was no savings app designed for jua kali workers and mama mbogas. My colleagues thought I was solving a problem that did not scale. Now 312,000 Kenyans are proving them wrong. The informal sector is not too poor to save — they just needed infrastructure that understood their irregular income patterns. M-Bora understands.',
        mood: 5, tags: ['milestone', 'mission', 'gratitude'], created_at: '2026-04-23T07:00:00Z'
      },
      {
        user_id: uid, title: 'Tanzania: Now or After Series A?',
        content: 'The Lagos conference convinced me Tanzania is ready — mobile money penetration is at 68% and rising, and Vodacom M-Pesa Tanzania is hungry for savings app partnerships. But do I split engineering bandwidth pre-Series A? TLcom says: deepen Kenya metrics first. My gut says: Tanzania pilot now buys me a much better Series A narrative. I need to decide in the next 3 weeks.',
        mood: 3, tags: ['decision', 'expansion', 'strategy'], created_at: '2026-05-08T22:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Launch Tanzania M-Pesa pilot in Q4 2026 (pre-Series A), or wait until after Series A close in 2027 when we have more capital and team capacity?',
        category: 'Business',
        mode: 'analyze',
        options: [
          { label: 'Tanzania pilot Q4 2026 — pre-Series A', pros: ['Multi-country narrative strengthens Series A valuation', 'First-mover advantage in Tanzania savings app market', 'TZ pilot validates cross-border M-Pesa model for investors'], cons: ['6 weeks engineering time diverted from Kenya growth', 'Runway compression: adds ~$180K burn before Series A', 'Small team will be stretched across 2 markets'] },
          { label: 'Wait until post-Series A 2027', pros: ['Preserve Kenya focus for 500K user target', 'Protect runway to Series A close', 'Hire CTO first — Tanzania needs strong technical leadership'], cons: ['Lose 18-month first-mover window in Tanzania', 'Series A investors may see single-market risk', 'Competitor M-Save could enter Tanzania gap'] }
        ],
        result: { summary: 'Lean Tanzania pilot (USSD-only, one Dar city) costs 4 weeks engineering and $60K. High asymmetric upside for Series A narrative. Recommend Q4 2026 limited pilot.', chosen: 'Q4 2026 limited Tanzania USSD pilot — Dar es Salaam only', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-09T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Hire CTO externally (senior engineer from Safaricom or Flutterwave background) or promote the current senior engineer David internally?',
        category: 'role',
        mode: 'compare',
        options: [
          { label: 'External CTO hire — senior FinTech background', pros: ['Immediate architecture leadership', 'Investor credibility (experienced CTO on cap table)', 'Can own technical due diligence for Series A'], cons: ['KES 900K+ monthly salary demand', 'Culture risk — startup pace vs. corporate background', '4-6 months hiring timeline'] },
          { label: 'Promote David Kamau internally', pros: ['Knows codebase and culture deeply', 'Fast transition — promotion vs. onboarding', 'Lower cost: KES 550K vs. 900K'], cons: ['May lack Series A investor gravitas', 'No external fintech architecture experience', 'Leaves senior engineering gap below him'] }
        ],
        result: { summary: 'David is the right answer for culture and speed. Title: VP Engineering, not CTO. Hire a fractional CTO advisor externally for investor relations only. Cost-efficient and culturally sound.', chosen: 'Promote David to VP Engineering + fractional CTO advisor', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-28T11:00:00Z'
      }
    ])
  }

  // 11. Investments (personal, separate from company equity)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Safaricom PLC shares (NSE: SCOM)', type: 'stocks', invested_amount: 380000, current_value: 412000, currency: 'KES', account: 'Faida Investment Bank', notes: 'Bought while at Safaricom via employee share plan. Core holding — understands business deeply.', purchase_date: '2022-06-01' },
      { user_id: uid, name: 'Britam Money Market Fund', type: 'mutual_fund', invested_amount: 650000, current_value: 718000, currency: 'KES', account: 'Britam Asset Managers', notes: 'KES money market, 10.5% annualised. Personal liquidity reserve — 6 months operating expenses.', purchase_date: '2023-09-01' },
      { user_id: uid, name: 'M-Akiba Kenya Government Bond', type: 'bonds', invested_amount: 200000, current_value: 218000, currency: 'KES', account: 'CBK via M-Pesa', notes: 'Kenya retail bond via M-Pesa. 10.45% coupon semi-annual. Intentionally invested in the same infrastructure M-Bora leverages.', purchase_date: '2024-03-15' },
      { user_id: uid, name: 'Stima SACCO — Monthly Savings', type: 'savings', invested_amount: 480000, current_value: 510000, currency: 'KES', account: 'Stima SACCO', notes: 'KES 30K/month deposit. Dividend 12% annually. Long-term personal asset building separate from equity.', purchase_date: '2023-01-01' },
    ])
  }

  // 12. Business clients / partners (M-Bora B2B integrations)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Safaricom DFS — M-Pesa Partnership', email: 'partnerships@safaricom.co.ke', company: 'Safaricom PLC', notes: 'M-Pesa API integration — revenue share 1.5% on platform transactions. Primary infrastructure partner. Quarterly business review.', currency: 'KES' },
      { user_id: uid, name: 'Equity Bank — API Integration Team', email: 'api@equitybank.co.ke', company: 'Equity Bank Kenya', notes: 'Auto-sweep savings feature partnership. Allows M-Bora to move idle bank balances into savings goals via API. Legal review in progress.', currency: 'KES' },
      { user_id: uid, name: 'Kenya Women Finance Trust (KWFT)', email: 'digital@kwft.org', company: 'KWFT Microfinance', notes: 'Group savings SACCO integration. 18,000 KWFT members onboarded to M-Bora chama groups. Referral channel.', currency: 'KES' },
      { user_id: uid, name: 'Google for Startups Africa', email: 'africa-startups@google.com', company: 'Google LLC', notes: 'USD 100K cloud credits + mentorship program. Quarterly check-in with Google MD for Sub-Saharan Africa.', currency: 'USD' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[1].id, name: 'Equity Bank Auto-Sweep Feature — Phase 1 Integration', status: 'active', fee: 0, currency: 'KES', notes: 'Revenue share model — not fee-based. Phase 1: read-only balance check + transfer trigger. Engineering estimate: 3 weeks. Legal MOU signed.', due_date: '2026-06-30' },
        { user_id: uid, client_id: clients[2].id, name: 'KWFT Chama Groups — Digital Savings Migration', status: 'active', fee: 850000, currency: 'KES', notes: 'KWFT pays M-Bora KES 850K/year for white-label chama savings feature. 18,000 members. Renewal due December 2026.', due_date: '2026-12-31' },
        { user_id: uid, client_id: clients[0].id, name: 'Safaricom M-Pesa Tanzania API — Pilot Scoping', status: 'proposal', fee: 0, currency: 'KES', notes: 'Revenue share model same as Kenya. Tanzania auth flow differs. Safaricom TZ partnership team intro via Safaricom Kenya sponsor.', due_date: '2026-09-01' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Ciku Kimani', email: 'ciku@tlcomcapital.com', phone: '+254722123456', group_name: 'Investors', notes: 'TLcom Capital lead partner. Led seed round. Series A supporter. Monthly investor update call every last Friday.' },
      { user_id: uid, name: 'David Kamau', email: 'david@m-bora.co.ke', phone: '+254712987654', group_name: 'Team', notes: 'Senior Engineer — likely VP Engineering promotion. Full-stack, knows M-Pesa API deeply. 2.5 years at M-Bora.' },
      { user_id: uid, name: 'Mama (Grace Mwangi)', email: '', phone: '+254722222222', group_name: 'Family', notes: 'First chama member to test M-Bora beta. Biggest advocate in Murang\'a. Saves KES 2,000/week on the app.' },
      { user_id: uid, name: 'Amara Osei (YC W25)', email: 'amara@paystack-alumni.com', phone: '+233244123456', group_name: 'Mentors', notes: 'YC W25 batchmate, Nigerian FinTech founder. Advice on Africa Series A fundraising and investor targeting.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Reach 500,000 M-Bora registered users in Kenya', category: 'impact',
        description: 'Currently 312,000 users. Growth 28K/month. Target 500K by December 2026. Key driver: KWFT and chama referral network.',
        target_date: '2026-12-31', status: 'active', progress_pct: 62
      },
      {
        user_id: uid, title: 'Close Series A — USD 8M target raise', category: 'income',
        description: 'TLcom leading. 4 new fund conversations started at Lagos Summit. Need 500K users + Tanzania pilot live for optimal valuation narrative.',
        target_date: '2027-06-30', status: 'active', progress_pct: 30
      },
      {
        user_id: uid, title: 'Hire VP Engineering (promote David Kamau)', category: 'role',
        description: 'Stop serving as technical CEO. David promoted to VP Engineering + fractional CTO advisor for investor relations. Aisha focuses on growth and fundraising.',
        target_date: '2026-07-31', status: 'active', progress_pct: 45
      },
      {
        user_id: uid, title: 'Launch Tanzania M-Bora USSD pilot — Dar es Salaam', category: 'other',
        description: 'USSD-only pilot (feature phone compatible) in Dar es Salaam. Vodacom M-Pesa Tanzania partnership. Target 10,000 TZ users in pilot window.',
        target_date: '2026-12-31', status: 'active', progress_pct: 10
      },
    ])
  }

  // 15. Trip — Lagos African Tech Summit
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Lagos, Nigeria', country_code: 'NG',
        starts_on: '2026-05-04', ends_on: '2026-05-07',
        purpose: 'business', status: 'completed',
        budget_total: 85000, currency: 'KES',
        notes: 'African Tech Summit Lagos. Spoke on panel: "FinTech for the Informal Economy." 4 Series A investor meetings. Met Vodacom TZ team lead unexpectedly — Tanzania door opened.'
      },
      {
        user_id: uid, destination: 'Dar es Salaam, Tanzania', country_code: 'TZ',
        starts_on: '2026-09-15', ends_on: '2026-09-18',
        purpose: 'business', status: 'planning',
        budget_total: 55000, currency: 'KES',
        notes: 'Tanzania market scoping trip. Meetings with Vodacom TZ, Bank of Tanzania FinTech unit, and 3 potential SACCO partners. Confirm pilot regulatory requirements.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'flight', title: 'NBO → LOS — Kenya Airways KQ102', starts_at: '2026-05-04T08:00:00Z', ends_at: '2026-05-04T11:30:00Z', cost: 28000, currency: 'KES', notes: 'Direct Nairobi to Lagos. Business class justified for investor day energy.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Eko Hotel Victoria Island — 3 nights', starts_at: '2026-05-04T14:00:00Z', ends_at: '2026-05-07T11:00:00Z', cost: 35000, currency: 'KES', notes: 'Summit conference hotel. Proximity to investor meetings in VI critical.' },
        { trip_id: trips[0].id, type: 'activity', title: 'Panel: FinTech for the Informal Economy — African Tech Summit', starts_at: '2026-05-05T10:00:00Z', ends_at: '2026-05-05T12:00:00Z', cost: 0, currency: 'KES', notes: 'Keynote panel. 800 attendees. Generated 4 investor follow-up requests and unexpected Vodacom TZ intro.' },
        { trip_id: trips[0].id, type: 'meeting', title: 'Investor meetings — 4 funds across 2 days', starts_at: '2026-05-06T09:00:00Z', ends_at: '2026-05-06T18:00:00Z', cost: 5000, currency: 'KES', notes: 'Novastar Ventures, Flourish Ventures, Lateral Capital, Partech Africa. All received Series A deck.' },
      ])
    }
  }

  // 16. Meal plans (Nairobi working founder diet)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Mandazi + chai + boiled eggs', calories: 480, notes: 'Quick prep — eat at desk during morning metrics review' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Pilau + kachumbari + yoghurt', calories: 620, notes: 'Ordered from Jumia Food — pilau Monday tradition' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Ugali + sukuma wiki + tilapia', calories: 680, notes: 'Home-cooked — stress-relief of making a proper meal' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'breakfast', recipe_name: 'Oats + banana + black coffee', calories: 380, notes: 'Deep work Wednesday — no meeting morning, light breakfast' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'lunch', recipe_name: 'Team lunch — Carnivoré nyama choma', calories: 850, notes: 'Friday team ritual when we hit a milestone' },
    ])
  }

  console.log('✅ Aisha Mwangi (#33) seeded — KES, Nairobi, M-Bora FinTech founder, YC W25, 312K users')
}

seedAisha().catch(e => { console.error(e); process.exit(1) })
