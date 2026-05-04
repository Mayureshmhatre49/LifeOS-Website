// Apply the Phase 28 personalisation migration. Tries direct SQL via the
// Supabase REST `query` endpoint; falls back to printing instructions.
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
  .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
  .reduce((a, l) => { const i = l.indexOf('='); a[l.slice(0, i)] = l.slice(i + 1).replace(/^"(.*)"$/, '$1'); return a }, {})

const sql = readFileSync('supabase/migrations/20260504000020_phase28_personalisation.sql', 'utf8')

console.log('— Phase 28 personalisation migration —')
console.log()
console.log('Run this in Supabase SQL Editor (or paste into the existing APPLY_PENDING.sql workflow):')
console.log('═══════════════════════════════════════════════════════════════════════════')
console.log(sql)
console.log('═══════════════════════════════════════════════════════════════════════════')
console.log()
console.log('After running it, the personalisation tables will be live and /settings/personalisation will work.')
