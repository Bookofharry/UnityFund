# Authentication API

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the authentication API requirements for UnityFund.

Authentication ensures that users can securely access the platform, while authorization determines what actions they can perform within an organization.

---

## Scope

This document covers:

* User registration
* Login
* Logout
* Token handling
* Password reset
* Authenticated user profile
* Organization context

This document does not cover:

* Full role permissions
* Nomba webhook verification
* Database schema
* Frontend form design

---

## Authentication Model

UnityFund will use token-based authentication.

The backend should issue access credentials after successful login, and protected endpoints should require valid authentication.

Recommended approach:

* Short-lived access token
* Refresh token or secure session mechanism
* Password hashing
* Role checks at protected routes

---

## Core Endpoints

### Register User

```http
POST /api/auth/register
```

Creates a new user account.

Expected fields:

```json
{
  "firstName": "Harry",
  "lastName": "Joseph",
  "email": "harry@example.com",
  "password": "securePassword"
}
```

Expected result:

```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "harry@example.com"
  }
}
```

---

### Login

```http
POST /api/auth/login
```

Authenticates a user.

Expected fields:

```json
{
  "email": "harry@example.com",
  "password": "securePassword"
}
```

Expected result:

```json
{
  "message": "Login successful",
  "accessToken": "token",
  "user": {
    "id": "uuid",
    "email": "harry@example.com"
  }
}
```

---

### Logout

```http
POST /api/auth/logout
```

Ends the current user session.

Expected result:

```json
{
  "message": "Logout successful"
}
```

---

### Get Current User

```http
GET /api/auth/me
```

Returns the authenticated user's profile and organization memberships.

Expected result:

```json
{
  "user": {
    "id": "uuid",
    "firstName": "Harry",
    "lastName": "Joseph",
    "email": "harry@example.com"
  },
  "organizations": [
    {
      "id": "uuid",
      "name": "Tech Minds Cooperative",
      "role": "organization_admin"
    }
  ]
}
```

---

### Request Password Reset

```http
POST /api/auth/password-reset/request
```

Starts password reset flow.

Expected fields:

```json
{
  "email": "harry@example.com"
}
```

Expected result:

```json
{
  "message": "If the email exists, a reset instruction will be sent"
}
```

---

### Reset Password

```http
POST /api/auth/password-reset/confirm
```

Completes password reset flow.

Expected fields:

```json
{
  "token": "reset-token",
  "newPassword": "newSecurePassword"
}
```

Expected result:

```json
{
  "message": "Password reset successful"
}
```

---

## Organization Context

A user may belong to multiple organizations.

Authenticated requests that operate inside an organization should include organization context.

Recommended approach:

```http
X-Organization-Id: organization-uuid
```

The backend must verify that the authenticated user belongs to the requested organization before allowing access.

---

## Authorization

Authentication confirms who the user is.

Authorization confirms what the user can do.

Authorization should be based on:

* Organization membership
* User role
* Requested action
* Target resource

Example:

A member may view their own contributions but should not create funds.

An organization admin may create funds and invite members.

---

## Security Requirements

The authentication system must:

* Hash passwords securely.
* Never store plain-text passwords.
* Validate login credentials safely.
* Protect access tokens.
* Prevent unauthorized organization access.
* Avoid leaking whether an email exists during password reset.
* Support account status checks.

---

## Error Responses

Common error responses:

```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Forbidden"
}
```

```json
{
  "error": "Validation failed"
}
```

---

## Open Questions

* Should refresh tokens be stored in HTTP-only cookies or returned as tokens?
* Should email verification be required before accessing the dashboard?
* Should multi-factor authentication be part of future versions?
* Should organization switching happen through headers, URL params, or selected session context?

---

## Summary

Authentication is the entry point into UnityFund.

The system must securely identify users and ensure that every organization-level action is performed only by users with the correct membership and role.
