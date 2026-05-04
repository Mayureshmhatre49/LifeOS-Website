// Embedding generation for journal entries — used to power RAG in the Companion.
// Uses Gemini's gemini-embedding-001 with outputDimensionality=768 to match the
// vector(768) column in journal_entries.

import { embed } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const TARGET_DIM = 768

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return null
  if (!text || text.trim().length < 5) return null

  try {
    const google = createGoogleGenerativeAI({ apiKey })
    const result = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: text.slice(0, 8000), // Gemini limit
      providerOptions: {
        google: { outputDimensionality: TARGET_DIM },
      },
    })
    if (!result.embedding || result.embedding.length !== TARGET_DIM) return null
    return result.embedding
  } catch (e) {
    console.warn('[embeddings] generation failed:', e)
    return null
  }
}

export interface JournalMatch {
  id: string
  content: string
  mood: number | null
  tags: string[]
  created_at: string
  similarity: number
}

// Search top-K most semantically similar journal entries for a user.
// Uses the match_journal_entries() RPC defined in the mind_phase7 migration.
export async function findSimilarJournalEntries(
  userId: string,
  query: string,
  matchCount = 3,
): Promise<JournalMatch[]> {
  const queryEmbedding = await generateEmbedding(query)
  if (!queryEmbedding) return []

  const { getSupabaseAdmin, isSupabaseConfigured } = await import('@/lib/db/client')
  if (!isSupabaseConfigured()) return []
  const db = getSupabaseAdmin()

  const { data, error } = await db.rpc('match_journal_entries', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: matchCount,
    similarity_threshold: 0.55,
  })

  if (error) {
    console.warn('[embeddings] match_journal_entries failed:', error.message)
    return []
  }
  return (data ?? []) as JournalMatch[]
}
