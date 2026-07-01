-- One fund member can only have one contribution per collection cycle.
-- Prevents duplicate rows if cycle start is retried.
CREATE UNIQUE INDEX "contributions_collectionCycleId_fundMemberId_key"
ON "contributions"("collectionCycleId", "fundMemberId");
