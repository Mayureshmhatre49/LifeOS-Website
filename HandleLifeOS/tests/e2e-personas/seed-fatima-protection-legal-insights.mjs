/**
 * Seeds protection (scam checks, quotes, negotiation templates),
 * legal (deadlines, documents, compliances), and insights (daily briefings)
 * data for Fatima Al-Rashid.
 *
 * Run:
 *   node tests/e2e-personas/seed-fatima-protection-legal-insights.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = '899098ae-2f59-4c02-983c-1b84fefa875d'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function hash(text) {
  return createHash('sha256').update(text).digest('hex')
}

function ok(label, error) {
  if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false }
  console.log(`  ✔  ${label}`)
  return true
}

// ── PROTECTION ────────────────────────────────────────────────────────────────

async function seedProtection() {
  console.log('\n🛡️   Seeding protection data...')

  // ── risk_checks ────────────────────────────────────────────────────────────
  const checks = [
    {
      type: 'scam',
      title: 'Fake Job Offer — WhatsApp recruiter',
      content: 'Hello, we are a UAE-based medical consultancy. We found your profile on LinkedIn. We offer AED 35,000 per month for a remote Health Advisory Director role. You only need to pay AED 800 registration fee to proceed.',
      risk_level: 'high',
      result_summary: 'This is almost certainly a job scam. Legitimate employers never charge registration fees. The unsolicited contact via WhatsApp, the unusually high salary, and the upfront fee demand are all classic scam signals commonly seen in the UAE job market.',
      red_flags: [
        'Unsolicited job offer via WhatsApp with no prior contact',
        'Requests upfront "registration fee" of AED 800',
        'No verifiable company name, address, or LinkedIn presence',
        'Salary offer significantly above market rate',
      ],
      safe_next_step: 'Do not pay any fee. Block the sender. Report to UAE Ministry of Human Resources & Emiratisation (mohre.gov.ae).',
    },
    {
      type: 'contract',
      title: 'NMC Health Consulting Agreement Review',
      content: 'This Consulting Agreement is entered into between NMC Healthcare LLC (Client) and AlRashid Health Advisory (Consultant). Payment: invoices shall be settled within 60-90 business days of receipt. Intellectual Property: All deliverables, reports, analyses, and work products created under this Agreement shall become the sole property of the Client upon payment.',
      risk_level: 'medium',
      result_summary: 'The contract has two significant concerns: (1) 60–90 business day payment terms are unusually long and create cash-flow risk. Standard consulting terms are 30 days. (2) The IP clause assigns all work products to the client, including potentially reusable methodologies and frameworks developed by the consultant.',
      red_flags: [
        'Payment terms of 60–90 business days are 2–3× longer than industry standard',
        'Broad IP assignment clause includes pre-existing methodologies',
        'No late payment interest clause to protect the consultant',
        'No termination notice period specified',
      ],
      safe_next_step: 'Negotiate payment terms down to net-30. Add an IP carve-out for pre-existing tools and frameworks. Request a 14-day termination notice clause.',
    },
    {
      type: 'subscription',
      title: 'Fitness First Gym Membership — Auto-Renewal Clause',
      content: 'Your Fitness First UAE membership automatically renews for 12 months at the prevailing rate unless you provide written notice of cancellation no less than 60 days before the renewal date. No refunds are available for unused months after the renewal period commences.',
      risk_level: 'medium',
      result_summary: 'The auto-renewal terms are heavily one-sided. The 60-day written notice requirement is unusual for a gym membership and easy to miss. The zero-refund policy for unused months after renewal is a financial risk if circumstances change.',
      red_flags: [
        'Auto-renews for full 12-month term without active confirmation',
        '60-day written notice required to cancel — high friction',
        'No refund for unused months after renewal',
        'No mention of price-lock guarantee — rate may increase',
      ],
      safe_next_step: 'Set a calendar reminder 75 days before your renewal date. Submit written cancellation via email and request a read receipt to document it.',
    },
    {
      type: 'quote',
      title: 'Car Insurance Renewal — Toyota Fortuner (Oman Insurance)',
      content: 'Oman Insurance Co. — Comprehensive Motor Policy. Vehicle: Toyota Fortuner 2020. Sum Insured: AED 95,000. Premium: AED 2,800/year. Covers: Own damage, third-party liability (AED 3.5M), roadside assistance, agency repair for 3 years.',
      risk_level: 'low',
      result_summary: 'This is a fair and competitive quote for a 2020 Toyota Fortuner in Dubai. The premium of AED 2,800 (approximately 2.9% of insured value) is within the typical market range of 2.5%–3.2% for this vehicle class. Agency repair coverage for 3 years is a strong benefit.',
      red_flags: [],
      safe_next_step: 'Compare with AXA and RSA Insurance for similar coverage. If you retain Oman Insurance, confirm that roadside assistance covers Sharjah and Abu Dhabi routes.',
    },
    {
      type: 'scam',
      title: 'DEWA Account Suspension Phishing SMS',
      content: 'DEWA: Your electricity account has been suspended due to non-payment. To avoid disconnection within 24 hours, click here: https://dewa-ae-pay.com/urgent and update your payment. Ref: DEW-882245.',
      risk_level: 'high',
      result_summary: 'This is a phishing attempt impersonating DEWA (Dubai Electricity & Water Authority). The link points to a fake domain (dewa-ae-pay.com) that is not the official dewa.gov.ae. The urgency language and 24-hour threat are classic social engineering pressure tactics.',
      red_flags: [
        'Link domain is "dewa-ae-pay.com" — not the official dewa.gov.ae',
        'Urgency pressure: "24-hour disconnection" threat',
        'Requests payment on an unofficial website',
        'DEWA does not send payment links via SMS — they use their official app and website only',
      ],
      safe_next_step: 'Do not click the link. Check your actual DEWA account at dewa.gov.ae or the DEWA app. Report the phishing SMS to UAE CERT: aecert.ae.',
    },
    {
      type: 'decision',
      title: 'NMC Health Retainer vs Project Rate Decision',
      content: 'I have an opportunity to move from a project-based arrangement with NMC Health (AED 28,000 per project, approximately 5 months) to a monthly retainer of AED 8,500/month for 12 months. Should I take the retainer?',
      risk_level: 'low',
      result_summary: 'The monthly retainer (AED 8,500 × 12 = AED 102,000/year) provides meaningful income stability versus the variable project model. However, at AED 8,500/month you are earning less per engagement-hour than your current rate. The key question is whether the security is worth the effective rate reduction.',
      red_flags: [
        'Retainer rate implies lower effective hourly rate than current project pricing',
        'Full-year lock-in limits flexibility to take higher-value clients',
      ],
      safe_next_step: 'Counter-propose AED 10,500/month retainer (matching your effective project rate) with a 6-month initial term, then annual renewal.',
    },
  ]

  let checkCount = 0
  for (const c of checks) {
    const { error } = await db.from('risk_checks').insert({
      user_id:        UID,
      type:           c.type,
      title:          c.title,
      input_hash:     hash(c.content),
      risk_level:     c.risk_level,
      result_summary: c.result_summary,
      red_flags:      c.red_flags ?? [],
      safe_next_step: c.safe_next_step ?? null,
    })
    if (!error) checkCount++
    else console.log(`  ✗  risk_check "${c.title}": ${error.message}`)
  }
  console.log(`  ✔  ${checkCount}/${checks.length} risk checks`)

  // ── saved_quotes ───────────────────────────────────────────────────────────
  const quotes = [
    {
      title: 'Car Insurance Renewal 2026 — Toyota Fortuner (Oman Insurance)',
      amount: 2800, currency: 'AED', category: 'insurance', region: 'Dubai, UAE',
      result_summary: 'Comprehensive cover at AED 2,800/year — competitive for a 2020 Fortuner. Includes agency repair for 3 years and AED 3.5M third-party liability.',
      risk_level: 'low',
      negotiation_script: 'I have received quotes from AXA and RSA. I value our relationship with Oman Insurance, but I would need the premium at AED 2,600 with the same agency repair terms to renew. Can you match that?',
    },
    {
      title: 'Annual AC Maintenance Contract — CoolTech (2 units)',
      amount: 700, currency: 'AED', category: 'home_service', region: 'JLT, Dubai',
      result_summary: 'AED 700 for annual service of 2 split AC units is fair market rate for JLT. Includes cleaning, gas top-up check, and filter replacement.',
      risk_level: 'low',
      negotiation_script: 'I have used CoolTech for three years. I am happy to continue, but the neighbouring building uses a similar service for AED 600. Can you offer AED 620 for two units with a priority booking guarantee?',
    },
  ]

  let quoteCount = 0
  for (const q of quotes) {
    const { error } = await db.from('saved_quotes').insert({ user_id: UID, ...q })
    if (!error) quoteCount++
    else console.log(`  ✗  saved_quote "${q.title}": ${error.message}`)
  }
  console.log(`  ✔  ${quoteCount}/${quotes.length} saved quotes`)

  // ── negotiation_templates ──────────────────────────────────────────────────
  const templates = [
    {
      type: 'rate_increase',
      tone: 'professional',
      context: 'Requesting a 15% rate increase from Al Rafah Medical Centre for Phase 3 engagement starting August 2026',
      script: `Subject: Proposed Rate Adjustment for Phase 3 — AlRashid Health Advisory

Dear [Client Name],

Thank you for the positive feedback on Phase 2 of the Patient Journey Optimisation engagement. I am glad the work has delivered measurable improvements in clinic throughput.

As we discuss Phase 3, I want to be transparent about a modest rate adjustment. Given the scope expansion, the sustained impact we have delivered together, and the 18 months of institutional knowledge I have built within your organisation, I am proposing a 15% adjustment to AED 11,500/month.

This keeps our engagement well within the market rate for senior healthcare consultants in the UAE, and I am confident the ROI will continue to justify the investment.

I am happy to discuss further and look forward to continuing our partnership.

Warm regards,
Fatima Al-Rashid
AlRashid Health Advisory`,
    },
    {
      type: 'payment_terms',
      tone: 'firm',
      context: 'Requesting payment terms shortened from 90 days to 30 days in NMC Health consulting agreement',
      script: `Dear [Procurement Team],

Thank you for sending through the draft consulting agreement. I have reviewed the terms and I am excited about the engagement.

I do need to flag one item before signing: the proposed 60–90 business day payment terms create a significant working capital challenge for an independent consultancy. As a comparison, standard UAE commercial practice for professional services is net-30 days.

I am proposing net-30 from invoice date, with a 1.5% monthly late payment fee for overdue invoices. This is standard across my engagements with Al Rafah Medical Centre and other regional clients.

I am confident we can align on this. Please confirm and I will countersign the revised agreement promptly.

Best regards,
Fatima Al-Rashid`,
    },
  ]

  let templCount = 0
  for (const t of templates) {
    const { error } = await db.from('negotiation_templates').insert({ user_id: UID, ...t })
    if (!error) templCount++
    else console.log(`  ✗  negotiation_template "${t.type}": ${error.message}`)
  }
  console.log(`  ✔  ${templCount}/${templates.length} negotiation templates`)
}

// ── LEGAL ─────────────────────────────────────────────────────────────────────

async function seedLegal() {
  console.log('\n⚖️   Seeding legal data...')

  // ── legal_deadlines ────────────────────────────────────────────────────────
  const deadlines = [
    {
      title: 'VAT Return Q1 2026 (Jan–Mar)',
      type: 'other',
      due_date: '2026-04-28',
      amount: null, currency: 'AED',
      status: 'filed',
      authority: 'Federal Tax Authority (FTA)',
      reference_no: 'FTA-VAT-Q1-2026',
      notes: 'AlRashid Health Advisory — quarterly VAT return. Filed on time.',
    },
    {
      title: 'VAT Return Q2 2026 (Apr–Jun)',
      type: 'other',
      due_date: '2026-07-28',
      amount: null, currency: 'AED',
      status: 'pending',
      authority: 'Federal Tax Authority (FTA)',
      reference_no: null,
      notes: 'Due 28 July 2026. Prepare with accountant by mid-July.',
    },
    {
      title: 'Trade Licence Renewal — AlRashid Health Advisory',
      type: 'renewal',
      due_date: '2026-07-15',
      amount: 1500, currency: 'AED',
      status: 'pending',
      authority: 'Dubai Department of Economic Development (DED)',
      reference_no: 'DED-2023-887654',
      notes: 'Annual trade licence renewal for sole-proprietorship. Apply 30 days before expiry.',
    },
    {
      title: 'Vehicle Registration Renewal — Toyota Fortuner',
      type: 'renewal',
      due_date: '2026-11-01',
      amount: 420, currency: 'AED',
      status: 'pending',
      authority: 'Roads and Transport Authority (RTA), Dubai',
      reference_no: 'RTA-P19244',
      notes: 'Annual Mulkiya renewal. Book vehicle inspection at least 2 weeks prior.',
    },
    {
      title: 'Health Insurance Renewal — Family Plan',
      type: 'renewal',
      due_date: '2026-08-31',
      amount: 3800, currency: 'AED',
      status: 'pending',
      authority: 'Al Buhaira National Insurance / DHA',
      reference_no: 'ABNIC-FAM-20244481',
      notes: 'Covers Fatima, Ahmed, Layla, Omar. Mandatory under Dubai Health Authority (DHA) requirements.',
    },
    {
      title: 'DHA Healthcare Consultant Licence Renewal',
      type: 'renewal',
      due_date: '2027-01-10',
      amount: 850, currency: 'AED',
      status: 'pending',
      authority: 'Dubai Health Authority (DHA)',
      reference_no: 'DHA-HC-2024-44519',
      notes: 'Professional licence for healthcare consulting practice in Dubai. CME hours must be completed before renewal.',
    },
  ]

  let dlCount = 0
  for (const d of deadlines) {
    const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d })
    if (!error) dlCount++
    else console.log(`  ✗  deadline "${d.title}": ${error.message}`)
  }
  console.log(`  ✔  ${dlCount}/${deadlines.length} legal deadlines`)

  // ── legal_documents ────────────────────────────────────────────────────────
  const documents = [
    {
      name: 'NMC Health Consulting Agreement — March 2026',
      doc_type: 'contract',
      original_text: `CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is entered into as of 1 March 2026 between:
CLIENT: NMC Healthcare LLC, a company registered in the UAE (Trade Licence No. DED-2001-112233), with registered offices at Al Nahda, Dubai ("Client").
CONSULTANT: AlRashid Health Advisory, sole proprietorship registered in Dubai (Trade Licence No. DED-2023-887654), represented by Ms. Fatima Al-Rashid ("Consultant").

1. SCOPE OF WORK
The Consultant shall provide clinical workflow audit services as detailed in Appendix A (Statement of Work).

2. TERM
This Agreement commences 1 March 2026 and terminates 28 February 2027 unless earlier terminated.

3. FEES AND PAYMENT
The Client shall pay the Consultant a monthly retainer of AED 8,500. Invoices shall be settled within 60-90 business days of receipt.

4. INTELLECTUAL PROPERTY
All deliverables, reports, analyses, and work products created under this Agreement shall become the sole property of the Client upon payment.

5. CONFIDENTIALITY
The Consultant agrees to maintain strict confidentiality regarding all client information and patient data encountered during the engagement.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the UAE and the emirate of Dubai.`,
      summary_md: `## NMC Health Consulting Agreement — Summary

**What this is:** A 12-month consulting retainer agreement between AlRashid Health Advisory (you) and NMC Healthcare LLC for clinical workflow audit services at AED 8,500/month.

**Key terms:**
- Start: 1 March 2026 | End: 28 February 2027
- Monthly fee: **AED 8,500** (paid within 60–90 business days of invoice)
- All work products become NMC's property upon payment

**Plain English:** You are hired as a healthcare consultant for 12 months. NMC owns everything you produce. They can take up to 3 months to pay each invoice.`,
      key_points: [
        'Monthly retainer of AED 8,500 for 12-month term (Mar 2026 – Feb 2027)',
        'Payment terms: 60–90 business days from invoice date — unusually long',
        'All deliverables and work products assigned to NMC upon payment',
        'Governed by UAE law, Dubai jurisdiction',
        'No termination notice period specified',
      ],
      red_flags: [
        'Payment terms of 60–90 business days create significant cash-flow risk',
        'Broad IP assignment includes potentially reusable methodologies and frameworks',
        'No late payment interest clause — no financial consequence for delayed payment',
        'No termination notice period leaves consultant vulnerable to immediate termination',
      ],
      expires_at: '2027-02-28',
      notes: 'Signed Mar 1 2026. Payment terms under negotiation — pushing for net-30.',
    },
    {
      name: 'JLT Apartment Lease Agreement — Dubai Marina Properties',
      doc_type: 'rental',
      original_text: `TENANCY CONTRACT

Landlord: Dubai Marina Properties LLC (RERA Broker No. 4421)
Tenant: Fatima Noor Al-Rashid (Emirates ID: 784-xxxx-xxxxxxx-x)
Property: Apartment 1204, Cluster X, Jumeirah Lake Towers (JLT), Dubai
Annual Rent: AED 95,000
Lease Period: 1 December 2025 to 30 November 2026
Payment: 4 cheques (AED 23,750 each, payable quarterly)
Security Deposit: AED 9,500 (one month equivalent)

TERMS:
1. The Tenant shall not sublet or assign the tenancy without prior written consent of the Landlord.
2. The Tenant is responsible for minor maintenance up to AED 500 per incident.
3. The Landlord shall provide 90-day notice for rent increase at renewal, in accordance with RERA guidelines.
4. This contract is registered with Ejari (Registration No. TN-2025-JLT-884421).`,
      summary_md: `## JLT Apartment Lease — Summary

**What this is:** A 12-month lease for your apartment in JLT (Cluster X) at AED 95,000/year, running December 2025 to November 2026.

**Key terms:**
- **Annual rent:** AED 95,000 (paid in 4 quarterly cheques of AED 23,750)
- **Security deposit:** AED 9,500 (refundable)
- **Expiry:** 30 November 2026 — renewal decision needed by September 2026
- RERA-registered (Ejari) — your rights are protected under Dubai rental law

**Action needed:** If you wish to renew or are expecting a rent increase, the landlord must give 90-day notice per RERA rules.`,
      key_points: [
        'Lease runs 1 Dec 2025 – 30 Nov 2026 at AED 95,000/year',
        'Payment: 4 quarterly cheques of AED 23,750',
        'Security deposit: AED 9,500 (refundable on departure)',
        'Registered with Ejari (No. TN-2025-JLT-884421) — legally protected',
        'Landlord must give 90-day written notice before any rent increase',
      ],
      red_flags: [
        'Tenant responsible for maintenance up to AED 500 per incident — clarify what counts as "minor"',
        'No clause specifying conditions for security deposit deductions',
      ],
      expires_at: '2026-11-30',
      notes: 'Current lease. Start renewal discussions in September 2026.',
    },
    {
      name: 'Al Rafah Medical Centre — Phase 2 Scope of Work',
      doc_type: 'agreement',
      original_text: `STATEMENT OF WORK — PHASE 2
PROJECT: Patient Journey Optimisation — Implementation Support
CLIENT: Al Rafah Medical Centre LLC, Abu Dhabi
CONSULTANT: AlRashid Health Advisory

PHASE 2 SCOPE:
- Monthly on-site support visits (2 days/month) at Al Rafah Abu Dhabi and Al Ain branches
- Implementation of 6 workflow improvements identified in Phase 1 Gap Analysis
- Staff training on new patient intake procedures (4 sessions)
- Monthly progress reporting to Medical Director and COO
- Final impact assessment report due 15 July 2026

DELIVERABLES AND TIMELINE:
- Month 1 (Feb): Kick-off, workflow documentation
- Month 2–5 (Mar–Jun): Implementation support
- Month 6 (Jul): Final assessment and report

FEES: AED 10,000/month for 6 months (AED 60,000 total)
INVOICING: Monthly, net-30 from invoice date
IP: Consultant retains rights to general methodology; client owns specific reports.`,
      summary_md: `## Al Rafah Phase 2 Scope of Work — Summary

**What this is:** A 6-month implementation support engagement for Al Rafah Medical Centre covering workflow improvements, staff training, and impact assessment.

**Key terms:**
- **Fee:** AED 10,000/month × 6 months = **AED 60,000 total**
- **Timeline:** February – July 2026
- **Payment:** Net-30 (monthly invoices)
- **IP:** You retain your methodology; Al Rafah owns the specific reports

**Important:** You are required to attend on-site visits in Abu Dhabi and Al Ain (2 days/month). Final report is due 15 July 2026.`,
      key_points: [
        'AED 10,000/month for 6 months — total AED 60,000',
        'Net-30 payment terms — favourable compared to NMC Health contract',
        'On-site visits required: 2 days/month at Abu Dhabi and Al Ain branches',
        'Consultant retains rights to general methodology and frameworks',
        'Final impact assessment report due 15 July 2026',
      ],
      red_flags: [
        'Travel to Al Ain branch not explicitly compensated — clarify if reimbursement applies',
      ],
      expires_at: '2026-07-15',
      notes: 'Active engagement. Phase 2 month 3 (April invoiced, May in progress).',
    },
  ]

  let docCount = 0
  for (const d of documents) {
    const { error } = await db.from('legal_documents').insert({
      user_id: UID,
      name:          d.name,
      doc_type:      d.doc_type,
      original_text: d.original_text,
      summary_md:    d.summary_md,
      key_points:    d.key_points,
      red_flags:     d.red_flags,
      expires_at:    d.expires_at ?? null,
      notes:         d.notes ?? null,
    })
    if (!error) docCount++
    else console.log(`  ✗  document "${d.name}": ${error.message}`)
  }
  console.log(`  ✔  ${docCount}/${documents.length} legal documents`)

  // ── legal_compliances ──────────────────────────────────────────────────────
  const compliances = [
    { item: 'VAT Return Filing (quarterly)', category: 'tax', frequency: 'quarterly', last_done_at: '2026-04-28', next_due_at: '2026-07-28', is_done: false, applicable: true, notes: 'AlRashid Health Advisory — registered for UAE VAT' },
    { item: 'Trade Licence Renewal (DED)', category: 'business', frequency: 'annual', last_done_at: '2025-07-15', next_due_at: '2026-07-15', is_done: false, applicable: true, notes: 'Dubai DED sole-proprietorship licence' },
    { item: 'Professional Indemnity Insurance Renewal', category: 'business', frequency: 'annual', last_done_at: '2025-09-01', next_due_at: '2026-09-01', is_done: false, applicable: true, notes: 'Required for DHA healthcare consultant licence. Minimum AED 1M coverage.' },
    { item: 'Emirates ID Renewal', category: 'personal', frequency: 'annual', last_done_at: '2022-02-14', next_due_at: '2027-02-14', is_done: false, applicable: true, notes: '10-year Emirates ID — renew 30 days before expiry' },
    { item: 'Vehicle Registration Renewal (RTA Mulkiya)', category: 'personal', frequency: 'annual', last_done_at: '2025-11-01', next_due_at: '2026-11-01', is_done: false, applicable: true, notes: 'Toyota Fortuner — plate P19244. Book Tasjeel vehicle inspection first.' },
    { item: 'DHA Healthcare Consultant Licence Renewal', category: 'business', frequency: 'annual', last_done_at: '2026-01-10', next_due_at: '2027-01-10', is_done: false, applicable: true, notes: '40 CME hours required before renewal. Current CME balance: 22 hours.' },
    { item: 'Annual Income Tax Return (India — NRI)', category: 'tax', frequency: 'annual', last_done_at: '2025-07-31', next_due_at: '2026-07-31', is_done: false, applicable: true, notes: 'File ITR as NRI for Indian income/investments. Coordinate with CA by June.' },
  ]

  let compCount = 0
  for (const c of compliances) {
    const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c })
    if (!error) compCount++
    else console.log(`  ✗  compliance "${c.item}": ${error.message}`)
  }
  console.log(`  ✔  ${compCount}/${compliances.length} legal compliances`)
}

// ── INSIGHTS (daily_briefings) ────────────────────────────────────────────────

async function seedInsights() {
  console.log('\n📊  Seeding insights / daily briefings...')

  // Briefings for the past 7 days (2026-05-03 through 2026-05-09)
  const briefings = [
    {
      date: '2026-05-03',
      content_md: `**Good morning, Fatima.** The week ahead has a full plate — your Al Rafah Phase 2 engagement is mid-stride and the NMC retainer proposal is still pending a response. Today might be the right moment to follow up on that invoice. Your mood last logged as a 2 on Tuesday — give yourself permission to pace the day. **The single thing that matters most: send the ARHA-2026-002 follow-up to Al Rafah finance today.** Small action, big relief.`,
      highlights: [
        { label: 'Outstanding invoices', value: '1 · 20,000', link: '/business', emoji: '🧾' },
        { label: 'Unpaid bills', value: '2', link: '/home', emoji: '💡' },
        { label: 'Active trip', value: 'Abu Dhabi, UAE', link: '/travel', emoji: '✈️' },
        { label: 'Top goal', value: 'Expand AlRashid Health Advisory to 5 active clients', link: '/career', emoji: '🎯' },
      ],
    },
    {
      date: '2026-05-04',
      content_md: `**Good morning, Fatima.** Monday energy — let's channel it. Your mood logged a 3 yesterday, which is steady ground. You have two utility bills sitting unpaid and the DEWA April bill closes May 14th. It will take less than two minutes. **Your biggest win today would be closing that pending action on the NMC contract terms** — the sooner you resolve the payment clause, the sooner the retainer can start. One clear thing forward.`,
      highlights: [
        { label: 'Recent mood', value: 'Okay', link: '/mind', emoji: '🙂' },
        { label: 'Unpaid bills', value: '2', link: '/home', emoji: '💡' },
        { label: 'Legal deadlines', value: '1 this week', link: '/legal', emoji: '⚖️' },
        { label: 'Outstanding invoices', value: '1 · 20,000', link: '/business', emoji: '🧾' },
      ],
    },
    {
      date: '2026-05-05',
      content_md: `**Good morning, Fatima.** Yesterday's energy scored a 5 — that's your high-water mark this month. 🌱 A beautiful streak in the making. Your habits are tracking well and you have a full day of focused work ahead. The Abu Dhabi trip in June is booked and the excitement is building — use that positive feeling to fuel today. **Focus on wrapping up the Phase 2 implementation notes for Al Rafah.** Momentum is everything.`,
      highlights: [
        { label: 'Recent mood', value: 'Great', link: '/mind', emoji: '🤩' },
        { label: 'Active trip', value: 'Abu Dhabi, UAE', link: '/travel', emoji: '✈️' },
        { label: 'Outstanding invoices', value: '1 · 20,000', link: '/business', emoji: '🧾' },
        { label: 'Top goal', value: 'Expand AlRashid Health Advisory to 5 active clients', link: '/career', emoji: '🎯' },
      ],
    },
    {
      date: '2026-05-06',
      content_md: `**Good afternoon, Fatima.** Midweek. You have been carrying a lot this week — client work, the NMC negotiation, and Layla's school schedule all at once. Your mood logged a 4 last night, which shows real resilience. The trade licence renewal is in July — still comfortable runway, but worth putting it on a to-do this week. **Today, protect your energy: block two hours this afternoon for deep work on the Al Rafah report.** The rest can wait.`,
      highlights: [
        { label: 'Recent mood', value: 'Good', link: '/mind', emoji: '😊' },
        { label: 'Unpaid bills', value: '2', link: '/home', emoji: '💡' },
        { label: 'Legal deadlines', value: 'Trade licence — Jul 15', link: '/legal', emoji: '⚖️' },
        { label: 'Active trip', value: 'Abu Dhabi, UAE', link: '/travel', emoji: '✈️' },
      ],
    },
    {
      date: '2026-05-07',
      content_md: `**Good morning, Fatima.** Thursday — the finish line is close. Mood logged a 4 last night and your habits are humming. 🌱 The Amman trip planning for August is shaping up nicely — that reunion with Maha will be worth it. Your DEWA April bill is due May 14th, so a quick payment this weekend would clear it. **Today's one thing: finalise the scope discussion with Wellness Hub Dubai** — that third client would meaningfully grow the practice.`,
      highlights: [
        { label: 'Recent mood', value: 'Good', link: '/mind', emoji: '😊' },
        { label: 'Habits', value: '2/3 done', link: '/habits', emoji: '🌱' },
        { label: 'Unpaid bills', value: '2', link: '/home', emoji: '💡' },
        { label: 'Top goal', value: 'Expand AlRashid Health Advisory to 5 active clients', link: '/career', emoji: '🎯' },
      ],
    },
    {
      date: '2026-05-08',
      content_md: `**Good morning, Fatima.** Friday. The week has been productive — you moved the Al Rafah engagement forward, made progress on the NMC terms, and kept your mood steady. A 3 last night is honest after a full week. Give yourself the weekend. Your DHA licence still needs 18 more CME hours before January — a Saturday course could knock out 6 in one go. **For today: a short half-day, then rest.** You have earned it.`,
      highlights: [
        { label: 'Recent mood', value: 'Okay', link: '/mind', emoji: '🙂' },
        { label: 'Outstanding invoices', value: '1 · 20,000', link: '/business', emoji: '🧾' },
        { label: 'Legal deadlines', value: 'Trade licence — Jul 15', link: '/legal', emoji: '⚖️' },
        { label: 'Active trip', value: 'Abu Dhabi, UAE', link: '/travel', emoji: '✈️' },
      ],
    },
    {
      date: '2026-05-09',
      content_md: `**Good morning, Fatima.** Saturday — your day. Mood logged a 4 this morning and energy is up. The DEWA April bill is due in 5 days; worth handling today while it's fresh. Ahmed's birthday is in three weeks — a small plan made now means a better celebration. **Today's one thing: pay the outstanding utility bills** and then fully disconnect from work. The practice will be there Monday. You deserve a present-tense weekend.`,
      highlights: [
        { label: 'Recent mood', value: 'Good', link: '/mind', emoji: '😊' },
        { label: 'Unpaid bills', value: '2', link: '/home', emoji: '💡' },
        { label: 'Active trip', value: 'Abu Dhabi, UAE', link: '/travel', emoji: '✈️' },
        { label: 'Top goal', value: 'Expand AlRashid Health Advisory to 5 active clients', link: '/career', emoji: '🎯' },
      ],
    },
  ]

  let briefingCount = 0
  for (const b of briefings) {
    const { error } = await db.from('daily_briefings').upsert(
      { user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T06:30:00+04:00` },
      { onConflict: 'user_id,date' }
    )
    if (!error) briefingCount++
    else console.log(`  ✗  briefing ${b.date}: ${error.message}`)
  }
  console.log(`  ✔  ${briefingCount}/${briefings.length} daily briefings`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n👤  Fatima uid: ${UID}`)
  await seedProtection()
  await seedLegal()
  await seedInsights()
  console.log('\n✅  Seed complete.\n')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
