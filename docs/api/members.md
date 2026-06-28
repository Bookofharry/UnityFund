# Members API

Status: Draft
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the API requirements for managing organization members within UnityFund.

Members are users who belong to an organization and may participate in one or more funds. This API is responsible for membership management within an organization and does not manage fund participation.

---

## Scope

This document covers:

* Inviting members
* Listing members
* Viewing member details
* Updating member information
* Updating member status
* Removing members from an organization

This document does not cover:

* Fund participation
* Contributions
* Payments
* Authentication
* User registration

---

## Business Rules

* A user must exist before becoming an organization member.
* A user cannot belong to the same organization more than once.
* Only Organization Administrators may invite or remove members.
* Removing a member must preserve historical financial records.
* A removed member cannot participate in future collection cycles unless re-added.

---

## Core Endpoints

### Invite Member

```http
POST /api/organizations/:organizationId/members
```

Invites a user to join an organization.

Expected request:

```json
{
  "email": "john@example.com",
  "role": "member"
}
```

Expected response:

```json
{
  "message": "Invitation sent successfully"
}
```

Business Rules:

* Only Organization Admins may invite members.
* If the user already belongs to the organization, return an appropriate validation error.
* If the user does not yet have a UnityFund account, the invitation should allow them to register before joining.

---

### List Members

```http
GET /api/organizations/:organizationId/members
```

Returns members of an organization.

Expected response:

```json
{
  "members": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "status": "active"
    }
  ]
}
```

Business Rules:

* Users may only view members of organizations they belong to.
* Returned fields should respect role-based permissions.

---

### Get Member

```http
GET /api/organizations/:organizationId/members/:memberId
```

Returns details for a single organization member.

Expected response:

```json
{
  "member": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "status": "active",
    "joinedAt": "2026-06-01T10:30:00Z"
  }
}
```

---

### Update Member

```http
PATCH /api/organizations/:organizationId/members/:memberId
```

Updates editable member information.

Example request:

```json
{
  "role": "treasurer"
}
```

Business Rules:

* Only authorized administrators may change organization roles.
* Role changes should be recorded in the audit log.

---

### Update Member Status

```http
PATCH /api/organizations/:organizationId/members/:memberId/status
```

Example request:

```json
{
  "status": "inactive"
}
```

Supported statuses:

```text
active
inactive
suspended
removed
```

Business Rules:

* Status changes must not delete historical financial records.
* Inactive or suspended members cannot participate in new collection cycles.

---

### Remove Member

```http
DELETE /api/organizations/:organizationId/members/:memberId
```

Removes a member from the organization.

Expected response:

```json
{
  "message": "Member removed successfully"
}
```

Business Rules:

* Removal should be logical rather than destructive.
* Existing contributions, payments, payouts, and audit logs must remain intact.

---

## Authorization Matrix

| Action             | Member | Treasurer | Organization Admin |
| ------------------ | :----: | :-------: | :----------------: |
| View own profile   |    ✓   |     ✓     |          ✓         |
| List members       |   ✓*   |     ✓     |          ✓         |
| Invite members     |    ✗   |     ✗     |          ✓         |
| Update member role |    ✗   |     ✗     |          ✓         |
| Remove member      |    ✗   |     ✗     |          ✓         |

* Subject to organization visibility rules.

---

## Audit Requirements

The system should create audit logs for:

* Member invited
* Invitation accepted
* Member role changed
* Member status changed
* Member removed

---

## Error Responses

Examples:

```json
{
  "error": "Member already belongs to this organization"
}
```

```json
{
  "error": "Member not found"
}
```

```json
{
  "error": "Insufficient permissions"
}
```

---

## Open Questions

* Should invitations expire after a configurable period?
* Can an Organization Admin resend an expired invitation?
* Should a suspended member automatically lose access to all active funds?
* Should member profile information be editable by the member or only by administrators?

---

## Review Checklist

* [ ] Aligns with the Vision documents
* [ ] Aligns with the Business Domain
* [ ] Contains only verified facts or documented product decisions
* [ ] Avoids implementation details
* [ ] Uses consistent UnityFund terminology
* [ ] Ready for implementation review

---

## Summary

The Members API manages organization membership within UnityFund. It provides the foundation for fund participation while preserving financial history, enforcing organizational permissions, and maintaining an auditable record of membership changes.
    