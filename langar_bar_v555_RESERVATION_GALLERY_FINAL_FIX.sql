begin;
create extension if not exists pgcrypto;
create table if not exists public.reservations(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 customer_name text not null,phone text not null,reservation_date date not null,reservation_time time not null,
 guests int not null check(guests between 1 and 30),area text default 'inside',occasion text,high_chair boolean default false,
 note text,status text not null default 'pending',admin_note text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.reservations enable row level security;
drop policy if exists reservation_own_or_admin_read_v555 on public.reservations;
create policy reservation_own_or_admin_read_v555 on public.reservations for select to authenticated using(
 user_id=auth.uid() or exists(select 1 from public.admin_members a where a.user_id=auth.uid() and a.active)
);
create or replace function public.customer_create_reservation_v554(p_date date,p_time time,p_name text,p_phone text,p_guests int,p_area text default 'inside',p_occasion text default '',p_high_chair boolean default false,p_note text default '')
returns uuid language plpgsql security definer set search_path=public as $$declare rid uuid;begin
 if auth.uid() is null then raise exception 'Login required';end if;
 insert into reservations(user_id,customer_name,phone,reservation_date,reservation_time,guests,area,occasion,high_chair,note,status)
 values(auth.uid(),trim(p_name),trim(p_phone),p_date,p_time,p_guests,coalesce(nullif(trim(p_area),''),'inside'),nullif(trim(p_occasion),''),coalesce(p_high_chair,false),nullif(trim(p_note),''),'pending') returning id into rid;
 return rid;
exception when unique_violation then raise exception 'This time is already reserved';end$$;
grant execute on function public.customer_create_reservation_v554(date,time,text,text,int,text,text,boolean,text) to authenticated;
-- Compatibility function for the older V5.2 listener still cached on some devices.
create or replace function public.customer_create_reservation_v520(p_date date,p_guests integer,p_name text,p_note text,p_phone text,p_time time)
returns uuid language sql security definer set search_path=public as $$
 select public.customer_create_reservation_v554(p_date,p_time,p_name,p_phone,p_guests,'inside','',false,p_note);
$$;
grant execute on function public.customer_create_reservation_v520(date,integer,text,text,text,time) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('langar-gallery','langar-gallery',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
do $$begin begin alter publication supabase_realtime add table public.reservations;exception when duplicate_object then null;end;end$$;
commit;
select to_regprocedure('public.customer_create_reservation_v520(date,integer,text,text,text,time)') is not null as legacy_reservation_ready,
       to_regprocedure('public.customer_create_reservation_v554(date,time without time zone,text,text,integer,text,text,boolean,text)') is not null as current_reservation_ready,
       exists(select 1 from storage.buckets where id='langar-gallery' and public=true) as gallery_bucket_ready;
