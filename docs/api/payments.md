# Payments API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for collecting, recording, and managing payments within UnityFund.

A Payment represents a financial transaction made toward a Contribution. UnityFund uses Nomba as its payment infrastructure while maintaining ownership of all business rules and payment records.

---

## Scope

This document covers:

* Initiating payments
* Viewing payment history
* Viewing payment details
* Payment status
* Payment reconciliation
* Payment lifecycle

This document does not cover:

* Nomba webhook implementation
* Fund creation
* Collection cycle management
* Payout execution

---

## Business Rules

* Every Payment must belong to exactly one Contribution.
* A Contribution may have multiple Payment attempts.
* Payments are not considered successful until verified.
* Business workflows must not rely solely on client-side payment confirmation.
* Financial records must remain auditable.

---

## Payment Methods

The MVP supports the following payment methods through Nomba where applicable:

* Direct Debit
* Checkout
* Virtual Account
* Tokenized Card (for recurring card payments where available)

The available payment methods may vary depending on the organization's configuration and the selected Fund.

---

## Payment Lifecycle

```text
Contribution Created
        │
        ▼
Payment Initiated
        │
        ▼
Awaiting Provider Result
        │
        ▼
Webhook Verification
        │
        ▼
Contribution Updated
        │
        ▼
Workflow Triggered
```

---

## Endpoints

### Initiate Payment

```http
POST /api/contributions/:contributionId/payments
```

Creates a payment request for a contribution.

Business Process:

* Validate the contribution.
* Ensure payment is still allowed.
* Determine available payment methods.
* Create a payment record.
* Initiate the payment with Nomba where required.

Authorization:

* Fund Member
* Organization Administrator (where appropriate)

---

### List Payments

```http
GET /api/payments
```

Returns payment records visible to the authenticated user.

Supported filters:

* Organization
* Fund
* Member
* Contribution
* Status
* Date range
* Payment method

---

### Get Payment

```http
GET /api/payments/:paymentId
```

Returns detailed information about a payment.

Information may include:

* Contribution reference
* Payment amount
* Payment method
* Provider reference
* Current status
* Payment timestamps

---

### List Contribution Payments

```http
GET /api/contributions/:contributionId/payments
```

Returns every payment attempt associated with a contribution.

This endpoint supports payment history, retries, and auditing.

---

## Payment Status

Supported statuses:

```text
initiated
pending
successful
failed
reversed
cancelled
pending_review
```

### Initiated

Payment request has been created.

### Pending

Awaiting confirmation from the payment provider.

### Successful

Payment has been successfully verified.

### Failed

Payment attempt did not succeed.

### Reversed

A previously successful payment has been reversed.

### Cancelled

Payment was cancelled before completion.

### Pending Review

Payment requires manual investigation before affecting business records.

---

## Reconciliation Rules

A payment should update a Contribution only after successful verification.

The reconciliation process should:

* Match the payment to the correct contribution.
* Prevent duplicate processing.
* Update contribution balances.
* Trigger business workflows.
* Record an audit log.

---

## Authorization Matrix

| Action                     | Member | Treasurer | Organization Admin |
| -------------------------- | :----: | :-------: | :----------------: |
| Initiate Payment           |    ✓   |     ✓     |          ✓         |
| View Own Payments          |    ✓   |     ✓     |          ✓         |
| View Organization Payments |    ✗   |     ✓     |          ✓         |
| Retry Failed Payment*      |    ✓   |     ✓     |          ✓         |

* Subject to fund rules and payment method availability.

---

## Audit Requirements

The system should record:

* Payment initiated
* Payment verified
* Payment failed
* Payment reversed
* Payment cancelled
* Payment manually reviewed

---

## Error Scenarios

Examples include:

* Contribution not found
* Contribution already fully paid
* Invalid payment method
* Duplicate payment request
* Payment provider unavailable
* Unauthorized action

---

## Open Questions

* Should organizations be able to disable specific payment methods?
* Should members be allowed multiple concurrent payment attempts for the same contribution?
* How long should pending payments remain valid before expiring?
* Should partially paid contributions automatically generate the remaining balance?

---

## Review Checklist

* [ ] Aligns with Vision documents
* [ ] Aligns with Business Domain
* [ ] Matches ADR decisions
* [ ] Contains only verified facts or documented product decisions
* [ ] Avoids implementation details
* [ ] Ready for implementation review

---

## Summary

The Payments API provides the entry point for collecting member contributions. It maintains a complete payment history, supports multiple payment attempts, and ensures that financial records are updated only after verified payment confirmation, preserving the integrity of UnityFund's financial operations.
