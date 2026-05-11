/**
 * Seed: Pierre Dubois — Vineyard Owner & Winemaker, Bordeaux, France (EUR)
 * Email: pierre.dubois@e2e-test.handlelifeos.app
 * Persona #32 — Château du Lac winery, wine tourism, seasonal income, heritage property
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'pierre.dubois@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Pierre Dubois (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Pierre Dubois',
    display_name: 'Pierre',
    locale: 'fr-FR',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    country: 'FR',
    occupation: 'Viticulteur & Propriétaire — Château du Lac, Bordeaux',
    dietary_preferences: [],
    has_child: true,
    child_name: 'Clément',
    child_age: 19,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Pierre possède et dirige Château du Lac, domaine viticole de 18 hectares en AOC Bordeaux Supérieur depuis 1988 (héritage familial 3ème génération)', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Production: 90,000 bouteilles/an. Vente: 60% négoce, 25% CHR (restaurants/hôtels), 15% direct (cave/export)', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Revenu annuel domaine: €380,000-520,000 selon millésime et cours du vin. Forte variabilité climatique', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Vins préférés: son propre Merlot/Cabernet Sauvignon. Also Pomerol neighbour Château Le Pin for inspiration', importance: 6 },
      { user_id: uid, type: 'fact', content: 'Épouse Sophie (œnologue) co-dirige avec lui. Fils Clément (19, écoles de commerce Bordeaux) reprendra peut-être le domaine', importance: 9 },
      { user_id: uid, type: 'goal', content: 'Obtenir classification Cru Bourgeois Exceptionnel — reclassification dossier soumis au CIVB', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Financement: prêt viticole Crédit Agricole €220,000 (cave de vinification rénovée 2023). 7 ans, 3.8%', importance: 8 },
      { user_id: uid, type: 'preference', content: 'Ventes export: USA (35%), Chine (20%), UK (18%), Belgique (12%). Agent export: Bordeaux Wine Exports SAS', importance: 8 },
      { user_id: uid, type: 'goal', content: 'Développer l\'oenotourisme: 2 gîtes dans les dépendances du château (permis de construire accordé)', importance: 8 },
      { user_id: uid, type: 'fact', content: 'Vendanges: mi-septembre (Merlot) à début octobre (Cabernet Sauvignon). Toute la famille mobilisée', importance: 7 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 38000, expenses_budget: 24000, savings_budget: 8000, investment_budget: 6000 },
    { month: '2026-04-01', income: 28000, expenses_budget: 22000, savings_budget: 4000, investment_budget: 2000 },
    { month: '2026-05-01', income: 32000, expenses_budget: 23000, savings_budget: 5500, investment_budget: 3500 },
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
      { user_id: uid, category: 'Vigne', description: 'Produits phytosanitaires (bio certifié) — traitement mildiou printemps', amount: 4800, currency: 'EUR', date: '2026-05-04', payment_method: 'Virement' },
      { user_id: uid, category: 'Vigne', description: 'Engrais et amendement sols — parcelles AOC', amount: 2200, currency: 'EUR', date: '2026-05-06', payment_method: 'Virement' },
      { user_id: uid, category: 'Personnel', description: 'Salaires permanent + charges sociales MSA (mai)', amount: 8400, currency: 'EUR', date: '2026-05-07', payment_method: 'Virement' },
      { user_id: uid, category: 'Emballage', description: 'Bouteilles, capsules, étiquettes (commande trimestrielle)', amount: 3600, currency: 'EUR', date: '2026-05-05', payment_method: 'Chèque' },
      { user_id: uid, category: 'Machinerie', description: 'Entretien tracteur Fendt + pressurage', amount: 1850, currency: 'EUR', date: '2026-05-08', payment_method: 'Virement' },
      { user_id: uid, category: 'Énergie', description: 'EDF Pro (cave vinification + frigories)', amount: 1200, currency: 'EUR', date: '2026-05-03', payment_method: 'Prélèvement' },
      { user_id: uid, category: 'Assurance', description: 'Groupama Viticole — grêle, gel, responsabilité civile', amount: 890, currency: 'EUR', date: '2026-05-01', payment_method: 'Prélèvement' },
      { user_id: uid, category: 'Export', description: 'Frais logistique export USA (container de 2400 cartons)', amount: 2400, currency: 'EUR', date: '2026-05-09', payment_method: 'Virement' },
      { user_id: uid, category: 'Emprunt', description: 'Remboursement prêt Crédit Agricole (cave)', amount: 2850, currency: 'EUR', date: '2026-05-01', payment_method: 'Prélèvement' },
      { user_id: uid, category: 'Gîtes', description: 'Matériaux construction gîtes (œnotourisme)', amount: 3800, currency: 'EUR', date: '2026-05-05', payment_method: 'Virement' },
      { user_id: uid, category: 'Famille', description: 'Allocation Clément études Bordeaux (mensuel)', amount: 800, currency: 'EUR', date: '2026-05-01', payment_method: 'Virement' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Réserve millésime catastrophe', target_amount: 80000, current_amount: 42000, currency: 'EUR', target_date: '2027-01-01', category: 'Emergency', notes: 'Gel d\'avril 2021 a détruit 40% récolte — jamais oublié. Fonds de résilience climatique' },
      { user_id: uid, name: 'Gîtes oenotouristiques (2 unités)', target_amount: 180000, current_amount: 68000, currency: 'EUR', target_date: '2027-06-01', category: 'Business', notes: 'Rénovation dépendances — financement partiellement Crédit Agricole, partiellement fonds propres' },
      { user_id: uid, name: 'Transmission domaine à Clément', target_amount: 50000, current_amount: 18000, currency: 'EUR', target_date: '2030-01-01', category: 'Estate', notes: 'Frais notaire, droits de transmission — conseiller: Maître Bonneau (Saint-Emilion)' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'Millesime BI (logiciel cave)', amount: 89, currency: 'EUR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Vinexpo plateforme adhésion', amount: 45, currency: 'EUR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'La Revue du vin de France (abonnement)', amount: 12, currency: 'EUR', billing_cycle: 'monthly', category: 'Professional', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Wine Cellars of America (USA import)', industry: 'Wine Import', contact_email: 'bordeaux@winecellars.com', monthly_value: 12000, currency: 'EUR', status: 'active', country: 'US' },
      { user_id: uid, name: 'Maisons du Monde Vins (France distribution)', industry: 'Distribution', contact_email: 'achat@maisonsdumondevins.fr', monthly_value: 7500, currency: 'EUR', status: 'active', country: 'FR' },
      { user_id: uid, name: 'Relais & Châteaux Network (CHR)', industry: 'Hospitality', contact_email: 'vins@relaischateaux.com', monthly_value: 4200, currency: 'EUR', status: 'active', country: 'FR' },
    ];
    const { data: cd, error: ce } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', cd, ce);

    if (cd?.length) {
      const invoices = [
        { user_id: uid, client_id: cd[0].id, invoice_number: 'FAC-2026-018', amount: 36000, currency: 'EUR', status: 'paid', issue_date: '2026-04-01', due_date: '2026-04-30', paid_date: '2026-04-22', line_items: [{ description: 'Château du Lac 2023 AOC (2400 cartons × €15)', quantity: 2400, unit_price: 15 }] },
        { user_id: uid, client_id: cd[1].id, invoice_number: 'FAC-2026-019', amount: 22500, currency: 'EUR', status: 'sent', issue_date: '2026-05-01', due_date: '2026-05-31', line_items: [{ description: 'Château du Lac 2022 Réserve + 2023 AOC — mai', quantity: 1, unit_price: 22500 }] },
      ];
      const { data: id, error: ie } = await sb.from('business_invoices').insert(invoices).select();
      ok('business_invoices', id, ie);
    }
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Visite parcelles (tour de vigne matin)', frequency: 'daily', target_count: 1, color: '#84CC16', icon: '🍇' },
      { user_id: uid, name: 'Dégustation barrique + notes', frequency: 'weekly', target_count: 2, color: '#8B5CF6', icon: '🍷' },
      { user_id: uid, name: 'Météo agricole + arrosage (irrigation Ille)', frequency: 'weekdays', target_count: 1, color: '#3B82F6', icon: '🌤️' },
      { user_id: uid, name: 'Chasse ou pêche (détente familiale)', frequency: 'weekly', target_count: 1, color: '#F59E0B', icon: '🎣' },
      { user_id: uid, name: 'Marche vignes avec Sophie', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '🚶' },
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
          if (Math.random() < 0.85) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'business', notes: 'Dossier Cru Bourgeois Exceptionnel — préparation dégustation jury CIVB en juin', completed_at: '2026-05-05T09:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'planning', notes: 'Budget vendanges 2026 — estimation main d\'oeuvre saisonnière, cartons, transport', completed_at: '2026-05-07T10:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'oenotourisme', notes: 'Architecture gîtes — revue plans avec Clément (intégration architecturale château 18ème siècle)', completed_at: '2026-05-09T14:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'Classification Cru Bourgeois Exceptionnel', category: 'Quality', target_date: '2026-09-01', status: 'in_progress', progress: 45, notes: 'Dossier soumis CIVB. Dégustation jury prévue juin 2026. Résultat attendu septembre' },
      { user_id: uid, title: 'Ouverture gîtes oenotouristiques', category: 'Business Diversification', target_date: '2027-06-01', status: 'in_progress', progress: 38, notes: 'Permis accordé. Travaux en cours (75% charpente). Ouverture visée saison vendanges 2027' },
      { user_id: uid, title: 'Première certification AB (Agriculture Biologique)', category: 'Certification', target_date: '2028-01-01', status: 'in_progress', progress: 20, notes: 'Conversion progressive démarrée 2025 — passage total bio en 3 ans (délai réglementaire)' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Vendre une partie du stock 2020 (excellent millésime) maintenant vs attendre?', options: ['Vendre maintenant: 50,000 bouteilles à €18/bt = €900K + liquidité', 'Attendre 2028 (côte Robert Parker +95): valeur potentielle €30/bt = €1.5M', 'Vendre 25% maintenant, garder 75% en cave pour capitalisation'], chosen_option: 'Vendre 25% maintenant, garder 75% en cave pour capitalisation', outcome_notes: 'Liquidité nécessaire pour gîtes et dossier CIVB. 75% en cave = pari sur valorisation. Accord Sophie', decided_at: '2026-04-28T16:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Pierre Dubois seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
