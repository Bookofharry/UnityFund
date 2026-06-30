# Mandates API

Status: Draft
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Purpose

This document defines the API for managing Direct Debit mandates within UnityFund.

A mandate is a member's authorization for Nomba to debit their bank account automatically. UnityFund stores the mandate reference and status but does not manage the bank authorization process itself — that is Nomba's responsibility.

Mandates are the prerequisite for Direct Debit as a payment method. Without an active mandate, a member cannot be debited automatically during a collection cycle.

---

## Scope

This document covers:

* Initiating mandate setup
* Listing a member's mandates
* Viewing mandate details
* Suspending a mandate
* Cancelling a mandate
* Handling Nomba mandate webhook events

This document does not cover:

* Checkout payments (no mandate required)
* Virtual Account payments (no mandate required)
* The bank's internal mandate authorization process (Nomba-managed)
* Transfer execution for payouts

---

## How Mandates Work in UnityFund

```text
1. Admin or member initiates mandate setup
        │
        ▼
2. UnityFund requests a mandate setup URL from Nomba
        │
        ▼
3. Member is redirected to Nomba's mandate setup flow
        │
        ▼
4. Member completes bank authorization (Nomba-managed)
        │
        ▼
5. Nomba sends a webhook: mandate activated
        │
        ▼
6. UnityFund updates mandate status to active
        │
        ▼
7. Mandate is now usable for Direct Debit collection
```

UnityFund creates the mandate record at step 2 with status `pending`. It does not control steps 3–4 and must wait for Nomba's webhook at step 5 before treating the mandate as usable.

---

## Business Rules

* A member may have more than one mandate, but only `active` mandates should be used for Direct Debit collection.
* Mandates are scoped to an organization member, not to a specific fund. An active mandate can be used for Direct Debit across all funds the member participates in.
* A mandate must be `active` at the time a Direct Debit is triggered. Attempting to debit against a `pending`, `suspended`, `deleted`, or `expired` mandate must be rejected.
* UnityFund stores the `provider_mandate_id` returned by Nomba. This ID is used when initiating Direct Debit collections.
* Suspending or cancelling a mandate does not affect payment records or contributions already collected under it.

---

## Mandate States

```text
pending → active
pending → deleted
active → suspended
active → deleted
active → expired
suspended → active
suspended → deleted
```

State definitions:

* `pending` — mandate setup has been initiated but bank authorization is not yet complete
* `active` — mandate is authorized and may be used for Direct Debit
* `suspended` — mandate has been temporarily halted; cannot be used for debits
* `deleted` — mandate has been permanently cancelled; cannot be reactivated
* `expired` — mandate has passed its `end_date` and is no longer valid

---

## Endpoints

### Initiate Mandate Setup

```http
POST /api/organizations/:organizationId/members/:memberId/mandates
```

Initiates the Direct Debit mandate setup flow with Nomba. Returns a redirect URL for the member to complete bank authorization.

Expected request:

```json
{
  "maxAmount": 1000000,
  "frequency": "monthly",
  "startDate": "2026-07-01",
  "endDate": "2027-06-30"
}
```

`maxAmount` is in Kobo (1000000 = ₦10,000). This is the maximum amount that can be debited per collection under this mandate.

Expected response:

```json
{
  "message": "Mandate setup initiated",
  "mandate": {
    "id": "uuid",
    "status": "pending",
    "setupUrl": "https://nomba.com/mandate/setup/..."
  }
}
```

The `setupUrl` should be used to redirect the member to Nomba's mandate setup interface. The mandate record is created in UnityFund with status `pending` at this point.

Authorization:

* Organization Admin
* The member themselves (if self-service mandate setup is enabled)

---

### List Member Mandates

```http
GET /api/organizations/:organizationId/members/:memberId/mandates
```

Returns all mandates for a specific organization member.

Optional filters:

* `status` — filter by mandate status

Expected response:

```json
{
  "mandates": [
    {
      "id": "uuid",
      "provider": "nomba",
      "providerMandateId": "nomba-mandate-ref",
      "status": "active",
      "maxAmount": 1000000,
      "frequency": "monthly",
      "startDate": "2026-07-01",
      "endDate": "2027-06-30",
      "createdAt": "2026-06-28T10:00:00Z"
    }
  ]
}
```

Authorization:

* Treasurer
* Organization Admin
* The member themselves (own mandates only)

---

### Get Mandate

```http
GET /api/organizations/:organizationId/mandates/:mandateId
```

Returns the details of a specific mandate.

Authorization:

* Treasurer
* Organization Admin
* The member who owns the mandate

---

### Suspend Mandate

```http
POST /api/organizations/:organizationId/mandates/:mandateId/suspend
```

Suspends an active mandate. The mandate cannot be used for Direct Debit while suspended.

Expected request: empty body

Expected response:

```json
{
  "message": "Mandate suspended",
  "mandate": {
    "id": "uuid",
    "status": "suspended"
  }
}
```

Authorization:

* Organization Admin

Business Rules:

* Only `active` mandates can be suspended.
* Suspending a mandate does not cancel it. It can be reactivated.
* Contributions already collected under this mandate are not affected.

---

### Cancel Mandate

```http
POST /api/organizations/:organizationId/mandates/:mandateId/cancel
```

Permanently cancels a mandate. Cancelled mandates cannot be reactivated.

Expected request:

```json
{
  "reason": "Member requested cancellation"
}
```

Expected response:

```json
{
  "message": "Mandate cancelled",
  "mandate": {
    "id": "uuid",
    "status": "deleted"
  }
}
```

Authorization:

* Organization Admin
* The member themselves

Business Rules:

* `active` and `suspended` mandates may be cancelled.
* `pending` mandates may be cancelled if the member decides not to complete setup.
* Cancellation must be reflected in Nomba's system. UnityFund should notify Nomba of the cancellation via the appropriate Nomba API call before updating the local status.
* Historical payment records remain unaffected.

---

## Nomba Mandate Webhook Events

Nomba sends webhook events to notify UnityFund of mandate status changes. These are received at:

```http
POST /api/webhooks/nomba
```

Expected mandate-related event types:

```txt
mandate.activated    — bank authorization completed; status moves to active
mandate.suspended    — mandate suspended by the bank or member
mandate.deleted      — mandate cancelled
mandate.expired      — mandate has passed its end date
```

Processing for each event:

1. Verify Nomba signature
2. Write raw payload to `webhook_events`
3. Return 200 OK
4. Locate mandate by `provider_mandate_id`
5. Apply state transition according to event type
6. Create audit log
7. Notify the organization if the mandate activation enables a pending Direct Debit collection

---

## Authorization Matrix

| Action                | Member (own) | Treasurer | Organization Admin |
| --------------------- | :----------: | :-------: | :----------------: |
| Initiate setup        |       ✓      |     ✗     |          ✓         |
| List own mandates     |       ✓      |     ✗     |          ✓         |
| List all org mandates |       ✗      |     ✓     |          ✓         |
| View mandate          |       ✓      |     ✓     |          ✓         |
| Suspend mandate       |       ✗      |     ✗     |          ✓         |
| Cancel mandate        |       ✓      |     ✗     |          ✓         |

---

## Audit Requirements

The system should record:

* Mandate setup initiated
* Mandate activated (via webhook)
* Mandate suspended
* Mandate cancelled
* Mandate expired (via webhook)

---

## Error Scenarios

* Organization not found
* Member not found
* Mandate not found
* Member does not belong to this organization
* Nomba returned an error initiating the mandate
* Mandate is not in the correct state for the requested action
* Unauthorized action

---

## Open Questions

* Should UnityFund support setting a default mandate per member for automatic Direct Debit selection?
* Should mandate setup be initiated by the admin or self-service by the member via a secure link?
* What happens if Nomba's mandate setup URL expires before the member completes the flow?
* Should UnityFund periodically poll Nomba for `pending` mandates that have not received an activation webhook, and mark them expired after a timeout?

---

## Related Documents

* Payments API
* Webhooks API
* Nomba Integration Architecture
* ADR-003 — Payment Provider Architecture
* ADR-008 — Idempotency Strategy
* ADR-011 — MVP Pre-Build Risk Fixes

---

## Review Checklist

* [ ] Mandate states match ADR-007 state transitions
* [ ] Webhook events correctly trigger mandate state changes
* [ ] Bank authorization flow is correctly delegated to Nomba
* [ ] Authorization matrix reflects correct role access
* [ ] Ready for implementation review

---

## Summary

The Mandates API provides UnityFund's interface for managing Direct Debit authorizations. It creates mandate records and tracks their lifecycle, but defers the actual bank authorization process to Nomba. Without active mandates, Direct Debit collection is unavailable and members must use Checkout or Virtual Account payment methods instead.
