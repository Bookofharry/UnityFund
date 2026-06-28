# Domain Model

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

The Domain Model defines the core business entities, concepts, and relationships that make up UnityFund.

Its purpose is to provide a shared understanding of the business domain before any database schema, API contract, or user interface is designed.

Every technical component of UnityFund—including the database, backend services, APIs, and frontend—must derive its structure from this document.

---

# Scope

This document covers:

* Core business entities
* Business responsibilities
* Entity relationships
* High-level business rules
* Domain principles

This document does **not** define:

* Database tables
* API endpoints
* UI components
* Technical implementation details

---

# Objectives

The objectives of this document are to:

* Establish a common business language.
* Define the core entities within UnityFund.
* Explain how those entities interact.
* Provide the foundation for future architecture and implementation.

---

# Domain Overview

UnityFund is built around a single business concept:

> **Organizations manage funds.**

Everything else exists to support the lifecycle of a fund.

The platform is designed to help organizations automate financial operations, not simply process payments.

---

# Core Business Entities

## Organization

### Definition

An Organization represents a registered group using UnityFund to manage one or more recurring funds.

Examples include:

* Cooperative Society
* Staff Welfare Association
* Professional Association
* Alumni Association

### Responsibilities

An Organization is responsible for:

* Creating and managing funds.
* Managing members.
* Defining operational policies.
* Monitoring financial activities.
* Accessing reports and dashboards.

### Relationships

An Organization:

* Owns multiple Funds.
* Has multiple Members.
* Has multiple Administrators.
* Generates Reports.
* Maintains Audit Logs.

### Business Rules

* Every Fund belongs to exactly one Organization.
* An Organization may manage multiple Funds simultaneously.
* Organization settings apply across all Funds unless overridden.

---

## Member

### Definition

A Member is an individual who belongs to an Organization and participates in one or more Funds.

### Responsibilities

A Member can:

* Join Funds.
* Make Contributions.
* View payment history.
* Receive notifications.
* Participate in approved fund workflows.

### Relationships

A Member:

* Belongs to one Organization.
* Can participate in multiple Funds.
* Has multiple Contributions.
* Has multiple Payments.

### Business Rules

* Members cannot contribute to Funds they are not enrolled in.
* Membership status may affect fund eligibility.

---

## Fund

### Definition

A Fund represents money collected for a specific purpose within an Organization.

Examples include:

* Annual Dues
* Savings Fund
* Welfare Fund
* Emergency Fund
* Building Fund
* Investment Fund
* Rotational Savings Fund

### Responsibilities

A Fund defines:

* Why money is collected.
* Who contributes.
* How often contributions occur.
* What happens after contributions are received.
* Whether payouts are allowed.

### Relationships

A Fund:

* Belongs to one Organization.
* Has multiple Members.
* Has one or more Fund Rules.
* Has multiple Collection Cycles.
* Has multiple Contributions.
* May have multiple Payouts.

### Business Rules

* Every Fund must have a defined purpose.
* Every Fund follows one set of operational rules.
* Funds operate independently of one another.

---

## Fund Rule

### Definition

A Fund Rule defines the operational behavior of a Fund.

It determines how the Fund functions throughout its lifecycle.

### Responsibilities

Fund Rules define:

* Contribution amount.
* Contribution frequency.
* Collection dates.
* Eligibility requirements.
* Approval requirements.
* Payout behavior.
* Penalty policies.

### Relationships

A Fund Rule belongs to exactly one Fund.

### Business Rules

Changing a Fund Rule should only affect future collection cycles unless explicitly configured otherwise.

---

## Collection Cycle

### Definition

A Collection Cycle represents a scheduled contribution period for a Fund.

Examples:

* January 2026
* February 2026
* Annual Dues 2026
* Cycle 5

### Responsibilities

A Collection Cycle:

* Defines contribution deadlines.
* Tracks member participation.
* Measures collection progress.

### Relationships

A Collection Cycle:

* Belongs to one Fund.
* Contains multiple Contributions.

### Business Rules

Only one active Collection Cycle should exist for a Fund unless the Fund explicitly supports overlapping cycles.

---

## Contribution

### Definition

A Contribution represents a member's expected payment within a Collection Cycle.

### Responsibilities

A Contribution records:

* Expected amount.
* Payment status.
* Due date.
* Completion date.

### Relationships

A Contribution:

* Belongs to one Member.
* Belongs to one Collection Cycle.
* May be linked to one Payment.

### Business Rules

Contribution status should only change after successful payment verification.

---

## Payment

### Definition

A Payment represents a successful financial transaction confirmed through Nomba.

### Responsibilities

A Payment confirms that a Contribution has been completed.

### Relationships

A Payment:

* Belongs to one Contribution.
* May trigger a workflow.
* Is confirmed through Nomba Webhooks.

### Business Rules

Payments must only be marked successful after webhook verification.

Duplicate webhook events must never create duplicate payments.

---

## Payout

### Definition

A Payout represents money distributed according to the rules of a Fund.

Examples include:

* Rotational Savings payout
* Welfare assistance
* Emergency support

### Responsibilities

A Payout:

* Transfers money to an approved recipient.
* Records the transfer outcome.
* Updates Fund history.

### Relationships

A Payout belongs to one Fund.

### Business Rules

Only Funds that permit payouts may create Payout records.

---

## Notification

### Definition

A Notification informs users about important activities.

Examples include:

* Payment successful
* Contribution due
* Payout completed
* Fund created

### Responsibilities

Notifications improve communication between the platform and its users.

---

## Audit Log

### Definition

The Audit Log records important financial and administrative actions performed within UnityFund.

### Responsibilities

Audit Logs provide:

* Accountability
* Traceability
* Compliance support
* Historical records

### Business Rules

Financial audit records should never be deleted.

---

# Entity Relationships

```text
Organization
│
├── Members
│
├── Funds
│   ├── Fund Rules
│   ├── Collection Cycles
│   │   └── Contributions
│   │       └── Payments
│   └── Payouts
│
├── Notifications
│
└── Audit Logs
```

---

# Domain Principles

The following principles guide the UnityFund domain:

* Organizations own Funds.
* Funds define business behavior.
* Members participate in Funds.
* Collection Cycles organize recurring contributions.
* Payments confirm Contributions.
* Fund Rules determine operational workflows.
* Payouts only occur when Fund Rules permit them.
* Every financial action should be auditable.

---

# Design Considerations

The Domain Model should remain independent of:

* Database design
* Frameworks
* Programming languages
* Payment providers

This ensures the business model remains stable even if technical implementations change.

---

# Future Considerations

Future versions of the Domain Model may introduce:

* Loans
* Dividends
* Investments
* Expense Management
* Financial Statements
* Accounting Integrations

These additions should extend the existing model without changing its core principles.

---

# Summary

The Domain Model establishes the language, structure, and business concepts that define UnityFund.

It serves as the foundation for all future technical decisions and ensures that implementation remains aligned with the business needs of member-based organizations.
