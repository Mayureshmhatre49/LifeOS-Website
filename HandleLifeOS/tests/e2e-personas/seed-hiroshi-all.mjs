/**
 * Seed: Hiroshi Nakamura — VP Operations (Electronics Conglomerate), Tokyo, Japan (JPY)
 * Email: hiroshi.nakamura@e2e-test.handlelifeos.app
 * Persona #12 — 52yo, married, son Kenji (17) targeting Tokyo University, large investment portfolio
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL        = 'hiroshi.nakamura@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Hiroshi Nakamura (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    id: uid,
    display_name: '中村 浩',
    occupation: '取締役副社長（VP Operations）— 中村電子グループ株式会社',
    life_stage: 'mid_career',
    country: 'JP',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    goals: [
      '息子ケンジの東京大学合格をサポートする（2027年3月）',
      '60歳での早期退職に向けて投資ポートフォリオを¥3億に拡大する',
      '後継者育成：2026年度末までに後任VP候補を育成する',
      'NISA枠を毎年満額活用し資産形成を加速する',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact',       key: 'employment',          value: 'VP Operations at Nakamura Electronics Group KK. Annual compensation: ¥28M base + ¥8M annual bonus. 30 years at the company. Minato-ku, Tokyo HQ.', confidence: 98 },
      { user_id: uid, type: 'fact',       key: 'family',              value: 'Married to Yoko (primary school teacher, retired). Son Kenji, 17, targeting Tokyo University (Todai) engineering faculty. Live in Minato-ku apartment (owned, no mortgage).', confidence: 95 },
      { user_id: uid, type: 'fact',       key: 'investment_portfolio', value: 'Total portfolio: ~¥180M. Breakdown: TSE stocks ¥85M, NISA growth fund ¥35M, iDeCo ¥28M, company stock plan ¥22M, JGB bonds ¥10M.', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'lifestyle',           value: 'Minato-ku lifestyle: golf at Tokyo Yomiuri Country Club, sake at Ginza bar with colleagues, Keio Plaza member. Annual family trip to Hawaii or Kyoto.', confidence: 85 },
      { user_id: uid, type: 'goal',       key: 'retirement_plan',     value: 'Retire at 60 (2034). Target ¥300M portfolio + pension income. Already eligible for full corporate pension at 60.', confidence: 92 },
      { user_id: uid, type: 'fact',       key: 'kenji_education',     value: 'Kenji attends top juku (exam prep school) for Todai entrance. Monthly juku fees: ¥120,000. 2027 entrance exam target: Tokyo University Engineering Department.', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'financial_approach',  value: 'Conservative but thorough investor. Prefers SBI Securities and Nomura for stock trades. Monthly iDeCo max contribution ¥23,000. NISA ¥1,800,000/year.', confidence: 88 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: 3, year: 2026, monthly_income: 2300000, savings_target: 800000, currency: 'JPY' },
    { month: 4, year: 2026, monthly_income: 2300000, savings_target: 800000, currency: 'JPY' },
    { month: 5, year: 2026, monthly_income: 2300000, savings_target: 900000, currency: 'JPY' },
  ];
  for (const bm of budgetMonths) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('month', bm.month).eq('year', bm.year);
    if (!count) { const { data, error } = await sb.from('budgets').insert({ user_id: uid, ...bm }).select(); ok(`budget ${bm.month}/${bm.year}`, data, error); }
  }

  if (await cnt('expenses', uid) === 0) {
    const expenses = [
      { category: 'bills',         amount: 85000,  description: '東京電力 + 水道代 + NHK受信料 (マンション管理費込み)',    expense_date: '2026-05-01', is_recurring: true  },
      { category: 'food',          amount: 280000, description: '食費合計 — 西友スーパー + 銀座日本料理店 + 接待費一部',   expense_date: '2026-05-05', is_recurring: false },
      { category: 'entertainment', amount: 180000, description: '東読カントリークラブ — 月会費 + グリーンフィー3回',       expense_date: '2026-05-03', is_recurring: true  },
      { category: 'kids',          amount: 120000, description: 'ケンジ塾費 (東大受験専門塾・代々木)',                      expense_date: '2026-05-01', is_recurring: true  },
      { category: 'travel',        amount: 45000,  description: '新幹線 + タクシー代 (大阪・名古屋出張)',                   expense_date: '2026-05-08', is_recurring: false },
      { category: 'health',        amount: 35000,  description: '人間ドック (慶應義塾病院) — 年次健康診断',                expense_date: '2026-05-06', is_recurring: false },
      { category: 'shopping',      amount: 95000,  description: '洋服 (伊勢丹メンズ) — スーツ・ワイシャツ補充',           expense_date: '2026-05-09', is_recurring: false },
      { category: 'bills',         amount: 22000,  description: 'SoftBank光 + スマホ2台 (夫婦)',                           expense_date: '2026-05-03', is_recurring: true  },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses.map(e => ({ user_id: uid, currency: 'JPY', ...e }))).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'ケンジ大学費用 (東大4年 + 大学院)',            category: 'education',     target_amount: 10000000, current_amount: 6200000, currency: 'JPY', target_date: '2027-04-01' },
      { user_id: uid, title: '早期退職資産 ¥300M達成 (60歳)',                 category: 'retirement',    target_amount: 300000000, current_amount: 180000000, currency: 'JPY', target_date: '2034-03-31' },
      { user_id: uid, title: '家族ハワイ旅行 (2026年夏)',                      category: 'travel',        target_amount: 1500000, current_amount: 950000, currency: 'JPY', target_date: '2026-08-15' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'トヨタ自動車 (7203) 株式',       type: 'stock',       invested_amount: 25000000, current_value: 31200000, currency: 'JPY', account: 'SBI証券', notes: '長期保有。配当利回り2.8%。2,000株保有' },
      { user_id: uid, name: '任天堂 (7974) 株式',              type: 'stock',       invested_amount: 18000000, current_value: 22400000, currency: 'JPY', account: 'SBI証券', notes: '500株。Switch後継機サイクルに期待' },
      { user_id: uid, name: 'eMAXIS Slim 全世界株式 (NISA)',   type: 'mutual_fund', invested_amount: 30000000, current_value: 35200000, currency: 'JPY', account: 'SBI証券 NISA', notes: 'NISA成長投資枠。月15万積立' },
      { user_id: uid, name: 'iDeCo — 三菱UFJ DCバランスファンド', type: 'mutual_fund', invested_amount: 22000000, current_value: 27800000, currency: 'JPY', account: '野村証券 iDeCo', notes: '月23,000円上限拠出。60歳受取予定' },
      { user_id: uid, name: '中村電子グループ 社員持株会',      type: 'stock',       invested_amount: 20000000, current_value: 22500000, currency: 'JPY', account: '中村電子持株会', notes: '奨励金10%加算。毎月5万拠出' },
      { user_id: uid, name: '個人向け国債 (変動10年)',           type: 'bond',        invested_amount: 10000000, current_value: 10350000, currency: 'JPY', account: '野村証券', notes: '安全資産枠。0.5%変動利付。2031年満期' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: '6時起床 — ラジオ体操 + 日経新聞チェック', icon: '📰', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: '株式・投資ポートフォリオ確認 (SBI証券アプリ)', icon: '📈', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: '週末ゴルフ練習 (打ちっぱなし or ラウンド)',    icon: '⛳', color: 'sky',    frequency: 'weekly',   days_of_week: [6], target_per_day: 1 },
      { user_id: uid, name: 'ケンジ学習進捗確認 (週次)',                     icon: '📚', color: 'amber',  frequency: 'weekly',   days_of_week: [0], target_per_day: 1 },
      { user_id: uid, name: '夕食後ウォーキング 30分',                       icon: '🚶', color: 'teal',   frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
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
          if (h.frequency === 'weekly' && dow !== DOW[h.days_of_week[0]]) continue;
          if (Math.random() < 0.85) logs.push({ user_id: uid, habit_id: h.id, date, count: 1 });
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: '後継者VP育成 — 2026年度末までに後任候補確定',  category: 'role',     target_date: '2027-03-31', status: 'active', progress_pct: 40, description: '部長クラス2名が候補。6ヶ月のシャドーイングプログラム設計中。' },
      { user_id: uid, title: '取締役会プレゼン — 2027年度事業戦略承認',       category: 'impact',   target_date: '2026-11-30', status: 'active', progress_pct: 25, description: '生成AI活用による製造コスト15%削減提案。CFOと財務モデル共同作成中。' },
      { user_id: uid, title: '早期退職資産¥300M達成 (60歳)',                   category: 'income',   target_date: '2034-03-31', status: 'active', progress_pct: 60, description: '現時点¥180M。年間¥15M追加投資で2034年達成見込み。' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('trips', uid) === 0) {
    const { data: tripData, error: tripErr } = await sb.from('trips').insert({
      user_id: uid,
      destination: 'ハワイ（ホノルル）— 家族年次旅行',
      start_date: '2026-08-10',
      end_date: '2026-08-17',
      status: 'planning',
      budget_total: 1500000,
      currency: 'JPY',
      travellers: 3,
      notes: '中村家恒例夏休み旅行。ヒルトンハワイアンビレッジ予約予定。ケンジの東大受験前最後の家族旅行。',
    }).select();
    ok('trip', tripData, tripErr);
    if (tripData?.[0]) {
      const items = [
        { trip_id: tripData[0].id, user_id: uid, type: 'flight',    title: 'JAL HND→HNL ビジネスクラス (3名)',       starts_at: '2026-08-10T10:00:00Z', cost: 750000, notes: 'JALマイル使用予定 — 240,000マイル必要' },
        { trip_id: tripData[0].id, user_id: uid, type: 'hotel',     title: 'ヒルトン ハワイアン ビレッジ (7泊)',    starts_at: '2026-08-10T20:00:00Z', cost: 550000, notes: 'ダイヤモンドヘッド側オーシャンビュー室' },
        { trip_id: tripData[0].id, user_id: uid, type: 'activity',  title: 'ゴルフ — カパルア ベイコース (1ラウンド)', starts_at: '2026-08-12T08:00:00Z', cost: 45000,  notes: '裕司さん (大阪支社同僚) と合流予定' },
        { trip_id: tripData[0].id, user_id: uid, type: 'meal',      title: 'ニック\'s Fishmarket — ディナー (家族)',   starts_at: '2026-08-13T18:00:00Z', cost: 80000,  notes: '洋子のリクエスト。要予約' },
      ];
      const { data, error } = await sb.from('trip_items').insert(items).select();
      ok('trip_items', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, mode: 'deep',     planned_minutes: 120, actual_minutes: 115, completed: true,  abandoned: false, body_doubling_enabled: false, task_title: '取締役会向け2027年度事業戦略プレゼン資料作成 (AI活用製造効率化)', notes: '財務インパクト試算完了。CFO田中部長にレビュー依頼済み。', started_at: '2026-05-06T20:00:00Z', ended_at: '2026-05-06T22:00:00Z' },
      { user_id: uid, mode: 'pomodoro', planned_minutes: 25,  actual_minutes: 25,  completed: true,  abandoned: false, body_doubling_enabled: false, task_title: '投資ポートフォリオQ2レビュー — SBI証券',                           notes: 'トヨタ株続伸。iDeCo配分見直し検討。', started_at: '2026-05-08T06:30:00Z', ended_at: '2026-05-08T06:55:00Z' },
      { user_id: uid, mode: 'deep',     planned_minutes: 90,  actual_minutes: 88,  completed: true,  abandoned: false, body_doubling_enabled: false, task_title: '後継者育成プログラム設計 — 林部長・岡本課長評価',               notes: '6ヶ月シャドーイング計画を人事部に提出。両名ともに有望。',  started_at: '2026-05-09T19:00:00Z', ended_at: '2026-05-09T20:30:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 4, energy: 4, note: 'ケンジの模試結果が届いた。東大理科一類 — B判定。もう少し。彼のために頑張る。',           logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 3, energy: 3, note: '取締役会プレゼン準備で残業続き。洋子に申し訳ない。週末のゴルフで気分転換する。',           logged_at: '2026-05-06T23:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'トヨタ株が年初来高値更新。ポートフォリオ全体で¥195M。退職目標の65%達成。順調だ。', logged_at: '2026-05-04T20:30:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, question: 'Should I accept the Managing Director offer at a competitor (Fujitsu Components) for ¥38M/year, or stay at Nakamura Electronics for remaining 8 years to retirement?', category: 'career', mode: 'compare', options: [{ label: 'Accept Fujitsu MD: ¥38M/year, higher title, unknown culture' }, { label: 'Stay Nakamura: familiar, pension intact, loyal to company' }], result: { summary: 'Stay at Nakamura Electronics. Pension value (~¥80M lump sum at 60) plus known culture outweighs ¥10M/year delta. Disrupting Kenji\'s support during Todai year would be poor timing.', chosen: 'Stay at Nakamura Electronics', outcome: 'Declined Fujitsu offer. Negotiated VP compensation review for FY2027 instead.' }, favorite: true, created_at: '2026-04-20T20:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Hiroshi Nakamura seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
