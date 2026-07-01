import { z } from 'zod';
import { FundType, ContributionFrequency, PayoutTrigger } from '@prisma/client';

export const CreateFundDto = z.object({
  name: z.string().min(1).max(200).trim(),
  fundType: z.nativeEnum(FundType),
  description: z.string().max(1000).trim().optional(),
});

export const UpdateFundDto = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
});

const FundRulesBase = z.object({
  contributionAmount: z.number().int().positive('Contribution amount must be a positive integer (Kobo)'),
  contributionFrequency: z.nativeEnum(ContributionFrequency),
  collectionDay: z.number().int().min(1).max(31).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  allowPartialPayment: z.boolean(),
  payoutAllowed: z.boolean(),
  payoutTrigger: z.nativeEnum(PayoutTrigger).optional(),
  payoutThresholdPct: z.number().int().min(1).max(100).optional(),
  approvalRequired: z.boolean(),
  penaltyEnabled: z.boolean(),
});

export const CreateFundRulesDto = FundRulesBase.superRefine((data, ctx) => {
  if (data.payoutAllowed && !data.payoutTrigger) {
    ctx.addIssue({ code: 'custom', path: ['payoutTrigger'], message: 'payoutTrigger is required when payoutAllowed is true' });
  }
  if (data.payoutTrigger === 'threshold_percentage' && !data.payoutThresholdPct) {
    ctx.addIssue({ code: 'custom', path: ['payoutThresholdPct'], message: 'payoutThresholdPct (1-100) required when payoutTrigger is threshold_percentage' });
  }
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'endDate must be after startDate' });
  }
});

export const UpdateFundRulesDto = FundRulesBase.partial().superRefine((data, ctx) => {
  if (data.payoutTrigger === 'threshold_percentage' && data.payoutThresholdPct === undefined) {
    ctx.addIssue({ code: 'custom', path: ['payoutThresholdPct'], message: 'payoutThresholdPct (1-100) required when payoutTrigger is threshold_percentage' });
  }
});

export type CreateFundDtoType = z.infer<typeof CreateFundDto>;
export type UpdateFundDtoType = z.infer<typeof UpdateFundDto>;
export type CreateFundRulesDtoType = z.infer<typeof CreateFundRulesDto>;
export type UpdateFundRulesDtoType = z.infer<typeof UpdateFundRulesDto>;
