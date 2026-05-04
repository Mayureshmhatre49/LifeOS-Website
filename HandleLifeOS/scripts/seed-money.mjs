/**
 * Seed realistic Money OS mock data for the active user (Nishant).
 *
 * Simulates 6 weeks of activity for an Indian middle-class user:
 *  - Monthly budget for May 2026 + April 2026
 *  - ~50 expenses across food, rent, bills, travel, shopping, kids, health
 *  - 3 active savings goals (emergency fund, Goa trip, son's education)
 *  - 5 recurring subscriptions (Netflix, Spotify, ChatGPT, Prime, gym)
 *  - 2 liabilities (home loan + credit card)
 *
 * Idempotent-ish: deletes existing data for this user before re-seeding.
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = readFileSync('.env.local', 'utf8')
  .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
  .reduce((a, l) => { const i = l.indexOf('='); a[l.slice(0, i)] = l.slice(i + 1).replace(/^"(.*)"$/, '$1'); return a }, {})

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Pick the active user ─────────────────────────────────────────────────────
const { data: users } = await db.from('users').select('id, email, name').order('created_at', { ascending: false }).limit(1)
if (!users?.length) { console.error('No users found'); process.exit(1) }
const user = users[0]
const userId = user.id
console.log(`Seeding Money OS for ${user.name} <${user.email}> (${userId})`)

// ─── Wipe existing money data for clean seed ──────────────────────────────────
console.log('  Wiping existing money data…')
await Promise.all([
  db.from('expenses').delete().eq('user_id', userId),
  db.from('budgets').delete().eq('user_id', userId),
  db.from('savings_goals').delete().eq('user_id', userId),
  db.from('money_subscriptions').delete().eq('user_id', userId),
  db.from('liabilities').delete().eq('user_id', userId),
])

// ─── Budgets — April + May 2026 ───────────────────────────────────────────────
console.log('  Budgets…')
await db.from('budgets').upsert([
  { user_id: userId, month: 5, year: 2026, monthly_income: 250000, savings_target: 50000, currency: 'INR' },
  { user_id: userId, month: 4, year: 2026, monthly_income: 250000, savings_target: 50000, currency: 'INR' },
], { onConflict: 'user_id,month,year' })

// ─── Expenses — realistic Indian middle-class spending ─────────────────────────
// Mix of: groceries (food), Zomato/Swiggy (food), rent, utilities (bills),
// fuel/cab (travel), Amazon orders (shopping), kids' school (kids/education),
// pharmacy (health), Netflix/Spotify auto-debit (entertainment, also via subscription).
console.log('  Expenses…')

const today = new Date('2026-05-04')
function dateNDaysAgo(n) {
  const d = new Date(today); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const expenses = [
  // ── This week (May 1–4)
  { category: 'food',          amount: 1240,  description: 'Big Bazaar — weekly groceries',     date: 0,  is_recurring: false },
  { category: 'food',          amount: 480,   description: 'Swiggy — Sunday lunch',              date: 0,  is_recurring: false },
  { category: 'travel',        amount: 320,   description: 'Uber to office',                      date: 1,  is_recurring: false },
  { category: 'food',          amount: 220,   description: 'Coffee + sandwich',                   date: 1,  is_recurring: false },
  { category: 'shopping',      amount: 1899,  description: 'Amazon — wireless mouse',             date: 2,  is_recurring: false },
  { category: 'travel',        amount: 1100,  description: 'Petrol — fuel top-up',                date: 2,  is_recurring: false },
  { category: 'food',          amount: 680,   description: 'Zomato — team lunch',                 date: 3,  is_recurring: false },
  { category: 'health',        amount: 450,   description: 'Apollo Pharmacy — multivitamin refill', date: 3, is_recurring: false },
  { category: 'kids',          amount: 800,   description: 'Stationery + notebooks for Tanish',   date: 3,  is_recurring: false },

  // ── Last week (Apr 27–30)
  { category: 'food',          amount: 2100,  description: 'BigBasket — monthly staples',         date: 5,  is_recurring: false },
  { category: 'bills',         amount: 1850,  description: 'Electricity bill — April',            date: 5,  is_recurring: true  },
  { category: 'bills',         amount: 1199,  description: 'Airtel Fiber — broadband',            date: 6,  is_recurring: true  },
  { category: 'travel',        amount: 240,   description: 'Auto fare',                           date: 6,  is_recurring: false },
  { category: 'shopping',      amount: 3200,  description: 'Myntra — clothes',                    date: 7,  is_recurring: false },
  { category: 'food',          amount: 920,   description: 'Restaurant — anniversary dinner',     date: 7,  is_recurring: false },
  { category: 'entertainment', amount: 649,   description: 'Netflix Premium',                     date: 8,  is_recurring: true  },
  { category: 'food',          amount: 380,   description: 'Swiggy Genie',                        date: 9,  is_recurring: false },
  { category: 'health',        amount: 1500,  description: 'Lab tests — annual checkup',          date: 10, is_recurring: false },

  // ── Earlier April
  { category: 'rent',          amount: 35000, description: 'Apartment rent — April',              date: 12, is_recurring: true  },
  { category: 'food',          amount: 1450,  description: 'Reliance Fresh — groceries',          date: 13, is_recurring: false },
  { category: 'travel',        amount: 8400,  description: 'IndiGo — weekend trip to Pune',       date: 14, is_recurring: false },
  { category: 'food',          amount: 540,   description: 'Cafe — Sunday brunch',                date: 14, is_recurring: false },
  { category: 'kids',          amount: 12000, description: 'Tanish — school fees Q2',             date: 16, is_recurring: false },
  { category: 'shopping',      amount: 2400,  description: 'Decathlon — running shoes',           date: 17, is_recurring: false },
  { category: 'bills',         amount: 1200,  description: 'Mobile postpaid',                     date: 18, is_recurring: true  },
  { category: 'bills',         amount: 850,   description: 'Gas cylinder',                        date: 18, is_recurring: false },
  { category: 'entertainment', amount: 199,   description: 'Spotify Family',                      date: 19, is_recurring: true  },
  { category: 'food',          amount: 1150,  description: 'Zomato — birthday cake + dinner',     date: 20, is_recurring: false },
  { category: 'travel',        amount: 1400,  description: 'Petrol',                              date: 21, is_recurring: false },
  { category: 'shopping',      amount: 4500,  description: 'Croma — kitchen mixer',               date: 22, is_recurring: false },
  { category: 'food',          amount: 880,   description: 'Swiggy weekly',                       date: 23, is_recurring: false },
  { category: 'health',        amount: 750,   description: 'Pharmacy',                            date: 24, is_recurring: false },
  { category: 'food',          amount: 2200,  description: 'BigBasket — staples',                 date: 25, is_recurring: false },
  { category: 'entertainment', amount: 299,   description: 'Amazon Prime',                        date: 25, is_recurring: true  },
  { category: 'kids',          amount: 1800,  description: 'Tanish — art class fees',             date: 26, is_recurring: true  },

  // ── March (1+ month back)
  { category: 'rent',          amount: 35000, description: 'Apartment rent — March',              date: 35, is_recurring: true  },
  { category: 'travel',        amount: 12500, description: 'Bengaluru work trip — flight',        date: 38, is_recurring: false },
  { category: 'food',          amount: 1900,  description: 'BigBasket',                           date: 40, is_recurring: false },
  { category: 'bills',         amount: 1850,  description: 'Electricity — March',                 date: 42, is_recurring: true  },
  { category: 'shopping',      amount: 1599,  description: 'Amazon — kitchen items',              date: 44, is_recurring: false },
  { category: 'entertainment', amount: 1500,  description: 'Cult Fit gym — monthly',              date: 45, is_recurring: true  },
  { category: 'health',        amount: 600,   description: 'Doctor consult',                      date: 47, is_recurring: false },
  { category: 'education',     amount: 4900,  description: 'Coursera Plus — annual',              date: 50, is_recurring: false },
]

const expenseRows = expenses.map(e => ({
  user_id: userId,
  category: e.category,
  amount: e.amount,
  currency: 'INR',
  description: e.description,
  expense_date: dateNDaysAgo(e.date),
  is_recurring: e.is_recurring,
}))
const exp = await db.from('expenses').insert(expenseRows)
if (exp.error) { console.error('  ❌ expenses', exp.error); process.exit(2) }
console.log(`    ✓ ${expenseRows.length} expenses`)

// ─── Savings goals ─────────────────────────────────────────────────────────────
console.log('  Savings goals…')
const goals = [
  { title: 'Emergency fund (6 months expenses)', category: 'emergency_fund', target_amount: 600000, current_amount: 285000, target_date: '2026-12-31' },
  { title: 'Goa family trip',                    category: 'travel',         target_amount: 80000,  current_amount: 32000,  target_date: '2026-12-15' },
  { title: "Tanish's higher education",          category: 'education',      target_amount: 2500000, current_amount: 320000, target_date: '2030-06-30' },
]
const sg = await db.from('savings_goals').insert(goals.map(g => ({ user_id: userId, ...g, currency: 'INR' })))
if (sg.error) { console.error('  ❌ savings_goals', sg.error); process.exit(2) }
console.log(`    ✓ ${goals.length} savings goals`)

// ─── Subscriptions (recurring monthly bills the user tracks) ──────────────────
console.log('  Subscriptions…')
const subs = [
  { name: 'Netflix Premium',  amount: 649,  billing_cycle: 'monthly', category: 'entertainment', next_billing_date: dateNDaysAgo(-26) },
  { name: 'Spotify Family',   amount: 199,  billing_cycle: 'monthly', category: 'entertainment', next_billing_date: dateNDaysAgo(-15) },
  { name: 'ChatGPT Plus',     amount: 1700, billing_cycle: 'monthly', category: 'productivity',  next_billing_date: dateNDaysAgo(-8)  },
  { name: 'Amazon Prime',     amount: 1499, billing_cycle: 'annual',  category: 'shopping',      next_billing_date: '2027-02-12'      },
  { name: 'Cult Fit Pro',     amount: 1500, billing_cycle: 'monthly', category: 'health',        next_billing_date: dateNDaysAgo(-19) },
  { name: 'Microsoft 365',    amount: 489,  billing_cycle: 'monthly', category: 'productivity',  next_billing_date: dateNDaysAgo(-22) },
]
const ms = await db.from('money_subscriptions').insert(subs.map(s => ({ user_id: userId, ...s, currency: 'INR', is_active: true })))
if (ms.error) { console.error('  ❌ money_subscriptions', ms.error); process.exit(2) }
console.log(`    ✓ ${subs.length} subscriptions`)

// ─── Liabilities (loans + credit card) ────────────────────────────────────────
console.log('  Liabilities…')
const liabs = [
  {
    name: 'HDFC Home Loan', type: 'home_loan',
    principal: 6500000, outstanding: 5180000,
    emi: 54200, interest_rate: 8.5, due_day: 5,
    start_date: '2022-03-01', end_date: '2042-03-01',
    lender: 'HDFC Bank',
  },
  {
    name: 'HDFC Regalia Credit Card', type: 'credit_card',
    principal: 75000, outstanding: 23400,
    interest_rate: 38.5, due_day: 18,
    lender: 'HDFC Bank',
    notes: 'Pay full balance every month',
  },
]
const li = await db.from('liabilities').insert(liabs.map(l => ({ user_id: userId, ...l })))
if (li.error) { console.error('  ❌ liabilities', li.error); process.exit(2) }
console.log(`    ✓ ${liabs.length} liabilities`)

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n✅ Seed complete')
console.log(`   Total expenses logged: ₹${expenseRows.reduce((s, e) => s + Number(e.amount), 0).toLocaleString('en-IN')}`)
console.log(`   Active goals: ${goals.length}`)
console.log(`   Recurring subs: ${subs.length}`)
console.log(`   Liabilities: ${liabs.length}`)
console.log(`\n   Visit http://localhost:3000/money to see it live.`)
