-- Langar Bar V4.3.8 — order cloud policies for customer app + admin panel
-- Run once in Supabase SQL Editor if orders submitted from another device do not appear in Admin.

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

drop policy if exists "langar_orders_public_insert_v438" on public.orders;
drop policy if exists "langar_orders_admin_select_v438" on public.orders;
drop policy if exists "langar_orders_customer_select_own_v438" on public.orders;
drop policy if exists "langar_orders_admin_update_v438" on public.orders;
drop policy if exists "langar_order_items_public_insert_v438" on public.order_items;
drop policy if exists "langar_order_items_admin_select_v438" on public.order_items;
drop policy if exists "langar_order_items_customer_select_own_v438" on public.order_items;

create policy "langar_orders_public_insert_v438"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "langar_orders_admin_select_v438"
on public.orders
for select
to authenticated
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  )
);

create policy "langar_orders_customer_select_own_v438"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

create policy "langar_orders_admin_update_v438"
on public.orders
for update
to authenticated
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  )
)
with check (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  )
);

create policy "langar_order_items_public_insert_v438"
on public.order_items
for insert
to anon, authenticated
with check (true);

create policy "langar_order_items_admin_select_v438"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  )
);

create policy "langar_order_items_customer_select_own_v438"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);
