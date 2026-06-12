# Langar Bar App V4.1.2 — Secure Admin + Reward Inbox Fix

This version keeps the V4.1 cloud foundation and improves two important production-readiness issues:

- Admin page is locked by default. Only the Cloud Admin Login panel is visible until a verified active admin from `admin_members` logs in.
- Invalid login or non-admin users cannot access dashboard/modules.
- Successful admin login opens Admin Mode and reveals modules.
- Welcome Free Espresso reward now behaves as a real digital card in Inbox/Rewards.
- Old text-only welcome messages are removed, and espresso-card messages open the actual QR/code card.
- Cache updated to V4.1.2.

Upload all files/folders to the root of the GitHub Pages repository and test with `?v=412`.
