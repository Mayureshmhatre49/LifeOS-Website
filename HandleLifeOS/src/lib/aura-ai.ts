import { generateText } from 'ai'
import { getAIModel, isMockMode } from './ai/provider'
import type { AuraChildProfile, AuraGuidanceResult, AuraAITopic } from '@/types/aura'
import { getAgeDisplay } from './aura-logic'

const DISCLAIMER =
  "This guidance is educational and evidence-based, but is not a substitute for professional medical, psychological, or educational advice. Always consult qualified specialists for your child's specific needs."

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return fallback
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return fallback
  }
}

const TOPIC_CONTEXT: Record<AuraAITopic, string> = {
  general:            'paediatric development, milestone tracking, and child well-being',
  adhd:               'ADHD management — DSM-5 criteria, Parent Training in Behaviour Management (PTBM), FDA-approved medication for ages 6+, dose titration, and school accommodations',
  asd:                'Autism Spectrum Disorder — universal screening (M-CHAT), ABA therapy, PEERS social skills curriculum, Occupational Therapy, AAC devices, and immediate-referral protocols',
  physical_disability:'physical disability support — PT for strength and joint health, OT for daily living skills, SLP and AAC devices, environmental modifications (Velcro grips, adaptive seating, audiobooks)',
  genetic:            'genetic condition management — Down Syndrome health surveillance (ECHO, sleep study, TSH), specialist coordination across geneticists and neurologists, gene-specific medical records',
  iep:                'IEP and 504 Plan advocacy — IDEA rights, Child Find mandate, evaluation requests in writing, measurable IEP goals vs. 504 accommodations, meeting notices and compliance',
  financial:          'disability financial planning — ABLE accounts (529A, $19,000/yr limit), Special Needs Trusts, means-tested benefits preservation, legal transition at age 18 (POA, Guardianship, Guardian Advocacy)',
  nutrition:          'paediatric nutrition — WHO 2030 growth targets, LMS z-score calculation, USDA 2024–2025 school meal updates (sodium reduction, <10% added sugars by 2027), immunisation schedule',
}

function buildChildContext(child: AuraChildProfile): string {
  const conditions: string[] = []
  if (child.neurodivergence?.adhd) conditions.push(`ADHD (${child.neurodivergence.adhd_type ?? 'type unspecified'})`)
  if (child.neurodivergence?.asd)  conditions.push(`ASD Level ${child.neurodivergence.asd_support_level ?? '?'}`)
  if (child.physical_disabilities?.conditions.length) conditions.push(...child.physical_disabilities.conditions)
  if (child.genetic_conditions?.conditions.length)    conditions.push(...child.genetic_conditions.conditions)

  const therapies = child.therapies.map(t => t.type).join(', ') || 'None'
  const education = child.education_plan?.plan_type ?? 'Not documented'
  const age = getAgeDisplay(child.date_of_birth)

  return `Child: ${child.full_name}, aged ${age}
Documented conditions: ${conditions.length ? conditions.join(', ') : 'None'}
Active therapies: ${therapies}
Education plan: ${education}`
}

// ── Main guidance function (called by AI API route) ───────────────────────────

export async function getAuraGuidance(
  child: AuraChildProfile,
  question: string,
  topic: AuraAITopic,
): Promise<AuraGuidanceResult> {
  if (isMockMode()) {
    return getMockGuidance(topic)
  }

  const childContext = buildChildContext(child)
  const topicContext = TOPIC_CONTEXT[topic]

  const prompt = `You are AURA — an expert paediatric development and neuroadaptive support assistant with deep knowledge of ${topicContext}.

${childContext}

Parent's question: "${question}"

Respond ONLY with a JSON object (no markdown fences):
{
  "summary": "2-3 sentence warm, empathetic overview addressing the question directly",
  "recommendations": ["4-6 specific, actionable recommendations grounded in evidence"],
  "resources": ["3-4 specific organisations, programmes, or tools with brief descriptions"],
  "when_to_escalate": "Clear guidance on when to seek immediate professional help, or omit this key if not applicable",
  "disclaimer": "${DISCLAIMER}"
}

Use plain language (reading level: grade 9). Be warm, direct, and scientifically grounded. Do not catastrophise.`

  const result = await generateText({
    model: getAIModel(),
    prompt,
    maxOutputTokens: 700,
  })

  return parseJSON<AuraGuidanceResult>(result.text, {
    summary: 'Please consult your paediatrician or specialist for personalised guidance.',
    recommendations: ['Schedule a developmental check with your paediatrician.'],
    resources: ['CDC "Learn the Signs. Act Early." — cdc.gov/actearly'],
    disclaimer: DISCLAIMER,
  })
}

// ── Milestone-specific guidance ───────────────────────────────────────────────

export async function getMilestoneGuidance(
  child: AuraChildProfile,
  missingDescriptions: string[],
): Promise<AuraGuidanceResult> {
  if (isMockMode()) {
    return {
      summary:
        'Every child develops at their own pace. These milestones are worth tracking — bring them up at your next paediatric visit.',
      recommendations: [
        'Schedule a developmental screening with your paediatrician.',
        'Keep a short daily video diary — even 30 seconds helps specialists observe patterns.',
        'Practice the missing skills during everyday play routines.',
        'If your child is under 3, request an Early Intervention evaluation (IDEA Part C).',
        'Ask about the M-CHAT-R/F if language or social milestones are delayed.',
      ],
      resources: [
        'CDC Milestone Tracker app — free, with activities by age',
        'Early Intervention services (IDEA Part C) — contact your local school district',
        'Pathways.org — activity ideas by age and developmental domain',
      ],
      when_to_escalate:
        'If multiple milestones in the same domain are delayed by 2+ months, request a formal developmental evaluation immediately — do not wait.',
      disclaimer: DISCLAIMER,
    }
  }

  const age = getAgeDisplay(child.date_of_birth)
  const list = missingDescriptions.map(d => `- ${d}`).join('\n')

  const prompt = `You are AURA, a paediatric development expert. A parent reports that their ${age}-old child has not yet shown:
${list}

Provide compassionate, evidence-based guidance as JSON (no markdown fences):
{
  "summary": "Warm, non-alarming 2-3 sentence overview",
  "recommendations": ["4-6 specific activities and next steps for these areas"],
  "resources": ["3-4 specific resources or programmes"],
  "when_to_escalate": "When to seek professional evaluation",
  "disclaimer": "${DISCLAIMER}"
}

Use CDC/AAP evidence base. Do not alarm the parent unnecessarily.`

  const result = await generateText({
    model: getAIModel(),
    prompt,
    maxOutputTokens: 600,
  })

  return parseJSON<AuraGuidanceResult>(result.text, {
    summary: 'Please discuss these milestones with your paediatrician at your next visit.',
    recommendations: ['Schedule a developmental screening.', 'Contact Early Intervention if your child is under 3.'],
    resources: ['CDC Milestone Tracker app'],
    disclaimer: DISCLAIMER,
  })
}

// ── Mock responses (used when no API key) ────────────────────────────────────

function getMockGuidance(topic: AuraAITopic): AuraGuidanceResult {
  const byTopic: Record<AuraAITopic, AuraGuidanceResult> = {
    general: {
      summary: 'AURA is your adaptive developmental companion. Here is evidence-based guidance for your question.',
      recommendations: [
        'Connect with your paediatrician for personalised screening and surveillance.',
        'Keep a developmental journal to track progress and patterns over time.',
        'Celebrate small wins — development is not linear.',
        'Join a parent support group for your child\'s specific needs.',
      ],
      resources: [
        'CDC "Learn the Signs. Act Early." — cdc.gov/actearly',
        'AAP developmental milestones guide — healthychildren.org',
        'Pathways.org — activities and guidance by developmental domain',
      ],
      when_to_escalate: 'Contact your paediatrician if you notice sudden regression in any milestone.',
      disclaimer: DISCLAIMER,
    },
    adhd: {
      summary: 'ADHD is a well-understood neurodevelopmental condition. For children 4–5, Parent Training in Behaviour Management (PTBM) is the first-line treatment. Medication becomes an option from age 6 alongside behavioural therapy.',
      recommendations: [
        'Start with Parent Training in Behaviour Management (PTBM) — highly effective for ages 4–5.',
        'For ages 6+, combine FDA-approved medication with behavioural therapy for best outcomes.',
        'Request a 504 Plan or IEP for classroom accommodations (extended time, preferential seating).',
        'Use consistent daily routines and visual schedules at home.',
        'Ask your paediatrician about dose titration to find the optimal medication level.',
      ],
      resources: [
        'CHADD (Children and Adults with ADHD) — chadd.org',
        'CDC ADHD resources — cdc.gov/adhd',
        'AAP ADHD Clinical Practice Guidelines',
      ],
      disclaimer: DISCLAIMER,
    },
    asd: {
      summary: 'ASD affects 1 in 31 children. Early intervention makes a significant difference. If screening identifies delays, start intervention immediately — do not wait for a formal diagnosis.',
      recommendations: [
        'Request an immediate referral if screening (M-CHAT) is positive — do not wait for formal diagnosis.',
        'ABA (Applied Behavior Analysis) therapy is evidence-based for core skill building.',
        'PEERS curriculum builds social skills in school-age children and teens.',
        'Occupational and Speech therapy address adaptive skills and communication.',
        'Consider AAC (Augmentative and Alternative Communication) if verbal communication is limited.',
      ],
      resources: [
        'Autism Speaks — autismspeaks.org',
        'PEERS Program — semel.ucla.edu/peers',
        'ASHA (American Speech-Language-Hearing Association) — asha.org',
      ],
      disclaimer: DISCLAIMER,
    },
    physical_disability: {
      summary: 'Supporting a child with physical disabilities requires a team approach. Four evidence-based pillars — PT, OT, SLP, and Behavioural Therapy — form the foundation of care.',
      recommendations: [
        'Physical Therapy (PT): Focus on strength, mobility, and preventing joint contractures.',
        'Occupational Therapy (OT): Build daily living skills — feeding, dressing, self-care.',
        'Speech & Language Therapy: Address clarity; explore AAC devices if needed.',
        'Environmental modifications: Velcro on toys for grip, reading tablets, adaptive seating.',
        'Connect with a paediatric physiatrist for a comprehensive rehabilitation plan.',
      ],
      resources: [
        'APTA (American Physical Therapy Association) — apta.org',
        'United Cerebral Palsy — ucp.org',
        'Disabled Sports USA — dsusa.org',
      ],
      disclaimer: DISCLAIMER,
    },
    genetic: {
      summary: 'Genetic conditions require coordinated specialist care. AURA helps you track health surveillance schedules and organise specialist records.',
      recommendations: [
        'For Down Syndrome: ECHO at birth, sleep study by age 4, annual TSH tests.',
        'Maintain a "medical passport" — a single document with all diagnoses, medications, and specialist contacts.',
        'Connect with a clinical geneticist for condition-specific surveillance protocols.',
        'Join a condition-specific parent network for advocacy and peer support.',
      ],
      resources: [
        'Global Down Syndrome Foundation — globaldownsyndrome.org',
        'National Organisation for Rare Disorders (NORD) — rarediseases.org',
        'Genetic Alliance — geneticalliance.org',
      ],
      disclaimer: DISCLAIMER,
    },
    iep: {
      summary: 'Every eligible child has the right to a Free Appropriate Public Education (FAPE). The IEP process is legally governed by IDEA — knowing your rights is your most powerful tool.',
      recommendations: [
        'Request evaluations in writing — the "Child Find" mandate requires schools to identify eligible children.',
        'IEP: Requires a disability AND need for specialised instruction; includes measurable goals.',
        '504 Plan: Broader eligibility; focuses on accommodations (extra time, adaptive seating).',
        'Keep copies of all meeting notices, evaluation results, and signed documents.',
        'Bring a trusted advocate or another parent to IEP meetings.',
      ],
      resources: [
        'Wrightslaw (IDEA rights) — wrightslaw.com',
        'Parent Training and Information Centres (PTI) — parentcenterhub.org',
        'Understood.org — IEP and 504 guides for parents',
      ],
      disclaimer: DISCLAIMER,
    },
    financial: {
      summary: 'Financial planning for disability provides long-term security without jeopardising access to government benefits. Start with an ABLE account — it is the simplest first step.',
      recommendations: [
        'Open an ABLE Account (529A): Up to $19,000/year tax-free, does not affect SSI/Medicaid.',
        'Special Needs Trust (SNT): Assets in trust are not "owned" by the individual — benefits stay intact.',
        'Before age 18: Set up Power of Attorney (POA), Limited Guardianship, or Guardian Advocacy.',
        'Consult a special needs financial planner and attorney — this is a specialised field.',
      ],
      resources: [
        'ABLE National Resource Centre — ablenrc.org',
        'Special Needs Alliance — specialneedsalliance.org',
        'ABLE Age Adjustment Act updates — check ablenrc.org',
      ],
      disclaimer: DISCLAIMER,
    },
    nutrition: {
      summary: 'Paediatric nutrition follows WHO 2030 targets and USDA 2024–2025 guidelines. Growth monitoring using z-scores helps identify stunting, wasting, or overweight early.',
      recommendations: [
        'Track growth using WHO z-scores — flag values below -2 or above +2 to your paediatrician.',
        'USDA 2024: Prioritise sodium reduction and limit added sugars to <10% of daily calories.',
        'Follow the recommended immunisation schedule — the safest pace for your child.',
        'For the 2024–2025 season: Influenza, RSV, and COVID-19 vaccines are the "triple threat" priorities.',
        'Offer a variety of whole foods across all food groups at each developmental stage.',
      ],
      resources: [
        'WHO Child Growth Standards — who.int/childgrowth',
        'USDA MyPlate for Kids — myplate.gov',
        'AAP Nutrition resources — healthychildren.org/nutrition',
      ],
      disclaimer: DISCLAIMER,
    },
  }

  return byTopic[topic] ?? byTopic.general
}
