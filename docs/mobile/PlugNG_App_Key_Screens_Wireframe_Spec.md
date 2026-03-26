# PlugNG App Key Screens Wireframe Spec

## Purpose
Define the first five key PlugNG app screens at wireframe/spec level so design and implementation can start with clarity.

This document covers:

- layout structure
- section order
- emphasis hierarchy
- component inventory
- states
- interaction behavior

## Screens Covered

1. Home
2. Search
3. Product Detail
4. Cart
5. Checkout

## Shared Design Rules

### Visual Style

- dark-first interface
- glass-card surfaces
- electric blue primary accent
- restrained purple, rose, and emerald support accents
- strong product imagery
- soft glow, not loud neon

### Layout Rules

- prioritize thumb reach
- keep primary actions in lower or easy-reach zones
- use generous spacing between major blocks
- limit each screen to one dominant action

### Interaction Rules

- bottom sheets for filters, address selection, payment method selection
- sticky bottom bars on purchase-intent screens
- preserve context when user navigates back
- never bury trust cues below long content if they affect conversion

## 1. Home Screen Wireframe

## Screen Goal
Make discovery immediate while giving repeat users a fast way back into search, wallet, and ongoing shopping activity.

## Screen Structure
Top to bottom:

1. Header
2. Search bar
3. Quick category strip
4. Wallet promo / wallet balance card
5. Featured products section
6. Trending deals section
7. Continue shopping section
8. Trust mini-strip

## Wireframe Layout

```text
------------------------------------------------
| Header: Logo         Notifications    Cart(2)|
------------------------------------------------
| Search Bar: Search accessories, brands...    |
------------------------------------------------
| Category chips: Cases | Chargers | Audio ... |
------------------------------------------------
| Wallet Card                                   
| Balance / bonus / top-up CTA / wallet savings|
------------------------------------------------
| Featured                                      |
| [Product Card] [Product Card] [Product Card] |
------------------------------------------------
| Trending Deals                               |
| [Compact Product] [Compact Product]          |
------------------------------------------------
| Continue Shopping                            |
| [Recent Product] [Recent Product]            |
------------------------------------------------
| Authentic | Secure Pay | Fast Delivery       |
------------------------------------------------
| Bottom Nav                                   |
------------------------------------------------
```

## Emphasis Hierarchy

### Primary emphasis

- search bar

### Secondary emphasis

- wallet card
- featured products

### Tertiary emphasis

- trust strip
- continue shopping

## Component Inventory

- `AppHeader`
- `SearchEntryBar`
- `CategoryChipRow`
- `WalletPromoCard`
- `SectionHeader`
- `FeaturedProductCard`
- `CompactProductCard`
- `ContinueShoppingRow`
- `TrustStrip`
- `BottomTabBar`

## Home Screen Content Rules

### Header
Must include:

- compact PlugNG brand
- notification icon
- cart badge

Should not include:

- too many actions
- profile entry if account already has a tab

### Search Bar
Must feel:

- premium
- tappable
- central

Behavior:

- tapping opens Search screen
- query is not typed inline on Home in v1

### Quick Categories
Recommended set:

- cases
- chargers
- screen protectors
- audio
- adapters
- power banks

### Wallet Card
Two states:

- signed in with balance
- signed in without balance

Possible copy direction:

- `Use Wallet for Faster Checkout`
- `Top up and unlock wallet-only perks`

### Featured Products
Use richer product cards than the trending row.

Each card should show:

- image
- title
- price
- discount if relevant
- wishlist affordance

### Continue Shopping
If no browsing history:

- replace with `Recommended for You`

## Home States

### Loading

- header icons visible
- search bar visible
- skeleton row for wallet
- skeleton cards for featured and trending

### Empty Personalization State

- no continue shopping row
- show recommendation row instead

### Error State

- search still works
- category chips still visible
- product sections replaced with retry card

## 2. Search Screen Wireframe

## Screen Goal
Create a focused discovery tool that feels fast and smart from the first tap.

## Screen Structure
Top to bottom:

1. Search header
2. Search input
3. Recent searches
4. Trending terms
5. Suggested categories
6. Suggested brands

## Wireframe Layout

```text
------------------------------------------------
| Back   Search Input [x]                       |
------------------------------------------------
| Recent Searches                               |
| [iPhone 15 case] [30W charger] [Power bank]  |
------------------------------------------------
| Trending Now                                  |
| [Tile] [Tile]                                 |
| [Tile] [Tile]                                 |
------------------------------------------------
| Shop by Category                              |
| [Cases] [Chargers] [Audio] [Protection]      |
------------------------------------------------
| Popular Brands                                |
| [Apple] [Samsung] [Oraimo] [Sony]            |
------------------------------------------------
```

## Emphasis Hierarchy

### Primary emphasis

- search input

### Secondary emphasis

- recent searches
- trending terms

### Tertiary emphasis

- categories
- brands

## Component Inventory

- `SearchTopBar`
- `ExpandedSearchInput`
- `SearchChip`
- `TrendingQueryTile`
- `CategoryTile`
- `BrandChipRow`

## Search Interaction Rules

### On Open

- keyboard opens automatically
- cursor is ready
- previous query is not automatically inserted

### On Type

- show inline query suggestions
- if query has enough characters, transition toward result intent

### On Submit

- move to Search Results
- preserve query

## Search States

### Default State

- recent
- trending
- categories
- brands

### Typing State

- recent moves lower or disappears
- query suggestions appear

### Empty History State

- no recent search block
- trending becomes first block

### Error State

- keep input active
- fallback to local suggestions

## 3. Product Detail Wireframe

## Screen Goal
Build confidence fast enough that users are comfortable adding to cart or buying immediately.

## Screen Structure
Top to bottom:

1. Product media gallery
2. Product summary
3. Compatibility card
4. Trust row
5. Delivery info
6. Description/specs
7. Reviews preview
8. Related products
9. Sticky action bar

## Wireframe Layout

```text
------------------------------------------------
| Back   Share                      Wishlist    |
------------------------------------------------
| [Large Swipeable Product Image Gallery]       |
------------------------------------------------
| Product Title                                 |
| Price / Compare-at Price / Promo Badge        |
------------------------------------------------
| Compatibility Card                            |
| Works with: iPhone 15 Pro                     |
------------------------------------------------
| Trust Row                                     |
| Authentic | 7-Day Returns | Secure Checkout   |
------------------------------------------------
| Delivery Card                                 |
| Delivery estimate / location note             |
------------------------------------------------
| Description / Specs                           |
------------------------------------------------
| Reviews Preview                               |
------------------------------------------------
| Related Products                              |
------------------------------------------------
| Sticky Bottom Bar: Add to Cart | Buy Now      |
------------------------------------------------
```

## Emphasis Hierarchy

### Primary emphasis

- product image
- price
- sticky bottom CTA

### Secondary emphasis

- compatibility
- trust
- delivery

### Tertiary emphasis

- reviews
- related products

## Component Inventory

- `ProductGallery`
- `ProductSummaryBlock`
- `PriceStack`
- `PromoBadge`
- `CompatibilityCard`
- `TrustBadgeRow`
- `DeliveryEstimateCard`
- `ExpandableSpecs`
- `ReviewPreviewCard`
- `RelatedProductRow`
- `StickyPurchaseBar`

## Product Detail Content Rules

### Product Summary
Must include:

- title
- current price
- old price if discounted
- wallet perk if relevant

### Compatibility Card
Should be visually stronger than a normal info row.

Reason:
This is a major decision-making block for accessory shopping.

### Trust Row
Keep short and scannable:

- authentic
- return policy
- secure payment

### Sticky Purchase Bar
Two layouts to consider:

- primary: `Add to Cart`, secondary: `Buy Now`
- primary: `Buy Now`, secondary: `Add to Cart`

Recommended for v1:

- primary: `Add to Cart`
- secondary: `Buy Now`

## Product Detail States

### Loading

- gallery skeleton
- title and price skeleton
- sticky bar placeholder

### Unavailable State

- show unavailable badge
- hide purchase CTA
- show browse similar products CTA

### Error State

- product unavailable message
- return to search CTA

## 4. Cart Screen Wireframe

## Screen Goal
Make it easy to confirm selected items and commit to checkout.

## Screen Structure
Top to bottom:

1. Header
2. Cart item list
3. Coupon/promo module
4. Wallet savings card
5. Order summary
6. Sticky checkout bar

## Wireframe Layout

```text
------------------------------------------------
| Back                 Cart (3 items)           |
------------------------------------------------
| Item Card                                      |
| Image | Name | Variant | Qty stepper | Price  |
------------------------------------------------
| Item Card                                      |
------------------------------------------------
| Promo / Coupon Module                         |
------------------------------------------------
| Wallet Savings Card                           |
| Balance / potential savings / top-up shortcut |
------------------------------------------------
| Summary                                       |
| Subtotal                                      |
| Delivery estimate                             |
| Total                                         |
------------------------------------------------
| Sticky Bottom Bar: Proceed to Checkout        |
------------------------------------------------
```

## Emphasis Hierarchy

### Primary emphasis

- checkout CTA

### Secondary emphasis

- total amount
- item list

### Tertiary emphasis

- coupon area
- wallet nudge

## Component Inventory

- `CartHeader`
- `CartLineItem`
- `QuantityStepper`
- `CouponModule`
- `WalletSavingsCard`
- `OrderSummaryCard`
- `StickyCheckoutBar`

## Cart Interaction Rules

### Quantity Changes

- update instantly
- recalculate totals live
- show temporary inline error if stock limit is hit

### Remove Item

- use undo snackbar or confirm depending on pattern

### Wallet Nudge

- show only if meaningful
- do not visually overpower totals

## Cart States

### Empty Cart

```text
---------------------------------
| Empty cart icon               |
| Your cart is empty            |
| Start Shopping CTA            |
---------------------------------
```

### Loading

- skeleton line items
- summary skeleton

### Error

- pricing refresh failed
- retry CTA

## 5. Checkout Wireframe

## Screen Goal
Finish purchase with trust, clarity, and low cognitive load.

## Checkout Model
Recommended:

- multi-step flow with progress indicator

Steps:

1. Address
2. Payment
3. Review

## 5A. Address Step Wireframe

```text
------------------------------------------------
| Back     Checkout      Step 1 of 3            |
------------------------------------------------
| Saved Addresses                               |
| [Address Card]                                |
| [Address Card]                                |
------------------------------------------------
| Add New Address                               |
------------------------------------------------
| Delivery Form if needed                       |
------------------------------------------------
| Sticky Bottom Bar: Continue to Payment        |
------------------------------------------------
```

### Emphasis Hierarchy

- saved address selection first
- new address second
- continue CTA last

### Component Inventory

- `CheckoutProgressBar`
- `AddressCard`
- `AddAddressButton`
- `AddressForm`
- `StickyContinueBar`

### Address State Rules

- if user has saved addresses, show them first
- if none, open with clean form-first layout
- keep landmark field available

## 5B. Payment Step Wireframe

```text
------------------------------------------------
| Back     Checkout      Step 2 of 3            |
------------------------------------------------
| Payment Methods                               |
| [Wallet Option Card]                          |
| [Card Option Card]                            |
| [Bank Transfer Option Card] optional          |
------------------------------------------------
| Secure Payment Message                        |
------------------------------------------------
| Sticky Bottom Bar: Continue to Review         |
------------------------------------------------
```

### Emphasis Hierarchy

- recommended payment method
- secure payment reassurance
- continue CTA

### Component Inventory

- `PaymentMethodCard`
- `WalletPaymentCard`
- `SecurityNotice`
- `StickyContinueBar`

### Payment State Rules

- if wallet balance covers order, highlight wallet strongly
- if wallet balance is insufficient, show shortfall clearly
- keep security copy compact and clear

## 5C. Review Step Wireframe

```text
------------------------------------------------
| Back     Checkout      Step 3 of 3            |
------------------------------------------------
| Item Summary                                  |
------------------------------------------------
| Address Summary                               |
------------------------------------------------
| Payment Summary                               |
------------------------------------------------
| Total Breakdown                               |
------------------------------------------------
| Secure Checkout Label                         |
------------------------------------------------
| Sticky Bottom Bar: Place Order                |
------------------------------------------------
```

### Emphasis Hierarchy

- final total
- place order CTA
- address and payment summaries

### Component Inventory

- `OrderItemSummary`
- `AddressSummaryCard`
- `PaymentSummaryCard`
- `CostBreakdownCard`
- `SecureCheckoutFooter`
- `StickyPlaceOrderBar`

## Checkout Global States

### Processing State

- dim background
- centered loader
- clear message:
  - `Securing your payment`
  - `Placing your order`

### Success State

```text
---------------------------------
| Success icon                  |
| Order confirmed               |
| Order number                  |
| Track Order CTA               |
| Continue Shopping CTA         |
---------------------------------
```

### Failure State

- concise error explanation
- retry action
- support fallback if repeated failure

## Key Components to Design First
These components unlock most of the above screens:

1. `AppHeader`
2. `SearchEntryBar`
3. `SectionHeader`
4. `CategoryChipRow`
5. `FeaturedProductCard`
6. `CompactProductCard`
7. `WalletPromoCard`
8. `CompatibilityCard`
9. `TrustBadgeRow`
10. `StickyBottomBar`
11. `CartLineItem`
12. `AddressCard`
13. `PaymentMethodCard`
14. `CostBreakdownCard`
15. `StateCard` for loading, empty, and error

## Design Decisions We Should Lock Next

1. Home header style:
   compact utility header or mini hero header
2. Search behavior:
   full-screen dedicated search or animated overlay
3. Product detail CTA order:
   `Add to Cart` first or `Buy Now` first
4. Cart interaction:
   undo removal or hard remove
5. Checkout presentation:
   segmented screens or one vertical stepper

## Recommended Next Step
The strongest next step now is to create a design system spec for the app covering:

- color tokens
- typography tokens
- spacing
- card styles
- buttons
- input styles
- badges
- bottom nav
- motion principles

That will let us turn these wireframes into consistent high-fidelity UI.
