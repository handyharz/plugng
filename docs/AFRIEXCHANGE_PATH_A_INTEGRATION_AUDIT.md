# PlugNG x AfriExchange Path A Audit

Date: May 10, 2026

Related follow-up docs:

- [PLUGNG_AFRIEXCHANGE_INTEGRATION_GUIDE.md](./PLUGNG_AFRIEXCHANGE_INTEGRATION_GUIDE.md)
- [PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md](./PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md)

## Summary

`plugng-shop` is now integrated with AfriExchange Path A using the hosted buyer checkout model.

The current payment stack is:

- `card` via Paystack initialization in the PlugNG backend
- `wallet` via PlugNG internal wallet balance
- `afriexchange` for supported XOF-country checkout via hosted AfriExchange payment page

The AfriExchange rollout now includes:

- checkout payment-method gating by buyer country
- AfriExchange payment request creation from PlugNG backend
- hosted buyer redirect to AfriExchange `/pay/:transactionId`
- buyer return redirect back to PlugNG success page
- signed webhook verification
- webhook-driven order reconciliation
- pending-order resume / retry behavior
- admin visibility for AfriExchange orders and revenue

## What Exists Today

### Frontend checkout

The shop checkout page is now provider-aware.

Current checkout behavior:

- `NG` buyer country shows `card` and `wallet`
- supported XOF buyer countries show `AfriExchange`

References:

- [frontend/src/app/(shop)/checkout/page.tsx](../frontend/src/app/(shop)/checkout/page.tsx)
- [frontend/src/context/CheckoutContext.tsx](../frontend/src/context/CheckoutContext.tsx)

Current hosted AfriExchange flow:

1. Buyer selects XOF shipping country and `AfriExchange`.
2. Frontend calls `orderApi.create(...)`.
3. Backend creates a pending order and creates AfriExchange payment request.
4. Frontend redirects buyer to the returned hosted `paymentUrl`.
5. Buyer logs in and pays on AfriExchange hosted page.
6. AfriExchange redirects buyer back to PlugNG success page.
7. PlugNG waits for signed webhook confirmation before showing final success.

### Backend order flow

The backend order controller now supports:

- `card`
- `bank_transfer`
- `wallet`
- `cash_on_delivery`
- `afriexchange`

References:

- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)
- [backend/src/models/Order.ts](../backend/src/models/Order.ts)
- [backend/src/routes/order.routes.ts](../backend/src/routes/order.routes.ts)

Important current behavior:

1. Orders are created with `paymentStatus: 'pending'`.
2. `card` and `bank_transfer` use Paystack flow.
3. `wallet` is settled immediately inside PlugNG.
4. `afriexchange` creates hosted payment request and stays pending until webhook reconciliation.
5. Success page polls `GET /api/v1/orders/verify` and waits for order state transition to `paid`.

### Webhook surface

PlugNG now has a dedicated AfriExchange webhook receiver route:

- `POST /api/v1/webhooks/afriexchange`

References:

- [backend/src/app.ts](../backend/src/app.ts)
This is the core merchant-side reconciliation surface required by Path A.

## What Was Added During Integration

### 1. AfriExchange payment method in checkout UI

Implemented in:

- [frontend/src/app/(shop)/checkout/page.tsx](../frontend/src/app/(shop)/checkout/page.tsx)

### 2. AfriExchange order-init path in backend

Implemented in:

- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)
- [backend/src/services/afriExchangeService.ts](../backend/src/services/afriExchangeService.ts)

### 3. Signed webhook verification and reconciliation

Implemented in:

- [backend/src/routes/afriExchangeWebhook.routes.ts](../backend/src/routes/afriExchangeWebhook.routes.ts)
- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)
- [backend/src/app.ts](../backend/src/app.ts)

### 4. AfriExchange-specific order metadata

Implemented in:

- [backend/src/models/Order.ts](../backend/src/models/Order.ts)

Stored fields now include:

- transaction id
- reference
- payment URL
- token type
- amount
- quote
- status
- last webhook event
- last webhook timestamp
- verified timestamp
- webhook event history

### 5. Provider-aware success page

Implemented in:

- [frontend/src/app/(shop)/checkout/success/page.tsx](../frontend/src/app/(shop)/checkout/success/page.tsx)

### 6. Pending-payment resume flow

Implemented in:

- customer orders list
- customer order detail
- backend retry endpoint for AfriExchange hosted payment refresh

## Final Path A Contract For PlugNG

To keep this integration clean, PlugNG should treat AfriExchange as a separate external payment rail.

### Suggested payment method id

Use:

- `afriexchange`

This should be added consistently to:

- frontend checkout selection
- backend request handling
- order schema enum
- admin reporting filters

### Backend env vars

Use these as the core Path A config:

- `AFRIEXCHANGE_ENABLED`
- `AFRIEXCHANGE_API_BASE_URL`
- `AFRIEXCHANGE_MERCHANT_API_KEY`
- `AFRIEXCHANGE_WEBHOOK_SECRET`
- `AFRIEXCHANGE_RETURN_URL`
- `FRONTEND_URL`

## What Was Hardened During Rollout

These were real rollout fixes, not just planned design ideas:

1. Hosted buyer payment page support on AfriExchange.
2. Buyer return redirect support using merchant `return_url`.
3. URL sanitization fixes for stored `return_url`.
4. Idempotent merchant payment request reuse by `reference`.
5. Public access to pending hosted payment requests on AfriExchange.
6. PlugNG success-page waiting logic for webhook confirmation.
7. Pending-order resume and retry support.
8. Webhook reconciliation hardening so non-critical side effects do not keep completed payments stuck in `pending`.

## Remaining Optional Work

Path A is now implemented.

What remains is mostly operational or product polish:

1. dedicated AfriExchange collections reporting page in PlugNG admin
2. richer stale-pending / expiry policy
3. future linked-wallet checkout mode

Only after that should we expose the AfriExchange payment option in the PlugNG checkout UI.
