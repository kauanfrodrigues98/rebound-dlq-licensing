import { z } from 'zod';

const entitlementValueSchema = z.union([z.boolean(), z.number(), z.string()]);

export const reissueLicenseRequestSchema = z.object({
  expiresAt: z.string().datetime({ offset: true }),
  planId: z.string().min(1).max(80).optional(),
  entitlements: z
    .record(z.string().min(1).max(80), entitlementValueSchema)
    .optional(),
}).refine((body) => body.planId || body.entitlements, {
  message: 'planId or entitlements is required.',
  path: ['planId'],
});

export type ReissueLicenseRequestDto = z.infer<
  typeof reissueLicenseRequestSchema
>;
