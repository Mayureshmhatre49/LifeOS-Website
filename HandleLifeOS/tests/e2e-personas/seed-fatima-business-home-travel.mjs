/**
 * Seeds business, home & property, and travel data for Fatima Al-Rashid.
 *
 * Run:
 *   node tests/e2e-personas/seed-fatima-business-home-travel.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '899098ae-2f59-4c02-983c-1b84fefa875d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function ok(label, error) {
  if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false }
  console.log(`  ✔  ${label}`)
  return true
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function insertOne(table, row, label) {
  const { data, error } = await db.from(table).insert(row).select().single()
  ok(label ?? table, error)
  return data
}

// ── BUSINESS ─────────────────────────────────────────────────────────────────

async function seedBusiness() {
  console.log('\n💼  Seeding business data...')

  // Clients
  const alRafah = await insertOne('business_clients', {
    user_id: UID,
    name: 'Al Rafah Medical Centre',
    company: 'Al Rafah Medical Centre LLC',
    email: 'accounts@alrafah.ae',
    phone: '+97124412222',
    address: 'Al Falah Street, Abu Dhabi, UAE',
    currency: 'AED',
    notes: 'Key client — Abu Dhabi based clinic chain',
    archived: false,
  }, 'client: Al Rafah Medical Centre')

  const nmc = await insertOne('business_clients', {
    user_id: UID,
    name: 'NMC Health',
    company: 'NMC Healthcare LLC',
    email: 'procurement@nmchealth.com',
    phone: '+97142345678',
    address: 'Al Nahda, Dubai, UAE',
    currency: 'AED',
    notes: 'Healthcare group — completed workflow audit Q1 2026',
    archived: false,
  }, 'client: NMC Health')

  const wellness = await insertOne('business_clients', {
    user_id: UID,
    name: 'Wellness Hub Dubai',
    company: 'Wellness Hub FZ-LLC',
    email: 'admin@wellnesshub.ae',
    phone: '+97143210000',
    address: 'JLT Cluster G, Dubai, UAE',
    currency: 'AED',
    notes: 'Wellness consulting — proposal submitted May 2026',
    archived: false,
  }, 'client: Wellness Hub Dubai')

  if (!alRafah || !nmc || !wellness) return

  // Projects
  const projAlRafah = await insertOne('business_projects', {
    user_id:    UID,
    client_id:  alRafah.id,
    name:       'Al Rafah – Patient Journey Optimisation',
    status:     'active',
    start_date: '2026-01-15',
    end_date:   '2026-07-15',
    fee:        35000,
    currency:   'AED',
    notes:      '6-month engagement; Phase 2 implementation in progress',
  }, 'project: Al Rafah Patient Journey')

  const projNMC = await insertOne('business_projects', {
    user_id:    UID,
    client_id:  nmc.id,
    name:       'NMC Health – Clinical Workflow Audit',
    status:     'done',
    start_date: '2025-10-01',
    end_date:   '2026-02-28',
    fee:        28000,
    currency:   'AED',
    notes:      'Completed Q1 2026 — final deliverable submitted',
  }, 'project: NMC Clinical Workflow Audit')

  await insertOne('business_projects', {
    user_id:    UID,
    client_id:  wellness.id,
    name:       'Wellness Hub – Nutrition Programme Design',
    status:     'lead',
    start_date: '2026-06-01',
    end_date:   null,
    fee:        12000,
    currency:   'AED',
    notes:      'Proposal submitted May 2026 — awaiting sign-off',
  }, 'project: Wellness Hub Nutrition Programme')

  if (!projAlRafah || !projNMC) return

  // Invoices — subtotal/tax computed manually (no API layer needed for seed)
  await insertOne('business_invoices', {
    user_id:      UID,
    client_id:    alRafah.id,
    project_id:   projAlRafah.id,
    invoice_no:   'ARHA-2026-001',
    issued_at:    '2026-01-31',
    due_at:       '2026-02-14',
    items:        [{ description: 'Phase 1 – Discovery & Gap Analysis', qty: 1, rate: 15000, amount: 15000 }],
    subtotal:     15000,
    tax_pct:      0,
    tax_amt:      0,
    discount_amt: 0,
    total:        15000,
    currency:     'AED',
    status:       'paid',
    paid_at:      '2026-02-10',
    notes:        'Phase 1 complete',
  }, 'invoice: ARHA-2026-001 (paid)')

  await insertOne('business_invoices', {
    user_id:      UID,
    client_id:    alRafah.id,
    project_id:   projAlRafah.id,
    invoice_no:   'ARHA-2026-002',
    issued_at:    '2026-04-01',
    due_at:       '2026-04-15',
    items: [
      { description: 'Phase 2 – Implementation Support (March)', qty: 1, rate: 10000, amount: 10000 },
      { description: 'Phase 2 – Implementation Support (April)', qty: 1, rate: 10000, amount: 10000 },
    ],
    subtotal:     20000,
    tax_pct:      0,
    tax_amt:      0,
    discount_amt: 0,
    total:        20000,
    currency:     'AED',
    status:       'sent',
    notes:        'Phase 2 months 1–2',
  }, 'invoice: ARHA-2026-002 (sent)')

  await insertOne('business_invoices', {
    user_id:      UID,
    client_id:    nmc.id,
    project_id:   projNMC.id,
    invoice_no:   'ARHA-2026-003',
    issued_at:    '2026-03-01',
    due_at:       '2026-03-15',
    items:        [{ description: 'Clinical Workflow Audit – Final Deliverable', qty: 1, rate: 28000, amount: 28000 }],
    subtotal:     28000,
    tax_pct:      0,
    tax_amt:      0,
    discount_amt: 0,
    total:        28000,
    currency:     'AED',
    status:       'paid',
    paid_at:      '2026-03-12',
    notes:        'Project closed',
  }, 'invoice: ARHA-2026-003 (paid)')

  // Expenses
  const expenses = [
    { category: 'software',          vendor: 'LinkedIn',                 amount: 199,  occurred_at: '2026-04-01', description: 'LinkedIn Premium Career — monthly subscription' },
    { category: 'software',          vendor: 'LinkedIn',                 amount: 199,  occurred_at: '2026-05-01', description: 'LinkedIn Premium Career — monthly subscription' },
    { category: 'professional_fees', vendor: 'Dubai Health Authority',   amount: 850,  occurred_at: '2026-01-10', description: 'DHA Healthcare Consultant Licence renewal 2026' },
    { category: 'travel',            vendor: 'Emirates / Flydubai',      amount: 1250, occurred_at: '2026-03-08', description: 'Dubai–Riyadh–Dubai flights (business trip)' },
    { category: 'marketing',         vendor: 'Canva Pro',                amount: 89,   occurred_at: '2026-04-15', description: 'Canva Pro annual plan — healthcare proposal design' },
    { category: 'office',            vendor: 'Dubai Business Centre',    amount: 1200, occurred_at: '2026-02-01', description: 'JLT co-working space — February' },
    { category: 'office',            vendor: 'Dubai Business Centre',    amount: 1200, occurred_at: '2026-03-01', description: 'JLT co-working space — March' },
    { category: 'office',            vendor: 'Dubai Business Centre',    amount: 1200, occurred_at: '2026-04-01', description: 'JLT co-working space — April' },
  ]
  let expCount = 0
  for (const e of expenses) {
    const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'AED', is_billable: false, ...e })
    if (!error) expCount++; else console.log(`  ✗  expense ${e.description}: ${error.message}`)
  }
  console.log(`  ✔  ${expCount}/${expenses.length} business expenses`)
}

// ── HOME & PROPERTY ──────────────────────────────────────────────────────────

async function seedHome() {
  console.log('\n🏠  Seeding home & property data...')

  // Assets
  const washing = await insertOne('home_assets', {
    user_id: UID, name: 'Samsung Front Load Washing Machine', type: 'appliance',
    brand: 'Samsung', model: 'WW80T504DAW', purchased_at: '2023-09-15',
    warranty_until: '2026-09-15', cost: 2200,
    notes: 'JLT apartment — laundry room',
  }, 'asset: Samsung Washing Machine')

  const dishwasher = await insertOne('home_assets', {
    user_id: UID, name: 'Bosch Dishwasher', type: 'appliance',
    brand: 'Bosch', model: 'SMS46MI01E', purchased_at: '2022-06-10',
    warranty_until: '2025-06-10', cost: 1800,
    notes: 'JLT apartment — kitchen',
  }, 'asset: Bosch Dishwasher')

  const ac1 = await insertOne('home_assets', {
    user_id: UID, name: 'LG Split AC — Living Room', type: 'appliance',
    brand: 'LG', model: 'LS-H18VNXD (2.5 ton)', purchased_at: '2021-04-20',
    warranty_until: '2024-04-20', cost: 3500,
    notes: 'JLT apartment — main living area',
  }, 'asset: LG AC Living Room')

  const ac2 = await insertOne('home_assets', {
    user_id: UID, name: 'LG Split AC — Master Bedroom', type: 'appliance',
    brand: 'LG', model: 'LS-H12VNXD (1.5 ton)', purchased_at: '2021-04-20',
    warranty_until: '2024-04-20', cost: 2800,
    notes: 'JLT apartment — master bedroom',
  }, 'asset: LG AC Master Bedroom')

  const car = await insertOne('home_assets', {
    user_id: UID, name: 'Toyota Fortuner', type: 'vehicle',
    brand: 'Toyota', model: 'Fortuner 2.7L VX', serial_no: 'MR053YZ8X0J009521',
    purchased_at: '2020-11-01', warranty_until: '2023-11-01', cost: 148000,
    notes: 'Dubai plate — P 19244',
  }, 'asset: Toyota Fortuner')

  // Maintenance (only insert where asset exists)
  if (ac1) {
    await insertOne('home_maintenance', {
      user_id: UID, asset_id: ac1.id, title: 'Annual AC Service – Living Room',
      category: 'service', recurrence_months: 12,
      last_done_at: '2025-04-10', next_due_at: '2026-04-10',
      vendor: 'CoolTech Maintenance LLC', cost: 350, is_active: true,
    }, 'maintenance: AC service (living room)')
  }

  if (ac2) {
    await insertOne('home_maintenance', {
      user_id: UID, asset_id: ac2.id, title: 'Annual AC Service – Master Bedroom',
      category: 'service', recurrence_months: 12,
      last_done_at: '2025-04-10', next_due_at: '2026-04-10',
      vendor: 'CoolTech Maintenance LLC', cost: 350, is_active: true,
    }, 'maintenance: AC service (master bedroom)')
  }

  if (car) {
    await insertOne('home_maintenance', {
      user_id: UID, asset_id: car.id, title: 'Toyota Fortuner Annual Service',
      category: 'service', recurrence_months: 12,
      last_done_at: '2025-11-05', next_due_at: '2026-11-05',
      vendor: 'Al-Futtaim Toyota Service Centre', cost: 1200, is_active: true,
    }, 'maintenance: Fortuner annual service')

    await insertOne('home_maintenance', {
      user_id: UID, asset_id: car.id, title: 'Tyre Rotation & Pressure Check',
      category: 'service', recurrence_months: 6,
      last_done_at: '2026-03-10', next_due_at: '2026-09-10',
      vendor: 'Al-Futtaim Toyota Service Centre', cost: 200, is_active: true,
    }, 'maintenance: Tyre rotation')
  }

  if (dishwasher) {
    await insertOne('home_maintenance', {
      user_id: UID, asset_id: dishwasher.id, title: 'Dishwasher Deep Clean & Filter Replacement',
      category: 'cleaning', recurrence_months: 6,
      last_done_at: '2025-12-01', next_due_at: '2026-06-01',
      vendor: null, cost: 0, is_active: true,
      notes: 'Self-service — replace filter and clean drum',
    }, 'maintenance: Dishwasher clean')
  }

  if (washing) {
    await insertOne('home_maintenance', {
      user_id: UID, asset_id: washing.id, title: 'Washing Machine Drum Clean',
      category: 'cleaning', recurrence_months: 3,
      last_done_at: '2026-03-20', next_due_at: '2026-06-20',
      vendor: null, cost: 0, is_active: true,
    }, 'maintenance: Washing machine drum clean')
  }

  // Utility bills — DEWA electricity (Feb–Apr 2026)
  const bills = [
    { utility: 'electricity', provider: 'DEWA', amount: 420, bill_date: '2026-02-28', due_date: '2026-03-14', is_paid: true,  account_no: 'DEWA-20024877' },
    { utility: 'electricity', provider: 'DEWA', amount: 395, bill_date: '2026-03-31', due_date: '2026-04-14', is_paid: true,  account_no: 'DEWA-20024877' },
    { utility: 'electricity', provider: 'DEWA', amount: 460, bill_date: '2026-04-30', due_date: '2026-05-14', is_paid: false, account_no: 'DEWA-20024877' },
    // DEWA water
    { utility: 'water',       provider: 'DEWA', amount: 85,  bill_date: '2026-02-28', due_date: '2026-03-14', is_paid: true,  account_no: 'DEWA-20024877' },
    { utility: 'water',       provider: 'DEWA', amount: 92,  bill_date: '2026-03-31', due_date: '2026-04-14', is_paid: true,  account_no: 'DEWA-20024877' },
    { utility: 'water',       provider: 'DEWA', amount: 78,  bill_date: '2026-04-30', due_date: '2026-05-14', is_paid: false, account_no: 'DEWA-20024877' },
    // Etisalat internet
    { utility: 'internet',    provider: 'Etisalat (e&)',  amount: 299, bill_date: '2026-02-05', due_date: '2026-02-20', is_paid: true,  account_no: 'ETI-4412309' },
    { utility: 'internet',    provider: 'Etisalat (e&)',  amount: 299, bill_date: '2026-03-05', due_date: '2026-03-20', is_paid: true,  account_no: 'ETI-4412309' },
    { utility: 'internet',    provider: 'Etisalat (e&)',  amount: 299, bill_date: '2026-04-05', due_date: '2026-04-20', is_paid: true,  account_no: 'ETI-4412309' },
    // du mobile
    { utility: 'phone',       provider: 'du',             amount: 149, bill_date: '2026-02-15', due_date: '2026-03-01', is_paid: true,  account_no: 'DU-98771234' },
    { utility: 'phone',       provider: 'du',             amount: 149, bill_date: '2026-03-15', due_date: '2026-04-01', is_paid: true,  account_no: 'DU-98771234' },
    { utility: 'phone',       provider: 'du',             amount: 149, bill_date: '2026-04-15', due_date: '2026-05-01', is_paid: true,  account_no: 'DU-98771234' },
  ]
  let billCount = 0
  for (const b of bills) {
    const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b })
    if (!error) billCount++; else console.log(`  ✗  bill ${b.utility}/${b.bill_date}: ${error.message}`)
  }
  console.log(`  ✔  ${billCount}/${bills.length} utility bills`)
}

// ── TRAVEL ───────────────────────────────────────────────────────────────────

async function seedTravel() {
  console.log('\n✈️   Seeding travel data...')

  // ── Trip 1: Abu Dhabi family trip (booked, future) ───────────────────────
  const tripAD = await insertOne('trips', {
    user_id: UID, destination: 'Abu Dhabi, UAE',
    start_date: '2026-06-20', end_date: '2026-06-23',
    status: 'booked', budget_total: 3500, currency: 'AED',
    travellers: 3,
    notes: 'Family trip — Ahmed, Layla, Omar. Marriott Downtown pre-booked.',
    cover_emoji: '🕌',
  }, 'trip: Abu Dhabi family (booked)')

  if (tripAD) {
    const adItems = [
      { type: 'flight',    title: 'EK 301 Dubai → Abu Dhabi (Express Bus)', starts_at: '2026-06-20T09:00:00+04:00', location: 'Dubai Bus Station, Al Ghubaiba', cost: 0, order_index: 1, notes: 'Road trip via E11 — 1.5h drive' },
      { type: 'hotel',     title: 'Marriott Downtown Abu Dhabi', starts_at: '2026-06-20T15:00:00+04:00', ends_at: '2026-06-23T12:00:00+04:00', location: 'Sheikh Rashid Bin Saeed St, Abu Dhabi', cost: 1800, booking_ref: 'MRR-FATI-8821', order_index: 2 },
      { type: 'activity',  title: 'Ferrari World Abu Dhabi', starts_at: '2026-06-21T10:00:00+04:00', location: 'Yas Island, Abu Dhabi', cost: 450, notes: '3 tickets (adult x1, child x2)', order_index: 3 },
      { type: 'activity',  title: 'Yas Waterworld', starts_at: '2026-06-22T10:00:00+04:00', location: 'Yas Island, Abu Dhabi', cost: 390, notes: '3 tickets', order_index: 4 },
      { type: 'meal',      title: 'Lebanese Palace Restaurant — farewell dinner', starts_at: '2026-06-22T19:30:00+04:00', location: 'Corniche Road, Abu Dhabi', cost: 280, order_index: 5 },
    ]
    let adItemCount = 0
    for (const item of adItems) {
      const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: tripAD.id, is_done: false, ...item })
      if (!error) adItemCount++; else console.log(`  ✗  trip item ${item.title}: ${error.message}`)
    }
    console.log(`  ✔  ${adItemCount}/${adItems.length} Abu Dhabi trip items`)

    const adPacking = [
      { item: 'Passports (all family)', category: 'documents', qty: 3, is_packed: false },
      { item: 'Sunscreen SPF 50',       category: 'toiletries', qty: 2, is_packed: false },
      { item: 'Swimwear',               category: 'clothing',   qty: 3, is_packed: false },
      { item: 'Rashguards (kids)',       category: 'clothing',   qty: 2, is_packed: false },
      { item: 'Kids\' casual clothes (3 days)', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Abaya',                  category: 'clothing',   qty: 1, is_packed: false },
      { item: 'Comfortable sandals',    category: 'clothing',   qty: 3, is_packed: false },
      { item: 'Children\'s snacks',     category: 'food',       qty: 1, is_packed: false },
      { item: 'First aid kit',          category: 'health',     qty: 1, is_packed: false },
      { item: 'Phone chargers',         category: 'electronics', qty: 2, is_packed: false },
    ]
    let adPackCount = 0
    for (const p of adPacking) {
      const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: tripAD.id, ...p })
      if (!error) adPackCount++; else console.log(`  ✗  packing ${p.item}: ${error.message}`)
    }
    console.log(`  ✔  ${adPackCount}/${adPacking.length} Abu Dhabi packing items`)
  }

  // ── Trip 2: Amman, Jordan (planning, future) ─────────────────────────────
  const tripAmman = await insertOne('trips', {
    user_id: UID, destination: 'Amman, Jordan',
    start_date: '2026-08-14', end_date: '2026-08-22',
    status: 'planning', budget_total: 6000, currency: 'AED',
    travellers: 2,
    notes: 'Visit sister Maha. Includes Petra day trip and Dead Sea.',
    cover_emoji: '🏛️',
  }, 'trip: Amman Jordan (planning)')

  if (tripAmman) {
    const amItems = [
      { type: 'flight',   title: 'Flydubai FZ-831 Dubai → Amman (AMM)', starts_at: '2026-08-14T07:15:00+04:00', ends_at: '2026-08-14T09:15:00+03:00', location: 'Dubai International Airport, T2', cost: 720, booking_ref: null, order_index: 1 },
      { type: 'hotel',    title: 'Four Seasons Hotel Amman', starts_at: '2026-08-14T14:00:00+03:00', ends_at: '2026-08-22T12:00:00+03:00', location: '5th Circle, Al Kindi St, Amman', cost: 2800, booking_ref: null, order_index: 2, notes: 'Booked via sister Maha discount' },
      { type: 'activity', title: 'Petra Day Trip', starts_at: '2026-08-16T06:00:00+03:00', location: 'Petra, Wadi Musa, Jordan', cost: 300, order_index: 3, notes: 'Full-day guided tour, 5h drive each way' },
      { type: 'activity', title: 'Dead Sea — Amman Beach Resort', starts_at: '2026-08-18T09:00:00+03:00', location: 'Dead Sea, Jordan', cost: 150, order_index: 4 },
      { type: 'activity', title: 'Jerash Roman Ruins', starts_at: '2026-08-20T09:00:00+03:00', location: 'Jerash, Jordan', cost: 60, order_index: 5 },
      { type: 'flight',   title: 'Flydubai FZ-832 Amman (AMM) → Dubai', starts_at: '2026-08-22T11:30:00+03:00', ends_at: '2026-08-22T15:00:00+04:00', location: 'Queen Alia International Airport, Amman', cost: 680, booking_ref: null, order_index: 6 },
    ]
    let amCount = 0
    for (const item of amItems) {
      const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: tripAmman.id, is_done: false, ...item })
      if (!error) amCount++; else console.log(`  ✗  trip item ${item.title}: ${error.message}`)
    }
    console.log(`  ✔  ${amCount}/${amItems.length} Amman trip items`)

    const amPacking = [
      { item: 'Passport',                 category: 'documents', qty: 1, is_packed: false },
      { item: 'Warm jacket (Amman evenings)', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Comfortable hiking shoes (Petra)', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Swimwear (Dead Sea)',       category: 'clothing',   qty: 1, is_packed: false },
      { item: 'Modest dress / abaya',     category: 'clothing',   qty: 2, is_packed: false },
      { item: 'Sunscreen SPF 50',         category: 'toiletries', qty: 1, is_packed: false },
      { item: 'Water bottle',             category: 'accessories', qty: 1, is_packed: false },
      { item: 'Jordan dinar cash (100 JD)', category: 'documents', qty: 1, is_packed: false },
      { item: 'Travel plug adapter',      category: 'electronics', qty: 1, is_packed: false },
      { item: 'Camera',                   category: 'electronics', qty: 1, is_packed: false },
    ]
    let amPackCount = 0
    for (const p of amPacking) {
      const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: tripAmman.id, ...p })
      if (!error) amPackCount++; else console.log(`  ✗  packing ${p.item}: ${error.message}`)
    }
    console.log(`  ✔  ${amPackCount}/${amPacking.length} Amman packing items`)
  }

  // ── Trip 3: Riyadh business trip (completed, past) ────────────────────────
  const tripRiyadh = await insertOne('trips', {
    user_id: UID, destination: 'Riyadh, Saudi Arabia',
    start_date: '2026-03-08', end_date: '2026-03-10',
    status: 'completed', budget_total: 3000, currency: 'AED',
    travellers: 1,
    notes: 'Business trip — Al Rafah Medical Centre head office stakeholder meetings.',
    cover_emoji: '🏢',
  }, 'trip: Riyadh business (completed)')

  if (tripRiyadh) {
    const rItems = [
      { type: 'flight',   title: 'Flydubai FZ-869 Dubai → Riyadh (RUH)', starts_at: '2026-03-08T08:00:00+04:00', ends_at: '2026-03-08T09:30:00+03:00', location: 'Dubai International Airport, T2', cost: 680, booking_ref: 'FZ-F8821', is_done: true, order_index: 1 },
      { type: 'hotel',    title: 'Hyatt Regency Riyadh Olaya', starts_at: '2026-03-08T14:00:00+03:00', ends_at: '2026-03-10T11:00:00+03:00', location: 'Olaya District, Riyadh', cost: 1100, booking_ref: 'HY-3341RUH', is_done: true, order_index: 2 },
      { type: 'activity', title: 'Al Rafah Head Office — Strategy Meeting', starts_at: '2026-03-09T09:00:00+03:00', ends_at: '2026-03-09T16:00:00+03:00', location: 'Al Rafah Medical Group, Riyadh', cost: 0, is_done: true, order_index: 3, notes: 'Phase 2 scope agreement — 3 stakeholders present' },
      { type: 'meal',     title: 'Business dinner — Najd Village Restaurant', starts_at: '2026-03-09T19:30:00+03:00', location: 'Hitteen, Riyadh', cost: 320, is_done: true, order_index: 4, notes: 'Hosted by client' },
      { type: 'flight',   title: 'Flydubai FZ-870 Riyadh (RUH) → Dubai', starts_at: '2026-03-10T13:00:00+03:00', ends_at: '2026-03-10T16:00:00+04:00', location: 'King Khalid International Airport, Riyadh', cost: 570, booking_ref: 'FZ-F8822', is_done: true, order_index: 5 },
    ]
    let rCount = 0
    for (const item of rItems) {
      const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: tripRiyadh.id, ...item })
      if (!error) rCount++; else console.log(`  ✗  trip item ${item.title}: ${error.message}`)
    }
    console.log(`  ✔  ${rCount}/${rItems.length} Riyadh trip items`)

    const rPacking = [
      { item: 'Passport',                 category: 'documents',   qty: 1, is_packed: true },
      { item: 'Business suits (2)',        category: 'clothing',    qty: 2, is_packed: true },
      { item: 'Laptop + charger',         category: 'electronics', qty: 1, is_packed: true },
      { item: 'Presentation materials',   category: 'work',        qty: 1, is_packed: true },
      { item: 'Business cards',           category: 'work',        qty: 1, is_packed: true },
      { item: 'Saudi riyal cash (200 SAR)', category: 'documents', qty: 1, is_packed: true },
      { item: 'Abaya (conservative)',     category: 'clothing',    qty: 1, is_packed: true },
    ]
    let rPackCount = 0
    for (const p of rPacking) {
      const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: tripRiyadh.id, ...p })
      if (!error) rPackCount++; else console.log(`  ✗  packing ${p.item}: ${error.message}`)
    }
    console.log(`  ✔  ${rPackCount}/${rPacking.length} Riyadh packing items`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n👤  Fatima uid: ${UID}`)
  await seedBusiness()
  await seedHome()
  await seedTravel()
  console.log('\n✅  Seed complete.\n')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
