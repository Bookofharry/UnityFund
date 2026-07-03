-- Business-logic fix C3: link a Payout back to the collection cycle that
-- created it, so a second concurrent BRE trigger for the same cycle can be
-- rejected instead of creating a duplicate payout. Nullable because
-- manually-created payouts (PayoutService.create) have no originating cycle.
ALTER TABLE "payouts" ADD COLUMN "collectionCycleId" TEXT;

ALTER TABLE "payouts" ADD CONSTRAINT "payouts_collectionCycleId_fkey"
  FOREIGN KEY ("collectionCycleId") REFERENCES "collection_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial unique index (not supported natively by Prisma — added manually,
-- same pattern as idx_active_cycle_per_fund in the init migration):
-- at most one payout per collection cycle.
CREATE UNIQUE INDEX "idx_payout_per_cycle"
  ON "payouts" ("collectionCycleId") WHERE "collectionCycleId" IS NOT NULL;

-- Business-logic fix H5: payoutAllowed had no snapshot column, so BRE was
-- forced to read the live fund rule instead of the cycle's snapshot,
-- violating ADR-011 Fix 3 (in-progress cycles must never be affected by
-- live rule changes).
ALTER TABLE "collection_cycles" ADD COLUMN "snapshotPayoutAllowed" BOOLEAN;
