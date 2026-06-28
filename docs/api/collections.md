# Collections API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for managing Collection Cycles within UnityFund.

A Collection Cycle represents a scheduled contribution period for a Fund. It is responsible for generating expected contributions, tracking collection progress, and determining when a cycle begins and ends.

---

## Scope

This document covers:

* Creating collection cycles
* Viewing collection cycles
* Starting collection cycles
* Closing collection cycles
* Viewing collection progress

This document does not cover:

* Payments
* Payouts
* Fund Rules
* Member enrollment

---

## Business Rules

* Every Collection Cycle belongs to exactly one Fund.
* A Fund may have many Collection Cycles over time.
* A Fund should not have more than one active Collection Cycle unless explicitly supported in the future.
* Starting a Collection Cycle generates Contribution records for eligible Fund Members.
* Closing a Collection Cycle does not delete unpaid contributions.

---

## Endpoints

### Create Collection Cycle

```http
POST /api/funds/:fundId/collection-cycles
```

Creates a new Collection Cycle.

Required information:

* Cycle name
* Start date
* End date

Authorization:

* Organization Admin

Business Outcome:

A new Collection Cycle is created in the **Draft** state.

---

### Start Collection Cycle

```http
POST /api/funds/:fundId/collection-cycles/:cycleId/start
```

Starts a Collection Cycle.

Business Process:

* Validate Fund status.
* Validate Fund Rules.
* Ensure no conflicting active cycle exists.
* Generate Contribution records for all eligible Fund Members.
* Mark the Collection Cycle as Active.
* Notify participating members.

Authorization:

* Organization Admin

Business Outcome:

Members can begin making contributions.

---

### List Collection Cycles

```http
GET /api/funds/:fundId/collection-cycles
```

Returns all Collection Cycles for a Fund.

Optional filters:

* Status
* Date range

Authorization:

* Organization Member

---

### Get Collection Cycle

```http
GET /api/funds/:fundId/collection-cycles/:cycleId
```

Returns details for a specific Collection Cycle.

Information may include:

* Cycle information
* Collection progress
* Expected amount
* Amount collected
* Outstanding balance
* Contribution statistics

---

### Close Collection Cycle

```http
POST /api/funds/:fundId/collection-cycles/:cycleId/close
```

Closes an active Collection Cycle.

Business Process:

* Stop accepting new contributions.
* Calculate collection summary.
* Mark outstanding contributions as overdue where applicable.
* Trigger any post-cycle workflows defined by Fund Rules.

Authorization:

* Organization Admin

---

## Collection Cycle Status

Supported statuses:

```text
draft
active
closed
cancelled
```

### Draft

The Collection Cycle has been created but has not started.

### Active

Members may make contributions.

### Closed

The contribution period has ended.

### Cancelled

The Collection Cycle was cancelled before completion.

---

## Collection Summary

Each Collection Cycle should provide:

* Total expected amount
* Total collected amount
* Outstanding amount
* Number of expected contributions
* Number of completed contributions
* Number of overdue contributions
* Collection percentage

---

## Authorization Matrix

| Action                  | Member | Treasurer | Organization Admin |
| ----------------------- | :----: | :-------: | :----------------: |
| View Collection Cycles  |    ✓   |     ✓     |          ✓         |
| View Collection Summary |    ✓   |     ✓     |          ✓         |
| Create Collection Cycle |    ✗   |     ✗     |          ✓         |
| Start Collection Cycle  |    ✗   |     ✗     |          ✓         |
| Close Collection Cycle  |    ✗   |     ✗     |          ✓         |

---

## Audit Requirements

The system should record:

* Collection Cycle created
* Collection Cycle started
* Collection Cycle closed
* Collection Cycle cancelled

---

## Error Scenarios

Examples include:

* Fund not found
* Collection Cycle not found
* Fund is not active
* Another active Collection Cycle already exists
* Invalid cycle dates
* Unauthorized action

---

## Open Questions

* Should Collection Cycles start automatically based on Fund Rules?
* Should administrators be allowed to reopen a closed Collection Cycle?
* Should a Collection Cycle automatically close on its end date, or require manual confirmation?
* How should missed contributions affect the next Collection Cycle?

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

The Collections API manages the lifecycle of Collection Cycles, which organize recurring contributions within a Fund. It ensures contributions are generated consistently, collection progress is measurable, and fund-specific workflows can be triggered at the appropriate stages.
