-- Langar Bar V5.1.2 — robust review credit + dynamic sushi catalogue/cancellation
begin;

alter table public.profiles add column if not exists langar_credit numeric(10,2) not null default 0;

create table if not exists public.sushi_catalog (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_hr text not null,
  description_en text,
  description_hr text,
  price numeric(10,2) not null default 0 check(price>=0),
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sushi_catalog enable row level security;
drop policy if exists sushi_catalog_public_read on public.sushi_catalog;
create policy sushi_catalog_public_read on public.sushi_catalog for select using (active=true or public.is_active_admin());
drop policy if exists sushi_catalog_admin_all on public.sushi_catalog;
create policy sushi_catalog_admin_all on public.sushi_catalog for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

insert into public.sushi_catalog(name_en,name_hr,description_en,description_hr,price,sort_order)
select * from (values
 ('Salmon Nigiri','Nigiri s lososom','2 pieces salmon nigiri','2 komada nigirija s lososom',4.50,10),
 ('Salmon Maki','Maki s lososom','8 pieces salmon maki','8 komada makija s lososom',8.50,20),
 ('Avocado Maki','Maki s avokadom','8 pieces avocado maki','8 komada makija s avokadom',7.50,30),
 ('California Roll','California Roll','8 pieces crab, avocado and cucumber','8 komada s rakom, avokadom i krastavcem',10.50,40),
 ('Philadelphia Roll','Philadelphia Roll','8 pieces salmon, cream cheese and cucumber','8 komada s lososom, krem sirom i krastavcem',11.50,50),
 ('Spicy Tuna Roll','Ljuti tuna roll','8 pieces spicy tuna roll','8 komada ljutog tuna rolla',12.00,60),
 ('Veggie Roll','Povrtni roll','8 pieces avocado, cucumber and carrot','8 komada s avokadom, krastavcem i mrkvom',8.50,70),
 ('Sushi Mix Box 16','Sushi Mix Box 16','Mixed selection of 16 pieces','Miješani izbor od 16 komada',19.90,80),
 ('Sushi Party Box 32','Sushi Party Box 32','Mixed party selection of 32 pieces','Miješani party izbor od 32 komada',36.90,90)
) v(name_en,name_hr,description_en,description_hr,price,sort_order)
where not exists(select 1 from public.sushi_catalog);

create or replace function public.customer_cancel_sushi_preorder_v512(p_preorder_id uuid)
returns public.sushi_preorders
language plpgsql security definer set search_path=public as $$
declare r public.sushi_preorders%rowtype;
begin
 select * into r from public.sushi_preorders where id=p_preorder_id and user_id=auth.uid() for update;
 if not found then raise exception 'Pre-order not found'; end if;
 if r.status not in ('pending','confirmed') then raise exception 'This pre-order can no longer be cancelled'; end if;
 update public.sushi_preorders set status='cancelled',updated_at=now() where id=p_preorder_id returning * into r;
 return r;
end $$;
grant execute on function public.customer_cancel_sushi_preorder_v512(uuid) to authenticated;

create or replace function public.admin_update_sushi_status_v512(p_preorder_id uuid,p_status text)
returns public.sushi_preorders
language plpgsql security definer set search_path=public as $$
declare r public.sushi_preorders%rowtype; s text:=lower(trim(p_status));
begin
 if not public.is_active_admin() then raise exception 'Not active admin'; end if;
 if s not in ('pending','confirmed','supplier_ordered','preparing','ready','served','delivered','cancelled','rejected') then raise exception 'Invalid status'; end if;
 update public.sushi_preorders set status=s,handled_by=auth.uid(),updated_at=now() where id=p_preorder_id returning * into r;
 if not found then raise exception 'Pre-order not found'; end if;
 if r.user_id is not null then
   insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
   values(r.user_id,'sushi','Sushi pre-order updated','Your sushi pre-order status is now: '||s,'Sushi rezervacija ažurirana','Status vaše sushi rezervacije je: '||s,jsonb_build_object('sushi_preorder_id',r.id,'status',s));
 end if;
 return r;
end $$;
grant execute on function public.admin_update_sushi_status_v512(uuid,text) to authenticated;

create or replace function public.admin_moderate_order_review_v512(p_review_id uuid,p_action text,p_reply text default null,p_coupon_amount numeric default null)
returns setof public.order_reviews
language plpgsql security definer set search_path=public as $$
declare
 a text:=lower(trim(coalesce(p_action,''))); rep text:=nullif(trim(coalesce(p_reply,'')),''); amount numeric(10,2):=greatest(coalesce(p_coupon_amount,0),0);
 r public.order_reviews%rowtype; code text;
begin
 if not public.is_active_admin() then raise exception 'Not active admin'; end if;
 select * into r from public.order_reviews where id=p_review_id for update;
 if not found then raise exception 'Review not found'; end if;
 if a not in ('approve_public','keep_private','reject','reply','send_coupon') then raise exception 'Unknown review action'; end if;
 if a='approve_public' then update public.order_reviews set status='approved_public',is_public=true,admin_reply=coalesce(rep,admin_reply),admin_action='approved_public',moderated_at=now(),moderated_by=auth.uid(),updated_at=now() where id=p_review_id;
 elsif a='keep_private' then update public.order_reviews set status='private',is_public=false,admin_reply=coalesce(rep,admin_reply),admin_action='kept_private',moderated_at=now(),moderated_by=auth.uid(),updated_at=now() where id=p_review_id;
 elsif a='reject' then update public.order_reviews set status='rejected',is_public=false,admin_reply=coalesce(rep,admin_reply),admin_action='rejected',moderated_at=now(),moderated_by=auth.uid(),updated_at=now() where id=p_review_id;
 elsif a='reply' then update public.order_reviews set admin_reply=coalesce(rep,admin_reply),admin_action='replied',moderated_at=now(),moderated_by=auth.uid(),updated_at=now() where id=p_review_id;
 else
   if amount<=0 then amount:=1.00; end if;
   if r.user_id is null then raise exception 'This review is not linked to a registered customer'; end if;
   update public.profiles set langar_credit=coalesce(langar_credit,0)+amount,updated_at=now() where id=r.user_id;
   if not found then raise exception 'Customer profile not found for this review'; end if;
   update public.order_reviews set admin_reply=coalesce(rep,admin_reply),coupon_amount=amount,credit_amount=amount,admin_action='coupon_credit_sent',moderated_at=now(),moderated_by=auth.uid(),updated_at=now() where id=p_review_id;
   code:='REVIEW-'||upper(substr(md5(gen_random_uuid()::text),1,8));
   begin
     insert into public.reward_cards(user_id,reward_type,title_en,title_hr,description_en,description_hr,qr_code,status,valid_until)
     values(r.user_id,'service_recovery_coupon','Review thank-you credit','Kredit za zahvalu na recenziji','€'||to_char(amount,'FM999990.00')||' Langar Credit was added to your account.','€'||to_char(amount,'FM999990.00')||' Langar Credit dodan je na vaš račun.',code,'active',now()+interval '30 days');
   exception when others then null; end;
   insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
   values(r.user_id,'wallet','Langar Credit added',coalesce(rep,'Thank you for your review. €'||to_char(amount,'FM999990.00')||' was added to your Langar Credit.'),'Langar Credit dodan',coalesce(rep,'Hvala na recenziji. €'||to_char(amount,'FM999990.00')||' dodan je na vaš Langar Credit.'),jsonb_build_object('review_id',p_review_id,'credit_amount',amount,'code',code));
 end if;
 if rep is not null and r.user_id is not null and a<>'send_coupon' then
   insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data) values(r.user_id,'review_reply','Langar Bar reply to your review',rep,'Odgovor Langar Bara na vašu recenziju',rep,jsonb_build_object('review_id',p_review_id,'action',a));
 end if;
 return query select * from public.order_reviews where id=p_review_id;
end $$;
grant execute on function public.admin_moderate_order_review_v512(uuid,text,text,numeric) to authenticated;

commit;
