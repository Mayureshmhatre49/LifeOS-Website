import { z } from 'zod'

const textPartSchema = z.object({ type: z.literal('text'), text: z.string() })
const filePartSchema = z.object({ type: z.literal('file') }).passthrough()

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(z.union([textPartSchema, filePartSchema, z.object({ type: z.string() }).passthrough()])),
  metadata: z.unknown().optional(),
})

export const chatRequestSchema = z.object({
  id: z.string().optional(),
  messages: z.array(uiMessageSchema).min(1).max(100),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
