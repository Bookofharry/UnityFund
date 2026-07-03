-- Business-logic fix M2: a payout_refund webhook arriving after a payout is
-- already 'successful' previously matched no status and was silently
-- dropped. Add a terminal 'reversed' state so reversals can be recorded.
-- Kept as its own migration: Postgres does not allow a new enum value to be
-- used in the same transaction that adds it, so this must land (and be
-- deployed) before any code references PayoutStatus.reversed.
ALTER TYPE "PayoutStatus" ADD VALUE 'reversed';
