/**
 * Seed: Nadia Kovács — Psychotherapist (Private Practice), Budapest, Hungary (HUF)
 * Email: nadia.kovacs@e2e-test.handlelifeos.app
 * Persona #35 — CBT/ACT therapist, private clinic, mental health advocacy, HUF inflation
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'nadia.kovacs@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Nadia Kovács (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Nadia Kovács',
    display_name: 'Nadia',
    locale: 'hu-HU',
    currency: 'HUF',
    timezone: 'Europe/Budapest',
    country: 'HU',
    occupation: 'Pszichoterapeuta (CBT/ACT) — Kovács Terápia Magánrendelő, Budapest',
    dietary_preferences: [],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Nadia runs Kovács Terápia private practice in Budapest XI. district (Buda side). 22 active clients/week at 12,000 HUF/session', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Monthly income: HUF 800,000-1,050,000. CBT (cognitive behavioural) + ACT (acceptance and commitment) therapy specialization', importance: 9 },
      { user_id: uid, type: 'fact', content: 'PhD in Clinical Psychology from ELTE Budapest. Supervised 6 years before independent practice', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Travels to Vienna quarterly for CPD supervision (EU clinical requirement). Takes the RailJet train', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Launch online CBT program for anxiety — digital extension of practice, scalable income beyond 1:1 sessions', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Lives in a 65m² apartment in Budaörs (suburb, 15min to practice). Owns it — bought 2019 with her parents\' help', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Banks with OTP Bank. Invests in OTP Alap mutual funds and small EUR savings (inflation hedge)', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Partner: Balázs (architect). No children planned. Very deliberate lifestyle — quality over quantity', importance: 6 },
      { user_id: uid, type: 'goal', content: 'Publish book on ACT for Hungarian general public — Libri publisher expressed interest', importance: 8 },
      { user_id: uid, type: 'fact', content: 'HUF inflation (peaked 25.7% in 2023) significantly eroded savings — now holds 20% of portfolio in EUR/USD assets', importance: 8 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 880000, expenses_budget: 420000, savings_budget: 220000, investment_budget: 240000 },
    { month: '2026-04-01', income: 960000, expenses_budget: 430000, savings_budget: 250000, investment_budget: 280000 },
    { month: '2026-05-01', income: 900000, expenses_budget: 425000, savings_budget: 235000, investment_budget: 240000 },
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
      { user_id: uid, category: 'Lakhatás', description: 'Közüzemi díjak (gáz, villany, víz) — Budaörs', amount: 58000, currency: 'HUF', date: '2026-05-03', payment_method: 'Csoportos beszedés' },
      { user_id: uid, category: 'Rendelő', description: 'Irodabérlet (XI. kerület) — terápiás rendelő', amount: 95000, currency: 'HUF', date: '2026-05-01', payment_method: 'Átutalás' },
      { user_id: uid, category: 'Szakmai', description: 'Szuperviziós díj (havonta) — szupervizor Dr. Molnár', amount: 32000, currency: 'HUF', date: '2026-05-06', payment_method: 'Készpénz' },
      { user_id: uid, category: 'Szakmai', description: 'Szakmai felelősségbiztosítás (havi)', amount: 12000, currency: 'HUF', date: '2026-05-01', payment_method: 'Csoportos beszedés' },
      { user_id: uid, category: 'Élelmiszer', description: 'Lidl + Auchan heti bevásárlás (2x)', amount: 52000, currency: 'HUF', date: '2026-05-06', payment_method: 'Bankkártya' },
      { user_id: uid, category: 'Közlekedés', description: 'BKK bérlet (Budapest havi) + Budaörs autóbusz', amount: 18000, currency: 'HUF', date: '2026-05-01', payment_method: 'Csoportos' },
      { user_id: uid, category: 'Egészség', description: 'Saját terápia (minden terapeuta terápiában jár!)', amount: 12000, currency: 'HUF', date: '2026-05-07', payment_method: 'Készpénz' },
      { user_id: uid, category: 'Adó', description: 'SZJA előleg (havi negyede)', amount: 145000, currency: 'HUF', date: '2026-05-10', payment_method: 'NAV átutalás' },
      { user_id: uid, category: 'Megtakarítás', description: 'OTP Alap befektetési alap befizetés', amount: 150000, currency: 'HUF', date: '2026-05-01', payment_method: 'Átutalás' },
      { user_id: uid, category: 'EUR devizatartalék', description: 'EUR vásárlás (inflációs hedge)', amount: 85000, currency: 'HUF', date: '2026-05-02', payment_method: 'OTP Deviza' },
      { user_id: uid, category: 'Kikapcsolódás', description: 'Étterem Balázszal + mozi (havi)', amount: 28000, currency: 'HUF', date: '2026-05-08', payment_method: 'Bankkártya' },
      { user_id: uid, category: 'Szakmai fejlődés', description: 'ACT könyvek (angolul) + online CPD kurzus', amount: 22000, currency: 'HUF', date: '2026-05-05', payment_method: 'Kártya' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Vészhelyzeti tartalék (6 hónap)', target_amount: 3500000, current_amount: 2800000, currency: 'HUF', target_date: '2026-09-01', category: 'Emergency', notes: 'OTP lekötött betét + készpénz. Viszonylag közel a célhoz' },
      { user_id: uid, name: 'EUR megtakarítás (inflációs hedge)', target_amount: 15000, current_amount: 5800, currency: 'EUR', target_date: '2028-01-01', category: 'Investment', notes: 'OTP devizaszámla — havonta EUR 200-300 vásárlás' },
      { user_id: uid, name: 'Online CBT program fejlesztés', target_amount: 1200000, current_amount: 380000, currency: 'HUF', target_date: '2027-01-01', category: 'Business', notes: 'Videóproducer, platform fejlesztő, marketing — digitális termék' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'SimplePay Online Therapy Platform', amount: 8500, currency: 'HUF', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Therapynotes EMR software', amount: 9200, currency: 'HUF', billing_cycle: 'monthly', category: 'Professional', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Spotify Premium', amount: 2090, currency: 'HUF', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Kindle Unlimited (szakirodalom)', amount: 2500, currency: 'HUF', billing_cycle: 'monthly', category: 'Professional', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'OTP Prémium Alap (Hungarian balanced fund)', type: 'Mutual Fund', current_value: 1850000, purchase_price: 1400000, currency: 'HUF', notes: 'Havi 150,000 HUF befizetés. 5 éves horizont' },
      { user_id: uid, name: 'Magyar Állampapír (MÁP+)', type: 'Government Bond', current_value: 2200000, purchase_price: 2000000, currency: 'HUF', notes: 'Inflációkövető állampapír — 4.5% feletti reálhozam' },
      { user_id: uid, name: 'EUR megtakarítás (OTP deviza)', type: 'Currency', current_value: 5800, purchase_price: 5200, currency: 'EUR', notes: 'Devizatartalék — HUF/EUR árfolyamkockázat csökkentése' },
      { user_id: uid, name: 'Budaörsi lakás (saját)', type: 'Real Estate', current_value: 42000000, purchase_price: 28000000, currency: 'HUF', notes: 'Jelzálogmentes — szülők segítségével vette 2019-ben' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Reggeli meditáció (10 perc)', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '🧘' },
      { user_id: uid, name: 'Kliens jegyzetek + terápiás terv frissítés', frequency: 'weekdays', target_count: 1, color: '#3B82F6', icon: '📝' },
      { user_id: uid, name: 'Séta a Budaörsi parkban', frequency: 'daily', target_count: 1, color: '#10B981', icon: '🌳' },
      { user_id: uid, name: 'Szakmai olvasás (30 perc)', frequency: 'weekdays', target_count: 1, color: '#F59E0B', icon: '📚' },
      { user_id: uid, name: 'Önszupervi­zió napló', frequency: 'weekly', target_count: 1, color: '#EC4899', icon: '✍️' },
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
          if (Math.random() < 0.86) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'fulfilled', energy: 8, notes: 'Páciensem ma arról mesélt, hogy 8 hónapos terápia után visszament dolgozni. Ezt csinálom én.', logged_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, mood: 'tired', energy: 4, notes: 'Nehéz hét — 3 krízisintervenció egymás után. Szupervizióra van szükségem hamarabb mint terveztem', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 'creative', energy: 7, notes: 'Az online CBT program vázlata elkészült! Balázs segített a struktúrával. Izgatott vagyok', logged_at: '2026-05-09T19:00:00Z' },
      { user_id: uid, mood: 'content', energy: 8, notes: 'Vasárnap kirándulás Pilisben Balázszal. A természetben feltöltődök. Hétfőre készen vagyok', logged_at: '2026-05-10T20:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: 'Miért vagyok terapeuta — emlékeztető', content: 'Nehéz hét után mindig visszatérek ehhez. Nem azért csináljuk ezt, mert könnyű. Hanem mert amikor egy páciens azt mondja, hogy "képes voltam ma reggel felkelni" — ez a remény munkája. Az ACT azt tanítja: az értékvezérelt élet nem kényelmes, de értelmes. Legyen az enyém is.', mood: 'reflective', logged_at: '2026-05-07T22:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Online CBT szorongás program (digitális)', category: 'Business Development', target_date: '2027-01-01', status: 'in_progress', progress: 30, notes: 'Vázlat kész. Következő: videóproducer keresése + platform döntés (Teachable vs saját)' },
      { user_id: uid, title: 'Könyv: "Az ACT útmutatója — Mindennapi Élethez" (Libri)', category: 'Publication', target_date: '2027-06-01', status: 'not_started', progress: 5, notes: 'Libri Kiadó érdeklődött. Szinopszis még nem készült. 2026 végéig elindítani' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 90, type: 'program_design', notes: 'Online CBT modul 1 tervezés — szorongás psychoeducation videószkript', completed_at: '2026-05-05T10:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'study', notes: 'ACT és krónikus fájdalom — új meta-analízis olvasása (Journal of Contextual Behavioral Science)', completed_at: '2026-05-07T20:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'finance', notes: 'EUR vs HUF allokáció felülvizsgálata — infláció 2026 előrejelzések', completed_at: '2026-05-09T19:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Online CBT program: Teachable platform vs saját webfejlesztés?', options: ['Teachable: gyors indulás, 5% jutalék, korlátozott testreszabás', 'Saját fejlesztés (Balázs segít): rugalmas, 6 hónap + fejlesztési költség', 'Thinkific (Teachable alternatíva): alacsonyabb jutalék, jobb analitika'], chosen_option: 'Thinkific (Teachable alternatíva): alacsonyabb jutalék, jobb analitika', outcome_notes: 'Kompromisszum: gyors indulás (Thinkific) + saját fejlesztésre váltás 2 év után ha sikeres', decided_at: '2026-05-09T18:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Nadia Kovács seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
