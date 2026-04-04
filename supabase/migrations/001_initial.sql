-- MindBridge initial schema migration
create extension if not exists "uuid-ossp";

-- profiles
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text,
  goals           text,
  primary_concern text,
  created_at      timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select  using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert  with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update  using (auth.uid() = id);

-- mood_entries
create table if not exists public.mood_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  score      integer not null check (score >= 1 and score <= 10),
  note       text,
  created_at timestamptz not null default now()
);
alter table public.mood_entries enable row level security;
create policy "Users can manage own mood entries" on public.mood_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index mood_entries_user_created_idx on public.mood_entries (user_id, created_at desc);

-- journal_entries
create table if not exists public.journal_entries (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  content           text not null,
  reflection_prompt text,
  created_at        timestamptz not null default now()
);
alter table public.journal_entries enable row level security;
create policy "Users can manage own journal entries" on public.journal_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);

-- chat_sessions
create table if not exists public.chat_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.chat_sessions enable row level security;
create policy "Users can manage own chat sessions" on public.chat_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- messages
create table if not exists public.messages (
  id         uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Users can manage messages in own sessions" on public.messages for all
  using (exists (select 1 from public.chat_sessions cs where cs.id = messages.session_id and cs.user_id = auth.uid()))
  with check (exists (select 1 from public.chat_sessions cs where cs.id = messages.session_id and cs.user_id = auth.uid()));
create index messages_session_created_idx on public.messages (session_id, created_at asc);

-- subscriptions
create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  status                 text not null default 'inactive',
  created_at             timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Service role can manage subscriptions" on public.subscriptions for all using (true) with check (true);
