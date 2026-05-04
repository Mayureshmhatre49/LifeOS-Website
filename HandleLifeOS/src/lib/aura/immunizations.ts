// Recommended immunisation schedule (composite of CDC + IAP/India + WHO).
// Used to flag which vaccines are due, overdue, or completed for a child.
// NOT a clinical decision tool — always defer to the child's paediatrician.

export interface VaccineDose {
  id: string
  name: string                     // short name e.g. 'DTaP'
  fullName: string                 // expanded e.g. 'Diphtheria, Tetanus, Pertussis'
  due_at_months: number
  series_index?: number            // 1, 2, 3 within a multi-dose series
  notes?: string
  optional?: boolean               // true for boosters / region-specific
  region?: 'IN' | 'US' | 'GLOBAL'
}

export const IMMUNIZATION_SCHEDULE: VaccineDose[] = [
  // ── Birth ──────────────────────────────────────────────────────────────────
  { id: 'bcg',      name: 'BCG',       fullName: 'Bacillus Calmette-Guérin (TB)',           due_at_months: 0, region: 'IN' },
  { id: 'hepb-1',   name: 'Hep B 1',   fullName: 'Hepatitis B — first dose',                due_at_months: 0, series_index: 1 },
  { id: 'opv-0',    name: 'OPV 0',     fullName: 'Oral Polio — birth dose',                 due_at_months: 0, region: 'IN' },

  // ── 6 weeks (≈1.5 months) ─────────────────────────────────────────────────
  { id: 'dtap-1',   name: 'DTaP 1',    fullName: 'Diphtheria, Tetanus, Pertussis',          due_at_months: 1.5, series_index: 1 },
  { id: 'ipv-1',    name: 'IPV 1',     fullName: 'Inactivated Polio',                       due_at_months: 1.5, series_index: 1 },
  { id: 'hib-1',    name: 'Hib 1',     fullName: 'Haemophilus Influenzae type B',           due_at_months: 1.5, series_index: 1 },
  { id: 'pcv-1',    name: 'PCV 1',     fullName: 'Pneumococcal conjugate',                  due_at_months: 1.5, series_index: 1 },
  { id: 'rota-1',   name: 'Rota 1',    fullName: 'Rotavirus',                               due_at_months: 1.5, series_index: 1 },
  { id: 'hepb-2',   name: 'Hep B 2',   fullName: 'Hepatitis B — second dose',               due_at_months: 1.5, series_index: 2 },

  // ── 10 weeks (≈2.5 months) ────────────────────────────────────────────────
  { id: 'dtap-2',   name: 'DTaP 2',    fullName: 'Diphtheria, Tetanus, Pertussis',          due_at_months: 2.5, series_index: 2 },
  { id: 'ipv-2',    name: 'IPV 2',     fullName: 'Inactivated Polio',                       due_at_months: 2.5, series_index: 2 },
  { id: 'hib-2',    name: 'Hib 2',     fullName: 'Haemophilus Influenzae type B',           due_at_months: 2.5, series_index: 2 },
  { id: 'pcv-2',    name: 'PCV 2',     fullName: 'Pneumococcal conjugate',                  due_at_months: 2.5, series_index: 2 },
  { id: 'rota-2',   name: 'Rota 2',    fullName: 'Rotavirus',                               due_at_months: 2.5, series_index: 2 },

  // ── 14 weeks (≈3.5 months) ────────────────────────────────────────────────
  { id: 'dtap-3',   name: 'DTaP 3',    fullName: 'Diphtheria, Tetanus, Pertussis',          due_at_months: 3.5, series_index: 3 },
  { id: 'ipv-3',    name: 'IPV 3',     fullName: 'Inactivated Polio',                       due_at_months: 3.5, series_index: 3 },
  { id: 'hib-3',    name: 'Hib 3',     fullName: 'Haemophilus Influenzae type B',           due_at_months: 3.5, series_index: 3 },
  { id: 'pcv-3',    name: 'PCV 3',     fullName: 'Pneumococcal conjugate',                  due_at_months: 3.5, series_index: 3 },
  { id: 'rota-3',   name: 'Rota 3',    fullName: 'Rotavirus',                               due_at_months: 3.5, series_index: 3, optional: true, notes: 'Required only for some Rota brands' },

  // ── 6 months ──────────────────────────────────────────────────────────────
  { id: 'flu-1',    name: 'Flu',       fullName: 'Influenza (annual from 6mo)',             due_at_months: 6, notes: 'Annual after first dose' },
  { id: 'hepb-3',   name: 'Hep B 3',   fullName: 'Hepatitis B — third dose',                due_at_months: 6, series_index: 3 },

  // ── 9 months ──────────────────────────────────────────────────────────────
  { id: 'mmr-1',    name: 'MMR 1',     fullName: 'Measles, Mumps, Rubella',                 due_at_months: 9, series_index: 1 },

  // ── 12 months ─────────────────────────────────────────────────────────────
  { id: 'pcv-b',    name: 'PCV booster', fullName: 'Pneumococcal booster',                  due_at_months: 12, series_index: 4 },
  { id: 'hib-b',    name: 'Hib booster', fullName: 'Haemophilus Influenzae booster',        due_at_months: 12, series_index: 4 },
  { id: 'hepa-1',   name: 'Hep A 1',   fullName: 'Hepatitis A — first dose',                due_at_months: 12, series_index: 1 },

  // ── 15 months ─────────────────────────────────────────────────────────────
  { id: 'mmr-2',    name: 'MMR 2',     fullName: 'Measles, Mumps, Rubella — second dose',   due_at_months: 15, series_index: 2 },
  { id: 'var-1',    name: 'Varicella', fullName: 'Varicella (Chickenpox)',                  due_at_months: 15, series_index: 1 },

  // ── 18 months ─────────────────────────────────────────────────────────────
  { id: 'dtap-4',   name: 'DTaP B1',   fullName: 'DTaP — first booster',                    due_at_months: 18, series_index: 4 },
  { id: 'ipv-4',    name: 'IPV B1',    fullName: 'IPV — booster',                           due_at_months: 18, series_index: 4 },
  { id: 'hepa-2',   name: 'Hep A 2',   fullName: 'Hepatitis A — second dose',               due_at_months: 18, series_index: 2 },

  // ── 4-6 years ─────────────────────────────────────────────────────────────
  { id: 'dtap-5',   name: 'DTaP B2',   fullName: 'DTaP — second booster',                   due_at_months: 60, series_index: 5 },
  { id: 'ipv-5',    name: 'IPV B2',    fullName: 'IPV — final booster',                     due_at_months: 60, series_index: 5 },
  { id: 'mmr-3',    name: 'MMR B',     fullName: 'MMR booster',                             due_at_months: 60, optional: true },
  { id: 'var-2',    name: 'Varicella 2', fullName: 'Varicella — second dose',               due_at_months: 60, series_index: 2 },

  // ── 9-12 years (HPV, Tdap, MenACWY) ───────────────────────────────────────
  { id: 'hpv-1',    name: 'HPV 1',     fullName: 'Human Papillomavirus — first dose',       due_at_months: 108, series_index: 1, notes: 'Recommended ages 9-14' },
  { id: 'hpv-2',    name: 'HPV 2',     fullName: 'Human Papillomavirus — second dose',      due_at_months: 114, series_index: 2 },
  { id: 'tdap',     name: 'Tdap',      fullName: 'Tetanus, Diphtheria, Pertussis (adolescent)', due_at_months: 132 },
  { id: 'menacwy',  name: 'MenACWY',   fullName: 'Meningococcal',                           due_at_months: 132, region: 'US', optional: true },

  // ── Annual / situational ──────────────────────────────────────────────────
  { id: 'covid',    name: 'COVID-19',  fullName: 'COVID-19 (per current guidance)',         due_at_months: 6, optional: true, notes: '"Triple Threat" 2024-25 protocol' },
  { id: 'rsv',      name: 'RSV',       fullName: 'Respiratory Syncytial Virus (high-risk)', due_at_months: 0, optional: true, notes: 'For high-risk infants per paediatrician' },
]

// Status of a single dose for a given child:
export type ImmunizationStatus =
  | 'completed'   // recorded as given
  | 'overdue'     // past due window without record
  | 'due'         // currently due
  | 'upcoming'    // scheduled in future
  | 'optional'    // optional / region-specific

export function classifyDose(
  dose: VaccineDose,
  ageMonths: number,
  completedIds: Set<string>,
): ImmunizationStatus {
  if (completedIds.has(dose.id)) return 'completed'
  if (dose.optional && ageMonths < dose.due_at_months) return 'optional'
  const dueWindow = 2 // 2-month grace window
  if (ageMonths < dose.due_at_months) return 'upcoming'
  if (ageMonths <= dose.due_at_months + dueWindow) return 'due'
  return 'overdue'
}
