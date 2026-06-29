-- Langar Bar V4.5.9 — Reviews + Cancellation Modal + Inbox Modal Fix
-- Run after V4.5.8. Safe migration: does not delete orders, customers, rewards or inbox data.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Cancellation reason details
-- ------------------------------------------------------------
alter table public.customer_orders add column if not exists cancel_reason_code text;
alter table public.customer_orders add column if not exists cancel_reason_note text;
alter table public.customer_orders add column if not exists is_test boolean not null default false;
alter table public.customer_orders add column if not exists updated_at timestamptz default now();
alter table public.customer_orders add column if not exists status_history jsonb not null default '[]'::jsonb;

create index if not exists idx_customer_orders_cancel_reason_code on public.customer_orders(cancel_reason_code);
create index if not exists idx_customer_orders_is_test on public.customer_orders(is_test);

-- New V4.5.9 customer cancellation RPC. This keeps old RPC intact for compatibility.
drop function if exists public.request_order_cancellation_v459(text,text,text);
create or replace function public.request_order_cancellation_v459(
  p_token text,
  p_reason_code text default null,
  p_reason_note text default null
)
returns table (
  id uuid,
  order_number text,
  status text,
  cancel_requested_at timestamptz,
  cancel_status text,
  cancel_reason_code text,
  cancel_reason_note text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.customer_orders%rowtype;
  v_now timestamptz := now();
  v_reason_code text := nullif(trim(coalesce(p_reason_code,'')), '');
  v_reason_note text := nullif(trim(coalesce(p_reason_note,'')), '');
  v_allowed text[] := array[
    'ordered_by_mistake','wait_time_too_long','change_order','wrong_item','cant_come',
    'wrong_table_pickup','duplicate_order','payment_issue','changed_mind','other'
  ];
begin
  select * into v_order from public.customer_orders where order_token=p_token;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status in ('completed','cancelled','rejected') then
    raise exception 'This order is already closed and cannot request cancellation';
  end if;
  if coalesce(v_order.is_test,false) then
    raise exception 'Test orders cannot request cancellation';
  end if;
  if v_reason_code is null or not (v_reason_code = any(v_allowed)) then
    raise exception 'Cancellation reason is required';
  end if;
  if v_order.cancel_requested_at is not null and coalesce(v_order.cancel_status,'requested')='requested' then
    raise exception 'Cancellation request already sent';
  end if;

  update public.customer_orders co
  set cancel_requested_at = v_now,
      cancel_reason_code = v_reason_code,
      cancel_reason_note = v_reason_note,
      cancel_reason = concat(v_reason_code, case when v_reason_note is not null then ' — '||v_reason_note else '' end),
      cancel_status = 'requested',
      cancel_decided_at = null,
      cancel_admin_note = null,
      updated_at = v_now,
      status_history = coalesce(co.status_history,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'event','cancel_requested',
        'reason_code',v_reason_code,
        'reason_note',v_reason_note,
        'at',v_now
      ))
  where co.id=v_order.id;

  return query select co.id, co.order_number, co.status, co.cancel_requested_at, co.cancel_status, co.cancel_reason_code, co.cancel_reason_note
  from public.customer_orders co where co.id=v_order.id;
end;
$$;
grant execute on function public.request_order_cancellation_v459(text,text,text) to anon, authenticated;

-- Admin can send a message while reviewing a cancellation request.
drop function if exists public.admin_message_order_customer_v459(uuid,text);
create or replace function public.admin_message_order_customer_v459(
  p_order_id uuid,
  p_message text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.customer_orders%rowtype;
  v_message text := nullif(trim(coalesce(p_message,'')), '');
begin
  if not public.is_active_admin() then raise exception 'Not active admin'; end if;
  if v_message is null then raise exception 'Message is required'; end if;
  select * into v_order from public.customer_orders where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
  if v_order.user_id is null then raise exception 'This guest order is not linked to a Langar Club account, so Inbox message cannot be sent'; end if;

  insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
  values(
    v_order.user_id,
    'order_status',
    'Message about your cancellation request',
    v_message,
    'Poruka o zahtjevu za otkazivanje',
    v_message,
    jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'event','cancel_message')
  );
  return true;
end;
$$;
grant execute on function public.admin_message_order_customer_v459(uuid,text) to authenticated;

-- ------------------------------------------------------------
-- 2) Order review tables
-- ------------------------------------------------------------
create table if not exists public.order_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  order_number text,
  customer_name text,
  service_rating integer not null check (service_rating between 1 and 5),
  food_quality_rating integer not null check (food_quality_rating between 1 and 5),
  portion_size_rating integer not null check (portion_size_rating between 1 and 5),
  price_value_rating integer not null check (price_value_rating between 1 and 5),
  overall_rating integer not null check (overall_rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','approved_public','private','rejected')),
  is_public boolean not null default false,
  admin_reply text,
  admin_action text,
  coupon_amount numeric(10,2),
  credit_amount numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  constraint order_reviews_one_per_order unique(order_id)
);

create table if not exists public.order_review_items (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.order_reviews(id) on delete cascade,
  order_id uuid not null references public.customer_orders(id) on delete cascade,
  item_id text,
  item_name_en text,
  item_name_hr text,
  qty numeric(10,2) default 1,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_reviews_order_id on public.order_reviews(order_id);
create index if not exists idx_order_reviews_user_created on public.order_reviews(user_id, created_at desc);
create index if not exists idx_order_reviews_status_created on public.order_reviews(status, created_at desc);
create index if not exists idx_order_reviews_public_created on public.order_reviews(is_public, created_at desc);
create index if not exists idx_order_review_items_item_id on public.order_review_items(item_id);
create index if not exists idx_order_review_items_review_id on public.order_review_items(review_id);

alter table public.order_reviews enable row level security;
alter table public.order_review_items enable row level security;
grant select, insert, update on public.order_reviews to authenticated;
grant select, insert on public.order_review_items to authenticated;
grant select on public.order_reviews to anon;
grant select on public.order_review_items to anon;

drop policy if exists order_reviews_select_public on public.order_reviews;
create policy order_reviews_select_public on public.order_reviews
for select to anon, authenticated
using (is_public = true and status = 'approved_public');

drop policy if exists order_reviews_select_own on public.order_reviews;
create policy order_reviews_select_own on public.order_reviews
for select to authenticated
using (user_id = auth.uid() or public.is_active_admin());

drop policy if exists order_reviews_admin_update on public.order_reviews;
create policy order_reviews_admin_update on public.order_reviews
for update to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

drop policy if exists order_review_items_select_public on public.order_review_items;
create policy order_review_items_select_public on public.order_review_items
for select to anon, authenticated
using (exists (select 1 from public.order_reviews r where r.id=order_review_items.review_id and r.is_public=true and r.status='approved_public'));

drop policy if exists order_review_items_select_own on public.order_review_items;
create policy order_review_items_select_own on public.order_review_items
for select to authenticated
using (exists (select 1 from public.order_reviews r where r.id=order_review_items.review_id and (r.user_id=auth.uid() or public.is_active_admin())));


-- Compatibility table for menu likes if older Cloud Menu SQL was not present.
create table if not exists public.menu_item_likes (
  user_id uuid references auth.users(id) on delete cascade,
  item_id uuid,
  created_at timestamptz default now(),
  primary key(user_id,item_id)
);
grant select, insert, delete on public.menu_item_likes to authenticated;
alter table public.menu_item_likes enable row level security;
drop policy if exists menu_item_likes_select_own on public.menu_item_likes;
create policy menu_item_likes_select_own on public.menu_item_likes for select to authenticated using (user_id = auth.uid());
drop policy if exists menu_item_likes_insert_own on public.menu_item_likes;
create policy menu_item_likes_insert_own on public.menu_item_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists menu_item_likes_delete_own on public.menu_item_likes;
create policy menu_item_likes_delete_own on public.menu_item_likes for delete to authenticated using (user_id = auth.uid());

-- Minimal compatibility for older feedback features if feedback table was not installed earlier.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  rating integer,
  message text,
  customer_name text,
  is_public boolean default false,
  status text default 'pending',
  admin_reply text,
  created_at timestamptz default now()
);
grant select, insert, update on public.feedback to anon, authenticated;

-- ------------------------------------------------------------
-- 3) Customer review RPCs
-- ------------------------------------------------------------
drop function if exists public.submit_order_review_v459(text,jsonb);
create or replace function public.submit_order_review_v459(
  p_token text,
  p_review jsonb
)
returns table (
  id uuid,
  order_id uuid,
  order_number text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.customer_orders%rowtype;
  v_review_id uuid;
  v_item jsonb;
  v_item_rating integer;
  v_item_count integer := 0;
  v_service integer := nullif(p_review->>'service_rating','')::integer;
  v_food integer := nullif(p_review->>'food_quality_rating','')::integer;
  v_portion integer := nullif(p_review->>'portion_size_rating','')::integer;
  v_value integer := nullif(p_review->>'price_value_rating','')::integer;
  v_overall integer := nullif(p_review->>'overall_rating','')::integer;
begin
  select * into v_order from public.customer_orders where order_token=p_token;
  if not found then raise exception 'Order not found'; end if;
  if coalesce(v_order.is_test,false) then raise exception 'Test orders cannot be reviewed'; end if;
  if v_order.status <> 'completed' then raise exception 'Only completed orders can be reviewed'; end if;
  if coalesce(v_order.paid,false) is not true then raise exception 'Only paid orders can be reviewed'; end if;
  if exists(select 1 from public.order_reviews r where r.order_id=v_order.id) then raise exception 'Review already exists for this order'; end if;
  if not (v_service between 1 and 5 and v_food between 1 and 5 and v_portion between 1 and 5 and v_value between 1 and 5 and v_overall between 1 and 5) then
    raise exception 'All review ratings must be between 1 and 5';
  end if;

  insert into public.order_reviews(
    order_id,user_id,order_number,customer_name,service_rating,food_quality_rating,portion_size_rating,price_value_rating,overall_rating,comment,status,is_public
  ) values (
    v_order.id,v_order.user_id,v_order.order_number,coalesce(nullif(v_order.customer_name,''),'Langar guest'),
    v_service,v_food,v_portion,v_value,v_overall,nullif(trim(coalesce(p_review->>'comment','')),''),'pending',false
  ) returning order_reviews.id into v_review_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_review->'item_reviews','[]'::jsonb)) loop
    v_item_rating := nullif(v_item->>'rating','')::integer;
    if not (v_item_rating between 1 and 5) then raise exception 'Every item rating must be between 1 and 5'; end if;
    v_item_count := v_item_count + 1;
    insert into public.order_review_items(review_id,order_id,item_id,item_name_en,item_name_hr,qty,rating,comment)
    values(
      v_review_id,
      v_order.id,
      nullif(v_item->>'item_id',''),
      nullif(v_item->>'item_name_en',''),
      nullif(v_item->>'item_name_hr',''),
      coalesce(nullif(v_item->>'qty','')::numeric,1),
      v_item_rating,
      nullif(trim(coalesce(v_item->>'comment','')),'')
    );
  end loop;

  if v_item_count = 0 then raise exception 'At least one item rating is required'; end if;

  return query select r.id, r.order_id, r.order_number, r.status, r.created_at from public.order_reviews r where r.id=v_review_id;
end;
$$;
grant execute on function public.submit_order_review_v459(text,jsonb) to anon, authenticated;

drop function if exists public.get_my_order_reviews_v459(integer);
create or replace function public.get_my_order_reviews_v459(p_limit integer default 120)
returns table (
  review_id uuid,
  order_id uuid,
  order_number text,
  order_token text,
  overall_rating integer,
  status text,
  is_public boolean,
  admin_reply text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.order_id, r.order_number, co.order_token, r.overall_rating, r.status, r.is_public, r.admin_reply, r.created_at
  from public.order_reviews r
  join public.customer_orders co on co.id=r.order_id
  where r.user_id = auth.uid()
  order by r.created_at desc
  limit least(greatest(coalesce(p_limit,120),1),300);
$$;
grant execute on function public.get_my_order_reviews_v459(integer) to authenticated;

-- ------------------------------------------------------------
-- 4) Extend customer order lookups with review/cancel fields
-- ------------------------------------------------------------
drop function if exists public.get_customer_order_by_token(text);
create or replace function public.get_customer_order_by_token(p_token text)
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
  cancel_reason_code text,
  cancel_reason_note text,
  cancel_status text,
  cancel_decided_at timestamptz,
  cancel_admin_note text,
  is_test boolean,
  has_review boolean,
  review_id uuid,
  review_summary jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select co.id, co.order_number, co.order_token, co.fulfillment_type, co.table_number, co.customer_name, co.customer_phone,
         co.delivery_address, co.note, co.total, co.currency, co.status, co.paid, co.items, co.created_at, co.updated_at,
         co.status_updated_at, co.completed_at, co.archived_at,
         co.estimated_minutes, co.estimated_ready_at, co.admin_customer_note,
         co.cancel_requested_at, co.cancel_reason, co.cancel_reason_code, co.cancel_reason_note, co.cancel_status, co.cancel_decided_at, co.cancel_admin_note,
         coalesce(co.is_test,false) as is_test,
         (r.id is not null) as has_review,
         r.id as review_id,
         case when r.id is null then null else jsonb_build_object('overall_rating',r.overall_rating,'status',r.status,'is_public',r.is_public,'admin_reply',r.admin_reply) end as review_summary
  from public.customer_orders co
  left join public.order_reviews r on r.order_id=co.id
  where co.order_token = p_token
  limit 1;
$$;
grant execute on function public.get_customer_order_by_token(text) to anon, authenticated;

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
  cancel_reason_code text,
  cancel_reason_note text,
  cancel_status text,
  cancel_decided_at timestamptz,
  cancel_admin_note text,
  is_test boolean,
  has_review boolean,
  review_id uuid,
  review_summary jsonb
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
  if v_uid is null then raise exception 'Login required'; end if;

  select p.phone into v_phone from public.profiles p where p.id = v_uid;
  v_phone_digits := regexp_replace(coalesce(v_phone,''), '\D', '', 'g');

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
    co.id, co.order_number, co.order_token, co.fulfillment_type, co.table_number, co.customer_name, co.customer_phone,
    co.delivery_address, co.note, co.total, co.currency, co.status, co.paid, co.items, co.created_at, co.updated_at,
    co.status_updated_at, co.completed_at, co.archived_at,
    co.estimated_minutes, co.estimated_ready_at, co.admin_customer_note,
    co.cancel_requested_at, co.cancel_reason, co.cancel_reason_code, co.cancel_reason_note, co.cancel_status, co.cancel_decided_at, co.cancel_admin_note,
    coalesce(co.is_test,false) as is_test,
    (r.id is not null) as has_review,
    r.id as review_id,
    case when r.id is null then null else jsonb_build_object('overall_rating',r.overall_rating,'status',r.status,'is_public',r.is_public,'admin_reply',r.admin_reply) end as review_summary
  from public.customer_orders co
  left join public.order_reviews r on r.order_id=co.id
  where co.user_id = v_uid
  order by co.created_at desc
  limit least(greatest(coalesce(p_limit,120),1),300);
end;
$$;
grant execute on function public.get_my_customer_orders(integer) to authenticated;

-- ------------------------------------------------------------
-- 5) Admin reviews + moderation
-- ------------------------------------------------------------
drop function if exists public.admin_get_order_reviews_v459(integer);
create or replace function public.admin_get_order_reviews_v459(p_limit integer default 300)
returns table (
  review_id uuid,
  order_id uuid,
  order_number text,
  user_id uuid,
  customer_name text,
  service_rating integer,
  food_quality_rating integer,
  portion_size_rating integer,
  price_value_rating integer,
  overall_rating integer,
  comment text,
  status text,
  is_public boolean,
  admin_reply text,
  admin_action text,
  coupon_amount numeric,
  credit_amount numeric,
  created_at timestamptz,
  updated_at timestamptz,
  moderated_at timestamptz,
  order_status text,
  order_paid boolean,
  order_total numeric,
  fulfillment_type text,
  is_test boolean,
  item_reviews jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_admin() then raise exception 'Not active admin'; end if;
  return query
  select
    r.id, r.order_id, r.order_number, r.user_id, r.customer_name,
    r.service_rating, r.food_quality_rating, r.portion_size_rating, r.price_value_rating, r.overall_rating,
    r.comment, r.status, r.is_public, r.admin_reply, r.admin_action, r.coupon_amount, r.credit_amount,
    r.created_at, r.updated_at, r.moderated_at,
    co.status, co.paid, co.total, co.fulfillment_type, coalesce(co.is_test,false),
    coalesce((select jsonb_agg(jsonb_build_object('item_id',i.item_id,'item_name_en',i.item_name_en,'item_name_hr',i.item_name_hr,'qty',i.qty,'rating',i.rating,'comment',i.comment) order by i.created_at)
              from public.order_review_items i where i.review_id=r.id), '[]'::jsonb) as item_reviews
  from public.order_reviews r
  join public.customer_orders co on co.id=r.order_id
  order by r.created_at desc
  limit least(greatest(coalesce(p_limit,300),1),600);
end;
$$;
grant execute on function public.admin_get_order_reviews_v459(integer) to authenticated;

drop function if exists public.admin_moderate_order_review_v459(uuid,text,text,numeric);
create or replace function public.admin_moderate_order_review_v459(
  p_review_id uuid,
  p_action text,
  p_reply text default null,
  p_coupon_amount numeric default null
)
returns setof public.order_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text := lower(trim(coalesce(p_action,'')));
  v_reply text := nullif(trim(coalesce(p_reply,'')), '');
  v_amount numeric(10,2) := coalesce(p_coupon_amount, 0);
  v_review public.order_reviews%rowtype;
  v_code text;
begin
  if not public.is_active_admin() then raise exception 'Not active admin'; end if;
  select * into v_review from public.order_reviews where id=p_review_id;
  if not found then raise exception 'Review not found'; end if;
  if v_action not in ('approve_public','keep_private','reject','reply','send_coupon') then raise exception 'Unknown review action'; end if;

  if v_action='approve_public' then
    update public.order_reviews set status='approved_public', is_public=true, admin_reply=coalesce(v_reply,admin_reply), admin_action='approved_public', moderated_at=now(), moderated_by=auth.uid(), updated_at=now() where id=p_review_id;
  elsif v_action='keep_private' then
    update public.order_reviews set status='private', is_public=false, admin_reply=coalesce(v_reply,admin_reply), admin_action='kept_private', moderated_at=now(), moderated_by=auth.uid(), updated_at=now() where id=p_review_id;
  elsif v_action='reject' then
    update public.order_reviews set status='rejected', is_public=false, admin_reply=coalesce(v_reply,admin_reply), admin_action='rejected', moderated_at=now(), moderated_by=auth.uid(), updated_at=now() where id=p_review_id;
  elsif v_action='reply' then
    update public.order_reviews set admin_reply=coalesce(v_reply,admin_reply), admin_action='replied', moderated_at=now(), moderated_by=auth.uid(), updated_at=now() where id=p_review_id;
  elsif v_action='send_coupon' then
    if v_amount <= 0 then v_amount := 1.00; end if;
    update public.order_reviews set admin_reply=coalesce(v_reply,admin_reply), coupon_amount=v_amount, credit_amount=v_amount, admin_action='coupon_credit_sent', moderated_at=now(), moderated_by=auth.uid(), updated_at=now() where id=p_review_id;
    if v_review.user_id is not null then
      update public.profiles set langar_credit = coalesce(langar_credit,0) + v_amount, updated_at=now() where id=v_review.user_id;
      v_code := 'SORRY-' || upper(substr(md5(random()::text || clock_timestamp()::text),1,8));
      insert into public.reward_cards(user_id,reward_type,title_en,title_hr,description_en,description_hr,qr_code,status,valid_until)
      values(v_review.user_id,'service_recovery_coupon','Sorry / Thank You Coupon','Isprika / Hvala kupon',concat('Langar Bar added €',to_char(v_amount,'FM999990.00'),' credit/coupon to thank you for your feedback.'),concat('Langar Bar je dodao €',to_char(v_amount,'FM999990.00'),' kredit/kupon kao zahvalu za povratnu informaciju.'),v_code,'active',now()+interval '30 days');
      insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
      values(v_review.user_id,'review_reply','Langar Bar review reply',coalesce(v_reply,'Thank you for your feedback. We added a coupon/credit to your account.'),'Odgovor na recenziju Langar Bara',coalesce(v_reply,'Hvala na povratnoj informaciji. Dodali smo kupon/kredit na vaš račun.'),jsonb_build_object('review_id',p_review_id,'coupon_amount',v_amount,'qr_code',v_code));
    end if;
  end if;

  -- If a reply was added in any action, send it to Inbox when possible.
  if v_reply is not null and v_review.user_id is not null and v_action <> 'send_coupon' then
    insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
    values(v_review.user_id,'review_reply','Langar Bar reply to your review',v_reply,'Odgovor Langar Bara na vašu recenziju',v_reply,jsonb_build_object('review_id',p_review_id,'action',v_action));
  end if;

  return query select * from public.order_reviews where id=p_review_id;
end;
$$;
grant execute on function public.admin_moderate_order_review_v459(uuid,text,text,numeric) to authenticated;

-- ------------------------------------------------------------
-- 6) Public reviews + item insight views
-- ------------------------------------------------------------
drop view if exists public.v_public_order_reviews;
create view public.v_public_order_reviews as
select
  r.id,
  r.order_id,
  r.order_number,
  r.overall_rating,
  r.comment,
  coalesce(nullif(r.customer_name,''),'Langar guest') as display_name,
  r.admin_reply,
  r.created_at
from public.order_reviews r
where r.status='approved_public' and r.is_public=true;

drop view if exists public.v_public_feedback;
create view public.v_public_feedback as
select f.id, f.rating, f.message, coalesce(nullif(f.customer_name,''),'Langar guest') as display_name, f.created_at
from public.feedback f
where coalesce(f.is_public,false)=true or f.status in ('public','approved_public')
union all
select r.id, r.overall_rating as rating, coalesce(nullif(r.comment,''),'') as message, coalesce(nullif(r.customer_name,''),'Langar guest') as display_name, r.created_at
from public.order_reviews r
where r.status='approved_public' and r.is_public=true;

drop view if exists public.v_menu_item_review_stats;
create view public.v_menu_item_review_stats as
select
  i.item_id,
  coalesce(max(nullif(i.item_name_en,'')), max(nullif(i.item_name_hr,'')), i.item_id) as item_name,
  count(*)::integer as item_reviews_count,
  round(avg(i.rating)::numeric,2) as item_average_rating,
  count(*) filter (where i.rating >= 4)::integer as positive_item_reviews,
  count(*) filter (where i.rating <= 3)::integer as low_item_reviews
from public.order_review_items i
join public.order_reviews r on r.id=i.review_id
join public.customer_orders co on co.id=i.order_id
where r.status <> 'rejected'
  and co.status='completed'
  and co.paid=true
  and coalesce(co.is_test,false)=false
group by i.item_id;

-- Rebuild stats view used by customer Popular / Best Sellers.
-- It combines likes, positive feedback/reviews and completed paid non-test online order quantities.
drop view if exists public.v_menu_item_stats;
create view public.v_menu_item_stats as
with order_sales as (
  select
    coalesce(item->>'id', item->>'item_id') as item_id,
    sum(coalesce(nullif(item->>'qty','')::numeric, nullif(item->>'quantity','')::numeric, 1))::integer as qty
  from public.customer_orders co,
       lateral jsonb_array_elements(coalesce(co.items,'[]'::jsonb)) item
  where co.status='completed' and co.paid=true and coalesce(co.is_test,false)=false
  group by coalesce(item->>'id', item->>'item_id')
), likes as (
  select item_id::text as item_id, count(*)::integer as likes_count
  from public.menu_item_likes
  group by item_id::text
), feedback_comments as (
  select null::text as item_id, 0::integer as cnt
  where false
), review_comments as (
  select item_id, count(*) filter (where rating >= 4)::integer as cnt
  from public.order_review_items i
  join public.order_reviews r on r.id=i.review_id
  where r.status='approved_public' or r.status='private'
  group by item_id
)
select
  mi.id::text as item_id,
  coalesce(l.likes_count,0) as likes_count,
  coalesce(rc.cnt,0) as positive_comments_count,
  coalesce(os.qty,0) as online_sales_count,
  0::integer as manual_sales_count,
  (coalesce(os.qty,0) * 3 + coalesce(l.likes_count,0) * 5 + coalesce(rc.cnt,0) * 4 + case when coalesce(mi.is_featured,false) then 2 else 0 end)::integer as popular_score,
  coalesce(os.qty,0)::integer as best_seller_score
from public.menu_items mi
left join likes l on l.item_id = mi.id::text
left join order_sales os on os.item_id = mi.id::text or os.item_id = mi.sku
left join review_comments rc on rc.item_id = mi.id::text or rc.item_id = mi.sku;

grant select on public.v_public_order_reviews to anon, authenticated;
grant select on public.v_public_feedback to anon, authenticated;
grant select on public.v_menu_item_review_stats to anon, authenticated;
grant select on public.v_menu_item_stats to anon, authenticated;

-- Realtime for reviews, if publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.order_reviews;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

notify pgrst, 'reload schema';
