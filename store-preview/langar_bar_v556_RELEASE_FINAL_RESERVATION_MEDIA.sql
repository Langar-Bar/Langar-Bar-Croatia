begin;
create extension if not exists pgcrypto;

create table if not exists public.restaurant_tables(
 id uuid primary key default gen_random_uuid(),
 label text not null unique,
 area text not null default 'inside',
 capacity int not null check(capacity between 1 and 30),
 active boolean not null default true,
 sort_order int not null default 10,
 created_at timestamptz not null default now()
);
insert into public.restaurant_tables(label,area,capacity,sort_order) values
('Inside T1','inside',2,10),('Inside T2','inside',2,20),('Inside T3','inside',4,30),('Inside T4','inside',4,40),('Inside T5','inside',6,50),('Inside T6','inside',8,60),
('Terrace T1','terrace',2,110),('Terrace T2','terrace',2,120),('Terrace T3','terrace',4,130),('Terrace T4','terrace',4,140),('Terrace T5','terrace',6,150),('Terrace T6','terrace',8,160)
on conflict(label) do nothing;

alter table public.reservations add column if not exists table_id uuid references public.restaurant_tables(id) on delete set null;
alter table public.reservations add column if not exists table_label text;
alter table public.reservations add column if not exists duration_minutes int not null default 90;
alter table public.reservations add column if not exists auto_confirmed boolean not null default false;
alter table public.reservations add column if not exists admin_note text;
alter table public.reservations add column if not exists updated_at timestamptz not null default now();

drop index if exists public.reservations_active_slot_uq;
create index if not exists reservations_date_time_status_idx on public.reservations(reservation_date,reservation_time,status);

create or replace function public.customer_create_reservation_v556(
 p_date date,p_time time,p_name text,p_phone text,p_guests int,p_area text default 'any',p_note text default ''
) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.restaurant_tables; rid uuid; alt jsonb; requested_ts timestamp; overlap_count int;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if p_date < current_date then raise exception 'Reservation date is in the past'; end if;
 if p_guests < 1 or p_guests > 30 then raise exception 'Invalid guest count'; end if;
 requested_ts:=p_date+p_time;
 select rt.* into t from restaurant_tables rt
 where rt.active and rt.capacity>=p_guests and (p_area='any' or rt.area=p_area)
 and not exists(
   select 1 from reservations r where r.table_id=rt.id and r.status in('pending','confirmed')
   and tsrange(r.reservation_date+r.reservation_time, r.reservation_date+r.reservation_time + make_interval(mins=>coalesce(r.duration_minutes,90)),'[)')
       && tsrange(requested_ts,requested_ts+interval '90 minutes','[)')
 ) order by rt.capacity asc,rt.sort_order asc limit 1;
 if t.id is null then
   select coalesce(jsonb_agg(x order by x->>'date',x->>'time'),'[]'::jsonb) into alt from(
    select jsonb_build_object('date',d::date,'time',tm::time,'area',a.area) x
    from generate_series(p_date,p_date+2,interval '1 day') d
    cross join (values(time '10:00'),(time '12:00'),(time '14:00'),(time '16:00'),(time '18:00'),(time '20:00')) s(tm)
    cross join lateral(select rt.area from restaurant_tables rt where rt.active and rt.capacity>=p_guests and not exists(
      select 1 from reservations r where r.table_id=rt.id and r.status in('pending','confirmed')
      and tsrange(r.reservation_date+r.reservation_time,r.reservation_date+r.reservation_time+make_interval(mins=>coalesce(r.duration_minutes,90)),'[)') && tsrange(d::date+tm,d::date+tm+interval '90 minutes','[)')
    ) order by rt.capacity limit 1) a limit 5
   ) q;
   return jsonb_build_object('status','unavailable','message','The selected time is full. Please choose one of the suggested alternatives.','alternatives',alt);
 end if;
 insert into reservations(user_id,customer_name,phone,reservation_date,reservation_time,guests,area,note,status,table_id,table_label,duration_minutes,auto_confirmed,updated_at)
 values(auth.uid(),trim(p_name),trim(p_phone),p_date,p_time,p_guests,t.area,nullif(trim(p_note),''),'confirmed',t.id,t.label,90,true,now()) returning id into rid;
 insert into inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data,created_at,is_read,is_deleted)
 values(auth.uid(),'reservation','Reservation confirmed',format('Your reservation for %s at %s is confirmed. Table: %s.',p_date,to_char(p_time,'HH24:MI'),t.label),'Rezervacija potvrđena',format('Vaša rezervacija za %s u %s je potvrđena. Stol: %s.',p_date,to_char(p_time,'HH24:MI'),t.label),jsonb_build_object('reservation_id',rid,'status','confirmed'),now(),false,false);
 return jsonb_build_object('status','confirmed','reservation_id',rid,'table',t.label,'message',format('Reservation confirmed automatically. Your table is %s.',t.label));
end$$;
grant execute on function public.customer_create_reservation_v556(date,time,text,text,int,text,text) to authenticated;

create or replace function public.admin_update_reservation_v556(p_id uuid,p_status text,p_note text default '')
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.reservations; msg_en text; msg_hr text;
begin
 if not exists(select 1 from admin_members a where a.user_id=auth.uid() and a.active) then raise exception 'Admin required';end if;
 if p_status not in('pending','confirmed','rejected','cancelled','completed','no_show') then raise exception 'Invalid status';end if;
 update reservations set status=p_status,admin_note=nullif(trim(p_note),''),updated_at=now() where id=p_id returning * into r;
 if r.id is null then raise exception 'Reservation not found';end if;
 msg_en:=format('Your reservation for %s at %s is now %s.%s',r.reservation_date,to_char(r.reservation_time,'HH24:MI'),p_status,case when coalesce(trim(p_note),'')<>'' then ' '||trim(p_note) else '' end);
 msg_hr:=format('Vaša rezervacija za %s u %s sada je: %s.%s',r.reservation_date,to_char(r.reservation_time,'HH24:MI'),p_status,case when coalesce(trim(p_note),'')<>'' then ' '||trim(p_note) else '' end);
 insert into inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data,created_at,is_read,is_deleted)
 values(r.user_id,'reservation','Reservation update',msg_en,'Ažuriranje rezervacije',msg_hr,jsonb_build_object('reservation_id',r.id,'status',p_status),now(),false,false);
 return jsonb_build_object('ok',true,'message','Reservation updated and customer notified.');
end$$;
grant execute on function public.admin_update_reservation_v556(uuid,text,text) to authenticated;

create table if not exists public.gallery_items(
 id uuid primary key default gen_random_uuid(),image_url text not null,storage_path text,title_en text,title_hr text,category text,
 menu_category_id uuid,menu_item_id uuid,sort_order int default 10,active boolean default true,photo_role text default 'gallery',created_at timestamptz default now(),updated_at timestamptz default now()
);
create table if not exists public.menu_item_media(
 id uuid primary key default gen_random_uuid(),menu_item_id uuid not null unique,image_url text not null,storage_path text,image_fit text default 'cover',active boolean default true,updated_at timestamptz default now()
);
alter table public.menu_item_media add column if not exists active boolean default true;
alter table public.menu_item_media add column if not exists image_fit text default 'cover';
alter table public.gallery_items enable row level security;
alter table public.menu_item_media enable row level security;
drop policy if exists gallery_public_read_v556 on public.gallery_items;
create policy gallery_public_read_v556 on public.gallery_items for select using(active=true or exists(select 1 from admin_members a where a.user_id=auth.uid() and a.active));
drop policy if exists menu_media_public_read_v556 on public.menu_item_media;
create policy menu_media_public_read_v556 on public.menu_item_media for select using(active=true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('langar-gallery','langar-gallery',true,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

do $$begin begin alter publication supabase_realtime add table public.reservations;exception when duplicate_object then null;end;begin alter publication supabase_realtime add table public.gallery_items;exception when duplicate_object then null;end;begin alter publication supabase_realtime add table public.menu_item_media;exception when duplicate_object then null;end;end$$;
commit;
select to_regprocedure('public.customer_create_reservation_v556(date,time without time zone,text,text,integer,text,text)') is not null as reservation_ready,
       to_regprocedure('public.admin_update_reservation_v556(uuid,text,text)') is not null as admin_reservation_ready,
       exists(select 1 from storage.buckets where id='langar-gallery' and public) as gallery_ready;
