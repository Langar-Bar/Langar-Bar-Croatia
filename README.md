Langar Bar App V4.4.0 — Stable Order Alarm + Status Tracking + Daily Archive

Base: V4.3.9.

Main fixes:
- Admin order alarm is persistent and louder.
- Alarm repeats and gradually increases until staff acknowledges/stops it.
- Enable loud alarm must be tapped once on the admin device/browser.
- Admin Orders / Delivery shows live order monitor, order cards, ETA controls, status controls and daily order archive.
- Admin can enter any custom ETA minutes, not only preset buttons.
- ETA countdown starts only after the customer accepts the proposed time.
- Customer order cards now show a clear order progress tracker.
- Customer can accept or cancel the ETA offer.
- Order status updates can send Inbox messages to the customer when cloud is available.
- Customer order history is also shown in the Club area.
- Delivered/completed orders can receive feedback; admin can publish positive reviews and keep low ratings private.

Supabase:
- If customer Accept/Cancel, order feedback, or cloud order visibility does not work across devices, run:
  langar_bar_v440_orders_alarm_status_feedback_policies.sql

Test URLs after upload:
- App: https://langar-bar.github.io/Langar-Bar-Croatia/?v=440
- Admin: https://langar-bar.github.io/Langar-Bar-Croatia/admin.html?v=440
