-- Langar Bar V4.5.8 — Account-authoritative order sync fix
-- Run after V4.5.7. This does not delete orders, rewards, inbox, or profiles.
-- Goal: one Langar Club account = one Cloud order history on every device.

alter table public.customer_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.customer_orders add column if not exists order_token text default gen_random_uuid()::text;
alter table public.customer_orders add column if not exists updated_at timestamptz default now();
alter table public.customer_orders add column if not exists status_updated_at timestamptz;
alter table public.customer_orders add column if not exists completed_at timestamptz;
alter table public.customer_orders add column if not exists archived_at timestamptz;
alter table public.customer_orders add column if not exists status_history jsonb not null default '[]'::jsonb;
alter table public.customer_orders add column if not exists estimated_minutes integer;
alter table public.customer_orders add column if not exists estimated_ready_at timestamptz;
alter table public.customer_orders add column if not exists admin_customer_note text;
alter table public.customer_orders add column if not exists cancel_requested_at timestamptz;
alter table public.customer_orders add column if not exists cancel_reason text;
alter table public.customer_orders add column if not exists cancel_status text;
alter table public.customer_orders add column if not exists cancel_decided_at timestamptz;
alter table public.customer_orders add column if not exists cancel_admin_note text;

update public.customer_orders
set order_token = gen_random_uuid()::text
where order_token is null or order_token = '';

create unique index if not exists customer_orders_order_token_idx on public.customer_orders(order_token);
create index if not exists customer_orders_user_created_idx on public.customer_orders(user_id, created_at desc);
create index if not exists customer_orders_phone_created_idx on public.customer_orders(customer_phone, created_at desc);

-- Rebuild submit RPC: authenticated orders are attached to auth.uid().
drop function if exists public.submit_customer_order_payload(jsonb);
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
  v_user uuid := auth.uid();
  v_items jsonb := coalesce(p_order->'items','[]'::jsonb);
  v_total numeric := coalesce(nullif(p_order->>'total','')::numeric, 0);
begin
  if v_type not in ('dine_in','pickup','delivery') then
    raise exception 'Invalid fulfillment type: %', v_type;
  end if;
  if v_type = 'dine_in' and coalesce(nullif(p_order->>'table_number',''),'') = '' then
    raise exception 'Table number is required for dine-in orders';
  end if;
  if v_type = 'delivery' and coalesce(nullif(p_order->>'delivery_address',''),'') = '' then
    raise exception 'Delivery address is required for delivery orders';
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
    jsonb_build_array(jsonb_build_object('status','new','at',now(),'by',case when v_user is null then 'guest_app' else 'member_app' end,'version','v458'))
  )
  returning customer_orders.id, customer_orders.order_number, customer_orders.order_token, customer_orders.status, customer_orders.created_at;
end;
$$;
grant execute on function public.submit_customer_order_payload(jsonb) to anon, authenticated;

-- Claim local device/token orders into the currently logged-in account.
drop function if exists public.claim_customer_order_tokens(text[]);
create or replace function public.claim_customer_order_tokens(p_tokens text[])
returns table (
  id uuid,
  order_number text,
  order_token text,
  status text,
  claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Login required to sync orders across devices';
  end if;

  update public.customer_orders co
  set user_id = v_uid,
      updated_at = now(),
      status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('event','claimed_to_account','at',now(),'by',v_uid))
  where co.order_token = any(coalesce(p_tokens, array[]::text[]))
    and (co.user_id is null or co.user_id = v_uid);

  return query
  select co.id, co.order_number, co.order_token, co.status, (co.user_id = v_uid) as claimed
  from public.customer_orders co
  where co.order_token = any(coalesce(p_tokens, array[]::text[]))
    and co.user_id = v_uid
  order by co.created_at desc;
end;
$$;
grant execute on function public.claim_customer_order_tokens(text[]) to authenticated;

-- Logged-in customer's Cloud order history. Before returning, it also claims older phone-matched orders.
drop function if exists public.get_my_customer_orders(integer);
create or replace function public.get_my_customer_orders(p_limit integer default 120)
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
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_phone text;
  v_phone_digits text;
begin
  if v_uid is null then
    raise exception 'Login required';
  end if;

  select p.phone into v_phone
  from public.profiles p
  where p.id = v_uid;

  v_phone_digits := regexp_replace(coalesce(v_phone,''), '\D', '', 'g');

  -- Attach older guest orders with the same verified profile phone to this account.
  if length(v_phone_digits) >= 8 then
    update public.customer_orders co
    set user_id = v_uid,
        updated_at = now(),
        status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('event','claimed_by_profile_phone','at',now(),'by',v_uid))
    where co.user_id is null
      and regexp_replace(coalesce(co.customer_phone,''), '\D', '', 'g') = v_phone_digits;
  end if;

  return query
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
  where co.user_id = v_uid
  order by co.created_at desc
  limit least(greatest(coalesce(p_limit,120),1),300);
end;
$$;
grant execute on function public.get_my_customer_orders(integer) to authenticated;

notify pgrst, 'reload schema';
