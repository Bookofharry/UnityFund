# ADR-001: Fund is the Primary Business Entity

Status: Accepted
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund adopts the **Fund** as the primary business entity of the platform.

All major financial operations are organized around a Fund. Collection Cycles, Contributions, Payments, Payouts, Reports, and Fund Rules exist within the context of a Fund.

This decision establishes the Fund as the central domain object and source of business context throughout the application.

---

# Context

Organizations use UnityFund to manage different financial purposes.

Examples include:

* Annual Dues
* Savings Funds
* Welfare Funds
* Emergency Funds
* Building Funds
* Rotational Savings Funds

Although these funds serve different purposes, they share a common operational lifecycle:

1. A Fund is created.
2. Rules are configured.
3. Members participate.
4. Collection Cycles generate Contributions.
5. Members make Payments.
6. Eligible Payouts are executed.
7. Reports summarize financial activity.

Treating each fund type as a separate application would introduce unnecessary complexity and duplication.

Instead, UnityFund models these variations as different configurations of the same core business entity.

---

# Domain Model

The Fund is the root of the financial domain.

```text
Organization
        │
        ▼
      Fund
        │
        ├───────────────┐
        │               │
        ▼               ▼
Fund Rules      Collection Cycles
                        │
                        ▼
                 Contributions
                        │
                        ▼
                    Payments
                        │
                        ▼
                    Payouts
```

Every financial record can ultimately be traced back to a single Fund.

---

# Business Principles

The following principles guide the design:

* Every Fund belongs to one Organization.
* Every Fund has one active Fund Rules configuration.
* Collection Cycles exist only within a Fund.
* Contributions belong to a Collection Cycle.
* Payments settle Contributions.
* Payouts are executed on behalf of a Fund.
* Reports summarize Fund activity.

The Fund provides the business context for all financial operations.

---

# Why This Decision Was Made

Alternative approaches considered included:

### Separate modules for every fund type

Rejected because:

* Duplicates business logic.
* Increases maintenance effort.
* Makes new fund types harder to introduce.

### Organization as the primary business entity

Rejected because:

* Organizations may manage multiple independent funds.
* Financial rules differ between funds.
* Reporting is fund-centric.

Choosing the Fund as the primary entity keeps the domain model focused and extensible.

---

# Consequences

## Positive

* Consistent business model.
* Reusable workflows across fund types.
* Simplified reporting.
* Easier expansion to new fund types.
* Clear ownership of financial records.

## Negative

* Requires a flexible Business Rules Engine to support different fund behaviors.
* Increases the importance of well-defined Fund Rules.

---

# Related Documents

* Vision Overview
* Domain Model
* Fund Rules API
* Collections API
* Contributions API
* Payments API
* Payouts API
* ADR-006 — Business Rules Engine

---

# Future Considerations

Future versions may introduce additional fund types without changing the core domain model.

The preferred approach is to extend Fund Rules and the Business Rules Engine rather than introducing new top-level financial entities.

---

# Summary

The Fund is the central business entity in UnityFund.

All financial operations are performed within the context of a Fund, making it the foundation of the platform's architecture, business rules, and reporting model.
