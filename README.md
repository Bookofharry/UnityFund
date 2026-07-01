# UnityFund

> **The financial operating platform for member-based organizations.**

UnityFund replaces spreadsheets, WhatsApp groups, and manual bank reconciliation with a unified platform that automates the complete lifecycle of organizational funds — from member onboarding and recurring collections to approvals, payouts, and reporting — powered by Nomba's payment infrastructure.

Built for the **DevCareer × Nomba Hackathon 2026** by Team Zero Downtime.

---

## The Problem

Across Nigeria and Africa, thousands of member-based organizations — cooperative societies, welfare associations, alumni groups, professional bodies — manage shared finances through a combination of Excel spreadsheets, WhatsApp reminders, bank alerts, and manual reconciliation.

The result:

- **Administrators** spend hours every cycle reminding members to pay, confirming payments, updating records, and preparing reports.
- **Members** have limited visibility into where their money goes or what the fund's current status is.
- **Organizations** cannot scale because the operational complexity grows faster than their capacity to manage it manually.

Existing tools solve only parts of the problem. Banks move money. Payment gateways process transactions. Spreadsheets store data. None of them understand how organizational funds actually work.

---

## The Solution

UnityFund is built around a single core insight:

> **Organizations don't manage payments. They manage funds.**

Payments are one step in a much larger workflow. Every fund has different rules, different lifecycles, and different business logic. UnityFund is built to understand and automate those differences.

Instead of disconnected tools, organizations get one platform to:

- Create multiple fund types with custom rules
- Automate recurring collections via Nomba Direct Debit and Checkout
- Reconcile payments automatically through verified webhooks
- Manage members with role-based access control
- Execute approval workflows for payouts
- Monitor every fund from a real-time dashboard
- Generate financial reports with a full audit trail

---

## Fund Types

UnityFund supports seven distinct fund types, each with its own lifecycle and business behaviour:

| Fund Type | Purpose | Payout Behaviour |
|---|---|---|
| **Annual Dues** | Membership fees for operational expenses | Retained by organization |
| **Savings Fund** | Personal savings through recurring contributions | On request, with approval |
| **Welfare Fund** | Financial assistance during illness, bereavement or emergencies | Approved beneficiaries only |
| **Emergency Fund** | Unexpected organizational or member emergencies | Approval-gated |
| **Building Fund** | Long-term infrastructure or capital projects | Project expenses only |
| **Rotational Savings** | Pooled contributions paid to one member per cycle (Ajo/Esusu) | Scheduled rotation |
| **Investment Fund** | Pooled contributions for investment opportunities | Future roadmap |

---

## User Roles

Access within each organization is governed by five roles:

| Role | Key Responsibilities |
|---|---|
| **Organization Admin** | Create funds, configure rules, invite members, start cycles, access reports |
| **Treasurer** | Monitor contributions, initiate approved payouts, generate financial reports |
| **Approver** | Review and approve or reject payout requests |
| **Member** | Make contributions, view personal contribution history, manage bank accounts and mandates |
| **Platform Admin** | UnityFund team — platform-level visibility and support |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TanStack Query 5, React Router 6, Tailwind CSS 3 |
| **Backend** | Node.js, Express, TypeScript, Zod validation |
| **Database** | PostgreSQL via Prisma ORM |
| **Payments** | Nomba API — Checkout, Direct Debit, Bank Transfers, Webhooks |
| **Auth** | JWT (15-minute access tokens), bcrypt password hashing |
| **Logging** | Pino structured logging |

---

## Architecture

```
User
 └── React Frontend (Vite + TanStack Query)
       └── REST API (Express + TypeScript)
             ├── Auth (JWT)
             ├── Business Rules Engine (BRE)
             ├── Nomba Integration Layer
             │     ├── Checkout  →  POST /checkout/order
             │     ├── Direct Debit  →  POST /direct-debits/debit-mandate
             │     ├── Transfers  →  POST /v2/transfers/bank/{subAccountId}
             │     └── Webhooks  →  HMAC-SHA256 signature verification
             └── PostgreSQL (Prisma ORM)
                   └── 18 tables — funds, cycles, contributions,
                       payments, payouts, mandates, bank_accounts,
                       audit_logs, webhook_events, ...
```

**Key architecture decisions:**

- **Money stored as Kobo integers** — never floats, never divide before aggregating
- **Webhook-first payment reconciliation** — payments are only trusted after verified Nomba webhooks
- **Rule snapshots** — collection cycles snapshot fund rules at start time; live rule changes never retroactively affect in-progress cycles
- **Atomic payout execution** — conditional `UPDATE WHERE status = 'approved'` prevents concurrent double-execution
- **Idempotent webhook processing** — `requestId` stored in `webhook_events` table prevents double-credit
- **Organization isolation** — every query is scoped to `organizationId`; cross-tenant data leakage is structurally impossible

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Nomba sandbox account ([developer.nomba.com](https://developer.nomba.com))

### 1. Clone and install

```bash
git clone https://github.com/Bookofharry/UnityFund.git
cd UnityFund

# Install API dependencies
cd api && npm install

# Install web dependencies
cd ../web && npm install
```

### 2. Configure environment

```bash
# API
cp api/.env.example api/.env
# Fill in: DATABASE_URL, JWT_SECRET, NOMBA_* credentials

# Web
cp web/.env.example web/.env
```

### 3. Run database migrations and seed

```bash
cd api
npx prisma migrate deploy
npx prisma db seed
```

The seed creates a demo organization — **Lagos Teachers Cooperative** — with 7 users and 3 funds pre-configured:

| User | Email | Role |
|---|---|---|
| Platform Admin | platform@unityfund.dev | Platform Admin |
| Harry Admin | admin@unityfund.dev | Organization Admin |
| Chioma | treasurer@unityfund.dev | Treasurer |
| Emeka | approver@unityfund.dev | Approver |
| Amaka, Tunde, Ngozi | amaka / tunde / ngozi @unityfund.dev | Member |

**Password for all accounts:** `Password123!`

### 4. Start the servers

```bash
# Terminal 1 — API (port 4000)
cd api && npm run dev

# Terminal 2 — Web (port 3000)
cd web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Overview

The REST API is organized around core business entities:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:orgId
GET    /api/organizations/:orgId/dashboard

GET    /api/organizations/:orgId/funds
POST   /api/organizations/:orgId/funds
POST   /api/organizations/:orgId/funds/:fundId/rules
POST   /api/organizations/:orgId/funds/:fundId/collection-cycles
POST   /api/organizations/:orgId/funds/:fundId/collection-cycles/:cycleId/start
POST   /api/organizations/:orgId/funds/:fundId/collection-cycles/:cycleId/close

POST   /api/organizations/:orgId/contributions/:contributionId/payments

GET    /api/organizations/:orgId/payouts
POST   /api/organizations/:orgId/payouts/:payoutId/approve
POST   /api/organizations/:orgId/payouts/:payoutId/execute

POST   /api/organizations/:orgId/members/:memberId/bank-accounts
POST   /api/organizations/:orgId/members/:memberId/mandates

POST   /api/webhooks/nomba        ← Nomba payment events
```

All authenticated endpoints require `Authorization: Bearer <token>`. Rate limits apply per endpoint group (10 req/15 min on auth, 500 req/15 min on general API).

---

## Nomba Integration

UnityFund integrates with the following Nomba APIs:

| Feature | Nomba Endpoint |
|---|---|
| Checkout (card, transfer, QR) | `POST /v1/checkout/order` |
| Direct Debit | `POST /v1/direct-debits` + `/debit-mandate` |
| Bank Transfer (payout) | `POST /v2/transfers/bank/{subAccountId}` |
| Bank Account Lookup | `POST /v1/transfers/bank/lookup` |
| Transaction Verification | `GET /v1/transactions/accounts/single` |
| Webhook events | HMAC-SHA256 signature, `nomba-timestamp` header |

Webhooks are processed using Nomba's HMAC-SHA256 field-concatenation signature scheme and written to `webhook_events` before any processing — ensuring durability and idempotent replay safety.

---

## Project Structure

```
UnityFund/
├── api/                    # Express + TypeScript backend
│   ├── prisma/             # Schema, migrations, seed
│   └── src/
│       ├── modules/        # auth, funds, payments, payouts, mandates, ...
│       ├── lib/            # nomba client, JWT, hashing, logger
│       ├── middleware/      # auth, RBAC, rate limiting, validation
│       └── services/       # BRE, audit log
│
├── web/                    # React + Vite frontend
│   └── src/
│       ├── pages/          # 18 pages — dashboard, funds, contributions, ...
│       ├── sections/       # Landing page marketing sections
│       ├── api/            # Typed API client layer
│       └── context/        # Auth context, organization state
│
├── docs/                   # Architecture decisions, API specs, business docs
└── docker-compose.yml      # PostgreSQL + Redis for local dev
```

---

## Key Features

- **Multi-fund management** — create and run multiple independent funds simultaneously, each with its own rules and lifecycle
- **Configurable fund rules** — contribution amount, frequency, collection day, partial payment, payout trigger, approval requirements, penalty settings
- **Automated contribution generation** — starting a collection cycle auto-creates a contribution record for every enrolled fund member
- **Rule snapshots** — cycle business logic reads from a snapshot of fund rules taken at cycle start, never from live rules
- **Role-based access control** — five roles, consistently enforced in API middleware, not just frontend UI
- **Invitation system** — email invitations with secure SHA-256 token hashing; supports new-user registration and existing-user linking in a single flow
- **Real-time dashboard** — active funds, active cycles, total collected, outstanding amount
- **Full audit trail** — every financial and administrative action is recorded with actor, entity, action, and description
- **Idempotent payments** — `merchantTxRef` (our payment ID) used as Nomba's idempotency key on all transfer and checkout calls

---

## License

MIT — see [LICENSE](LICENSE).

---

Built with ❤️ by **Team Zero Downtime** for the DevCareer × Nomba Hackathon 2026.
