-- Phase 13: Decision Copilot
-- Stores every AI-generated decision analysis run by a user.

CREATE TABLE IF NOT EXISTS decision_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question         text        NOT NULL,
  category         text,
  mode             text        NOT NULL DEFAULT 'analyze'
                               CHECK (mode IN ('analyze', 'compare')),
  options          jsonb       NOT NULL DEFAULT '[]'::jsonb,
  context_snapshot jsonb       NOT NULL DEFAULT '{}'::jsonb,
  result           jsonb       NOT NULL,
  favorite         boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decision_logs_user_created
  ON decision_logs (user_id, created_at DESC);

ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own decisions
CREATE POLICY "decision_logs_owner" ON decision_logs
  FOR ALL USING (user_id = auth.uid());
