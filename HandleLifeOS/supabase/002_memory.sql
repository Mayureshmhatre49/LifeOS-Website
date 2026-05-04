-- Life OS Phase 2: Personal Memory Engine
-- Run after schema.sql

-- ================================================================
-- PROFILES
-- One per user — core identity and preferences
-- ================================================================
create table if not exists profiles (
  id           uuid primary key references users(id) on delete cascade,
  display_name text,
  occupation   text,
  life_stage   text check (life_stage in ('student', 'early_career', 'mid_career', 'senior', 'retired', 'other')),
  country      text default 'IN',
  currency     text default 'INR',
  timezone     text default 'Asia/Kolkata',
  goals        text[],
  memory_enabled boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ================================================================
-- USER PREFERENCES
-- Flexible key-value store per user (categorised)
-- ================================================================
create table if not exists user_preferences (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  category   text not null,   -- e.g. 'communication', 'finance', 'health'
  key        text not null,
  value      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, category, key)
);

create index if not exists user_preferences_user_id_idx on user_preferences(user_id);

create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();

-- ================================================================
-- MEMORY ITEMS
-- Discrete facts the AI learns about the user
-- ================================================================
create table if not exists memory_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null check (type in (
                'fact', 'preference', 'goal', 'concern',
                'context', 'habit', 'relationship'
              )),
  key         text not null,         -- short label, e.g. "monthly_income"
  value       text not null,         -- the actual value
  source      text default 'manual', -- 'manual' | 'chat'
  confidence  smallint default 100 check (confidence between 0 and 100),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists memory_items_user_id_active_idx on memory_items(user_id, is_active);
create index if not exists memory_items_type_idx on memory_items(type);

create trigger memory_items_updated_at
  before update on memory_items
  for each row execute function update_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table memory_items enable row level security;

create policy "profiles_owner" on profiles
  using (id::text = current_setting('app.user_id', true))
  with check (id::text = current_setting('app.user_id', true));

create policy "user_preferences_owner" on user_preferences
  using (user_id::text = current_setting('app.user_id', true))
  with check (user_id::text = current_setting('app.user_id', true));

create policy "memory_items_owner" on memory_items
  using (user_id::text = current_setting('app.user_id', true))
  with check (user_id::text = current_setting('app.user_id', true));
