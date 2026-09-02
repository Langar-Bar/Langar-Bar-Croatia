-- Langar Bar Admin V6.0.9
-- Atomic order-print audit RPC matching the live Supabase migration.

begin;

create or replace function public.admin_record_order_print_v609(
  p_order_id uuid,
  p_copy_type text default 'internal',
  p_device_label text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns setof public.customer_orders
language plpgsql
security definer
set search_path = public
as $function$
declare
  updated_order public.customer_orders;
begin
  if not public.is_active_admin() then
    raise exception 'Active admin access required';
  end if;

  if p_copy_type not in ('internal','delivery') then
    raise exception 'Invalid print copy type';
  end if;

  if not exists(select 1 from public.customer_orders where id=p_order_id) then
    raise exception 'Order not found';
  end if;

  insert into public.order_print_audit(
    order_id, copy_type, printed_by, device_label, metadata
  )
  values(
    p_order_id,
    p_copy_type,
    auth.uid(),
    left(nullif(trim(p_device_label),''),160),
    coalesce(p_metadata,'{}'::jsonb)
  );

  update public.customer_orders
  set
    internal_printed_at = case
      when p_copy_type='internal' then now()
      else internal_printed_at
    end,
    internal_print_count = case
      when p_copy_type='internal' then internal_print_count + 1
      else internal_print_count
    end,
    delivery_copy_printed_at = case
      when p_copy_type='delivery' then now()
      else delivery_copy_printed_at
    end,
    updated_at = now()
  where id=p_order_id
  returning * into updated_order;

  return next updated_order;
  return;
end;
$function$;

revoke all on function public.admin_record_order_print_v609(uuid,text,text,jsonb) from public;
revoke all on function public.admin_record_order_print_v609(uuid,text,text,jsonb) from anon;
grant execute on function public.admin_record_order_print_v609(uuid,text,text,jsonb) to authenticated;

commit;
