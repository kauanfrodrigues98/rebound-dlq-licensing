export interface ActivateLicenseCommand {
  customerId: string;
  contractId: string;
  installationName: string;
  expiresAt: Date;
  entitlements: Record<string, boolean | number | string>;
}
