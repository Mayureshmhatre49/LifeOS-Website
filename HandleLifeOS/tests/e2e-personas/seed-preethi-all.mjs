/**
 * Seed: Preethi Sundaram — EdTech Founder + Former IIT-M Professor, Chennai, India (INR)
 * Email: preethi.sundaram@e2e-test.handlelifeos.app
 * Persona #41 — Co-founder of VidyaPath (Tamil-medium K-12 EdTech, 180K students), Tamil Nadu
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'preethi.sundaram@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Preethi Sundaram (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Preethi Sundaram',
    display_name: 'Preethi',
    locale: 'ta-IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    country: 'IN',
    occupation: 'Co-founder & CEO — VidyaPath EdTech | Former Assistant Professor, IIT Madras (CS)',
    dietary_preferences: ['vegetarian', 'no-onion-garlic'],
    has_child: true,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Preethi co-founded VidyaPath in 2022 with her IIT-M colleague Dr. Suresh Annamalai. Tamil-medium K-12 adaptive learning platform. 180,000 students (grades 6–12) across Tamil Nadu, Pondicherry, and Sri Lanka Tamil communities. Monthly subscription MRR: ₹1.42 crore', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Former Assistant Professor at IIT Madras — Computer Science, specialising in AI + educational technology (2018–2022). PhD: NLP-based adaptive curriculum personalisation, IIT-M 2017. Left tenure track to build VidyaPath full-time', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Closed ₹8 crore seed round in March 2024 (Blume Ventures + IAN Angel Network). Currently raising Series A: ₹35 crore target. Lead investor in conversation: Sequoia India Surge + Kalaari Capital', importance: 10 },
      { user_id: uid, type: 'goal', content: 'VidyaPath Series A close by October 2026 — ₹35 crore at ₹140 crore pre-money valuation. Funds will go to Telugu + Kannada language expansion, CBSE curriculum module, and Tamil Nadu government school partnership', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Married to Karthik Sundaram (architect, freelance). Daughter Diya (8, Class 3, VidyaPath student — Preethi\'s unofficial user tester). Lives in Adyar, Chennai, in a 3BHK apartment (owned, home loan ongoing)', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Strict vegetarian — no onion/garlic (Brahmin family practice). Cooks South Indian breakfast every morning (idli/dosai). Speaks Tamil at home, English and Tamil in office. Team of 34 in Chennai (T Nagar office)', importance: 7 },
      { user_id: uid, type: 'fact', content: 'VidyaPath product: AI-driven syllabus mapping to TN State Board and CBSE, Tamil-first voice interaction, adaptive question banks, parent dashboard in Tamil. Teachers in rural TN use it for blended learning', importance: 9 },
      { user_id: uid, type: 'goal', content: 'Tamil Nadu government school partnership — pilot 500 government schools via CM\'s Illam Thedi Kalvi scheme. MoU under negotiation with Directorate of Government Examinations, TN', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Invests via Zerodha Coin (mutual funds) and Angel One (stocks). Has a PPF account (SBI) for long-term tax saving. Home loan with HDFC Bank at 8.45% (2019, 20-year term). Remaining balance: ₹32 lakh', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Board of advisors: Prof. Kamakoti (IIT-M Director emeritus), Meena Ganesh (co-founder Portea Medical), and Dr. Vanitha Narayanan (ex-IBM India MD). Strong network in Tamil Nadu academic and startup ecosystem', importance: 8 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 320000, expenses_budget: 180000, savings_budget: 80000, investment_budget: 60000 },
    { month: '2026-04-01', income: 295000, expenses_budget: 175000, savings_budget: 70000, investment_budget: 50000 },
    { month: '2026-05-01', income: 340000, expenses_budget: 185000, savings_budget: 90000, investment_budget: 65000 },
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
      { user_id: uid, category: 'Housing', description: 'HDFC Home Loan EMI — Adyar 3BHK', amount: 32500, currency: 'INR', date: '2026-05-05', payment_method: 'HDFC NACH Auto-debit' },
      { user_id: uid, category: 'Business', description: 'AWS India — VidyaPath platform infrastructure (EC2, RDS, S3, CloudFront)', amount: 48000, currency: 'INR', date: '2026-05-01', payment_method: 'Razorpay corporate card' },
      { user_id: uid, category: 'Business', description: 'VidyaPath T Nagar office rent (12 staff on-site)', amount: 42000, currency: 'INR', date: '2026-05-01', payment_method: 'NEFT' },
      { user_id: uid, category: 'Business', description: 'Razorpay payment gateway + GST TDS platform fees', amount: 8500, currency: 'INR', date: '2026-05-05', payment_method: 'Razorpay' },
      { user_id: uid, category: 'Education', description: 'Diya\'s VidyaPath subscription (family plan — tracked for UX testing)', amount: 0, currency: 'INR', date: '2026-05-01', payment_method: 'Internal', notes: 'Free internal account — Diya is user tester for Class 3 Tamil content' },
      { user_id: uid, category: 'Food', description: 'Saravana Bhavan + weekly Adyar Ananda Bhavan orders', amount: 3200, currency: 'INR', date: '2026-05-07', payment_method: 'UPI' },
      { user_id: uid, category: 'Childcare', description: 'Diya — Chettinad Vidyashram school fee (quarterly pro-rate)', amount: 18000, currency: 'INR', date: '2026-05-01', payment_method: 'Cheque' },
      { user_id: uid, category: 'Investment', description: 'PPF annual deposit — SBI branch Adyar', amount: 150000, currency: 'INR', date: '2026-04-01', payment_method: 'Net Banking', notes: 'Full ₹1.5 lakh annual limit deposited April for Section 80C benefit' },
      { user_id: uid, category: 'Investment', description: 'Zerodha Coin — Mirae Asset ELSS Tax Saver monthly SIP', amount: 25000, currency: 'INR', date: '2026-05-05', payment_method: 'Zerodha Coin' },
      { user_id: uid, category: 'Transport', description: 'Ola + Rapido + parking — Chennai travel (Series A meetings)', amount: 4200, currency: 'INR', date: '2026-05-08', payment_method: 'UPI' },
      { user_id: uid, category: 'Telecom', description: 'Vi Postpaid — work calls + BSNL Fibre broadband home', amount: 1100, currency: 'INR', date: '2026-05-01', payment_method: 'UPI' },
      { user_id: uid, category: 'Parents', description: 'Monthly transfer to parents (Coimbatore) — Preethi\'s mother retired', amount: 15000, currency: 'INR', date: '2026-05-01', payment_method: 'UPI' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Diya — higher education fund', target_amount: 5000000, current_amount: 680000, currency: 'INR', target_date: '2035-06-01', category: 'Education', notes: 'Target IIT/NIT + Masters abroad. SBI FD ladder + Zerodha equity SIP. Preethi is acutely aware of education cost inflation' },
      { user_id: uid, name: 'Home loan prepayment — clear by 2030', target_amount: 3200000, current_amount: 420000, currency: 'INR', target_date: '2030-12-31', category: 'Housing', notes: 'HDFC loan balance ₹32 lakh. Extra annual prepayments of ₹4–5 lakh after Series A closes' },
      { user_id: uid, name: 'Emergency fund (personal)', target_amount: 500000, current_amount: 285000, currency: 'INR', target_date: '2026-12-31', category: 'Emergency', notes: 'Liquid fund (Parag Parikh Liquid + SBI savings). 6 months personal expenses' },
      { user_id: uid, name: 'VidyaPath — Telugu + Kannada expansion fund', target_amount: 10000000, current_amount: 2200000, currency: 'INR', target_date: '2027-03-31', category: 'Business', notes: 'Series A will fund bulk of this. Personal co-founder contribution: 5% of round. Telugu content partnership with Eenadu Education' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'Mirae Asset ELSS Tax Saver (SIP)', type: 'mutual_fund', amount_invested: 375000, current_value: 512000, currency: 'INR', institution: 'Zerodha Coin', notes: 'Monthly ₹25,000 SIP. ELSS for 80C + long-term wealth. Lock-in 3 years' },
      { user_id: uid, name: 'PPF (Public Provident Fund) — SBI', type: 'ppf', amount_invested: 750000, current_value: 910000, currency: 'INR', institution: 'SBI Adyar', notes: '7.1% p.a. tax-free. 15-year maturity 2031. Max ₹1.5L/year deposited each April' },
      { user_id: uid, name: 'Angel One — NIFTY 50 Index Fund (lumpsum)', type: 'equity', amount_invested: 200000, current_value: 248000, currency: 'INR', institution: 'Angel One', notes: 'Lumpsum after seed round closed March 2024. HDFC NIFTY 50 ETF' },
      { user_id: uid, name: 'VidyaPath — co-founder equity stake (22%)', type: 'private_equity', amount_invested: 500000, current_value: 30800000, currency: 'INR', institution: 'VidyaPath Technologies Pvt Ltd', notes: 'At ₹140 crore pre-money Series A valuation. Paper gain only — illiquid until exit' },
      { user_id: uid, name: 'SBI Fixed Deposit — Diya education fund', type: 'fixed_deposit', amount_invested: 300000, current_value: 342000, currency: 'INR', institution: 'SBI', notes: '3-year FD at 7.0% p.a. Matures May 2027. Earmarked for Diya' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'AWS India (VidyaPath infrastructure)', amount: 48000, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Notion Business (team workspace)', amount: 2400, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Zoom Pro (investor calls, team standups)', amount: 1499, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Tally Prime (GST invoicing + accounting)', amount: 899, currency: 'INR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Adobe Creative Cloud (marketing team)', amount: 5600, currency: 'INR', billing_cycle: 'yearly', category: 'Business', next_billing_date: '2027-02-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Tamil Nadu State Board (pilot)', industry: 'Government Education', contact_email: 'dge@tn.gov.in', monthly_value: 0, currency: 'INR', status: 'prospect', country: 'IN', notes: 'MoU negotiation with Directorate of Government Examinations for 500-school pilot via Illam Thedi Kalvi scheme' },
      { user_id: uid, name: 'Eenadu Education (Telugu partnership)', industry: 'EdTech / Media', contact_email: null, monthly_value: 120000, currency: 'INR', status: 'active', country: 'IN', notes: 'Content licensing deal — Eenadu provides Telugu curriculum, VidyaPath provides adaptive delivery. Revenue share 60/40' },
      { user_id: uid, name: 'Chettinad Vidyashram (pilot school)', industry: 'Private Education', contact_email: 'principal@chettinadvidyashram.org', monthly_value: 85000, currency: 'INR', status: 'active', country: 'IN', notes: 'Blended learning pilot — 1,200 students using VidyaPath. Preethi\'s daughter Diya is a student here' },
      { user_id: uid, name: 'Sri Lanka Tamil Schools Association', industry: 'Education (International)', contact_email: null, monthly_value: 45000, currency: 'INR', status: 'active', country: 'LK', notes: '3,800 Tamil-medium students in Northern Province using VidyaPath at discounted SGS rate via diaspora grant' },
    ];
    const { data, error } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', data, error);
  }

  if (await cnt('business_projects', uid) === 0) {
    const projects = [
      { user_id: uid, name: 'Series A fundraise — ₹35 crore', status: 'in_progress', client_name: 'Sequoia India Surge + Kalaari Capital', budget: 0, currency: 'INR', start_date: '2026-03-01', end_date: '2026-10-31', description: 'Lead investor deck, data room, term sheet negotiation. Co-founder Dr. Suresh Annamalai handles product DD; Preethi handles financials + vision. Target close October 2026' },
      { user_id: uid, name: 'TN Government School Pilot (500 schools)', status: 'in_progress', client_name: 'TN Directorate of Government Examinations', budget: 1500000, currency: 'INR', start_date: '2026-04-01', end_date: '2026-09-30', description: 'Proof of concept under Illam Thedi Kalvi. Free 6-month pilot for 500 schools. Success metrics: student completion rate, teacher NPS, exam score improvement' },
      { user_id: uid, name: 'CBSE Curriculum Module Development', status: 'planned', client_name: null, budget: 2800000, currency: 'INR', start_date: '2026-08-01', end_date: '2027-02-28', description: 'Expand beyond Tamil Nadu State Board to CBSE grades 6–10. New audience: pan-India English + Tamil bilingual students. Content team of 8 required' },
      { user_id: uid, name: 'Telugu Language Content Expansion', status: 'in_progress', client_name: 'Eenadu Education', budget: 1200000, currency: 'INR', start_date: '2026-02-01', end_date: '2026-08-31', description: 'Telugu AP + Telangana State Board curriculum with Eenadu content team. Adaptive NLP models re-trained on Telugu text corpora' },
    ];
    const { data, error } = await sb.from('business_projects').insert(projects).select();
    ok('business_projects', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Cook South Indian breakfast (idli/dosai) + school drop Diya', frequency: 'weekdays', target_count: 1, color: '#F59E0B', icon: '🍳' },
      { user_id: uid, name: '30-min Series A investor prep (deck, data room, metrics)', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '📊' },
      { user_id: uid, name: 'VidyaPath product standup (9:30am IST)', frequency: 'weekdays', target_count: 1, color: '#10B981', icon: '💻' },
      { user_id: uid, name: 'Read Tamil literature or AI research paper (30 min)', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '📚' },
      { user_id: uid, name: 'Evening walk — ECR beachfront or Adyar River park', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '🌊' },
      { user_id: uid, name: 'Weekly board of advisors / investor update email', frequency: 'weekly', target_count: 1, color: '#EF4444', icon: '✉️' },
      { user_id: uid, name: 'Diya homework review + VidyaPath session watch', frequency: 'weekdays', target_count: 1, color: '#14B8A6', icon: '👧' },
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
          if (Math.random() < 0.87) {
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
      { user_id: uid, title: 'VidyaPath Series A close — ₹35 crore by Oct 2026', category: 'Fundraising', target_date: '2026-10-31', status: 'in_progress', progress: 35, notes: 'Term sheet from Sequoia Surge expected June 2026. Kalaari co-lead TBC. Data room 80% complete. Need 6 more months of 15%+ MoM growth to justify ₹140Cr valuation' },
      { user_id: uid, title: 'TN government school MoU — 500 schools pilot', category: 'Growth', target_date: '2026-09-30', status: 'in_progress', progress: 50, notes: 'MoU draft with DGE reviewed by VidyaPath legal counsel. Political sponsor: Education Secretary Dr. R. Venkatesan (IAS). Meeting with Additional Commissioner June 3' },
      { user_id: uid, title: 'Reach 500,000 active students on VidyaPath', category: 'Product Growth', target_date: '2027-03-31', status: 'in_progress', progress: 36, notes: 'Currently 180K students. Telugu expansion (est. +80K) + TN government pilot (+120K) would reach target. Organic growth currently +8K students/month' },
      { user_id: uid, title: 'International expansion — Tamil diaspora (Singapore, Malaysia, UK)', category: 'International', target_date: '2027-12-31', status: 'not_started', progress: 5, notes: 'Singapore Tamil schools using it informally already. Formal partnership with Singapore Tamil Language Council being explored' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Anand Daniel', relationship: 'investor', email: 'anand@accel.com', phone: null, notes: 'Partner at Accel India. Passed on seed (early stage) but closely watching Series A. Regular quarterly check-in. Intro\'d Preethi to Kalaari' },
      { user_id: uid, name: 'Dr. Suresh Annamalai', relationship: 'co-founder', email: 'suresh@vidyapath.in', phone: null, notes: 'VidyaPath co-founder + CTO. IIT-M colleague. Handles engineering + product. Preethi handles growth, fundraising, government relations' },
      { user_id: uid, name: 'Meena Ganesh', relationship: 'advisor', email: null, phone: null, notes: 'Board advisor. Co-founder Portea Medical, former MD Tutor Vista. Deep edtech + healthcare startup experience in India. Monthly advisory call' },
      { user_id: uid, name: 'Dr. R. Venkatesan IAS', relationship: 'government', email: 'edsecretary@tn.gov.in', phone: null, notes: 'TN Education Secretary — key sponsor for government school pilot MoU. Met at Chennai EdTech Summit March 2026. Very supportive of Tamil-first EdTech' },
      { user_id: uid, name: 'Karthik Sundaram', relationship: 'family', email: null, phone: null, notes: 'Preethi\'s husband. Architect, freelance. Handles Diya\'s school runs + after-school activities when Preethi is in investor meetings or Bangalore travel' },
    ];
    const { data: cd, error: ce } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', cd, ce);

    if (cd?.length) {
      const interactions = [
        { user_id: uid, contact_id: cd[1].id, type: 'meeting', notes: 'Suresh + Preethi Series A prep session: reviewed unit economics, CAC ₹380 / LTV ₹2,100 / payback 5.4 months. Strong metrics. Need to highlight government school TAM for investors', occurred_at: '2026-05-06T10:00:00Z' },
        { user_id: uid, contact_id: cd[2].id, type: 'call', notes: 'Monthly advisory call with Meena Ganesh. Advised positioning VidyaPath as "infrastructure for vernacular learning" not just "Tamil EdTech" — widens Series A investor universe significantly', occurred_at: '2026-05-04T16:00:00Z' },
        { user_id: uid, contact_id: cd[3].id, type: 'meeting', notes: 'Preethi met Dr. Venkatesan IAS at TN Secretariat. He confirmed pilot MoU can be fast-tracked if VidyaPath provides free 6-month access. Education Minister supportive. Next meeting June 3', occurred_at: '2026-05-08T11:30:00Z' },
      ];
      const { data, error } = await sb.from('contact_interactions').insert(interactions).select();
      ok('contact_interactions', data, error);
    }
  }

  if (await cnt('trips', uid) === 0) {
    const { data: tripData, error: tripErr } = await sb.from('trips').insert({
      user_id: uid,
      name: 'Bangalore Series A investor roadshow',
      destination: 'Bangalore, Karnataka',
      start_date: '2026-06-09',
      end_date: '2026-06-12',
      status: 'planned',
      budget: 35000,
      currency: 'INR',
      notes: 'Sequoia Surge office + Kalaari Capital + Blume Ventures follow-on meeting. 4 days, 8 investor meetings. Karthik handling Diya',
    }).select();
    ok('trip', tripData, tripErr);

    if (tripData?.[0]) {
      const tripId = tripData[0].id;
      const items = [
        { trip_id: tripId, user_id: uid, type: 'flight', title: 'Chennai MAA → Bangalore BLR (IndiGo)', date: '2026-06-09', cost: 4800, currency: 'INR', notes: 'Early morning 6am flight — pitch at Sequoia by 10am. Carry-on only' },
        { trip_id: tripId, user_id: uid, type: 'accommodation', title: 'Marriott Whitefield Bangalore (3 nights)', date: '2026-06-09', cost: 18000, currency: 'INR', notes: 'Business rate. Near Sequoia Surge + Kalaari offices in Indiranagar corridor' },
        { trip_id: tripId, user_id: uid, type: 'activity', title: 'Sequoia India Surge — Series A pitch meeting', date: '2026-06-10', cost: 0, currency: 'INR', notes: 'Lead investor meeting. 60-min pitch + 30-min Q&A. Take Suresh for product DD questions' },
        { trip_id: tripId, user_id: uid, type: 'activity', title: 'Kalaari Capital — co-lead investor meeting', date: '2026-06-11', cost: 0, currency: 'INR', notes: 'Vani Kola directly interested per Meena\'s intro. Key meeting — bring printed impact report' },
        { trip_id: tripId, user_id: uid, type: 'flight', title: 'Bangalore BLR → Chennai MAA (IndiGo)', date: '2026-06-12', cost: 4200, currency: 'INR', notes: 'Evening flight. Back for Diya\'s Sunday dinner' },
      ];
      const { data, error } = await sb.from('trip_items').insert(items).select();
      ok('trip_items', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 150, type: 'fundraising', notes: 'Series A pitch deck — rebuilt financial projections slide. 3-year model: FY27 ₹18Cr ARR, FY28 ₹48Cr ARR, FY29 ₹95Cr ARR. CAC, LTV, payback, cohort retention all modelled', completed_at: '2026-05-06T23:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'policy', notes: 'TN government MoU draft review with Preethi\'s lawyer. Clarified IP ownership clause — VidyaPath retains full platform IP, government gets perpetual licence for pilot schools only', completed_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'product', notes: 'Watched Diya complete 3 VidyaPath sessions — Grade 3 Tamil grammar module. UX observation: she got confused by the voice prompt gender (male voice for Tamil). Filed ticket for female voice option', completed_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'research', notes: 'Read paper: "Vernacular First Learning in Low-Resource NLP" — Nature Digital Education. Relevant for Telugu NLP model training. Shared with Suresh for CBSE module planning', completed_at: '2026-05-09T23:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'excited', energy: 9, notes: 'Meeting with Dr. Venkatesan IAS was beyond expectations. He said the Education Minister personally reviewed VidyaPath and is "very impressed." Government pilot is real. This could be transformational.', logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 'overwhelmed', energy: 5, notes: 'Series A due diligence, TN government MoU, Telugu expansion, and Chettinad school monthly review all in the same week. Karthik reminded me to breathe. Made sambhar and sat with Diya for an hour.', logged_at: '2026-05-06T22:30:00Z' },
      { user_id: uid, mood: 'proud', energy: 8, notes: 'Diya showed her class teacher the VidyaPath Tamil poem module and her teacher asked how she understood the meter so well. She said "Amma\'s app taught me." That is why I left IIT-M.', logged_at: '2026-05-03T21:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, content: 'அன்று IIT-M-ல் பேராசிரியர் பதவியை விட்டுவிட்டபோது, என் அம்மா அழுதார்கள். "அரசு வேலையை ஏன் விடுகிறாய்?" என்று கேட்டார்கள். இன்று, தமிழகத்தின் கல்வி செயலர் நேரில் VidyaPath-ஐ பாராட்டும்போது, அந்த முடிவு சரிதான் என்று தெரிகிறது. 180,000 மாணவர்கள் தமிழில் படிக்கிறார்கள். இதுவே என் விடை.', mood: 'determined', tags: ['career', 'mission', 'tamil', 'family'], created_at: '2026-05-08T23:30:00Z' },
      { user_id: uid, content: 'Series A is the biggest fundraise we\'ve done. ₹35 crore is not a small number. I remember when we had ₹80,000 in the company account in 2022 and Suresh and I were working from my apartment dining table. Diya would do her homework next to us. Now we have 34 people. The dining table to T Nagar office — that\'s the real milestone, not the valuation.', mood: 'reflective', tags: ['startup', 'growth', 'gratitude'], created_at: '2026-05-04T22:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Raise Series A now (₹35Cr at ₹140Cr valuation) vs wait 12 months for better metrics?', options: ['Raise now: Sequoia + Kalaari interested, market window good, TN government momentum. Dilution 20%', 'Wait 12 months: grow to ₹2Cr MRR, strengthen case for ₹200Cr+ valuation. Risk: market cools, team attrition', 'Bridge round: ₹8Cr from existing angels (Blume + IAN) to buy 8 months, then raise on stronger metrics'], chosen_option: 'Raise now: Sequoia + Kalaari interested, market window good, TN government momentum. Dilution 20%', outcome_notes: 'Meena Ganesh advice: "When Sequoia is in the room, you close the round." Government school MoU is a differentiation no other EdTech has. Timing is right.', decided_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, title: 'Hire a CFO now (₹35L CTC) vs outsource to CA firm (₹8L/year)?', options: ['Hire full-time CFO: needed for Series A DD, investor relations, MIS reporting. High cost pre-raise', 'Outsource to CA firm: sufficient for current scale, cheaper, no hiring overhead', 'Fractional CFO (2 days/week): ₹18L, covers Series A DD + ongoing reporting'], chosen_option: 'Fractional CFO (2 days/week): ₹18L, covers Series A DD + ongoing reporting', outcome_notes: 'Blume Ventures partner Karthik Reddy recommended fractional CFO model for pre-Series-A stage. Hired CA Anitha Krishnamurthy (ex-Freshworks CFO office) on fractional basis', decided_at: '2026-04-20T18:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  if (await cnt('gratitude_entries', uid) === 0) {
    const entries = [
      { user_id: uid, content: 'Diya said "Amma\'s app taught me." I left IIT-M for this moment.', created_at: '2026-05-03T21:30:00Z' },
      { user_id: uid, content: 'Karthik handles everything at home without complaint. The company would not exist without him.', created_at: '2026-05-06T23:00:00Z' },
      { user_id: uid, content: 'Meena Ganesh\'s one sentence — "When Sequoia is in the room, you close the round" — clarified everything.', created_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, content: '180,000 students learning in Tamil. Not English. Tamil. This is what we came to do.', created_at: '2026-05-08T23:00:00Z' },
    ];
    const { data, error } = await sb.from('gratitude_entries').insert(entries).select();
    ok('gratitude_entries', data, error);
  }

  console.log('\n✅ Preethi Sundaram seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
