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

const EMAIL = 'lea.bernard@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedLea() {
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Léa Bernard',
    occupation: 'Graphiste Indépendante',
    life_stage: 'early_career',
    country: 'FR',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    goals: [
      "Développer un portefeuille de clients premium en design de marque",
      "Plaider pour l'accessibilité des outils de design pour les utilisateurs sourds",
      "Publier un guide open-source sur l'accessibilité visuelle et la signalétique",
      "Atteindre EUR 5 000/mois de revenus freelance d'ici décembre 2026",
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })

  // Budgets
  const budgets = [
    { user_id: uid, month: 5, year: 2026, category: 'rent', amount: 850, spent: 850 },
    { user_id: uid, month: 5, year: 2026, category: 'food', amount: 400, spent: 328 },
    { user_id: uid, month: 5, year: 2026, category: 'utilities', amount: 120, spent: 115 },
    { user_id: uid, month: 5, year: 2026, category: 'entertainment', amount: 80, spent: 55 },
    { user_id: uid, month: 5, year: 2026, category: 'health', amount: 60, spent: 60 },
    { user_id: uid, month: 5, year: 2026, category: 'education', amount: 100, spent: 100 },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // Expenses
  if (await cnt('expenses', uid) < 5) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 850, category: 'rent', description: 'Loyer mai – appartement Lyon 7e', expense_date: '2026-05-01' },
      { user_id: uid, amount: 60.99, category: 'education', description: 'Adobe Creative Cloud mensuel', expense_date: '2026-05-01' },
      { user_id: uid, amount: 38, category: 'food', description: 'Courses Carrefour Lyon Confluence', expense_date: '2026-05-04' },
      { user_id: uid, amount: 55, category: 'entertainment', description: 'CIPA Lyon – cours LSF niveau B2', expense_date: '2026-05-05' },
      { user_id: uid, amount: 15, category: 'transport', description: 'Abonnement TCL mensuel (tarif réduit AAH)', expense_date: '2026-05-02' },
      { user_id: uid, amount: 60, category: 'health', description: 'Consultation audioprothésiste', expense_date: '2026-05-06' },
    ])
  }

  // Habits (French content)
  if (await cnt('habits', uid) < 3) {
    await sb.from('habits').insert([
      { user_id: uid, name: 'Étirements matinaux – 15 min', frequency: 'daily', current_streak: 18, target_streak: 30, started_on: '2026-04-20', category: 'health' },
      { user_id: uid, name: 'Mise à jour du portfolio Behance', frequency: 'weekly', current_streak: 6, target_streak: 12, started_on: '2026-03-15', category: 'work' },
      { user_id: uid, name: 'Veille design – Awwwards + Dribbble (45 min)', frequency: 'daily', current_streak: 24, target_streak: 30, started_on: '2026-04-12', category: 'learning' },
      { user_id: uid, name: 'Réunion client hebdomadaire (visio)', frequency: 'weekly', current_streak: 10, target_streak: 20, started_on: '2026-03-01', category: 'work' },
    ])
  }

  // Focus sessions
  if (await cnt('focus_sessions', uid) < 3) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Charte graphique Confluences – version finale', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T11:00:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 90, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Motion design – animation logo client SNCF Connect', started_at: '2026-05-07T10:00:00Z', ended_at: '2026-05-07T11:30:00Z' },
      { user_id: uid, mode: 'custom', planned_minutes: 60, actual_minutes: 55, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Moodboard direction artistique – projet Maison Beaumont', started_at: '2026-05-06T14:00:00Z', ended_at: '2026-05-06T14:55:00Z' },
    ])
  }

  // Mood logs
  if (await cnt('mood_logs', uid) < 3) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Super journée créative. La charte Confluences validée.', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: 'Journée correcte. Attente des retours client un peu stressante.', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Bonne session de travail. Cours LSF très enrichissant ce soir.', logged_at: '2026-05-07T20:00:00Z' },
    ])
  }

  // Gratitude entries (French)
  const gratitudeDates = [
    { date: '2026-05-09', items: ["Le client Confluences a adoré la direction créative", "Appartement lumineux et calme pour travailler", "Nouveau projet intéressant entrant en juin"] },
    { date: '2026-05-08', items: ["Paiement reçu de SNCF Connect", "Belle météo à Lyon pour la pause déjeuner", "Message d'encouragement d'une amie graphiste"] },
    { date: '2026-05-07', items: ["Cours LSF – progression visible ce soir", "Mon portfolio Behance dépasse 500 appréciations", "Bonne nuit de sommeil réparatrice"] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // Journal entries (French)
  if (await cnt('journal_entries', uid) < 3) {
    await sb.from('journal_entries').insert([
      { user_id: uid, content: "Réunion Teams aujourd'hui avec l'interprète LSF intégré via l'outil de la mairie. Vraiment efficace. Je me souviens du temps où chaque réunion demandait une logistique énorme. Ces outils d'accessibilité changent vraiment la donne pour nous.", mood_tag: 'motivated', created_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, content: "Travaillé sur un article de blog sur les typographies accessibles pour les malentendants — quel paradoxe que moi, graphiste sourde, je doive expliquer aux entendants pourquoi le contraste visuel est vital. Mais c'est important de le dire. Publication prévue vendredi.", mood_tag: 'reflective', created_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, content: "La question agence vs freelance revient souvent. Une agence lyonnaise m'a approchée avec une offre CDI à EUR 3 200 net. Attrayant pour la stabilité. Mais je perdrais la liberté de choisir mes projets. Je vais y réfléchir sérieusement.", mood_tag: 'thoughtful', created_at: '2026-05-05T21:00:00Z' },
    ])
  }

  // Decision logs
  if (await cnt('decision_logs', uid) < 1) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Rejoindre une agence créative en CDI ou rester freelance ?',
        options: JSON.stringify([
          { label: 'CDI en agence (Agence Lumina Lyon)', pros: ['Stabilité EUR 3 200/mois', 'Équipe et stimulation sociale', 'Pas de prospection'], cons: ['Perte de liberté créative', 'Revenus plafonnés', 'Horaires fixes'] },
          { label: 'Rester freelance', pros: ['Autonomie totale', 'Revenus potentiels EUR 4 800+/mois', 'Projets choisis'], cons: ['Variabilité des revenus', 'Prospection chronophage', 'Isolement possible'] },
        ]),
        result: JSON.stringify({ decision: 'Rester freelance 12 mois supplémentaires', reasoning: "L'AAH de EUR 971/mois assure un filet de sécurité. Les revenus freelance ont augmenté de 40% en 6 mois. Réévaluation en mai 2027." }),
        mode: 'compare',
        favorite: true,
      },
    ])
  }

  // Business clients (freelance)
  if (await cnt('business_clients', uid) < 2) {
    const { data: client1 } = await sb.from('business_clients').insert({
      user_id: uid, name: 'Confluences Développement', email: 'contact@confluences-dev.fr',
      company: 'Confluences Développement', currency: 'EUR',
      notes: 'Projet identité visuelle quartier Lyon Confluence. Relation de 6 mois.',
    }).select().single()

    const { data: client2 } = await sb.from('business_clients').insert({
      user_id: uid, name: 'SNCF Connect Design', email: 'design@sncf-connect.fr',
      company: 'SNCF Connect', currency: 'EUR',
      notes: 'Animation logo + motion design pour campagne printemps 2026.',
    }).select().single()

    if (client1) {
      await sb.from('business_projects').insert({
        user_id: uid, client_id: client1.id, title: 'Charte graphique Confluences 2026',
        status: 'completed', fee: 3200,
        notes: 'Livraison validée mai 2026. À relancer pour suite en septembre.',
      })
    }
    if (client2) {
      await sb.from('business_projects').insert({
        user_id: uid, client_id: client2.id, title: 'Motion design – Logo animé SNCF Connect',
        status: 'active', fee: 1800,
        notes: 'En cours – livraison prévue 15 juin 2026.',
      })
    }
  }

  // Contacts
  if (await cnt('contacts', uid) < 2) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Mathilde Roux', group_name: 'Client', email: 'mathilde.roux@confluences-dev.fr', notes: 'Directrice artistique Confluences. Contact fiable, bon payeur.' },
      { user_id: uid, name: 'Thomas Girard', group_name: 'Réseau professionnel', notes: 'Graphiste freelance Lyon, conseils sur facturation et prospection.' },
      { user_id: uid, name: 'ARPEDA Lyon', group_name: 'Association', notes: 'Association de soutien aux personnes sourdes en emploi. Contact pour droits AAH.' },
    ])
  }

  // Career goals
  if (await cnt('career_goals', uid) < 2) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Atteindre EUR 5 000/mois de CA freelance', category: 'income', status: 'active', target_date: '2026-12-31', progress_pct: 65, notes: 'CA actuel EUR 3 800/mois. Objectif 3 clients premium simultanés.' },
      { user_id: uid, title: 'Paris Design Week – présentation portfolio', category: 'impact', status: 'active', target_date: '2026-09-15', progress_pct: 20, notes: 'Candidature déposée. Réponse attendue fin juin 2026.' },
    ])
  }

  // Trip
  if (await cnt('trips', uid) < 1) {
    const { data: trip } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'Paris',
      country: 'FR',
      starts_on: '2026-09-12',
      ends_on: '2026-09-15',
      budget_total: 600,
      status: 'planning',
      purpose: 'conference',
      notes: 'Paris Design Week — interprète LSF réservé pour les conférences. Portfolio sur écran tactile.',
    }).select().single()

    if (trip) {
      await sb.from('trip_items').insert([
        { trip_id: trip.id, user_id: uid, type: 'transport', title: 'TGV Lyon–Paris (siège réservé côté couloir)', starts_at: '2026-09-12T07:30:00Z', ends_at: '2026-09-12T09:15:00Z', cost: 85 },
        { trip_id: trip.id, user_id: uid, type: 'hotel', title: 'Hôtel Ibis Paris 14e', starts_at: '2026-09-12T14:00:00Z', ends_at: '2026-09-15T11:00:00Z', cost: 310 },
        { trip_id: trip.id, user_id: uid, type: 'activity', title: 'Paris Design Week – présentation portfolio (avec interprète LSF)', starts_at: '2026-09-13T14:00:00Z', ends_at: '2026-09-13T16:00:00Z', cost: 0 },
      ])
    }
  }

  console.log('✓ Léa Bernard seeded')
}
seedLea().catch(e => { console.error(e); process.exit(1) })
