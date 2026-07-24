import { z } from 'zod';

export const licenseInstanceParamsSchema = z.object({
  licenseInstanceId: z.string().min(1).max(80),
});

export type LicenseInstanceParamsDto = z.infer<
  typeof licenseInstanceParamsSchema
>;
