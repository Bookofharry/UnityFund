# MVP Scope

Status: Draft
Version: 0.1
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the minimum viable product (MVP) for UnityFund.

The objective of the MVP is to demonstrate the core value of the platform by solving the primary problems faced by member-based organizations while showcasing meaningful integration with Nomba's payment infrastructure.

The MVP intentionally focuses on a small set of high-impact features that can be built, demonstrated, and validated successfully.

---

# MVP Goals

The UnityFund MVP should enable an organization to:

* Create an organization.
* Invite and manage members.
* Create multiple fund types.
* Configure fund-specific rules.
* Start contribution cycles.
* Collect payments through Nomba.
* Automatically reconcile payments using webhooks.
* Execute fund-specific workflows.
* Display dashboards and reports.

---

# Core Features

## Authentication

* User registration
* Login
* Password reset
* Secure authentication

---

## Organization Management

* Create an organization
* Edit organization details
* Manage organization settings

---

## Member Management

* Invite members
* View member list
* Manage member status

---

## Fund Management

Organizations should be able to create and manage multiple fund types.

Supported MVP fund types:

* Annual Dues
* Savings Fund
* Rotational Savings Fund

Each fund should maintain its own:

* Members
* Collection cycles
* Rules
* Contributions
* Reports

---

## Fund Rules

Administrators should be able to configure:

* Contribution amount
* Contribution frequency
* Start date
* End date
* Payment method
* Payout eligibility

---

## Collection Cycles

Organizations should be able to:

* Start a collection cycle
* View current cycle
* View previous cycles
* Monitor payment progress

---

## Payments

Support payment collection using Nomba through:

* Direct Debit
* Checkout
* Virtual Accounts

The MVP should demonstrate at least one successful end-to-end payment flow.

---

## Payment Reconciliation

Payments should automatically update after webhook verification.

The system should:

* Verify webhook signatures.
* Prevent duplicate processing.
* Update contribution status.
* Record payment history.

---

## Rotational Payouts

For Rotational Savings Funds:

* Determine the scheduled recipient.
* Trigger a payout through Nomba Transfers.
* Record payout history.

---

## Dashboard

Administrators should see:

* Active funds
* Members
* Collection progress
* Outstanding payments
* Recent activity
* Fund balances

Members should see:

* Active funds
* Payment history
* Contribution status
* Upcoming payments

---

## Reports

Generate basic reports including:

* Contributions received
* Outstanding contributions
* Fund summary
* Member payment history

---

# Out of Scope

The following features are intentionally excluded from the MVP:

* Loan management
* Dividend distribution
* Accounting
* Mobile applications
* AI features
* Multi-branch organizations
* Third-party integrations beyond Nomba
* Advanced analytics
* Budget management
* Expense management

These features may be considered in future releases.

---

# MVP Success Criteria

The MVP is successful if a judge can complete the following flow:

1. Create an organization.
2. Create a fund.
3. Add members.
4. Configure fund rules.
5. Start a contribution cycle.
6. Complete a payment using Nomba.
7. Observe automatic reconciliation.
8. View updated dashboards.
9. Execute a rotational payout (where applicable).
10. View reports and payment history.

---

# Definition of Done

The MVP is complete when:

* Core workflows function correctly.
* Nomba integrations operate successfully.
* Financial records remain consistent.
* Users can complete the primary workflows without manual intervention.
* The application demonstrates the value proposition of UnityFund clearly during the hackathon.
