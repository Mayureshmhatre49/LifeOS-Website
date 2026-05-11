/**
 * Seed: Zainab Al-Sa'eedi — Modest Fashion Designer & Digital Influencer, Riyadh, Saudi Arabia (SAR)
 * Email: zainab.alsaeedi@e2e-test.handlelifeos.app
 * Persona #31 — Arabic display name, abaya/modest fashion brand, Instagram 1.8M followers, halal lifestyle
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

const EMAIL = 'zainab.alsaeedi@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedZainab() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'زينب السعيدي',
    occupation: 'مصممة أزياء محتشمة ومؤثرة رقمية',
    life_stage: 'mid_career',
    country: 'SA',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    goals: [
      'Launch RTW modest fashion DTC line — target SAR 8M GMV by end 2026',
      'Reach 2.5M Instagram followers through authentic modest lifestyle content',
      'Open first boutique in Riyadh Al Nakheel Mall for Eid 2027',
      'Invest 20% of brand net profit monthly into Tadawul dividend stocks'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 8000, spent: 8000, currency: 'SAR' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 3000, spent: 2750, currency: 'SAR' },
    { user_id: uid, month: 4, year: 2026, category: 'Shopping', budgeted: 5000, spent: 6800, currency: 'SAR' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 1500, spent: 1200, currency: 'SAR' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 8000, spent: 7400, currency: 'SAR' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 8000, spent: 4000, currency: 'SAR' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 3000, spent: 1500, currency: 'SAR' },
    { user_id: uid, month: 5, year: 2026, category: 'Shopping', budgeted: 5000, spent: 2200, currency: 'SAR' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 8000, spent: 3900, currency: 'SAR' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 8000, currency: 'SAR', category: 'rent', description: 'Apartment rent — Al Olaya district, Riyadh', expense_date: '2026-04-01' },
      { user_id: uid, amount: 3800, currency: 'SAR', category: 'shopping', description: 'Fabric samples — chiffon & silk for Eid collection', expense_date: '2026-04-03' },
      { user_id: uid, amount: 1200, currency: 'SAR', category: 'food', description: 'Weekly grocery — Panda Hypermarket', expense_date: '2026-04-07' },
      { user_id: uid, amount: 4500, currency: 'SAR', category: 'misc', description: 'Photography studio booking — Spring/Eid lookbook shoot', expense_date: '2026-04-10' },
      { user_id: uid, amount: 850, currency: 'SAR', category: 'transport', description: 'Uber — client meetings + content shoots, April', expense_date: '2026-04-12' },
      { user_id: uid, amount: 2200, currency: 'SAR', category: 'shopping', description: 'Tailoring supplies — Hera district fabric market', expense_date: '2026-04-15' },
      { user_id: uid, amount: 1800, currency: 'SAR', category: 'misc', description: 'Social media ad spend — Instagram & TikTok promoted posts', expense_date: '2026-04-18' },
      { user_id: uid, amount: 950, currency: 'SAR', category: 'food', description: 'Iftar gathering — family & content creator friends', expense_date: '2026-04-22' },
      { user_id: uid, amount: 3200, currency: 'SAR', category: 'travel', description: 'Dubai sourcing trip — Al Fahidi wholesale market samples SAR 18K, hotel SAR 1.2K, flights SAR 680', expense_date: '2026-04-25' },
      { user_id: uid, amount: 600, currency: 'SAR', category: 'utilities', description: 'Electricity & internet — work-from-home studio', expense_date: '2026-04-28' },
      { user_id: uid, amount: 1100, currency: 'SAR', category: 'food', description: 'Groceries + halal meal prep boxes', expense_date: '2026-05-04' },
      { user_id: uid, amount: 2800, currency: 'SAR', category: 'misc', description: 'Influencer management platform — monthly subscription & scheduling tools', expense_date: '2026-05-06' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Fajr prayer — on time', description: 'Rise before dawn, pray Fajr within 15 minutes of adhan', frequency: 'daily',
        target_count: 1, current_streak: 22, longest_streak: 47, completed_today: true,
        category: 'spiritual', color: '#10b981', icon: '🌙', reminder_time: '04:45', active: true, created_at: '2026-01-05T00:00:00Z'
      },
      {
        user_id: uid, name: 'Content creation block — 3 hrs', description: 'Dedicated 3-hour block for shoots, editing, captions and scheduling', frequency: 'daily',
        target_count: 1, current_streak: 15, longest_streak: 30, completed_today: true,
        category: 'work', color: '#6366f1', icon: '📸', reminder_time: '10:00', active: true, created_at: '2026-01-10T00:00:00Z'
      },
      {
        user_id: uid, name: 'Read Quran — 1 juz daily', description: 'Daily Quran recitation with tafsir notes', frequency: 'daily',
        target_count: 1, current_streak: 8, longest_streak: 30, completed_today: false,
        category: 'spiritual', color: '#f59e0b', icon: '📖', reminder_time: '13:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'DM engagement — reply 50 comments', description: 'Authentic daily engagement with followers builds community loyalty', frequency: 'daily',
        target_count: 50, current_streak: 12, longest_streak: 25, completed_today: true,
        category: 'work', color: '#ec4899', icon: '💬', reminder_time: '19:00', active: true, created_at: '2026-02-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Weekly brand books review', description: 'Review P&L, brand deal pipeline, and analytics every Sunday', frequency: 'weekly',
        target_count: 1, current_streak: 4, longest_streak: 12, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '📊', reminder_time: '20:00', active: true, created_at: '2026-03-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 175, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Eid Lookbook — 40 outfit layout in Canva + Arabic caption drafts',
        notes: 'Finished 38 of 40 layouts. Arabic captions drafted. Scheduling Ramadan week posts queue.',
        started_at: '2026-04-08T09:00:00Z', ended_at: '2026-04-08T11:55:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 90, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Brand partnership proposal — Noon.com exclusive collection',
        notes: 'Interrupted by urgent photographer reschedule. Resumed next day.',
        started_at: '2026-04-14T14:00:00Z', ended_at: '2026-04-14T15:30:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 238, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Dubai sourcing trip planning — supplier list, sample order quantities, logistics',
        notes: 'Finalised 12 fabric suppliers. Placed sample orders totalling SAR 18,000. Trip booked April 25–27.',
        started_at: '2026-04-20T10:00:00Z', ended_at: '2026-04-20T14:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 92, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Q2 brand analytics deep-dive — Instagram, TikTok, Noon store',
        notes: 'TikTok reach up 34% QoQ. Noon store conversion rate 4.2%. Reels outperforming static posts 3:1.',
        started_at: '2026-05-04T08:30:00Z', ended_at: '2026-05-04T10:02:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Alhamdulillah — Eid collection sold out in 4 hours on Noon. 1,847 orders in one day. This is the moment I worked 3 years for.', logged_at: '2026-04-08T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Dubai sourcing trip was exhausting but worth it. Found a silk supplier who does custom prints. Game changer for RTW line.', logged_at: '2026-04-27T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Post-Ramadan crash. Content schedule feels like a grind this week. Need to batch smarter and protect my rest.', logged_at: '2026-04-30T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Call with Noon.com partnership team. They want exclusive Ramadan 2027 collection. Terrifying and exciting at the same time.', logged_at: '2026-05-06T19:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'Hit 1.8M Instagram followers! Team photoshoot in the new studio today. The brand is becoming real.', logged_at: '2026-05-09T22:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-08', items: ['Eid collection sold out — Allah made this possible', 'My tailoring team who worked so hard this Ramadan', 'Followers who trust my taste — that is sacred'] },
    { date: '2026-04-27', items: ['Safe travels to Dubai and back', 'Found the silk supplier I prayed to find', 'Business growing alhamdulillah step by step'] },
    { date: '2026-05-04', items: ['Data showing the brand is resonating with women across the GCC', 'Sisters who share and support my work', 'Health to keep creating and building'] },
    { date: '2026-05-09', items: ['1.8 million women trusting my aesthetic', 'Parents who are proud of what I have built', 'The team who makes the vision real every week'] },
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
        user_id: uid, title: 'Eid Collection Sold Out — Alhamdulillah',
        content: 'I stayed up all night monitoring the Noon store. 4 hours after launch — 1,847 orders, SAR 385,000 in sales. I cried at my desk. Three years of learning, failing, learning again. The modest fashion market is real and I am part of it. Next milestone: boutique in Riyadh for Eid 2027.',
        mood: 5, tags: ['milestone', 'brand', 'gratitude'], created_at: '2026-04-09T07:00:00Z'
      },
      {
        user_id: uid, title: 'The Noon Exclusivity Offer — Blessing or Trap?',
        content: 'They want exclusivity for 18 months for Ramadan 2027. The clause means I cannot sell the same designs on my own website or other platforms. SAR 850,000 guaranteed is life-changing money. But I lose creative control and direct customer relationships. Did istikhara. Still processing. Consulting my business mentor Shahad before responding.',
        mood: 3, tags: ['decision', 'business', 'stress'], created_at: '2026-05-07T22:00:00Z'
      },
      {
        user_id: uid, title: '1.8M — The Platform Is the Business Now',
        content: 'When I started posting in 2022 I had 800 followers and zero product. Now 1.8M women follow me for modest fashion inspiration. The algorithm is my distribution channel but I am not dependent on it anymore — I have a real supply chain and wholesale relationships. I am both a brand and a content creator, and I need to stop being afraid of that identity.',
        mood: 4, tags: ['reflection', 'identity', 'brand'], created_at: '2026-05-10T21:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: "Should I accept Noon.com's 18-month exclusivity deal (SAR 850K guaranteed) or retain multi-platform independence for brand equity?",
        category: 'Business',
        mode: 'analyze',
        options: [
          { label: 'Accept Noon exclusivity', pros: ['SAR 850K guaranteed revenue floor', 'Noon marketing support and co-branding', 'Credibility as official Noon brand partner'], cons: ['No DTC website sales for 18 months', 'Creative constraints on design direction', 'Lose price control and customer data'] },
          { label: 'Decline, stay multi-platform', pros: ['Full creative and pricing control', 'Build own brand equity and customer list', 'Sell on own website + Namshi + Noon without restriction'], cons: ['Revenue uncertainty', 'Higher marketing costs', 'No guaranteed revenue floor'] }
        ],
        result: { summary: 'Exclusivity secures revenue floor but caps brand equity growth. Recommend counter-proposing 12-month term with carve-out for own website direct sales up to 10% of volume.', chosen: 'Counter-propose hybrid terms', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-08T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Open a physical boutique in Riyadh Al Nakheel Mall for Eid 2027, or focus exclusively on DTC e-commerce growth for 2026?',
        category: 'Business',
        mode: 'compare',
        options: [
          { label: 'Physical boutique — Al Nakheel Mall', pros: ['Brand visibility and premium positioning', 'Customer experience and try-before-buy', 'Iconic milestone for the brand story'], cons: ['SAR 180K fit-out + SAR 30K/month rent', 'Operational complexity and staff hiring', 'Inventory risk and stock management'] },
          { label: 'DTC e-commerce focus', pros: ['Low overhead, scalable across GCC', 'Data-driven growth and repeat purchasers', 'No geographic limitation'], cons: ['No physical brand presence in Riyadh', 'Returns logistics challenges', 'Platform algorithm dependency'] }
        ],
        result: { summary: 'Boutique is aspirational but premature at current margin levels. Scale DTC to SAR 8M annual GMV first, then retail expansion from position of strength.', chosen: 'DTC focus 2026, boutique evaluation Q4 2026', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-20T09:00:00Z'
      }
    ])
  }

  // 11. Investments
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Saudi Aramco (2222.SR)', type: 'stocks', invested_amount: 50000, current_value: 58400, currency: 'SAR', account: 'Al Rajhi Capital', notes: 'Core holding — quarterly dividend income. Long-term hold.', purchase_date: '2024-06-01' },
      { user_id: uid, name: 'Riyad Bank (1010.SR)', type: 'stocks', invested_amount: 25000, current_value: 27800, currency: 'SAR', account: 'Al Rajhi Capital', notes: 'Tadawul dividend stock — banking sector diversification.', purchase_date: '2024-09-15' },
      { user_id: uid, name: 'Saudi Real Estate REIT ETF', type: 'etf', invested_amount: 30000, current_value: 32500, currency: 'SAR', account: 'SNB Capital', notes: 'Property exposure without direct ownership. Quarterly distributions.', purchase_date: '2025-03-01' },
      { user_id: uid, name: 'Brand Revenue Reserve — Al Rajhi Savings Account', type: 'savings', invested_amount: 120000, current_value: 124800, currency: 'SAR', account: 'Al Rajhi Bank', notes: '4% savings return. Brand emergency fund + boutique deposit reserve.', purchase_date: '2025-08-01' },
    ])
  }

  // 12. Business clients and projects
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Noon.com Fashion Division', email: 'fashion.partners@noon.com', company: 'Noon.com', notes: 'Primary wholesale channel. Ramadan 2026 Eid collection sold out (1,847 orders). Exclusivity negotiation ongoing for Ramadan 2027.', currency: 'SAR' },
      { user_id: uid, name: 'Namshi ME Buying Team', email: 'brands@namshi.com', company: 'Namshi (Emaar Fashion)', notes: 'UAE-based fashion e-tailer. Q2 2026 consignment: 180 pieces modest occasion wear. Good reorder potential.', currency: 'SAR' },
      { user_id: uid, name: 'Garnier Halal KSA Partnerships', email: 'ksa.partnerships@garnier.com', company: "L'Oréal Halal", notes: 'Halal skincare brand ambassador. SAR 65,000 deal: 4 posts + 2 Stories per month. Strong brand alignment.', currency: 'SAR' },
      { user_id: uid, name: 'Hana Boutique Kuwait', email: 'orders@hanaboutique.kw', company: 'Hana Boutique', notes: 'Kuwaiti retail boutique. Carries 60 pieces per season. Good reorder history and fast payment terms.', currency: 'SAR' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'Ramadan 2027 Exclusive Collection — Noon.com', status: 'proposal', fee: 850000, currency: 'SAR', notes: 'Noon.com 18-month exclusivity proposal. Negotiating counter: 12-month term + own-website carve-out. 120 SKUs planned.', due_date: '2026-09-01' },
        { user_id: uid, client_id: clients[1].id, name: 'Q3 2026 Namshi Occasion Wear Drop', status: 'active', fee: 92000, currency: 'SAR', notes: '180 units: abaya, kaftan, jalabiya. Delivery September 2026. Namshi handling logistics from Riyadh warehouse.', due_date: '2026-08-15' },
        { user_id: uid, client_id: clients[2].id, name: 'Garnier Halal Skincare Campaign — H2 2026', status: 'active', fee: 130000, currency: 'SAR', notes: '6-month ambassador deal. Monthly: 4 feed posts + 2 Stories. Halal-certified products only. Strong audience alignment.', due_date: '2026-12-31' },
      ])
    }
  }

  // 13. Contacts / Network
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Noor Al-Rashid', email: 'noor@noorstudio.sa', phone: '+966501234567', group_name: 'Business', notes: 'Lead photographer. Works exclusively with Zainab brand. Fast, understands modest fashion aesthetic and lighting.' },
      { user_id: uid, name: 'Reem Abduljabbar', email: 'reem.a@fashionme.com', phone: '+971559876543', group_name: 'Business', notes: 'Dubai fashion industry connector. Introduced 3 UAE stockists. Key contact for GCC market expansion.' },
      { user_id: uid, name: 'Shahad Alotaibi', email: 'shahad@modestfashionsa.com', phone: '+966543334444', group_name: 'Mentors', notes: 'Pioneer of modest fashion in Saudi Arabia. Mentored Zainab from early days. Monthly strategy catch-up call.' },
      { user_id: uid, name: 'Mama (Fatima Al-Sa\'eedi)', email: '', phone: '+966501112222', group_name: 'Family', notes: 'First quality inspector and biggest supporter. Reviews every collection before launch. Her approval matters most.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Launch RTW modest fashion DTC e-commerce on own website', category: 'role',
        description: 'Build owned e-commerce channel. Target SAR 8M annual GMV by end 2026. Reduce platform dependency from 90% to 40%.',
        target_date: '2026-12-31', status: 'active', progress_pct: 35
      },
      {
        user_id: uid, title: 'Grow Instagram following to 2.5M', category: 'impact',
        description: 'Organic growth: 3 Reels/week, 1 collaboration per month, weekly Q&A Stories in Arabic and English.',
        target_date: '2026-12-31', status: 'active', progress_pct: 72
      },
      {
        user_id: uid, title: 'Secure GCC retail presence — UAE, Kuwait, Bahrain', category: 'role',
        description: 'Wholesale partnerships in at least 3 GCC countries beyond KSA. Target: Namshi UAE, Hana Kuwait, Al Osra Bahrain.',
        target_date: '2027-06-30', status: 'active', progress_pct: 30
      },
      {
        user_id: uid, title: 'Invest 20% of brand net profit into Tadawul monthly', category: 'income',
        description: 'Dividend-paying Saudi stocks as long-term wealth building. Target SAR 300K invested by end 2027.',
        target_date: '2027-12-31', status: 'active', progress_pct: 42
      },
    ])
  }

  // 15. Trips
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Dubai, UAE', country_code: 'AE',
        starts_on: '2026-04-25', ends_on: '2026-04-27',
        purpose: 'business', status: 'completed',
        budget_total: 6000, currency: 'SAR',
        notes: 'Fabric sourcing at Al Fahidi wholesale market. 12 suppliers visited. SAR 18K in sample orders placed. Flew in, full day sourcing, flew back.'
      },
      {
        user_id: uid, destination: 'Dubai, UAE — Arab Fashion Week', country_code: 'AE',
        starts_on: '2026-10-14', ends_on: '2026-10-18',
        purpose: 'business', status: 'planning',
        budget_total: 12000, currency: 'SAR',
        notes: 'Arab Fashion Week October 2026. Presenting modest fashion lookbook. Meeting Namshi buyers and GCC retail partners.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'flight', title: 'RUH → DXB — Flynas direct', starts_at: '2026-04-25T06:00:00Z', ends_at: '2026-04-25T08:00:00Z', cost: 680, currency: 'SAR', notes: 'Morning flight. Arrive before market opens at 9am.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Al Seef Heritage Hotel — 2 nights', starts_at: '2026-04-25T14:00:00Z', ends_at: '2026-04-27T12:00:00Z', cost: 1200, currency: 'SAR', notes: 'Close to Al Fahidi sourcing district. Authentic old Dubai atmosphere.' },
        { trip_id: trips[0].id, type: 'activity', title: 'Al Fahidi fabric wholesale market — full day sourcing', starts_at: '2026-04-26T08:00:00Z', ends_at: '2026-04-26T18:00:00Z', cost: 18000, currency: 'SAR', notes: 'Sample orders: silk, chiffon, jacquard, crepe. 12 suppliers. Custom print silk for RTW line — game changer.' },
      ])
    }
  }

  // 16. Meal plans (modest halal diet)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Dates + labneh + Arabic bread', calories: 420, notes: 'Sunnah breakfast — quick before Fajr morning routine' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Kabsa chicken with salad', calories: 650, notes: 'Traditional Saudi lunch — home-cooked' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Lentil soup + bread + fruit', calories: 480, notes: 'Light evening — working late on content schedule' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'breakfast', recipe_name: 'Ful medames + boiled eggs', calories: 390, notes: 'High protein — long shoot day' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Grilled hammour fish + rice', calories: 580, notes: 'Halal seafood — fuel for afternoon editing block' },
    ])
  }

  console.log("✅ Zainab Al-Sa'eedi (#31) seeded — SAR, Riyadh, modest fashion brand, 1.8M Instagram followers")
}

seedZainab().catch(e => { console.error(e); process.exit(1) })
