/**
 * Seed: Rahul Desai — Final Year Engineering Student + Startup Founder, Pune, India (INR)
 * Email: rahul.desai@e2e-test.handlelifeos.app
 * Persona #36 — VIT Pune, edtech startup side project, scholarship holder, ambitious
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'rahul.desai@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Rahul Desai (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Rahul Desai',
    display_name: 'Rahul',
    locale: 'en-IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    country: 'IN',
    occupation: 'B.E. Computer Engineering Student — VIT Pune + Founder at StudyBridge',
    dietary_preferences: ['vegetarian'],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Rahul is a final year B.E. student at VIT Pune, Computer Engineering. CGPA: 9.1/10. Merit scholarship holder', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Founded StudyBridge — peer-to-peer study group platform for engineering students. 4,200 active users across Pune colleges', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Scholarship income: ₹15,000/month (VIT Merit scholarship). StudyBridge revenue: ₹18,000-35,000/month (premium subscriptions)', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Vegetarian from Gujarati family. Eats in college mess + Vaishali/Roopali restaurants on weekends', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Lives in college hostel (Pune). Room + mess: ₹12,000/semester. Very low personal expenses', importance: 8 },
      { user_id: uid, type: 'goal', content: 'Get StudyBridge to ₹1 Lakh/month MRR before graduation (June 2026) — then raise pre-seed funding', importance: 10 },
      { user_id: uid, type: 'fact', content: 'From Ahmedabad, Gujarat. Parents are both teachers — modest income. Rahul is the first startup founder in family', importance: 7 },
      { user_id: uid, type: 'preference', content: 'Uses UPI + Paytm for everything. No credit card (not eligible yet). Zerodha account for small stock investments', importance: 6 },
      { user_id: uid, type: 'goal', content: 'Apply to Y Combinator S27 batch — working on application (vision, traction, team slides)', importance: 9 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 42000, expenses_budget: 16000, savings_budget: 14000, investment_budget: 12000 },
    { month: '2026-04-01', income: 38000, expenses_budget: 15000, savings_budget: 13000, investment_budget: 10000 },
    { month: '2026-05-01', income: 45000, expenses_budget: 16000, savings_budget: 16000, investment_budget: 13000 },
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
      { user_id: uid, category: 'Hostel + Mess', description: 'VIT Pune hostel fees (semester pro-rated)', amount: 4000, currency: 'INR', date: '2026-05-01', payment_method: 'UPI' },
      { user_id: uid, category: 'Food', description: 'Outside mess + Vaishali/Goodluck chai shop', amount: 2200, currency: 'INR', date: '2026-05-06', payment_method: 'UPI' },
      { user_id: uid, category: 'Business', description: 'AWS Free Tier overage + StudyBridge server costs', amount: 3500, currency: 'INR', date: '2026-05-01', payment_method: 'Paytm' },
      { user_id: uid, category: 'Business', description: 'Razorpay payment gateway monthly fees', amount: 800, currency: 'INR', date: '2026-05-05', payment_method: 'Bank Transfer' },
      { user_id: uid, category: 'Transport', description: 'Ola/Rapido bike taxi (Pune meetings)', amount: 900, currency: 'INR', date: '2026-05-07', payment_method: 'UPI' },
      { user_id: uid, category: 'Telecom', description: 'Jio Postpaid (data for heavy work use)', amount: 399, currency: 'INR', date: '2026-05-01', payment_method: 'UPI' },
      { user_id: uid, category: 'Parents', description: 'Transfer to family Ahmedabad', amount: 3000, currency: 'INR', date: '2026-05-01', payment_method: 'UPI' },
      { user_id: uid, category: 'Investment', description: 'Zerodha — NIFTY 50 ETF monthly SIP', amount: 5000, currency: 'INR', date: '2026-05-01', payment_method: 'Zerodha' },
      { user_id: uid, category: 'Education', description: 'Startup India Learning Program (DPIIT)', amount: 0, currency: 'INR', date: '2026-05-01', payment_method: 'Free', notes: 'Government free program — attended online' },
      { user_id: uid, category: 'Entertainment', description: 'BookMyShow + movies + weekend outings', amount: 800, currency: 'INR', date: '2026-05-09', payment_method: 'UPI' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'StudyBridge pre-seed runway fund', target_amount: 600000, current_amount: 185000, currency: 'INR', target_date: '2026-12-31', category: 'Business', notes: '6-month runway without external funding — allows negotiating better terms with VCs' },
      { user_id: uid, name: 'Emergency personal fund', target_amount: 100000, current_amount: 38000, currency: 'INR', target_date: '2027-01-01', category: 'Emergency', notes: 'SBI savings + Zerodha liquid fund' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'AWS (StudyBridge infrastructure)', amount: 3500, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Notion Team', amount: 800, currency: 'INR', billing_cycle: 'monthly', category: 'Productivity', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'GitHub Pro', amount: 500, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'VIT Pune Student Council (partner)', industry: 'Education', contact_email: 'council@vitpune.edu.in', monthly_value: 8000, currency: 'INR', status: 'active', country: 'IN' },
      { user_id: uid, name: 'Cummins College of Engineering (pilot)', industry: 'Education', contact_email: null, monthly_value: 5000, currency: 'INR', status: 'active', country: 'IN' },
    ];
    const { data, error } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Check StudyBridge signups + MAU', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '📊' },
      { user_id: uid, name: 'Code 2+ hours (StudyBridge features)', frequency: 'daily', target_count: 1, color: '#10B981', icon: '💻' },
      { user_id: uid, name: 'LeetCode/competitive programming', frequency: 'weekdays', target_count: 1, color: '#F59E0B', icon: '🎯' },
      { user_id: uid, name: 'Read startup/business book (30 min)', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '📚' },
      { user_id: uid, name: 'Evening cricket with hostel friends', frequency: 'weekly', target_count: 3, color: '#EC4899', icon: '🏏' },
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
          if (Math.random() < 0.83) {
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
      { user_id: uid, title: 'StudyBridge: ₹1L MRR before graduation', category: 'Business Growth', target_date: '2026-06-30', status: 'in_progress', progress: 42, notes: 'Currently ₹42K MRR — need ₹58K more. Expanding to Symbiosis + COEP Pune' },
      { user_id: uid, title: 'Y Combinator S27 application', category: 'Fundraising', target_date: '2026-09-15', status: 'not_started', progress: 15, notes: 'Application opens August 2026. Need 3 months of strong metrics' },
      { user_id: uid, title: 'Secure DPIIT Startup India recognition', category: 'Regulatory', target_date: '2026-07-01', status: 'in_progress', progress: 60, notes: 'Documents submitted — DPIIT recognition enables tax benefits and investor eligibility' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'excited', energy: 9, notes: 'StudyBridge broke ₹40K MRR! First time. Roommate Vikram and I celebrated with biryani from Chicken Station', logged_at: '2026-05-04T22:00:00Z' },
      { user_id: uid, mood: 'stressed', energy: 5, notes: 'Final sem exams + feature release + YC prep simultaneously. Sleep is suffering. But exams first', logged_at: '2026-05-08T23:00:00Z' },
      { user_id: uid, mood: 'motivated', energy: 8, notes: 'Found a YC S24 founder on LinkedIn who replied to my cold message. Coffee call next week. Never give up', logged_at: '2026-05-10T21:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'coding', notes: 'StudyBridge: AI-powered study group matching algorithm v2 — cosine similarity on syllabus vectors', completed_at: '2026-05-05T23:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'yc_prep', notes: 'YC application questions draft — "What is your startup?" (120 words), traction section', completed_at: '2026-05-07T22:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'study', notes: 'Final sem exam prep — Computer Networks, TCP/IP protocols', completed_at: '2026-05-09T20:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'After graduation: job offer (₹18 LPA Infosys) vs full-time StudyBridge?', options: ['Accept Infosys: ₹18 LPA guaranteed, stable, lose startup momentum', 'Full-time StudyBridge: high risk, unlimited upside, no safety net', 'Defer Infosys 6 months (ask HR for joining delay) + build StudyBridge'], chosen_option: 'Defer Infosys 6 months (ask HR for joining delay) + build StudyBridge', outcome_notes: 'Most rational hedge: keep offer as backup while testing if startup can hit ₹1L MRR + raise pre-seed', decided_at: '2026-05-02T20:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Rahul Desai seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
