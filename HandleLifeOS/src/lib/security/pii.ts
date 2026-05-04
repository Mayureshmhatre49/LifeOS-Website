/**
 * PII Masking Utility for Life OS
 * Detects and anonymizes sensitive Indian and global PII patterns 
 * before they are sent to external AI providers.
 */

const PATTERNS = {
  // Global Patterns
  email: /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g,
  credit_card: /\b(?:\d[ -]*?){13,16}\b/g,
  
  // Indian Specific Patterns
  phone_india: /(?:\+91|91|0)?[6-9]\d{9}\b/g,
  aadhaar: /\b[2-9]\d{3}\s\d{4}\s\d{4}\b|\b[2-9]\d{11}\b/g,
  pan_card: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
  upi_id: /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g,
  ifsc_code: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
} as const

type PIIType = keyof typeof PATTERNS

export interface PIIAnalysis {
  hasPII: boolean
  detectedTypes: PIIType[]
  maskedText: string
}

/**
 * Masks PII in a given string.
 * @param text The raw input text
 * @param types Optional list of specific types to mask (defaults to all)
 */
export function maskPII(text: string, types: PIIType[] = Object.keys(PATTERNS) as PIIType[]): PIIAnalysis {
  let maskedText = text
  const detectedTypes = new Set<PIIType>()

  for (const type of types) {
    const pattern = PATTERNS[type]
    if (pattern.test(text)) {
      detectedTypes.add(type)
      // Reset regex index due to 'g' flag
      pattern.lastIndex = 0
      maskedText = maskedText.replace(pattern, (match) => {
        return `[${type.toUpperCase()}]`
      })
    }
  }

  return {
    hasPII: detectedTypes.size > 0,
    detectedTypes: Array.from(detectedTypes),
    maskedText,
  }
}

/**
 * Specifically for AI safety: cleans up a prompt before sending
 */
export function sanitizePromptForAI(prompt: string): string {
  // Mask everything except high-value numeric amounts which might be needed for EMI/Budgeting
  // We avoid masking single numbers or simple currency strings like "50,000" 
  // but mask everything that looks like an ID or Contact.
  const result = maskPII(prompt)
  return result.maskedText
}
