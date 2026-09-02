-- Langar Bar V6.0.9
-- Security hardening, server-side order pricing validation and print/report support.

begin;

-- Public clients submit through the validated RPC only. Direct arbitrary inserts are removed.
drop policy if exists customer_orders_public_insert on public.customer_orders;

-- RLS policies use cached auth/admin checks and keep customer ownership intact.
drop policy if exists customer_orders_admin_select on public.customer_orders;
create policy customer_orders_admin_select
on public.customer_orders
for select
to authenticated
using (
  (select public.is_active_admin())
  or user_id = (select auth.uid())
);

drop policy if exists customer_orders_admin_update on public.customer_orders;
create policy customer_orders_admin_update
on public.customer_orders
for update
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

-- Print audit must be available only to an active admin account.
drop policy if exists admins_manage_order_print_audit on public.order_print_audit;
create policy admins_manage_order_print_audit
on public.order_print_audit
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_members a
    where a.user_id = (select auth.uid())
      and a.active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_members a
    where a.user_id = (select auth.uid())
      and a.active = true
  )
);

create index if not exists order_print_audit_order_printed_idx
  on public.order_print_audit(order_id, printed_at desc);
create index if not exists order_print_audit_printed_by_idx
  on public.order_print_audit(printed_by)
  where printed_by is not null;

-- Remove the known identical duplicate index while retaining customer_orders_is_test_idx.
drop index if exists public.idx_customer_orders_is_test;

-- Defensive data checks. Existing rows were inspected before applying this migration.
alter table public.customer_orders
  drop constraint if exists customer_orders_total_nonnegative_v609;
alter table public.customer_orders
  add constraint customer_orders_total_nonnegative_v609
  check (total >= 0) not valid;
alter table public.customer_orders
  validate constraint customer_orders_total_nonnegative_v609;

alter table public.customer_orders
  drop constraint if exists customer_orders_items_array_v609;
alter table public.customer_orders
  add constraint customer_orders_items_array_v609
  check (jsonb_typeof(items) = 'array') not valid;
alter table public.customer_orders
  validate constraint customer_orders_items_array_v609;

alter table public.customer_orders
  drop constraint if exists customer_orders_print_count_nonnegative_v609;
alter table public.customer_orders
  add constraint customer_orders_print_count_nonnegative_v609
  check (internal_print_count >= 0) not valid;
alter table public.customer_orders
  validate constraint customer_orders_print_count_nonnegative_v609;

-- Guest and member orders are now priced from active Cloud menu rows.
-- The client-supplied total is used only as a consistency check.
create or replace function public.submit_customer_order_payload(p_order jsonb)
returns table(
  id uuid,
  order_number text,
  order_token text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_type text := coalesce(nullif(trim(p_order->>'fulfillment_type'),''), 'dine_in');
  v_user uuid := auth.uid();
  v_items_input jsonb := coalesce(p_order->'items','[]'::jsonb);
  v_items_clean jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_submitted_total numeric;
  v_item jsonb;
  v_id text;
  v_parts text[];
  v_token text;
  v_index integer;
  v_qty integer;
  v_expected_unit numeric;
  v_required_flavors integer;
  v_tapas_flavors integer;
  v_drink_count integer;
  v_seen_tokens text[];
  v_base_id uuid;
  v_base_sku text;
  v_base_name_en text;
  v_base_name_hr text;
  v_base_price numeric;
  v_base_category text;
  v_extra_sku text;
  v_extra_name_en text;
  v_extra_name_hr text;
  v_extra_price numeric;
  v_extra_category text;
  v_display_name_en text;
  v_display_name_hr text;
  v_item_note text;
begin
  if p_order is null or jsonb_typeof(p_order) <> 'object' then
    raise exception 'Invalid order payload';
  end if;

  if v_type not in ('dine_in','pickup','delivery') then
    raise exception 'Invalid fulfillment type: %', v_type;
  end if;

  if v_type = 'dine_in' and coalesce(nullif(trim(p_order->>'table_number'),''),'') = '' then
    raise exception 'Table number is required for dine-in orders';
  end if;

  if v_type in ('pickup','delivery') then
    if coalesce(nullif(trim(p_order->>'customer_name'),''),'') = '' then
      raise exception 'Customer name is required for pickup and delivery orders';
    end if;
    if coalesce(nullif(trim(p_order->>'customer_phone'),''),'') = '' then
      raise exception 'Customer phone is required for pickup and delivery orders';
    end if;
  end if;

  if v_type = 'delivery' and coalesce(nullif(trim(p_order->>'delivery_address'),''),'') = '' then
    raise exception 'Delivery address is required for delivery orders';
  end if;

  if jsonb_typeof(v_items_input) <> 'array' then
    raise exception 'Order items must be an array';
  end if;

  if jsonb_array_length(v_items_input) < 1 or jsonb_array_length(v_items_input) > 100 then
    raise exception 'Order must contain between 1 and 100 item rows';
  end if;

  for v_item in select value from jsonb_array_elements(v_items_input)
  loop
    v_id := trim(coalesce(v_item->>'id',v_item->>'item_id',''));
    if v_id = '' or length(v_id) > 1200 then
      raise exception 'Invalid menu item identifier';
    end if;

    begin
      v_qty := coalesce(nullif(v_item->>'qty','')::integer,nullif(v_item->>'quantity','')::integer,1);
    exception when others then
      raise exception 'Invalid quantity for item %', left(v_id,80);
    end;
    if v_qty < 1 or v_qty > 50 then
      raise exception 'Quantity must be between 1 and 50';
    end if;

    v_parts := string_to_array(v_id,'__');
    v_token := v_parts[1];

    select mi.id,mi.sku,mi.name_en,mi.name_hr,mi.price,mc.slug
      into v_base_id,v_base_sku,v_base_name_en,v_base_name_hr,v_base_price,v_base_category
    from public.menu_items mi
    left join public.menu_categories mc on mc.id=mi.category_id
    where (mi.id::text=v_token or mi.sku=v_token)
      and mi.active=true
      and mi.available_in_menu=true
      and mi.allow_online_order=true
    order by case when mi.id::text=v_token then 0 else 1 end
    limit 1;

    if v_base_id is null then
      raise exception 'Menu item is unavailable or no longer orderable: %', left(v_token,100);
    end if;

    v_expected_unit := round(coalesce(v_base_price,0),2);
    v_required_flavors := case v_base_sku when 'TAP-002' then 2 when 'TAP-003' then 3 when 'TAP-004' then 4 else 0 end;
    v_tapas_flavors := 0;
    v_drink_count := 0;
    v_seen_tokens := array[v_token];

    for v_index in 2..coalesce(array_length(v_parts,1),1)
    loop
      v_token := nullif(trim(v_parts[v_index]),'');
      if v_token is null then
        continue;
      end if;
      if v_token = any(v_seen_tokens) then
        raise exception 'Duplicate option in order item: %', left(v_token,100);
      end if;
      v_seen_tokens := array_append(v_seen_tokens,v_token);

      if v_token in ('OJ','ESP','AME','TEA') then
        v_drink_count := v_drink_count + 1;
        if v_drink_count > 1 then
          raise exception 'Only one included breakfast drink may be selected';
        end if;
        continue;
      end if;

      if v_token = 'CHIPS' then
        if v_required_flavors = 0 then
          raise exception 'CHIPS option is valid only for a Tapas combo';
        end if;
        continue;
      end if;

      if v_token = 'FOCACCIA' then
        if v_required_flavors = 0 then
          raise exception 'Focaccia upgrade is valid only for a Tapas combo';
        end if;
        v_expected_unit := v_expected_unit + 1.00;
        continue;
      end if;

      v_extra_sku := null;
      v_extra_name_en := null;
      v_extra_name_hr := null;
      v_extra_price := null;
      v_extra_category := null;

      select mi.sku,mi.name_en,mi.name_hr,mi.price,mc.slug
        into v_extra_sku,v_extra_name_en,v_extra_name_hr,v_extra_price,v_extra_category
      from public.menu_items mi
      left join public.menu_categories mc on mc.id=mi.category_id
      where (mi.id::text=v_token or mi.sku=v_token)
        and mi.active=true
        and mi.available_in_menu=true
        and (mi.allow_online_order=true or mi.sku like 'SCO-%')
      order by case when mi.id::text=v_token then 0 else 1 end
      limit 1;

      if v_extra_sku is null then
        raise exception 'Unknown or unavailable order option: %', left(v_token,100);
      end if;

      if v_base_category = 'breakfast' and v_extra_category = 'breakfast_addons' then
        v_expected_unit := v_expected_unit + coalesce(v_extra_price,0);
      elsif v_required_flavors > 0 and v_extra_category = 'tapas' and v_extra_sku like 'SCO-%' then
        v_tapas_flavors := v_tapas_flavors + 1;
      else
        raise exception 'Option % is not valid for item %', left(v_extra_sku,100), left(v_base_sku,100);
      end if;
    end loop;

    if v_required_flavors > 0 and v_tapas_flavors <> v_required_flavors then
      raise exception 'Tapas combo % requires exactly % flavor choices',v_base_sku,v_required_flavors;
    end if;

    v_expected_unit := round(v_expected_unit,2);
    if v_expected_unit < 0 or v_expected_unit > 1000 then
      raise exception 'Calculated item price is outside the allowed range';
    end if;

    v_display_name_en := left(coalesce(nullif(trim(v_item->>'name_en'),''),v_base_name_en),500);
    v_display_name_hr := left(coalesce(nullif(trim(v_item->>'name_hr'),''),v_base_name_hr,v_display_name_en),500);
    v_item_note := left(nullif(trim(v_item->>'note'),''),500);

    v_items_clean := v_items_clean || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id',v_id,
      'base_item_id',v_base_id,
      'sku',v_base_sku,
      'qty',v_qty,
      'name_en',v_display_name_en,
      'name_hr',v_display_name_hr,
      'price',v_expected_unit,
      'line_total',round(v_expected_unit*v_qty,2),
      'note',v_item_note,
      'category_id',v_base_category
    )));
    v_total := v_total + round(v_expected_unit*v_qty,2);
  end loop;

  v_total := round(v_total,2);
  if v_total <= 0 or v_total > 10000 then
    raise exception 'Calculated order total is outside the allowed range';
  end if;

  begin
    v_submitted_total := nullif(trim(p_order->>'total'),'')::numeric;
  exception when others then
    raise exception 'Invalid submitted total';
  end;

  if v_submitted_total is not null and abs(round(v_submitted_total,2)-v_total) > 0.01 then
    raise exception 'Menu prices changed or the submitted total is invalid. Refresh the menu and submit again. Expected total: %',v_total;
  end if;

  return query
  insert into public.customer_orders(
    user_id,fulfillment_type,table_number,customer_name,customer_phone,delivery_address,note,
    items,total,currency,status,paid,status_updated_at,status_history
  ) values (
    v_user,
    v_type,
    left(nullif(trim(p_order->>'table_number'),''),40),
    left(nullif(trim(p_order->>'customer_name'),''),160),
    left(nullif(trim(p_order->>'customer_phone'),''),60),
    left(nullif(trim(p_order->>'delivery_address'),''),500),
    left(nullif(trim(p_order->>'note'),''),1000),
    v_items_clean,
    v_total,
    'EUR',
    'new',
    false,
    now(),
    jsonb_build_array(jsonb_build_object(
      'status','new',
      'at',now(),
      'by',case when v_user is null then 'guest_app' else 'member_app' end,
      'version','v609',
      'pricing','server_validated',
      'total',v_total
    ))
  )
  returning customer_orders.id,customer_orders.order_number,customer_orders.order_token,customer_orders.status,customer_orders.created_at;
end;
$function$;

-- Compatibility RPC continues to route into the validated payload function.
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
returns table(id uuid,order_number text,order_token text,status text,created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $function$
begin
  return query
  select *
  from public.submit_customer_order_payload(jsonb_build_object(
    'fulfillment_type',p_fulfillment_type,
    'table_number',p_table_number,
    'customer_name',p_customer_name,
    'customer_phone',p_customer_phone,
    'delivery_address',p_delivery_address,
    'note',p_note,
    'items',coalesce(p_items,'[]'::jsonb),
    'total',coalesce(p_total,0),
    'currency','EUR'
  ));
end;
$function$;

revoke all on function public.submit_customer_order_payload(jsonb) from public;
revoke all on function public.submit_customer_order_payload(jsonb) from anon,authenticated;
grant execute on function public.submit_customer_order_payload(jsonb) to anon,authenticated;

revoke all on function public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric) from public;
revoke all on function public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric) from anon,authenticated;
grant execute on function public.submit_customer_order(uuid,text,text,text,text,text,text,jsonb,numeric) to anon,authenticated;

-- Only an active admin may change the public opening status.
create or replace function public.admin_save_opening_v608(
  p_enabled boolean,
  p_status text,
  p_opening_at timestamptz,
  p_headline_en text,
  p_headline_hr text,
  p_announcement_en text,
  p_announcement_hr text,
  p_hero_image_url text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  saved public.opening_management;
begin
  if not public.is_active_admin() then
    raise exception 'Active admin access required';
  end if;
  if coalesce(nullif(p_status,''),'opening_soon') not in ('opening_soon','soft_opening','grand_opening','open_now') then
    raise exception 'Invalid opening status';
  end if;

  insert into public.opening_management(
    id,enabled,status,opening_at,headline_en,headline_hr,announcement_en,announcement_hr,
    hero_image_url,updated_at,updated_by
  ) values (
    1,coalesce(p_enabled,true),coalesce(nullif(p_status,''),'opening_soon'),p_opening_at,
    left(coalesce(p_headline_en,''),180),left(coalesce(p_headline_hr,''),180),
    left(coalesce(p_announcement_en,''),1000),left(coalesce(p_announcement_hr,''),1000),
    nullif(left(p_hero_image_url,1200),''),now(),auth.uid()
  )
  on conflict(id) do update set
    enabled=excluded.enabled,status=excluded.status,opening_at=excluded.opening_at,
    headline_en=excluded.headline_en,headline_hr=excluded.headline_hr,
    announcement_en=excluded.announcement_en,announcement_hr=excluded.announcement_hr,
    hero_image_url=excluded.hero_image_url,updated_at=now(),updated_by=auth.uid()
  returning * into saved;

  return to_jsonb(saved);
end;
$function$;

-- Every admin_* endpoint is removed from anonymous/PUBLIC execution.
-- Authenticated callers still pass each function's internal active-admin/role guard.
do $block$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname like 'admin\_%' escape '\'
  loop
    execute format('revoke all on function %s from public',fn.signature);
    execute format('revoke all on function %s from anon',fn.signature);
    execute format('grant execute on function %s to authenticated',fn.signature);
  end loop;
end;
$block$;

-- Lock down known helper/trigger routines that must not be API endpoints.
revoke all on function public.set_updated_at() from public,anon,authenticated;
revoke all on function public.langar_normalize_v541(text) from public,anon,authenticated;
alter function public.set_updated_at() set search_path = public;
alter function public.langar_normalize_v541(text) set search_path = public;

commit;
