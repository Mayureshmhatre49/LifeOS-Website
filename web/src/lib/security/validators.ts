import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email too long')
  .toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim()

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const chatMessageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(4000, 'Message too long (max 4000 characters)')
  .trim()

export function sanitizeText(text: string): string {
  return text
    .replace(/\0/g, '')
    .replace(/[\u2028\u2029]/g, '\n')
    .trim()
}

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
