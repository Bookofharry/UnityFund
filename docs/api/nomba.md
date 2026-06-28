# Nomba Integration API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines how UnityFund integrates with Nomba's payment infrastructure.

Rather than documenting Nomba's APIs in full, this document explains how UnityFund uses verified Nomba capabilities to support organizational fund management.

The source of truth for endpoint definitions and request formats remains the official Nomba API documentation.

---

## Scope

This document covers:

* Direct Debit
* Checkout
* Tokenized Card Payments
* Virtual Accounts
* Transfers
* Webhooks
* Integration principles

This document does not cover:

* UnityFund business rules
* Database schema
* Frontend implementation
* Internal service architecture

---

# Integration Philosophy

UnityFund owns the business process.

Nomba executes payment operations.

Examples:

* UnityFund decides whether a contribution should be collected.
* Nomba processes the payment.
* UnityFund decides whether a payout is allowed.
* Nomba executes the transfer.

Business decisions never depend solely on the payment provider.

---

# Supported Nomba Capabilities

## Direct Debit

Purpose

Collect recurring contributions directly from a member's bank account after a valid mandate has been established.

UnityFund Responsibilities

* Store the provider mandate reference.
* Associate mandates with members.
* Decide when collections should occur.
* Track mandate status.

Verified Notes

* Mandates require customer authorization.
* Activation follows Nomba's documented validation process.
* Debits should only be attempted against active mandates.

---

## Checkout

Purpose

Collect one-time contribution payments.

Typical UnityFund Use Cases

* Annual dues
* Missed contributions
* One-off fund payments

UnityFund Responsibilities

* Create payment requests.
* Associate payments with contributions.
* Wait for verified payment confirmation.

---

## Tokenized Card Payments

Purpose

Support recurring card payments without collecting card details again.

Typical UnityFund Use Cases

* Recurring contribution plans
* Optional automatic renewals

Verified Notes

* Tokenized payments require the original checkout flow to tokenize the card.
* UnityFund stores only the provider token reference, never card details.

---

## Virtual Accounts

Purpose

Provide members with dedicated payment account details where appropriate.

Typical UnityFund Use Cases

* Manual bank transfers
* Organizations preferring account transfers

UnityFund Responsibilities

* Associate the virtual account with the correct organization or member.
* Wait for webhook confirmation before updating contributions.

Verified Notes

Funds received through virtual accounts are routed according to Nomba's account model; UnityFund records the resulting payments rather than acting as a fund custodian.

---

## Transfers

Purpose

Execute approved payouts.

Typical UnityFund Use Cases

* Rotational savings payouts
* Welfare assistance
* Emergency assistance

UnityFund Responsibilities

* Verify eligibility.
* Complete any required approvals.
* Initiate the transfer.
* Record provider references.
* Update payout status after confirmation.

---

## Webhooks

Purpose

Receive payment and transfer notifications.

UnityFund Responsibilities

* Verify webhook signatures.
* Enforce idempotency.
* Update business records.
* Trigger workflow processing.
* Record audit logs.

---

# Integration Principles

The integration must satisfy the following principles:

1. Business logic remains inside UnityFund.
2. Nomba is treated as external payment infrastructure.
3. Every payment must be verified before affecting business records.
4. Every transfer must be linked to an approved payout.
5. Duplicate provider events must not create duplicate financial records.
6. Provider identifiers should be stored for reconciliation and support.

---

# Error Handling

UnityFund should handle situations including:

* Payment request failure
* Transfer failure
* Invalid webhook signature
* Duplicate webhook delivery
* Expired or inactive mandate
* Temporary provider unavailability

Failures should leave the platform in a consistent state and preserve auditability.

---

# Assumptions and Known Limitations

The following items are not publicly documented or have not yet been confirmed:

* Maximum Direct Debit amount
* Daily or monthly provider limits
* Provider-specific throughput limits
* Any undocumented webhook events

These should be treated as implementation assumptions until confirmed with Nomba.

---

# Future Considerations

Future versions of UnityFund should make the payment provider replaceable.

The business layer should remain unchanged if additional providers are introduced.

Only the integration layer should require modification.

---

# Review Checklist

* [ ] Aligns with Vision documents
* [ ] Aligns with Business Domain
* [ ] Uses only verified Nomba capabilities
* [ ] Clearly separates UnityFund responsibilities from Nomba responsibilities
* [ ] Avoids undocumented provider assumptions
* [ ] Ready for implementation review

---

# Summary

UnityFund integrates with Nomba to automate payment collection, recurring mandates, transfers, and payment reconciliation.

The platform retains ownership of business decisions while relying on Nomba for secure payment execution and verified financial event notifications.
