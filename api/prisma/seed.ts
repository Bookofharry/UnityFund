/**
 * UnityFund Development Seed
 *
 * Creates a realistic demo dataset:
 *   1 organization: "Lagos Teachers Cooperative"
 *   6 users: platform admin, admin, treasurer, member1, member2, member3
 *   3 funds: Annual Dues, Welfare Fund, Rotational Savings (3-member rotation)
 *   Fund rules configured for each fund
 *   Fund members enrolled (rotation positions set for rotational_savings)
 */

import { PrismaClient, FundType, OrgMemberRole, ContributionFrequency, PayoutTrigger } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Clean existing data (order respects FK constraints) ─────────────────
  await prisma.webhookEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.collectionCycle.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.mandate.deleteMany();
  await prisma.fundMember.deleteMany();
  await prisma.fundRule.deleteMany();
  await prisma.fund.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleaned existing data');

  // ─── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  const [platformAdmin, admin, treasurer, approver, member1, member2, member3] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Platform',
        lastName: 'Admin',
        email: 'platform@unityfund.dev',
        passwordHash,
        phone: '+2348001000000',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Harry',
        lastName: 'Admin',
        email: 'admin@unityfund.dev',
        passwordHash,
        phone: '+2348001000001',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Chioma',
        lastName: 'Treasurer',
        email: 'treasurer@unityfund.dev',
        passwordHash,
        phone: '+2348001000002',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Emeka',
        lastName: 'Approver',
        email: 'approver@unityfund.dev',
        passwordHash,
        phone: '+2348001000003',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Amaka',
        lastName: 'Obi',
        email: 'amaka@unityfund.dev',
        passwordHash,
        phone: '+2348001000004',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Tunde',
        lastName: 'Bello',
        email: 'tunde@unityfund.dev',
        passwordHash,
        phone: '+2348001000005',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Ngozi',
        lastName: 'Adeyemi',
        email: 'ngozi@unityfund.dev',
        passwordHash,
        phone: '+2348001000006',
      },
    }),
  ]);

  console.log('  ✓ Created 6 users');

  // ─── Organization ─────────────────────────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      name: 'Lagos Teachers Cooperative',
      organizationType: 'cooperative',
      email: 'info@lagostc.org',
      phone: '+2341234567890',
    },
  });

  console.log(`  ✓ Created organization: ${org.name}`);

  // ─── Organization Members ─────────────────────────────────────────────────
  const [, , , , member1Org, member2Org, member3Org] =
    await Promise.all([
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: platformAdmin.id, role: OrgMemberRole.platform_admin },
      }),
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: admin.id, role: OrgMemberRole.organization_admin },
      }),
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: treasurer.id, role: OrgMemberRole.treasurer },
      }),
      prisma.orgMember.create({
        // Approver role has been removed — Org Admin handles payout approval now.
        data: { organizationId: org.id, userId: approver.id, role: OrgMemberRole.member },
      }),
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: member1.id, role: OrgMemberRole.member },
      }),
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: member2.id, role: OrgMemberRole.member },
      }),
      prisma.orgMember.create({
        data: { organizationId: org.id, userId: member3.id, role: OrgMemberRole.member },
      }),
    ]);

  console.log('  ✓ Created org memberships');

  // ─── Fund 1: Annual Dues ──────────────────────────────────────────────────
  const annualDuesFund = await prisma.fund.create({
    data: {
      organizationId: org.id,
      name: 'Annual Dues 2026',
      fundType: FundType.annual_dues,
      description: 'Annual membership dues for all cooperative members',
      status: 'active',
    },
  });

  await prisma.fundRule.create({
    data: {
      fundId: annualDuesFund.id,
      contributionAmount: 1200000, // ₦12,000 in Kobo
      contributionFrequency: ContributionFrequency.annually,
      allowPartialPayment: false,
      payoutAllowed: false,
      approvalRequired: false,
      penaltyEnabled: false,
    },
  });

  // Enroll all 3 members in Annual Dues
  await Promise.all([
    prisma.fundMember.create({ data: { fundId: annualDuesFund.id, orgMemberId: member1Org.id } }),
    prisma.fundMember.create({ data: { fundId: annualDuesFund.id, orgMemberId: member2Org.id } }),
    prisma.fundMember.create({ data: { fundId: annualDuesFund.id, orgMemberId: member3Org.id } }),
  ]);

  console.log(`  ✓ Created fund: ${annualDuesFund.name}`);

  // ─── Fund 2: Welfare Fund ─────────────────────────────────────────────────
  const welfareFund = await prisma.fund.create({
    data: {
      organizationId: org.id,
      name: 'Member Welfare Fund',
      fundType: FundType.welfare_fund,
      description: 'Support fund for members in need',
      status: 'active',
    },
  });

  await prisma.fundRule.create({
    data: {
      fundId: welfareFund.id,
      contributionAmount: 500000, // ₦5,000 in Kobo
      contributionFrequency: ContributionFrequency.monthly,
      collectionDay: 28,
      allowPartialPayment: false,
      payoutAllowed: true,
      payoutTrigger: PayoutTrigger.cycle_closed,
      approvalRequired: true,
      penaltyEnabled: false,
    },
  });

  await Promise.all([
    prisma.fundMember.create({ data: { fundId: welfareFund.id, orgMemberId: member1Org.id } }),
    prisma.fundMember.create({ data: { fundId: welfareFund.id, orgMemberId: member2Org.id } }),
    prisma.fundMember.create({ data: { fundId: welfareFund.id, orgMemberId: member3Org.id } }),
  ]);

  console.log(`  ✓ Created fund: ${welfareFund.name}`);

  // ─── Fund 3: Rotational Savings ───────────────────────────────────────────
  const rotationalFund = await prisma.fund.create({
    data: {
      organizationId: org.id,
      name: 'Monthly Contribution Pool',
      fundType: FundType.rotational_savings,
      description: 'Monthly rotating savings — each member receives in turn',
      status: 'active',
    },
  });

  await prisma.fundRule.create({
    data: {
      fundId: rotationalFund.id,
      contributionAmount: 2000000, // ₦20,000 in Kobo
      contributionFrequency: ContributionFrequency.monthly,
      collectionDay: 25,
      allowPartialPayment: false,
      payoutAllowed: true,
      payoutTrigger: PayoutTrigger.all_paid, // All members must pay before payout
      approvalRequired: false,
      penaltyEnabled: false,
    },
  });

  // ADR-011 Fix 1: rotation_position set explicitly at enrollment
  await Promise.all([
    prisma.fundMember.create({
      data: { fundId: rotationalFund.id, orgMemberId: member1Org.id, rotationPosition: 1 },
    }),
    prisma.fundMember.create({
      data: { fundId: rotationalFund.id, orgMemberId: member2Org.id, rotationPosition: 2 },
    }),
    prisma.fundMember.create({
      data: { fundId: rotationalFund.id, orgMemberId: member3Org.id, rotationPosition: 3 },
    }),
  ]);

  console.log(`  ✓ Created fund: ${rotationalFund.name}`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('─── Login credentials (all users) ───────────');
  console.log(`  Password: ${DEFAULT_PASSWORD}`);
  console.log('─── Users ────────────────────────────────────');
  console.log(`  Platform Admin: platform@unityfund.dev`);
  console.log(`  Admin:          admin@unityfund.dev`);
  console.log(`  Treasurer:      treasurer@unityfund.dev`);
  console.log(`  Member 1:       approver@unityfund.dev`);
  console.log(`  Member 2:       amaka@unityfund.dev`);
  console.log(`  Member 3:       tunde@unityfund.dev`);
  console.log(`  Member 4:       ngozi@unityfund.dev`);
  console.log('─── Funds ────────────────────────────────────');
  console.log(`  Annual Dues 2026        (₦12,000/year, no payout)`);
  console.log(`  Member Welfare Fund     (₦5,000/month, approval required)`);
  console.log(`  Monthly Contribution Pool (₦20,000/month, rotational)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
