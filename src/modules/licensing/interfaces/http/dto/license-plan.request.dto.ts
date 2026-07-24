import { z } from 'zod';

const entitlementValueSchema = z.union([z.boolean(), z.number(), z.string()]);

export const licensePlanRequestSchema = z.object({
  id: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(500),
  cadence: z.enum(['monthly', 'annual', 'contract']),
  featured: z.boolean().default(false),
  priceLabel: z.string().min(1).max(80),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  entitlements: z.record(z.string().min(1).max(80), entitlementValueSchema),
});

export type LicensePlanRequestDto = z.infer<typeof licensePlanRequestSchema>;
