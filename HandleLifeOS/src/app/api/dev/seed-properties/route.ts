import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/client'

// Dev-only endpoint — seeds realistic Indian property data for manual QA
export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true')
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const db = getSupabaseAdmin()
  const uid = session.user.id

  const today = new Date()
  const d = (offsetDays: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + offsetDays)
    return dt.toISOString().slice(0, 10)
  }
  const m = (offsetMonths: number) => {
    const dt = new Date(today)
    dt.setMonth(dt.getMonth() + offsetMonths)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
  }

  // ─── Property 1: Primary residence in Koramangala, Bangalore ─────────────────
  const { data: p1, error: e1 } = await db
    .from('properties')
    .insert({
      user_id: uid,
      name: 'Embassy Springs, Koramangala',
      type: 'primary_residence',
      status: 'owned',
      address: 'Flat 4B, Embassy Springs, 3rd Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560034',
      purchase_date: '2019-03-15',
      purchase_value: 8500000,
      current_value: 11000000,
      built_up_area: 1450,
      carpet_area: 1180,
      area_unit: 'sqft',
      ownership_type: 'sole',
      society_name: 'Embassy Springs Owners Association',
      registration_no: 'BNG/KOR/2019/04521',
      property_tax_no: 'BBMP/2019/KOR/00892',
      notes: 'South-facing 3BHK. Society maintenance ₹4,500/month. Parking slot B-12.',
    })
    .select('id')
    .single()

  if (e1 || !p1) return NextResponse.json({ error: 'Failed to create property 1', detail: e1?.message }, { status: 500 })
  const prop1 = p1.id

  // ─── Property 2: Investment apartment in Baner, Pune ─────────────────────────
  const { data: p2, error: e2 } = await db
    .from('properties')
    .insert({
      user_id: uid,
      name: 'Baner Heights, Pune',
      type: 'apartment',
      status: 'rented_out',
      address: 'Flat 702, Baner Heights, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411045',
      purchase_date: '2021-08-20',
      purchase_value: 5500000,
      current_value: 6800000,
      built_up_area: 980,
      carpet_area: 790,
      area_unit: 'sqft',
      ownership_type: 'joint',
      co_owners: 'Sneha Rao (50%)',
      society_name: 'Baner Heights Cooperative Housing Society',
      registration_no: 'PUN/BNR/2021/07341',
      property_tax_no: 'PMC/2021/BNR/03317',
      notes: 'East-facing 2BHK. Joint with sister. Rental income shared 70/30 per agreement.',
    })
    .select('id')
    .single()

  if (e2 || !p2) return NextResponse.json({ error: 'Failed to create property 2', detail: e2?.message }, { status: 500 })
  const prop2 = p2.id

  // ─── Maintenance tasks ────────────────────────────────────────────────────────

  await db.from('home_maintenance').insert([
    // Property 1 — overdue tasks
    {
      user_id: uid, property_id: prop1,
      title: 'AC filter cleaning (split units)',
      category: 'hvac',
      recurrence_months: 3,
      last_done_at: d(-120),
      next_due_at: d(-30),
      vendor: 'CoolCare Services',
      cost: 800,
      notes: 'All 3 split ACs — bedroom, living room, master. Call Ramesh: 9845012345',
      is_active: true,
    },
    {
      user_id: uid, property_id: prop1,
      title: 'Society water tank cleaning',
      category: 'plumbing',
      recurrence_months: 6,
      last_done_at: d(-210),
      next_due_at: d(-10),
      vendor: 'PureFlow Solutions',
      cost: 1500,
      notes: 'Coordinate with society secretary. Required before monsoon.',
      is_active: true,
    },
    // Property 1 — upcoming tasks
    {
      user_id: uid, property_id: prop1,
      title: 'Annual fire extinguisher inspection',
      category: 'other',
      recurrence_months: 12,
      last_done_at: d(-340),
      next_due_at: d(25),
      vendor: 'SafeGuard Fire Services',
      cost: 600,
      is_active: true,
    },
    {
      user_id: uid, property_id: prop1,
      title: 'Exterior window cleaning (monsoon prep)',
      category: 'other',
      recurrence_months: 6,
      last_done_at: d(-180),
      next_due_at: d(45),
      vendor: 'CleanView Exterior Services',
      cost: 2500,
      is_active: true,
    },
    // Property 2 — overdue (absentee owner challenges)
    {
      user_id: uid, property_id: prop2,
      title: 'Inverter battery water top-up',
      category: 'electrical',
      recurrence_months: 2,
      last_done_at: d(-90),
      next_due_at: d(-10),
      vendor: 'Luminous Service Center',
      cost: 200,
      notes: 'Tenant can do this — ask Priya. Battery model: Luminous RC18000.',
      is_active: true,
    },
    {
      user_id: uid, property_id: prop2,
      title: 'Kitchen exhaust fan cleaning',
      category: 'appliance',
      recurrence_months: 4,
      last_done_at: d(-160),
      next_due_at: d(15),
      vendor: 'Pronto Appliance Care',
      cost: 350,
      is_active: true,
    },
  ])

  // ─── Issues ───────────────────────────────────────────────────────────────────

  await db.from('property_issues').insert([
    {
      user_id: uid, property_id: prop1,
      title: 'Bathroom ceiling seepage — master bedroom',
      description: 'Water seeping through ceiling slab near bathroom. Stain spreading ~30cm. Neighbour flat above also affected.',
      category: 'waterproofing',
      priority: 'emergency',
      status: 'in_progress',
      vendor_name: 'Suresh Waterproofing Works',
      vendor_phone: '9900123456',
      estimated_cost: 18000,
      reported_at: d(-8),
      notes: 'Society has to approve terrace work. Follow up with secretary Gopal by EOD.',
    },
    {
      user_id: uid, property_id: prop1,
      title: 'Living room false ceiling crack',
      description: 'Hair-line crack in gypsum false ceiling near AC duct. Not urgent but should fix before monsoon.',
      category: 'structural',
      priority: 'medium',
      status: 'open',
      estimated_cost: 4000,
      reported_at: d(-20),
    },
    {
      user_id: uid, property_id: prop1,
      title: 'Main door deadbolt stiff — needs lubrication',
      description: 'Deadbolt mechanism stiff, requires 2-hand operation. Possible misalignment after monsoon swelling.',
      category: 'security',
      priority: 'low',
      status: 'open',
      vendor_name: 'Quick Fix Hardware',
      estimated_cost: 500,
      reported_at: d(-5),
    },
    {
      user_id: uid, property_id: prop2,
      title: 'Kitchen tap leaking — cold water line',
      description: 'Tenant Priya reported slow drip from kitchen tap. Washer needs replacement.',
      category: 'plumbing',
      priority: 'medium',
      status: 'open',
      vendor_name: 'Handy Plumber — Baner',
      vendor_phone: '9823456789',
      estimated_cost: 800,
      reported_at: d(-3),
      notes: 'Tenant available on weekends. Coordinate via WhatsApp.',
    },
    {
      user_id: uid, property_id: prop2,
      title: 'Society car park CCTV blind spot',
      description: 'Slot 22 (assigned) has no camera coverage. Reported to society committee.',
      category: 'security',
      priority: 'low',
      status: 'resolved',
      vendor_name: 'Society Committee',
      reported_at: d(-45),
      resolved_at: d(-10),
      notes: 'Committee agreed to add camera in next budget cycle.',
    },
  ])

  // ─── Emergency contacts ───────────────────────────────────────────────────────

  await db.from('property_emergency_contacts').insert([
    { user_id: uid, property_id: prop1, label: 'Society Electrician', name: 'Mohan Kumar', phone: '9845098765', category: 'electrician' },
    { user_id: uid, property_id: prop1, label: 'Society Plumber', name: 'Raju Nair', phone: '9867043210', category: 'plumber' },
    { user_id: uid, property_id: prop1, label: 'Security Desk (Night)', phone: '08041001200', category: 'security', notes: '24×7 landline' },
    { user_id: uid, property_id: prop1, label: 'Home Insurance — HDFC ERGO', phone: '18002700700', category: 'insurance', notes: 'Policy HIN24567890' },
    { user_id: uid, property_id: prop2, label: 'Caretaker — Baner', name: 'Santosh More', phone: '9765432100', category: 'caretaker', notes: 'Lives in ground floor flat' },
    { user_id: uid, property_id: prop2, label: 'PMC Water Helpline', phone: '020-25506800', category: 'water' },
  ])

  // ─── Property documents ───────────────────────────────────────────────────────
  // (no real file uploads; rows only — storage_path points to placeholder paths)

  const tomorrow = d(1)
  await db.from('property_documents').insert([
    // Property 1 — critical docs present
    {
      user_id: uid, property_id: prop1,
      name: 'Sale Deed — Koramangala Flat',
      category: 'sale_deed',
      storage_path: `${uid}/prop1-sale-deed.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 2457600,
      notes: 'Registered at SRO Koramangala, BK-II. Original with HDFC Home Loans.',
    },
    {
      user_id: uid, property_id: prop1,
      name: 'HDFC Home Loan Agreement',
      category: 'loan_agreement',
      storage_path: `${uid}/prop1-loan-agreement.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 1843200,
      notes: 'Loan A/c: 7654321. Outstanding ~₹28L. EMI: ₹42,000/month.',
    },
    {
      user_id: uid, property_id: prop1,
      name: 'Home Insurance — HDFC ERGO',
      category: 'insurance',
      storage_path: `${uid}/prop1-insurance.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 512000,
      expires_at: d(45),  // expiring in 45 days — triggers insight
      notes: 'Structure + contents. Renew before expiry. Premium ~₹8,200/year.',
    },
    {
      user_id: uid, property_id: prop1,
      name: 'BBMP Property Tax Receipt 2024–25',
      category: 'tax_receipt',
      storage_path: `${uid}/prop1-tax-receipt.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 204800,
      expires_at: d(320),
    },
    // Property 2 — missing sale_deed intentionally (triggers insight)
    {
      user_id: uid, property_id: prop2,
      name: 'Agreement to Sale — Baner Heights',
      category: 'agreement_to_sale',
      storage_path: `${uid}/prop2-agr-to-sale.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 1638400,
    },
    {
      user_id: uid, property_id: prop2,
      name: 'Rental Agreement — Priya Mehta 2023',
      category: 'lease',
      storage_path: `${uid}/prop2-lease-priya.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 768000,
      expires_at: d(29),  // same as lease_end
    },
    {
      user_id: uid, property_id: prop2,
      name: 'Property Insurance — New India Assurance',
      category: 'insurance',
      storage_path: `${uid}/prop2-insurance.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 409600,
      expires_at: d(55),  // also expiring soon
    },
  ])

  // ─── Finance transactions ─────────────────────────────────────────────────────

  await db.from('property_transactions').insert([
    // Property 1 — owner-occupied: expenses exceed income (realistic)
    { user_id: uid, property_id: prop1, type: 'expense', category: 'loan_emi', amount: 42000, description: 'HDFC Home Loan EMI — April 2026', transaction_date: d(-47), notes: 'Auto-debit from SB A/c' },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'loan_emi', amount: 42000, description: 'HDFC Home Loan EMI — May 2026', transaction_date: d(-17), notes: 'Auto-debit from SB A/c' },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'society_charges', amount: 4500, description: 'Society maintenance — April 2026', transaction_date: d(-47) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'society_charges', amount: 4500, description: 'Society maintenance — May 2026', transaction_date: d(-17) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'property_tax', amount: 12400, description: 'BBMP property tax 2025–26', transaction_date: d(-60) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'insurance_premium', amount: 8200, description: 'HDFC ERGO home insurance renewal', transaction_date: d(-300) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'maintenance_cost', amount: 6800, description: 'False ceiling repair + painting touch-up', transaction_date: d(-90) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'utility', amount: 3200, description: 'Electricity bill — BESCOM April 2026', transaction_date: d(-40) },
    { user_id: uid, property_id: prop1, type: 'expense', category: 'utility', amount: 2900, description: 'Electricity bill — BESCOM March 2026', transaction_date: d(-70) },

    // Property 2 — rented out: positive P&L
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 22000, description: 'Rent from Priya Mehta — May 2026', transaction_date: d(-3) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 22000, description: 'Rent from Priya Mehta — April 2026', transaction_date: d(-33) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 22000, description: 'Rent from Priya Mehta — March 2026', transaction_date: d(-63) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 22000, description: 'Rent from Priya Mehta — February 2026', transaction_date: d(-93) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 20000, description: 'Rent from Priya Mehta — January 2026', transaction_date: d(-123) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'rent', amount: 20000, description: 'Rent from Priya Mehta — December 2025', transaction_date: d(-153) },
    { user_id: uid, property_id: prop2, type: 'income', category: 'deposit_received', amount: 66000, description: 'Security deposit (3 months) — Priya Mehta move-in', transaction_date: d(-185) },
    { user_id: uid, property_id: prop2, type: 'expense', category: 'society_charges', amount: 3200, description: 'Society maintenance — May 2026', transaction_date: d(-15) },
    { user_id: uid, property_id: prop2, type: 'expense', category: 'society_charges', amount: 3200, description: 'Society maintenance — April 2026', transaction_date: d(-45) },
    { user_id: uid, property_id: prop2, type: 'expense', category: 'property_tax', amount: 9800, description: 'PMC property tax 2025–26', transaction_date: d(-80) },
    { user_id: uid, property_id: prop2, type: 'expense', category: 'brokerage', amount: 22000, description: 'Agent fee — tenant placement (Priya Mehta)', transaction_date: d(-185) },
    { user_id: uid, property_id: prop2, type: 'expense', category: 'maintenance_cost', amount: 4200, description: 'Kitchen tap + geyser repair before tenant move-in', transaction_date: d(-190) },
  ])

  // ─── Tenants ─────────────────────────────────────────────────────────────────

  const { data: t1, error: te1 } = await db
    .from('property_tenants')
    .insert({
      user_id: uid,
      property_id: prop2,
      name: 'Priya Mehta',
      phone: '9876543210',
      email: 'priya.mehta@gmail.com',
      id_type: 'aadhaar',
      id_number: '****-****-4521',
      lease_start: d(-185),
      lease_end: d(29),     // expiring in 29 days — triggers insight
      monthly_rent: 22000,
      deposit_amount: 66000,
      deposit_status: 'held',
      status: 'notice',
      notes: 'Works at Infosys BTP. Served 30-day notice on 17 May. Looking for replacement tenant.',
    })
    .select('id')
    .single()

  if (te1 || !t1) return NextResponse.json({ error: 'Failed to create tenant', detail: te1?.message }, { status: 500 })
  const tenantId = t1.id

  // ─── Rent payment records ─────────────────────────────────────────────────────

  await db.from('property_rent_payments').insert([
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 22000, month: m(-1), paid_on: d(-3), notes: 'UPI transfer — GPay' },
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 22000, month: m(-2), paid_on: d(-33) },
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 22000, month: m(-3), paid_on: d(-63) },
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 22000, month: m(-4), paid_on: d(-93) },
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 20000, month: m(-5), paid_on: d(-123) },
    { user_id: uid, property_id: prop2, tenant_id: tenantId, amount: 20000, month: m(-6), paid_on: d(-153) },
  ])

  // ─── Home assets linked to properties ────────────────────────────────────────

  await db.from('home_assets').insert([
    {
      user_id: uid, property_id: prop1,
      name: 'Daikin 1.5T Split AC — Living Room',
      type: 'appliance',
      brand: 'Daikin', model: 'FTKF50TV16U',
      purchased_at: '2019-03-15',
      warranty_until: d(30),   // warranty expiring in 30 days!
      cost: 42000,
      notes: 'Invoice in Documents. Warranty: Daikin India 1800-108-9333',
    },
    {
      user_id: uid, property_id: prop1,
      name: 'Bosch 600L Side-by-Side Refrigerator',
      type: 'appliance',
      brand: 'Bosch', model: 'KAD93VIFP',
      purchased_at: '2020-06-12',
      warranty_until: '2023-06-12',
      cost: 89000,
    },
    {
      user_id: uid, property_id: prop1,
      name: 'Luminous 2kVA Inverter + 150Ah Battery',
      type: 'appliance',
      brand: 'Luminous', model: 'Eco Volt Neo 1650 + RC18000',
      purchased_at: '2021-11-05',
      warranty_until: '2023-11-05',
      cost: 18500,
    },
    {
      user_id: uid, property_id: prop2,
      name: 'Lloyd 1T Split AC — Bedroom',
      type: 'appliance',
      brand: 'Lloyd', model: 'GLS12I5FWGEV',
      purchased_at: '2021-08-25',
      warranty_until: '2023-08-25',
      cost: 32000,
      notes: 'Tenant requested replacement at lease renewal.',
    },
  ])

  // ─── Utility bills linked to properties ──────────────────────────────────────

  await db.from('utility_bills').insert([
    {
      user_id: uid, property_id: prop1,
      utility: 'electricity', provider: 'BESCOM',
      amount: 3200, bill_date: d(-40), due_date: d(-25),
      is_paid: true, account_no: 'KOR-220345-01',
    },
    {
      user_id: uid, property_id: prop1,
      utility: 'electricity', provider: 'BESCOM',
      amount: 2900, bill_date: d(-70), due_date: d(-55),
      is_paid: true, account_no: 'KOR-220345-01',
    },
    {
      user_id: uid, property_id: prop1,
      utility: 'internet', provider: 'ACT Fibernet',
      amount: 1199, bill_date: d(-15), due_date: d(-5),
      is_paid: true, account_no: 'ACT-BLR-773241',
      notes: '300 Mbps plan — Titanium',
    },
    {
      user_id: uid, property_id: prop1,
      utility: 'internet', provider: 'ACT Fibernet',
      amount: 1199, bill_date: d(15), due_date: d(25),
      is_paid: false, account_no: 'ACT-BLR-773241',
    },
  ])

  return NextResponse.json({
    ok: true,
    properties: [
      { id: prop1, name: 'Embassy Springs, Koramangala', city: 'Bengaluru' },
      { id: prop2, name: 'Baner Heights, Pune', city: 'Pune' },
    ],
    summary: {
      maintenanceTasks: 6,
      issues: 5,
      emergencyContacts: 6,
      documents: 7,
      transactions: 21,
      tenants: 1,
      rentPayments: 6,
      assets: 4,
      utilityBills: 4,
    },
  })
}
