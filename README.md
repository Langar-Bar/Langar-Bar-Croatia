# Langar Bar App V3 Prototype

This is a front-end prototype for Langar Bar.

## Files
- `index.html` — customer app
- `admin.html` — admin panel prototype
- `styles.css` — shared styling
- `js/menu-data.js` — imported menu data from the provided PDF
- `js/app.js` — customer app logic
- `js/admin.js` — admin logic
- `assets/` — logo, real photos and preview images

## Important prototype note
This version stores data in browser `localStorage`. It is for UI/UX and logic testing only.
The production version should use:
- Supabase database/auth/storage
- Admin login and role permissions
- Real QR codes
- Real one-time reward redemption
- Push notifications
- Remaris-ready integration layer

## Included V3 features
- Langar Bar only in header
- Opening Soon hero
- Opening Guest List popup
- horizontal scroll category tabs for Menu and Order
- click item to view ingredients
- graphic category icons
- customer dashboard
- Langar Club registration
- personal QR placeholder
- Welcome Free Espresso card
- Birthday card logic in admin
- rewards wallet and inbox
- referral logic blueprint and screen
- order manager
- reservation system
- gallery manager
- quick price update
- Remaris-ready notes
- legal notices for alcohol 18+ and fiscalized receipts
