# UnityFund AI Context

Status: Active
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document gives AI assistants and new engineers enough context to understand UnityFund before writing code.

AI tools should read this file first, then inspect the detailed documents inside `docs/`.

---

## Project Summary

UnityFund is a financial operating platform for member-based organizations.

It helps organizations create and manage different fund types, automate collections, reconcile payments, manage members, and execute fund-specific workflows using Nomba's payment infrastructure.

UnityFund is not just an Ajo app.

It is a fund management and financial operations platform.

---

## Team

Team: Zero Downtime

Team philosophy:

> Blueprint before build.

The project values:

* Business understanding before code
* Secure financial workflows
* Clean architecture
* Documentation-backed decisions
* Simplicity over unnecessary complexity

---

## Core Product Idea

The central insight behind UnityFund is:

> Organizations do not just manage payments. They manage funds.

A Fund is the primary business entity.

Examples of fund types:

* Annual Dues
* Savings Fund
* Welfare Fund
* Emergency Fund
* Building Fund
* Rotational Savings Fund
* Investment Fund

Each fund type has different rules and workflows.

---

## Core Domain Chain

The most important business chain is:

```text
Organization
→ Fund
→ Collection Cycle
→ Contribution
→ Payment
→ Payout
```

Meaning:

* Organizations own Funds.
* Funds run Collection Cycles.
* Collection Cycles generate Contributions.
* Payments settle Contributions.
* Payouts happen only when Fund Rules allow them.

---

## Key Architectural Decisions

Important ADRs:

1. Fund is the primary business entity.
2. PostgreSQL is the primary database.
3. Payment providers are external infrastructure.
4. RBAC controls authorization.
5. Financial Ledger is deferred beyond MVP.
6. Business Rules Engine evaluates fund behavior.
7. State transitions are controlled.
8. Idempotency is required for financial actions.
9. Money is stored as integer smallest units.
10. Organization isolation is mandatory.

---

## Payment Provider

UnityFund uses Nomba for the MVP.

Nomba is used for:

* Direct Debit
* Checkout
* Tokenized Card Payments
* Virtual Accounts
* Transfers
* Webhooks

UnityFund owns business logic.

Nomba executes supported payment operations.

---

## Backend Stack

Recommended backend stack:

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma
* Zod
* JWT
* Pino
* Vitest

---

## Frontend Stack

Recommended frontend stack:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* Axios

---

## MVP Build Order

Build in this order:

1. Project setup
2. Database setup
3. Authentication
4. Organization isolation
5. RBAC
6. Organizations
7. Members
8. Funds
9. Fund Rules
10. Collection Cycles
11. Contributions
12. Payments
13. Nomba Webhooks
14. Payouts
15. Dashboards
16. Reports
17. Testing
18. Deployment

---

## Rules for AI Assistants

Before writing code, AI assistants must:

1. Read this file.
2. Read relevant docs in `docs/`.
3. Follow ADR decisions.
4. Avoid changing architecture without explanation.
5. Ask before making major structural changes.
6. Implement one module at a time.
7. Keep business logic on the backend.
8. Preserve organization isolation.
9. Use integer money values.
10. Ensure payment and payout operations are idempotent.

---

## Implementation Warning

Do not build UnityFund as a simple CRUD app.

UnityFund is workflow-driven.

The most important backend concern is enforcing business rules around:

* Funds
* Collection Cycles
* Contributions
* Payments
* Payouts
* Approvals
* Organization isolation

---

## First Task for AI Assistant

The AI assistant should first produce an Architecture Understanding Report before writing code.

It should summarize:

* Product vision
* Business domain
* Database model
* API design
* ADRs
* Security model
* Implementation risks
* Recommended build plan

Only after that should implementation begin.
