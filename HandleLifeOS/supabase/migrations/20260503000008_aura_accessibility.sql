-- AURA accessibility preferences

ALTER TABLE aura_settings
  ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS text_size      TEXT    NOT NULL DEFAULT 'base'
                                                  CHECK (text_size IN ('sm','base','lg','xl')),
  ADD COLUMN IF NOT EXISTS high_contrast  BOOLEAN NOT NULL DEFAULT FALSE;
