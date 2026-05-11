-- Mind module Phase 7 — missing columns (mood energy + tool effectiveness tracking)
-- Paste this into Supabase Dashboard → SQL Editor and run.
-- All statements are idempotent (ADD COLUMN IF NOT EXISTS).
--
-- NOTE: The pgvector section (journal embedding) requires the vector extension.
-- If your project does not have pgvector enabled, skip lines marked [PGVECTOR].
-- Enable it first via: Dashboard → Database → Extensions → enable "vector"

-- ── Mood logs: energy level + stress categories ──────────────────────────────
ALTER TABLE mood_logs
  ADD COLUMN IF NOT EXISTS energy            INTEGER CHECK (energy IS NULL OR (energy BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS stress_categories TEXT[]  DEFAULT '{}';

-- ── Tool sessions: pre/post mood + intensity for effectiveness tracking ────────
ALTER TABLE mind_tool_sessions
  ADD COLUMN IF NOT EXISTS pre_intensity  INTEGER CHECK (pre_intensity  IS NULL OR (pre_intensity  BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS post_intensity INTEGER CHECK (post_intensity IS NULL OR (post_intensity BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_before    INTEGER CHECK (mood_before    IS NULL OR (mood_before    BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_after     INTEGER CHECK (mood_after     IS NULL OR (mood_after     BETWEEN 1 AND 5));

-- ── [PGVECTOR] Journal entries: semantic embedding for RAG search ─────────────
-- Run this block only after enabling the vector extension in your project.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS journal_entries_embedding_idx
  ON journal_entries USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_journal_entries(
  query_embedding      vector(768),
  match_user_id        UUID,
  match_count          INT   DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id         UUID,
  content    TEXT,
  mood       INTEGER,
  tags       TEXT[],
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    je.id,
    je.content,
    je.mood,
    je.tags,
    je.created_at,
    1 - (je.embedding <=> query_embedding) AS similarity
  FROM journal_entries je
  WHERE je.user_id = match_user_id
    AND je.embedding IS NOT NULL
    AND 1 - (je.embedding <=> query_embedding) > similarity_threshold
  ORDER BY je.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;
