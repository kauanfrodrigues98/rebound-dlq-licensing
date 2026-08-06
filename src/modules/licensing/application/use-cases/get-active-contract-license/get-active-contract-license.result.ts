export interface GetActiveContractLicenseResult {
  licenseInstanceId: string;
  licenseKey: string;
  licenseToken: string;
  installationFingerprint: string;
  status: string;
  version: number;
  expiresAt: Date;
  gracePeriodUntil: Date;
  entitlements: Record<string, boolean | number | string>;
  signature: string;
}
