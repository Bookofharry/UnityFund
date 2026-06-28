# ADR-005: Financial Ledger

Status: Proposed  
Version: 0.1.0  
Project: UnityFund  
Team: Zero Downtime  
Last Updated: 2026-06-27

---

## Decision

UnityFund will not implement a full financial ledger in the MVP.

For the MVP, fund balances and reports will be calculated from verified Payments, Contributions, and Payouts.

A dedicated Financial Ledger will be introduced in a future version.

---

## Reason

A ledger is important for long-term financial accuracy, auditability, reversals, adjustments, and reliable fund balance tracking.

However, implementing a proper ledger in the MVP would add significant complexity and delay the hackathon build.

---

## MVP Approach

The MVP will use:

- Contributions to track expected member payments
- Payments to track money received
- Payouts to track money disbursed
- Audit Logs to track important financial actions
- Reports to calculate balances from verified records

---

## Future Approach

A future version will introduce immutable ledger entries for:

- Payment credits
- Payout debits
- Reversals
- Adjustments
- Corrections
- Opening balances

---

## Consequences

### Positive

- MVP stays focused.
- Development remains faster.
- Long-term accounting needs are acknowledged.
- Future financial integrity is planned.

### Negative

- MVP reports are calculated from payment and payout records.
- MVP will not have full accounting-grade ledger behavior.
- Reversals and adjustments will be limited.

---

## Summary

UnityFund recognizes the need for a Financial Ledger but intentionally defers it beyond the MVP to protect delivery speed while preserving a clear future architecture path.