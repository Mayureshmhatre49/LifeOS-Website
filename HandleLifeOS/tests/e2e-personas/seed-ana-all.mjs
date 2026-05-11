/**
 * Seed: Ana González — Food Blogger & Recipe Developer, Santiago, Chile (CLP)
 * Email: ana.gonzalez@e2e-test.handlelifeos.app
 * Persona #37 — Chilean food content creator, 580K Instagram, cookbook deal, artisan market, brand deals
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

const EMAIL = 'ana.gonzalez@e2e-test.handlelifeos.app'

async function cnt(table, uid) {
  const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
  return count ?? 0
}

export async function seedAna() {
  // 1. Resolve user id
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) throw listErr
  const user = users.find(u => u.email === EMAIL)
  if (!user) throw new Error(`User ${EMAIL} not found — create auth account first`)
  const uid = user.id

  // 2. Profile
  await sb.from('profiles').upsert({
    id: uid,
    display_name: 'Ana González',
    occupation: 'Food Blogger, Desarrolladora de Recetas & Autora de Cocina Chilena',
    life_stage: 'early_career',
    country: 'CL',
    currency: 'CLP',
    timezone: 'America/Santiago',
    goals: [
      'Publicar "Raíces: Cocina Chilena Contemporánea" — entrega editorial noviembre 2026',
      'Crecer Instagram a 700K seguidores con foco en cocina con identidad',
      'Lanzar academia online de recetas chilenas — meta 500 alumnos año 1',
      'Ahorrar CLP 18M para departamento propio en Providencia para 2027'
    ],
    memory_enabled: true
  }, { onConflict: 'id' })

  // 3. Budgets (idempotency: month + year + category)
  const budgets = [
    { user_id: uid, month: 4, year: 2026, category: 'Housing', budgeted: 780000, spent: 780000, currency: 'CLP' },
    { user_id: uid, month: 4, year: 2026, category: 'Food', budgeted: 600000, spent: 720000, currency: 'CLP' },
    { user_id: uid, month: 4, year: 2026, category: 'Business', budgeted: 800000, spent: 680000, currency: 'CLP' },
    { user_id: uid, month: 4, year: 2026, category: 'Transport', budgeted: 150000, spent: 128000, currency: 'CLP' },
    { user_id: uid, month: 4, year: 2026, category: 'Savings', budgeted: 800000, spent: 800000, currency: 'CLP' },
    { user_id: uid, month: 5, year: 2026, category: 'Housing', budgeted: 780000, spent: 390000, currency: 'CLP' },
    { user_id: uid, month: 5, year: 2026, category: 'Food', budgeted: 600000, spent: 310000, currency: 'CLP' },
    { user_id: uid, month: 5, year: 2026, category: 'Business', budgeted: 800000, spent: 380000, currency: 'CLP' },
    { user_id: uid, month: 5, year: 2026, category: 'Savings', budgeted: 800000, spent: 800000, currency: 'CLP' },
  ]
  for (const bm of budgets) {
    const { count } = await sb.from('budgets').select('*', { count: 'exact', head: true })
      .eq('user_id', uid).eq('month', bm.month).eq('year', bm.year).eq('category', bm.category)
    if (!count) await sb.from('budgets').insert(bm)
  }

  // 4. Expenses
  if (await cnt('expenses', uid) === 0) {
    await sb.from('expenses').insert([
      { user_id: uid, amount: 780000, currency: 'CLP', category: 'rent', description: 'Arriendo — departamento Providencia, 2 dormitorios (abril)', expense_date: '2026-04-01' },
      { user_id: uid, amount: 380000, currency: 'CLP', category: 'food', description: 'Ingredientes recetas libro — centolla, machas, cochayuyo, merkén (Mercado Central)', expense_date: '2026-04-04' },
      { user_id: uid, amount: 220000, currency: 'CLP', category: 'misc', description: 'Sesión fotográfica — 4 horas con Valentina (food photography para recetas del libro)', expense_date: '2026-04-08' },
      { user_id: uid, amount: 128000, currency: 'CLP', category: 'transport', description: 'Metro + Cabify — Mercado Central, Jumbo sponsor, Mercado Los Dominicos', expense_date: '2026-04-12' },
      { user_id: uid, amount: 340000, currency: 'CLP', category: 'food', description: 'Ingredientes adicionales — prueba de recetas para capítulo Patagonia (cordero, calafate)', expense_date: '2026-04-16' },
      { user_id: uid, amount: 180000, currency: 'CLP', category: 'misc', description: 'Dominio web + renovación hosting + plugin newsletter (ConvertKit)', expense_date: '2026-04-20' },
      { user_id: uid, amount: 95000, currency: 'CLP', category: 'entertainment', description: 'Cena de investigación — restaurantes chilenos contemporáneos (Boragó + 99 Santiago)', expense_date: '2026-04-24' },
      { user_id: uid, amount: 780000, currency: 'CLP', category: 'rent', description: 'Arriendo — Providencia (mayo)', expense_date: '2026-05-01' },
      { user_id: uid, amount: 420000, currency: 'CLP', category: 'travel', description: 'Viaje Puerto Montt — ingredientes del sur, fotografía de terreno para capítulo Chiloé', expense_date: '2026-05-05' },
      { user_id: uid, amount: 160000, currency: 'CLP', category: 'food', description: 'Mercado Los Dominicos — stand insumos + ingredientes varios semana', expense_date: '2026-05-09' },
    ])
  }

  // 5. Habits
  if (await cnt('habits', uid) === 0) {
    await sb.from('habits').insert([
      {
        user_id: uid, name: 'Receta nueva — 3 por semana', description: 'Desarrollar, probar y documentar 3 recetas semanales para libro + contenido. Cocinar es el trabajo.', frequency: 'weekly',
        target_count: 3, current_streak: 8, longest_streak: 22, completed_today: false,
        category: 'work', color: '#f59e0b', icon: '🍲', reminder_time: '10:00', active: true, created_at: '2026-01-10T00:00:00Z'
      },
      {
        user_id: uid, name: 'Posteo Instagram — reel diario', description: 'Un reel de cocina diario. Algoritmo de Instagram premia consistencia brutal.', frequency: 'daily',
        target_count: 1, current_streak: 14, longest_streak: 35, completed_today: true,
        category: 'work', color: '#ec4899', icon: '📸', reminder_time: '19:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Escritura del libro — 1 hora', description: 'El libro no se escribe solo. Una hora de escritura de headnotes y contexto cultural de las recetas.', frequency: 'daily',
        target_count: 1, current_streak: 10, longest_streak: 28, completed_today: true,
        category: 'work', color: '#8b5cf6', icon: '✍️', reminder_time: '08:00', active: true, created_at: '2026-02-01T00:00:00Z'
      },
      {
        user_id: uid, name: 'Mercado Los Dominicos — sábado', description: 'Venta directa en el mercado artesanal. Contacto con público real. Mejor feedback que cualquier analítica.', frequency: 'weekly',
        target_count: 1, current_streak: 6, longest_streak: 18, completed_today: false,
        category: 'work', color: '#10b981', icon: '🏪', reminder_time: '09:00', active: true, created_at: '2026-02-15T00:00:00Z'
      },
      {
        user_id: uid, name: 'APV mensual — ahorro departamento', description: 'CLP 500K a APV Ahorro Previsional Voluntario cada mes. Disciplina de ahorro no negociable.', frequency: 'monthly',
        target_count: 1, current_streak: 5, longest_streak: 12, completed_today: false,
        category: 'finance', color: '#3b82f6', icon: '🏠', reminder_time: '10:00', active: true, created_at: '2026-01-01T00:00:00Z'
      },
    ])
  }

  // 6. Focus sessions
  if (await cnt('focus_sessions', uid) === 0) {
    await sb.from('focus_sessions').insert([
      {
        user_id: uid, mode: 'deep', planned_minutes: 240, actual_minutes: 238, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Libro cap. 5 — Patagonia: cordero asado, calafate, centolla. Desarrollo de 8 recetas',
        notes: 'Las 8 recetas del capítulo Patagonia quedan probadas y documentadas. Calafate mousse salió increíble — la editorial lo quiere como foto de portada de capítulo.',
        started_at: '2026-04-10T09:00:00Z', ended_at: '2026-04-10T13:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 120, actual_minutes: 115, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Jumbo Chile partnership renewal — propuesta de contenido Q3 2026',
        notes: 'Propuesta enviada: 8 recetas/mes con productos Jumbo + 4 reels patrocinados. Solicitando CLP 2.8M/mes (20% alza). Respuesta en 2 semanas.',
        started_at: '2026-04-17T14:00:00Z', ended_at: '2026-04-17T16:00:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 90, actual_minutes: 45, completed: false,
        abandoned: true, body_doubling_enabled: false, task_title: 'Academia online — estructura de módulos y precios',
        notes: 'Abandonó a los 45 min — editorial escribió con correcciones urgentes del capítulo 3. Libro tiene prioridad.',
        started_at: '2026-04-29T20:00:00Z', ended_at: '2026-04-29T20:45:00Z'
      },
      {
        user_id: uid, mode: 'deep', planned_minutes: 180, actual_minutes: 182, completed: true,
        abandoned: false, body_doubling_enabled: false, task_title: 'Viaje Puerto Montt — investigación de campo capítulo Chiloé, 12 recetas fotografiadas',
        notes: 'Curanto en hoyo con familia Nahuel en Achao. 12 recetas documentadas en terreno. Fotos auténticas de cocina rural chilota. Esto es el alma del libro.',
        started_at: '2026-05-06T08:00:00Z', ended_at: '2026-05-06T11:02:00Z'
      },
    ])
  }

  // 7. Mood logs
  if (await cnt('mood_logs', uid) === 0) {
    await sb.from('mood_logs').insert([
      { user_id: uid, mood: 5, energy: 5, note: 'Editorial dijo que el calafate mousse es "la foto de portada de capítulo." Tres años de trabajo y hay un momento así cada tanto que lo justifica todo.', logged_at: '2026-04-11T21:00:00Z' },
      { user_id: uid, mood: 4, energy: 3, note: 'Mercado Dominicos: 580 personas en el stand hoy. Agotada pero llena de energía. El contacto humano que el Instagram no puede dar.', logged_at: '2026-04-26T20:00:00Z' },
      { user_id: uid, mood: 3, energy: 2, note: 'Correcciones del cap. 3 de la editorial. 14 páginas de comentarios. Frustración pura. Después lo leo y tienen razón en el 80%. Editors are brutal but necessary.', logged_at: '2026-04-30T22:00:00Z' },
      { user_id: uid, mood: 5, energy: 5, note: 'Chiloé fue transformador. La señora Nahuel me enseñó el curanto que su abuela le enseñó. Eso no se inventa. El libro tiene alma ahora.', logged_at: '2026-05-07T21:00:00Z' },
    ])
  }

  // 8. Gratitude entries (UNIQUE user_id + date)
  const gratitudeDates = [
    { date: '2026-04-11', items: ['La editorial que cree en la cocina chilena como arte', 'Los productores del Mercado Central que me enseñan la materia prima', 'El calafate que crece en Patagonia y no existe en ningún otro lugar del mundo'] },
    { date: '2026-04-26', items: ['Las 580 personas del stand que cocinan mis recetas en sus casas', 'Valentina mi fotógrafa que entiende la estética que busco', 'Esta profesión ridícula y maravillosa'] },
    { date: '2026-05-07', items: ['La señora Nahuel de Achao que compartió su curanto conmigo', 'Chile y toda la diversidad geográfica que tiene — de Atacama a la Patagonia', 'El libro que por fin tiene corazón real'] },
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
        user_id: uid, title: 'Chiloé y el Curanto de la Señora Nahuel',
        content: 'Llegué a Achao con mi cámara y un cuaderno. Me senté en la cocina de una familia que lleva cuatro generaciones haciendo curanto en hoyo. La señora Nahuel, 74 años, dijo: "Aprende mirando, no preguntando." Cuatro horas después entendí por qué el libro no podía escribirse desde Santiago. La cocina chilena no está en los restaurantes de Lastarria. Está acá.',
        mood: 5, tags: ['libro', 'Chiloé', 'cultura', 'investigación'], created_at: '2026-05-07T22:00:00Z'
      },
      {
        user_id: uid, title: 'La Oferta de Jumbo — ¿Exclusividad o Libertad?',
        content: 'Jumbo me ofrece CLP 3.2M/mes por exclusividad retail en contenido de recetas. No podría trabajar con Líder, SMU, ni ningún otro supermercado. Es mucho dinero. Pero Nestlé también me paga y son categorías distintas. La exclusividad de Jumbo mataría el 40% de mi portfolio de marcas. Necesito que mi abogado lea bien el contrato antes de responder.',
        mood: 3, tags: ['decisión', 'negocio', 'marcas'], created_at: '2026-04-22T23:00:00Z'
      },
    ])
  }

  // 10. Decision logs
  if (await cnt('decision_logs', uid) === 0) {
    await sb.from('decision_logs').insert([
      {
        user_id: uid,
        question: "Aceptar exclusividad retail con Jumbo Chile (CLP 3.2M/mes) o mantener independencia de contenido para trabajar con múltiples marcas?",
        category: 'Business',
        mode: 'analyze',
        options: [
          { label: 'Aceptar exclusividad Jumbo', pros: ['CLP 3.2M garantizado mensual — 40% más que propuesta actual', 'Jumbo tiene 47 tiendas — exposición masiva nacional', 'Recursos de producción + fotografía cubiertos por la marca'], cons: ['No puede trabajar con Líder ni SMU (pierdo CLP 1.4M/mes)', 'Riesgo concentración: un cliente = 65% de ingresos', 'Pérdida de credibilidad editorial independiente'] },
          { label: 'Mantener independencia — múltiples marcas', pros: ['Diversificación de ingresos — 4 clientes actuales', 'Libertad editorial total: cocino lo que quiero con lo que quiero', 'Reputación de curador auténtico vs. portavoz corporativo'], cons: ['Ingreso variable mes a mes', 'Negociación continua con múltiples clientes', 'Sin la estabilidad del cheque garantizado de Jumbo'] }
        ],
        result: { summary: 'Exclusividad de retail supermercado es prematura antes del lanzamiento del libro. El libro construye valor de marca independiente. Recommend: counter-proposta — no-exclusivity, CLP 2.4M/mes por 8 contenidos/mes.', chosen: 'Counter-propuesta no-exclusiva a Jumbo', outcome: 'pending' },
        favorite: true,
        created_at: '2026-04-23T10:00:00Z'
      },
      {
        user_id: uid,
        question: 'Lanzar academia online de cocina chilena antes del libro (Q3 2026) o después del lanzamiento editorial (Q1 2027)?',
        category: 'Business',
        mode: 'compare',
        options: [
          { label: 'Academia pre-libro — Q3 2026', pros: ['Genera ingresos mientras escribo', 'Construye audiencia de compradores del libro', 'Beta test del contenido pedagógico'], cons: ['Divide atención del manuscrito en período crítico', 'Si academia es mediocre, daña marca antes del libro', 'Editorial puede ver conflicto de intereses'] },
          { label: 'Academia post-libro — Q1 2027', pros: ['Libro establece autoridad y credibilidad', 'Academia capitaliza momentum del lanzamiento editorial', 'Atención total en libro hasta noviembre'], cons: ['Sin ingresos de academia durante 8 meses', 'Audiencia que quiere aprender espera', 'Competidores pueden llenar el espacio'] }
        ],
        result: { summary: 'Post-libro es la secuencia correcta. El libro construye la autoridad que convierte en inscripciones de academia. Lista de espera pre-lanzamiento es suficiente para medir demanda sin lanzar.', chosen: 'Academia Q1 2027 post-libro, lista de espera desde Q4 2026', outcome: 'pending' },
        favorite: false,
        created_at: '2026-05-04T09:00:00Z'
      }
    ])
  }

  // 11. Investments
  if (await cnt('investments', uid) === 0) {
    await sb.from('investments').insert([
      { user_id: uid, name: 'APV BCI Vida — Fondo Mutuo Balanceado', type: 'mutual_fund', invested_amount: 6500000, current_value: 7200000, currency: 'CLP', account: 'BCI Vida Seguros', notes: 'Ahorro Previsional Voluntario. CLP 500K/mes. Rebaja tributaria + rentabilidad. Meta: departamento 2027.', purchase_date: '2023-01-01' },
      { user_id: uid, name: 'Depósito a Plazo BancoEstado — 180 días', type: 'savings', invested_amount: 4000000, current_value: 4280000, currency: 'CLP', account: 'BancoEstado', notes: 'Tasa TAE 7%. Renovación automática cada 6 meses. Fondo de emergencia — no tocar.', purchase_date: '2025-11-01' },
      { user_id: uid, name: 'Fondo Mutuo Santander Chile — Renta Variable', type: 'mutual_fund', invested_amount: 2800000, current_value: 3150000, currency: 'CLP', account: 'Banco Santander Chile', notes: 'Exposición a IPSA + renta variable nacional. Largo plazo — horizonte 5 años.', purchase_date: '2024-06-01' },
    ])
  }

  // 12. Business clients
  if (await cnt('business_clients', uid) === 0) {
    const { data: clients } = await sb.from('business_clients').insert([
      { user_id: uid, name: 'Jumbo Chile — Marketing de Contenidos', email: 'marketing@jumbo.cl', company: 'Cencosud Jumbo', notes: 'Principal cliente retail. 8 recetas/mes con productos Jumbo. CLP 2.3M/mes actual. Propuesta exclusividad en negociación.', currency: 'CLP' },
      { user_id: uid, name: 'Nestlé Chile — Comunicaciones', email: 'brand@nestle.cl', company: 'Nestlé Chile', notes: 'Embajadora de marca MAGGI + Milo. 4 posts/mes + 1 receta exclusiva. CLP 1.4M/mes. No compete con exclusividad retail.', currency: 'CLP' },
      { user_id: uid, name: 'Editorial Planeta Chile', email: 'recetas@planeta.cl', company: 'Editorial Planeta', notes: 'Contrato para libro "Raíces: Cocina Chilena Contemporánea". Anticipo CLP 8M (pagado en 3 cuotas). Entrega manuscrito noviembre 2026.', currency: 'CLP' },
      { user_id: uid, name: 'Mercado Vivo — Feria Artesanal', email: 'info@mercadovivo.cl', company: 'Mercado Vivo', notes: 'Stand cada sábado en Mercado Los Dominicos. Venta directa: salsas, mermeladas, mixes de especias. Arriendo stand CLP 85K/mes.', currency: 'CLP' },
    ]).select()

    if (clients && clients.length) {
      await sb.from('business_projects').insert([
        { user_id: uid, client_id: clients[0].id, name: 'Jumbo Q3 2026 — Contenido de Recetas (propuesta)', status: 'proposal', fee: 8400000, currency: 'CLP', notes: 'CLP 2.8M/mes × 3 meses. Counter-propuesta sin exclusividad. 8 recetas/mes con fotografía Valentina. Respuesta esperada 30 abril.', due_date: '2026-09-30' },
        { user_id: uid, client_id: clients[1].id, name: 'Nestlé Chile H2 2026 — Embajadora MAGGI', status: 'active', fee: 8400000, currency: 'CLP', notes: 'CLP 1.4M/mes × 6 meses. Deliverables: 4 posts + 1 receta exclusiva con productos MAGGI por mes. Contrato firmado.', due_date: '2026-12-31' },
        { user_id: uid, client_id: clients[2].id, name: 'Raíces — Manuscrito Final (nov 2026)', status: 'active', fee: 2600000, currency: 'CLP', notes: 'Tercer tranche del anticipo (CLP 2.6M) pagadero contra entrega del manuscrito completo. 65% del libro listo.', due_date: '2026-11-30' },
      ])
    }
  }

  // 13. Contacts
  if (await cnt('contacts', uid) === 0) {
    await sb.from('contacts').insert([
      { user_id: uid, name: 'Valentina Riquelme', email: 'val@valriquelme.cl', phone: '+56912345678', group_name: 'Business', notes: 'Fotógrafa de comida. Lleva 3 años trabajando con Ana. Entiende la estética y no necesita dirección excesiva. La mejor inversión de la marca.' },
      { user_id: uid, name: 'Rodrigo Arenas', email: 'rodrigo@planetachile.cl', phone: '+56923456789', group_name: 'Business', notes: 'Editor en Planeta Chile. Exigente pero justo. Las correcciones del cap. 3 dolieron pero tenía razón. Confianza editorial mutua.' },
      { user_id: uid, name: 'Mamá — Carmen González', email: '', phone: '+56934567890', group_name: 'Family', notes: 'Concepción. La cocinera más importante de la vida de Ana. Receta de cazuela que aparece en el capítulo 2 es de ella. Hablar cada domingo.' },
      { user_id: uid, name: 'Cristóbal Muñoz (Boragó)', email: 'chef@borago.cl', phone: '+56945678901', group_name: 'Mentors', notes: 'Chef Boragó Santiago. Mentor informal — charla de 1 hora hace 2 años cambió el enfoque de Ana hacia ingredientes nativos. Seguimiento anual.' },
    ])
  }

  // 14. Career goals
  if (await cnt('career_goals', uid) === 0) {
    await sb.from('career_goals').insert([
      {
        user_id: uid, title: 'Entregar manuscrito "Raíces" — noviembre 2026', category: 'role',
        description: 'Libro 65% completo. Capítulos pendientes: Norte Grande (Atacama), Valle Central, Patagonia final. Fotografías de terreno incluidas.',
        target_date: '2026-11-30', status: 'active', progress_pct: 65
      },
      {
        user_id: uid, title: 'Crecer Instagram a 700K seguidores', category: 'impact',
        description: 'Actualmente 580K. Meta: reels diarios + colaboraciones quincenales + lives de cocina en vivo cada viernes.',
        target_date: '2026-12-31', status: 'active', progress_pct: 83
      },
      {
        user_id: uid, title: 'Ahorrar CLP 18M para pie departamento Providencia', category: 'income',
        description: 'APV BCI: CLP 6.5M actual + CLP 500K/mes. Depósito a plazo: CLP 4M. Meta total CLP 18M en 18 meses.',
        target_date: '2027-06-30', status: 'active', progress_pct: 58
      },
      {
        user_id: uid, title: 'Lanzar lista de espera academia online', category: 'other',
        description: 'No lanzar academia hasta post-libro. Sí capturar lista de espera desde Q4 2026. Meta: 1,000 personas en lista antes del lanzamiento.',
        target_date: '2026-12-31', status: 'active', progress_pct: 0
      },
    ])
  }

  // 15. Trip — Puerto Montt / Chiloé research
  if (await cnt('trips', uid) === 0) {
    const { data: trips } = await sb.from('trips').insert([
      {
        user_id: uid, destination: 'Puerto Montt y Chiloé, Chile', country_code: 'CL',
        starts_on: '2026-05-05', ends_on: '2026-05-08',
        purpose: 'business', status: 'completed',
        budget_total: 620000, currency: 'CLP',
        notes: 'Investigación de campo para capítulo Chiloé del libro. Curanto en hoyo con familia Nahuel en Achao. 12 recetas documentadas. Fotos auténticas de cocina rural. Transformador.'
      },
      {
        user_id: uid, destination: 'Buenos Aires, Argentina — Worlds of Food BA', country_code: 'AR',
        starts_on: '2026-08-20', ends_on: '2026-08-24',
        purpose: 'business', status: 'planning',
        budget_total: 980000, currency: 'CLP',
        notes: 'Congreso internacional de gastronomía. Presentación: "Identidad y terroir en la cocina chilena contemporánea." Contactos editoriales Argentina para distribución libro.'
      }
    ]).select()

    if (trips && trips.length) {
      await sb.from('trip_items').insert([
        { trip_id: trips[0].id, type: 'flight', title: 'SCL → PMC — JetSMART directo', starts_at: '2026-05-05T07:00:00Z', ends_at: '2026-05-05T09:00:00Z', cost: 85000, currency: 'CLP', notes: 'Vuelo directo Santiago-Puerto Montt. Con la cámara en cabina.' },
        { trip_id: trips[0].id, type: 'transport', title: 'Ferry Puerto Montt → Castro, Chiloé', starts_at: '2026-05-05T14:00:00Z', ends_at: '2026-05-05T18:00:00Z', cost: 28000, currency: 'CLP', notes: 'Navimag ferry. El trayecto es parte del libro — paisaje increíble.' },
        { trip_id: trips[0].id, type: 'hotel', title: 'Hostal Familia Nahuel — Achao, Chiloé (3 noches)', starts_at: '2026-05-05T19:00:00Z', ends_at: '2026-05-08T10:00:00Z', cost: 120000, currency: 'CLP', notes: 'Familia que tiene el curanto. Alojamiento incluido a cambio de recetas compartidas. Inmersión total.' },
        { trip_id: trips[0].id, type: 'activity', title: 'Curanto en hoyo — investigación y documentación fotográfica', starts_at: '2026-05-06T08:00:00Z', ends_at: '2026-05-06T18:00:00Z', cost: 0, currency: 'CLP', notes: 'La señora Nahuel explicó cada paso. 12 recetas del capítulo Chiloé documentadas con ingredientes reales.' },
      ])
    }
  }

  // 16. Meal plans (food developer — varied and purposeful)
  if (await cnt('meal_plans', uid) === 0) {
    const weekStart = '2026-05-11'
    await sb.from('meal_plans').insert([
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'breakfast', recipe_name: 'Pan amasado + mermelada de calafate + café', calories: 480, notes: 'Desayuno chileno clásico — probando receta del libro cap. 1' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'lunch', recipe_name: 'Cazuela de vacuno con choclo y zapallo', calories: 720, notes: 'Receta de la mamá — para el capítulo Valle Central, prueba número 3' },
      { user_id: uid, week_start: weekStart, day_of_week: 1, meal_type: 'dinner', recipe_name: 'Ensalada chilena + huevos revueltos', calories: 420, notes: 'Noche simple — después de cocinar todo el día no quiero cocinar' },
      { user_id: uid, week_start: weekStart, day_of_week: 3, meal_type: 'lunch', recipe_name: 'Pastel de jaiba gratinado', calories: 580, notes: 'Receta con centolla de Chiloé — fotografía mañana con Valentina' },
      { user_id: uid, week_start: weekStart, day_of_week: 6, meal_type: 'breakfast', recipe_name: 'Sopaipillas con pebre — sábado de feria', calories: 520, notes: 'Desayuno rápido antes del stand en Mercado Los Dominicos (8am apertura)' },
    ])
  }

  console.log('✅ Ana González (#37) seeded — CLP, Santiago, food blogger 580K IG, cookbook "Raíces", Chiloé field research')
}

seedAna().catch(e => { console.error(e); process.exit(1) })
