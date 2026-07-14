begin;

create table if not exists public.opening_management (
  id integer primary key default 1 check (id = 1),
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

insert into public.opening_management(id)
values (1)
on conflict (id) do nothing;

alter table public.opening_management enable row level security;

drop policy if exists opening_management_public_read on public.opening_management;
create policy opening_management_public_read
on public.opening_management
for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.opening_management to anon, authenticated;

create or replace function public.get_opening_public_v608()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(row_data)
  from (
    select
      id,
      enabled,
      status,
      opening_at,
      headline_en,
      headline_hr,
      announcement_en,
      announcement_hr,
      hero_image_url,
      updated_at
    from public.opening_management
    where id = 1
  ) row_data;
$$;

grant execute on function public.get_opening_public_v608() to anon, authenticated;

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
as $$
declare
  saved public.opening_management;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.opening_management (
    id,
    enabled,
    status,
    opening_at,
    headline_en,
    headline_hr,
    announcement_en,
    announcement_hr,
    hero_image_url,
    updated_at,
    updated_by
  )
  values (
    1,
    coalesce(p_enabled, true),
    coalesce(nullif(p_status, ''), 'opening_soon'),
    p_opening_at,
    coalesce(p_headline_en, ''),
    coalesce(p_headline_hr, ''),
    coalesce(p_announcement_en, ''),
    coalesce(p_announcement_hr, ''),
    nullif(p_hero_image_url, ''),
    now(),
    auth.uid()
  )
  on conflict (id) do update set
    enabled = excluded.enabled,
    status = excluded.status,
    opening_at = excluded.opening_at,
    headline_en = excluded.headline_en,
    headline_hr = excluded.headline_hr,
    announcement_en = excluded.announcement_en,
    announcement_hr = excluded.announcement_hr,
    hero_image_url = excluded.hero_image_url,
    updated_at = now(),
    updated_by = auth.uid()
  returning * into saved;

  return to_jsonb(saved);
end;
$$;

grant execute on function public.admin_save_opening_v608(
  boolean,text,timestamptz,text,text,text,text,text
) to authenticated;

commit;

select public.get_opening_public_v608() as opening_public_test;
