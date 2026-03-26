# PlugNG App Component Spec

## Purpose
Define the reusable UI building blocks for the PlugNG app so the interface can be designed and implemented consistently.

This document focuses on:

- component purpose
- core variants
- states
- usage locations

## Component Groups

1. layout
2. navigation
3. commerce
4. forms
5. feedback
6. support and trust

## Layout Components

## 1. `AppHeader`

### Purpose
Provide a consistent top bar for branded or utility-led screens.

### Common Props

- `title`
- `showBack`
- `leftAction`
- `rightActions`
- `variant`

### Variants

- `brand`
- `standard`
- `minimal`

### States

- default
- scrolled
- loading

### Used In

- Home
- Search
- Product Detail
- Cart
- Orders
- Wallet
- Account

## 2. `SectionHeader`

### Purpose
Label sections and optionally link to a deeper screen.

### Props

- `title`
- `subtitle`
- `actionLabel`
- `onPressAction`
- `icon`

### Used In

- Home
- Product Detail
- Orders
- Wallet

## 3. `ScreenContainer`

### Purpose
Provide consistent screen padding, scroll behavior, and background styling.

### Variants

- `default`
- `withBottomBar`
- `withStickyHeader`

## Navigation Components

## 4. `BottomTabBar`

### Purpose
Primary app-level navigation.

### Tabs

- Home
- Search
- Wishlist
- Orders
- Account

### States

- active
- inactive
- badge present

## 5. `StickyBottomBar`

### Purpose
Hold high-intent persistent actions near the bottom of the screen.

### Props

- `primaryLabel`
- `secondaryLabel`
- `meta`
- `disabled`
- `loading`

### Variants

- `singleAction`
- `dualAction`
- `summaryAction`

### Used In

- Product Detail
- Cart
- Checkout

## Commerce Components

## 6. `SearchEntryBar`

### Purpose
Provide a high-emphasis tappable search surface.

### Variants

- `home`
- `searchExpanded`
- `inlineResults`

### States

- idle
- focused
- typing
- loading

## 7. `CategoryChip`

### Purpose
Represent a category as a compact tap target.

### Variants

- `filled`
- `outlined`
- `iconLeading`

### States

- default
- active
- pressed

## 8. `CategoryChipRow`

### Purpose
Horizontally scrollable collection of category shortcuts.

### Used In

- Home
- Search
- Search Results

## 9. `FeaturedProductCard`

### Purpose
Show a premium product card for Home and key merchandising sections.

### Required Content

- image
- title
- price
- compare-at price optional
- wallet badge optional
- wishlist action

### States

- default
- on sale
- wallet promo
- out of stock
- loading

## 10. `CompactProductCard`

### Purpose
Smaller commerce card for horizontal rows and recommendations.

### Used In

- Home
- Related products
- Wishlist

## 11. `ProductGridCard`

### Purpose
Search-result friendly product card in 2-column or list layouts.

### Required Content

- image
- title
- price
- optional quick save
- optional quick add

## 12. `ProductGallery`

### Purpose
Swipeable product image area on Product Detail.

### States

- image loaded
- loading
- unavailable image fallback

## 13. `PriceStack`

### Purpose
Display price hierarchy clearly.

### Content

- current price
- old price
- discount label

### Used In

- Product Detail
- Product cards
- Cart summary
- Checkout review

## 14. `CompatibilityCard`

### Purpose
Show device fit and compatibility reassurance.

### Variants

- `confirmedFit`
- `generalCompatibility`
- `needsSelection`

### Used In

- Product Detail
- Search Results later

## 15. `WalletPromoCard`

### Purpose
Promote wallet value or show current balance.

### Variants

- `balance`
- `zeroBalance`
- `savingsNudge`
- `checkoutBoost`

### Used In

- Home
- Cart
- Checkout
- Wallet

## 16. `CartLineItem`

### Purpose
Represent a single item inside cart or checkout review.

### Content

- image
- name
- variant
- quantity
- price
- remove or edit action

## 17. `QuantityStepper`

### Purpose
Adjust cart quantity with minimal friction.

### States

- default
- disabled
- maxed out
- loading

## 18. `OrderSummaryCard`

### Purpose
Show subtotal, delivery fee, discounts, and final total.

### Used In

- Cart
- Checkout review

## 19. `OrderCard`

### Purpose
Show a summarized order in Orders list.

### Content

- order number
- status
- date
- amount
- item preview

### States

- active
- delivered
- cancelled
- loading

## 20. `OrderTimeline`

### Purpose
Display shipment progress in order detail or tracking.

### States

- active progress
- completed
- no events yet

## Form Components

## 21. `TextInputField`

### Purpose
Standard text input for forms.

### Variants

- `default`
- `search`
- `amount`

### States

- default
- focused
- error
- success
- disabled

## 22. `AddressCard`

### Purpose
Represent a saved address option.

### Content

- label
- full name
- phone
- address
- selected state

### Used In

- Checkout
- Addresses

## 23. `AddressForm`

### Purpose
Create or edit address.

### Required Fields

- full name
- phone
- address line
- city
- state
- landmark

## 24. `PaymentMethodCard`

### Purpose
Represent a payment option in checkout.

### Variants

- `wallet`
- `card`
- `bankTransfer`

### States

- default
- selected
- unavailable
- recommended

## 25. `CouponModule`

### Purpose
Apply and show promo or coupon states.

### States

- default
- applying
- applied
- invalid

## Feedback Components

## 26. `StatusBadge`

### Purpose
Represent compact state labels.

### Types

- sale
- paid
- pending
- delivered
- cancelled
- wallet perk

## 27. `StateCard`

### Purpose
Reusable empty, loading, and error container.

### Variants

- `empty`
- `error`
- `offline`
- `success`

## 28. `SkeletonBlock`

### Purpose
Provide consistent loading placeholders.

### Variants

- line
- card
- image
- row

## 29. `ToastBanner`

### Purpose
Transient feedback for actions like save, add-to-cart, or remove.

### States

- success
- info
- error

## Trust and Support Components

## 30. `TrustBadgeRow`

### Purpose
Display short reassurance signals in a compact row.

### Common Items

- authentic
- easy returns
- secure checkout
- fast delivery

## 31. `DeliveryEstimateCard`

### Purpose
Show delivery timing and shipping reassurance.

### Used In

- Product Detail
- Checkout
- Order Detail

## 32. `SupportEntryCard`

### Purpose
Provide fast access to support with contextual framing.

### Variants

- `general`
- `orderLinked`
- `paymentHelp`

## 33. `TransactionRow`

### Purpose
Show wallet transaction history.

### Content

- type
- date
- amount
- status

## Component Priority for Design

Design these first:

1. `AppHeader`
2. `SearchEntryBar`
3. `SectionHeader`
4. `FeaturedProductCard`
5. `CompactProductCard`
6. `WalletPromoCard`
7. `CompatibilityCard`
8. `TrustBadgeRow`
9. `StickyBottomBar`
10. `CartLineItem`
11. `AddressCard`
12. `PaymentMethodCard`
13. `OrderSummaryCard`
14. `OrderCard`
15. `StateCard`

## Component Priority for Build

Build order recommendation:

1. layout and nav components
2. commerce list and card components
3. product detail components
4. cart and checkout components
5. order and wallet components
6. support and feedback components

## Next Step
After this component spec, the strongest remaining document is a user flow and state map that ties screens and components into full end-to-end behaviors.
