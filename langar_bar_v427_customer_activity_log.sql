-- Langar Bar V4.2.7 — Customer activity / visit history
create table if not exists public.customer_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  staff_user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null default 'manual_visit',
  source text not null default 'admin',
  item_name text,
  amount numeric(10,2) default 0,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_activity_log_user_created_idx
on public.customer_activity_log(user_id, created_at desc);

alter table public.customer_activity_log enable row level security;

drop policy if exists "Admins can read customer activity" on public.customer_activity_log;
create policy "Admins can read customer activity"
on public.customer_activity_log for select
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid() and am.active = true
  )
  or user_id = auth.uid()
);

drop policy if exists "Admins can insert customer activity" on public.customer_activity_log;
create policy "Admins can insert customer activity"
on public.customer_activity_log for insert
with check (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid() and am.active = true
  )
);

drop policy if exists "Admins can update customer activity" on public.customer_activity_log;
create policy "Admins can update customer activity"
on public.customer_activity_log for update
using (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid() and am.active = true
  )
)
with check (
  exists (
    select 1 from public.admin_members am
    where am.user_id = auth.uid() and am.active = true
  )
);
