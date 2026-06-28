# Fund Rules API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the API requirements for configuring and managing Fund Rules.

Fund Rules determine how a Fund behaves throughout its lifecycle. They define contribution requirements, collection schedules, payout behavior, approval requirements, penalties, and other operational settings.

The Business Rules Engine evaluates these rules whenever relevant business events occur.

---

# Scope

This document covers:

* Creating fund rules
* Viewing fund rules
* Updating fund rules
* Activating fund rules
* Rule validation

This document does not cover:

* Fund creation
* Collection cycle management
* Contributions
* Payments
* Payout execution

---

# Business Principles

Every Fund must have one active rules configuration before it can begin collecting contributions.

Fund Rules define business behavior rather than technical implementation.

The Business Rules Engine evaluates Fund Rules whenever business events occur.

---

# Responsibilities

Fund Rules may define:

* Contribution amount
* Contribution frequency
* Collection schedule
* Payment methods
* Grace period
* Late payment penalties
* Partial payment support
* Approval requirements
* Payout eligibility
* Automatic collection behavior
* Automatic collection cycle creation (future)

---

# Endpoints

## Create Fund Rules

```http
POST /api/funds/:fundId/rules
```

Creates a rules configuration for a Fund.

Authorization:

* Organization Administrator

Business Outcome:

The Fund receives its first rules configuration.

A Fund cannot have multiple active rule configurations simultaneously.

---

## Get Fund Rules

```http
GET /api/funds/:fundId/rules
```

Returns the currently active Fund Rules.

Authorization:

* Organization Members

---

## Update Fund Rules

```http
PATCH /api/funds/:fundId/rules
```

Updates editable rule settings.

Business Rules:

* Updates should be validated.
* Changes should be recorded in audit logs.
* Changes should not invalidate completed financial records.

Authorization:

* Organization Administrator

---

## Validate Fund Rules

```http
POST /api/funds/:fundId/rules/validate
```

Validates a proposed rule configuration before activation.

Validation examples:

* Contribution amount must be positive.
* End date must be after start date.
* Collection frequency must be supported.
* Payout settings must be compatible with the Fund Type.

Authorization:

* Organization Administrator

---

# Rule Categories

## Contribution Rules

Examples:

* Fixed amount
* Minimum amount
* Maximum amount
* Contribution frequency
* Due date

---

## Collection Rules

Examples:

* Monthly collections
* Weekly collections
* Annual collections
* Manual collection cycles

---

## Payment Rules

Examples:

* Allowed payment methods
* Partial payment allowed
* Grace period
* Penalty enabled

---

## Approval Rules

Examples:

* Payout approval required
* Number of required approvers
* Treasurer approval required

---

## Payout Rules

Examples:

* Payout enabled
* Scheduled payout
* Manual payout
* Rotational payout

---

# Validation Principles

Fund Rules should be internally consistent.

Examples:

A Fund cannot require payouts if payouts are disabled.

A contribution frequency must be compatible with the collection schedule.

A Fund should not define negative contribution amounts.

---

# Authorization Matrix

| Action         | Member | Treasurer | Organization Admin |
| -------------- | :----: | :-------: | :----------------: |
| View Rules     |    ✓   |     ✓     |          ✓         |
| Create Rules   |    ✗   |     ✗     |          ✓         |
| Update Rules   |    ✗   |     ✗     |          ✓         |
| Validate Rules |    ✗   |     ✗     |          ✓         |

---

# Audit Requirements

The system should record:

* Rules created
* Rules updated
* Rules activated
* Rules validation failures
* Approval requirement changes

---

# Open Questions

* Should rule changes affect active collection cycles?
* Should future versions support multiple rule versions?
* Should organizations be able to clone rules between Funds?

---

# Related ADRs

* ADR-006 — Business Rules Engine
* ADR-007 — State Transitions

---

# Review Checklist

* [ ] Aligns with Business Rules Engine
* [ ] Aligns with Fund API
* [ ] Avoids implementation details
* [ ] Ready for implementation review

---

# Summary

The Fund Rules API defines the operational behavior of every Fund in UnityFund. It provides the configuration consumed by the Business Rules Engine to ensure consistent, auditable, and predictable financial workflows.
