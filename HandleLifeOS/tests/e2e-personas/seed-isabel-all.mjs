/**
 * Seed all data for Isabel Ferreira (E2E persona #17).
 * 27yo Lifestyle/Beauty Influencer & Content Creator, São Paulo, Brazil. BRL.
 * Run: node tests/e2e-personas/seed-isabel-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const EMAIL = 'isabel.ferreira@e2e-test.handlelifeos.app'
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
    display_name: 'Isabel Ferreira',
    occupation: 'Influenciadora de Lifestyle & Beleza',
    life_stage: 'early_career',
    country: 'BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    goals: ['lançar própria linha de cosméticos', 'alcançar 5M seguidores', 'diversificar renda', 'construir fundo de emergência'],
    memory_enabled: true
  }, { onConflict: 'id' })

  /* ── memory_items ── */
  if (await cnt('memory_items', uid) === 0) {
    await sb.from('memory_items').insert([
      { user_id: uid, type: 'fact', key: 'social_following', value: '3.2M Instagram + 1.8M TikTok + 890K YouTube. Nicho: lifestyle, beleza, sustentabilidade', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'income_structure', value: 'Renda variável: contratos de marca (60%), AdSense YouTube (15%), link bio (15%), produto físico (10%)', confidence: 90 },
      { user_id: uid, type: 'preference', key: 'content_schedule', value: 'Segunda/quarta/sexta: Instagram Reels. Terça/quinta: TikTok. Domingo: YouTube long-form', confidence: 85 },
      { user_id: uid, type: 'goal', key: 'brand_launch', value: 'Linha de skincare vegana "Isabel Glow" — lançamento previsto para setembro 2026', confidence: 80 },
      { user_id: uid, type: 'preference', key: 'brand_partnerships', value: 'Aceita apenas marcas alinhadas com valores: sustentabilidade, inclusividade, sem testes em animais', confidence: 95 },
      { user_id: uid, type: 'fact', key: 'management', value: 'Gerenciada pela agência Creators BR. Assessora jurídica para contratos acima de R$50K', confidence: 85 },
    ])
  }

  /* ── budgets ── */
  const budgets = [
    { user_id: uid, month: 3, year: 2026, monthly_income: 32000, savings_target: 5000, currency: 'BRL' },
    { user_id: uid, month: 4, year: 2026, monthly_income: 18000, savings_target: 3000, currency: 'BRL' },
    { user_id: uid, month: 5, year: 2026, monthly_income: 45000, savings_target: 8000, currency: 'BRL' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year)
    if (!count) await sb.from('budgets').insert(bm)
  }

  /* ── expenses ── */
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, category: 'rent', amount: 4800, description: 'Aluguel apartamento Vila Madalena', expense_date: '2026-05-01', is_recurring: true, currency: 'BRL' },
      { user_id: uid, category: 'shopping', amount: 3200, description: 'Produtos de beleza para reviews e conteúdo', expense_date: '2026-05-04', is_recurring: false, currency: 'BRL' },
      { user_id: uid, category: 'misc', amount: 2500, description: 'Equipamento: ring light nova e suporte de câmera', expense_date: '2026-05-06', is_recurring: false, currency: 'BRL' },
      { user_id: uid, category: 'food', amount: 1800, description: 'Restaurantes + delivery (iFood)', expense_date: '2026-05-07', is_recurring: false, currency: 'BRL' },
      { user_id: uid, category: 'health', amount: 800, description: 'Pilates + nutricionista', expense_date: '2026-05-02', is_recurring: true, currency: 'BRL' },
      { user_id: uid, category: 'transport', amount: 650, description: '99/Uber + combustível', expense_date: '2026-05-05', is_recurring: false, currency: 'BRL' },
      { user_id: uid, category: 'utilities', amount: 420, description: 'Internet fibra + celular', expense_date: '2026-05-03', is_recurring: true, currency: 'BRL' },
      { user_id: uid, category: 'education', amount: 1200, description: 'Curso de marketing digital e edição de vídeo', expense_date: '2026-05-10', is_recurring: false, currency: 'BRL' },
      { user_id: uid, category: 'travel', amount: 2800, description: 'Viagem ao Rio para campanha L\'Oréal', expense_date: '2026-05-08', is_recurring: false, currency: 'BRL' },
    ])
  }

  /* ── savings_goals ── */
  if (await cnt('savings_goals', uid) === 0) {
    await sb.from('savings_goals').insert([
      { user_id: uid, title: 'Fundo de Emergência (6 meses)', category: 'emergency_fund', target_amount: 90000, current_amount: 32000, currency: 'BRL', target_date: '2027-03-31' },
      { user_id: uid, title: 'Capital para linha Isabel Glow', category: 'business', target_amount: 150000, current_amount: 48000, currency: 'BRL', target_date: '2026-09-30' },
      { user_id: uid, title: 'Viagem à Europa — Paris e Milão', category: 'vacation', target_amount: 25000, current_amount: 12000, currency: 'BRL', target_date: '2026-11-30' },
      { user_id: uid, title: 'Upgrade home studio', category: 'gadget', target_amount: 35000, current_amount: 18000, currency: 'BRL', target_date: '2026-08-31' },
    ])
  }

  /* ── investments ── */
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Tesouro Selic 2029', type: 'bonds', invested_amount: 25000, current_value: 27800, currency: 'BRL', account: 'XP Investimentos', notes: 'Reserva de liquidez — Selic atual 10.5%' },
      { user_id: uid, name: 'Fundo Multimercado XP Advisory', type: 'mutual_fund', invested_amount: 15000, current_value: 16200, currency: 'BRL', account: 'XP Investimentos', notes: 'Perfil moderado' },
      { user_id: uid, name: 'MELI34 BDR (MercadoLibre)', type: 'stocks', invested_amount: 8000, current_value: 9500, currency: 'BRL', account: 'Clear Corretora', notes: 'Aposta no e-commerce latam' },
    ])
  }

  /* ── habits ── */
  let habitIds = {}
  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Rotina skincare manhã', icon: '✨', color: 'rose', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Criar conteúdo (Reels/TikTok)', icon: '🎬', color: 'violet', frequency: 'daily', days_of_week: [1,2,3,4,5], target_per_day: 1 },
      { user_id: uid, name: 'Pilates', icon: '🧘', color: 'emerald', frequency: 'weekly', days_of_week: [2,4,6], target_per_day: 1 },
      { user_id: uid, name: 'Responder comentários e DMs', icon: '💬', color: 'amber', frequency: 'daily', days_of_week: [1,2,3,4,5,6,7], target_per_day: 1 },
      { user_id: uid, name: 'Ler tendências de mercado', icon: '📈', color: 'indigo', frequency: 'weekdays', days_of_week: [1,2,3,4,5], target_per_day: 1 },
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
    const allDates = ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
                      '2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10']
    const skincareId = habitIds['Rotina skincare manhã']
    const contentId = habitIds['Criar conteúdo (Reels/TikTok)']
    const dmId = habitIds['Responder comentários e DMs']
    if (skincareId) allDates.forEach(d => logs.push({ user_id: uid, habit_id: skincareId, date: d, count: 1 }))
    if (contentId) ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'].forEach(d =>
      logs.push({ user_id: uid, habit_id: contentId, date: d, count: 1 }))
    if (dmId) ['2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09','2026-05-10'].forEach(d =>
      logs.push({ user_id: uid, habit_id: dmId, date: d, count: 1 }))
    if (logs.length) await sb.from('habit_logs').insert(logs)
  }

  /* ── career_goals ── */
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      { user_id: uid, title: 'Lançar linha Isabel Glow Skincare', category: 'impact', target_date: '2026-09-30', status: 'active', progress_pct: 55, description: 'Parceria com laboratório Farmax, fórmulas veganas, embalagem sustentável' },
      { user_id: uid, title: 'Alcançar 5M seguidores no Instagram', category: 'role', target_date: '2027-01-01', status: 'active', progress_pct: 64, description: 'Estratégia: Reels virais 3x por semana + collabs com creators maiores' },
      { user_id: uid, title: 'Diversificar: 40% renda passiva', category: 'income', target_date: '2027-06-30', status: 'active', progress_pct: 25, description: 'Via produto próprio + afiliados + curso online sobre criação de conteúdo' },
      { user_id: uid, title: 'Aprender gestão financeira para autônomos', category: 'skill', target_date: '2026-07-31', status: 'active', progress_pct: 40, description: 'Curso com contador especializado em influencers e MEI' },
    ])
  }

  /* ── business_clients ── */
  let clientIds = []
  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Renata Alves', email: 'renata@lorealpr.com.br', company: "L'Oréal Brasil", notes: "Contrato de embaixadora — 4 posts por mês. Renovação anual em julho. R$18K/mês", currency: 'BRL' },
      { user_id: uid, name: 'Thiago Costa', email: 'thiago@natura.net', company: 'Natura & Co.', notes: 'Campanha pontual Ekos — 2 Reels + 1 YouTube. R$25K total', currency: 'BRL' },
      { user_id: uid, name: 'Carla Mendes', email: 'carla@creatorsbr.com', company: 'Creators BR (agência)', notes: 'Minha agência — gerencia todos os contratos de marca. Comissão 15%', currency: 'BRL' },
    ]
    const { data } = await sb.from('business_clients').insert(clients).select()
    clientIds = data.map(c => c.id)
  } else {
    const { data } = await sb.from('business_clients').select('id').eq('user_id', uid)
    clientIds = data.map(c => c.id)
  }

  /* ── business_projects ── */
  if (await cnt('business_projects', uid) === 0) {
    await sb.from('business_projects').insert([
      { user_id: uid, client_id: clientIds[0] ?? null, name: "L'Oréal — Campanha Inverno 2026", status: 'active', fee: 54000, currency: 'BRL', notes: '3 meses × R$18K. Produtos: Elvive + Revitalift. Briefing entregue' },
      { user_id: uid, client_id: clientIds[1] ?? null, name: 'Natura Ekos — Collab Sustentabilidade', status: 'done', fee: 25000, currency: 'BRL', notes: 'Entregue em abril. Excelente engajamento (8.2% IG)' },
      { user_id: uid, client_id: clientIds[2] ?? null, name: 'Isabel Glow — Pré-lançamento PR', status: 'lead', fee: 0, currency: 'BRL', notes: 'Agência vai gerenciar cobertura de imprensa e influencer seeding' },
    ])
  }

  /* ── contacts ── */
  let contactIds = []
  if (await cnt('contacts', uid) === 0) {
    const contacts = [
      { user_id: uid, name: 'Juliana Lima', group_name: 'friend', email: 'ju@juplima.com.br', role: 'Creator — 8M seguidores', notes: 'Melhor amiga e colega creator. Fazemos collabs trimestrais', strength: 5 },
      { user_id: uid, name: 'Dr. Marcus Vieira', email: 'marcus@dermasc.com.br', group_name: 'mentor', role: 'Dermatologista', notes: 'Consultor técnico para Isabel Glow. Valida ingredientes e claims', strength: 4 },
      { user_id: uid, name: 'Fernanda Rocha', email: 'fernanda@creatorsbr.com', group_name: 'work', role: 'Account Manager, Creators BR', notes: 'Minha gestora na agência. Contato diário', strength: 5 },
      { user_id: uid, name: 'Paulo Ferreira', email: 'paulinhof@gmail.com', group_name: 'family', role: 'Irmão mais velho', notes: 'Me ajudou a montar o primeiro setup. Sempre me apoia', strength: 5 },
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
        { user_id: uid, contact_id: contactIds[0], type: 'meeting', note: 'Gravamos collab: "Rotina de beleza sustentável" — deve viralizar', interacted_at: '2026-05-09T14:00:00Z' },
        { user_id: uid, contact_id: contactIds[1], type: 'call', note: 'Aprovação dos ingredientes finais para o sérum da linha Isabel Glow', interacted_at: '2026-05-07T10:00:00Z' },
        { user_id: uid, contact_id: contactIds[2], type: 'meeting', note: 'Revisão de contrato Natura e pipeline de marcas para junho', interacted_at: '2026-05-05T15:00:00Z' },
      ])
    }
  }

  /* ── focus_sessions ── */
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      { user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 85, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Gravação YouTube — "10 erros de skincare"', notes: 'Roteiro pronto, 3 takes, editado no CapCut', started_at: '2026-05-06T10:00:00Z', ended_at: '2026-05-06T11:30:00Z' },
      { user_id: uid, mode: 'deep', planned_minutes: 60, actual_minutes: 60, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Plano de negócios Isabel Glow — projeção de receita', notes: 'Volume mínimo de produção e break-even calculado', started_at: '2026-05-08T09:00:00Z', ended_at: '2026-05-08T10:00:00Z' },
      { user_id: uid, mode: 'shallow', planned_minutes: 45, actual_minutes: 40, completed: true, abandoned: false, body_doubling_enabled: false, task_title: 'Resposta ao briefing da L\'Oréal', notes: 'Aprovação do cronograma de entrega maio/junho', started_at: '2026-05-05T14:00:00Z', ended_at: '2026-05-05T14:45:00Z' },
    ])
  }

  /* ── trips ── */
  let tripIds = []
  const { count: tripCount } = await sb.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  if (!tripCount) {
    const { data } = await sb.from('trips').insert([
      { user_id: uid, destination: 'Paris + Milão — Europa Beauty Tour', start_date: '2026-11-15', end_date: '2026-11-24', status: 'planning', budget_total: 25000, currency: 'BRL', travellers: 1, notes: 'Paris Fashion Week off-season + Cosmoprof Milano. Conteúdo de viagem' },
      { user_id: uid, destination: 'Rio de Janeiro — Campanha L\'Oréal', start_date: '2026-05-22', end_date: '2026-05-24', status: 'booked', budget_total: 3500, currency: 'BRL', travellers: 1, notes: 'Shooting na praia + evento de lançamento do produto' },
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
        { trip_id: tripIds[1], user_id: uid, type: 'flight', title: 'GRU → SDU (LATAM LA3803)', starts_at: '2026-05-22T07:00:00Z', cost: 850, notes: 'Passagem paga pela L\'Oréal' },
        { trip_id: tripIds[1], user_id: uid, type: 'hotel', title: 'Hotel Fasano Rio', starts_at: '2026-05-22T14:00:00Z', ends_at: '2026-05-24T11:00:00Z', cost: 2200, notes: 'Pago pela L\'Oréal' },
        { trip_id: tripIds[1], user_id: uid, type: 'activity', title: 'Shooting Ipanema + evento VIP', starts_at: '2026-05-23T09:00:00Z', cost: 0, notes: 'Equipe de fotografia da L\'Oréal' },
      ])
    }
  }

  /* ── mood_logs ── */
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Collab com Juliana gravada! Vai arrebentar 💥', logged_at: '2026-05-09T20:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Cansada do trabalho mas animada com o progresso da Isabel Glow', logged_at: '2026-05-07T21:00:00Z' },
      { user_id: uid, mood: 2, energy: 1, note: 'Renda de abril foi 40% menor que março. Ansiedade sobre conta fixa', logged_at: '2026-05-01T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 4, note: 'Negociação com L\'Oréal renovada — 15% aumento! Aliviada', logged_at: '2026-05-08T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Domingo criativo. Filmando mas sem energia total', logged_at: '2026-05-10T19:00:00Z' },
    ])
  }

  /* ── journal_entries ── */
  if (await cnt('journal_entries', uid) === 0) {
    await sb.from('journal_entries').insert([
      { user_id: uid, title: 'A montanha-russa financeira', content: 'Abril foi difícil. Um contrato atrasou, outro foi cancelado na última hora. R$18K a menos do que planejei. Paguei tudo, mas o fundo de emergência voltou para o zero. Preciso parar de depender de 2-3 marcas grandes. A Isabel Glow precisa funcionar.', mood: 2, tags: ['finanças', 'ansiedade', 'independência'], created_at: '2026-05-01T22:00:00Z' },
      { user_id: uid, title: 'Por que eu faço isso', content: 'Quando eu era criança, minha mãe não podia comprar os cosméticos que ela queria. Ela dizia que beleza era luxo. Hoje eu ajudo 3 milhões de mulheres a se sentirem bonitas sem culpa. Isso vale mais do que qualquer salário estável. Mas ainda preciso aprender a não ter medo do mês ruim.', mood: 4, tags: ['propósito', 'memória', 'motivação'], created_at: '2026-05-05T22:00:00Z' },
    ])
  }

  /* ── gratitude_entries ── */
  const gratitudeDates = ['2026-05-08', '2026-05-09', '2026-05-10']
  for (const gd of gratitudeDates) {
    const { count } = await sb.from('gratitude_entries').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('date', gd)
    if (!count) {
      const items = gd === '2026-05-08'
        ? ["Renovação L'Oréal com aumento", 'Dermatologista aprovando fórmulas', 'Irmão sempre presente']
        : gd === '2026-05-09'
        ? ['Collab incrível com Juliana', 'Comunidade engajada', 'Trabalho que amo']
        : ['Domingo em casa', 'Progresso na Isabel Glow', 'Seguidores que confiam em mim']
      await sb.from('gratitude_entries').insert({ user_id: uid, items, date: gd })
    }
  }

  /* ── decision_logs ── */
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid, question: 'Devo aceitar contrato de exclusividade com L\'Oréal por 12 meses (sem outras marcas de beleza)?',
        category: 'business', mode: 'analyze',
        options: [{ label: 'Aceitar exclusividade', pros: ['R$22K/mês garantido', 'estabilidade'], cons: ['perder outras marcas', 'menos diversificação'] }, { label: 'Recusar', pros: ['liberdade total'], cons: ['sem garantia mensal'] }],
        result: { summary: 'Aceitar com cláusula de exceção para lançamento Isabel Glow — negociar carve-out', chosen: 'Negociar cláusula de exceção', outcome: 'pending' },
        favorite: true, created_at: '2026-05-08T23:00:00Z'
      },
      {
        user_id: uid, question: 'Contratar editor de vídeo próprio vs continuar editando sozinha?',
        category: 'career', mode: 'compare',
        options: [{ label: 'Contratar editor', pros: ['libera 15h/semana', 'mais conteúdo'], cons: ['R$3.5K/mês custo'] }, { label: 'Continuar sozinha', pros: ['economia'], cons: ['limitação de escala'] }],
        result: { summary: 'Contratar editor freelancer por projeto — testar 3 meses antes de fixo', chosen: 'Freelancer por projeto', outcome: 'decided' },
        favorite: false, created_at: '2026-04-28T20:00:00Z'
      },
    ])
  }

  console.log('✅ Isabel Ferreira seeded successfully.')
}

main().catch(err => { console.error(err); process.exit(1) })
