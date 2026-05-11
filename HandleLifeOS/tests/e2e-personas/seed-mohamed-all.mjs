/**
 * Seed: Mohamed Hassan — Civil Engineer, Cairo, Egypt (EGP)
 * Email: mohamed.hassan@e2e-test.handlelifeos.app
 * Persona #14 — 44yo, Arab Contractors, married + 3 kids, mortgage + car loan, RTL Arabic context
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL        = 'mohamed.hassan@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Mohamed Hassan (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Mohamed',
    occupation: 'مهندس مدني أول — شركة المقاولون العرب (القاهرة)',
    life_stage: 'mid_career',
    country: 'EG',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    goals: [
      'الترقي إلى مدير مشروع بحلول 2027 مع زيادة المرتب 30%',
      'سداد قرض السيارة الحالي بالكامل بحلول نهاية 2026',
      'الانتهاء من تجديد شقة نصر سيتي بحلول رمضان 2027',
      'ادخار تكاليف تعليم ثلاثة أبناء في المدارس الخاصة',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact',       key: 'employment',        value: 'Senior Civil Engineer at Arab Contractors (Al-Muqawiloon Al-Arab) — Egypt\'s largest construction company. 18 years service. Current project: 10th Ramadan City infrastructure expansion. Monthly salary EGP 45,000.', confidence: 98 },
      { user_id: uid, type: 'fact',       key: 'family',            value: 'Married to Nadia Hassan (accountant at Ministry of Finance). Three children: Omar (14, Manaret El Shorouk School), Layla (11, same school), Youssef (7, Nour School Nasr City). Lives in owned 3BR apartment, Nasr City.', confidence: 95 },
      { user_id: uid, type: 'fact',       key: 'loans',             value: 'Mortgage: National Bank of Egypt, EGP 8,500/month (5 years remaining, original EGP 950,000 at 14.5% p.a.). Car loan: Banque Misr, EGP 3,800/month (18 months remaining for Hyundai Tucson 2023)', confidence: 95 },
      { user_id: uid, type: 'fact',       key: 'school_fees',       value: 'Total annual school fees: EGP 148,000 (Omar EGP 62,000, Layla EGP 58,000, Youssef EGP 28,000). Quarterly payments. Major financial pressure point with EGP inflation.', confidence: 92 },
      { user_id: uid, type: 'preference', key: 'financial_habit',   value: 'Banque Misr for salary + mortgage. Fawry Pay for utility bills. Vodafone Cash for everyday payments. Follows Islamic finance principles — avoids conventional interest where possible but mortgage unavoidable.', confidence: 85 },
      { user_id: uid, type: 'goal',       key: 'renovation_plan',   value: 'Nasr City apartment full renovation: kitchen (EGP 45,000), bathrooms ×2 (EGP 30,000), painting + flooring (EGP 25,000). Total EGP 100,000 budget. Saving EGP 8,000/month from Nadia\'s salary.', confidence: 88 },
      { user_id: uid, type: 'fact',       key: 'pmp_certification', value: 'PMP (Project Management Professional) certification study in progress — Pearson Vue exam scheduled November 2026. Required for Project Manager promotion. Study with PMP Arabia group online 3 evenings/week.', confidence: 90 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: 3, year: 2026, monthly_income: 45000, savings_target: 6000, currency: 'EGP', notes: 'رمضان — نفقات إضافية للمواد الغذائية' },
    { month: 4, year: 2026, monthly_income: 45000, savings_target: 7000, currency: 'EGP' },
    { month: 5, year: 2026, monthly_income: 45000, savings_target: 7500, currency: 'EGP' },
  ];
  for (const bm of budgetMonths) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('month', bm.month).eq('year', bm.year);
    if (!count) { const { data, error } = await sb.from('budgets').insert({ user_id: uid, ...bm }).select(); ok(`budget ${bm.month}/${bm.year}`, data, error); }
  }

  if (await cnt('expenses', uid) === 0) {
    const expenses = [
      { category: 'rent',          amount: 8500,  description: 'قسط الرهن العقاري الشهري — بنك ناسيونال مصر',                        expense_date: '2026-05-01', is_recurring: true  },
      { category: 'bills',         amount: 3800,  description: 'قسط قرض السيارة — بنك مصر (هيونداي توكسون 2023)',                     expense_date: '2026-05-01', is_recurring: true  },
      { category: 'kids',          amount: 14500, description: 'رسوم الدراسة الفصلية — مدرسة منارة الشروق (عمر + ليلى)',              expense_date: '2026-05-03', is_recurring: false },
      { category: 'kids',          amount: 7000,  description: 'رسوم الدراسة الفصلية — مدرسة النور يوسف',                             expense_date: '2026-05-03', is_recurring: false },
      { category: 'bills',         amount: 1850,  description: 'فاتورة الكهرباء + الغاز + المياه (نصر سيتي)',                          expense_date: '2026-05-05', is_recurring: true  },
      { category: 'bills',         amount: 950,   description: 'فودافون 3 خطوط عائلية + Vodafone Cash',                               expense_date: '2026-05-05', is_recurring: true  },
      { category: 'food',          amount: 8500,  description: 'مصاريف الطعام — كارفور + سوق نصر سيتي + مطاعم العائلة',               expense_date: '2026-05-06', is_recurring: false },
      { category: 'travel',        amount: 2200,  description: 'أوبر + توك توك + وقود السيارة (القاهرة الكبرى)',                      expense_date: '2026-05-07', is_recurring: false },
      { category: 'education',     amount: 1200,  description: 'دورة PMP Arabia الإلكترونية (3 جلسات أسبوعياً)',                      expense_date: '2026-05-01', is_recurring: true  },
      { category: 'health',        amount: 800,   description: 'صيدلية + دكتور أطفال (يوسف — كحة موسمية)',                            expense_date: '2026-05-08', is_recurring: false },
      { category: 'entertainment', amount: 950,   description: 'مول العرب — نزهة العائلة + سينما + مطعم',                            expense_date: '2026-05-10', is_recurring: false },
      { category: 'misc',          amount: 3200,  description: 'مصاريف متنوعة — هدايا + صيانة + احتياجات البيت',                     expense_date: '2026-05-09', is_recurring: false },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses.map(e => ({ user_id: uid, currency: 'EGP', ...e }))).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'تجديد شقة نصر سيتي (مطبخ + حمامات + دهانات)',  category: 'home',          target_amount: 100000, current_amount: 42000, currency: 'EGP', target_date: '2027-03-01' },
      { user_id: uid, title: 'تعليم الأبناء الثلاثة — صندوق طوارئ مدرسي',    category: 'education',     target_amount: 150000, current_amount: 35000, currency: 'EGP', target_date: '2027-09-01' },
      { user_id: uid, title: 'صندوق طوارئ عائلي — 3 أشهر مصاريف',             category: 'emergency_fund', target_amount: 135000, current_amount: 58000, currency: 'EGP', target_date: '2026-12-31' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'صلاة الفجر + قراءة القرآن (15 دقيقة)',            icon: '🕌', color: 'emerald', frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'مراجعة دراسة PMP (3 أمسيات أسبوعياً)',            icon: '📐', color: 'indigo',  frequency: 'weekdays', days_of_week: [1,3,4], target_per_day: 1 },
      { user_id: uid, name: 'متابعة ميزانية الأسرة الشهرية (تطبيق المحفظة)', icon: '💰', color: 'amber',   frequency: 'weekly',   days_of_week: [5], target_per_day: 1 },
      { user_id: uid, name: 'مشاركة العائلة — وقت جودة مع الأبناء الثلاثة',   icon: '👨‍👩‍👧‍👦', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], target_per_day: 1 },
      { user_id: uid, name: 'رياضة المشي (30 دقيقة — بعد العشاء)',              icon: '🚶', color: 'teal',   frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
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
          if (h.frequency === 'weekdays' && !h.days_of_week.includes(new Date(date + 'T00:00:00Z').getUTCDay())) continue;
          if (h.frequency === 'weekly' && dow !== 'Fri') continue;
          if (Math.random() < 0.82) logs.push({ user_id: uid, habit_id: h.id, date, count: 1 });
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('career_goals', uid) === 0) {
    const goals = [
      { user_id: uid, title: 'اجتياز شهادة PMP والحصول على ترقية مدير مشروع', category: 'role',   target_date: '2027-03-01', status: 'active', progress_pct: 48, description: 'PMP exam November 2026. Passed 2 of 5 knowledge areas in practice exams. Project Manager role at Arab Contractors requires PMP + 5 years supervision.' },
      { user_id: uid, title: 'إنجاز مشروع الرمادي الكبير في الموعد المحدد',    category: 'impact', target_date: '2026-12-31', status: 'active', progress_pct: 65, description: '10th Ramadan City infrastructure expansion: 3 roads + 2 bridges. Currently 65% complete. On schedule. Key metric for promotion case.' },
    ];
    const { data, error } = await sb.from('career_goals').insert(goals).select();
    ok('career_goals', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, mode: 'pomodoro', planned_minutes: 25, actual_minutes: 25, completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'PMP دراسة — إدارة المخاطر (Risk Management) الفصل السابع', notes: 'Completed 45 practice questions. Score 78% — above 75% pass threshold.', started_at: '2026-05-06T21:00:00Z', ended_at: '2026-05-06T21:25:00Z' },
      { user_id: uid, mode: 'deep',     planned_minutes: 60, actual_minutes: 55, completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'مراجعة الميزانية الشهرية للأسرة + خطة سداد قرض السيارة', notes: 'Car loan on track — 18 months left. Identified EGP 2,000/month extra payment possible from May bonus.', started_at: '2026-05-01T21:30:00Z', ended_at: '2026-05-01T22:30:00Z' },
      { user_id: uid, mode: 'deep',     planned_minutes: 90, actual_minutes: 88, completed: true,  abandoned: false, body_doubling_enabled: false, task_title: 'تقرير تقدم مشروع العاشر من رمضان — القسم الثالث (الجسرين)', notes: 'Bridge 2 foundation 100% complete. Bridge 3 steel framework 70%. Report submitted to Project Director on time.', started_at: '2026-05-08T20:00:00Z', ended_at: '2026-05-08T21:30:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 4, energy: 4, note: 'اجتاز عمر امتحان الجغرافيا بتقدير ممتاز. فخور جداً به. الله يحفظه.',                                              logged_at: '2026-05-08T21:30:00Z' },
      { user_id: uid, mood: 2, energy: 3, note: 'رسوم المدرسة الفصلية ضغطت على الميزانية هذا الشهر. المصاريف أكبر من التوقعات مع ارتفاع التضخم.', logged_at: '2026-05-03T22:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'أنهيت قسم إدارة المخاطر في دراسة PMP. 78% في الاختبار التجريبي. الزخم جيد.',                            logged_at: '2026-05-06T22:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('journal_entries', uid) === 0) {
    const entries = [
      { user_id: uid, title: 'التضخم والتخطيط للمستقبل', content: 'نادية وأنا جلسنا الليلة نراجع الميزانية. رسوم المدارس ارتفعت 22% هذا العام. الكهرباء ارتفعت 35%. قرض السيارة لا يتغير لكن قيمته الحقيقية تتآكل. لكن الأبناء الثلاثة بصحة جيدة، الشقة مؤمنة، والعمل مستقر. الحمد لله على النعمة وسط الضغط.', mood: 3, tags: ['family','finance','inflation'], created_at: '2026-05-03T23:00:00Z' },
      { user_id: uid, title: 'شهادة PMP — الخطوة التالية', content: 'قرار الحصول على شهادة PMP هو أفضل قرار مهني اتخذته. المدير أكد لي أن الترقية لمدير مشروع مرتبطة بها مباشرة. ثلاثة أشهر دراسة، وسيتغير المسار المهني. الصبر والاجتهاد.', mood: 4, tags: ['career','pmp','development'], created_at: '2026-05-06T22:30:00Z' },
    ];
    const { data, error } = await sb.from('journal_entries').insert(entries).select();
    ok('journal_entries', data, error);
  }

  if (await cnt('gratitude_entries', uid) === 0) {
    const entries = [
      { user_id: uid, items: ['عمر نجح في امتحان الجغرافيا بامتياز', 'شقة مؤمنة في نصر سيتي', 'نادية تدير البيت بحكمة'],   date: '2026-05-08' },
      { user_id: uid, items: ['78% في اختبار PMP التجريبي — المسار صحيح', 'مشروع الرمادي يسير في موعده'],                    date: '2026-05-06' },
      { user_id: uid, items: ['الأبناء الثلاثة بصحة جيدة', 'عمل ثابت في المقاولون العرب منذ 18 عاماً'],                     date: '2026-05-03' },
    ];
    const { data, error } = await sb.from('gratitude_entries').insert(entries).select();
    ok('gratitude_entries', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, question: 'هل أقدم على إعادة تمويل الرهن العقاري بسعر فائدة أعلى لدفع فترة أقل، أم أستمر في القسط الحالي؟', category: 'finance', mode: 'analyze', options: [], result: { summary: 'Continue current mortgage at EGP 8,500/month for 5 remaining years. Refinancing at current 18.5% rate would increase payments by EGP 2,100/month with school fees pressure — not feasible. Revisit when car loan clears in 18 months (freeing EGP 3,800/month).', chosen: 'الاستمرار في القسط الحالي', outcome: 'لم يتم إعادة التمويل. تحرير قسط السيارة خلال 18 شهراً سيسمح بدفعات إضافية على الرهن.' }, favorite: false, created_at: '2026-04-15T20:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Mohamed Hassan seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
