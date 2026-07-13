-- Langar Bar V5.3.1 operational fixes
create table if not exists public.barista_questions(
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 customer_name text, customer_email text, customer_phone text, subject text, question text not null,
 status text not null default 'new', admin_reply text, answered_at timestamptz, answered_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.barista_questions enable row level security;
grant select,insert,update on public.barista_questions to authenticated;
drop policy if exists barista_insert_own_v531 on public.barista_questions;
create policy barista_insert_own_v531 on public.barista_questions for insert to authenticated with check(user_id=auth.uid());
drop policy if exists barista_select_own_admin_v531 on public.barista_questions;
create policy barista_select_own_admin_v531 on public.barista_questions for select to authenticated using(user_id=auth.uid() or public.is_active_admin());
drop policy if exists barista_update_admin_v531 on public.barista_questions;
create policy barista_update_admin_v531 on public.barista_questions for update to authenticated using(public.is_active_admin()) with check(public.is_active_admin());

do $$ begin alter publication supabase_realtime add table public.barista_questions; exception when duplicate_object then null; end $$;

create or replace function public.admin_list_barista_questions_v531(p_limit integer default 200)
returns setof public.barista_questions language plpgsql security definer set search_path=public as $$
begin if not public.is_active_admin() then raise exception 'Admin required'; end if;
return query select * from public.barista_questions order by case status when 'new' then 0 when 'answered' then 1 else 2 end, created_at desc limit greatest(1,least(p_limit,500)); end$$;
grant execute on function public.admin_list_barista_questions_v531(integer) to authenticated;

create or replace function public.admin_answer_barista_question_v531(p_id uuid,p_reply text,p_status text default 'answered')
returns void language plpgsql security definer set search_path=public as $$
declare q public.barista_questions;
begin if not public.is_active_admin() then raise exception 'Admin required'; end if;
update public.barista_questions set admin_reply=case when nullif(trim(p_reply),'') is null then admin_reply else trim(p_reply) end,status=p_status,answered_at=case when p_status='answered' then now() else answered_at end,answered_by=auth.uid(),updated_at=now() where id=p_id returning * into q;
if q.id is null then raise exception 'Question not found'; end if;
if q.user_id is not null and nullif(trim(p_reply),'') is not null then
 insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
 values(q.user_id,'barista_reply','Your barista answered',trim(p_reply),'Odgovor bariste',trim(p_reply),jsonb_build_object('barista_question_id',q.id,'priority','important'));
end if; end$$;
grant execute on function public.admin_answer_barista_question_v531(uuid,text,text) to authenticated;

create or replace view public.public_reviews_v531 as
select r.id,coalesce(i.rating,r.overall_rating,5)::int rating,
 coalesce(nullif(i.comment,''),nullif(r.comment,''),'') comment,
 coalesce(nullif(i.item_name_en,''),nullif(i.item_name_hr,''),'Langar Bar order') item_name,
 coalesce(nullif(r.customer_name,''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),'Langar guest') customer_name,
 coalesce(r.moderated_at,r.created_at) published_at
from public.order_reviews r
left join public.profiles p on p.id=r.user_id
left join lateral(select x.rating,x.comment,x.item_name_en,x.item_name_hr from public.order_review_items x where x.review_id=r.id order by x.created_at asc limit 1)i on true
where coalesce(r.is_public,false)=true and r.status='approved_public';
grant select on public.public_reviews_v531 to anon,authenticated;

create or replace function public.get_my_review_v531(p_review_id uuid)
returns table(id uuid,comment text,overall_rating integer,status text) language sql security definer set search_path=public as $$
select r.id,r.comment,r.overall_rating,r.status from public.order_reviews r where r.id=p_review_id and r.user_id=auth.uid();$$;
grant execute on function public.get_my_review_v531(uuid) to authenticated;

create or replace function public.customer_update_review_v531(p_review_id uuid,p_comment text,p_overall_rating integer)
returns void language plpgsql security definer set search_path=public as $$
begin if p_overall_rating not between 1 and 5 then raise exception 'Rating must be 1 to 5'; end if;
update public.order_reviews set comment=trim(coalesce(p_comment,'')),overall_rating=p_overall_rating,status='pending',is_public=false,admin_action='customer_edited',updated_at=now(),moderated_at=null,moderated_by=null where id=p_review_id and user_id=auth.uid();
if not found then raise exception 'Review not found'; end if; end$$;
grant execute on function public.customer_update_review_v531(uuid,text,integer) to authenticated;
