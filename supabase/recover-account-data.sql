-- Recover Questlog rows that exist in Supabase but are hidden from the app
-- because they are not assigned to the currently signed-in auth user.
--
-- How to use:
-- 1. Replace YOUR_EMAIL@example.com with the email you use to sign in.
-- 2. Run the PREVIEW section first in the Supabase SQL editor.
-- 3. If the preview shows the rows you expect, run the RECOVERY section.

-- PREVIEW: find your current Supabase auth user id.
select id, email, created_at, last_sign_in_at
from auth.users
where lower(email) = lower('oangga709@gmail.com');

-- PREVIEW: rows that are currently invisible to normal app queries.
select 'quests' as table_name, count(*) as orphaned_rows
from public.quests
where user_id is null
union all
select 'spells' as table_name, count(*) as orphaned_rows
from public.spells
where user_id is null;

-- PREVIEW: rows owned by a different auth user with the same email.
-- This catches cases where the same person created a new auth identity,
-- for example switching between password login and OAuth.
with target_user as (
  select id, email
  from auth.users
  where lower(email) = lower('YOUR_EMAIL@example.com')
  order by last_sign_in_at desc nulls last, created_at desc
  limit 1
),
same_email_users as (
  select u.id
  from auth.users u
  join target_user t on lower(u.email) = lower(t.email)
)
select 'quests' as table_name, count(*) as recoverable_rows
from public.quests q
where q.user_id in (select id from same_email_users)
  and q.user_id <> (select id from target_user)
union all
select 'spells' as table_name, count(*) as recoverable_rows
from public.spells s
where s.user_id in (select id from same_email_users)
  and s.user_id <> (select id from target_user);

-- RECOVERY: claim orphaned rows and rows attached to older same-email auth ids.
begin;

with target_user as (
  select id, email
  from auth.users
  where lower(email) = lower('YOUR_EMAIL@example.com')
  order by last_sign_in_at desc nulls last, created_at desc
  limit 1
),
same_email_users as (
  select u.id
  from auth.users u
  join target_user t on lower(u.email) = lower(t.email)
)
update public.quests q
set user_id = (select id from target_user)
where q.user_id is null
   or q.user_id in (select id from same_email_users);

with target_user as (
  select id, email
  from auth.users
  where lower(email) = lower('YOUR_EMAIL@example.com')
  order by last_sign_in_at desc nulls last, created_at desc
  limit 1
),
same_email_users as (
  select u.id
  from auth.users u
  join target_user t on lower(u.email) = lower(t.email)
)
update public.spells s
set user_id = (select id from target_user)
where s.user_id is null
   or s.user_id in (select id from same_email_users);

-- Ensure the profile row exists for the recovered account.
insert into public.profiles (id, xp, level)
select id, 0, 1
from auth.users
where lower(email) = lower('YOUR_EMAIL@example.com')
order by last_sign_in_at desc nulls last, created_at desc
limit 1
on conflict (id) do nothing;

commit;

-- OPTIONAL CLEANUP: after recovery, if the app auto-created duplicate starter
-- quests while your original rows were hidden, inspect duplicates first.
with ranked as (
  select
    id,
    title,
    user_id,
    created_at,
    row_number() over (
      partition by user_id, title
      order by created_at asc nulls last, id asc
    ) as keep_rank
  from public.quests
  where user_id = (
    select id
    from auth.users
    where lower(email) = lower('YOUR_EMAIL@example.com')
    order by last_sign_in_at desc nulls last, created_at desc
    limit 1
  )
)
select *
from ranked
where keep_rank > 1
order by title, created_at;

-- If the duplicate preview above is correct, uncomment this block and run it.
-- with ranked as (
--   select
--     id,
--     row_number() over (
--       partition by user_id, title
--       order by created_at asc nulls last, id asc
--     ) as keep_rank
--   from public.quests
--   where user_id = (
--     select id
--     from auth.users
--     where lower(email) = lower('YOUR_EMAIL@example.com')
--     order by last_sign_in_at desc nulls last, created_at desc
--     limit 1
--   )
-- )
-- delete from public.quests q
-- using ranked r
-- where q.id = r.id
--   and r.keep_rank > 1;
