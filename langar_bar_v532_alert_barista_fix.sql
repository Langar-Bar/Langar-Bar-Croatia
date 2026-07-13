-- Langar Bar V5.3.2 — reliable Barista Question RPC and schema compatibility
create table if not exists public.barista_questions(id uuid primary key default gen_random_uuid());
alter table public.barista_questions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.barista_questions add column if not exists customer_name text;
alter table public.barista_questions add column if not exists customer_email text;
alter table public.barista_questions add column if not exists customer_phone text;
alter table public.barista_questions add column if not exists subject text;
alter table public.barista_questions add column if not exists question text;
alter table public.barista_questions add column if not exists status text default 'new';
alter table public.barista_questions add column if not exists admin_reply text;
alter table public.barista_questions add column if not exists answered_at timestamptz;
alter table public.barista_questions add column if not exists answered_by uuid references auth.users(id) on delete set null;
alter table public.barista_questions add column if not exists created_at timestamptz default now();
alter table public.barista_questions add column if not exists updated_at timestamptz default now();
update public.barista_questions set status='new' where status is null;
alter table public.barista_questions alter column status set default 'new';
alter table public.barista_questions enable row level security;
grant select,insert,update on public.barista_questions to authenticated;
drop policy if exists barista_insert_own_v531 on public.barista_questions;
drop policy if exists barista_insert_own_v532 on public.barista_questions;
create policy barista_insert_own_v532 on public.barista_questions for insert to authenticated with check(user_id=auth.uid());
drop policy if exists barista_select_own_admin_v531 on public.barista_questions;
drop policy if exists barista_select_own_admin_v532 on public.barista_questions;
create policy barista_select_own_admin_v532 on public.barista_questions for select to authenticated using(user_id=auth.uid() or public.is_active_admin());
drop policy if exists barista_update_admin_v531 on public.barista_questions;
drop policy if exists barista_update_admin_v532 on public.barista_questions;
create policy barista_update_admin_v532 on public.barista_questions for update to authenticated using(public.is_active_admin()) with check(public.is_active_admin());
do $$ begin alter publication supabase_realtime add table public.barista_questions; exception when duplicate_object then null; end $$;
create or replace function public.customer_submit_barista_question_v532(p_subject text,p_question text,p_customer_name text default null,p_customer_phone text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_email text;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if nullif(trim(coalesce(p_question,'')),'') is null then raise exception 'Question is required'; end if;
 select email into v_email from auth.users where id=auth.uid();
 insert into public.barista_questions(user_id,customer_name,customer_email,customer_phone,subject,question,status,created_at,updated_at)
 values(auth.uid(),nullif(trim(coalesce(p_customer_name,'')),''),v_email,nullif(trim(coalesce(p_customer_phone,'')),''),coalesce(nullif(trim(coalesce(p_subject,'')),''),'Barista question'),trim(p_question),'new',now(),now()) returning id into v_id;
 return v_id;
end$$;
grant execute on function public.customer_submit_barista_question_v532(text,text,text,text) to authenticated;
create or replace function public.admin_list_barista_questions_v532(p_limit integer default 200)
returns setof public.barista_questions language plpgsql security definer set search_path=public as $$
begin if not public.is_active_admin() then raise exception 'Admin required'; end if;
return query select * from public.barista_questions order by case status when 'new' then 0 when 'answered' then 1 else 2 end, created_at desc limit greatest(1,least(p_limit,500)); end$$;
grant execute on function public.admin_list_barista_questions_v532(integer) to authenticated;
create or replace function public.admin_answer_barista_question_v532(p_id uuid,p_reply text,p_status text default 'answered')
returns void language plpgsql security definer set search_path=public as $$
declare q public.barista_questions;
begin if not public.is_active_admin() then raise exception 'Admin required'; end if;
update public.barista_questions set admin_reply=case when nullif(trim(coalesce(p_reply,'')),'') is null then admin_reply else trim(p_reply) end,status=coalesce(nullif(trim(p_status),''),'answered'),answered_at=case when p_status='answered' then now() else answered_at end,answered_by=auth.uid(),updated_at=now() where id=p_id returning * into q;
if q.id is null then raise exception 'Question not found'; end if;
if q.user_id is not null and nullif(trim(coalesce(p_reply,'')),'') is not null then
 insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
 values(q.user_id,'barista_reply','Your barista answered',trim(p_reply),'Odgovor bariste',trim(p_reply),jsonb_build_object('barista_question_id',q.id,'priority','important'));
end if; end$$;
grant execute on function public.admin_answer_barista_question_v532(uuid,text,text) to authenticated;
