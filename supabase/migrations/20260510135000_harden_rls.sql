-- Harden application tables for browser-side Supabase access.
-- Existing rows with null user_id become inaccessible until assigned to an owner.

alter table if exists public.quests
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table if exists public.spells
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table if exists public.quests enable row level security;
alter table if exists public.spells enable row level security;
alter table if exists public.profiles enable row level security;

drop policy if exists "Users can read own quests" on public.quests;
drop policy if exists "Users can create own quests" on public.quests;
drop policy if exists "Users can update own quests" on public.quests;
drop policy if exists "Users can delete own quests" on public.quests;

create policy "Users can read own quests"
  on public.quests for select
  using (auth.uid() = user_id);

create policy "Users can create own quests"
  on public.quests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quests"
  on public.quests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own quests"
  on public.quests for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own spells" on public.spells;
drop policy if exists "Users can create own spells" on public.spells;
drop policy if exists "Users can update own spells" on public.spells;
drop policy if exists "Users can delete own spells" on public.spells;

create policy "Users can read own spells"
  on public.spells for select
  using (auth.uid() = user_id);

create policy "Users can create own spells"
  on public.spells for insert
  with check (auth.uid() = user_id);

create policy "Users can update own spells"
  on public.spells for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own spells"
  on public.spells for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create index if not exists quests_user_id_idx on public.quests(user_id);
create index if not exists spells_user_id_idx on public.spells(user_id);
