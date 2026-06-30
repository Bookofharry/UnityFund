# ADR-004: Role-Based Access Control (RBAC)

Status: Accepted
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

# Decision

UnityFund will use **Role-Based Access Control (RBAC)** to authorize user actions.

Permissions are granted to roles rather than directly to individual users. A user's ability to perform an action is determined by their role within an organization.

Authorization decisions are always enforced by the backend.

---

# Context

UnityFund is a multi-tenant financial platform where different users perform different responsibilities.

For example:

* Members make contributions.
* Treasurers monitor collections and manage payouts.
* Approvers review payout requests.
* Organization Administrators manage organizations, funds, and members.
* Platform Administrators manage the UnityFund platform itself.

Granting permissions directly to individual users would become difficult to manage and audit as organizations grow.

RBAC provides a predictable and maintainable authorization model.

---

# Authorization Model

Authentication answers:

> **Who is the user?**

Authorization answers:

> **What is the user allowed to do?**

Before any protected action is executed, UnityFund validates:

```text
Authenticated User
        │
        ▼
Organization Membership
        │
        ▼
Assigned Role
        │
        ▼
Requested Action
        │
        ▼
Authorization Decision
```

Only after successful authorization should business logic execute.

---

# Default Roles

The MVP defines the following organization roles:

### Member

Responsibilities:

* View own contributions
* View own payments
* View own payout history
* Participate in funds

---

### Treasurer

Responsibilities:

* View organization financial information
* Monitor collections
* Initiate eligible payouts
* View reports

---

### Approver

Responsibilities:

* Review payout requests
* Approve or reject payouts according to organization policies

---

### Organization Administrator

Responsibilities:

* Manage organization settings
* Manage members
* Create and manage funds
* Configure fund rules
* Assign organization roles

---

### Platform Administrator

Responsibilities:

* Platform operations
* Organization oversight
* System configuration
* Support activities

Platform Administrators operate outside normal organization workflows and should be granted access only through dedicated administrative functionality.

---

# Why This Decision Was Made

Alternative approaches considered:

### User-Based Permissions

Rejected because:

* Difficult to maintain
* Hard to audit
* Does not scale well

### Attribute-Based Access Control (ABAC)

Rejected for the MVP because:

* More flexible but significantly more complex
* Requires policy evaluation infrastructure
* Unnecessary for current business requirements

RBAC provides the right balance of simplicity, security, and scalability for UnityFund.

---

# Security Principles

The backend is the source of truth for authorization.

The frontend may hide unavailable actions to improve user experience, but it must never be relied upon to enforce permissions.

Every protected request must validate:

* Authentication
* Organization context
* User role
* Requested action

---

# Relationship to Organization Isolation

RBAC operates **within** an organization.

Organization Isolation (ADR-010) determines **which organization** a user is operating in.

RBAC determines **what the user can do** inside that organization.

These two architectural decisions work together.

---

# Consequences

## Positive

* Simple permission management
* Predictable authorization behavior
* Easier auditing
* Scalable organization management
* Consistent security model

## Negative

* Custom user permissions are not supported in the MVP
* New roles require updates to the authorization configuration

---

# Related Documents

* Authentication API
* Organizations API
* Members API
* Security Architecture
* ADR-006 — Business Rules Engine
* ADR-010 — Organization Isolation

---

# Future Considerations

Future versions may introduce:

* Custom organization roles
* Permission templates
* Fine-grained permissions
* Attribute-Based Access Control (ABAC) for advanced enterprise scenarios

These enhancements should build upon the RBAC foundation rather than replace it.

---

# Summary

UnityFund uses Role-Based Access Control to provide consistent, secure, and maintainable authorization.

Authentication establishes identity, Organization Isolation establishes tenant context, and RBAC determines whether a user may perform a requested action within that organization.
