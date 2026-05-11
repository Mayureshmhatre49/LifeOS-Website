/**
 * Seed all data for Grace Kim (E2E persona #15).
 * 30yo Beauty Startup CEO (K-beauty DTC, Series A) in Seoul. KRW.
 * Run: node tests/e2e-personas/seed-grace-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'grace.kim@e2e-test.handlelifeos.app'
const PASSWORD = 'E2eTest1234!'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

async function main() {
  /* ── user ── */
  let uid
  const { data: existing } = await sb.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === EMAIL)
  if (found) {
    uid = found.id
    console.log('User exists:', uid)
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL, password: PASSWORD, email_confirm: true
    })
    if (error) throw error
    uid = data.user.id
    console.log('User created:', uid)
  }

  /* ── profile ── */
  await sb.from('profiles').upsert({
    id: uid,
    display_name: '김그레이스',
    occupation: 'K-beauty DTC Startup CEO',
    life_stage: 'early_career',
    country: 'KR',
    currency: 'KRW',
    timezone: 'Asia/Seoul',
    goals: ['raise Series B', 'expand to US market', 'build dream team', 'achieve product-market fit'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'company_name', value: 'Glow Seoul Inc.', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'funding_stage', value: 'Series A — ₩8B raised, targeting Series B by Q4 2026', confidence: 95 },
      { user_id: uid, type: 'preference', key: 'work_style', value: 'Early riser, deep work 6–9am before team arrives', confidence: 90 },
      { user_id: uid, type: 'fact', key: 'team_size', value: '23 full-time employees, 8 contractors', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'us_expansion', value: 'Launch Glow Seoul DTC in the US via Shopify by Q3 2026', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'investor_relations', value: 'Monthly LP updates, prefers written memos over calls', confidence: 80 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 12000000, savings_target: 2000000, currency: 'KRW' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 12000000, savings_target: 2000000, currency: 'KRW' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 12000000, savings_target: 2500000, currency: 'KRW' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 3800000, description: '강남 오피스텔 월세', expense_date: '2026-05-01', is_recurring: true, currency: 'KRW' },
      { user_id: uid, category: 'food', amount: 650000, description: '업무 미팅 식사 및 카페', expense_date: '2026-05-03', is_recurring: false, currency: 'KRW' },
      { user_id: uid, category: 'shopping', amount: 450000, description: '뷰티 제품 리서치 구매', expense_date: '2026-05-05', is_recurring: false, currency: 'KRW' },
      { user_id: uid, category: 'transport', amount: 220000, description: '택시 및 우버 (투자자 미팅)', expense_date: '2026-05-07', is_recurring: false, currency: 'KRW' },
      { user_id: uid, category: 'health', amount: 180000, description: '헬스장 회원권', expense_date: '2026-05-01', is_recurring: true, currency: 'KRW' },
      { user_id: uid, category: 'education', amount: 350000, description: 'Harvard Business Review 구독 및 온라인 강좌', expense_date: '2026-05-10', is_recurring: false, currency: 'KRW' },
      { user_id: uid, category: 'utilities', amount: 130000, description: '인터넷 및 공과금', expense_date: '2026-05-02', is_recurring: true, currency: 'KRW' },
      { user_id: uid, category: 'entertainment', amount: 200000, description: '팀 워크샵 비용', expense_date: '2026-05-15', is_recurring: false, currency: 'KRW' },
      { user_id: uid, category: 'travel', amount: 1200000, description: 'Cosmoprof Asia 항공편 예약금', expense_date: '2026-05-08', is_recurring: false, currency: 'KRW' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: '긴급 자금 6개월치', category: 'emergency_fund', target_amount: 72000000, current_amount: 48000000, currency: 'KRW', target_date: '2026-12-31' },
      { user_id: uid, title: '미국 진출 자금', category: 'business', target_amount: 50000000, current_amount: 18000000, currency: 'KRW', target_date: '2027-06-30' },
      { user_id: uid, title: '도쿄 뷰티 투어', category: 'vacation', target_amount: 5000000, current_amount: 2500000, currency: 'KRW', target_date: '2026-09-30' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'KOSPI 200 ETF', type: 'etf', invested_amount: 15000000, current_value: 17200000, currency: 'KRW', account: '키움증권', notes: '장기 적립식' },
      { user_id: uid, name: '삼성전자 주식', type: 'stocks', invested_amount: 8000000, current_value: 9100000, currency: 'KRW', account: '키움증권', notes: '배당주 보유' },
      { user_id: uid, name: '비트코인', type: 'crypto', invested_amount: 5000000, current_value: 6800000, currency: 'KRW', account: '업비트', notes: '소액 투자' },
      { user_id: uid, name: '스타트업 공제조합', type: 'other', invested_amount: 3000000, current_value: 3000000, currency: 'KRW', account: '중소벤처기업부', notes: '스타트업 공제' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: '뷰티 트렌드 리서치', icon: '💄', color: 'rose', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: '투자자 업데이트 작성', icon: '📊', color: 'indigo', frequency: 'weekly', days_of_week: [1], target_per_day: 1 },
      { user_id: uid, name: '새벽 운동', icon: '🏃', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: '팀원 1:1 미팅', icon: '🤝', color: 'amber', frequency: 'weekly', days_of_week: [3], target_per_day: 1 },
    ]
    const { data } = await sb.from('habits').insert(habits).select()
    data.forEach(h => { habitIds[h.name] = h.id })
  } else {
    const { data } = await sb.from('habits').select('id, name').eq('user_id', uid)
    data.forEach(h => { habitIds[h.name] = h.id })
  }

  /* ── habit_logs ── */
  if (await cnt('habit_logs', uid) === 0) {
    const logs = []
    const dates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                   '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const researchId = habitIds['뷰티 트렌드 리서치']
    const exerciseId = habitIds['새벽 운동']
    if (researchId) dates.forEach(d => logs.push({ user_id: uid, habit_id: researchId, date: d, count: 1 }))
    if (exerciseId) {
      ['2026-05-01','2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
        logs.push({ user_id: uid, habit_id: exerciseId, date: d, count: 1 })
      )
    }
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Series B 펀딩 완료 (₩30B)', category: 'income', target_date: '2026-12-31', status: 'active', progress_pct: 25, description: 'Q4 2026까지 VC 미팅 및 텀시트 확보 목표' },
      { user_id: uid, title: '미국 시장 론칭', category: 'impact', target_date: '2027-03-31', status: 'active', progress_pct: 40, description: 'Shopify + Amazon DTC 동시 진출 전략' },
      { user_id: uid, title: '리더십 코칭 수료', category: 'skill', target_date: '2026-09-30', status: 'active', progress_pct: 60, description: 'YPO 리더십 프로그램 참여 중' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: '박지수', email: 'jisoo@olivebeauty.kr', company: 'Olive Beauty Co.', notes: '한국 최대 H&B 유통사, MOQ 협상 중', currency: 'KRW' },
      { user_id: uid, name: 'Sarah Chen', email: 'sarah@beautyiq.com', company: 'BeautyIQ USA', notes: 'US 온라인 리테일 파트너, 독점 계약 협상 중', currency: 'USD' },
      { user_id: uid, name: 'Yuki Tanaka', email: 'yuki@cosmetica.jp', company: 'Cosmetica Japan', notes: '일본 수입 유통사, 규제 승인 대기 중', currency: 'JPY' },
    ]
    const { data } = await sb.from('business_clients').insert(clients).select()
    clientIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('business_clients').select('id').eq('user_id', uid)
    clientIds = data.map(c => c.id)
  }

  /* ── business_projects ── */
  if (await cnt('business_projects', uid) === 0) {
    const projects = [
      { user_id: uid, client_id: clientIds[0] ?? null, name: 'H&B 체인 납품 계약', status: 'active', fee: 45000000, currency: 'KRW', notes: '글로우 세럼 라인 300개 매장 입점' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'US DTC 론칭 캠페인', status: 'lead', fee: 80000000, currency: 'KRW', notes: 'Shopify 스토어 + 인플루언서 마케팅 패키지' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: '일본 수출 인증', status: 'on_hold', fee: 25000000, currency: 'KRW', notes: '후생노동성 성분 심사 중' },
    ]
    await sb.from('business_projects').insert(projects)
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: '이준혁', group_name: 'investor', email: 'jhlee@kvenfund.com', role: 'Lead Partner, KV Fund', notes: '시리즈 A 리드 투자자. 분기별 미팅', strength: 5 },
      { user_id: uid, name: '정민아', group_name: 'mentor', email: 'mina@beautyventures.co', role: 'Serial Entrepreneur', notes: '뷰티 스타트업 엑시트 경험 2회. 주 1회 멘토링', strength: 5 },
      { user_id: uid, name: '김동현', group_name: 'work', email: 'donghyun@glowseoul.com', role: 'CTO, Glow Seoul', notes: '공동창업자. 기술 총괄', strength: 5 },
      { user_id: uid, name: 'Amanda Foster', group_name: 'work', email: 'amanda@beautyiq.com', role: 'VP Partnerships, BeautyIQ', notes: '미국 파트너십 담당자', strength: 4 },
    ]
    const { data } = await sb.from('contacts').insert(contacts).select()
    contactIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('contacts').select('id').eq('user_id', uid)
    contactIds = data.map(c => c.id)
  }

  /* ── contact_interactions ── */
  if (contactIds.length > 0) {
    const { count } = await sb.from('contact_interactions').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!count) {
      await sb.from('contact_interactions').insert([
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Q1 실적 공유 및 시리즈 B 타임라인 논의', interacted_at: '2026-05-06T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'US 시장 진출 전략 멘토링 — 현지 유통 조언', interacted_at: '2026-05-08T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'message', note: 'Shopify 테크 스택 결정 완료', interacted_at: '2026-05-09T16:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 87, completed: true, abandoned: false, body_doubling_enabled: false, task_title: '시리즈 B 투자 덱 작성', notes: '재무 섹션 완성', started_at: '2026-05-05T06:00:00Z', ended_at: '2026-05-05T07:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 115, completed: true, abandoned: false, body_doubling_enabled: false, task_title: '미국 시장 경쟁사 분석', notes: 'Glossier, Fenty Beauty 벤치마킹', started_at: '2026-05-07T06:00:00Z', ended_at: '2026-05-07T08:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 30, actual_minutes: 28, completed: true, abandoned: false, body_doubling_enabled: false, task_title: '투자자 이메일 회신', notes: '3개 LP 업데이트 발송', started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T09:30:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: '홍콩 — Cosmoprof Asia 2026', start_date: '2026-11-10', end_date: '2026-11-14', status: 'planning', budget_total: 3500000, currency: 'KRW', travellers: 2, notes: '박람회 부스 설치 + 바이어 미팅 일정' },
      { user_id: uid, destination: '뉴욕 — US 파트너 미팅', start_date: '2026-08-05', end_date: '2026-08-09', status: 'booked', budget_total: 5000000, currency: 'KRW', travellers: 1, notes: 'BeautyIQ 본사 + VC 투자자 미팅' },
    ]).select()
    tripIds = data.map(t => t.id)
  } else {
    const { data } = await sb.from('trips').select('id').eq('user_id', uid)
    tripIds = data.map(t => t.id)
  }

  if (tripIds.length > 0) {
    const { count: tiCount } = await sb.from('trip_items').select('*', { count: 'exact', head: true }).eq('user_id', uid)
    if (!tiCount) {
      await sb.from('trip_items').insert([
        { trip_id: tripIds[1], user_id: uid, type: 'flight', title: '인천 → JFK 항공', starts_at: '2026-08-05T10:30:00Z', cost: 1800000, notes: '아시아나 OZ202' },
        { trip_id: tripIds[1], user_id: uid, type: 'hotel', title: 'Ace Hotel New York', starts_at: '2026-08-05T20:00:00Z', ends_at: '2026-08-09T11:00:00Z', cost: 2200000, notes: '4박' },
        { trip_id: tripIds[1], user_id: uid, type: 'activity', title: 'BeautyIQ 파트너십 미팅', starts_at: '2026-08-06T14:00:00Z', cost: 0, notes: '계약 조건 최종 협상' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: '투자자 미팅 성공적! 시리즈 B 분위기 매우 좋음', logged_at: '2026-05-06T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: '일본 파트너 계약 지연 소식. 그래도 미국 쪽은 순조롭다', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: '팀 전체 집중력 좋고 분위기 UP', logged_at: '2026-05-08T21:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'Sephora Korea에서 입점 제안! 꿈 같은 하루', logged_at: '2026-05-09T21:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: '주말 피로 누적. 좀 쉬어야 할 것 같다', logged_at: '2026-05-10T20:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'Sephora 제안을 받고', content: '오늘 Sephora Korea 바이어에게서 연락이 왔다. 입점 제안. 3년 전 이 회사를 만들었을 때 꿈꾸던 순간이다. 팀원들과 축배를 들었다. 하지만 계약 조건은 아직 살펴봐야 한다 — 마진이 핵심이다.', mood: 5, tags: ['milestone', 'business', 'sephora'], created_at: '2026-05-09T22:00:00Z' },
      { user_id: uid, title: '번아웃 경계선', content: '주 70시간 근무가 벌써 4달째다. 몸이 신호를 보내고 있다. 지속 가능한 pace를 찾아야 한다. 좋은 CEO는 마라토너처럼 달려야 한다고 멘토가 말했었다. 지금 나는 스프린터처럼 뛰고 있다.', mood: 3, tags: ['burnout', 'self-care', 'leadership'], created_at: '2026-05-10T21:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ['훌륭한 팀원들', '투자자들의 신뢰', '건강한 몸']
        : gd === '2026-05-09'
        ? ['Sephora 입점 제안', '공동창업자 동현', '어머니의 응원 전화']
        : ['주말 휴식', '좋아하는 카페', '성장하는 브랜드']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Sephora Korea 입점 조건 수락 여부 — 마진 35% 요구',
        category: 'business', mode: 'analyze',
        options: [{ label: '수락', pros: ['브랜드 신뢰도', '대량 판매'], cons: ['낮은 마진'] }, { label: '협상', pros: ['더 나은 조건'], cons: ['기회 손실 위험'] }],
        result: { summary: '협상 시도 후 최소 마진 42% 확보 목표', chosen: '협상', outcome: 'pending' },
        favorite: true, created_at: '2026-05-09T23:00:00Z'
      },
      {
        user_id: uid, question: 'CMO 채용 vs 마케팅 대행사 위탁',
        category: 'career', mode: 'compare',
        options: [{ label: 'CMO 채용' }, { label: '에이전시 위탁' }],
        result: { summary: 'Series B 후 CMO 채용, 그 전까지 에이전시 유지', chosen: '에이전시 위탁 (단기)', outcome: 'decided' },
        favorite: false, created_at: '2026-05-07T20:00:00Z'
      },
    ])
  }

  console.log('✅ Grace Kim seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
