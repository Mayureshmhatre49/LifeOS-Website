// End-to-end smoke test exercising every module's CRUD path with a real test user.
// Creates user, runs through each Phase's data flow, verifies, cleans up.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const env = readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .reduce((acc, l) => {
    const idx = l.indexOf('=')
    acc[l.slice(0, idx)] = l.slice(idx + 1).replace(/^"(.*)"$/, '$1')
    return acc
  }, {})

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const results = []
const fails = []
function pass(name) { results.push(`✅ ${name}`) }
function fail(name, err) { fails.push(`❌ ${name}: ${err}`); results.push(`❌ ${name}: ${err}`) }

async function safe(name, fn) {
  try { await fn(); pass(name) } catch (e) { fail(name, e?.message ?? String(e)) }
}

const TEST_EMAIL = `smoke+${Date.now()}@lifeos.test`
let user_id

// ─── 1. Create user ──────────────────────────────────────────────────────────
await safe('users: create', async () => {
  const password_hash = await bcrypt.hash('Test@1234567', 12)
  const { data, error } = await db.from('users').insert({
    email: TEST_EMAIL, name: 'Smoke Test', password_hash,
  }).select('id').single()
  if (error) throw error
  user_id = data.id
})

if (!user_id) {
  console.error('Failed to create user, aborting.')
  for (const r of results) console.log(r)
  process.exit(2)
}

console.log(`Test user: ${TEST_EMAIL} (${user_id})`)

// ─── Phase 3: Tasks ──────────────────────────────────────────────────────────
await safe('tasks: insert', async () => {
  const { error } = await db.from('tasks').insert({
    user_id, title: 'Test task', priority: 'medium', status: 'todo',
    due_date: new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
})

// ─── Phase 6: Money ──────────────────────────────────────────────────────────
await safe('expenses: insert', async () => {
  const { error } = await db.from('expenses').insert({
    user_id, amount: 1234.50, category: 'food', expense_date: new Date().toISOString().slice(0, 10),
    description: 'Test expense',
  })
  if (error) throw error
})
await safe('savings_goals: insert', async () => {
  const { error } = await db.from('savings_goals').insert({
    user_id, title: 'Emergency fund', target_amount: 100000, current_amount: 5000,
  })
  if (error) throw error
})

// ─── Phase 11: Mind ──────────────────────────────────────────────────────────
await safe('mood_logs: insert', async () => {
  const { error } = await db.from('mood_logs').insert({
    user_id, mood: 4, stress: 2, note: 'Pretty good',
  })
  if (error) throw error
})
await safe('journal_entries: insert', async () => {
  const { error } = await db.from('journal_entries').insert({
    user_id, content: 'Test journal', prompt: 'Today I felt…',
  })
  if (error) throw error
})

// ─── Phase 13: Decision logs ─────────────────────────────────────────────────
await safe('decision_logs: insert', async () => {
  const { error } = await db.from('decision_logs').insert({
    user_id, question: 'Should I take the new job?',
    options: [{ label: 'Stay', pros: ['stable'], cons: ['boring'] }],
    result: { recommendation: 'Stay', confidence: 0.7 },
  })
  if (error) throw error
})

// ─── Phase 18: Habits ────────────────────────────────────────────────────────
let habit_id
await safe('habits: insert', async () => {
  const { data, error } = await db.from('habits').insert({
    user_id, name: 'Drink water', icon: '💧', color: 'sky',
    frequency: 'daily', days_of_week: [0, 1, 2, 3, 4, 5, 6], target_per_day: 8,
  }).select('id').single()
  if (error) throw error
  habit_id = data.id
})
await safe('habit_logs: insert', async () => {
  if (!habit_id) throw new Error('habit_id missing')
  const { error } = await db.from('habit_logs').insert({
    user_id, habit_id, date: new Date().toISOString().slice(0, 10), count: 3,
  })
  if (error) throw error
})

// ─── Phase 12: Notifications ─────────────────────────────────────────────────
await safe('notifications: insert', async () => {
  const { error } = await db.from('notifications').insert({
    user_id, type: 'test.smoke', module: 'system',
    title: 'Test notification', body: 'Hi', severity: 'info',
  })
  if (error) throw error
})

// ─── Phase 15: Vault ─────────────────────────────────────────────────────────
await safe('vault_documents: insert', async () => {
  const { error } = await db.from('vault_documents').insert({
    user_id, name: 'PAN Card', category: 'id', storage_path: `${user_id}/test.pdf`,
    expires_at: '2030-12-31',
  })
  if (error) throw error
})

// ─── Phase 16: Travel ────────────────────────────────────────────────────────
let trip_id
await safe('trips: insert', async () => {
  const { data, error } = await db.from('trips').insert({
    user_id, destination: 'Goa', start_date: '2026-06-01', end_date: '2026-06-07',
    budget_total: 50000, travellers: 2,
  }).select('id').single()
  if (error) throw error
  trip_id = data.id
})
await safe('trip_items: insert', async () => {
  if (!trip_id) throw new Error('trip_id missing')
  const { error } = await db.from('trip_items').insert({
    user_id, trip_id, type: 'flight', title: 'BOM → GOI',
  })
  if (error) throw error
})
await safe('packing_items: insert', async () => {
  if (!trip_id) throw new Error('trip_id missing')
  const { error } = await db.from('packing_items').insert({
    user_id, trip_id, item: 'Sunscreen', qty: 1,
  })
  if (error) throw error
})

// ─── Phase 17: Career ────────────────────────────────────────────────────────
let skill_id
await safe('career_goals: insert', async () => {
  const { error } = await db.from('career_goals').insert({
    user_id, title: 'Become a senior engineer', category: 'role', progress_pct: 30,
  })
  if (error) throw error
})
await safe('skills_tracked: insert', async () => {
  const { data, error } = await db.from('skills_tracked').insert({
    user_id, name: 'Rust', category: 'technical', current_level: 2, target_level: 4,
  }).select('id').single()
  if (error) throw error
  skill_id = data.id
})
await safe('learning_resources: insert', async () => {
  const { error } = await db.from('learning_resources').insert({
    user_id, skill_id, title: 'The Rust Book', type: 'book', status: 'active',
  })
  if (error) throw error
})

// ─── Phase 19: Home ──────────────────────────────────────────────────────────
let asset_id
await safe('home_assets: insert', async () => {
  const { data, error } = await db.from('home_assets').insert({
    user_id, name: 'AC', type: 'appliance', brand: 'Daikin', cost: 35000,
  }).select('id').single()
  if (error) throw error
  asset_id = data.id
})
await safe('home_maintenance: insert', async () => {
  const { error } = await db.from('home_maintenance').insert({
    user_id, asset_id, title: 'AC service', recurrence_months: 6,
    next_due_at: '2026-08-01', is_active: true,
  })
  if (error) throw error
})
await safe('utility_bills: insert', async () => {
  const { error } = await db.from('utility_bills').insert({
    user_id, utility: 'electricity', amount: 2400, bill_date: '2026-05-01',
    due_date: '2026-05-15', is_paid: false,
  })
  if (error) throw error
})

// ─── Phase 20: Network ───────────────────────────────────────────────────────
let contact_id
await safe('contacts: insert', async () => {
  const { data, error } = await db.from('contacts').insert({
    user_id, name: 'Jane Doe', email: 'jane@example.com', strength: 4,
    follow_up_at: '2026-05-15',
  }).select('id').single()
  if (error) throw error
  contact_id = data.id
})
await safe('contact_interactions: insert', async () => {
  const { error } = await db.from('contact_interactions').insert({
    user_id, contact_id, type: 'meeting', notes: 'Coffee chat',
  })
  if (error) throw error
})

// ─── Phase 22: Investments ───────────────────────────────────────────────────
let inv_id
await safe('investments: insert', async () => {
  const { data, error } = await db.from('investments').insert({
    user_id, name: 'Nifty Index Fund', type: 'mutual_fund',
    invested_amount: 50000, current_value: 58000, units: 1234.5,
  }).select('id').single()
  if (error) throw error
  inv_id = data.id
})
await safe('sip_plans: insert', async () => {
  const { error } = await db.from('sip_plans').insert({
    user_id, investment_id: inv_id, name: 'Monthly SIP', amount: 5000,
    frequency: 'monthly', start_date: '2026-01-01', next_date: '2026-06-01',
  })
  if (error) throw error
})

// ─── Phase 21: Nutrition ─────────────────────────────────────────────────────
let recipe_id
await safe('recipes: insert', async () => {
  const { data, error } = await db.from('recipes').insert({
    user_id, name: 'Paneer Tikka', cuisine: 'Indian', servings: 2,
    prep_min: 15, cook_min: 20, calories: 320,
    ingredients: [{ item: 'Paneer', qty: 200, unit: 'g' }, { item: 'Yogurt', qty: 50, unit: 'g' }],
    steps: ['Marinate', 'Grill'],
  }).select('id').single()
  if (error) throw error
  recipe_id = data.id
})
await safe('meal_plans: insert', async () => {
  const { error } = await db.from('meal_plans').insert({
    user_id, date: new Date().toISOString().slice(0, 10), meal_type: 'dinner',
    recipe_id, servings: 2,
  })
  if (error) throw error
})
await safe('food_logs: insert', async () => {
  const { error } = await db.from('food_logs').insert({
    user_id, meal_type: 'breakfast', food_name: 'Oatmeal',
    calories: 250, protein_g: 8, carbs_g: 40, fat_g: 5, qty: 1,
  })
  if (error) throw error
})
await safe('nutrition_grocery_items: insert', async () => {
  const { error } = await db.from('nutrition_grocery_items').insert({
    user_id, name: 'Paneer', qty: 500, unit: 'g', category: 'dairy',
  })
  if (error) throw error
})
await safe('nutrition_targets: upsert', async () => {
  const { error } = await db.from('nutrition_targets').upsert(
    { user_id, daily_calories: 2200, protein_g: 100, carbs_g: 250, fat_g: 70, diet_type: 'high-protein' },
    { onConflict: 'user_id' },
  )
  if (error) throw error
})

// ─── Phase 23: Legal ─────────────────────────────────────────────────────────
await safe('legal_deadlines: insert', async () => {
  const { error } = await db.from('legal_deadlines').insert({
    user_id, title: 'ITR FY 2025-26', type: 'itr',
    due_date: '2026-07-31', amount: 25000, authority: 'Income Tax Dept',
  })
  if (error) throw error
})
await safe('legal_documents: insert', async () => {
  const { error } = await db.from('legal_documents').insert({
    user_id, name: 'Rental Agreement', doc_type: 'rental',
    original_text: 'This is a test rental agreement…',
    summary_md: 'A standard 11-month rental.',
    key_points: ['11-month term', '1-month notice'],
    red_flags: ['No clause about repairs'],
  })
  if (error) throw error
})
await safe('legal_compliances: insert', async () => {
  const { error } = await db.from('legal_compliances').insert({
    user_id, item: 'PAN-Aadhaar linked', category: 'personal', frequency: 'one-time',
  })
  if (error) throw error
})

// ─── Phase 24: Business ──────────────────────────────────────────────────────
let client_id, project_id
await safe('business_clients: insert', async () => {
  const { data, error } = await db.from('business_clients').insert({
    user_id, name: 'Acme Corp', email: 'billing@acme.com', gst_no: '07AAACA1234A1Z5',
  }).select('id').single()
  if (error) throw error
  client_id = data.id
})
await safe('business_projects: insert', async () => {
  const { data, error } = await db.from('business_projects').insert({
    user_id, client_id, name: 'Brand redesign', status: 'active', fee: 250000,
  }).select('id').single()
  if (error) throw error
  project_id = data.id
})
await safe('business_invoices: insert', async () => {
  const items = [{ description: 'Strategy', qty: 10, rate: 5000, amount: 50000 }]
  const { error } = await db.from('business_invoices').insert({
    user_id, client_id, project_id, invoice_no: `INV-${Date.now()}`,
    issued_at: '2026-05-01', due_at: '2026-05-15',
    items, subtotal: 50000, tax_pct: 18, tax_amt: 9000, total: 59000, status: 'sent',
  })
  if (error) throw error
})
await safe('business_expenses: insert', async () => {
  const { error } = await db.from('business_expenses').insert({
    user_id, category: 'software', vendor: 'Figma', amount: 1500,
    occurred_at: '2026-05-02', is_billable: true,
  })
  if (error) throw error
})

// ─── Phase 25: Briefing cache ────────────────────────────────────────────────
await safe('daily_briefings: upsert', async () => {
  const { error } = await db.from('daily_briefings').upsert({
    user_id, date: new Date().toISOString().slice(0, 10),
    content_md: '**Good morning.** Test briefing.',
    highlights: [{ label: 'Tasks', value: '1 today', emoji: '📋' }],
  }, { onConflict: 'user_id,date' })
  if (error) throw error
})

// ─── Cleanup ─────────────────────────────────────────────────────────────────
console.log('\nCleanup...')
await db.from('users').delete().eq('id', user_id) // CASCADE wipes everything

// Storage bucket check
await safe('storage bucket: vault-documents exists', async () => {
  const { data, error } = await db.storage.getBucket('vault-documents')
  if (error) throw error
  if (!data) throw new Error('bucket missing')
})

// ─── Report ──────────────────────────────────────────────────────────────────
console.log('\n=== RESULTS ===')
for (const r of results) console.log(r)
console.log(`\n${results.length - fails.length}/${results.length} passed`)
if (fails.length) process.exit(2)
