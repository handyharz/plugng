# PlugNG AfriExchange Checkout Modes

Date: May 10, 2026

## Purpose

This document explains the recommended product model for AfriExchange checkout inside PlugNG.

## Mode A

### Hosted AfriExchange Checkout

This is the current PlugNG implementation.

Flow:

1. Buyer selects `AfriExchange` in PlugNG checkout.
2. PlugNG creates an AfriExchange payment request.
3. Buyer is redirected to AfriExchange hosted payment page `/pay/:transactionId`.
4. Buyer logs in there with a normal AfriExchange buyer account.
5. Buyer completes payment there.
6. AfriExchange redirects buyer back to PlugNG success page.
7. AfriExchange sends webhook back to PlugNG.
8. PlugNG marks the order paid after webhook confirmation.

Benefits:

- fastest to launch
- lowest risk
- clean standard Path A merchant flow
- no buyer wallet-linking UI needed inside PlugNG

Tradeoffs:

- buyer leaves PlugNG to complete payment
- repeat checkout is less seamless than a linked-wallet flow
- buyer success state depends on webhook reconciliation, not just redirect return

## Mode B

### Linked AfriExchange Wallet Checkout

This is a future product enhancement, not the current PlugNG requirement.

Flow:

1. Buyer links AfriExchange account in PlugNG profile.
2. PlugNG verifies account ownership.
3. Checkout recognizes linked AfriExchange account.
4. Buyer pays through a more native PlugNG experience.

Benefits:

- better UX
- less redirect friction
- stronger repeat-buyer convenience

Tradeoffs:

- more implementation work
- requires buyer identity-linking flow
- requires ownership verification flow
- requires additional support and wallet readiness UX

## Recommended Product Strategy

### Phase 1

Launch with:

- `Mode A` only

Why:

- it matches standard Path A merchant behavior
- it is already integrated
- it is easier to test and support
- it now has hosted return flow and pending-order resume support

### Phase 2

Add optional:

- `Mode B`

Why:

- only after Mode A payment creation, webhook delivery, and order reconciliation are proven stable in production

## Recommended Settings Model

PlugNG settings should eventually support:

- `AfriExchange Enabled`
- `AfriExchange Checkout Mode`
- `Allowed Countries`
- `Default Market`
- `Merchant Connected`
- `Webhook Status`

Suggested values for `AfriExchange Checkout Mode`:

- `hosted`
- `linked_wallet`
- `both`

### Meaning

- `hosted`
  Only use redirect-to-AfriExchange checkout.

- `linked_wallet`
  Only allow linked-wallet AfriExchange checkout.

- `both`
  If the user has a linked AfriExchange wallet, offer native wallet-style flow.
  Otherwise, fall back to hosted redirect checkout.

## Recommendation For PlugNG Today

Use:

- `hosted`

Do not block current rollout waiting for linked-wallet checkout.

## Why Kaalis Feels Different

Kaalis already supports a stronger buyer identity flow around AfriExchange account linking.

That is why it can feel more native.

PlugNG does not need to copy that immediately in order to be a valid Path A merchant.

## Decision Summary

Current PlugNG Path A:

- correct
- standard
- production-valid once payment and webhook flows are proven stable

Future PlugNG enhancement:

- optional linked AfriExchange wallet checkout
- should be treated as product phase two
