# Backend Architecture

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the backend architecture for UnityFund.

The backend is responsible for enforcing business rules, managing organizational data, processing fund workflows, integrating with Nomba, and maintaining secure financial records.

---

## Scope

This document covers:

* Backend structure
* Core backend modules
* Service responsibilities
* Business logic separation
* Payment integration boundaries
* Reliability and security concerns

This document does not define:

* Database schema
* API endpoint contracts
* Frontend implementation
* Deployment configuration

---

## Backend Architecture Goal

The backend should be modular, secure, auditable, and easy to extend.

UnityFund should separate:

* Business logic
* Payment integration
* Data persistence
* Authentication
* Notifications
* Reporting

This separation makes the system easier to test, maintain, and scale.

---

## Recommended Stack

The backend will use:

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma or Drizzle ORM
* Redis and BullMQ for background jobs where needed
* JWT authentication
* Nomba APIs for supported payment operations

---

## Core Backend Modules

### Auth Module

Handles user identity and access.

Responsibilities:

* User registration
* Login
* Password hashing
* Token generation
* Token validation
* Session handling where required

---

### Organization Module

Manages organizations using UnityFund.

Responsibilities:

* Create organizations
* Update organization profile
* Manage organization settings
* Retrieve organization dashboards

---

### Member Module

Manages organization members.

Responsibilities:

* Invite members
* Add members
* Update member status
* Assign members to funds
* View member participation

---

### Fund Module

Manages funds within organizations.

Responsibilities:

* Create funds
* Update fund information
* Archive funds
* Retrieve fund details
* Connect funds to fund rules

---

### Fund Rules Module

Manages configurable fund behavior.

Responsibilities:

* Store fund rules
* Validate rule configuration
* Expose rules to the workflow engine
* Ensure rules apply consistently

---

### Collection Module

Manages contribution cycles.

Responsibilities:

* Create collection cycles
* Generate member contributions
* Track collection progress
* Mark cycles as active, closed, or completed

---

### Payment Module

Manages payment records inside UnityFund.

Responsibilities:

* Create payment references
* Track payment status
* Link payments to contributions
* Prevent duplicate payment processing
* Store reconciliation history

---

### Nomba Integration Module

Handles communication with Nomba.

Responsibilities:

* Initiate supported payment flows
* Handle Direct Debit where available
* Handle Checkout payment requests
* Handle Virtual Account payment references
* Initiate Transfers where fund rules permit payouts
* Verify and process Nomba webhooks

Nomba integration must remain separate from core business logic.

---

### Workflow Module

Executes business workflows based on fund rules.

Responsibilities:

* Evaluate fund rules
* Decide what happens after payment confirmation
* Trigger payout workflows where allowed
* Trigger renewal workflows where required
* Trigger notifications
* Record audit logs

---

### Notification Module

Handles user notifications.

Responsibilities:

* Payment success notifications
* Contribution reminders
* Failed payment alerts
* Payout status updates
* Administrative alerts

---

### Report Module

Generates financial and operational reports.

Responsibilities:

* Fund summaries
* Contribution reports
* Outstanding payment reports
* Member payment history
* Payout reports

---

### Audit Module

Records important business actions.

Responsibilities:

* Log fund creation
* Log rule changes
* Log payment confirmation
* Log payout attempts
* Log administrative actions

Audit logs should be treated as append-only from the user’s perspective.

---

## Backend Flow

```text
Client Request
    ↓
Route
    ↓
Controller
    ↓
Service
    ↓
Repository / External Integration
    ↓
Database / Nomba
    ↓
Response
```

---

## Payment Confirmation Flow

```text
Nomba Webhook
    ↓
Webhook Controller
    ↓
Signature Verification
    ↓
Idempotency Check
    ↓
Payment Service
    ↓
Contribution Update
    ↓
Workflow Engine
    ↓
Notification / Report / Audit
```

---

## Business Logic Boundary

UnityFund should not place core business logic directly inside controllers.

Controllers should only:

* Validate request shape
* Call services
* Return responses

Services should contain business operations.

The Workflow Module should contain fund lifecycle logic.

The Nomba Integration Module should only handle external payment communication.

---

## Reliability Requirements

The backend should support:

* Webhook idempotency
* Retry-safe processing
* Audit logging
* Proper error handling
* Input validation
* Secure environment variables
* Consistent database transactions where needed

---

## Security Requirements

The backend should enforce:

* Authentication
* Role-based access control
* Password hashing
* Webhook signature verification
* Input validation
* Rate limiting where appropriate
* Financial action audit logs

---

## Design Principles

The backend should follow these principles:

* Business rules before implementation
* Services over controller-heavy logic
* Payment provider isolation
* Auditable financial actions
* Clear module boundaries
* Extensible workflow handling

---

## Summary

The UnityFund backend is designed as a modular financial operations system.

Its core responsibility is to enforce organizational fund logic, while Nomba is used as the payment infrastructure layer for supported collections, webhooks, and transfers.
