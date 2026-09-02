-- Langar Bar V5.4.2 — reliable suggested answers + customer deletion
-- Safe to run repeatedly after V5.4.1 recovery SQL succeeded.

create or replace function public.list_suggested_barista_questions_v542(p_lang text default 'en',p_limit integer default 50)
returns table(faq_id uuid,question text,category text)
language sql stable security definer set search_path=public as $$
 select id,case when p_lang='hr' then question_hr else question_en end,category
 from public.langar_knowledge_faqs
 where active
 order by sort_order,question_en
 limit greatest(1,least(coalesce(p_limit,50),50))
$$;
grant execute on function public.list_suggested_barista_questions_v542(text,integer) to authenticated,anon;

create or replace function public.answer_suggested_barista_question_v542(p_faq_id uuid,p_lang text default 'en')
returns jsonb language plpgsql security definer set search_path=public as $$
declare f public.langar_knowledge_faqs; u auth.users; qid uuid; q text; a text;
begin
 select * into f from public.langar_knowledge_faqs where id=p_faq_id and active=true;
 if f.id is null then raise exception 'Suggested question not found'; end if;
 q:=case when p_lang='hr' then f.question_hr else f.question_en end;
 a:=case when p_lang='hr' then f.answer_hr else f.answer_en end;
 select * into u from auth.users where id=auth.uid();
 if u.id is not null then
   insert into public.barista_questions(user_id,customer_email,subject,question,status,admin_reply,answer_source,answered_at,created_at,updated_at)
   values(u.id,u.email,'Popular question',q,'answered',a,'knowledge',now(),now(),now()) returning id into qid;
 end if;
 return jsonb_build_object('matched',true,'question_id',qid,'question',q,'answer',a,'category',f.category);
end$$;
grant execute on function public.answer_suggested_barista_question_v542(uuid,text) to authenticated,anon;

create or replace function public.smart_barista_ask_v542(p_question text,p_subject text default 'Drink question',p_lang text default 'en')
returns jsonb language plpgsql security definer set search_path=public as $$
declare u auth.users; k public.langar_knowledge_entries; f public.langar_knowledge_faqs; qid uuid; sensitive boolean; t text; ans text; r jsonb; title text;
begin
 select * into u from auth.users where id=auth.uid(); if u.id is null then raise exception 'Authentication required'; end if;
 t:=public.langar_normalize_v541(p_question);
 sensitive:=t ~ '(allerg|alerg|anaphyl|celiac|gluten|diabet|pregnan|trudn|medical|medicine|lijek|secer|šećer|blood pressure|heart condition)';
 select * into f from public.find_knowledge_faq_v541(p_question,p_lang) limit 1;
 select * into k from public.find_knowledge_entry_v541(p_question) limit 1;
 if sensitive and (f.id is null or f.category<>'sensitive') then
   insert into public.barista_questions(user_id,customer_email,subject,question,status,answer_source,created_at,updated_at)
   values(u.id,u.email,p_subject,p_question,'new','human',now(),now()) returning id into qid;
   return jsonb_build_object('matched',false,'question_id',qid,'sensitive',true);
 end if;
 if f.id is not null then
   ans:=case when p_lang='hr' then f.answer_hr else f.answer_en end;
   title:=case when p_lang='hr' then f.question_hr else f.question_en end;
   r:=jsonb_build_object('recipe','{}'::jsonb);
 elsif k.id is not null then
   title:=case when p_lang='hr' then k.name_hr else k.name_en end;
   if t ~ '(milk|mlijeko)' then ans:=format('%s typically contains about %s ml milk and %s ml foam in a %s ml serving. Recipe values can vary; the published Langar Bar house recipe takes priority.',k.name_en,coalesce(k.recipe->>'milk_ml','0'),coalesce(k.recipe->>'foam_ml','0'),coalesce(k.recipe->>'cup_ml','—'));
   elsif t ~ '(water|voda)' then ans:=format('%s typically contains about %s ml added water, with an espresso yield of about %s ml.',k.name_en,coalesce(k.recipe->>'water_ml','0'),coalesce(k.recipe->>'espresso_ml','0'));
   elsif t ~ '(caffeine|kofein)' then ans:=format('%s typically contains about %s–%s mg caffeine. The actual amount varies by bean, dose and extraction.',k.name_en,coalesce(k.recipe->>'caffeine_mg_min','—'),coalesce(k.recipe->>'caffeine_mg_max','—'));
   elsif t ~ '(calorie|kalor)' then ans:=format('%s is typically about %s–%s kcal before optional sugar, syrup or toppings. The actual Langar Bar recipe takes priority.',k.name_en,coalesce(k.recipe->>'calories_min','—'),coalesce(k.recipe->>'calories_max','—'));
   else ans:=case when p_lang='hr' then k.summary_hr||E'\n\n'||coalesce(k.details_hr,'') else k.summary_en||E'\n\n'||coalesce(k.details_en,'') end; end if;
   r:=to_jsonb(k);
 else
   insert into public.barista_questions(user_id,customer_email,subject,question,status,answer_source,created_at,updated_at)
   values(u.id,u.email,p_subject,p_question,'new','human',now(),now()) returning id into qid;
   return jsonb_build_object('matched',false,'question_id',qid,'sensitive',false);
 end if;
 insert into public.barista_questions(user_id,customer_email,subject,question,status,admin_reply,answer_source,matched_knowledge_id,answered_at,created_at,updated_at)
 values(u.id,u.email,p_subject,p_question,'answered',ans,'knowledge',k.id,now(),now(),now()) returning id into qid;
 return jsonb_build_object('matched',true,'question_id',qid,'title',title,'answer',ans,'knowledge',r);
end$$;
grant execute on function public.smart_barista_ask_v542(text,text,text) to authenticated;

create or replace function public.delete_my_barista_question_v542(p_question_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 delete from public.barista_questions
 where id=p_question_id
   and (user_id=auth.uid() or lower(customer_email)=lower(coalesce(auth.jwt()->>'email','')));
 get diagnostics n=row_count;
 return n>0;
end$$;
grant execute on function public.delete_my_barista_question_v542(uuid) to authenticated;

-- Verification (should return without errors)
select count(*) as suggested_count from public.list_suggested_barista_questions_v542('en',50);
