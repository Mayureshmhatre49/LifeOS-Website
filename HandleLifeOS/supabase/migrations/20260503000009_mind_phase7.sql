-- Mind module Phase 7 — multi-dimensional check-in + tool effectiveness tracking

-- ── Mood logs: add energy + stress categories ─────────────────────────────────
ALTER TABLE mood_logs
  ADD COLUMN IF NOT EXISTS energy           INTEGER CHECK (energy IS NULL OR (energy BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS stress_categories TEXT[] DEFAULT '{}';

-- ── Tool sessions: add pre/post intensity for measuring effectiveness ─────────
ALTER TABLE mind_tool_sessions
  ADD COLUMN IF NOT EXISTS pre_intensity   INTEGER CHECK (pre_intensity  IS NULL OR (pre_intensity  BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS post_intensity  INTEGER CHECK (post_intensity IS NULL OR (post_intensity BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_before     INTEGER CHECK (mood_before    IS NULL OR (mood_before    BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS mood_after      INTEGER CHECK (mood_after     IS NULL OR (mood_after     BETWEEN 1 AND 5));

-- ── pgvector for journal RAG ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS journal_entries_embedding_idx
  ON journal_entries USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── RPC: similarity search for journal entries ───────────────────────────────
CREATE OR REPLACE FUNCTION match_journal_entries(
  query_embedding vector(768),
  match_user_id   UUID,
  match_count     INT     DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id           UUID,
  content      TEXT,
  mood         INTEGER,
  tags         TEXT[],
  created_at   TIMESTAMPTZ,
  similarity   FLOAT
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
