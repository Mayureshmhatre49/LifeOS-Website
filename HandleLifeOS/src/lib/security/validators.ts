import { z } from 'zod'

// ── Primitives ────────────────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim()
  // Reject names that are purely special characters or look like injection
  .regex(/^[^<>"'{}();]{1,100}$/, 'Name contains invalid characters')

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  // Honeypot — must be empty; bots fill hidden fields
  website: z.string().max(0, 'Bot detected').optional(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
})

// ── Chat / content ────────────────────────────────────────────────────────────
export const chatMessageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(4000, 'Message too long (max 4000 characters)')
  .trim()

// ── File uploads ──────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
])

export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255).regex(/^[a-zA-Z0-9_\-. ]+$/),
  type: z.string().refine((t) => ALLOWED_MIME_TYPES.has(t), 'File type not allowed'),
  size: z.number().int().min(1).max(10 * 1024 * 1024), // 10 MB max
})

// ── Generic sanitisation ──────────────────────────────────────────────────────
export function sanitizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/\u2028|\u2029/g, '\n')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .trim()
}

// Strip HTML tags (for any rich-text context)
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim()
}

// Validate that a string is a UUID (for path params)
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format')

// Validate Content-Length header value
export function isPayloadTooLarge(contentLength: string | null, maxBytes = 1024 * 1024): boolean {
  if (!contentLength) return false
  const bytes = parseInt(contentLength, 10)
  return !isNaN(bytes) && bytes > maxBytes
}

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
