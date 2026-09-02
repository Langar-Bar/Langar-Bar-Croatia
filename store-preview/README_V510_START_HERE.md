# Langar Bar V5.1.0 — Start Here

This package replaces the earlier V5.0.0 package. Upload this package instead.

## Architecture decision
- The customer app and admin ordering system are independent from Remaris.
- Orders are stored in Langar Bar Supabase.
- Admin can print an internal preparation/delivery ticket from the Orders panel.
- The ticket clearly states that it is not a fiscal invoice.
- For the current operational phase, staff manually enter the order into the existing certified fiscal software and print the official fiscal receipt separately.
- Croatian fiscalization will be a future, separately tested module.

## Supabase
Run existing required migrations in their documented order, then run:
1. `langar_bar_v500_secure_dynamic_admin.sql`
2. `langar_bar_v510_independent_order_print.sql`

## Printing
The browser/tablet opens an 80 mm print layout. Popup permission is required. For truly silent automatic printing, a later native tablet print service/plugin is required; ordinary browsers intentionally show the print confirmation dialog.

## Google Play
This package contains Capacitor configuration, but an Android platform folder/AAB must still be generated and signed in the development environment. Do not upload this ZIP directly to Google Play.
