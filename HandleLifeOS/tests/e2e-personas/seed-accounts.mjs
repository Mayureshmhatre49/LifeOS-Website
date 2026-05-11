/**
 * Seed all 10 E2E test personas directly via Supabase admin API.
 * Bypasses the app's signup endpoint and rate limiter entirely.
 * Run: node tests/e2e-personas/seed-accounts.mjs
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PERSONAS = [
  { id: 'priya',    name: 'Priya Sharma',       email: 'priya.sharma@e2e-test.handlelifeos.app',     password: 'E2eTest123!' },
  { id: 'james',    name: 'James Mitchell',      email: 'james.mitchell@e2e-test.handlelifeos.app',   password: 'E2eTest123!' },
  { id: 'fatima',   name: 'Fatima Al-Rashid',    email: 'fatima.alrashid@e2e-test.handlelifeos.app',  password: 'E2eTest123!' },
  { id: 'carlos',   name: 'Carlos Rodriguez',    email: 'carlos.rodriguez@e2e-test.handlelifeos.app', password: 'E2eTest123!' },
  { id: 'yuki',     name: 'Yuki Tanaka',         email: 'yuki.tanaka@e2e-test.handlelifeos.app',      password: 'E2eTest123!' },
  { id: 'sarah',    name: 'Sarah Johnson',       email: 'sarah.johnson@e2e-test.handlelifeos.app',    password: 'E2eTest123!' },
  { id: 'abdullah', name: 'Abdullah Khan',       email: 'abdullah.khan@e2e-test.handlelifeos.app',    password: 'E2eTest123!' },
  { id: 'emma',     name: 'Emma Wilson',         email: 'emma.wilson@e2e-test.handlelifeos.app',      password: 'E2eTest123!' },
  { id: 'rajesh',   name: 'Rajesh Patel',        email: 'rajesh.patel@e2e-test.handlelifeos.app',     password: 'E2eTest123!' },
  { id: 'nina',     name: 'Nina Okonkwo',        email: 'nina.okonkwo@e2e-test.handlelifeos.app',     password: 'E2eTest123!' },
]

async function seed() {
  console.log('🌱  Seeding 10 E2E persona accounts...\n')

  const results = []

  for (const persona of PERSONAS) {
    process.stdout.write(`  ${persona.id.padEnd(10)} ${persona.email} ... `)

    // Check if user already exists
    const { data: existing } = await db
      .from('users')
      .select('id, email_verified')
      .eq('email', persona.email)
      .maybeSingle()

    if (existing) {
      // Ensure email_verified = true
      if (!existing.email_verified) {
        await db.from('users').update({ email_verified: true }).eq('email', persona.email)
        console.log('✔  already exists — marked verified')
      } else {
        console.log('✔  already exists + verified')
      }
      results.push({ ...persona, status: 'existing', id_db: existing.id })
      continue
    }

    // Hash password (cost 12 = production-equivalent security)
    const password_hash = await bcrypt.hash(persona.password, 12)

    const { data, error } = await db
      .from('users')
      .insert({
        email: persona.email,
        name: persona.name,
        password_hash,
        email_verified: true,
      })
      .select('id')
      .single()

    if (error) {
      console.log(`✗  FAILED: ${error.message}`)
      results.push({ ...persona, status: 'error', error: error.message })
    } else {
      console.log(`✔  created (${data.id})`)
      results.push({ ...persona, status: 'created', id_db: data.id })
    }
  }

  console.log('\n──────────────────────────────────────────────────')
  const created  = results.filter(r => r.status === 'created').length
  const existing = results.filter(r => r.status === 'existing').length
  const failed   = results.filter(r => r.status === 'error').length

  console.log(`  Created : ${created}`)
  console.log(`  Existing: ${existing}`)
  console.log(`  Failed  : ${failed}`)
  console.log('──────────────────────────────────────────────────')
  console.log('\n✅  All accounts ready. Login with password: E2eTest123!\n')

  if (failed > 0) {
    console.log('⚠️  Failed accounts:')
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   ${r.email}: ${r.error}`)
    })
  }
}

seed().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
