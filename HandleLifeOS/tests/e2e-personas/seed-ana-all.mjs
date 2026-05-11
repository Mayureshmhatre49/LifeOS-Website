/**
 * Seed: Ana Vargas — Food Blogger & Recipe Developer, Santiago, Chile (CLP)
 * Email: ana.vargas@e2e-test.handlelifeos.app
 * Persona #37 — Chilean food content, 580K Instagram, cookbook deal, artisan market
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = 'ana.vargas@e2e-test.handlelifeos.app';

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
  console.log(`\n🌱 Seeding Ana Vargas (${uid})\n`);

  const { data: prof, error: profErr } = await sb.from('profiles').upsert({
    user_id: uid,
    full_name: 'Ana Vargas',
    display_name: 'Ana',
    locale: 'es-CL',
    currency: 'CLP',
    timezone: 'America/Santiago',
    country: 'CL',
    occupation: 'Food Blogger, Desarrolladora de Recetas & Autora',
    dietary_preferences: ['vegetarian'],
    has_child: false,
    has_business: true,
    accessibility_needs: [],
    onboarding_complete: true,
    avatar_url: null,
  }, { onConflict: 'user_id' }).select();
  ok('profile upsert', prof, profErr);

  if (await cnt('memory_items', uid) === 0) {
    const items = [
      { user_id: uid, type: 'fact', content: 'Ana dirige el blog "La Cocina de Ana" — 580K seguidores Instagram, 210K YouTube. Especialidad: cocina chilena contemporánea y vegetariana', importance: 10 },
      { user_id: uid, type: 'fact', content: 'Contrato firmado con editorial Random House Chile para cookbook "Sabores del Sur" — adelanto CLP $8.5M, publicación octubre 2026', importance: 10 },
      { user_id: uid, type: 'preference', content: 'Vegetariana hace 5 años. Usa ingredientes locales de mercado: Mercado La Vega Central y Feria Orgánica Parque Arauco', importance: 8 },
      { user_id: uid, type: 'fact', content: 'Ingresos mensuales: CLP $2.8M-6.5M (brand deals + blog + recetas para marcas + libro). Variable según temporada', importance: 9 },
      { user_id: uid, type: 'fact', content: 'Arriendo depto 2D en Providencia, Santiago. CLP $750,000/mes. Tiene estudio en depa para fotografía de comida', importance: 8 },
      { user_id: uid, type: 'goal', content: 'Lanzar línea de condimentos artesanales "Ana Cocina" — primera colección: merkén, ají de color, sal ahumada', importance: 9 },
      { user_id: uid, type: 'preference', content: 'Banco BCI para negocios, Cuenta RUT BancoEstado para personal. Utiliza Mach y Khipu para pagos', importance: 7 },
      { user_id: uid, type: 'fact', content: 'Colabora con Turismo Chile para recetas de cocina regional — contratos trimestrales', importance: 7 },
      { user_id: uid, type: 'goal', content: 'Cocinar y documentar las 16 cocinas regionales de Chile — proyecto de 2 años de viaje', importance: 8 },
    ];
    const { data, error } = await sb.from('memory_items').insert(items).select();
    ok('memory_items', data, error);
  }

  const budgetMonths = [
    { month: '2026-03-01', income: 3800000, expenses_budget: 1800000, savings_budget: 1200000, investment_budget: 800000 },
    { month: '2026-04-01', income: 5200000, expenses_budget: 2000000, savings_budget: 1800000, investment_budget: 1400000 },
    { month: '2026-05-01', income: 4100000, expenses_budget: 1900000, savings_budget: 1300000, investment_budget: 900000 },
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
      { user_id: uid, category: 'Arriendo', description: 'Depto Providencia — arriendo mensual', amount: 750000, currency: 'CLP', date: '2026-05-01', payment_method: 'Transferencia BCI' },
      { user_id: uid, category: 'Insumos', description: 'La Vega Central + Jumbo — ingredientes semana 1-2', amount: 280000, currency: 'CLP', date: '2026-05-05', payment_method: 'Tarjeta BCI' },
      { user_id: uid, category: 'Fotografía', description: 'Asistente fotografía food styling (freelance)', amount: 180000, currency: 'CLP', date: '2026-05-04', payment_method: 'Transferencia' },
      { user_id: uid, category: 'Libro', description: 'Estilismo alimentos para fotos libro (Random House)', amount: 250000, currency: 'CLP', date: '2026-05-06', payment_method: 'Transferencia editorial' },
      { user_id: uid, category: 'Servicios', description: 'Entel fibra 600MB + luz Enel Chile', amount: 95000, currency: 'CLP', date: '2026-05-03', payment_method: 'PAC' },
      { user_id: uid, category: 'Contador', description: 'Honorario contador (IVA, renta, boletas de honorarios)', amount: 90000, currency: 'CLP', date: '2026-05-01', payment_method: 'Transferencia' },
      { user_id: uid, category: 'Marketing', description: 'Diseñadora web para rediseño blog', amount: 180000, currency: 'CLP', date: '2026-05-07', payment_method: 'Transferencia' },
      { user_id: uid, category: 'Salud', description: 'Isapre Cruz Blanca mensual', amount: 85000, currency: 'CLP', date: '2026-05-01', payment_method: 'PAC' },
      { user_id: uid, category: 'Viaje', description: 'Vuelo LAT PASS SCL-Puerto Montt (cocina sureña)', amount: 142000, currency: 'CLP', date: '2026-05-09', payment_method: 'Tarjeta' },
      { user_id: uid, category: 'Inversión', description: 'Cuenta Ahorro Vista BCI + fondo mutuo Fintual', amount: 800000, currency: 'CLP', date: '2026-05-01', payment_method: 'Transferencia' },
    ];
    const { data, error } = await sb.from('expenses').insert(expenses).select();
    ok('expenses', data, error);
  }

  if (await cnt('savings_goals', uid) === 0) {
    const goals = [
      { user_id: uid, name: 'Línea condimentos Ana Cocina (capital inicial)', target_amount: 15000000, current_amount: 4200000, currency: 'CLP', target_date: '2027-01-01', category: 'Business', notes: 'Producción piloto merkén + packaging + comercialización supermercados región' },
      { user_id: uid, name: 'Fondo emergencia (6 meses)', target_amount: 12000000, current_amount: 9200000, currency: 'CLP', target_date: '2026-09-01', category: 'Emergency', notes: 'Casi completo — CMF Fintual fondo monetario' },
      { user_id: uid, name: 'Depto propio Santiago', target_amount: 120000000, current_amount: 18000000, currency: 'CLP', target_date: '2031-01-01', category: 'Real Estate', notes: 'Pie para depto en Ñuñoa o Macul — crédito hipotecario BCI' },
    ];
    const { data, error } = await sb.from('savings_goals').insert(goals).select();
    ok('savings_goals', data, error);
  }

  if (await cnt('money_subscriptions', uid) === 0) {
    const subs = [
      { user_id: uid, name: 'Adobe Lightroom + Photoshop (fotos comida)', amount: 22000, currency: 'CLP', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Planoly (Instagram scheduler)', amount: 18000, currency: 'CLP', billing_cycle: 'monthly', category: 'Business', next_billing_date: '2026-06-01' },
      { user_id: uid, name: 'Netflix + Spotify', amount: 11000, currency: 'CLP', billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: '2026-06-01' },
    ];
    const { data, error } = await sb.from('money_subscriptions').insert(subs).select();
    ok('subscriptions', data, error);
  }

  if (await cnt('investments', uid) === 0) {
    const investments = [
      { user_id: uid, name: 'Fintual Risky Norris (fondo acciones)', type: 'Mutual Fund', current_value: 9200000, purchase_price: 7500000, currency: 'CLP', notes: 'Fondo mutuo acciones globales — objetivo a 5+ años' },
      { user_id: uid, name: 'APV (Ahorro Previsional Voluntario)', type: 'Pension', current_value: 3800000, purchase_price: 3200000, currency: 'CLP', notes: 'AFP Habitat + aporte voluntario mensual CLP 150,000' },
    ];
    const { data, error } = await sb.from('investments').insert(investments).select();
    ok('investments', data, error);
  }

  if (await cnt('habits', uid) === 0) {
    const habits = [
      { user_id: uid, name: 'Prueba y desarrolla 1 receta nueva', frequency: 'weekdays', target_count: 1, color: '#F59E0B', icon: '🍳' },
      { user_id: uid, name: 'Fotografía o video para redes', frequency: 'daily', target_count: 1, color: '#EC4899', icon: '📸' },
      { user_id: uid, name: 'Avanzar en manuscrito libro', frequency: 'weekdays', target_count: 1, color: '#8B5CF6', icon: '✍️' },
      { user_id: uid, name: 'Visitar mercado / productores locales', frequency: 'weekly', target_count: 1, color: '#10B981', icon: '🌿' },
      { user_id: uid, name: 'Yoga o pilates (estudio Providencia)', frequency: 'weekly', target_count: 3, color: '#3B82F6', icon: '🧘' },
    ];
    const { data: hd, error: he } = await sb.from('habits').insert(habits).select();
    ok('habits', hd, he);

    if (hd?.length) {
      const logs = [];
      for (let offset = 0; offset < 21; offset++) {
        const date = dateOffset(offset);
        const dow = DOW[new Date(date + 'T00:00:00Z').getUTCDay()];
        for (const h of hd) {
          const isWeekday = !['Sat', 'Sun'].includes(dow);
          if (h.frequency === 'weekdays' && !isWeekday) continue;
          if (Math.random() < 0.82) {
            logs.push({ user_id: uid, habit_id: h.id, completed_at: date, count: 1 });
          }
        }
      }
      const { data, error } = await sb.from('habit_logs').insert(logs).select();
      ok('habit_logs', data, error);
    }
  }

  if (await cnt('nutrition_targets', uid) === 0) {
    const { data, error } = await sb.from('nutrition_targets').insert({
      user_id: uid,
      calories: 2000,
      protein_g: 65,
      carbs_g: 240,
      fat_g: 70,
      fiber_g: 30,
      notes: 'Vegetariana — proteínas de legumbres, quínoa, tofu, huevo. Alta fibra por vegetales frescos',
    }).select();
    ok('nutrition_targets', data, error);
  }

  if (await cnt('recipes', uid) === 0) {
    const recipes = [
      { user_id: uid, name: 'Pastel de choclo con relleno de champiñones', cuisine: 'chilena', diet: ['vegetarian'], servings: 6, prep_time_minutes: 45, cook_time_minutes: 35, calories_per_serving: 380, ingredients: [{ name: 'choclo', amount: '1kg' }, { name: 'champiñones', amount: '500g' }, { name: 'cebolla', amount: '2 unidades' }, { name: 'albahaca', amount: '1 taza' }], instructions: 'Moler choclo. Sofreír champiñones con cebolla. Armar capas en fuente, hornear 35 min a 180°C.' },
      { user_id: uid, name: 'Cazuela de zapallo con merkén', cuisine: 'chilena', diet: ['vegetarian', 'vegan'], servings: 4, prep_time_minutes: 20, cook_time_minutes: 40, calories_per_serving: 290, ingredients: [{ name: 'zapallo', amount: '800g' }, { name: 'papa', amount: '4 unidades' }, { name: 'merkén', amount: '1 cdita' }, { name: 'cilantro', amount: 'al gusto' }], instructions: 'Hervir zapallo y papas en caldo. Agregar merkén, sazonar, decorar con cilantro.' },
      { user_id: uid, name: 'Empanadas de espinaca y queso', cuisine: 'chilena', diet: ['vegetarian'], servings: 12, prep_time_minutes: 60, cook_time_minutes: 25, calories_per_serving: 220, ingredients: [{ name: 'harina', amount: '3 tazas' }, { name: 'espinaca', amount: '300g' }, { name: 'queso', amount: '200g' }], instructions: 'Preparar masa. Rellenar con espinaca blanqueada y queso. Hornear 25 min a 200°C.' },
    ];
    const { data, error } = await sb.from('recipes').insert(recipes).select();
    ok('recipes', data, error);
  }

  if (await cnt('focus_sessions', uid) === 0) {
    const sessions = [
      { user_id: uid, duration_minutes: 120, type: 'recipe_dev', notes: 'Desarrollo recetas capítulo "Cocina Mapuche" del libro — piñón, quínoa negra, hierbas del sur', completed_at: '2026-05-05T15:00:00Z' },
      { user_id: uid, duration_minutes: 90, type: 'photo', notes: 'Sesión fotografía pastel de choclo + cazuela — 40 fotos, selección de 8 para blog', completed_at: '2026-05-07T14:00:00Z' },
      { user_id: uid, duration_minutes: 60, type: 'writing', notes: 'Manuscrito libro cap 3 — escritura y edición 1,200 palabras sobre historia del merkén', completed_at: '2026-05-09T16:00:00Z' },
    ];
    const { data, error } = await sb.from('focus_sessions').insert(sessions).select();
    ok('focus_sessions', data, error);
  }

  if (await cnt('decision_logs', uid) === 0) {
    const decisions = [
      { user_id: uid, title: 'Condimentos artesanales: producir yo misma vs tercerizar?', options: ['Producción propia: mayor control calidad, costos altos, escalabilidad limitada', 'Maquilador especializado (Alimentos San Jorge): escala inmediata, menor margen', 'Comenzar producción propia limitada + evaluar maquilador en fase 2'], chosen_option: 'Comenzar producción propia limitada + evaluar maquilador en fase 2', outcome_notes: 'Piloto artesanal (50 unidades) para validar fórmulas + precio. Si funciona, maquilador en 2027', decided_at: '2026-05-07T18:00:00Z' },
    ];
    const { data, error } = await sb.from('decision_logs').insert(decisions).select();
    ok('decision_logs', data, error);
  }

  console.log('\n✅ Ana Vargas seed complete\n');
}

seed().catch(e => { console.error('Fatal:', e); process.exit(1); });
