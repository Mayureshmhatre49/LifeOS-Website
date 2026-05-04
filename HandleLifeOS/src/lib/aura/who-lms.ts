// WHO Child Growth Standards — simplified LMS reference values for z-score calculation.
// Source: WHO Child Growth Standards (0-5y) and Growth Reference (5-19y).
// Values are L (skewness), M (median), S (coefficient of variation) at age points.
// We interpolate linearly between anchors. This is a working approximation for a
// non-clinical app — not for diagnostic use.

export type Sex = 'male' | 'female' | 'other'
export type GrowthMetric = 'weight' | 'height'

export interface LMSPoint {
  ageMonths: number
  L: number
  M: number
  S: number
}

// ── Weight-for-age, boys (kg). Anchors from WHO standards. ─────────────────────
const WEIGHT_BOYS: LMSPoint[] = [
  { ageMonths: 0,   L: 0.3487, M: 3.346, S: 0.14602 },
  { ageMonths: 3,   L: 0.1738, M: 6.378, S: 0.11941 },
  { ageMonths: 6,   L: 0.1115, M: 7.934, S: 0.11329 },
  { ageMonths: 12,  L: 0.0402, M: 9.649, S: 0.10973 },
  { ageMonths: 24,  L: -0.0682, M: 12.151, S: 0.10940 },
  { ageMonths: 36,  L: -0.1633, M: 14.288, S: 0.10961 },
  { ageMonths: 48,  L: -0.2424, M: 16.327, S: 0.11086 },
  { ageMonths: 60,  L: -0.3045, M: 18.298, S: 0.11329 },
  { ageMonths: 72,  L: -0.3633, M: 20.51,  S: 0.12144 },
  { ageMonths: 84,  L: -0.4239, M: 22.85,  S: 0.13005 },
  { ageMonths: 96,  L: -0.4847, M: 25.30,  S: 0.13880 },
  { ageMonths: 108, L: -0.5440, M: 28.13,  S: 0.14756 },
  { ageMonths: 120, L: -0.6004, M: 31.44,  S: 0.15623 },
]

const WEIGHT_GIRLS: LMSPoint[] = [
  { ageMonths: 0,   L: 0.3809, M: 3.232, S: 0.14171 },
  { ageMonths: 3,   L: 0.1592, M: 5.838, S: 0.12579 },
  { ageMonths: 6,   L: 0.1117, M: 7.297, S: 0.11962 },
  { ageMonths: 12,  L: 0.0402, M: 8.948, S: 0.11646 },
  { ageMonths: 24,  L: -0.0732, M: 11.479, S: 0.11572 },
  { ageMonths: 36,  L: -0.1700, M: 13.901, S: 0.11657 },
  { ageMonths: 48,  L: -0.2604, M: 16.071, S: 0.11900 },
  { ageMonths: 60,  L: -0.3501, M: 18.221, S: 0.12270 },
  { ageMonths: 72,  L: -0.4456, M: 20.41,  S: 0.13160 },
  { ageMonths: 84,  L: -0.5530, M: 22.62,  S: 0.14080 },
  { ageMonths: 96,  L: -0.6788, M: 25.06,  S: 0.15010 },
  { ageMonths: 108, L: -0.8284, M: 27.93,  S: 0.15940 },
  { ageMonths: 120, L: -1.0050, M: 31.20,  S: 0.16850 },
]

// ── Height-for-age, boys (cm). ────────────────────────────────────────────────
const HEIGHT_BOYS: LMSPoint[] = [
  { ageMonths: 0,   L: 1, M: 49.88,  S: 0.03795 },
  { ageMonths: 3,   L: 1, M: 61.43,  S: 0.03477 },
  { ageMonths: 6,   L: 1, M: 67.62,  S: 0.03512 },
  { ageMonths: 12,  L: 1, M: 75.74,  S: 0.03762 },
  { ageMonths: 24,  L: 1, M: 87.13,  S: 0.04026 },
  { ageMonths: 36,  L: 1, M: 96.10,  S: 0.04210 },
  { ageMonths: 48,  L: 1, M: 103.33, S: 0.04338 },
  { ageMonths: 60,  L: 1, M: 110.04, S: 0.04404 },
  { ageMonths: 72,  L: 1, M: 116.04, S: 0.04434 },
  { ageMonths: 84,  L: 1, M: 121.7,  S: 0.04450 },
  { ageMonths: 96,  L: 1, M: 127.3,  S: 0.04461 },
  { ageMonths: 108, L: 1, M: 132.6,  S: 0.04478 },
  { ageMonths: 120, L: 1, M: 137.8,  S: 0.04510 },
  { ageMonths: 144, L: 1, M: 149.1,  S: 0.04734 },
  { ageMonths: 168, L: 1, M: 161.2,  S: 0.04590 },
  { ageMonths: 192, L: 1, M: 171.3,  S: 0.04154 },
  { ageMonths: 216, L: 1, M: 175.2,  S: 0.03940 },
]

const HEIGHT_GIRLS: LMSPoint[] = [
  { ageMonths: 0,   L: 1, M: 49.15,  S: 0.0379 },
  { ageMonths: 3,   L: 1, M: 59.80,  S: 0.0364 },
  { ageMonths: 6,   L: 1, M: 65.73,  S: 0.0367 },
  { ageMonths: 12,  L: 1, M: 74.02,  S: 0.0388 },
  { ageMonths: 24,  L: 1, M: 85.7,   S: 0.0408 },
  { ageMonths: 36,  L: 1, M: 95.1,   S: 0.0419 },
  { ageMonths: 48,  L: 1, M: 102.7,  S: 0.0427 },
  { ageMonths: 60,  L: 1, M: 109.4,  S: 0.0431 },
  { ageMonths: 72,  L: 1, M: 115.5,  S: 0.0432 },
  { ageMonths: 84,  L: 1, M: 121.1,  S: 0.0432 },
  { ageMonths: 96,  L: 1, M: 126.6,  S: 0.0433 },
  { ageMonths: 108, L: 1, M: 132.2,  S: 0.0434 },
  { ageMonths: 120, L: 1, M: 138.6,  S: 0.0454 },
  { ageMonths: 144, L: 1, M: 151.2,  S: 0.0476 },
  { ageMonths: 168, L: 1, M: 159.7,  S: 0.0408 },
  { ageMonths: 192, L: 1, M: 162.5,  S: 0.0381 },
  { ageMonths: 216, L: 1, M: 163.1,  S: 0.0376 },
]

function tableFor(metric: GrowthMetric, sex: Sex): LMSPoint[] {
  const g = sex === 'female'
  if (metric === 'weight') return g ? WEIGHT_GIRLS : WEIGHT_BOYS
  return g ? HEIGHT_GIRLS : HEIGHT_BOYS
}

// Linear interpolation between bracketing anchors.
function interpolate(table: LMSPoint[], ageMonths: number): LMSPoint | null {
  if (table.length === 0) return null
  if (ageMonths <= table[0].ageMonths) return table[0]
  if (ageMonths >= table[table.length - 1].ageMonths) return table[table.length - 1]
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i], b = table[i + 1]
    if (ageMonths >= a.ageMonths && ageMonths <= b.ageMonths) {
      const t = (ageMonths - a.ageMonths) / (b.ageMonths - a.ageMonths)
      return {
        ageMonths,
        L: a.L + t * (b.L - a.L),
        M: a.M + t * (b.M - a.M),
        S: a.S + t * (b.S - a.S),
      }
    }
  }
  return null
}

// LMS z-score: y = M * (1 + L*S*z)^(1/L), inverted to z.
export function calculateLMSZScore(value: number, lms: LMSPoint): number {
  const { L, M, S } = lms
  if (M <= 0 || S <= 0) return 0
  if (Math.abs(L) < 1e-6) return Math.log(value / M) / S
  return (Math.pow(value / M, L) - 1) / (L * S)
}

// Approximate percentile from z-score (cumulative normal).
function zToPercentile(z: number): number {
  // Abramowitz & Stegun 26.2.17 approximation
  const sign = z < 0 ? -1 : 1
  const a = Math.abs(z) / Math.sqrt(2)
  const t = 1.0 / (1.0 + 0.3275911 * a)
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return Math.round((0.5 * (1 + sign * erf)) * 1000) / 10
}

export interface PercentileResult {
  z: number
  percentile: number      // 0-100
  category: 'severely-low' | 'low' | 'normal' | 'high' | 'very-high'
  label: string
  color: string
}

export function classifyZ(z: number, metric: GrowthMetric): PercentileResult {
  const percentile = zToPercentile(z)
  const isHeight = metric === 'height'
  const lowLabel  = isHeight ? 'Stunted growth (severe)' : 'Severely underweight'
  const lowMid    = isHeight ? 'Below typical height'    : 'Underweight'
  const highMid   = isHeight ? 'Tall stature'            : 'Overweight'
  const highHigh  = isHeight ? 'Very tall'               : 'Obese'

  if (z < -3) return { z, percentile, category: 'severely-low', label: lowLabel,  color: 'text-rose-700'   }
  if (z < -2) return { z, percentile, category: 'low',          label: lowMid,    color: 'text-orange-600' }
  if (z >  3) return { z, percentile, category: 'very-high',    label: highHigh,  color: 'text-rose-700'   }
  if (z >  2) return { z, percentile, category: 'high',         label: highMid,   color: 'text-amber-600'  }
  return        { z, percentile, category: 'normal',            label: 'Normal range', color: 'text-emerald-600' }
}

export function getPercentile(
  metric: GrowthMetric,
  sex: Sex,
  ageMonths: number,
  value: number,
): PercentileResult | null {
  if (sex === 'other') sex = 'male' // fall back; LMS data only has male/female
  const lms = interpolate(tableFor(metric, sex), ageMonths)
  if (!lms || value <= 0) return null
  const z = calculateLMSZScore(value, lms)
  return classifyZ(z, metric)
}

// Median for a given age — used to draw the P50 reference line on charts.
export function getMedian(metric: GrowthMetric, sex: Sex, ageMonths: number): number | null {
  if (sex === 'other') sex = 'male'
  const lms = interpolate(tableFor(metric, sex), ageMonths)
  return lms ? Math.round(lms.M * 10) / 10 : null
}
