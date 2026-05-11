/**
 * Seed Money + Investments data for Fatima Al-Rashid
 * Persona: 38yo Dubai healthcare consultant, AED currency, divorced, son Yaseen (16)
 * Run: node tests/e2e-personas/seed-fatima-money.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function ok(label, data, error) {
  if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false }
  const count = Array.isArray(data) ? data.length : 1
  console.log(`  ✔  ${label} (${count} row${count !== 1 ? 's' : ''})`)
  return true
}

async function seed() {
  // ── 0. Resolve Fatima's user ID ───────────────────────────────────────────────
  const { data: user, error: ue } = await db
    .from('users').select('id').eq('email', 'fatima.alrashid@e2e-test.handlelifeos.app').single()
  if (ue || !user) { console.error('Cannot find Fatima user:', ue?.message); process.exit(1) }
  const uid = user.id
  console.log(`\n👤  Fatima user id: ${uid}\n`)

  // ── 1. Budgets (3 months) ─────────────────────────────────────────────────────
  console.log('💰  Budgets')
  for (const [month, year] of [[3,2026],[4,2026],[5,2026]]) {
    const { data, error } = await db.from('budgets')
      .upsert({ user_id: uid, month, year, monthly_income: 28000, savings_target: 5000, currency: 'AED',
        notes: month === 3 ? 'Ramadan month — lower dining out spend' : null },
        { onConflict: 'user_id,month,year' })
      .select().single()
    ok(`Budget ${month}/${year}`, data, error)
  }

  // ── 2. Category Budgets ───────────────────────────────────────────────────────
  console.log('\n📊  Category Budgets')
  const catBudgets = [
    { category: 'food',          monthly_limit: 3500 },
    { category: 'rent',          monthly_limit: 9000 },
    { category: 'travel',        monthly_limit: 1500 },
    { category: 'bills',         monthly_limit: 1500 },
    { category: 'shopping',      monthly_limit: 1500 },
    { category: 'health',        monthly_limit: 800  },
    { category: 'kids',          monthly_limit: 3000 },
    { category: 'entertainment', monthly_limit: 800  },
    { category: 'education',     monthly_limit: 500  },
    { category: 'misc',          monthly_limit: 500  },
  ]
  for (const cb of catBudgets) {
    const { data, error } = await db.from('category_budgets')
      .upsert({ user_id: uid, ...cb }, { onConflict: 'user_id,category' })
      .select().single()
    ok(`  ${cb.category.padEnd(14)} AED ${cb.monthly_limit}`, data, error)
  }

  // ── 3. Expenses — May 2026 ────────────────────────────────────────────────────
  console.log('\n🧾  Expenses — May 2026')
  const mayExpenses = [
    { category: 'rent',          amount: 8500,  description: 'Monthly apartment rent — JLT',            expense_date: '2026-05-01', is_recurring: true  },
    { category: 'bills',         amount: 614,   description: 'DEWA — water & electricity',              expense_date: '2026-05-03', is_recurring: true  },
    { category: 'bills',         amount: 350,   description: 'Etisalat mobile plan',                   expense_date: '2026-05-04', is_recurring: true  },
    { category: 'bills',         amount: 299,   description: 'Du home fibre internet',                 expense_date: '2026-05-04', is_recurring: true  },
    { category: 'food',          amount: 520,   description: 'Carrefour grocery run',                  expense_date: '2026-05-05', is_recurring: false },
    { category: 'travel',        amount: 370,   description: 'ADNOC fuel',                            expense_date: '2026-05-06', is_recurring: false },
    { category: 'health',        amount: 450,   description: 'Fitness First gym — monthly',           expense_date: '2026-05-07', is_recurring: true  },
    { category: 'food',          amount: 185,   description: 'Lunch with team — DIFC',                expense_date: '2026-05-08', is_recurring: false },
    { category: 'kids',          amount: 850,   description: "Yaseen's school activity fee",          expense_date: '2026-05-09', is_recurring: false },
    { category: 'food',          amount: 92,    description: 'Coffee + pastry — Jones the Grocer',    expense_date: '2026-05-10', is_recurring: false },
    { category: 'shopping',      amount: 1250,  description: 'Dubai Mall — summer clothes',           expense_date: '2026-05-10', is_recurring: false },
    { category: 'travel',        amount: 145,   description: 'Careem rides — 3 trips',               expense_date: '2026-05-11', is_recurring: false },
    { category: 'health',        amount: 320,   description: 'Annual medical check-up — Al Zahra',   expense_date: '2026-05-12', is_recurring: false },
    { category: 'food',          amount: 340,   description: 'Spinney\'s organic groceries',          expense_date: '2026-05-13', is_recurring: false },
    { category: 'entertainment', amount: 680,   description: 'Dinner for 2 — Zuma Dubai',            expense_date: '2026-05-14', is_recurring: false },
    { category: 'kids',          amount: 480,   description: 'Yaseen — tutoring sessions x4',        expense_date: '2026-05-15', is_recurring: false },
    { category: 'food',          amount: 75,    description: 'Starbucks — weekly run',               expense_date: '2026-05-16', is_recurring: false },
    { category: 'shopping',      amount: 420,   description: 'Sephora skincare',                     expense_date: '2026-05-17', is_recurring: false },
    { category: 'travel',        amount: 220,   description: 'Airport transfer + parking',           expense_date: '2026-05-18', is_recurring: false },
    { category: 'food',          amount: 290,   description: 'Weekly Talabat grocery order',         expense_date: '2026-05-19', is_recurring: false },
    { category: 'entertainment', amount: 120,   description: 'Cinema tickets — VOX Cinemas x2',     expense_date: '2026-05-20', is_recurring: false },
    { category: 'health',        amount: 180,   description: 'Pharmacy — vitamins & supplements',    expense_date: '2026-05-21', is_recurring: false },
    { category: 'kids',          amount: 650,   description: "Yaseen's driving lessons — 5 hrs",     expense_date: '2026-05-22', is_recurring: false },
    { category: 'food',          amount: 440,   description: 'Team lunch — Zomato catering',        expense_date: '2026-05-23', is_recurring: false },
    { category: 'misc',          amount: 200,   description: 'Home maintenance — AC service',       expense_date: '2026-05-25', is_recurring: false },
  ]
  const { data: mayExp, error: mayErr } = await db.from('expenses')
    .insert(mayExpenses.map(e => ({ user_id: uid, currency: 'AED', ...e }))).select()
  ok('May 2026 expenses', mayExp, mayErr)

  // ── 4. Expenses — April 2026 ──────────────────────────────────────────────────
  console.log('\n🧾  Expenses — April 2026')
  const aprExpenses = [
    { category: 'rent',          amount: 8500,  description: 'Monthly apartment rent — JLT',             expense_date: '2026-04-01', is_recurring: true  },
    { category: 'bills',         amount: 580,   description: 'DEWA — water & electricity',               expense_date: '2026-04-03', is_recurring: true  },
    { category: 'bills',         amount: 350,   description: 'Etisalat mobile plan',                    expense_date: '2026-04-04', is_recurring: true  },
    { category: 'bills',         amount: 299,   description: 'Du home fibre internet',                  expense_date: '2026-04-04', is_recurring: true  },
    { category: 'food',          amount: 490,   description: 'Carrefour grocery run',                   expense_date: '2026-04-06', is_recurring: false },
    { category: 'travel',        amount: 355,   description: 'ADNOC fuel',                             expense_date: '2026-04-07', is_recurring: false },
    { category: 'health',        amount: 450,   description: 'Fitness First gym — monthly',            expense_date: '2026-04-07', is_recurring: true  },
    { category: 'kids',          amount: 1200,  description: "Yaseen's April school fees top-up",      expense_date: '2026-04-08', is_recurring: false },
    { category: 'food',          amount: 210,   description: 'Dinner with friend — La Petite Maison',  expense_date: '2026-04-10', is_recurring: false },
    { category: 'shopping',      amount: 750,   description: 'H&M + Zara — season clothing',          expense_date: '2026-04-11', is_recurring: false },
    { category: 'entertainment', amount: 550,   description: 'Weekend brunch — Soho Garden',          expense_date: '2026-04-12', is_recurring: false },
    { category: 'travel',        amount: 290,   description: 'Uber — 8 rides this fortnight',         expense_date: '2026-04-14', is_recurring: false },
    { category: 'food',          amount: 380,   description: 'Spinney\'s + Waitrose groceries',        expense_date: '2026-04-15', is_recurring: false },
    { category: 'kids',          amount: 500,   description: "Yaseen's new laptop accessories",       expense_date: '2026-04-17', is_recurring: false },
    { category: 'health',        amount: 240,   description: 'Physio session x2 — back pain',        expense_date: '2026-04-18', is_recurring: false },
    { category: 'food',          amount: 85,    description: 'Coffee dates — Café Bateel',            expense_date: '2026-04-20', is_recurring: false },
    { category: 'travel',        amount: 450,   description: 'Abu Dhabi day trip — petrol + toll',   expense_date: '2026-04-22', is_recurring: false },
    { category: 'entertainment', amount: 350,   description: 'Global Village tickets x2 + dinner',  expense_date: '2026-04-25', is_recurring: false },
    { category: 'shopping',      amount: 380,   description: 'Gold souk — silver bracelet for mum', expense_date: '2026-04-26', is_recurring: false },
    { category: 'misc',          amount: 350,   description: 'Professional membership renewal',      expense_date: '2026-04-28', is_recurring: false },
  ]
  const { data: aprExp, error: aprErr } = await db.from('expenses')
    .insert(aprExpenses.map(e => ({ user_id: uid, currency: 'AED', ...e }))).select()
  ok('April 2026 expenses', aprExp, aprErr)

  // ── 5. Expenses — March 2026 ──────────────────────────────────────────────────
  console.log('\n🧾  Expenses — March 2026')
  const marExpenses = [
    { category: 'rent',          amount: 8500, description: 'Monthly apartment rent — JLT',           expense_date: '2026-03-01', is_recurring: true  },
    { category: 'bills',         amount: 720,  description: 'DEWA — higher due to warm weather',      expense_date: '2026-03-03', is_recurring: true  },
    { category: 'bills',         amount: 350,  description: 'Etisalat mobile plan',                  expense_date: '2026-03-04', is_recurring: true  },
    { category: 'bills',         amount: 299,  description: 'Du home fibre internet',                expense_date: '2026-03-04', is_recurring: true  },
    { category: 'food',          amount: 280,  description: 'Ramadan groceries — Carrefour',         expense_date: '2026-03-06', is_recurring: false },
    { category: 'food',          amount: 650,  description: 'Iftar gathering for 8 at home',        expense_date: '2026-03-10', is_recurring: false },
    { category: 'health',        amount: 450,  description: 'Fitness First gym — monthly',          expense_date: '2026-03-07', is_recurring: true  },
    { category: 'entertainment', amount: 200,  description: 'Ramadan tent dinner x2',               expense_date: '2026-03-15', is_recurring: false },
    { category: 'kids',          amount: 600,  description: "Yaseen's Eid clothes + gifts",         expense_date: '2026-03-18', is_recurring: false },
    { category: 'shopping',      amount: 900,  description: 'Eid gifts for family',                 expense_date: '2026-03-22', is_recurring: false },
    { category: 'food',          amount: 320,  description: 'Grocery top-up',                      expense_date: '2026-03-24', is_recurring: false },
    { category: 'travel',        amount: 310,  description: 'ADNOC fuel',                          expense_date: '2026-03-25', is_recurring: false },
    { category: 'misc',          amount: 180,  description: 'Charity/zakat — local',               expense_date: '2026-03-28', is_recurring: false },
  ]
  const { data: marExp, error: marErr } = await db.from('expenses')
    .insert(marExpenses.map(e => ({ user_id: uid, currency: 'AED', ...e }))).select()
  ok('March 2026 expenses', marExp, marErr)

  // ── 6. Transactions ───────────────────────────────────────────────────────────
  console.log('\n💳  Transactions')
  const transactions = [
    // Income — salary
    { amount: 28000, type: 'income',   category: 'salary',      merchant: 'Mediclinic Middle East',   payment_mode: 'netbanking', txn_date: '2026-05-28', notes: 'May salary credit' },
    { amount: 28000, type: 'income',   category: 'salary',      merchant: 'Mediclinic Middle East',   payment_mode: 'netbanking', txn_date: '2026-04-28', notes: 'April salary credit' },
    { amount: 28000, type: 'income',   category: 'salary',      merchant: 'Mediclinic Middle East',   payment_mode: 'netbanking', txn_date: '2026-03-28', notes: 'March salary credit' },
    { amount: 28000, type: 'income',   category: 'salary',      merchant: 'Mediclinic Middle East',   payment_mode: 'netbanking', txn_date: '2026-02-27', notes: 'February salary credit' },
    // Freelance consulting
    { amount: 4500,  type: 'income',   category: 'freelance',   merchant: 'NMC Health — Consulting', payment_mode: 'netbanking', txn_date: '2026-05-15', notes: 'Advisory session fee' },
    { amount: 3200,  type: 'income',   category: 'freelance',   merchant: 'Private clinic — Jumeirah', payment_mode: 'netbanking', txn_date: '2026-04-10', notes: 'Part-time consulting' },
    // Major expenses
    { amount: 8500,  type: 'expense',  category: 'rent',        merchant: 'Al Wasl Real Estate',     payment_mode: 'netbanking', txn_date: '2026-05-01', notes: 'May rent — JLT apt' },
    { amount: 8500,  type: 'expense',  category: 'rent',        merchant: 'Al Wasl Real Estate',     payment_mode: 'netbanking', txn_date: '2026-04-01', notes: 'April rent — JLT apt' },
    { amount: 8500,  type: 'expense',  category: 'rent',        merchant: 'Al Wasl Real Estate',     payment_mode: 'netbanking', txn_date: '2026-03-01', notes: 'March rent — JLT apt' },
    { amount: 2100,  type: 'expense',  category: 'emi',         merchant: 'Emirates NBD Auto',       payment_mode: 'netbanking', txn_date: '2026-05-05', notes: 'Toyota Fortuner EMI' },
    { amount: 2100,  type: 'expense',  category: 'emi',         merchant: 'Emirates NBD Auto',       payment_mode: 'netbanking', txn_date: '2026-04-05', notes: 'Toyota Fortuner EMI' },
    { amount: 2100,  type: 'expense',  category: 'emi',         merchant: 'Emirates NBD Auto',       payment_mode: 'netbanking', txn_date: '2026-03-05', notes: 'Toyota Fortuner EMI' },
    // Investments SIPs
    { amount: 2000,  type: 'transfer', category: 'investment',  merchant: 'Emirates NBD Invest',     payment_mode: 'netbanking', txn_date: '2026-05-15', notes: 'Sukuk fund monthly SIP' },
    { amount: 2000,  type: 'transfer', category: 'investment',  merchant: 'Emirates NBD Invest',     payment_mode: 'netbanking', txn_date: '2026-04-15', notes: 'Sukuk fund monthly SIP' },
    { amount: 2000,  type: 'transfer', category: 'investment',  merchant: 'Emirates NBD Invest',     payment_mode: 'netbanking', txn_date: '2026-03-15', notes: 'Sukuk fund monthly SIP' },
    { amount: 1500,  type: 'transfer', category: 'investment',  merchant: 'Saxo Bank UAE',           payment_mode: 'netbanking', txn_date: '2026-05-01', notes: 'US ETF monthly buy' },
    { amount: 1500,  type: 'transfer', category: 'investment',  merchant: 'Saxo Bank UAE',           payment_mode: 'netbanking', txn_date: '2026-04-01', notes: 'US ETF monthly buy' },
    // Daily spend
    { amount: 614,   type: 'expense',  category: 'bills',       merchant: 'DEWA',                    payment_mode: 'card',       txn_date: '2026-05-03', notes: 'Water & electricity' },
    { amount: 520,   type: 'expense',  category: 'food',        merchant: 'Carrefour JLT',           payment_mode: 'card',       txn_date: '2026-05-05', notes: 'Weekly groceries' },
    { amount: 370,   type: 'expense',  category: 'travel',      merchant: 'ADNOC',                   payment_mode: 'card',       txn_date: '2026-05-06', notes: 'Fuel top-up' },
    { amount: 185,   type: 'expense',  category: 'food',        merchant: 'The Maine Land Brasserie', payment_mode: 'card',      txn_date: '2026-05-08', notes: 'Team lunch DIFC' },
    { amount: 680,   type: 'expense',  category: 'entertainment', merchant: 'Zuma Dubai',            payment_mode: 'card',       txn_date: '2026-05-14', notes: 'Dinner for 2' },
    { amount: 1250,  type: 'expense',  category: 'shopping',    merchant: 'Dubai Mall',              payment_mode: 'card',       txn_date: '2026-05-10', notes: 'Summer wardrobe' },
    { amount: 850,   type: 'expense',  category: 'kids',        merchant: 'GEMS School Dubai',       payment_mode: 'netbanking', txn_date: '2026-05-09', notes: "Yaseen activity fee" },
    { amount: 320,   type: 'expense',  category: 'health',      merchant: 'Al Zahra Hospital',       payment_mode: 'card',       txn_date: '2026-05-12', notes: 'Annual check-up' },
    { amount: 750,   type: 'expense',  category: 'entertainment', merchant: 'Soho Garden',           payment_mode: 'card',       txn_date: '2026-04-12', notes: 'Weekend brunch' },
    { amount: 900,   type: 'expense',  category: 'shopping',    merchant: 'Gold Souk Deira',         payment_mode: 'cash',       txn_date: '2026-03-22', notes: 'Eid gift shopping' },
    // Savings goal top-ups
    { amount: 3000,  type: 'transfer', category: 'savings',     merchant: 'ENBD Savings Account',   payment_mode: 'netbanking', txn_date: '2026-05-28', notes: 'Monthly savings transfer' },
    { amount: 3000,  type: 'transfer', category: 'savings',     merchant: 'ENBD Savings Account',   payment_mode: 'netbanking', txn_date: '2026-04-28', notes: 'Monthly savings transfer' },
  ]
  const { data: txData, error: txErr } = await db.from('transactions')
    .insert(transactions.map(t => ({ user_id: uid, metadata: {}, ...t }))).select()
  ok('Transactions', txData, txErr)

  // ── 7. Liabilities ────────────────────────────────────────────────────────────
  console.log('\n🏦  Liabilities')
  const liabilities = [
    {
      name: 'Toyota Fortuner — Auto Loan',
      type: 'car_loan',
      principal: 95000,
      outstanding: 61200,
      emi: 2100,
      interest_rate: 4.5,
      due_day: 5,
      start_date: '2022-03-01',
      end_date: '2027-03-01',
      lender: 'Emirates NBD Auto Finance',
      notes: '2022 Toyota Fortuner 2.7L — 60-month term',
    },
    {
      name: 'ENBD Visa Signature Card',
      type: 'credit_card',
      principal: 12000,
      outstanding: 7400,
      emi: null,
      interest_rate: 39,
      due_day: 15,
      start_date: '2024-01-01',
      lender: 'Emirates NBD',
      notes: 'Statement balance — pay minimum AED 250',
    },
  ]
  for (const l of liabilities) {
    const { data, error } = await db.from('liabilities').insert({ user_id: uid, ...l }).select().single()
    ok(`  ${l.name}`, data, error)
  }

  // ── 8. Savings Goals ──────────────────────────────────────────────────────────
  console.log('\n🎯  Savings Goals')
  const savingsGoals = [
    {
      title: 'Emergency Fund (3 months)',
      category: 'emergency_fund',
      target_amount: 84000,
      current_amount: 53500,
      currency: 'AED',
      target_date: '2026-12-31',
      is_completed: false,
    },
    {
      title: "Yaseen's University Fund",
      category: 'education',
      target_amount: 200000,
      current_amount: 47500,
      currency: 'AED',
      target_date: '2029-09-01',
      is_completed: false,
    },
    {
      title: 'Europe Trip — Yaseen Graduation',
      category: 'travel',
      target_amount: 30000,
      current_amount: 9800,
      currency: 'AED',
      target_date: '2027-07-01',
      is_completed: false,
    },
    {
      title: 'Makkah & Madinah Umrah',
      category: 'travel',
      target_amount: 12000,
      current_amount: 12000,
      currency: 'AED',
      target_date: '2025-12-01',
      is_completed: true,
    },
    {
      title: 'Home Down Payment',
      category: 'home',
      target_amount: 350000,
      current_amount: 82000,
      currency: 'AED',
      target_date: '2030-06-01',
      is_completed: false,
    },
  ]
  const { data: sgData, error: sgErr } = await db.from('savings_goals')
    .insert(savingsGoals.map(g => ({ user_id: uid, ...g }))).select()
  ok('Savings goals', sgData, sgErr)

  // ── 9. Subscriptions ──────────────────────────────────────────────────────────
  console.log('\n📱  Subscriptions')
  const subs = [
    { name: 'Netflix (Family)',     amount: 55,  billing_cycle: 'monthly',  category: 'entertainment', is_active: true, next_billing_date: '2026-06-04' },
    { name: 'Spotify Premium',     amount: 29,  billing_cycle: 'monthly',  category: 'entertainment', is_active: true, next_billing_date: '2026-06-10' },
    { name: 'Fitness First Gym',   amount: 450, billing_cycle: 'monthly',  category: 'health',        is_active: true, next_billing_date: '2026-06-07', notes: 'Can freeze during travel' },
    { name: 'iCloud 200GB',        amount: 12,  billing_cycle: 'monthly',  category: 'utilities',     is_active: true, next_billing_date: '2026-06-01' },
    { name: 'LinkedIn Premium',    amount: 140, billing_cycle: 'monthly',  category: 'professional',  is_active: true, next_billing_date: '2026-06-20', notes: 'Career Insights plan' },
    { name: 'Noon Prime',          amount: 19,  billing_cycle: 'annual',   category: 'shopping',      is_active: true, next_billing_date: '2027-01-15' },
    { name: 'Arabic News App',     amount: 45,  billing_cycle: 'annual',   category: 'news',          is_active: true, next_billing_date: '2026-11-01' },
    { name: 'Adobe Creative Cloud',amount: 280, billing_cycle: 'monthly',  category: 'professional',  is_active: false, notes: 'Paused — not using consistently' },
  ]
  const { data: subData, error: subErr } = await db.from('money_subscriptions')
    .insert(subs.map(s => ({ user_id: uid, currency: 'AED', ...s }))).select()
  ok('Subscriptions', subData, subErr)

  // ── 10. Investments ───────────────────────────────────────────────────────────
  console.log('\n📈  Investments')
  const investments = [
    {
      name: 'Emirates Global Sukuk Fund',
      type: 'mutual_fund',
      invested_amount: 85000,
      current_value: 98200,
      units: 4250.00,
      avg_cost: 20.00,
      account: 'Emirates NBD Invest',
      start_date: '2020-01-15',
      notes: 'Sharia-compliant fixed income fund — core holding',
      is_active: true,
    },
    {
      name: 'Vanguard S&P 500 ETF (VOO)',
      type: 'etf',
      invested_amount: 45000,
      current_value: 59400,
      units: 13.25,
      avg_cost: 3396.23,
      account: 'Saxo Bank UAE',
      start_date: '2021-06-01',
      notes: 'USD-denominated — currency exposure noted',
      is_active: true,
    },
    {
      name: 'Emirates NBD 1-Year Fixed Deposit',
      type: 'fd',
      invested_amount: 150000,
      current_value: 155250,
      units: null,
      avg_cost: null,
      account: 'Emirates NBD',
      start_date: '2025-10-01',
      notes: 'Matures Oct 2026 — 3.5% p.a.',
      is_active: true,
    },
    {
      name: 'Physical Gold — 24K Bars',
      type: 'gold',
      invested_amount: 38500,
      current_value: 44800,
      units: 100.00,
      avg_cost: 385.00,
      account: 'Dubai Gold Safe',
      start_date: '2022-09-01',
      notes: '100g stored in secure vault — JLT',
      is_active: true,
    },
    {
      name: 'DEWA (Dubai Electricity & Water Authority)',
      type: 'stock',
      invested_amount: 28000,
      current_value: 31500,
      units: 10000,
      avg_cost: 2.80,
      account: 'Al Ramz Brokerage',
      start_date: '2022-04-12',
      notes: 'UAE blue-chip — utility stock, dividend earner',
      is_active: true,
    },
    {
      name: 'Abu Dhabi Islamic Bank Sukuk',
      type: 'bond',
      invested_amount: 50000,
      current_value: 52800,
      units: null,
      avg_cost: null,
      account: 'ADIB',
      start_date: '2023-07-01',
      notes: '5-year Sukuk — matures 2028, 5.6% yield',
      is_active: true,
    },
  ]
  const { data: invData, error: invErr } = await db.from('investments')
    .insert(investments.map(i => ({ user_id: uid, ...i }))).select()
  ok('Investments', invData, invErr)

  // ── 11. SIP Plans ─────────────────────────────────────────────────────────────
  console.log('\n🔄  SIP Plans')
  // Get the investment IDs for the fund and ETF
  const { data: invList } = await db.from('investments').select('id, name').eq('user_id', uid)
  const sukukId = invList?.find(i => i.name.includes('Sukuk Fund'))?.id ?? null
  const etfId   = invList?.find(i => i.name.includes('VOO'))?.id ?? null

  const sips = [
    {
      investment_id: sukukId,
      name: 'Sukuk Fund Monthly SIP',
      amount: 2000,
      frequency: 'monthly',
      start_date: '2020-01-15',
      next_date: '2026-06-15',
      is_active: true,
      notes: 'Auto-debit from ENBD current account on 15th',
    },
    {
      investment_id: etfId,
      name: 'VOO Monthly Purchase',
      amount: 1500,
      frequency: 'monthly',
      start_date: '2021-06-01',
      next_date: '2026-06-01',
      is_active: true,
      notes: 'Saxo Bank auto-invest — USD converted at spot',
    },
    {
      investment_id: null,
      name: 'Gold Accumulation Plan',
      amount: 1000,
      frequency: 'quarterly',
      start_date: '2022-09-01',
      next_date: '2026-09-01',
      is_active: true,
      notes: '~2.5g gold per quarter at current prices',
    },
  ]
  const { data: sipData, error: sipErr } = await db.from('sip_plans')
    .insert(sips.map(s => ({ user_id: uid, ...s }))).select()
  ok('SIP plans', sipData, sipErr)

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n────────────────────────────────────────────────────────')
  console.log('  MONEY SUMMARY (AED)')
  console.log(`  Monthly income    : AED 28,000 (+ occasional consulting)`)
  console.log(`  Monthly savings   : AED 5,000 target`)
  console.log(`  Total liabilities : AED 68,600 (car loan + CC)`)
  console.log(`  Savings goals     : 5 goals, AED 205,000 total saved`)
  console.log(`  Active subs       : 7, ~AED 730/month`)
  console.log('\n  INVESTMENT SUMMARY (AED)')
  console.log(`  Total invested    : AED 396,500`)
  console.log(`  Current value     : AED 441,950`)
  console.log(`  Unrealised gain   : AED +45,450 (+11.5%)`)
  console.log(`  Holdings          : 6 assets — Sukuk, ETF, FD, Gold, Stock, Bond`)
  console.log(`  Active SIPs       : 3 plans, AED 4,500/quarter equiv.`)
  console.log('────────────────────────────────────────────────────────')
  console.log('\n✅  All done — refresh the Money and Investments pages.\n')
}

seed().catch(err => {
  console.error('\n❌ Fatal:', err.message)
  process.exit(1)
})
