-- MindBridge migration 002: user_feedback for in-app feedback + CTO digest
create table user_feedback (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id),
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz not null default now(),
  app_version    text,
  screen_context text
);
alter table user_feedback enable row level security;
create policy "users insert own" on user_feedback for insert
  with check (user_id = auth.uid() or user_id is null);
create policy "service role reads all" on user_feedback for select
  using (auth.role() = 'service_role');
create index user_feedback_created_at_idx on user_feedback (created_at desc);
