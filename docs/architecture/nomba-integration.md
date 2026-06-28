# Nomba Integration

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Purpose

This document defines how UnityFund integrates with Nomba.

UnityFund is responsible for business workflows and financial operations. Nomba provides the payment infrastructure used to collect payments, receive payment notifications, and execute supported transfers.

The objective is to clearly separate business logic from payment provider responsibilities.

---

# Scope

This document covers:

* Payment collection
* Direct Debit
* Checkout
* Virtual Accounts
* Webhooks
* Transfers
* Integration boundaries

This document does not cover:

* Internal UnityFund business rules
* Database design
* API contracts

---

# Architectural Boundary

The responsibilities of UnityFund and Nomba are intentionally separated.

| UnityFund         | Nomba                            |
| ----------------- | -------------------------------- |
| Organizations     | Payment infrastructure           |
| Members           | Payment processing               |
| Funds             | Direct Debit                     |
| Fund Rules        | Checkout                         |
| Collection Cycles | Virtual Accounts                 |
| Contributions     | Transfers                        |
| Workflow Engine   | Payment notifications (Webhooks) |
| Reports           | Payment execution                |

UnityFund decides **what should happen**.

Nomba performs **supported payment operations**.

---

# Supported Nomba Features

The MVP uses the following Nomba capabilities.

## Direct Debit

Purpose

Collect recurring contributions from members who have completed a Direct Debit mandate.

Notes

* Requires an active mandate.
* Mandates follow Nomba's documented activation process.
* UnityFund stores the relationship between members and mandates but does not manage the banking authorization process.

---

## Checkout

Purpose

Allow members to complete one-time contribution payments.

Typical use cases include:

* Annual dues
* Missed contributions
* Manual top-up payments

---

## Virtual Accounts

Purpose

Provide dedicated account details for contribution collection where appropriate.

UnityFund records incoming payments after receiving verified notifications from Nomba.

---

## Transfers

Purpose

Execute supported payouts.

Examples include:

* Rotational Savings payout
* Approved Welfare payout
* Approved Emergency payout

Transfer requests originate from UnityFund only after business rules and approvals have been satisfied.

---

## Webhooks

Purpose

Receive payment and transfer notifications from Nomba.

UnityFund uses webhooks to update internal records after verifying authenticity.

Webhook processing should:

* Verify the request signature.
* Validate the event payload.
* Perform idempotency checks.
* Update business records.
* Trigger business workflows.

---

# Integration Flow

## Contribution Collection

```text
Member
    │
    ▼
UnityFund
    │
    ▼
Nomba Payment API
    │
    ▼
Payment Processing
    │
    ▼
Nomba Webhook
    │
    ▼
Webhook Verification
    │
    ▼
Contribution Updated
    │
    ▼
Workflow Engine
```

---

## Payout Flow

```text
Business Rules
      │
      ▼
Approval Check
      │
      ▼
Transfer Request
      │
      ▼
Nomba Transfer API
      │
      ▼
Transfer Status
      │
      ▼
UnityFund Updates Records
```

---

# Webhook Processing Principles

Every webhook received by UnityFund must:

1. Verify the Nomba signature.
2. Reject invalid requests.
3. Prevent duplicate processing using idempotency.
4. Update only the relevant business records.
5. Record the action in the audit log.
6. Trigger any applicable business workflows.

---

# Error Handling

Integration failures should not leave UnityFund in an inconsistent state.

Examples include:

* Payment request rejected.
* Transfer request rejected.
* Invalid webhook signature.
* Duplicate webhook delivery.
* Temporary provider unavailability.

Each scenario should be logged and handled gracefully without creating duplicate financial records.

---

# Future Integrations

UnityFund should be designed so that additional payment providers can be introduced without changing the business domain.

Future providers may include other payment gateways or banking integrations.

The business logic should remain independent of any specific payment provider.

---

# Summary

UnityFund treats Nomba as a payment infrastructure provider rather than a source of business logic.

Business decisions are made within UnityFund. Nomba executes supported payment operations and reports their outcomes through its APIs and webhooks.

This separation keeps the platform maintainable, extensible, and aligned with sound software architecture principles.
