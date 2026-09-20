# Daily Healthy Kitchen — Complete React/Vite Ordering App

This archive implements the uploaded Daily Healthy Kitchen master prompt as a real React/Vite application.

## Included
- React + Vite + TypeScript
- Tailwind CSS custom DHK theme
- Framer Motion animations
- Zustand local persistence
- React Router routes
- 15 complete menu categories / 95 menu items from the supplied prompt
- Category banners + distinct product image URLs
- Welcome/name persistence
- Animated hero + food slider
- Full-menu search, fuzzy matching, filters and category scroll-spy
- Zomato-style item rows, detail sheet, favourites and special instructions
- Cart, coupons, itemised bill, address book, delivery ETA
- Real uploaded QR asset
- UTR-gated payment submission; no automatic verification claim
- Order history + animated tracking
- WhatsApp deep-link order message to +91 90829 75231
- Account page
- Server-protected /owner route
- Out-of-stock controls and demo owner price/bestseller controls
- PWA manifest/service worker
- Safe-area / mobile-first layout
- Branded loading/broken/empty/error states and toasts

## Run
1. Copy `.env.example` to `.env`.
2. Set `DHK_OWNER_PASSCODE` on the server. This is intentionally server-only; it is not a `VITE_` variable.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local address printed by the server (default `http://localhost:8787`).

For production:
- `npm run build`
- `npm start`

## Payment
The exact uploaded QR image is included at `public/assets/payment-qr.jpg`.
A static QR cannot automatically verify a bank/UPI payment. The app therefore requires the customer to enter a UTR/reference and labels the payment as submitted/pending verification until the owner verifies it.

If a real payment gateway is later added, keep all secret credentials and server-side verification on the server.

## Images
Food imagery is sourced from free-to-use Pexels photo pages selected for vegetarian/food relevance. Product rows use 105 distinct image URLs with crop parameters so the rows do not share a repeated URL. The source page is stored in each item's `imageSource` field.

For production, review each image against the restaurant's actual dishes and replace any photo with the restaurant's own dish photo when available.

## Assets
- `public/assets/logo.png` = uploaded Daily Healthy Kitchen logo
- `public/assets/payment-qr.jpg` = uploaded real payment QR
- No replacement/fake QR was generated.

## Important
The uploaded prompt contains an early image-layout contradiction. Its later Part 2 explicitly resolves it: keep one large category image AND a compact unique image thumbnail on every numbered item row. This implementation follows that final resolution.
