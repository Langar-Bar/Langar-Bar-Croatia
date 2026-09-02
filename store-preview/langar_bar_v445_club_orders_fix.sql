-- Langar Bar V4.4.5 — Club Registration + Customer Orders Reliability Fix
-- Run this once in Supabase SQL Editor after uploading V4.4.5.
-- It is safe to run again. It fixes grants/RLS for customer orders and keeps Club profile uniqueness.

-- Required extension for UUID generation.
create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

-- =============================
-- Langar Club cloud profile
-- =============================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  phone_verified boolean default false,
  email text,
  first_name text,
  last_name text,
  birthday date,
  app_language text default 'hr',
  customer_level text default 'bronze',
  langar_credit numeric default 0,
  referral_code text,
  marketing_opt_in boolean default true,
  push_opt_in boolean default true,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  last_seen_at timestamptz,
  onesignal_external_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists phone_verified boolean default false;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists app_language text default 'hr';
alter table public.profiles add column if not exists customer_level text default 'bronze';
alter table public.profiles add column if not exists langar_credit numeric default 0;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists marketing_opt_in boolean default true;
alter table public.profiles add column if not exists push_opt_in boolean default true;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists privacy_accepted_at timestamptz;
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists onesignal_external_id text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_profiles_email_unique_not_null') then
    create unique index idx_profiles_email_unique_not_null on public.profiles (lower(email)) where email is not null and email <> '';
  end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_profiles_phone_unique_not_null') then
    create unique index idx_profiles_phone_unique_not_null on public.profiles (phone) where phone is not null and phone <> '';
  end if;
end $$;

-- =============================
-- Reward cards / Inbox
-- =============================
create table if not exists public.reward_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_type text not null,
  title_en text,
  title_hr text,
  description_en text,
  description_hr text,
  qr_code text,
  status text default 'active',
  valid_until timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text default 'message',
  title_en text,
  body_en text,
  title_hr text,
  body_hr text,
  is_read boolean default false,
  is_deleted boolean default false,
  read_at timestamptz,
  deleted_at timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.reward_cards enable row level security;
alter table public.inbox_messages enable row level security;
grant select, insert, update on public.reward_cards to authenticated;
grant select, insert, update on public.inbox_messages to authenticated;

drop policy if exists reward_cards_select_own on public.reward_cards;
create policy reward_cards_select_own on public.reward_cards for select to authenticated using (user_id = auth.uid());
drop policy if exists reward_cards_update_own on public.reward_cards;
create policy reward_cards_update_own on public.reward_cards for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists reward_cards_insert_welcome_own on public.reward_cards;
create policy reward_cards_insert_welcome_own on public.reward_cards for insert to authenticated with check (user_id = auth.uid() and reward_type = 'welcome_espresso');

drop policy if exists inbox_select_own on public.inbox_messages;
create policy inbox_select_own on public.inbox_messages for select to authenticated using (user_id = auth.uid());
drop policy if exists inbox_update_own on public.inbox_messages;
create policy inbox_update_own on public.inbox_messages for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists inbox_insert_own on public.inbox_messages;
create policy inbox_insert_own on public.inbox_messages for insert to authenticated with check (user_id = auth.uid());

do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_reward_welcome_once_per_user') then
    create unique index idx_reward_welcome_once_per_user on public.reward_cards (user_id, reward_type) where reward_type = 'welcome_espresso';
  end if;
end $$;

-- =============================
-- Customer orders for tablet panel
-- =============================
create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  fulfillment_type text not null default 'dine_in' check (fulfillment_type in ('dine_in','pickup','delivery')),
  table_number text,
  customer_name text,
  customer_phone text,
  delivery_address text,
  note text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  status text not null default 'new' check (status in ('new','accepted','preparing','ready','completed','cancelled','rejected')),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_orders enable row level security;
grant select, insert, update on public.customer_orders to anon, authenticated;

create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'manager',
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.admin_members add column if not exists role text default 'manager';
alter table public.admin_members add column if not exists active boolean default true;
grant select on public.admin_members to authenticated;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  );
$$;

drop policy if exists customer_orders_insert_public on public.customer_orders;
create policy customer_orders_insert_public on public.customer_orders
for insert
to anon, authenticated
with check (true);

drop policy if exists customer_orders_select_own on public.customer_orders;
create policy customer_orders_select_own on public.customer_orders
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists customer_orders_select_admin on public.customer_orders;
create policy customer_orders_select_admin on public.customer_orders
for select
to authenticated
using (public.is_active_admin());

drop policy if exists customer_orders_update_admin on public.customer_orders;
create policy customer_orders_update_admin on public.customer_orders
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create index if not exists customer_orders_created_at_idx on public.customer_orders (created_at desc);
create index if not exists customer_orders_status_idx on public.customer_orders (status);
create index if not exists customer_orders_type_idx on public.customer_orders (fulfillment_type);
create index if not exists customer_orders_user_idx on public.customer_orders (user_id);

-- Realtime is optional. The admin panel also polls every 15 seconds.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.customer_orders;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

notify pgrst, 'reload schema';
