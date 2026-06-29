# Langar Bar Croatia

Version: V4.4.0 Breakfast Menu Update

Changes in this package:
- Updated full customer menu data.
- Added Breakfast category with egg/omelette items, breakfast combos and included drink choices.
- Added Breakfast Add-ons & Upgrades.
- Updated tacos, tapas, focaccia pizza, desserts, soft serve, matcha/tea pricing and extra sauces.
- Bumped local menu storage key to `langar_menu_v7` so users receive the updated menu instead of old cached localStorage.
- Bumped service worker cache to `langar-bar-v4-4-0-breakfast-menu`.
- Added Supabase SQL seed file for cloud menu update.

After upload to GitHub Pages, ask users/admin to refresh once. If using Supabase cloud menu, run the new seed SQL or open Admin > Settings/Cloud Menu and upload local menu after logging in as admin.


## V4.5.1 Order fix
Run `langar_bar_v451_order_rpc_return_type_fix.sql` in Supabase SQL Editor. Customer app submits guest dine-in/pickup/delivery orders through RPC, saves an order token on the device for status tracking, and Admin Orders uses secure RPC plus 5-second polling/realtime and alarm sound.


## V4.5.2 Order ETA + stronger alarm
Run `langar_bar_v452_order_eta_alarm_fix.sql` in Supabase SQL Editor after upload. Admin Orders can send an estimated ready time/message to customers. Customer order tracking shows status + ETA on the same device. The tablet alarm uses a louder progressive Web Audio pattern after staff taps Enable alarm sound.


## V4.5.3 Order Countdown + Admin Cloud Health

Run `langar_bar_v453_admin_cloud_health_order_refinements.sql` in Supabase SQL Editor after upload. This version adds Admin Cloud Health Check, custom ETA minutes, customer countdown timer, improved order filters, and test-order cleanup.


## V4.5.4 ETA preset, cancellation request and refresh feedback
Run `langar_bar_v454_eta_cancel_refresh_fix.sql` in Supabase SQL Editor after upload. This version fixes preset ready-time sending, adds visible Admin Check/Refresh feedback, adds customer cancellation requests that require staff approval, and keeps the countdown/status tracker stable.

## V4.5.7 ETA draft + overdue alarm
No new SQL is required if V4.5.4/V4.5.5 SQL was already run. This version keeps preset/custom ETA selections stable before accepting orders, sends ETA together when Accept/Preparing is selected, adds ETA overdue alarms on the admin tablet, adds quick delay messages and +5/+10 minute buttons, and improves local/browser notifications when the app/PWA is still running. Real push notifications when the app is fully closed still require OneSignal/FCM integration later.


## V4.5.7 — Customer Push + Account Order Sync Fix
- Customer order status notifications improved.
- Account orders now sync across devices when the customer is logged into Langar Club.
- Added OneSignal worker files and customer Enable order alerts action.
- Run `langar_bar_v457_customer_push_account_sync_fix.sql` in Supabase.


## V4.5.8 — Account Sync + Tapas + Ice Cream Fix
Run `langar_bar_v458_account_authoritative_sync_fix.sql` in Supabase after upload. Logged-in My Recent Orders is now Cloud/account-authoritative and uses account-specific local cache. Tapas is normalized to the full Duo/Trio/Quartet flavor chooser, and Ice Cream is separated from Desserts with its own cone icon.


## V4.5.9 — Reviews + Cancellation Modal + Inbox Modal Fix

Run `langar_v459_sql_only.sql` in Supabase after the V4.5.8 SQL. Upload the full ZIP to replace the app files. This version adds completed-order reviews, admin review moderation/insights, required cancellation reason modal, admin cancellation messaging, and a foreground Inbox message detail modal.
