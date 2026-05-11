// Bisi Adeyinka — Postpartum month 3, Abuja Nigeria. Infant Tomi (12 weeks).
// TONE RULES: Gentle, warm, recovery-focused. NO weight-loss goals. NO diet content.
// Goals centre on motherhood, wellbeing, and gentle return-to-work planning.
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

const EMAIL = 'bisi.adeyinka@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedBisi() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Bisi Adeyinka',
    occupation: 'Lawyer (Maternity Leave)',
    life_stage: 'early_career',
    country: 'NG',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    goals: [
      'Enjoy this precious time with Tomi fully present',
      'Research childcare options for October 2026 return to chambers',
      'Maintain mental and physical wellbeing through postpartum recovery',
      'Complete one legal CPD module during mat leave (online)',
      'Build NGN 500,000 family emergency fund before returning to work',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — mat leave pay NGN 600K/month
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 120000, spent: 120000 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 80000, spent: 72000 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 60000, spent: 58000 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 35000, spent: 32000 },
    { user_id: uid, month: 5, year: 2026, category: 'shopping', amount: 50000, spent: 44000 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 80000, spent: 80000 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 120000, category: 'rent', description: 'May rent – Wuse 2 apartment, Abuja', expense_date: '2026-05-01' },
      { user_id: uid, amount: 28000, category: 'shopping', description: 'Baby items – nappies, wipes, clothes (Tomi 0-3 months)', expense_date: '2026-05-04' },
      { user_id: uid, amount: 35000, category: 'health', description: 'Tomi 3-month immunisation + paediatrician check-up', expense_date: '2026-05-08' },
      { user_id: uid, amount: 23000, category: 'health', description: 'Postnatal physiotherapy – 2 sessions', expense_date: '2026-05-07' },
      { user_id: uid, amount: 20000, category: 'food', description: 'Fresh groceries + lactation-support meals', expense_date: '2026-05-05' },
      { user_id: uid, amount: 32000, category: 'utilities', description: 'Generator fuel + electricity + internet May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 80000, category: 'investment', description: 'Family savings – emergency fund May contribution', expense_date: '2026-05-15' },
    ])
  }

  // Habits — gentle, recovery and baby-centred
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: "Tomi's feeding schedule log (every 2-3 hrs)", frequency: 'daily', current_streak: 12, target_streak: 30, started_on: '2026-04-28', category: 'family' },
      { user_id: uid, name: 'Postnatal yoga – gentle 20 min (mornings)', frequency: 'daily', current_streak: 8, target_streak: 21, started_on: '2026-05-02', category: 'health' },
      { user_id: uid, name: 'Afternoon nap when Tomi naps', frequency: 'daily', current_streak: 10, target_streak: 21, started_on: '2026-04-30', category: 'health' },
      { user_id: uid, name: 'Evening gratitude – write 3 things while Tomi sleeps', frequency: 'daily', current_streak: 14, target_streak: 30, started_on: '2026-04-24', category: 'mind' },
      { user_id: uid, name: 'Legal CPD module – 30 min/week on mat leave', frequency: 'weekly', current_streak: 4, target_streak: 12, started_on: '2026-04-14', category: 'learning' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'CPD module: Nigerian Family Law updates 2025', started_at: '2026-05-09T14:00:00Z', ended_at: '2026-05-09T14:40:00Z', notes: 'Tomi napped 90 minutes — productive window' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 30, actual_minutes: 28, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Research daycare centres near chambers, Abuja', started_at: '2026-05-07T15:00:00Z', ended_at: '2026-05-07T15:28:00Z' },
    ])
  }

  // Mood logs — warm, tired but content
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 3, note: 'Tomi smiled at me for the first time this morning. I cried happy tears. Nothing prepares you for this.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Rough night — three wake-ups. But we got through the morning together. Recovery is non-linear.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Postnatal physio session was so helpful. My body is healing. I am allowed to heal slowly.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Good paediatrician check — Tomi is 5.4 kg, thriving. I am doing this right.', logged_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Ade bathed Tomi tonight so I could rest. Grateful for partnership. We are a team.', logged_at: '2026-05-03T21:00:00Z' },
    ])
  }

  // Gratitude entries — warm and specific
  const gratitudeDates = [
    { date: '2026-05-09', items: ["Tomi's first real smile — unforgettable", 'Husband Ade made breakfast without me asking', 'Three hours of unbroken sleep last night — felt like luxury'] },
    { date: '2026-05-08', items: ['Postnatal yoga felt good in my body', 'Neighbour Auntie Ngozi brought stew — kindness matters', 'Tomi cooed softly while I sang — our conversation'] },
    { date: '2026-05-07', items: ['Paediatrician says Tomi is developing beautifully', 'CPD module done — I still have a legal mind', 'Quiet afternoon nap in the hammock chair with Tomi on my chest'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — motherhood, identity, gentle return-to-work thoughts
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Three months. Tomi is three months old today and I feel like a completely different person — in the most profound way. The law seems very far away and also, somehow, very steady in the background. Like knowing your profession is still yours, patiently waiting, while you do the most important work of your life right now.", mood_tag: 'reflective', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "I want to be honest: the postnatal period is harder than anything the bar exam ever asked of me. The sleep interruptions, the emotional peaks, the way my body is reclaiming itself slowly. But every time Tomi locks eyes with me, I understand why this is also the most beautiful thing. I am allowed to hold both truths.", mood_tag: 'honest', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "Thinking about October. Ade and I have shortlisted three crèches near the chambers — Sunshine Montessori, BrightStart Maitama, and Little Roots. Need to visit them all. The transition will be hard for me probably more than for Tomi. But she will thrive. And I will too.", mood_tag: 'planning', created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Return to chambers October 2026 as planned or request 3-month extension of mat leave?',
        options: JSON.stringify([
          { label: 'Return October 2026 as planned (6 months total)', pros: ['Income resumes – full salary', 'Career momentum maintained', 'Childcare at 6 months is well-documented as manageable'], cons: ['Tomi only 6 months old', 'Emotional difficulty of separation', 'Childcare logistics still being sorted'] },
          { label: 'Request 3-month extension (return January 2027)', pros: ['More time with Tomi', 'Full 9-month bonding period', 'Childcare options more settled'], cons: ['Extended unpaid period (or reduced pay)', 'Longer career gap', 'Need to confirm chambers will accommodate'] },
        ]),
        result: JSON.stringify({ decision: 'Return October 2026 but negotiate part-time arrangement for first 3 months', reasoning: 'Full mat leave extension financially uncertain. Part-time return protects career, income, and gives gradual childcare transition for Tomi.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Contacts — husband, paediatrician, childcare researcher
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Adewale Adeyinka', group_name: 'Family', phone: '234-803-555-0111', notes: 'Husband. Software engineer. Paternity leave ends May 31. Partner in all Tomi caregiving.' },
      { user_id: uid, name: 'Dr. Folake Obi', group_name: 'Healthcare', phone: '234-809-555-0188', notes: 'Tomi\'s paediatrician at Garki Hospital. Monthly check-ups. Next visit June 9.' },
      { user_id: uid, name: 'Auntie Ngozi', group_name: 'Family network', notes: 'Neighbour and mother figure. Reliable support. Brings food. Trust completely.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Return to family law practice – part-time October 2026', category: 'role', status: 'active', target_date: '2026-10-01', progress_pct: 10, notes: 'Chambers principal supportive of part-time arrangement. Formal request to be submitted August.' },
      { user_id: uid, title: 'Complete 3 CPD modules during mat leave', category: 'learning', status: 'active', target_date: '2026-09-30', progress_pct: 33, notes: '1 of 3 modules complete. Family Law + Employment Law + ADR planned.' },
    ])
  }

  // Investments
  if (await cnt('investments', uid) < 2) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Family emergency fund – Zenith Bank savings', type: 'savings', invested_amount: 320000, current_value: 320000, account: 'Zenith Bank' },
      { user_id: uid, name: 'ARM Pension RSA', type: 'other', invested_amount: 840000, current_value: 880000, account: 'ARM Pension' },
    ])
  }

  // AURA profile — Tomi (12 weeks)
  const { count: auraCount } = await sb.from('aura_profiles').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!auraCount) {
    await sb.from('aura_profiles').insert({
      user_id: uid,
      data: {
        full_name: 'Oluwatobi "Tomi" Adeyinka',
        date_of_birth: '2026-02-08',
        age_weeks: 12,
        notes: 'Infant, 3 months. Breastfed. Immunisations up to date. Paediatrician: Dr. Folake Obi, Garki Hospital. Next check-up June 9.',
      },
    })
  }

  console.log('✓ Bisi Adeyinka seeded')
}
seedBisi().catch(e => { console.error(e); process.exit(1) })
