import { z } from 'zod';
import { ContributionFrequency } from '@prisma/client';

export const InitiateMandateDto = z.object({
  maxAmount: z.number().int().positive('maxAmount must be a positive integer in Kobo'),
  frequency: z.nativeEnum(ContributionFrequency),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type InitiateMandateDtoType = z.infer<typeof InitiateMandateDto>;
