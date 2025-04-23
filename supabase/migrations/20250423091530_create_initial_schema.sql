-- migration: create initial schema for flashcards application
-- created at: 2025-04-23 09:15:30 UTC
-- purpose: set up core tables, indexes, and row level security policies

-- ================================================
-- table: generations
-- ================================================
create table if not exists public.generations (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  source_text_hash varchar(64) not null,
  source_text_length int not null check (source_text_length between 1000 and 10000),
  generation_duration int not null,
  created_at timestamptz not null default now()
);

-- index for quick lookup by user
create index if not exists idx_generations_user_id on public.generations(user_id);

-- enable row level security
alter table public.generations enable row level security;

-- allow authenticated users to select their own generations
create policy "generations_select" on public.generations
  for select to authenticated using (user_id = auth.uid());

-- allow authenticated users to insert generations for themselves
create policy "generations_insert" on public.generations
  for insert to authenticated with check (user_id = auth.uid());

-- allow authenticated users to update their own generations
create policy "generations_update" on public.generations
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- allow authenticated users to delete their own generations
create policy "generations_delete" on public.generations
  for delete to authenticated using (user_id = auth.uid());

-- ================================================
-- table: flashcards
-- ================================================
create table if not exists public.flashcards (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  generation_id uuid not null references public.generations(id),
  front varchar(200) not null check (char_length(front) <= 200),
  back varchar(500) not null check (char_length(back) <= 500),
  source varchar(20) not null check (source in ('ai-full', 'ai-edited', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes for performance
create index if not exists idx_flashcards_user_id on public.flashcards(user_id);
create index if not exists idx_flashcards_generation_id on public.flashcards(generation_id);

-- enable row level security
alter table public.flashcards enable row level security;

-- policies for flashcards
create policy "flashcards_select" on public.flashcards
  for select to authenticated using (user_id = auth.uid());
create policy "flashcards_insert" on public.flashcards
  for insert to authenticated with check (user_id = auth.uid());
create policy "flashcards_update" on public.flashcards
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "flashcards_delete" on public.flashcards
  for delete to authenticated using (user_id = auth.uid());

-- ================================================
-- table: generation_error_logs
-- ================================================
create table if not exists public.generation_error_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  source_text_hash varchar not null,
  source_text_length int not null check (source_text_length between 1000 and 10000),
  error_message text not null,
  created_at timestamptz not null default now()
);

-- index on user_id
create index if not exists idx_gen_err_logs_user_id on public.generation_error_logs(user_id);

-- enable row level security
alter table public.generation_error_logs enable row level security;

-- policies for error logs
create policy "generation_error_logs_select" on public.generation_error_logs
  for select to authenticated using (user_id = auth.uid());
create policy "generation_error_logs_insert" on public.generation_error_logs
  for insert to authenticated with check (user_id = auth.uid());
create policy "generation_error_logs_delete" on public.generation_error_logs
  for delete to authenticated using (user_id = auth.uid());

-- disable row level security to turn off all policies
alter table public.generations disable row level security;
alter table public.flashcards disable row level security;
alter table public.generation_error_logs disable row level security;

-- end of migration
