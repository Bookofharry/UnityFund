# ADR-007: State Transitions

Status: Proposed
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Decision

UnityFund will control important lifecycle changes using defined state transitions.

Entities such as Funds, Collection Cycles, Contributions, Payments, Payouts, and Mandates must only move between allowed statuses.

---

## Reason

UnityFund manages financial workflows.

If statuses can change freely, the system may allow unsafe actions such as:

* marking unpaid contributions as paid;
* executing the same payout twice;
* closing a collection cycle incorrectly;
* treating an unverified payment as successful;
* allowing inactive funds to collect money.

Defined state transitions protect financial integrity.

---

## Core Principle

A status change is not just a data update.

It represents a business event.

For example:

```text
payment: pending → successful
```

means:

> A payment has been verified and can now affect contribution records.

---

## Fund States

Allowed states:

```text
draft
active
inactive
archived
```

Allowed transitions:

```text
draft → active
active → inactive
inactive → active
inactive → archived
active → archived only if no active collection cycle exists
```

---

## Collection Cycle States

Allowed states:

```text
draft
active
closed
cancelled
```

Allowed transitions:

```text
draft → active
draft → cancelled
active → closed
active → cancelled
```

A closed cycle should not return to active in the MVP.

---

## Contribution States

Allowed states:

```text
pending
partial
paid
failed
overdue
cancelled
```

Allowed transitions:

```text
pending → partial
pending → paid
pending → failed
pending → overdue
partial → paid
partial → overdue
failed → pending
overdue → paid
pending → cancelled
```

A contribution should only become `paid` after verified payment confirmation.

---

## Payment States

Allowed states:

```text
initiated
pending
successful
failed
reversed
cancelled
pending_review
```

Allowed transitions:

```text
initiated → pending
pending → successful
pending → failed
pending → cancelled
successful → reversed
pending → pending_review
pending_review → successful
pending_review → failed
```

A payment must not become `successful` without trusted provider confirmation.

---

## Payout States

Allowed states:

```text
draft
pending_approval
approved
processing
successful
failed
cancelled
reversed
```

Allowed transitions:

```text
draft → pending_approval
draft → approved
pending_approval → approved
pending_approval → cancelled
approved → processing
processing → successful
processing → failed
failed → processing
approved → cancelled
successful → reversed
```

A payout must not move directly from `draft` to `successful`.

`successful → reversed` handles a `payout_refund` webhook arriving after the
payout has already been confirmed paid — the money moved and was then pulled
back by the provider. `reversed` is terminal; a reversed payout is not retried
automatically.

---

## Mandate States

Allowed states:

```text
pending
active
suspended
deleted
expired
```

Allowed transitions:

```text
pending → active
pending → deleted
active → suspended
active → deleted
active → expired
suspended → active
suspended → deleted
```

Mandates should only be used for debits when active.

---

## Implementation Principle

State transitions should be enforced inside business services or the Business Rules Engine.

Controllers should not directly update financial statuses.

---

## Audit Requirement

Important state transitions should create audit logs.

Examples:

* Fund activated
* Collection cycle started
* Payment confirmed
* Payout approved
* Payout executed
* Mandate suspended

---

## Consequences

### Positive

* Improves financial safety.
* Prevents invalid lifecycle movement.
* Makes business behavior predictable.
* Supports auditability.
* Makes testing easier.

### Negative

* Adds implementation discipline.
* Requires transition validation logic.
* Developers must update transition rules when new statuses are introduced.

---

## Summary

UnityFund will treat status changes as controlled business events rather than simple field updates.

This protects financial workflows and ensures that core entities move through predictable, auditable lifecycles.
