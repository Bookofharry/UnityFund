# Fund Rules

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the configurable business rules that govern how a fund operates within UnityFund.

While a Fund Type defines the purpose of a fund, Fund Rules define the operational behavior of a specific fund created by an organization.

The rules documented here form the foundation of UnityFund's business engine.

---

# Scope

This document covers:

* Contribution rules
* Membership rules
* Collection rules
* Payout rules
* Approval rules
* Compliance rules

This document does not define:

* Database implementation
* API contracts
* User interface behaviour

---

# Rule Categories

Every Fund may define rules in one or more of the following categories:

* Membership
* Contributions
* Collections
* Payments
* Payouts
* Approvals
* Penalties

---

# Membership Rules

Membership Rules determine who can participate in a fund.

### Configurable Rules

* Open to all members
* Invitation only
* Eligibility based on member role
* Minimum membership duration
* Maximum number of participants

### Examples

* Only permanent staff may join.
* Only members active for at least six months may participate.
* Membership closes after the first contribution cycle.

---

# Contribution Rules

Contribution Rules define how members contribute to a fund.

### Configurable Rules

* Contribution amount
* Fixed or variable amount
* Contribution frequency
* Contribution deadline
* Minimum contribution
* Maximum contribution

### Supported Frequencies

* Weekly
* Monthly
* Quarterly
* Annually
* Custom

### Examples

* Every member contributes ₦10,000 monthly.
* Members may contribute any amount above ₦5,000.
* Contributions close on the 25th of each month.

---

# Collection Rules

Collection Rules determine how contribution cycles operate.

### Configurable Rules

* Collection start date
* Collection end date
* Grace period
* Automatic cycle generation
* Cycle reminders

### Examples

* New collection cycle starts automatically on the first day of every month.
* Contributions remain open for five additional days after the due date.

---

# Payment Rules

Payment Rules define how payments are collected.

### Supported Payment Methods

* Direct Debit
* Checkout
* Virtual Account

### Configurable Rules

* Allowed payment methods
* Partial payment support
* Retry failed payments
* Automatic reconciliation

### Examples

* Members may pay using either Direct Debit or Virtual Account.
* Retry failed Direct Debit transactions after three days.

---

# Payout Rules

Payout Rules define when and how money leaves a fund.

### Configurable Rules

* Payout enabled or disabled
* Eligible recipients
* Scheduled payouts
* Manual payouts
* Approval requirements

### Examples

* Rotational Savings pays one scheduled member every cycle.
* Welfare Fund pays only approved beneficiaries.
* Annual Dues do not allow member payouts.

---

# Approval Rules

Approval Rules determine which financial actions require authorization.

### Configurable Rules

* Single approver
* Multiple approvers
* Sequential approvals
* Approval timeout

### Examples

* Welfare payouts require Treasurer approval.
* Emergency payouts require both Treasurer and Chairperson approval.

---

# Penalty Rules

Penalty Rules define what happens when members fail to contribute on time.

### Configurable Rules

* Fixed late fee
* Percentage penalty
* Grace period
* Suspension after repeated defaults

### Examples

* ₦500 late fee after the due date.
* Suspend members after three consecutive missed contributions.

---

# Rule Evaluation

Whenever an action is performed, UnityFund evaluates the applicable rules before allowing the action to proceed.

Example:

Member requests a withdrawal

↓

Validate Membership Rules

↓

Validate Fund Rules

↓

Validate Approval Rules

↓

Approve or Reject

↓

Record Audit Log

---

# Rule Precedence

When multiple rules apply, UnityFund evaluates them in the following order:

1. Membership Rules
2. Contribution Rules
3. Collection Rules
4. Payment Rules
5. Approval Rules
6. Payout Rules
7. Penalty Rules

This order ensures consistent and predictable behaviour.

---

# Business Principles

Fund Rules should:

* Be configurable where appropriate.
* Be predictable.
* Be transparent.
* Be enforceable.
* Produce auditable outcomes.

Rules should never create ambiguity for administrators or members.

---

# Summary

Fund Rules define how a specific fund behaves throughout its lifecycle.

They transform generic fund types into organization-specific financial workflows, allowing UnityFund to support diverse operational models while maintaining a consistent platform architecture.
