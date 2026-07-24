export interface CheckInLicenseResult {
  licenseInstanceId: string;
  status: string;
  version: number;
  hasUpdate: boolean;
  expiresAt: Date;
  gracePeriodUntil: Date;
  entitlements: Record<string, boolean | number | string>;
  signature: string;
}
