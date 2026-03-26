# PlugNG App Account Deletion Flow

## Goal

Provide a store-compliant, easy-to-discover, and safe account deletion flow inside the mobile app.

This flow is designed to satisfy the practical expectations of:

- Apple App Store account deletion guidance
- Google Play account deletion requirements

It should allow users to initiate deletion from within the app without forcing them to contact support first.

## Recommended Product Decision

Use **soft deletion with immediate sign-out**.

Why:

- safer operationally than hard delete
- prevents deleted users from logging back in
- preserves records that may still be needed for order, fraud, tax, or support retention requirements
- gives the business room to anonymize or purge data later through a scheduled cleanup job

## Deletion State Model

Recommended account status values:

- `active`
- `suspended`
- `deleted`

Recommended metadata:

- `deletedAt`

Optional future metadata:

- `deletionReason`
- `deletionRequestedFrom`
- `scheduledPurgeAt`

## User Experience Placement

Place the entry point at the bottom of the **Security** screen.

Why:

- it is a destructive account action, not a regular account-management shortcut
- it fits naturally beside password update and session termination
- it keeps the main Account hub from feeling hostile or cluttered

## Mobile Flow

### 1. Destructive entry point

Low-emphasis destructive card:

- title: `Delete Account`
- body: explain that this removes access to the account and signs the user out
- action: `Start Deletion`

### 2. Consequences disclosure

Before final confirmation, clearly explain:

- profile access will end immediately
- saved addresses and wishlist access will no longer be available
- wallet access will be disabled
- order records may still be retained where legally or operationally required
- support and review history may be retained or anonymized depending on policy

### 3. Re-authentication

Require the current password.

Why:

- reduces accidental or malicious deletion
- aligns with high-risk-account-action expectations

### 4. Explicit intent confirmation

Require the user to type:

- `DELETE`

Why:

- adds a clear final friction step
- prevents accidental destructive taps

### 5. Completion

After success:

- return success response
- clear auth token
- clear local auth state
- route user out of protected flows

## Backend Behavior

### Endpoint

`DELETE /api/v1/users/me`

### Request body

```json
{
  "password": "current-password",
  "confirmation": "DELETE"
}
```

### Expected checks

- authenticated user exists
- user status is not already deleted
- password matches
- confirmation string is exactly `DELETE`

### Expected mutation

- set `status = "deleted"`
- set `deletedAt = now`

### Recommended response

```json
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

## Auth Rules After Deletion

Deleted accounts must no longer be treated as valid app users.

That means:

- login should fail for `deleted` users
- protected-route middleware should reject `deleted` users
- `me` should no longer return a deleted user as an active session

## Policy Notes

This mobile flow should be paired with:

- privacy policy language explaining retained data categories
- later addition of an external web deletion-request page for Google Play listing compliance

## Copy Direction

### Entry card

Title:

`Delete Account`

Body:

`This permanently closes your PlugNG access and signs you out across the app. Some records may still be retained where required for orders, fraud prevention, or legal compliance.`

### Final destructive button

`DELETE ACCOUNT`

### Success message

`Your account has been deleted and this session has been closed.`

## Implementation Notes

### Phase 1

- backend soft-delete endpoint
- mobile Security-screen deletion UI
- logout on success
- block deleted users from login/protected routes

### Phase 2

- external web deletion page
- data anonymization cleanup job
- admin visibility for deleted accounts
- documented retention policy by data type
