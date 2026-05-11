/**
 * Full seed for Carlos Rodriguez — Freelance Architect in Mexico City.
 * Run: node tests/e2e-personas/seed-carlos-all.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const SUPABASE_URL = 'https://naepvenbgmmapxfgekmh.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXB2ZW5iZ21tYXB4Zmdla21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2MDg3OCwiZXhwIjoyMDkyMDM2ODc4fQ.1PeAW-YqKgqYT5mhbUW-dIxLkSGv43dNS_sqV5pg6DM'
const UID          = 'de0d28c2-f328-42ef-9544-44c004b6b089'

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const hash = t => createHash('sha256').update(t).digest('hex')
function ok(label, error) { if (error) { console.log(`  ✗  ${label}: ${error.message}`); return false } console.log(`  ✔  ${label}`); return true }
async function ins(table, row, label) { const { data, error } = await db.from(table).insert(row).select().single(); ok(label ?? table, error); return data }

function dateOffset(i) { const d = new Date('2026-04-19'); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) }
const DOW = Array.from({ length: 21 }, (_, i) => (0 + i) % 7)

async function seedMemory() {
  console.log('\n🧠  Seeding memory...')
  const { error } = await db.from('profiles').upsert({
    id: UID, display_name: 'Carlos Rodriguez', occupation: 'Freelance Architect', life_stage: 'early_career',
    country: 'MX', currency: 'MXN', timezone: 'America/Mexico_City', preferred_language: 'es',
    goals: [
      'Abrir Estudio Rodriguez Arquitectura con un socio antes de diciembre 2027',
      'Obtener certificación LEED AP BD+C en 2026 para especializarme en arquitectura sustentable',
      'Viajar a Tokio y Kioto — arquitectura japonesa ha sido inspiración desde la universidad',
      'Pagar deuda de tarjeta y ahorrar MXN 150,000 de fondo de emergencia',
    ],
    memory_enabled: true,
  }, { onConflict: 'id' })
  if (error) console.log(`  ✗  profile: ${error.message}`)
  else console.log('  ✔  profile: Carlos Rodriguez (Architect, CDMX)')

  const items = [
    { type: 'fact',         key: 'monthly_income',        value: 'MXN 45,000–70,000 por proyecto/mes dependiendo de carga de trabajo — promedio MXN 52,000 en Q1 2026' },
    { type: 'fact',         key: 'home_location',          value: 'Depto 3B, Colonia Condesa, Ciudad de México — renta MXN 14,500/mes, 55m², 1 recámara' },
    { type: 'fact',         key: 'vehicle',                value: 'Sin automóvil — usa bicicleta eléctrica Benotto para desplazamientos en CDMX y Metro para el resto' },
    { type: 'fact',         key: 'education',              value: 'Arquitecto — UNAM Facultad de Arquitectura, titulado 2019. Maestría en Diseño Urbano en proceso (ITESM online).' },
    { type: 'fact',         key: 'languages',              value: 'Español (nativo), Inglés (nivel B2 — mejorando activamente), Portugués (básico)' },
    { type: 'preference',   key: 'work_style',             value: 'Horario de trabajo 9am–6pm CDMX; mañanas dedicadas a diseño creativo; tardes a clientes y administrativo. Usa AutoCAD, Revit, SketchUp y Rhino.' },
    { type: 'preference',   key: 'diet',                   value: 'Omnívoro pero cocina frecuentemente en casa. Reduce carne roja a 2×/semana por salud y costo. Le encantan los tacos de canasta y la comida oaxaqueña.' },
    { type: 'preference',   key: 'communication_style',    value: 'Colaborativo y visual — prefiere presentaciones con renders sobre documentos de texto. Muy organizado con archivos de proyecto.' },
    { type: 'preference',   key: 'reading_preferences',    value: 'Arquitectura (Zaha Hadid, Tadao Ando), urbanismo sostenible, ciencia ficción latinoamericana. Meta: 2 libros al mes.' },
    { type: 'goal',         key: 'business_goal',          value: 'Crear Estudio Rodriguez Arquitectura — 3 proyectos simultáneos, 2 socios, enfocado en arquitectura residencial sustentable en CDMX' },
    { type: 'goal',         key: 'financial_goal',         value: 'Ahorrar MXN 150,000 de fondo de emergencia (actualmente en MXN 38,000) y liquidar tarjeta BBVA (MXN 22,000 de saldo)' },
    { type: 'goal',         key: 'professional_goal',      value: 'Certificación LEED AP BD+C — examen programado septiembre 2026. Permitirá cobrar 20% más en proyectos sustentables.' },
    { type: 'concern',      key: 'cash_flow',              value: 'Ingresos irregulares como freelance — meses buenos (MXN 70K) seguidos de meses bajos (MXN 30K). Necesita buffer financiero más robusto.' },
    { type: 'concern',      key: 'client_concentration',   value: 'Desarrolladora Habitat representa 60% de los ingresos — demasiada dependencia de un solo cliente. Diversificar en Q3.' },
    { type: 'relationship', key: 'mentor',                 value: 'Arq. Patricia Vega — socia senior en Taller Vega Arquitectos, CDMX. Mentora desde UNAM. Cumpleaños: 15 noviembre.' },
  ]
  let n = 0
  for (const it of items) { const { error } = await db.from('memory_items').insert({ user_id: UID, source: 'manual', confidence: 95, is_active: true, ...it }); if (!error) n++; else console.log(`  ✗  memory: ${error.message}`) }
  console.log(`  ✔  ${n}/${items.length} memory items`)
}

async function seedHabits() {
  console.log('\n🌱  Seeding habits...')
  const defs = [
    { name: 'Sketch de arquitectura 15 min',  icon: '✏️', color: 'amber',   frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '08:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,19,20] },
    { name: 'Entrenamiento gym / cardio',      icon: '💪', color: 'emerald', frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '07:00', completedOffsets: [1,2,3,4,5,8,9,10,11,15,16,17,18] },
    { name: 'Leer 20 páginas',                icon: '📚', color: 'indigo',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '21:30', completedOffsets: [0,1,2,3,5,6,7,8,9,12,13,14,15,16,18,19,20] },
    { name: 'Estudio inglés 30 min',          icon: '🌍', color: 'sky',     frequency: 'weekdays', days_of_week: [1,2,3,4,5],    reminder_time: '20:00', completedOffsets: [1,2,3,4,5,8,9,10,11,15,16,17,19] },
    { name: 'Meditación 10 min',              icon: '🧘', color: 'violet',  frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '07:30', completedOffsets: [0,1,3,5,6,7,8,10,11,14,15,17,18,20] },
    { name: 'Registrar gastos del día',       icon: '💰', color: 'rose',    frequency: 'daily',    days_of_week: [0,1,2,3,4,5,6], reminder_time: '22:00', completedOffsets: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: 'Estudiar LEED AP 45 min',        icon: '🏗️', color: 'purple',  frequency: 'custom',   days_of_week: [1,3,5],         reminder_time: '19:00', completedOffsets: [1,3,5,8,10,12,15,17,19] },
  ]
  let hOk = 0, lOk = 0
  for (const h of defs) {
    const { completedOffsets, ...row } = h
    const { data: habit, error } = await db.from('habits').insert({ user_id: UID, ...row }).select().single()
    if (error || !habit) { console.log(`  ✗  habit "${h.name}": ${error?.message}`); continue }
    hOk++
    for (const off of completedOffsets) {
      if (!h.days_of_week.includes(DOW[off])) continue
      const { error: le } = await db.from('habit_logs').insert({ habit_id: habit.id, user_id: UID, date: dateOffset(off), count: 1 })
      if (!le) lOk++
    }
  }
  console.log(`  ✔  ${hOk}/${defs.length} habits, ${lOk} habit logs`)
}

async function seedFocus() {
  console.log('\n🎯  Seeding focus...')
  await db.from('focus_preferences').upsert({ user_id: UID, default_mode: 'deep', break_interval_minutes: 5, long_break_minutes: 15, sessions_before_long_break: 4, body_doubling_default: false, daily_focus_goal_minutes: 180 }, { onConflict: 'user_id' })
  console.log('  ✔  focus prefs: 3h/day, deep-work default')

  // CDT = UTC-5; 09:00 CDT = 14:00 UTC
  const sessions = [
    { off: 1,  mode: 'deep',     plan: 90, act: 88, done: true,  title: 'Desarrolladora Habitat — planos arquitectónicos planta baja',   time: '14:00' },
    { off: 2,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Correos a clientes + revisión de presupuestos',                 time: '15:30' },
    { off: 2,  mode: 'deep',     plan: 60, act: 58, done: true,  title: 'Estudio LEED AP: sistemas HVAC sustentables',                   time: '14:00' },
    { off: 3,  mode: 'deep',     plan: 75, act: 72, done: true,  title: 'Café Morada — render 3D exterior (SketchUp)',                   time: '14:00' },
    { off: 4,  mode: 'pomodoro', plan: 25, act: 23, done: true,  title: 'Facturación SAT y registro de gastos',                         time: '15:00' },
    { off: 4,  mode: 'deep',     plan: 60, act: 60, done: true,  title: 'Colonia Arquitectos — análisis de sitio fase 1',               time: '14:00' },
    { off: 5,  mode: 'deep',     plan: 45, act: 40, done: true,  title: 'LEED AP mock test — simulacro sección 1',                      time: '14:00' },
    { off: 5,  mode: 'pomodoro', plan: 25, act: 20, done: false, title: 'Investigación viaje Japón', time: '17:00', abandoned: true },
    { off: 8,  mode: 'deep',     plan: 90, act: 91, done: true,  title: 'Desarrolladora Habitat — plantas alta y sótano + cortes A-A',   time: '14:00' },
    { off: 9,  mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Revisión propuesta Colonia Arquitectos + correcciones cliente', time: '16:00' },
    { off: 9,  mode: 'deep',     plan: 60, act: 57, done: true,  title: 'Estudio LEED AP: envolvente del edificio y eficiencia',        time: '14:00' },
    { off: 10, mode: 'deep',     plan: 90, act: 85, done: true,  title: 'Café Morada — presentación final al cliente (PPT + renders)',   time: '14:00' },
    { off: 11, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Seguimiento pago Café Morada y DH factura',                   time: '16:30' },
    { off: 11, mode: 'deep',     plan: 60, act: 62, done: true,  title: 'Propuesta nueva: Casa en Lomas (cliente referido)',            time: '14:00' },
    { off: 12, mode: 'pomodoro', plan: 25, act: 22, done: true,  title: 'Contabilidad mensual y proyección de ingresos Q2',            time: '15:00' },
    { off: 14, mode: 'deep',     plan: 90, act: 87, done: true,  title: 'Desarrolladora Habitat — memoria descriptiva y especificaciones', time: '14:00' },
    { off: 15, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'Llamadas con proveedores: vidrio templado y concreto CEMEX',  time: '16:00' },
    { off: 15, mode: 'deep',     plan: 60, act: 60, done: true,  title: 'LEED AP estudio: plomería de bajo consumo + captación agua',   time: '14:00' },
    { off: 16, mode: 'deep',     plan: 75, act: 70, done: true,  title: 'Propuesta Estudio Rodriguez: estrategia de marca y portafolio', time: '14:00' },
    { off: 17, mode: 'deep',     plan: 60, act: 58, done: true,  title: 'Colonia Arquitectos — propuesta masterplan zona norte',        time: '14:00' },
    { off: 17, mode: 'pomodoro', plan: 25, act: 18, done: false, title: 'Reservas Oaxaca hotels', time: '17:30', abandoned: true },
    { off: 18, mode: 'deep',     plan: 90, act: 88, done: true,  title: 'Desarrolladora Habitat — correcciones planos sesión 2',        time: '14:00' },
    { off: 18, mode: 'pomodoro', plan: 25, act: 25, done: true,  title: 'LEED AP simulacro completo 3h (240 preguntas)',                time: '19:00' },
    { off: 19, mode: 'deep',     plan: 60, act: 55, done: true,  title: 'Casa Lomas: levantamiento fotográfico y bocetos concepto',     time: '14:00' },
    { off: 20, mode: 'quick',    plan: 15, act: 13, done: true,  title: 'Revisión semanal: avance de proyectos + próxima semana',       time: '15:00' },
  ]
  let n = 0
  for (const s of sessions) {
    const date = dateOffset(s.off)
    const startedAt = `${date}T${s.time}:00Z`
    const endedAt = new Date(new Date(startedAt).getTime() + (s.act ?? s.plan) * 60000).toISOString()
    const { error } = await db.from('focus_sessions').insert({ user_id: UID, mode: s.mode, planned_minutes: s.plan, actual_minutes: s.act ?? null, completed: s.done, abandoned: s.abandoned ?? false, body_doubling_enabled: false, task_title: s.title, started_at: startedAt, ended_at: endedAt })
    if (!error) n++; else console.log(`  ✗  focus: ${error.message}`)
  }
  console.log(`  ✔  ${n}/${sessions.length} focus sessions`)
}

async function seedDecisions() {
  console.log('\n🤔  Seeding decisions...')
  const decisions = [
    {
      question: '¿Debo aceptar el proyecto de Casa en Lomas (MXN 180,000) o priorizar terminar Desarrolladora Habitat primero?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-04-22T14:30:00Z', favorite: true,
      result: {
        summary: 'El proyecto Casa Lomas (MXN 180,000, ~5 meses) es financieramente atractivo pero implica tener 3 proyectos simultáneos activos — Desarrolladora Habitat, Colonia Arquitectos y el nuevo. El riesgo es la calidad: con 3 proyectos en paralelo, Carlos trabaja regularmente 10+ horas/día.',
        recommendation: 'Acepta Casa Lomas con una condición: iniciar formalmente el 1 de junio (cuando DH entre en fase de trámites con poca necesidad de diseño activo). Esto permite capacidad sin comprometer calidad.',
        confidenceScore: 74, riskScore: 42, riskLevel: 'medium',
        financialImpact: { summary: 'MXN 180,000 total en ~5 meses = MXN 36,000/mes adicional. Supera el ingreso promedio actual.', monthlyCostChange: -36000, oneTimeCost: null, opportunityCost: 'Riesgo de calidad en DH si se empalman las fases de diseño intensivo', affordabilityScore: 88 },
        timeImpact: '3 proyectos simultáneos = ~55 horas/semana. Necesita delegar renders a un practicante para absorber la carga.',
        pros: ['MXN 36,000/mes adicional — acelera meta de ahorro MXN 150K', 'Cliente referido por Arq. Patricia Vega — fortalece red', 'Proyecto residencial de alta gama diversifica portafolio más allá de desarrolladores'],
        cons: ['3 proyectos activos es el límite operativo real de un solo arquitecto', 'Sin practicante contratado, la carga es excesiva', 'Riesgo de retraso en Desarrolladora Habitat si surgen problemas en DH'],
        nextSteps: ['Contratar practicante de UNAM o IBERO para renderización (MXN 5,000/mes)', 'Negociar fecha de inicio Casa Lomas: 1 de junio (no antes)', 'Revisar timeline DH con cliente para confirmar fases de baja intensidad en mayo-julio'],
        memoryFactorsUsed: ['Concentración de ingresos en DH: 60%', 'Meta financiera: ahorro MXN 150K'],
        dataSourcesUsed: ['Mercado honorarios arquitectura CDMX 2026'],
      },
    },
    {
      question: '¿Viaje a Oaxaca en junio (solo) o esperar a ir con amigos en agosto?',
      category: 'family', mode: 'compare', options: ['Oaxaca solo — junio', 'Oaxaca con amigos — agosto'],
      created_at: '2026-04-30T14:00:00Z', favorite: false,
      result: {
        question: 'Oaxaca: viaje solo en junio vs con amigos en agosto',
        factors: ['Experiencia personal', 'Costo', 'Flexibilidad itinerario', 'Contexto del viaje', 'Clima'],
        options: [
          { label: 'Oaxaca solo — junio', scores: { 'Experiencia personal': 85, Costo: 75, 'Flexibilidad itinerario': 95, 'Contexto del viaje': 70, Clima: 60 },
            pros: ['Total libertad de itinerario — visitar canteras, talleres de barro negro, Monte Albán sin grupos', 'Junio más tranquilo (pre-temporada alta de turismo extranjero)', 'Descanso real — tiempo para dibujar y escribir'], cons: ['Junio es temporada de lluvias — algunas ruinas y mercados pueden estar afectados', 'Experiencia compartida menos rica sin amigos'], summary: 'Más flexible y auténtico, pero clima arriesgado.' },
          { label: 'Oaxaca con amigos — agosto', scores: { 'Experiencia personal': 75, Costo: 55, 'Flexibilidad itinerario': 55, 'Contexto del viaje': 90, Clima: 85 },
            pros: ['Guelaguetza en julio/agosto — festival cultural único', 'Costo compartido reduce hospedaje', 'Recuerdos compartidos con amigos'], cons: ['Agosto es peak season — precios 40% más altos', 'Llega justo en temporada de Casa Lomas inicio — puede generar estrés por trabajo'], summary: 'Mejor clima y festival pero más caro y con presión de trabajo en agosto.' },
        ],
        recommendation: 'Ve solo en junio — 5 días, enfocado en arquitectura vernácula, talleres artesanales y Monte Albán. Guarda agosto para una escapada de fin de semana con amigos a Valle de Bravo (más cercano y barato).',
        winner: 'Oaxaca solo — junio',
      },
    },
    {
      question: '¿Debo formalizar mi práctica como S.C. (Sociedad Civil) o seguir como persona física con actividad empresarial?',
      category: 'business', mode: 'analyze', options: [], created_at: '2026-05-04T14:30:00Z', favorite: false,
      result: {
        summary: 'Como persona física con actividad empresarial, Carlos paga ISR de hasta 35% en tramos altos e IVA del 16%. Una S.C. puede reducir la carga fiscal distribuyendo ingresos entre socios, facilita la incorporación de un socio y da imagen más profesional ante desarrolladores grandes.',
        recommendation: 'Iniciar proceso de constitución de S.C. para cuando se integre el segundo socio (2027 meta). Por ahora, optimizar la situación fiscal actual con un contador especializado en arquitectos freelance. Costo del contador: ~MXN 2,000/mes.',
        confidenceScore: 69, riskScore: 25, riskLevel: 'low',
        financialImpact: { summary: 'Honorarios contador: MXN 2,000/mes. Ahorro fiscal potencial: MXN 8,000–15,000/año con deducciones correctas.', monthlyCostChange: 2000, oneTimeCost: 8000, opportunityCost: 'Tiempo administrativo para documentar gastos', affordabilityScore: 85 },
        pros: ['Deducciones no aprovechadas: equipo de cómputo, software, libros técnicos, viajes de trabajo', 'IMSS voluntario como independiente — protege salud sin patrón', 'Buena base para la futura S.C.'],
        cons: ['S.C. prematura sin socio es innecesaria complejidad', 'Contador adicional es costo fijo en un ingreso variable'],
        nextSteps: ['Contratar contador especializado en arquitectos freelance (recomendación de Arq. Vega)', 'Abrir cuenta bancaria separada para ingresos de consultoría', 'Registrar todos los gastos de software (AutoCAD, Revit) como deducibles'],
        memoryFactorsUsed: ['Meta de negocio: Estudio Rodriguez Arquitectura con socio 2027', 'Preocupación: flujo de caja irregular'],
        dataSourcesUsed: ['Régimen fiscal RESICO México 2026', 'Deducibilidad de gastos arquitectos freelance SAT'],
      },
    },
    {
      question: '¿Tomar el diplomado en BIM (Revit avanzado) en julio o la certificación LEED AP primero?',
      category: 'education', mode: 'compare', options: ['Diplomado BIM (Revit avanzado)', 'LEED AP BD+C primero'],
      created_at: '2026-05-08T15:00:00Z', favorite: true,
      result: {
        question: 'BIM Diplomado vs LEED AP — ¿cuál primero?',
        factors: ['Impacto en ingresos', 'Diferenciación de mercado', 'Tiempo de estudio requerido', 'Costo', 'Relevancia en portafolio actual'],
        options: [
          { label: 'Diplomado BIM (Revit avanzado)', scores: { 'Impacto en ingresos': 65, 'Diferenciación de mercado': 60, 'Tiempo de estudio requerido': 80, Costo: 75, 'Relevancia en portafolio actual': 85 },
            pros: ['Revit ya es requerido por Desarrolladora Habitat', 'Mejora productividad en proyectos actuales', 'Costo moderado: MXN 12,000 — 3 meses'], cons: ['BIM es cada vez más commodity — no es diferenciador fuerte', 'Muchos arquitectos junior ya dominan Revit'], summary: 'Útil hoy pero no diferenciador a mediano plazo.' },
          { label: 'LEED AP BD+C primero', scores: { 'Impacto en ingresos': 88, 'Diferenciación de mercado': 95, 'Tiempo de estudio requerido': 55, Costo: 60, 'Relevancia en portafolio actual': 75 },
            pros: ['LEED AP permite cobrar 20–30% más en proyectos sustentables', 'Pocos arquitectos freelance en CDMX tienen la certificación', 'Abre mercado de corporativos y desarrollos verdes (SAP, FIBRA Uno)'], cons: ['Costo examen USD 450 = MXN 8,100', 'Estudio intenso 3–4 meses'], summary: 'Mayor diferenciación y ROI directo en tarifas.' },
        ],
        recommendation: 'LEED AP primero — septiembre 2026. El BIM puede esperar hasta después porque ya dominas Revit nivel intermedio. La certificación LEED te diferencia en un mercado donde casi nadie la tiene y justifica tarifas más altas.',
        winner: 'LEED AP BD+C primero',
      },
    },
    {
      question: '¿Buscar un practicante universitario (MXN 5,000/mes) o subcontratar renders a un despacho externo por proyecto?',
      category: 'business', mode: 'compare', options: ['Practicante universitario', 'Subcontratar renders por proyecto'],
      created_at: '2026-05-09T15:00:00Z', favorite: false,
      result: {
        question: 'Practicante vs subcontratación de renders',
        factors: ['Costo a largo plazo', 'Flexibilidad', 'Calidad de output', 'Tiempo de gestión', 'Impacto en flujo de caja'],
        options: [
          { label: 'Practicante universitario', scores: { 'Costo a largo plazo': 85, Flexibilidad: 55, 'Calidad de output': 70, 'Tiempo de gestión': 50, 'Impacto en flujo de caja': 75 },
            pros: ['MXN 5,000/mes fijo — predictible', 'Aprendizaje acelerado — invierte en el practicante como futuro colaborador', 'Presencia constante — disponible para tareas diversas'], cons: ['Curva de aprendizaje inicial (2–3 meses)', 'Supervisión activa necesaria — consume tiempo de Carlos', 'Costo fijo en meses de baja carga'], summary: 'Más económico a largo plazo pero requiere mentoría.' },
          { label: 'Subcontratación por proyecto', scores: { 'Costo a largo plazo': 50, Flexibilidad: 90, 'Calidad de output': 85, 'Tiempo de gestión': 80, 'Impacto en flujo de caja': 60 },
            pros: ['Calidad profesional inmediata sin curva de aprendizaje', 'Sin costo en meses sin renderizado intensivo', 'Despacho externo tiene software y hardware especializado (V-Ray, etc.)'], cons: ['MXN 8,000–15,000 por proyecto — mucho más caro por entregable', 'Menor control de tiempos y revisiones'], summary: 'Calidad superior pero costo variable alto.' },
        ],
        recommendation: 'Practicante universitario de UNAM o IBERO a partir de junio 2026. Invierte 2 meses en formarlo. El costo es 60% menor y construyes un equipo a largo plazo.',
        winner: 'Practicante universitario',
      },
    },
  ]
  let n = 0
  for (const d of decisions) { const { error } = await db.from('decision_logs').insert({ user_id: UID, question: d.question, category: d.category, mode: d.mode, options: d.options, context_snapshot: {}, result: d.result, favorite: d.favorite, created_at: d.created_at }); if (!error) n++; else console.log(`  ✗  decision: ${error.message}`) }
  console.log(`  ✔  ${n}/${decisions.length} decision logs`)
}

async function seedBusiness() {
  console.log('\n💼  Seeding business...')
  const dh = await ins('business_clients', { user_id: UID, name: 'Desarrolladora Habitat', company: 'Desarrolladora Habitat S.A. de C.V.', email: 'proyectos@habitat-cdmx.mx', phone: '+525512341234', address: 'Polanco, Miguel Hidalgo, Ciudad de México', currency: 'MXN', notes: 'Desarrolladora residencial — proyecto conjunto habitacional 12 unidades, Colonia Narvarte.' }, 'client: Desarrolladora Habitat')
  const cm = await ins('business_clients', { user_id: UID, name: 'Café Morada', company: 'Café Morada S.C.', email: 'contacto@cafemorada.mx', phone: '+525587654321', address: 'Roma Norte, Cuauhtémoc, Ciudad de México', currency: 'MXN', notes: 'Renovación interior de cafetería boutique 80m². Completado marzo 2026.' }, 'client: Café Morada')
  const ca = await ins('business_clients', { user_id: UID, name: 'Colonia Arquitectos', company: 'Colonia Arquitectos A.C.', email: 'coordinacion@coloniaarq.org', phone: '+525511223344', address: 'Santa María la Ribera, Cuauhtémoc, CDMX', currency: 'MXN', notes: 'Asociación de arquitectos — consultoría en masterplan de zona norte. Proyecto cívico.' }, 'client: Colonia Arquitectos')
  if (!dh || !cm || !ca) return

  const projDH = await ins('business_projects', { user_id: UID, client_id: dh.id, name: 'Narvarte — Conjunto Habitacional 12 Unidades', status: 'active', start_date: '2026-01-15', end_date: '2026-08-30', fee: 220000, currency: 'MXN', notes: '220K total por proyecto completo — 6 entregables por fase. 4 facturas parciales.' }, 'project: DH Narvarte')
  const projCM = await ins('business_projects', { user_id: UID, client_id: cm.id, name: 'Café Morada — Renovación Interior Roma Norte', status: 'done', start_date: '2025-11-01', end_date: '2026-03-31', fee: 65000, currency: 'MXN', notes: 'Proyecto completado. Último pago pendiente.' }, 'project: Café Morada renov')
  const projCA = await ins('business_projects', { user_id: UID, client_id: ca.id, name: 'Santa María — Masterplan Zona Norte', status: 'active', start_date: '2026-03-01', end_date: '2026-09-30', fee: 48000, currency: 'MXN', notes: 'Consultoría urbana — 3 entregables de diagnóstico + propuesta.' }, 'project: Colonia Arq masterplan')

  if (projDH) {
    await ins('business_invoices', { user_id: UID, client_id: dh.id, project_id: projDH.id, invoice_no: 'CR-2026-001', issued_at: '2026-02-28', due_at: '2026-03-14', items: [{ description: 'DH Narvarte — Fase 1: Anteproyecto y plantas arquitectónicas', qty: 1, rate: 55000, amount: 55000 }], subtotal: 55000, tax_pct: 16, tax_amt: 8800, discount_amt: 0, total: 63800, currency: 'MXN', status: 'paid', paid_at: '2026-03-10' }, 'invoice: CR-2026-001 (paid)')
    await ins('business_invoices', { user_id: UID, client_id: dh.id, project_id: projDH.id, invoice_no: 'CR-2026-002', issued_at: '2026-04-30', due_at: '2026-05-14', items: [{ description: 'DH Narvarte — Fase 2: Planos constructivos y especificaciones', qty: 1, rate: 55000, amount: 55000 }], subtotal: 55000, tax_pct: 16, tax_amt: 8800, discount_amt: 0, total: 63800, currency: 'MXN', status: 'sent' }, 'invoice: CR-2026-002 (sent)')
  }
  if (projCM) {
    await ins('business_invoices', { user_id: UID, client_id: cm.id, project_id: projCM.id, invoice_no: 'CR-2026-003', issued_at: '2026-03-31', due_at: '2026-04-15', items: [{ description: 'Café Morada — Saldo final: entrega de proyecto terminado', qty: 1, rate: 20000, amount: 20000 }], subtotal: 20000, tax_pct: 16, tax_amt: 3200, discount_amt: 0, total: 23200, currency: 'MXN', status: 'paid', paid_at: '2026-04-05' }, 'invoice: CR-2026-003 (paid)')
  }

  const expenses = [
    { category: 'software', vendor: 'Autodesk (AutoCAD + Revit)', amount: 9800, occurred_at: '2026-01-15', description: 'Suscripción anual Autodesk AEC Collection — software principal de diseño' },
    { category: 'software', vendor: 'Adobe Creative Cloud', amount: 4200, occurred_at: '2026-01-15', description: 'Adobe CC anual — Photoshop, Illustrator para presentaciones' },
    { category: 'professional_fees', vendor: 'CACPEP (Colegio Arquitectos)', amount: 2200, occurred_at: '2026-02-01', description: 'Cuota anual colegiatura CACPEP — registro y cédula profesional' },
    { category: 'travel', vendor: 'Aeromexico', amount: 3800, occurred_at: '2026-03-15', description: 'CDMX → GDL → CDMX (visita a obra Desarrolladora Habitat — Guadalajara revisión)' },
    { category: 'office', vendor: 'WeWork Condesa', amount: 3500, occurred_at: '2026-04-01', description: 'Membresía mensual co-working — reuniones con clientes (solo para reuniones)' },
    { category: 'marketing', vendor: 'Behance Pro + ISSUU', amount: 850, occurred_at: '2026-03-01', description: 'Plataformas de portafolio digital — presentación a nuevos clientes' },
  ]
  let n = 0
  for (const e of expenses) { const { error } = await db.from('business_expenses').insert({ user_id: UID, currency: 'MXN', is_billable: false, ...e }); if (!error) n++; else console.log(`  ✗  expense: ${error.message}`) }
  console.log(`  ✔  ${n}/${expenses.length} expenses`)
}

async function seedHome() {
  console.log('\n🏠  Seeding home...')
  const mac = await ins('home_assets', { user_id: UID, name: 'MacBook Pro 14" M3 Pro', type: 'electronics', brand: 'Apple', model: 'MacBook Pro 14 M3 Pro (2024)', purchased_at: '2024-03-10', warranty_until: '2026-03-10', cost: 52000, notes: 'Equipo principal de trabajo — AutoCAD, Revit, SketchUp vía Parallels' }, 'asset: MacBook Pro')
  const tablet = await ins('home_assets', { user_id: UID, name: 'Wacom Cintiq 16 (tableta gráfica)', type: 'electronics', brand: 'Wacom', model: 'Cintiq 16 DTK-1660', purchased_at: '2023-06-20', warranty_until: '2026-06-20', cost: 18000, notes: 'Sketching digital y correcciones en renders' }, 'asset: Wacom Cintiq')
  const bike = await ins('home_assets', { user_id: UID, name: 'Bicicleta eléctrica Benotto Citybike E', type: 'vehicle', brand: 'Benotto', model: 'Citybike E 7vel (2022)', purchased_at: '2022-09-15', warranty_until: '2024-09-15', cost: 14500, notes: 'Transporte principal en Condesa-Roma-Centro. Batería: ~50km por carga.' }, 'asset: Benotto e-bike')
  const monitor = await ins('home_assets', { user_id: UID, name: 'Monitor Dell UltraSharp 27"', type: 'electronics', brand: 'Dell', model: 'U2723D', purchased_at: '2023-01-20', warranty_until: '2026-01-20', cost: 12000, notes: 'Pantalla adicional para trabajo de diseño detallado' }, 'asset: Dell Monitor')

  if (bike) {
    await ins('home_maintenance', { user_id: UID, asset_id: bike.id, title: 'Servicio de batería y frenos bicicleta', category: 'service', recurrence_months: 6, last_done_at: '2025-10-01', next_due_at: '2026-04-01', vendor: 'Benotto Service Condesa', cost: 800, is_active: true }, 'maint: bike service')
    await ins('home_maintenance', { user_id: UID, asset_id: bike.id, title: 'Lavado y lubricación cadena', category: 'cleaning', recurrence_months: 2, last_done_at: '2026-03-01', next_due_at: '2026-05-01', vendor: null, cost: 0, is_active: true }, 'maint: bike chain')
  }
  if (mac) await ins('home_maintenance', { user_id: UID, asset_id: mac.id, title: 'Limpieza ventiladores + pasta térmica MacBook', category: 'cleaning', recurrence_months: 12, last_done_at: '2025-03-10', next_due_at: '2026-03-10', vendor: 'iFixit CDMX', cost: 600, is_active: true }, 'maint: MacBook clean')

  const bills = [
    { utility: 'electricity', provider: 'CFE (Comisión Federal de Electricidad)', amount: 420, bill_date: '2026-02-28', due_date: '2026-03-20', is_paid: true, account_no: 'CFE-09100441221' },
    { utility: 'electricity', provider: 'CFE (Comisión Federal de Electricidad)', amount: 380, bill_date: '2026-03-31', due_date: '2026-04-20', is_paid: true, account_no: 'CFE-09100441221' },
    { utility: 'electricity', provider: 'CFE (Comisión Federal de Electricidad)', amount: 460, bill_date: '2026-04-30', due_date: '2026-05-20', is_paid: false, account_no: 'CFE-09100441221' },
    { utility: 'water', provider: 'SACMEX (Sistema de Aguas CDMX)', amount: 145, bill_date: '2026-02-28', due_date: '2026-03-31', is_paid: true, account_no: 'SAC-06600441' },
    { utility: 'water', provider: 'SACMEX (Sistema de Aguas CDMX)', amount: 145, bill_date: '2026-03-31', due_date: '2026-04-30', is_paid: true, account_no: 'SAC-06600441' },
    { utility: 'water', provider: 'SACMEX (Sistema de Aguas CDMX)', amount: 145, bill_date: '2026-04-30', due_date: '2026-05-31', is_paid: false, account_no: 'SAC-06600441' },
    { utility: 'internet', provider: 'TELMEX (Infinitum 500 Mb)', amount: 699, bill_date: '2026-03-05', due_date: '2026-03-15', is_paid: true, account_no: 'TEL-5512341221' },
    { utility: 'internet', provider: 'TELMEX (Infinitum 500 Mb)', amount: 699, bill_date: '2026-04-05', due_date: '2026-04-15', is_paid: true, account_no: 'TEL-5512341221' },
    { utility: 'internet', provider: 'TELMEX (Infinitum 500 Mb)', amount: 699, bill_date: '2026-05-05', due_date: '2026-05-15', is_paid: false, account_no: 'TEL-5512341221' },
    { utility: 'phone', provider: 'Telcel (Plan 40 GB)', amount: 389, bill_date: '2026-03-15', due_date: '2026-03-20', is_paid: true, account_no: 'TCL-5587654321' },
    { utility: 'phone', provider: 'Telcel (Plan 40 GB)', amount: 389, bill_date: '2026-04-15', due_date: '2026-04-20', is_paid: true, account_no: 'TCL-5587654321' },
    { utility: 'phone', provider: 'Telcel (Plan 40 GB)', amount: 389, bill_date: '2026-05-05', due_date: '2026-05-10', is_paid: false, account_no: 'TCL-5587654321' },
  ]
  let n = 0
  for (const b of bills) { const { error } = await db.from('utility_bills').insert({ user_id: UID, ...b }); if (!error) n++; else console.log(`  ✗  bill: ${error.message}`) }
  console.log(`  ✔  ${n}/${bills.length} utility bills`)
}

async function seedTravel() {
  console.log('\n✈️   Seeding travel...')
  const oax = await ins('trips', { user_id: UID, destination: 'Oaxaca, México', start_date: '2026-06-12', end_date: '2026-06-17', status: 'planning', budget_total: 12000, currency: 'MXN', travellers: 1, notes: 'Viaje solo de arquitectura y gastronomía. Visita Monte Albán, Tule, talleres artesanales.', cover_emoji: '🏺' }, 'trip: Oaxaca')
  if (oax) {
    const items = [
      { type: 'flight', title: 'Aeromexico CDMX (MEX) → Oaxaca (OAX)', starts_at: '2026-06-12T08:00:00-05:00', location: 'AICM Terminal 2, CDMX', cost: 2800, order_index: 1 },
      { type: 'hotel', title: 'Hotel Quinta Real Oaxaca', starts_at: '2026-06-12T14:00:00-05:00', ends_at: '2026-06-17T12:00:00-05:00', location: '5 de Mayo 300, Centro Histórico, Oaxaca', cost: 6500, order_index: 2, notes: 'Ex-convento restaurado — arquitectura colonial espectacular' },
      { type: 'activity', title: 'Visita Monte Albán (sitio arqueológico)', starts_at: '2026-06-13T08:00:00-05:00', location: 'Monte Albán, Santa Cruz Xoxocotlán, Oaxaca', cost: 90, order_index: 3 },
      { type: 'activity', title: 'Taller artesanal: barro negro San Marcos Tlapazola', starts_at: '2026-06-14T09:00:00-05:00', location: 'San Marcos Tlapazola, Oaxaca', cost: 350, order_index: 4 },
      { type: 'activity', title: 'Mercado Benito Juárez y Mercado 20 de Noviembre', starts_at: '2026-06-15T10:00:00-05:00', location: 'Centro Histórico, Oaxaca', cost: 0, order_index: 5 },
      { type: 'flight', title: 'Aeromexico Oaxaca (OAX) → CDMX (MEX)', starts_at: '2026-06-17T16:00:00-05:00', location: 'Aeropuerto Internacional Xoxocotlán', cost: 2400, order_index: 6 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: oax.id, is_done: false, ...it }); if (!error) iOk++ }
    const packing = [
      { item: 'Cámara Sony A6000 + lente', category: 'electronics', qty: 1, is_packed: false },
      { item: 'Libreta de bocetos A4 + plumas', category: 'work', qty: 1, is_packed: false },
      { item: 'Ropa ligera (calor/lluvia mixta)', category: 'clothing', qty: 5, is_packed: false },
      { item: 'Impermeable ultraligero', category: 'clothing', qty: 1, is_packed: false },
      { item: 'Efectivo (MXN 3,000)', category: 'documents', qty: 1, is_packed: false },
    ]
    let pOk = 0; for (const p of packing) { const { error } = await db.from('packing_items').insert({ user_id: UID, trip_id: oax.id, ...p }); if (!error) pOk++ }
    console.log(`  ✔  Oaxaca: ${iOk} items, ${pOk} packing`)
  }

  const gdl = await ins('trips', { user_id: UID, destination: 'Guadalajara, México', start_date: '2026-03-15', end_date: '2026-03-17', status: 'completed', budget_total: 8000, currency: 'MXN', travellers: 1, notes: 'Visita de obra — revisión de proyecto Desarrolladora Habitat en Zapopan.', cover_emoji: '🏗️' }, 'trip: Guadalajara (done)')
  if (gdl) {
    const items = [
      { type: 'flight', title: 'Aeromexico MEX → GDL', starts_at: '2026-03-15T07:00:00-06:00', location: 'AICM T2', cost: 3800, is_done: true, order_index: 1 },
      { type: 'activity', title: 'Visita de obra — Desarrolladora Habitat Zapopan', starts_at: '2026-03-16T09:00:00-06:00', location: 'Zapopan, Jalisco', cost: 0, is_done: true, order_index: 2 },
      { type: 'flight', title: 'Aeromexico GDL → MEX', starts_at: '2026-03-17T18:00:00-06:00', location: 'Aeropuerto Internacional Miguel Hidalgo', cost: 3200, is_done: true, order_index: 3 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: gdl.id, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Guadalajara: ${iOk} trip items`)
  }

  const tokyo = await ins('trips', { user_id: UID, destination: 'Tokio y Kioto, Japón', start_date: '2027-01-08', end_date: '2027-01-18', status: 'planning', budget_total: 55000, currency: 'MXN', travellers: 1, notes: 'Viaje arquitectónico de ensueño. Tadao Ando, templos, Nakagin Capsule area, Kengo Kuma works.', cover_emoji: '⛩️' }, 'trip: Japón (dream)')
  if (tokyo) {
    const items = [
      { type: 'flight', title: 'Aeromexico MEX → NRT (vía LAX)', starts_at: '2027-01-08T10:00:00-06:00', location: 'AICM Terminal 2', cost: 22000, order_index: 1 },
      { type: 'hotel', title: 'Henn na Hotel Asakusa', starts_at: '2027-01-09T15:00:00+09:00', ends_at: '2027-01-13T11:00:00+09:00', location: 'Asakusa, Tokyo', cost: 9000, order_index: 2 },
      { type: 'activity', title: 'Museo Nakagin Capsule Tower (zona Shimbashi)', starts_at: '2027-01-10T09:00:00+09:00', location: 'Shimbashi, Tokyo', cost: 0, order_index: 3 },
      { type: 'hotel', title: 'Ryokan en Arashiyama, Kioto', starts_at: '2027-01-13T14:00:00+09:00', ends_at: '2027-01-17T10:00:00+09:00', location: 'Arashiyama, Kyoto', cost: 14000, order_index: 4 },
    ]
    let iOk = 0; for (const it of items) { const { error } = await db.from('trip_items').insert({ user_id: UID, trip_id: tokyo.id, is_done: false, ...it }); if (!error) iOk++ }
    console.log(`  ✔  Japón: ${iOk} trip items`)
  }
}

async function seedProtection() {
  console.log('\n🛡️   Seeding protection...')
  const checks = [
    { type: 'scam', title: 'Concurso de arquitectura falso — "Premio Latinoamérica Sustentable"', content: 'Estimado Arq. Rodriguez, ha sido seleccionado para participar en el Premio Latinoamérica de Arquitectura Sustentable 2026. Para registrar su proyecto envíe una cuota de inscripción de USD 250 a la cuenta indicada. Ganadores serán publicados en Architectural Digest.', risk_level: 'high', result_summary: 'Concurso fraudulento. Los concursos legítimos de arquitectura (Pritzker, RIBA, INBA) nunca cobran cuotas de inscripción elevadas. La referencia a Architectural Digest es un señuelo sin verificación posible.', red_flags: ['Cuota de USD 250 por registro — concursos reales no cobran tanto', 'Dominio del concurso no verificable ni afiliado a Architectural Digest', 'Contacto no solicitado sin haber participado antes', 'Presión de plazo sin detalles del jurado o sede'], safe_next_step: 'No pagar. Verificar en Google si el concurso existe. Consultar Sociedad de Arquitectos Mexicanos (SAM) para lista de concursos legítimos.' },
    { type: 'contract', title: 'Contrato Desarrolladora Habitat — Cláusula de Propiedad Intelectual', content: 'Cláusula 8: Todo diseño, plano, render, memoria descriptiva y cualquier entregable producido por el Consultor bajo este contrato se convierte en propiedad exclusiva de Desarrolladora Habitat S.A. de C.V. a partir del primer pago parcial, incluyendo conceptos y bocetos previos al contrato formal.', risk_level: 'high', result_summary: 'La cláusula de PI es extremadamente agresiva. La frase "incluyendo conceptos y bocetos previos al contrato formal" implica que cualquier idea presentada en la negociación inicial también le pertenece al cliente — lo cual es abusivo.', red_flags: ['Transfiere PI desde el primer pago parcial — no al pago total', '"Conceptos previos al contrato" — cubre ideas presentadas en la propuesta inicial', 'Sin carve-out para metodología y estilo arquitectónico del consultor', 'Sin límite de tiempo — DH podría usar planos para proyectos futuros'], safe_next_step: 'Negociar: "Entregables finales aceptados y pagados en su totalidad". Excluir explícitamente bocetos de propuesta inicial y metodología general. Contratar revisión de abogado especialista en propiedad intelectual creativa.' },
    { type: 'scam', title: 'SMS falso BBVA — suspensión de cuenta', content: 'BBVA: Su cuenta ha sido suspendida por actividad inusual. Para reactivar ingrese su NIP en: bbva-mx-seguridad.com/verificar en las próximas 2 horas.', risk_level: 'high', result_summary: 'Phishing de BBVA México. El dominio "bbva-mx-seguridad.com" no es bbva.mx. BBVA nunca solicita NIP por SMS ni redirige a links externos para verificaciones.', red_flags: ['Dominio falso (bbva-mx-seguridad.com vs bbva.mx oficial)', 'Urgencia de 2 horas — presión para actuar sin pensar', 'Solicita NIP — ningún banco pide NIP por SMS'], safe_next_step: 'Borrar el SMS. Verificar cuenta en app BBVA oficial o llamar al 800 226 2663. Reportar al SAT si datos bancarios fueron comprometidos.' },
    { type: 'quote', title: 'Seguro de equipo electrónico — MacBook + Wacom (GNP Seguros)', content: 'GNP Seguros: Seguro de equipo electrónico. MacBook Pro 14" M3 + Wacom Cintiq 16. Valor asegurado: MXN 70,000. Prima anual: MXN 3,200. Cubre robo con violencia, daño accidental, cortocircuito.', risk_level: 'low', result_summary: 'Cotización adecuada para equipo de trabajo de alto valor. MXN 3,200/año (4.6% del valor) es aceptable para cobertura integral incluyendo robo con violencia en CDMX.', red_flags: [], safe_next_step: 'Contratar. Comparar con Qualitas o AXA para ver si ofrecen deducible menor a MXN 2,000.' },
    { type: 'subscription', title: 'Adobe Creative Cloud — revisión de plan', content: 'Tu suscripción Adobe Creative Cloud All Apps se renueva por MXN 4,200/año el 15 de enero. Incluye: Photoshop, Illustrator, InDesign, Premiere, Acrobat.', risk_level: 'low', result_summary: 'Adobe CC a MXN 4,200/año es necesario para la práctica arquitectónica de Carlos. El plan "All Apps" incluye herramientas esenciales para presentaciones y portafolio.', red_flags: [], safe_next_step: 'Verificar si InDesign y Premiere se usan activamente. Si no, el plan Photography + Illustrator (MXN 2,100/año) podría ser suficiente y reducir el costo.' },
  ]
  let n = 0
  for (const c of checks) { const { error } = await db.from('risk_checks').insert({ user_id: UID, type: c.type, title: c.title, input_hash: hash(c.content), risk_level: c.risk_level, result_summary: c.result_summary, red_flags: c.red_flags ?? [], safe_next_step: c.safe_next_step ?? null }); if (!error) n++; else console.log(`  ✗  risk_check: ${error.message}`) }
  console.log(`  ✔  ${n}/${checks.length} risk checks`)

  await db.from('saved_quotes').insert({ user_id: UID, title: 'GNP Seguros — Equipo electrónico (MacBook + Wacom)', amount: 3200, currency: 'MXN', category: 'insurance', region: 'Ciudad de México, CDMX', result_summary: 'Prima razonable para MXN 70K de equipo profesional. Incluye robo con violencia y daño accidental.', risk_level: 'low', negotiation_script: 'Llevo 2 años como cliente GNP en seguro de gastos médicos. Para el seguro de equipo, ¿puede ofrecerme un descuento de lealtad o reducir el deducible a MXN 1,500?' })
  await db.from('saved_quotes').insert({ user_id: UID, title: 'TELMEX Infinitum — renovación plan internet', amount: 699, currency: 'MXN', category: 'home_service', region: 'Condesa, CDMX', result_summary: 'MXN 699/mes por 500 Mb es competitivo. MCM Telecom ofrece 600 Mb por MXN 629 en la misma zona.', risk_level: 'low', negotiation_script: 'Llevo 3 años con Infinitum. MCM está ofreciendo 600 Mb por MXN 629 en mi colonia. ¿Pueden igualar esa tarifa o mejorarla para mantener mi lealtad?' })
  console.log('  ✔  2/2 saved quotes')
  await db.from('negotiation_templates').insert({ user_id: UID, type: 'payment_terms', tone: 'firm', context: 'Solicitar pago de factura CR-2026-002 vencida a Desarrolladora Habitat', script: 'Estimado equipo de finanzas DH,\n\nLe escribo para dar seguimiento a la factura CR-2026-002 por MXN 63,800 emitida el 30 de abril y vencida el 14 de mayo.\n\nConforme a nuestro contrato, el pago se realiza a 15 días naturales de emitida la factura. A la fecha llevamos X días de retraso.\n\nAgradecería confirmación de la fecha de pago para poder planear mis flujos del mes.\n\nQuedo atento,\nCarlos Rodriguez' })
  await db.from('negotiation_templates').insert({ user_id: UID, type: 'rate_increase', tone: 'professional', context: 'Propuesta de aumento de honorarios para Fase 3 de Desarrolladora Habitat', script: 'Estimados Desarrolladora Habitat,\n\nHa sido un gusto trabajar en el conjunto Narvarte — la calidad del proyecto habla por sí sola.\n\nPara la Fase 3 (supervisión de obra + gestión de permisos), propongo ajustar los honorarios a MXN 70,000 por fase. Esto refleja la mayor responsabilidad de coordinación con contratistas y autoridades, y se mantiene dentro del estándar SAM para proyectos de esta envergadura.\n\nQuedo en espera de su respuesta para agenda la siguiente reunión.\n\nArq. Carlos Rodriguez' })
  console.log('  ✔  2/2 negotiation templates')
}

async function seedLegal() {
  console.log('\n⚖️   Seeding legal...')
  const deadlines = [
    { title: 'Declaración Anual ISR 2025 (persona física)', type: 'other', due_date: '2026-04-30', amount: null, currency: 'MXN', status: 'filed', authority: 'SAT (Servicio de Administración Tributaria)', reference_no: 'RFC-ROCC950815AB3', notes: 'Declaración anual de ISR presentada a tiempo por contador. Resultado: saldo a favor MXN 4,200 (pendiente de devolución).' },
    { title: 'Declaración mensual IVA — mayo 2026', type: 'other', due_date: '2026-06-17', amount: null, currency: 'MXN', status: 'pending', authority: 'SAT', reference_no: 'RFC-ROCC950815AB3', notes: 'IVA trasladado en facturas de mayo. Presentar antes del día 17 del mes siguiente.' },
    { title: 'Renovación Cédula Profesional CACPEP', type: 'renewal', due_date: '2027-02-01', amount: 2200, currency: 'MXN', status: 'pending', authority: 'CACPEP (Colegio de Arquitectos)', reference_no: 'CAC-CDMX-441229', notes: 'Cuota anual de colegiatura. Renovar antes de febrero para mantener registro vigente.' },
    { title: 'Pago IMSS voluntario Q2 (abril–junio)', type: 'other', due_date: '2026-06-30', amount: 2400, currency: 'MXN', status: 'pending', authority: 'IMSS (Instituto Mexicano del Seguro Social)', reference_no: 'IMSS-VOL-441229', notes: 'Afiliación voluntaria al IMSS como trabajador independiente — cobertura médica. Pago trimestral.' },
    { title: 'Examen LEED AP BD+C', type: 'other', due_date: '2026-09-15', amount: 8100, currency: 'MXN', status: 'pending', authority: 'USGBC (Green Building Council)', reference_no: null, notes: 'Registro abierto junio 2026. Costo USD 450 = MXN ~8,100. Reservar fecha antes de julio.' },
    { title: 'Renovación contrato renta — Condesa', type: 'renewal', due_date: '2026-10-31', amount: 14500, currency: 'MXN', status: 'pending', authority: 'Arrendador particular', reference_no: null, notes: 'Contrato vence octubre 31 2026. Iniciar negociación en agosto — intentar congelar precio.' },
  ]
  let n = 0
  for (const d of deadlines) { const { error } = await db.from('legal_deadlines').insert({ user_id: UID, ...d }); if (!error) n++; else console.log(`  ✗  deadline: ${error.message}`) }
  console.log(`  ✔  ${n}/${deadlines.length} legal deadlines`)

  const docs = [
    { name: 'Contrato de Honorarios — Desarrolladora Habitat', doc_type: 'contract', original_text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES\nCliente: Desarrolladora Habitat S.A. de C.V.\nPrestador: Carlos Rodriguez (RFC: ROCC950815AB3)\nObra: Conjunto Habitacional Narvarte 12 Unidades\nHonorarios Totales: MXN 220,000 (cuatro pagos de MXN 55,000 por fase)\nCondiciones: Pago a 15 días naturales de cada entregable.\nPropiedad Intelectual: Todo diseño se convierte en propiedad de DH desde el primer pago parcial, incluyendo conceptos previos.\nPlazo: Enero 15 – Agosto 30, 2026.', summary_md: '## Contrato DH Narvarte\n\n**Qué es:** Contrato de servicios por MXN 220,000 en 4 fases (MXN 55,000 c/u).\n\n**Puntos clave:**\n- Pago: 15 días naturales por entregable\n- PI: Transferida a DH desde primer pago — **negociar esto**\n- Plazo: Ene–Ago 2026\n\n**Acción:** Revisar cláusula PI antes de la Fase 3.', key_points: ['MXN 220,000 total — cuatro pagos de MXN 55,000', 'Pago a 15 días naturales de entrega aceptada', 'IP transferida a DH desde primer pago parcial', 'Vigencia enero-agosto 2026'], red_flags: ['IP incluye conceptos previos al contrato — abusivo', 'Sin carve-out para metodología arquitectónica de Carlos'], expires_at: '2026-08-30', notes: 'Fase 2 en curso. Negociar PI para Fase 3.' },
    { name: 'Contrato de arrendamiento — Depto Condesa 3B', doc_type: 'rental', original_text: 'CONTRATO DE ARRENDAMIENTO\nArrendador: Ing. Roberto Mendoza Pérez\nArrendatario: Carlos Eduardo Rodriguez Vargas\nInmueble: Depto 3B, Colonia Condesa, CDMX\nRenta Mensual: MXN 14,500\nDepósito: MXN 29,000 (2 meses)\nVigencia: Noviembre 1, 2025 – Octubre 31, 2026\nIncremento: 5% anual conforme a IPC.\nRegistrado ante Notario Público No. 88, CDMX.', summary_md: '## Contrato Renta Condesa\n\n**Qué es:** Arrendamiento 12 meses a MXN 14,500/mes.\n\n**Puntos clave:**\n- Vence: 31 octubre 2026\n- Depósito: MXN 29,000 (recuperar en buen estado)\n- Incremento 5% (IPC) — dentro del mercado\n- Registrado ante notario — protegido\n\n**Acción:** Renovar en agosto, pedir congelar precio si IPC baja.', key_points: ['MXN 14,500/mes — buen precio para 55m² en Condesa', 'Incremento 5% conforme a IPC — negociar congelamiento si inflación baja', 'Depósito MXN 29,000 — documentar estado del inmueble'], red_flags: [], expires_at: '2026-10-31', notes: 'Renovar agosto 2026. Intentar congelar en MXN 14,500 un año más.' },
  ]
  let dn = 0
  for (const d of docs) { const { error } = await db.from('legal_documents').insert({ user_id: UID, ...d }); if (!error) dn++; else console.log(`  ✗  doc: ${error.message}`) }
  console.log(`  ✔  ${dn}/${docs.length} legal documents`)

  const compliances = [
    { item: 'Declaración mensual IVA (SAT)', category: 'tax', frequency: 'monthly', last_done_at: '2026-04-17', next_due_at: '2026-06-17', is_done: false, applicable: true, notes: 'Presentar antes del día 17 de cada mes. IVA trasladado en facturas menos IVA acreditable.' },
    { item: 'Pago provisional ISR mensual (SAT)', category: 'tax', frequency: 'monthly', last_done_at: '2026-04-17', next_due_at: '2026-06-17', is_done: false, applicable: true, notes: 'ISR provisional persona física actividad empresarial. Presentar el mismo día que IVA.' },
    { item: 'Colegiatura CACPEP anual', category: 'business', frequency: 'annual', last_done_at: '2026-02-01', next_due_at: '2027-02-01', is_done: false, applicable: true, notes: 'Mantener registro activo en Colegio de Arquitectos — necesario para sellar planos.' },
    { item: 'IMSS voluntario — pago trimestral', category: 'personal', frequency: 'quarterly', last_done_at: '2026-03-31', next_due_at: '2026-06-30', is_done: false, applicable: true, notes: 'Afiliación voluntaria IMSS — cobertura médica como trabajador independiente.' },
    { item: 'Renovación dominio y hosting — carlosrodriguez.arq.mx', category: 'business', frequency: 'annual', last_done_at: '2025-10-01', next_due_at: '2026-10-01', is_done: false, applicable: true, notes: 'Sitio web portafolio. Hostinger: MXN 1,200/año.' },
    { item: 'Backup de archivos de proyecto (Dropbox + disco duro)', category: 'business', frequency: 'monthly', last_done_at: '2026-04-30', next_due_at: '2026-05-31', is_done: false, applicable: true, notes: 'Backup mensual completo de proyectos activos a Dropbox Business + WD de 2TB.' },
  ]
  let cn = 0
  for (const c of compliances) { const { error } = await db.from('legal_compliances').insert({ user_id: UID, ...c }); if (!error) cn++; else console.log(`  ✗  compliance: ${error.message}`) }
  console.log(`  ✔  ${cn}/${compliances.length} legal compliances`)
}

async function seedBriefings() {
  console.log('\n📊  Seeding briefings...')
  const briefings = [
    { date: '2026-05-03', content_md: '**Buenos días, Carlos.** Domingo — semana de trabajo intensa que viene. Tu factura CR-2026-002 (MXN 63,800) vence el 14 de mayo y DH aún no confirma fecha de pago. El viaje a Oaxaca en junio te da energía — úsala. **Hoy: sketch matutino + 45 min de estudio LEED.** Sin correos de clientes hasta el lunes.', highlights: [{ label: 'Factura pendiente', value: 'MXN 63,800 vence May 14', link: '/business', emoji: '🧾' }, { label: 'Recibos pendientes', value: '3 (CFE, SACMEX, TELMEX)', link: '/home', emoji: '💡' }, { label: 'Próximo viaje', value: 'Oaxaca Jun 12', link: '/travel', emoji: '🏺' }, { label: 'Meta', value: 'LEED AP — Sep 2026', link: '/career', emoji: '🎯' }] },
    { date: '2026-05-04', content_md: '**Buenos días, Carlos.** Lunes. La factura de DH sigue pendiente — escribe hoy al equipo de finanzas. Tu racha de registro de gastos es perfecta (21/21 días). Tu Wacom está próxima a perder la garantía — considera el seguro de equipo GNP esta semana. **Prioridad: entregable DH Fase 2 — planos constructivos al 80% esta semana.** Se viene la fecha de cierre.', highlights: [{ label: 'Factura DH', value: 'MXN 63,800 — contactar hoy', link: '/business', emoji: '🧾' }, { label: 'Registro gastos', value: 'Racha 21 días 🔥', link: '/habits', emoji: '💰' }, { label: 'Garantía Wacom', value: 'Vence Jun 20', link: '/home', emoji: '🖥️' }, { label: 'LEED estudio', value: 'Sección 3 esta semana', link: '/habits', emoji: '🏗️' }] },
    { date: '2026-05-05', content_md: '**Buenos días, Carlos.** Martes. El sketch de ayer en el boceto de la Casa Lomas quedó muy bien — foto y guárdalo. Tu recibo de Telcel (MXN 389) vence el 10 de mayo: paga hoy en minutos. El examen LEED AP se abre en junio para septiembre — reserve fecha ahora. **Hoy: 90 min de diseño profundo en DH Fase 2 por la mañana.** No abrir correos hasta las 12.', highlights: [{ label: 'Factura DH', value: 'MXN 63,800 — seguimiento', link: '/business', emoji: '🧾' }, { label: 'Recibo Telcel', value: 'MXN 389 vence May 10', link: '/home', emoji: '📱' }, { label: 'LEED AP examen', value: 'Registrar en junio', link: '/legal', emoji: '🏗️' }, { label: 'Oaxaca', value: 'Jun 12 — preparar itinerario', link: '/travel', emoji: '🏺' }] },
    { date: '2026-05-06', content_md: '**Buenos días, Carlos.** Miércoles. DH confirmó pago de factura CR-2026-002 para el 12 de mayo. Excelente. La CFE de abril (MXN 460) vence el 20 — no hay urgencia pero paga antes del viernes. El estudio LEED lleva 9 días consecutivos. **Hoy: presentación Colonia Arquitectos masterplan fase 1 — tiene que estar lista el viernes.** Prioridad máxima.', highlights: [{ label: 'DH confirmó pago', value: '12 mayo ✓', link: '/business', emoji: '✅' }, { label: 'CFE pendiente', value: 'MXN 460 vence May 20', link: '/home', emoji: '💡' }, { label: 'LEED estudio', value: '9 días seguidos', link: '/habits', emoji: '🏗️' }, { label: 'Colonia Arq', value: 'Entregable Fase 1 — viernes', link: '/career', emoji: '🗂️' }] },
    { date: '2026-05-07', content_md: '**Buenos días, Carlos.** Jueves. La presentación para Colonia Arquitectos está casi lista. Tu sketch matutino de ayer fue el mejor de la semana — sigue así. El SACMEX (MXN 145) vence el 31 — no urgente. La Casa Lomas visita de sitio está confirmada para el 15 de mayo. **Hoy: últimas correcciones de la presentación CA + ensayo rápido del pitch.** Tienes 20 minutos para practicarlo.', highlights: [{ label: 'Presentación CA', value: 'Lista mañana', link: '/career', emoji: '🗂️' }, { label: 'Factura DH', value: 'Confirmada para May 12', link: '/business', emoji: '🧾' }, { label: 'Visita Casa Lomas', value: '15 de mayo', link: '/career', emoji: '🏠' }, { label: 'LEED AP', value: 'Sección 4 — hoy', link: '/habits', emoji: '🏗️' }] },
    { date: '2026-05-08', content_md: '**Buenos días, Carlos.** Viernes. La presentación a Colonia Arquitectos es esta tarde. Respira. Has preparado bien. Tu TELMEX (MXN 699) vence el 15 — paga hoy antes de salir. El ahorro está en MXN 38,000 — vas 25% del camino al fondo de emergencia MXN 150K. **Para hoy: presentación CA y luego cierra la semana.** Mañana es para Oaxaca research y descanso.', highlights: [{ label: 'Presentación CA', value: 'Hoy', link: '/career', emoji: '🗂️' }, { label: 'TELMEX vence', value: 'MXN 699 — May 15', link: '/home', emoji: '💡' }, { label: 'Ahorro acumulado', value: 'MXN 38,000 / 150K', link: '/money', emoji: '💰' }, { label: 'LEED AP', value: '2/3 del material completado', link: '/habits', emoji: '🏗️' }] },
    { date: '2026-05-09', content_md: '**Buenos días, Carlos.** Sábado. La semana fue productiva — presentación CA entregada, DH confirma pago, sketch diario sin pausas. Hoy investiga hoteles para Oaxaca (ya elegiste el Quinta Real — solo reserva). Paga los recibos pendientes (CFE + SACMEX + TELMEX) en 10 minutos online. **Hoy es tuyo: sketch, lectura, y una buena taza de café en la Condesa.** Lo mereces.', highlights: [{ label: 'Recibos pendientes', value: '3 — pagar hoy', link: '/home', emoji: '💡' }, { label: 'Oaxaca hotel', value: 'Quinta Real — reservar', link: '/travel', emoji: '🏺' }, { label: 'Sketch streak', value: '19/21 días 🔥', link: '/habits', emoji: '✏️' }, { label: 'Meta financiera', value: 'MXN 38K / 150K fondo', link: '/money', emoji: '💰' }] },
  ]
  let n = 0
  for (const b of briefings) { const { error } = await db.from('daily_briefings').upsert({ user_id: UID, date: b.date, content_md: b.content_md, highlights: b.highlights, generated_at: `${b.date}T14:30:00Z` }, { onConflict: 'user_id,date' }); if (!error) n++; else console.log(`  ✗  briefing: ${error.message}`) }
  console.log(`  ✔  ${n}/${briefings.length} daily briefings`)
}

async function main() {
  console.log(`\n👤  Carlos Rodriguez uid: ${UID}`)
  await seedMemory(); await seedHabits(); await seedFocus(); await seedDecisions()
  await seedBusiness(); await seedHome(); await seedTravel()
  await seedProtection(); await seedLegal(); await seedBriefings()
  console.log('\n✅  Seed complete.\n')
}
main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
