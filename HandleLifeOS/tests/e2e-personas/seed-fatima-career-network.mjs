/**
 * Seed Career + Network (CRM) data for Fatima Al-Rashid (E2E test persona).
 * Persona: 38yo senior healthcare consultant at Mediclinic Middle East, Dubai.
 * Run: node tests/e2e-personas/seed-fatima-career-network.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let step = 0
function ok(label, count) { console.log(`  ✔  [${++step}] ${label}${count != null ? ` (${count} rows)` : ''}`) }
function skip(label)       { console.log(`  ⬜  [${++step}] ${label} — already exists, skipped`) }

async function count(table, uid) {
  const { count: n } = await db.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return n ?? 0
}

async function seed() {
  const { data: user, error: ue } = await db
    .from('users').select('id').eq('email', 'fatima.alrashid@e2e-test.handlelifeos.app').single()
  if (ue || !user) { console.error('Cannot find Fatima:', ue?.message); process.exit(1) }
  const uid = user.id
  console.log(`\n👤  Fatima uid: ${uid}\n`)

  // ═══════════════════════════════════════════════════════════════════════════
  //  CAREER & GROWTH
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('💼  Career & Growth\n')

  // ── 1. Career goals ────────────────────────────────────────────────────────
  if (await count('career_goals', uid) === 0) {
    const { error } = await db.from('career_goals').insert([
      {
        user_id:      uid,
        title:        'Become Director of Clinical Operations',
        category:     'role',
        target_date:  '2028-06-01',
        description:  'Move from Senior Consultant to Director level at Mediclinic or a comparable UAE private healthcare group. Requires demonstrating P&L ownership, team leadership (10+ staff), and measurable patient outcome improvements.',
        progress_pct: 35,
        status:       'active',
        notes:        'Spoke to Dr. Rashid (current Director) about a mentorship arrangement. He\'s open to quarterly sessions.',
      },
      {
        user_id:      uid,
        title:        'Launch independent healthcare consultancy',
        category:     'other',
        target_date:  '2030-01-01',
        description:  'Set up a boutique consultancy specialising in clinical process optimisation for private hospitals and clinics in the GCC. Target: 3–5 retainer clients by end of year one.',
        progress_pct: 15,
        status:       'active',
        notes:        'Business name shortlisted: "AlRashid Health Advisory". Need to research UAE mainland vs freezone setup costs.',
      },
      {
        user_id:      uid,
        title:        'Complete PMP Certification',
        category:     'skill',
        target_date:  '2026-12-31',
        description:  'Project Management Professional certification to formalise skills already applied in clinical project management. Boosts credibility for Director-level applications.',
        progress_pct: 60,
        status:       'active',
        notes:        'Enrolled in PMI-authorised prep course. Exam booked for November 2026.',
      },
      {
        user_id:      uid,
        title:        'Build a personal brand in healthcare leadership',
        category:     'impact',
        target_date:  '2027-01-01',
        description:  'Publish 4 LinkedIn articles on women in GCC healthcare leadership and clinical operations. Aim for 5k LinkedIn followers and 1 conference speaking slot.',
        progress_pct: 20,
        status:       'active',
        notes:        '1 article published so far (March 2026). Next topic: "AI integration in clinical workflows — what managers need to know".',
      },
      {
        user_id:      uid,
        title:        'Reach AED 40,000/month total income',
        category:     'income',
        target_date:  '2027-06-01',
        description:  'Grow salary + consulting income from current AED 28k + occasional freelance to AED 40k/month. Achievable via Director promotion or 2–3 steady consulting clients.',
        progress_pct: 30,
        status:       'active',
        notes:        'Current: AED 28k salary + ~AED 3–4k avg consulting. Target gap: ~AED 8–9k.',
      },
      {
        user_id:      uid,
        title:        'Complete Executive Leadership Programme (INSEAD)',
        category:     'learning',
        target_date:  '2027-09-01',
        description:  'Apply to INSEAD\'s Healthcare Leadership Programme (online cohort). Competitive but aligns with Director-level ambition.',
        progress_pct: 5,
        status:       'paused',
        notes:        'Application window opens September 2026. Cost ~USD 8,500 — employer sponsorship to be explored.',
      },
      {
        user_id:      uid,
        title:        'Mentored 3 junior clinicians',
        category:     'impact',
        target_date:  '2025-12-31',
        description:  'Formal mentorship of 3 junior healthcare staff through Mediclinic\'s internal mentorship scheme.',
        progress_pct: 100,
        status:       'achieved',
        notes:        'Completed Dec 2025. All 3 mentees progressed to next role level within 12 months.',
      },
    ])
    if (error) throw error
    ok('Career goals', 7)
  } else { skip('Career goals') }

  // ── 2. Skills ──────────────────────────────────────────────────────────────
  let skillIds = {}
  if (await count('skills_tracked', uid) === 0) {
    const skills = [
      { name: 'Clinical Operations Management', category: 'technical',  current_level: 5, target_level: 5, hours_invested: 8000, is_active: true,  notes: 'Core domain. 12+ years experience across UAE and Jordan.' },
      { name: 'Healthcare Process Improvement',  category: 'technical',  current_level: 4, target_level: 5, hours_invested: 2400, is_active: true,  notes: 'Lean Six Sigma fundamentals applied; want to formalise with certification.' },
      { name: 'Project Management (PMP)',         category: 'technical',  current_level: 3, target_level: 5, hours_invested: 120,  is_active: true,  notes: 'Actively studying. Exam booked November 2026.' },
      { name: 'Data Analysis & Reporting',        category: 'technical',  current_level: 3, target_level: 4, hours_invested: 200,  is_active: true,  notes: 'Comfortable with Excel/Google Sheets; learning Power BI basics.' },
      { name: 'AI in Healthcare (Applications)',  category: 'technical',  current_level: 2, target_level: 4, hours_invested: 40,   is_active: true,  notes: 'Exploring how AI tools apply to clinical ops — diagnostics, scheduling, patient flow.' },
      { name: 'Leadership & Team Management',     category: 'soft',       current_level: 4, target_level: 5, hours_invested: 3000, is_active: true,  notes: 'Currently managing a team of 6. Mentored 3 junior clinicians successfully.' },
      { name: 'Strategic Communication',          category: 'soft',       current_level: 4, target_level: 5, hours_invested: 500,  is_active: true,  notes: 'Presenting to C-suite quarterly. Working on executive presence.' },
      { name: 'Business Development',             category: 'soft',       current_level: 2, target_level: 4, hours_invested: 30,   is_active: true,  notes: 'Learning for the consultancy plan. Weak area — need to build pipeline skills.' },
      { name: 'Arabic (Professional Writing)',    category: 'language',   current_level: 4, target_level: 5, hours_invested: 1500, is_active: true,  notes: 'Native spoken, strong written. Want to improve formal/regulatory Arabic.' },
      { name: 'English (Business)',               category: 'language',   current_level: 5, target_level: 5, hours_invested: 5000, is_active: false, notes: 'Fluent. No active development needed.' },
    ]
    const { data: inserted, error } = await db.from('skills_tracked')
      .insert(skills.map(s => ({ user_id: uid, ...s }))).select('id, name')
    if (error) throw error
    inserted.forEach(s => { skillIds[s.name] = s.id })
    ok('Skills', skills.length)
  } else {
    const { data: existing } = await db.from('skills_tracked').select('id, name').eq('user_id', uid)
    existing?.forEach(s => { skillIds[s.name] = s.id })
    skip('Skills')
  }

  // ── 3. Learning resources ──────────────────────────────────────────────────
  if (await count('learning_resources', uid) === 0) {
    const pmpId   = skillIds['Project Management (PMP)']          ?? null
    const aiId    = skillIds['AI in Healthcare (Applications)']   ?? null
    const bdId    = skillIds['Business Development']              ?? null
    const leaderI = skillIds['Leadership & Team Management']      ?? null
    const dataId  = skillIds['Data Analysis & Reporting']         ?? null

    const { error } = await db.from('learning_resources').insert([
      {
        user_id:   uid, skill_id: pmpId,
        title:     'PMP Exam Prep — PMI-Authorised Course (Simplilearn)',
        type:      'course', status: 'active',
        notes:     'Working through this 3x per week. Chapter 5 (Scope) completed. 11 chapters to go.',
      },
      {
        user_id:   uid, skill_id: pmpId,
        title:     'A Guide to the Project Management Body of Knowledge (PMBOK 7th Ed.)',
        type:      'book', status: 'active',
        notes:     '60% through. Dense but essential. Correlating each chapter to course material.',
      },
      {
        user_id:   uid, skill_id: aiId,
        title:     'AI for Healthcare Professionals — Coursera (Stanford)',
        type:      'course', status: 'queued',
        notes:     'Enrolled, haven\'t started. Scheduled for post-PMP exam (December 2026).',
      },
      {
        user_id:   uid, skill_id: aiId,
        title:     'The AI Doctor: How Machines Are Reshaping Medicine',
        type:      'book', status: 'queued',
        notes:     'Recommended by colleague Dr. Laila. In reading queue after PMBOK.',
      },
      {
        user_id:   uid, skill_id: leaderI,
        title:     'Dare to Lead — Brené Brown',
        type:      'book', status: 'completed',
        rating:    5, completed_at: '2025-08-15',
        notes:     'Transformative. Applied vulnerability framework in team 1:1s. Would re-read.',
      },
      {
        user_id:   uid, skill_id: leaderI,
        title:     'The First 90 Days — Michael Watkins',
        type:      'book', status: 'completed',
        rating:    4, completed_at: '2026-01-10',
        notes:     'Practical playbook. Useful for onboarding mindset heading into a Director role.',
      },
      {
        user_id:   uid, skill_id: leaderI,
        title:     'HBR Women at Work Podcast',
        type:      'podcast', status: 'active',
        notes:     'Listen during morning commute. Particularly valuable episodes on negotiation and sponsorship vs. mentorship.',
      },
      {
        user_id:   uid, skill_id: bdId,
        title:     'The Lean Startup — Eric Ries',
        type:      'book', status: 'active',
        notes:     '40% through. Applying MVP thinking to consultancy business model — test small, learn fast.',
      },
      {
        user_id:   uid, skill_id: bdId,
        title:     'Win Without Pitching Manifesto — Blair Enns',
        type:      'book', status: 'queued',
        notes:     'Specifically about positioning and selling professional services. Critical for consultancy launch.',
      },
      {
        user_id:   uid, skill_id: dataId,
        title:     'Microsoft Power BI for Beginners — LinkedIn Learning',
        type:      'course', status: 'active',
        notes:     'Halfway through. Building a sample clinical dashboard as practice project.',
      },
      {
        user_id:   uid, skill_id: null,
        title:     'Mentorship sessions — Dr. Rashid Al-Mansoori (Clinical Director)',
        type:      'mentorship', status: 'active',
        notes:     'Quarterly sessions. Covering Director-track career navigation in UAE healthcare system. Session 2 scheduled May 20.',
      },
    ])
    if (error) throw error
    ok('Learning resources', 11)
  } else { skip('Learning resources') }

  // ═══════════════════════════════════════════════════════════════════════════
  //  NETWORK & RELATIONSHIPS (CRM)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n🤝  Network & Relationships\n')

  // ── 4. Contacts ────────────────────────────────────────────────────────────
  let contactIds = {}
  if (await count('contacts', uid) === 0) {
    const contacts = [
      // ── Professional: Leadership track ────────────────────────────────────
      {
        name: 'Dr. Rashid Al-Mansoori', email: 'r.almansoori@mediclinic.ae',
        company: 'Mediclinic Middle East', role: 'Director of Clinical Operations',
        group_name: 'mentor', strength: 5,
        how_we_met: 'Joined Mediclinic as my line manager 4 years ago. Now a mentor.',
        notes: 'Quarterly mentorship sessions. Championing my Director-track application internally. Very direct feedback style — I appreciate it.',
        tags: ['mentor','healthcare','director-track','mediclinic'],
        follow_up_at: '2026-05-20',
        last_contact_at: '2026-04-15T10:00:00Z',
      },
      {
        name: 'Laila Hamdan', email: 'laila.hamdan@nmc.ae',
        company: 'NMC Health', role: 'Head of Quality & Patient Safety',
        group_name: 'work', strength: 4,
        how_we_met: 'Met at the Arab Health Conference 2023 — connected over clinical quality frameworks.',
        notes: 'Referred the AI for Healthcare Coursera course. Collaborating on a joint white paper on patient flow optimisation in UAE private hospitals.',
        birthday: '1985-11-22',
        tags: ['colleague','healthcare','quality','ai','conference'],
        follow_up_at: '2026-05-25',
        last_contact_at: '2026-05-02T14:30:00Z',
      },
      {
        name: 'Omar Siddiqui', email: 'omar.s@meridianhealth.com',
        company: 'Meridian Health Advisory', role: 'Founder & Principal Consultant',
        group_name: 'mentor', strength: 4,
        how_we_met: 'LinkedIn connection who became a real mentor. He launched his own consultancy 5 years ago from a similar background.',
        notes: 'Invaluable perspective on going independent. Advised on UAE mainland vs freezone setup. Monthly WhatsApp check-ins.',
        tags: ['mentor','consultancy','entrepreneur','healthcare','linkedin'],
        follow_up_at: '2026-06-01',
        last_contact_at: '2026-04-28T09:00:00Z',
      },
      {
        name: 'Priya Mehta', email: 'priya.mehta@mckinsey.com',
        company: 'McKinsey & Company', role: 'Senior Engagement Manager (Healthcare)',
        group_name: 'work', strength: 3,
        how_we_met: 'Worked together on a Mediclinic transformation project (2024). Strong strategic thinker.',
        notes: 'Good to have in network for consultancy referrals. Mentioned McKinsey sometimes subcontracts domain experts.',
        tags: ['consulting','strategy','healthcare','mckinsey','referral-potential'],
        follow_up_at: '2026-07-01',
        last_contact_at: '2026-03-10T16:00:00Z',
      },
      {
        name: 'Sara Al-Jabri', email: 'sara.aljabri@doh.gov.ae',
        company: 'Department of Health — Abu Dhabi', role: 'Policy Advisor (Digital Health)',
        group_name: 'work', strength: 3,
        how_we_met: 'Introduced by Dr. Rashid at a MOH policy roundtable (Jan 2026).',
        notes: 'Invaluable government connection. She signals upcoming regulatory shifts early. Keep warm — useful for consultancy clients navigating compliance.',
        tags: ['government','policy','digital-health','compliance','abu-dhabi'],
        follow_up_at: '2026-06-15',
        last_contact_at: '2026-01-20T11:00:00Z',
      },
      // ── Professional: Consulting pipeline ────────────────────────────────
      {
        name: 'Dr. Khalid Hareb', email: 'khalid@alrafahmedical.com',
        company: 'Al Rafah Medical Centre', role: 'CEO',
        group_name: 'work', strength: 3,
        how_we_met: 'Approached me after a LinkedIn article. Interested in clinical ops consulting for their expansion.',
        notes: 'Potential first consultancy client. Clinic expanding from 1 to 3 locations — needs ops structure. Follow up on proposal sent April 30.',
        tags: ['client-prospect','ceo','private-clinic','consulting-pipeline'],
        follow_up_at: '2026-05-12',
        last_contact_at: '2026-04-30T10:00:00Z',
      },
      {
        name: 'Nour Al-Amin', email: 'nour@wellnesshubdubai.com',
        company: 'Wellness Hub Dubai', role: 'Operations Manager',
        group_name: 'work', strength: 2,
        how_we_met: 'Referred by Laila Hamdan. Running a wellness centre chain — potential operations advisory work.',
        notes: 'Early stage conversation. They\'re struggling with staff scheduling and patient journey consistency.',
        tags: ['client-prospect','wellness','operations','referral'],
        follow_up_at: '2026-05-30',
        last_contact_at: '2026-05-07T15:00:00Z',
      },
      // ── Personal: Friends & Family ────────────────────────────────────────
      {
        name: 'Hana Khalil', email: 'hanakhalil@gmail.com', phone: '+971-50-234-5678',
        group_name: 'friends', strength: 5,
        how_we_met: 'University friends from Jordan (AUB). 16 years of friendship.',
        notes: 'My anchor person. Calls every Sunday. Knows everything. Visiting Dubai end of June.',
        birthday: '1988-02-14',
        tags: ['friend','jordan','university','close'],
        follow_up_at: null,
        last_contact_at: '2026-05-04T19:00:00Z',
      },
      {
        name: 'Maha Al-Rashid', phone: '+962-79-456-7890',
        group_name: 'family', strength: 5,
        how_we_met: 'Sister. Based in Amman.',
        notes: 'Video call every 2 weeks minimum. Layla and Omar FaceTime with her separately. Planning to visit in August.',
        birthday: '1986-09-03',
        tags: ['sister','family','jordan','close'],
        follow_up_at: null,
        last_contact_at: '2026-05-01T20:30:00Z',
      },
      {
        name: 'Rima Fawaz', email: 'rima.f@gmail.com', phone: '+971-55-876-5432',
        group_name: 'friends', strength: 4,
        how_we_met: 'Met at a Dubai Women\'s Leadership Network event (2022). Now meet monthly.',
        notes: 'Finance professional (VP at ADCB). Different industry but same life stage — working mother, ambitious, grounded. Great sounding board.',
        birthday: '1987-07-19',
        tags: ['friend','networking','dubai','finance','women-leadership'],
        follow_up_at: '2026-05-28',
        last_contact_at: '2026-04-22T12:30:00Z',
      },
      {
        name: 'Yaseen Al-Rashid', phone: '+971-50-123-9999',
        group_name: 'family', strength: 5,
        how_we_met: 'My son. 16 years old.',
        notes: 'Lives with Ahmed in Sharjah, weekends and holidays with me. Driving lessons ongoing. University choices on the horizon — wants engineering.',
        birthday: '2009-12-15',
        tags: ['son','family','teenager'],
        follow_up_at: null,
        last_contact_at: '2026-05-09T17:00:00Z',
      },
      {
        name: 'Dr. Nadia Malik', email: 'nadia@sunshinepediatrics.ae', phone: '+971-4-567-8901',
        company: 'Sunshine Pediatrics', role: 'Pediatrician',
        group_name: 'work', strength: 3,
        how_we_met: 'Omar\'s pediatrician. Professional respect has grown into a warm relationship.',
        notes: 'Omar\'s June check-up confirmed. Also connected me with two other working mothers in similar healthcare roles.',
        tags: ['doctor','omar','pediatrics','professional'],
        follow_up_at: '2026-06-10',
        last_contact_at: '2026-05-01T10:30:00Z',
      },
      {
        name: 'Ahmed Al-Rashid', phone: '+971-50-987-6543',
        group_name: 'family', strength: 3,
        how_we_met: 'Ex-husband. Co-parenting Yaseen and the younger children.',
        notes: 'Co-parenting dynamic is respectful. WhatsApp mostly about Yaseen and kids\' schedules. Invited family members for Abu Dhabi trip in June.',
        tags: ['co-parent','ex-husband','family'],
        follow_up_at: null,
        last_contact_at: '2026-05-08T20:00:00Z',
      },
    ]

    const { data: inserted, error } = await db.from('contacts')
      .insert(contacts.map(c => ({ user_id: uid, ...c }))).select('id, name')
    if (error) throw error
    inserted.forEach(c => { contactIds[c.name] = c.id })
    ok('Contacts', contacts.length)
  } else {
    const { data: existing } = await db.from('contacts').select('id, name').eq('user_id', uid)
    existing?.forEach(c => { contactIds[c.name] = c.id })
    skip('Contacts')
  }

  // ── 5. Interaction log ─────────────────────────────────────────────────────
  // contact_interactions table exists; no app API route — insert direct via admin
  if (await count('contact_interactions', uid) === 0) {
    const c = contactIds
    const interactions = [
      // Dr. Rashid — mentor sessions
      { contact_id: c['Dr. Rashid Al-Mansoori'], type: 'meeting',  sentiment: 'positive', occurred_at: '2026-04-15T10:00:00Z', notes: 'Mentorship session 1 of 4 planned this year. Discussed Director application timeline and key metrics I need to demonstrate by Q3.' },
      { contact_id: c['Dr. Rashid Al-Mansoori'], type: 'message',  sentiment: 'positive', occurred_at: '2026-04-20T09:00:00Z', notes: 'He forwarded an internal JD for Ops Director role at Mediclinic Welcare — told me to start preparing a portfolio.' },
      // Laila Hamdan — collaboration
      { contact_id: c['Laila Hamdan'],           type: 'call',     sentiment: 'positive', occurred_at: '2026-05-02T14:30:00Z', notes: 'Discussed white paper structure. She\'ll write the quality framework section, I\'ll cover operational implementation. Target submission June 2026.' },
      { contact_id: c['Laila Hamdan'],           type: 'email',    sentiment: 'neutral',  occurred_at: '2026-04-18T11:00:00Z', notes: 'Sent her draft outline. She suggested adding a UAE-specific regulatory compliance angle.' },
      // Omar Siddiqui — consultancy advice
      { contact_id: c['Omar Siddiqui'],          type: 'call',     sentiment: 'positive', occurred_at: '2026-04-28T09:00:00Z', notes: 'Monthly check-in. He walked me through his first year revenue structure — retainer vs. project basis. Recommended I start with 1–2 pilot clients at reduced rate to build case studies.' },
      // Dr. Khalid — prospect
      { contact_id: c['Dr. Khalid Hareb'],       type: 'email',    sentiment: 'positive', occurred_at: '2026-04-30T10:00:00Z', notes: 'Sent 2-page consultancy proposal covering 3-month ops audit for Al Rafah expansion. Quoted AED 18,000.' },
      { contact_id: c['Dr. Khalid Hareb'],       type: 'call',     sentiment: 'neutral',  occurred_at: '2026-04-10T11:00:00Z', notes: 'Discovery call. 45 min. They need help with: staff scheduling, patient journey mapping, SOPs for new locations. Budget seems there.' },
      // Nour Al-Amin — prospect
      { contact_id: c['Nour Al-Amin'],           type: 'meeting',  sentiment: 'positive', occurred_at: '2026-05-07T15:00:00Z', notes: 'First meeting at their JLT location. Walked their patient journey. Clear pain points around scheduling and staff handover protocols. Agreed to send a brief proposal.' },
      // Hana — personal
      { contact_id: c['Hana Khalil'],            type: 'call',     sentiment: 'positive', occurred_at: '2026-05-04T19:00:00Z', notes: 'Sunday call — 90 min. Talked about Layla\'s focus issues, my consultancy plan, and her divorce proceedings. I was mostly listening. She needed it.' },
      { contact_id: c['Hana Khalil'],            type: 'call',     sentiment: 'positive', occurred_at: '2026-04-27T19:30:00Z', notes: 'Quick check-in. She\'s visiting in late June. Planning a girls\' dinner at Zuma.' },
      // Maha — family
      { contact_id: c['Maha Al-Rashid'],         type: 'call',     sentiment: 'positive', occurred_at: '2026-05-01T20:30:00Z', notes: 'Video call. Kids joined for first 20 min — Layla showed Maha her science fair board. Family planning August visit discussed.' },
      // Rima — friend/network
      { contact_id: c['Rima Fawaz'],             type: 'meeting',  sentiment: 'positive', occurred_at: '2026-04-22T12:30:00Z', notes: 'Lunch at Comptoir 102. She shared how she structured a sabbatical for skills development — useful model for my INSEAD application timing.' },
      // Ahmed — co-parenting
      { contact_id: c['Ahmed Al-Rashid'],        type: 'message',  sentiment: 'neutral',  occurred_at: '2026-05-08T20:00:00Z', notes: 'WhatsApp re: June trip to Abu Dhabi — confirmed hotel, agreed Yaseen joins the family.' },
      { contact_id: c['Ahmed Al-Rashid'],        type: 'message',  sentiment: 'neutral',  occurred_at: '2026-05-05T08:00:00Z', notes: 'School schedule coordination — Yaseen\'s summer holiday dates.' },
      // Dr. Nadia — pediatric
      { contact_id: c['Dr. Nadia Malik'],        type: 'call',     sentiment: 'positive', occurred_at: '2026-05-01T10:30:00Z', notes: 'Confirmed Omar\'s June 10 check-up. She mentioned a patient support group for working parents with young kids — might be worth checking out.' },
      // Sara Al-Jabri — government
      { contact_id: c['Sara Al-Jabri'],          type: 'meeting',  sentiment: 'positive', occurred_at: '2026-01-20T11:00:00Z', notes: 'MOH roundtable on digital health data standards. Sara presenting on upcoming NABIDH mandate extension to private clinics — critical for my consulting clients.' },
    ]

    const validInteractions = interactions.filter(i => i.contact_id != null)
    const { error } = await db.from('contact_interactions')
      .insert(validInteractions.map(i => ({ user_id: uid, ...i })))
    if (error) throw error
    ok('Contact interactions', validInteractions.length)
  } else { skip('Contact interactions') }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────────────')
  console.log('  CAREER')
  console.log('  Goals          : 7 (5 active, 1 paused, 1 achieved)')
  console.log('  Skills         : 10 (5 technical, 3 soft, 2 language)')
  console.log('  Learning queue : 11 resources (4 books active, 2 courses active,')
  console.log('                   1 podcast, 2 queued, 2 completed)')
  console.log('\n  NETWORK')
  console.log('  Contacts       : 13 (5 work/professional, 3 mentors/prospects,')
  console.log('                   3 personal, 2 family-adjacent)')
  console.log('  Interactions   : 16 logged (calls, meetings, emails, messages)')
  console.log('──────────────────────────────────────────────────────────────')
  console.log('\n✅  Done — refresh Career and Network pages.\n')
}

seed().catch(err => {
  console.error('\n❌ Fatal:', err.message, err.details ?? '')
  process.exit(1)
})
