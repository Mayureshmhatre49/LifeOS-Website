import { describe, it, expect } from 'vitest'
import { formatMemoryForPrompt } from '@/lib/memory/context-builder'
import type { MemoryContext } from '@/types/memory'
import {
  mockProfile,
  mockMemoryItems,
  mockMaliciousMemoryItem,
} from '../../fixtures/seed-mock-data'

function buildCtx(overrides: Partial<MemoryContext> = {}): MemoryContext {
  return {
    profile: { ...mockProfile, memory_enabled: true } as MemoryContext['profile'],
    items: mockMemoryItems as MemoryContext['items'],
    preferences: [],
    ...overrides,
  }
}

describe('formatMemoryForPrompt', () => {
  it('returns empty string when memory_enabled is false', () => {
    const ctx = buildCtx({
      profile: { ...mockProfile, memory_enabled: false } as MemoryContext['profile'],
    })
    expect(formatMemoryForPrompt(ctx)).toBe('')
  })

  it('returns empty string when profile is null', () => {
    const ctx = buildCtx({ profile: null as unknown as MemoryContext['profile'] })
    expect(formatMemoryForPrompt(ctx)).toBe('')
  })

  it('includes user display_name in output', () => {
    const result = formatMemoryForPrompt(buildCtx())
    expect(result).toContain('Nishant')
  })

  it('includes occupation in output', () => {
    const result = formatMemoryForPrompt(buildCtx())
    expect(result).toContain('Software Engineer')
  })

  it('includes memory items grouped by type', () => {
    const result = formatMemoryForPrompt(buildCtx())
    expect(result).toContain('wake_time')
  })

  it('sanitizes injection tokens in memory values — strips {{...}}', () => {
    const ctx = buildCtx({
      items: [mockMaliciousMemoryItem] as MemoryContext['items'],
    })
    const result = formatMemoryForPrompt(ctx)
    expect(result).not.toContain('{{malicious}}')
  })

  it('sanitizes injection tokens — strips <|...|>', () => {
    const ctx = buildCtx({
      items: [mockMaliciousMemoryItem] as MemoryContext['items'],
    })
    const result = formatMemoryForPrompt(ctx)
    expect(result).not.toContain('<|endoftext|>')
  })

  it('sanitizes injection tokens — strips [INST]', () => {
    const ctx = buildCtx({
      items: [mockMaliciousMemoryItem] as MemoryContext['items'],
    })
    const result = formatMemoryForPrompt(ctx)
    expect(result).not.toContain('[INST]')
  })

  it('sanitizes role prefix in key — neutralizes "system:"', () => {
    const ctx = buildCtx({
      items: [mockMaliciousMemoryItem] as MemoryContext['items'],
    })
    const result = formatMemoryForPrompt(ctx)
    // Key contained "system:" which should be neutralized
    expect(result).not.toMatch(/^system\s*:/im)
  })

  it('wraps output in memory fence markers', () => {
    const result = formatMemoryForPrompt(buildCtx())
    expect(result).toContain('--- User Memory')
    expect(result).toContain('---')
  })

  it('returns empty string when profile has no fields set', () => {
    const ctx = buildCtx({
      profile: { memory_enabled: true } as MemoryContext['profile'],
      items: [],
      preferences: [],
    })
    expect(formatMemoryForPrompt(ctx)).toBe('')
  })

  it('includes preferences when present', () => {
    const ctx = buildCtx({
      preferences: [
        { category: 'ui', key: 'theme', value: 'dark', user_id: mockProfile.user_id, id: 'pref-001', created_at: '', updated_at: '' },
      ],
    })
    const result = formatMemoryForPrompt(ctx)
    expect(result).toContain('theme')
    expect(result).toContain('dark')
  })
})
