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

create or replace function public.get_opening_public_v606()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(o)
  from public.opening_management o
  where o.id = 1
  limit 1;
$$;

grant execute on function public.get_opening_public_v606() to anon, authenticated;

commit;

select public.get_opening_public_v606() as opening_public_test;
