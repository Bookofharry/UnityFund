# Organizations API

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for managing organizations in UnityFund.

Organizations are the top-level customer entities in UnityFund. They own members, funds, collection cycles, reports, notifications, and audit logs.

---

## Scope

This document covers:

* Creating organizations
* Viewing organizations
* Updating organization details
* Managing organization status
* Retrieving organization dashboard summary

This document does not cover:

* Member invitation
* Fund creation
* Payments
* Payouts
* Platform administration

---

## Core Endpoints

### Create Organization

```http
POST /api/organizations
```

Creates a new organization.

Expected fields:

```json
{
  "name": "Tech Minds Cooperative",
  "organizationType": "cooperative",
  "email": "info@techminds.ng",
  "phone": "+2348012345678"
}
```

Expected result:

```json
{
  "message": "Organization created successfully",
  "organization": {
    "id": "uuid",
    "name": "Tech Minds Cooperative",
    "organizationType": "cooperative",
    "status": "active"
  }
}
```

Business rules:

* The creator becomes the organization admin.
* Organization name is required.
* Organization type is required.
* The organization starts with active status unless platform review is required.

---

### Get My Organizations

```http
GET /api/organizations
```

Returns organizations the authenticated user belongs to.

Expected result:

```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Tech Minds Cooperative",
      "organizationType": "cooperative",
      "role": "organization_admin",
      "status": "active"
    }
  ]
}
```

Business rules:

* Users should only see organizations they belong to.
* Platform admins may have separate platform-level access.

---

### Get Organization Details

```http
GET /api/organizations/:organizationId
```

Returns details of one organization.

Expected result:

```json
{
  "organization": {
    "id": "uuid",
    "name": "Tech Minds Cooperative",
    "organizationType": "cooperative",
    "email": "info@techminds.ng",
    "phone": "+2348012345678",
    "status": "active",
    "createdAt": "2026-06-27T10:00:00Z"
  }
}
```

Business rules:

* User must belong to the organization.
* Unauthorized users must not access organization details.

---

### Update Organization

```http
PATCH /api/organizations/:organizationId
```

Updates organization details.

Expected fields:

```json
{
  "name": "Tech Minds Cooperative Society",
  "email": "admin@techminds.ng",
  "phone": "+2348012345678"
}
```

Expected result:

```json
{
  "message": "Organization updated successfully",
  "organization": {
    "id": "uuid",
    "name": "Tech Minds Cooperative Society"
  }
}
```

Business rules:

* Only organization admins can update organization details.
* Updates should be recorded in audit logs.

---

### Get Organization Dashboard Summary

```http
GET /api/organizations/:organizationId/dashboard
```

Returns summary data for the organization dashboard.

Expected result:

```json
{
  "summary": {
    "totalMembers": 120,
    "activeFunds": 4,
    "activeCollectionCycles": 2,
    "expectedThisMonth": 2500000,
    "collectedThisMonth": 1900000,
    "outstandingThisMonth": 600000
  }
}
```

Business rules:

* Dashboard values must be calculated from trusted records.
* Users only see data allowed by their role.

---

## Organization Statuses

Recommended statuses:

```txt
active
inactive
suspended
archived
```

Status meanings:

| Status    | Meaning                                             |
| --------- | --------------------------------------------------- |
| active    | Organization can operate normally                   |
| inactive  | Organization is not currently active                |
| suspended | Organization access is restricted                   |
| archived  | Organization is closed but records remain available |

---

## Authorization Rules

| Action               | Required Role                           |
| -------------------- | --------------------------------------- |
| Create organization  | Authenticated user                      |
| View organization    | Organization member                     |
| Update organization  | Organization admin                      |
| View dashboard       | Organization admin, treasurer, approver |
| Archive organization | Organization admin or platform admin    |

---

## Audit Requirements

The system should create audit logs for:

* Organization created
* Organization updated
* Organization archived
* Organization status changed

---

## Open Questions

* Should organizations require verification before becoming active?
* Should organization type affect onboarding flow?
* Should archived organizations be restorable?
* Should organization admins be able to transfer ownership?

---

## Summary

The Organizations API manages the top-level customer entity in UnityFund.

Every major resource in UnityFund belongs to an organization, so this API must enforce strong access control and preserve organizational history.
