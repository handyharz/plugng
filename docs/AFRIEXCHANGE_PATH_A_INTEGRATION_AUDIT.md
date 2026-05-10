# PlugNG x AfriExchange Path A Audit

Date: May 9, 2026

Related follow-up docs:

- [PLUGNG_AFRIEXCHANGE_INTEGRATION_GUIDE.md](./PLUGNG_AFRIEXCHANGE_INTEGRATION_GUIDE.md)
- [PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md](./PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md)

## Summary

`plugng-shop` is not yet integrated with AfriExchange Path A.

The current payment stack is:

- `card` via Paystack initialization in the PlugNG backend
- `wallet` via PlugNG internal wallet balance
- `bank_transfer` exists in the backend business logic, but is not currently exposed as a checkout option in the shop frontend

Path A can be added cleanly, but it needs both checkout-contract work and a webhook/reconciliation path before we should test against the live AfriExchange merchant platform.

## What Exists Today

### Frontend checkout

The shop checkout page only exposes two payment methods:

- `card`
- `wallet`

References:

- [frontend/src/app/(shop)/checkout/page.tsx](../frontend/src/app/(shop)/checkout/page.tsx)
- [frontend/src/context/CheckoutContext.tsx](../frontend/src/context/CheckoutContext.tsx)

Current flow:

1. User selects payment method on the checkout page.
2. Frontend calls `orderApi.create(...)`.
3. Backend creates a pending order.
4. Backend either:
   - redirects to Paystack for `card`
   - debits PlugNG wallet immediately for `wallet`

### Backend order flow

The backend order controller currently supports:

- `card`
- `bank_transfer`
- `wallet`
- `cash_on_delivery` in the schema enum

References:

- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)
- [backend/src/models/Order.ts](../backend/src/models/Order.ts)
- [backend/src/routes/order.routes.ts](../backend/src/routes/order.routes.ts)

Important current behavior:

1. Orders are created with `paymentStatus: 'pending'`.
2. `card` and `bank_transfer` both go through Paystack initialization.
3. `wallet` is settled immediately inside PlugNG.
4. Payment verification is currently fallback/polling style through `GET /api/v1/orders/verify`.

### Webhook surface

There is no AfriExchange webhook receiver route in the backend today.

There also does not appear to be a dedicated Paystack webhook route mounted in `app.ts`, despite the project docs mentioning one.

References:

- [backend/src/app.ts](../backend/src/app.ts)

This matters because Path A relies on merchant-side webhook delivery for reconciliation.

## Gaps Before Path A Testing

These are the main gaps we need to close before PlugNG can act as a proper Path A merchant.

### 1. No AfriExchange payment method in checkout UI

The checkout page state is currently typed as:

- `'card' | 'wallet'`

Reference:

- [frontend/src/app/(shop)/checkout/page.tsx](../frontend/src/app/(shop)/checkout/page.tsx)

So users cannot choose AfriExchange yet.

### 2. No AfriExchange order-init path in backend

The backend currently initializes:

- Paystack for `card` / `bank_transfer`
- internal wallet debit for `wallet`

There is no `afriexchange` branch that:

- creates an AfriExchange merchant payment request
- stores the returned AfriExchange request/reference
- returns the AfriExchange `payment_url` to the frontend

Reference:

- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)

### 3. No AfriExchange webhook verification/reconciliation

Path A requires PlugNG to receive AfriExchange webhook events and reconcile the related order idempotently.

Current missing pieces:

- webhook route
- signature verification
- event persistence / audit log
- idempotency guard
- order update logic for duplicate or retried events

### 4. No AfriExchange-specific order metadata

The current `Order` model does not have a structured place for AfriExchange merchant fields such as:

- AfriExchange payment request id
- AfriExchange reference
- AfriExchange webhook event id
- AfriExchange settlement / collection status snapshot

Reference:

- [backend/src/models/Order.ts](../backend/src/models/Order.ts)

### 5. Success page is Paystack-style, not provider-aware

The existing success page assumes the current verification model and does not yet distinguish:

- `provider=paystack`
- `provider=afriexchange`

Reference:

- [frontend/src/app/(shop)/checkout/success/page.tsx](../frontend/src/app/(shop)/checkout/success/page.tsx)

## Recommended Path A Contract For PlugNG

To keep this integration clean, PlugNG should treat AfriExchange as a separate external payment rail.

### Suggested payment method id

Use:

- `afriexchange`

This should be added consistently to:

- frontend checkout selection
- backend request handling
- order schema enum
- admin reporting filters

### Suggested backend env vars

Use these as the core Path A config:

- `AFRIEXCHANGE_ENABLED`
- `AFRIEXCHANGE_API_BASE_URL`
- `AFRIEXCHANGE_MERCHANT_API_KEY`
- `AFRIEXCHANGE_MERCHANT_ID`
- `AFRIEXCHANGE_WEBHOOK_SECRET`
- `AFRIEXCHANGE_WEBHOOK_URL`
- `AFRIEXCHANGE_RETURN_URL`

### Suggested order metadata shape

Add an `afriExchange` object to the order model with fields like:

- `paymentRequestId`
- `reference`
- `paymentUrl`
- `status`
- `lastWebhookEvent`
- `lastWebhookAt`
- `verifiedAt`

This avoids overloading generic `paymentReference`.

### Suggested backend route additions

Recommended new internal surfaces:

- `POST /api/v1/orders`
  - accept `paymentMethod: 'afriexchange'`
  - create PlugNG order in `pending`
  - call AfriExchange merchant API to create a payment request
  - store AfriExchange request metadata on the order
  - return `paymentUrl`

- `POST /api/v1/webhooks/afriexchange`
  - verify signature
  - find order by AfriExchange request id / reference
  - process `collection.completed`
  - mark order paid idempotently
  - deduct stock once

- `GET /api/v1/orders/verify?reference=...`
  - should become provider-aware
  - for AfriExchange, prefer internal order state already updated by webhook

## Suggested Implementation Order

### Phase 1: Safe staging

1. Add env templates.
2. Add `afriexchange` to shared payment method types.
3. Add order-model metadata fields for AfriExchange.
4. Add feature flag so the UI can stay off until backend is ready.

### Phase 2: Backend contract

1. Build AfriExchange service wrapper in PlugNG backend.
2. Extend `createOrder` with `paymentMethod === 'afriexchange'`.
3. Add webhook route and signature verification.
4. Add idempotent order settlement logic.

### Phase 3: Frontend checkout

1. Add AfriExchange payment tile to checkout.
2. Show provider-specific copy for CT checkout.
3. Redirect user to AfriExchange `payment_url`.
4. Make success page provider-aware.

### Phase 4: Proving the flow

1. Create a dedicated PlugNG pilot customer.
2. Create a PlugNG order using `afriexchange`.
3. Complete payment through AfriExchange.
4. Confirm webhook receipt.
5. Confirm PlugNG order becomes `paid`.
6. Confirm stock deducted once.
7. Confirm order history and admin surfaces show correct status.

## High-Priority Findings

1. The checkout frontend is still hard-coded to `card | wallet`, so Path A is impossible from the UI today.
2. The backend has no AfriExchange init branch and no merchant webhook endpoint.
3. The current order verification model is Paystack-oriented and should not be reused blindly for AfriExchange.
4. The backend docs mention webhook behavior that is not clearly present in the mounted route tree, so we should trust the live code over the docs during implementation.

## Recommended Next Step

The next practical step is to implement the backend Path A contract first:

1. order metadata support
2. AfriExchange service wrapper
3. `paymentMethod: 'afriexchange'` order creation path
4. webhook receiver

Only after that should we expose the AfriExchange payment option in the PlugNG checkout UI.
