# PlugNG x AfriExchange Integration Guide

Date: May 10, 2026

## Purpose

This document explains:

- how AfriExchange is integrated into PlugNG
- how PlugNG allows AfriExchange to work directly in checkout
- which environment variables are required in backend and frontend
- how the checkout market rules work for Nigeria and XOF countries

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

### Backend variables not currently required by code

These do not need to be active in PlugNG backend right now:

- `AFRIEXCHANGE_MERCHANT_ID`
- `AFRIEXCHANGE_WEBHOOK_URL`
- `AFRIEXCHANGE_RETURN_URL`

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

## Next Recommended Evolution

After hosted Path A is proven stable, PlugNG can optionally add:

- linked AfriExchange wallet checkout
- buyer-side AfriExchange identity linking
- ownership verification
- faster repeat-buyer AfriExchange checkout

That is documented separately in:

- [PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md](./PLUGNG_AFRIEXCHANGE_CHECKOUT_MODES.md)
