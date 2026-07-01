import { z } from 'zod';

export const CreateCollectionCycleDto = z.object({
  name: z.string().min(1).max(200).trim(),
  cycleNumber: z.number().int().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((d) => d.endDate > d.startDate, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

export type CreateCollectionCycleDtoType = z.infer<typeof CreateCollectionCycleDto>;
