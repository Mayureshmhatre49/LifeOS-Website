/**
 * Seed: Sofia Andersen — Environmental Scientist (PhD), Copenhagen, Denmark (DKK)
 * Email: sofia.andersen@e2e-test.handlelifeos.app
 * Persona #13 — 27yo, DTU PhD candidate, vegan, cycle commuter, ethical investor
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL        = 'sofia.andersen@e2e-test.handlelifeos.app';

if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing env vars'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const ok   = (l, d, e) => { if (e) console.error(`✗ ${l}`, e.message); else console.log(`✓ ${l}`, Array.isArray(d) ? `(${d.length})` : ''); };
const fail = (l, e)    => console.error(`✗ ${l}`, e?.message ?? e);
const cnt  = async (t, uid) => { const { count } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', uid); return count ?? 0; };

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
  console.log(`\n🌱 Seeding Sofia Andersen (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Sofia',
    occupation: 'PhD Candidate — DTU (Technical University of Denmark), Department of Environmental Engineering',
    life_stage: 'student',
    country: 'DK',
    currency: 'DKK',
    timezone: 'Europe/Copenhagen',
    goals: [
      'Submit PhD thesis on microplastic remediation in Baltic Sea wetlands by December 2026',
      'Publish first-author paper in Nature Climate Change before thesis defence',
      'Run Copenhagen Marathon in under 4:30 (May 2027)',
      'Build ethical investment portfolio to DKK 150,000 by end of 2027',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact',       key: 'phd_topic',         value: 'PhD research: microplastic accumulation and bioremediation in Baltic Sea coastal wetlands. Supervisor: Prof. Lars Thomsen. Target submission: December 2026. ECTS stipend DKK 24,000/month.', confidence: 98 },
      { user_id: uid, type: 'fact',       key: 'living_situation',  value: 'Rents studio in Nørrebro, Copenhagen — DKK 8,200/month. Lives alone. Cycles everywhere — no car. Bike: Velorbis Churchill (DKK 14,000, owned outright).', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'diet',              value: 'Vegan for 4 years. Shops at Irma and local farmers\' market on Saturdays. Meal preps Sundays. Never eats out at non-vegan restaurants.', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'values',            value: 'Carbon footprint minimiser: no flights (uses train/ferry for travel), no meat, secondhand clothing (Humana DK). Checks company ESG ratings before any purchase.', confidence: 90 },
      { user_id: uid, type: 'goal',       key: 'investment_ethics', value: 'Only invests in fossil-fuel-free, ESG-screened funds. Uses Nordnet Aktiesparekonto (ISK equivalent). Sparindex DJSI World screened index. Monthly DKK 2,000 contribution.', confidence: 88 },
      { user_id: uid, type: 'fact',       key: 'running',           value: 'Trains for Copenhagen Marathon May 2027. Currently runs 45km/week. Uses Garmin Forerunner 265. Joined Copenhagen Running Club (Wednesdays + Sundays).', confidence: 85 },
      { user_id: uid, type: 'fact',       key: 'research_progress', value: 'Chapter 2 submitted to supervisor Jan 2026. Chapter 3 (field results from Limfjord sampling) drafting. Expected full draft: Sept 2026. Publication in Nature Climate Change target Q3 2026.', confidence: 92 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: 3, year: 2026, monthly_income: 24000, savings_target: 3500, currency: 'DKK' },
    { month: 4, year: 2026, monthly_income: 24000, savings_target: 3500, currency: 'DKK' },
    { month: 5, year: 2026, monthly_income: 24000, savings_target: 4000, currency: 'DKK' },
  ];
  for (const bm of budgetMonths) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('month', bm.month).eq('year', bm.year);
    if (!count) { const { data, error } = await sb.from('budgets').insert({ user_id: uid, ...bm }).select(); ok(`budget ${bm.month}/${bm.year}`, data, error); }
  }

  if (await cnt('expenses', uid) === 0) {
    const expenses = [
      { category: 'rent',          amount: 8200,  description: 'Nørrebro studio — maj husleje',                              expense_date: '2026-05-01', is_recurring: true  },
      { category: 'bills',         amount: 480,   description: 'Ørsted el + varme (grøn energi)',                             expense_date: '2026-05-03', is_recurring: true  },
      { category: 'bills',         amount: 299,   description: 'YouSee bredbånd (100/100 Mbps)',                              expense_date: '2026-05-03', is_recurring: true  },
      { category: 'food',          amount: 1850,  description: 'Irma + lørdag\'s bondemarked Nørrebroparken (vegansk)',        expense_date: '2026-05-04', is_recurring: false },
      { category: 'food',          amount: 420,   description: 'Simple Raw vegetarisk restaurant — frokost med vejleder',     expense_date: '2026-05-07', is_recurring: false },
      { category: 'health',        amount: 350,   description: 'Løbesko — On Running (udskiftning hvert 800 km)',             expense_date: '2026-05-06', is_recurring: false },
      { category: 'education',     amount: 89,    description: 'Nature Climate Change article access (institutionel adgang udløbet)', expense_date: '2026-05-05', is_recurring: false },
      { category: 'entertainment', amount: 179,   description: 'Musikbiblioteket CPH + Vega koncert (lokalt band)',           expense_date: '2026-05-09', is_recurring: false },
      { category: 'shopping',      amount: 320,   description: 'Humana genbrugsbutik — jakke + bøger (brugt)',               expense_date: '2026-05-08', is_recurring: false },
      { category: 'bills',         amount: 199,   description: 'Headspace meditation app (DSU studenterrabat)',               expense_date: '2026-05-01', is_recurring: true  },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses.map(e => ({ user_id: uid, currency: 'DKK', ...e }))).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Etisk investeringsportefølje — DKK 150,000',                category: 'other',          target_amount: 150000, current_amount: 68000,  currency: 'DKK', target_date: '2027-12-31' },
      { user_id: uid, title: 'Nødfond — 3 måneders udgifter',                              category: 'emergency_fund', target_amount: 35000,  current_amount: 22000,  currency: 'DKK', target_date: '2026-09-01' },
      { user_id: uid, title: 'Interrail — Scandinavian research field trip (tog + færge)', category: 'travel',         target_amount: 12000,  current_amount: 5500,   currency: 'DKK', target_date: '2026-08-01' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'Sparindex DJSI World KL (ESG-screenet, fossil-fri)', type: 'mutual_fund', invested_amount: 55000, current_value: 68200, currency: 'DKK', account: 'Nordnet Aktiesparekonto', notes: 'Monthly DKK 2,000 SIP. No fossil fuels, tobacco or weapons. MSCI ESG Leader screened.' },
      { user_id: uid, name: 'Ørsted A/S aktier (vedvarende energi)',              type: 'stock',       invested_amount: 12000, current_value: 10800, currency: 'DKK', account: 'Nordnet',                 notes: 'Direct green energy bet. Bought at peak — currently at loss but holding conviction.' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'PhD skrivetid — 2 timer fokuseret forskning eller skrivning', icon: '🔬', color: 'indigo',  frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Vegansk madlavning (ikke bestillingsmad)',                    icon: '🥦', color: 'emerald', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Løbetræning (45+ km/uge mod maraton)',                        icon: '🏃', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Meditation 10 min (Headspace)',                               icon: '🧘', color: 'violet', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Naturnotat — observations fra cykeltur eller park',           icon: '🌿', color: 'teal',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'CO2-beregner — tjek ugens fodaftryk (Klima+ app)',            icon: '♻️',  color: 'sky',    frequency: 'weekly',   days_of_week: [0], target_per_day: 1 },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);
    if (hd?.length) {
      const logs = [];
      for (let o = 0; o < 21; o++) {
        const date = dateOffset(o);
        const dow = DOW[new Date(date + 'T00:00:00Z').getUTCDay()];
        for (const h of hd) {
          const isWeekday = !['Sat','Sun'].includes(dow);
          if (h.frequency === 'weekdays' && !isWeekday) continue;
          if (h.frequency === 'weekly' && dow !== 'Sun') continue;
          if (Math.random() < 0.84) logs.push({ user_id: uid, habit_id: h.id, date, count: 1 });
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'PhD-afhandling indleveret (mikroplast i Østersøens vådområder)', category: 'other',   target_date: '2026-12-15', status: 'active', progress_pct: 62, description: 'Chapter 1-2 complete. Chapter 3 (Limfjord field results) drafting. Chapter 4 starts September. Supervisor Prof. Thomsen monthly review.' },
      { user_id: uid, title: 'Publikation i Nature Climate Change (første-forfatter)',          category: 'skill',   target_date: '2026-09-30', status: 'active', progress_pct: 45, description: 'Manuscript draft 70% complete. Peer review submission target July 2026. Co-authors: Prof. Thomsen + Dr. Kraft (Lund University).' },
      { user_id: uid, title: 'Post-doc ansøgning — ETH Zürich eller Max Planck Institut',      category: 'role',    target_date: '2027-03-01', status: 'active', progress_pct: 10, description: 'Two target positions identified. Applications open January 2027. Need supervisor recommendation letter by December 2026.' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Prof. Lars Thomsen', company: 'DTU', role: 'PhD vejleder', group_name: 'mentor', notes: 'Supervisor. Bi-weekly check-ins. Very supportive of Nature Climate Change submission. Written two strong recommendation letters.', strength: 5 },
      { user_id: uid, name: 'Dr. Emma Kraft',     company: 'Lund University',    role: 'Forsker — Baltic Sea plastics', group_name: 'work',   notes: 'Swedish co-author on Nature Climate Change paper. Sharing field data from Swedish Limfjord site. Collaboration works well.', strength: 4 },
      { user_id: uid, name: 'Magnus Poulsen',     company: 'CPH Running Club',   role: 'Løbehold captain',              group_name: 'friends', notes: 'Organises Wednesday track sessions and Sunday long run. Marathon training partner. Going Copenhagen together May 2027.', strength: 3 },
    ];
    const { data: cd, error: ce } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', cd, ce);
    if (cd?.length) {
      const interactions = [
        { user_id: uid, contact_id: cd[0].id, type: 'meeting', occurred_at: '2026-05-08T10:00:00Z', notes: 'Chapter 3 review. Prof. Thomsen very positive on Limfjord accumulation data — says it\'s "publishable standalone". Agreed July submission target.', sentiment: 'positive' },
        { user_id: uid, contact_id: cd[1].id, type: 'email',   occurred_at: '2026-05-06T09:00:00Z', notes: 'Dr. Kraft shared Swedish field measurements via Google Drive. Data fills gap in Chapter 3 cross-Baltic comparison.', sentiment: 'positive' },
      ];
      const { data, error } = await sb.from('contact_interactions').insert(interactions).select();
      ok('contact_interactions', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, mode: 'deep',     planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'PhD Chapter 3 — Limfjord sampling results analysis (R statistical modelling)',   notes: 'Ran ANOVA on microplastic concentration by depth. Significant result p<0.001. Key finding confirmed.', started_at: '2026-05-05T08:00:00Z', ended_at: '2026-05-05T10:00:00Z' },
      { user_id: uid, mode: 'deep',     planned_minutes: 90,  actual_minutes: 90,  completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Nature Climate Change manuscript — Methods section revision',                     notes: 'Incorporated Dr. Kraft\'s Swedish site data. Methods now cover 3 national sites.', started_at: '2026-05-07T09:00:00Z', ended_at: '2026-05-07T10:30:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 25,  actual_minutes: 22,  completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Post-doc position research — ETH Zürich Environmental Systems Science dept', notes: 'Identified Dr. Sören Metz group as best fit. Application window January 2027.', started_at: '2026-05-09T16:00:00Z', ended_at: '2026-05-09T16:25:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 5, energy: 5, note: 'The Limfjord p-value came back significant. The chapter is strong. Prof. Thomsen agreed on July submission. This is really happening.',   logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Imposter syndrome day. Is my research actually good enough for Nature Climate Change? Talked to Magnus — he reminded me: submit and find out.', logged_at: '2026-05-05T21:30:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: '28km long run Sunday through Dyrehaven. Endorphins fixed everything. Thesis can wait 2 hours for this.',                                 logged_at: '2026-05-03T20:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: 'Why I chose this PhD when I could have taken an industry job',      content: 'Unilever offered me a sustainability role when I graduated — DKK 55,000/month vs my DKK 24,000 stipend. I said no. Colleagues thought I was crazy. But today when the Limfjord data showed microplastics at 4.2 particles/L at 2m depth — levels that will bioaccumulate up the food chain — I knew why I\'m here. This data will be in a Nature paper that changes policy. A marketing deck for Unilever\'s palm oil claims would not.', mood: 5, tags: ['purpose','phd','research'], created_at: '2026-05-08T23:00:00Z' },
      { user_id: uid, title: 'The imposter problem',                                               content: 'Every PhD student talks about imposter syndrome but we still don\'t talk about it honestly. I re-read other Nature Climate Change papers today and felt terrified. Their methods sections are so elegant. Mine feel clumsy. But Prof. Thomsen says my data is the strongest comparative Baltic dataset in 10 years. I have to trust that.', mood: 3, tags: ['imposter-syndrome','phd','mental-health'], created_at: '2026-05-05T22:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('gratitude_entries', uid) === 0) {
    const entries = [
      { user_id: uid, items: ['Significant p-value — the research is real', 'Prof. Thomsen believing in July submission', 'A bike that gets me anywhere without a car'], date: '2026-05-08' },
      { user_id: uid, items: ['28km in Dyrehaven without stopping', 'Dr. Kraft sharing Swedish data freely'],                                                             date: '2026-05-03' },
      { user_id: uid, items: ['Living in Copenhagen — the most livable city for cyclists', 'DTU stipend that lets me do science full-time'],                               date: '2026-04-30' },
    ];
    const { data, error } = await sb.from('gratitude_entries').insert(entries).select();
    ok('gratitude_entries', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, question: 'Should I fly to the Gothenburg conference or take the train (4h longer, 20x less CO2)?', category: 'other', mode: 'analyze', options: [], result: { summary: 'Train. Carbon cost of flight 180kg CO2 vs 12kg train. 4-hour time loss is the cost of living by values. DTU reimburses train first class.', chosen: 'Train to Gothenburg', outcome: 'Booked SJ X2000 direct CPH-GOT. Worked productively during travel. Zero regret.' }, favorite: false, created_at: '2026-04-28T18:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Sofia Andersen seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
