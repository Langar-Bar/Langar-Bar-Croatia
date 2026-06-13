-- Langar Bar V4.2.5 — Safe customer delete + restore admin profile
-- Run once in Supabase SQL Editor.
-- Purpose:
-- 1) Restore the owner admin profile if it was deleted from Customers & Rewards.
-- 2) Keep active admins out of the customer list.
-- 3) Prevent Delete Customer from deleting active admin profiles.

-- 1) Restore / protect current owner admin profile.
insert into public.profiles (
  id,
  email,
  first_name,
  last_name,
  app_language,
  marketing_opt_in,
  push_opt_in
)
values (
  'aa24a61b-4f89-4cf9-9115-30b4bdef712d',
  'langaarbar@gmail.com',
  'Langar',
  'Owner',
  'en',
  true,
  true
)
on conflict (id) do update
set
  email = excluded.email,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  app_language = excluded.app_language,
  marketing_opt_in = excluded.marketing_opt_in,
  push_opt_in = excluded.push_opt_in,
  updated_at = now();

insert into public.admin_members (
  user_id,
  role,
  active
)
values (
  'aa24a61b-4f89-4cf9-9115-30b4bdef712d',
  'owner',
  true
)
on conflict (user_id) do update
set
  role = 'owner',
  active = true,
  updated_at = now();

-- 2) Admin helper.
create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  );
$$;

-- 3) List customers, but exclude active admins.
create or replace function public.admin_list_customers()
returns table (
  id uuid,
  phone text,
  email text,
  first_name text,
  last_name text,
  birthday date,
  app_language text,
  customer_level text,
  langar_credit numeric,
  referral_code text,
  marketing_opt_in boolean,
  push_opt_in boolean,
  last_seen_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    p.id,
    p.phone,
    p.email,
    p.first_name,
    p.last_name,
    p.birthday,
    p.app_language,
    p.customer_level,
    p.langar_credit,
    p.referral_code,
    p.marketing_opt_in,
    p.push_opt_in,
    p.last_seen_at,
    p.created_at,
    p.updated_at
  from public.profiles p
  where not exists (
    select 1
    from public.admin_members am
    where am.user_id = p.id
      and am.active = true
  )
  order by p.created_at desc nulls last
  limit 1000;
end;
$$;

-- 4) Dashboard counts should count only customers, not active admins.
create or replace function public.admin_dashboard_counts()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'customers', (
      select count(*)
      from public.profiles p
      where not exists (
        select 1 from public.admin_members am
        where am.user_id = p.id and am.active = true
      )
    ),
    'inbox', (select count(*) from public.inbox_messages),
    'sushi', (select count(*) from public.sushi_preorders),
    'cards', (select count(*) from public.reward_cards)
  ) into result;

  return result;
end;
$$;

-- 5) Safe delete: refuse to delete active admins.
create or replace function public.admin_delete_customer(customer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    raise exception 'Admin access required';
  end if;

  if exists (
    select 1
    from public.admin_members am
    where am.user_id = customer_id
      and am.active = true
  ) then
    raise exception 'This user is an active admin and cannot be deleted from Customers & Rewards.';
  end if;

  delete from public.reward_cards where user_id = customer_id;
  delete from public.wallet_transactions where user_id = customer_id;
  delete from public.inbox_messages where user_id = customer_id;
  delete from public.sushi_preorders where user_id = customer_id;
  delete from public.event_interests where user_id = customer_id;
  delete from public.feedback where user_id = customer_id;
  delete from public.menu_item_likes where user_id = customer_id;
  delete from public.menu_item_comments where user_id = customer_id;
  delete from public.devices where user_id = customer_id;
  delete from public.notification_preferences where user_id = customer_id;
  delete from public.notifications_log where user_id = customer_id;
  delete from public.profiles where id = customer_id;

  return true;
end;
$$;

notify pgrst, 'reload schema';

-- 6) Verification query.
select
  au.id,
  au.email,
  am.role,
  am.active,
  p.id as profile_id,
  p.first_name,
  p.last_name
from auth.users au
left join public.admin_members am on am.user_id = au.id
left join public.profiles p on p.id = au.id
where au.email = 'langaarbar@gmail.com';
