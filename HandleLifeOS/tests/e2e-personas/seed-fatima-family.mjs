/**
 * Seed Family + AURA data for Fatima Al-Rashid (E2E test persona).
 *
 * Family tables reference auth.users — Fatima's auth user ID is used there.
 * AURA tables reference the custom users table — her custom user ID is used there.
 *
 * Run: node tests/e2e-personas/seed-fatima-family.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── IDs ────────────────────────────────────────────────────────────────────────
// Both family and AURA tables resolve to the custom users table at runtime
// (auth.users FK in migration SQL is overridden — Supabase uses the app's users table)
const AUTH_USER_ID   = '899098ae-2f59-4c02-983c-1b84fefa875d'  // custom users (used for family FKs)
const CUSTOM_USER_ID = '899098ae-2f59-4c02-983c-1b84fefa875d'  // custom users (used for AURA FKs)

// ── Helpers ────────────────────────────────────────────────────────────────────
let step = 0
function ok(label) { console.log(`  ✔  [${++step}] ${label}`) }
function fail(label, err) { console.error(`  ✗  [${step + 1}] ${label}: ${err?.message ?? err}`) }

async function insert(table, rows, conflictCol) {
  const q = db.from(table).insert(rows)
  const { error } = await (conflictCol
    ? q.upsert(rows, { onConflict: conflictCol, ignoreDuplicates: true })
    : q)
  if (error && !error.message.includes('duplicate')) throw error
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Seeding Family + AURA data for Fatima Al-Rashid...\n')

  // ── 1. Family ────────────────────────────────────────────────────────────────
  // Check if family already exists
  const { data: existingFamily } = await db
    .from('families')
    .select('id')
    .eq('created_by', AUTH_USER_ID)
    .maybeSingle()

  let familyId = existingFamily?.id

  if (!familyId) {
    const { data, error } = await db
      .from('families')
      .insert({ name: 'Al-Rashid Family', created_by: AUTH_USER_ID })
      .select('id')
      .single()
    if (error) { fail('Create family', error); throw error }
    familyId = data.id
    ok(`Family created (${familyId})`)
  } else {
    ok(`Family already exists (${familyId})`)
  }

  // ── 2. Family members ────────────────────────────────────────────────────────
  const { data: existingMembers } = await db
    .from('family_members')
    .select('id')
    .eq('family_id', familyId)

  if (!existingMembers?.length) {
    const { error } = await db.from('family_members').insert([
      {
        family_id:    familyId,
        user_id:      AUTH_USER_ID,
        role:         'owner',
        status:       'active',
        display_name: 'Fatima',
        invited_by:   AUTH_USER_ID,
        joined_at:    new Date().toISOString(),
      },
      {
        family_id:     familyId,
        user_id:       null,
        invited_email: 'ahmed.alrashid@example.com',
        role:          'partner',
        status:        'invited',
        display_name:  'Ahmed',
        invited_by:    AUTH_USER_ID,
      },
    ])
    if (error) { fail('Family members', error); throw error }
    ok('Family members added (Fatima owner, Ahmed invited)')
  } else {
    ok(`Family members already exist (${existingMembers.length})`)
  }

  // ── 3. Child profiles ─────────────────────────────────────────────────────────
  const { data: existingChildren } = await db
    .from('child_profiles')
    .select('id')
    .eq('family_id', familyId)

  if (!existingChildren?.length) {
    const { error } = await db.from('child_profiles').insert([
      {
        family_id:  familyId,
        full_name:  'Layla Al-Rashid',
        age:        9,
        school_name:'Al-Noor International School',
        class_grade:'Class 4',
        notes:      'Bilingual (Arabic/English). Loves art and science projects.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        full_name:  'Omar Al-Rashid',
        age:        5,
        school_name:'Sunshine Kindergarten',
        class_grade:'KG1',
        notes:      'Very energetic. Loves dinosaurs and building blocks.',
        created_by: AUTH_USER_ID,
      },
    ])
    if (error) { fail('Child profiles', error); throw error }
    ok('Child profiles added (Layla 9y, Omar 5y)')
  } else {
    ok(`Child profiles already exist (${existingChildren.length})`)
  }

  // ── 4. Elder profile ──────────────────────────────────────────────────────────
  const { data: existingElders } = await db
    .from('elder_profiles')
    .select('id')
    .eq('family_id', familyId)

  if (!existingElders?.length) {
    const { error } = await db.from('elder_profiles').insert({
      family_id:         familyId,
      full_name:         'Umm Ahmed Al-Rashid',
      medicines:         ['Metformin 500mg', 'Atorvastatin 10mg', 'Aspirin 75mg'],
      conditions:        'Type 2 diabetes, high cholesterol, mild hypertension',
      doctor_name:       'Dr. Khalid Hassan',
      doctor_contact:    '+971-4-234-5678',
      emergency_contact: 'Ahmed Al-Rashid — +971-50-987-6543',
      notes:             'Lives 10 min away. Weekly check-in call on Fridays.',
      created_by:        AUTH_USER_ID,
    })
    if (error) { fail('Elder profile', error); throw error }
    ok('Elder profile added (Umm Ahmed)')
  } else {
    ok(`Elder profile already exists`)
  }

  // ── 5. Shared tasks ───────────────────────────────────────────────────────────
  const { data: existingTasks } = await db
    .from('shared_tasks')
    .select('id')
    .eq('family_id', familyId)

  if (!existingTasks?.length) {
    const { error } = await db.from('shared_tasks').insert([
      {
        family_id:  familyId,
        title:      'Pick up Layla from school',
        category:   'childcare',
        status:     'pending',
        assigned_to: AUTH_USER_ID,
        due_date:   '2026-05-09',
        notes:      'School ends at 2:30 PM — Gate C',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Weekly grocery run',
        category:   'groceries',
        status:     'pending',
        assigned_to: AUTH_USER_ID,
        due_date:   '2026-05-10',
        notes:      'Also pick up Layla\'s project supplies (card, markers, glue)',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Book Omar\'s dentist appointment',
        category:   'health',
        status:     'pending',
        due_date:   '2026-05-12',
        notes:      'First dental check — call Dr. Rania clinic',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Pay DEWA electricity bill',
        category:   'bills',
        status:     'in_progress',
        assigned_to: AUTH_USER_ID,
        due_date:   '2026-05-15',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Prepare Layla\'s science fair board',
        category:   'school',
        status:     'pending',
        assigned_to: AUTH_USER_ID,
        due_date:   '2026-05-16',
        notes:      'Topic: Water cycle. Need to print diagram.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:    familyId,
        title:        'Deep clean living room',
        category:     'cleaning',
        status:       'done',
        assigned_to:  AUTH_USER_ID,
        created_by:   AUTH_USER_ID,
        completed_at: '2026-05-07T18:00:00Z',
      },
    ])
    if (error) { fail('Shared tasks', error); throw error }
    ok('Shared tasks added (6 tasks)')
  } else {
    ok(`Shared tasks already exist (${existingTasks.length})`)
  }

  // ── 6. Family events ──────────────────────────────────────────────────────────
  const { data: existingEvents } = await db
    .from('family_events')
    .select('id')
    .eq('family_id', familyId)

  if (!existingEvents?.length) {
    const { error } = await db.from('family_events').insert([
      {
        family_id:  familyId,
        title:      'Layla\'s School Science Fair',
        event_type: 'school',
        start_date: '2026-05-17',
        end_date:   '2026-05-17',
        all_day:    true,
        notes:      'Al-Noor School Hall, 9 AM – 12 PM. Parents encouraged to attend.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Omar\'s Pediatric Check-up',
        event_type: 'appointment',
        start_date: '2026-05-14',
        end_date:   '2026-05-14',
        all_day:    false,
        notes:      'Dr. Nadia Malik clinic, 10:30 AM. Bring vaccination card.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Ahmed\'s Birthday',
        event_type: 'birthday',
        start_date: '2026-06-03',
        end_date:   '2026-06-03',
        all_day:    true,
        notes:      'Family dinner at home. Kids want to bake the cake.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Family Visit to Abu Dhabi',
        event_type: 'travel',
        start_date: '2026-06-20',
        end_date:   '2026-06-23',
        all_day:    true,
        notes:      'Visiting grandparents. Hotel: Marriott Abu Dhabi. Kids off school.',
        created_by: AUTH_USER_ID,
      },
      {
        family_id:  familyId,
        title:      'Omar\'s Kindergarten Graduation',
        event_type: 'school',
        start_date: '2026-06-12',
        end_date:   '2026-06-12',
        all_day:    false,
        notes:      'Sunshine KG auditorium, 5 PM. Full family invited.',
        created_by: AUTH_USER_ID,
      },
    ])
    if (error) { fail('Family events', error); throw error }
    ok('Family events added (5 events)')
  } else {
    ok(`Family events already exist (${existingEvents.length})`)
  }

  // ── 7. Grocery list + items ───────────────────────────────────────────────────
  const { data: existingLists } = await db
    .from('grocery_lists')
    .select('id')
    .eq('family_id', familyId)
    .eq('is_active', true)

  let listId = existingLists?.[0]?.id

  if (!listId) {
    const { data, error } = await db
      .from('grocery_lists')
      .insert({ family_id: familyId, name: 'Weekly Groceries', is_active: true, created_by: AUTH_USER_ID })
      .select('id')
      .single()
    if (error) { fail('Grocery list', error); throw error }
    listId = data.id

    const { error: itemsError } = await db.from('grocery_items').insert([
      { list_id: listId, family_id: familyId, name: 'Basmati rice',    quantity: '5 kg',       category: 'Grains',     is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Chicken breast',  quantity: '1.5 kg',     category: 'Meat',       is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Full-fat yogurt', quantity: '2 tubs',     category: 'Dairy',      is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Fresh tomatoes',  quantity: '1 kg',       category: 'Vegetables', is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Onions',          quantity: '2 kg',       category: 'Vegetables', is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Olive oil',       quantity: '1 bottle',   category: 'Pantry',     is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Dates (Medjool)', quantity: '500 g',      category: 'Snacks',     is_bought: false, added_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Milk',            quantity: '2 cartons',  category: 'Dairy',      is_bought: true,  added_by: AUTH_USER_ID, bought_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Pita bread',      quantity: '1 pack',     category: 'Bakery',     is_bought: true,  added_by: AUTH_USER_ID, bought_by: AUTH_USER_ID },
      { list_id: listId, family_id: familyId, name: 'Lentils',         quantity: '500 g',      category: 'Grains',     is_bought: false, added_by: AUTH_USER_ID },
    ])
    if (itemsError) { fail('Grocery items', itemsError); throw itemsError }
    ok('Grocery list + 10 items added')
  } else {
    ok(`Grocery list already exists (${listId})`)
  }

  // ── 8. AURA profiles (JSONB — custom users table) ─────────────────────────────
  const { data: existingAura } = await db
    .from('aura_profiles')
    .select('id')
    .eq('user_id', CUSTOM_USER_ID)

  if (!existingAura?.length) {
    const laylaProfile = {
      full_name:   'Layla Al-Rashid',
      date_of_birth: '2016-08-15',
      gender:      'female',
      school_name: 'Al-Noor International School',
      class_grade: 'Class 4',
      milestone_records: [
        {
          domain:      'language_communication',
          age_key:     '9y',
          status:      'achieved',
          notes:       'Reads fluently in Arabic and English. Strong written expression.',
          recorded_at: '2026-01-15',
        },
        {
          domain:      'social_emotional',
          age_key:     '9y',
          status:      'achieved',
          notes:       'Good peer relationships. Active in school drama club.',
          recorded_at: '2026-01-15',
        },
        {
          domain:      'cognitive',
          age_key:     '9y',
          status:      'concern',
          notes:       'Struggles to maintain focus during long maths sessions. Teacher flagged for review.',
          recorded_at: '2026-03-10',
        },
        {
          domain:      'movement_physical',
          age_key:     '9y',
          status:      'achieved',
          notes:       'Participates in swimming and gymnastics. Good coordination.',
          recorded_at: '2026-01-15',
        },
      ],
      medical_records: [
        {
          date:       '2025-11-20',
          type:       'annual_checkup',
          doctor:     'Dr. Sara Al-Farsi (Pediatrician)',
          notes:      'Healthy. Vision 20/20. Hearing normal. Growth on track.',
          next_visit: '2026-11-20',
        },
      ],
      medications:          [],
      therapies:            [],
      growth_records: [
        { date: '2026-01-15', weight_kg: 28.5, height_cm: 133.0, notes: '55th percentile weight, 58th percentile height' },
        { date: '2025-08-15', weight_kg: 26.0, height_cm: 129.0, notes: '54th percentile weight' },
      ],
      neurodivergence:      null,
      physical_disabilities: null,
      genetic_conditions:   null,
      education_plan:       null,
      financial_plan:       null,
    }

    const omarProfile = {
      full_name:   'Omar Al-Rashid',
      date_of_birth: '2020-12-03',
      gender:      'male',
      school_name: 'Sunshine Kindergarten',
      class_grade: 'KG1',
      milestone_records: [
        {
          domain:      'language_communication',
          age_key:     '4y',
          status:      'achieved',
          notes:       'Speaks in full sentences. Bilingual Arabic/English. Loves storytelling.',
          recorded_at: '2025-12-03',
        },
        {
          domain:      'movement_physical',
          age_key:     '4y',
          status:      'achieved',
          notes:       'Runs, jumps, climbs confidently. Rides balance bike.',
          recorded_at: '2025-12-03',
        },
        {
          domain:      'social_emotional',
          age_key:     '4y',
          status:      'achieved',
          notes:       'Shares toys, plays cooperatively. Occasional tantrums when tired — age-appropriate.',
          recorded_at: '2025-12-03',
        },
        {
          domain:      'cognitive',
          age_key:     '4y',
          status:      'achieved',
          notes:       'Counts to 20, knows all colours, basic shapes. Recognises some Arabic letters.',
          recorded_at: '2025-12-03',
        },
      ],
      medical_records: [
        {
          date:       '2025-12-10',
          type:       'vaccination',
          doctor:     'Dr. Nadia Malik (Pediatrician)',
          notes:      '4-year booster vaccines administered. MMR, Varicella, Flu. No adverse reactions.',
          next_visit: '2026-06-10',
        },
      ],
      medications:          [],
      therapies:            [],
      growth_records: [
        { date: '2025-12-10', weight_kg: 17.2, height_cm: 102.5, notes: '50th percentile weight, 48th percentile height' },
      ],
      neurodivergence:      null,
      physical_disabilities: null,
      genetic_conditions:   null,
      education_plan:       null,
      financial_plan:       null,
    }

    const { error } = await db.from('aura_profiles').insert([
      { user_id: CUSTOM_USER_ID, data: laylaProfile },
      { user_id: CUSTOM_USER_ID, data: omarProfile },
    ])
    if (error) { fail('AURA profiles', error); throw error }
    ok('AURA profiles added (Layla 9y, Omar 5y)')
  } else {
    ok(`AURA profiles already exist (${existingAura.length})`)
  }

  // ── 9. AURA settings (optional — migration may not be applied) ───────────────
  try {
    const { data: existingSettings, error: chkErr } = await db
      .from('aura_settings')
      .select('user_id')
      .eq('user_id', CUSTOM_USER_ID)
      .maybeSingle()

    if (chkErr) throw chkErr

    if (!existingSettings) {
      const { error } = await db.from('aura_settings').insert({
        user_id:                CUSTOM_USER_ID,
        notifications_enabled:  true,
        voice_enabled:          false,
        reduced_motion:         false,
        high_contrast:          false,
        text_size:              'base',
      })
      if (error) throw error
      ok('AURA settings configured')
    } else {
      ok('AURA settings already exist')
    }
  } catch (e) {
    console.log(`  ⚠  [${++step}] AURA settings skipped — table not yet migrated (${e.message?.slice(0, 80)})`)
  }

  // ── 10. AURA coach sessions (optional — migration may not be applied) ─────────
  try {
    const { data: existingSessions, error: chkErr } = await db
      .from('aura_coach_sessions')
      .select('id')
      .eq('user_id', CUSTOM_USER_ID)

    if (chkErr) throw chkErr

    if (!existingSessions?.length) {
      const { data: laylaProfile } = await db
        .from('aura_profiles')
        .select('id')
        .eq('user_id', CUSTOM_USER_ID)
        .limit(1)
        .single()

      const { data: sessions, error } = await db.from('aura_coach_sessions').insert([
        {
          user_id:  CUSTOM_USER_ID,
          child_id: laylaProfile?.id ?? null,
          mode:     'school',
          title:    'Focus Strategies for Layla — Maths Concentration',
        },
        {
          user_id:  CUSTOM_USER_ID,
          child_id: null,
          mode:     'sleep',
          title:    "Omar's Bedtime Routine — Settling Tips",
        },
        {
          user_id:  CUSTOM_USER_ID,
          child_id: null,
          mode:     'general',
          title:    'Bilingual Development Q&A',
        },
      ]).select('id')
      if (error) throw error

      if (sessions?.length) {
        const sessionId = sessions[0].id
        const { error: msgError } = await db.from('aura_coach_messages').insert([
          {
            session_id: sessionId,
            user_id:    CUSTOM_USER_ID,
            role:       'user',
            content:    "Layla's teacher says she loses focus during maths. She's 9. What strategies can help?",
          },
          {
            session_id: sessionId,
            user_id:    CUSTOM_USER_ID,
            role:       'assistant',
            content:    "Focus difficulties during maths at age 9 are common and very manageable. A few approaches that work well:\n\n1. **Chunked sessions** — Break maths into 15-minute blocks with a 5-minute movement break between each.\n2. **Visual anchors** — Use a simple checklist on her desk so she knows exactly what to complete.\n3. **Fidget tools** — A stress ball or textured mat can actually improve concentration for some children.\n4. **Remove visual clutter** — A plain desk surface with only the current worksheet helps reduce distraction.\n\nIf focus difficulties persist after 4–6 weeks of structured support, it's worth a conversation with her school's learning support team.",
          },
          {
            session_id: sessionId,
            user_id:    CUSTOM_USER_ID,
            role:       'user',
            content:    'Should I be worried about ADHD?',
          },
          {
            session_id: sessionId,
            user_id:    CUSTOM_USER_ID,
            role:       'assistant',
            content:    "Concern is understandable, but one subject-specific focus challenge doesn't indicate ADHD. ADHD typically shows up across multiple settings (home, school, social) and across different subjects. Watch for: does Layla focus well during activities she enjoys? Can she follow a story or complete a puzzle? If yes, the issue is more likely maths-specific anxiety or a teaching style mismatch than ADHD.\n\nI'd recommend keeping a simple log for 2–3 weeks — note when she's focused and when she isn't — then share it with her teacher. That gives a real picture before any specialist referral.",
          },
        ])
        if (msgError) throw msgError
        ok('AURA coach sessions + messages added (3 sessions, 4 messages in first)')
      }
    } else {
      ok(`AURA coach sessions already exist (${existingSessions.length})`)
    }
  } catch (e) {
    console.log(`  ⚠  [${++step}] AURA coach sessions skipped — table not yet migrated (${e.message?.slice(0, 80)})`)
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────────────')
  console.log('  Family ID :', familyId)
  console.log('  Auth UID  :', AUTH_USER_ID, '(family tables)')
  console.log('  Custom UID:', CUSTOM_USER_ID, '(AURA tables)')
  console.log('──────────────────────────────────────────────────────────────')
  console.log('\n✅  Fatima family + AURA seed complete.\n')
}

seed().catch(err => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
