begin;
create table if not exists public.langar_settings(
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.langar_settings enable row level security;
drop policy if exists "settings public read" on public.langar_settings;
create policy "settings public read" on public.langar_settings for select using(true);
drop policy if exists "settings admin write" on public.langar_settings;
create policy "settings admin write" on public.langar_settings for all to authenticated
using(exists(select 1 from public.admin_members a where a.user_id=auth.uid() and a.active))
with check(exists(select 1 from public.admin_members a where a.user_id=auth.uid() and a.active));
insert into public.langar_settings(key,value) values
('printer_paper_width','"80"'),('printer_printable_width','"74"'),('printer_margin_mm','"3"'),('printer_font_scale','"100"'),('printer_density','"normal"'),('printer_copies','"1"'),('printer_connection','"browser"'),('printer_name','""'),('printer_ip','""'),('printer_port','"9100"'),('printer_bridge_url','""'),('printer_auto_close','true'),
('receipt_show_logo','true'),('receipt_bold','false'),('alert_volume','"75"'),('sound_order','"triple"'),('sound_reservation','"double"'),('sound_cancel','"warning"'),('sound_barista','"soft"'),('sound_review','"soft"'),
('cancel_reason_required','true'),('phone_verified_for_cash','true'),('admin_theme','"langar"'),('high_contrast','false'),('compact_orders','true'),
('pause_all_orders','false'),('pause_delivery','false'),('pause_pickup','false'),('pause_reservations','false'),('kitchen_busy','false'),('prep_time_minutes','"20"')
on conflict(key) do nothing;
commit;
