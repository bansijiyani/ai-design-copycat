# FizTopz Clone — Premium Indian Fashion E-Commerce

A full clone of the FizTopz site shown in screenshots: premium ethnic + western fashion brand with cream/ivory background, gold accents, deep red CTAs, serif display typography.

## Design System
- **Palette**: Ivory bg (#fcfbf8), deep gold (#b8924a), maroon red (#8b1a1a), forest green (#1a4d3a) for newsletter band, charcoal footer
- **Typography**: Serif display (Playfair Display) for headings, sans (Inter) for body
- **Components**: Top promo bar, sticky nav with logo + menu + icons (search/wishlist/cart/account)

## Pages (TanStack routes)
1. `/` — Home: hero ("Wear the World. Own Every Room."), The Edit grid (8 products), Just Dropped (4 products), Reviews, Newsletter
2. `/products` — Catalog with sidebar filters (category, price range, size), grid/list toggle, sort
3. `/products/$id` — PDP: gallery, color swatches, qty, Add to Cart / Buy Now, pincode check, accordions (highlights/description/care), customer reviews with rating breakdown
4. `/cart` — Empty state + start shopping CTA
5. `/login` — Split layout: gold panel left with brand stats, sign-in form right
6. `/signup` — Split layout: green panel left with benefits, create account form right
7. `/wishlist` — Wishlist page

## Data
Static product data in `src/lib/products.ts` (8-12 items across ethnic/western categories). Cart + wishlist state via Zustand with localStorage.

## Tech
Pure frontend, no backend. All images via generated/placeholder sources. Footer with company/shop/help columns + socials.

## Scope notes
- No real auth — forms are decorative
- No checkout flow beyond cart
- Static product data, no admin
