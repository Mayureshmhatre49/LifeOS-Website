// Connor McGrath — 14 months sober, Cork Ireland. Construction PM.
// SAFETY RULES: NO alcohol references anywhere. Sober date 2025-03-02 (435 days as of 2026-05-11).
// AA contacts listed as 'support network friends'. Sobriety habit is a positive streak, not shame-based.
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

const EMAIL = 'connor.mcgrath@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedConnor() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Connor McGrath',
    occupation: 'Construction Project Manager',
    life_stage: 'mid_career',
    country: 'IE',
    currency: 'EUR',
    timezone: 'Europe/Dublin',
    goals: [
      'Maintain 435+ days of sobriety and grow stronger in my recovery',
      'Complete Mental Health First Aid certification by September 2026',
      'Save EUR 20,000 towards house deposit by December 2027',
      'Earn Senior Project Manager qualification (SCSI accreditation)',
      'Run the Cork City Marathon in October 2026',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — EUR 5,200/month net
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 1400, spent: 1400 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 500, spent: 460 },
    { user_id: uid, month: 5, year: 2026, category: 'transport', amount: 200, spent: 175 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 250, spent: 220 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 200, spent: 188 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 150, spent: 98 },
    { user_id: uid, month: 5, year: 2026, category: 'investment', amount: 800, spent: 800 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 1400, category: 'rent', description: 'May rent – apartment, Douglas, Cork', expense_date: '2026-05-01' },
      { user_id: uid, amount: 95, category: 'health', description: 'Therapist session – bi-weekly', expense_date: '2026-05-06' },
      { user_id: uid, amount: 125, category: 'health', description: 'Running shoes replacement (marathon training)', expense_date: '2026-05-08' },
      { user_id: uid, amount: 188, category: 'utilities', description: 'ESB + broadband + phone May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 75, category: 'entertainment', description: 'Kindle book subscription + one-off book', expense_date: '2026-05-05' },
      { user_id: uid, amount: 460, category: 'food', description: 'Dunnes + SuperValu groceries May', expense_date: '2026-05-07' },
      { user_id: uid, amount: 800, category: 'investment', description: 'House deposit savings + pension May', expense_date: '2026-05-15' },
    ])
  }

  // Habits — sobriety as positive streak; support group listed neutrally
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Daily sobriety commitment – 435 days and counting', frequency: 'daily', current_streak: 435, target_streak: 500, started_on: '2025-03-02', category: 'mind' },
      { user_id: uid, name: 'Morning run – 5 km (marathon training)', frequency: 'daily', current_streak: 22, target_streak: 60, started_on: '2026-04-16', category: 'health' },
      { user_id: uid, name: 'Weekly support group meeting (Wednesday evenings)', frequency: 'weekly', current_streak: 14, target_streak: 52, started_on: '2025-03-05', category: 'mind' },
      { user_id: uid, name: 'Gratitude journal – three things before bed', frequency: 'daily', current_streak: 30, target_streak: 60, started_on: '2026-04-08', category: 'mind' },
      { user_id: uid, name: 'Mental Health First Aid study – 2 hrs/week', frequency: 'weekly', current_streak: 5, target_streak: 12, started_on: '2026-04-01', category: 'learning' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Tender document review – Mahon mixed-use development', started_at: '2026-05-09T08:30:00Z', ended_at: '2026-05-09T09:58:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'MHFA study – Module 2: Recognising Signs of Distress', started_at: '2026-05-08T19:00:00Z', ended_at: '2026-05-08T19:55:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 45, actual_minutes: 45, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Cork City Marathon training plan review', started_at: '2026-05-07T07:00:00Z', ended_at: '2026-05-07T07:45:00Z' },
    ])
  }

  // Mood logs — improving trajectory
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: '435 days today. Anniversary chip on Wednesday. Steady and proud.', logged_at: '2026-05-11T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Good run this morning — 7 km, fastest pace in months. Marathon is realistic.', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Promotion conversation with the director. A lot to think about. Travel would be hard right now.', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Wednesday meeting was good. Ciaran shared something I needed to hear.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Steady day. Work is going well. Reading tonight. Early bed.', logged_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Gratitude entries
  const gratitudeDates = [
    { date: '2026-05-09', items: ['435 days — more than I ever thought possible', 'Best 7km run time this year', 'Project team got great feedback from the client today'] },
    { date: '2026-05-08', items: ['Good MHFA session — this knowledge will help people', 'Paddy called to check in — great friend', 'Clear head, strong focus at work'] },
    { date: '2026-05-07', items: ['Wednesday evening group — Ciaran\'s honesty helped me', 'Superb roast chicken I made from scratch', 'Killarney trip booked — something to look forward to'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — recovery, career, grounded tone
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "435 days as of today. I remember being at 7 days and thinking 30 was impossible. Then 30 thinking 90 was impossible. The math of recovery is strange — it compounds. The morning run is part of it now. The Wednesday group is part of it. So is this journal. Steady as she goes.", mood_tag: 'proud', created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, content: "Director offered me the Senior PM role — significant pay increase. But it comes with 50% travel. I had to be honest with myself: my Wednesday nights, my routines, my support structure — they're not negotiable. Not right now. I'm not ready to trade what I've built for a title. That's not weakness. That's knowing myself.", mood_tag: 'grounded', created_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, content: "Mental Health First Aid is something I've been drawn to since I needed it myself. If I'd had someone around who knew what to look for, things might have been different earlier. I can be that person for someone now. The certification means something beyond the qualification.", mood_tag: 'purposeful', created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Accept promotion to Senior PM (50% travel) vs. stay in current role?',
        options: JSON.stringify([
          { label: 'Accept Senior PM promotion', pros: ['EUR 1,400/month salary increase', 'Career progression', 'Greater responsibility'], cons: ['50% travel disrupts routine', 'Wednesday support group at risk', 'Travel is high-risk environment in early recovery'] },
          { label: 'Decline now, revisit in 12 months', pros: ['Recovery routines protected', 'Stability maintained', 'Can negotiate terms better with more sobriety time'], cons: ['Salary increase delayed', 'May lose the window'] },
        ]),
        result: JSON.stringify({ decision: 'Decline for now; counter-propose for a re-evaluation at 24-month sobriety mark (March 2027)', reasoning: 'Recovery stability is non-negotiable at this stage. 12 more months adds significant resilience and negotiating confidence. Career can wait; recovery cannot.' }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Investments
  if (await cnt('investments', uid) < 2) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'House deposit savings – AIB Regular Saver', type: 'savings', invested_amount: 6400, current_value: 6450, account: 'AIB Regular Saver' },
      { user_id: uid, name: 'Cornmarket Executive Pension', type: 'other', invested_amount: 12000, current_value: 13200, account: 'Cornmarket Pension' },
    ])
  }

  // Contacts — support network framing, no explicit AA reference
  if (await cnt('contacts', uid) < 3) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Ciaran Walsh', group_name: 'Support network', notes: 'Close friend and support network anchor. Wednesday evenings. Trust completely.' },
      { user_id: uid, name: 'Paddy McGrath', group_name: 'Family', phone: '021-555-0133', notes: 'Older brother. Checks in weekly. Lives in Limerick. Good relationship now.' },
      { user_id: uid, name: 'Dr. Siobhan Kelly', group_name: 'Healthcare', phone: '021-555-0177', notes: 'Therapist. Bi-weekly sessions, Tuesday 5pm. Douglas Practice.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'SCSI Senior PM Qualification', category: 'skill', status: 'active', target_date: '2027-03-01', progress_pct: 35, notes: 'Portfolio evidence gathering. Supervisor signed off on three projects.' },
      { user_id: uid, title: 'Mental Health First Aid certification', category: 'learning', status: 'active', target_date: '2026-09-01', progress_pct: 40, notes: 'Module 2 of 5 complete. In-person assessment September 12.' },
    ])
  }

  // Trip — Killarney nature weekend (recovery-supportive, no social triggers)
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Killarney',
      country: 'IE',
      starts_on: '2026-06-13',
      ends_on: '2026-06-15',
      budget_total: 500,
      status: 'booked',
      purpose: 'leisure',
      notes: 'Weekend nature break — hiking the Gap of Dunloe with Paddy. Booked accommodation with self-catering kitchen. Good reset before marathon training peak.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'transport', title: 'Cork → Killarney (train, Bus Éireann)', starts_at: '2026-06-13T09:00:00Z', ends_at: '2026-06-13T11:00:00Z', cost: 28 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Gap of Dunloe Guesthouse (self-catering room)', starts_at: '2026-06-13T14:00:00Z', ends_at: '2026-06-15T11:00:00Z', cost: 240 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Gap of Dunloe hike (full day)', starts_at: '2026-06-14T08:00:00Z', ends_at: '2026-06-14T17:00:00Z', cost: 0 },
      ])
    }
  }

  console.log('✓ Connor McGrath seeded')
}
seedConnor().catch(e => { console.error(e); process.exit(1) })
