-- Fix enum constraints discovered during E2E persona seeding (DEF-002, DEF-004, DEF-006, DEF-007)

-- DEF-002: add 'electronics' to home_assets.type
ALTER TABLE home_assets DROP CONSTRAINT IF EXISTS home_assets_type_check;
ALTER TABLE home_assets ADD CONSTRAINT home_assets_type_check
  CHECK (type IN ('appliance','furniture','vehicle','property','electronics','other'));

-- DEF-004: add 'meals' and 'education' to business_expenses.category
ALTER TABLE business_expenses DROP CONSTRAINT IF EXISTS business_expenses_category_check;
ALTER TABLE business_expenses ADD CONSTRAINT business_expenses_category_check
  CHECK (category IN ('software','hardware','travel','office','marketing','professional_fees','utilities','tax','meals','education','other'));

-- DEF-006: add 'weekly' and 'daily' to legal_compliances.frequency
ALTER TABLE legal_compliances DROP CONSTRAINT IF EXISTS legal_compliances_frequency_check;
ALTER TABLE legal_compliances ADD CONSTRAINT legal_compliances_frequency_check
  CHECK (frequency IN ('one-time','monthly','weekly','daily','quarterly','annual','none'));

-- DEF-007: add 'friendly' to negotiation_templates.tone
ALTER TABLE negotiation_templates DROP CONSTRAINT IF EXISTS negotiation_templates_tone_check;
ALTER TABLE negotiation_templates ADD CONSTRAINT negotiation_templates_tone_check
  CHECK (tone IN ('polite','firm','professional','friendly'));
