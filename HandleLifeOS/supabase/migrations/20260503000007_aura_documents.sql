-- AURA Document Vault — metadata table for files stored in Supabase Storage.

CREATE TABLE IF NOT EXISTS aura_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id      UUID REFERENCES aura_profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  doc_type      TEXT NOT NULL CHECK (doc_type IN ('iep','504','evaluation','medical','vaccination','other')),
  storage_path  TEXT NOT NULL,                 -- bucket path: <user_id>/<doc_id>.<ext>
  mime_type     TEXT,
  size_bytes    INTEGER,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aura_documents_user  ON aura_documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aura_documents_child ON aura_documents(child_id, created_at DESC);

ALTER TABLE aura_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aura_documents_owner ON aura_documents;
CREATE POLICY aura_documents_owner ON aura_documents
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- Storage bucket setup (one-time): create the 'aura-documents' bucket if missing.
-- This uses Supabase's storage schema. Bucket is private (public = false).
INSERT INTO storage.buckets (id, name, public)
VALUES ('aura-documents', 'aura-documents', false)
ON CONFLICT (id) DO NOTHING;
