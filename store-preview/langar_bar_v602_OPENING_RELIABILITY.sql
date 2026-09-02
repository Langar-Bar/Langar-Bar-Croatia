begin;
create table if not exists public.opening_management (
 id integer primary key default 1 check(id=1),
 enabled boolean not null default true,
 status text not null default 'opening_soon',
 opening_at timestamptz,
 headline_en text not null default 'Opening Soon',
 headline_hr text not null default 'Uskoro otvaramo',
 announcement_en text not null default '',
 announcement_hr text not null default '',
 hero_image_url text,
 updated_at timestamptz not null default now(),
 updated_by uuid
);
insert into public.opening_management(id) values(1) on conflict(id) do nothing;
alter table public.opening_management enable row level security;
drop policy if exists opening_management_public_read on public.opening_management;
create policy opening_management_public_read on public.opening_management for select using(true);
create or replace function public.get_opening_settings_v600()
returns setof public.opening_management language sql stable security definer set search_path=public as $$select * from public.opening_management where id=1$$;
grant execute on function public.get_opening_settings_v600() to anon,authenticated;
create or replace function public.admin_save_opening_settings_v600(p_settings jsonb)
returns public.opening_management language plpgsql security definer set search_path=public as $$
declare r public.opening_management;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if to_regprocedure('public.has_admin_role(text[])') is not null then
   if not public.has_admin_role(array['owner','manager']) then raise exception 'Admin access required'; end if;
 end if;
 update public.opening_management set
  enabled=coalesce((p_settings->>'enabled')::boolean,enabled),
  status=coalesce(nullif(p_settings->>'status',''),status),
  opening_at=case when p_settings ? 'opening_at' and nullif(p_settings->>'opening_at','') is not null then (p_settings->>'opening_at')::timestamptz when p_settings ? 'opening_at' then null else opening_at end,
  headline_en=coalesce(p_settings->>'headline_en',headline_en),
  headline_hr=coalesce(p_settings->>'headline_hr',headline_hr),
  announcement_en=coalesce(p_settings->>'announcement_en',announcement_en),
  announcement_hr=coalesce(p_settings->>'announcement_hr',announcement_hr),
  hero_image_url=nullif(p_settings->>'hero_image_url',''),updated_at=now(),updated_by=auth.uid()
 where id=1 returning * into r;
 return r;
end$$;
grant execute on function public.admin_save_opening_settings_v600(jsonb) to authenticated;
commit;
select id,enabled,status,opening_at,updated_at from public.opening_management where id=1;
