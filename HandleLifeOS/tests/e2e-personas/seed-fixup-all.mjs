/**
 * Fixup script — corrects all constraint violations from initial persona seed runs.
 * Fixes: home_assets type ('electronics'→'other'), business_expenses category,
 * legal_deadlines type, legal_compliances frequency/category, negotiation_templates tone,
 * and habit_logs (completed→count:1) for all 7 affected personas.
 * Safe to re-run (upsert for habit_logs, plain insert for missing rows).
 * Run: node tests/e2e-personas/seed-fixup-all.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { error } = await db.from(table).insert(row); ok(label ?? table, error); return !error }
function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

// Query habits and insert logs using count:1 instead of completed:true
async function fixHabitLogs(uid, habitOffsets) {
  const { data: habits, error } = await db.from('habits').select('id, name, days_of_week').eq('user_id', uid)
  if (error || !habits?.length) { console.log(`  ✗  habits query: ${error?.message || 'no habits found'}`); return 0 }
  let n = 0
  for (const habit of habits) {
    const cfg = habitOffsets[habit.name]
    if (!cfg) continue
    for (const off of cfg.co) {
      if (!habit.days_of_week.includes(DOW[off])) continue
      const { error: le } = await db.from('habit_logs').upsert(
        { habit_id: habit.id, user_id: uid, date: dateOffset(off), count: 1 },
        { onConflict: 'habit_id,date' }
      )
      if (!le) n++
    }
  }
  return n
}

// ── RAJESH PATEL ───────────────────────────────────────────────────────────────
async function fixRajesh() {
  const UID = 'e164b5cd-1b17-49e2-930d-7700cace70a5'
  console.log('\n👤  Rajesh Patel')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'Samsung 55" Crystal 4K UHD Smart TV', type: 'other', brand: 'Samsung', model: 'UA55AUE60AK', purchased_at: '2022-10-15', warranty_until: '2024-10-15', cost: 55000 }, 'asset: Samsung TV')
  await ins('home_assets', { user_id: UID, name: 'Lenovo ThinkPad E14 Gen 4', type: 'other', brand: 'Lenovo', model: 'ThinkPad E14 Gen 4 (AMD Ryzen 5)', purchased_at: '2023-07-20', warranty_until: '2026-07-20', cost: 65000, notes: 'Business laptop — Tally Prime, Zoho Inventory, GST portal.' }, 'asset: Lenovo ThinkPad')

  // business_expenses: 'transport'→'travel', 'professional'→'professional_fees'
  await ins('business_expenses', { user_id: UID, category: 'travel', vendor: 'Vijay Roadlines', amount: 3800, occurred_at: '2026-04-10', currency: 'INR', is_billable: false, description: 'Freight: 800m cotton fabric from Girish Textile Mills Ahmedabad to Surat warehouse' }, 'expense: Vijay Roadlines')
  await ins('business_expenses', { user_id: UID, category: 'travel', vendor: 'DTDC Courier', amount: 1200, occurred_at: '2026-04-15', currency: 'INR', is_billable: false, description: 'Sample dispatch: 2m swatches to MK Fashion and Lalitha Sarees (express delivery)' }, 'expense: DTDC Courier')
  await ins('business_expenses', { user_id: UID, category: 'professional_fees', vendor: 'CA Dhruv Shah & Associates', amount: 8500, occurred_at: '2026-04-15', currency: 'INR', is_billable: false, description: 'CA fees: GST return filing (GSTR-1 + GSTR-3B) for March 2026' }, 'expense: CA fees')

  // legal_deadlines: 'tax' → correct types
  await ins('legal_deadlines', { user_id: UID, title: 'GST GSTR-3B Monthly Return (June 2026)', type: 'gst', due_date: '2026-06-20', currency: 'INR', status: 'pending', authority: 'GSTN', reference_no: 'GSTIN-24ABCPQ1234R1Z5', notes: 'Monthly GSTR-3B due 20th of following month.' }, 'deadline: GSTR-3B')
  await ins('legal_deadlines', { user_id: UID, title: 'GST GSTR-1 Monthly Return (June 2026)', type: 'gst', due_date: '2026-06-11', currency: 'INR', status: 'pending', authority: 'GSTN', reference_no: 'GSTIN-24ABCPQ1234R1Z5', notes: 'GSTR-1 outward supply details — file before GSTR-3B.' }, 'deadline: GSTR-1')
  await ins('legal_deadlines', { user_id: UID, title: 'Income Tax Return AY 2026-27 (ITR-4 Presumptive)', type: 'itr', due_date: '2026-07-31', currency: 'INR', status: 'pending', authority: 'Income Tax Department of India', reference_no: 'PAN-BKZPP5534J', notes: 'ITR-4 (presumptive taxation 44AD) FY 2025-26. Estimated tax ~₹1.8L.' }, 'deadline: ITR-4')
  await ins('legal_deadlines', { user_id: UID, title: 'TDS Quarterly Deposit Q1 FY 2026-27', type: 'tds', due_date: '2026-07-07', currency: 'INR', status: 'pending', authority: 'Income Tax Department (TDS Division)', notes: 'TDS on warehouse rent (Section 194I). Q1 Apr–Jun 2026 due July 7.' }, 'deadline: TDS Q1')

  // habit logs
  const ho = {
    'Morning Puja 30 min':           { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Brisk Walk 45 min':             { co: [0,1,2,3,4,6,7,8,9,10,12,13,14,15,16,18,19,20] },
    'Business Ledger Review 30 min': { co: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    'Gujarat Samachar Read':         { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Family Dinner by 8pm':          { co: [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20] },
    'Maskati Market Early Visit':    { co: [6,13,20] },
    'Sunday Temple + Family Time':   { co: [0,7,14] },
  }
  const n = await fixHabitLogs(UID, ho)
  console.log(`  ✔  ${n} habit logs`)
}

// ── CARLOS RODRIGUEZ ──────────────────────────────────────────────────────────
async function fixCarlos() {
  const UID = 'de0d28c2-f328-42ef-9544-44c004b6b089'
  console.log('\n👤  Carlos Rodriguez')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'MacBook Pro 14" M3 Pro', type: 'other', brand: 'Apple', model: 'MacBook Pro 14 M3 Pro (2024)', purchased_at: '2024-03-10', warranty_until: '2026-03-10', cost: 52000, notes: 'Equipo principal — AutoCAD, Revit, SketchUp vía Parallels.' }, 'asset: MacBook Pro')
  await ins('home_assets', { user_id: UID, name: 'Wacom Cintiq 16 (tableta gráfica)', type: 'other', brand: 'Wacom', model: 'Cintiq 16 DTK-1660', purchased_at: '2023-06-20', warranty_until: '2026-06-20', cost: 18000, notes: 'Sketching digital y correcciones en renders.' }, 'asset: Wacom Cintiq')
  await ins('home_assets', { user_id: UID, name: 'Monitor Dell UltraSharp 27"', type: 'other', brand: 'Dell', model: 'U2723D', purchased_at: '2023-01-20', warranty_until: '2026-01-20', cost: 12000, notes: 'Pantalla adicional para diseño detallado.' }, 'asset: Dell Monitor')
  // Carlos habit logs were already inserted correctly (old script used count:1)
  console.log('  ✔  assets fixed (habit logs already correct)')
}

// ── YUKI TANAKA ───────────────────────────────────────────────────────────────
async function fixYuki() {
  const UID = '612d3c25-22e2-44d7-8b2b-a52ebbf7167d'
  console.log('\n👤  Yuki Tanaka')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'Canon EOS R6 Mark II (personal)', type: 'other', brand: 'Canon', model: 'EOS R6 Mark II + 24-105mm', purchased_at: '2023-12-15', warranty_until: '2025-12-15', cost: 420000, notes: 'Personal camera — staff discount purchase. Insured separately.' }, 'asset: Canon EOS R6')

  // legal_compliances: frequency 'once' → 'one-time'
  await ins('legal_compliances', { user_id: UID, item: 'Schengen Visa Application (France-Italy trip)', category: 'personal', frequency: 'one-time', last_done_at: null, next_due_at: '2026-08-10', is_done: false, applicable: true, notes: 'Apply 90 days before Oct 10 departure = July 12. Apply at French Embassy Tokyo. Both Yuki and Kenji.' }, 'compliance: Schengen visa')
  // Yuki habit logs were already inserted correctly (old script used count:1)
  console.log('  ✔  assets + compliance fixed (habit logs already correct)')
}

// ── NINA OKONKWO ──────────────────────────────────────────────────────────────
async function fixNina() {
  const UID = '0dc7d4d9-0dd3-41f2-a272-40f95c0a98b0'
  console.log('\n👤  Nina Okonkwo')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'Apple MacBook Pro 14" M2 Pro', type: 'other', brand: 'Apple', model: 'MacBook Pro 14-inch M2 Pro (2023)', purchased_at: '2023-08-15', warranty_until: '2024-08-15', cost: 2450000, notes: 'Primary work machine for Nino Advisory. Bloomberg data exports, Excel modelling, presentations.' }, 'asset: MacBook Pro M2')
  await ins('home_assets', { user_id: UID, name: 'Hisense 55" 4K ULED Smart TV', type: 'other', brand: 'Hisense', model: '55U6H ULED (2022)', purchased_at: '2022-11-20', warranty_until: '2024-11-20', cost: 380000, notes: 'Living area TV. Netflix, YouTube, Bloomberg TV, DSTV Compact Plus.' }, 'asset: Hisense TV')

  // business_expenses: invalid categories
  await ins('business_expenses', { user_id: UID, category: 'travel', vendor: 'Bolt / Uber', amount: 28000, occurred_at: '2026-04-30', currency: 'NGN', is_billable: false, description: 'April ride-hailing: VI office commute + client meetings in Surulere and Ajah' }, 'expense: Bolt/Uber')
  await ins('business_expenses', { user_id: UID, category: 'professional_fees', vendor: 'ICAN', amount: 35000, occurred_at: '2026-04-10', currency: 'NGN', is_billable: false, description: 'ICAN ACA annual practising certificate renewal fee — 2026' }, 'expense: ICAN renewal')
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Mama Cass / local canteens', amount: 60000, occurred_at: '2026-04-30', currency: 'NGN', is_billable: false, description: 'April business lunches at VI canteens during client review meetings' }, 'expense: lunches')

  // legal_deadlines: invalid types
  await ins('legal_deadlines', { user_id: UID, title: 'FIRS Personal Income Tax Return 2025 (Form A)', type: 'itr', due_date: '2026-03-31', currency: 'NGN', status: 'overdue', authority: 'Federal Inland Revenue Service (FIRS)', reference_no: 'TIN-2291044887', notes: 'PIT 2025 return overdue — consulting income must be self-assessed. Estimated tax ₦185,000.' }, 'deadline: FIRS PIT')
  await ins('legal_deadlines', { user_id: UID, title: 'FIRS Withholding Tax Remittance — Q2 2026', type: 'tds', due_date: '2026-07-21', currency: 'NGN', status: 'pending', authority: 'Federal Inland Revenue Service (FIRS)', reference_no: 'TIN-2291044887', notes: 'WHT on consulting fees: 5% on Q2 income ~₦438K = ₦21,900. Due July 21.' }, 'deadline: FIRS WHT')
  await ins('legal_deadlines', { user_id: UID, title: 'Lekki Phase 1 Studio Lease Renewal Negotiation', type: 'renewal', due_date: '2026-11-01', amount: 1400000, currency: 'NGN', status: 'pending', authority: 'Lagos Property Management Ltd', reference_no: 'LEASE-LK1-2024-117', notes: 'Start discussions by Nov 1. Target renew at ₦1.4M (0% increase) for 1 year.' }, 'deadline: Lekki lease')

  // legal_compliances: category 'professional' → 'other'
  await ins('legal_compliances', { user_id: UID, item: 'ICAN ACA Annual Practising Certificate', category: 'other', frequency: 'annual', last_done_at: '2026-01-15', next_due_at: '2026-12-31', is_done: false, applicable: true, notes: 'Paid ₦35K in January. Next renewal December 2026. Required for Nino Advisory consulting.' }, 'compliance: ICAN ACA')

  // habit logs
  const ho = {
    'Morning Devotion & Prayer 30 min': { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Gym Workout 5am':                  { co: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    'CFA Level 1 Study Block 2 hrs':    { co: [1,2,3,5,8,9,10,12,15,16,17,18,19] },
    'Financial Report Review 30 min':   { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20] },
    'Expense Tracking & Budget Log':    { co: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    'Sunday Church Service':            { co: [0,7,14] },
    'Gratitude Journaling 10 min':      { co: [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20] },
  }
  const n = await fixHabitLogs(UID, ho)
  console.log(`  ✔  ${n} habit logs`)
}

// ── ABDULLAH KHAN ─────────────────────────────────────────────────────────────
async function fixAbdullah() {
  const UID = '4c708502-97a4-494b-9611-ff3abb97903d'
  console.log('\n👤  Abdullah Khan')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'MacBook Pro 14" M3 Pro', type: 'other', brand: 'Apple', model: 'MacBook Pro 14" M3 Pro (2023)', purchased_at: '2023-11-20', warranty_until: '2025-11-20', cost: 425000, notes: 'Primary work machine. 18GB RAM / 512GB SSD.' }, 'asset: MacBook Pro M3')
  await ins('home_assets', { user_id: UID, name: 'Dell UltraSharp 27" 4K USB-C Monitor', type: 'other', brand: 'Dell', model: 'U2723QE', purchased_at: '2023-12-01', warranty_until: '2026-12-01', cost: 88000, notes: 'Primary external monitor. USB-C single-cable.' }, 'asset: Dell 4K Monitor')
  await ins('home_assets', { user_id: UID, name: 'Keychron K2 Pro Wireless Keyboard', type: 'other', brand: 'Keychron', model: 'K2 Pro QMK (Brown switches)', purchased_at: '2024-01-10', warranty_until: '2025-01-10', cost: 24000, notes: 'Hot-swappable switches, RGB. Home office primary keyboard.' }, 'asset: Keychron K2 Pro')
  await ins('home_assets', { user_id: UID, name: 'Sony WH-1000XM5 Headphones', type: 'other', brand: 'Sony', model: 'WH-1000XM5', purchased_at: '2024-03-20', warranty_until: '2025-03-20', cost: 68000, notes: 'ANC headphones for deep work and remote calls.' }, 'asset: Sony WH-1000XM5')

  // business_expenses: 'education'→'other', 'equipment'→'hardware'
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Udemy', amount: 7, occurred_at: '2026-04-05', currency: 'USD', is_billable: false, description: 'Stephane Maarek AWS SAA course ($7 on sale)' }, 'expense: Udemy')
  await ins('business_expenses', { user_id: UID, category: 'hardware', vendor: 'Shamsabad Electronics Lahore', amount: 85, occurred_at: '2026-03-15', currency: 'USD', is_billable: false, description: 'USB-C hub + laptop stand for home office ergonomics' }, 'expense: USB-C hub')

  // legal_deadlines: 'tax' → 'itr'
  await ins('legal_deadlines', { user_id: UID, title: 'FBR Income Tax Return 2025–26 (Pakistan)', type: 'itr', due_date: '2026-09-30', currency: 'PKR', status: 'pending', authority: 'Federal Board of Revenue (FBR)', reference_no: 'NTN-7281993-2', notes: 'File via Iris portal. RemoteFirst USD income + freelance. Requires active NTN.' }, 'deadline: FBR ITR')

  // habit logs
  const ho = {
    'Fajr Prayer + Quran 15 min':     { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Gym Workout 45 min':             { co: [1,2,4,5,8,9,10,11,12,15,16,17,18,19] },
    'Read Tech Article / Docs 20 min':{ co: [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20] },
    'Side Project Coding 1 hr':       { co: [1,2,4,5,8,9,11,12,15,16,17,19] },
    'Arabic Study 30 min (Duolingo)': { co: [1,2,3,4,8,9,10,11,15,16,18,19] },
    'No Screens After 11pm':          { co: [0,1,2,5,6,7,8,9,12,13,14,15,16,19,20] },
    'Sunday Family Dinner':           { co: [0,7,14] },
  }
  const n = await fixHabitLogs(UID, ho)
  console.log(`  ✔  ${n} habit logs`)
}

// ── EMMA WILSON ───────────────────────────────────────────────────────────────
async function fixEmma() {
  const UID = 'b414febc-3ef8-42a4-a24e-cec6b6a77349'
  console.log('\n👤  Emma Wilson')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'MacBook Air 13" M2', type: 'other', brand: 'Apple', model: 'MacBook Air M2 (2023, Midnight)', purchased_at: '2023-07-10', warranty_until: '2024-07-10', cost: 1849, notes: 'Primary work laptop. 8GB RAM / 256GB SSD.' }, 'asset: MacBook Air M2')
  await ins('home_assets', { user_id: UID, name: 'iPhone 15 Pro (Natural Titanium)', type: 'other', brand: 'Apple', model: 'iPhone 15 Pro 256GB', purchased_at: '2023-10-15', warranty_until: '2024-10-15', cost: 1699, notes: 'Primary phone — content creation for Bondi Surf Collective.' }, 'asset: iPhone 15 Pro')
  await ins('home_assets', { user_id: UID, name: 'Peloton Bike+ (2022)', type: 'other', brand: 'Peloton', model: 'Bike+ (2022)', purchased_at: '2022-03-20', warranty_until: '2024-03-20', cost: 3295, notes: 'Primary cardio equipment. Peloton All-Access membership $44/month.' }, 'asset: Peloton Bike+')
  await ins('home_assets', { user_id: UID, name: 'Samsung 55" QLED 4K TV', type: 'other', brand: 'Samsung', model: 'QN55Q70CAFXZA (2023)', purchased_at: '2022-12-26', warranty_until: '2024-12-26', cost: 1199, notes: 'Living room — Netflix, Disney+, Peloton screen mirroring.' }, 'asset: Samsung QLED')

  // business_expenses: 'education' → 'other'
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Google', amount: 0, occurred_at: '2026-03-15', currency: 'AUD', is_billable: false, description: 'Google Analytics 4 Certification — free, completed March 2026' }, 'expense: GA4 cert')

  // negotiation_templates: tone 'friendly' → 'polite'
  await ins('negotiation_templates', { user_id: UID, type: 'payment_terms', tone: 'polite', context: 'Following up on EW-2026-003 Bondi Surf invoice ($1,320 inc GST, due May 14)', script: `Hi [Name],\n\nJust a friendly follow-up on Invoice EW-2026-003 ($1,320 inc. GST) issued April 30, due May 14.\n\nHappy to resend if it got lost in the inbox! Let me know if there are any issues.\n\nThanks so much,\nEmma` }, 'template: EW payment follow-up')

  // legal_deadlines: 'tax' → 'itr'/'gst'
  await ins('legal_deadlines', { user_id: UID, title: 'ATO Individual Tax Return FY 2025–26', type: 'itr', due_date: '2026-10-31', currency: 'AUD', status: 'pending', authority: 'Australian Taxation Office', reference_no: 'TFN-488-271-993', notes: 'Lodge with registered tax agent by Oct 31. Includes Forge Digital salary + freelance.' }, 'deadline: ATO ITR')
  await ins('legal_deadlines', { user_id: UID, title: 'GST BAS Quarterly (Q4 FY2025–26)', type: 'gst', due_date: '2026-07-28', currency: 'AUD', status: 'pending', authority: 'Australian Taxation Office', notes: 'Q4 Apr–Jun 2026 BAS due Jul 28. Keep Xero records current.' }, 'deadline: BAS Q4')

  // habit logs
  const ho = {
    'Morning Beach Walk / Jog 4km':    { co: [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19] },
    'LinkedIn + Industry News 20 min': { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Gym Strength Session':            { co: [1,3,5,8,10,12,15,17,19] },
    'Read Marketing Book 20 Pages':    { co: [0,1,2,3,5,6,7,8,9,10,12,13,14,15,16,17,19,20] },
    'Monday Content Calendar Planning':{ co: [1,8,15] },
    'No Phone/Scroll After 9pm':       { co: [0,1,2,6,7,8,9,13,14,15,16,19,20] },
    'Sunday Outdoor Activity':         { co: [0,7,14] },
  }
  const n = await fixHabitLogs(UID, ho)
  console.log(`  ✔  ${n} habit logs`)
}

// ── SARAH JOHNSON ─────────────────────────────────────────────────────────────
async function fixSarah() {
  const UID = '071ddf35-3dfe-4c1a-af54-ea6d1d29ece1'
  console.log('\n👤  Sarah Johnson')

  // home_assets: type 'electronics' → 'other'
  await ins('home_assets', { user_id: UID, name: 'Samsung 65" 4K Smart TV (QLED)', type: 'other', brand: 'Samsung', model: 'QN65Q80CAFXZA', purchased_at: '2022-11-25', warranty_until: '2024-11-25', cost: 1100, notes: 'Living room — kids use for gaming and streaming.' }, 'asset: Samsung TV')
  await ins('home_assets', { user_id: UID, name: 'Ring Video Doorbell + Alarm System', type: 'other', brand: 'Ring', model: 'Video Doorbell Pro 2 + Alarm 5-piece', purchased_at: '2021-04-12', warranty_until: '2023-04-12', cost: 380, notes: 'Ring Protect Plus plan $20/month.' }, 'asset: Ring Security')

  // business_expenses: all 4 had invalid categories
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Dansko', amount: 149, occurred_at: '2026-03-10', currency: 'USD', is_billable: false, description: 'Dansko XP 2.0 professional nursing clogs — required ICU footwear' }, 'expense: Dansko clogs')
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'AACN', amount: 75, occurred_at: '2026-04-01', currency: 'USD', is_billable: false, description: 'AACN membership annual renewal — includes CE access' }, 'expense: AACN membership')
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Amazon', amount: 88, occurred_at: '2026-02-20', currency: 'USD', is_billable: false, description: "CCRN exam prep book (Barron's) + practice question flashcards" }, 'expense: CCRN prep')
  await ins('business_expenses', { user_id: UID, category: 'other', vendor: 'Figs', amount: 112, occurred_at: '2026-01-15', currency: 'USD', is_billable: false, description: '2 sets nursing scrubs (Catarina) for ICU rotation' }, 'expense: Figs scrubs')

  // legal_deadlines: 'tax' → 'advance_tax' (IRS quarterly estimated payment)
  await ins('legal_deadlines', { user_id: UID, title: 'IRS Estimated Taxes Q2 2026 (1099 Income)', type: 'advance_tax', due_date: '2026-06-15', amount: 420, currency: 'USD', status: 'pending', authority: 'Internal Revenue Service', notes: 'Self-employment tax on ~$7,000 consulting income. ~15.3% SE tax + income tax.' }, 'deadline: IRS Q2 estimated')

  // habit logs
  const ho = {
    'Morning Walk 30 min':          { co: [0,1,2,3,5,6,7,8,9,11,12,13,14,15,17,18,19,20] },
    'Take Vitamins + Meds':         { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Read Nursing CE Article 20 min':{ co: [1,2,4,5,8,9,11,12,15,16,17,19] },
    'Drink 64oz Water':             { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    'Family Meal Prep (Weekend)':   { co: [0,6,7,13,14,20] },
    'Date Night with Tom (Fri)':    { co: [5,12] },
    '10,000 Steps Daily':           { co: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20] },
  }
  const n = await fixHabitLogs(UID, ho)
  console.log(`  ✔  ${n} habit logs`)
}

async function main() {
  console.log('\n🔧  Running fixup for all personas...')
  await fixRajesh()
  await fixCarlos()
  await fixYuki()
  await fixNina()
  await fixAbdullah()
  await fixEmma()
  await fixSarah()
  console.log('\n✅  Fixup complete.\n')
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
