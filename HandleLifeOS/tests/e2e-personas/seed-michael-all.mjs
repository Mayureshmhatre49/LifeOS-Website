/**
 * Seed: Michael Asante — Football Coach + Youth Academy Owner, Accra, Ghana (GHS)
 * Email: michael.asante@e2e-test.handlelifeos.app
 * Persona #40 — Founder of Asante Youth Football Academy, part-time national team analyst, Kumasi/Accra
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'michael.asante@e2e-test.handlelifeos.app';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const ok = (label, data, error) => { if (error) { console.error(`✗ ${label}`, error.message); } else { console.log(`✓ ${label}`, Array.isArray(data) ? `(${data.length})` : ''); } };
const fail = (label, error) => { console.error(`✗ ${label}`, error?.message ?? error); };
const cnt = async (table, uid) => { const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid); return count ?? 0; };

function dateOffset(days) {
  const d = new Date('2026-04-19T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

async function seed() {
  const { data: { users }, error: uErr } = await sb.auth.admin.listUsers();
  if (uErr) { fail('listUsers', uErr); return; }
  const user = users.find(u => u.email === EMAIL);
  if (!user) { fail('findUser', `No user with email ${EMAIL}`); return; }
  const uid = user.id;
  console.log(`\n🌱 Seeding Michael Asante (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Michael Asante',
    display_name: 'Coach Mike',
    locale: 'en-GH',
    currency: 'GHS',
    timezone: 'Africa/Accra',
    country: 'GH',
    occupation: 'Head Coach — Asante Youth Football Academy + Ghana FA Technical Analyst',
    dietary_preferences: ['halal'],
    has_child: true,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Michael founded Asante Youth Football Academy in 2019 in Accra. Currently 84 registered players (ages 8–17), 6 coaches on staff. Monthly academy revenue: GHS 22,000–28,000 from player fees + kit sales', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Contracted as part-time Technical Analyst for Ghana FA (Black Stars U-20). Monthly retainer: GHS 4,500. Travels to matches in Accra Sports Stadium and regional venues', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Formerly played professionally for Hearts of Oak (2009–2015) and brief stint at Asante Kotoko (2015–2017) as defensive midfielder. Retired at 30 due to ACL injury', importance: 8 },
      { user_id: uid, type: 'goal', content: 'Get 3 academy players scouted and signed to Elite One (Division 1) clubs by end of 2026. Current pipeline: Emmanuel Darko (16, striker), Joshua Boateng (17, CM), Abena Ansah (15, first female prodigy — Women\'s league pathway)', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Married to Abena Asante (primary school teacher). Two sons: Kwame (10, enrolled at the academy) and Kobi (6). Lives in Tema, Accra in a family compound they are building', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Muslim (halal food). Fasts Ramadan. Strong community ties — sponsors 12 underprivileged academy players with free enrolment paid from academy surplus each term', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Academy facility: rented training pitch at Accra Sports Stadium complex GHS 3,500/month. Owns training equipment (cones, bibs, balls, goals) worth ~GHS 35,000. Seeks own facility (5-acre land in Dodowa)', importance: 9 },
      { user_id: uid, type: 'goal', content: 'Secure corporate sponsorship from MTN Ghana or Guinness Ghana Breweries to fund pitch construction in Dodowa — target GHS 800,000 facility by 2028', importance: 10 },
      { user_id: uid, type: 'preference', content: 'Uses MTN MoMo for all transactions. Stanbic Bank current account for academy payroll. Ecobank savings for compound building fund', importance: 6 },
      { user_id: uid, type: 'fact', content: 'Has UEFA B coaching licence (completed 2021 online). Enrolled in UEFA A coaching programme — exam March 2027. This will be a differentiator for national team full-time appointment', importance: 8 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 30000, expenses_budget: 18000, savings_budget: 7000, investment_budget: 5000 },
    { month: '2026-04-01', income: 27500, expenses_budget: 17000, savings_budget: 6000, investment_budget: 4500 },
    { month: '2026-05-01', income: 32000, expenses_budget: 18500, savings_budget: 8000, investment_budget: 5500 },
  ];
  for (const bm of budgetMonths) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('month', bm.month);
    if (!count) {
      const { data, error } = await sb.from('budgets').insert({ user_id: uid, ...bm }).select();
      ok(`budget ${bm.month}`, data, error);
    }
  }

  if (await cnt('expenses', uid) === 0) {
    const expenses = [
      { user_id: uid, category: 'Academy Operations', description: 'Accra Sports Stadium pitch rental (May)', amount: 3500, currency: 'GHS', date: '2026-05-01', payment_method: 'Stanbic Bank Transfer' },
      { user_id: uid, category: 'Academy Operations', description: 'Staff wages — 6 coaches (pro-rated May)', amount: 8400, currency: 'GHS', date: '2026-05-01', payment_method: 'MTN MoMo' },
      { user_id: uid, category: 'Academy Operations', description: 'Umbro training kit reorder — 30 player set (XS–L)', amount: 2100, currency: 'GHS', date: '2026-05-03', payment_method: 'Stanbic Debit Card' },
      { user_id: uid, category: 'Transport', description: 'Minibus charter — away tournament Kumasi (2 days)', amount: 1800, currency: 'GHS', date: '2026-05-06', payment_method: 'MTN MoMo' },
      { user_id: uid, category: 'Food', description: 'Chop bar + rice water — training days Tema', amount: 850, currency: 'GHS', date: '2026-05-08', payment_method: 'Cash' },
      { user_id: uid, category: 'Housing', description: 'Tema compound building — bricklayers payment Block C', amount: 4500, currency: 'GHS', date: '2026-05-02', payment_method: 'Ecobank Transfer' },
      { user_id: uid, category: 'Education', description: 'UEFA A coaching programme module fee (online)', amount: 1200, currency: 'GHS', date: '2026-05-01', payment_method: 'Visa Debit' },
      { user_id: uid, category: 'Telecom', description: 'MTN Ghana postpaid — coaching WhatsApp groups data', amount: 250, currency: 'GHS', date: '2026-05-01', payment_method: 'MTN MoMo' },
      { user_id: uid, category: 'Insurance', description: 'Academy player group accident insurance (Ghana Insurance Commission registered)', amount: 600, currency: 'GHS', date: '2026-05-01', payment_method: 'Stanbic Bank Transfer' },
      { user_id: uid, category: 'Charity', description: 'Free enrolment sponsorship — 12 underprivileged players (May term subsidy)', amount: 1800, currency: 'GHS', date: '2026-05-01', payment_method: 'MTN MoMo' },
      { user_id: uid, category: 'Healthcare', description: 'NHIS renewal — Michael + Abena + Kwame + Kobi', amount: 320, currency: 'GHS', date: '2026-05-05', payment_method: 'MTN MoMo' },
      { user_id: uid, category: 'Entertainment', description: 'Ghana Premier League — Accra Hearts of Oak vs Kotoko tickets (family outing)', amount: 180, currency: 'GHS', date: '2026-05-10', payment_method: 'Cash' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Dodowa 5-acre football facility', target_amount: 800000, current_amount: 142000, currency: 'GHS', target_date: '2028-12-31', category: 'Business', notes: 'Land purchase ~GHS 380K. Construction GHS 420K. Seeking MTN/Guinness sponsorship to bridge gap' },
      { user_id: uid, name: 'Tema family compound completion', target_amount: 280000, current_amount: 95000, currency: 'GHS', target_date: '2027-06-30', category: 'Housing', notes: 'Block C and D remain. Ecobank savings dedicated account' },
      { user_id: uid, name: 'Emergency fund', target_amount: 60000, current_amount: 18500, currency: 'GHS', target_date: '2027-01-01', category: 'Emergency', notes: 'Covers 3 months academy operations + family living' },
      { user_id: uid, name: 'Boys\' education — Kwame + Kobi', target_amount: 120000, current_amount: 22000, currency: 'GHS', target_date: '2030-01-01', category: 'Education', notes: 'Target private secondary school (Ridge International) GHS 30K/year per child' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'Ghana Government Treasury Bills (182-day)', type: 'bonds', amount_invested: 25000, current_value: 26875, currency: 'GHS', institution: 'Bank of Ghana / Stanbic', notes: 'Rolling 182-day T-bill at 27.5% p.a. Safe inflation hedge' },
      { user_id: uid, name: 'Databank Ark Fund', type: 'mutual_fund', amount_invested: 15000, current_value: 17240, currency: 'GHS', institution: 'Databank Brokerage', notes: 'Balanced fund — equity + bonds. Monthly GHS 1,000 contribution' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'Wyscout (coach video analysis platform)', amount: 850, currency: 'GHS', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Ghana FA Technical Analyst licence renewal', amount: 200, currency: 'GHS', billing_cycle: 'yearly', category: 'Professional', next_billing_date: '2027-01-15' },
      { user_id: uid, name: 'Academy management software (SportyHQ)', amount: 350, currency: 'GHS', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Ghana Football Association (Black Stars U-20)', industry: 'Sports Governance', contact_email: 'technical@ghanafoot.com', monthly_value: 4500, currency: 'GHS', status: 'active', country: 'GH' },
      { user_id: uid, name: 'MTN Ghana (sponsorship negotiation)', industry: 'Telecom', contact_email: 'csr@mtn.com.gh', monthly_value: 0, currency: 'GHS', status: 'prospect', country: 'GH' },
      { user_id: uid, name: 'Umbro Ghana (kit supply partner)', industry: 'Sports Retail', contact_email: null, monthly_value: 1200, currency: 'GHS', status: 'active', country: 'GH', notes: 'Volume discount deal — Umbro supplies kits at 40% off RRP for 3-year partnership' },
      { user_id: uid, name: 'Accra Sports Stadium Authority', industry: 'Sports Infrastructure', contact_email: 'pitchhire@accrasports.gov.gh', monthly_value: 0, currency: 'GHS', status: 'active', country: 'GH', notes: 'Pitch rental client — Michael pays them, but key facility partner' },
    ];
    const { data, error } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', data, error);
  }

  if (await cnt('business_projects', uid) === 0) {
    const projects = [
      { user_id: uid, name: 'MTN Ghana Sponsorship Proposal', status: 'in_progress', client_name: 'MTN Ghana', budget: 800000, currency: 'GHS', start_date: '2026-04-01', end_date: '2026-09-30', description: 'Full proposal for GHS 800K facility naming rights + CSR sponsorship over 5 years. Deck, financials, social impact report' },
      { user_id: uid, name: 'UEFA A Coaching Exam Preparation', status: 'in_progress', client_name: null, budget: 0, currency: 'GHS', start_date: '2026-01-01', end_date: '2027-03-31', description: 'Self-study + online modules for UEFA A licence. Exam March 2027. Key differentiator for Ghana FA full-time role' },
      { user_id: uid, name: 'Academy 2026–27 Season Player Trials', status: 'planned', client_name: null, budget: 2500, currency: 'GHS', start_date: '2026-06-01', end_date: '2026-06-30', description: 'Open trials for U-10 through U-17. Target 20 new players. Advertising on Accra FM and social media' },
    ];
    const { data, error } = await sb.from('business_projects').insert(projects).select();
    ok('business_projects', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Morning Fajr prayer + 20min Quran reading', frequency: 'daily', target_count: 1, color: '#10B981', icon: '🕌' },
      { user_id: uid, name: 'Watch 1 match video analysis (Wyscout)', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '⚽' },
      { user_id: uid, name: 'Academy training session coaching', frequency: 'weekdays', target_count: 1, color: '#F59E0B', icon: '🏟️' },
      { user_id: uid, name: 'Academy admin — fees, attendance, parent comms', frequency: 'weekdays', target_count: 1, color: '#8B5CF6', icon: '📋' },
      { user_id: uid, name: '30-min cardio / cycling (knee rehab protocol)', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '🚴' },
      { user_id: uid, name: 'Review academy financials (MTN MoMo + Stanbic)', frequency: 'weekly', target_count: 1, color: '#EF4444', icon: '💰' },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);

    if (hd?.length) {
      const logs = [];
      for (let offset = 0; offset < 21; offset++) {
        const date = dateOffset(offset);
        const dow = DOW[new Date(date + 'T00:00:00Z').getUTCDay()];
        for (const h of hd) {
          const isWeekday = !['Sat', 'Sun'].includes(dow);
          if (h.frequency === 'weekdays' && !isWeekday) continue;
          if (h.frequency === 'monthly') continue;
          if (Math.random() < 0.86) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Secure MTN Ghana academy sponsorship (GHS 800K)', category: 'Fundraising', target_date: '2026-12-31', status: 'in_progress', progress: 25, notes: 'Proposal deck 60% done. Meeting with MTN CSR Director scheduled May 28. Need social impact data + player success stories' },
      { user_id: uid, title: 'Get 3 academy players signed to Division 1 clubs', category: 'Player Development', target_date: '2026-12-31', status: 'in_progress', progress: 40, notes: 'Emmanuel Darko trialling at Hearts of Oak U-18. Joshua Boateng contacted by Medeama SC. Abena Ansah — Women\'s Premier League pathway via Hasaacas Ladies FC' },
      { user_id: uid, title: 'UEFA A coaching licence', category: 'Professional Development', target_date: '2027-03-31', status: 'in_progress', progress: 55, notes: 'Modules 1–4 of 7 completed. Critical for Ghana FA full-time Head of Youth Development appointment' },
      { user_id: uid, title: 'Ghana FA — Head of Youth Development appointment', category: 'Career', target_date: '2028-01-01', status: 'not_started', progress: 10, notes: 'UEFA A licence + track record of scouts signing academy players are the two requirements. Long-term goal but conversations ongoing' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Emmanuel Darko', relationship: 'academy_player', email: null, phone: null, notes: '16-year-old striker — top prospect. Trialling Hearts of Oak U-18. Father is Emmanuel Darko Sr (MTN mobile money agent Tema)' },
      { user_id: uid, name: 'Dr. Kwesi Appiah', relationship: 'mentor', email: 'kwesi.appiah@ghanafoot.com', phone: null, notes: 'Former Ghana Black Stars head coach. Michael\'s mentor since Hearts of Oak days. Advises on national team pathway strategy' },
      { user_id: uid, name: 'Nana Ama Boateng', relationship: 'partner', email: 'nana.boateng@mtnghana.com', phone: null, notes: 'MTN Ghana CSR Director. Key decision-maker for academy sponsorship proposal. Meeting May 28' },
      { user_id: uid, name: 'Kofi Owusu', relationship: 'colleague', email: null, phone: null, notes: 'Asante Youth Academy assistant coach. Former Kumasi Asante FC midfielder. Handles U-12 and U-14 squads' },
      { user_id: uid, name: 'Abena Asante', relationship: 'family', email: null, phone: null, notes: 'Wife. Primary school teacher (Tema Municipal). Handles academy admin paperwork and parent communications when Michael travels' },
    ];
    const { data: cd, error: ce } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', cd, ce);

    if (cd?.length) {
      const interactions = [
        { user_id: uid, contact_id: cd[1].id, type: 'call', notes: 'Kwesi Appiah called to discuss Ghana U-20 tactical setup. Recommended Michael focus on high-press 4-3-3 against WAFU B opponents', occurred_at: '2026-05-03T18:00:00Z' },
        { user_id: uid, contact_id: cd[2].id, type: 'meeting', notes: 'Coffee with Nana Ama at MTN HQ Accra. Shared academy impact report — 84 players, 3 Division 1 prospects. She requested formal proposal deck by May 20', occurred_at: '2026-05-07T11:00:00Z' },
        { user_id: uid, contact_id: cd[0].id, type: 'note', notes: 'Emmanuel scored hat-trick in Accra Football Academy friendly. Hearts of Oak scout Samuel Brew was watching. Called Michael after — very positive', occurred_at: '2026-05-09T20:00:00Z' },
      ];
      const { data, error } = await sb.from('contact_interactions').insert(interactions).select();
      ok('contact_interactions', data, error);
    }
  }

  if (await cnt('trips', uid) === 0) {
    const { data: tripData, error: tripErr } = await sb.from('trips').insert({
      user_id: uid,
      name: 'WAFU B U-20 Championship — Abidjan',
      destination: 'Abidjan, Côte d\'Ivoire',
      start_date: '2026-07-10',
      end_date: '2026-07-24',
      status: 'planned',
      budget: 8500,
      currency: 'GHS',
      notes: 'Ghana FA covering flights + hotel for technical staff. Michael self-funding coaching equipment transport and pocket money',
    }).select();
    ok('trip', tripData, tripErr);

    if (tripData?.[0]) {
      const tripId = tripData[0].id;
      const items = [
        { trip_id: tripId, user_id: uid, type: 'flight', title: 'ACC → ABJ Air Côte d\'Ivoire', date: '2026-07-10', cost: 0, currency: 'GHS', notes: 'Ghana FA funded. Check in bag limit for coaching equipment' },
        { trip_id: tripId, user_id: uid, type: 'accommodation', title: 'Sofitel Abidjan Hôtel Ivoire (Ghana FA block booking)', date: '2026-07-10', cost: 0, currency: 'GHS', notes: '14 nights — Ghana FA technical staff rate' },
        { trip_id: tripId, user_id: uid, type: 'activity', title: 'Group Stage matches — Stadium Félix Houphouët-Boigny', date: '2026-07-12', cost: 0, currency: 'GHS', notes: 'Ghana vs Burkina Faso (GD), Senegal (GD), Sierra Leone (GD)' },
        { trip_id: tripId, user_id: uid, type: 'other', title: 'Equipment — extra video analysis laptop battery + charger', date: '2026-07-08', cost: 950, currency: 'GHS', notes: 'Wyscout offline match tagging setup' },
        { trip_id: tripId, user_id: uid, type: 'activity', title: 'Scouting — WAFU B opponent team analysis sessions', date: '2026-07-11', cost: 0, currency: 'GHS', notes: 'Daily opposition Wyscout prep for Ghana coaching staff' },
      ];
      const { data, error } = await sb.from('trip_items').insert(items).select();
      ok('trip_items', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'analysis', notes: 'Wyscout: Hearts of Oak U-18 vs Accra Lions — scouted Emmanuel Darko\'s movement off the ball, tracked 8 pressing actions, 4 key passes', completed_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'planning', notes: 'MTN sponsorship deck — built "social impact" slide with player metrics, community reach numbers, free scholarship data. 84 players / 12 sponsored', completed_at: '2026-05-07T20:30:00Z' },
      { user_id: uid, duration_minutes: 75, type: 'coaching', notes: 'UEFA A module 5: Periodisation in youth football. Notes on Arthur Andrade (Portugal) methodology for age-specific training loads', completed_at: '2026-05-09T22:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'proud', energy: 9, notes: 'Emmanuel Darko hat-trick today. Hearts of Oak scout was there. Three years of coaching that boy — this is what it\'s for. Abena made jollof to celebrate', logged_at: '2026-05-09T22:30:00Z' },
      { user_id: uid, mood: 'stressed', energy: 6, notes: 'MTN proposal deadline May 20 and academy quarterly accounts both due. Coach Kofi handling U-12 training so I can focus but pressure is real', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 'grateful', energy: 8, notes: 'Kwame played his first full 11-a-side in the U-10 today. Scored from a corner. Seeing your son develop at your own academy — that\'s God\'s blessing', logged_at: '2026-05-03T19:30:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, content: 'Sat down tonight to review where we are with the MTN proposal. We\'re asking for GHS 800,000. That\'s a big number. But the numbers back it up: 84 players, 12 free scholarships, 3 players heading to professional clubs, 6 coaches employed. The pitch at Dodowa will change everything — it gives the academy permanence. No more renting. I believe this is the right move. Bismillah.', mood: 'determined', tags: ['business', 'academy', 'sponsorship'], created_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, content: 'ACL injury in 2017 ended my playing career at 28. At the time I was devastated. Now I see it differently. If I\'d played until 35, I\'d never have built this academy. Those 84 kids wouldn\'t have had a proper coaching pathway. Everything has a reason. The injury was the door that opened this. I am grateful.', mood: 'reflective', tags: ['career', 'gratitude', 'faith'], created_at: '2026-05-04T21:30:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Accept Ghana FA full-time offer (GHS 12K/month) vs stay independent with academy?', options: ['Accept Ghana FA full-time: GHS 12,000/month salary, travel budget, pension. Lose academy autonomy', 'Stay independent: keep academy + part-time FA contract GHS 4,500/month. Lower income, full control', 'Hybrid: negotiate 60% time commitment to FA, keep 40% for academy. Needs GFA approval'], chosen_option: 'Hybrid: negotiate 60% time commitment to FA, keep 40% for academy. Needs GFA approval', outcome_notes: 'Spoke to Dr. Kwesi Appiah — he confirmed GFA is open to hybrid arrangement if UEFA A licence is achieved. Decision deferred until March 2027 (post-exam)', decided_at: '2026-05-01T19:00:00Z' },
      { user_id: uid, title: 'Expand academy to Kumasi or consolidate Accra operations first?', options: ['Open Kumasi branch: wider reach, higher revenue ceiling, requires second head coach hire', 'Consolidate Accra: finish Dodowa facility, strengthen Accra brand, then expand', 'Franchise model: license Asante Youth Academy brand to Kumasi operator — low risk, low control'], chosen_option: 'Consolidate Accra: finish Dodowa facility, strengthen Accra brand, then expand', outcome_notes: 'Expanding too early is how academies fail. Dodowa facility first. Kumasi in 2028 after MTN sponsorship secured and facility operational', decided_at: '2026-04-25T20:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  if (await cnt('gratitude_entries', uid) === 0) {
    const entries = [
      { user_id: uid, content: 'Emmanuel Darko and his father trust me with his development. That trust is not small.', created_at: '2026-05-09T23:00:00Z' },
      { user_id: uid, content: 'My wife Abena handles academy admin on top of her teaching. She never complains. She believes in this.', created_at: '2026-05-07T22:30:00Z' },
      { user_id: uid, content: 'Kwame scored today. My son, at my academy, on a pitch I built. Alhamdulillah.', created_at: '2026-05-03T20:00:00Z' },
      { user_id: uid, content: 'Dr. Kwesi Appiah still picks up when I call. His mentorship is invaluable.', created_at: '2026-04-30T21:00:00Z' },
    ];
    const { data, error } = await sb.from('gratitude_entries').insert(entries).select();
    ok('gratitude_entries', data, error);
  }

  console.log('\n✅ Michael Asante seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
