Langar Bar App V4.3.7 — Order Submit + Delivery Panel Fix

Fixes:
- Removed internal POS/courier instruction from customer Payment Method UI.
- Restored Orders / Delivery panel content in Admin.
- Orders can be saved locally and, when the customer is logged in, also to Supabase Cloud.
- Admin can send ETA/time estimate: 15, 20, 30, 45, 60 or custom minutes.
- Customer can accept or cancel the offered time.
- Admin sees payment method so courier knows whether to take the POS terminal.
- Paid and Entered in Remaris stay internal admin controls.
- Ready/reject notifications create customer inbox messages when possible.
- Dine-in order mode restored.
- Admin sees Dine-in orders and table number.
- Cache updated to V4.3.7.
- Fixed order submit reading an empty cart even when the cart visually had items.
- Exposed app cart state safely for order workflow scripts.
- Orders / Delivery will now receive local and Cloud orders after submit.

Test URLs:
App: https://langar-bar.github.io/Langar-Bar-Croatia/?v=437
Admin: https://langar-bar.github.io/Langar-Bar-Croatia/admin.html?v=437
