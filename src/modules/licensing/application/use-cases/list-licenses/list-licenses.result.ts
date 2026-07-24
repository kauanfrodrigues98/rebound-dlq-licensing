export interface ListLicenseItemResult {
  licenseInstanceId: string;
  customerId: string;
  contractId: string;
  installationName: string;
  installationFingerprint: string;
  status: string;
  version: number;
  issuedAt: Date;
  expiresAt: Date;
  gracePeriodUntil: Date;
  lastCheckInAt?: Date;
}

export interface ListLicensesResult {
  licenses: ListLicenseItemResult[];
}
