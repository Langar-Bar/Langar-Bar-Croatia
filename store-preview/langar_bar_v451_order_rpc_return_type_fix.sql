-- Langar Bar V4.5.1 — Order RPC function return-type reset fix
-- Run this once in Supabase SQL Editor after uploading V4.5.1 or after V4.5.0 SQL failed with return-type error.
-- This version fixes guest/dine-in order submission, customer order tracking by token,
-- and admin tablet order read/update through secure RPC functions.

create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  fulfillment_type text not null default 'dine_in',
  table_number text,
  customer_name text,
  customer_phone text,
  delivery_address text,
  note text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  status text not null default 'new',
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_token text not null default gen_random_uuid()::text,
  status_updated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  status_history jsonb not null default '[]'::jsonb,
  fiscal_receipt_number text,
  remaris_entered_at timestamptz
);

alter table public.customer_orders add column if not exists order_number text;
alter table public.customer_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.customer_orders add column if not exists fulfillment_type text not null default 'dine_in';
alter table public.customer_orders add column if not exists table_number text;
alter table public.customer_orders add column if not exists customer_name text;
alter table public.customer_orders add column if not exists customer_phone text;
alter table public.customer_orders add column if not exists delivery_address text;
alter table public.customer_orders add column if not exists note text;
alter table public.customer_orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.customer_orders add column if not exists total numeric(10,2) not null default 0;
alter table public.customer_orders add column if not exists currency text not null default 'EUR';
alter table public.customer_orders add column if not exists status text not null default 'new';
alter table public.customer_orders add column if not exists paid boolean not null default false;
alter table public.customer_orders add column if not exists created_at timestamptz not null default now();
alter table public.customer_orders add column if not exists updated_at timestamptz not null default now();
alter table public.customer_orders add column if not exists order_token text;
alter table public.customer_orders add column if not exists status_updated_at timestamptz;
alter table public.customer_orders add column if not exists completed_at timestamptz;
alter table public.customer_orders add column if not exists archived_at timestamptz;
alter table public.customer_orders add column if not exists status_history jsonb not null default '[]'::jsonb;
alter table public.customer_orders add column if not exists fiscal_receipt_number text;
alter table public.customer_orders add column if not exists remaris_entered_at timestamptz;

update public.customer_orders set order_number = 'ORD-' || upper(substr(md5(id::text), 1, 8)) where order_number is null or order_number='';
update public.customer_orders set order_token = gen_random_uuid()::text where order_token is null or order_token='';
alter table public.customer_orders alter column order_token set not null;
alter table public.customer_orders alter column order_token set default gen_random_uuid()::text;

-- Admin membership table used by the admin panel.
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

alter table public.customer_orders enable row level security;
grant select, insert, update on public.customer_orders to anon, authenticated;

-- Reset all known order policies to avoid conflicts from earlier versions.
drop policy if exists customer_orders_insert_public on public.customer_orders;
drop policy if exists customer_orders_select_own on public.customer_orders;
drop policy if exists customer_orders_select_admin on public.customer_orders;
drop policy if exists customer_orders_update_admin on public.customer_orders;
drop policy if exists customer_orders_public_insert on public.customer_orders;
drop policy if exists customer_orders_admin_select on public.customer_orders;
drop policy if exists customer_orders_admin_update on public.customer_orders;

-- Direct public insert is allowed only for order creation. Customers still cannot read the full table.
create policy customer_orders_public_insert
on public.customer_orders
for insert
to anon, authenticated
with check (true);

create policy customer_orders_admin_select
on public.customer_orders
for select
to authenticated
using (public.is_active_admin() or user_id = auth.uid());

create policy customer_orders_admin_update
on public.customer_orders
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

-- Reset RPC functions whose return table definitions changed between earlier versions.
-- PostgreSQL cannot change OUT/RETURNS TABLE columns with CREATE OR REPLACE, so these must be dropped first.
drop function if exists public.get_customer_order_by_token(text);
drop function if exists public.submit_customer_order_payload(jsonb);
drop function if exists public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric);
drop function if exists public.admin_get_customer_orders(integer);
drop function if exists public.admin_update_customer_order(uuid,text,boolean,text);

-- Reliable one-argument JSON RPC used by the customer app. Works for anonymous dine-in orders.
create or replace function public.submit_customer_order_payload(p_order jsonb)
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
  v_type text := coalesce(nullif(p_order->>'fulfillment_type',''), 'dine_in');
  v_user uuid := null;
  v_user_text text := nullif(p_order->>'user_id','');
  v_items jsonb := coalesce(p_order->'items','[]'::jsonb);
  v_total numeric := coalesce(nullif(p_order->>'total','')::numeric, 0);
begin
  if v_type not in ('dine_in','pickup','delivery') then
    raise exception 'Invalid fulfillment type: %', v_type;
  end if;
  if v_type='dine_in' and coalesce(nullif(p_order->>'table_number',''),'')='' then
    raise exception 'Table number is required for dine-in orders';
  end if;
  if v_type='delivery' and coalesce(nullif(p_order->>'delivery_address',''),'')='' then
    raise exception 'Delivery address is required for delivery orders';
  end if;
  if v_user_text is not null and auth.uid() is not null and v_user_text::uuid = auth.uid() then
    v_user := v_user_text::uuid;
  end if;

  return query
  insert into public.customer_orders (
    user_id, fulfillment_type, table_number, customer_name, customer_phone, delivery_address,
    note, items, total, currency, status, paid, status_updated_at, status_history
  ) values (
    v_user,
    v_type,
    nullif(p_order->>'table_number',''),
    nullif(p_order->>'customer_name',''),
    nullif(p_order->>'customer_phone',''),
    nullif(p_order->>'delivery_address',''),
    nullif(p_order->>'note',''),
    v_items,
    v_total,
    coalesce(nullif(p_order->>'currency',''),'EUR'),
    'new',
    false,
    now(),
    jsonb_build_array(jsonb_build_object('status','new','at',now(),'by','customer_app','version','v451'))
  )
  returning customer_orders.id, customer_orders.order_number, customer_orders.order_token, customer_orders.status, customer_orders.created_at;
end;
$$;
grant execute on function public.submit_customer_order_payload(jsonb) to anon, authenticated;

-- Keep V4.4.9 function as compatibility for devices that still have old cached JS.
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
returns table (id uuid, order_number text, order_token text, status text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.submit_customer_order_payload(jsonb_build_object(
    'user_id', p_user_id,
    'fulfillment_type', p_fulfillment_type,
    'table_number', p_table_number,
    'customer_name', p_customer_name,
    'customer_phone', p_customer_phone,
    'delivery_address', p_delivery_address,
    'note', p_note,
    'items', coalesce(p_items,'[]'::jsonb),
    'total', coalesce(p_total,0),
    'currency', 'EUR'
  ));
end;
$$;
grant execute on function public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric) to anon, authenticated;

-- Customer/device order-status lookup by private order token. This lets guest customers track only their own order.
create or replace function public.get_customer_order_by_token(p_token text)
returns table (
  id uuid,
  order_number text,
  fulfillment_type text,
  table_number text,
  customer_name text,
  customer_phone text,
  total numeric,
  currency text,
  status text,
  paid boolean,
  items jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  status_updated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select co.id, co.order_number, co.fulfillment_type, co.table_number, co.customer_name, co.customer_phone,
         co.total, co.currency, co.status, co.paid, co.items, co.created_at, co.updated_at,
         co.status_updated_at, co.completed_at, co.archived_at
  from public.customer_orders co
  where co.order_token = p_token
  limit 1;
$$;
grant execute on function public.get_customer_order_by_token(text) to anon, authenticated;

-- Admin reads orders through RPC, so the tablet does not depend on browser table-select policies.
create or replace function public.admin_get_customer_orders(p_limit integer default 120)
returns setof public.customer_orders
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    raise exception 'Not active admin';
  end if;
  return query select * from public.customer_orders order by created_at desc limit greatest(1, least(coalesce(p_limit,120), 500));
end;
$$;
grant execute on function public.admin_get_customer_orders(integer) to authenticated;

create or replace function public.admin_update_customer_order(
  p_order_id uuid,
  p_status text default null,
  p_paid boolean default null,
  p_fiscal_receipt_number text default null
)
returns setof public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.customer_orders%rowtype;
  v_now timestamptz := now();
  v_status text := nullif(p_status,'');
begin
  if not public.is_active_admin() then
    raise exception 'Not active admin';
  end if;
  select * into v_old from public.customer_orders where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
  if v_status is not null and v_status not in ('new','accepted','preparing','ready','completed','cancelled','rejected') then
    raise exception 'Invalid status: %', v_status;
  end if;

  update public.customer_orders co
  set
    status = coalesce(v_status, co.status),
    paid = coalesce(p_paid, co.paid),
    fiscal_receipt_number = coalesce(nullif(p_fiscal_receipt_number,''), co.fiscal_receipt_number),
    updated_at = v_now,
    status_updated_at = case when v_status is not null and v_status is distinct from v_old.status then v_now else co.status_updated_at end,
    completed_at = case when v_status in ('completed','cancelled','rejected') then coalesce(co.completed_at, v_now) else co.completed_at end,
    archived_at = case when v_status in ('completed','cancelled','rejected') then coalesce(co.archived_at, v_now) else co.archived_at end,
    remaris_entered_at = case when p_paid is true then coalesce(co.remaris_entered_at, v_now) else co.remaris_entered_at end,
    status_history = case when v_status is not null and v_status is distinct from v_old.status then
      coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('from',v_old.status,'to',v_status,'at',v_now,'by',auth.uid()))
      else co.status_history end
  where co.id=p_order_id;

  return query select * from public.customer_orders where id=p_order_id;
end;
$$;
grant execute on function public.admin_update_customer_order(uuid,text,boolean,text) to authenticated;

create unique index if not exists customer_orders_order_token_idx on public.customer_orders(order_token);
create index if not exists customer_orders_created_at_idx on public.customer_orders (created_at desc);
create index if not exists customer_orders_status_idx on public.customer_orders (status);
create index if not exists customer_orders_status_created_idx on public.customer_orders(status, created_at desc);
create index if not exists customer_orders_type_idx on public.customer_orders (fulfillment_type);
create index if not exists customer_orders_user_idx on public.customer_orders (user_id);
create index if not exists customer_orders_archived_idx on public.customer_orders(archived_at desc);

-- Realtime support. If the publication already contains the table, this is ignored.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.customer_orders;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

notify pgrst, 'reload schema';
