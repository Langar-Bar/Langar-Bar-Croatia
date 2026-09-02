-- Langar Bar V5.5.2 Dynamic Gallery Categories + Product Photos
create extension if not exists pgcrypto;

create table if not exists public.gallery_categories(
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 title_en text not null,
 title_hr text,
 sort_order integer default 0,
 active boolean default true,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

alter table public.gallery_items add column if not exists photo_role text default 'gallery' check(photo_role in ('gallery','product','both'));
alter table public.gallery_items add column if not exists image_fit text default 'cover' check(image_fit in ('cover','contain'));

create table if not exists public.menu_item_media(
 id uuid primary key default gen_random_uuid(),
 menu_item_id text not null unique,
 image_url text not null,
 storage_path text,
 image_fit text default 'cover' check(image_fit in ('cover','contain')),
 active boolean default true,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

alter table public.gallery_categories enable row level security;
alter table public.menu_item_media enable row level security;
drop policy if exists "gallery categories public read" on public.gallery_categories;
create policy "gallery categories public read" on public.gallery_categories for select using(active or exists(select 1 from public.admin_members a where a.user_id=auth.uid() and a.active));
drop policy if exists "menu media public read" on public.menu_item_media;
create policy "menu media public read" on public.menu_item_media for select using(active or exists(select 1 from public.admin_members a where a.user_id=auth.uid() and a.active));

grant select on public.gallery_categories to anon,authenticated;
grant select on public.menu_item_media to anon,authenticated;

create or replace function public.admin_upsert_gallery_category_v552(p_slug text,p_title_en text,p_title_hr text,p_sort_order integer,p_active boolean)
returns uuid language plpgsql security definer set search_path=public as $$declare v_id uuid;begin
 if not exists(select 1 from public.admin_members where user_id=auth.uid() and active) then raise exception 'Admin access required';end if;
 insert into public.gallery_categories(slug,title_en,title_hr,sort_order,active,updated_at)
 values(lower(trim(p_slug)),trim(p_title_en),trim(p_title_hr),coalesce(p_sort_order,0),coalesce(p_active,true),now())
 on conflict(slug) do update set title_en=excluded.title_en,title_hr=excluded.title_hr,sort_order=excluded.sort_order,active=excluded.active,updated_at=now()
 returning id into v_id;return v_id;end$$;

create or replace function public.admin_delete_gallery_category_v552(p_id uuid)
returns void language plpgsql security definer set search_path=public as $$begin
 if not exists(select 1 from public.admin_members where user_id=auth.uid() and active) then raise exception 'Admin access required';end if;
 delete from public.gallery_categories where id=p_id;end$$;

create or replace function public.admin_create_gallery_item_v552(
 p_image_url text,p_storage_path text,p_title_en text,p_title_hr text,p_caption_en text,p_caption_hr text,p_category text,p_menu_category_id text,p_menu_item_id text,p_sort_order integer,p_active boolean,p_photo_role text,p_image_fit text)
returns uuid language plpgsql security definer set search_path=public as $$declare v_id uuid;begin
 if not exists(select 1 from public.admin_members where user_id=auth.uid() and active) then raise exception 'Admin access required';end if;
 if p_photo_role in ('product','both') and coalesce(trim(p_menu_item_id),'')='' then raise exception 'A specific menu item is required for a product photo';end if;
 insert into public.gallery_items(image_url,storage_path,title_en,title_hr,caption_en,caption_hr,category,menu_category_id,menu_item_id,sort_order,active,photo_role,image_fit,updated_at)
 values(p_image_url,p_storage_path,p_title_en,p_title_hr,p_caption_en,p_caption_hr,p_category,p_menu_category_id,p_menu_item_id,coalesce(p_sort_order,0),coalesce(p_active,true),coalesce(p_photo_role,'gallery'),coalesce(p_image_fit,'cover'),now()) returning id into v_id;
 if p_photo_role in ('product','both') then
  insert into public.menu_item_media(menu_item_id,image_url,storage_path,image_fit,active,updated_at)
  values(p_menu_item_id,p_image_url,p_storage_path,coalesce(p_image_fit,'cover'),true,now())
  on conflict(menu_item_id) do update set image_url=excluded.image_url,storage_path=excluded.storage_path,image_fit=excluded.image_fit,active=true,updated_at=now();
 end if;
 return v_id;end$$;

create or replace function public.admin_delete_gallery_item_v552(p_id uuid)
returns void language plpgsql security definer set search_path=public as $$declare v_item text;v_url text;begin
 if not exists(select 1 from public.admin_members where user_id=auth.uid() and active) then raise exception 'Admin access required';end if;
 select menu_item_id,image_url into v_item,v_url from public.gallery_items where id=p_id;
 delete from public.gallery_items where id=p_id;
 if v_item is not null then delete from public.menu_item_media where menu_item_id=v_item and image_url=v_url;end if;
end$$;

grant execute on function public.admin_upsert_gallery_category_v552(text,text,text,integer,boolean) to authenticated;
grant execute on function public.admin_delete_gallery_category_v552(uuid) to authenticated;
grant execute on function public.admin_create_gallery_item_v552(text,text,text,text,text,text,text,text,text,integer,boolean,text,text) to authenticated;
grant execute on function public.admin_delete_gallery_item_v552(uuid) to authenticated;

insert into public.gallery_categories(slug,title_en,title_hr,sort_order,active) values
('food','Food','Hrana',10,true),('drinks','Drinks','Pića',20,true),('desserts','Desserts','Deserti',30,true),('interior','Interior','Interijer',40,true),('events','Events','Događaji',50,true)
on conflict(slug) do nothing;
