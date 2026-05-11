/**
 * Seed: Lucas Ferreira — Esports Creator & Content Strategist, Belo Horizonte, Brazil (BRL)
 * Email: lucas.ferreira@e2e-test.handlelifeos.app
 * Persona #34 — Gaming content, Twitch/YouTube, brand deals, Brazilian gaming community
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'lucas.ferreira@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Lucas Ferreira (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Lucas Ferreira',
    display_name: 'LucasFPS',
    locale: 'pt-BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    country: 'BR',
    occupation: 'Criador de Conteúdo Gamer & Esports Streamer',
    dietary_preferences: [],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Lucas streaming under "LucasFPS" — 890K seguidores Twitch, 1.4M YouTube. Especialidade: CS2, Valorant, e comentários de torneios CBLOL', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Mora em BH com roommate Caio (ex-colega de faculdade). Aluguel R$1,800 (seu quinhão). Bairro: Savassi', importance: 8 },
      { user_id: uid, type: 'fact', content: 'Renda mensal variável: R$18,000-52,000 (subs Twitch + Super Chats + brand deals + torneios). Média R$32,000', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Setup gamer: PC custom i9-14900K + RTX 4090 + monitor 360Hz. Investiu R$28,000 no setup', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Atingir 1 milhão de inscritos no YouTube até dezembro 2026 — atualmente 1.4M (meta já atingida, novo: 2M)', importance: 8 },
      { user_id: uid, type: 'fact', content: 'Sócio em equipe de CS2 amadora "BH Legends" — pequeno investimento mensal para custos de time', importance: 7 },
      { user_id: uid, type: 'preference', content: 'Usa Nubank para pessoal, Itaú PJ para negócios. Investe no Tesouro Direto e CDB', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Lançar canal de educação em inglês (FPS Academy) para atingir mercado global de gaming', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Parceiros fixos: Razer Brasil, Betano (patrocinador esports), G-Fuel energia. Contratos renováveis anuais', importance: 8 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 28000, expenses_budget: 14000, savings_budget: 8000, investment_budget: 6000 },
    { month: '2026-04-01', income: 45000, expenses_budget: 16000, savings_budget: 15000, investment_budget: 14000 },
    { month: '2026-05-01', income: 32000, expenses_budget: 15000, savings_budget: 10000, investment_budget: 7000 },
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
      { user_id: uid, category: 'Moradia', description: 'Aluguel (minha parte) — Savassi BH', amount: 1800, currency: 'BRL', date: '2026-05-01', payment_method: 'Pix' },
      { user_id: uid, category: 'Tecnologia', description: 'Fibra 1Gbps (Claro) — streaming 24h', amount: 180, currency: 'BRL', date: '2026-05-01', payment_method: 'Débito automático' },
      { user_id: uid, category: 'Tecnologia', description: 'Novo headset Sennheiser HD 800 S (upgrade stream)', amount: 2800, currency: 'BRL', date: '2026-05-03', payment_method: 'Cartão Nubank' },
      { user_id: uid, category: 'Alimentação', description: 'iFood delivery (noite de stream) + mercado', amount: 1400, currency: 'BRL', date: '2026-05-06', payment_method: 'Nubank' },
      { user_id: uid, category: 'Energia', description: 'CEMIG — conta de luz (PC + ACs)', amount: 520, currency: 'BRL', date: '2026-05-04', payment_method: 'Débito automático' },
      { user_id: uid, category: 'Negócios', description: 'Contador MEI + impostos DAS', amount: 1200, currency: 'BRL', date: '2026-05-10', payment_method: 'Boleto' },
      { user_id: uid, category: 'Marketing', description: 'Edição vídeo YouTube (freelancer)', amount: 2000, currency: 'BRL', date: '2026-05-05', payment_method: 'Pix' },
      { user_id: uid, category: 'Esports', description: 'BH Legends — custo mensal time amador', amount: 800, currency: 'BRL', date: '2026-05-01', payment_method: 'Pix' },
      { user_id: uid, category: 'Lazer', description: 'Compras Steam + jogo em físico (CS2 skins)', amount: 1800, currency: 'BRL', date: '2026-05-08', payment_method: 'Cartão' },
      { user_id: uid, category: 'Investimento', description: 'Tesouro Selic aporte mensal', amount: 5000, currency: 'BRL', date: '2026-05-01', payment_method: 'Itaú Investimentos' },
      { user_id: uid, category: 'Saúde', description: 'Academia BH + plano de saúde Unimed', amount: 680, currency: 'BRL', date: '2026-05-01', payment_method: 'Débito automático' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Apartamento próprio BH', target_amount: 500000, current_amount: 95000, currency: 'BRL', target_date: '2029-01-01', category: 'Housing', notes: 'Studio ou 2 quartos — Funcionários ou Lourdes. Parar de dividir com roommate' },
      { user_id: uid, name: 'Reserva de emergência (6 meses)', target_amount: 80000, current_amount: 42000, currency: 'BRL', target_date: '2026-12-31', category: 'Emergency', notes: 'Renda variável = reserva maior que média. CDB liquidez diária' },
      { user_id: uid, name: 'FPS Academy (canal inglês)', target_amount: 30000, current_amount: 8000, currency: 'BRL', target_date: '2026-10-01', category: 'Business', notes: 'Setup adicional + editor EN/PT + curso inglês avançado' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'Adobe Premiere Pro (edição)', amount: 218, currency: 'BRL', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Streamlabs Ultra (overlay Twitch)', amount: 120, currency: 'BRL', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Discord Nitro', amount: 55, currency: 'BRL', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Spotify Premium', amount: 22, currency: 'BRL', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'Tesouro Selic 2028', type: 'Government Bond', current_value: 42000, purchase_price: 38000, currency: 'BRL', notes: 'Âncora da carteira — liquidez em 1 dia' },
      { user_id: uid, name: 'CDB Nubank 104% CDI', type: 'Fixed Income', current_value: 28000, purchase_price: 26000, currency: 'BRL', notes: 'Reserva de emergência complementar — liquidez diária' },
      { user_id: uid, name: 'MXRF11 FII (recebíveis)', type: 'Real Estate Fund', current_value: 15000, purchase_price: 12000, currency: 'BRL', notes: 'Dividendos mensais — começando exposição imobiliária' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('business_clients', uid) === 0) {
    const clients = [
      { user_id: uid, name: 'Razer Brasil', industry: 'Gaming Hardware', contact_email: 'latam@razer.com', monthly_value: 8000, currency: 'BRL', status: 'active', country: 'BR' },
      { user_id: uid, name: 'Betano Brasil (patrocinador)', industry: 'Sports Betting', contact_email: 'esports@betano.com.br', monthly_value: 12000, currency: 'BRL', status: 'active', country: 'BR' },
      { user_id: uid, name: 'G-Fuel Brasil', industry: 'Energy Drinks', contact_email: 'br@gfuel.com', monthly_value: 5000, currency: 'BRL', status: 'active', country: 'BR' },
    ];
    const { data: cd, error: ce } = await sb.from('business_clients').insert(clients).select();
    ok('business_clients', cd, ce);

    if (cd?.length) {
      const invoices = [
        { user_id: uid, client_id: cd[0].id, invoice_number: 'NFS-2026-038', amount: 8000, currency: 'BRL', status: 'paid', issue_date: '2026-04-01', due_date: '2026-04-30', paid_date: '2026-04-25', line_items: [{ description: 'Razer abril — 3 posts + unboxing YouTube + 10 stories', quantity: 1, unit_price: 8000 }] },
        { user_id: uid, client_id: cd[1].id, invoice_number: 'NFS-2026-039', amount: 12000, currency: 'BRL', status: 'sent', issue_date: '2026-05-01', due_date: '2026-05-31', line_items: [{ description: 'Betano — narração torneio CBLOL maio + 5 stories patrocinados', quantity: 1, unit_price: 12000 }] },
      ];
      const { data: id, error: ie } = await sb.from('business_invoices').insert(invoices).select();
      ok('business_invoices', id, ie);
    }
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Stream ao vivo (Twitch 3h+ mínimo)', frequency: 'daily', target_count: 1, color: '#9146FF', icon: '🎮' },
      { user_id: uid, name: 'Gravar YouTube Short ou vídeo longo', frequency: 'weekly', target_count: 3, color: '#FF0000', icon: '📹' },
      { user_id: uid, name: 'Treino mecânicas FPS (Aim Lab 30min)', frequency: 'daily', target_count: 1, color: '#10B981', icon: '🎯' },
      { user_id: uid, name: 'Academia (treino físico)', frequency: 'weekly', target_count: 4, color: '#F59E0B', icon: '💪' },
      { user_id: uid, name: 'Assistir pro games / VOD review', frequency: 'daily', target_count: 1, color: '#3B82F6', icon: '👁️' },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);

    if (hd?.length) {
      const logs = [];
      for (let offset = 0; offset < 21; offset++) {
        const date = dateOffset(offset);
        for (const h of hd) {
          if (Math.random() < 0.80) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 180, type: 'stream', notes: 'Torneio CS2 ao vivo — narração CBLOL patrocinado pela Betano', completed_at: '2026-05-05T21:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'content', notes: 'Edição vídeo YouTube "Top 10 erros iniciantes no Valorant" — thumbnail + upload', completed_at: '2026-05-07T17:00:00Z' },
      { user_id: uid, duration_minutes: 45, type: 'planning', notes: 'Planejamento FPS Academy — roteiro do piloto, pesquisa concorrentes EN', completed_at: '2026-05-09T16:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('mood_logs', uid) === 0) {
    const moods = [
      { user_id: uid, mood: 'excited', energy: 9, notes: 'Passei de 890K pra 900K no Twitch! Primeiro novecentos mil. Milestone! Chat foi à loucura', logged_at: '2026-05-05T23:00:00Z' },
      { user_id: uid, mood: 'tired', energy: 3, notes: 'Streaming todo dia é pesado. Burnout bate às vezes. Vai tirar um fim de semana off', logged_at: '2026-05-08T22:00:00Z' },
      { user_id: uid, mood: 'motivated', energy: 8, notes: 'FPS Academy vai rolar! Primeiro script em inglês escrito. Caio vai ajudar com dublagem', logged_at: '2026-05-10T19:00:00Z' },
    ];
    const { data, error } = await sb.from('mood_logs').insert(moods).select();
    ok('mood_logs', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Aceitar contrato exclusividade Betano por 12 meses vs manter multi-sponsor?', options: ['Exclusivo Betano: R$18K/mês garantido mas sem outros patrocinadores betting', 'Multi-sponsor: R$12K Betano + outros = potencial R$22K+ mas conflito de categorias', 'Curto prazo multi, nego exclusividade com cláusula de revisão 6 meses'], chosen_option: 'Curto prazo multi, nego exclusividade com cláusula de revisão 6 meses', outcome_notes: 'Risco de renda variável = preciso de diversificação. Exclusividade total é caro no streaming', decided_at: '2026-05-06T15:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Lucas Ferreira seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
