# Entity Relationship Design

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the first version of UnityFund’s Entity Relationship Design.

The goal is to translate the business domain into a clear data model before writing database schema, APIs, or application code.

---

## Design Principle

The database should reflect the business domain.

UnityFund is built around this core relationship:

```text
Organization → Fund → Collection Cycle → Contribution → Payment
```

Funds are the center of the system. Payments exist to confirm contributions, and contributions exist inside collection cycles.

---

## Core Entities

### users

Represents a person who can log in to UnityFund.

### organizations

Represents a member-based organization using UnityFund.

### organization_members

Connects users to organizations and stores their organization-level role/status.

### funds

Represents a financial fund created by an organization.

### fund_members

Connects organization members to specific funds.

### fund_rules

Stores configurable rules for each fund.

### collection_cycles

Represents a collection period for a fund.

### contributions

Represents an expected member payment inside a collection cycle.

### payments

Represents confirmed or attempted payments linked to contributions.

### payouts

Represents money sent out according to fund rules.

### mandates

Stores recurring payment authorization details where applicable.

### notifications

Stores user-facing notifications.

### audit_logs

Stores important financial and administrative actions.

---

## High-Level ERD

```text
users
  │
  └── organization_members
          │
          ├── organizations
          │       │
          │       ├── funds
          │       │     │
          │       │     ├── fund_rules
          │       │     ├── fund_members
          │       │     ├── collection_cycles
          │       │     │       │
          │       │     │       └── contributions
          │       │     │               │
          │       │     │               └── payments
          │       │     │
          │       │     └── payouts
          │       │
          │       ├── notifications
          │       └── audit_logs
          │
          └── users
```

---

## Relationship Summary

| Entity              | Relationship                          |
| ------------------- | ------------------------------------- |
| User                | Can belong to many organizations      |
| Organization        | Has many members                      |
| Organization        | Has many funds                        |
| Organization Member | Can participate in many funds         |
| Fund                | Has many fund members                 |
| Fund                | Has one rules configuration           |
| Fund                | Has many collection cycles            |
| Collection Cycle    | Has many contributions                |
| Contribution        | Belongs to one member and one cycle   |
| Contribution        | May have one or more payment attempts |
| Payment             | Belongs to one contribution           |
| Fund                | May have many payouts                 |
| User                | May have many notifications           |
| Organization        | Has many audit logs                   |

---

## Relationship Details

### User → Organization Member

A user can belong to multiple organizations.

Example:

One person may be a member of:

* A cooperative society
* An alumni association
* A staff welfare association

This relationship is represented through `organization_members`.

---

### Organization → Fund

An organization can create multiple funds.

Example:

A cooperative may have:

* Annual Dues
* Savings Fund
* Welfare Fund
* Rotational Savings Fund

Each fund belongs to one organization.

---

### Organization Member → Fund Member

Not every organization member belongs to every fund.

`fund_members` determines which members participate in a specific fund.

---

### Fund → Fund Rules

Every fund must have rules.

Fund rules determine how the fund behaves.

Examples:

* Contribution amount
* Frequency
* Payout allowed
* Approval required
* Partial payment allowed

---

### Fund → Collection Cycle

A fund can have many collection cycles.

Example:

A monthly savings fund will have one cycle per month.

---

### Collection Cycle → Contribution

Each cycle generates expected contributions for enrolled fund members.

Example:

If a fund has 30 members, one cycle may generate 30 contribution records.

---

### Contribution → Payment

A contribution may have one or more payment attempts.

This supports:

* Failed payments
* Retried payments
* Partial payments where allowed
* Final successful payment

A contribution is only marked as paid after valid payment confirmation.

---

### Fund → Payout

A fund may have payouts only if the fund rules allow it.

Examples:

* Rotational Savings payout
* Welfare payout
* Emergency payout

Funds such as Annual Dues may not produce member payouts.

---

## Important Data Integrity Rules

1. A fund must belong to an organization.
2. A collection cycle must belong to a fund.
3. A contribution must belong to a collection cycle.
4. A payment must be linked to a contribution.
5. A payout must be linked to a fund.
6. Duplicate payment webhook events must not create duplicate payments.
7. Financial history should not be silently deleted.
8. Audit logs should be append-only from the user’s perspective.

---

## Notes for Schema Design

The schema should support:

* UUID primary keys.
* Foreign key constraints.
* Unique constraints for webhook references.
* Status fields using enums or controlled values.
* Timestamps for all major entities.
* Soft deletion or archival for sensitive financial records.
* Indexes on frequently queried fields.

---

## Summary

The ERD confirms that UnityFund’s data model should be centered around Organizations and Funds.

The most important chain in the system is:

```text
Organization → Fund → Collection Cycle → Contribution → Payment
```

This structure supports different fund types while keeping the core data model consistent.
