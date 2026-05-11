/**
 * Seed: Aisha Kamau — FinTech Founder (M-Bora Savings), Nairobi, Kenya (KES)
 * Email: aisha.kamau@e2e-test.handlelifeos.app
 * Persona #33 — Mobile savings app for informal workers, Safaricom ecosystem, M-Pesa
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'aisha.kamau@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Aisha Kamau (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Aisha Kamau',
    display_name: 'Aisha',
    locale: 'en-KE',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    country: 'KE',
    occupation: 'FinTech Founder & CEO — M-Bora Savings',
    dietary_preferences: ['halal'],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Aisha co-founded M-Bora Savings — a mobile savings platform for informal workers (jua kali, matatu operators, market vendors) integrated with M-Pesa', importance: 10 },
      { user_id: uid, type: 'fact', content: 'M-Bora has 28,000 active users, KES 180M in user savings under management. Processing KES 45M monthly transactions', importance: 10 },
      { user_id: uid, type: 'fact', content: 'University of Nairobi CS graduate. Previously at Safaricom M-Pesa team for 4 years before founding M-Bora', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Halal — avoids pork and alcohol. Eats at Al-Yusra restaurant and Mama Oliech for Swahili food', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Raise Series A: KES 500M ($3.8M USD) from Novastar Ventures, Partech Africa, or USAID DCA by Q4 2026', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Lives in Kilimani, Nairobi. Rents 2BR apartment KES 85,000/month. Pays for own expenses + supports mother in Mombasa', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Uses Equity Bank for business, KCB for personal. M-Pesa for everything daily. Invests via Nabo Capital', importance: 7 },
      { user_id: uid, type: 'fact', content: 'M-Bora licensed by CBK under the National Payment System Act. Fintech regulatory sandbox graduate', importance: 9 },
      { user_id: uid, type: 'goal', content: 'Expand M-Bora to Tanzania and Uganda by mid-2027 — East African single market strategy', importance: 9 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 320000, expenses_budget: 165000, savings_budget: 85000, investment_budget: 70000 },
    { month: '2026-04-01', income: 340000, expenses_budget: 170000, savings_budget: 90000, investment_budget: 80000 },
    { month: '2026-05-01', income: 355000, expenses_budget: 168000, savings_budget: 95000, investment_budget: 92000 },
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
      { user_id: uid, category: 'Housing', description: 'Kilimani apartment rent', amount: 85000, currency: 'KES', date: '2026-05-01', payment_method: 'Bank Transfer' },
      { user_id: uid, category: 'Utilities', description: 'Kenya Power prepaid token + water', amount: 6500, currency: 'KES', date: '2026-05-03', payment_method: 'M-Pesa' },
      { user_id: uid, category: 'Food', description: 'Carrefour Westgate + local market (weekly)', amount: 18000, currency: 'KES', date: '2026-05-06', payment_method: 'Credit Card' },
      { user_id: uid, category: 'Business', description: 'AWS Kenya (cloud infra M-Bora backend)', amount: 45000, currency: 'KES', date: '2026-05-01', payment_method: 'Corporate Card' },
      { user_id: uid, category: 'Business', description: 'Safaricom API fees (M-Pesa integration monthly)', amount: 28000, currency: 'KES', date: '2026-05-05', payment_method: 'Bank Transfer' },
      { user_id: uid, category: 'Family', description: 'Mother support — Mombasa (monthly M-Pesa)', amount: 20000, currency: 'KES', date: '2026-05-01', payment_method: 'M-Pesa' },
      { user_id: uid, category: 'Transport', description: 'Bolt/Little cab (Nairobi meetings)', amount: 8500, currency: 'KES', date: '2026-05-07', payment_method: 'Bolt App' },
      { user_id: uid, category: 'Health', description: 'CIC Health Insurance premium', amount: 7200, currency: 'KES', date: '2026-05-01', payment_method: 'Bank Debit' },
      { user_id: uid, category: 'Staff', description: 'M-Bora team salaries (founder contribution — personal portion)', amount: 0, currency: 'KES', date: '2026-05-01', payment_method: 'Payroll', notes: 'Paid from business account — tracked for cash flow' },
      { user_id: uid, category: 'Investment', description: 'Nabo Africa Fund monthly top-up', amount: 50000, currency: 'KES', date: '2026-05-01', payment_method: 'Bank Transfer' },
      { user_id: uid, category: 'Telecom', description: 'Safaricom Postpaid (unlimited + data)', amount: 3500, currency: 'KES', date: '2026-05-02', payment_method: 'M-Pesa AutoPay' },
      { user_id: uid, category: 'Professional', description: 'Legal fees — Series A term sheet review (Mboya Wangong\'u & Waiyaki Advocates)', amount: 45000, currency: 'KES', date: '2026-05-09', payment_method: 'Bank Transfer' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Emergency Fund (personal)', target_amount: 1500000, current_amount: 820000, currency: 'KES', target_date: '2026-09-01', category: 'Emergency', notes: '6 months personal expenses. KCB savings account' },
      { user_id: uid, name: 'Tanzania + Uganda Expansion Fund', target_amount: 5000000, current_amount: 1200000, currency: 'KES', target_date: '2027-06-01', category: 'Business', notes: 'Regulatory costs, local hires, marketing in Dar es Salaam + Kampala' },
      { user_id: uid, name: 'Nairobi Property (Lavington 2BR)', target_amount: 12000000, current_amount: 2800000, currency: 'KES', target_date: '2030-01-01', category: 'Real Estate', notes: 'Stop renting — equity stake in Nairobi property market' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'AWS Kenya (business)', amount: 45000, currency: 'KES', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Notion (team)', amount: 2800, currency: 'KES', billing_cycle: 'monthly', category: 'Productivity', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Slack Pro', amount: 3500, currency: 'KES', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Spotify Premium', amount: 550, currency: 'KES', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'M-Bora Savings (Founder Equity)', type: 'Private Equity', current_value: 45000000, purchase_price: 5000000, currency: 'KES', notes: '42% founder stake — pre-money valuation KES 107M at seed round' },
      { user_id: uid, name: 'Nabo Africa Fund (growth fund)', type: 'Mutual Fund', current_value: 680000, purchase_price: 500000, currency: 'KES', notes: 'Monthly contribution KES 50,000 — 5yr target for property down payment' },
      { user_id: uid, name: 'NSE Kenya — Safaricom + KCB shares', type: 'Stocks', current_value: 285000, purchase_price: 220000, currency: 'KES', notes: 'Nairobi Securities Exchange blue chips — personal loyalty to Safaricom ecosystem' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Fajr prayer', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '🕌' },
      { user_id: uid, name: 'Review M-Bora daily active users dashboard', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '📊' },
      { user_id: uid, name: 'Investor outreach (1 message/email)', frequency: 'weekdays', target_count: 1, color: '#10B981', icon: '📧' },
      { user_id: uid, name: 'Evening run (Karura Forest)', frequency: 'weekly', target_count: 3, color: '#F59E0B', icon: '🏃' },
      { user_id: uid, name: 'Team standup (10AM EAT)', frequency: 'weekdays', target_count: 1, color: '#EC4899', icon: '💼' },
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

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Close M-Bora Series A (KES 500M)', category: 'Fundraising', target_date: '2026-12-31', status: 'in_progress', progress: 45, notes: 'Novastar Ventures in advanced due diligence. Partech Africa term sheet expected Q3' },
      { user_id: uid, title: 'Expand to Tanzania (CBT license)', category: 'Market Expansion', target_date: '2027-03-01', status: 'in_progress', progress: 20, notes: 'CBT = Central Bank of Tanzania. Legal counsel in Dar es Salaam engaged' },
      { user_id: uid, title: 'Reach 100K M-Bora active users', category: 'Growth', target_date: '2026-12-31', status: 'in_progress', progress: 28, notes: 'Currently 28,000 — need 72,000 more. Agent network expansion in Kisumu and Mombasa' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'James Mwangi (advisor)', relationship: 'Mentor', email: null, company: 'Equity Bank', notes: 'Former Equity Bank CEO — impact investing advisor, intro to Novastar', birthday: null },
      { user_id: uid, name: 'Sylvia Owino', relationship: 'Co-founder', email: 'sylvia@mbora.co.ke', company: 'M-Bora Savings', notes: 'CTO co-founder — ex-Safaricom software engineer. Handles all tech architecture', birthday: '1990-05-18' },
      { user_id: uid, name: 'Grace Wanjiku', relationship: 'Investor', email: 'grace@novastar.vc', company: 'Novastar Ventures', notes: 'Lead investor due diligence. Meeting in Nairobi June 2026', birthday: null },
    ];
    const { data, error } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'deep_work', notes: 'Series A financial model — KES unit economics, LTV/CAC ratios, 3-year East Africa projections', completed_at: '2026-05-05T09:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'product', notes: 'M-Bora Tanzania feature spec — M-Pesa cross-border to M-Pesa Tanzania corridor', completed_at: '2026-05-07T10:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'research', notes: 'CBT payment service provider regulations — Kenya-Tanzania regulatory comparison', completed_at: '2026-05-09T11:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Series A: Novastar now vs wait for Partech Africa (better terms possible)?', options: ['Close Novastar deal now at KES 500M (3.1% dilution per KES 100M) — certainty', 'Wait 3 months for Partech: potentially higher valuation, less dilution', 'Split: KES 300M from Novastar now + KES 200M from Partech Q4 2026'], chosen_option: 'Close Novastar deal now at KES 500M (3.1% dilution per KES 100M) — certainty', outcome_notes: 'Market timing risk: wait = lose runway advantage. Novastar has East Africa network value beyond money', decided_at: '2026-05-08T14:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Aisha Kamau seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
