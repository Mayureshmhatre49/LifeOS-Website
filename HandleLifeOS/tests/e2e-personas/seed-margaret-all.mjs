// Margaret Sutherland — Stage IV cancer, Edinburgh Scotland. Retired headteacher.
// TONE RULES: Short-horizon goals only. Dignified, honest tone. NO toxic positivity.
// Vault contains end-of-life documents. Goals are realistic and meaningful, not aspirational.
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

const EMAIL = 'margaret.sutherland@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedMargaret() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile — short-horizon, honest goals
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Margaret Sutherland',
    occupation: 'Retired Headteacher',
    life_stage: 'retired',
    country: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    goals: [
      'Complete my memoir — chapters for the grandchildren',
      'Make the trip to Skye with Claire in July while I am well enough',
      'Ensure all legal and financial arrangements are in order for Claire',
      'Write letters to former pupils I still think about',
      'Have as many good days at home as possible',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets — GBP 2,400/month teacher pension
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 850, spent: 850 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 400, spent: 380 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 400, spent: 360 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 200, spent: 195 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 150, spent: 110 },
    { user_id: uid, month: 5, year: 2026, category: 'misc', amount: 200, spent: 142 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 850, category: 'rent', description: 'May rent – Morningside flat, Edinburgh', expense_date: '2026-05-01' },
      { user_id: uid, amount: 220, category: 'health', description: 'Macmillan nurse home visit + prescription collection', expense_date: '2026-05-06' },
      { user_id: uid, amount: 160, category: 'health', description: 'Monthly palliative medication (NHS co-payment)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 195, category: 'utilities', description: 'Gas + electricity + broadband May', expense_date: '2026-05-03' },
      { user_id: uid, amount: 45, category: 'entertainment', description: 'New audiobooks – Claire set up the subscription', expense_date: '2026-05-05' },
      { user_id: uid, amount: 65, category: 'food', description: 'M&S food delivery – easy to prepare meals', expense_date: '2026-05-07' },
      { user_id: uid, amount: 142, category: 'misc', description: 'Stationery, memoir printing, letter stamps', expense_date: '2026-05-08' },
    ])
  }

  // Habits — gentle, sustainable, medically appropriate
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Morning gentle walk – 15 minutes when able', frequency: 'daily', current_streak: 4, target_streak: 7, started_on: '2026-05-04', category: 'health' },
      { user_id: uid, name: 'Medication schedule – morning and evening', frequency: 'daily', current_streak: 28, target_streak: 30, started_on: '2026-04-08', category: 'health' },
      { user_id: uid, name: 'Memoir writing – one paragraph or more', frequency: 'daily', current_streak: 11, target_streak: 30, started_on: '2026-04-27', category: 'mind' },
      { user_id: uid, name: 'Evening letter – write to a former pupil or friend', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-22', category: 'mind' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 2) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'pomodoro', planned_minutes: 45, actual_minutes: 38, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Memoir – Chapter 8: Beechwood Primary (1998–2006)', started_at: '2026-05-09T10:30:00Z', ended_at: '2026-05-09T11:08:00Z', notes: 'Good morning, felt clear' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 30, actual_minutes: 20, completed: false, abandoned: true, body_doubling_enabled: false, task_title: 'Review Skye accommodation options for July trip', notes: 'Tired after lunch, will return to this tomorrow', started_at: '2026-05-07T14:00:00Z', ended_at: '2026-05-07T14:20:00Z' },
    ])
  }

  // Mood logs — honest, dignified, not performatively positive
  if (await cnt('mood_logs', uid) < 5) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 3, energy: 3, note: 'A good morning. Wrote two pages of the memoir. Afternoon tired.', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 2, energy: 2, note: 'Hard day. Pain managed but energy very low. Claire phoned. That helped.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Macmillan nurse visit — Margaret (nurse) is wonderful. She doesn\'t offer false comfort, just presence.', logged_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Lovely afternoon. Sunshine in the garden. Audiobook. Cup of tea. Some days are still good.', logged_at: '2026-05-06T20:00:00Z' },
      { user_id: uid, mood: 2, energy: 1, note: 'Difficult night. This is the reality of where I am. I am not pretending otherwise.', logged_at: '2026-05-04T20:00:00Z' },
    ])
  }

  // Gratitude entries — honest and specific
  const gratitudeDates = [
    { date: '2026-05-09', items: ['Two good pages of the memoir this morning', 'Sunshine through the kitchen window at breakfast', 'The daffodils Claire planted in the garden are out'] },
    { date: '2026-05-08', items: ["Claire's phone call at 6pm — she always knows when to ring", 'Pain was lower than yesterday — days differ', 'My favourite audiobook narrator has the right voice'] },
    { date: '2026-05-07', items: ['Macmillan nurse Margaret — her competence and kindness together', 'Cup of Earl Grey in the good china — small things matter', 'Remembered a former pupil today — Hamish, who became a vet — and smiled'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries — dignified, reflective, no toxic positivity
  if (await cnt('journal_entries', uid) < 4) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "I have been writing about my first year at Beechwood Primary in 1987. I was thirty-two. So certain I knew how things ought to be done. The children were more patient with me than I deserved. I think that is what teaching teaches you, eventually — that the learning runs both ways.", mood_tag: 'reflective', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: "Claire asked today if I was frightened. I thought about it honestly and said: of pain, yes. Of dying, less than I expected. Of leaving things unfinished — yes, that is the harder one. The memoir and the letters feel necessary. Not for legacy, precisely. More like tidying a room before you leave it.", mood_tag: 'honest', created_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, content: "The solicitor confirmed the Power of Attorney documents are registered. Will is up to date. I have written the instruction letter for the flat and the contents. There is a particular relief in having things in order. I taught my pupils to leave things as they found them. I am trying to do the same.", mood_tag: 'grounded', created_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, content: "Still planning Skye for July. Tarbert, if I am well enough. Claire will drive. I want to see the Cuillin once more from the ferry. Some wants are very simple.", mood_tag: 'peaceful', created_at: '2026-05-04T21:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Continue palliative care at home or consider a hospice placement?',
        options: JSON.stringify([
          { label: 'Continue at home (current arrangement)', pros: ['My flat, my things, my independence', 'Macmillan nurse visiting 3x/week', 'Claire nearby'], cons: ['Claire\'s increasing carer burden', 'Medical escalation at home is harder to manage', 'Isolation in difficult nights'] },
          { label: 'Hospice placement when appropriate', pros: ['24-hour specialist care', 'Relief for Claire', 'Professional pain management'], cons: ['Not home', 'Transition timing is uncertain and emotional'] },
        ]),
        result: JSON.stringify({ decision: 'Remain at home for now; review with palliative team in August and plan hospice transition criteria jointly', reasoning: 'Home matters enormously. But planning the transition thoughtfully — rather than in crisis — is the considerate choice for Claire and for my own peace of mind.' }),
        mode: 'analyze',
        favorite: true,
      },
    ])
  }

  // Contacts — daughter, Macmillan nurse, solicitor
  if (await cnt('contacts', uid) < 3) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Claire Sutherland', group_name: 'Family', phone: '0131-555-0144', notes: 'Daughter (46). Primary next of kin and Power of Attorney holder. Lives in Leith. Visits twice weekly.' },
      { user_id: uid, name: 'Margaret (Macmillan Nurse)', group_name: 'Healthcare', phone: '0131-555-0199', notes: 'Macmillan palliative nurse. Home visits Mon/Wed/Fri. Excellent care and honest communication.' },
      { user_id: uid, name: 'David Innes', group_name: 'Legal', email: 'dinnes@innessolicitors.co.uk', notes: 'Solicitor. Will, POA, and estate matters all confirmed. Executor: Claire Sutherland.' },
    ])
  }

  // Career goals — short-horizon, meaningful, achievable
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Complete memoir draft (all 12 chapters)', category: 'other', status: 'active', target_date: '2026-08-31', progress_pct: 58, notes: '7 of 12 chapters drafted. Chapters 8-12 cover headteacher years. Targeting one page per day.' },
      { user_id: uid, title: 'Write letters to 20 former pupils I remember', category: 'other', status: 'active', target_date: '2026-07-31', progress_pct: 40, notes: '8 letters written and posted. Receiving beautiful replies. This was the right thing to do.' },
    ])
  }

  // Investments — teacher pension as primary
  if (await cnt('investments', uid) < 1) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Scottish Teachers Pension (STPS)', type: 'other', invested_amount: 198000, current_value: 198000, account: 'Scottish Teachers Superannuation Scheme' },
    ])
  }

  // Trip — Skye, gentle, meaningful
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Isle of Skye',
      country: 'GB',
      starts_on: '2026-07-14',
      ends_on: '2026-07-17',
      budget_total: 800,
      status: 'planning',
      purpose: 'leisure',
      notes: 'Trip with daughter Claire. Gentle pace — no walking further than I can manage. Want to see the Cuillin from the ferry one more time.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'transport', title: 'Drive Edinburgh → Skye with Claire (accessible stops)', starts_at: '2026-07-14T09:00:00Z', ends_at: '2026-07-14T14:00:00Z', cost: 120 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Tarbert Guest House, Harris (quiet, ground floor room)', starts_at: '2026-07-14T15:00:00Z', ends_at: '2026-07-17T11:00:00Z', cost: 450 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Ferry crossing – view of the Cuillin', starts_at: '2026-07-15T10:00:00Z', ends_at: '2026-07-15T11:30:00Z', cost: 25 },
        { trip_id: trip.id, user_id: uid, type: 'restaurant', title: 'Dinner with Claire – Three Chimneys, Colbost', starts_at: '2026-07-15T19:00:00Z', ends_at: '2026-07-15T21:00:00Z', cost: 185 },
      ])
    }
  }

  console.log('✓ Margaret Sutherland seeded')
}
seedMargaret().catch(e => { console.error(e); process.exit(1) })
