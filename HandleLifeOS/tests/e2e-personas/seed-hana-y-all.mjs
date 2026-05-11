/**
 * Seed: Hana Yamamoto — Retired Elementary Teacher, Osaka, Japan (JPY) — Widowed, accessibility needs
 * Email: hana.yamamoto@e2e-test.handlelifeos.app
 * Persona #39 — Elderly user, vision/mobility accessibility, pension, family support
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'hana.yamamoto@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Hana Yamamoto (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: '山本 花',
    display_name: '花さん',
    locale: 'ja-JP',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    country: 'JP',
    occupation: '元小学校教師（定年退職）',
    dietary_preferences: ['pescatarian'],
    has_child: false,
    has_business: false,
    accessibility_needs: ['low_vision', 'reduced_mobility'],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: '花さんは大阪市西区の自宅で一人暮らし。38年間小学校教師として勤務し、65歳で定年退職', importance: 10 },
      { user_id: uid, type: 'fact', content: '夫の健一さんは4年前に他界（心筋梗塞）。息子の大輔さん（38歳）が大阪に住んでおり、月2回訪問', importance: 9 },
      { user_id: uid, type: 'fact', content: '月収：公務員共済年金 ¥182,000 + 老齢基礎年金 ¥68,000 = 合計約¥250,000', importance: 10 },
      { user_id: uid, type: 'preference', content: '視力低下（老眼鏡使用）と軽度の変形性関節症。大きな文字と音声入力を好む', importance: 9 },
      { user_id: uid, type: 'fact', content: '趣味：生け花（毎週木曜日、地元カルチャーセンター）、家庭菜園（ベランダ）、読書', importance: 7 },
      { user_id: uid, type: 'preference', content: 'ゆうちょ銀行と三井住友銀行を利用。現金払いが中心だが、最近PayPayを息子に教わった', importance: 7 },
      { user_id: uid, type: 'goal', content: '70歳を過ぎても自立した生活を続けること。介護施設には入りたくない', importance: 9 },
      { user_id: uid, type: 'fact', content: '持ち家（分譲マンション）。ローンは完済済み。管理費と修繕積立金の支払いのみ', importance: 8 },
      { user_id: uid, type: 'preference', content: '魚料理が好き（特に鯛とサバ）。近所のスーパー玉出で毎日夕方に買い物', importance: 6 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 250000, expenses_budget: 195000, savings_budget: 35000, investment_budget: 20000 },
    { month: '2026-04-01', income: 250000, expenses_budget: 190000, savings_budget: 35000, investment_budget: 25000 },
    { month: '2026-05-01', income: 250000, expenses_budget: 192000, savings_budget: 35000, investment_budget: 23000 },
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
      { user_id: uid, category: '住居', description: 'マンション管理費・修繕積立金', amount: 28000, currency: 'JPY', date: '2026-05-01', payment_method: '口座振替' },
      { user_id: uid, category: '光熱費', description: '関西電力（電気代）', amount: 7800, currency: 'JPY', date: '2026-05-04', payment_method: '口座振替' },
      { user_id: uid, category: '光熱費', description: 'ガス代（大阪ガス）', amount: 3200, currency: 'JPY', date: '2026-05-04', payment_method: '口座振替' },
      { user_id: uid, category: '食費', description: 'スーパー玉出・コープさん（週2回）', amount: 32000, currency: 'JPY', date: '2026-05-06', payment_method: '現金' },
      { user_id: uid, category: '医療', description: '整形外科（変形性関節症）月1回', amount: 2800, currency: 'JPY', date: '2026-05-08', payment_method: '現金' },
      { user_id: uid, category: '医療', description: '眼科（白内障経過観察）', amount: 1500, currency: 'JPY', date: '2026-05-12', payment_method: '現金' },
      { user_id: uid, category: '薬代', description: '処方薬（痛み止め・降圧剤）', amount: 4200, currency: 'JPY', date: '2026-05-09', payment_method: '現金' },
      { user_id: uid, category: '趣味', description: '生け花カルチャーセンター（月謝）', amount: 8500, currency: 'JPY', date: '2026-05-01', payment_method: '現金' },
      { user_id: uid, category: '趣味', description: 'ベランダ菜園（土・肥料・苗）', amount: 3200, currency: 'JPY', date: '2026-05-05', payment_method: 'PayPay' },
      { user_id: uid, category: '通信', description: 'NTTドコモ（らくらくスマートフォン）', amount: 3800, currency: 'JPY', date: '2026-05-01', payment_method: '口座振替' },
      { user_id: uid, category: 'NHK', description: 'NHK受信料（月額）', amount: 2200, currency: 'JPY', date: '2026-05-01', payment_method: '口座振替' },
      { user_id: uid, category: '保険', description: 'かんぽ生命（死亡保険）', amount: 5500, currency: 'JPY', date: '2026-05-01', payment_method: '口座振替' },
      { user_id: uid, category: '外食・交際', description: '息子の大輔と外食（難波のお気に入り和食)', amount: 8800, currency: 'JPY', date: '2026-05-09', payment_method: '現金' },
      { user_id: uid, category: '移動', description: '市バス・地下鉄（シニア割引定期）', amount: 5500, currency: 'JPY', date: '2026-05-01', payment_method: '現金' },
      { user_id: uid, category: '孫へのお小遣い', description: 'お小遣い：孫の湊くん（大輔の子）', amount: 5000, currency: 'JPY', date: '2026-05-09', payment_method: '現金' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: '介護予備費（自立生活継続のため）', target_amount: 5000000, current_amount: 2800000, currency: 'JPY', target_date: '2030-01-01', category: 'Healthcare', notes: 'ホームヘルパー費用・バリアフリー改修工事に備えて' },
      { user_id: uid, name: '孫の入学祝い（湊くん小学校）', target_amount: 100000, current_amount: 60000, currency: 'JPY', target_date: '2027-04-01', category: 'Family', notes: '大輔の長男、湊くんが来年4月に入学' },
      { user_id: uid, name: '墓地・葬儀費用準備', target_amount: 2000000, current_amount: 1200000, currency: 'JPY', target_date: '2030-01-01', category: 'Estate', notes: '大輔に負担をかけたくない。樹木葬を希望' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'NHK受信料', amount: 2200, currency: 'JPY', billing_cycle: 'monthly', category: 'Media', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'かんぽ生命保険', amount: 5500, currency: 'JPY', billing_cycle: 'monthly', category: 'Insurance', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Amazon Prime (息子に勧められた)', amount: 600, currency: 'JPY', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'ゆうちょ銀行定期預金', type: 'Bank Deposit', current_value: 4200000, purchase_price: 4000000, currency: 'JPY', notes: '元本保証重視。金利は低くても安心感が大事' },
      { user_id: uid, name: '財形貯蓄（教職員時代）', type: 'Pension', current_value: 2800000, purchase_price: 2800000, currency: 'JPY', notes: '退職時に受け取り済み分の残高。定期へ移行中' },
      { user_id: uid, name: '自宅マンション（西区）', type: 'Real Estate', current_value: 18000000, purchase_price: 22000000, currency: 'JPY', notes: '購入から25年。市場価値は下落したが住居費ゼロが最大のメリット' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: '朝の体操（NHKラジオ体操）', frequency: 'daily', target_count: 1, color: '#10B981', icon: '🌅' },
      { user_id: uid, name: '生け花の練習・水換え', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '🌸' },
      { user_id: uid, name: '近所の散歩（30分）', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '🚶' },
      { user_id: uid, name: '読書（1時間）', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '📖' },
      { user_id: uid, name: '大輔に電話またはLINE', frequency: 'weekly', target_count: 2, color: '#F59E0B', icon: '📱' },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);

    if (hd?.length) {
      const logs = [];
      for (let offset = 0; offset < 21; offset++) {
        const date = dateOffset(offset);
        for (const h of hd) {
          if (Math.random() < 0.88) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'happy', energy: 7, notes: '大輔と湊くんが来てくれた。湊くんの笑顔が健一さんにそっくり。胸が痛いほど嬉しかった', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 'lonely', energy: 4, notes: '雨の日は健一さんのことを特に思い出す。一人でいる時間が長いと心が重い', logged_at: '2026-05-05T20:00:00Z' },
      { user_id: uid, mood: 'content', energy: 7, notes: '生け花の作品を先生に褒めていただいた。久しぶりにお稽古に集中できた', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 'grateful', energy: 8, notes: 'ベランダのトマトが初めて実った！孫の湊くんに見せてあげたい', logged_at: '2026-05-10T18:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: '健一さんへ', content: '今日で4年が経ちました。大輔が心配して週に2回電話してくれます。元気でやっています。ベランダのトマトが赤くなりました。あなたが好きだった品種です。毎朝体操して、木曜は生け花、金曜は図書館。一人でも丁寧に生きています。', mood: 'reflective', logged_at: '2026-05-03T21:00:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 60, type: 'hobby', notes: '生け花の新作：藤の花と菖蒲。6月の作品展に向けて練習', completed_at: '2026-05-07T14:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'finance', notes: '大輔と一緒に介護費用の準備について話し合い。ゆうちょ定期の金利確認', completed_at: '2026-05-09T16:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: '山本 大輔', relationship: 'Family', email: null, company: null, notes: '息子（38歳）。大阪市在住。月2回訪問、週2回LINE電話', birthday: '1988-03-12' },
      { user_id: uid, name: '田中 先生（生け花）', relationship: 'Teacher', email: null, company: '西区カルチャーセンター', notes: '生け花の師匠。20年来のお付き合い', birthday: null },
      { user_id: uid, name: '鈴木 美代子さん', relationship: 'Friend', email: null, company: null, notes: '同じマンションの仲良し。一緒にスーパー玉出で買い物する仲', birthday: '1952-07-20' },
    ];
    const { data, error } = await sb.from('contacts').insert(contacts).select();
    ok('contacts', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'バリアフリー改修：今するか、必要になってからか？', options: ['今すぐ改修（玄関・浴室・廊下に手すり設置）：約80万円', '5年後に必要になった時に改修する', '大輔の家に引っ越す（孫と近くに住む）'], chosen_option: '今すぐ改修（玄関・浴室・廊下に手すり設置）：約80万円', outcome_notes: '大輔も今のうちにした方がいいと言っている。転倒予防が最優先。介護保険で一部補助も使える', decided_at: '2026-05-07T19:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Hana Yamamoto seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
