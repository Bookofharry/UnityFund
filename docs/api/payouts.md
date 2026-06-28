# Payouts API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for managing payouts within UnityFund.

A payout represents the disbursement of money from a Fund after all applicable business rules have been satisfied.

UnityFund determines **whether a payout is permitted**. Nomba executes the actual transfer.

---

## Scope

This document covers:

* Creating payout requests
* Viewing payouts
* Approving payouts
* Executing payouts
* Viewing payout history

This document does not cover:

* Contribution collection
* Payment processing
* Nomba webhook implementation
* Fund configuration

---

## Business Rules

* Every payout belongs to exactly one Fund.
* Every payout must have a recipient.
* A payout must satisfy the Fund Rules before execution.
* Approval workflows must complete before payout execution when required.
* Every payout must be auditable.
* Failed payouts must not create duplicate transfers.

---

# Payout Lifecycle

```text
Payout Requested
        │
        ▼
Business Rules Evaluated
        │
        ▼
Approval Required?
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
Approval     │
Completed    │
   └────┬────┘
        ▼
Transfer Requested
        │
        ▼
Transfer Result Received
        │
        ▼
Payout Updated
        │
        ▼
Audit Log + Notifications
```

---

## Endpoints

### Create Payout Request

```http
POST /api/funds/:fundId/payouts
```

Creates a payout request.

Business Process:

* Validate Fund.
* Validate recipient.
* Evaluate Fund Rules.
* Determine whether approval is required.
* Create payout record.

Authorization:

* Organization Admin
* Treasurer (subject to organization policy)

---

### List Payouts

```http
GET /api/funds/:fundId/payouts
```

Returns payout history for a Fund.

Supported filters:

* Status
* Recipient
* Date range

Authorization:

* Organization members with appropriate permissions.

---

### Get Payout

```http
GET /api/payouts/:payoutId
```

Returns details for a specific payout.

Information may include:

* Recipient
* Amount
* Status
* Approval history
* Transfer reference
* Timeline

---

### Approve Payout

```http
POST /api/payouts/:payoutId/approve
```

Approves a payout that requires authorization.

Business Process:

* Verify approver permissions.
* Record approval.
* Determine whether all required approvals have been received.

Authorization:

* Approver
* Organization Admin (where applicable)

---

### Execute Payout

```http
POST /api/payouts/:payoutId/execute
```

Executes an approved payout.

Business Process:

* Verify payout eligibility.
* Ensure payout has not already been executed.
* Initiate transfer through Nomba.
* Record provider reference.
* Update payout status.

Authorization:

* Treasurer
* Organization Admin

---

## Payout Status

Supported statuses:

```text
draft
pending_approval
approved
processing
successful
failed
cancelled
```

### Draft

Payout request has been created.

### Pending Approval

Awaiting one or more approvals.

### Approved

Eligible for execution.

### Processing

Transfer has been initiated.

### Successful

Transfer completed successfully.

### Failed

Transfer did not complete successfully.

### Cancelled

Payout will not proceed.

---

## Authorization Matrix

| Action            | Member | Approver | Treasurer | Organization Admin |
| ----------------- | :----: | :------: | :-------: | :----------------: |
| View Own Payouts* |    ✓   |     ✓    |     ✓     |          ✓         |
| View All Payouts  |    ✗   |     ✓    |     ✓     |          ✓         |
| Request Payout**  |    ✓   |     ✓    |     ✓     |          ✓         |
| Approve Payout    |    ✗   |     ✓    |     ✗     |          ✓         |
| Execute Payout    |    ✗   |     ✗    |     ✓     |          ✓         |

* Where applicable to the fund type.

** Subject to the rules of the specific Fund.

---

## Audit Requirements

The system should record:

* Payout requested
* Approval granted
* Approval rejected
* Transfer initiated
* Transfer completed
* Transfer failed
* Payout cancelled

---

## Error Scenarios

Examples include:

* Fund not found
* Recipient not eligible
* Payout already executed
* Approval required
* Insufficient permissions
* Transfer provider unavailable
* Duplicate execution request

---

## Open Questions

* Should organizations support multi-level approval thresholds?
* Can an approved payout be revoked before execution?
* Should payouts be automatically retried after temporary provider failures?
* Should scheduled payouts be supported in a future release?

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

The Payouts API manages the controlled disbursement of funds from UnityFund. It ensures every payout follows organizational rules, required approvals, and audit requirements before any transfer is initiated through Nomba.
