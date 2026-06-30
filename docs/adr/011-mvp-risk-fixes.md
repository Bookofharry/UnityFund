# ADR-011: MVP Pre-Build Risk Fixes

Status: Accepted
Version: 1.0.0
Project: UnityFund
Team: Zero Downtime
Last Updated: 2026-06-28

---

## Decision

Before writing any application code, UnityFund will address a set of structural gaps identified during architecture review.

These changes are confined to documentation (schema, API definitions) and do not alter any previously accepted ADR decisions. They fill gaps that would have caused rewrites or financial integrity failures if discovered mid-build.

---

## Context

A Principal Engineering review of the full architecture identified risks across the database schema, API coverage, financial workflows, and payment integration. Not all of these require pre-build fixes. This ADR covers only the ones that are genuine blockers — structural decisions that affect how code must be written from day one.

Items that are important but do not block the MVP (ledger, RLS, audit archival, advanced reporting, multi-provider abstraction) are deferred intentionally and are excluded from this ADR.

---

## Changes Made

---

### Fix 1: Rotation Position for Rotational Savings

**Problem:**

The `fund_members` table had no field to determine the payout order for Rotational Savings funds. Using `joined_at` as a proxy was fragile and did not support explicitly configured rotation orders.

**Decision:**

Add `rotation_position INTEGER` to `fund_members`.

Constraints:

* Nullable — only required for `rotational_savings` funds.
* Unique within a fund: enforced by a partial unique index on `(fund_id, rotation_position) WHERE rotation_position IS NOT NULL`.
* Must be set at enrollment time by the Organization Admin.
* Cannot be changed while a collection cycle is active.

The BRE identifies the payout recipient for a Rotational Savings cycle by:

1. Finding the highest completed `rotation_position` in the payout history for this fund.
2. The next payout recipient is the fund member with the next `rotation_position` in sequence.
3. After the last position is reached, the rotation restarts from position 1.

**Trade-off:**

Explicit position is less flexible than automatic ordering but is more predictable, auditable, and easier to reason about in financial records.

---

### Fix 2: Payout Trigger Rule

**Problem:**

The Business Rules Engine had no definition of what condition must be true before a Rotational Savings payout becomes eligible after a cycle closes. "Payout conditions are met" was an undefined phrase.

**Decision:**

Add two new fields to `fund_rules`:

```
payout_trigger              — ENUM: all_paid | cycle_closed | threshold_percentage
payout_threshold_percentage — INTEGER (1-100), required only when trigger = threshold_percentage
```

Behavior per trigger value:

* `all_paid` — every fund member in the cycle must have a `paid` contribution before payout eligibility is assessed. The BRE checks this when the cycle is manually closed.
* `cycle_closed` — payout is triggered immediately when an admin closes the cycle, regardless of collection percentage.
* `threshold_percentage` — payout is triggered when `SUM(paid_amount) / SUM(expected_amount)` meets or exceeds `payout_threshold_percentage`.

For MVP, `all_paid` is the recommended default for all new Rotational Savings funds.

**Trade-off:**

`all_paid` is the safest default but means a single non-paying member can block the payout indefinitely. `threshold_percentage` offers flexibility but introduces partial-collection payout scenarios that affect the recipient's payout amount. Admins must understand this trade-off when configuring their funds.

---

### Fix 3: Fund Rules Snapshot on Collection Cycle Start

**Problem:**

`fund_rules` is a 1:1 live record with `fund`. Any change to fund rules would immediately affect all in-progress collection cycles, violating the documented edge case: "current cycle continues using original rules."

**Decision:**

Add snapshot fields to `collection_cycles`, populated at the moment the cycle transitions from `draft` to `active`:

```
snapshot_contribution_amount
snapshot_contribution_frequency
snapshot_allow_partial_payment
snapshot_payout_trigger
snapshot_payout_threshold_percentage
snapshot_approval_required
snapshot_rules_json
```

The BRE and all cycle-level business logic must read from `collection_cycles.snapshot_*` fields, not from the live `fund_rules` record. The live `fund_rules` is only used for future cycles and for display purposes.

Snapshot fields are set once and never updated after the cycle goes active.

**Trade-off:**

This duplicates data between `fund_rules` and `collection_cycles`. The duplication is intentional — it is the same principle used in financial systems to preserve the state of a record at a point in time (similar to how an invoice preserves the price at sale date, not the current price). The alternative (rule versioning) is more complex and deferred to a future version.

---

### Fix 4: Invitations Table and API

**Problem:**

The Members API documented sending an invitation but provided no token mechanism, no invitation acceptance endpoint, and no schema table. Member onboarding (Workflow 2) could not be implemented.

**Decision:**

Add `invitations` table to the schema with the following fields:

```
id
organization_id
invited_by_user_id
email
role
token_hash        — SHA-256 hash of the raw token; raw token sent only in email
status            — pending | accepted | expired | cancelled
expires_at        — 48 hours from creation
accepted_at
created_at
updated_at
```

Constraints:

```
unique(token_hash)
unique(organization_id, email) WHERE status = 'pending'
```

Add a new `docs/api/invitations.md` covering the full lifecycle: send, validate token (public), accept (public), list, resend, cancel.

The raw token must never be stored in the database. Only its SHA-256 hash is stored. The raw token exists only in the invitation email link.

**Trade-off:**

SHA-256 token hashing is simpler to implement than bcrypt for tokens (no need for salt — tokens are already high-entropy random values). The hashed storage ensures that even a full database compromise cannot be used to accept pending invitations.

---

### Fix 5: Password Reset Tokens Table

**Problem:**

The Auth API described a password reset flow using email tokens but the schema had no table to store these tokens. The flow could not be implemented securely.

**Decision:**

Add `password_reset_tokens` table:

```
id
user_id
token_hash        — SHA-256 hash of raw token; raw token sent only in email
expires_at        — 1 hour from creation
used_at           — set immediately on successful use
created_at
```

Constraints:

```
unique(token_hash)
```

A token is valid only if `used_at IS NULL AND expires_at > NOW()`. Creating a new token for a user should invalidate all previous unused tokens for that user by setting their `used_at`.

**Trade-off:**

Same as invitation tokens — SHA-256 is appropriate for high-entropy random values. The single-use guarantee (setting `used_at` immediately on use) prevents a race condition where the same token is used twice during concurrent requests.

---

### Fix 6: Bank Accounts Table and API

**Problem:**

Nomba Transfers (payout execution) require a destination bank account. The `payouts` table had a `recipient_member_id` but nowhere to find the recipient's bank account. Payout execution could not be implemented.

**Decision:**

Add `bank_accounts` table:

```
id
organization_member_id
account_name          — populated by Nomba account name enquiry
account_number        — stored as text to preserve leading zeros
bank_code             — CBN bank code
bank_name
is_verified           — true after Nomba account name enquiry confirms validity
is_default            — true for the primary payout account
status                — active | inactive
created_at
updated_at
```

Constraints:

```
unique(organization_member_id, account_number, bank_code)
```

Add a new `docs/api/bank-accounts.md` covering: register, verify, list, view, set-default, remove.

Payout execution must check that the recipient has an `active`, `is_verified = true`, `is_default = true` bank account before initiating a Nomba Transfer.

**Trade-off:**

Storing and verifying bank accounts adds steps to the payout workflow. The alternative — requiring admins to enter bank details at payout execution time — was rejected because it introduces manual data entry errors into a financial transaction. Pre-registered, pre-verified accounts are more reliable.

---

### Fix 7: Payout Concurrency Protection

**Problem:**

Two simultaneous requests to `POST /api/payouts/:id/execute` could both pass the `status = approved` check and both initiate Nomba transfers for the same payout, resulting in double disbursement.

**Decision:**

The `approved → processing` status transition must use an atomic conditional UPDATE with a row-count check:

```sql
UPDATE payouts
SET status = 'processing', updated_at = NOW()
WHERE id = :payoutId AND status = 'approved'
```

The application must verify that exactly 1 row was affected. If 0 rows are affected, a concurrent request has already claimed the transition and no Nomba Transfer should be initiated. The endpoint should return an appropriate response indicating the payout is already being processed.

This pattern must be enforced in the Payout Service, not the controller.

Additionally, Nomba Transfer calls should include an idempotency key derived from the `payout.id` to ensure that even if the Nomba request is retried due to a timeout, Nomba will not execute the transfer twice.

**Trade-off:**

Conditional UPDATE is simpler than `SELECT FOR UPDATE` (which holds a row lock) and sufficient for this use case. The atomic check at the database level is the last line of defense — the application should also prevent multiple execution attempts through state checks in the service layer.

---

### Fix 8: Webhook Durability via `webhook_events` Table

**Problem:**

The original design returned 200 OK to Nomba and then processed the webhook in the same request. If the server crashed after returning 200 but before completing the database write, the payment confirmation was permanently lost — Nomba would not retry.

**Decision:**

Add `webhook_events` table:

```
id
provider
event_type
provider_event_id
raw_payload
signature_header
status              — received | processing | processed | failed | ignored
processing_attempts
error_message
received_at
processed_at
created_at
updated_at
```

Constraints:

```
unique(provider, provider_event_id)
```

The mandatory processing order:

1. Receive webhook HTTP request
2. Verify Nomba signature — reject 401 if invalid
3. Write raw payload to `webhook_events` with `status = received` — this is the durability guarantee
4. Return 200 OK to Nomba — **only after the DB write succeeds**
5. Process the event (inline for MVP, async via BullMQ in Phase 2)
6. Update `webhook_events.status` to `processed` or `failed`

If step 5 fails, the event is in `webhook_events` with `status = failed` and can be retried. If the server crashes between steps 3 and 4, the write to `webhook_events` is lost but Nomba will retry because we never responded with 200. Either way, no event is silently lost.

The `unique(provider, provider_event_id)` constraint also serves as the idempotency check. If the same event arrives twice, the second insert fails at the DB level — this is handled as a graceful no-op and 200 is returned.

**Trade-off:**

This adds a database write before returning 200. This increases webhook endpoint latency slightly (one extra DB round-trip). The alternative — processing webhooks fully before returning 200 — is slower and risks Nomba timeout/retry if processing is slow. The chosen approach is the standard pattern for reliable webhook processing in financial systems.

---

### Fix 9: Fund Members API

**Problem:**

The `fund_members` table existed in the schema but there was no documented API to enroll members in a fund, list fund members, or set `rotation_position` for Rotational Savings. Collection cycles cannot generate contributions without enrolled fund members.

**Decision:**

Add `docs/api/fund-members.md` covering: enroll, list, view, update (rotation position), remove.

---

### Fix 10: Mandates API

**Problem:**

Direct Debit was a documented payment method but there was no API for initiating mandate setup, handling Nomba's activation webhook, or managing mandate lifecycle. Direct Debit was effectively unusable.

**Decision:**

Add `docs/api/mandates.md` covering: initiate setup, list, view, suspend, cancel. Document the Nomba webhook events for mandate lifecycle transitions.

---

## Summary of Schema Changes

| Table | Change |
|---|---|
| `fund_members` | Added `rotation_position INTEGER` (nullable, partial unique index) |
| `fund_rules` | Added `payout_trigger` and `payout_threshold_percentage` |
| `collection_cycles` | Added 7 `snapshot_*` fields |
| `payouts` | Corrected status values to match ADR-007; added concurrency note |
| `invitations` | New table |
| `password_reset_tokens` | New table |
| `bank_accounts` | New table |
| `webhook_events` | New table |

## Summary of New API Documents

| File | Purpose |
|---|---|
| `api/fund-members.md` | Enroll and manage members within individual funds |
| `api/invitations.md` | Full invitation lifecycle for member onboarding |
| `api/mandates.md` | Direct Debit mandate management |
| `api/bank-accounts.md` | Bank account registration and verification for payouts |

---

## What This ADR Does Not Fix

The following concerns were identified in the review but are intentionally deferred:

* PostgreSQL Row-Level Security — deferred to post-MVP
* Full double-entry financial ledger — deferred per ADR-005
* Audit log archival and partitioning — deferred to Phase 2
* Savings Fund withdrawal system — deferred; Savings Fund implementation should be confirmed in scope before this is designed
* Platform Admin API — deferred to Phase 2
* Advanced report optimization (materialized views, caching) — deferred to Phase 2
* Multi-provider payment abstraction beyond Nomba — deferred per ADR-003
* PDF/Excel export strategy — deferred to Phase 2

---

## Consequences

### Positive

* Rotational Savings payout logic can be implemented correctly from day one.
* Collection cycle rule integrity is guaranteed by the snapshot approach.
* Member onboarding has a complete, implementable flow.
* Payout execution is protected against double-disbursement.
* Webhook processing is durable — no payment confirmation can be silently lost.
* Bank account verification reduces payout failure rate.
* Direct Debit is implementable end-to-end.

### Negative

* Schema is more complex than the original.
* Four new tables and four new API documents increase the upfront implementation surface.
* The snapshot approach duplicates data from `fund_rules` into `collection_cycles` — developers must remember to read from snapshot fields during cycle execution, not from live fund rules.

---

## Related Documents

* Database Schema (v2.0)
* ADR-001 — Fund is the Primary Business Entity
* ADR-003 — Payment Provider Architecture
* ADR-004 — Role-Based Access Control
* ADR-007 — State Transitions
* ADR-008 — Idempotency Strategy
* ADR-009 — Money Handling
* ADR-010 — Organization Isolation
