import { describe, it, expect } from 'vitest'
import { maskPII, sanitizePromptForAI } from '@/lib/security/pii'
import { piiPayloads } from '../../fixtures/seed-mock-data'

describe('maskPII — detection', () => {
  it('detects email addresses', () => {
    const result = maskPII(piiPayloads.email)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('email')
  })

  it('detects Indian phone numbers', () => {
    const result = maskPII(piiPayloads.phone)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('phone_india')
  })

  it('detects Aadhaar number', () => {
    const result = maskPII(piiPayloads.aadhaar)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('aadhaar')
  })

  it('detects PAN card', () => {
    const result = maskPII(piiPayloads.pan)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('pan_card')
  })

  it('detects UPI ID', () => {
    const result = maskPII(piiPayloads.upi)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('upi_id')
  })

  it('detects credit card number', () => {
    const result = maskPII(piiPayloads.creditCard)
    expect(result.hasPII).toBe(true)
    expect(result.detectedTypes).toContain('credit_card')
  })
})

describe('maskPII — masking', () => {
  it('replaces email with [EMAIL] placeholder', () => {
    const result = maskPII('Contact john.doe@example.com for more info')
    expect(result.maskedText).not.toContain('john.doe@example.com')
    expect(result.maskedText).toContain('[EMAIL]')
  })

  it('replaces phone with [PHONE_INDIA] placeholder', () => {
    const result = maskPII('Call +91 9876543210 now')
    expect(result.maskedText).not.toContain('9876543210')
    expect(result.maskedText).toContain('[PHONE_INDIA]')
  })

  it('replaces Aadhaar with [AADHAAR] placeholder', () => {
    const result = maskPII('My Aadhaar is 2345 6789 0123')
    expect(result.maskedText).not.toMatch(/\d{4}\s\d{4}\s\d{4}/)
    expect(result.maskedText).toContain('[AADHAAR]')
  })

  it('replaces PAN with [PAN_CARD] placeholder', () => {
    const result = maskPII('My PAN is ABCDE1234F')
    expect(result.maskedText).not.toContain('ABCDE1234F')
    expect(result.maskedText).toContain('[PAN_CARD]')
  })

  it('handles text with no PII gracefully', () => {
    const clean = 'Help me plan my week'
    const result = maskPII(clean)
    expect(result.hasPII).toBe(false)
    expect(result.detectedTypes).toHaveLength(0)
    expect(result.maskedText).toBe(clean)
  })

  it('masks multiple PII types in one string', () => {
    const text = 'Email: test@example.com, Phone: +91 9876543210'
    const result = maskPII(text)
    expect(result.hasPII).toBe(true)
    expect(result.maskedText).not.toContain('test@example.com')
    expect(result.maskedText).not.toContain('9876543210')
    expect(result.detectedTypes.length).toBeGreaterThanOrEqual(2)
  })

  it('can mask only specified types', () => {
    const text = 'Email: test@example.com, Phone: +91 9876543210'
    const result = maskPII(text, ['email'])
    expect(result.maskedText).not.toContain('test@example.com')
    // Phone should NOT be masked (not in types list)
    expect(result.maskedText).toContain('9876543210')
  })
})

describe('sanitizePromptForAI', () => {
  it('removes PII from a prompt before AI submission', () => {
    const prompt = 'My Aadhaar is 2345 6789 0123 and email is user@test.com'
    const sanitized = sanitizePromptForAI(prompt)
    expect(sanitized).not.toMatch(/\d{4}\s\d{4}\s\d{4}/)
    expect(sanitized).not.toContain('user@test.com')
  })

  it('returns a string', () => {
    const result = sanitizePromptForAI('plain text')
    expect(typeof result).toBe('string')
  })
})
