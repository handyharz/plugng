# PlugNG App Product Blueprint

## Purpose
Turn the PlugNG app brainstorm into an execution-ready product blueprint covering:

- sitemap
- primary user journeys
- screen-by-screen requirements
- recommended v1 scope

This document is the bridge between inspiration and actual design work.

## Product Goal
Build a mobile-first PlugNG app that makes it easy for Nigerian shoppers to:

- discover authentic tech accessories
- confirm compatibility quickly
- buy with confidence
- use wallet benefits
- track orders clearly
- access support without friction

## Product Positioning
PlugNG app should be positioned as:

- premium
- fast
- trustworthy
- commerce-native
- optimized for repeat buying

It should feel more personal and more useful than the website, not just smaller.

## Primary User Types

### 1. Fast Buyer
Wants to find a known item quickly and check out with minimal friction.

Main needs:

- search
- saved addresses
- saved payment flow
- quick reorder

### 2. Browsing Shopper
Wants to explore categories, deals, featured products, and recommendations.

Main needs:

- rich discovery
- wishlist
- recommendations
- easy filtering

### 3. Trust-Seeking Buyer
Needs reassurance before buying.

Main needs:

- authenticity signals
- return policy clarity
- secure payment cues
- support visibility

### 4. Repeat Customer
Already trusts the brand and wants speed.

Main needs:

- wallet access
- recently viewed
- saved compatibility profile
- reorder shortcuts

## Core Product Jobs

1. Search and discover products.
2. Understand if a product fits the user's device.
3. Save products for later.
4. Purchase with low friction.
5. Track order progress clearly.
6. Use wallet value and perks.
7. Get support quickly when needed.

## App Sitemap

## Global Entry Points

- Splash / launch
- Onboarding
- Authentication
- Main app shell
- Deep links from notifications

## Main App Shell
Recommended bottom navigation:

1. Home
2. Search
3. Wishlist
4. Orders
5. Account

## Home Stack

- Home
- Category collection
- Brand collection
- Product detail
- Cart

## Search Stack

- Search landing
- Search results
- Filter sheet
- Product detail

## Wishlist Stack

- Wishlist list
- Product detail
- Cart

## Orders Stack

- Orders list
- Order detail
- Tracking detail
- Support issue flow

## Account Stack

- Account overview
- Wallet
- Wallet top-up
- Transactions
- Addresses
- Add/edit address
- Profile
- Notification settings
- Support
- About / policies

## Auth Stack

- Welcome / sign in
- Register
- Verify OTP or email
- Forgot password

## Optional Early-Roadmap Areas

- Saved device compatibility profile
- Push notification inbox
- Coupons / promo center
- Referral / rewards

## Navigation Rules

### Bottom Nav Rules

- keep labels short
- use icons with clear affordances
- preserve cart access globally through a top-right button or floating badge
- do not overload bottom nav with wallet and cart simultaneously

### Modal / Sheet Rules
Use bottom sheets for:

- filters
- payment method picker
- address selection
- quick add-to-cart confirmations
- support action chooser

Use full screens for:

- search
- product detail
- checkout steps
- order tracking

## Core User Journeys

## Journey 1: Discover and Buy
This is the primary commerce flow.

1. User opens app.
2. Home shows search, featured products, and quick categories.
3. User taps search or a category.
4. User browses results and opens a product.
5. Product detail shows images, price, compatibility, trust cues, and wallet perk.
6. User adds product to cart.
7. User proceeds to checkout.
8. User selects saved address or enters one.
9. User chooses payment method.
10. User confirms order.
11. User sees success screen and order tracking CTA.

Success criteria:

- user finds item fast
- product feels trustworthy
- checkout feels light
- confirmation is reassuring

## Journey 2: Search Known Product Fast
For users who know what they want.

1. User opens app.
2. User goes straight to Search.
3. App shows recent searches and trending terms.
4. User types item name, brand, or phone model.
5. Results appear quickly with filter chips.
6. User opens product, adds to cart, and checks out.

Success criteria:

- under 3 taps to meaningful results
- search feels predictive
- filters are simple and fast

## Journey 3: Browse, Save, Return Later
For high-intent but undecided users.

1. User browses categories or featured products.
2. User opens several product details.
3. User saves products to Wishlist.
4. User returns later via Wishlist or notification.
5. User compares mentally and buys.

Success criteria:

- saving feels frictionless
- wishlist is useful, not passive
- return path is obvious

## Journey 4: Fund Wallet and Use It
This is a strategic retention flow.

1. User sees wallet bonus card on Home, Product Detail, Cart, or Account.
2. User opens Wallet.
3. User sees current balance, quick top-up amounts, and wallet perks.
4. User funds wallet.
5. User receives success confirmation.
6. During checkout, wallet is pre-emphasized as a fast option.

Success criteria:

- wallet feels valuable
- funding feels safe
- wallet visibly speeds up checkout

## Journey 5: Track Order and Get Help
This is the trust-retention flow.

1. User taps Orders or push notification.
2. Orders list shows active statuses clearly.
3. User opens order detail.
4. User views shipping timeline and delivery status.
5. If needed, user taps support.
6. Support context is attached to the order.

Success criteria:

- order state is instantly clear
- support is easy to reach
- anxiety is reduced

## Screen-by-Screen Requirements

## 1. Splash / Launch
Purpose:

- establish brand tone quickly
- get user into the app fast

Requirements:

- branded logo animation
- dark premium visual treatment
- very short duration

Should not:

- become a loading wall
- feel slower than the website

## 2. Onboarding
Purpose:

- explain value in a few screens
- guide first action

Requirements:

- 2 to 3 short slides max
- focus on authenticity, fast delivery, wallet perks, and support
- clear CTA:
  - `Start Shopping`
  - `Sign In`

Optional:

- save device model later, not on first screen

## 3. Welcome / Auth
Purpose:

- let users sign in or create account without stress

Requirements:

- strong visual consistency with brand
- reduced motion compared to Home
- clear sign in and register options
- support for forgot password
- clear trust copy

Must feel:

- calm
- secure
- simple

## 4. Home
Purpose:

- discovery hub
- launch point for shopping
- personalized re-entry surface

Requirements:

- compact top header
- search bar
- category shortcuts
- wallet banner
- featured products
- trending products
- recently viewed or continue shopping
- trust snippet

Optional content if space allows:

- flash deals
- brand row

Should avoid:

- web-style long stacking of too many equal sections

## 5. Search Landing
Purpose:

- encourage quick product discovery

Requirements:

- auto-focused search input
- recent searches
- trending queries
- suggested categories
- suggested brands

Should feel:

- immediate
- smart
- lightweight

## 6. Search Results
Purpose:

- help users narrow quickly

Requirements:

- result grid or list
- sticky filter bar
- sort options
- compatibility cues where possible
- save and add-to-cart shortcuts

Filters should include:

- category
- brand
- price
- in-stock
- deals

## 7. Product Detail
Purpose:

- turn interest into purchase

Requirements:

- image gallery
- title
- price and compare-at price
- discount badges
- compatibility section
- trust strip
- delivery estimate
- review summary
- wallet benefit callout
- sticky CTA area

Primary CTAs:

- `Add to Cart`
- `Buy Now`

Secondary actions:

- save to wishlist
- share

## 8. Wishlist
Purpose:

- hold intent and drive conversion later

Requirements:

- saved products
- easy remove
- quick add to cart
- empty-state encouragement

Nice to have:

- sale or stock-change indicators later

## 9. Cart
Purpose:

- confirm order intent and move to checkout

Requirements:

- list of selected items
- quantity control
- remove item
- subtotal
- delivery estimate
- coupon field
- wallet savings nudge
- proceed to checkout CTA

Should emphasize:

- total clarity
- low friction

## 10. Checkout Step 1: Address
Purpose:

- gather or confirm delivery info

Requirements:

- saved address cards
- add new address option
- clear form if needed
- state and city fields
- landmark support
- Nigerian address sensibility

Should avoid:

- dense desktop-style forms

## 11. Checkout Step 2: Payment
Purpose:

- choose method confidently

Requirements:

- wallet
- card
- bank transfer if supported
- default recommended method
- trust and security cues
- summary of incentives

Strong idea:

- if wallet has balance, show it first

## 12. Checkout Step 3: Review
Purpose:

- reduce mistakes and reassure user

Requirements:

- items summary
- delivery address summary
- payment method summary
- total breakdown
- secure checkout label
- final confirm CTA

## 13. Order Success
Purpose:

- reinforce confidence after purchase

Requirements:

- confirmation animation or success state
- order number
- track order CTA
- continue shopping CTA

Optional:

- wallet or referral upsell later

## 14. Orders List
Purpose:

- show active and historical orders

Requirements:

- active orders first
- simple status labels
- order date
- order amount
- item preview
- entry to order detail

Recommended groupings:

- active
- delivered
- cancelled

## 15. Order Detail
Purpose:

- act as the order command center

Requirements:

- order number
- item list
- totals
- address
- payment status
- delivery timeline
- support action
- reorder if useful later

## 16. Tracking Detail
Purpose:

- reduce post-purchase anxiety

Requirements:

- current delivery state
- progress timeline
- estimated delivery
- shipment updates
- support entry

Should feel:

- highly legible
- trustworthy
- calm

## 17. Wallet
Purpose:

- show value and enable top-up

Requirements:

- available balance
- quick amount buttons
- top-up CTA
- transaction history preview
- wallet perks summary

Should feel:

- cleaner and calmer than Home
- more financial than promotional

## 18. Transactions
Purpose:

- provide financial transparency

Requirements:

- top-ups
- spend history
- statuses
- timestamps
- amount clarity

## 19. Account Overview
Purpose:

- central management hub

Requirements:

- profile summary
- wallet shortcut
- addresses
- order history shortcut
- support
- settings
- logout

## 20. Support
Purpose:

- make help accessible and contextual

Requirements:

- WhatsApp shortcut
- support center options
- order-linked help
- issue submission

Important:
Support should not feel buried.

## Design System Requirements for v1

## Color System

- background: black and deep charcoal
- primary accent: electric blue
- support accents: emerald, rose, purple
- text hierarchy: white, slate-muted, subtle metadata

## Surface System

- glass cards
- subtle borders
- rounded corners
- minimal shadows with glow hints
- strong image prominence

## Spacing Rules

- thumb-friendly touch targets
- more vertical breathing room than web
- compact but not cramped cards

## Typography Rules

- strong display moments for section titles
- calm readable body text
- uppercase micro labels only where useful

## Motion Rules

- fast transitions
- polished feedback
- reduced motion on payment and support flows

## v1 Feature Scope

## Must-Have v1

- onboarding
- authentication
- home discovery
- search
- product detail
- wishlist
- cart
- checkout
- wallet top-up and balance
- orders list
- order detail and tracking
- account management
- support entry points

## Good-to-Have v1.1

- saved device compatibility profile
- push notifications
- recently viewed
- reorder
- richer review system
- coupon center

## Later / v2

- referral mechanics
- loyalty or rewards
- advanced personalization
- notification inbox
- voice search
- smarter compatibility onboarding

## Recommended V1 Boundaries
To keep the app strong, do not overload first release with:

- too many promo systems
- too many account subfeatures
- too many growth experiments
- admin functionality
- web-equivalent long-form merchandising

The first version should be excellent at shopping, wallet, orders, and trust.

## Critical Success Metrics

### Acquisition and Activation

- onboarding completion rate
- sign-up completion rate
- first product view rate
- first add-to-cart rate

### Conversion

- search-to-product click rate
- product-to-cart rate
- cart-to-checkout rate
- checkout completion rate
- wallet usage rate

### Retention

- repeat purchase rate
- wishlist revisit rate
- order tracking engagement
- wallet top-up repeat rate

### Trust and Support

- support contact rate per order
- checkout failure rate
- tracking-related complaints
- wallet verification failures

## Recommended Design Order
When we start the actual app design, the best sequence is:

1. App shell and navigation
2. Home
3. Search and Search Results
4. Product Detail
5. Cart
6. Checkout
7. Orders and Tracking
8. Wallet
9. Account and Support

## Recommended Build Order
When we start implementation, the best sequence is:

1. navigation shell and auth
2. home and search
3. product detail and wishlist
4. cart and checkout
5. orders and tracking
6. wallet
7. account and support

## Final Product Standard
If v1 is done well, a user should be able to say:

- "I found what I wanted fast."
- "The app feels premium."
- "I trusted the payment process."
- "Tracking my order was easy."
- "Wallet actually felt useful."

## Next Step
The strongest next move after this blueprint is to create a screen planning document for the first key app screens:

- Home
- Search
- Product Detail
- Cart
- Checkout
- Orders
- Wallet

That document should define:

- exact content blocks
- CTA hierarchy
- interaction notes
- empty states
- loading states
- error states
