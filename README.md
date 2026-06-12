# Langar Bar App V4.1 — Cloud Auth Foundation

This version keeps the V4.0 UI/UX structure and adds the first real cloud foundation:

- Supabase public config
- Phone OTP login card in Langar Club
- Cloud profile upsert after login
- Cloud Inbox sync from `inbox_messages`
- OneSignal SDK base and external user login after Supabase auth
- Admin Cloud Login verification against `admin_members`
- Service Worker cache updated to V4.1

Production note: Orders, full menu manager, feedback, events, sushi pre-orders, coupons and credits will be migrated to Supabase in the next cloud phases. This version focuses on secure auth foundation and cloud inbox/profile connection without breaking the existing prototype UI.
