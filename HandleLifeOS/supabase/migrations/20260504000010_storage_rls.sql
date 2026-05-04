-- ═══════════════════════════════════════════════════════════════════════════════
--  Storage RLS — vault-documents + aura-documents
--
--  Without these policies, ANY authenticated user can list/download/delete files
--  in private buckets via the direct Supabase Storage API, bypassing the
--  app-level user_id checks in the metadata tables.
--
--  Convention enforced by upload code:
--    storage_path = "<user_id>/<doc_id>.<ext>"
--
--  These policies use the FIRST path segment as the owner user_id and require
--  it to match the authenticated session's user id. They apply to BOTH the
--  Supabase Auth `auth.uid()` path (if anyone ever uses signed-in clients)
--  AND the JWT custom-claim `sub` we set when calling from server components.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Lock down vault-documents
DROP POLICY IF EXISTS "vault_documents_select_own" ON storage.objects;
CREATE POLICY "vault_documents_select_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vault_documents_insert_own" ON storage.objects;
CREATE POLICY "vault_documents_insert_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vault_documents_update_own" ON storage.objects;
CREATE POLICY "vault_documents_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vault_documents_delete_own" ON storage.objects;
CREATE POLICY "vault_documents_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vault-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Lock down aura-documents (child medical/educational documents)
DROP POLICY IF EXISTS "aura_documents_select_own" ON storage.objects;
CREATE POLICY "aura_documents_select_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'aura-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "aura_documents_insert_own" ON storage.objects;
CREATE POLICY "aura_documents_insert_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'aura-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "aura_documents_update_own" ON storage.objects;
CREATE POLICY "aura_documents_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'aura-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "aura_documents_delete_own" ON storage.objects;
CREATE POLICY "aura_documents_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'aura-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- Hard-cap object size (10 MB) at the bucket level. The application also
-- enforces this in route handlers (defense in depth).
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE storage.buckets SET file_size_limit = 10 * 1024 * 1024 WHERE id = 'vault-documents';
UPDATE storage.buckets SET file_size_limit = 10 * 1024 * 1024 WHERE id = 'aura-documents';

-- Restrict allowed MIME types — server still validates magic bytes, but this is
-- a second-layer check at the storage layer.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]
WHERE id IN ('vault-documents', 'aura-documents');

NOTIFY pgrst, 'reload schema';
