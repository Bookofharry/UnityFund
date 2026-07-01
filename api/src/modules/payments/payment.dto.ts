import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const InitiatePaymentDto = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  mandateId: z.string().uuid().optional(),
}).refine((d) => {
  if (d.paymentMethod === 'direct_debit' && !d.mandateId) {
    return false;
  }
  return true;
}, { message: 'mandateId is required for direct_debit payments', path: ['mandateId'] });

export type InitiatePaymentDtoType = z.infer<typeof InitiatePaymentDto>;
