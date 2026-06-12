# Langar Bar App V4.1.3 — Admin Logout

This version keeps V4.1.2 security and adds a Cloud Admin Logout button.

- Admin page remains locked until Cloud Admin login succeeds.
- When logged in, admin can choose Logout.
- If admin does not logout, Supabase session stays active and admin opens normally next time.
- After logout, admin page returns to login-only mode and requires email/password again.
- Cache updated to V4.1.3.

Next planned step: V4.2 Cloud Menu + Likes + Feedback.
