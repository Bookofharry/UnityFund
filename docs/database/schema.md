# Database Schema

Status: Draft
Version: 1.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-27

---

## Purpose

This document defines the first version of UnityFund’s database schema.

The schema is based on the business domain and ERD. It is designed to support organizations, funds, members, collection cycles, contributions, payments, payouts, mandates, notifications, and audit logs.

---

## Database Choice

UnityFund will use **PostgreSQL**.

PostgreSQL is suitable because UnityFund requires:

* Relational data
* Strong consistency
* Foreign key constraints
* Transactions
* Reporting queries
* Financial record integrity

---

## Schema Principles

The schema should follow these principles:

1. Use UUIDs for primary keys.
2. Use foreign keys for important relationships.
3. Use timestamps on all major tables.
4. Avoid deleting financial records.
5. Use status fields for lifecycle tracking.
6. Store external provider references for Nomba transactions.
7. Enforce idempotency for webhook events.
8. Keep business records auditable.

---

## Core Tables

### users

Stores platform users.

Key fields:

```txt
id
first_name
last_name
email
password_hash
phone
status
created_at
updated_at
```

---

### organizations

Stores organizations using UnityFund.

Key fields:

```txt
id
name
organization_type
email
phone
status
created_at
updated_at
```

---

### organization_members

Connects users to organizations.

Key fields:

```txt
id
organization_id
user_id
role
status
joined_at
created_at
updated_at
```

Important constraints:

```txt
unique(organization_id, user_id)
```

---

### funds

Stores funds created by organizations.

Key fields:

```txt
id
organization_id
name
fund_type
description
status
created_at
updated_at
```

---

### fund_members

Connects organization members to funds.

Key fields:

```txt
id
fund_id
organization_member_id
status
joined_at
created_at
updated_at
```

Important constraints:

```txt
unique(fund_id, organization_member_id)
```

---

### fund_rules

Stores configurable rules for a fund.

Key fields:

```txt
id
fund_id
contribution_amount
contribution_frequency
collection_day
start_date
end_date
allow_partial_payment
payout_allowed
approval_required
penalty_enabled
rules_json
created_at
updated_at
```

Important constraints:

```txt
unique(fund_id)
```

Notes:

`rules_json` can store additional configurable rules that are not yet promoted to first-class columns.

---

### collection_cycles

Stores collection periods for funds.

Key fields:

```txt
id
fund_id
name
cycle_number
start_date
end_date
status
created_at
updated_at
```

Example cycle names:

```txt
January 2026
Annual Dues 2026
Cycle 4
```

---

### contributions

Stores expected payments by fund members.

Key fields:

```txt
id
collection_cycle_id
fund_member_id
expected_amount
paid_amount
status
due_date
paid_at
created_at
updated_at
```

Possible statuses:

```txt
pending
partial
paid
failed
overdue
cancelled
```

---

### payments

Stores payment attempts and confirmations.

Key fields:

```txt
id
contribution_id
organization_id
fund_id
amount
currency
payment_method
provider
provider_reference
provider_event_id
status
paid_at
raw_payload
created_at
updated_at
```

Possible payment methods:

```txt
direct_debit
checkout
virtual_account
tokenized_card
manual
```

Possible statuses:

```txt
initiated
successful
failed
reversed
pending_review
```

Important constraints:

```txt
unique(provider, provider_reference)
unique(provider_event_id)
```

Notes:

A contribution may have multiple payment attempts.

A payment should only mark a contribution as paid after verified confirmation.

---

### mandates

Stores recurring payment authorization details.

Key fields:

```txt
id
organization_member_id
provider
provider_mandate_id
status
start_date
end_date
max_amount
frequency
created_at
updated_at
```

Possible statuses:

```txt
pending
active
suspended
deleted
expired
```

---

### payouts

Stores payout records.

Key fields:

```txt
id
fund_id
recipient_member_id
amount
currency
provider
provider_reference
status
reason
approved_by
approved_at
paid_at
raw_payload
created_at
updated_at
```

Possible statuses:

```txt
pending
approved
processing
successful
failed
cancelled
```

Notes:

Only funds with payout rules enabled should create payouts.

---

### notifications

Stores user-facing notifications.

Key fields:

```txt
id
user_id
organization_id
title
message
type
read_at
created_at
```

---

### audit_logs

Stores important administrative and financial actions.

Key fields:

```txt
id
organization_id
actor_user_id
entity_type
entity_id
action
description
metadata
created_at
```

Notes:

Audit logs should be append-only from the user’s perspective.

---

## Important Indexes

Recommended indexes:

```txt
users.email
organizations.status
organization_members.organization_id
organization_members.user_id
funds.organization_id
funds.fund_type
fund_members.fund_id
collection_cycles.fund_id
contributions.collection_cycle_id
contributions.fund_member_id
contributions.status
payments.provider_reference
payments.provider_event_id
payouts.fund_id
audit_logs.organization_id
```

---

## Data Integrity Rules

1. A user may belong to multiple organizations.
2. An organization may have multiple funds.
3. A fund must belong to one organization.
4. A fund member must first be an organization member.
5. A collection cycle must belong to one fund.
6. A contribution must belong to one collection cycle and one fund member.
7. A contribution may have multiple payment attempts.
8. A payout must belong to one fund.
9. Payments must be idempotent.
10. Financial records should not be hard-deleted.

---

## Summary

This schema supports the first version of UnityFund’s financial operating model.

It preserves the core chain:

```txt
Organization
→ Fund
→ Collection Cycle
→ Contribution
→ Payment
```

It also supports payout workflows, recurring mandates, notifications, and auditability.
