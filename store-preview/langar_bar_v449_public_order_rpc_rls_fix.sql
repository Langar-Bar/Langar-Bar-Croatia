-- Langar Bar V4.4.9 — Public Order RPC + RLS Fix
-- Run this once in Supabase SQL Editor after uploading V4.4.9.
-- Purpose: allow guests to submit dine-in / pickup / delivery orders safely,
-- while keeping Admin read/update and customer tracking protected.

create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;

-- Ensure customer_orders exists with all columns used by the app.
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
  updated_at timestamptz not null default now(),
  order_token text default gen_random_uuid()::text,
  status_updated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  status_history jsonb not null default '[]'::jsonb,
  fiscal_receipt_number text,
  remaris_entered_at timestamptz
);

alter table public.customer_orders add column if not exists order_token text default gen_random_uuid()::text;
alter table public.customer_orders add column if not exists status_updated_at timestamptz;
alter table public.customer_orders add column if not exists completed_at timestamptz;
alter table public.customer_orders add column if not exists archived_at timestamptz;
alter table public.customer_orders add column if not exists status_history jsonb not null default '[]'::jsonb;
alter table public.customer_orders add column if not exists fiscal_receipt_number text;
alter table public.customer_orders add column if not exists remaris_entered_at timestamptz;

update public.customer_orders
set order_token = gen_random_uuid()::text
where order_token is null or order_token = '';

alter table public.customer_orders alter column order_token set default gen_random_uuid()::text;
alter table public.customer_orders enable row level security;

grant select, insert, update on public.customer_orders to anon, authenticated;

-- Admin helper; keep this compatible with previous versions.
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

grant execute on function public.is_active_admin() to anon, authenticated;

-- Reset the order policies explicitly. This fixes the 42501 RLS error seen from guest/mobile orders.
drop policy if exists customer_orders_insert_public on public.customer_orders;
drop policy if exists customer_orders_select_own on public.customer_orders;
drop policy if exists customer_orders_select_admin on public.customer_orders;
drop policy if exists customer_orders_update_admin on public.customer_orders;

create policy customer_orders_insert_public
on public.customer_orders
for insert
to anon, authenticated
with check (true);

create policy customer_orders_select_own
on public.customer_orders
for select
to authenticated
using (user_id = auth.uid());

create policy customer_orders_select_admin
on public.customer_orders
for select
to authenticated
using (public.is_active_admin());

create policy customer_orders_update_admin
on public.customer_orders
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- Reliable public order submission function. The app uses this first, then direct insert only as fallback.
create or replace function public.submit_customer_order(
  p_user_id uuid default null,
  p_fulfillment_type text default 'dine_in',
  p_table_number text default null,
  p_customer_name text default null,
  p_customer_phone text default null,
  p_delivery_address text default null,
  p_note text default null,
  p_items jsonb default '[]'::jsonb,
  p_total numeric default 0
)
returns table (
  id uuid,
  order_number text,
  order_token text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text := coalesce(nullif(p_fulfillment_type,''), 'dine_in');
  v_user uuid := null;
begin
  if v_type not in ('dine_in','pickup','delivery') then
    raise exception 'Invalid fulfillment type: %', v_type;
  end if;

  if v_type = 'dine_in' and coalesce(nullif(p_table_number,''), '') = '' then
    raise exception 'Table number is required for dine-in orders';
  end if;

  if v_type = 'delivery' and coalesce(nullif(p_delivery_address,''), '') = '' then
    raise exception 'Delivery address is required for delivery orders';
  end if;

  -- Only attach user_id when the caller is really that logged-in user.
  if auth.uid() is not null and p_user_id = auth.uid() then
    v_user := p_user_id;
  end if;

  return query
  insert into public.customer_orders (
    user_id,
    fulfillment_type,
    table_number,
    customer_name,
    customer_phone,
    delivery_address,
    note,
    items,
    total,
    currency,
    status,
    paid,
    status_updated_at,
    status_history
  ) values (
    v_user,
    v_type,
    nullif(p_table_number,''),
    nullif(p_customer_name,''),
    nullif(p_customer_phone,''),
    nullif(p_delivery_address,''),
    nullif(p_note,''),
    coalesce(p_items, '[]'::jsonb),
    coalesce(p_total, 0),
    'EUR',
    'new',
    false,
    now(),
    jsonb_build_array(jsonb_build_object('status','new','at',now(),'by','customer_app'))
  )
  returning customer_orders.id, customer_orders.order_number, customer_orders.order_token, customer_orders.status, customer_orders.created_at;
end;
$$;

grant execute on function public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric) to anon, authenticated;

-- Customer/device order-status lookup by private order token.
create or replace function public.get_customer_order_by_token(p_token text)
returns table (
  id uuid,
  order_number text,
  fulfillment_type text,
  table_number text,
  total numeric,
  currency text,
  status text,
  paid boolean,
  items jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    co.id,
    co.order_number,
    co.fulfillment_type,
    co.table_number,
    co.total,
    co.currency,
    co.status,
    co.paid,
    co.items,
    co.created_at,
    co.updated_at,
    co.completed_at
  from public.customer_orders co
  where co.order_token = p_token
  limit 1;
$$;

grant execute on function public.get_customer_order_by_token(text) to anon, authenticated;

create unique index if not exists customer_orders_order_token_idx on public.customer_orders(order_token);
create index if not exists customer_orders_created_at_idx on public.customer_orders (created_at desc);
create index if not exists customer_orders_status_idx on public.customer_orders (status);
create index if not exists customer_orders_status_created_idx on public.customer_orders(status, created_at desc);
create index if not exists customer_orders_type_idx on public.customer_orders (fulfillment_type);
create index if not exists customer_orders_user_idx on public.customer_orders (user_id);
create index if not exists customer_orders_archived_idx on public.customer_orders(archived_at desc);

-- Optional realtime support. Admin panel also polls, so failure here should not stop ordering.
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
