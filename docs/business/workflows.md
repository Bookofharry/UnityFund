# Business Workflows

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines the primary business workflows supported by UnityFund.

A workflow describes the sequence of business activities performed to complete a specific objective.

These workflows serve as the reference for application behavior and should remain independent of implementation details.

---

# Scope

This document covers the core workflows required for the UnityFund MVP, including:

* Organization onboarding
* Member management
* Fund creation
* Contribution collection
* Payment reconciliation
* Payout execution

---

# Workflow 1 — Organization Onboarding

## Objective

Enable a new organization to begin using UnityFund.

## Steps

1. Organization registers an account.
2. Organization administrator verifies their email.
3. Organization profile is completed.
4. Organization settings are configured.
5. The organization is ready to create funds.

## Expected Outcome

The organization can begin managing members and funds.

---

# Workflow 2 — Member Onboarding

## Objective

Register members within an organization.

## Steps

1. Administrator invites a member.
2. Member accepts the invitation.
3. Member completes registration.
4. Member becomes active.
5. Member may now join eligible funds.

## Expected Outcome

The member is available for participation in organizational funds.

---

# Workflow 3 — Fund Creation

## Objective

Create a new fund for an organization.

## Steps

1. Administrator selects a Fund Type.
2. Administrator enters fund details.
3. Administrator configures Fund Rules.
4. Fund is reviewed.
5. Fund is activated.

## Expected Outcome

The fund is available for member participation.

---

# Workflow 4 — Member Enrollment

## Objective

Enroll eligible members into a fund.

## Steps

1. Administrator selects members.
2. Eligibility rules are evaluated.
3. Members are enrolled.
4. Notifications are sent.

## Expected Outcome

Eligible members become participants in the fund.

---

# Workflow 5 — Collection Cycle

## Objective

Open a contribution period for a fund.

## Steps

1. Administrator starts a new collection cycle.
2. Contribution records are generated.
3. Members are notified.
4. Collection period becomes active.

## Expected Outcome

Members can begin making contributions.

---

# Workflow 6 — Contribution Payment

## Objective

Collect a member's contribution.

## Steps

1. Member selects a contribution.
2. Member chooses an available payment method.
3. Payment request is sent to Nomba.
4. Payment is processed.
5. Nomba sends a webhook.
6. UnityFund verifies the webhook.
7. Contribution status is updated.
8. Payment history is recorded.
9. Dashboard statistics are refreshed.

## Expected Outcome

The contribution is successfully recorded and reconciled.

---

# Workflow 7 — Rotational Payout

## Objective

Distribute the pooled contribution to the scheduled recipient.

## Steps

1. Collection cycle closes.
2. System verifies that payout conditions are met.
3. Scheduled recipient is identified.
4. Payout request is sent through Nomba.
5. Payout status is confirmed.
6. Payout history is recorded.
7. Members are notified.

## Expected Outcome

The scheduled member receives the payout and the cycle is completed.

---

# Workflow 8 — Welfare Payout

## Objective

Provide financial assistance from a Welfare Fund.

## Steps

1. Member submits a request.
2. Administrator reviews the request.
3. Required approvals are completed.
4. Payout is initiated.
5. Payment is recorded.
6. Audit log is updated.
7. Member receives notification.

## Expected Outcome

Approved welfare assistance is disbursed and recorded.

---

# Workflow 9 — Reporting

## Objective

Provide financial visibility to administrators.

## Steps

1. Administrator opens the Reports module.
2. Report type is selected.
3. Data is generated.
4. Results are displayed.
5. Report may be exported.

## Expected Outcome

Administrators gain accurate insight into fund performance.

---

# Workflow Principles

Every workflow should:

* Follow business rules.
* Validate user permissions.
* Record important actions.
* Produce an audit trail.
* Notify relevant users where applicable.
* Maintain data consistency.

---

# Workflow Summary

UnityFund automates the complete operational lifecycle of organizational funds.

Each workflow builds upon the previous one, allowing organizations to move seamlessly from fund creation to contribution collection, payment reconciliation, reporting, and approved payouts.
