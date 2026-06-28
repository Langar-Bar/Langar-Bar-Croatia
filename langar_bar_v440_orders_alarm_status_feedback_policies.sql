-- Langar Bar V4.4.0 — customer order accept/cancel + feedback moderation policies
-- Run once in Supabase SQL Editor if customer Accept/Cancel does not update Admin or feedback cannot be saved/published.

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.feedback enable row level security;

-- Allow customers to update their own orders for ETA accept/cancel and feedback marker.
drop policy if exists "langar_orders_customer_update_own_v440" on public.orders;
create policy "langar_orders_customer_update_own_v440"
on public.orders
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Keep/refresh customer select own orders.
drop policy if exists "langar_orders_customer_select_own_v440" on public.orders;
create policy "langar_orders_customer_select_own_v440"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

-- Allow authenticated customers to submit feedback for their orders.
drop policy if exists "langar_feedback_customer_insert_v440" on public.feedback;
create policy "langar_feedback_customer_insert_v440"
on public.feedback
for insert
to authenticated
with check (user_id = auth.uid());

-- Customers can read their own feedback rows.
drop policy if exists "langar_feedback_customer_select_own_v440" on public.feedback;
create policy "langar_feedback_customer_select_own_v440"
on public.feedback
for select
to authenticated
using (user_id = auth.uid());

-- Active admins can read all feedback.
drop policy if exists "langar_feedback_admin_select_v440" on public.feedback;
create policy "langar_feedback_admin_select_v440"
on public.feedback
for select
to authenticated
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid()
      and am.active = true
  )
);

-- Active admins can publish/hide/reply to feedback.
drop policy if exists "langar_feedback_admin_update_v440" on public.feedback;
create policy "langar_feedback_admin_update_v440"
on public.feedback
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
