-- ═══════════════════════════════════════════════════════════════════════════════
-- Property Management Module — Phase 3: Property Document Vault
-- Property-specific document categories, expiry detection
-- Uses existing vault-documents storage bucket (same RLS path convention)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'sale_deed','agreement_to_sale','lease','society_share',
      'mutation','tax_receipt','encumbrance','na_order','survey_map',
      'oc_cc','title_report','poa',
      'loan_agreement','insurance','deposit_receipt','rent_receipt',
      'structural_drawing','electrical_drawing','plumbing_layout',
      'hvac','solar','dg','appliance_manual','warranty',
      'other'
    )),
  storage_path TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL DEFAULT 0,
  expires_at   DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS property_documents_user_id_idx     ON property_documents(user_id);
CREATE INDEX IF NOT EXISTS property_documents_property_id_idx ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS property_documents_expires_at_idx  ON property_documents(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS property_documents_owner ON property_documents;
CREATE POLICY property_documents_owner ON property_documents
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));
