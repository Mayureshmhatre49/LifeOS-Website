/**
 * Seed all data for Leila Ahmadi (E2E persona #27).
 * 32yo Architect & Urban Designer, Berlin, Germany. EUR. Iranian-German, sustainability focus.
 * Run: node tests/e2e-personas/seed-leila-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'leila.ahmadi@e2e-test.handlelifeos.app'
const PASSWORD = 'E2eTest1234!'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function main() {
  /* ── user ── */
  let uid
  const { data: existing } = await sb.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === EMAIL)
  if (found) {
    uid = found.id
    console.log('User exists:', uid)
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL, password: PASSWORD, email_confirm: true
    })
    if (error) throw error
    uid = data.user.id
    console.log('User created:', uid)
  }

  /* ── profile ── */
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Leila Ahmadi',
    occupation: 'Architect & Urban Designer — Ahmadi Studio Berlin',
    life_stage: 'mid_career',
    country: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    goals: ['win EU sustainable architecture award', 'buy Berlin apartment before rent law changes', 'expand studio to 5 people', 'complete Iran cultural centre pro bono project'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'studio', value: 'Ahmadi Studio — freelance architectural practice. Focus: sustainable urban residential and cultural buildings. 3 active projects, 2 in pipeline', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'background', value: 'Born Tehran, moved to Berlin at 10 with family. German-Iranian dual national. Studied at TU Berlin (Dipl.-Ing. Architektur). Speaks Farsi, German, English', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'work_philosophy', value: 'Sustainability is non-negotiable. All projects must meet Passivhaus standard or better. Refuses greenwashing briefs', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'income', value: 'Freelance architecture: €6,000-10,000/month (project-based). Also teaches 1 semester/year at TU Berlin (€1,800/month honorarium)', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'property', value: 'Targeting Berlin-Neukölln 2-room apartment. Budget €280-320K. German mortgage possible but deposit needed: €60-80K', confidence: 80 },
      { user_id: uid, type: 'preference', key: 'lifestyle', value: 'Cycles everywhere in Berlin. Vegan. Mitte atelier space shared with 2 other architects. Reads architectural theory obsessively', confidence: 85 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 7200, savings_target: 2000, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 9500, savings_target: 3000, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 6800, savings_target: 1800, currency: 'EUR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 1050, description: 'Neukölln flat — Kaltmiete + Nebenkosten', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'rent', amount: 420, description: 'Atelier share (Mitte — 3-way split)', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'food', amount: 320, description: 'Wochenmarkt Neukölln + vegane Supermärkte (Alnatura, Veganz)', expense_date: '2026-05-04', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'utilities', amount: 95, description: 'Strom (Naturstrom 100% erneuerbar) + Internet', expense_date: '2026-05-02', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'transport', amount: 29, description: 'BVG Deutschlandticket (Fahrrad primär)', expense_date: '2026-05-01', is_recurring: true, currency: 'EUR' },
      { user_id: uid, category: 'misc', amount: 580, description: 'Architektur-Software — ArchiCAD Lizenz + Rhino (quarterly)', expense_date: '2026-05-05', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'education', amount: 180, description: 'DABdigital (Architektenkammer) Fortbildung + Fachbücher', expense_date: '2026-05-08', is_recurring: false, currency: 'EUR' },
      { user_id: uid, category: 'entertainment', amount: 95, description: 'Museum + Ausstellungen + Konzert (Berghain selten)', expense_date: '2026-05-10', is_recurring: false, currency: 'EUR' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Berlin apartment deposit (20%)', category: 'home', target_amount: 70000, current_amount: 38000, currency: 'EUR', target_date: '2027-12-31' },
      { user_id: uid, title: 'Emergency fund (4 months)', category: 'emergency_fund', target_amount: 28000, current_amount: 21000, currency: 'EUR', target_date: '2026-09-30' },
      { user_id: uid, title: 'Tehran family visit fund', category: 'vacation', target_amount: 3500, current_amount: 2100, currency: 'EUR', target_date: '2026-12-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'iShares MSCI World ESG Screened ETF (SUAS)', type: 'etf', invested_amount: 32000, current_value: 39500, currency: 'EUR', account: 'Trade Republic', notes: 'ESG-screened only — aligns with sustainability values. Monthly SIP €500' },
      { user_id: uid, name: 'Ökoworld Klima Fonds (DE000A0MUS11)', type: 'mutual_fund', invested_amount: 12000, current_value: 14200, currency: 'EUR', account: 'Comdirect', notes: 'German sustainable fund. Climate-focused, no fossil fuels' },
      { user_id: uid, name: 'Künstlersozialkasse (KSK) Rentenversicherung', type: 'other', invested_amount: 8500, current_value: 8500, currency: 'EUR', account: 'KSK', notes: 'Mandatory artist/freelancer social insurance — 50% state subsidy on pension contributions' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning sketch / design ideation', icon: '✏️', color: 'violet', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Cycle to atelier (Neukölln → Mitte)', icon: '🚴', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Read architectural press (Dezeen, Arch Daily)', icon: '📰', color: 'indigo', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Yoga or meditation (30 min)', icon: '🧘', color: 'rose', frequency: 'daily', days_of_week: [1,3,5,7], target_per_day: 1 },
      { user_id: uid, name: 'Client progress update', icon: '🏗️', color: 'amber', frequency: 'weekly', days_of_week: [4], target_per_day: 1 },
    ]
    const { data } = await sb.from('habits').insert(habits).select()
    data.forEach(h => { habitIds[h.name] = h.id })
  } else {
    const { data } = await sb.from('habits').select('id, name').eq('user_id', uid)
    data.forEach(h => { habitIds[h.name] = h.id })
  }

  /* ── habit_logs ── */
  if (await cnt('habit_logs', uid) === 0) {
    const logs = []
    const allDates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                      '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const sketchId = habitIds['Morning sketch / design ideation']
    const cycleId = habitIds['Cycle to atelier (Neukölln → Mitte)']
    if (sketchId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: sketchId, date: d, count: 1 }))
    if (cycleId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: cycleId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Win EU Mies van der Rohe Award nomination', category: 'impact', target_date: '2028-01-01', status: 'active', progress_pct: 25, description: 'Kreuzberg community centre project — nominated by Berlin Architektenkammer after completion Q1 2027' },
      { user_id: uid, title: 'Complete Passivhaus Designer Certification (PHD)', category: 'skill', target_date: '2026-09-30', status: 'active', progress_pct: 65, description: 'Passivhaus Institut course. 3 modules remaining. Enhances premium project positioning' },
      { user_id: uid, title: 'Grow Ahmadi Studio to 5 people', category: 'role', target_date: '2027-12-31', status: 'active', progress_pct: 20, description: 'Currently solo + 1 intern. Need 2 more architects and office manager as projects scale' },
      { user_id: uid, title: 'Buy Neukölln apartment (2-Zimmer)', category: 'other', target_date: '2028-06-30', status: 'active', progress_pct: 54, description: 'Deposit €38K of €70K. Prices stabilising post-Mietpreisbremse. Target: Reuterstraße area' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Thomas Bernhardt', email: 'tbernhardt@gruenebau.de', company: 'GrüneBau Wohnungsbau GmbH', notes: 'Residential developer — 24-unit Passivhaus project in Spandau. Main client. €85K project fee', currency: 'EUR' },
      { user_id: uid, name: 'Nilufar Rashidova', email: 'nilufar@iranhaus.berlin', company: 'Iranisches Haus Berlin e.V.', notes: 'Pro bono cultural centre redesign. Personal mission project — Iranian diaspora community space', currency: 'EUR' },
      { user_id: uid, name: 'Dr. Sabine Kühn', email: 'sabine.kuehn@berlin.de', company: 'Senatsverwaltung für Stadtentwicklung', notes: 'Berlin Senate urban planning consultant — Kreuzberg community housing study. €22K brief', currency: 'EUR' },
    ]
    const { data } = await sb.from('business_clients').insert(clients).select()
    clientIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('business_clients').select('id').eq('user_id', uid)
    clientIds = data.map(c => c.id)
  }

  /* ── business_projects ── */
  if (await cnt('business_projects', uid) === 0) {
    await sb.from('business_projects').insert([
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'Spandau Passivhaus — 24 Wohneinheiten', status: 'active', fee: 85000, currency: 'EUR', notes: 'Schematic design approved. Planning permission submitted. Milestone 2 of 5' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Iranisches Haus Berlin — Innenumbau', status: 'active', fee: 0, currency: 'EUR', notes: 'Pro bono. Community vote approved design. Fundraising for construction underway (€45K needed)' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Kreuzberg Wohnraumstudie', status: 'done', fee: 22000, currency: 'EUR', notes: 'Delivered March 2026. Senate used for new Milieuschutz application. Excellent reference' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Prof. Dr. Markus Steiner', group_name: 'mentor', email: 'm.steiner@tu-berlin.de', role: 'Professor of Urban Design, TU Berlin', notes: 'Thesis supervisor and ongoing mentor. Nominated Kreuzberg project for Mies Award. Regular coffee', strength: 4 },
      { user_id: uid, name: 'Neda Ahmadi', email: 'neda.ahmadi@gmail.com', group_name: 'family', role: 'Mother — retired architect, Tehran', notes: 'Calls every Sunday (Signal — secure). Inspires Leila\'s Iranian cultural sensitivity in design', strength: 5 },
      { user_id: uid, name: 'Franziska Müller', group_name: 'friend', email: 'fmuller@mitte-atelier.de', role: 'Architect — shares atelier space', notes: 'Best friend in Berlin. Collaborates on urban installations. Always brutally honest about designs', strength: 5 },
    ]
    const { data } = await sb.from('contacts').insert(contacts).select()
    contactIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('contacts').select('id').eq('user_id', uid)
    contactIds = data.map(c => c.id)
  }

  /* ── contact_interactions ── */
  if (contactIds.length > 0) {
    const { count } = await sb.from('contact_interactions').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!count) {
      await sb.from('contact_interactions').insert([
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'TU lecture prep — Leila teaching guest seminar on Passivhaus certification May 20', interacted_at: '2026-05-08T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Design critique of Spandau project — Franzi pointed out solar gain issue on west facade. Redesign needed', interacted_at: '2026-05-07T11:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 170, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Spandau project — west facade solar redesign', notes: 'Fixed overheating risk with external shading system. Thermal bridge calculation updated', started_at: '2026-05-07T09:00:00Z', ended_at: '2026-05-07T12:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Iranisches Haus — fundraising pitch materials', notes: 'Architectural renders for crowdfunding campaign. Goal: €45K', started_at: '2026-05-05T10:00:00Z', ended_at: '2026-05-05T11:30:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'TU Berlin guest seminar slides', notes: 'Passivhaus certification process — 12 student exercises prepared', started_at: '2026-05-08T15:00:00Z', ended_at: '2026-05-08T15:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Vienna — Architektur-Biennale 2026', start_date: '2026-09-22', end_date: '2026-09-25', status: 'planning', budget_total: 800, currency: 'EUR', travellers: 1, notes: 'Annual architecture networking. Presenting Iranisches Haus concept at diaspora design panel' },
      { user_id: uid, destination: 'Tehran — Family Visit (if visa allows)', start_date: '2026-12-20', end_date: '2027-01-04', status: 'planning', budget_total: 2800, currency: 'EUR', travellers: 1, notes: 'Last visit was 2023. Complex visa situation as Iranian-German. Will apply in September' },
    ]).select()
    tripIds = data.map(t => t.id)
  } else {
    const { data } = await sb.from('trips').select('id').eq('user_id', uid)
    tripIds = data.map(t => t.id)
  }

  if (tripIds.length > 0) {
    const { count: tiCount } = await sb.from('trip_items').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!tiCount) {
      await sb.from('trip_items').insert([
        { trip_id: tripIds[0], user_id: uid, type: 'transport', title: 'Berlin → Wien (Nightjet ÖBB)', starts_at: '2026-09-22T21:00:00Z', cost: 89, notes: 'Overnight sleeper — sustainable travel, no flight' },
        { trip_id: tripIds[0], user_id: uid, type: 'hotel', title: 'Wombats Hostel Vienna (private room)', starts_at: '2026-09-23T08:00:00Z', ends_at: '2026-09-25T10:00:00Z', cost: 180, notes: '2 nights — frugal travel budget' },
        { trip_id: tripIds[0], user_id: uid, type: 'activity', title: 'Diaspora Design Panel — "Architecture as Cultural Memory"', starts_at: '2026-09-24T10:00:00Z', cost: 0, notes: 'Presenting Iranisches Haus Berlin concept' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Redesigned the facade issue. Franzi was right and I am glad she pushed me', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'Iranisches Haus crowdfunding launched — €8,400 raised on day 1. Community response overwhelming', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Freelance income anxiety — May is slow. Need May invoice paid this week', logged_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 5, note: 'Morning sketch was exceptional — concept for Spandau courtyard that emerged from nothing', logged_at: '2026-05-10T08:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'The cultural centre and what it costs', content: "The Iranisches Haus project pays nothing and costs everything. I have spent 80 hours on it since January. But when I walked into that community meeting and saw 60 Iranian Berliners — some who left in 1980, some who left last year — all arguing passionately about the courtyard design, I understood. Architecture is how communities say: we are here and we intend to stay. I am here. I intend to stay.", mood: 5, tags: ['diaspora', 'identity', 'architecture', 'purpose'], created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, title: 'On being a Passivhaus architect in 2026', content: "A developer called today asking if I could 'make the sustainable bits optional to save cost.' I declined. Franzi said I lost €30K by saying no. She is right and I would do it again. There is no architecture without integrity. I will not put my name on a building that heats the planet to save someone's margin.", mood: 4, tags: ['values', 'architecture', 'sustainability', 'principles'], created_at: '2026-05-06T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['Franzi\'s honest design critique', 'Passivhaus certification 65% done', 'Berlin Neukölln community feeling like home']
        : gd === '2026-05-09'
        ? ['€8,400 raised for Iranisches Haus day 1', 'Iranian diaspora community trust', 'Morning sketches that become buildings']
        : ['Mother\'s voice on Sunday calls from Tehran', 'Berlin cycling infrastructure', 'Atelier space that inspires daily']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Accept €150K commercial office project (not Passivhaus, not my style) to accelerate flat deposit?',
        category: 'business', mode: 'analyze',
        options: [{ label: 'Accept — financial pragmatism', pros: ['€150K fee', 'deposit in 1 year'] }, { label: 'Decline — stay authentic', pros: ['brand integrity', 'better referrals'], cons: ['slower deposit saving'] }],
        result: { summary: 'Decline — my reputation as sustainable architect is the moat. Compromising it for one project risks years of positioning', chosen: 'Decline', outcome: 'decided' },
        favorite: true, created_at: '2026-05-06T23:00:00Z'
      },
      {
        user_id: uid, question: 'Crowdfund Iranisches Haus renovation vs apply for Berlin Senate cultural grant?',
        category: 'other', mode: 'compare',
        options: [{ label: 'Crowdfunding', pros: ['community ownership', 'faster'] }, { label: 'Senate grant', pros: ['€45K available', 'no repayment'], cons: ['12-month wait', 'heavy reporting requirements'] }],
        result: { summary: 'Both simultaneously — crowdfunding builds community momentum, grant application runs in parallel as backup', chosen: 'Dual approach', outcome: 'decided' },
        favorite: false, created_at: '2026-05-04T20:00:00Z'
      },
    ])
  }

  console.log('✅ Leila Ahmadi seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
