# Webhooks API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the webhook endpoints exposed by UnityFund.

Unlike standard APIs, webhook endpoints are intended for trusted external systems, such as Nomba, to notify UnityFund of completed payment events and other financial updates.

Webhook processing is responsible for synchronizing UnityFund's internal records with verified external payment events.

---

## Scope

This document covers:

* Receiving webhook requests
* Verifying webhook authenticity
* Processing webhook events
* Updating business records
* Triggering business workflows

This document does not cover:

* Initiating payments
* Executing payouts
* Authentication for users
* Nomba-specific endpoint details

Provider-specific implementation is documented separately.

---

# Architectural Principle

A webhook **does not create business decisions**.

A webhook only reports that an external event has occurred.

UnityFund is responsible for deciding what business actions should follow.

---

## Endpoint

### Receive Webhook

```http
POST /api/webhooks/nomba
```

Purpose:

Receive webhook notifications from Nomba.

This endpoint should never be used by frontend applications or end users.

---

## Processing Flow

```text
Webhook Received
        │
        ▼
Validate Request
        │
        ▼
Verify Signature
        │
        ▼
Check Idempotency
        │
        ▼
Parse Event
        │
        ▼
Locate Related Record
        │
        ▼
Update Business Records
        │
        ▼
Trigger Workflow Engine
        │
        ▼
Audit Log
        │
        ▼
Return Success
```

---

## Webhook Validation

Every webhook must pass the following validation steps before any business records are updated.

### Request Validation

Validate:

* Required headers
* Required payload fields
* Supported event structure

Reject malformed requests.

---

### Signature Verification

Every webhook must be verified using the signature mechanism documented by the payment provider.

Requests that fail verification must be rejected.

---

### Idempotency

The same webhook may be delivered multiple times.

UnityFund must ensure that:

* the same event is processed only once;
* duplicate deliveries do not create duplicate payments or payouts.

---

## Business Processing

After successful validation, UnityFund should:

* identify the related payment or payout;
* update internal records;
* trigger any applicable business workflows;
* create audit log entries;
* generate notifications where appropriate.

---

## Error Handling

The webhook endpoint should safely handle:

* Invalid signatures
* Unknown events
* Missing records
* Duplicate deliveries
* Invalid payloads
* Temporary processing failures

Errors should be logged for investigation.

---

## Security Requirements

Webhook endpoints should:

* Accept requests only from trusted providers.
* Verify every incoming signature.
* Never trust client-supplied status values without verification.
* Record processing outcomes.
* Prevent replay attacks where possible.

---

## Response Behaviour

When processing succeeds:

* Return an appropriate success response.

When validation fails:

* Return an appropriate client error response.

When a temporary internal failure occurs:

* Return an appropriate server error response so the provider can retry according to its delivery policy.

---

## Audit Requirements

The system should record:

* Webhook received
* Signature verification result
* Duplicate detection
* Business records updated
* Processing failure
* Workflow triggered

---

## Open Questions

* Should webhook payloads be retained indefinitely or archived after a defined period?
* What operational dashboard should be available for webhook monitoring?
* How should permanently unprocessable webhook events be reviewed by administrators?

---

## Review Checklist

* [ ] Aligns with Vision documents
* [ ] Aligns with Business Domain
* [ ] Matches ADR decisions
* [ ] Contains only verified facts or documented product decisions
* [ ] Avoids provider-specific implementation details
* [ ] Ready for implementation review

---

## Summary

The Webhooks API enables UnityFund to receive trusted notifications from external payment providers. By validating every webhook, enforcing idempotency, and triggering business workflows only after successful verification, UnityFund maintains accurate, auditable, and reliable financial records.
