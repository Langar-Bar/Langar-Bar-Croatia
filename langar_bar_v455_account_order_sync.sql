-- Langar Bar V4.5.5 — Account order sync across devices
-- Safe to run after V4.5.4. This does not delete customers, rewards, orders, or order history.
-- Purpose: when a Langar Club member logs in on multiple devices, My Recent Orders shows the same Cloud orders on every device.

-- Current logged-in customer's orders. Guest orders still remain trackable only on the original device through order_token.
drop function if exists public.get_my_customer_orders(integer);
create or replace function public.get_my_customer_orders(p_limit integer default 80)
returns table (
  id uuid,
  order_number text,
  order_token text,
  fulfillment_type text,
  table_number text,
  customer_name text,
  customer_phone text,
  delivery_address text,
  note text,
  total numeric,
  currency text,
  status text,
  paid boolean,
  items jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  status_updated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  estimated_minutes integer,
  estimated_ready_at timestamptz,
  admin_customer_note text,
  cancel_requested_at timestamptz,
  cancel_reason text,
  cancel_status text,
  cancel_decided_at timestamptz,
  cancel_admin_note text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    co.id,
    co.order_number,
    co.order_token,
    co.fulfillment_type,
    co.table_number,
    co.customer_name,
    co.customer_phone,
    co.delivery_address,
    co.note,
    co.total,
    co.currency,
    co.status,
    co.paid,
    co.items,
    co.created_at,
    co.updated_at,
    co.status_updated_at,
    co.completed_at,
    co.archived_at,
    co.estimated_minutes,
    co.estimated_ready_at,
    co.admin_customer_note,
    co.cancel_requested_at,
    co.cancel_reason,
    co.cancel_status,
    co.cancel_decided_at,
    co.cancel_admin_note
  from public.customer_orders co
  where co.user_id = auth.uid()
  order by co.created_at desc
  limit least(greatest(coalesce(p_limit,80),1),200);
$$;
grant execute on function public.get_my_customer_orders(integer) to authenticated;

-- If a customer is logged in and has old same-device orders that were created before account sync,
-- this helper keeps status tracking by token intact; the app still uses get_customer_order_by_token for guest/order-token tracking.
notify pgrst, 'reload schema';
