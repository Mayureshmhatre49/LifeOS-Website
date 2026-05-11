/**
 * Seed: Pierre Dubois — Vigneron & Château Owner, Bordeaux, France (EUR)
 * Email: pierre.dubois@e2e-test.handlelifeos.app
 * Persona #32 — Château du Lac, AOC Bordeaux Supérieur, wine tourism, heritage property, seasonal harvest income
 */

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

const EMAIL = 'pierre.dubois@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedPierre() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Pierre Dubois',
    occupation: 'Vigneron & Propriétaire de Château — AOC Bordeaux Supérieur',
    life_stage: 'mid_career',
    country: 'FR',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    goals: [
      'Obtain HVE3 organic/biodynamic certification by 2028',
      'Scale UK direct export to 15,000 bottles annually via Berry Bros + Waitrose',
      'Open estate gîte accommodation for wine tourism — target 2027',
      'Launch cave du château Shopify e-commerce for direct French consumer sales'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 18000, spent: 14500, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 2500, spent: 2500, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 2000, spent: 1850, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 1200, spent: 980, currency: 'EUR' },
    { user_id: uid, month: 4, year: 2026, category: 'Entertainment', budgeted: 800, spent: 620, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 22000, spent: 11200, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 2500, spent: 1250, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 2000, spent: 950, currency: 'EUR' },
    { user_id: uid, month: 5, year: 2026, category: 'Transport', budgeted: 1200, spent: 600, currency: 'EUR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 4800, currency: 'EUR', category: 'misc', description: 'Sulphur + copper treatment — vines pre-flowering, 12 ha', expense_date: '2026-04-03' },
      { user_id: uid, amount: 2500, currency: 'EUR', category: 'utilities', description: 'Chai (wine cellar) electricity — temperature control Q1 2026', expense_date: '2026-04-05' },
      { user_id: uid, amount: 1850, currency: 'EUR', category: 'food', description: 'Family groceries — household of 4, Leclerc + marché Bordeaux', expense_date: '2026-04-08' },
      { user_id: uid, amount: 3200, currency: 'EUR', category: 'misc', description: 'New oak barriques — 12 pieces at €265 each for 2025 vintage élevage', expense_date: '2026-04-12' },
      { user_id: uid, amount: 980, currency: 'EUR', category: 'transport', description: 'Van fuel + maintenance — vineyard rounds and delivery', expense_date: '2026-04-15' },
      { user_id: uid, amount: 620, currency: 'EUR', category: 'entertainment', description: 'Dinner with Maison Delor négociant team — annual relationship dinner', expense_date: '2026-04-18' },
      { user_id: uid, amount: 1200, currency: 'EUR', category: 'misc', description: 'Label printing — new wine labels for 2022 vintage release, 6,000 units', expense_date: '2026-04-20' },
      { user_id: uid, amount: 6500, currency: 'EUR', category: 'misc', description: 'Seasonal vine worker wages — canopy management team April', expense_date: '2026-04-28' },
      { user_id: uid, amount: 4200, currency: 'EUR', category: 'bills', description: 'Crédit Agricole loan repayment — château renovation tranche', expense_date: '2026-05-01' },
      { user_id: uid, amount: 1200, currency: 'EUR', category: 'travel', description: 'ProWein Düsseldorf — transport (TGV+ICE), hotel, registration fee', expense_date: '2026-05-05' },
      { user_id: uid, amount: 380, currency: 'EUR', category: 'entertainment', description: 'Hosted buyer dinner — Im Schiffchen Düsseldorf, 4 guests', expense_date: '2026-05-18' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Morning vineyard walk — vines inspection', description: 'Dawn walk through all 12 hectares. Read disease signs, canopy state, hydration needs.', frequency: 'daily',
        target_count: 1, current_streak: 45, longest_streak: 120, completed_today: true,
        category: 'work', color: '#10b981', icon: '🍇', reminder_time: '07:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Cave tasting — barrel samples', description: 'Weekly tasting directly from barrel. Track evolution. Note adjustments needed for élevage.', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 26, completed_today: false,
        category: 'work', color: '#8b5cf6', icon: '🍷', reminder_time: '10:00', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'English wine vocabulary practice', description: 'UK market is key. Improve tasting note vocabulary for export buyer meetings and catalogue copy.', frequency: 'daily',
        target_count: 1, current_streak: 12, longest_streak: 30, completed_today: true,
        category: 'learning', color: '#f59e0b', icon: '🇬🇧', reminder_time: '20:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Winemaking journal — weather + vine notes', description: 'Log temperature, rainfall, vine phenology stage daily. Essential for vintage records and insurance.', frequency: 'daily',
        target_count: 1, current_streak: 28, longest_streak: 365, completed_today: true,
        category: 'work', color: '#3b82f6', icon: '📔', reminder_time: '18:00', active: true, created_at: '2025-01-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 182, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'ProWein 2026 export portfolio pitch deck — buyer presentations',
        notes: '24-page deck built. Five UK buyers booked. Château du Lac 2022 Grand Réserve leading the pitch with food-pairing sheet.',
        started_at: '2026-04-10T09:00:00Z', ended_at: '2026-04-10T12:02:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 115, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Organic certification HVE3 — gap analysis and soil amendment plan',
        notes: 'Gap analysis complete. Three synthetic pesticides to replace. Soil biometer testing needed. Biodiversity strip required alongside Route 14. 3-year transition minimum.',
        started_at: '2026-04-22T14:00:00Z', ended_at: '2026-04-22T15:55:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 88, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Cave du château e-commerce — Shopify store architecture and fulfilment model',
        notes: 'Shopify + Colissimo decided. 6-bottle gift sets for Christmas trade. Cellar photography needed for landing page. Launch target October 2026.',
        started_at: '2026-05-06T10:00:00Z', ended_at: '2026-05-06T11:28:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 4, note: 'Première fleur sur les Merlots — flowering started 8 days ahead of 2025. If August holds, the 2026 vintage could be exceptional. Same conditions as 2022.', logged_at: '2026-04-18T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'ProWein prep intense but the deck is solid. Five buyers confirmed meeting slots in Düsseldorf. Richard from Berry Bros is the key one.', logged_at: '2026-04-28T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Spotted early oidium on block 4 Sauvignon Blanc. Treated immediately. The annual anxiety — one bad disease wave can cost 20% of the harvest.', logged_at: '2026-05-03T19:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Richard from Berry Bros confirmed 6,000-bottle order for the 2022 vintage. First UK export above 5,000 bottles. Milestone.', logged_at: '2026-05-08T18:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-18', items: ['Early flowering — nature cooperating for the 2026 vintage', 'Three generations of family who built this domaine on this terroir', 'The Merlot terroir of this corner of Bordeaux that no one can replicate'] },
    { date: '2026-04-28', items: ['Sophie for managing estate visitors while I prep for ProWein', 'The négociant relationships built over 20 patient years', 'Access to the appellation that gives Château du Lac its meaning'] },
    { date: '2026-05-08', items: ['Richard Berry Bros confirmed 6,000-bottle UK order', 'The 2022 vintage that proved we can compete at export level', 'Papa who planted these Merlot vines 30 years ago — he knew this land'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // 9. Journal entries
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      {
        user_id: uid, title: 'La Floraison 2026 — Vintage Looks Promising',
        content: 'Flowering started 8 days early. Merlot showing perfect cluster density — no coulure risk this year. If August stays dry like 2022, we are looking at a 90+ Robert Parker vintage. The organic certification will add €8-12 per bottle at UK fine wine retail. Everything has to align but for the first time in years, I feel optimistic.',
        mood: 5, tags: ['vintage', 'farming', 'optimism'], created_at: '2026-04-19T21:00:00Z'
      },
      {
        user_id: uid, title: "The Gîte Question — Winery or Hotel?",
        content: 'Consulted the Gironde chamber of commerce. Converting the old ouvrier cottages into two gîtes costs €85,000 but would generate €32,000 per year in wine tourism revenue. Guests who stay buy 3× more wine direct from the cave than day visitors. It would reduce négociant dependence permanently. But I am a vigneron, not a hotelier. Sophie is more excited than I am.',
        mood: 3, tags: ['decision', 'tourism', 'strategy'], created_at: '2026-05-02T22:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: "Invest €85K in wine tourism gîtes (worker cottages conversion), or apply that capital to organic certification and UK export infrastructure?",
        category: 'Business',
        mode: 'compare',
        options: [
          { label: 'Build gîtes for wine tourism', pros: ['€32K/year tourism revenue', 'Direct wine sales to guests at 3× premium', 'Brand story for UK export marketing'], cons: ['€85K capex + renovation risk', 'Seasonal occupation uncertainty (June–September only)', 'Distraction from core winemaking identity'] },
          { label: 'Organic cert + export infrastructure', pros: ['HVE3 delivers €8-12/bottle margin premium', 'Stronger UK fine wine buyer positioning', 'Compounding revenue growth over 10 years'], cons: ['3-year payback horizon minimum', 'Higher certification compliance cost', 'No immediate cash flow improvement'] }
        ],
        result: { summary: 'Organic certification delivers compounding margin gains long-term. Gîtes solve near-term cash flow. Recommended approach: HVE3 certification first (2026–28), then gîtes from cash flow (2028+).', chosen: 'Organic certification priority, gîtes deferred to 2028', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-03T10:00:00Z'
      },
      {
        user_id: uid,
        question: "Accept Maison Delor's offer to buy 40% of 2026 harvest at guaranteed price, or take volume risk and sell exclusively direct and via export?",
        category: 'Finance',
        mode: 'analyze',
        options: [
          { label: 'Accept 40% harvest allocation to Delor', pros: ['Guaranteed revenue floor', 'Reduce storage pressure and export risk', 'Preserve long-standing négociant relationship'], cons: ['Delor margin 22% below retail equivalent', 'Limits direct consumer brand narrative', 'Volume lock-in reduces export flexibility'] },
          { label: 'Sell 100% direct + UK export', pros: ['Full margin retained across all volume', 'Berry Bros and Waitrose at retail parity', 'No intermediary cut'], cons: ['Volume risk if export underperforms', 'Cash flow delay: UK payment terms 90 days', 'Storage capacity pressure at Château'] }
        ],
        result: { summary: 'Hybrid model is optimal: 25% to Delor for cash floor security, 75% split cave direct and UK export. Reduces risk without surrendering meaningful margin.', chosen: '25% Delor / 75% direct + UK export', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-15T09:00:00Z'
      }
    ])
  }

  // 11. Investments
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Foncier viticole — Château du Lac terroir (12 ha)', type: 'real_estate', invested_amount: 480000, current_value: 620000, currency: 'EUR', account: 'Crédit Agricole Gironde', notes: 'Primary productive asset. Bordeaux AOC land appreciating 4-6% annually. Multi-generational hold.', purchase_date: '2012-03-01' },
      { user_id: uid, name: 'Livret A — Crédit Agricole', type: 'savings', invested_amount: 22950, current_value: 22950, currency: 'EUR', account: 'Crédit Agricole', notes: 'French risk-free savings at 3%. Max cap reached. Maintained as personal emergency buffer.', purchase_date: '2020-01-01' },
      { user_id: uid, name: 'Assurance-vie Linxea Spirit 2 — MSCI World fonds', type: 'etf', invested_amount: 65000, current_value: 74200, currency: 'EUR', account: 'Linxea', notes: 'MSCI World + fonds euros mix. Long-term family wealth vehicle outside the estate.', purchase_date: '2019-06-01' },
      { user_id: uid, name: 'GFV Groupement Foncier Viticole — France Valley Bordeaux', type: 'other', invested_amount: 30000, current_value: 33500, currency: 'EUR', account: 'France Valley', notes: 'Collective wine estate fund. Tax-advantaged via IFI reduction. Annual bottle income + capital appreciation.', purchase_date: '2022-04-01' },
    ])
  }

  // 12. Business clients and projects
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Maison Delor Négoce — Purchasing', email: 'achats@maison-delor.com', company: 'Maison Delor', notes: '15-year négociant relationship. Buys 25-40% of harvest at fixed negotiated price. Bordeaux Supérieur specialist. Reliable but low-margin partner.', currency: 'EUR' },
      { user_id: uid, name: 'Richard Fortescue — Berry Bros & Rudd', email: 'r.fortescue@bbr.com', company: 'Berry Bros & Rudd', notes: 'UK fine wine merchant (est. 1698). 6,000-bottle order 2022 vintage confirmed at €9/bottle FOB. Key growth relationship.', currency: 'EUR' },
      { user_id: uid, name: 'Nihon Wines — Tokyo Import', email: 'import@nihon-wines.jp', company: 'Nihon Wines KK', notes: 'Japanese wine importer for restaurant trade. 1,800-bottle order. Prefers Merlot-dominant Bordeaux blends.', currency: 'EUR' },
      { user_id: uid, name: 'Cave Bordeaux Direct — B2C Club', email: 'pro@cave-bordeaux-direct.fr', company: 'Cave Bordeaux Direct', notes: 'Monthly wine subscription club. 200-bottle allocation per month. Consistent cash flow with no negotiation.', currency: 'EUR' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[1].id, name: '2022 Grand Réserve — Berry Bros 6,000-bottle export', status: 'active', fee: 54000, currency: 'EUR', notes: '€9/bottle FOB Bordeaux. Delivery May 2026 via Gould Campbell Wines shipping. 90-day sterling payment terms.', due_date: '2026-05-20' },
        { user_id: uid, client_id: clients[2].id, name: '2022 Merlot Classique — Nihon Wines 1,800 bottles', status: 'active', fee: 14400, currency: 'EUR', notes: '€8/bottle EXW. Nihon managing own freight from Bordeaux to Tokyo. Q3 delivery for autumn Japan wine season.', due_date: '2026-07-31' },
        { user_id: uid, client_id: clients[0].id, name: '2026 Harvest — Delor 25% allocation', status: 'proposal', fee: 68000, currency: 'EUR', notes: 'Projected 25% of estimated 8,000-case harvest at €34/case guaranteed. Delor counter at €31. Still negotiating.', due_date: '2026-10-01' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Richard Fortescue', email: 'r.fortescue@bbr.com', phone: '+442073969600', group_name: 'Business', notes: 'Berry Bros buyer. Confirmed 6K bottle order. Key UK growth relationship. Schedule cellar visit September 2026.' },
      { user_id: uid, name: 'Jean-Luc Moreau', email: 'jl.moreau@inao.fr', phone: '+33556006600', group_name: 'Business', notes: 'INAO HVE3 certification inspector for Gironde. Recommended contact for pre-audit site visit before applying.' },
      { user_id: uid, name: 'Sophie Dubois', email: '', phone: '+33612345678', group_name: 'Family', notes: 'Wife and co-manager. Runs wine tourism bookings, cave du château shop, and gîte project planning. Essential partner.' },
      { user_id: uid, name: 'Martin Lacoste', email: 'mlacoste@vitibordeaux.fr', phone: '+33556793900', group_name: 'Mentors', notes: 'Neighbouring vigneron — 8 ha Pomerol AOC. 25 years experience. Advice on organic conversion timeline and realistic cost.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Obtain HVE3 organic certification by June 2028', category: 'other',
        description: 'High Environmental Value Level 3. Gap analysis complete. Soil biometer, biodiversity strip, 3 pesticide replacements required. 3-year transition pathway.',
        target_date: '2028-06-01', status: 'active', progress_pct: 20
      },
      {
        user_id: uid, title: 'Scale UK direct export to 15,000 bottles annually', category: 'income',
        description: 'Currently 6,000 bottles to Berry Bros. Add Waitrose Fine Wine plus one specialist merchant. Target 15K bottles at €8.50 average FOB.',
        target_date: '2027-12-31', status: 'active', progress_pct: 40
      },
      {
        user_id: uid, title: 'Launch cave du château Shopify e-commerce', category: 'skill',
        description: 'Direct-to-consumer online shop for French buyers. 6-bottle gift sets, vertical tasting packs, Christmas boxes. Target €45K revenue year 1.',
        target_date: '2026-11-30', status: 'active', progress_pct: 25
      },
    ])
  }

  // 15. Trip — ProWein Düsseldorf
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Düsseldorf, Germany', country_code: 'DE',
        starts_on: '2026-05-17', ends_on: '2026-05-20',
        purpose: 'business', status: 'booked',
        budget_total: 2800, currency: 'EUR',
        notes: "ProWein 2026 — world's largest wine trade fair. 5 buyer meetings booked. Bringing 36 bottles: 2022 Grand Réserve, 2021 Classique, 2023 Rosé."
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'TGV Bordeaux → Paris + ICE Paris → Düsseldorf', starts_at: '2026-05-17T06:30:00Z', ends_at: '2026-05-17T14:00:00Z', cost: 340, currency: 'EUR', notes: 'Direct rail connection. Wine bottles in checked luggage. No flying — too risky with precious samples.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Marriott Courtyard Düsseldorf — 3 nights', starts_at: '2026-05-17T15:00:00Z', ends_at: '2026-05-20T11:00:00Z', cost: 720, currency: 'EUR', notes: '15-minute U-Bahn from Messe Düsseldorf. Business district, reliable WiFi for follow-up emails.' },
        { trip_id: trips[0].id, type: 'activity', title: 'ProWein stand — Hall 14, Stand C28', starts_at: '2026-05-18T09:00:00Z', ends_at: '2026-05-20T17:00:00Z', cost: 1200, currency: 'EUR', notes: 'Stand fee + promotional material. 5 buyer tasting appointments across 2 days.' },
        { trip_id: trips[0].id, type: 'restaurant', title: 'Hosted buyers dinner — Im Schiffchen Düsseldorf', starts_at: '2026-05-18T20:00:00Z', ends_at: '2026-05-18T23:00:00Z', cost: 380, currency: 'EUR', notes: 'Richard (Berry Bros) + 2 German merchants + 1 Swiss buyer. Château du Lac 2019 magnum served.' },
      ])
    }
  }

  // 16. Meal plans (French household)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Tartines beurre + café au lait', calories: 380, notes: 'Quick breakfast before morning vineyard walk' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Entrecôte bordelaise + pommes sarladaises', calories: 780, notes: 'Main meal of the day — family together at 12h30' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Soupe + fromage + pain', calories: 450, notes: 'Light dinner after long day in the vines' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Cassoulet maison + salade verte', calories: 720, notes: 'Sophie made cassoulet — always better on day 2' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'lunch', recipe_name: 'Magret de canard + haricots verts', calories: 650, notes: 'Friday lunch — glass of Château du Lac 2022 permitted' },
    ])
  }

  console.log('✅ Pierre Dubois (#32) seeded — EUR, Bordeaux, Château du Lac vigneron, ProWein export trip')
}

seedPierre().catch(e => { console.error(e); process.exit(1) })
