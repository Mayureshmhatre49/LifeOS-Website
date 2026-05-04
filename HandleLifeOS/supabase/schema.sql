-- Life OS Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ================================================================
-- USERS
-- Stores app users (email/password auth via NextAuth)
-- ================================================================
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  name         text,
  image        text,
  password_hash text,                    -- null for OAuth users
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists users_email_idx on users(email);

-- ================================================================
-- CONVERSATIONS
-- Each chat thread belongs to one user
-- ================================================================
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_updated_at_idx on conversations(updated_at desc);

-- ================================================================
-- MESSAGES
-- Individual messages within a conversation
-- ================================================================
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);

-- ================================================================
-- AUDIT LOG (for security-sensitive actions)
-- ================================================================
create table if not exists audit_log (
  id         bigserial primary key,
  user_id    uuid references users(id),
  action     text not null,
  resource   text,
  ip_address text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_user_id_idx on audit_log(user_id);
create index if not exists audit_log_created_at_idx on audit_log(created_at desc);

-- ================================================================
-- ROW LEVEL SECURITY
-- Users can only see their own data
-- ================================================================
alter table users enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Users: can read/update own profile
create policy "users_own" on users
  using (id::text = current_setting('app.user_id', true))
  with check (id::text = current_setting('app.user_id', true));

-- Conversations: owner only
create policy "conversations_owner" on conversations
  using (user_id::text = current_setting('app.user_id', true));

-- Messages: owner via conversation
create policy "messages_owner" on messages
  using (
    conversation_id in (
      select id from conversations
      where user_id::text = current_setting('app.user_id', true)
    )
  );

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- Auto-update updated_at on users
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();
