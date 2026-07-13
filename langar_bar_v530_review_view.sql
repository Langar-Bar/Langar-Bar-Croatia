-- Langar Bar V5.3.0: public reviews always include reviewed product name
create or replace view public.public_reviews_v530 as
select
  r.id,
  coalesce(i.rating,r.overall_rating,5)::int as rating,
  coalesce(nullif(i.comment,''),nullif(r.comment,''),'') as comment,
  coalesce(nullif(i.item_name_en,''),nullif(i.item_name_hr,''),'Langar Bar order') as item_name,
  coalesce(nullif(r.customer_name,''),'Langar guest') as customer_name,
  coalesce(r.moderated_at,r.created_at) as published_at
from public.order_reviews r
left join lateral (
  select x.rating,x.comment,x.item_name_en,x.item_name_hr
  from public.order_review_items x
  where x.review_id=r.id
  order by x.created_at asc
  limit 1
) i on true
where coalesce(r.is_public,false)=true and r.status='approved_public';
grant select on public.public_reviews_v530 to anon,authenticated;
