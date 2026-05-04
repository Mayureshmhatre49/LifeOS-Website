-- Phase 27 — Social & Community
-- Strategy: build infrastructure that delivers value at scale of 1 user (you + your
-- accountability partner) and grows organically as users join. NO global forum
-- (would be dead at <1k users) or global leaderboard (toxic, gameable). Instead:
--
--   1. challenges          — curated, content-led catalog. Seeded by us, joined by users.
--   2. challenge_participants — per-user opt-in + progress (computed from existing modules)
--   3. accountability_partners — pair-up via invite code; share progress on chosen modules
--   4. achievements        — auto-generated milestones, optionally shared with partners

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. CHALLENGES — curated, public catalog
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('health','money','mind','focus','habits','learning','relationships','career')),
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 365),
  rule_kind     TEXT NOT NULL CHECK (rule_kind IN ('habit','expense_cap','focus_minutes','journal_streak','task_count','custom')),
  rule_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty    TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  emoji         TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  -- Aggregate counts (denormalised; updated by trigger or job)
  participant_count INTEGER NOT NULL DEFAULT 0,
  completion_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challenges_published_category ON challenges(is_published, category);

-- Public read for the catalog. RLS allows anonymous select but no writes.
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS challenges_public_read ON challenges;
CREATE POLICY challenges_public_read ON challenges FOR SELECT USING (is_published = TRUE);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CHALLENGE PARTICIPANTS — per-user join + progress
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS challenge_participants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at      TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned','expired')),
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,  -- streak / running totals / last-checked
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,        -- visible to accountability partners
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id, status);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS challenge_participants_owner ON challenge_participants;
CREATE POLICY challenge_participants_owner ON challenge_participants
  USING (user_id::text = current_setting('app.user_id', true));

DROP TRIGGER IF EXISTS challenge_participants_updated_at ON challenge_participants;
CREATE TRIGGER challenge_participants_updated_at BEFORE UPDATE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ACCOUNTABILITY PARTNERS — pair-up via invite code
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS accountability_partners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id    UUID REFERENCES users(id) ON DELETE CASCADE,            -- NULL until accepted
  invite_code   TEXT UNIQUE,                                            -- 8-char share token
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','ended','blocked')),
  -- What modules the user opts to share with this partner
  share_habits  BOOLEAN NOT NULL DEFAULT TRUE,
  share_goals   BOOLEAN NOT NULL DEFAULT TRUE,
  share_challenges BOOLEAN NOT NULL DEFAULT TRUE,
  share_achievements BOOLEAN NOT NULL DEFAULT TRUE,
  invited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at   TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_user ON accountability_partners(user_id, status);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_partner ON accountability_partners(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_accountability_partners_invite ON accountability_partners(invite_code) WHERE invite_code IS NOT NULL;

ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS accountability_partners_self ON accountability_partners;
CREATE POLICY accountability_partners_self ON accountability_partners
  USING (
    user_id::text    = current_setting('app.user_id', true)
    OR partner_id::text = current_setting('app.user_id', true)
  );

DROP TRIGGER IF EXISTS accountability_partners_updated_at ON accountability_partners;
CREATE TRIGGER accountability_partners_updated_at BEFORE UPDATE ON accountability_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ACHIEVEMENTS — auto-generated milestones
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Stable key for upsert dedup ("habit_streak_30:water-tracking", "savings_goal_complete:emergency-fund")
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  emoji       TEXT,
  module      TEXT NOT NULL CHECK (module IN ('habits','planner','focus','money','mind','aura','community','protection','other')),
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_shared   BOOLEAN NOT NULL DEFAULT FALSE,
  evidence    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_achievements_user_recent ON achievements(user_id, earned_at DESC);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS achievements_owner ON achievements;
CREATE POLICY achievements_owner ON achievements
  USING (user_id::text = current_setting('app.user_id', true));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SEED — 10 curated challenges that map to real Life OS modules
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO challenges (slug, title, description, category, duration_days, rule_kind, rule_config, difficulty, emoji, participant_count, completion_count) VALUES
  ('no-spend-30',           'No-spend 30',
   'Cut all non-essential spending for 30 days. Rent, groceries, utilities are essentials. Subscriptions, dining out, shopping are not.',
   'money',  30,  'expense_cap',  '{"daily_cap": 0, "exclude_categories": ["rent","bills","health","kids"]}'::jsonb,
   'hard',   '💸', 1247, 318),

  ('hydrate-21',            '21-day hydrate streak',
   'Drink at least 8 glasses of water every day. Build the habit, then keep it.',
   'health', 21,  'habit',         '{"habit_keywords": ["water","hydrate"], "min_per_day": 8}'::jsonb,
   'easy',   '💧', 3421, 1842),

  ('deep-work-100',         '100 hours of deep work',
   'Log 100 hours of focused, uninterrupted work over 60 days. Average ~100 minutes per day.',
   'focus',  60,  'focus_minutes', '{"target_minutes": 6000}'::jsonb,
   'hard',   '🎯', 892,  214),

  ('journal-30',            '30-day journaling streak',
   'Write a journal entry every day for 30 days. Even one sentence counts.',
   'mind',   30,  'journal_streak','{"min_streak": 30}'::jsonb,
   'medium', '📝', 2105, 891),

  ('walk-10k-30',           '10,000 steps × 30 days',
   'Walk at least 10,000 steps every day for a month.',
   'health', 30,  'habit',         '{"habit_keywords": ["walk","steps"], "min_per_day": 1}'::jsonb,
   'medium', '🚶', 4108, 1672),

  ('book-12',               'Read 12 books in a year',
   'One book a month, every month. Pace yourself.',
   'learning', 365, 'task_count',  '{"task_keywords": ["book","read"], "target_count": 12}'::jsonb,
   'medium', '📚', 1890, 412),

  ('save-50k',              'Save ₹50,000 in 6 months',
   'Park ₹50k into a savings goal in the next 180 days. Roughly ₹8,500/month.',
   'money',  180, 'custom',        '{"goal_target": 50000, "savings_category": "emergency_fund"}'::jsonb,
   'medium', '🏦', 2340, 678),

  ('digital-detox-7',       '7-day digital detox',
   'No social media or video streaming for 7 days. Read, walk, talk to people.',
   'mind',   7,   'habit',         '{"habit_keywords": ["no phone","no social","no scroll"]}'::jsonb,
   'medium', '📵', 1502, 638),

  ('meditate-50',            '50 days of meditation',
   'Meditate at least 10 minutes a day for 50 days. Use any app or just sit.',
   'mind',   50,  'habit',         '{"habit_keywords": ["meditat","mindful"], "min_per_day": 1}'::jsonb,
   'medium', '🧘', 2716, 824),

  ('weekly-review-12',      '12 weeks of weekly review',
   'Sit down every Sunday for 12 weeks and review the week. Use the planner template.',
   'focus',  84,  'habit',         '{"habit_keywords": ["weekly review"], "min_per_day": 1, "days_of_week": [0]}'::jsonb,
   'easy',   '📅', 631,  217)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
