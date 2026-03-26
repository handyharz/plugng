# PlugNG App User Flows and State Map

## Purpose
Map the most important end-to-end app flows and define the state transitions that the product and engineering teams must support.

This document helps connect:

- product journeys
- screen behavior
- UI states
- edge cases

## Core Flows Covered

1. onboarding and auth
2. discover and buy
3. search known item
4. wishlist and return
5. wallet funding and usage
6. order tracking and support

## Flow 1: Onboarding and Auth

## Goal
Get a new user from app install to signed-in browsing with minimal friction.

## Happy Path

1. User opens app.
2. Splash appears briefly.
3. Onboarding introduces value.
4. User chooses sign in or create account.
5. User submits credentials.
6. Verification step happens if required.
7. User lands on Home.

## States

### Splash

- loading brand assets
- app ready

### Onboarding

- first launch
- skipped
- completed

### Auth

- idle
- typing
- submitting
- success
- invalid credentials
- network failure

## Edge Cases

- user closes app during verification
- session resumes and should restore auth state
- verification expires

## Flow 2: Discover and Buy

## Goal
Allow a shopper to browse from Home to product to cart to successful order.

## Happy Path

1. User opens Home.
2. User taps category or product.
3. User opens Product Detail.
4. User taps Add to Cart.
5. User opens Cart.
6. User proceeds to Checkout.
7. User chooses address.
8. User chooses payment.
9. User reviews and places order.
10. User sees success and can track order.

## State Map

### Home

- feed loading
- feed ready
- personalization present
- feed error

### Product Detail

- product loading
- product ready
- unavailable
- add-to-cart in progress
- add-to-cart success
- add-to-cart failure

### Cart

- cart loading
- cart with items
- cart empty
- pricing update pending
- pricing update failed

### Checkout

- address step
- payment step
- review step
- processing
- success
- failure

## Edge Cases

- item becomes unavailable before checkout
- price changes between cart and checkout
- coupon becomes invalid
- selected payment method fails

## Flow 3: Search Known Item

## Goal
Support a fast path for users who already know what they want.

## Happy Path

1. User opens Search.
2. User types query.
3. Suggestions appear.
4. User submits query.
5. Results load.
6. User filters or opens product.
7. User buys or saves.

## State Map

### Search Entry

- idle
- focused
- typing
- suggestions loading
- suggestions ready
- suggestions error

### Search Results

- loading
- populated
- no results
- filter applied
- sort applied
- results error

## Edge Cases

- no products found
- brand/category suggestions only
- connection interrupted mid-search

## Flow 4: Wishlist and Return

## Goal
Let shoppers save intent and convert later.

## Happy Path

1. User taps wishlist on product card or Product Detail.
2. Product is saved.
3. User later opens Wishlist.
4. User opens saved item.
5. User adds item to cart and checks out.

## State Map

### Save Action

- idle
- saving
- saved
- save failed

### Wishlist Screen

- loading
- populated
- empty
- remove in progress
- remove failed

## Edge Cases

- product removed from catalog after save
- price changed
- item out of stock

## Flow 5: Wallet Funding and Usage

## Goal
Make wallet feel useful, safe, and easy to adopt.

## Happy Path

1. User sees wallet prompt.
2. User opens Wallet.
3. User chooses top-up amount.
4. Payment initializes.
5. Payment succeeds.
6. Wallet balance updates.
7. At checkout, wallet is available and emphasized.

## State Map

### Wallet Screen

- balance loading
- balance ready
- zero balance
- transactions loading
- transactions ready
- transactions empty

### Funding Flow

- idle
- amount entered
- initializing payment
- redirecting to processor
- verifying transaction
- success
- failure

### Checkout Wallet State

- enough balance
- insufficient balance
- wallet selected
- wallet unavailable

## Edge Cases

- payment success but verification delayed
- duplicate callback
- verification fails
- balance updates late

## Flow 6: Order Tracking and Support

## Goal
Reduce anxiety after purchase and make help easy when needed.

## Happy Path

1. User opens Orders.
2. User taps active order.
3. Order detail loads.
4. Tracking timeline is shown.
5. User sees current state and ETA.
6. If issue arises, user opens support.

## State Map

### Orders List

- loading
- populated
- empty
- filter active
- fetch error

### Order Detail

- loading
- ready
- timeline empty but order valid
- verification needed for public tracking if applicable
- fetch error

### Support Entry

- idle
- support channel selected
- handoff to WhatsApp or support screen
- failure to open support

## Edge Cases

- timeline has no events yet
- order not found
- verification info mismatch
- support channel temporarily unavailable

## Global Product States

## Network States

- online
- slow network
- offline

Rules:

- keep previously loaded content visible where safe
- show retry rather than full-screen dead ends

## Auth States

- guest
- signed in
- session expired
- restricted action requires auth

Rules:

- cart browsing can work as guest if product allows
- checkout and wallet require sign-in

## Cart States

- cart empty
- cart active
- cart syncing
- cart sync failed

## Payment States

- not started
- in progress
- processor redirect
- verification
- success
- failed

## Order States

- pending
- paid
- processing
- shipped
- delivered
- cancelled

## UI State Requirements by Screen

## Home

- loading
- partial fallback
- feed error

## Search

- typing
- suggestions
- results
- no results

## Product Detail

- loading
- available
- unavailable

## Cart

- empty
- editing
- pricing changed

## Checkout

- step progression
- payment processing
- success
- failure

## Orders

- active list
- past list
- no orders

## Wallet

- empty balance
- funded
- verifying top-up
- failed verification

## Recommended Analytics Events

### Discovery

- `home_viewed`
- `search_opened`
- `search_submitted`
- `search_result_clicked`
- `category_opened`

### Commerce

- `product_viewed`
- `added_to_cart`
- `cart_viewed`
- `checkout_started`
- `payment_method_selected`
- `order_placed`

### Wallet

- `wallet_viewed`
- `wallet_topup_started`
- `wallet_topup_succeeded`
- `wallet_topup_failed`
- `wallet_selected_at_checkout`

### Retention

- `wishlist_added`
- `wishlist_viewed`
- `order_opened`
- `tracking_viewed`
- `support_opened`

## Next Step
After this state map, the final planning doc should be an execution roadmap with:

- milestones
- dependency order
- v1/v1.1 split
- success criteria
