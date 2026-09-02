# Langar Bar V5.0.0 Store Release Checklist

## Completed in this package
- Capacitor configuration and package metadata.
- Stable app ID: `com.langarbar.croatia`.
- Password visibility, password strength, forgot-password and recovery UX.
- Privacy Policy and Terms pages.
- Server-side welcome espresso claim migration and customer-side direct redemption blocked.
- Dynamic CMS/settings/coupons/audit database foundation.

## Required before public release
1. Run `langar_bar_v500_secure_dynamic_admin.sql` in Supabase.
2. Enable email confirmation and configure Site URL/redirect URLs in Supabase Auth.
3. Configure SMS provider if phone verification is required for the welcome reward.
4. Create staff-only QR scanner/redeem RPC and connect it to Admin tablet.
5. Provide official support email, legal company name, VAT/OIB, final Privacy Policy contact and account deletion URL.
6. Generate native Android/iOS projects with Capacitor, signing keys, Play Console and Apple Developer credentials.
7. Test orders, cancellation, rewards, account deletion, notifications, offline behavior and payment/fiscal workflow on physical devices.
8. Prepare store screenshots, feature graphic, descriptions, Data Safety and App Privacy forms.

## Important
A build cannot be submitted to Apple without macOS/Xcode and an Apple Developer account. Store publication also requires the owner's credentials and legal declarations.
