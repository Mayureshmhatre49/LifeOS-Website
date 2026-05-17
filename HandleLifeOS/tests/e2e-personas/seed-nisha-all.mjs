// Nisha Mehta — Divorced property portfolio manager, Mumbai + Dubai.
// 44yo. Marwari origin. Hotel Mgmt (UMass) + MBA (Cornell). 14 yrs Middle East hospitality.
// 7 properties: Mumbai ×3, Pune commercial, Goa villa, Alibag beach villa, Dubai apartment.
// 3 currencies live: INR, AED, USD. 5 income streams. No children (by choice).
// Run: node tests/e2e-personas/seed-nisha-all.mjs
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EMAIL    = 'nisha@e2e-test.handlelifeos.app'
const PASSWORD = 'E2eTest123!'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function ensureUser() {
  // Check if already exists via auth admin
  const { data: { users } } = await sb.auth.admin.listUsers()
  const existing = users.find(u => u.email === EMAIL)
  if (existing) {
    console.log(`✔  Auth user already exists (${existing.id})`)
    return existing.id
  }

  // Create auth user
  const { data, error } = await sb.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })
  if (error) throw new Error(`Failed to create auth user: ${error.message}`)
  console.log(`✔  Auth user created (${data.user.id})`)
  return data.user.id
}

export async function seedNisha() {
  const uid = await ensureUser()

  // ── PROFILE ──────────────────────────────────────────────────────────────────
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Nisha Mehta',
    occupation: 'Property Portfolio Manager & Hospitality Consultant',
    life_stage: 'mid_career',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: [
      'Grow property portfolio to 10 units by 2028 (add 3 more)',
      'Publish NRI property investment guide (co-authored)',
      'Optimize DTAA compliance — zero tax notices',
      'Complete advance tax payments on time (all 4 quarters)',
      'Maintain Alibag villa at 70%+ occupancy in season',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // ── BUDGETS ───────────────────────────────────────────────────────────────────
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'housing',    amount: 247000, spent: 247000 }, // 3 EMIs
    { user_id: uid, month: 5, year: 2026, category: 'maintenance', amount: 60000,  spent: 54000  },
    { user_id: uid, month: 5, year: 2026, category: 'food',        amount: 25000,  spent: 18600  },
    { user_id: uid, month: 5, year: 2026, category: 'travel',      amount: 40000,  spent: 34000  },
    { user_id: uid, month: 5, year: 2026, category: 'investment',  amount: 120000, spent: 120000 },
    { user_id: uid, month: 5, year: 2026, category: 'misc',        amount: 20000,  spent: 14000  },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // ── EXPENSES ──────────────────────────────────────────────────────────────────
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 105000, category: 'housing',     description: 'Bandra West home loan EMI — May 2026',                    expense_date: '2026-05-01' },
      { user_id: uid, amount: 42000,  category: 'housing',     description: 'Alibag beach villa loan EMI — May 2026',                   expense_date: '2026-05-01' },
      { user_id: uid, amount: 34000,  category: 'travel',      description: 'Dubai trip — IndiGo BOM→DXB + return + hotel 4 nights',   expense_date: '2026-05-05' },
      { user_id: uid, amount: 18000,  category: 'maintenance', description: 'Goa villa caretaker salary + electricity May',             expense_date: '2026-05-03' },
      { user_id: uid, amount: 12000,  category: 'maintenance', description: 'Alibag villa pest control (coastal damp treatment)',        expense_date: '2026-05-08' },
      { user_id: uid, amount: 120000, category: 'investment',  description: 'SIP — Axis Bluechip + Mirae Asset Large & Midcap (May)',   expense_date: '2026-05-10' },
      { user_id: uid, amount: 8500,   category: 'misc',        description: 'CA fees — advance tax calculation + FEMA review Q1 2026', expense_date: '2026-05-14' },
    ])
  }

  // ── INVESTMENTS ───────────────────────────────────────────────────────────────
  if (await cnt('investments', uid) < 4) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Axis Bluechip Fund + Mirae Asset Large & Midcap – SIP',  type: 'mutual_fund', invested_amount: 4500000, current_value: 5180000, account: 'Zerodha Coin' },
      { user_id: uid, name: 'Sovereign Gold Bonds 2023-IX (post-divorce settlement)',   type: 'gold',        invested_amount: 1200000, current_value: 1390000, account: 'HDFC Demat' },
      { user_id: uid, name: 'UAE Fixed Deposit — ADCB (AED 80,000)',                   type: 'savings',     invested_amount: 1760000, current_value: 1760000, account: 'ADCB Dubai' },
      { user_id: uid, name: 'Charles Schwab US Brokerage (USD 35,000 — pre-return)',    type: 'stocks',      invested_amount: 2730000, current_value: 3100000, account: 'Schwab International' },
    ])
  }

  // ── HABITS ────────────────────────────────────────────────────────────────────
  if (await cnt('habits', uid) < 5) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Iyengar yoga — 60 min (Mon–Fri)',                        frequency: 'daily',   current_streak: 41, target_streak: 60,  started_on: '2026-04-06', category: 'health' },
      { user_id: uid, name: 'Bandra seafront run — 5km',                              frequency: 'weekly',  current_streak: 8,  target_streak: 20,  started_on: '2026-03-15', category: 'health' },
      { user_id: uid, name: 'HRV check (Garmin Forerunner) + sleep log',              frequency: 'daily',   current_streak: 52, target_streak: 90,  started_on: '2026-03-26', category: 'health' },
      { user_id: uid, name: 'Advance tax calendar review (quarterly reminder)',        frequency: 'monthly', current_streak: 3,  target_streak: 4,   started_on: '2026-03-01', category: 'work'   },
      { user_id: uid, name: 'Property portfolio review — rent receipts & compliance', frequency: 'monthly', current_streak: 5,  target_streak: 12,  started_on: '2026-01-01', category: 'work'   },
    ])
  }

  // ── MOOD LOGS ─────────────────────────────────────────────────────────────────
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 5, note: 'Dubai trip went smoothly. Met the operator — Airbnb occupancy up 18% YoY. ADCB account sorted. Feeling sharp.',                                                        logged_at: '2026-05-08T21:30:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Chembur tenant requested early lease termination. Need to find replacement. Annoying but manageable. Called the agent.',                                               logged_at: '2026-05-07T21:30:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Alibag weekend. Morning yoga on the terrace facing the sea. This is exactly why I made the choices I made.',                                                           logged_at: '2026-05-04T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Consulting call with Ramesh (resort client) — they want to expand to Goa. Scope growing. Invoiced USD 4,500 this month.',                                              logged_at: '2026-05-02T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: "Jaipur call with Mummy — she asked again about 'settling down'. I said I am settled. She means something else. Same conversation, different year. Held my ground well.", logged_at: '2026-05-01T22:00:00Z' },
    ])
  }

  // ── JOURNAL ───────────────────────────────────────────────────────────────────
  if (await cnt('journal_entries', uid) < 4) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Dubai this week. The Business Bay apartment is in good shape — new operator is professional, finally. Airbnb reviews averaging 4.7. Standing in the apartment I looked at the creek view and thought: I own this. On my own. That still feels like a fact worth stating plainly.", mood_tag: 'confident', created_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, content: "The Chembur tenant situation is a good test of equanimity. Three years ago this would have spiked my cortisol. Now I called the agent, gave him a brief, and got on with my day. Seven properties teaches you: vacancies are operational events, not emergencies.", mood_tag: 'calm', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "Alibag weekend. Sat on the balcony at 6am watching the sea before yoga. I keep trying to write something profound about it and failing. The sea doesn't need annotation. Neither does this life, really.", mood_tag: 'peaceful', created_at: '2026-05-04T22:00:00Z' },
      { user_id: uid, content: "Mummy asked about remarrying. I explained, again, that being alone and being lonely are different states. She heard 'alone'. I meant 'free'. This gap in translation is probably permanent. I love her anyway.", mood_tag: 'reflective', created_at: '2026-05-01T23:00:00Z' },
    ])
  }

  // ── CONTACTS ──────────────────────────────────────────────────────────────────
  if (await cnt('contacts', uid) < 8) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Adv. Suresh Kamath',   group_name: 'Professional', phone: '022-555-0201', notes: 'Property lawyer, Bandra. Holds PoA for registration during travel. Review PoA expiry annually.' },
      { user_id: uid, name: 'Ali Hassan',            group_name: 'Professional', phone: '+971-50-555-0301', notes: 'Dubai property lawyer. RERA + Ejari + DLD matters. Excellent.' },
      { user_id: uid, name: 'CA Deepak Nair',        group_name: 'Professional', phone: '022-555-0401', notes: 'Mumbai CA. DTAA, FEMA, advance tax, ITR. Annual retainer. Trust completely.' },
      { user_id: uid, name: 'Prakash Agency (Mumbai)', group_name: 'Professional', notes: 'Property manager — Andheri West + Chembur flats. Tenant sourcing, rent collection, minor maintenance.' },
      { user_id: uid, name: 'Seasons Stays (Dubai)', group_name: 'Professional', phone: '+971-4-555-0501', notes: 'Dubai short-stay operator. Business Bay Airbnb management. Monthly AED settlement report.' },
      { user_id: uid, name: 'Ramesh Singhvi',        group_name: 'Professional', phone: '0141-555-0601', notes: 'CEO, Rajasthan Heritage Resorts. Consulting retainer client. Expanding to Goa. Invoice USD monthly.' },
      { user_id: uid, name: 'Govind (Alibag)',       group_name: 'Professional', phone: '98200-55555',   notes: 'Alibag villa caretaker. WhatsApp only. Reliable. Handles coastal maintenance, guest check-ins.' },
      { user_id: uid, name: 'Meera Mehta (Mummy)',   group_name: 'Family',       phone: '0141-555-0701', notes: 'Mother, Jaipur. Type 2 diabetes — manages well. Calls every Sunday. Annual Diwali visit.' },
    ])
  }

  // ── CAREER GOALS ─────────────────────────────────────────────────────────────
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Co-author: NRI Property Investment Guide (India + Dubai)', category: 'impact',  status: 'active',  target_date: '2027-03-01', progress_pct: 15, notes: 'Outline drafted. Co-author identified (journalist contact). Publisher conversations TBD.' },
      { user_id: uid, title: 'Expand consulting retainer to second client',              category: 'revenue', status: 'active',  target_date: '2026-12-31', progress_pct: 30, notes: 'Two warm leads from Cornell alumni network. First meeting June 2026.' },
    ])
  }

  // ── TRIPS ─────────────────────────────────────────────────────────────────────
  if (await cnt('trips', uid) < 2) {
    const { data: dubaiTrip } = await sb.from('trips').insert({
      user_id: uid, destination: 'Dubai', country: 'AE',
      starts_on: '2026-06-15', ends_on: '2026-06-19',
      budget_total: 45000, status: 'planning', purpose: 'property',
      notes: 'Quarterly Dubai visit. Agenda: property inspection, Seasons Stays review, ADCB account, Ali Hassan meeting re RERA renewal.',
    }).select().single()

    if (dubaiTrip) {
      await sb.from('trip_items').insert([
        { trip_id: dubaiTrip.id, user_id: uid, type: 'flight', title: 'IndiGo BOM→DXB',            starts_at: '2026-06-15T06:00:00Z', ends_at: '2026-06-15T08:30:00Z', cost: 12000 },
        { trip_id: dubaiTrip.id, user_id: uid, type: 'hotel', title: 'Rove Downtown Dubai (4 nts)', starts_at: '2026-06-15T14:00:00Z', ends_at: '2026-06-19T11:00:00Z', cost: 18000 },
        { trip_id: dubaiTrip.id, user_id: uid, type: 'activity', title: 'Business Bay apartment inspection + Seasons Stays Q2 review', starts_at: '2026-06-16T10:00:00Z', ends_at: '2026-06-16T13:00:00Z', cost: 0 },
        { trip_id: dubaiTrip.id, user_id: uid, type: 'activity', title: 'ADCB branch — account review + FD rollover',                   starts_at: '2026-06-17T09:00:00Z', ends_at: '2026-06-17T11:00:00Z', cost: 0 },
      ])
    }

    const { data: jaiTrip } = await sb.from('trips').insert({
      user_id: uid, destination: 'Jaipur', country: 'IN',
      starts_on: '2026-10-20', ends_on: '2026-11-05',
      budget_total: 15000, status: 'planning', purpose: 'personal',
      notes: 'Annual Diwali trip — parents home. 16 days including Diwali (Oct 29 2026). Will attend one Jaipur family wedding.',
    }).select().single()

    if (jaiTrip) {
      await sb.from('trip_items').insert([
        { trip_id: jaiTrip.id, user_id: uid, type: 'flight', title: 'IndiGo BOM→JAI + return', starts_at: '2026-10-20T08:00:00Z', ends_at: '2026-10-20T09:45:00Z', cost: 9000 },
      ])
    }
  }

  // ── HOME ASSETS ───────────────────────────────────────────────────────────────
  if (await cnt('home_assets', uid) < 4) {
    await sb.from('home_assets').insert([
      { user_id: uid, name: 'Bandra West 3BHK — Primary Residence',            type: 'property', purchased_at: '2021-03-15', cost: 21000000, notes: 'Own home. Home loan outstanding ~INR 1.62 Cr. EMI INR 1,05,000/month. BMC Property Tax due March.' },
      { user_id: uid, name: 'Alibag Beach-Facing Villa — Second Home',          type: 'property', purchased_at: '2022-09-10', cost: 9800000,  notes: 'CRZ compliance docs in Vault. Raigad property tax. Loan EMI INR 42,000/month. Govind is caretaker.' },
      { user_id: uid, name: 'Dubai Business Bay Apartment — Investment',        type: 'property', purchased_at: '2019-07-20', cost: 4800000,  notes: 'Dubai mortgage AED 7,800/month. RERA registered. Ejari active. Managed by Seasons Stays for Airbnb.' },
      { user_id: uid, name: 'Apple MacBook Pro 14" M3 + iPad Pro 12.9"',        type: 'other',    purchased_at: '2024-01-10', cost: 220000,   notes: 'Work setup — consulting, property management, CA document review.' },
    ])
  }

  // ── LEGAL DEADLINES ───────────────────────────────────────────────────────────
  if (await cnt('legal_deadlines', uid) < 5) {
    await sb.from('legal_deadlines').insert([
      { user_id: uid, title: 'Advance Tax Q2 FY 2026-27 — Sep 15',                           type: 'advance_tax',  due_date: '2026-09-15', amount: 280000,  currency: 'INR', status: 'pending',  authority: 'Income Tax Department of India',  notes: 'Q2 installment. Total estimated tax ~INR 9.8L. CA Deepak to confirm split.' },
      { user_id: uid, title: 'Advance Tax Q3 FY 2026-27 — Dec 15',                           type: 'advance_tax',  due_date: '2026-12-15', amount: 280000,  currency: 'INR', status: 'pending',  authority: 'Income Tax Department of India',  notes: 'Q3 installment.' },
      { user_id: uid, title: 'Goa Tourism License Renewal — Goa villa short-stay',           type: 'renewal',      due_date: '2026-11-30', currency: 'INR', status: 'pending',  authority: 'Goa Tourism Department',          notes: 'Annual license for short-stay operations. Govind to assist locally.' },
      { user_id: uid, title: 'Dubai RERA Property Registration Renewal',                      type: 'renewal',      due_date: '2026-12-31', currency: 'AED', status: 'pending',  authority: 'RERA Dubai',                      notes: 'Annual RERA renewal for Business Bay apartment. Ali Hassan to process.' },
      { user_id: uid, title: 'ITR Filing AY 2026-27 (foreign income + rental income)',        type: 'itr',          due_date: '2026-07-31', currency: 'INR', status: 'pending',  authority: 'Income Tax Department of India',  notes: 'Complex return — rental income ×7 props, foreign income (AED+USD), DTAA, Sec 24(b). CA Deepak.' },
    ])
  }

  // ── DECISION LOGS ────────────────────────────────────────────────────────────
  if (await cnt('decision_logs', uid) < 2) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Add 8th property — Pune residential flat OR Goa second villa?',
        options: JSON.stringify([
          { label: 'Pune residential flat (Kharadi)',   pros: ['IT corridor — steady rental demand', 'INR 80L range — manageable loan', 'Near existing Pune commercial unit'], cons: ['Residential oversupply in Kharadi', 'Adds another tenant management burden', 'Lower yield than commercial'] },
          { label: 'Second Goa villa (Assagao area)',   pros: ['Premium short-stay market booming', 'Potential 14-16% gross yield in season', 'Lifestyle + personal retreat value'], cons: ['Seasonal income volatility', 'Requires dedicated on-ground manager', 'CRZ compliance check needed again'] },
        ]),
        result: JSON.stringify({ decision: 'Defer 12 months — focus on Chembur tenant replacement first', reasoning: 'Chembur vacancy is immediate cash drag. Resolve that, stabilize cashflow, then evaluate Goa villa in Q1 2027 when Goa Season data is clearer.' }),
        mode: 'compare', favorite: true,
      },
      {
        user_id: uid,
        question: 'Consulting retainer — expand scope to second client now or after book launch?',
        options: JSON.stringify([
          { label: 'Take second client now (USD 3K/month potential)',    pros: ['Immediate income', 'Diversifies client risk'], cons: ['Bandwidth stretch with book project', 'Book timeline may slip'] },
          { label: 'Finish book first (Q1 2027), then second client',    pros: ['Book establishes credibility', 'Higher rate possible post-launch', 'Focused execution'], cons: ['Lost 9 months income', 'Window with warm leads may close'] },
        ]),
        result: JSON.stringify({ decision: 'Take second client — cap at 10 hrs/month, delegate book research to co-author', reasoning: 'Warm leads have 60-day shelf life. Book co-author can carry research load. Structured 10-hr cap prevents overcommitment.' }),
        mode: 'analyze', favorite: false,
      },
    ])
  }

  // ── MEAL PLANS ────────────────────────────────────────────────────────────────
  if (await cnt('meal_plans', uid) < 4) {
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'breakfast', title: 'Moong dal chilla with mint chutney',               calories: 310, notes: 'High protein, vegetarian, light pre-yoga.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'lunch',     title: 'Brown rice, rajma, cucumber salad',                 calories: 580, notes: 'Marwari staple. No meat, no seafood.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 1, meal_type: 'dinner',    title: 'Dal makhani, tandoori roti, stir-fried greens',     calories: 640, notes: 'Comfort dinner. Vegetarian.' },
      { user_id: uid, week_start: '2026-05-11', day_of_week: 6, meal_type: 'dinner',    title: 'Japanese — homemade miso ramen with tofu + egg',    calories: 560, notes: 'Learning Japanese cuisine. WSET wine pairing for future consulting menus.' },
    ])
  }

  console.log('✓ Nisha Mehta seeded successfully')
  console.log(`  Email   : ${EMAIL}`)
  console.log(`  Password: ${PASSWORD}`)
}

seedNisha().catch(e => { console.error(e); process.exit(1) })
