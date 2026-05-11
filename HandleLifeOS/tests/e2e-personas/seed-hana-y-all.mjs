/**
 * Seed: Hana Yamamoto — Retired Elementary School Teacher, Osaka, Japan (JPY)
 * Email: hana.yamamoto@e2e-test.handlelifeos.app
 * Persona #39 — Elderly widowed user, accessibility test persona, public pension, family connection focus
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

const EMAIL = 'hana.yamamoto@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedHanaY() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: '山本花',
    occupation: '元小学校教諭（定年退職） — 大阪市立桜小学校',
    life_stage: 'retired',
    country: 'JP',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    goals: [
      'Stay healthy and independent in own home for as long as possible',
      'See daughter Yuki and grandchildren Haruto and Saki in Tokyo at least 3 times this year',
      'Complete writing the memorial diary of late husband Kenji (goal: finish by his anniversary August 2026)',
      'Learn to use smartphone better — grandson Haruto will teach video calling'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (elderly pension budget — simple categories, JPY scale)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 45000, spent: 42800, currency: 'JPY' },
    { user_id: uid, month: 4, year: 2026, category: 'Health', budgeted: 22000, spent: 18500, currency: 'JPY' },
    { user_id: uid, month: 4, year: 2026, category: 'Utilities', budgeted: 15000, spent: 14200, currency: 'JPY' },
    { user_id: uid, month: 4, year: 2026, category: 'Entertainment', budgeted: 12000, spent: 9600, currency: 'JPY' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 8000, spent: 6500, currency: 'JPY' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 30000, spent: 30000, currency: 'JPY' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 45000, spent: 22000, currency: 'JPY' },
    { user_id: uid, month: 5, year: 2026, category: 'Health', budgeted: 22000, spent: 11000, currency: 'JPY' },
    { user_id: uid, month: 5, year: 2026, category: 'Utilities', budgeted: 15000, spent: 7500, currency: 'JPY' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 30000, spent: 30000, currency: 'JPY' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 18200, currency: 'JPY', category: 'food', description: '食品・日用品 — ライフ天王寺店 (毎週の買い物)', expense_date: '2026-04-05' },
      { user_id: uid, amount: 8500, currency: 'JPY', category: 'health', description: '整形外科 通院（膝の定期診察）— 自己負担2割', expense_date: '2026-04-08' },
      { user_id: uid, amount: 4800, currency: 'JPY', category: 'utilities', description: '電気代 4月分 — 関西電力', expense_date: '2026-04-10' },
      { user_id: uid, amount: 3200, currency: 'JPY', category: 'utilities', description: 'ガス代 4月分 — 大阪ガス', expense_date: '2026-04-10' },
      { user_id: uid, amount: 2200, currency: 'JPY', category: 'utilities', description: 'NHK受信料 (2ヶ月分)', expense_date: '2026-04-12' },
      { user_id: uid, amount: 14600, currency: 'JPY', category: 'food', description: '食品 — ライフ + 近所の野菜直売所', expense_date: '2026-04-19' },
      { user_id: uid, amount: 3800, currency: 'JPY', category: 'entertainment', description: '書道教室 月謝 — 老人センター 4月分', expense_date: '2026-04-22' },
      { user_id: uid, amount: 6500, currency: 'JPY', category: 'transport', description: '東京行き 新幹線往復 (孫・娘宅訪問) — スマートEX 高齢者割引', expense_date: '2026-04-25' },
      { user_id: uid, amount: 5800, currency: 'JPY', category: 'health', description: '内科 定期検診 + 薬代（血圧・コレステロール）', expense_date: '2026-05-02' },
      { user_id: uid, amount: 12400, currency: 'JPY', category: 'food', description: '食品・日用品 — ライフ + コープ宅配', expense_date: '2026-05-07' },
      { user_id: uid, amount: 5800, currency: 'JPY', category: 'entertainment', description: '孫へのお土産 — 大阪土産 (りくろーおじさんのケーキ × 2)', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'NHKラジオ体操 — 毎朝', description: '6時30分のラジオ体操第一・第二。40年以上続けている習慣。身体を動かすことが健康の基本。', frequency: 'daily',
        target_count: 1, current_streak: 28, longest_streak: 180, completed_today: true,
        category: 'health', color: '#10b981', icon: '🌅', reminder_time: '06:25', active: true, created_at: '2025-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: '近所の公園へ散歩 — 30分', description: '天気の良い日は長居公園まで歩く。膝の調子次第だが、できる限り毎日。', frequency: 'daily',
        target_count: 1, current_streak: 12, longest_streak: 40, completed_today: true,
        category: 'health', color: '#3b82f6', icon: '🌸', reminder_time: '09:30', active: true, created_at: '2026-01-10T00:00:00Z'
      },
      {
        user_id: uid, name: '書道教室 — 水曜日午後', description: '老人センターの書道クラス。先生と仲間との時間が一週間のハイライト。', frequency: 'weekly',
        target_count: 1, current_streak: 6, longest_streak: 24, completed_today: false,
        category: 'mental_health', color: '#8b5cf6', icon: '✒️', reminder_time: '13:30', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: '娘・由紀に電話', description: '日曜の夕方に東京の由紀に電話する。孫の晴人と咲の声も聞ける。これが一番楽しみ。', frequency: 'weekly',
        target_count: 1, current_streak: 8, longest_streak: 52, completed_today: false,
        category: 'mental_health', color: '#ec4899', icon: '📞', reminder_time: '17:00', active: true, created_at: '2025-06-01T00:00:00Z'
      },
      {
        user_id: uid, name: '賢治の日記 — 少し書く', description: '亡き夫・賢治の思い出を少しずつ書き留める。8月の命日までに完成させたい。', frequency: 'daily',
        target_count: 1, current_streak: 5, longest_streak: 14, completed_today: false,
        category: 'mental_health', color: '#f59e0b', icon: '📔', reminder_time: '20:00', active: true, created_at: '2026-03-15T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions (simple tasks — writing, accounts)
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 58, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: '賢治の日記 — 4月の章を書く (退職旅行の思い出)',
        notes: '賢治と行った北海道旅行のことを書いた。ラベンダー畑と夕張メロン。よく書けた。',
        started_at: '2026-04-10T20:00:00Z', ended_at: '2026-04-10T20:58:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 45, actual_minutes: 40, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: '4月の家計簿の整理と5月の予算確認',
        notes: '年金の振込みと支出を確認した。健康保険料が少し上がっていた。由紀に相談しよう。',
        started_at: '2026-04-30T10:00:00Z', ended_at: '2026-04-30T10:40:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 30, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'スマートフォンの使い方の練習 — ビデオ通話の設定',
        notes: '途中で操作がわからなくなって止めた。晴人が来た時に教えてもらう方がいい。',
        started_at: '2026-05-04T15:00:00Z', ended_at: '2026-05-04T15:30:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 4, note: '東京から帰ってきた。晴人がもう随分大きくなって。咲はピアノが上手になっていた。由紀は忙しそうだったが元気そうで安心した。', logged_at: '2026-04-28T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: '膝が少し痛い。公園の散歩を半分で帰ってきた。年を取るのはこういうことだと思う。無理はしないように。', logged_at: '2026-04-15T18:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: '書道教室で先生に褒めていただいた。「山本さんの筆使いは心が落ち着いている」と。賢治も喜ぶと思う。', logged_at: '2026-04-22T16:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: '長居公園の藤の花が満開だった。今年も見ることができてよかった。毎年この季節が好きだった賢治を思い出す。', logged_at: '2026-05-05T17:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-22', items: ['書道の先生と教室の仲間たち', '膝が今日は調子よかった', '賢治が選んでくれたこのマンション — 40年住んでも飽きない'] },
    { date: '2026-04-28', items: ['元気に育っている晴人と咲', '由紀が迎えに来てくれたこと', '新幹線で大阪と東京が繋がっていること'] },
    { date: '2026-05-05', items: ['今年も長居公園の藤を見られたこと', '年金があること — 安心して暮らせる', 'こどもの日に孫たちと電話できたこと'] },
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
        user_id: uid, title: '東京の孫たちのこと',
        content: '由紀のところに三泊した。晴人はもう中学生で背が私より高くなった。咲は「おばあちゃん、またLINEビデオで話そうね」と言ってくれた。ビデオ通話の設定がまだうまくできないが、練習しようと思う。由紀が「ここに引っ越してきてもいいよ」と言ってくれた。嬉しかった。でも大阪を離れるのはまだ決められない。賢治との思い出がここにあるから。',
        mood: 5, tags: ['家族', '孫', '東京'], created_at: '2026-04-29T20:00:00Z'
      },
      {
        user_id: uid, title: '大阪に残るか、東京に移るか',
        content: '由紀に誘われるたびに考える。東京に行けば孫たちの顔を毎週見られる。でも40年住んだこの部屋を出ることが、賢治の場所を失うような気がしてしまう。書道教室の仲間も、長居公園も、近所のライフのおばさんも。人は場所と一緒に生きているのかもしれない。もう少し考える。',
        mood: 3, tags: ['決断', '大阪', '東京', '老後'], created_at: '2026-05-03T21:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: '娘・由紀のいる東京に引っ越すか、40年住んだ大阪の自宅に残るか？',
        category: 'Other',
        mode: 'analyze',
        options: [
          { label: '東京・由紀宅近くに引っ越す', pros: ['孫の晴人・咲に毎週会える', '体調が悪い時に由紀がすぐ来られる', '緊急時のサポートが近い'], cons: ['40年住んだ大阪を離れる', '賢治の思い出の場所からの別れ', '書道教室・長居公園・近所の友人と別れる', '東京の家賃は大阪より高い'] },
          { label: '大阪の自宅に残る', pros: ['慣れた場所・慣れた生活リズム', '書道教室・老人センターのコミュニティ', '賢治との思い出が詰まった部屋', '医療費・生活費が東京より低い'], cons: ['娘・孫と会えるのは年に数回', '体調急変時に一人', '近所の友人も高齢になってきた'] }
        ],
        result: { summary: '今すぐ結論を出す必要はない。健康に問題が出たら、その時に由紀と改めて相談する。今は大阪で元気に過ごすことが先決。', chosen: '当面大阪に残る — 健康状態を見ながら再考', outcome: 'pending' },
        favorite: true,
        created_at: '2026-05-03T22:00:00Z'
      }
    ])
  }

  // 11. Investments (lifetime teacher savings — conservative)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'ゆうちょ銀行 通常貯金', type: 'savings', invested_amount: 8200000, current_value: 8200000, currency: 'JPY', account: 'ゆうちょ銀行', notes: '教員生活35年の積み立て貯金。老後の生活費と医療費のために。簡単に下ろせる安心感。', purchase_date: '1990-04-01' },
      { user_id: uid, name: '定額郵便貯金（旧）', type: 'savings', invested_amount: 3500000, current_value: 3745000, currency: 'JPY', account: 'ゆうちょ銀行', notes: '賢治が積み立てた旧定額郵便貯金。満期後もそのまま置いてある。手をつけたくない。', purchase_date: '2001-06-01' },
      { user_id: uid, name: '東芝株式 (6502) — 相続', type: 'stocks', invested_amount: 800000, current_value: 920000, currency: 'JPY', account: '野村証券 (相続口座)', notes: '賢治から相続した株。値動きはわからないが由紀に相談して持ち続けている。配当が年一回来る。', purchase_date: '2022-11-01' },
    ])
  }

  // 12. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: '由紀（娘）', email: 'yamamoto.yuki.1983@gmail.com', phone: '090-1234-5678', group_name: 'Family', notes: '東京・練馬区在住。旦那さんと晴人（中2）・咲（小5）の4人暮らし。毎週日曜夕方に電話。' },
      { user_id: uid, name: '晴人（孫）', email: '', phone: '090-8765-4321', group_name: 'Family', notes: '中学2年生。スマートフォンのビデオ通話を教えてくれる約束をしてくれた。優しい子。' },
      { user_id: uid, name: '田中先生（書道教室）', email: '', phone: '06-1234-5678', group_name: 'Mentors', notes: '老人センター書道クラスの先生。70歳代。毎週水曜13:30。「心が落ち着いている筆使い」と言ってくださった。' },
      { user_id: uid, name: '中村さん（お隣）', email: '', phone: '06-2345-6789', group_name: 'Business', notes: '同じ棟の隣人。同じ年頃。買い物のついでにドアを確認してもらっている。お互い様の関係。' },
    ])
  }

  // 13. Career goals (personal life goals in retirement)
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: '賢治の思い出日記を命日（8月）までに完成', category: 'other',
        description: '2022年に亡くなった夫・賢治との思い出を書き留めている。8月の命日に合わせて完成させ、由紀と晴人・咲に渡したい。',
        target_date: '2026-08-15', status: 'active', progress_pct: 45
      },
      {
        user_id: uid, title: 'ビデオ通話を自分でできるようになる', category: 'skill',
        description: 'LINEビデオ通話を一人で開始できるようにする。晴人に教えてもらう予定。孫たちともっと頻繁に話せるようになりたい。',
        target_date: '2026-07-31', status: 'active', progress_pct: 20
      },
      {
        user_id: uid, title: '今年3回、東京の由紀宅を訪問する', category: 'impact',
        description: '4月は行けた（1回目）。夏休み（8月）と冬（12月）にも行く計画。晴人の部活も応援したい。',
        target_date: '2026-12-31', status: 'active', progress_pct: 33
      },
    ])
  }

  // 14. Trip — Tokyo visit (grandchildren)
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: '東京 — 娘・由紀宅 (練馬区)', country_code: 'JP',
        starts_on: '2026-04-25', ends_on: '2026-04-28',
        purpose: 'leisure', status: 'completed',
        budget_total: 28000, currency: 'JPY',
        notes: '孫・晴人の誕生日に合わせた東京訪問。新幹線は娘が手配してくれた。晴人が駅まで迎えに来てくれた。3泊4日。'
      },
      {
        user_id: uid, destination: '東京 — 娘・由紀宅 (練馬区)', country_code: 'JP',
        starts_on: '2026-08-12', ends_on: '2026-08-16',
        purpose: 'leisure', status: 'planning',
        budget_total: 30000, currency: 'JPY',
        notes: '夏休み訪問。賢治の命日（8月15日）前後。完成した日記を由紀と晴人・咲に渡す予定。4泊5日。'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: '新大阪 → 東京 — 新幹線のぞみ (スマートEX高齢者割引)', starts_at: '2026-04-25T09:00:00Z', ends_at: '2026-04-25T11:30:00Z', cost: 13000, currency: 'JPY', notes: '由紀が予約してくれた。窓側の席。富士山が見えた。' },
        { trip_id: trips[0].id, type: 'activity', title: '晴人の誕生日お祝い — 家族で回転寿司', starts_at: '2026-04-26T17:00:00Z', ends_at: '2026-04-26T19:00:00Z', cost: 5800, currency: 'JPY', notes: '晴人の好きな「くら寿司」練馬店。お祝いに奮発してケーキも注文した。' },
        { trip_id: trips[0].id, type: 'activity', title: '咲のピアノ発表会見学', starts_at: '2026-04-27T14:00:00Z', ends_at: '2026-04-27T16:00:00Z', cost: 0, currency: 'JPY', notes: '咲が「パッヘルベルのカノン」を弾いた。上手になっていた。思わず涙が出た。' },
      ])
    }
  }

  // 15. Meal plans (simple Japanese elderly diet)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'ご飯 + 味噌汁 + 漬物 + 目玉焼き', calories: 420, notes: '毎朝同じ朝食。ラジオ体操のあとで。賢治が好きだった組み合わせ。' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'うどん（きつね）+ 小鉢', calories: 480, notes: '軽めの昼食。膝の具合が悪い日は買い物に行かずコープ宅配を使う。' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: '焼き魚（鯖）+ 小松菜のおひたし + ご飯', calories: 520, notes: '医者に魚を週3回食べるよう言われている。守っている。' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: '書道教室のあとのランチ — 天ぷらそば', calories: 560, notes: '教室仲間と連れだって「更科」へ。水曜の楽しみ。' },
      { user_id: uid, week_start: weekStart, day_of_week: 6, meal_type: 'dinner', recipe_name: '冷奴 + 炊き込みご飯 + 豆腐汁', calories: 400, notes: '土曜は作り置きで過ごす。シンプルが一番。' },
    ])
  }

  console.log('✅ Hana Yamamoto (#39) seeded — JPY, Osaka, retired teacher, widowed, grandchildren connection, accessibility persona')
}

seedHanaY().catch(e => { console.error(e); process.exit(1) })
