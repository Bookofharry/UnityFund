# Bank Accounts API

Status: Draft
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Purpose

This document defines the API for managing member bank accounts within UnityFund.

A bank account is the destination for a payout transfer via Nomba. Before a payout can be executed, the recipient must have at least one registered and verified bank account on file.

Bank accounts are distinct from Direct Debit mandates. Mandates authorize automatic debits from a member's account. Bank accounts registered here are for receiving transfers (payouts).

---

## Scope

This document covers:

* Registering a bank account
* Listing a member's bank accounts
* Viewing a bank account
* Updating a bank account (e.g., setting as default)
* Removing a bank account
* Verifying a bank account via Nomba account lookup

This document does not cover:

* Direct Debit mandates (see Mandates API)
* Payout execution (see Payouts API)
* The actual Nomba Transfer call (see Nomba Integration Architecture)

---

## Business Rules

* A bank account belongs to an organization member.
* A member may register multiple bank accounts, but only one may be marked `is_default = true` at a time.
* Setting a new account as default automatically removes the default status from the previous default account.
* A bank account should be verified before it is used for payout execution. An unverified account may only be used with explicit admin override.
* Verification is performed by calling Nomba's account name enquiry API and confirming the account name matches expectations.
* Removing a bank account does not affect payout records that have already been executed against it.
* A bank account that is currently the target of a `processing` payout cannot be removed until the payout is resolved.

---

## Bank Account Verification

Before executing a payout, the recipient's bank account should be verified. Verification confirms:

1. The account number is valid at the specified bank.
2. The account name returned by the bank matches the member's registered name.

Verification is performed by calling Nomba's account name enquiry endpoint. UnityFund stores the result and sets `is_verified = true` if the name matches.

Verification is a pre-execution check, not a guarantee. Bank accounts can become invalid after verification (account closed, frozen). This risk is accepted and handled through payout failure workflows.

---

## Endpoints

### Register Bank Account

```http
POST /api/organizations/:organizationId/members/:memberId/bank-accounts
```

Registers a new bank account for a member.

Expected request:

```json
{
  "accountNumber": "0123456789",
  "bankCode": "058",
  "bankName": "Guaranty Trust Bank",
  "isDefault": true
}
```

`accountNumber` must be stored as a string to preserve leading zeros.

`bankCode` is the CBN-assigned bank code used by Nomba for account identification.

Expected response:

```json
{
  "message": "Bank account registered",
  "bankAccount": {
    "id": "uuid",
    "accountNumber": "0123456789",
    "bankCode": "058",
    "bankName": "Guaranty Trust Bank",
    "accountName": null,
    "isVerified": false,
    "isDefault": true,
    "status": "active",
    "createdAt": "2026-06-28T10:00:00Z"
  }
}
```

`accountName` is `null` until verification is completed. `isVerified` is `false` until the account is verified via the verify endpoint.

If `isDefault` is `true` and the member already has a default account, the previous default is automatically updated to `isDefault = false`.

Authorization:

* Organization Admin
* The member themselves

---

### Verify Bank Account

```http
POST /api/organizations/:organizationId/bank-accounts/:accountId/verify
```

Triggers a Nomba account name enquiry to verify the bank account.

Expected request: empty body

Expected response (verification successful):

```json
{
  "message": "Bank account verified",
  "bankAccount": {
    "id": "uuid",
    "accountNumber": "0123456789",
    "bankCode": "058",
    "bankName": "Guaranty Trust Bank",
    "accountName": "AMAKA NGOZI OBI",
    "isVerified": true,
    "isDefault": true
  }
}
```

Expected response (verification failed — name mismatch):

```json
{
  "message": "Verification failed",
  "reason": "Account name returned by bank does not match member name",
  "returnedAccountName": "JOHN ADEWALE SMITH"
}
```

On name mismatch, `is_verified` remains `false`. The returned account name is shown so the admin or member can decide whether to proceed or use a different account.

Authorization:

* Organization Admin
* Treasurer

---

### List Member Bank Accounts

```http
GET /api/organizations/:organizationId/members/:memberId/bank-accounts
```

Returns all registered bank accounts for a member.

Expected response:

```json
{
  "bankAccounts": [
    {
      "id": "uuid",
      "accountNumber": "0123456789",
      "bankCode": "058",
      "bankName": "Guaranty Trust Bank",
      "accountName": "AMAKA NGOZI OBI",
      "isVerified": true,
      "isDefault": true,
      "status": "active",
      "createdAt": "2026-06-28T10:00:00Z"
    }
  ]
}
```

Authorization:

* Treasurer
* Organization Admin
* The member themselves (own accounts only)

---

### Get Bank Account

```http
GET /api/organizations/:organizationId/bank-accounts/:accountId
```

Returns the details of a specific bank account.

Authorization:

* Treasurer
* Organization Admin
* The member who owns the account

---

### Update Bank Account

```http
PATCH /api/organizations/:organizationId/bank-accounts/:accountId
```

Updates editable bank account fields.

Currently supported updates:

```json
{
  "isDefault": true
}
```

Setting `isDefault: true` automatically removes the default status from any other account belonging to the same member.

Authorization:

* Organization Admin
* The member themselves

---

### Remove Bank Account

```http
DELETE /api/organizations/:organizationId/bank-accounts/:accountId
```

Removes a bank account. This is a logical removal — the `status` is set to `inactive`.

Expected response:

```json
{
  "message": "Bank account removed"
}
```

Authorization:

* Organization Admin
* The member themselves

Business Rules:

* A bank account cannot be removed if it is the target of an in-progress payout (`status = processing`).
* Removing a bank account does not affect historical payout records.
* If the removed account was the default, the member will have no default account until they set a new one.

---

## Authorization Matrix

| Action                    | Member (own) | Treasurer | Organization Admin |
| ------------------------- | :----------: | :-------: | :----------------: |
| Register bank account     |       ✓      |     ✗     |          ✓         |
| Verify bank account       |       ✗      |     ✓     |          ✓         |
| List own accounts         |       ✓      |     ✓     |          ✓         |
| List org member accounts  |       ✗      |     ✓     |          ✓         |
| View account              |       ✓      |     ✓     |          ✓         |
| Set as default            |       ✓      |     ✗     |          ✓         |
| Remove account            |       ✓      |     ✗     |          ✓         |

---

## Payout Execution Dependency

The Payouts API (`POST /api/payouts/:payoutId/execute`) requires the recipient to have at least one `active` and `is_verified = true` bank account before the transfer can be initiated.

The payout execution flow:

1. Identify recipient from `payouts.recipient_member_id`
2. Find their default bank account where `is_default = true AND is_verified = true AND status = 'active'`
3. If no verified default account exists, reject execution with an appropriate error
4. Use the `account_number` and `bank_code` when calling Nomba's Transfer API

---

## Audit Requirements

The system should record:

* Bank account registered
* Bank account verified (success or failure)
* Bank account set as default
* Bank account removed

---

## Error Scenarios

* Organization not found
* Member not found
* Bank account not found
* Member does not belong to this organization
* Duplicate account number at the same bank for the same member
* Nomba account verification request failed
* Bank account is the target of an active payout and cannot be removed
* Unauthorized action

---

## Security Notes

* Account numbers should never be masked or truncated in internal records (needed for Nomba API calls), but may be partially masked in UI displays (e.g., `****6789`).
* The `accountName` returned from Nomba's verification API should be stored as-is for audit purposes.
* Bank account data is sensitive personal financial information and must be protected under NDPR (Nigeria Data Protection Act 2023).

---

## Open Questions

* Should UnityFund support multiple currencies beyond NGN for bank accounts in future versions?
* Should the verification step be triggered automatically when a bank account is registered, rather than requiring an explicit call?
* Should admins be able to mark an account as verified manually (e.g., for accounts pre-verified by the organization outside UnityFund)?

---

## Related Documents

* Payouts API
* Mandates API
* Nomba Integration Architecture
* ADR-003 — Payment Provider Architecture
* ADR-011 — MVP Pre-Build Risk Fixes

---

## Review Checklist

* [ ] Bank account verification flow is correctly delegated to Nomba
* [ ] Payout dependency (verified default account) is documented
* [ ] Default account management is clear
* [ ] Removal restrictions are defined
* [ ] Ready for implementation review

---

## Summary

The Bank Accounts API provides the mechanism for registering and verifying the destination accounts used for Nomba payout transfers. Without at least one verified bank account for a recipient, payout execution cannot be completed. This API was missing from the original architecture and is required before any payout functionality can be built.
