# Langar Bar — Data Safety / App Privacy Draft

Use this as the source of truth when completing Google Play Data safety and Apple App Privacy forms. Re-check the live feature set before final submission.

## Security and account controls
- Data encrypted in transit: Yes (HTTPS/TLS through Supabase, OneSignal and app endpoints)
- Users can request account deletion: Yes
- In-app deletion path: More → Delete my account
- External deletion URL: https://langar-bar.github.io/Langar-Bar-Croatia/account-deletion.html
- Privacy Policy: https://langar-bar.github.io/Langar-Bar-Croatia/privacy.html
- Data sold: No
- Third-party behavioural advertising: No
- Cross-app tracking: No

## Data categories used by Langar Bar

### Personal info
Collected when the user creates/uses Langar Club or relevant services:
- Name
- Email address
- Phone number
- Birthday
Purpose: account management, rewards, reservations, customer support, fraud/duplicate-reward prevention.
Linked to user: Yes.

### Address
- Delivery address when Delivery is used.
Purpose: fulfill the requested delivery.
Linked to user/order: Yes.

### User IDs / identifiers
- Supabase account UUID
- Referral code
- OneSignal external ID / notification subscription identifier
- App install/device identifier where used for reward abuse prevention
Purpose: authentication, account continuity, rewards, notifications, security.
Linked to user: Yes while account exists.

### Purchases / order history
- Ordered items, total, order type, table/pickup/delivery details, status, estimated ready time
Purpose: fulfill orders, customer service, operational/fiscal records and reward eligibility.
Linked to user: When the user is logged in; guest dine-in orders may not be linked to an account.

### User content
- Reviews and ratings
- Feedback
- Barista questions
- Partner/Academy application messages where used
Purpose: customer service, community/review features and requested services.
Linked to user: May be linked when submitted by a logged-in user.

### App activity / preferences
- Reward activity
- Referral activity
- Likes/comments where enabled
- Notification preferences
- Event interests / poll votes where enabled
Purpose: requested app functionality, personalization, loyalty/rewards, analytics of feature use.
Linked to user: Yes where account-specific.

### Device / technical information
- Device platform
- App/device language
- Push subscription identifier
- Basic timestamps / logs required for security and notification delivery
Purpose: push delivery, troubleshooting, security and service operation.
Linked to user: May be linked to account for notification delivery.

## Third-party processors

### Supabase
Used for authentication, database, Edge Functions and cloud persistence.
Data types: account identifiers, profile/contact information, orders, reservations, rewards, messages and operational records.
Purpose: core app functionality and security.

### OneSignal
Used for push notifications.
Data types: push subscription/device identifier, external user ID, notification delivery metadata.
Purpose: app/order notifications enabled by the user.

## Google Play Data safety mapping
Recommended declarations based on current implementation:
- Personal info: Collected; app functionality/account management; linked to user; not sold
- Address: Collected conditionally for delivery; app functionality; linked to order/user; not sold
- Purchases: Collected; app functionality and rewards; linked to user when logged in; not sold
- User IDs: Collected; account management/security; linked to user; not sold
- User content: Collected when submitted; app functionality/customer support; may be linked; not sold
- App activity: Collected for loyalty/preferences and service operation; linked where account-specific; not sold
- Device or other IDs: Collected for push/security; linked where needed; not sold

Data collection is partly optional because users can browse the menu and place some dine-in orders without creating a Langar Club account. Account-specific features require account data.

## Apple App Privacy mapping
Data Linked to You:
- Contact Info: Name, Email Address, Phone Number, Physical Address (delivery only)
- Identifiers: User ID, Device ID / push identifier
- Purchases: Purchase History / order history
- User Content: Customer Support, Reviews/Feedback, Other User Content where submitted
- Usage Data: Product Interaction / feature activity where stored as account-specific activity

Purposes:
- App Functionality
- Product Personalization (rewards/preferences)
- Analytics limited to first-party operational/feature improvement where applicable
- Developer Advertising: No
- Third-Party Advertising: No
- Tracking: No

## Retention/deletion note
On account deletion, authentication/profile and account-linked customer data are deleted. Records that must remain for legal, tax, accounting, fraud-prevention or security reasons may be retained for the required period and are anonymized where reasonably possible.
