// Aanya Verma — 16yo minor, Pune India. Class 11 JEE aspirant.
// MINOR RULES: INR 1,500/month pocket money ONLY. NO financial products/investments/bank data.
// NO decision logs with financial implications. Goals: JEE prep, engineering colleges, scholarships.
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

const EMAIL = 'aanya.verma@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedAanya() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — student, minor
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Aanya Verma',
    occupation: 'Class 11 Student (JEE Aspirant)',
    life_stage: 'student',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    goals: [
      'Crack JEE Advanced 2027 — target IIT Bombay or IIT Delhi Computer Science',
      'Score above 95% in Class 12 Board Exams (March 2027)',
      'Research scholarship options for IIT and NIT colleges',
      'Improve Physics problem-solving speed for JEE Mains timing',
      'Complete Class 11 syllabus by December 2026 with full revision',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — pocket money only, very small
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 600, spent: 540 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 300, spent: 260 },
    { user_id: uid, month: 5, year: 2026, category: 'education', amount: 400, spent: 400 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 200, spent: 145 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses — small, age-appropriate (stationery, canteen, transport, study materials)
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 400, category: 'education', description: 'Physics reference book – DC Pandey Optics & Modern Physics', expense_date: '2026-05-04' },
      { user_id: uid, amount: 260, category: 'transport', description: 'PMPML bus pass – school and coaching centre', expense_date: '2026-05-01' },
      { user_id: uid, amount: 85, category: 'food', description: 'School canteen – lunch 3 days + chai with friends', expense_date: '2026-05-08' },
      { user_id: uid, amount: 55, category: 'food', description: 'Notebook + gel pens (stationery)', expense_date: '2026-05-05' },
      { user_id: uid, amount: 145, category: 'entertainment', description: 'Spotify Premium student + movie with Priya', expense_date: '2026-05-07' },
    ])
  }

  // Habits — JEE prep-focused, consistent study schedule
  if (await cnt('habits', uid) < 5) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'JEE Physics practice – 90 min morning', frequency: 'daily', current_streak: 22, target_streak: 30, started_on: '2026-04-16', category: 'learning' },
      { user_id: uid, name: 'JEE Maths practice – 90 min afternoon', frequency: 'daily', current_streak: 22, target_streak: 30, started_on: '2026-04-16', category: 'learning' },
      { user_id: uid, name: 'JEE Chemistry revision – 60 min evening', frequency: 'daily', current_streak: 18, target_streak: 30, started_on: '2026-04-20', category: 'learning' },
      { user_id: uid, name: 'Weekly mock test – full 3-hour JEE paper', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-29', category: 'learning' },
      { user_id: uid, name: '10-min mindful break between study sessions', frequency: 'daily', current_streak: 10, target_streak: 21, started_on: '2026-04-28', category: 'mind' },
    ])
  }

  // Focus sessions — study sessions (50-min deep work blocks)
  if (await cnt('focus_sessions', uid) < 5) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'JEE Physics – Electrostatics (Coulomb\'s Law problems)', started_at: '2026-05-09T06:30:00Z', ended_at: '2026-05-09T07:58:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'JEE Maths – Integral Calculus (definite integrals sheet)', started_at: '2026-05-09T15:00:00Z', ended_at: '2026-05-09T16:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 48, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'JEE Chemistry – Organic reaction mechanisms', notes: 'Got stuck on SN2 mechanism, will revisit with coaching notes', started_at: '2026-05-09T19:00:00Z', ended_at: '2026-05-09T19:48:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 180, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Weekly mock test – JEE Mains Paper 1', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T12:00:00Z', notes: 'Score: 198/300. Physics 72, Chemistry 58, Maths 68.' },
    ])
  }

  // Mood logs — teen mood, variable but resilient
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 3, note: 'Mock test went okay. Physics was better this week. Maths needs more practice.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Coaching class was intense. Understood Faraday\'s law finally. Felt good.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Bad day. Couldn\'t focus. Chemistry is my weak point. Feeling behind.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Solved 15 integration problems without looking at answers. Progress!', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'School day. History class was nice break from JEE stress. Normal day.', logged_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Gratitude entries — age-appropriate
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Physics mock score improved by 8 marks from last week', 'Priya explained the integration trick she uses — so helpful', 'Papa surprised me with DC Pandey book I wanted'] },
    { date: '2026-05-08', items: ['Finally understood Faraday\'s Law — clicked today', 'Coaching sir gave me extra problems on my weak areas (kind of him)', 'Hot chai and pakoras at home after coaching — simple happiness'] },
    { date: '2026-05-07', items: ['Even a bad study day is one more day of effort', 'Mama gave me a tight hug when she saw I was stressed', 'IIT Bombay campus tour video — re-watched it, motivation restored'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — honest teen voice, study stress, dreams
  if (await cnt('journal_entries', uid) < 4) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Weekly mock: 198/300. My target is 250+ by December. Physics is getting better — 72 this week vs. 58 last month. Chemistry is dragging me down. SN2 mechanism just does not make intuitive sense to me yet. Going to ask sir tomorrow to explain it from electron movement perspective, not just memorisation.", mood_tag: 'determined', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "Sometimes I feel like everyone around me already knows exactly what they want and I'm the only one still figuring it out. But then I open my JEE notes and I actually do know — Computer Science, IIT Bombay. That specific. The clarity comes back when I work. So I work.", mood_tag: 'reflective', created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: "Found out about the IIT scholarship for girls in STEM — covers 50% of hostel fees for academically meritorious students. Going to apply. Also the KVPY (now INSPIRE) scholarship is worth researching. If I crack both JEE and KVPY, it would seriously change the cost conversation for my parents.", mood_tag: 'motivated', created_at: '2026-05-05T22:00:00Z' },
      { user_id: uid, content: "Had a real conversation with Priya today. She's also targeting IIT Delhi Maths. We're going to start a study group on Saturdays — Physics problems together. Two brains on HC Verma. Let's see if it helps.", mood_tag: 'hopeful', created_at: '2026-05-03T22:00:00Z' },
    ])
  }

  // Decision logs — study-related only, no financial decisions
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Keep current study schedule (self-study heavy) or join Aakash Byju\'s full-time batch?',
        options: JSON.stringify([
          { label: 'Continue current schedule (coaching 4 hrs/week + self-study)', pros: ['Self-paced', 'Already seeing progress', 'Less travel fatigue', 'More time for deep focus'], cons: ['Less structure than batch', 'No peer competitive environment'] },
          { label: 'Join Aakash full-time batch (6 hrs/day)', pros: ['Structured curriculum', 'Competitive peer group', 'Expert faculty for doubts'], cons: ['Exhausting schedule — risk of burnout', 'Travel 2 hrs/day', 'Less time for self-analysis of mistakes'] },
        ]),
        result: JSON.stringify({ decision: 'Continue current schedule; add one weekly doubt-clearing session at Aakash', reasoning: 'Mock score improving 8+ marks per week on current model. Full batch would sacrifice self-study time which is highest-value learning mode for this profile.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Contacts — friends and teachers only
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Priya Joshi', group_name: 'Friend', notes: 'Best friend and study partner. IIT Delhi Maths aspirant. Saturday study group.' },
      { user_id: uid, name: 'Rahul Sir (Physics Coach)', group_name: 'Academic', notes: 'Physics coaching teacher. Excellent at concept explanations. Can approach for doubts.' },
    ])
  }

  // Career goals — age-appropriate academic goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Achieve JEE Mains score above 250/300', category: 'learning', status: 'active', target_date: '2027-01-15', progress_pct: 33, notes: 'Current mock: 198/300. Target 250 by December. Physics improving; Chemistry focus Q3.' },
      { user_id: uid, title: 'Apply for INSPIRE scholarship (KVPY successor)', category: 'other', status: 'active', target_date: '2026-09-30', progress_pct: 5, notes: 'Research eligibility and application window. Talk to school guidance counsellor.' },
    ])
  }

  console.log('✓ Aanya Verma seeded')
}
seedAanya().catch(e => { console.error(e); process.exit(1) })
