Langar Bar App V4.2.4 — Club Login / Sign Up + Customers RPC Sync

Updates:
- Club now has two clear modes: existing member login and new sign up.
- Existing members enter the same phone number, receive SMS OTP and restore their Cloud profile.
- New customers complete the sign-up form, receive SMS OTP and then get a Cloud profile.
- Duplicate registration with the same phone restores the same Supabase Auth user/profile instead of creating a second visible customer.
- Admin customer list can use secure Supabase RPC functions for consistent laptop/mobile sync.
- Admin delete customer can use RPC for safer cleanup of test customers.
- Service Worker cache updated to V4.2.4.

Required optional SQL:
Run langar_bar_v424_admin_customer_rpc.sql in Supabase for strongest Customers & Rewards sync and delete.
