export interface GetCurrentLicenseResult {
  licenseInstanceId: string;
  status: string;
  version: number;
  expiresAt: Date;
  gracePeriodUntil: Date;
  entitlements: Record<string, boolean | number | string>;
  signature: string;
}
