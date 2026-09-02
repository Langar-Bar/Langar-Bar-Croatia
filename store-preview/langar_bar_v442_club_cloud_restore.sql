-- Langar Bar V4.4.2 — Club email/password registration + Cloud restore
-- Run this once in Supabase SQL Editor if customer registration/login cannot save or restore profiles/cards.
-- It keeps the customer profile, Langar Credit and reward cards in Supabase Cloud.

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

alter table public.reward_cards add column if not exists reward_type text;
alter table public.reward_cards add column if not exists title_en text;
alter table public.reward_cards add column if not exists title_hr text;
alter table public.reward_cards add column if not exists description_en text;
alter table public.reward_cards add column if not exists description_hr text;
alter table public.reward_cards add column if not exists qr_code text;
alter table public.reward_cards add column if not exists status text default 'active';
alter table public.reward_cards add column if not exists valid_until timestamptz;
alter table public.reward_cards add column if not exists redeemed_at timestamptz;
alter table public.reward_cards add column if not exists created_at timestamptz default now();
alter table public.reward_cards add column if not exists updated_at timestamptz default now();

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

alter table public.profiles enable row level security;
alter table public.reward_cards enable row level security;
alter table public.inbox_messages enable row level security;

-- Customer can read and maintain only their own profile.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Customer can read own reward cards and mark a card redeemed from their own phone.
drop policy if exists reward_cards_select_own on public.reward_cards;
create policy reward_cards_select_own on public.reward_cards for select to authenticated using (user_id = auth.uid());
drop policy if exists reward_cards_update_own on public.reward_cards;
create policy reward_cards_update_own on public.reward_cards for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Only allow the app to create the one welcome espresso card for the signed-in user.
drop policy if exists reward_cards_insert_welcome_own on public.reward_cards;
create policy reward_cards_insert_welcome_own on public.reward_cards for insert to authenticated with check (user_id = auth.uid() and reward_type = 'welcome_espresso');

-- Customer can read/sync and soft-delete/read own inbox.
drop policy if exists inbox_select_own on public.inbox_messages;
create policy inbox_select_own on public.inbox_messages for select to authenticated using (user_id = auth.uid());
drop policy if exists inbox_update_own on public.inbox_messages;
create policy inbox_update_own on public.inbox_messages for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists inbox_insert_own on public.inbox_messages;
create policy inbox_insert_own on public.inbox_messages for insert to authenticated with check (user_id = auth.uid());

-- Prevent duplicate visible customers and duplicate welcome espresso cards.
do $$ begin
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_profiles_email_unique_not_null') then
    create unique index idx_profiles_email_unique_not_null on public.profiles (lower(email)) where email is not null and email <> '';
  end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_profiles_phone_unique_not_null') then
    create unique index idx_profiles_phone_unique_not_null on public.profiles (phone) where phone is not null and phone <> '';
  end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='idx_reward_welcome_once_per_user') then
    create unique index idx_reward_welcome_once_per_user on public.reward_cards (user_id, reward_type) where reward_type = 'welcome_espresso';
  end if;
end $$;

notify pgrst, 'reload schema';
