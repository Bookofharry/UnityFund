-- Remove the 'approver' role. Its sole permission (approving payouts) now
-- belongs to Org Admin / Platform Admin only — see payout.router.ts.
-- Confirmed before writing this migration: exactly one live org_member row
-- had role='approver' (a seeded demo account) and zero pending invitations
-- referenced it, so this reassignment is a no-op for any real org data.
UPDATE "organization_members" SET "role" = 'member' WHERE "role" = 'approver';

-- Postgres cannot drop a value from an existing enum type in place, so the
-- type is recreated without it and swapped onto both columns that use it.
CREATE TYPE "OrgMemberRole_new" AS ENUM ('member', 'treasurer', 'organization_admin', 'platform_admin');

ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "organization_members" ALTER COLUMN "role" TYPE "OrgMemberRole_new" USING ("role"::text::"OrgMemberRole_new");
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'member';

ALTER TABLE "invitations" ALTER COLUMN "role" TYPE "OrgMemberRole_new" USING ("role"::text::"OrgMemberRole_new");

DROP TYPE "OrgMemberRole";
ALTER TYPE "OrgMemberRole_new" RENAME TO "OrgMemberRole";
