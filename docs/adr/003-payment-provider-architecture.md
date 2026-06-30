# ADR-003: Payment Provider Architecture

Status: Accepted
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund will separate business logic from payment provider integrations.

The platform will own all business decisions, while external payment providers are responsible only for executing financial operations such as payment collection and fund transfers.

The MVP will integrate with **Nomba** as the initial payment provider.

---

# Context

UnityFund is a financial management platform, not a payment gateway.

Organizations use UnityFund to manage funds, contributions, approvals, collection cycles, and payouts.

Payment providers facilitate the movement of money but should not define the platform's business behavior.

This separation ensures that UnityFund remains independent of any single provider.

---

# Architectural Principle

UnityFund owns business decisions.

Payment providers execute financial operations.

```text
Business Event
        │
        ▼
Business Rules Engine
        │
        ▼
Payment Service
        │
        ▼
Payment Provider
        │
        ▼
Webhook
        │
        ▼
UnityFund
```

The Business Rules Engine decides **what should happen**.

The Payment Service decides **how to communicate with the provider**.

The provider performs the requested operation and reports the outcome.

---

# Responsibilities

## UnityFund

Responsible for:

* Organizations
* Funds
* Fund Rules
* Collection Cycles
* Contributions
* Payment records
* Payout records
* Approval workflows
* Reporting
* Audit logs
* Business Rules Engine

---

## Payment Provider

Responsible for:

* Payment collection
* Direct debit execution
* Transfer execution
* Payment authorization
* Payment confirmation
* Webhook delivery

---

# Why This Decision Was Made

Alternative approaches considered:

### Embed provider logic throughout the application

Rejected because:

* Couples business logic to a specific provider.
* Makes future provider changes difficult.
* Increases maintenance complexity.

### Use a provider abstraction layer

Accepted because:

* Business logic remains provider-independent.
* Future providers can be introduced with minimal impact.
* Testing becomes easier.
* Provider-specific failures are isolated.

---

# Integration Model

For the MVP:

```text
UnityFund
        │
        ▼
Payment Service
        │
        ▼
Nomba
```

Future versions:

```text
    UnityFund
        │
        ▼
Payment Service
        │
        ▼ 
      Nomba   
```

The Business Rules Engine remains unchanged regardless of the payment provider.

---

# Webhook Processing

Webhook events inform UnityFund that a financial event has occurred.

Webhooks must never:

* Decide business rules.
* Create business decisions.
* Override application state without validation.

Webhook events are verified, validated, and processed before affecting business records.

---

# Consequences

## Positive

* Provider independence.
* Easier maintenance.
* Better testability.
* Future extensibility.
* Cleaner architecture.

## Negative

* Requires an additional integration layer.
* Slightly increases implementation complexity.

---

# Related Documents

* Nomba Integration Architecture
* Payments API
* Payouts API
* Webhooks API
* ADR-006 — Business Rules Engine
* ADR-008 — Idempotency Strategy

---

# Future Considerations

Future versions may support:

* Multiple payment providers
* Provider failover
* Provider selection by organization
* Provider health monitoring

These enhancements should not require changes to UnityFund's core business logic.

---

# Summary

UnityFund treats payment providers as external infrastructure rather than core business components.

Business decisions remain within UnityFund, while payment providers execute financial operations and report verified outcomes through secure integration mechanisms.
