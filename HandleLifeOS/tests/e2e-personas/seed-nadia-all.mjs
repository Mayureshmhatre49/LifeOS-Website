/**
 * Seed: Nadia Kovács — CBT/ACT Psychotherapist (Private Practice), Budapest, Hungary (HUF)
 * Email: nadia.kovacs@e2e-test.handlelifeos.app
 * Persona #35 — Private clinic, EAP corporate contracts, HUF inflation anxiety, mental health advocacy
 */

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

const EMAIL = 'nadia.kovacs@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedNadia() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Nadia Kovács',
    occupation: 'Pszichoterapeuta & CBT/ACT Klinikai Pszichológus — magánpraxis',
    life_stage: 'mid_career',
    country: 'HU',
    currency: 'HUF',
    timezone: 'Europe/Budapest',
    goals: [
      'Publish CBT workbook on anxiety management in Hungarian — manuscript due Q4 2026',
      'Become certified ACT supervisor — complete 40-hour supervision training',
      'Expand EAP contracts to 3 corporate clients — currently 1 (MOL Group)',
      'Build HUF-inflation-proof savings: 30% in EUR-denominated assets by end 2026'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 285000, spent: 285000, currency: 'HUF' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 130000, spent: 118000, currency: 'HUF' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 40000, spent: 35000, currency: 'HUF' },
    { user_id: uid, month: 4, year: 2026, category: 'Health', budgeted: 80000, spent: 72000, currency: 'HUF' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 150000, spent: 138000, currency: 'HUF' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 400000, spent: 400000, currency: 'HUF' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 285000, spent: 142500, currency: 'HUF' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 130000, spent: 62000, currency: 'HUF' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 150000, spent: 68000, currency: 'HUF' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 400000, spent: 400000, currency: 'HUF' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 285000, currency: 'HUF', category: 'rent', description: 'Lakbér — Ferencváros 2BR, április 2026', expense_date: '2026-04-01' },
      { user_id: uid, amount: 48000, currency: 'HUF', category: 'misc', description: 'Szakmai szupervízió — havi 4 alkalom (ACT szuperviziós csoport)', expense_date: '2026-04-03' },
      { user_id: uid, amount: 82000, currency: 'HUF', category: 'health', description: 'Saját terápia — havi 4 ülés @ HUF 20.500 (Balázs terapeutánál)', expense_date: '2026-04-05' },
      { user_id: uid, amount: 52000, currency: 'HUF', category: 'food', description: 'Bevásárlás — Auchan + Spar + piac, egy hét', expense_date: '2026-04-08' },
      { user_id: uid, amount: 28000, currency: 'HUF', category: 'transport', description: 'BKK bérlet (havi) + Bolt fuvarok kliensmegbeszélésekhez', expense_date: '2026-04-10' },
      { user_id: uid, amount: 42000, currency: 'HUF', category: 'misc', description: 'Szakkönyvek — ACT & CFT kézikönyvek, Libri rendelés', expense_date: '2026-04-14' },
      { user_id: uid, amount: 66000, currency: 'HUF', category: 'food', description: 'Bevásárlás + két éttermi vacsora (baráti összejövetelek)', expense_date: '2026-04-22' },
      { user_id: uid, amount: 285000, currency: 'HUF', category: 'rent', description: 'Lakbér — Ferencváros, május 2026', expense_date: '2026-05-01' },
      { user_id: uid, amount: 36000, currency: 'HUF', category: 'misc', description: 'CBT munkafüzet — ISBN regisztráció + szerzői jogi tanácsadás', expense_date: '2026-05-04' },
      { user_id: uid, amount: 120000, currency: 'HUF', category: 'health', description: 'Kardiológiai magánvizsgálat + labor (stressz-vizsgálat, megelőzés)', expense_date: '2026-05-07' },
      { user_id: uid, amount: 45000, currency: 'HUF', category: 'food', description: 'Bevásárlás + lunch workshop vendégekkel', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Saját terápia + szupervízió', description: 'Minden jó terapeuta saját terápiában van. Heti ülés Balázssal csütörtökönként.', frequency: 'weekly',
        target_count: 1, current_streak: 18, longest_streak: 52, completed_today: false,
        category: 'mental_health', color: '#8b5cf6', icon: '🧠', reminder_time: '16:00', active: true, created_at: '2025-09-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Ülések dokumentálása — notes naprakészen', description: 'Minden ülés után 10 perc kliensnapló. Etikai kötelezettség és jó praxis.', frequency: 'daily',
        target_count: 1, current_streak: 22, longest_streak: 60, completed_today: true,
        category: 'work', color: '#10b981', icon: '📝', reminder_time: '18:30', active: true, created_at: '2026-01-05T00:00:00Z'
      },
      {
        user_id: uid, name: 'Heti olvasás — szakirodalom', description: 'Legalább 30 oldal szakirodalom hetente. ACT, séma terápia, EMDR. Naprakész maradni.', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 24, completed_today: false,
        category: 'learning', color: '#f59e0b', icon: '📚', reminder_time: '20:00', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Reggeli séta — Kopaszi-gát', description: 'Napi 30 perces gyaloglás a Dunánál. A legjobb módszer a munkából való kilépésre.', frequency: 'daily',
        target_count: 1, current_streak: 14, longest_streak: 35, completed_today: true,
        category: 'health', color: '#3b82f6', icon: '🚶', reminder_time: '07:30', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Havi pénzügyi összefoglaló', description: 'Számlák, megtakarítás, befektetések — minden hónap 1-jén áttekintés. HUF infláció figyelése.', frequency: 'monthly',
        target_count: 1, current_streak: 4, longest_streak: 14, completed_today: false,
        category: 'finance', color: '#ec4899', icon: '📊', reminder_time: '10:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 176, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'CBT munkafüzet — 3. fejezet: szorongás és kognitív torzítások (kézirat)',
        notes: 'Megírtam a kognitív torzítások fejezetének főbb részeit. 12 oldal nettó. A munkafüzet 60% kész. A kiadó decemberi deadline reális.',
        started_at: '2026-04-09T09:00:00Z', ended_at: '2026-04-09T11:56:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'MOL Group EAP megújítási proposal — 2026/27 szerződés feltételek',
        notes: 'MOL HR-nek elküldve: 120 ülés/év, HUF 13.500/ülés (8% emelés), kibővített csoportos workshop csomag. Tárgyalás jövő héten.',
        started_at: '2026-04-16T14:00:00Z', ended_at: '2026-04-16T16:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 45, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'ACT szuperviziós képzés — online modulok 5-6 (ACBS Hungary)',
        notes: 'Abbahagyta 45 percnél — sürgős ügyeleti hívás krízis klienstől. Folytatta másnap.',
        started_at: '2026-04-24T20:00:00Z', ended_at: '2026-04-24T20:45:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 122, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'ELTE adjunktusi pozíció mérlegelése — pros/cons elemzés és anyagi számítás',
        notes: 'Az ELTE ajánlat HUF 580K/hó bruttó + 25 kliensóra kiesés. Nettó egyenleg: -HUF 240K/hó a jelenlegi praxishoz képest. Anyagilag nem éri meg.',
        started_at: '2026-05-05T10:00:00Z', ended_at: '2026-05-05T12:02:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 3, note: 'Tele hét — 28 ülés. Minőség megvolt, de fizikailag kimerült vagyok. Az öngondoskodás nem luxus, ez a szakma feltétele.', logged_at: '2026-04-11T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 4, note: 'MOL HR visszajelzett: elfogadták a 8%-os díjemelést! 120 ülés/év EAP szerződés megújítva. Stabilitás.', logged_at: '2026-04-20T18:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Krízis kliens hívása este 8-kor megborította a határaimat. Holnap Balázssal megbeszélem — pont ezért van szupervízió.', logged_at: '2026-04-24T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Az ELTE ajánlatot udvariasan visszautasítottam. Praxisom fontosabb. Jó döntés — érzem a megkönnyebbülést.', logged_at: '2026-05-06T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 5, note: 'A munkafüzet 60%-nál jár. Balázs azt mondta a mai ülésen: látszik, hogy az írás boldoggá tesz. Igaza van.', logged_at: '2026-05-10T21:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-11', items: ['28 ember bízta rám a lelkét ezen a héten', 'A szupervíziós csoport, aki érteni véli a nehéz eseteket', 'Ez a munka — a legjobb ami velem történhetett'] },
    { date: '2026-04-20', items: ['MOL megújítás — pénzügyi stabilitás legalább egy évre', 'A saját terápiám, ami megtart', 'Budapest — a Duna, ami mindig meggyógyít egy reggeli sétán'] },
    { date: '2026-05-10', items: ['A munkafüzet, ami talán valaki életét könnyebbé teszi majd', 'Balázs, a terapeutám, aki visszatükrözi azt amit nem látok magamban', 'Az olvasók, akikért a könyv íródik'] },
  ]
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('date', gd.date)
    if (!count) await sb.from('gratitude_entries').insert({ user_id: uid, date: gd.date, items: gd.items })
  }

  // 9. Journal entries
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      {
        user_id: uid, title: 'Az ELTE Ajánlat — Miért Mondtam Nemet',
        content: 'Az adjunktusi pozíció presztízsét nem kérdőjelezem meg. De a számok egyértelműek: HUF 580K bruttó akademiai fizetés vs. jelenlegi nettó HUF 1.200K. Ráadásul 25 kliens kiesne. Az akadémia vonzott volna húsz évvel ezelőtt. Most a praxis az otthon. A "nem" mondás is döntés — és ez jó döntés volt.',
        mood: 4, tags: ['döntés', 'karrier', 'határok'], created_at: '2026-05-06T22:00:00Z'
      },
      {
        user_id: uid, title: 'A Klienshatárok Paradoxona',
        content: 'A krízishívás este nyolckor megrendítette a határ-struktúrámat. Válaszoltam. Kellett. De aztán egész éjjel ébren voltam. Balázs ma megkérdezte: "Mikor volt utoljára határ, amit nem léptél át magadnak?" Nem tudtam válaszolni. A könyv negyedik fejezete éppen a határokról szól. Időszerű.',
        mood: 3, tags: ['önismeret', 'határok', 'szakma'], created_at: '2026-04-25T07:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Elfogadjam-e az ELTE adjunktusi pozíciót (pszichológia tanszék), vagy maradjak kizárólag a magánpraxisnál?',
        category: 'Career',
        mode: 'compare',
        options: [
          { label: 'ELTE adjunktusi pozíció', pros: ['Akadémiai presztízs és publikációs lehetőségek', 'Hallgatók mentorálása — generatív munka', 'Stabil állami nyugdíj hozzájárulás'], cons: ['HUF 580K bruttó vs. jelenlegi HUF 1.4M nettó bevétel', '25 kliensóra kiesik — HUF 375K/hó veszteség', 'Bürokratikus akadémiai rendszer, kevesebb klinikal munka'] },
          { label: 'Maradás magánpraxisnál', pros: ['Teljes autonómia — saját esetek, saját módszerek', 'Magasabb jövedelem — HUF 1.2-1.5M/hó', 'Könyvírásra és EAP bővítésre marad energia'], cons: ['Nincs akadémiai háttér biztonsága', 'Izolációs kockázat — peer community ritkább', 'Nincs fizetett szabadság és betegszabadság'] }
        ],
        result: { summary: 'Pénzügyileg egyértelmű: magánpraxis HUF 240K+/hó előnnyel. Szakmailag: az EAP bővítés és a könyv biztosít peer jelenléttet akadémia nélkül is. ELTE visszautasítva.', chosen: 'Magánpraxis — ELTE visszautasítva', outcome: 'decided' },
        favorite: true,
        created_at: '2026-05-05T12:00:00Z'
      },
      {
        user_id: uid,
        question: 'Emeljem-e az egyéni terápiás díjat HUF 15.000-ről HUF 18.000-re januártól, figyelembe véve az infláció hatásait?',
        category: 'Finance',
        mode: 'analyze',
        options: [
          { label: 'Díjemelés HUF 18.000-re (20% emelés)', pros: ['Infláció kompenzálása (HUF 8.1% 2025)', 'Évi HUF 1.8M+ bevételnövekedés (25 kliens)', 'Piaci átlaggal való igazodás (Budapest magán HUF 16-22K)'], cons: ['Néhány alacsonyabb jövedelmű kliens elvesztése', 'Átmeneti ügyfél-elégedetlenség', 'Átlátható kommunikáció szükséges'] },
          { label: 'Díj változatlan HUF 15.000', pros: ['Klienshűség megőrzése', 'Nincs váltási kockázat'], cons: ['Reálbevétel csökken inflációval', 'Piaci alulpozicionálás', 'Hosszú távon fenntarthatatlan'] }
        ],
        result: { summary: 'Díjemelés januártól HUF 18.000-re indokolt és piaci szinten igazolt. Kommunikáció: 3 hónappal előre jelzett, indokolt, méltányos átmeneti díj opció új klienseknek.', chosen: 'Díjemelés HUF 18.000-re január 2027-től', outcome: 'pending' },
        favorite: false,
        created_at: '2026-04-18T11:00:00Z'
      }
    ])
  }

  // 11. Investments (HUF-inflation-conscious strategy)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'MÁP Plusz — Magyar Állampapír (5 éves)', type: 'bonds', invested_amount: 4500000, current_value: 4950000, currency: 'HUF', account: 'OTP Bank ÁKK', notes: 'Kamatozó állampapír 4.95% fix. HUF-ban denominált — inflációs kockázat tudatos. Lejárat 2028.', purchase_date: '2023-06-01' },
      { user_id: uid, name: 'Erste Duett Alapok — MSCI World index', type: 'etf', invested_amount: 2800000, current_value: 3350000, currency: 'HUF', account: 'Erste Befektetési Zrt', notes: 'EUR-denominált index alap HUF-on keresztül. Részleges deviza fedezet az infláció ellen.', purchase_date: '2022-03-01' },
      { user_id: uid, name: 'OTP Raiffeisen lekötött betét — EUR', type: 'savings', invested_amount: 1200000, current_value: 1248000, currency: 'HUF', account: 'Raiffeisen Bank', notes: 'EUR lekötés HUF-ban számontartva. 4.1% EUR betéti kamat. Deviza diverzifikáció.', purchase_date: '2024-09-01' },
      { user_id: uid, name: 'NYESZ (Nyugdíj-Előtakarékossági Számla) — vegyes', type: 'other', invested_amount: 3200000, current_value: 3580000, currency: 'HUF', account: 'OTP Bank NYESZ', notes: 'Adókedvezményes nyugdíjszámla. Évi HUF 280K befizetés → szja-visszatérítés. Vegyes részvény-kötvény.', purchase_date: '2020-01-01' },
    ])
  }

  // 12. Business clients (EAP + peer training)
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'MOL Group — HR Wellbeing', email: 'hr.wellbeing@mol.hu', company: 'MOL Nyrt', notes: 'EAP szerződés: 120 ülés/év, HUF 13.500/ülés. MOL dolgozóknak ingyenes rövid terápia (6+6 ülés). Megújítva 2026/27.', currency: 'HUF' },
      { user_id: uid, name: 'Magyar Telekom — People & Culture', email: 'people@telekom.hu', company: 'Magyar Telekom Nyrt', notes: 'Prospektív EAP kliens. Ajánlat beadva április 2026. Döntés várható júniusban. 80+ dolgozó, burnout fókusz.', currency: 'HUF' },
      { user_id: uid, name: 'ELTE PPK — Továbbképzési Iroda', email: 'tovabbkepzes@ppk.elte.hu', company: 'ELTE PPK', notes: 'CBT workshop vendégelőadó — 2x/év, 1 napos tréning pszichológus hallgatóknak. HUF 85.000/nap.', currency: 'HUF' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'MOL EAP 2026/27 — éves üléscsomag', status: 'active', fee: 1620000, currency: 'HUF', notes: '120 ülés × HUF 13.500 = HUF 1.620.000 szerződéses érték. Havi allokáció: 10 ülés. Rugalmas beosztás MOL HR igény szerint.', due_date: '2027-03-31' },
        { user_id: uid, client_id: clients[1].id, name: 'Magyar Telekom EAP — ajánlat', status: 'proposal', fee: 1800000, currency: 'HUF', notes: 'Ajánlat: 100 ülés/év + 2 csoportos burnout-megelőzés workshop (HUF 150K/workshop). Döntés júniusban.', due_date: '2026-06-30' },
        { user_id: uid, client_id: clients[2].id, name: 'ELTE PPK — CBT alapok tréning (2026 ősz)', status: 'active', fee: 85000, currency: 'HUF', notes: 'Egész napos workshop november 15. Témák: kognitív modell, gondolatnaplók, BCE technika. 25 résztvevő.', due_date: '2026-11-15' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Balázs Fekete', email: 'fekete.balazs@pszichologus.hu', phone: '+36301234567', group_name: 'Mentors', notes: 'Saját terapeutám. Gestalt + perszonközpontú megközelítés. Csütörtönként 16:00. Emberileg és szakmailag meghatározó.' },
      { user_id: uid, name: 'Horváth Eszter', email: 'horvath.eszter@mol.hu', phone: '+36204567890', group_name: 'Business', notes: 'MOL Group HR Wellbeing Manager. EAP kapcsolattartó. Gyors, korrekt, empatikus HR-es. Megbízható partner.' },
      { user_id: uid, name: 'Dr. Varga Péter', email: 'varga.peter@acbshungary.hu', phone: '+36303334444', group_name: 'Mentors', notes: 'ACBS Hungary elnök. ACT szuperviziós képzésem koordinátora. Kulcsember a hazai ACT közösségben.' },
      { user_id: uid, name: 'Anya — Kovács Mária', email: '', phone: '+36701112222', group_name: 'Family', notes: 'Pécsett él. Büszke rám de aggódik a "túl sok munkán". Vasárnap esténként hívom.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'CBT szorongás-munkafüzet kézirata — kiadói leadás', category: 'impact',
        description: 'Kézirat 60% kész. Kiadó (Oriold & Társai) decemberi deadline. 12 fejezet, 180 oldal tervezett. ISBN ügyek rendezve.',
        target_date: '2026-12-15', status: 'active', progress_pct: 60
      },
      {
        user_id: uid, title: 'ACT szupervizori minősítés (ACBS Hungary)', category: 'skill',
        description: '40 szuperviziós óra szükséges. Eddig 28 elvégezve. Vizsgabemutató szupervíziós ülés szükséges a tanúsítványhoz.',
        target_date: '2026-10-31', status: 'active', progress_pct: 70
      },
      {
        user_id: uid, title: 'Magyar Telekom EAP szerződés megnyerése', category: 'income',
        description: 'A második EAP kliens stabilizálná a bevételt. HUF 1.8M értékű éves szerződés. Ajánlat beadva, döntés júniusban.',
        target_date: '2026-07-01', status: 'active', progress_pct: 40
      },
      {
        user_id: uid, title: 'EUR-denomintált eszközök aránya 30%-ra növelni', category: 'income',
        description: 'HUF infláció elleni védekezés. Erste MSCI World + Raiffeisen EUR betét bővítése. Jelenlegi deviza arány: ~18%.',
        target_date: '2026-12-31', status: 'active', progress_pct: 18
      },
    ])
  }

  // 15. No trips for Nadia — homebased practice. Add a conference.
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Vienna, Austria', country_code: 'AT',
        starts_on: '2026-07-02', ends_on: '2026-07-05',
        purpose: 'business', status: 'booked',
        budget_total: 280000, currency: 'HUF',
        notes: 'ACBS World Conference 2026. ACT szuperviziós workshopok. Networking a nemzetközi ACT közösséggel. Poster prezentáció: CBT+ACT integráció szorongásnál.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'Budapest Keleti → Wien Hauptbahnhof — Railjet', starts_at: '2026-07-02T07:25:00Z', ends_at: '2026-07-02T09:55:00Z', cost: 32000, currency: 'HUF', notes: '2,5 óra. Eurorail kedvezménnyel. Kényelmes, vonaton is lehet dolgozni.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Hotel Ibis Wien Messe — 3 éj', starts_at: '2026-07-02T15:00:00Z', ends_at: '2026-07-05T11:00:00Z', cost: 96000, currency: 'HUF', notes: 'U2 megállóval a konferencia helyszínétől. Reggelivel.' },
        { trip_id: trips[0].id, type: 'activity', title: 'ACBS World Conference — 3 napos részvétel', starts_at: '2026-07-03T08:00:00Z', ends_at: '2026-07-05T17:00:00Z', cost: 120000, currency: 'HUF', notes: 'Regisztráció HUF 120K. Poster: "CBT és ACT integráció általánosított szorongásnál". Szuperviziós workshop: Russ Harris.' },
      ])
    }
  }

  // 16. Meal plans
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Zab zabpehellyel + banán + fekete kávé', calories: 420, notes: 'Gyors reggelizenés 8 előtt — 9-kor első kliens' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Csirkés wrap + görög joghurt', calories: 580, notes: 'Ebédszünet 13-14 között — 5 perc a Kálvin téri Subway-nél' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Zöldségleves + kenyér + sajt', calories: 460, notes: 'Könnyű vacsora — ülések után fáradtan nem kell sokat főzni' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'breakfast', recipe_name: 'Rántotta + pirítós + paradicsom', calories: 480, notes: 'Szupervízió napja — kicsit több energia kell' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'dinner', recipe_name: 'Étteremlátogatás — Baraka Budapest, 2 főétel', calories: 750, notes: 'Péntek este — kolléganővel, heti levezetés' },
    ])
  }

  console.log('✅ Nadia Kovács (#35) seeded — HUF, Budapest, CBT/ACT psychotherapist, EAP, ACBS conference')
}

seedNadia().catch(e => { console.error(e); process.exit(1) })
