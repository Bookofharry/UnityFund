# UnityFund Project Audit Report
## Scope: Frontend, Backend, and Audit Trail Mechanisms

Prepared by: **Zero Downtime Contributor (Audit Review)**  
Date: **July 2, 2026**  
Status: **Review Copy for Team Discussion**

---

## Executive Summary
This audit report reviews the **UnityFund** financial operating platform (built for the DevCareer × Nomba Hackathon 2026). The focus of this audit is to identify security vulnerabilities, transactional integrity risks (specifically regarding the Nomba payment/payout integrations), and gaps in the **Audit Logging/Trail** system.

While the project has a strong foundation—including organization-level database isolation, JWT-based auth, structured API rate limits, and webhook event durability—several critical gaps must be addressed before this system can be safely deployed in production or submitted for final evaluation.

---

## 1. Audit Logging System Audit

The marketing copy and auth layout advertise a **"Full Audit Trail"** as a key platform feature. However, our technical audit reveals that the current implementation has several severe functional and coverage gaps.

### [MUST FIX] Missing Audit Log API Endpoints
* **Issue:** Although the backend records administrative and financial actions to the `AuditLog` table using the `auditLog()` service, **there are no routes, controllers, or service queries in the backend to retrieve these logs.**
* **Impact:** The logged data is a "write-only" black hole. Organization administrators and platform auditors cannot view, query, filter, or export the audit trail.
* **Remedy:** Create a new module `api/src/modules/audit-logs` that exposes:
  `GET /api/organizations/:orgId/audit-logs` (gated to `organization_admin` and `platform_admin` roles).
  Implement pagination, searching (by actor or description), and filtering (by entity type like `payout`, `fund`, `member`, or action).

### [MUST FIX] Missing Frontend UI for Audit Trails
* **Issue:** The frontend lacks any page, panel, or dashboard section displaying audit logs. The word "audit" appears only as static text on the marketing/auth pages.
* **Impact:** High-value organization administrators have no visibility into administrative adjustments, user role modifications, or payment details.
* **Remedy:** Implement an **Audit Log Dashboard Page** (accessible to Admins and Treasurers). Add a link in the `AppShell` sidebar under `ADMIN_ONLY_NAV`. The page should display a paginated tabular feed of audit events with timestamp, actor name, action type, description, and an expandable JSON viewer for metadata.

### [SHOULD FIX] Audit Logging Coverage Gaps
* **Issue:** Several critical, sensitive security and administrative actions bypass the `auditLog()` function:
  1. **Password Resets:** `AuthService.confirmPasswordReset` updates user passwords in the DB but does *not* log the event.
  2. **Security Settings & Contact Info Updates:** Changes to organization profile details (`OrganizationService.update`) do write an audit log, but user profile updates do not.
  3. **Failed Authentications & Reset Requests:** Failed login attempts or password reset requests are not auditable, making brute-force detection difficult.
  4. **Webhook Security Anomalies:** Failed webhook signature verifications are logged to stdout but not recorded in the DB as potential security alerts.
* **Remedy:** Inject `auditLog()` calls into:
  * `authService.confirmPasswordReset` (log as system/auth action).
  * Webhook validation catches where signatures fail (log under organization if resolvable, or globally for platform administrators).

---

## 2. Security & Authorization Audit

### [MUST FIX] Session Validity for Inactive/Suspended Users
* **Issue:** The standard `authenticate` middleware decodes incoming JWTs and attaches `req.user` without querying the database or verifying the user's current status (`User.status`). 
  The `requireOrgMember` middleware checks if `membership.status === 'active'`, but it **does not verify whether the global user account itself has been suspended or deleted** in the `users` table.
* **Impact:** If an administrator deactivates a user globally (e.g., due to compromised credentials or departure), that user's existing JWT remains fully valid and can be used to read/write organization data on all endpoints until the token expires (up to 15 minutes).
* **Remedy:** Update the `requireOrgMember` middleware to fetch the user's status from the database, or add a lightweight user status verification check inside `authenticate` middleware.
  ```typescript
  // In api/src/middleware/authenticate.ts or requireOrgMember.ts
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user || user.status !== 'active') {
    return next(new AppError(401, 'User account is inactive or deleted'));
  }
  ```

### [SHOULD FIX] API Rate Limiting Bypass via IP Spoofing
* **Issue:** The `express-rate-limit` middleware is configured, but the Express application lacks the `trust proxy` setting.
* **Impact:** If the backend runs behind a reverse proxy (e.g., Nginx, Cloudflare, or Docker Gateway), the rate limiter will see the proxy's IP address instead of the client's actual IP. This will rate-limit all users globally when traffic increases, or allow attackers to bypass rate limits by spoofing `X-Forwarded-For` headers.
* **Remedy:** Ensure `app.set('trust proxy', 1)` is enabled in `api/src/app.ts` if deployed behind a single proxy.

---

## 3. Transactional & Financial Integrity Audit

Financial systems require absolute consistency, re-entrancy protection, and strict race condition mitigations. We identified several high-risk patterns.

### [MUST FIX] Payout Timeout Reversion and Webhook Blackhole
* **Issue:** In `PayoutService.execute()`, the payout transition from `approved` to `processing` is secured using an atomic conditional update. However, if the Nomba API request times out or returns an error, the `catch` block immediately reverts the status back to `approved` so the administrator can retry:
  ```typescript
  try {
    const transfer = await nombaClient.initiateTransfer({ ... });
    // ...
  } catch (err) {
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'approved' },
    }).catch(() => {});
    throw err;
  }
  ```
  **Why this is dangerous:**
  1. A network timeout or `502/504 Bad Gateway` from Nomba does *not* mean the transfer failed; the request may have successfully reached Nomba and could be actively processing.
  2. Because the database status is immediately reverted to `approved`, the administrator can click "Execute" again, initiating a **second** transfer.
  3. When Nomba eventually finishes the first transfer and fires the `transfer_success` webhook, `webhookService.handleTransferResult` runs this query:
     ```typescript
     await prisma.payout.updateMany({
       where: {
         status: 'processing', // <-- WILL NOT MATCH
         OR: [ ... ]
       },
       data: { status: 'successful' }
     });
     ```
     Since the payout was reverted to `approved`, **the webhook will fail to update the status to `successful`.** The payout remains as `approved` in the database, masking the completed transfer and inviting double payout.
* **Remedy:** 
  * Do not revert status to `approved` automatically on network timeouts or undefined HTTP failures. Keep it in `processing` or move it to a `pending_review` status.
  * Require the backend to check the status of the transfer using Nomba's transaction lookup API (`verifyTransaction` / GET `/v1/transactions/accounts/single`) before allowing a retry.

### [MUST FIX] Double-Payout Risk in Business Rules Engine (BRE)
* **Issue:** In `bre.service.ts`, `onPaymentConfirmed` is triggered when a contribution is paid. If a fund's trigger is `all_paid`, it checks if all contributions are paid. If yes, it triggers a payout by calling `payoutService.createFromCycle()`.
  However, `payoutService.createFromCycle` **does not check if a payout has already been generated or is pending/successful for that cycle.**
* **Impact:** 
  1. If two payment confirmation webhooks are processed concurrently (e.g., due to duplicate webhook events or rapid consecutive card charges), both threads can evaluate `paid === total` simultaneously.
  2. This will trigger `createFromCycle()` twice, generating duplicate `Payout` records for the same cycle, leading to double-disbursements of the entire cycle pool.
* **Remedy:** 
  * Add a `payoutId` or `payoutStatus` field directly to `collection_cycles` to track if a payout has been dispatched.
  * Use a database transaction and check for the presence of an existing payout for the cycle before creating a new one:
    ```typescript
    const existingPayout = await prisma.payout.findFirst({
      where: {
        fundId: cycle.fund.id,
        reason: { startsWith: `Auto-generated payout from cycle: ${cycle.name}` } // Or link via a schema relation
      }
    });
    if (existingPayout) return; // Skip duplicate creation
    ```

### [MUST FIX] Read-Modify-Write Race in Payment Confirmation
* **Issue:** In `PaymentService.confirmPayment()`, the idempotency check `if (payment.status === 'successful') return;` is executed outside the Prisma transaction. Inside the transaction, the new contribution balance is calculated in application memory and written back:
  ```typescript
  const newPaid = contribution.paidAmount + amountPaid;
  await tx.contribution.update({
    where: { id: payment.contributionId },
    data: { paidAmount: newPaid, status: newStatus, ... }
  });
  ```
* **Impact:** Under concurrent webhook processing (e.g., if Nomba sends redundant callbacks for the same transaction in parallel), both requests can bypass the initial `successful` check. They will read the same stale `contribution.paidAmount` value from the database, compute the same `newPaid`, and overwrite each other, or if they are confirming different partial payments for the same contribution concurrently, one payment will overwrite the other's credit.
* **Remedy:** 
  1. Perform the payment status check *inside* the transaction block.
  2. Use Prisma's atomic increment feature rather than reading and recalculating in memory:
     ```typescript
     await tx.contribution.update({
       where: { id: payment.contributionId },
       data: {
         paidAmount: { increment: amountPaid },
         // Update status based on a database-level check or strict state transitions
       }
     });
     ```

---

## 4. Architecture & Technical Debt Audit

### [SHOULD FIX] Synchronous BRE Processing Blocking Webhooks
* **Issue:** Currently, the BRE (`bre.service.ts`) runs synchronously within the HTTP thread of the payment confirmation webhook.
* **Impact:** If the BRE executes slow database queries (e.g., calculating percentages, checking rotation schedules, or inserting payout records), it increases the response time of the webhook handler. If Nomba's webhook delivery client times out (usually 5–10 seconds), it will retry sending the webhook, causing duplicate processing.
* **Remedy:** Although `package.json` contains `bullmq` and `ioredis` dependencies, background jobs are not yet wired up. The BRE should dispatch events to a Redis-backed queue (`BullMQ`) to process the business logic asynchronously outside the request-response cycle.

### [CONSIDER] Schema Redundancy vs. Performance Scopes
* **Issue:** Key entities like `collection_cycles`, `contributions`, `payouts`, `bank_accounts`, and `mandates` do not contain a direct `organizationId` column. They rely on multi-join relations (e.g., `contribution -> collectionCycle -> fund -> organization`).
* **Impact:** While this normalizes the database, it makes writing tenant-isolation queries more complex and makes it harder to use database Row-Level Security (RLS) in the future.
* **Consider:** In a future version, consider denormalizing `organizationId` onto all tables (as noted in ADR-010: *"/organization_id present on all tenant-scoped tables/"* but not fully adhered to in the database schema).

---

## Summary of Action Items

| Category | Finding | Priority | Recommended Action |
|---|---|---|---|
| **Audit Logs** | Missing retrieval API endpoints | **MUST FIX** | Create `GET /api/organizations/:orgId/audit-logs` endpoint with pagination and search filters. |
| **Audit Logs** | Missing UI dashboard view | **MUST FIX** | Add "Audit Logs" tab/page under Admin Settings to display the table of events. |
| **Security** | Session validity for inactive users | **MUST FIX** | Validate `User.status` in `authenticate` or `requireOrgMember` middleware. |
| **Integrity** | Payout execution timeout revert | **MUST FIX** | Change payout status to `pending_review` or query Nomba transfer status instead of immediately reverting to `approved`. |
| **Integrity** | Double payout risk in BRE | **MUST FIX** | Add transaction locks/checks to prevent duplicate payout generation for a single cycle. |
| **Integrity** | Payment credit race condition | **MUST FIX** | Use Prisma's atomic `{ increment: amountPaid }` for contribution payments and move checks inside the transaction. |
| **Tech Debt** | Synchronous BRE queueing | **SHOULD FIX** | Wire up `BullMQ` and `ioredis` to process BRE workflows in background jobs. |
