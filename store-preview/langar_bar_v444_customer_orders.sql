
-- Langar Bar V4.4.4 — Customer Orders / Tablet Admin Panel
-- Run this once in Supabase SQL Editor.

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


-- Admin helper used by RLS policies. Safe if already exists.
create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'manager',
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.admin_members add column if not exists role text default 'manager';
alter table public.admin_members add column if not exists active boolean default true;

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

-- Customers/guests can create orders from the public app.
drop policy if exists customer_orders_insert_public on public.customer_orders;
create policy customer_orders_insert_public
on public.customer_orders
for insert
to anon, authenticated
with check (true);

-- Logged-in customers can view their own cloud orders.
drop policy if exists customer_orders_select_own on public.customer_orders;
create policy customer_orders_select_own
on public.customer_orders
for select
to authenticated
using (user_id = auth.uid());

-- Active admins can view all orders.
drop policy if exists customer_orders_select_admin on public.customer_orders;
create policy customer_orders_select_admin
on public.customer_orders
for select
to authenticated
using (public.is_active_admin());

-- Active admins can update order status / paid flag.
drop policy if exists customer_orders_update_admin on public.customer_orders;
create policy customer_orders_update_admin
on public.customer_orders
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

create index if not exists customer_orders_created_at_idx on public.customer_orders (created_at desc);
create index if not exists customer_orders_status_idx on public.customer_orders (status);
create index if not exists customer_orders_type_idx on public.customer_orders (fulfillment_type);
create index if not exists customer_orders_user_idx on public.customer_orders (user_id);

-- Optional realtime support. The admin panel also polls every 15 seconds, so this is not required.
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
