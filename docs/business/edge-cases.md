# Edge Cases

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document identifies business scenarios that fall outside the normal operating flow of UnityFund.

Edge cases help ensure the platform behaves predictably, maintains financial integrity, and provides a consistent user experience even under exceptional conditions.

---

# Scope

This document covers edge cases related to:

* Organizations
* Members
* Funds
* Contributions
* Payments
* Payouts
* Collection Cycles

Technical failures such as server crashes or infrastructure outages are outside the scope of this document.

---

# Organization

## Organization has no active funds

### Scenario

An organization has been created but no funds exist.

### Expected Behaviour

* Organization dashboard remains accessible.
* Prompt administrator to create the first fund.
* No collection activities are allowed.

---

## Organization is deactivated

### Scenario

An organization is suspended or closed.

### Expected Behaviour

* New collections cannot begin.
* Existing financial records remain available.
* Historical reports remain accessible.
* No data is deleted.

---

# Members

## Member leaves the organization

### Scenario

A member resigns or is removed.

### Expected Behaviour

* Historical contributions remain unchanged.
* Member cannot join new collection cycles.
* Existing audit records are preserved.

---

## Member belongs to multiple funds

### Scenario

A member participates in several funds simultaneously.

### Expected Behaviour

* Contributions are tracked independently for each fund.
* Payment history is separated by fund.
* Dashboards display consolidated participation.

---

## Member misses a contribution

### Scenario

A contribution is not made before the deadline.

### Expected Behaviour

* Contribution status changes to **Overdue**.
* Penalty rules are evaluated.
* Administrator is notified if required.

---

# Funds

## Fund has no members

### Scenario

A fund exists without enrolled members.

### Expected Behaviour

* Collection cycles cannot begin.
* Administrator receives guidance to enroll members.

---

## Fund is archived

### Scenario

A fund is no longer active.

### Expected Behaviour

* Historical records remain available.
* New contributions cannot be created.
* Existing reports remain accessible.

---

# Collection Cycles

## Collection cycle closes with unpaid contributions

### Scenario

Some members have not contributed before the cycle ends.

### Expected Behaviour

* Paid contributions remain completed.
* Outstanding contributions remain overdue.
* Cycle summary reflects actual payment status.
* Organization may decide how to handle outstanding balances.

---

## Duplicate collection cycle

### Scenario

An administrator attempts to create another active cycle for the same fund.

### Expected Behaviour

* Reject the operation.
* Explain that an active cycle already exists.

---

# Payments

## Duplicate webhook received

### Scenario

Nomba sends the same webhook more than once.

### Expected Behaviour

* Process the payment only once.
* Ignore duplicate events.
* Record the duplicate event for auditing if necessary.

---

## Payment amount differs from expected amount

### Scenario

The received payment does not match the required contribution.

### Expected Behaviour

* Flag the payment for review.
* Do not automatically mark the contribution as complete unless the fund rules allow partial payments.

---

## Payment received after the deadline

### Scenario

A member pays after the contribution deadline.

### Expected Behaviour

* Record the payment.
* Apply any configured penalty rules.
* Update reports accordingly.

---

# Payouts

## Scheduled recipient cannot receive payout

### Scenario

A payout fails because the recipient's account is invalid or unavailable.

### Expected Behaviour

* Mark the payout as failed.
* Record the failure.
* Notify administrators.
* Allow a retry after correction.

---

## Payout attempted twice

### Scenario

A payout request is submitted multiple times.

### Expected Behaviour

* Prevent duplicate payouts.
* Return the existing payout record.
* Maintain audit history.

---

# Fund Rules

## Rules change during an active collection cycle

### Scenario

An administrator updates fund rules while a collection cycle is already in progress.

### Expected Behaviour

* Current cycle continues using the original rules.
* Updated rules apply only to future collection cycles unless explicitly configured otherwise.

---

# Data Integrity

The following principles must always be maintained:

* Financial records are never silently deleted.
* Historical payments remain immutable.
* Audit logs cannot be modified by users.
* Every financial action must be traceable.
* Duplicate financial processing must be prevented.

---

# Future Edge Cases

As UnityFund evolves, additional scenarios should be documented, including:

* Loan defaults.
* Dividend distribution conflicts.
* Multi-branch organizations.
* Currency support.
* Offline payment reconciliation.
* Third-party accounting integrations.

---

# Summary

Edge cases are essential to maintaining the reliability and trustworthiness of UnityFund.

By defining expected behaviour for exceptional scenarios before implementation, the platform can provide consistent financial operations while protecting organizational data and member confidence.
