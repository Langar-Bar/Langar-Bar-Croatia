-- Langar Bar V4.2.4 — Admin customer RPC sync + delete
-- Run once in Supabase SQL Editor.
-- This makes Customers & Rewards read the same Cloud list on laptop and mobile.

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
  order by p.created_at desc nulls last
  limit 1000;
end;
$$;

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
    'customers', (select count(*) from public.profiles),
    'inbox', (select count(*) from public.inbox_messages),
    'sushi', (select count(*) from public.sushi_preorders),
    'cards', (select count(*) from public.reward_cards)
  ) into result;

  return result;
end;
$$;

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

  -- Delete app-visible customer data for test/custom cleanup.
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

  -- The Supabase Authentication user is not deleted here. It can be removed manually
  -- from Authentication > Users if needed, or by a future service-role Edge Function.
  return true;
end;
$$;

-- Keep phone values unique when present. This prevents visible duplicate customer profiles.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public'
      and indexname='idx_profiles_phone_unique_not_null'
  ) then
    create unique index idx_profiles_phone_unique_not_null
    on public.profiles (phone)
    where phone is not null and phone <> '';
  end if;
end $$;

notify pgrst, 'reload schema';
