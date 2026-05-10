# PlugNG x AfriExchange Integration Guide

Date: May 10, 2026

## Purpose

This document explains:

- how AfriExchange is integrated into PlugNG
- how PlugNG allows AfriExchange to work directly in checkout
- which environment variables are required in backend and frontend
- how the checkout market rules work for Nigeria and XOF countries
- what the buyer sees during hosted AfriExchange checkout
- how redirect, webhook confirmation, and resume-payment behavior work

## Integration Model

PlugNG currently uses `AfriExchange Path A` as a standard merchant integration.

That means:

1. PlugNG creates an AfriExchange merchant payment request.
2. PlugNG redirects the buyer to AfriExchange to complete payment.
3. AfriExchange sends a signed webhook back to PlugNG.
4. PlugNG verifies the webhook signature.
5. PlugNG updates the matching order as paid when the payment event is valid.

This is a valid Path A flow.

It is different from the tighter Kaalis-style wallet-linked flow.

## How PlugNG Uses AfriExchange

### Backend responsibilities

PlugNG backend handles:

- creating AfriExchange payment requests
- storing AfriExchange payment metadata on orders
- verifying incoming AfriExchange webhooks
- reconciling AfriExchange events to the correct PlugNG order

Main files:

- [backend/src/services/afriExchangeService.ts](../backend/src/services/afriExchangeService.ts)
- [backend/src/controllers/order.controller.ts](../backend/src/controllers/order.controller.ts)
- [backend/src/routes/afriExchangeWebhook.routes.ts](../backend/src/routes/afriExchangeWebhook.routes.ts)
- [backend/src/app.ts](../backend/src/app.ts)
- [backend/src/models/Order.ts](../backend/src/models/Order.ts)

### Frontend responsibilities

PlugNG frontend handles:

- showing AfriExchange as a checkout option when allowed
- redirecting the user to the returned AfriExchange payment URL
- returning to a success page that can verify the order state
- showing a recoverable loading state if the hosted redirect is slow
- allowing the buyer to resume pending AfriExchange orders from order history

Main files:

- [frontend/src/app/(shop)/checkout/page.tsx](../frontend/src/app/(shop)/checkout/page.tsx)
- [frontend/src/context/CheckoutContext.tsx](../frontend/src/context/CheckoutContext.tsx)
- [frontend/src/app/(shop)/checkout/success/page.tsx](../frontend/src/app/(shop)/checkout/success/page.tsx)
- [frontend/src/lib/api.ts](../frontend/src/lib/api.ts)

## Current Checkout Behavior

### Nigeria checkout

If the selected shipping country is `NG`, PlugNG shows:

- `card`
- `wallet`

### XOF checkout

If the selected shipping country is one of the supported XOF countries, PlugNG shows:

- `AfriExchange`

Supported XOF countries in the current frontend:

- `SN` Senegal
- `CI` Cote d'Ivoire
- `BJ` Benin
- `BF` Burkina Faso
- `ML` Mali
- `NE` Niger
- `TG` Togo
- `GW` Guinea-Bissau

Important:

- checkout visibility is based on the buyer's selected shipping country
- it is not based on the merchant business profile country alone

So if a merchant is based in Senegal but the buyer checkout country is still `NG`, PlugNG will still show Nigerian payment rails instead of AfriExchange.

## How AfriExchange Works Directly In PlugNG

“Works directly in PlugNG” currently means:

- the buyer sees AfriExchange as a native PlugNG payment option
- PlugNG creates the payment request itself
- PlugNG keeps the order and reconciliation logic in its own system
- AfriExchange is used as the external hosted payment completion surface

This is not yet the same thing as a fully embedded linked-wallet checkout.

Today’s direct integration is:

- native payment option in PlugNG UI
- native order creation in PlugNG backend
- hosted payment completion on AfriExchange
- native webhook reconciliation back into PlugNG

## Hosted Buyer Experience

The current live PlugNG Path A buyer flow is:

1. Buyer chooses an XOF country at checkout.
2. Buyer selects `AfriExchange`.
3. PlugNG creates a pending order and requests a hosted AfriExchange payment.
4. Buyer is redirected to an AfriExchange hosted payment page at `/pay/:transactionId`.
5. Buyer logs in there with a normal AfriExchange buyer account and pays from their CT balance.
6. AfriExchange redirects the buyer back to PlugNG success page.
7. PlugNG waits for signed webhook confirmation before marking the order paid.

Important:

- the buyer does **not** use AfriExchange admin login
- the buyer does **not** use merchant login
- the buyer uses the hosted payment page returned by `payment_url`
- PlugNG Path A does **not** require pre-linking the buyer wallet the way Kaalis does

## Webhook Contract

PlugNG expects AfriExchange to send:

- `x-afriexchange-timestamp`
- `x-afriexchange-signature`

Signature format:

- `sha256=<hex hmac>`

Verification formula:

- `HMAC_SHA256(secret, timestamp + "." + rawBody)`

If the webhook secret in PlugNG does not match the merchant webhook secret in AfriExchange, PlugNG will return:

- `401 Invalid AfriExchange webhook signature`

If the webhook is valid but does not match an order, PlugNG may return:

- `200 ignored`

That is expected for sandbox ping events.

## Backend Environment Variables

Use these in `plugng-shop/backend/.env` locally and in Render for deployed backend.

Required:

```env
AFRIEXCHANGE_ENABLED=true
AFRIEXCHANGE_API_BASE_URL=https://afrix-iqvq.onrender.com/api/v1
AFRIEXCHANGE_MERCHANT_API_KEY=your_real_afriexchange_merchant_api_key
AFRIEXCHANGE_DEFAULT_TOKEN_TYPE=CT
AFRIEXCHANGE_NGN_TO_XOF_RATE=0.37
AFRIEXCHANGE_WEBHOOK_SECRET=your_real_afriexchange_webhook_secret
AFRIEXCHANGE_RETURN_URL=https://plugng.shop/checkout/success?provider=afriexchange
FRONTEND_URL=https://plugng.shop
```

What each variable does:

- `AFRIEXCHANGE_ENABLED`
  Enables the backend AfriExchange payment branch.

- `AFRIEXCHANGE_API_BASE_URL`
  Base URL for AfriExchange merchant API.

- `AFRIEXCHANGE_MERCHANT_API_KEY`
  Merchant API key copied from AfriExchange merchant portal.

- `AFRIEXCHANGE_DEFAULT_TOKEN_TYPE`
  Token used for XOF Path A settlement. Current expected value is `CT`.

- `AFRIEXCHANGE_NGN_TO_XOF_RATE`
  Conversion quote used to transform NGN storefront totals into XOF quote amounts for AfriExchange checkout.

- `AFRIEXCHANGE_WEBHOOK_SECRET`
  Shared verification secret used by PlugNG to validate incoming AfriExchange webhooks.

- `AFRIEXCHANGE_RETURN_URL`
  The PlugNG URL AfriExchange should send the buyer back to after hosted payment is completed.

- `FRONTEND_URL`
  Fallback frontend base URL used by PlugNG checkout and payment-return logic.

### Backend variables not currently required by code

These do not need to be active in PlugNG backend right now:

- `AFRIEXCHANGE_MERCHANT_ID`
- `AFRIEXCHANGE_WEBHOOK_URL`

The merchant webhook URL is configured in the AfriExchange merchant portal, not currently read from PlugNG backend env.

## Frontend Environment Variables

Use these in local frontend env and Vercel frontend env.

Required:

```env
NEXT_PUBLIC_API_URL=https://plugng.onrender.com/api/v1
NEXT_PUBLIC_AFRIEXCHANGE_ENABLED=true
NEXT_PUBLIC_NGN_TO_XOF_RATE=0.37
```

What each variable does:

- `NEXT_PUBLIC_API_URL`
  Frontend API base URL for PlugNG backend.

- `NEXT_PUBLIC_AFRIEXCHANGE_ENABLED`
  Controls whether the frontend is allowed to show AfriExchange checkout for supported XOF countries.

- `NEXT_PUBLIC_NGN_TO_XOF_RATE`
  Used for displaying estimated XOF quote in checkout UI.

## Recommended Local Frontend Env

Create:

- [frontend/.env.local](../frontend/.env.local)

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8085/api/v1
NEXT_PUBLIC_AFRIEXCHANGE_ENABLED=true
NEXT_PUBLIC_NGN_TO_XOF_RATE=0.37
```

## Recommended Vercel Frontend Env

Set in Vercel project settings:

```env
NEXT_PUBLIC_API_URL=https://plugng.onrender.com/api/v1
NEXT_PUBLIC_AFRIEXCHANGE_ENABLED=true
NEXT_PUBLIC_NGN_TO_XOF_RATE=0.37
```

## Recommended Render Backend Env

Set in Render backend service:

```env
AFRIEXCHANGE_ENABLED=true
AFRIEXCHANGE_API_BASE_URL=https://afrix-iqvq.onrender.com/api/v1
AFRIEXCHANGE_MERCHANT_API_KEY=your_real_afriexchange_merchant_api_key
AFRIEXCHANGE_DEFAULT_TOKEN_TYPE=CT
AFRIEXCHANGE_NGN_TO_XOF_RATE=0.37
AFRIEXCHANGE_WEBHOOK_SECRET=your_real_afriexchange_webhook_secret
AFRIEXCHANGE_RETURN_URL=https://plugng.shop/checkout/success?provider=afriexchange
FRONTEND_URL=https://plugng.shop
```

## Merchant Portal Settings Required

In the AfriExchange merchant portal, the PlugNG merchant must have:

- approved merchant status
- a valid merchant API key
- webhook URL set to:

```txt
https://plugng.onrender.com/api/v1/webhooks/afriexchange
```

Without the webhook URL, payment completion will not reconcile correctly back into PlugNG.

The AfriExchange merchant must also have a valid hosted buyer flow deployed:

- the hosted payment page `/pay/:transactionId` must exist
- the page must allow buyer login and payment
- the payment request must preserve the merchant `return_url`

## Direct Checkout Flow

Current live-style flow:

1. Buyer selects shipping country.
2. If country is XOF and frontend feature flag is on, buyer sees `AfriExchange`.
3. Buyer places order.
4. PlugNG backend creates pending order.
5. PlugNG backend requests AfriExchange payment request.
6. PlugNG frontend redirects buyer to AfriExchange hosted payment page.
7. Buyer pays on AfriExchange.
8. AfriExchange sends signed webhook to PlugNG.
9. PlugNG verifies signature and updates the order.
10. PlugNG success page reflects final order state.

## Success Page And Webhook Confirmation

PlugNG success page intentionally waits for webhook confirmation.

That means:

- redirecting back to PlugNG does **not** immediately mean the order is paid
- the success page polls `GET /api/v1/orders/verify?reference=...`
- PlugNG only shows success once the signed AfriExchange webhook has reconciled the order

If webhook confirmation does not arrive in time, the page can show a verification failure even though the hosted payment page returned correctly.

Operationally, that usually means:

- webhook delivery failed
- webhook signature verification failed
- webhook processing crashed on PlugNG
- the order stayed `pending`

## Pending Orders And Resume Behavior

PlugNG now supports resume behavior for pending AfriExchange orders.

Buyer experience:

- pending AfriExchange orders show `Continue Payment`
- PlugNG can retry or refresh the hosted payment request
- if AfriExchange cannot issue a fresh link, PlugNG can fall back to the stored previous hosted payment URL

This means the buyer no longer has to restart checkout from the cart page just because the first hosted redirect session was interrupted.

## Operator Troubleshooting Checklist

If hosted Path A checkout does not complete correctly, check these in order:

1. Merchant is approved in AfriExchange.
2. Merchant API key is valid in PlugNG backend env.
3. PlugNG webhook URL is saved in AfriExchange merchant portal.
4. PlugNG webhook secret matches the merchant webhook secret exactly.
5. `AFRIEXCHANGE_RETURN_URL` is set in PlugNG backend env.
6. AfriExchange hosted buyer page `/pay/:transactionId` is deployed and reachable.
7. Buyer account exists on AfriExchange and has enough CT balance.
8. PlugNG webhook endpoint returns `200` for real `collection.completed` events.
9. PlugNG order moves from `pending` to `paid` after webhook delivery.

If webhook delivery is failing:

- inspect AfriExchange merchant webhook delivery logs
- inspect PlugNG Render logs for `/api/v1/webhooks/afriexchange`
- verify that PlugNG is receiving `collection.completed`

If the buyer is redirected back but PlugNG still says verification failed:

- the payment itself may already have succeeded
- the problem is usually webhook reconciliation, not hosted checkout creation
- check whether the order is still `pending` in PlugNG admin

## Common Reasons AfriExchange Does Not Show

### 1. Frontend feature flag is off

Check:

- `NEXT_PUBLIC_AFRIEXCHANGE_ENABLED=true`

### 2. Buyer country is still `NG`

Checkout uses selected shipping country, not merchant business country.

### 3. No active local frontend env file

If local frontend has no `.env.local` or `.env`, the feature flag may not be set at runtime.

### 4. Vercel env not updated

Changing only local example files does not affect production Vercel.

## Current Limitation

PlugNG is still fundamentally an NGN storefront with an XOF quote layer added for AfriExchange Path A.

That means:

- product catalog is not yet truly multi-currency
- AfriExchange checkout currently uses quoted conversion rather than a native XOF catalog

This is acceptable for the current Path A rollout, but should be understood by product and ops.

## Proven Production Notes

The final hosted PlugNG Path A flow now includes:

- hosted buyer payment page on AfriExchange
- buyer return redirect back to PlugNG success page
- signed webhook verification
- pending order resume behavior
- admin visibility for AfriExchange orders and revenue

This means merchants adopting the same model should not need to rebuild the integration logic from scratch. They mainly need:

- a valid merchant account
- correct env configuration
- correct webhook endpoint handling
- correct order reconciliation behavior

## Next Recommended Evolution

After hosted Path A is proven stable, PlugNG can optionally add:

- linked AfriExchange wallet checkout
- buyer-side AfriExchange identity linking
- ownership verification
- faster repeat-buyer AfriExchange checkout

That is documented separately in:

- [PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md](./PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md)
