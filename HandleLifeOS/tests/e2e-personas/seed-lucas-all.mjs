/**
 * Seed: Lucas Oliveira — Esports Creator & Content Strategist, Belo Horizonte, Brazil (BRL)
 * Email: lucas.oliveira@e2e-test.handlelifeos.app
 * Persona #34 — Gaming content, Twitch/YouTube, brand sponsorships, Brazilian esports community
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

const EMAIL = 'lucas.oliveira@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedLucas() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Lucas Oliveira',
    occupation: 'Criador de Conteúdo de Esports & Estrategista de Gaming',
    life_stage: 'early_career',
    country: 'BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    goals: [
      'Reach Twitch Partner status — currently Affiliate, need 75 avg concurrent viewers',
      'Grow YouTube channel to 500K subscribers by December 2026',
      'Launch branded merchandise line (jerseys + mousepads) by Q3 2026',
      'Save BRL 150K for home studio upgrade and esports team seed fund'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 3200, spent: 3200, currency: 'BRL' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 2800, spent: 3100, currency: 'BRL' },
    { user_id: uid, month: 4, year: 2026, category: 'Entertainment', budgeted: 1500, spent: 2200, currency: 'BRL' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 3000, spent: 2650, currency: 'BRL' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 800, spent: 720, currency: 'BRL' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 3200, spent: 1600, currency: 'BRL' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 2800, spent: 1350, currency: 'BRL' },
    { user_id: uid, month: 5, year: 2026, category: 'Entertainment', budgeted: 1500, spent: 980, currency: 'BRL' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 3000, spent: 1400, currency: 'BRL' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 3200, currency: 'BRL', category: 'rent', description: 'Aluguel — apartamento Savassi, Belo Horizonte (abril)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 450, currency: 'BRL', category: 'utilities', description: 'Internet fibra 600Mbps — NET Virtua (essencial para stream)', expense_date: '2026-04-03' },
      { user_id: uid, amount: 1800, currency: 'BRL', category: 'entertainment', description: 'Compra de jogos Steam + Xbox Game Pass Ultimate (biblioteca para conteúdo)', expense_date: '2026-04-05' },
      { user_id: uid, amount: 1200, currency: 'BRL', category: 'shopping', description: 'Headset HyperX Cloud III — upgrade para qualidade de áudio na stream', expense_date: '2026-04-08' },
      { user_id: uid, amount: 2800, currency: 'BRL', category: 'food', description: 'Supermercado Extra + iFood deliveries — semana de crunch de conteúdo', expense_date: '2026-04-14' },
      { user_id: uid, amount: 650, currency: 'BRL', category: 'misc', description: 'Adobe Creative Cloud — edição de vídeo YouTube (mensal)', expense_date: '2026-04-15' },
      { user_id: uid, amount: 1400, currency: 'BRL', category: 'misc', description: 'OBS plugins + StreamElements premium — ferramentas de transmissão', expense_date: '2026-04-18' },
      { user_id: uid, amount: 380, currency: 'BRL', category: 'transport', description: 'Uber — CBLOL viewing event + encontro de criadores BH', expense_date: '2026-04-22' },
      { user_id: uid, amount: 3200, currency: 'BRL', category: 'rent', description: 'Aluguel — apartamento Savassi (maio)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 4500, currency: 'BRL', category: 'travel', description: 'São Paulo CBLOL Finals — ônibus + hotel + ingresso VIP', expense_date: '2026-05-08' },
      { user_id: uid, amount: 1350, currency: 'BRL', category: 'food', description: 'iFood semana + almoço encontro de criadores SP', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Stream ao vivo — mínimo 3h', description: 'Transmissão diária na Twitch. Consistência é o algoritmo. Mínimo 3 horas de conteúdo ao vivo.', frequency: 'daily',
        target_count: 1, current_streak: 18, longest_streak: 47, completed_today: true,
        category: 'work', color: '#9146ff', icon: '🎮', reminder_time: '20:00', active: true, created_at: '2026-01-10T00:00:00Z'
      },
      {
        user_id: uid, name: 'Vídeo YouTube — upload semanal', description: 'Uma análise de meta, tier list ou review de jogo por semana. Mínimo 12 minutos para monetização.', frequency: 'weekly',
        target_count: 1, current_streak: 9, longest_streak: 22, completed_today: false,
        category: 'work', color: '#ff0000', icon: '▶️', reminder_time: '18:00', active: true, created_at: '2026-01-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'Ranked games — 2 horas de prática', description: 'Manter rank alto é conteúdo. Criador de conteúdo de esports precisa ser genuinamente bom.', frequency: 'daily',
        target_count: 1, current_streak: 12, longest_streak: 30, completed_today: true,
        category: 'work', color: '#f59e0b', icon: '🏆', reminder_time: '14:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Academia — treino de força', description: 'Streamer sentado 8h/dia precisa de compensação física. SmartFit Savassi terça/quinta/sábado.', frequency: 'weekly',
        target_count: 3, current_streak: 5, longest_streak: 12, completed_today: false,
        category: 'health', color: '#10b981', icon: '💪', reminder_time: '10:00', active: true, created_at: '2026-03-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Poupança mensal — Tesouro Selic', description: 'Renda variável exige disciplina de poupança. BRL 4.000 para Tesouro Selic toda virada de mês.', frequency: 'monthly',
        target_count: 1, current_streak: 4, longest_streak: 8, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '💰', reminder_time: '09:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 175, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Proposta de sponsorship — Razer Brasil renovação de contrato Q3 2026',
        notes: 'Proposta entregue: mídia kit atualizado (214K YT + 68K Twitch), CPM data, case study Monster Energy collab. Pedindo BRL 12K/mês + gear.',
        started_at: '2026-04-10T10:00:00Z', ended_at: '2026-04-10T12:55:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 118, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Planejamento de merch — jerseys e mousepads Team MGNTA',
        notes: 'Pesquisa de fornecedores BH: Printful BR, Custom.ink BR. Jersey MOQ 50 unidades @ BRL 85/unit. Mousepad XL MOQ 100 @ BRL 45/unit. Margem viável.',
        started_at: '2026-04-21T14:00:00Z', ended_at: '2026-04-21T16:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 45, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Análise de métricas — crescimento Twitch vs. YouTube Q1 2026',
        notes: 'Abandonou aos 45 min — amigo convidou para jogar ranked. Retomou no dia seguinte.',
        started_at: '2026-04-27T21:00:00Z', ended_at: '2026-04-27T21:45:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 150, actual_minutes: 148, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'CBLOL Finals SP — cobertura, roteiro de vídeo e ideias de conteúdo',
        notes: 'Entrevistei 3 jogadores nos bastidores. Conteúdo suficiente para 2 vídeos YT + 5 shorts + 1 vlog. Vale muito a viagem.',
        started_at: '2026-05-09T09:00:00Z', ended_at: '2026-05-09T11:28:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 4, energy: 4, note: 'Razer renovou o contrato por BRL 10K/mês + gear. Não foi os 12K que pedi mas é um patamar novo. Cresce junto.', logged_at: '2026-04-15T22:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'CBLOL Finals em SP foi incrível. Entrei nos bastidores. Os jogadores conhecem meu conteúdo. Senti que faço parte do ecossistema de esports BR de verdade.', logged_at: '2026-05-09T23:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Semana fraca de views. Algoritmo do YouTube mudou de novo. Odeio depender de uma plataforma que pode mudar tudo da noite pro dia.', logged_at: '2026-04-29T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: '214K inscritos no YouTube! Vai chegando. Twitch ainda lento — 52 viewers médios, preciso de 75 para Partner. Perto.', logged_at: '2026-05-05T20:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-15', items: ['Razer renovando parceria — reconhecimento do trabalho', 'Internet que não caiu uma vez durante a stream de domingo', 'Comunidade do chat que torna cada live especial'] },
    { date: '2026-04-22', items: ['214.000 pessoas que escolheram assinar meu canal', 'Comunidade gaming brasileira que valoriza criador nacional', 'Pai que comprou o primeiro PC gamer para eu jogar'] },
    { date: '2026-05-09', items: ['CBLOL Finals — experiência de bastidores impagável', 'Os jogadores que pararam para conversar comigo', 'BH minha cidade que me formou gamer'] },
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
        user_id: uid, title: 'CBLOL Finals — Cheguei nos Bastidores',
        content: 'Fui ao CBLOL Finals em São Paulo como criador de conteúdo credenciado. Entrei nos bastidores, entrevistei 3 jogadores profissionais. O Rakin me reconheceu pelo conteúdo de análise de mid lane. Esse momento valeu mais do que qualquer número de inscrito. Eu sou parte deste ecossistema. O merch da Team MGNTA vai ter a cara disso — criador que vive o esports, não só fala dele.',
        mood: 5, tags: ['milestone', 'esports', 'identidade'], created_at: '2026-05-10T00:00:00Z'
      },
      {
        user_id: uid, title: 'Twitch Partner vs. Criar Própria Equipe — A Decisão Real',
        content: 'Se eu assinar com FURIA ou LOUD como criador de conteúdo oficial, tenho audiência garantida e estrutura. Mas perco independência editorial e controle da minha marca. Se eu criar a Team MGNTA agora, tenho liberdade mas preciso de capital (BRL 80K para operar 6 meses) e capacidade de gerir atletas. Não tenho isso agora. A ordem certa é: 1) Twitch Partner, 2) 300K YT, 3) merch lucrativo, 4) aí equipe.',
        mood: 3, tags: ['decisão', 'carreira', 'estratégia'], created_at: '2026-04-25T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: 'Criar e gerir a própria equipe de esports "Team MGNTA" agora, ou manter foco de crescimento como criador solo até atingir Twitch Partner e 300K YouTube?',
        category: 'Business',
        mode: 'analyze',
        options: [
          { label: 'Criar Team MGNTA agora', pros: ['Narrativa única — criador-dono de equipe', 'Conteúdo orgânico infinito (torneios, treinos)', 'Potencial de equity em esports emergente BR'], cons: ['Precisa BRL 80K de capital inicial', 'Gestão de atletas + logistics drena energia criativa', 'Riscos operacionais antes de base financeira sólida'] },
          { label: 'Crescer solo até Partner + 300K YT', pros: ['Foco total em métricas de crescimento pessoal', 'Base financeira antes de investir em equipe', 'Partner status abre receita de Twitch exclusiva'], cons: ['Janela de oportunidade esports BR pode se fechar', 'Concorrentes podem criar equipes similares antes', 'Crescimento mais lento sem narrativa diferenciada'] }
        ],
        result: { summary: 'Sequenciamento correto: 1) Twitch Partner (falta 23 viewers médios), 2) 300K YouTube, 3) merch lucrativo gerando BRL 15K+/mês, 4) Team MGNTA capitalisada. Criar equipe prematuramente queimaria capital e foco.', chosen: 'Crescer solo primeiro, equipe em 2027', outcome: 'pending' },
        favorite: true,
        created_at: '2026-04-26T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Assinar contrato de criador de conteúdo oficial com FURIA Esports (exclusividade + salário BRL 8K/mês) ou manter independência editorial?',
        category: 'Business',
        mode: 'compare',
        options: [
          { label: 'Assinar com FURIA Esports', pros: ['BRL 8K/mês garantido + estrutura de produção', 'Audiência FURIA: acesso a 4M de seguidores', 'Credibilidade profissional no mercado de esports'], cons: ['Cláusula de exclusividade: não pode fazer collab com LOUD ou outros times', 'Controle editorial comprometido', 'Marca própria diluída na marca FURIA'] },
          { label: 'Manter independência', pros: ['Liberdade de collabs com todos os times e marcas', 'Construção da marca pessoal Lucas Oliveira', 'Potencial de receita 5× maior quando escalar'], cons: ['Renda variável vs. salário fixo', 'Sem apoio de produção — tudo por conta própria', 'Crescimento mais lento sem impulso de audiência existente'] }
        ],
        result: { summary: 'FURIA é tentador mas exclusividade mata opções de collab e merch. Independência cria mais valor longo prazo. Counter-proposta: parceria não-exclusiva por BRL 3K/mês por 3 conteúdos/mês.', chosen: 'Counter-proposta não-exclusiva ou declinar', outcome: 'pending' },
        favorite: false,
        created_at: '2026-05-03T14:00:00Z'
      }
    ])
  }

  // 11. Investments (disciplined saving for variable-income creator)
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'Tesouro Selic 2028', type: 'bonds', invested_amount: 28000, current_value: 31200, currency: 'BRL', account: 'XP Investimentos', notes: 'Reserva de emergência + rainy day fund para meses de renda baixa. 6 meses de despesas fixas cobertos.', purchase_date: '2024-01-01' },
      { user_id: uid, name: 'CDB Nubank 120% CDI', type: 'savings', invested_amount: 45000, current_value: 51800, currency: 'BRL', account: 'Nubank', notes: 'Liquidez diária. Studio upgrade fund — meta BRL 60K para upgrade completo em 2027.', purchase_date: '2023-09-01' },
      { user_id: uid, name: 'Ações VALE3 + MGLU3', type: 'stocks', invested_amount: 18000, current_value: 16400, currency: 'BRL', account: 'XP Investimentos', notes: 'Especulativo. MGLU3 machucou — aprendizado caro sobre não investir em empresa que eu não entendo bem.', purchase_date: '2023-06-01' },
    ])
  }

  // 12. Business clients / sponsors
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Razer Brasil — Partnerships', email: 'br.partnerships@razer.com', company: 'Razer Inc', notes: 'Gaming peripherals sponsorship. BRL 10K/mês + gear kit semestral (headset, mouse, teclado). Renovado para Q3 2026.', currency: 'BRL' },
      { user_id: uid, name: 'Red Bull Brasil — Esports', email: 'esports@redbull.com.br', company: 'Red Bull Brasil', notes: 'Seasonal energy drink partnership. BRL 6K por campanha (3 eventos/ano). CBLOL Finals, BGS, Brasil Game Show.', currency: 'BRL' },
      { user_id: uid, name: 'Nubank — Afiliados', email: 'afiliados@nubank.com.br', company: 'Nu Holdings', notes: 'Programa de afiliados Nubank. BRL 80-120 por conta aberta via link. Audiência gamer jovem converte bem.', currency: 'BRL' },
      { user_id: uid, name: 'HyperX Gaming BR', email: 'br.marketing@hyperx.com', company: 'HyperX (HP)', notes: 'Headset e mousepad review collabs. Produto enviado + BRL 2K por review longo no YouTube.', currency: 'BRL' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'Razer Q3 2026 — Conteúdo Mensal (Renovado)', status: 'active', fee: 30000, currency: 'BRL', notes: 'BRL 10K/mês por 3 meses. Deliverables: 1 vídeo YouTube integrado + 3 stream mentions + 2 posts Instagram. Sem exclusividade de categoria.', due_date: '2026-09-30' },
        { user_id: uid, client_id: clients[1].id, name: 'Red Bull CBLOL Finals — Cobertura Content Creator', status: 'completed', fee: 6000, currency: 'BRL', notes: 'Cobertura presencial do CBLOL Finals em SP. Vlog + bastidores + 2 shorts. Entregues. Pagamento em processamento.', due_date: '2026-05-15' },
        { user_id: uid, client_id: clients[3].id, name: 'HyperX Cloud III Alpha — Review YouTube', status: 'active', fee: 2000, currency: 'BRL', notes: 'Review honesta do headset novo. 15-20 min no YT + clipe Twitch highlight. Produto já recebido. Deadline 20/maio.', due_date: '2026-05-20' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Rodrigo "RDGO" Santos', email: 'rdgo@riotgames.com.br', phone: '+5531999001122', group_name: 'Business', notes: 'Riot Games BR partnerships manager. Key contact for CBLOL creator credentials. Mensagem rápida no LinkedIn.' },
      { user_id: uid, name: 'Carla Mendes — Razer BR', email: 'c.mendes@razer.com', phone: '+551191234567', group_name: 'Business', notes: 'Razer Brasil account manager. Negociou a renovação de contrato. Responsiva, entende métricas de creator.' },
      { user_id: uid, name: 'Felipe "Zika" Costa', email: 'zika@teamzika.gg', phone: '+5531988776655', group_name: 'Business', notes: 'BH gaming influencer — 1.2M YouTube. Collab pendente: vídeo Draft Wars League of Legends. Agendar para junho.' },
      { user_id: uid, name: 'Pai — João Oliveira', email: '', phone: '+5531977665544', group_name: 'Family', notes: 'Comprou o primeiro PC gamer. Duvida que gaming é carreira mas está orgulhoso do contrato Razer. Ligar mais.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Alcançar Twitch Partner — 75 viewers médios simultâneos', category: 'role',
        description: 'Atualmente 52 viewers médios. Faltam 23. Meta de stream diária de 3h+ e collabs com outros criadores para crescimento de audiência.',
        target_date: '2026-09-30', status: 'active', progress_pct: 69
      },
      {
        user_id: uid, title: 'Crescer YouTube para 500K inscritos', category: 'impact',
        description: 'Atualmente 214K. Estratégia: 1 vídeo longo/semana + 3 shorts/semana + consistência de thumbnails e títulos SEO-otimizados.',
        target_date: '2026-12-31', status: 'active', progress_pct: 43
      },
      {
        user_id: uid, title: 'Lançar linha de merch Team MGNTA — Q3 2026', category: 'income',
        description: 'Jerseys (MOQ 50 @ BRL 85/unit, vender @ BRL 180) + mousepads XL (MOQ 100 @ BRL 45, vender @ BRL 120). Pré-venda antes de produzir para validar demanda.',
        target_date: '2026-09-30', status: 'active', progress_pct: 25
      },
      {
        user_id: uid, title: 'Acumular BRL 150K em investimentos pessoais', category: 'income',
        description: 'Renda variável de criador exige colchão financeiro robusto. BRL 4K/mês poupança sistemática + reinvestimento de receita extra de brand deals.',
        target_date: '2027-12-31', status: 'active', progress_pct: 63
      },
    ])
  }

  // 15. Trips
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'São Paulo, Brazil — CBLOL Finals 2026', country_code: 'BR',
        starts_on: '2026-05-08', ends_on: '2026-05-10',
        purpose: 'business', status: 'completed',
        budget_total: 4500, currency: 'BRL',
        notes: 'CBLOL Finals credenciado como criador de conteúdo. Bastidores, entrevistas com jogadores, cobertura para Red Bull. Conteúdo para 2 vídeos YT + 5 shorts.'
      },
      {
        user_id: uid, destination: 'São Paulo, Brazil — Brasil Game Show (BGS)', country_code: 'BR',
        starts_on: '2026-10-08', ends_on: '2026-10-12',
        purpose: 'business', status: 'planning',
        budget_total: 6000, currency: 'BRL',
        notes: 'Maior evento gamer da América Latina. Stand Razer Brasil + collab com Felipe Zika confirmada. Lançar merch Team MGNTA presencialmente se linha lançar antes.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'transport', title: 'Ônibus BH → SP — Cometa executivo', starts_at: '2026-05-08T06:00:00Z', ends_at: '2026-05-08T13:00:00Z', cost: 280, currency: 'BRL', notes: 'Executivo leito. Barato e dormiu no caminho — economizou hotel extra.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Hotel Ibis Faria Lima — 2 noites', starts_at: '2026-05-08T15:00:00Z', ends_at: '2026-05-10T11:00:00Z', cost: 680, currency: 'BRL', notes: 'Perto do venue CBLOL. Wifi funcional para upload de conteúdo no hotel.' },
        { trip_id: trips[0].id, type: 'activity', title: 'CBLOL Finals — credencial criador de conteúdo', starts_at: '2026-05-09T10:00:00Z', ends_at: '2026-05-09T22:00:00Z', cost: 380, currency: 'BRL', notes: 'Credencial VIP Creator. Acesso a bastidores, zona de media, entrevistas pós-partida.' },
        { trip_id: trips[0].id, type: 'restaurant', title: 'Jantar equipe Red Bull + criadores — Spot Itaim', starts_at: '2026-05-09T20:00:00Z', ends_at: '2026-05-09T23:00:00Z', cost: 0, currency: 'BRL', notes: 'Custeado pelo Red Bull. Networking com 8 outros criadores de conteúdo de esports BR.' },
      ])
    }
  }

  // 16. Meal plans (jovem criador — comida prática, vida noturna)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Vitamina de banana + whey + aveia', calories: 520, notes: 'Rápido antes do ranked matinal — sem cozinhar' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Marmita do dia — feijão, arroz, frango grelhado', calories: 780, notes: 'iFood marmita fit — BRL 28, entrega em 30 min' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Pizza + refrigerante durante a live', calories: 920, notes: 'Terça-feira é late-night stream. Pizza habitual — interação com o chat.' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'breakfast', recipe_name: 'Pão de queijo + café coado', calories: 380, notes: 'Clássico mineiro — rápido antes da stream das 14h' },
      { user_id: uid, week_start: weekStart, day_of_week: 5, meal_type: 'dinner', recipe_name: 'Churrasco com amigos — costelão', calories: 1100, notes: 'Sexta-feira social — grelhando na churrasqueira do condomínio' },
    ])
  }

  console.log('✅ Lucas Oliveira (#34) seeded — BRL, Belo Horizonte, esports creator, 214K YouTube, CBLOL credencial')
}

seedLucas().catch(e => { console.error(e); process.exit(1) })
