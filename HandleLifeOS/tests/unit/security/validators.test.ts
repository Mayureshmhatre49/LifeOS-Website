import { describe, it, expect } from 'vitest'
import { emailSchema, passwordSchema, nameSchema, signupSchema, chatMessageContentSchema } from '@/lib/security/validators'

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true)
    expect(emailSchema.safeParse('user.name+tag@sub.domain.co').success).toBe(true)
  })

  it('rejects missing @', () => {
    expect(emailSchema.safeParse('notanemail').success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(emailSchema.safeParse('').success).toBe(false)
  })

  it('rejects email over 255 chars', () => {
    const long = 'a'.repeat(250) + '@x.com'
    expect(emailSchema.safeParse(long).success).toBe(false)
  })

  it('lowercases the email', () => {
    const result = emailSchema.safeParse('TEST@EXAMPLE.COM')
    expect(result.success && result.data).toBe('test@example.com')
  })
})

describe('passwordSchema', () => {
  it('accepts a strong password', () => {
    expect(passwordSchema.safeParse('Password123!').success).toBe(true)
  })

  it('rejects password under 8 chars', () => {
    expect(passwordSchema.safeParse('P1a!').success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    expect(passwordSchema.safeParse('password123!').success).toBe(false)
  })

  it('rejects password without lowercase', () => {
    expect(passwordSchema.safeParse('PASSWORD123!').success).toBe(false)
  })

  it('rejects password without number', () => {
    expect(passwordSchema.safeParse('Password!!!').success).toBe(false)
  })

  it('rejects password without special character', () => {
    expect(passwordSchema.safeParse('Password123').success).toBe(false)
  })

  it('rejects password over 128 chars', () => {
    expect(passwordSchema.safeParse('P1!' + 'a'.repeat(130)).success).toBe(false)
  })
})

describe('nameSchema', () => {
  it('accepts normal names', () => {
    expect(nameSchema.safeParse('Nishant Mhatre').success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(nameSchema.safeParse('').success).toBe(false)
  })

  it('rejects name with <script> injection', () => {
    expect(nameSchema.safeParse('<script>alert(1)</script>').success).toBe(false)
  })

  it('rejects name with SQL injection chars', () => {
    expect(nameSchema.safeParse("'; DROP TABLE users; --").success).toBe(false)
  })
})

describe('signupSchema', () => {
  const validSignup = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
  }

  it('accepts a valid signup payload', () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true)
  })

  it('rejects honeypot field filled', () => {
    expect(signupSchema.safeParse({ ...validSignup, website: 'http://spam.com' }).success).toBe(false)
  })

  it('rejects missing email', () => {
    expect(signupSchema.safeParse({ ...validSignup, email: undefined }).success).toBe(false)
  })

  it('rejects missing password', () => {
    expect(signupSchema.safeParse({ ...validSignup, password: undefined }).success).toBe(false)
  })
})

describe('chatMessageContentSchema', () => {
  it('accepts normal messages', () => {
    expect(chatMessageContentSchema.safeParse('Help me plan my week').success).toBe(true)
  })

  it('rejects empty message', () => {
    expect(chatMessageContentSchema.safeParse('').success).toBe(false)
  })

  it('rejects message over 4000 chars', () => {
    expect(chatMessageContentSchema.safeParse('a'.repeat(4001)).success).toBe(false)
  })

  it('trims whitespace', () => {
    const result = chatMessageContentSchema.safeParse('  hello  ')
    expect(result.success && result.data).toBe('hello')
  })
})
