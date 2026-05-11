/**
 * Seed: Zainab Al-Rashidi — Fashion Influencer & Modest Fashion Brand Owner, Riyadh, Saudi Arabia (SAR)
 * Email: zainab.alrashidi@e2e-test.handlelifeos.app
 * Persona #31 — Arabic RTL, abaya fashion brand, Instagram/TikTok, halal lifestyle
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'zainab.alrashidi@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Zainab Al-Rashidi (${uid})\n`);

  // RTL Arabic profile
  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Zainab Al-Rashidi',
    display_name: 'زينب',
    locale: 'ar-SA',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    country: 'SA',
    occupation: 'مؤثرة أزياء ومصمّمة عبايات — Zainab Collection',
    dietary_preferences: ['halal'],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'زينب مؤسسة "زينب كولكشن" — علامة تجارية للعبايات الفاخرة المعاصرة. تبيع عبر إنستغرام وموقعها الإلكتروني zainabcollection.sa', importance: 10 },
      { user_id: uid, type: 'fact', content: 'لديها 2.1 مليون متابع على إنستغرام و890 ألف على تيك توك. محتوى الأزياء والجمال المحتشم', importance: 10 },
      { user_id: uid, type: 'fact', content: 'دخل شهري متغير: SAR 45,000-120,000 من العلامات التجارية + مبيعات المتجر. متوسط: SAR 72,000', importance: 9 },
      { user_id: uid, type: 'preference', content: 'تلتزم بالحجاب الشرعي. محتوى مُوجَّه للمرأة المسلمة المحتشمة في السعودية والخليج', importance: 8 },
      { user_id: uid, type: 'fact', content: 'تسكن مع عائلتها في حي العليا، الرياض. غير متزوجة. والدها الراعي الأساسي للمشروع التجاري', importance: 7 },
      { user_id: uid, type: 'goal', content: 'توسيع "زينب كولكشن" إلى الإمارات والكويت والأردن بحلول نهاية 2026', importance: 10 },
      { user_id: uid, type: 'preference', content: 'تستخدم STC Pay وبنك الراجحي. تتلقى مدفوعات العلامات الدولية عبر Payoneer', importance: 7 },
      { user_id: uid, type: 'fact', content: 'فازت بجائزة "أفضل مؤثرة أزياء خليجية 2025" من منصة Grwm Arab Influencer Awards', importance: 8 },
      { user_id: uid, type: 'goal', content: 'إطلاق خط عطور "زينب" بحلول موسم رمضان 2027 — شراكة مع Ajmal Perfumes أو Rasasi', importance: 9 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 95000, expenses_budget: 42000, savings_budget: 30000, investment_budget: 23000 },
    { month: '2026-04-01', income: 62000, expenses_budget: 35000, savings_budget: 18000, investment_budget: 9000 },
    { month: '2026-05-01', income: 78000, expenses_budget: 38000, savings_budget: 25000, investment_budget: 15000 },
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
      { user_id: uid, category: 'إنتاج', description: 'مصنع عبايات — طلبية تصنيع شهر مايو (50 قطعة)', amount: 18500, currency: 'SAR', date: '2026-05-02', payment_method: 'تحويل بنكي' },
      { user_id: uid, category: 'تسويق', description: 'مصور موضة احترافي — جلسة تصوير للموقع', amount: 4200, currency: 'SAR', date: '2026-05-04', payment_method: 'STC Pay' },
      { user_id: uid, category: 'شحن', description: 'Aramex Saudi — شحن طلبيات العملاء (أسبوعين)', amount: 2800, currency: 'SAR', date: '2026-05-07', payment_method: 'فاتورة شهرية' },
      { user_id: uid, category: 'اشتراكات', description: 'Shopify Plus (متجر إلكتروني)', amount: 1100, currency: 'SAR', date: '2026-05-01', payment_method: 'بطاقة ائتمان' },
      { user_id: uid, category: 'سفر عمل', description: 'تذكرة دبي للقاء المصمم الإماراتي', amount: 1850, currency: 'SAR', date: '2026-05-09', payment_method: 'بطاقة الراجحي' },
      { user_id: uid, category: 'ملابس', description: 'أقمشة ومواد جديدة (تجارب موسم الصيف)', amount: 5600, currency: 'SAR', date: '2026-05-05', payment_method: 'نقداً' },
      { user_id: uid, category: 'اتصالات', description: 'STC Business باقة بيانات + خطوط العمل', amount: 450, currency: 'SAR', date: '2026-05-01', payment_method: 'STC Pay' },
      { user_id: uid, category: 'صحة وجمال', description: 'عيادة تجميل + مستحضرات (محتوى الجمال)', amount: 3200, currency: 'SAR', date: '2026-05-06', payment_method: 'بطاقة ائتمان' },
      { user_id: uid, category: 'ادخار', description: 'حساب التوفير — بنك الراجحي', amount: 15000, currency: 'SAR', date: '2026-05-01', payment_method: 'تحويل بنكي' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'شقة مستقلة في الرياض', target_amount: 500000, current_amount: 182000, currency: 'SAR', target_date: '2028-01-01', category: 'Housing', notes: 'شقة في حي النخيل أو الملقا — خطوة نحو الاستقلالية المالية' },
      { user_id: uid, name: 'صندوق التوسع الخليجي', target_amount: 200000, current_amount: 68000, currency: 'SAR', target_date: '2026-12-31', category: 'Business', notes: 'فتح متجر في دبي مول أو الأفنيوز الكويت' },
      { user_id: uid, name: 'طوارئ (6 أشهر)', target_amount: 150000, current_amount: 145000, currency: 'SAR', target_date: '2025-12-01', category: 'Emergency', notes: 'مكتمل تقريباً — بنك الراجحي ادخار' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'Shopify Plus', amount: 1100, currency: 'SAR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Later (Instagram scheduler)', amount: 280, currency: 'SAR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Adobe Express (social content)', amount: 195, currency: 'SAR', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Anghami Plus (music)', amount: 19, currency: 'SAR', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'L\'Oréal Arabia (إعلانات تسويقية)', industry: 'Beauty', contact_email: 'influencer@loreal.com', monthly_value: 28000, currency: 'SAR', status: 'active', country: 'SA' },
      { user_id: uid, name: 'Huda Beauty Middle East', industry: 'Beauty', contact_email: 'collab@hudabeauty.com', monthly_value: 18000, currency: 'SAR', status: 'active', country: 'AE' },
      { user_id: uid, name: 'Namshi Fashion', industry: 'Fashion', contact_email: 'influencer@namshi.com', monthly_value: 12000, currency: 'SAR', status: 'active', country: 'AE' },
    ];
    const { data: cd, error: ce } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', cd, ce);

    if (cd?.length) {
      const invoices = [
        { user_id: uid, client_id: cd[0].id, invoice_number: 'INV-ZC-041', amount: 28000, currency: 'SAR', status: 'paid', issue_date: '2026-04-01', due_date: '2026-04-30', paid_date: '2026-04-25', line_items: [{ description: 'حملة L\'Oréal رمضان — 4 ريلز + 8 ستوريز', quantity: 1, unit_price: 28000 }] },
        { user_id: uid, client_id: cd[1].id, invoice_number: 'INV-ZC-042', amount: 18000, currency: 'SAR', status: 'sent', issue_date: '2026-05-01', due_date: '2026-05-31', line_items: [{ description: 'Huda Beauty — حملة إطلاق باليت صيف 2026', quantity: 1, unit_price: 18000 }] },
      ];
      const { data: id, error: ie } = await sb.from('business_invoices').insert(invoices).select();
      ok('business_invoices', id, ie);
    }
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'صلاة الفجر', frequency: 'daily', target_count: 1, color: '#8B5CF6', icon: '🕌' },
      { user_id: uid, name: 'نشر ستوري يومي (إنستغرام)', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '📸' },
      { user_id: uid, name: 'تصوير ريلز أو تيك توك', frequency: 'weekly', target_count: 3, color: '#F59E0B', icon: '🎬' },
      { user_id: uid, name: 'مراجعة مبيعات المتجر الإلكتروني', frequency: 'daily', target_count: 1, color: '#10B981', icon: '📊' },
      { user_id: uid, name: 'نشاط رياضي (يوغا أو مشي)', frequency: 'weekly', target_count: 3, color: '#3B82F6', icon: '🧘' },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);

    if (hd?.length) {
      const logs = [];
      for (let offset = 0; offset < 21; offset++) {
        const date = dateOffset(offset);
        for (const h of hd) {
          if (Math.random() < 0.84) {
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
      { user_id: uid, title: 'التوسع إلى السوق الإماراتي والكويتي', category: 'Business Growth', target_date: '2026-12-31', status: 'in_progress', progress: 30, notes: 'اجتماع مع موزع إماراتي في دبي مول. الكويت: التواصل مع Boutique 1' },
      { user_id: uid, title: 'إطلاق خط عطور "زينب"', category: 'Product Launch', target_date: '2027-03-01', status: 'not_started', progress: 10, notes: 'تفاوض مع Ajmal Perfumes على تصميم توقيع عطري موسم رمضان 2027' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'happy', energy: 9, notes: 'وصل الطلب الجديد من المصنع — جودة ممتازة! العبايات الصيفية ستكون رائعة', logged_at: '2026-05-03T20:00:00Z' },
      { user_id: uid, mood: 'excited', energy: 9, notes: 'عرض من L\'Oréal لحملة خريف 2026 بقيمة 35,000 ريال. أكبر عقد في تاريخي!', logged_at: '2026-05-07T19:00:00Z' },
      { user_id: uid, mood: 'tired', energy: 4, notes: 'أسبوع تصوير مكثف + طلبيات الشحن. محتاجة راحة لكن الجمهور ينتظر المحتوى', logged_at: '2026-05-10T22:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 90, type: 'content', notes: 'تصوير 4 ريلز دفعة واحدة — موسم الصيف 2026', completed_at: '2026-05-05T14:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'business', notes: 'مفاوضات عقد L\'Oréal خريف 2026 — مراجعة الشروط مع مدير الحساب', completed_at: '2026-05-07T11:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'planning', notes: 'تخطيط خط عطور زينب — بحث موردين + دراسة السوق', completed_at: '2026-05-09T15:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'هل أفتح متجراً في دبي الآن أم أنتظر؟', options: ['فتح متجر في دبي مول الآن: SAR 180,000 إيجار سنوي + تجهيز', 'البيع عبر Namshi و Ounass أولاً (B2B) لاختبار السوق', 'فتح pop-up store موسمي في Bloomingdale\'s Dubai: SAR 45,000/شهر'], chosen_option: 'البيع عبر Namshi و Ounass أولاً (B2B) لاختبار السوق', outcome_notes: 'اختبار الطلب قبل الالتزام بإيجار ثابت. إذا نجحت B2B — فتح المتجر في 2027', decided_at: '2026-05-05T18:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Zainab Al-Rashidi seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
