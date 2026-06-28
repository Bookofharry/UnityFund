# Database Relationships

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document explains the relationships between UnityFund database entities.

While `schema.md` defines table structure, this document explains how records connect and why those relationships exist.

---

## Core Relationship Chain

UnityFund’s primary data flow is:

```text
Organization
→ Fund
→ Collection Cycle
→ Contribution
→ Payment
```

This means:

* An Organization owns Funds.
* A Fund runs Collection Cycles.
* A Collection Cycle generates Contributions.
* A Contribution is settled through one or more Payments.

---

## Relationship Summary

| Parent Entity       | Child Entity        | Relationship                                    |
| ------------------- | ------------------- | ----------------------------------------------- |
| User                | Organization Member | One user can belong to many organizations       |
| Organization        | Organization Member | One organization has many members               |
| Organization        | Fund                | One organization has many funds                 |
| Organization Member | Fund Member         | One organization member can join many funds     |
| Fund                | Fund Member         | One fund has many participating members         |
| Fund                | Fund Rules          | One fund has one rules configuration            |
| Fund                | Collection Cycle    | One fund has many collection cycles             |
| Collection Cycle    | Contribution        | One cycle has many contributions                |
| Fund Member         | Contribution        | One fund member has many contributions          |
| Contribution        | Payment             | One contribution can have many payment attempts |
| Fund                | Payout              | One fund can have many payouts                  |
| User                | Notification        | One user can receive many notifications         |
| Organization        | Audit Log           | One organization has many audit logs            |

---

## Key Relationship Details

### Users and Organizations

A user can belong to multiple organizations.

Example:

One person may be part of:

* A cooperative society
* An alumni association
* A staff welfare association

This is handled through `organization_members`.

---

### Organizations and Funds

An organization can create multiple funds.

Each fund belongs to one organization.

Example:

```text
Abuja Teachers Cooperative
├── Annual Dues
├── Savings Fund
├── Welfare Fund
└── Rotational Savings
```

---

### Organization Members and Fund Members

Not every organization member belongs to every fund.

`fund_members` defines who participates in a specific fund.

This allows one organization to run several funds with different participants.

---

### Funds and Fund Rules

Each fund has one rules configuration.

The rules define how the fund behaves, including:

* Contribution amount
* Contribution frequency
* Payment method
* Payout eligibility
* Approval requirements

---

### Funds and Collection Cycles

A fund can have many collection cycles.

Examples:

* January 2026 Savings Cycle
* February 2026 Savings Cycle
* 2026 Annual Dues Cycle
* Rotational Cycle 4

---

### Collection Cycles and Contributions

Each collection cycle creates expected contributions for enrolled fund members.

Example:

If a fund has 50 active members, one monthly collection cycle may generate 50 contribution records.

---

### Contributions and Payments

A contribution can have many payment attempts.

This supports:

* Failed attempts
* Retried payments
* Partial payments
* Reversed payments
* Final successful payment

A contribution should only be considered paid when successful verified payments satisfy the expected amount.

---

### Funds and Payouts

A fund can have payouts only when its rules allow it.

Examples:

* Rotational Savings pays the scheduled member.
* Welfare Fund pays approved beneficiaries.
* Annual Dues usually has no member payout.

---

### Audit Logs

Audit logs are tied to organizations because financial actions happen inside organizational contexts.

Audit logs should preserve:

* Who performed an action
* What was changed
* When it happened
* Which entity was affected

---

## Relationship Rules

1. A user must exist before joining an organization.
2. A user must be an organization member before becoming a fund member.
3. A fund must belong to an organization.
4. A fund must have rules before a collection cycle starts.
5. A collection cycle must belong to one fund.
6. A contribution must belong to one collection cycle.
7. A payment must belong to one contribution.
8. A payout must belong to one fund.
9. Financial history should remain available even if users, members, or funds become inactive.
10. Relationships should preserve auditability and historical accuracy.

---

## Summary

UnityFund’s database relationships are designed to reflect real organizational fund management.

The model supports multiple organizations, multiple funds per organization, different participants per fund, recurring contribution cycles, multiple payment attempts, payout workflows, and auditable financial history.
