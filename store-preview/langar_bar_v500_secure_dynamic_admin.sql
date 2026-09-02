-- Langar Bar V5.0.0: secure welcome reward, dynamic CMS/admin foundation, audit log.
create extension if not exists pgcrypto;

alter table public.profiles add column if not exists welcome_reward_claimed_at timestamptz;
alter table public.profiles add column if not exists install_id text;
alter table public.profiles add column if not exists account_status text not null default 'active';

create table if not exists public.welcome_reward_claims(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 normalized_phone text not null, install_id text not null, reward_card_id uuid,
 claimed_at timestamptz not null default now(), redeemed_at timestamptz,
 unique(user_id), unique(normalized_phone), unique(install_id)
);
alter table public.welcome_reward_claims enable row level security;
revoke all on public.welcome_reward_claims from anon, authenticated;

-- Customers may read cards but may not create or redeem them directly.
drop policy if exists reward_cards_insert_welcome_own on public.reward_cards;
drop policy if exists reward_cards_update_own on public.reward_cards;
revoke insert, update, delete on public.reward_cards from authenticated;
grant select on public.reward_cards to authenticated;

create or replace function public.claim_welcome_espresso_v500(p_phone text,p_install_id text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare v_uid uuid:=auth.uid(); v_phone text; v_card uuid; v_email_confirmed timestamptz;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select email_confirmed_at into v_email_confirmed from auth.users where id=v_uid;
 if v_email_confirmed is null then raise exception 'Confirm email before claiming reward'; end if;
 v_phone:=regexp_replace(coalesce(p_phone,''),'[^0-9+]','','g');
 if length(v_phone)<9 or length(coalesce(p_install_id,''))<16 then raise exception 'Valid phone and device are required'; end if;
 if exists(select 1 from public.welcome_reward_claims where user_id=v_uid or normalized_phone=v_phone or install_id=p_install_id) then
   return jsonb_build_object('ok',true,'already_claimed',true);
 end if;
 insert into public.reward_cards(user_id,reward_type,title_en,title_hr,description_en,description_hr,qr_code,status,valid_until)
 values(v_uid,'welcome_espresso','Free Espresso Card','Besplatni espresso','One verified member, one espresso. Staff redemption only.','Jedan potvrđeni član, jedan espresso. Iskorištava osoblje.',upper(encode(gen_random_bytes(8),'hex')),'active',now()+interval '90 days') returning id into v_card;
 insert into public.welcome_reward_claims(user_id,normalized_phone,install_id,reward_card_id) values(v_uid,v_phone,p_install_id,v_card);
 update public.profiles set welcome_reward_claimed_at=now(),install_id=p_install_id,phone=v_phone,updated_at=now() where id=v_uid;
 insert into public.inbox_messages(user_id,type,title_en,body_en,title_hr,body_hr,data)
 values(v_uid,'reward','Free Espresso Card','Your verified one-time espresso card is ready. Staff must scan it.','Besplatni espresso','Vaša jednokratna kartica je spremna. Osoblje je mora skenirati.',jsonb_build_object('reward_card_id',v_card,'campaign_key','welcome_espresso_v500'));
 return jsonb_build_object('ok',true,'card_id',v_card);
exception when unique_violation then return jsonb_build_object('ok',true,'already_claimed',true); end $$;
grant execute on function public.claim_welcome_espresso_v500(text,text) to authenticated;

create table if not exists public.app_settings(key text primary key,value jsonb not null default '{}'::jsonb,is_public boolean not null default true,updated_at timestamptz default now(),updated_by uuid);
create table if not exists public.content_blocks(id uuid primary key default gen_random_uuid(),section_key text not null,locale text not null default 'en',title text,body text,image_url text,cta_label text,cta_url text,sort_order int default 0,is_active boolean default true,starts_at timestamptz,ends_at timestamptz,updated_at timestamptz default now(),updated_by uuid,unique(section_key,locale,sort_order));
create table if not exists public.coupons(id uuid primary key default gen_random_uuid(),code text unique not null,discount_type text not null check(discount_type in('percent','fixed','free_item')),discount_value numeric default 0,free_item_id text,min_order numeric default 0,max_uses int,total_uses int default 0,max_uses_per_user int default 1,starts_at timestamptz,ends_at timestamptz,is_active boolean default true,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.admin_audit_log(id bigserial primary key,admin_user_id uuid,action text not null,entity_type text not null,entity_id text,before_data jsonb,after_data jsonb,created_at timestamptz default now());

alter table public.app_settings enable row level security; alter table public.content_blocks enable row level security; alter table public.coupons enable row level security; alter table public.admin_audit_log enable row level security;
create policy app_settings_public_read on public.app_settings for select using(is_public=true);
create policy content_blocks_public_read on public.content_blocks for select using(is_active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()));
-- Existing admin RPC/role system should be used for writes. Do not add broad authenticated write policies.
