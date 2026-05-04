-- Life OS Phase 12: Memory Engine Extensions
-- Run after 013_session_management.sql
-- Extends memory_items with importance/decay columns and adds memory_events audit table.

-- ================================================================
-- EXTEND memory_items
-- ================================================================

ALTER TABLE memory_items
  ADD COLUMN IF NOT EXISTS importance    int         NOT NULL DEFAULT 5
    CHECK (importance BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS last_used_at  timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at    timestamptz,
  ADD COLUMN IF NOT EXISTS metadata      jsonb       NOT NULL DEFAULT '{}';

-- Composite index for ranked retrieval (importance DESC within active set)
CREATE INDEX IF NOT EXISTS memory_items_rank_idx
  ON memory_items (user_id, is_active, importance DESC, updated_at DESC);

-- Index to support decay queries
CREATE INDEX IF NOT EXISTS memory_items_decay_idx
  ON memory_items (user_id, last_used_at NULLS FIRST, importance);

-- ================================================================
-- MEMORY EVENTS — audit trail for usage, creation, and corrections
-- ================================================================

CREATE TABLE IF NOT EXISTS memory_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  memory_id   uuid        REFERENCES memory_items(id) ON DELETE SET NULL,
  event_type  text        NOT NULL CHECK (event_type IN (
                'created', 'used', 'updated', 'deleted',
                'archived', 'restored', 'corrected', 'exported'
              )),
  created_at  timestamptz NOT NULL DEFAULT now(),
  metadata    jsonb       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS memory_events_user_idx
  ON memory_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS memory_events_memory_idx
  ON memory_events (memory_id);

ALTER TABLE memory_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memory_events_owner" ON memory_events
  USING (user_id::text = current_setting('app.user_id', true));
