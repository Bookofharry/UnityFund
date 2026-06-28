# ADR-010: Organization Isolation

Status: Accepted
Version: 0.1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund will implement strict organization isolation.

Every business operation, database query, API request, and authorization decision must be scoped to a single organization.

Users may belong to multiple organizations, but data from one organization must never be visible or accessible to another unless explicitly authorized at the platform level.

---

# Context

UnityFund is a multi-tenant platform.

Multiple organizations share the same application and infrastructure while expecting complete separation of their financial data.

Organization isolation is essential for:

* Data privacy
* Financial integrity
* Security
* Trust

---

# Core Principles

Organization data is isolated by default.

Every resource belongs to one organization.

Every authenticated request operates within one organization context.

The backend is responsible for enforcing organization boundaries.

---

# Organization Ownership

The following entities belong to an organization:

* Members
* Funds
* Fund Rules
* Collection Cycles
* Contributions
* Payments
* Payouts
* Reports
* Notifications
* Audit Logs

Every business record must be traceable to exactly one organization.

---

# Request Context

Authenticated requests should include an organization context.

The backend must verify:

1. The authenticated user exists.
2. The user belongs to the requested organization.
3. The user has permission to perform the requested action.

If any check fails, access must be denied.

---

# Authorization Rules

Organization membership alone does not grant unrestricted access.

Authorization depends on:

* Organization membership
* User role
* Requested action
* Target resource

Examples:

* A Member can view their own contributions.
* A Treasurer can view organization financial reports.
* An Organization Administrator can manage funds and members.

---

# Database Principles

Database queries should always be organization-scoped.

Examples:

Correct:

```sql
SELECT *
FROM funds
WHERE organization_id = :organizationId;
```

Incorrect:

```sql
SELECT *
FROM funds;
```

Organization filtering must never rely on frontend behavior.

---

# API Principles

Protected endpoints should validate organization context before executing business logic.

The API should reject requests where:

* Organization does not exist.
* User is not a member.
* User lacks sufficient permissions.

---

# Business Rules Engine

The Business Rules Engine must execute only within the active organization context.

Business workflows must never affect resources belonging to another organization.

---

# Audit Requirements

Audit logs should record:

* Organization context
* Acting user
* Action performed
* Target resource
* Timestamp

This supports traceability and investigation.

---

# Platform Administration

Platform Administrators may access multiple organizations only through explicitly authorized platform-level functionality.

Administrative capabilities should be isolated from normal organization workflows.

---

# Consequences

## Positive

* Strong tenant isolation.
* Improved security.
* Better privacy.
* Reduced risk of data leakage.
* Simpler authorization reasoning.

## Negative

* Every query must include organization validation.
* Additional authorization checks increase implementation effort.

---

# Future Considerations

Future versions may introduce:

* Organization transfers
* Cross-organization reporting (platform administrators only)
* Enterprise organizations with multiple subsidiaries

These features must preserve tenant isolation.

---

# Related Documents

* Authentication API
* Organizations API
* Security Architecture
* ADR-004 — Role-Based Access Control

---

# Summary

UnityFund treats every organization as an isolated financial environment.

All application behavior—from API requests to database queries and business workflows—must operate within an explicitly validated organization context to protect financial data, maintain tenant isolation, and ensure secure multi-tenant operation.

