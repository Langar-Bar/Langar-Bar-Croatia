-- Langar Bar V4.5.4 — ETA preset fix, cancellation request and admin refresh feedback
-- Safe to run after V4.5.3. This does not delete customers, rewards, orders, or order history.

alter table public.customer_orders add column if not exists estimated_minutes integer;
alter table public.customer_orders add column if not exists estimated_ready_at timestamptz;
alter table public.customer_orders add column if not exists admin_customer_note text;
alter table public.customer_orders add column if not exists cancel_requested_at timestamptz;
alter table public.customer_orders add column if not exists cancel_reason text;
alter table public.customer_orders add column if not exists cancel_status text default null;
alter table public.customer_orders add column if not exists cancel_decided_at timestamptz;
alter table public.customer_orders add column if not exists cancel_admin_note text;

create index if not exists idx_customer_orders_cancel_requested_at on public.customer_orders(cancel_requested_at desc);

-- Rebuild customer token lookup because PostgreSQL cannot change a function return type with CREATE OR REPLACE.
drop function if exists public.get_customer_order_by_token(text);
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
  select co.id, co.order_number, co.fulfillment_type, co.table_number, co.customer_name, co.customer_phone,
         co.total, co.currency, co.status, co.paid, co.items, co.created_at, co.updated_at,
         co.status_updated_at, co.completed_at, co.archived_at,
         co.estimated_minutes, co.estimated_ready_at, co.admin_customer_note,
         co.cancel_requested_at, co.cancel_reason, co.cancel_status, co.cancel_decided_at, co.cancel_admin_note
  from public.customer_orders co
  where co.order_token = p_token
  limit 1;
$$;
grant execute on function public.get_customer_order_by_token(text) to anon, authenticated;

-- Dedicated ETA function: fixes preset time sending by avoiding overloaded admin_update_customer_order ambiguity.
drop function if exists public.admin_set_order_eta(uuid,integer,text);
create or replace function public.admin_set_order_eta(
  p_order_id uuid,
  p_estimated_minutes integer,
  p_admin_customer_note text default null
)
returns setof public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.customer_orders%rowtype;
  v_now timestamptz := now();
  v_note text := nullif(trim(coalesce(p_admin_customer_note,'')), '');
begin
  if not public.is_active_admin() then
    raise exception 'Not active admin';
  end if;
  select * into v_old from public.customer_orders where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
  if p_estimated_minutes is null and v_note is null then
    raise exception 'Choose a time or write a customer message';
  end if;
  if p_estimated_minutes is not null and (p_estimated_minutes < 1 or p_estimated_minutes > 240) then
    raise exception 'Estimated minutes must be between 1 and 240';
  end if;

  update public.customer_orders co
  set
    estimated_minutes = coalesce(p_estimated_minutes, co.estimated_minutes),
    estimated_ready_at = case when p_estimated_minutes is not null then v_now + make_interval(mins => p_estimated_minutes) else co.estimated_ready_at end,
    admin_customer_note = coalesce(v_note, co.admin_customer_note),
    updated_at = v_now,
    status_updated_at = v_now,
    status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
      'from',v_old.status,
      'to',v_old.status,
      'event','eta_sent',
      'estimated_minutes',p_estimated_minutes,
      'admin_customer_note',v_note,
      'estimated_ready_at',case when p_estimated_minutes is not null then v_now + make_interval(mins => p_estimated_minutes) else co.estimated_ready_at end,
      'at',v_now,
      'by',auth.uid()
    ))
  where co.id=p_order_id;

  if v_old.user_id is not null then
    insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
    values(
      v_old.user_id,
      'order_status',
      'Order ready-time update',
      concat('Your order ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' will be ready in about ', coalesce(p_estimated_minutes::text, v_old.estimated_minutes::text, ''), ' minutes.', case when v_note is not null then ' '||v_note else '' end),
      'Ažuriranje vremena narudžbe',
      concat('Vaša narudžba ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' bit će spremna za oko ', coalesce(p_estimated_minutes::text, v_old.estimated_minutes::text, ''), ' minuta.', case when v_note is not null then ' '||v_note else '' end),
      jsonb_build_object('order_id',v_old.id,'order_number',v_old.order_number,'estimated_minutes',p_estimated_minutes,'event','eta_sent')
    );
  end if;

  return query select * from public.customer_orders where id=p_order_id;
end;
$$;
grant execute on function public.admin_set_order_eta(uuid,integer,text) to authenticated;

-- Customer cancellation request: not unilateral. Staff must approve/reject in Admin.
drop function if exists public.request_order_cancellation_by_token(text,text);
create or replace function public.request_order_cancellation_by_token(
  p_token text,
  p_reason text default null
)
returns table (
  id uuid,
  order_number text,
  status text,
  cancel_requested_at timestamptz,
  cancel_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.customer_orders%rowtype;
  v_now timestamptz := now();
  v_reason text := nullif(trim(coalesce(p_reason,'')), '');
begin
  select * into v_order from public.customer_orders where order_token=p_token;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status in ('completed','cancelled','rejected') then
    raise exception 'This order is already closed and cannot request cancellation';
  end if;
  if v_order.cancel_requested_at is not null and coalesce(v_order.cancel_status,'requested')='requested' then
    raise exception 'Cancellation request already sent';
  end if;

  update public.customer_orders co
  set cancel_requested_at = v_now,
      cancel_reason = v_reason,
      cancel_status = 'requested',
      cancel_decided_at = null,
      cancel_admin_note = null,
      updated_at = v_now,
      status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'event','cancel_requested',
        'reason',v_reason,
        'at',v_now
      ))
  where co.id=v_order.id;

  return query select co.id, co.order_number, co.status, co.cancel_requested_at, co.cancel_status
  from public.customer_orders co where co.id=v_order.id;
end;
$$;
grant execute on function public.request_order_cancellation_by_token(text,text) to anon, authenticated;

-- Admin decision for cancellation request.
drop function if exists public.admin_decide_order_cancellation(uuid,text,text);
create or replace function public.admin_decide_order_cancellation(
  p_order_id uuid,
  p_decision text,
  p_admin_note text default null
)
returns setof public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.customer_orders%rowtype;
  v_now timestamptz := now();
  v_decision text := lower(trim(coalesce(p_decision,'')));
  v_note text := nullif(trim(coalesce(p_admin_note,'')), '');
begin
  if not public.is_active_admin() then
    raise exception 'Not active admin';
  end if;
  select * into v_old from public.customer_orders where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
  if v_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  update public.customer_orders co
  set cancel_status = v_decision,
      cancel_decided_at = v_now,
      cancel_admin_note = v_note,
      status = case when v_decision='approved' then 'cancelled' else co.status end,
      completed_at = case when v_decision='approved' then coalesce(co.completed_at, v_now) else co.completed_at end,
      archived_at = case when v_decision='approved' then coalesce(co.archived_at, v_now) else co.archived_at end,
      updated_at = v_now,
      status_updated_at = v_now,
      status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'event','cancel_'||v_decision,
        'from',v_old.status,
        'to',case when v_decision='approved' then 'cancelled' else v_old.status end,
        'admin_note',v_note,
        'at',v_now,
        'by',auth.uid()
      ))
  where co.id=p_order_id;

  if v_old.user_id is not null then
    insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
    values(
      v_old.user_id,
      'order_status',
      case when v_decision='approved' then 'Order cancellation approved' else 'Cancellation request update' end,
      case when v_decision='approved' then concat('Your order ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' has been cancelled by Langar Bar.') else concat('Your order ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' cannot be cancelled automatically. Please contact Langar Bar staff.') end,
      case when v_decision='approved' then 'Otkazivanje narudžbe odobreno' else 'Ažuriranje zahtjeva za otkazivanje' end,
      case when v_decision='approved' then concat('Vaša narudžba ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' je otkazana od strane Langar Bara.') else concat('Vaša narudžba ', coalesce(v_old.order_number, left(v_old.id::text,8)), ' ne može se automatski otkazati. Kontaktirajte osoblje Langar Bara.') end,
      jsonb_build_object('order_id',v_old.id,'order_number',v_old.order_number,'event','cancel_'||v_decision)
    );
  end if;

  return query select * from public.customer_orders where id=p_order_id;
end;
$$;
grant execute on function public.admin_decide_order_cancellation(uuid,text,text) to authenticated;

-- Realtime support remains enabled if publication exists.
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
