export interface ReissueLicenseCommand {
  licenseInstanceId: string;
  expiresAt: Date;
  entitlements: Record<string, boolean | number | string>;
}
