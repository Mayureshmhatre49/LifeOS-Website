/**
 * Seed Mental Health + Nutrition data for Fatima Al-Rashid (E2E test persona).
 * Persona: 38yo Dubai healthcare consultant, two kids (Layla 9, Omar 5).
 * Run: node tests/e2e-personas/seed-fatima-mind-nutrition.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let step = 0
function ok(label, count) {
  console.log(`  ✔  [${++step}] ${label}${count != null ? ` (${count} rows)` : ''}`)
}
function skip(label) {
  console.log(`  ⬜  [${++step}] ${label} — already exists, skipped`)
}
function warn(label, msg) {
  console.log(`  ⚠  [${++step}] ${label} skipped — ${msg}`)
}

async function countRows(table, uid) {
  const { count } = await db.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function seed() {
  // ── 0. Resolve user ───────────────────────────────────────────────────────────
  const { data: user, error: ue } = await db
    .from('users').select('id').eq('email', 'fatima.alrashid@e2e-test.handlelifeos.app').single()
  if (ue || !user) { console.error('Cannot find Fatima:', ue?.message); process.exit(1) }
  const uid = user.id
  console.log(`\n👤  Fatima uid: ${uid}\n`)

  // ═══════════════════════════════════════════════════════════════════════════════
  //  MENTAL HEALTH
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('🧠  Mental Health\n')

  // ── 1. Mind settings ─────────────────────────────────────────────────────────
  if (await countRows('mind_settings', uid) === 0) {
    const { error } = await db.from('mind_settings').insert({
      user_id:                uid,
      reminder_time:          '21:30',
      voice_enabled:          false,
      notifications_enabled:  true,
    })
    if (error) throw error
    ok('Mind settings (reminder 21:30)')
  } else { skip('Mind settings') }

  // ── 2. Mood logs — 21 entries across 3 weeks ─────────────────────────────────
  if (await countRows('mood_logs', uid) === 0) {
    // energy + stress_categories columns added by phase7 migration — omit if not yet applied
    const moodLogs = [
      // Week of April 20–26
      { mood: 3, stress: 3, emotions: ['tired','neutral'],               note: 'Long shift — back-to-back consultations.',                          logged_at: '2026-04-20T21:45:00Z' },
      { mood: 4, stress: 2, emotions: ['grateful','calm'],               note: 'Good morning walk with Omar before school.',                        logged_at: '2026-04-21T22:00:00Z' },
      { mood: 2, stress: 4, emotions: ['anxious','overwhelmed'],         note: 'Deadline + Layla\'s parent evening on same day. Too much.',         logged_at: '2026-04-22T23:10:00Z' },
      { mood: 3, stress: 3, emotions: ['neutral','focused'],             note: 'Got through the day. Made a proper dinner.',                        logged_at: '2026-04-23T22:30:00Z' },
      { mood: 4, stress: 2, emotions: ['happy','content'],               note: 'Friday! Took kids to the park after school. Omar laughed so much.', logged_at: '2026-04-24T21:15:00Z' },
      { mood: 5, stress: 1, emotions: ['joyful','refreshed','grateful'], note: 'Family brunch, pool time. These are the days I do this all for.',   logged_at: '2026-04-25T20:00:00Z' },
      { mood: 4, stress: 2, emotions: ['peaceful','content'],            note: 'Slow Sunday. Cooked mansaf, watched a show after kids slept.',      logged_at: '2026-04-26T21:40:00Z' },
      // Week of April 27 – May 3
      { mood: 3, stress: 3, emotions: ['neutral','determined'],          note: 'New week. Heavy project review but stayed on top of it.',           logged_at: '2026-04-27T22:05:00Z' },
      { mood: 3, stress: 4, emotions: ['tired','stressed'],              note: 'Slight headache all day. Forgot to eat lunch properly.',            logged_at: '2026-04-28T23:00:00Z' },
      { mood: 4, stress: 2, emotions: ['focused','motivated'],           note: 'Consulting session went really well. Client happy.',                logged_at: '2026-04-29T21:30:00Z' },
      { mood: 4, stress: 2, emotions: ['grateful','calm'],               note: 'Layla showed me her art project. So proud.',                       logged_at: '2026-04-30T22:15:00Z' },
      { mood: 3, stress: 3, emotions: ['neutral','tired'],               note: 'Omar had a cold. Interrupted sleep. Managing.',                    logged_at: '2026-05-01T22:45:00Z' },
      { mood: 3, stress: 2, emotions: ['okay','grounded'],               note: 'Quiet Friday. Worked from home, felt more balanced.',              logged_at: '2026-05-02T21:00:00Z' },
      { mood: 4, stress: 1, emotions: ['energised','happy'],             note: 'Gym session in the morning, felt amazing. Kids were great.',       logged_at: '2026-05-03T20:30:00Z' },
      // Week of May 4–9
      { mood: 3, stress: 3, emotions: ['okay','focused'],                note: 'Back to the grind. Big report due Wednesday.',                     logged_at: '2026-05-04T22:00:00Z' },
      { mood: 3, stress: 4, emotions: ['stressed','tired'],              note: 'Report + school science fair prep = chaos. Need more hours.',      logged_at: '2026-05-05T23:30:00Z' },
      { mood: 4, stress: 2, emotions: ['relieved','proud'],              note: 'Submitted the report. Layla\'s science fair prep done. Relief.',   logged_at: '2026-05-06T21:00:00Z' },
      { mood: 4, stress: 2, emotions: ['calm','grateful'],               note: 'Took Layla to gymnastics. Watched her flip on the bar — beaming.', logged_at: '2026-05-07T21:45:00Z' },
      { mood: 3, stress: 3, emotions: ['neutral','steady'],              note: 'Thursday — almost through the week.',                              logged_at: '2026-05-08T22:10:00Z' },
      { mood: 4, stress: 2, emotions: ['hopeful','calm','grateful'],     note: 'Journalled this morning for the first time in a while. Felt good.',logged_at: '2026-05-09T10:00:00Z' },
      { mood: 4, stress: 2, emotions: ['content','happy'],               note: 'Evening: quiet house, chamomile tea, early night.',                logged_at: '2026-05-09T21:30:00Z' },
    ]
    const { error } = await db.from('mood_logs').insert(moodLogs.map(m => ({ user_id: uid, ...m })))
    if (error) throw error
    ok('Mood logs', moodLogs.length)
  } else { skip('Mood logs') }

  // ── 3. Journal entries — 10 entries ─────────────────────────────────────────
  if (await countRows('journal_entries', uid) === 0) {
    const journals = [
      {
        title:   'The weight of it all',
        content: "It\'s 11pm and the kids are finally asleep. I\'ve been running on fumes all week — the clinic report, Layla\'s parent meeting, Omar\'s dentist, and somewhere in the middle of that I was supposed to be a functioning adult.\n\nI know this is the season of life I\'m in. Two young kids, a demanding career, solo-parenting most of the time. But tonight I just felt the weight of it very clearly. Not in a dark way. Just real.\n\nI made karak chai and sat by the window for 20 minutes. No phone. Just the city lights and my thoughts. That\'s something, I think.",
        mood:    3,
        tags:    ['parenting','exhaustion','self-care','solo-parenting'],
        created_at: '2026-04-22T23:30:00Z',
      },
      {
        title:   'Why I chose this career',
        content: "A patient today — 72-year-old grandmother, barely spoke English. Her daughter translated. We were reviewing her post-operative care plan and she kept looking at me with this expression — part confusion, part trust.\n\nAt the end, her daughter said: \'She says you sound like you actually know us.\'\n\nThat\'s why. Not the title, not the salary (though the salary funds school fees and the gym, so respectfully). It\'s that moment where medicine stops being a service and becomes care.\n\nI need to remember this on the hard days.",
        mood:    5,
        tags:    ['career','purpose','gratitude','healthcare'],
        created_at: '2026-04-29T22:00:00Z',
      },
      {
        title:   'Raising Layla to know herself',
        content: "Layla asked me tonight: \'Mama, am I smart?\'\n\nI didn\'t say yes immediately. I asked her: \'What does smart mean to you?\'\n\nShe thought about it. \'Knowing things?\' Then: \'Or... knowing how to figure things out?\'\n\nWe talked for an hour. About how curiosity is a superpower. About how she\'s brave for asking questions even when she doesn\'t know the answer.\n\nI want her to know she is so much more than her grades. I want her to build that inner confidence before the world starts telling her who she is.",
        mood:    5,
        tags:    ['Layla','parenting','growth','self-worth'],
        created_at: '2026-05-01T22:00:00Z',
      },
      {
        title:   'Notes on turning 39 this year',
        content: "My birthday is in September. I\'ll be 39. That\'s somehow both nothing and everything.\n\nIn my 30s I built: a career I\'m proud of, two remarkable children, a home I love, habits I actually keep. I also lost a marriage, rebuilt my finances from scratch, and learned that \'enough\' is a radical concept in Dubai.\n\nThings I want for 39:\n- Travel somewhere alone. Just me. A hotel room, good food, silence.\n- Read more. I used to devour books.\n- Be less reactive when I\'m tired.\n- Finish the Umrah journey — this time with Layla.\n\nNot a bucket list. Just a compass.",
        mood:    4,
        tags:    ['birthday','goals','self-reflection','growth'],
        created_at: '2026-05-03T21:00:00Z',
      },
      {
        title:   'Omar\'s laugh',
        content: "Some things are too small to explain but need to be written down.\n\nOmar found a sock in the sofa today. One sock. He held it up with complete theatre and said: \'Mama. The sofa ate your foot.\'\n\nI laughed until I cried.\n\nHe\'s five and he\'s pure joy. Chaotic, demanding, sock-accusing joy. I want to remember this forever.",
        mood:    5,
        tags:    ['Omar','joy','childhood','memory'],
        created_at: '2026-05-04T22:30:00Z',
      },
      {
        title:   'Work pressure and where I put it',
        content: "This week\'s been heavy at work. New policy changes, a difficult colleague, and a report that\'s been sitting over me like a cloud.\n\nI notice what I do when I\'m stressed: I go quiet. I clean the house obsessively. I check my phone too much. I forget to eat until 3pm.\n\nNeeded to write this because I want to change the pattern. When I feel the pressure rising — step away, breathe, eat something. Not scroll Instagram and catastrophise.\n\nWrote it down. That\'s step one.",
        mood:    3,
        prompt:  'What do you notice about yourself when you\'re under pressure?',
        tags:    ['stress','work','self-awareness','patterns'],
        created_at: '2026-05-05T23:00:00Z',
      },
      {
        title:   'Relief and reset',
        content: "Submitted the quarterly report. Done.\n\nHelped Layla finish her science fair project — a full water cycle diagram with blue glitter rain. She was so pleased with herself.\n\nFelt the difference in my body when the deadline passed. Shoulders literally dropped. I hadn\'t noticed how high they\'d been.\n\nGoing to try to hold this feeling as a reminder: the pressure is temporary. The relief is real. You always get through.",
        mood:    4,
        tags:    ['relief','productivity','Layla','self-compassion'],
        created_at: '2026-05-06T21:30:00Z',
      },
      {
        title:   'Gratitude morning',
        content: "Woke up early this morning without an alarm. Made coffee. Sat outside on the balcony before the city got loud.\n\nThree things I am genuinely grateful for right now:\n1. This flat. My safe space. I chose every piece of furniture.\n2. My health. I can walk, run, breathe, feel. Not everyone gets that easily.\n3. The way Layla and Omar still reach for my hand in public, at 9 and 5. One day they won\'t. I\'m savouring it.\n\nGratitude isn\'t toxic positivity. It\'s remembering what\'s actually there.",
        mood:    4,
        prompt:  'Write about three things you are genuinely grateful for right now.',
        tags:    ['gratitude','morning','peace','mindfulness'],
        created_at: '2026-05-09T07:30:00Z',
      },
    ]
    const { error } = await db.from('journal_entries').insert(journals.map(j => ({ user_id: uid, ...j })))
    if (error) throw error
    ok('Journal entries', journals.length)
  } else { skip('Journal entries') }

  // ── 4. Gratitude entries — 14 days ──────────────────────────────────────────
  if (await countRows('gratitude_entries', uid) === 0) {
    const gratitude = [
      { date: '2026-04-26', items: ['Family brunch that felt slow and real', 'Omar\'s giggles in the pool', 'No work notifications today'] },
      { date: '2026-04-27', items: ['A good commute with a podcast I love', 'Coffee that was exactly the right temperature', 'Layla made her bed without being asked'] },
      { date: '2026-04-28', items: ['My health — even when tired, my body works', 'A colleague who covered my 4pm slot', 'Hot shower after a long shift'] },
      { date: '2026-04-29', items: ['Clients who trust me', 'Consulting income arriving on time', 'Layla reading independently in the evening'] },
      { date: '2026-04-30', items: ['Layla\'s art project — she\'s so creative', 'The breeze on the balcony this evening', 'Quiet nights when both kids sleep early'] },
      { date: '2026-05-01', items: ['Omar getting better quickly', 'Neighbours who check in', 'A warm meal I didn\'t have to rush through'] },
      { date: '2026-05-02', items: ['Working from home — no commute', 'A video call with my sister in Jordan', 'The city from my window at sunset'] },
      { date: '2026-05-03', items: ['A proper gym session', 'Both kids in good moods all day', 'Ahmed\'s voice note checking in on Omar'] },
      { date: '2026-05-04', items: ['Clear focus during the morning', 'Layla packing her own school bag', 'Finding a parking spot instantly (small win!)'] },
      { date: '2026-05-05', items: ['The human capacity to keep going', 'Omar telling me I smell like flowers', 'A to-do list that actually got shorter'] },
      { date: '2026-05-06', items: ['Report submitted and DONE', 'Layla\'s proud face over her science fair board', 'Relief — the physical kind, shoulders dropping'] },
      { date: '2026-05-07', items: ['Watching Layla do gymnastics — she\'s fearless', 'A text from a friend I haven\'t spoken to in weeks', 'Dinner that came together in 20 minutes'] },
      { date: '2026-05-08', items: ['Almost the weekend', 'Omar\'s drawing of our family (I have four arms, apparently)', 'A podcast on women in healthcare leadership'] },
      { date: '2026-05-09', items: ['Morning coffee on the balcony — silent and mine', 'My body, healthy and capable', 'This journal habit — it helps more than I admit'] },
    ]
    const { error } = await db.from('gratitude_entries').insert(gratitude.map(g => ({ user_id: uid, ...g })))
    if (error) throw error
    ok('Gratitude entries', gratitude.length)
  } else { skip('Gratitude entries') }

  // ── 5. Sleep logs — 21 entries ───────────────────────────────────────────────
  if (await countRows('sleep_logs', uid) === 0) {
    const sleepLogs = [
      { date: '2026-04-20', bedtime: '23:15', wake_time: '06:00', duration_hours: 6.75, quality: 3, notes: 'Hard to wind down — work on my mind' },
      { date: '2026-04-21', bedtime: '22:45', wake_time: '06:15', duration_hours: 7.50, quality: 4, notes: 'Good sleep, woke rested' },
      { date: '2026-04-22', bedtime: '23:45', wake_time: '06:00', duration_hours: 6.25, quality: 2, notes: 'Stressed — woke at 3am for 40 min' },
      { date: '2026-04-23', bedtime: '23:00', wake_time: '06:15', duration_hours: 7.25, quality: 3, notes: 'Better but still a bit restless' },
      { date: '2026-04-24', bedtime: '22:30', wake_time: '06:30', duration_hours: 8.00, quality: 5, notes: 'Friday, no alarm. Best sleep this week' },
      { date: '2026-04-25', bedtime: '23:00', wake_time: '07:00', duration_hours: 8.00, quality: 5, notes: 'Weekend lie-in, no kids early for once' },
      { date: '2026-04-26', bedtime: '22:45', wake_time: '06:30', duration_hours: 7.75, quality: 4, notes: 'Fell asleep reading, good quality sleep' },
      { date: '2026-04-27', bedtime: '23:00', wake_time: '06:00', duration_hours: 7.00, quality: 3, notes: 'Monday — always takes adjustment' },
      { date: '2026-04-28', bedtime: '23:30', wake_time: '06:00', duration_hours: 6.50, quality: 2, notes: 'Headache, woke with it too' },
      { date: '2026-04-29', bedtime: '22:30', wake_time: '06:15', duration_hours: 7.75, quality: 4, notes: 'Good day = good sleep' },
      { date: '2026-04-30', bedtime: '22:45', wake_time: '06:00', duration_hours: 7.25, quality: 4, notes: 'Slept well, Layla woke briefly but settled' },
      { date: '2026-05-01', bedtime: '23:00', wake_time: '05:30', duration_hours: 6.50, quality: 2, notes: 'Omar sick — woke twice to check on him' },
      { date: '2026-05-02', bedtime: '22:15', wake_time: '06:30', duration_hours: 8.25, quality: 5, notes: 'WFH Friday, slept in a little — perfection' },
      { date: '2026-05-03', bedtime: '22:30', wake_time: '07:00', duration_hours: 8.50, quality: 5, notes: 'Weekend. Gym in the morning after. Amazing.' },
      { date: '2026-05-04', bedtime: '23:15', wake_time: '06:00', duration_hours: 6.75, quality: 3, notes: 'Monday dip — couldn\'t fall asleep quickly' },
      { date: '2026-05-05', bedtime: '00:15', wake_time: '06:00', duration_hours: 5.75, quality: 2, notes: 'Up late finishing report + science fair prep. Rough.' },
      { date: '2026-05-06', bedtime: '22:00', wake_time: '06:15', duration_hours: 8.25, quality: 5, notes: 'Crashed early in relief — genuinely rested' },
      { date: '2026-05-07', bedtime: '22:30', wake_time: '06:15', duration_hours: 7.75, quality: 4, notes: 'Good quality sleep, woke calm' },
      { date: '2026-05-08', bedtime: '23:00', wake_time: '06:00', duration_hours: 7.00, quality: 3, notes: 'Nearly the weekend — slight restlessness' },
      { date: '2026-05-09', bedtime: '21:45', wake_time: '06:15', duration_hours: 8.50, quality: 5, notes: 'Early night paid off. Woke naturally before alarm.' },
    ]
    const { error } = await db.from('sleep_logs').insert(sleepLogs.map(s => ({ user_id: uid, ...s })))
    if (error) throw error
    ok('Sleep logs', sleepLogs.length)
  } else { skip('Sleep logs') }

  // ── 6. Companion session + messages (AI wellness chat) ───────────────────────
  if (await countRows('mind_companion_sessions', uid) === 0) {
    const { data: session, error: sErr } = await db.from('mind_companion_sessions').insert({
      user_id:    uid,
      mode:       'stress',
      title:      'Work pressure and the Sunday dread',
      risk_flags: [],
    }).select('id').single()
    if (sErr) throw sErr

    const { error: mErr } = await db.from('mind_companion_messages').insert([
      {
        session_id: session.id, user_id: uid, role: 'user',
        content: "I\'ve been feeling this low-level dread every Sunday evening. I know Monday is coming and I just can\'t relax properly.",
      },
      {
        session_id: session.id, user_id: uid, role: 'assistant',
        content: "That Sunday evening feeling has a name — \'Sunday scaries\' — and it\'s very common, especially for people who carry a lot of responsibility. Your nervous system is anticipating the week before it even starts.\n\nA few things that help: trying to protect Sunday afternoons as genuinely low-stimulation time (no email checks, no planning), doing something pleasant in the evening that gives you something to look forward to on Monday morning, and writing out the week\'s key priorities on Sunday night so your mind can \'set them down\'.\n\nWhat does your Sunday evening usually look like?",
      },
      {
        session_id: session.id, user_id: uid, role: 'user',
        content: "Usually getting kids ready for the week — uniforms, bags, meal prep — and then by the time they\'re asleep I\'m too tired to actually rest but too wired to sleep.",
      },
      {
        session_id: session.id, user_id: uid, role: 'assistant',
        content: "That\'s a very real tension: you finish the \'work\' of the evening and then hit a second wind that keeps you up. A few ideas:\n\n1. **Wind-down buffer** — build 20 minutes between finishing the kids\' prep and trying to sleep. Something low-stimulation: herbal tea, reading, a short breathing exercise.\n\n2. **Task capture** — jot down Monday\'s key tasks on paper so your brain isn\'t holding them.\n\n3. **Sensory anchor** — a consistent cue that signals \'the weekend isn\'t over yet\': a specific playlist, a candle, something that\'s just for you.\n\nYou\'re doing a lot. The dread often softens when we give ourselves a moment of genuine transition.",
      },
    ])
    if (mErr) throw mErr
    ok('Companion session + 4 messages')
  } else { skip('Companion session') }

  // ── 7. Tool session (breathing exercise) ─────────────────────────────────────
  if (await countRows('mind_tool_sessions', uid) === 0) {
    // pre/post intensity + mood_before/after added by phase7 migration — omit if not yet applied
    const { error } = await db.from('mind_tool_sessions').insert([
      { user_id: uid, tool_id: 'box-breathing',    completed: true, duration_s: 240 },
      { user_id: uid, tool_id: 'body-scan',         completed: true, duration_s: 600 },
      { user_id: uid, tool_id: 'gratitude-prompt',  completed: true, duration_s: 300 },
    ])
    if (error) throw error
    ok('Tool sessions (box breathing, body scan, gratitude prompt)')
  } else { skip('Tool sessions') }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  NUTRITION
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log('\n🥗  Nutrition\n')

  // ── 8. Nutrition targets ─────────────────────────────────────────────────────
  if (await countRows('nutrition_targets', uid) === 0) {
    const { error } = await db.from('nutrition_targets').insert({
      user_id:        uid,
      daily_calories: 1800,
      protein_g:      100,
      carbs_g:        180,
      fat_g:          65,
      diet_type:      'mediterranean',
      allergies:      [],
    })
    if (error) throw error
    ok('Nutrition targets (1800 kcal, Mediterranean)')
  } else { skip('Nutrition targets') }

  // ── 9. Recipes (6) ──────────────────────────────────────────────────────────
  let recipeIds = {}
  if (await countRows('recipes', uid) === 0) {
    const recipes = [
      {
        name:        'Chicken Shawarma Bowl',
        cuisine:     'middle_eastern',
        meal_type:   'lunch',
        prep_min:    15, cook_min: 20, servings: 2,
        calories:    520, protein_g: 42.0, carbs_g: 38.0, fat_g: 18.0,
        tags:        ['high-protein','meal-prep','halal'],
        image_emoji: '🥙',
        is_favorite: true,
        notes:       'Marinate chicken overnight for best flavour. Serve over brown rice with fattoush.',
        ingredients: [
          { item: 'Chicken thighs (boneless)', qty: '400', unit: 'g', category: 'meat' },
          { item: 'Brown rice (cooked)', qty: '200', unit: 'g', category: 'grains' },
          { item: 'Cucumber', qty: '1', unit: 'medium', category: 'produce' },
          { item: 'Tomatoes', qty: '2', unit: 'medium', category: 'produce' },
          { item: 'Red onion', qty: '0.5', unit: 'medium', category: 'produce' },
          { item: 'Garlic cloves', qty: '3', unit: 'cloves', category: 'produce' },
          { item: 'Olive oil', qty: '2', unit: 'tbsp', category: 'pantry' },
          { item: 'Shawarma spice mix', qty: '1.5', unit: 'tbsp', category: 'pantry' },
          { item: 'Labneh (for topping)', qty: '2', unit: 'tbsp', category: 'dairy' },
        ],
        steps: [
          'Mix chicken with spices, garlic, and olive oil. Marinate 30 min minimum.',
          'Grill chicken on high heat 6-7 min per side until cooked through.',
          'Rest 5 min, then slice thinly.',
          'Serve over brown rice with chopped vegetables and a spoonful of labneh.',
        ],
      },
      {
        name:        'Red Lentil Soup (Shorbat Adas)',
        cuisine:     'arabic',
        meal_type:   'lunch',
        prep_min:    10, cook_min: 30, servings: 4,
        calories:    280, protein_g: 15.0, carbs_g: 42.0, fat_g: 6.0,
        tags:        ['vegetarian','high-fibre','comfort-food','kid-friendly'],
        image_emoji: '🍲',
        is_favorite: true,
        notes:       'Freeze in portions. Kids love it. A squeeze of lemon before serving is essential.',
        ingredients: [
          { item: 'Red lentils', qty: '300', unit: 'g', category: 'legumes' },
          { item: 'Onion', qty: '1', unit: 'large', category: 'produce' },
          { item: 'Garlic', qty: '3', unit: 'cloves', category: 'produce' },
          { item: 'Cumin (ground)', qty: '1.5', unit: 'tsp', category: 'pantry' },
          { item: 'Turmeric', qty: '0.5', unit: 'tsp', category: 'pantry' },
          { item: 'Vegetable stock', qty: '1.2', unit: 'L', category: 'pantry' },
          { item: 'Olive oil', qty: '2', unit: 'tbsp', category: 'pantry' },
          { item: 'Lemon', qty: '1', unit: 'whole', category: 'produce' },
        ],
        steps: [
          'Sauté onion in olive oil until golden (8 min). Add garlic and spices.',
          'Rinse lentils and add to pot with stock. Bring to boil.',
          'Simmer 20-25 min until lentils are very soft.',
          'Blend smooth. Adjust seasoning. Serve with lemon wedge and crusty bread.',
        ],
      },
      {
        name:        'Labneh Toast with Za\'atar & Cherry Tomatoes',
        cuisine:     'levantine',
        meal_type:   'breakfast',
        prep_min:    5, cook_min: 2, servings: 1,
        calories:    310, protein_g: 14.0, carbs_g: 28.0, fat_g: 16.0,
        tags:        ['vegetarian','quick','high-protein','breakfast'],
        image_emoji: '🍳',
        is_favorite: true,
        notes:       'Staple breakfast. Sub labneh with Greek yogurt if labneh unavailable.',
        ingredients: [
          { item: 'Sourdough bread', qty: '2', unit: 'slices', category: 'bakery' },
          { item: 'Labneh', qty: '4', unit: 'tbsp', category: 'dairy' },
          { item: 'Cherry tomatoes', qty: '8', unit: 'whole', category: 'produce' },
          { item: 'Za\'atar', qty: '1', unit: 'tsp', category: 'pantry' },
          { item: 'Olive oil', qty: '1', unit: 'tsp', category: 'pantry' },
        ],
        steps: [
          'Toast bread to your liking.',
          'Spread labneh generously.',
          'Top with halved cherry tomatoes, sprinkle za\'atar, drizzle olive oil.',
        ],
      },
      {
        name:        'Grilled Salmon with Roasted Vegetables',
        cuisine:     'mediterranean',
        meal_type:   'dinner',
        prep_min:    10, cook_min: 25, servings: 2,
        calories:    480, protein_g: 38.0, carbs_g: 22.0, fat_g: 24.0,
        tags:        ['high-protein','omega-3','low-carb','gluten-free'],
        image_emoji: '🐟',
        is_favorite: false,
        notes:       'Use any seasonal vegetables. Courgette, peppers, and asparagus work well.',
        ingredients: [
          { item: 'Salmon fillets', qty: '300', unit: 'g', category: 'seafood' },
          { item: 'Courgette', qty: '1', unit: 'medium', category: 'produce' },
          { item: 'Red pepper', qty: '1', unit: 'medium', category: 'produce' },
          { item: 'Asparagus', qty: '100', unit: 'g', category: 'produce' },
          { item: 'Olive oil', qty: '3', unit: 'tbsp', category: 'pantry' },
          { item: 'Lemon', qty: '1', unit: 'whole', category: 'produce' },
          { item: 'Garlic powder', qty: '0.5', unit: 'tsp', category: 'pantry' },
          { item: 'Dried dill', qty: '0.5', unit: 'tsp', category: 'pantry' },
        ],
        steps: [
          'Preheat oven 200°C. Toss vegetables in 2 tbsp olive oil, season, roast 20 min.',
          'Season salmon with garlic powder, dill, salt. Pan-sear 3 min each side.',
          'Serve salmon over roasted vegetables with a lemon wedge.',
        ],
      },
      {
        name:        'Overnight Oats with Dates & Nuts',
        cuisine:     'international',
        meal_type:   'breakfast',
        prep_min:    5, cook_min: 0, servings: 1,
        calories:    420, protein_g: 18.0, carbs_g: 58.0, fat_g: 14.0,
        tags:        ['vegetarian','meal-prep','high-fibre','no-cook'],
        image_emoji: '🥣',
        is_favorite: true,
        notes:       'Prep Sunday night for 5 weekday breakfasts. Vary toppings to keep fresh.',
        ingredients: [
          { item: 'Rolled oats', qty: '60', unit: 'g', category: 'grains' },
          { item: 'Low-fat milk', qty: '150', unit: 'ml', category: 'dairy' },
          { item: 'Greek yogurt', qty: '50', unit: 'g', category: 'dairy' },
          { item: 'Medjool dates', qty: '2', unit: 'whole', category: 'produce' },
          { item: 'Almonds (chopped)', qty: '15', unit: 'g', category: 'nuts' },
          { item: 'Chia seeds', qty: '1', unit: 'tsp', category: 'pantry' },
          { item: 'Cinnamon', qty: '0.25', unit: 'tsp', category: 'pantry' },
        ],
        steps: [
          'Combine oats, milk, yogurt, chia seeds, and cinnamon in a jar.',
          'Add chopped dates and stir well.',
          'Refrigerate overnight. Top with almonds before eating.',
        ],
      },
      {
        name:        'Fattoush Salad with Halloumi',
        cuisine:     'levantine',
        meal_type:   'lunch',
        prep_min:    10, cook_min: 5, servings: 2,
        calories:    350, protein_g: 18.0, carbs_g: 24.0, fat_g: 20.0,
        tags:        ['vegetarian','light','summer','halloumi'],
        image_emoji: '🥗',
        is_favorite: false,
        notes:       'Great summer salad. Dress just before serving so bread stays crisp.',
        ingredients: [
          { item: 'Romaine lettuce', qty: '2', unit: 'cups', category: 'produce' },
          { item: 'Cherry tomatoes', qty: '200', unit: 'g', category: 'produce' },
          { item: 'Cucumber', qty: '1', unit: 'medium', category: 'produce' },
          { item: 'Radishes', qty: '5', unit: 'whole', category: 'produce' },
          { item: 'Halloumi', qty: '100', unit: 'g', category: 'dairy' },
          { item: 'Pita bread (toasted crispy)', qty: '1', unit: 'whole', category: 'bakery' },
          { item: 'Lemon juice', qty: '2', unit: 'tbsp', category: 'produce' },
          { item: 'Olive oil', qty: '2', unit: 'tbsp', category: 'pantry' },
          { item: 'Sumac', qty: '1', unit: 'tsp', category: 'pantry' },
          { item: 'Fresh mint', qty: '10', unit: 'leaves', category: 'produce' },
        ],
        steps: [
          'Grill halloumi 2 min each side until golden.',
          'Tear pita into pieces, bake at 180°C for 8 min until crisp.',
          'Combine all vegetables and mint.',
          'Whisk lemon, olive oil, and sumac. Dress salad, top with halloumi and pita.',
        ],
      },
    ]

    const { data: insertedRecipes, error: rErr } = await db.from('recipes')
      .insert(recipes.map(r => ({ user_id: uid, ...r }))).select('id, name')
    if (rErr) throw rErr
    insertedRecipes.forEach(r => { recipeIds[r.name] = r.id })
    ok('Recipes', recipes.length)
  } else {
    const { data: existing } = await db.from('recipes').select('id, name').eq('user_id', uid)
    existing?.forEach(r => { recipeIds[r.name] = r.id })
    skip('Recipes')
  }

  // ── 10. Meal plans — current week May 4–10 ───────────────────────────────────
  if (await countRows('meal_plans', uid) === 0) {
    const shawarmaId = recipeIds['Chicken Shawarma Bowl'] ?? null
    const lentilId   = recipeIds['Red Lentil Soup (Shorbat Adas)'] ?? null
    const labId      = recipeIds['Labneh Toast with Za\'atar & Cherry Tomatoes'] ?? null
    const salmonId   = recipeIds['Grilled Salmon with Roasted Vegetables'] ?? null
    const oatsId     = recipeIds['Overnight Oats with Dates & Nuts'] ?? null
    const fattoushId = recipeIds['Fattoush Salad with Halloumi'] ?? null

    const mealPlans = [
      // Monday May 4
      { date: '2026-05-04', meal_type: 'breakfast', recipe_id: oatsId,     name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-04', meal_type: 'lunch',     recipe_id: shawarmaId, name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-04', meal_type: 'dinner',    recipe_id: null,       name_override: 'Leftover lentil soup', servings: 1, is_done: true },
      { date: '2026-05-04', meal_type: 'snack',     recipe_id: null,       name_override: 'Apple + handful of almonds', servings: 1, is_done: true },
      // Tuesday May 5
      { date: '2026-05-05', meal_type: 'breakfast', recipe_id: labId,      name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-05', meal_type: 'lunch',     recipe_id: fattoushId, name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-05', meal_type: 'dinner',    recipe_id: null,       name_override: 'Grilled chicken + salad', servings: 1, is_done: true },
      // Wednesday May 6
      { date: '2026-05-06', meal_type: 'breakfast', recipe_id: oatsId,     name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-06', meal_type: 'lunch',     recipe_id: lentilId,   name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-06', meal_type: 'dinner',    recipe_id: salmonId,   name_override: null,                 servings: 2, is_done: true, notes: 'Layla ate half a piece too!' },
      // Thursday May 7
      { date: '2026-05-07', meal_type: 'breakfast', recipe_id: labId,      name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-07', meal_type: 'lunch',     recipe_id: null,       name_override: 'Clinic canteen — chicken wrap', servings: 1, is_done: true },
      { date: '2026-05-07', meal_type: 'dinner',    recipe_id: shawarmaId, name_override: null,                 servings: 2, is_done: true  },
      { date: '2026-05-07', meal_type: 'snack',     recipe_id: null,       name_override: 'Greek yogurt + honey', servings: 1, is_done: true },
      // Friday May 8
      { date: '2026-05-08', meal_type: 'breakfast', recipe_id: oatsId,     name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-08', meal_type: 'lunch',     recipe_id: fattoushId, name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-08', meal_type: 'dinner',    recipe_id: null,       name_override: 'Family dinner — Carrefour rotisserie chicken + sides', servings: 1, is_done: true },
      // Saturday May 9
      { date: '2026-05-09', meal_type: 'breakfast', recipe_id: labId,      name_override: null,                 servings: 1, is_done: true  },
      { date: '2026-05-09', meal_type: 'lunch',     recipe_id: shawarmaId, name_override: null,                 servings: 1, is_done: false },
      { date: '2026-05-09', meal_type: 'dinner',    recipe_id: lentilId,   name_override: null,                 servings: 2, is_done: false, notes: 'Batch cook — freeze half' },
      // Sunday May 10
      { date: '2026-05-10', meal_type: 'breakfast', recipe_id: oatsId,     name_override: null,                 servings: 1, is_done: false },
      { date: '2026-05-10', meal_type: 'lunch',     recipe_id: null,       name_override: 'Family brunch — out', servings: 1, is_done: false },
      { date: '2026-05-10', meal_type: 'dinner',    recipe_id: salmonId,   name_override: null,                 servings: 2, is_done: false },
    ]
    const { error } = await db.from('meal_plans').insert(mealPlans.map(m => ({ user_id: uid, ...m })))
    if (error) throw error
    ok('Meal plans', mealPlans.length)
  } else { skip('Meal plans') }

  // ── 11. Food logs — 5 days ───────────────────────────────────────────────────
  if (await countRows('food_logs', uid) === 0) {
    const shawarmaId = recipeIds['Chicken Shawarma Bowl'] ?? null
    const oatsId     = recipeIds['Overnight Oats with Dates & Nuts'] ?? null
    const labId      = recipeIds['Labneh Toast with Za\'atar & Cherry Tomatoes'] ?? null
    const salmonId   = recipeIds['Grilled Salmon with Roasted Vegetables'] ?? null

    const logs = [
      // May 5
      { date: '2026-05-05', meal_type: 'breakfast', food_name: 'Labneh Toast with Za\'atar & Cherry Tomatoes', calories: 310, protein_g: 14.0, carbs_g: 28.0, fat_g: 16.0, qty: 1, qty_unit: 'serving', recipe_id: labId },
      { date: '2026-05-05', meal_type: 'lunch',     food_name: 'Fattoush Salad with Halloumi',                 calories: 350, protein_g: 18.0, carbs_g: 24.0, fat_g: 20.0, qty: 1, qty_unit: 'serving' },
      { date: '2026-05-05', meal_type: 'dinner',    food_name: 'Grilled chicken breast',                       calories: 280, protein_g: 42.0, carbs_g: 0.0,  fat_g: 10.0, qty: 1, qty_unit: 'serving' },
      { date: '2026-05-05', meal_type: 'dinner',    food_name: 'Mixed salad (no dressing)',                    calories: 60,  protein_g: 2.0,  carbs_g: 8.0,  fat_g: 1.0,  qty: 1, qty_unit: 'serving' },
      { date: '2026-05-05', meal_type: 'snack',     food_name: 'Karak chai with low-fat milk',                calories: 90,  protein_g: 3.0,  carbs_g: 12.0, fat_g: 2.5,  qty: 1, qty_unit: 'cup', notes: 'Late afternoon pick-me-up' },
      // May 6
      { date: '2026-05-06', meal_type: 'breakfast', food_name: 'Overnight Oats with Dates & Nuts',            calories: 420, protein_g: 18.0, carbs_g: 58.0, fat_g: 14.0, qty: 1, qty_unit: 'serving', recipe_id: oatsId },
      { date: '2026-05-06', meal_type: 'lunch',     food_name: 'Red Lentil Soup + pita',                      calories: 330, protein_g: 16.0, carbs_g: 50.0, fat_g: 6.5,  qty: 1, qty_unit: 'serving' },
      { date: '2026-05-06', meal_type: 'dinner',    food_name: 'Grilled Salmon with Roasted Vegetables',       calories: 480, protein_g: 38.0, carbs_g: 22.0, fat_g: 24.0, qty: 1, qty_unit: 'serving', recipe_id: salmonId },
      { date: '2026-05-06', meal_type: 'snack',     food_name: 'Medjool dates x2',                            calories: 133, protein_g: 0.8,  carbs_g: 36.0, fat_g: 0.1,  qty: 2, qty_unit: 'pieces' },
      // May 7
      { date: '2026-05-07', meal_type: 'breakfast', food_name: 'Labneh Toast with Za\'atar & Cherry Tomatoes', calories: 310, protein_g: 14.0, carbs_g: 28.0, fat_g: 16.0, qty: 1, qty_unit: 'serving', recipe_id: labId },
      { date: '2026-05-07', meal_type: 'lunch',     food_name: 'Clinic canteen chicken wrap',                  calories: 480, protein_g: 32.0, carbs_g: 45.0, fat_g: 16.0, qty: 1, qty_unit: 'serving', notes: 'Slightly overestimated — wrap was large' },
      { date: '2026-05-07', meal_type: 'dinner',    food_name: 'Chicken Shawarma Bowl',                        calories: 520, protein_g: 42.0, carbs_g: 38.0, fat_g: 18.0, qty: 1, qty_unit: 'serving', recipe_id: shawarmaId },
      { date: '2026-05-07', meal_type: 'snack',     food_name: 'Greek yogurt 2% with honey',                  calories: 140, protein_g: 12.0, carbs_g: 14.0, fat_g: 4.0,  qty: 1, qty_unit: 'cup' },
      // May 8
      { date: '2026-05-08', meal_type: 'breakfast', food_name: 'Overnight Oats with Dates & Nuts',            calories: 420, protein_g: 18.0, carbs_g: 58.0, fat_g: 14.0, qty: 1, qty_unit: 'serving', recipe_id: oatsId },
      { date: '2026-05-08', meal_type: 'lunch',     food_name: 'Fattoush salad + halloumi',                   calories: 350, protein_g: 18.0, carbs_g: 24.0, fat_g: 20.0, qty: 1, qty_unit: 'serving' },
      { date: '2026-05-08', meal_type: 'dinner',    food_name: 'Rotisserie chicken (2 pieces, no skin)',       calories: 320, protein_g: 42.0, carbs_g: 0.0,  fat_g: 14.0, qty: 2, qty_unit: 'pieces' },
      { date: '2026-05-08', meal_type: 'dinner',    food_name: 'Tabbouleh side salad',                        calories: 120, protein_g: 3.0,  carbs_g: 18.0, fat_g: 5.0,  qty: 1, qty_unit: 'serving' },
      { date: '2026-05-08', meal_type: 'snack',     food_name: 'Handful of almonds',                          calories: 100, protein_g: 3.5,  carbs_g: 3.5,  fat_g: 9.0,  qty: 25, qty_unit: 'g' },
      // May 9
      { date: '2026-05-09', meal_type: 'breakfast', food_name: 'Labneh Toast with Za\'atar & Cherry Tomatoes', calories: 310, protein_g: 14.0, carbs_g: 28.0, fat_g: 16.0, qty: 1, qty_unit: 'serving', recipe_id: labId },
      { date: '2026-05-09', meal_type: 'snack',     food_name: 'Banana',                                       calories: 90,  protein_g: 1.1,  carbs_g: 23.0, fat_g: 0.3,  qty: 1, qty_unit: 'medium', notes: 'Pre-workout snack' },
    ]
    const { error } = await db.from('food_logs').insert(logs.map(l => ({ user_id: uid, ...l })))
    if (error) throw error
    ok('Food logs', logs.length)
  } else { skip('Food logs') }

  // ── 12. Nutrition grocery items ──────────────────────────────────────────────
  if (await countRows('nutrition_grocery_items', uid) === 0) {
    const { error } = await db.from('nutrition_grocery_items').insert([
      { user_id: uid, name: 'Chicken thighs (boneless)', category: 'meat',    qty: 800,  unit: 'g',     is_bought: false },
      { user_id: uid, name: 'Salmon fillets',             category: 'seafood', qty: 400,  unit: 'g',     is_bought: false },
      { user_id: uid, name: 'Labneh',                     category: 'dairy',   qty: 1,    unit: 'tub',   is_bought: true  },
      { user_id: uid, name: 'Greek yogurt 2%',            category: 'dairy',   qty: 500,  unit: 'g',     is_bought: true  },
      { user_id: uid, name: 'Rolled oats',                category: 'pantry',  qty: 500,  unit: 'g',     is_bought: true  },
      { user_id: uid, name: 'Red lentils',                category: 'legumes', qty: 500,  unit: 'g',     is_bought: false },
      { user_id: uid, name: 'Brown rice',                 category: 'grains',  qty: 1,    unit: 'kg',    is_bought: false },
      { user_id: uid, name: 'Cherry tomatoes',            category: 'produce', qty: 400,  unit: 'g',     is_bought: true  },
      { user_id: uid, name: 'Cucumber x3',                category: 'produce', qty: 3,    unit: 'pcs',   is_bought: true  },
      { user_id: uid, name: 'Romaine lettuce',            category: 'produce', qty: 1,    unit: 'head',  is_bought: false },
      { user_id: uid, name: 'Halloumi',                   category: 'dairy',   qty: 250,  unit: 'g',     is_bought: false },
      { user_id: uid, name: 'Medjool dates',              category: 'produce', qty: 500,  unit: 'g',     is_bought: true  },
      { user_id: uid, name: 'Almonds (raw)',              category: 'nuts',    qty: 200,  unit: 'g',     is_bought: true  },
      { user_id: uid, name: 'Za\'atar spice',             category: 'pantry',  qty: 1,    unit: 'jar',   is_bought: true  },
      { user_id: uid, name: 'Sumac',                      category: 'pantry',  qty: 1,    unit: 'jar',   is_bought: false },
      { user_id: uid, name: 'Sourdough bread',            category: 'bakery',  qty: 1,    unit: 'loaf',  is_bought: false },
      { user_id: uid, name: 'Chia seeds',                 category: 'pantry',  qty: 200,  unit: 'g',     is_bought: true  },
    ])
    if (error) throw error
    ok('Nutrition grocery items (17 items)')
  } else { skip('Nutrition grocery items') }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────────────')
  console.log('  MENTAL HEALTH')
  console.log('  Mood logs       : 21 entries (Apr 20 – May 9)')
  console.log('  Journal entries :  8 entries (parenting, career, wellbeing)')
  console.log('  Gratitude       : 14 daily entries')
  console.log('  Sleep logs      : 20 entries (avg 7.2h, quality 3.5/5)')
  console.log('  Companion chat  :  1 session (stress / Sunday dread)')
  console.log('  Tool sessions   :  3 (breathing, body scan, gratitude)')
  console.log('\n  NUTRITION')
  console.log('  Diet type       : Mediterranean — 1800 kcal, 100g protein')
  console.log('  Recipes         : 6 (shawarma bowl, lentil soup, labneh toast,')
  console.log('                      salmon, overnight oats, fattoush)')
  console.log('  Meal plans      : 7-day plan (May 4–10), 23 planned meals')
  console.log('  Food logs       : 5 days, 20 log entries')
  console.log('  Grocery items   : 17 items for nutrition module')
  console.log('──────────────────────────────────────────────────────────────')
  console.log('\n✅  Done — refresh the Mind and Nutrition pages.\n')
}

seed().catch(err => {
  console.error('\n❌ Fatal:', err.message, err.details ?? '')
  process.exit(1)
})
