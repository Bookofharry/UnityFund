# Invitations API

Status: Draft
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Purpose

This document defines the API for managing organization membership invitations.

When an Organization Admin invites a user to join their organization, a secure invitation token is generated and sent to the user's email. The user accepts the invitation through a link, either registering a new account or linking to an existing one.

This is the documented invitation flow that was missing from the Members API.

---

## Scope

This document covers:

* Sending an invitation
* Validating an invitation token
* Accepting an invitation
* Listing pending invitations
* Resending an invitation
* Cancelling an invitation

This document does not cover:

* Organization member management after acceptance (see Members API)
* User registration outside the invitation flow (see Auth API)

---

## Business Rules

* Only Organization Admins may send invitations.
* A pending invitation already exists if `(organization_id, email)` has an active `pending` invitation. A second invitation to the same email in the same organization is rejected until the first is cancelled or expires.
* Invitations expire after 48 hours.
* An invitation token is used exactly once. Accepting an invitation immediately invalidates the token.
* If the invited email address already has a UnityFund account, accepting the invitation links the existing account to the organization.
* If the invited email address has no UnityFund account, the acceptance flow requires the user to complete registration before the membership is created.
* Cancelled invitations cannot be accepted.
* Expired invitations cannot be accepted. The inviting admin must resend.

---

## Invitation Lifecycle

```text
Admin sends invitation
        │
        ▼
Invitation created (status: pending)
Token generated and emailed
        │
        ▼
User clicks email link
        │
        ▼
Token validated (expiry + status check)
        │
   ┌────┴────┐
   │         │
User exists  User does not exist
   │         │
   │         ▼
   │    User registers
   │         │
   └────┬────┘
        ▼
Invitation accepted (status: accepted)
Organization membership created
```

---

## Endpoints

### Send Invitation

```http
POST /api/organizations/:organizationId/invitations
```

Creates a new invitation and sends an email to the invitee.

Expected request:

```json
{
  "email": "amaka@example.com",
  "role": "member"
}
```

Supported roles for invitation:

```txt
member
treasurer
organization_admin
```

Expected response:

```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "uuid",
    "email": "amaka@example.com",
    "role": "member",
    "status": "pending",
    "expiresAt": "2026-06-30T10:00:00Z"
  }
}
```

Authorization:

* Organization Admin

Business Rules:

* An active pending invitation to the same email in the same organization must not exist.
* The invitation token is generated server-side, hashed before storage, and sent only in the email.
* The raw token is never returned in the API response.

---

### Validate Invitation Token

```http
GET /api/invitations/:token
```

Validates an invitation token and returns enough information for the frontend to decide what to show the user (registration form vs. direct acceptance).

This is a public endpoint. No authentication is required.

Expected response (valid token):

```json
{
  "valid": true,
  "invitation": {
    "organizationName": "Abuja Teachers Cooperative",
    "email": "amaka@example.com",
    "role": "member",
    "expiresAt": "2026-06-30T10:00:00Z",
    "requiresRegistration": true
  }
}
```

`requiresRegistration` is `true` if no UnityFund account exists for the invited email address.

Expected response (invalid or expired token):

```json
{
  "valid": false,
  "reason": "expired"
}
```

Possible reasons:

```txt
expired
already_accepted
cancelled
not_found
```

Authorization:

* Public — no authentication required

Security Note:

* The token is hashed on arrival and compared against `invitations.token_hash`. The raw token is never stored.
* This endpoint must not reveal whether an email address has a UnityFund account to unauthenticated callers. The `requiresRegistration` field is safe to return because the caller must already possess the valid token to reach this point.

---

### Accept Invitation

```http
POST /api/invitations/:token/accept
```

Accepts a valid invitation and creates the organization membership.

This is a public endpoint but requires either an authenticated user session or registration credentials in the request body.

**Case A — User already has a UnityFund account and is authenticated:**

```http
POST /api/invitations/:token/accept
Authorization: Bearer <accessToken>
```

Expected request body: empty

**Case B — User needs to register:**

```http
POST /api/invitations/:token/accept
```

Expected request body:

```json
{
  "firstName": "Amaka",
  "lastName": "Obi",
  "password": "securePassword123"
}
```

The email address is taken from the invitation record, not from the request body.

Expected response (both cases):

```json
{
  "message": "Invitation accepted. You are now a member of Abuja Teachers Cooperative.",
  "organizationMember": {
    "organizationId": "uuid",
    "organizationName": "Abuja Teachers Cooperative",
    "role": "member",
    "status": "active"
  },
  "accessToken": "jwt-token"
}
```

`accessToken` is returned to allow the user to proceed into the application immediately after accepting.

Authorization:

* Public — no authentication required (token is the credential)

Business Rules:

* The token must be valid, unexpired, and not previously used.
* If a user account is created during acceptance (Case B), the account is immediately active.
* The invitation status is set to `accepted` and `accepted_at` is recorded.
* An audit log entry is created for the membership creation.

---

### List Invitations

```http
GET /api/organizations/:organizationId/invitations
```

Returns all invitations for an organization.

Optional filters:

* `status` — `pending`, `accepted`, `expired`, `cancelled`

Expected response:

```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "amaka@example.com",
      "role": "member",
      "status": "pending",
      "invitedByName": "Harry Joseph",
      "expiresAt": "2026-06-30T10:00:00Z",
      "createdAt": "2026-06-28T10:00:00Z"
    }
  ]
}
```

Authorization:

* Organization Admin

---

### Resend Invitation

```http
POST /api/organizations/:organizationId/invitations/:invitationId/resend
```

Cancels the existing invitation and creates a new one with a fresh token and extended expiry. A new email is sent.

Expected response:

```json
{
  "message": "Invitation resent successfully",
  "invitation": {
    "id": "uuid",
    "email": "amaka@example.com",
    "expiresAt": "2026-06-30T12:00:00Z"
  }
}
```

Authorization:

* Organization Admin

Business Rules:

* Only `pending` invitations can be resent.
* Resending generates a completely new token. The old token is immediately invalidated.

---

### Cancel Invitation

```http
DELETE /api/organizations/:organizationId/invitations/:invitationId
```

Cancels a pending invitation. The invitee can no longer accept it.

Expected response:

```json
{
  "message": "Invitation cancelled"
}
```

Authorization:

* Organization Admin

Business Rules:

* Only `pending` invitations can be cancelled.
* Already accepted invitations cannot be cancelled through this endpoint. To remove an accepted member, use the Members API.

---

## Authorization Matrix

| Action              | Member | Treasurer | Organization Admin |
| ------------------- | :----: | :-------: | :----------------: |
| Send invitation     |    ✗   |     ✗     |          ✓         |
| Validate token      |  Public (no auth)           |
| Accept invitation   |  Public (token is credential) |
| List invitations    |    ✗   |     ✗     |          ✓         |
| Resend invitation   |    ✗   |     ✗     |          ✓         |
| Cancel invitation   |    ✗   |     ✗     |          ✓         |

---

## Audit Requirements

The system should record:

* Invitation sent (who sent it, to what email, for what role)
* Invitation accepted (which user, which organization)
* Invitation cancelled
* Invitation resent

---

## Security Requirements

* Invitation tokens must be cryptographically random (minimum 32 bytes from a secure random source).
* Tokens must be stored as hashes only. The raw token exists only in the email.
* The validate token endpoint must not distinguish between "token not found" and "token expired" in a way that allows enumeration.
* Invitations must have a short, fixed expiry (48 hours).
* Accepting an invitation must immediately invalidate the token, even if the acceptance fails partway through — a failed acceptance must not leave a usable token in the database.

---

## Error Scenarios

* Organization not found
* Pending invitation already exists for this email in this organization
* Invitation not found
* Invitation expired
* Invitation already accepted
* Invitation cancelled
* Invalid role
* Registration required fields missing (Case B acceptance)
* Email in request does not match invitation email (if provided)
* Unauthorized action

---

## Open Questions

* Should invitation links be deep links into the frontend application or direct API URLs?
* Should admins be able to invite users by name rather than email (for users who already have accounts)?
* Should there be a configurable expiry period per organization, or a fixed platform-wide expiry?

---

## Related Documents

* Members API
* Auth API
* ADR-004 — Role-Based Access Control
* ADR-010 — Organization Isolation
* ADR-011 — MVP Pre-Build Risk Fixes

---

## Review Checklist

* [ ] Token security model is correct (hash-only storage)
* [ ] Invitation lifecycle covers all states
* [ ] Accept flow handles both existing and new users
* [ ] Public endpoints are appropriately limited
* [ ] Ready for implementation review

---

## Summary

The Invitations API provides a secure, token-based flow for onboarding new members into an organization. It replaces the underdefined "invite member" endpoint in the Members API with a complete lifecycle: send, validate, accept, resend, and cancel. Without this API, organization membership cannot be established.
