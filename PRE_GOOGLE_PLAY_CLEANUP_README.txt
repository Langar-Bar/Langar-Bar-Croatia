DO NOT CLEAN TEST DATA YET.
After all final tests pass, perform the release cleanup as a separate controlled step.
Preserve the production admin account and its admin role.
Remove test orders, reservations, reviews, questions, inbox messages, coupons/credits and test customer accounts.
Auth test users should be deleted from Supabase Authentication > Users (or via an admin-only server script), not from the public client app.
Before cleanup: export/backup the database and confirm the exact admin email/UUID to preserve.
