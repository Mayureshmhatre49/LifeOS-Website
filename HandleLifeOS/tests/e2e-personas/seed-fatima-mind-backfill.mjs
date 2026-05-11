/**
 * Backfill energy + stress_categories into Fatima's mood_logs after applying
 * supabase/APPLY_MISSING_PHASE7.sql in the Supabase dashboard.
 *
 * Also backfills pre/post mood into tool sessions.
 *
 * Run AFTER the phase7 migration has been applied:
 *   node tests/e2e-personas/seed-fatima-mind-backfill.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// energy + stress_categories keyed by the logged_at timestamp we inserted
const MOOD_BACKFILL = [
  { logged_at: '2026-04-20T21:45:00Z', energy: 2, stress_categories: ['work'] },
  { logged_at: '2026-04-21T22:00:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-04-22T23:10:00Z', energy: 2, stress_categories: ['work','family'] },
  { logged_at: '2026-04-23T22:30:00Z', energy: 3, stress_categories: ['work'] },
  { logged_at: '2026-04-24T21:15:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-04-25T20:00:00Z', energy: 5, stress_categories: [] },
  { logged_at: '2026-04-26T21:40:00Z', energy: 3, stress_categories: [] },
  { logged_at: '2026-04-27T22:05:00Z', energy: 3, stress_categories: ['work'] },
  { logged_at: '2026-04-28T23:00:00Z', energy: 2, stress_categories: ['work','health'] },
  { logged_at: '2026-04-29T21:30:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-04-30T22:15:00Z', energy: 3, stress_categories: [] },
  { logged_at: '2026-05-01T22:45:00Z', energy: 2, stress_categories: ['family'] },
  { logged_at: '2026-05-02T21:00:00Z', energy: 3, stress_categories: [] },
  { logged_at: '2026-05-03T20:30:00Z', energy: 5, stress_categories: [] },
  { logged_at: '2026-05-04T22:00:00Z', energy: 3, stress_categories: ['work'] },
  { logged_at: '2026-05-05T23:30:00Z', energy: 2, stress_categories: ['work','family'] },
  { logged_at: '2026-05-06T21:00:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-05-07T21:45:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-05-08T22:10:00Z', energy: 3, stress_categories: ['work'] },
  { logged_at: '2026-05-09T10:00:00Z', energy: 4, stress_categories: [] },
  { logged_at: '2026-05-09T21:30:00Z', energy: 4, stress_categories: [] },
]

// tool session backfill: pre/post mood + intensity by tool_id
const TOOL_BACKFILL = [
  { tool_id: 'box-breathing',   mood_before: 2, mood_after: 4, pre_intensity: 4, post_intensity: 2 },
  { tool_id: 'body-scan',       mood_before: 3, mood_after: 4, pre_intensity: 3, post_intensity: 1 },
  { tool_id: 'gratitude-prompt', mood_before: 3, mood_after: 4, pre_intensity: null, post_intensity: null },
]

async function backfill() {
  const { data: user } = await db.from('users').select('id').eq('email', 'fatima.alrashid@e2e-test.handlelifeos.app').single()
  const uid = user.id
  console.log(`\n👤  Fatima uid: ${uid}`)

  // ── Verify columns exist before attempting update ──
  const { error: probe } = await db.from('mood_logs')
    .update({ energy: 3, stress_categories: [] })
    .eq('user_id', uid)
    .eq('energy', -999) // matches nothing — just tests the column exists
  if (probe?.message?.includes('schema cache')) {
    console.error('\n❌  energy column not found — apply APPLY_MISSING_PHASE7.sql first.\n')
    process.exit(1)
  }

  console.log('\n🧠  Backfilling mood_logs (energy + stress_categories)...')
  let updated = 0
  for (const row of MOOD_BACKFILL) {
    const { error } = await db.from('mood_logs')
      .update({ energy: row.energy, stress_categories: row.stress_categories })
      .eq('user_id', uid)
      .eq('logged_at', row.logged_at)
    if (error) { console.log(`  ✗  ${row.logged_at}: ${error.message}`); continue }
    updated++
  }
  console.log(`  ✔  ${updated}/${MOOD_BACKFILL.length} mood logs updated`)

  console.log('\n🧰  Backfilling tool sessions (mood_before/after + intensity)...')
  for (const row of TOOL_BACKFILL) {
    const { error } = await db.from('mind_tool_sessions')
      .update({ mood_before: row.mood_before, mood_after: row.mood_after, pre_intensity: row.pre_intensity, post_intensity: row.post_intensity })
      .eq('user_id', uid)
      .eq('tool_id', row.tool_id)
    if (error) { console.log(`  ✗  ${row.tool_id}: ${error.message}`); continue }
    console.log(`  ✔  ${row.tool_id}`)
  }

  console.log('\n✅  Backfill complete.\n')
}

backfill().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
