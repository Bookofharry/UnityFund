# Fund Members API

Status: Draft
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Purpose

This document defines the API for enrolling and managing members within a specific Fund.

Fund membership is distinct from organization membership. A user must first be an organization member before they can be enrolled in a fund. Not every organization member participates in every fund.

This API is also responsible for setting `rotation_position` for Rotational Savings funds.

---

## Scope

This document covers:

* Enrolling members into a fund
* Listing fund members
* Viewing a fund member record
* Updating fund member details (including rotation position)
* Removing a member from a fund

This document does not cover:

* Organization membership (see Members API)
* Contribution management
* Fund creation or configuration
* Collection cycle management

---

## Business Rules

* A user must be an active organization member before they can be enrolled in a fund.
* A member may not be enrolled in the same fund more than once.
* For funds of type `rotational_savings`, `rotation_position` must be set at enrollment time and must be unique within the fund.
* Removing a member from a fund does not delete their historical contributions, payments, or audit records.
* A member who has been removed from a fund cannot be included in new collection cycles but their existing contribution records remain intact.
* Members cannot be removed from a fund while a collection cycle is active unless the organization administrator explicitly overrides this restriction.
* Enrolling members into a fund with an active collection cycle does not automatically generate a contribution for them in the current cycle.

---

## Endpoints

### Enroll Member

```http
POST /api/organizations/:organizationId/funds/:fundId/members
```

Enrolls an organization member into a fund.

Expected request:

```json
{
  "organizationMemberId": "uuid",
  "rotationPosition": 3
}
```

`rotationPosition` is required when the fund type is `rotational_savings`. It must be a positive integer and must not conflict with an existing position in the fund.

For all other fund types, `rotationPosition` must not be included.

Expected response:

```json
{
  "message": "Member enrolled successfully",
  "fundMember": {
    "id": "uuid",
    "fundId": "uuid",
    "organizationMemberId": "uuid",
    "rotationPosition": 3,
    "status": "active",
    "joinedAt": "2026-06-28T10:00:00Z"
  }
}
```

Authorization:

* Organization Admin

Business Rules:

* The organization member must belong to the same organization as the fund.
* The member must not already be enrolled in this fund.
* For `rotational_savings` funds, `rotationPosition` must be unique within the fund.

---

### List Fund Members

```http
GET /api/organizations/:organizationId/funds/:fundId/members
```

Returns all members enrolled in a fund.

Optional filters:

* `status` — filter by member status (`active`, `inactive`, `removed`)

Expected response:

```json
{
  "fundMembers": [
    {
      "id": "uuid",
      "organizationMemberId": "uuid",
      "name": "Amaka Obi",
      "email": "amaka@example.com",
      "rotationPosition": 1,
      "status": "active",
      "joinedAt": "2026-01-15T09:00:00Z"
    }
  ],
  "total": 12
}
```

For `rotational_savings` funds, results should be ordered by `rotation_position` ascending.

Authorization:

* Organization Member

---

### Get Fund Member

```http
GET /api/organizations/:organizationId/funds/:fundId/members/:fundMemberId
```

Returns the details of a single fund membership record.

Expected response:

```json
{
  "fundMember": {
    "id": "uuid",
    "fundId": "uuid",
    "organizationMemberId": "uuid",
    "name": "Amaka Obi",
    "rotationPosition": 1,
    "status": "active",
    "joinedAt": "2026-01-15T09:00:00Z",
    "contributionSummary": {
      "totalExpected": 3,
      "totalPaid": 2,
      "totalOverdue": 1
    }
  }
}
```

Authorization:

* Organization Member (own record only)
* Treasurer
* Organization Admin

---

### Update Fund Member

```http
PATCH /api/organizations/:organizationId/funds/:fundId/members/:fundMemberId
```

Updates a fund membership record.

Currently supported updates:

```json
{
  "rotationPosition": 4
}
```

`rotationPosition` may only be changed when no collection cycle is active for the fund. Changing rotation position while a cycle is active risks inconsistent payout ordering.

Authorization:

* Organization Admin

Business Rules:

* The new `rotationPosition` must not conflict with any other fund member in the same fund.
* Changes to `rotationPosition` must be recorded in the audit log.

---

### Remove Fund Member

```http
DELETE /api/organizations/:organizationId/funds/:fundId/members/:fundMemberId
```

Removes a member from a fund. This is a logical removal, not a destructive delete. The `fund_members.status` is set to `removed`.

Expected response:

```json
{
  "message": "Member removed from fund"
}
```

Authorization:

* Organization Admin

Business Rules:

* Historical contribution records, payment records, and audit logs for this member are preserved.
* The removed member will not receive contribution records in future collection cycles.
* If the fund is of type `rotational_savings` and the member has not yet received their rotation payout, the organization must manually decide how to handle the gap in the rotation. This is an administrative decision outside the scope of this API.

---

## Authorization Matrix

| Action                      | Member | Treasurer | Organization Admin |
| --------------------------- | :----: | :-------: | :----------------: |
| Enroll member in fund       |    ✗   |     ✗     |          ✓         |
| List fund members           |    ✓   |     ✓     |          ✓         |
| View own fund member record |    ✓   |     ✓     |          ✓         |
| Update rotation position    |    ✗   |     ✗     |          ✓         |
| Remove member from fund     |    ✗   |     ✗     |          ✓         |

---

## Audit Requirements

The system should record:

* Member enrolled in fund
* Fund member rotation position updated
* Member removed from fund

---

## Error Scenarios

* Organization not found
* Fund not found
* Organization member not found
* Member already enrolled in this fund
* Member does not belong to this organization
* `rotationPosition` already taken in this fund
* `rotationPosition` required for `rotational_savings` fund but not provided
* Active collection cycle prevents removal
* Unauthorized action

---

## Open Questions

* Should fund member enrollment require the member's explicit consent, or can an admin enroll members directly?
* When a `rotational_savings` member is removed mid-rotation, should the rotation positions of remaining members be automatically resequenced?
* Should a removed member be allowed to re-enroll in the same fund?

---

## Related Documents

* Members API
* Funds API
* Collections API
* ADR-001 — Fund is the Primary Business Entity
* ADR-004 — Role-Based Access Control
* ADR-011 — MVP Pre-Build Risk Fixes

---

## Review Checklist

* [ ] Aligns with domain model
* [ ] Aligns with database schema (fund_members table)
* [ ] Handles rotational_savings rotation_position correctly
* [ ] Consistent with other API authorization patterns
* [ ] Ready for implementation review

---

## Summary

The Fund Members API manages participation within individual funds. It is the gateway through which organization members are enrolled, positioned (for Rotational Savings), and removed. Without this API, collection cycles cannot generate contributions because there are no enrolled members to contribute.
