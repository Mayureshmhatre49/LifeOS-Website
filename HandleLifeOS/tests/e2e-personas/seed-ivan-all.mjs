/**
 * Seed: Ivan Kovalenko — IT Freelancer, Warsaw, Poland (PLN) — Ukrainian war-displaced
 * Email: ivan.kovalenko@e2e-test.handlelifeos.app
 * Persona #38 — Ukrainian refugee in Poland, remote dev, supporting family in Kyiv
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'ivan.kovalenko@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Ivan Kovalenko (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Ivan Kovalenko',
    display_name: 'Ivan',
    locale: 'uk-UA',
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
    country: 'PL',
    occupation: 'Senior Full-Stack Developer (Remote Freelancer)',
    dietary_preferences: [],
    has_child: false,
    has_business: false,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Ivan fled Kharkiv, Ukraine in March 2022 (Russian invasion). Now in Warsaw with Temporary Protection status (UKR refugee). Wife Olena and daughter Dasha (7) also in Warsaw', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Works remotely as Senior Full-Stack Developer for a German fintech company (Berlin). Pays him €5,800/month in EUR', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Also sends money to his parents still in Kharkiv via MoneyGram/Western Union — UAH volatile, uses USD transfers', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Speaks Ukrainian, Russian, Polish (improving), and English. Prefers English for work', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Obtain Polish Karta Pobytu (residence permit) — filed application January 2026, awaiting decision', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Rents a 3-room apartment in Mokotów district Warsaw — PLN 4,200/month (includes wife + daughter). Has refugee subsidy for first 6 months (ended)', importance: 8 },
      { user_id: uid, type: 'preference', content: 'EUR income converted to PLN via Wise (best rates). PKO BP for day-to-day banking in Poland', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Dreams of returning to Ukraine when safe. Maintains Ukrainian bank account (Monobank) for potential return', importance: 8 },
      { user_id: uid, type: 'goal', content: 'Learn Polish to B1 level by end 2026 — Dasha already speaks fluent Polish at school', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Software stack: React, Node.js, TypeScript, PostgreSQL, Docker. 9 years experience. Open to EU permanent positions', importance: 7 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 25800, expenses_budget: 13500, savings_budget: 6800, investment_budget: 5500 },
    { month: '2026-04-01', income: 25800, expenses_budget: 14200, savings_budget: 6200, investment_budget: 5400 },
    { month: '2026-05-01', income: 25800, expenses_budget: 13800, savings_budget: 6500, investment_budget: 5500 },
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
      { user_id: uid, category: 'Mieszkanie', description: 'Czynsz — Mokotów, Warszawa (3 pokoje)', amount: 4200, currency: 'PLN', date: '2026-05-01', payment_method: 'Przelew PKO' },
      { user_id: uid, category: 'Media', description: 'PGE energia + MPWiK woda + Orange internet', amount: 520, currency: 'PLN', date: '2026-05-03', payment_method: 'Przelew' },
      { user_id: uid, category: 'Jedzenie', description: 'Biedronka + Lidl (zakupy tygodniowe x 2)', amount: 1200, currency: 'PLN', date: '2026-05-06', payment_method: 'Karta' },
      { user_id: uid, category: 'Edukacja', description: "Dasha's school (SP nr 40 Warsaw) + extracurriculars", amount: 380, currency: 'PLN', date: '2026-05-02', payment_method: 'Karta' },
      { user_id: uid, category: 'Kurs', description: 'Kurs polskiego B1 (online szkoła językowa)', amount: 280, currency: 'PLN', date: '2026-05-04', payment_method: 'Blik' },
      { user_id: uid, category: 'Transport', description: 'Bilet miesięczny ZTM Warszawa (Olena + Ivan)', amount: 220, currency: 'PLN', date: '2026-05-01', payment_method: 'Karta' },
      { user_id: uid, category: 'Zdrowie', description: 'Medicover prywatna ochrona zdrowia (rodzina)', amount: 480, currency: 'PLN', date: '2026-05-01', payment_method: 'Przelew' },
      { user_id: uid, category: 'Przekaz do Ukrainy', description: 'Przelew dla rodziców w Charkowie (USD via MoneyGram)', amount: 900, currency: 'PLN', date: '2026-05-01', payment_method: 'MoneyGram' },
      { user_id: uid, category: 'Oszczędności', description: 'Lokata EUR na rachunek oszczędnościowy Wise', amount: 2500, currency: 'PLN', date: '2026-05-01', payment_method: 'Wise transfer' },
      { user_id: uid, category: 'Inwestycje', description: 'ETF MSCI World (EXSA DE) przez XTB Polska', amount: 2000, currency: 'PLN', date: '2026-05-02', payment_method: 'XTB transfer' },
      { user_id: uid, category: 'Rozrywka', description: 'Netflix + wyjście do kina z Oleną + Dasią', amount: 180, currency: 'PLN', date: '2026-05-08', payment_method: 'Karta' },
      { user_id: uid, category: 'Prawnik', description: 'Kancelaria Mazurek — doradztwo Karta Pobytu', amount: 400, currency: 'PLN', date: '2026-05-05', payment_method: 'Przelew' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Fundusz awaryjny (6 miesięcy)', target_amount: 80000, current_amount: 38000, currency: 'PLN', target_date: '2027-01-01', category: 'Emergency', notes: 'Oszczędności awaryjne — niepewna sytuacja wojenna wymaga większej rezerwy' },
      { user_id: uid, name: 'Powrót do Ukrainy (kiedy bezpiecznie)', target_amount: 50000, current_amount: 12000, currency: 'PLN', target_date: '2028-01-01', category: 'Relocation', notes: 'Fundusz na przeprowadzkę i restart w Kijowie/Lwowie gdy sytuacja na to pozwoli' },
      { user_id: uid, name: 'EUR oszczędności długoterminowe', target_amount: 50000, current_amount: 14500, currency: 'EUR', target_date: '2028-01-01', category: 'Investment', notes: 'Lokowane w Wise EUR account — stabilna waluta niezależna od PLN/UAH' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'JetBrains All Products Pack', amount: 185, currency: 'PLN', billing_cycle: 'monthly', category: 'Professional', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Wise business account', amount: 25, currency: 'PLN', billing_cycle: 'monthly', category: 'Finance', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Netflix (EN + UA content)', amount: 65, currency: 'PLN', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'GitHub Pro', amount: 20, currency: 'PLN', billing_cycle: 'monthly', category: 'Professional', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'iShares MSCI World ETF (XTB Polska)', type: 'ETF', current_value: 18000, purchase_price: 14000, currency: 'PLN', notes: 'PLN 2,000/month DCA — neutral global equity exposure' },
      { user_id: uid, name: 'Wise EUR multi-currency savings', type: 'Currency', current_value: 14500, purchase_price: 12000, currency: 'EUR', notes: 'EUR stable savings — hedge against PLN/UAH volatility' },
      { user_id: uid, name: 'Monobank Ukriane (UAH frozen)', type: 'Bank Account', current_value: 0, purchase_price: 5000, currency: 'PLN', notes: 'UAH account in Ukraine — access restricted due to war, value uncertain' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Sprawdź wiadomości z Ukrainy (morning)', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '📰' },
      { user_id: uid, name: 'Daily standup (9AM CET - German client)', frequency: 'weekdays', target_count: 1, color: '#10B981', icon: '💻' },
      { user_id: uid, name: 'Lekcja polskiego (30 min)', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '🇵🇱' },
      { user_id: uid, name: 'Spacer z Daszą po szkole', frequency: 'weekdays', target_count: 1, color: '#EC4899', icon: '👨‍👧' },
      { user_id: uid, name: 'Siłownia lub bieganie', frequency: 'weekly', target_count: 3, color: '#F59E0B', icon: '🏃' },
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
          if (Math.random() < 0.78) {
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
      { user_id: uid, mood: 'anxious', energy: 4, notes: 'News from Kharkiv bad today. Bombardment near parents\' street. Called them — they are okay but I am not', logged_at: '2026-05-04T22:00:00Z' },
      { user_id: uid, mood: 'content', energy: 7, notes: 'Dasha got highest grade in Polish class. Her teacher said she speaks better than many Polish kids. Amazing', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 'hopeful', energy: 6, notes: 'Lawyer says Karta Pobytu decision likely in 4-6 weeks. Finally some stability ahead', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 'homesick', energy: 4, notes: 'Vyshyvanka Day (Ukrainian embroidery holiday). We dressed Dasha in her vyshyvanka. Warsaw is good but it is not home.', logged_at: '2026-05-15T21:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: 'Two years in Warsaw', content: 'Two years since we left Kharkiv with two bags. Olena found teaching work here. Dasha doesn\'t remember Kharkiv anymore, or pretends not to. I remember everything. I am grateful for Poland, for the job, for safety. But I am not "from here." I hope the day comes when I can say we are going home. Not yet.', mood: 'reflective', logged_at: '2026-05-03T23:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Obtain Polish Karta Pobytu (2-year residence permit)', category: 'Legal/Immigration', target_date: '2026-07-01', status: 'in_progress', progress: 80, notes: 'Application submitted Jan 2026. Lawyer says decision 4-6 weeks from May.' },
      { user_id: uid, title: 'Polish language B1 certificate (LangLio exam)', category: 'Language', target_date: '2026-11-01', status: 'in_progress', progress: 45, notes: 'Currently A2 strong. Online class 3x/week. Speaking improving fastest' },
      { user_id: uid, title: 'Switch to EU permanent role (€7K+/month)', category: 'Career', target_date: '2027-01-01', status: 'not_started', progress: 10, notes: 'Current freelance client is good but unstable. Want employment contract for visa/mortgage purposes' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'deep_work', notes: 'Backend microservices refactor — German fintech API gateway performance', completed_at: '2026-05-05T10:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'language', notes: 'Polish lesson B1 — past tense perfective forms + banking vocabulary', completed_at: '2026-05-07T08:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'planning', notes: 'Financial planning: if Karta Pobytu granted — can apply for PKO mortgage for Mokotów flat?', completed_at: '2026-05-09T19:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Stay in Poland long-term vs move to Germany/Netherlands for permanent job?', options: ['Stay Poland: low cost, Dasha settled in school, Olena has job — stability', 'Germany: higher salary, stronger refugee/immigrant support, harder language', 'Netherlands: English work environment, high cost, unknown schools for Dasha'], chosen_option: 'Stay Poland: low cost, Dasha settled in school, Olena has job — stability', outcome_notes: 'Dasha\'s stability priority. Poland works. Can always move later if situation changes', decided_at: '2026-04-15T21:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Ivan Kovalenko seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
