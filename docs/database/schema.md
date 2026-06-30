# Database Schema

Status: Draft
Version: 2.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Purpose

This document defines the database schema for UnityFund.

The schema is based on the business domain and ERD. It is designed to support organizations, funds, members, collection cycles, contributions, payments, payouts, mandates, notifications, and audit logs.

Version 2.0 adds: `rotation_position` on `fund_members`, payout trigger rules on `fund_rules`, fund rule snapshots on `collection_cycles`, and four new tables: `invitations`, `password_reset_tokens`, `bank_accounts`, and `webhook_events`. These changes address structural gaps identified before implementation began.

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
rotation_position
status
joined_at
created_at
updated_at
```

Important constraints:

```txt
unique(fund_id, organization_member_id)
```

Notes:

`rotation_position` is a nullable integer. It is required for funds of type `rotational_savings` and must be set at the time of member enrollment. It defines the payout order for the rotation. For all other fund types, this field should be left null.

No two fund members within the same fund may share the same `rotation_position`. A partial unique index enforces this:

```txt
unique(fund_id, rotation_position) WHERE rotation_position IS NOT NULL
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
payout_trigger
payout_threshold_percentage
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

`payout_trigger` controls what condition must be met before a payout is eligible after a collection cycle closes. Supported values:

```txt
all_paid              — all fund members must have a paid contribution
cycle_closed          — payout is triggered when the cycle is manually closed regardless of collection rate
threshold_percentage  — payout is triggered when collected amount meets or exceeds payout_threshold_percentage of expected total
```

`payout_threshold_percentage` is only required when `payout_trigger = threshold_percentage`. It must be an integer between 1 and 100. For other trigger types, this field should be null.

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
snapshot_contribution_amount
snapshot_contribution_frequency
snapshot_allow_partial_payment
snapshot_payout_trigger
snapshot_payout_threshold_percentage
snapshot_approval_required
snapshot_rules_json
created_at
updated_at
```

Example cycle names:

```txt
January 2026
Annual Dues 2026
Cycle 4
```

Notes:

All `snapshot_*` fields are populated at the moment the collection cycle transitions from `draft` to `active`. They capture the state of `fund_rules` at cycle start and are never modified after that point.

This protects active cycles from fund rule changes made by administrators during an ongoing cycle. The snapshot is the authoritative rule source for any cycle-level business logic, including contribution generation, payment validation, and payout eligibility evaluation.

`snapshot_rules_json` stores the full `fund_rules.rules_json` value at cycle start for extended rule coverage.

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
draft
pending_approval
approved
processing
successful
failed
cancelled
```

Notes:

Only funds with `payout_allowed = true` in their fund rules should create payouts.

The transition from `approved` to `processing` must be performed using an atomic conditional UPDATE that checks the current status before changing it:

```sql
UPDATE payouts
SET status = 'processing'
WHERE id = :payoutId AND status = 'approved'
```

The application must verify that exactly one row was affected. If zero rows are affected, the payout has already been moved to `processing` by a concurrent request and no transfer should be initiated. This prevents duplicate Nomba transfers for a single payout record.

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

### invitations

Stores pending organization membership invitations.

Key fields:

```txt
id
organization_id
invited_by_user_id
email
role
token_hash
status
expires_at
accepted_at
created_at
updated_at
```

Possible statuses:

```txt
pending
accepted
expired
cancelled
```

Important constraints:

```txt
unique(token_hash)
unique(organization_id, email) WHERE status = ‘pending’
```

Notes:

`token_hash` stores the bcrypt or SHA-256 hash of the invitation token. The raw token is sent only in the invitation email and never stored. On acceptance, the submitted token is hashed and compared against this field.

The partial unique constraint on `(organization_id, email) WHERE status = ‘pending’` prevents sending duplicate active invitations to the same email address for the same organization. A cancelled or accepted invitation does not block re-invitation.

Invitations expire after a configurable period. Expired invitations must be checked at lookup time using the `expires_at` field, not a background job.

---

### password_reset_tokens

Stores password reset tokens for the forgot-password flow.

Key fields:

```txt
id
user_id
token_hash
expires_at
used_at
created_at
```

Important constraints:

```txt
unique(token_hash)
```

Notes:

`token_hash` stores a SHA-256 hash of the reset token. The raw token is sent only in the reset email and never stored in the database.

A token is valid only if: `used_at IS NULL` AND `expires_at > NOW()`. On successful password reset, `used_at` is set immediately to invalidate the token. Tokens should expire after a short window (recommended: 1 hour).

Only the most recently created unused token per user should be considered valid. Previous unused tokens for the same user should be invalidated when a new one is created.

---

### bank_accounts

Stores member bank account details used for receiving Nomba transfers (payouts).

Key fields:

```txt
id
organization_member_id
account_name
account_number
bank_code
bank_name
is_verified
is_default
status
created_at
updated_at
```

Possible statuses:

```txt
active
inactive
```

Important constraints:

```txt
unique(organization_member_id, account_number, bank_code)
```

Notes:

Bank accounts are owned by organization members, not by users or organizations directly. A member may register multiple bank accounts but only one may be marked `is_default = true` at a time.

`is_verified` indicates that Nomba’s account name lookup API has confirmed the account is valid and the name matches. An unverified account should not be used for payout execution without explicit admin override.

Account numbers are stored as plain text strings to preserve leading zeros (common in Nigerian account numbers).

---

### webhook_events

Stores all inbound webhook events from Nomba before and during processing.

Key fields:

```txt
id
provider
event_type
provider_event_id
raw_payload
signature_header
status
processing_attempts
error_message
received_at
processed_at
created_at
updated_at
```

Possible statuses:

```txt
received
processing
processed
failed
ignored
```

Important constraints:

```txt
unique(provider, provider_event_id)
```

Notes:

This table is the durability layer for webhook processing.

The processing order is strictly:

1. Receive webhook request
2. Verify Nomba signature — reject with 401 if invalid
3. Write raw payload to this table with status `received` — return 200 OK to Nomba after this step
4. Process the event — update status to `processing`
5. On success — update status to `processed`; on failure — update status to `failed`

Writing to `webhook_events` before returning 200 means no webhook payload is lost even if the application crashes during processing. Failed events can be retried from this table.

`provider_event_id` is the idempotency key. The unique constraint on `(provider, provider_event_id)` prevents duplicate entries. If the same event arrives twice, the second insert fails at the DB level and is handled as a silent no-op with a 200 response.

`status = ‘ignored’` is used when a webhook event type is valid but not currently handled by UnityFund (e.g., an informational event that requires no action).

`processing_attempts` increments on each processing attempt to support observability and retry logic.

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
fund_members.rotation_position            (partial: WHERE fund_type = 'rotational_savings')
collection_cycles.fund_id
collection_cycles.status
contributions.collection_cycle_id
contributions.fund_member_id
contributions.status
contributions.due_date
payments.organization_id
payments.provider_reference
payments.provider_event_id
payments.status
payouts.fund_id
payouts.status
audit_logs.organization_id
audit_logs.actor_user_id
audit_logs.entity_type
invitations.organization_id
invitations.email                         (partial: WHERE status = 'pending')
invitations.token_hash
password_reset_tokens.user_id
password_reset_tokens.token_hash
bank_accounts.organization_member_id
webhook_events.provider_event_id
webhook_events.status
```

Partial unique indexes (enforced at the database level):

```txt
unique(fund_id) WHERE status = 'active'                               ON collection_cycles
unique(fund_id, rotation_position) WHERE rotation_position IS NOT NULL ON fund_members
unique(organization_id, email) WHERE status = 'pending'               ON invitations
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
9. Payments must be idempotent — enforced by unique constraints on `(provider, provider_reference)` and `provider_event_id`.
10. Financial records should not be hard-deleted.
11. A fund of type `rotational_savings` must have `rotation_position` set on all fund members before a collection cycle can start.
12. Only one collection cycle per fund may be in `active` status at any time — enforced by a partial unique index.
13. A collection cycle must snapshot fund rules at the moment it transitions to `active`. Snapshot fields must never be updated after that point.
14. Every inbound Nomba webhook must be written to `webhook_events` before any business records are updated.
15. A payout status transition from `approved` to `processing` must use an atomic conditional UPDATE. If zero rows are affected, no transfer should be initiated.
16. An invitation token is stored only as a hash. The raw token exists only in the invitation email.
17. A password reset token is stored only as a hash. Tokens must be single-use and time-limited.
18. A bank account used for payout execution should be verified before the transfer is initiated.

---

## Summary

This schema supports UnityFund’s financial operating model.

It preserves the core chain:

```txt
Organization
→ Fund (with Fund Rules)
→ Collection Cycle (with snapshotted rules)
→ Contribution
→ Payment (via webhook_events durability layer)
```

It also supports payout workflows (with concurrency-safe transitions), mandate management, bank account registration, member invitations, password reset, and full auditability.
