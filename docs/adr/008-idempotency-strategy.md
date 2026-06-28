# ADR-008: Idempotency Strategy

Status: Proposed
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Decision

UnityFund will implement idempotency for all operations that could cause duplicate financial or business actions.

Repeated requests representing the same business operation must produce the same outcome without creating duplicate records or side effects.

---

## Context

Distributed systems are inherently unreliable.

Clients may retry requests because of:

* Network interruptions
* Request timeouts
* Browser refreshes
* Mobile connectivity issues

External providers may also retry webhook deliveries if they do not receive a successful response.

Without idempotency, duplicate requests may lead to inconsistent financial records.

---

## Scope

Idempotency applies to:

* Payment processing
* Webhook processing
* Payout execution
* Collection cycle creation (where appropriate)
* Other financial operations identified during implementation

Read-only operations do not require idempotency.

---

## Guiding Principle

A business operation should be executed once, even if the same request is received multiple times.

---

## Idempotent Operations

### Payment Processing

Duplicate payment confirmation events must not:

* Create duplicate payment records.
* Mark the same contribution as paid multiple times.
* Trigger duplicate business workflows.

---

### Webhook Processing

Every webhook should be uniquely identified.

If the same webhook is received again:

* Verify it.
* Detect it has already been processed.
* Return a successful response without repeating business actions.

---

### Payout Execution

A payout must only be executed once.

If an execution request is repeated:

* Return the existing payout result.
* Do not initiate another transfer.

---

## Business Principles

The platform should:

* Detect duplicate business operations.
* Prevent duplicate financial side effects.
* Preserve auditability.
* Produce consistent outcomes for repeated requests.

---

## Implementation Guidance

The implementation should:

* Use unique business identifiers where appropriate.
* Store provider reference identifiers for reconciliation.
* Record processing status for idempotent operations.
* Perform duplicate checks before executing financial actions.

The specific storage strategy is an implementation detail and is intentionally left out of this ADR.

---

## Audit Requirements

The system should record:

* Duplicate webhook detected
* Duplicate payment request ignored
* Duplicate payout execution prevented
* Idempotent request successfully reused

---

## Consequences

### Positive

* Prevents duplicate payments.
* Prevents duplicate payouts.
* Improves reliability.
* Supports safe retries.
* Simplifies recovery from temporary failures.

### Negative

* Adds implementation complexity.
* Requires careful design of unique identifiers and duplicate detection.

---

## Future Considerations

Future versions may expand idempotency to additional workflows, background jobs, and integrations as the platform grows.

---

## Summary

UnityFund will treat idempotency as a platform-wide reliability principle rather than a webhook-specific feature.

Every financial operation must be safe to retry without creating duplicate business outcomes or compromising financial integrity.
