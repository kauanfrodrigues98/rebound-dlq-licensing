import { z } from 'zod';

export const checkInLicenseRequestSchema = z.object({
  licenseToken: z.string().min(32).max(128),
  installationFingerprint: z.string().min(16).max(255),
  currentLicenseVersion: z.number().int().nonnegative().optional(),
  appVersion: z.string().min(1).max(64),
  usage: z.object({
    projects: z.number().int().nonnegative(),
    users: z.number().int().nonnegative(),
    monthlyEvents: z.number().int().nonnegative(),
  }),
});

export type CheckInLicenseRequestDto = z.infer<
  typeof checkInLicenseRequestSchema
>;
