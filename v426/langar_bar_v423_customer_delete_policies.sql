-- Langar Bar V4.2.3 — Admin customer cleanup/delete permissions
-- Run once in Supabase SQL Editor if Delete Customer says permission denied.

-- Allow active owners/managers to delete app-visible test/customer profiles.
drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin
on public.profiles for delete
to authenticated
using (public.has_admin_role(array['owner','manager']));

-- Allow owners/managers to remove notification preferences of deleted test customers.
drop policy if exists notification_preferences_delete_admin on public.notification_preferences;
create policy notification_preferences_delete_admin
on public.notification_preferences for delete
to authenticated
using (public.has_admin_role(array['owner','manager']));

-- Allow owners/managers to remove wallet rows when deleting test customers.
drop policy if exists wallet_transactions_delete_admin on public.wallet_transactions;
create policy wallet_transactions_delete_admin
on public.wallet_transactions for delete
to authenticated
using (public.has_admin_role(array['owner','manager']));

-- Allow owners/managers to remove notification log rows for cleanup if needed.
drop policy if exists notifications_log_delete_admin on public.notifications_log;
create policy notifications_log_delete_admin
on public.notifications_log for delete
to authenticated
using (public.has_admin_role(array['owner','manager']));

notify pgrst, 'reload schema';
