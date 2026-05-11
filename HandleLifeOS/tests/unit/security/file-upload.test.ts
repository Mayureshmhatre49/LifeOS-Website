import { describe, it, expect } from 'vitest'
import { detectMimeFromMagicBytes, sanitizeFilename, sanitizeExtension } from '@/lib/security/file-upload'
import {
  mockPDFBytes,
  mockJPEGBytes,
  mockPNGBytes,
  mockEXEBytes,
  maliciousFilenames,
  legitimateFilenames,
} from '../../fixtures/seed-mock-data'

describe('detectMimeFromMagicBytes', () => {
  it('detects PDF from magic bytes', () => {
    expect(detectMimeFromMagicBytes(mockPDFBytes)).toBe('application/pdf')
  })

  it('detects JPEG from magic bytes', () => {
    expect(detectMimeFromMagicBytes(mockJPEGBytes)).toBe('image/jpeg')
  })

  it('detects PNG from magic bytes', () => {
    expect(detectMimeFromMagicBytes(mockPNGBytes)).toBe('image/png')
  })

  it('returns null for EXE (unallowed type)', () => {
    expect(detectMimeFromMagicBytes(mockEXEBytes)).toBeNull()
  })

  it('returns null for empty buffer', () => {
    expect(detectMimeFromMagicBytes(Buffer.alloc(0))).toBeNull()
  })

  it('returns null for random bytes', () => {
    const random = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04])
    expect(detectMimeFromMagicBytes(random)).toBeNull()
  })
})

describe('sanitizeFilename', () => {
  it('blocks path traversal with ../', () => {
    const result = sanitizeFilename('../../../etc/passwd')
    expect(result).not.toContain('..')
    expect(result).not.toContain('/')
  })

  it('strips XSS from filenames', () => {
    const result = sanitizeFilename('file<script>alert(1)</script>.pdf')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
  })

  it('strips null bytes from filename', () => {
    const result = sanitizeFilename('file\x00.pdf')
    expect(result).not.toContain('\x00')
  })

  it('handles null input gracefully', () => {
    const result = sanitizeFilename(null)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles undefined input gracefully', () => {
    const result = sanitizeFilename(undefined)
    expect(typeof result).toBe('string')
  })

  it('allows all legitimate filenames', () => {
    for (const name of legitimateFilenames) {
      const result = sanitizeFilename(name)
      expect(result.length, `"${name}" should produce non-empty result`).toBeGreaterThan(0)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    }
  })

  it('blocks all malicious filenames without throwing', () => {
    for (const name of maliciousFilenames) {
      expect(() => sanitizeFilename(name)).not.toThrow()
      const result = sanitizeFilename(name)
      expect(result).not.toContain('../')
      expect(result).not.toContain('<script>')
    }
  })

  it('truncates filenames longer than 200 chars', () => {
    const longName = 'a'.repeat(300) + '.pdf'
    const result = sanitizeFilename(longName)
    expect(result.length).toBeLessThanOrEqual(204) // 200 + possible extension
  })
})

describe('sanitizeExtension', () => {
  it('lowercases extensions', () => {
    expect(sanitizeExtension('PDF')).toBe('pdf')
  })

  it('strips non-alphanumeric characters', () => {
    expect(sanitizeExtension('p.h.p')).not.toContain('.')
  })

  it('limits extension to 8 chars', () => {
    const result = sanitizeExtension('verylongextension')
    expect(result.length).toBeLessThanOrEqual(8)
  })

  it('handles null input', () => {
    const result = sanitizeExtension(null)
    expect(typeof result).toBe('string')
  })
})
