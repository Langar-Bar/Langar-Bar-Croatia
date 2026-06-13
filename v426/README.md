Langar Bar App V4.2.5 — Cloud Sushi + Mobile Admin

Changes:
- Sushi pre-orders are saved to Supabase when the customer is logged in.
- Admin Sushi Pre-orders reads from Cloud, so laptop and phone show the same orders.
- Updating sushi status creates a customer Inbox confirmation/update.
- Mobile admin layout improved with compact module buttons and auto-scroll to selected panel.
- Admin PWA icon added with a different red/gold Admin design.
- Admin page now links its own manifest: admin-manifest.webmanifest.
- Service Worker cache updated to V4.2.5.

Test URLs:
App:   https://langar-bar.github.io/Langar-Bar-Croatia/?v=423
Admin: https://langar-bar.github.io/Langar-Bar-Croatia/admin.html?v=423

Important:
- For Cloud sushi sync, customer should be logged in through Langar Club / Phone OTP before placing sushi pre-order.
- Local old sushi pre-orders remain only on the device where they were created; new Cloud pre-orders sync across devices.
