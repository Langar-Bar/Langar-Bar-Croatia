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
