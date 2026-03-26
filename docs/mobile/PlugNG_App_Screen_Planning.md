# PlugNG App Screen Planning

## Purpose
Define the first key app screens in practical detail so we can move from product planning into actual UI design and implementation.

This document covers:

- content blocks
- CTA hierarchy
- interaction notes
- empty states
- loading states
- error states

## Screens Covered

1. Home
2. Search
3. Search Results
4. Product Detail
5. Cart
6. Checkout
7. Orders
8. Order Detail / Tracking
9. Wallet
10. Account

## Shared UI Rules

### Visual Tone

- dark-first
- premium
- glass surfaces
- electric blue primary accent
- restrained secondary accents
- strong product imagery

### Interaction Rules

- one dominant CTA per screen
- bottom sheets for secondary choices
- sticky actions on high-intent screens
- minimal typing where selection can work
- trust cues placed near actions, not buried in content

### Status Rules
Every major screen should support:

- loading
- empty
- success
- failure
- offline or retry when relevant

## 1. Home Screen

## Main Job
Help users discover products fast and re-enter key shopping flows.

## Primary User Questions

- What should I shop right now?
- How do I search quickly?
- Are there deals or wallet benefits for me?
- Can I resume something I was already doing?

## Content Blocks

### A. Top Header
Include:

- PlugNG wordmark or compact logo
- notification icon
- cart icon with badge

### B. Main Search Bar
Include:

- search placeholder
- entry into full search experience
- optional scan or voice placeholder later

### C. Quick Categories
Include:

- 6 to 8 category pills or icon tiles
- categories like chargers, cases, audio, screen protection

### D. Wallet Highlight Card
Include:

- current balance if signed in
- wallet bonus headline
- top-up or use-wallet CTA

### E. Featured Products Row
Use:

- horizontal card carousel
- stronger visual cards than generic list rows

### F. Trending / Deals Row
Use:

- more compact product cards
- urgency badge if truly relevant

### G. Continue Shopping / Recently Viewed
If user has history, show:

- recently viewed
- unfinished cart
- wishlist nudges

### H. Trust Strip
Short version only:

- authentic products
- secure payments
- fast delivery

## CTA Hierarchy

Primary CTA:

- tap search

Secondary CTAs:

- open product
- open category
- top up wallet
- open cart

## Interaction Notes

- Search bar should feel tappable and premium, not just decorative.
- Product rows should support horizontal swiping naturally.
- Category section should fit above the fold on most devices.
- Wallet card should not overpower product discovery.

## Empty State
If no personalized data yet:

- show featured products
- show trending categories
- hide recently viewed

## Loading State

- shimmer for header badges
- shimmer cards for featured rows
- avoid long blank spaces

## Error State
If product feed fails:

- show fallback categories
- show retry CTA
- keep search usable

## 2. Search Screen

## Main Job
Let users begin a fast, focused search session.

## Primary User Questions

- What can I search for?
- What did I search for before?
- What is trending right now?

## Content Blocks

### A. Search Input
Include:

- auto focus on open
- clear button
- cancel or back control

### B. Recent Searches
Use:

- chip format
- quick one-tap rerun

### C. Trending Searches
Use:

- compact cards or chips
- product-driven language like `iPhone 15 case`, `30W charger`

### D. Suggested Categories
Use:

- icon tiles or compact list

### E. Suggested Brands
Use:

- horizontally scrollable brand chips

## CTA Hierarchy

Primary CTA:

- submit query

Secondary CTAs:

- tap recent search
- tap trending term
- tap category

## Interaction Notes

- Keyboard should feel central to this screen.
- Suggestions should update as user types.
- Search should transition into results without feeling like a full page reload.

## Empty State
The default state is the useful state:

- recents
- trending
- suggestions

## Loading State

- inline loading under input while fetching suggestions

## Error State

- fallback to local recents and static suggestions
- keep query usable

## 3. Search Results Screen

## Main Job
Help users narrow and choose products quickly.

## Content Blocks

### A. Results Header
Include:

- query label
- result count
- sort entry

### B. Sticky Filter Bar
Include:

- category
- brand
- price
- availability
- deals

### C. Product Result Grid
Use:

- 2-column grid on most phones
- strong image ratio
- quick wishlist and add-to-cart affordances

### D. No Results Assist
If no results:

- related categories
- popular brands
- clear search CTA

## CTA Hierarchy

Primary CTA:

- open product detail

Secondary CTAs:

- filter
- sort
- save to wishlist
- quick add to cart

## Interaction Notes

- Filters should open in a bottom sheet.
- Preserve scroll position when returning from product detail.
- Sort should be quick and simple.

## Empty State

- "No products found"
- show nearby alternatives
- show reset filters CTA

## Loading State

- result card skeletons
- sticky filter bar visible early

## Error State

- retry CTA
- preserve entered query

## 4. Product Detail Screen

## Main Job
Turn product interest into purchase confidence.

## Primary User Questions

- Is this right for my device?
- Is it authentic?
- How much is it?
- When will it arrive?
- Can I trust the checkout?

## Content Blocks

### A. Media Gallery
Include:

- swipeable images
- pinch or fullscreen later if needed
- visible image count

### B. Product Header
Include:

- product title
- price
- compare-at price if on sale
- promo or wallet badge if relevant

### C. Compatibility Card
Include:

- brand
- device model
- fit assurance

This is a major conversion driver.

### D. Trust Block
Include:

- authentic guarantee
- return policy summary
- secure payment cue

### E. Delivery Block
Include:

- estimated arrival
- city/state note if useful

### F. Product Description / Specs
Use:

- concise overview
- expandable specs section

### G. Reviews Summary
Include:

- star rating
- review count
- entry to all reviews

### H. Related Products
Use:

- horizontal row

### I. Sticky Bottom Action Bar
Include:

- wishlist action
- add to cart
- buy now

## CTA Hierarchy

Primary CTA:

- add to cart

Alternative primary CTA in some states:

- buy now

Secondary CTAs:

- save
- share
- open reviews

## Interaction Notes

- Sticky action bar should remain visible after user scrolls.
- Compatibility should be surfaced early, not buried below description.
- Trust and delivery should appear before long-form content.

## Empty State
Not applicable in normal flow.

## Loading State

- image skeleton
- title and price skeleton
- sticky bar skeleton

## Error State

- product unavailable message
- back to search CTA
- related products fallback if possible

## 5. Cart Screen

## Main Job
Review selected items and move cleanly into checkout.

## Content Blocks

### A. Cart Header
Include:

- title
- item count

### B. Cart Items List
Each item should include:

- image
- name
- selected variant if any
- quantity control
- price
- remove action

### C. Coupon / Promo Module
Include:

- field
- apply CTA
- applied-state feedback

### D. Wallet Savings Nudge
Include:

- wallet balance
- potential savings
- top-up shortcut if useful

### E. Summary Panel
Include:

- subtotal
- delivery estimate
- total

### F. Checkout CTA
Sticky if needed.

## CTA Hierarchy

Primary CTA:

- proceed to checkout

Secondary CTAs:

- change quantity
- remove item
- apply coupon
- open wallet

## Interaction Notes

- Quantity adjustments should be instant and clearly reflected in totals.
- Wallet nudges should help, not distract.

## Empty State

- empty-cart illustration or icon
- short encouragement
- continue shopping CTA

## Loading State

- skeleton list items
- skeleton totals

## Error State

- partial failure handling if item update fails
- retry or refresh pricing CTA

## 6. Checkout Flow

## Main Job
Complete purchase with confidence and minimal friction.

## Structure
Recommended as 3 screens or one stepper flow:

1. Address
2. Payment
3. Review

## 6A. Address Step

### Content Blocks

- saved addresses
- add new address CTA
- address form if needed
- delivery note

### Primary CTA

- continue to payment

### Empty State

- no saved addresses
- clean form-first entry

### Error State

- inline field validation
- city/state mismatch or required-field prompts

## 6B. Payment Step

### Content Blocks

- payment method cards
- wallet balance and savings
- card option
- bank transfer if supported
- secure payment reassurance

### Primary CTA

- continue to review

### Interaction Notes

- Recommended method should be visually emphasized.
- Wallet should be first when balance is sufficient.

## 6C. Review Step

### Content Blocks

- item summary
- address summary
- payment summary
- full cost breakdown
- secure checkout label

### Primary CTA

- place order

### Success Follow-Up
After order placement:

- success screen
- order number
- track order CTA
- continue shopping CTA

## Loading State

- CTA loading
- payment processing overlay only when necessary

## Error State

- transaction failure message
- retry payment CTA
- support entry if repeated failure

## 7. Orders Screen

## Main Job
Let users see the status of all orders at a glance.

## Content Blocks

### A. Header
Include:

- title
- optional filter chips:
  - active
  - delivered
  - cancelled

### B. Order Cards
Each card should include:

- order number
- first item title
- extra item count if any
- date
- status badge
- amount
- thumbnail preview

### C. Support Entry
Show subtle help entry near active orders.

## CTA Hierarchy

Primary CTA:

- open order detail

Secondary CTAs:

- filter orders
- contact support

## Interaction Notes

- Active orders should appear first.
- Status badges must be instantly scannable.

## Empty State

- no orders message
- start shopping CTA

## Loading State

- order card skeletons

## Error State

- retry CTA
- preserve filters if possible

## 8. Order Detail / Tracking Screen

## Main Job
Reduce post-purchase anxiety and make support easy.

## Content Blocks

### A. Status Hero
Include:

- current order state
- order number
- estimated delivery

### B. Tracking Timeline
Include:

- timeline items
- location or delivery state
- timestamps

### C. Ordered Items
Include:

- item list
- quantity
- totals

### D. Delivery Details
Include:

- address
- contact if appropriate

### E. Payment Summary
Include:

- payment method
- payment status

### F. Support Actions
Include:

- report issue
- contact support
- track another order if public flow exists

## CTA Hierarchy

Primary CTA:

- contact support only when needed

Normal state CTA:

- no oversized CTA required if tracking is clear

Secondary CTAs:

- reorder later
- share order status later

## Interaction Notes

- Status section should be visually calm and easy to scan.
- Timeline should use icon and color carefully.
- Avoid overdecorating this screen.

## Empty State

- if no timeline events, show current status and "updates will appear here"

## Loading State

- status hero skeleton
- timeline skeleton

## Error State

- order not found or verification issue
- retry CTA
- support fallback

## 9. Wallet Screen

## Main Job
Show balance clearly, encourage top-up, and make wallet feel valuable.

## Content Blocks

### A. Balance Card
Include:

- available balance
- strong visual hierarchy

### B. Quick Top-Up Buttons
Include:

- common amounts
- custom amount option

### C. Wallet Benefits
Include:

- zero-fee or faster checkout messaging
- wallet-only savings if active

### D. Transaction Preview
Include:

- latest transactions
- see all CTA

## CTA Hierarchy

Primary CTA:

- fund wallet

Secondary CTAs:

- view transactions
- use wallet at checkout

## Interaction Notes

- Wallet should feel more calm than Home.
- Monetary values must be highly legible.
- Status messages for top-up should be explicit.

## Empty State

- zero balance state
- funding encouragement

## Loading State

- balance card shimmer
- transaction list skeleton

## Error State

- top-up verification failure
- retry or support CTA

## 10. Account Screen

## Main Job
Give users one place to manage profile, wallet, addresses, support, and settings.

## Content Blocks

### A. Profile Header
Include:

- user name
- phone or email
- edit profile CTA

### B. Key Shortcuts
Include:

- wallet
- addresses
- orders
- support

### C. Settings List
Include:

- notifications
- payment methods if supported
- saved addresses
- policies
- logout

## CTA Hierarchy

Primary CTA:

- none dominant across whole screen

Primary behavior:

- quick access to management areas

## Interaction Notes

- Keep it tidy and low-stress.
- This screen should feel like a control center, not a content feed.

## Empty State
Not generally needed, but missing profile details should prompt completion.

## Loading State

- basic row skeletons

## Error State

- partial-load fallback
- retry on account data fetch failure

## Priority Design Sequence
Design these first:

1. Home
2. Search
3. Product Detail
4. Cart
5. Checkout
6. Orders
7. Wallet

These seven screens define most of the app's value.

## Components We Will Need Repeatedly

- glass card
- product card
- price block
- wallet promo card
- trust badge row
- filter chip
- section header
- sticky bottom action bar
- order status badge
- empty state module
- skeleton loader

## Open Design Decisions

1. Should Home show a large hero card or a compact header-first layout?
2. Should Search be a dedicated tab landing or jump straight into an expanded input?
3. Should cart be a full screen only or also open as a sheet for quick confirmation?
4. Should wallet have its own visual accent or stay purely blue/white/black?
5. Should order tracking show a map later or stay timeline-first in v1?

## Recommended Immediate Next Step
The strongest next step is to create a wireframe/spec document for the first 5 screens:

- Home
- Search
- Product Detail
- Cart
- Checkout

That doc should include:

- exact section order
- visual emphasis
- component list
- state handling per screen
