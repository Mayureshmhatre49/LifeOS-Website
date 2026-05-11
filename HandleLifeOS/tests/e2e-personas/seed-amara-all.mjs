/**
 * Seed: Amara Diallo — NGO Director (Education), Dakar, Senegal (XOF)
 * Email: amara.diallo@e2e-test.handlelifeos.app
 * Persona #11 — Directrice de FuturBright Sénégal, francophone + wolof, 34 ans
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL        = 'amara.diallo@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Amara Diallo (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Amara',
    occupation: 'Directrice Générale — FuturBright Sénégal (ONG éducation)',
    life_stage: 'mid_career',
    country: 'SN',
    currency: 'XOF',
    timezone: 'Africa/Dakar',
    goals: [
      'Étendre FuturBright à Kaolack, Ziguinchor et Tambacounda d\'ici 2027',
      'Sécuriser 500,000 USD USAID/AFD pour le programme de bourses 2027',
      'Publier le Rapport Annuel d\'Impact FuturBright 2026 avant septembre',
      'Intervenir à la Conférence UNESCO Paris sur l\'éducation des filles (novembre 2026)',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact',       key: 'ngo_scale',        value: 'FuturBright Sénégal: 5,200 students across Dakar, Thiès, Saint-Louis. 38 full-time staff + 120 volunteer teachers. Annual budget XOF 280 million (~€427K)', confidence: 98 },
      { user_id: uid, type: 'fact',       key: 'funding_sources',  value: 'USAID 42%, AFD 28%, individual donors 18%, Senegalese government grants 12%', confidence: 95 },
      { user_id: uid, type: 'fact',       key: 'monthly_income',   value: 'Salary XOF 1,150,000/month (~€1,755). UNESCO consulting occasional: XOF 200,000–400,000 per project', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'languages',        value: 'French (professional), Wolof (community + home), English B2 (improving for donor engagement)', confidence: 85 },
      { user_id: uid, type: 'fact',       key: 'living_situation', value: 'Rents 2BR Dakar Plateau near FuturBright office. Single, no children. Parents in Thiès — visits monthly. 2 siblings in Dakar', confidence: 88 },
      { user_id: uid, type: 'goal',       key: 'fundraising',      value: '500,000 USD multi-year USAID/AFD grant by Q1 2027 for 3-region expansion + girls\' scholarship programme. Letter of Intent submitted USAID Dakar Mission', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'financial_tools',  value: 'Wave (mobile money, local payments). Ecobank Sénégal (salary + donor funds). Debit only — no credit card', confidence: 80 },
      { user_id: uid, type: 'fact',       key: 'impact_metrics',   value: '94% school retention rate, 78% increase in girl enrollment over 3 years. 47 girls passed Brevet in Thiès cohort vs 12 three years prior', confidence: 97 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: 3, year: 2026, monthly_income: 1150000, savings_target: 200000, currency: 'XOF' },
    { month: 4, year: 2026, monthly_income: 1150000, savings_target: 200000, currency: 'XOF' },
    { month: 5, year: 2026, monthly_income: 1350000, savings_target: 280000, currency: 'XOF', notes: 'UNESCO consulting fee received May' },
  ];
  for (const bm of budgetMonths) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('month', bm.month).eq('year', bm.year);
    if (!count) { const { data, error } = await sb.from('budgets').insert({ user_id: uid, ...bm }).select(); ok(`budget ${bm.month}/${bm.year}`, data, error); }
  }

  if (await cnt('expenses', uid) === 0) {
    const expenses = [
      { category: 'rent',          amount: 350000, description: 'Loyer appartement Dakar Plateau (mai)',                           expense_date: '2026-05-01', is_recurring: true  },
      { category: 'bills',         amount: 45000,  description: 'SENELEC électricité + eau SONES mai',                             expense_date: '2026-05-03', is_recurring: true  },
      { category: 'bills',         amount: 25000,  description: 'Free Sénégal fibre + mobile forfait pro',                        expense_date: '2026-05-03', is_recurring: true  },
      { category: 'food',          amount: 85000,  description: 'Marché Tilène + Casino Dakar (courses bimensuelles)',              expense_date: '2026-05-05', is_recurring: false },
      { category: 'travel',        amount: 55000,  description: 'Dakar Dem Dikk + Yango — terrain Thiès et Saint-Louis',           expense_date: '2026-05-06', is_recurring: false },
      { category: 'food',          amount: 35000,  description: 'Restaurant Chez Loutcha — repas équipe FuturBright',              expense_date: '2026-05-08', is_recurring: false },
      { category: 'misc',          amount: 115000, description: 'Virement mensuel parents à Thiès',                                expense_date: '2026-05-01', is_recurring: true  },
      { category: 'education',     amount: 80000,  description: 'Cours anglais British Council Dakar (niveau B2)',                 expense_date: '2026-05-04', is_recurring: true  },
      { category: 'health',        amount: 45000,  description: 'Clinique Pasteur — bilan annuel + vaccins terrain',               expense_date: '2026-05-07', is_recurring: false },
      { category: 'shopping',      amount: 65000,  description: 'Tenues professionnelles — réunion bailleurs USAID Dakar',         expense_date: '2026-05-09', is_recurring: false },
      { category: 'entertainment', amount: 20000,  description: 'Institut Français Dakar — soirée culturelle + cinéma',            expense_date: '2026-05-10', is_recurring: false },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses.map(e => ({ user_id: uid, currency: 'XOF', ...e }))).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Fonds d\'urgence personnel — 6 mois de charges',      category: 'emergency_fund', target_amount: 7000000,  current_amount: 3200000, currency: 'XOF', target_date: '2026-12-31' },
      { user_id: uid, title: 'Voyage formation Washington DC (USAID Summit 2026)',   category: 'travel',         target_amount: 1800000,  current_amount: 950000,  currency: 'XOF', target_date: '2026-10-01' },
      { user_id: uid, title: 'Co-financement FuturBright expansion Ziguinchor',      category: 'other',          target_amount: 3000000,  current_amount: 800000,  currency: 'XOF', target_date: '2027-03-31' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Revue métriques FuturBright (inscriptions, présences, abandons)', icon: '📊', color: 'indigo',  frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Anglais 20 min (BBC podcast ou British Council app)',               icon: '🌍', color: 'blue',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Lecture — politique éducative ou développement ONG (30 min)',        icon: '📚', color: 'violet', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'Marche matinale Corniche de Dakar (30 min)',                         icon: '🌊', color: 'teal',   frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Appel hebdo chefs de région FuturBright',                            icon: '📞', color: 'emerald', frequency: 'weekly',  days_of_week: [1], target_per_day: 1 },
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
          if (h.frequency === 'weekly' && dow !== 'Mon') continue;
          if (Math.random() < 0.86) logs.push({ user_id: uid, habit_id: h.id, date, count: 1 });
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Expansion FuturBright vers Kaolack, Ziguinchor, Tambacounda', category: 'impact', target_date: '2027-06-30', status: 'active', progress_pct: 28, description: '3 new regions, 2,000 additional students. MoU with regional education authorities drafted.' },
      { user_id: uid, title: 'Subvention USAID/AFD 500,000 USD (2027-2030)',                  category: 'income', target_date: '2026-12-15', status: 'active', progress_pct: 45, description: 'Letter of Intent submitted USAID Dakar Mission. Site visit scheduled June 2026.' },
      { user_id: uid, title: 'Conférence UNESCO Paris — éducation des filles en Afrique',     category: 'role',   target_date: '2026-11-15', status: 'active', progress_pct: 20, description: 'Abstract submitted. Travel funded by UNESCO if accepted.' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Fatou Camara',    company: 'USAID Sénégal',               role: 'Program Officer Education', group_name: 'work',   email: 'fatou.camara@usaid.gov', notes: 'Key grant contact. Supportive of girls\' scholarship pilot. Met at African Education Forum 2025.', strength: 4 },
      { user_id: uid, name: 'Dr. Aminata Sow', company: 'Université Cheikh Anta Diop', role: 'Professeure — mentor',        group_name: 'mentor', notes: 'Thesis director. Monthly coffee UCAD. Advised repositioning as "education infrastructure" for stronger donor appeal.', strength: 5 },
      { user_id: uid, name: 'Marc Lefevre',    company: 'AFD Paris',                   role: 'Chargé de Projet Éducation',  group_name: 'work',   email: 'm.lefevre@afd.fr', notes: 'AFD co-financing contact. Indicated deadline extension flexibility.', strength: 3 },
      { user_id: uid, name: 'Binta Diallo',    company: 'FuturBright Sénégal',         role: 'Coordinatrice Terrain Thiès', group_name: 'work',   notes: 'Most trusted field manager. 1,800 students. Potential Regional Director successor.', strength: 5 },
    ];
    const { data: cd, error: ce } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', cd, ce);
    if (cd?.length) {
      const interactions = [
        { user_id: uid, contact_id: cd[0].id, type: 'meeting', occurred_at: '2026-05-07T10:00:00Z', notes: 'USAID office — Year 3 impact: 94% retention, 78% girl enrollment increase. Very positive on expansion.', sentiment: 'positive' },
        { user_id: uid, contact_id: cd[1].id, type: 'call',    occurred_at: '2026-05-04T16:00:00Z', notes: 'Monthly call. Advised "education infrastructure" framing for donor appeal.', sentiment: 'positive' },
        { user_id: uid, contact_id: cd[3].id, type: 'other',   occurred_at: '2026-05-09T09:00:00Z', notes: 'Thiès team: 100% exam attendance for Brevet cohort. Sent field recognition bonus.', sentiment: 'positive' },
      ];
      const { data, error } = await sb.from('contact_interactions').insert(interactions).select();
      ok('contact_interactions', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, mode: 'deep',     planned_minutes: 120, actual_minutes: 118, completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'Dossier USAID — sections "Theory of Change" et "Sustainability Plan"',          notes: 'Sections 3 and 4 completed. Strong 3-year evidence base.', started_at: '2026-05-05T06:00:00Z', ended_at: '2026-05-05T08:00:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 25,  actual_minutes: 25,  completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'Rapport Annuel 2025 — corrections finales + envoi graphiste',                    notes: 'Executive summary and key indicators reviewed.', started_at: '2026-05-07T07:00:00Z', ended_at: '2026-05-07T07:25:00Z' },
      { user_id: uid, mode: 'deep',     planned_minutes: 90,  actual_minutes: 85,  completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'Préparation discours UNESCO — structure + données clés sur éducation des filles', notes: '20-min presentation outline completed.', started_at: '2026-05-09T06:30:00Z', ended_at: '2026-05-09T08:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 5, energy: 5, note: 'Réunion USAID excellente — visite terrain juin confirmée. L\'expansion est réelle.', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Délai AFD raccourci à 3 semaines. Nuit longue mais équipe mobilisée.',               logged_at: '2026-05-05T22:30:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Dr. Sow m\'a rappelé pourquoi j\'ai quitté le secteur privé. 5,200 enfants.',         logged_at: '2026-05-04T21:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: 'Pourquoi l\'éducation des filles change tout', content: 'Ce matin, Binta m\'a envoyé les photos du Brevet de Thiès. 47 filles diplômées — elles n\'étaient que 12 il y a trois ans. Ce chiffre je le défendrai devant l\'USAID en juin. On ne se bat pas pour des statistiques — on se bat pour Fatoumata, pour Awa, pour Mariama.', mood: 5, tags: ['impact','mission','education'], created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, title: 'La fatigue du leadership',                      content: 'J\'ai 34 ans et parfois je me sens épuisée. Diriger une ONG c\'est porter la confiance de 5,200 familles. Quand le financement tarde je ne dors pas. Dr. Sow : "Le leadership authentique c\'est tenir quand personne ne regarde." Je m\'accroche à ça.',                                        mood: 3, tags: ['leadership','fatigue','resilience'], created_at: '2026-05-05T23:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('gratitude_entries', uid) === 0) {
    const entries = [
      { user_id: uid, items: ['47 filles diplômées du Brevet à Thiès', 'Confiance de Fatou Camara à USAID', 'Dr. Sow — disponible après 10 ans'],    date: '2026-05-09' },
      { user_id: uid, items: ['Équipe de 38 personnes qui croit à la mission', 'Famille à Thiès — soutien inconditionnel'],                           date: '2026-05-07' },
      { user_id: uid, items: ['Appartement sûr à Dakar Plateau', 'La santé pour travailler sans limite'],                                             date: '2026-05-04' },
    ];
    const { data, error } = await sb.from('gratitude_entries').insert(entries).select();
    ok('gratitude_entries', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, question: 'Prioriser la demande USAID ou AFD en premier vu le délai raccourci de l\'AFD?', category: 'career', mode: 'analyze', options: [], result: { summary: 'Finalize USAID first — stronger relationship, Fatou engaged, deadline June 15. Request AFD extension (Marc indicated flexibility).', chosen: 'USAID en premier', outcome: 'Rédaction USAID complète avant 1er juin. Extension AFD demandée le 5 mai.' }, favorite: true, created_at: '2026-05-06T19:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Amara Diallo seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
