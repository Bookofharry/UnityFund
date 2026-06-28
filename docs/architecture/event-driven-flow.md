# Event-Driven Flow

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines how business events move through UnityFund.

Rather than allowing modules to directly manipulate one another, UnityFund responds to business events. This approach improves modularity, auditability, and future extensibility.

---

# Scope

This document describes:

* Business events
* Event producers
* Event consumers
* Event processing order

It does not define message brokers or infrastructure implementation.

---

# Architecture Principle

Business actions produce events.

Events trigger workflows.

Workflows update the system.

---

# Event Lifecycle

```text
Action Occurs
        │
        ▼
Business Event Created
        │
        ▼
Workflow Engine
        │
        ├── Update Database
        ├── Create Notifications
        ├── Create Audit Logs
        ├── Trigger Reports
        └── Call External Integrations (when required)
```

---

# Core Business Events

## OrganizationCreated

Triggered when:

* A new organization is successfully created.

Possible consumers:

* Audit Module
* Notification Module

---

## MemberJoinedOrganization

Triggered when:

* A member joins an organization.

Possible consumers:

* Notification Module
* Audit Module

---

## FundCreated

Triggered when:

* A new fund is created.

Possible consumers:

* Audit Module
* Dashboard

---

## CollectionCycleStarted

Triggered when:

* A collection cycle becomes active.

Possible consumers:

* Contribution Generator
* Notification Module

---

## ContributionCreated

Triggered when:

* Expected member contributions are generated.

Possible consumers:

* Dashboard
* Reports

---

## PaymentConfirmed

Triggered when:

* A payment has been successfully verified.

Possible consumers:

* Contribution Service
* Workflow Engine
* Dashboard
* Reports
* Audit Module
* Notification Module

---

## PaymentFailed

Triggered when:

* A payment attempt fails.

Possible consumers:

* Notification Module
* Dashboard

---

## PayoutRequested

Triggered when:

* A payout is initiated.

Possible consumers:

* Approval Workflow
* Audit Module

---

## PayoutCompleted

Triggered when:

* A payout is confirmed.

Possible consumers:

* Dashboard
* Notification Module
* Reports
* Audit Module

---

# External Events

External systems may also generate events.

Examples:

* Payment confirmation webhook
* Payment reversal webhook
* Transfer status update

These events must first be validated before becoming UnityFund business events.

---

# Event Processing Principles

Every event should:

* Be processed only once.
* Be auditable.
* Produce predictable outcomes.
* Avoid duplicate side effects.
* Fail safely.

---

# Summary

UnityFund is designed around business events rather than tightly coupled modules.

This allows workflows to remain consistent while making it easier to extend the platform with additional integrations and features in the future.
