# Contributions API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the API requirements for managing Contributions within UnityFund.

A Contribution represents the financial obligation of a Fund Member for a specific Collection Cycle.

Contributions are generated when a Collection Cycle starts and remain the authoritative record of what each member is expected to pay.

Payments settle Contributions.

---

# Scope

This document covers:

* Listing contributions
* Viewing contribution details
* Tracking contribution status
* Outstanding contributions
* Member contribution history
* Contribution summaries

This document does not cover:

* Payment processing
* Collection Cycle creation
* Fund configuration
* Payouts

---

# Business Principles

Every Contribution:

* Belongs to exactly one Collection Cycle.
* Belongs to exactly one Fund Member.
* Has one expected amount.
* May have multiple Payment attempts.
* Is settled only after verified payments satisfy the expected amount.

Contributions represent obligations, not payments.

---

# Contribution Lifecycle

```text
Collection Cycle Started
        │
        ▼
Contribution Created
        │
        ▼
Awaiting Payment
        │
        ▼
Partial Payment (optional)
        │
        ▼
Fully Paid
        │
        ▼
Closed
```

If payment is not received before the due date, the Contribution may become overdue according to the Fund Rules.

---

# Endpoints

## List Contributions

```http
GET /api/contributions
```

Returns Contributions visible to the authenticated user.

Supported filters:

* Organization
* Fund
* Collection Cycle
* Member
* Status
* Due Date

---

## Get Contribution

```http
GET /api/contributions/:contributionId
```

Returns details for a single Contribution.

Information may include:

* Member
* Fund
* Collection Cycle
* Expected Amount
* Paid Amount
* Outstanding Amount
* Status
* Due Date
* Payment History

---

## Member Contributions

```http
GET /api/members/:memberId/contributions
```

Returns all Contributions for a specific Fund Member.

Supported filters:

* Fund
* Collection Cycle
* Status

---

## Collection Cycle Contributions

```http
GET /api/collection-cycles/:cycleId/contributions
```

Returns Contributions generated for a Collection Cycle.

This endpoint supports collection monitoring and reporting.

---

## Contribution Summary

```http
GET /api/contributions/summary
```

Returns aggregated Contribution information.

Example metrics:

* Total Expected
* Total Paid
* Outstanding Balance
* Overdue Contributions
* Collection Percentage

---

# Contribution Status

Supported statuses:

```text
pending
partial
paid
overdue
cancelled
```

### Pending

The Contribution has been created but no verified payment has been received.

### Partial

A verified payment has been received, but the expected amount has not yet been reached.

### Paid

Verified payments satisfy the expected amount.

### Overdue

The Contribution remains unpaid after its due date.

### Cancelled

The Contribution is no longer payable because it has been cancelled according to business rules.

---

# Authorization Matrix

| Action                          | Member | Treasurer | Organization Admin |
| ------------------------------- | :----: | :-------: | :----------------: |
| View Own Contributions          |    ✓   |     ✓     |          ✓         |
| View Organization Contributions |    ✗   |     ✓     |          ✓         |
| View Contribution Summary       |    ✗   |     ✓     |          ✓         |

Contribution creation is managed by the Business Rules Engine when Collection Cycles begin.

---

# Business Rules

* Contributions are generated automatically when a Collection Cycle starts.
* Contributions should not be manually created through the public API.
* Verified Payments update Contributions.
* Multiple Payment attempts may exist for one Contribution.
* Contribution history should remain available even if the member leaves the organization.

---

# Audit Requirements

The system should record:

* Contribution created
* Contribution status changed
* Contribution marked overdue
* Contribution cancelled

---

# Error Scenarios

Examples include:

* Contribution not found
* Unauthorized access
* Collection Cycle not found
* Invalid filter values

---

# Open Questions

* Should administrators be able to waive a Contribution?
* Should overdue Contributions automatically incur penalties when enabled by Fund Rules?
* Should Contributions support installment plans in future versions?

---

# Related ADRs

* ADR-006 — Business Rules Engine
* ADR-007 — State Transitions
* ADR-008 — Idempotency Strategy

---

# Review Checklist

* [ ] Aligns with Collection Cycle API
* [ ] Aligns with Payments API
* [ ] Aligns with Business Rules Engine
* [ ] Avoids implementation details
* [ ] Ready for implementation review

---

# Summary

The Contributions API manages the financial obligations generated for Fund Members during Collection Cycles. It serves as the authoritative record of expected payments and provides the foundation for payment reconciliation, collection reporting, and financial progress tracking.
