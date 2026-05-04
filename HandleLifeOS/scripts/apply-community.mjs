// Print the Phase 27 community migration so the user can paste it into Supabase SQL Editor.
import { readFileSync } from 'fs'

const sql = readFileSync('supabase/migrations/20260504000030_phase27_community.sql', 'utf8')

console.log('— Phase 27 Social & Community migration —')
console.log()
console.log('Run this in Supabase SQL Editor:')
console.log('═══════════════════════════════════════════════════════════════════════════')
console.log(sql)
console.log('═══════════════════════════════════════════════════════════════════════════')
console.log()
console.log('After running it, /community will work and the catalog will show 10 challenges.')
