-- Langar Bar V4.4.7 — Order Status Tracking + Archive
-- Run once after uploading V4.4.7. Safe to run again.

create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;

-- Keep customer orders forever unless you manually delete/export later.
alter table public.customer_orders add column if not exists order_token text;
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

create unique index if not exists customer_orders_order_token_idx on public.customer_orders(order_token);
create index if not exists customer_orders_status_created_idx on public.customer_orders(status, created_at desc);
create index if not exists customer_orders_archived_idx on public.customer_orders(archived_at desc);
create index if not exists customer_orders_completed_idx on public.customer_orders(completed_at desc);

-- Admins can create customer inbox messages when an order status changes.
drop policy if exists inbox_insert_admin on public.inbox_messages;
create policy inbox_insert_admin on public.inbox_messages
for insert
to authenticated
with check (public.is_active_admin());

grant select, insert, update on public.inbox_messages to authenticated;
grant select, insert, update on public.customer_orders to anon, authenticated;

-- Secure status lookup for the customer device/app using the private order_token saved locally.
-- This lets customers track an order even if they were not logged in at the moment of ordering.
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

-- Optional helper: make existing terminal orders archived.
update public.customer_orders
set archived_at = coalesce(archived_at, updated_at, created_at),
    completed_at = coalesce(completed_at, updated_at, created_at)
where status in ('completed','cancelled','rejected');

notify pgrst, 'reload schema';
