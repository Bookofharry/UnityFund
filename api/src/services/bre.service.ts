/**
 * Business Rules Engine (BRE)
 *
 * Evaluates fund type + snapshot rules after business events and
 * dispatches workflows. Never calls Nomba directly.
 *
 * MVP: BRE runs synchronously. Phase 2 moves to BullMQ.
 * Payout creation (M8) is stubbed here and wired up when PayoutService is implemented.
 */

import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { payoutService } from '../modules/payouts/payout.service';

class BusinessRulesEngine {
  async onCycleClosed(cycleId: string): Promise<void> {
    const cycle = await prisma.collectionCycle.findUnique({
      where: { id: cycleId },
      select: {
        id: true,
        fundId: true,
        snapshotPayoutTrigger: true,
        snapshotPayoutThresholdPct: true,
        snapshotApprovalRequired: true,
        fund: {
          select: {
            organizationId: true,
            rules: { select: { payoutAllowed: true } },
          },
        },
      },
    });

    if (!cycle) return;
    if (!cycle.fund.rules?.payoutAllowed || !cycle.snapshotPayoutTrigger) return;

    const trigger = cycle.snapshotPayoutTrigger;

    if (trigger === 'cycle_closed') {
      logger.info({ cycleId, trigger }, 'BRE: cycle_closed trigger — initiating payout creation');
      await this.triggerPayout(cycleId, cycle.fundId, cycle.fund.organizationId);
      return;
    }

    if (trigger === 'threshold_percentage') {
      const pct = cycle.snapshotPayoutThresholdPct ?? 100;
      const [total, paid] = await Promise.all([
        prisma.contribution.count({ where: { collectionCycleId: cycleId } }),
        prisma.contribution.count({ where: { collectionCycleId: cycleId, status: 'paid' } }),
      ]);
      const actualPct = total > 0 ? Math.floor((paid / total) * 100) : 0;

      if (actualPct >= pct) {
        logger.info({ cycleId, actualPct, threshold: pct }, 'BRE: threshold met — initiating payout');
        await this.triggerPayout(cycleId, cycle.fundId, cycle.fund.organizationId);
      } else {
        logger.info({ cycleId, actualPct, threshold: pct }, 'BRE: threshold not met — no payout');
      }
    }
    // all_paid trigger is evaluated in onPaymentConfirmed, not onCycleClosed
  }

  async onPaymentConfirmed(contributionId: string): Promise<void> {
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      select: {
        collectionCycleId: true,
        collectionCycle: {
          select: {
            fundId: true,
            snapshotPayoutTrigger: true,
            fund: {
              select: {
                organizationId: true,
                rules: { select: { payoutAllowed: true } },
              },
            },
          },
        },
      },
    });

    if (!contribution) return;
    const cycle = contribution.collectionCycle;
    if (!cycle.fund.rules?.payoutAllowed) return;
    if (cycle.snapshotPayoutTrigger !== 'all_paid') return;

    const [total, paid] = await Promise.all([
      prisma.contribution.count({ where: { collectionCycleId: contribution.collectionCycleId } }),
      prisma.contribution.count({ where: { collectionCycleId: contribution.collectionCycleId, status: 'paid' } }),
    ]);

    if (paid === total && total > 0) {
      logger.info({ cycleId: contribution.collectionCycleId }, 'BRE: all_paid trigger met — initiating payout');
      await this.triggerPayout(contribution.collectionCycleId, cycle.fundId, cycle.fund.organizationId);
    }
  }

  private async triggerPayout(cycleId: string, fundId: string, organizationId: string): Promise<void> {
    logger.info({ cycleId, fundId, organizationId }, 'BRE: triggering payout from cycle');
    await payoutService.createFromCycle(cycleId);
  }
}

export const bre = new BusinessRulesEngine();
